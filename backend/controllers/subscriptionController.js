import { stripe, isStripeConfigured } from "../config/stripe.js";
import User from "../models/User.js";
import Plan from "../models/Plan.js";

// CLIENT_URL may hold a comma-separated list of allowed CORS origins (Vite
// shifts ports when the default one is taken), so redirect URLs must use
// just the first/primary one rather than the raw env value.
const primaryClientUrl = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")[0]
  .trim();

// Maps a Stripe subscription status to our simplified local status enum.
const mapStripeStatus = (stripeStatus) => {
  if (stripeStatus === "active" || stripeStatus === "trialing") return "active";
  if (stripeStatus === "past_due" || stripeStatus === "unpaid") return "past_due";
  return "canceled";
};

export const createCheckoutSession = async (req, res, next) => {
  try {
    if (!isStripeConfigured) {
      return res.status(503).json({ message: "Stripe not configured" });
    }

    const { planId, plan } = req.body;
    const user = req.user;

    let planDoc = null;
    if (planId) {
      planDoc = await Plan.findById(planId);
    } else if (plan) {
      planDoc = await Plan.findOne({ accessLevel: plan });
    }

    if (!planDoc || !planDoc.stripePriceId) {
      return res.status(400).json({ message: "Invalid or unconfigured plan" });
    }

    // Reuse an existing Stripe customer for this user, or create one on the fly.
    let customerId = user.subscription?.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user._id.toString() },
      });
      customerId = customer.id;
      user.subscription.stripeCustomerId = customerId;
      await user.save();
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: planDoc.stripePriceId, quantity: 1 }],
      success_url: `${primaryClientUrl}/dashboard?checkout=success`,
      cancel_url: `${primaryClientUrl}/pricing?checkout=cancel`,
      metadata: { userId: user._id.toString(), planAccessLevel: planDoc.accessLevel },
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("[stripe] createCheckoutSession failed:", err.message);
    res.status(503).json({ message: "Stripe not configured" });
  }
};

/**
 * ---------------------------------------------------------------------------
 * STRIPE WEBHOOK HANDLER
 * ---------------------------------------------------------------------------
 * Stripe calls this endpoint directly (server-to-server) whenever a billing
 * event happens -- it's how we find out about payments/cancellations that
 * occur outside of our own request/response cycle (e.g. a recurring charge
 * that fails days after the user last visited the site).
 *
 * Flow:
 *   1. This route is mounted with `express.raw({ type: "application/json" })`
 *      in server.js (BEFORE the global express.json() parser) because Stripe
 *      signs the *raw* request body -- if it were already parsed to a JS
 *      object, the signature check below would fail.
 *   2. `stripe.webhooks.constructEvent` verifies the `Stripe-Signature`
 *      header against STRIPE_WEBHOOK_SECRET, proving the request really came
 *      from Stripe (and wasn't forged / replayed with a modified body).
 *   3. We switch on `event.type` and sync the relevant User document's
 *      `subscription` sub-object so our DB stays in sync with Stripe's
 *      billing state.
 *
 * Events handled:
 *   - checkout.session.completed  -> user just finished paying for the first
 *     time (or resubscribed). We look up the subscription Stripe just
 *     created to read its price/period, map it to our plan, and mark active.
 *   - invoice.payment_failed      -> a renewal charge failed. Mark past_due;
 *     if Stripe tells us the subscription itself has ended, downgrade to free.
 *   - customer.subscription.deleted -> subscription fully canceled/expired
 *     (e.g. after cancel_at_period_end reaches the period end) -> downgrade
 *     the user to the free plan.
 *   - customer.subscription.updated -> covers plan changes, renewals, and
 *     Stripe's automatic retry/status transitions -> keep currentPeriodEnd
 *     and status in sync without changing the plan tier here.
 * ---------------------------------------------------------------------------
 */
export const stripeWebhook = async (req, res) => {
  const signature = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("[stripe webhook] signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const planAccessLevel = session.metadata?.planAccessLevel;
        if (!userId) break;

        const user = await User.findById(userId);
        if (!user) break;

        const subscription = await stripe.subscriptions.retrieve(session.subscription);

        user.subscription.plan = planAccessLevel || user.subscription.plan;
        user.subscription.status = mapStripeStatus(subscription.status);
        user.subscription.stripeSubscriptionId = subscription.id;
        user.subscription.stripeCustomerId = session.customer;
        user.subscription.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
        await user.save();
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const user = await User.findOne({ "subscription.stripeCustomerId": invoice.customer });
        if (!user) break;

        user.subscription.status = "past_due";

        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
          if (subscription.status === "canceled" || subscription.status === "unpaid") {
            user.subscription.plan = "free";
          }
        }

        await user.save();
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const user = await User.findOne({ "subscription.stripeCustomerId": subscription.customer });
        if (!user) break;

        user.subscription.plan = "free";
        user.subscription.status = "canceled";
        await user.save();
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const user = await User.findOne({ "subscription.stripeCustomerId": subscription.customer });
        if (!user) break;

        user.subscription.status = mapStripeStatus(subscription.status);
        user.subscription.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
        await user.save();
        break;
      }

      default:
        break;
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error("[stripe webhook] handler error:", err.message);
    res.status(500).json({ message: "Webhook handler failed" });
  }
};

export const getSubscriptionMe = async (req, res, next) => {
  try {
    const user = req.user;
    let billingHistory = [];

    if (isStripeConfigured && user.subscription?.stripeCustomerId) {
      try {
        const invoices = await stripe.invoices.list({
          customer: user.subscription.stripeCustomerId,
          limit: 20,
        });

        billingHistory = invoices.data.map((invoice) => ({
          date: new Date(invoice.created * 1000),
          amount: invoice.amount_paid / 100,
          status: invoice.status,
          invoiceUrl: invoice.hosted_invoice_url,
        }));
      } catch (err) {
        console.error("[stripe] failed to fetch billing history:", err.message);
        billingHistory = [];
      }
    }

    res.status(200).json({ subscription: user.subscription, billingHistory });
  } catch (err) {
    next(err);
  }
};

export const cancelSubscription = async (req, res, next) => {
  const user = req.user;
  try {
    if (!isStripeConfigured || !user.subscription?.stripeSubscriptionId) {
      // Graceful demo fallback: no real Stripe subscription to cancel, just
      // downgrade locally so the UI still reflects a cancellation.
      user.subscription.plan = "free";
      user.subscription.status = "canceled";
      await user.save();
      return res.status(200).json({ subscription: user.subscription });
    }

    const subscription = await stripe.subscriptions.update(
      user.subscription.stripeSubscriptionId,
      { cancel_at_period_end: true }
    );

    user.subscription.status = mapStripeStatus(subscription.status);
    await user.save();

    res.status(200).json({ subscription: user.subscription });
  } catch (err) {
    console.error("[stripe] cancelSubscription failed:", err.message);
    user.subscription.plan = "free";
    user.subscription.status = "canceled";
    await user.save();
    res.status(200).json({ subscription: user.subscription });
  }
};

export const createPortalSession = async (req, res, next) => {
  try {
    if (!isStripeConfigured || !req.user.subscription?.stripeCustomerId) {
      return res.status(503).json({ message: "Stripe not configured" });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: req.user.subscription.stripeCustomerId,
      return_url: `${primaryClientUrl}/dashboard`,
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("[stripe] createPortalSession failed:", err.message);
    res.status(503).json({ message: "Stripe not configured" });
  }
};

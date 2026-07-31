// One-off setup script: creates real Stripe Products + recurring Prices for
// the paid plans (Pro/Premium) and writes the resulting Price IDs back onto
// the Plan documents in MongoDB, replacing the seed script's placeholders.
// Run with: node scripts/setupStripeProducts.js
import "dotenv/config";
import mongoose from "mongoose";
import Stripe from "stripe";
import Plan from "../models/Plan.js";

const run = async () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("[setup] STRIPE_SECRET_KEY is not set in .env -- aborting.");
    process.exit(1);
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/blogsaas";

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  console.log(`[setup] Connected to MongoDB at ${uri}`);

  const paidPlans = await Plan.find({ price: { $gt: 0 } });

  for (const plan of paidPlans) {
    const needsRealPrice =
      !plan.stripePriceId || plan.stripePriceId.includes("placeholder");

    if (!needsRealPrice) {
      // Verify the existing price ID is actually valid on this Stripe account.
      try {
        await stripe.prices.retrieve(plan.stripePriceId);
        console.log(`[setup] ${plan.name}: existing price ${plan.stripePriceId} is valid, skipping.`);
        continue;
      } catch (err) {
        console.log(`[setup] ${plan.name}: existing price ${plan.stripePriceId} is invalid (${err.message}), recreating.`);
      }
    }

    const product = await stripe.products.create({
      name: `${plan.name} Plan`,
      description: plan.features.join(", "),
    });

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(plan.price * 100),
      currency: "usd",
      recurring: { interval: "month" },
    });

    plan.stripePriceId = price.id;
    await plan.save();

    console.log(`[setup] ${plan.name}: created product ${product.id} + price ${price.id} ($${plan.price}/mo)`);
  }

  console.log("[setup] Done.");
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error("[setup] Failed:", err.message);
  process.exit(1);
});

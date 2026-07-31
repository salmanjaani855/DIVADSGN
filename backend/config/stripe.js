import Stripe from "stripe";

const isStripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);

if (!isStripeConfigured) {
  console.warn(
    "[stripe] STRIPE_SECRET_KEY is not set -- billing endpoints will return a 503 fallback until configured."
  );
}

// Instantiate even with an empty key so `stripe` is always a usable object;
// any real API call will simply fail and be caught by the calling controller,
// which is handled gracefully (503 responses) rather than crashing the app.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2024-06-20",
});

export { stripe, isStripeConfigured };

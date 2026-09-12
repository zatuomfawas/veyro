// One Stripe client, reused. Never construct `new Stripe(...)` anywhere else.
import Stripe from "stripe";

// Importing this module has no side effects. A missing key must not crash the
// process at load time — that would also break `next build`, which imports every
// route module to read its config. Routes that call Stripe run
// assertStripeConfigured() first and turn a missing key into a clean 500.
const secretKey = process.env.STRIPE_SECRET_KEY ?? "";

export function assertStripeConfigured(): void {
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is missing from .env");
  }
}

// No apiVersion pinned on purpose: the installed `stripe` package has its own
// correct default, and guessing a version string is worse than leaving it. Pin
// it here explicitly only after checking the installed SDK's own docs.
//
// maxNetworkRetries: the SDK attaches an idempotency key to its own retries, so
// this is safe for writes. Cross-request retries still need our own key — see
// the connect-stripe route.
export const stripe = new Stripe(secretKey, {
  maxNetworkRetries: 2,
  appInfo: { name: "Veyro" },
});

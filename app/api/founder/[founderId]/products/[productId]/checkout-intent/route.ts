// Create the PaymentIntent a customer is about to pay.
//
// Deliberately unauthenticated: a stranger who was sent the link is exactly who
// this is for. That makes the database the only thing between them and a
// charge, so nothing about the money is taken from the request — the amount and
// currency come from the product row, every time.
//
// The intent is created ON THE CONNECTED ACCOUNT (a direct charge). That is the
// whole point: the money lands in the founder's Stripe balance, the founder is
// merchant of record, and Veyro never holds a customer's money. Creating it on
// the platform account instead would work in testing and be wrong in every way
// that matters.
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe, assertStripeConfigured } from "@/lib/stripe";
import { resolvePurchasable, isPurchasable, REASON_TEXT } from "@/lib/checkout";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * Per-IP ceiling. Generous enough that a customer retrying a declined card is
 * never caught by it, tight enough to slow a script. See lib/rate-limit.ts for
 * why this is weaker than it looks: the counters are per instance.
 */
const LIMIT = 20;
const WINDOW_MS = 60_000;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ founderId: string; productId: string }> },
) {
  // Keyed on the product as well as the caller, so hammering one product cannot
  // lock a customer out of a different founder's checkout on the same network.
  const { founderId: fid, productId: pid } = await params;
  const gate = rateLimit(`checkout:${clientIp(req)}:${fid}:${pid}`, LIMIT, WINDOW_MS);
  if (!gate.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Wait a moment and try again." },
      { status: 429, headers: { "retry-after": String(gate.retryAfter) } },
    );
  }

  try {
    assertStripeConfigured();
  } catch {
    return NextResponse.json({ error: "Payments are not configured on this server." }, { status: 500 });
  }

  const founderId = fid;
  const productId = pid;

  const resolved = await resolvePurchasable(founderId, productId);
  if (!isPurchasable(resolved)) {
    return NextResponse.json(
      { error: REASON_TEXT[resolved], reason: resolved },
      { status: resolved === "product_not_found" ? 404 : 409 },
    );
  }

  const { product, stripeAccountId } = resolved;

  let intent: Stripe.PaymentIntent;
  try {
    intent = await stripe.paymentIntents.create(
      {
        amount: product.priceMinor,
        currency: product.currency.toLowerCase(),
        automatic_payment_methods: { enabled: true },
        description: product.name,
        // How the webhook attributes the payment. Cross-checked there against
        // the connected account the event arrived on, so a stale or edited
        // value cannot credit the wrong founder.
        metadata: { veyroFounderId: founderId, veyroProductId: productId },
        // Zero application fee for now: the founder keeps everything except
        // Stripe's own processing fee.
      },
      {
        stripeAccount: stripeAccountId, // direct charge — money to the founder
        // A double-clicked buy button reuses the same intent rather than
        // creating a second one. Scoped to the product's current price so a
        // price change starts a fresh intent instead of charging the old one.
        idempotencyKey: `veyro-pi-${productId}-${product.priceMinor}-${product.currency}`,
      },
    );
  } catch (err) {
    const e = err as Stripe.errors.StripeError;
    console.error(`checkout-intent failed for ${founderId}/${productId}:`, e.message);
    return NextResponse.json(
      { error: "We couldn't start this payment. Nothing has been charged." },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    clientSecret: intent.client_secret,
    intentId: intent.id,
    // The client must load Stripe.js as this account for a direct charge.
    stripeAccount: stripeAccountId,
    product: {
      name: product.name,
      description: product.description,
      priceMinor: product.priceMinor,
      currency: product.currency,
    },
  });
}

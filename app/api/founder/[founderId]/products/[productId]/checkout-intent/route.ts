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

export const runtime = "nodejs";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ founderId: string; productId: string }> },
) {
  try {
    assertStripeConfigured();
  } catch {
    return NextResponse.json({ error: "Payments are not configured on this server." }, { status: 500 });
  }

  const { founderId, productId } = await params;

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

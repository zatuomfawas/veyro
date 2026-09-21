// Start a checkout from somebody else's app.
//
// The SDK's only write. It takes one id — the product's — because two ids are
// two chances to mismatch them, and the product row already knows its founder.
//
// It does not re-implement anything about money. The amount, the currency and
// the account all come from resolvePurchasable and stripe.paymentIntents, the
// same path the hosted page uses, so there is exactly one place where a price
// becomes a charge.
import { randomUUID } from "crypto";
import type Stripe from "stripe";
import { db } from "@/lib/db";
import { stripe, assertStripeConfigured } from "@/lib/stripe";
import { resolvePurchasable, isPurchasable } from "@/lib/checkout";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { corsJson, corsPreflight } from "@/lib/cors";
import { SITE } from "@/lib/seo";
import { explain } from "@/lib/sdk-errors";

export const runtime = "nodejs";

/** The expensive call: it reaches Stripe. Same ceiling as the hosted page. */
const LIMIT = 20;
const WINDOW_MS = 60_000;

export function OPTIONS() {
  return corsPreflight();
}

export async function POST(req: Request) {
  const gate = rateLimit(`sdk-create:${clientIp(req)}`, LIMIT, WINDOW_MS);
  if (!gate.ok) {
    return corsJson(
      explain("rate_limited"),
      { status: 429, headers: { "retry-after": String(gate.retryAfter) } },
    );
  }

  try {
    assertStripeConfigured();
  } catch {
    return corsJson(explain("not_configured"), { status: 500 });
  }

  const body = await req.json().catch(() => null);
  const productId = typeof body?.productId === "string" ? body.productId.trim() : "";
  if (!productId) return corsJson(explain("no_product_id"), { status: 400 });

  // One id in, the founder derived from the row. An integrator cannot pair a
  // product with the wrong founder because they never supply the founder.
  const product = await db.founderProduct.findUnique({
    where: { id: productId },
    select: { founderId: true },
  });
  if (!product) return corsJson(explain("product_not_found"), { status: 404 });

  const founderId = product.founderId;
  const resolved = await resolvePurchasable(founderId, productId);
  if (!isPurchasable(resolved)) {
    return corsJson(explain(resolved), { status: resolved === "product_not_found" ? 404 : 409 });
  }

  let intent: Stripe.PaymentIntent;
  try {
    intent = await stripe.paymentIntents.create(
      {
        amount: resolved.product.priceMinor,
        currency: resolved.product.currency.toLowerCase(),
        automatic_payment_methods: { enabled: true },
        description: resolved.product.name,
        metadata: { veyroFounderId: founderId, veyroProductId: productId },
      },
      {
        stripeAccount: resolved.stripeAccountId,
        // Per call, like the hosted page's per-page-load nonce. Two customers
        // pressing buy at the same moment must not be handed one intent.
        idempotencyKey: `veyro-sdk-${productId}-${randomUUID()}`,
      },
    );
  } catch (err) {
    console.error(`sdk checkout/create failed for ${productId}:`, (err as Error).message);
    return corsJson(explain("stripe_unavailable"), { status: 502 });
  }

  // The intent travels in the URL so the hosted page pays this one rather than
  // minting a second. Only the id — never the client secret, which is the part
  // that can confirm a payment and has no business in a link or a log.
  return corsJson({
    ok: true,
    checkoutUrl: `${SITE}/pay/${founderId}/${productId}?intent=${encodeURIComponent(intent.id)}`,
    intentId: intent.id,
    product: {
      name: resolved.product.name,
      priceMinor: resolved.product.priceMinor,
      currency: resolved.product.currency,
    },
  });
}

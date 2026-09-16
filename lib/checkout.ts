// What has to be true before a stranger can be charged.
//
// The checkout page and the intent endpoint both call this, so they cannot
// disagree: a page that renders a payment form for something the API will
// refuse is worse than no page at all. The endpoint is the one that matters —
// it is public, so the database is the only thing between a stranger and a
// charge. The page just avoids showing a form that would fail.
import { db } from "./db";
import { formatMinor } from "./money";

// Re-exported so server callers keep one import site; the implementation lives in
// lib/money.ts, which has no database import and is safe for client components.
export { formatMinor };

/** Stripe's own floor is currency-specific; these are the common ones in minor units. */
const MINIMUM_MINOR: Record<string, number> = {
  USD: 50, EUR: 50, GBP: 30, CAD: 50, AUD: 50, CHF: 50,
  NOK: 300, SEK: 300, DKK: 250, SGD: 50, HKD: 400, JPY: 50, MXN: 1000,
};

export type NotPurchasable =
  | "product_not_found"
  | "product_not_live"
  | "price_not_set"
  | "price_below_minimum"
  | "payments_not_set_up";

export const REASON_TEXT: Record<NotPurchasable, string> = {
  product_not_found: "This link doesn't point at anything we can sell.",
  product_not_live: "This isn't on sale right now.",
  price_not_set: "This doesn't have a price yet.",
  price_below_minimum: "The price is below the card network's minimum charge.",
  payments_not_set_up: "This seller hasn't finished setting up payments yet.",
};

export type Purchasable = {
  product: Awaited<ReturnType<typeof db.founderProduct.findUnique>> & object;
  /** The founder's connected Stripe account — where the money lands. */
  stripeAccountId: string;
};

/**
 * Resolve a product for sale, or the reason it isn't. Never throws on ordinary
 * "no" answers; the caller decides whether that is a 404, a 409, or a page.
 */
export async function resolvePurchasable(
  founderId: string,
  productId: string,
): Promise<Purchasable | NotPurchasable> {
  const product = await db.founderProduct.findUnique({ where: { id: productId } });

  // Same answer for "wrong founder" as "no such product": the URL carries both,
  // and confirming that a product exists under a different founder tells a
  // stranger something they have no business knowing.
  if (!product || product.founderId !== founderId) return "product_not_found";
  if (product.status !== "LIVE") return "product_not_live";
  if (product.priceMinor <= 0) return "price_not_set";

  const minimum = MINIMUM_MINOR[product.currency.toUpperCase()] ?? 50;
  if (product.priceMinor < minimum) return "price_below_minimum";

  const account = await db.founderPaymentAccount.findUnique({ where: { founderId } });
  if (!account?.providerAccountId || account.status !== "ACTIVE") return "payments_not_set_up";

  return { product, stripeAccountId: account.providerAccountId };
}

export function isPurchasable(v: Purchasable | NotPurchasable): v is Purchasable {
  return typeof v !== "string";
}

/** Minor units to something a person reads, e.g. 1200 USD -> "$12.00". */

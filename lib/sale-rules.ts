// What makes a product sellable, with no database in it.
//
// Split out of lib/checkout.ts so it can be run by `node --test` directly, the
// same arrangement as lib/analytics-fold.ts. The rules here decide whether a
// stranger can be charged, so they are worth testing on their own rather than
// only through the page that happens to call them.
//
// lib/checkout.ts re-exports everything below, so callers keep one import site.

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

/**
 * The same reasons, addressed to the founder who owns the product rather than
 * to a customer who hit a dead link. "This seller hasn't finished setting up
 * payments" is the wrong sentence to show someone their own draft.
 */
export const OWNER_REASON_TEXT: Record<NotPurchasable, string> = {
  product_not_found: "This product no longer exists.",
  product_not_live: "This isn't live yet, so nobody can open it.",
  price_not_set: "It has no price yet, so it can't take a payment.",
  price_below_minimum: "The price is below the card network's minimum charge, so a card would be declined.",
  payments_not_set_up: "Your Stripe account isn't finished, so payments can't be taken yet.",
};

/** The fields saleBlockers judges. Narrow on purpose, so it stays pure. */
export type PricedProduct = { priceMinor: number; currency: string };
export type SellerAccount = { providerAccountId: string | null; status: string } | null;

/**
 * Everything wrong with a product except its status, worst first.
 *
 * Pure, and exported, because the draft preview on the dashboard has to answer
 * "would this actually sell once I publish it?" and the only safe way to answer
 * that is with the same code the real gate uses. A second implementation would
 * agree on the day it was written and drift afterwards, and the failure mode is
 * a founder publishing something the checkout then refuses — the fault the note
 * at the top of lib/checkout.ts describes, moved one step earlier.
 *
 * Status is deliberately not checked here: a draft is not "broken", it is
 * unpublished, and the preview needs to describe the rest of the product
 * without that drowning out the real problems.
 */
export function saleBlockers(product: PricedProduct, account: SellerAccount): NotPurchasable[] {
  const out: NotPurchasable[] = [];
  if (product.priceMinor <= 0) out.push("price_not_set");
  else {
    const minimum = MINIMUM_MINOR[product.currency.toUpperCase()] ?? 50;
    if (product.priceMinor < minimum) out.push("price_below_minimum");
  }
  if (!account?.providerAccountId || account.status !== "ACTIVE") out.push("payments_not_set_up");
  return out;
}

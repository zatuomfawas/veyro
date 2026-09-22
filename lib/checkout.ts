// What has to be true before a stranger can be charged.
//
// The checkout page and the intent endpoint both call this, so they cannot
// disagree: a page that renders a payment form for something the API will
// refuse is worse than no page at all. The endpoint is the one that matters —
// it is public, so the database is the only thing between a stranger and a
// charge. The page just avoids showing a form that would fail.
import { db } from "./db";
import { formatMinor } from "./money";
import { saleBlockers, type NotPurchasable } from "./sale-rules";

// Re-exported so server callers keep one import site; the implementations live in
// lib/money.ts and lib/sale-rules.ts, neither of which imports the database, so
// both are safe for client components and for `node --test`.
export { formatMinor };
export { saleBlockers, REASON_TEXT, OWNER_REASON_TEXT } from "./sale-rules";
export type { NotPurchasable, PricedProduct, SellerAccount } from "./sale-rules";

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

  // The account is only read once the product itself is worth selling, so an
  // unpriced draft still costs one query rather than two.
  if (product.priceMinor <= 0) return "price_not_set";

  const account = await db.founderPaymentAccount.findUnique({ where: { founderId } });
  const blocked = saleBlockers(product, account);
  if (blocked.length > 0) return blocked[0];

  // saleBlockers already established the account is usable; this narrows it for
  // the type system rather than re-deciding anything.
  if (!account?.providerAccountId) return "payments_not_set_up";

  return { product, stripeAccountId: account.providerAccountId };
}

export function isPurchasable(v: Purchasable | NotPurchasable): v is Purchasable {
  return typeof v !== "string";
}

/** Minor units to something a person reads, e.g. 1200 USD -> "$12.00". */

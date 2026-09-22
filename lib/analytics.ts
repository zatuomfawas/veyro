// What happened over the last N days, folded from rows rather than stored.
//
// Same rule as the wallet: nothing here is a counter kept up to date by hand.
// Views come from CheckoutView, everything else from FounderTransaction, and a
// figure that cannot be derived is returned as null so the UI can say it does
// not know instead of printing a zero that reads like a fact.
//
// Three things this file is careful about, because each one is a way to lie
// with a true number:
//
// 1. Conversion needs its numerator and denominator over the SAME period.
//    View counting started the day this feature shipped, and accounts have
//    transactions older than that. Dividing 30 days of sales by 4 days of
//    views invents a conversion rate far above reality. So conversion is
//    measured from `convFrom` — the later of the window start and the first
//    day this founder has any view recorded — and the UI states that date.
//
// 2. Currencies are never summed. There is no exchange rate in this app, and
//    inventing one to make a single tidy total would be worse than showing
//    two honest lines. Revenue is per currency.
//
// 3. Revenue is GROSS, matching `earned` in the ledger, and is labelled that
//    way at the call site. Stripe's fee is deducted before the money lands,
//    so a gross figure is not what the founder keeps and must not be presented
//    as though it were.

import { db } from "@/lib/db";
import { computeAnalytics, utcDay, type Analytics } from "@/lib/analytics-fold";

// Re-exported so callers keep one import for the feature.
export type { Analytics, ProductStat, ViewRow, TxRow } from "@/lib/analytics-fold";

export async function foldAnalytics(founderId: string, days = 30): Promise<Analytics> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const windowStartDay = utcDay(windowStart);

  const [viewRows, firstView, tx] = await Promise.all([
    db.checkoutView.findMany({
      where: { founderId, day: { gte: windowStartDay } },
      select: { day: true, count: true },
    }),
    // The earliest view this founder has at any time, which is what tells us
    // whether the window reaches back further than the counter does.
    db.checkoutView.findFirst({
      where: { founderId },
      orderBy: { day: "asc" },
      select: { day: true },
    }),
    db.founderTransaction.findMany({
      where: { founderId, status: "COMPLETED", createdAt: { gte: windowStart } },
      select: {
        amountMinor: true, currency: true, createdAt: true, productId: true,
        product: { select: { name: true } },
      },
    }),
  ]);

  return computeAnalytics({
    days, windowStart, windowStartDay, viewRows, firstViewDay: firstView?.day ?? null, tx,
  });
}

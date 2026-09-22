// The analytics arithmetic, with nothing else in it.
//
// Deliberately free of imports so it can be run by `node --test` directly,
// without a bundler, a path alias or a database. The queries live in
// lib/analytics.ts; everything that can quietly produce a confident wrong
// number lives here, where it is covered by scripts/analytics.test.ts.

export type ProductStat = {
  productId: string;
  name: string;
  purchases: number;
  grossMinor: number;
  currency: string;
};

export type Analytics = {
  /** How many days the window covers. */
  days: number;
  /** Checkout views in the window. */
  views: number;
  /** Completed payments in the window, across every currency. */
  purchases: number;
  /**
   * purchases / views over the period both are known for, 0..1, or null when
   * there is nothing to divide. Null is not zero: zero would claim that people
   * looked and none of them bought.
   */
  conversion: number | null;
  /**
   * The day conversion is measured from, when that is later than the window
   * start because view counting had not begun yet. Null when the whole window
   * is covered and no caveat is needed.
   */
  conversionFrom: Date | null;
  /** Gross taken in the window, per currency, biggest first. Never summed. */
  revenue: { currency: string; grossMinor: number }[];
  /** Most purchased product in the window. Null when nothing sold. */
  topProduct: ProductStat | null;
  /** True once anything at all has happened, so the UI can pick a state. */
  anyActivity: boolean;
};

/** Midnight UTC of a date, the grain CheckoutView.day is stored at. */
export function utcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

/** The shapes the fold needs, so it can be exercised without a database. */
export type ViewRow = { day: Date; count: number };
export type TxRow = {
  amountMinor: number;
  currency: string;
  createdAt: Date;
  productId: string;
  product: { name: string };
};

/**
 * The arithmetic, with no database in it.
 *
 * Separated so the parts that can quietly lie — the conversion window above
 * all — can be exercised against fixtures. A conversion rate is a division, and
 * a division is the easiest place in an app to produce a confident wrong
 * number.
 */
export function computeAnalytics({
  days, windowStart, windowStartDay, viewRows, firstViewDay, tx,
}: {
  days: number;
  windowStart: Date;
  windowStartDay: Date;
  viewRows: ViewRow[];
  firstViewDay: Date | null;
  tx: TxRow[];
}): Analytics {
  const views = viewRows.reduce((n, r) => n + r.count, 0);
  const purchases = tx.length;

  // ---- conversion, over a period both halves actually cover ----
  const convFrom = firstViewDay && firstViewDay > windowStartDay ? firstViewDay : null;
  const convStart = convFrom ?? windowStart;
  const convViews = convFrom
    ? viewRows.filter((r) => r.day >= convFrom).reduce((n, r) => n + r.count, 0)
    : views;
  const convPurchases = convFrom
    ? tx.filter((t) => t.createdAt >= convStart).length
    : purchases;
  // Guard the divide. Purchases with no views is a real state — someone paid
  // through a link opened before counting began — and it has no rate.
  const conversion = convViews > 0 ? convPurchases / convViews : null;

  // ---- revenue per currency ----
  const byCurrency = new Map<string, number>();
  for (const t of tx) {
    byCurrency.set(t.currency, (byCurrency.get(t.currency) ?? 0) + t.amountMinor);
  }
  const revenue = [...byCurrency.entries()]
    .map(([currency, grossMinor]) => ({ currency, grossMinor }))
    .sort((a, b) => b.grossMinor - a.grossMinor);

  // ---- top product, by number of sales ----
  const byProduct = new Map<string, ProductStat>();
  for (const t of tx) {
    const prev = byProduct.get(t.productId);
    if (prev) {
      prev.purchases += 1;
      prev.grossMinor += t.amountMinor;
    } else {
      byProduct.set(t.productId, {
        productId: t.productId,
        name: t.product.name,
        purchases: 1,
        grossMinor: t.amountMinor,
        currency: t.currency,
      });
    }
  }
  // Sales first, then value: two products on one sale each are ordered by the
  // one that brought in more, which is the more useful answer to "top".
  const topProduct = [...byProduct.values()]
    .sort((a, b) => b.purchases - a.purchases || b.grossMinor - a.grossMinor)[0] ?? null;

  return {
    days,
    views,
    purchases,
    conversion,
    conversionFrom: convFrom,
    revenue,
    topProduct,
    anyActivity: views > 0 || purchases > 0,
  };
}

// Tests for the analytics fold. Run with `npm test`.
//
// The subject is lib/analytics-fold.ts, which has no imports, so this runs on
// node --test with no bundler and no database.
//
// What is worth testing here is not "does it add up". It is the handful of
// places where a true number becomes a misleading one: a conversion rate whose
// halves cover different periods, a zero standing in for "unknown", two
// currencies added together, a tie broken arbitrarily.

import { test } from "node:test";
import assert from "node:assert/strict";
import { computeAnalytics, utcDay, type TxRow, type ViewRow } from "../lib/analytics-fold.ts";

const DAY = 24 * 60 * 60 * 1000;
const NOW = new Date("2026-09-22T12:00:00Z");
const WINDOW_START = new Date(NOW.getTime() - 30 * DAY);
const WINDOW_START_DAY = utcDay(WINDOW_START);

/** Days before NOW, at midnight UTC, matching how CheckoutView stores a day. */
const dayAgo = (n: number) => utcDay(new Date(NOW.getTime() - n * DAY));
const at = (n: number) => new Date(NOW.getTime() - n * DAY);

const views = (spec: [number, number][]): ViewRow[] =>
  spec.map(([ago, count]) => ({ day: dayAgo(ago), count }));

const sale = (ago: number, amountMinor: number, productId = "p1", name = "Sticker pack", currency = "USD"): TxRow =>
  ({ amountMinor, currency, createdAt: at(ago), productId, product: { name } });

const fold = (viewRows: ViewRow[], tx: TxRow[], firstViewDay: Date | null) =>
  computeAnalytics({
    days: 30, windowStart: WINDOW_START, windowStartDay: WINDOW_START_DAY,
    viewRows, firstViewDay, tx,
  });

test("no data at all reports nothing rather than zero percent", () => {
  const a = fold([], [], null);
  assert.equal(a.views, 0);
  assert.equal(a.purchases, 0);
  assert.equal(a.conversion, null, "conversion must be null, not 0");
  assert.equal(a.anyActivity, false);
  assert.equal(a.topProduct, null);
  assert.deepEqual(a.revenue, []);
});

test("views but no sales is a real zero percent, not unknown", () => {
  const a = fold(views([[3, 20]]), [], dayAgo(3));
  assert.equal(a.views, 20);
  assert.equal(a.conversion, 0, "20 looked and none bought is genuinely 0%");
  assert.equal(a.anyActivity, true);
});

test("sales with no views has no rate at all", () => {
  // Someone paid through a link opened before counting began. Dividing by zero
  // must not produce Infinity, and must not be reported as 0%.
  const a = fold([], [sale(5, 1000)], null);
  assert.equal(a.purchases, 1);
  assert.equal(a.views, 0);
  assert.equal(a.conversion, null);
});

test("conversion does not divide 30 days of sales by 4 days of views", () => {
  // The honesty case this whole design exists for. Counting began 4 days ago.
  // 10 sales in the window, but only 2 of them since counting started, against
  // 40 views. The wrong answer is 10/40 = 25%. The right one is 2/40 = 5%.
  const viewRows = views([[3, 20], [2, 20]]);
  const tx = [
    ...Array.from({ length: 8 }, (_, i) => sale(20 + i, 500)), // before counting
    sale(3, 500), sale(1, 500),                                 // after counting
  ];
  const a = fold(viewRows, tx, dayAgo(4));

  assert.equal(a.purchases, 10, "the headline count still covers the full window");
  assert.equal(a.views, 40);
  assert.equal(a.conversion, 2 / 40, "conversion covers only the counted period");
  assert.deepEqual(a.conversionFrom, dayAgo(4), "and says which date it starts from");
});

test("no caveat when counting predates the window", () => {
  const a = fold(views([[3, 10]]), [sale(3, 500)], dayAgo(45));
  assert.equal(a.conversionFrom, null, "nothing to explain, so no date shown");
  assert.equal(a.conversion, 1 / 10);
});

test("currencies are listed, never summed", () => {
  const a = fold([], [
    sale(2, 10000, "p1", "Prints", "USD"),
    sale(3, 5000, "p2", "Zine", "GBP"),
    sale(4, 2500, "p1", "Prints", "USD"),
  ], null);
  assert.equal(a.revenue.length, 2);
  assert.deepEqual(a.revenue[0], { currency: "USD", grossMinor: 12500 });
  assert.deepEqual(a.revenue[1], { currency: "GBP", grossMinor: 5000 });
  assert.ok(!a.revenue.some((r) => r.grossMinor === 17500), "12500 + 5000 is not a number that exists");
});

test("top product is by sales, with value breaking a tie", () => {
  const a = fold([], [
    sale(1, 100, "cheap", "Sticker"),
    sale(2, 9000, "dear", "Commission"),
  ], null);
  assert.equal(a.topProduct?.productId, "dear", "one sale each, so the bigger one wins");

  const b = fold([], [
    sale(1, 100, "cheap", "Sticker"),
    sale(2, 100, "cheap", "Sticker"),
    sale(3, 9000, "dear", "Commission"),
  ], null);
  assert.equal(b.topProduct?.productId, "cheap", "two sales beats one bigger sale");
  assert.equal(b.topProduct?.purchases, 2);
  assert.equal(b.topProduct?.grossMinor, 200);
});

test("a view on the exact first counted day is included", () => {
  // `>=` not `>`: an off-by-one here silently drops a day of the denominator
  // and reports a conversion rate that is too high.
  const a = fold(views([[4, 10]]), [sale(4, 500)], dayAgo(4));
  assert.equal(a.conversion, 1 / 10);
});

test("headline views and purchases always cover the full window", () => {
  // Only the RATE is narrowed. The counts are what happened in 30 days, so
  // narrowing them too would make the page disagree with the transactions
  // table beside it.
  const a = fold(views([[1, 5]]), [sale(25, 500), sale(1, 500)], dayAgo(2));
  assert.equal(a.views, 5);
  assert.equal(a.purchases, 2);
  assert.equal(a.conversion, 1 / 5);
});

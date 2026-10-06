// The pricing model, as arithmetic rather than as a sentence.
//
// It lives here rather than inside the calculator component because the
// calculator is a client component and this is the part that has to be
// testable without React, and because the figures are quoted in prose on
// /pricing, on the landing page and in the FAQ. One function means those
// quotes can be checked against the thing that computes them.

/** Below this much earned in a month, Veyro charges nothing. */
export const FREE_FLOOR_MINOR = 10000;
/** Charged on the amount above the floor only. */
export const RATE = 0.03;

/** Veyro's fee, in minor units, for a month in which `earnedMinor` came in. */
export function feeMinor(earnedMinor: number): number {
  const over = Math.max(0, earnedMinor - FREE_FLOOR_MINOR);
  // floor(over * 3 / 100), computed on integers.
  //
  // Two decisions in one line. Rounding is DOWN, always, so a fraction of a
  // cent is never charged -- the brief puts it as "in the founder's favour",
  // and it is also the only direction that cannot be accused of padding. This
  // used to be Math.round, which overcharged by a cent whenever the remainder
  // was at least half: 84c over the limit produced 3c instead of 2c.
  //
  // And the multiply happens before the divide, on integers, rather than
  // multiplying by 0.03. Floating point does not represent 0.03 exactly, so
  // over * 0.03 can land a hair below a whole number and floor to one cent
  // less than it should. over * 3 is exact for every amount we will ever see.
  return Math.floor((over * 3) / 100);
}

/**
 * The worked examples printed on /pricing, in minor units.
 *
 * They live beside the function that produces them rather than as literals in
 * the page, because a table of figures a reader is invited to check is the
 * one place a stale number does real damage. The page renders the fee by
 * calling feeMinor on each of these, so the column cannot disagree with the
 * rule, and the test asserts the figures are the ones we say they are.
 */
export const EXAMPLE_EARNINGS_MINOR = [5000, 10000, 20000, 50000, 100000] as const;

/**
 * The fee a single successful payment carries, under the "Fee timing and
 * refunds" subsection of the Terms.
 *
 * The rule is incremental and ratcheted. A fee is incurred when a payment
 * succeeds, calculated on Qualifying Monthly Earnings accumulated through and
 * including that payment. Refunds reduce QME for deciding what later payments
 * owe, but never claw back a fee already taken -- so when a refund has pushed
 * QME back down, the next payment carries nothing until the total due climbs
 * past what has already been collected.
 *
 * @param qmeAfterMinor   QME for the calendar month, including this payment.
 * @param alreadyCollectedMinor  Fees already incurred this month.
 * @returns the fee this payment carries. Never negative: the Terms say no
 *          credit is issued when refunds drop QME below the figure a previous
 *          fee was calculated on.
 */
export function feeOnPaymentMinor(
  qmeAfterMinor: number,
  alreadyCollectedMinor: number,
): number {
  const due = feeMinor(qmeAfterMinor);
  return Math.max(0, due - alreadyCollectedMinor);
}

/**
 * The calendar month a payment falls in, per the "Calendar month" subsection:
 * UTC, keyed on the timestamp Stripe recorded for the successful payment.
 *
 * Returns "YYYY-MM". Local time is never consulted -- a payment at 23:30 in
 * Dubai on the 31st is the following month there and this month in UTC, and
 * the Terms say UTC decides.
 */
export function qmeMonthKey(stripeCreatedUnixSeconds: number): string {
  const d = new Date(stripeCreatedUnixSeconds * 1000);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/**
 * No Veyro fee may be taken before the Terms that introduce it are in force.
 *
 * Two independent locks, as counsel asked. FEE_COLLECTION_ENABLED is the
 * operational switch; this date is the legal floor and does not care what the
 * switch says. Flipping the flag early cannot take a fee, because the guard
 * below is the thing the collection path has to get past.
 */
export const FEES_EFFECTIVE_AT = Date.UTC(2026, 9, 15, 0, 0, 0); // 15 Oct 2026, 00:00 UTC
export const FEE_COLLECTION_ENABLED = true;

/**
 * Is this the payment that took the month past the free limit, and has
 * nobody been told yet?
 *
 * Pure, and separated from the database work in lib/fees.ts, so the rule that
 * decides how often a founder is emailed can be tested without standing a
 * Postgres up. The caller is responsible for reading `alreadyNotified` and
 * writing it back under the same row lock -- this function only decides.
 *
 * Note it is `>`, not `>=`. A month that earns exactly $100 is free and is
 * not a crossing, which is the same boundary feeMinor() uses.
 *
 * `alreadyNotified` is what makes it once per month rather than once per
 * crossing. A refund can drop a month back under the limit and a later
 * payment can carry it over again; that is one month that passed $100, and
 * one email.
 */
export function crossedFreeLimit(qmeAfterMinor: number, alreadyNotified: boolean): boolean {
  return qmeAfterMinor > FREE_FLOOR_MINOR && !alreadyNotified;
}

/**
 * The same instant, worded for a reader.
 *
 * Derived rather than typed out, because this string goes in an email that
 * tells someone when they will start being charged, and a hand-copied date
 * that drifts from the one the code enforces is the single worst sentence
 * this product could send.
 */
export const FEES_EFFECTIVE_LABEL = new Date(FEES_EFFECTIVE_AT).toLocaleDateString("en-GB", {
  day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
});

/** Whether a fee may lawfully be taken at `nowMs`. Both locks must agree. */
export function mayCollectFee(nowMs: number = Date.now()): boolean {
  return FEE_COLLECTION_ENABLED && nowMs >= FEES_EFFECTIVE_AT;
}

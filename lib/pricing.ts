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
  return Math.round(over * RATE);
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

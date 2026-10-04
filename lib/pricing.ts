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

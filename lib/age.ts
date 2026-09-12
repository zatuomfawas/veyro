// Age is computed from a full date of birth, never from the year alone.
// Calendar-year subtraction (thisYear - birthYear) lets someone born in
// December count as 13 up to a year early. The payment provider's minimum age
// is a hard floor that cannot be waived, so the check has to be exact: it
// looks at month and day, and a year on its own is not enough to pass.

/** The minimum age Veyro can onboard. The payment provider's floor; not waivable. */
export const MIN_SIGNUP_AGE = 13;

/** Older than this and the date is almost certainly a typo, not a person. */
const MAX_PLAUSIBLE_AGE = 100;

/** Whole years elapsed from `dob` to `asOf`, honouring month and day.
    A birthday that has not yet occurred this year does not count. */
export function ageInYears(dob: Date, asOf: Date = new Date()): number {
  let age = asOf.getUTCFullYear() - dob.getUTCFullYear();
  const monthDelta = asOf.getUTCMonth() - dob.getUTCMonth();
  if (monthDelta < 0 || (monthDelta === 0 && asOf.getUTCDate() < dob.getUTCDate())) {
    age -= 1;
  }
  return age;
}

export type DobResult =
  | { ok: true; date: Date; age: number }
  | { ok: false; reason: "missing" | "malformed" | "future" | "implausible" | "too_young" };

/**
 * Resolves a date of birth from either an ISO `YYYY-MM-DD` string or separate
 * numeric `year` / `month` (1-12) / `day` parts, then applies the age floor.
 *
 * A year on its own is rejected as `missing`: the 13+ floor cannot be proven
 * without the month and day. Impossible dates (2013-02-30), future dates, and
 * ages over 100 are rejected before the floor is checked.
 */
export function evaluateDateOfBirth(
  input: { date?: unknown; year?: unknown; month?: unknown; day?: unknown },
  asOf: Date = new Date(),
): DobResult {
  let y: number;
  let m: number;
  let d: number;

  if (typeof input.date === "string" && input.date.trim()) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input.date.trim());
    if (!match) return { ok: false, reason: "malformed" };
    y = Number(match[1]);
    m = Number(match[2]);
    d = Number(match[3]);
  } else if (input.year != null && input.month != null && input.day != null) {
    y = Number(input.year);
    m = Number(input.month);
    d = Number(input.day);
  } else {
    return { ok: false, reason: "missing" };
  }

  if (![y, m, d].every(Number.isInteger) || m < 1 || m > 12 || d < 1 || d > 31) {
    return { ok: false, reason: "malformed" };
  }

  const date = new Date(Date.UTC(y, m - 1, d));
  // Round-trip check: rejects days that rolled over, e.g. 2013-02-30 -> Mar 2.
  if (
    date.getUTCFullYear() !== y ||
    date.getUTCMonth() !== m - 1 ||
    date.getUTCDate() !== d
  ) {
    return { ok: false, reason: "malformed" };
  }

  if (date.getTime() > asOf.getTime()) return { ok: false, reason: "future" };

  const age = ageInYears(date, asOf);
  if (age > MAX_PLAUSIBLE_AGE) return { ok: false, reason: "implausible" };
  if (age < MIN_SIGNUP_AGE) return { ok: false, reason: "too_young" };

  return { ok: true, date, age };
}

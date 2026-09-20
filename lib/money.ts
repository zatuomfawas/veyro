// Formatting money, with no imports.
//
// Split out of lib/checkout.ts because that module imports the database, and a
// client component that wanted only formatMinor was dragging Prisma — and with
// it dns, fs, net and tls — into the browser bundle. The build failed loudly,
// which is the good case; the bad case is a server secret reachable from a
// module a client component imports. Keeping the pure helper pure makes the
// boundary impossible to cross by accident.

/**
 * Minor units to a display string.
 *
 * The divisor comes from the currency, not from an assumption. "Minor units"
 * does not mean hundredths: JPY and ISK have no subdivision at all, so 5000
 * minor units is ¥5,000 rather than ¥50, and KWD has three digits, so 5000 is
 * KWD 5.000. Intl already knows each currency's exponent and
 * resolvedOptions() reports it, so the right power of ten is asked for rather
 * than guessed.
 *
 * This used to divide by 100 unconditionally and say so, with product creation
 * restricted to USD to keep the bug out of reach. Wallets already fold per
 * currency and Stripe will report whatever the customer paid in, so the
 * restriction was the only thing standing between that assumption and a figure
 * wrong by a factor of a hundred.
 */
export function formatMinor(amountMinor: number, currency: string): string {
  try {
    const format = new Intl.NumberFormat("en-US", { style: "currency", currency });
    return format.format(amountMinor / 10 ** minorDigits(currency));
  } catch {
    // An unknown or malformed code. Two digits is the commonest shape, and
    // showing the code makes the guess visible rather than silent.
    return `${(amountMinor / 100).toFixed(2)} ${currency}`;
  }
}

/**
 * How many digits this currency's minor unit has. Two for USD, none for JPY,
 * three for KWD. Asked of Intl rather than assumed.
 */
export function minorDigits(currency: string): number {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency })
      .resolvedOptions().maximumFractionDigits ?? 2;
  } catch {
    return 2;
  }
}

/**
 * Text a person typed into a price field, as minor units. Null if it is not an
 * amount in this currency.
 *
 * Never multiplies a float: 12.10 * 100 is 1210.0000000000002 in IEEE 754, and
 * Math.round hides that rather than avoiding it. The digits after the point are
 * parsed as their own integer and added.
 *
 * Lived in three components as three copies before this — the product form, the
 * product editor and the payout form — which is three places for a money bug to
 * be fixed in two of.
 */
export function parseMinor(input: string, currency: string): number | null {
  const digits = minorDigits(currency);
  const text = input.trim().replace(/^[^\d.,-]+/, "").replace(/,/g, "");

  const pattern = digits === 0 ? /^(\d+)$/ : new RegExp(`^(\\d+)(?:\\.(\\d{1,${digits}}))?$`);
  const m = pattern.exec(text);
  if (!m) return null;

  const whole = Number(m[1]);
  if (!Number.isSafeInteger(whole)) return null;

  const fraction = digits === 0 ? 0 : Number((m[2] ?? "").padEnd(digits, "0") || "0");
  const total = whole * 10 ** digits + fraction;
  return Number.isSafeInteger(total) ? total : null;
}

/** Minor units as the plain text a price input should start with: 1234 -> "12.34". */
export function toMajorInput(amountMinor: number, currency: string): string {
  const digits = minorDigits(currency);
  return (amountMinor / 10 ** digits).toFixed(digits);
}

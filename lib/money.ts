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
    const digits = format.resolvedOptions().maximumFractionDigits ?? 2;
    return format.format(amountMinor / 10 ** digits);
  } catch {
    // An unknown or malformed code. Two digits is the commonest shape, and
    // showing the code makes the guess visible rather than silent.
    return `${(amountMinor / 100).toFixed(2)} ${currency}`;
  }
}

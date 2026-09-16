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
 * Known limitation: this divides by 100 unconditionally, which is wrong for
 * zero-decimal currencies — ¥500 renders as "¥5.00". Product creation is
 * restricted to USD for exactly this reason. Fixing it means asking Intl for
 * the currency's minor-unit digits rather than assuming two.
 */
export function formatMinor(amountMinor: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amountMinor / 100);
  } catch {
    return `${(amountMinor / 100).toFixed(2)} ${currency}`;
  }
}

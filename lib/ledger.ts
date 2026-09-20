// The ledger, server-side.
//
// A balance is never stored. Every figure is folded from the founder's own
// transactions and payout requests, which means the wallet cannot silently
// drift away from the records that made it. The client is sent the result; it
// never computes one.
//
// Folded per currency, deliberately. The previous business-scoped version
// summed every row into one number regardless of currency, which would happily
// add ¥1000 to $10.00 and report 2000 of nothing.
import { db } from "./db";

// The vocabulary, stated once, because every figure below depends on it:
//
//   earned     GROSS. Everything customers successfully paid, including
//              payments that were later refunded.
//   refunded   Total sent back out to customers.
//   fees       What the processor charged to handle those payments.
//   net        What the founder keeps: earned - refunded - fees.
//   available  What the founder can request today. Not the same as net: it
//              excludes money still settling, money already committed to a
//              payout, and money already paid out.
//
// earned being gross is what makes subtracting `refunded` correct. If a
// refunded payment were instead dropped from `earned`, subtracting it again
// would remove the same money twice and understate net by the refund.
export type CurrencyFold = {
  currency: string;
  /**
   * GROSS: every payment that succeeded, whether or not it was later refunded.
   * Refunds are subtracted separately, via `refunded`.
   */
  earned: number;
  /** Total sent back out to customers. Subtracted from `earned`, never netted into it. */
  refunded: number;
  /**
   * Stripe's processing fees, as Stripe reported them, on every captured
   * payment including refunded ones. Stripe does not return its fee when a
   * charge is refunded, so that fee is a real cost the founder carried and
   * dropping it would overstate what they kept.
   *
   * Never estimated from a published rate: see the webhook.
   */
  fees: number;
  /**
   * How many captured payments are still missing a fee, because Stripe had not
   * settled their balance transaction when the webhook arrived. Above zero, the
   * fee total is a floor rather than a final figure, and the UI must say so
   * instead of presenting an incomplete number as complete.
   */
  feesPending: number;
  /** earned - refunded - fees. What the founder actually keeps. */
  net: number;
  /** Paid but not yet cleared by the provider. Not in `earned` until it settles. */
  pending: number;
  /** Requested or approved, not yet sent. Committed, so it cannot be spent twice. */
  reserved: number;
  /** Actually sent to the bank. */
  paidOut: number;
  /** earned - refunded - reserved - paidOut. The only figure a payout may draw on. */
  available: number;
};

export type Wallet = {
  founderId: string;
  currencies: CurrencyFold[];
  asOf: string;
};

const sum = <T,>(rows: T[], f: (row: T) => number) =>
  rows.reduce((total, row) => total + (f(row) || 0), 0);

export async function foldWallet(founderId: string): Promise<Wallet> {
  const [transactions, payouts] = await Promise.all([
    db.founderTransaction.findMany({ where: { founderId } }),
    db.founderPayoutRequest.findMany({ where: { founderId } }),
  ]);

  const codes = [
    ...new Set([...transactions.map((t) => t.currency), ...payouts.map((p) => p.currency)]),
  ].sort();

  const currencies = codes.map((currency) => {
    const tx = transactions.filter((t) => t.currency === currency);
    const po = payouts.filter((p) => p.currency === currency);

    // A refund moves a row from COMPLETED to REFUNDED, so "captured" is both
    // statuses: the money did arrive, and a refund is a separate movement back
    // out rather than the original payment being undone.
    //
    // This is what makes `earned` gross. Counting COMPLETED alone would drop a
    // refunded payment from `earned` and then subtract it again via `refunded`,
    // removing the same money twice.
    const captured = tx.filter((t) => t.status === "COMPLETED" || t.status === "REFUNDED");

    const earned = sum(captured, (t) => t.amountMinor);
    const refunded = sum(tx, (t) => (t.status === "REFUNDED" ? t.amountMinor : 0));
    const pending = sum(tx, (t) => (t.status === "PENDING" ? t.amountMinor : 0));

    // Fees are read from the rows, not derived from a percentage. Counted over
    // everything captured, refunded included: Stripe keeps its processing fee on
    // a refunded charge, so it is a cost the founder actually carried.
    //
    // A captured payment with a null fee is counted separately so the UI can say
    // the total is incomplete rather than quietly understating what Stripe took.
    const fees = sum(captured, (t) => t.feeMinor ?? 0);
    const feesPending = captured.filter((t) => t.feeMinor == null).length;
    const net = earned - refunded - fees;

    // FAILED payouts are excluded on purpose: the money never left, so it is
    // still available rather than spent.
    const reserved = sum(po, (p) =>
      p.status === "REQUESTED" || p.status === "APPROVED" ? p.amountMinor : 0,
    );
    const paidOut = sum(po, (p) => (p.status === "SENT" ? p.amountMinor : 0));

    const available = earned - refunded - reserved - paidOut;

    return {
      currency,
      earned,
      refunded,
      fees,
      feesPending,
      net,
      pending,
      reserved,
      paidOut,
      // available is derived from earned rather than net, because Stripe deducts
      // its fee before the money reaches the connected account's balance: the
      // fee never sits in a balance Veyro could pay out. net is what the founder
      // keeps, which is a different question from what is withdrawable today.
      available,
    };
  });

  return { founderId, currencies, asOf: new Date().toISOString() };
}

/** One currency's fold, or a zeroed one if the founder has nothing in it yet. */
export function walletFor(wallet: Wallet, currency: string): CurrencyFold {
  return (
    wallet.currencies.find((c) => c.currency === currency) ?? {
      currency,
      earned: 0,
      refunded: 0,
      fees: 0,
      feesPending: 0,
      net: 0,
      pending: 0,
      reserved: 0,
      paidOut: 0,
      available: 0,
    }
  );
}

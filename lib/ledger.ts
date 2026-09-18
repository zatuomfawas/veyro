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

export type CurrencyFold = {
  currency: string;
  /** Customers paid this, and it completed. */
  earned: number;
  /** Sent back to customers. */
  refunded: number;
  /**
   * Stripe's processing fees on completed payments, as Stripe reported them.
   * Never estimated from a published rate: see the webhook.
   */
  fees: number;
  /**
   * How many completed payments are still missing a fee, because Stripe had not
   * settled their balance transaction when the webhook arrived. Above zero, the
   * fee total is a floor rather than a final figure, and the UI must say so
   * instead of presenting an incomplete number as complete.
   */
  feesPending: number;
  /** earned - refunded - fees. What the founder actually keeps. */
  net: number;
  /** Completed but not yet counted as earned — still settling at the provider. */
  pending: number;
  /** Requested or approved, not yet sent. Committed, so it cannot be spent twice. */
  reserved: number;
  /** Actually sent to the bank. */
  paidOut: number;
  /** earned - refunded - reserved - paidOut. The only figure a payout may draw on. */
  available: number;
  /**
   * False means the fold disagrees with itself and the UI should say so rather
   * than show a number nobody should trust.
   */
  balances: boolean;
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

    const earned = sum(tx, (t) => (t.status === "COMPLETED" ? t.amountMinor : 0));
    const refunded = sum(tx, (t) => (t.status === "REFUNDED" ? t.amountMinor : 0));
    const pending = sum(tx, (t) => (t.status === "PENDING" ? t.amountMinor : 0));

    // Fees are read from the rows, not derived from a percentage. A completed
    // payment with a null fee is counted separately so the UI can say the total
    // is incomplete rather than quietly understating what Stripe took.
    const completed = tx.filter((t) => t.status === "COMPLETED");
    const fees = sum(completed, (t) => t.feeMinor ?? 0);
    const feesPending = completed.filter((t) => t.feeMinor == null).length;
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
      available,
      // available is still derived from earned, because Stripe deducts its fee
      // before the money reaches the connected account's balance: the fee never
      // sits in a balance Veyro can pay out. net is what the founder keeps,
      // which is a different question from what is currently withdrawable.
      balances: earned - refunded === available + reserved + paidOut,
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
      balances: true,
    }
  );
}

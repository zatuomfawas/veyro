// The ledger, server-side and unchanged from the prototype.
//
// A balance is never stored. Every figure is folded from the entry list, which
// means the wallet cannot silently drift away from the transactions that made
// it. The client is sent the result; it never computes one.
import { db } from "./db";

const OPEN_PAYOUTS = ["AWAITING_APPROVAL", "IN_TRANSIT"] as const;

export async function foldWallet(businessId: string) {
  const [entries, payouts] = await Promise.all([
    db.ledgerEntry.findMany({ where: { businessId } }),
    db.payout.findMany({ where: { businessId } }),
  ]);

  const sum = (f: (e: (typeof entries)[number]) => number) =>
    entries.reduce((a, e) => a + (f(e) || 0), 0);

  const revenue     = sum((e) => (e.kind === "CHARGE" ? e.grossMinor : 0));
  const fees        = sum((e) => (e.kind === "CHARGE" ? e.feeMinor : 0));
  const refunds     = -sum((e) => (e.kind === "REFUND" ? e.netMinor : 0));
  const disputeLoss = -sum((e) => (e.kind === "DISPUTE_LOSS" ? e.netMinor : 0));

  const settledNet = sum((e) => (e.bucket === "AVAILABLE" ? e.netMinor : 0));
  const pending    = sum((e) => (e.bucket === "PENDING" ? e.netMinor : 0));
  const held       = sum((e) => (e.bucket === "HELD" ? e.netMinor : 0));

  const reserved = payouts.filter((p) => (OPEN_PAYOUTS as readonly string[]).includes(p.status))
    .reduce((a, p) => a + p.amountMinor, 0);
  const paidOut  = payouts.filter((p) => p.status === "PAID")
    .reduce((a, p) => a + p.amountMinor, 0);

  const available   = settledNet - reserved - paidOut;
  const netEarnings = revenue - fees - refunds - disputeLoss;

  return {
    revenue, fees, refunds, disputeLoss, pending, held, reserved, paidOut, available, netEarnings,
    // If this is ever false the ledger has a bug, and the UI says so rather than
    // showing a number nobody should trust.
    balances: netEarnings === available + pending + held + reserved + paidOut,
    asOf: new Date().toISOString(),
  };
}

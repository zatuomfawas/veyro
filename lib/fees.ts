// The platform fee: deciding it, recording it, and refusing to take it early.
//
// Everything here runs against ONE row -- the account's MonthlyLedger for the
// UTC month the payment falls in -- and that row is locked while a fee is
// decided. The alternative, recomputing from the transaction table on every
// charge, is both slower and racy: two checkouts that complete in the same
// second would each read "nothing earned yet" and each decide the payment is
// under the free limit, and the founder would be undercharged by exactly the
// amount the threshold was meant to catch.
//
// Three rules from the Terms, encoded rather than described:
//
//   incremental   a payment owes due(QME including it) minus what the month
//                 has already collected
//   ratcheted     a refund lowers QME for later payments and never returns a
//                 fee already taken, so the next payment can owe nothing
//   prospective   no fee exists before the Terms do. Two independent locks,
//                 and the date one cannot be overridden by the flag.
import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { feeMinor, feeOnPaymentMinor, qmeMonthKey, mayCollectFee } from "@/lib/pricing";

export { qmeMonthKey, mayCollectFee };

/** A transaction client, so callers can join an outer transaction. */
type Tx = Prisma.TransactionClient;

/**
 * Read a month's ledger row for update, creating it if this is the month's
 * first payment.
 *
 * The SELECT ... FOR UPDATE is the whole point: Postgres holds the row until
 * the surrounding transaction commits, so a second concurrent charge blocks
 * here rather than reading a stale total. Prisma has no first-class row lock,
 * hence the raw statement.
 */
async function lockMonth(tx: Tx, founderId: string, month: string) {
  await tx.monthlyLedger.upsert({
    where: { founderId_month: { founderId, month } },
    create: { founderId, month },
    update: {},
  });
  const rows = await tx.$queryRaw<
    { id: string; qmeMinor: number; feeCollectedMinor: number; feeReservedMinor: number }[]
  >`SELECT id, "qmeMinor", "feeCollectedMinor", "feeReservedMinor"
      FROM "MonthlyLedger"
     WHERE "founderId" = ${founderId} AND "month" = ${month}
     FOR UPDATE`;
  const row = rows[0];
  if (!row) throw new Error(`MonthlyLedger missing after upsert: ${founderId} ${month}`);
  return row;
}

export type FeeDecision = {
  month: string;
  /** QME after this payment, USD minor units. */
  qmeAfterMinor: number;
  /** What this payment carries. Zero when under the limit, or when the ratchet applies. */
  feeMinor: number;
  /** What the month had already incurred before this payment. */
  alreadyCollectedMinor: number;
  /** False when the fee was computed but not taken, because collection is off. */
  collected: boolean;
};

/**
 * Decide and record the fee for a payment that has just succeeded.
 *
 * Call inside the webhook's transaction, after the payment row is written.
 * Always records QME. Only records a fee when collection is lawfully on --
 * with it off, the figure is still computed and returned so the dashboard can
 * show what the fee *would* be, which is how we verify the engine on real
 * traffic before charging anybody.
 */
export async function applyFeeForPayment(
  tx: Tx,
  args: {
    founderId: string;
    /** USD minor units for this payment, after conversion. */
    usdAmountMinor: number;
    /** Stripe's timestamp for the successful payment, in seconds. */
    stripeCreatedUnixSeconds: number;
    now?: number;
  },
): Promise<FeeDecision> {
  const month = qmeMonthKey(args.stripeCreatedUnixSeconds);
  const row = await lockMonth(tx, args.founderId, month);

  const qmeAfterMinor = row.qmeMinor + args.usdAmountMinor;
  const fee = feeOnPaymentMinor(qmeAfterMinor, row.feeCollectedMinor);
  const collect = mayCollectFee(args.now ?? Date.now());

  await tx.monthlyLedger.update({
    where: { founderId_month: { founderId: args.founderId, month } },
    data: {
      qmeMinor: qmeAfterMinor,
      ...(collect ? { feeCollectedMinor: { increment: fee } } : {}),
    },
  });

  return {
    month,
    qmeAfterMinor,
    feeMinor: fee,
    alreadyCollectedMinor: row.feeCollectedMinor,
    collected: collect && fee > 0,
  };
}

/**
 * Lower QME after money goes back out, without touching what has been
 * collected.
 *
 * Used for both refunds and lost disputes. The asymmetry is deliberate and is
 * the Terms: QME falls so later payments may owe nothing, and no credit is
 * issued for the fee already taken.
 */
export async function reduceQme(
  tx: Tx,
  args: { founderId: string; usdAmountMinor: number; stripeCreatedUnixSeconds: number },
): Promise<{ month: string; qmeMinor: number }> {
  const month = qmeMonthKey(args.stripeCreatedUnixSeconds);
  const row = await lockMonth(tx, args.founderId, month);
  // QME is a measure of earnings, and negative earnings are not a thing. A
  // refund larger than the month's recorded earnings means the original
  // payment was in an earlier month, which is correct and uninteresting here:
  // the floor keeps the figure honest either way.
  const next = Math.max(0, row.qmeMinor - args.usdAmountMinor);
  await tx.monthlyLedger.update({
    where: { founderId_month: { founderId: args.founderId, month } },
    data: { qmeMinor: next },
  });
  return { month, qmeMinor: next };
}

/** What a month's fee should be, given its QME and no refunds. For reconciliation. */
export const dueForQme = feeMinor;

/**
 * Is this account eligible for the enhanced services this month?
 *
 * Eligible if last month's QME passed the limit, or this month's already has.
 * One function, called by every feature -- an eligibility test that each
 * feature re-derives is an eligibility test that drifts.
 */
export async function isEligible(
  founderId: string,
  now: Date = new Date(),
): Promise<{ eligible: boolean; reason: "prior-month" | "this-month" | "below" }> {
  const month = qmeMonthKey(now.getTime() / 1000);
  const prev = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const prevMonth = qmeMonthKey(prev.getTime() / 1000);

  const rows = await db.monthlyLedger.findMany({
    where: { founderId, month: { in: [month, prevMonth] } },
    select: { month: true, qmeMinor: true },
  });
  const qme = (m: string) => rows.find((r) => r.month === m)?.qmeMinor ?? 0;

  if (qme(prevMonth) > FREE_LIMIT_MINOR) return { eligible: true, reason: "prior-month" };
  if (qme(month) > FREE_LIMIT_MINOR) return { eligible: true, reason: "this-month" };
  return { eligible: false, reason: "below" };
}

/** $100. Above this, and only above it, a month is chargeable. */
export const FREE_LIMIT_MINOR = 10000;

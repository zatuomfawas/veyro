// The Annual Earnings & Payout Summary: a year, assembled from the ledger.
//
// This is a record, not a return. Counsel's wording is deliberate -- it is an
// "informational annual transaction/payout record, not tax advice" -- and the
// footer says so verbatim, because the one thing a document like this must not
// do is look like something a teenager can hand to a tax authority and rely on.
//
// Everything here is derived from rows that already exist. Nothing is
// recomputed from Stripe, and no figure is estimated: if the ledger is wrong
// the summary is wrong in exactly the same way, which is the property that
// makes it reconcilable. The test asserts the totals equal the ledger's.
//
// Bank details are last four digits only. A document that gets emailed, saved
// and forwarded is a document that will end up somewhere it should not, so it
// carries the minimum that makes a payout identifiable and nothing more.
import { db } from "@/lib/db";
import { feeMinor } from "@/lib/pricing";

// Re-exported so callers have one import for the document, while the wording
// itself stays in a module a test can read without a database.
export { SUMMARY_DISCLAIMER, SUMMARY_TITLE } from "@/lib/summary-text";

export type MonthRow = {
  /** "YYYY-MM", UTC. */
  month: string;
  qmeMinor: number;
  veyroFeeMinor: number;
  /** qme - fee. What the year's record shows as kept, before Stripe's own fees. */
  netMinor: number;
};

export type PayoutRow = {
  date: string;
  amountMinor: number;
  currency: string;
  status: string;
};

export type AnnualSummary = {
  year: number;
  founderName: string;
  guardianName: string | null;
  currency: string;
  months: MonthRow[];
  totals: { qmeMinor: number; veyroFeeMinor: number; netMinor: number };
  payouts: PayoutRow[];
  payoutTotalMinor: number;
  /** Last four digits only, or null when no bank account is on file with us. */
  bankLast4: string | null;
  /** Months in which the account was eligible. Empty means no summary is owed. */
  eligibleMonths: string[];
};

const FREE_LIMIT_MINOR = 10000;

/** Every month of a year, in order, so a gap reads as a zero rather than a hole. */
function monthsOf(year: number): string[] {
  return Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, "0")}`);
}

export async function buildAnnualSummary(
  founderId: string,
  year: number,
): Promise<AnnualSummary | null> {
  const [founder, consent, ledgers, payouts] = await Promise.all([
    db.user.findUnique({ where: { id: founderId } }),
    db.guardianConsent.findUnique({
      where: { founderId },
      include: { guardian: { select: { name: true } } },
    }),
    db.monthlyLedger.findMany({
      where: { founderId, month: { startsWith: `${year}-` } },
    }),
    db.founderPayoutRequest.findMany({
      where: {
        founderId,
        createdAt: {
          gte: new Date(Date.UTC(year, 0, 1)),
          lt: new Date(Date.UTC(year + 1, 0, 1)),
        },
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);
  if (!founder) return null;

  const byMonth = new Map(ledgers.map((l) => [l.month, l]));
  const months: MonthRow[] = monthsOf(year).map((m) => {
    const row = byMonth.get(m);
    const qme = row?.qmeMinor ?? 0;
    // The fee shown is what was actually collected, not what the formula would
    // say today. A month where a refund landed after the fee was taken shows
    // the fee that was taken -- that is the record, and it is what the Terms
    // describe.
    const fee = row?.feeCollectedMinor ?? 0;
    return { month: m, qmeMinor: qme, veyroFeeMinor: fee, netMinor: qme - fee };
  });

  const totals = months.reduce(
    (a, m) => ({
      qmeMinor: a.qmeMinor + m.qmeMinor,
      veyroFeeMinor: a.veyroFeeMinor + m.veyroFeeMinor,
      netMinor: a.netMinor + m.netMinor,
    }),
    { qmeMinor: 0, veyroFeeMinor: 0, netMinor: 0 },
  );

  const eligibleMonths = months.filter((m) => m.qmeMinor > FREE_LIMIT_MINOR).map((m) => m.month);

  return {
    year,
    founderName: founder.name,
    guardianName: consent?.guardian?.name ?? null,
    currency: "USD",
    months,
    totals,
    payouts: payouts.map((p) => ({
      date: p.createdAt.toISOString().slice(0, 10),
      amountMinor: p.amountMinor,
      currency: p.currency,
      status: p.status,
    })),
    payoutTotalMinor: payouts.reduce((a, p) => a + p.amountMinor, 0),
    // Not stored by Veyro. The bank account lives with Stripe and we hold a
    // reference, never the number -- so this is null until a future version
    // reads the last four from the connected account at generation time.
    bankLast4: null,
    eligibleMonths,
  };
}

/** Whether a year is owed a summary at all. */
export function isYearEligible(s: AnnualSummary): boolean {
  return s.eligibleMonths.length > 0;
}

/** Re-derive the fee a month's QME implies. Used by the reconciliation test. */
export const dueForMonth = feeMinor;

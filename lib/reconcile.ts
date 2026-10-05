// Does what we charged match what we should have charged?
//
// The fee is computed once, inside a locked transaction, at the moment a
// payment succeeds. That is the right place for it and it is also the place
// with the least oversight: if the lock ever fails, if a webhook is lost, if a
// refund arrives out of order, the ledger drifts and nothing says so.
//
// So this re-derives the month from first principles and compares. Two rules,
// and the asymmetry between them is the Terms:
//
//   no refunds this month   collected must EQUAL due(QME)
//   refunds this month      collected must be AT LEAST due(QME), because a
//                           refund lowers QME without returning a fee
//
// It never charges anybody to fix a shortfall. A discrepancy is a thing a
// person looks at, not a thing a cron job silently corrects -- taking money
// to repair our own bug is how a rounding error becomes a scandal.
import { db } from "@/lib/db";
import { feeMinor } from "@/lib/pricing";

export type Discrepancy = {
  founderId: string;
  month: string;
  qmeMinor: number;
  feeCollectedMinor: number;
  expectedMinor: number;
  hadReductions: boolean;
  kind: "under" | "over";
};

export async function reconcileMonth(month: string): Promise<{
  checked: number;
  discrepancies: Discrepancy[];
}> {
  const rows = await db.monthlyLedger.findMany({ where: { month } });
  const out: Discrepancy[] = [];

  for (const row of rows) {
    const expected = feeMinor(row.qmeMinor);

    // Did money go back out this month? If so the ratchet applies and
    // collected is allowed to exceed what the final QME would imply.
    const [refunds, lost] = await Promise.all([
      db.founderTransaction.count({
        where: { founderId: row.founderId, refundedMinor: { gt: 0 } },
      }),
      db.founderDispute.count({ where: { founderId: row.founderId, state: "LOST" } }),
    ]);
    const hadReductions = refunds > 0 || lost > 0;

    const ok = hadReductions
      ? row.feeCollectedMinor >= expected
      : row.feeCollectedMinor === expected;

    if (!ok) {
      out.push({
        founderId: row.founderId,
        month,
        qmeMinor: row.qmeMinor,
        feeCollectedMinor: row.feeCollectedMinor,
        expectedMinor: expected,
        hadReductions,
        kind: row.feeCollectedMinor < expected ? "under" : "over",
      });
    }
  }

  return { checked: rows.length, discrepancies: out };
}

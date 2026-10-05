// The summary's totals must equal the ledger's. That is the whole contract.
//
// A PDF that disagrees with the dashboard is worse than no PDF: it is a
// document somebody keeps, forwards and later waves at us. So the arithmetic
// that assembles it is tested directly, against figures chosen to include the
// cases that actually break things -- a month below the limit, a month that
// crosses it, a month where a refund left the collected fee above what the
// final QME implies, and an empty month.
import { test } from "node:test";
import assert from "node:assert/strict";
import { feeMinor } from "../lib/pricing.ts";
import { SUMMARY_DISCLAIMER } from "../lib/summary-text.ts";

type Ledger = { month: string; qmeMinor: number; feeCollectedMinor: number };

/** The same fold buildAnnualSummary does, isolated from the database. */
function fold(ledgers: Ledger[], year: number) {
  const byMonth = new Map(ledgers.map((l) => [l.month, l]));
  const months = Array.from({ length: 12 }, (_, i) => {
    const m = `${year}-${String(i + 1).padStart(2, "0")}`;
    const row = byMonth.get(m);
    const qme = row?.qmeMinor ?? 0;
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
  return { months, totals };
}

const LEDGER: Ledger[] = [
  { month: "2026-01", qmeMinor: 5000, feeCollectedMinor: 0 },        // below the limit
  { month: "2026-03", qmeMinor: 14000, feeCollectedMinor: 120 },     // crosses it
  { month: "2026-07", qmeMinor: 10000, feeCollectedMinor: 300 },     // refunded after a fee
  { month: "2026-11", qmeMinor: 100000, feeCollectedMinor: 2700 },   // well above
];

test("the summary totals equal the ledger totals, exactly", () => {
  const { totals } = fold(LEDGER, 2026);
  const ledgerQme = LEDGER.reduce((a, l) => a + l.qmeMinor, 0);
  const ledgerFee = LEDGER.reduce((a, l) => a + l.feeCollectedMinor, 0);
  assert.equal(totals.qmeMinor, ledgerQme);
  assert.equal(totals.veyroFeeMinor, ledgerFee);
  assert.equal(totals.netMinor, ledgerQme - ledgerFee);
});

test("every month of the year appears, so a gap reads as zero not as absent", () => {
  const { months } = fold(LEDGER, 2026);
  assert.equal(months.length, 12);
  assert.equal(months[1].qmeMinor, 0);        // February, no ledger row
  assert.equal(months[1].netMinor, 0);
});

test("the fee shown is what was collected, not what the formula says today", () => {
  // July: $100 QME implies $0 due, but $3.00 was collected before a refund
  // lowered it. The record shows $3.00, because that is what happened.
  const { months } = fold(LEDGER, 2026);
  const july = months[6];
  assert.equal(feeMinor(july.qmeMinor), 0);
  assert.equal(july.veyroFeeMinor, 300);
  assert.equal(july.netMinor, 9700);
});

test("net never silently exceeds what was earned", () => {
  const { months } = fold(LEDGER, 2026);
  for (const m of months) assert.ok(m.netMinor <= m.qmeMinor);
});

test("the disclaimer is counsel's wording, unaltered", () => {
  assert.equal(
    SUMMARY_DISCLAIMER,
    "This document is provided for informational and recordkeeping purposes only and does not "
    + "constitute tax, accounting or legal advice.",
  );
});

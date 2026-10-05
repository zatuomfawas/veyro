// Read the generated PDF back and check the figures in it.
//
// The brief asks that the totals in the PDF reconcile exactly with the ledger,
// and the only way to know that is to open the document. Asserting on the
// numbers that went IN proves nothing about the ones that came out -- a column
// swapped in the renderer, a figure formatted from the wrong field, or a total
// that silently prints the subtotal would all pass that test and fail a
// founder.
//
// pdfkit writes text as hex strings inside TJ arrays, split wherever it
// kerns, so the extractor below decodes the hex and joins the pieces. Rendered
// uncompressed for this, which is what the compress option exists for.
import { test } from "node:test";
import assert from "node:assert/strict";
import { renderAnnualSummaryPdf } from "../lib/annual-summary-pdf.ts";

/** Every piece of show-text in the document, in order, as one string. */
function extractText(pdf: Buffer): string {
  const raw = pdf.toString("latin1");
  let out = "";
  for (const m of raw.matchAll(/<([0-9a-fA-F]+)>/g)) {
    const hex = m[1];
    if (hex.length % 2) continue;
    out += Buffer.from(hex, "hex").toString("latin1");
  }
  return out;
}

const LEDGER = [
  { month: "2026-01", qmeMinor: 5000, veyroFeeMinor: 0 },
  { month: "2026-03", qmeMinor: 14000, veyroFeeMinor: 120 },
  { month: "2026-07", qmeMinor: 10000, veyroFeeMinor: 300 },
  { month: "2026-11", qmeMinor: 100000, veyroFeeMinor: 2700 },
];

function summaryFixture() {
  const byMonth = new Map(LEDGER.map((l) => [l.month, l]));
  const months = Array.from({ length: 12 }, (_, i) => {
    const key = `2026-${String(i + 1).padStart(2, "0")}`;
    const row = byMonth.get(key);
    const qmeMinor = row?.qmeMinor ?? 0;
    const veyroFeeMinor = row?.veyroFeeMinor ?? 0;
    return { month: key, qmeMinor, veyroFeeMinor, netMinor: qmeMinor - veyroFeeMinor };
  });
  const totals = months.reduce(
    (a, m) => ({
      qmeMinor: a.qmeMinor + m.qmeMinor,
      veyroFeeMinor: a.veyroFeeMinor + m.veyroFeeMinor,
      netMinor: a.netMinor + m.netMinor,
    }),
    { qmeMinor: 0, veyroFeeMinor: 0, netMinor: 0 },
  );
  return {
    year: 2026, founderName: "Sam Taylor", guardianName: "Alex Taylor", currency: "USD",
    months, totals,
    payouts: [{ date: "2026-03-14", amountMinor: 12000, currency: "USD", status: "SENT" }],
    payoutTotalMinor: 12000, bankLast4: null, eligibleMonths: ["2026-03", "2026-11"],
  };
}

test("the PDF is a PDF", async () => {
  const pdf = await renderAnnualSummaryPdf(summaryFixture() as never);
  assert.equal(pdf.subarray(0, 5).toString(), "%PDF-");
  assert.ok(pdf.length > 1000, "suspiciously small document");
});

test("the totals printed in the PDF equal the ledger totals", async () => {
  const s = summaryFixture();
  const pdf = await renderAnnualSummaryPdf(s as never, { compress: false });
  const text = extractText(pdf);

  // $1,290.00 earned, $31.20 in fees, $1,258.80 net -- summed from the ledger
  // above, not hard-coded, so changing a fixture row changes the expectation.
  const money = (m: number) =>
    (m / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });

  assert.ok(text.includes(money(s.totals.qmeMinor)), `earned total missing: ${money(s.totals.qmeMinor)}`);
  assert.ok(text.includes(money(s.totals.veyroFeeMinor)), `fee total missing: ${money(s.totals.veyroFeeMinor)}`);
  assert.ok(text.includes(money(s.totals.netMinor)), `net total missing: ${money(s.totals.netMinor)}`);
  assert.equal(s.totals.netMinor, s.totals.qmeMinor - s.totals.veyroFeeMinor);
});

test("the document names itself, the founder and the guardian", async () => {
  const pdf = await renderAnnualSummaryPdf(summaryFixture() as never, { compress: false });
  const text = extractText(pdf);
  assert.ok(text.includes("Annual Earnings"), "title missing");
  assert.ok(text.includes("Payout Summary"), "title missing");
  assert.ok(text.includes("Sam Taylor"), "founder missing");
  assert.ok(text.includes("Alex Taylor"), "guardian missing");
});

test("counsel's disclaimer is in the document, unaltered", async () => {
  const pdf = await renderAnnualSummaryPdf(summaryFixture() as never, { compress: false });
  const text = extractText(pdf);
  assert.ok(
    text.includes("informational and recordkeeping purposes only"),
    "the disclaimer is not in the rendered document",
  );
  assert.ok(text.includes("does not constitute tax, accounting or legal advice"));
});

test("a payout appears with its amount", async () => {
  const pdf = await renderAnnualSummaryPdf(summaryFixture() as never, { compress: false });
  const text = extractText(pdf);
  assert.ok(text.includes("2026-03-14"), "payout date missing");
  assert.ok(text.includes("$120.00"), "payout amount missing");
});

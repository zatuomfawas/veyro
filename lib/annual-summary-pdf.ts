// The summary, rendered to a PDF a person can keep.
//
// pdfkit rather than a headless browser: this runs in a serverless function
// where launching Chromium to lay out one table would be slow, fragile and
// enormous. The built-in Helvetica is used deliberately -- no font files to
// bundle, no glyph that renders as a box because a weight was missing.
//
// Money is formatted at the very edge, here, and nowhere earlier. Every figure
// arrives as integer minor units and is divided exactly once, immediately
// before it becomes ink.
import PDFDocument from "pdfkit";
import type { AnnualSummary } from "@/lib/annual-summary";
import { SUMMARY_DISCLAIMER, SUMMARY_TITLE } from "./summary-text.ts";

const money = (minor: number) =>
  (minor / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });

const MONTH_NAME = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function renderAnnualSummaryPdf(
  s: AnnualSummary,
  /**
   * Turn off stream compression.
   *
   * Only used by the test that reads the document back. A compressed PDF is
   * the right thing to send and the wrong thing to assert against: the text
   * ends up split across kerning operators inside a deflate stream, and a
   * check that cannot read the output is a check that passes whatever the
   * output says. Uncompressed, the figures are plainly there to be found.
   */
  opts: { compress?: boolean } = {},
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 56, compress: opts.compress !== false });
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const left = doc.page.margins.left;
    const right = doc.page.width - doc.page.margins.right;
    const width = right - left;

    // ---- heading ----
    doc.font("Helvetica-Bold").fontSize(18).fillColor("#111315")
       .text(SUMMARY_TITLE, { width });
    doc.moveDown(0.3);
    doc.font("Helvetica").fontSize(11).fillColor("#55595e")
       .text(`${s.year} · ${s.founderName}`, { width });
    if (s.guardianName) {
      doc.text(`Guardian on the account: ${s.guardianName}`, { width });
    }
    doc.moveDown(1.2);

    // ---- monthly table ----
    const cols = [left, left + width * 0.34, left + width * 0.58, left + width * 0.79];
    const headerY = doc.y;
    doc.font("Helvetica-Bold").fontSize(9).fillColor("#55595e");
    doc.text("Month", cols[0], headerY);
    doc.text("Earned", cols[1], headerY, { width: width * 0.22, align: "right" });
    doc.text("Veyro fee", cols[2], headerY, { width: width * 0.19, align: "right" });
    doc.text("Net", cols[3], headerY, { width: width * 0.21, align: "right" });
    doc.moveTo(left, doc.y + 12).lineTo(right, doc.y + 12).strokeColor("#e3e3e0").stroke();
    doc.moveDown(1.1);

    doc.font("Helvetica").fontSize(10).fillColor("#111315");
    for (const m of s.months) {
      const y = doc.y;
      const idx = Number(m.month.slice(5, 7)) - 1;
      doc.text(MONTH_NAME[idx] ?? m.month, cols[0], y);
      doc.text(money(m.qmeMinor), cols[1], y, { width: width * 0.22, align: "right" });
      doc.text(money(m.veyroFeeMinor), cols[2], y, { width: width * 0.19, align: "right" });
      doc.text(money(m.netMinor), cols[3], y, { width: width * 0.21, align: "right" });
      doc.moveDown(0.55);
    }

    doc.moveTo(left, doc.y + 4).lineTo(right, doc.y + 4).strokeColor("#111315").stroke();
    doc.moveDown(0.9);
    const ty = doc.y;
    doc.font("Helvetica-Bold").fontSize(10);
    doc.text("Total", cols[0], ty);
    doc.text(money(s.totals.qmeMinor), cols[1], ty, { width: width * 0.22, align: "right" });
    doc.text(money(s.totals.veyroFeeMinor), cols[2], ty, { width: width * 0.19, align: "right" });
    doc.text(money(s.totals.netMinor), cols[3], ty, { width: width * 0.21, align: "right" });
    doc.moveDown(2);

    // ---- payouts ----
    doc.font("Helvetica-Bold").fontSize(12).fillColor("#111315")
       .text("Payouts", left, doc.y, { width });
    doc.moveDown(0.5);
    doc.font("Helvetica").fontSize(10);
    if (!s.payouts.length) {
      doc.fillColor("#55595e").text("No payouts were requested in this year.", { width });
    } else {
      for (const p of s.payouts) {
        const y = doc.y;
        doc.fillColor("#111315").text(p.date, cols[0], y);
        doc.text(money(p.amountMinor), cols[1], y, { width: width * 0.22, align: "right" });
        doc.fillColor("#55595e").text(p.status.toLowerCase(), cols[2], y, { width: width * 0.4 });
        doc.moveDown(0.5);
      }
      doc.moveDown(0.3);
      doc.font("Helvetica-Bold").fillColor("#111315")
         .text(`Total paid out: ${money(s.payoutTotalMinor)}`, left, doc.y, { width });
    }

    doc.moveDown(0.8);
    doc.font("Helvetica").fontSize(9).fillColor("#55595e")
       .text(
         s.bankLast4
           ? `Paid to the bank account ending ${s.bankLast4}.`
           : "Payouts go to the bank account registered on the Stripe account. Veyro does not "
             + "hold the account number.",
         left, doc.y, { width },
       );

    // ---- the footer counsel wrote ----
    doc.moveDown(2);
    doc.moveTo(left, doc.y).lineTo(right, doc.y).strokeColor("#e3e3e0").stroke();
    doc.moveDown(0.7);
    doc.font("Helvetica").fontSize(8.5).fillColor("#55595e")
       .text(SUMMARY_DISCLAIMER, left, doc.y, { width });

    doc.end();
  });
}

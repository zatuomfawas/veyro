// The January send: last year's summary, to everyone who earned one.
//
// Runs on 5 January rather than 1 January. The brief's reason is the right
// one: a payment made on 31 December can have its balance transaction settle
// days later, and a summary mailed before the webhooks land is a summary that
// disagrees with the dashboard forever afterwards. Four days is cheap
// insurance against a document nobody can correct.
//
// Idempotent on the audit trail: an account that already has a send recorded
// for that year is skipped, so a retried cron does not mail twice.
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { buildAnnualSummary, isYearEligible } from "@/lib/annual-summary";
import { renderAnnualSummaryPdf } from "@/lib/annual-summary-pdf";
import { sendAnnualSummary } from "@/lib/email";
import { audit } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

function authorised(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: Request) {
  if (!authorised(req)) {
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  }

  const now = new Date();
  // Only ever the prior year. Explicit rather than inferred from the date, so
  // a manual run in March does the same thing as the scheduled one.
  const year = Number(new URL(req.url).searchParams.get("year")) || now.getUTCFullYear() - 1;

  // Anyone with a ledger row in that year is a candidate; eligibility is
  // decided per account by the summary itself.
  const candidates = await db.monthlyLedger.findMany({
    where: { month: { startsWith: `${year}-` } },
    select: { founderId: true },
    distinct: ["founderId"],
  });

  let sent = 0, skipped = 0, ineligible = 0;
  for (const { founderId } of candidates) {
    const already = await db.auditEvent.findFirst({
      where: { founderId, action: "annual_summary.sent", target: String(year) },
    });
    if (already) { skipped++; continue; }

    const summary = await buildAnnualSummary(founderId, year);
    if (!summary || !isYearEligible(summary)) { ineligible++; continue; }

    const [founder, consent] = await Promise.all([
      db.user.findUnique({ where: { id: founderId } }),
      db.guardianConsent.findUnique({
        where: { founderId }, include: { guardian: { select: { email: true } } },
      }),
    ]);
    if (!founder) continue;

    const pdf = await renderAnnualSummaryPdf(summary);
    await sendAnnualSummary(founder.email, year, pdf);
    if (consent?.guardian?.email) {
      await sendAnnualSummary(consent.guardian.email, year, pdf);
    }
    await audit(null, "annual_summary.sent", String(year), founderId, {
      year, recipients: consent?.guardian?.email ? 2 : 1,
    });
    sent++;
  }

  return NextResponse.json({ year, candidates: candidates.length, sent, skipped, ineligible });
}

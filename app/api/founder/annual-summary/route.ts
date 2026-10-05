// Generate the Annual Earnings & Payout Summary on demand.
//
// Founder-scoped: the same resolveScope the rest of the founder API uses, so a
// guardian viewing the account gets it too and nobody else does. A year with no
// eligible month returns 404 rather than an empty document -- the Terms make
// this a paid-tier service, and handing out a blank one to an account that
// never qualified would quietly turn it into a free one.
import { NextResponse } from "next/server";
import { buildAnnualSummary, isYearEligible } from "@/lib/annual-summary";
import { renderAnnualSummaryPdf } from "@/lib/annual-summary-pdf";
import { resolveScope, isResponse } from "../_scope";
import { audit } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const founderIdParam = url.searchParams.get("founderId") ?? undefined;
  const yearParam = Number(url.searchParams.get("year"));

  const scope = await resolveScope(founderIdParam);
  if (isResponse(scope)) return scope;

  const year = Number.isInteger(yearParam) ? yearParam : new Date().getUTCFullYear() - 1;
  if (year < 2024 || year > new Date().getUTCFullYear()) {
    return NextResponse.json({ error: "That year is not available." }, { status: 400 });
  }

  const summary = await buildAnnualSummary(scope.founderId, year);
  if (!summary) return NextResponse.json({ error: "Account not found." }, { status: 404 });
  if (!isYearEligible(summary)) {
    return NextResponse.json(
      { error: `No month in ${year} was above $100, so there is no summary for that year.` },
      { status: 404 },
    );
  }

  const pdf = await renderAnnualSummaryPdf(summary);
  await audit(null, "annual_summary.generated", String(year), scope.founderId, {
    year, qmeMinor: summary.totals.qmeMinor, feeMinor: summary.totals.veyroFeeMinor,
  });

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition":
        `attachment; filename="veyro-annual-summary-${year}.pdf"`,
      "cache-control": "private, no-store",
    },
  });
}

// Nightly: check the ledger against itself and record what it finds.
//
// Protected by CRON_SECRET rather than left open. A reconciliation endpoint
// reads every account's earnings, which is not something a URL should hand to
// whoever guesses it.
//
// It reports and never repairs. See lib/reconcile.ts for why.
import { NextResponse } from "next/server";
import { reconcileMonth } from "@/lib/reconcile";
import { currentMonthKey } from "@/lib/fees";
import { audit } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorised(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  // With no secret configured, refuse rather than run open. A job that quietly
  // becomes public the day somebody forgets an env var is worse than one that
  // visibly stops.
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: Request) {
  if (!authorised(req)) {
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  }

  const month = currentMonthKey();
  const result = await reconcileMonth(month);

  if (result.discrepancies.length) {
    // One audit row per discrepancy, so each is individually findable rather
    // than buried in a summary blob.
    for (const d of result.discrepancies) {
      await audit(null, "fees.reconcile_discrepancy", `${d.founderId}:${d.month}`, d.founderId, {
        qmeMinor: d.qmeMinor,
        feeCollectedMinor: d.feeCollectedMinor,
        expectedMinor: d.expectedMinor,
        hadReductions: d.hadReductions,
        kind: d.kind,
      });
    }
  }

  return NextResponse.json({
    month,
    checked: result.checked,
    discrepancies: result.discrepancies.length,
    detail: result.discrepancies,
  });
}

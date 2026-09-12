// On-demand reconciliation of a business's Stripe Connect account. Call this
// when PaymentAccount looks stale — e.g. an account.updated webhook was missed
// because no listener was running. It re-reads the live account, re-derives
// status, and re-checks that the verified individual is the guardian. It never
// creates anything.
//
// Open to the founder and to the accepted guardian: both need to see where
// onboarding stands.
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { db } from "@/lib/db";
import { assertStripeConfigured } from "@/lib/stripe";
import { currentUser, canViewBusiness, audit } from "@/lib/auth";
import { syncAccountFromStripe } from "@/lib/stripe-account";

export const runtime = "nodejs";

export async function POST(_req: Request, { params }: { params: Promise<{ businessId: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  try {
    assertStripeConfigured();
  } catch {
    return NextResponse.json({ error: "Payments are not configured on this server." }, { status: 500 });
  }

  const { businessId } = await params;
  if (!(await canViewBusiness(user.id, businessId))) {
    return NextResponse.json({ error: "You don't have access to this business." }, { status: 403 });
  }

  const account = await db.paymentAccount.findUnique({ where: { businessId } });
  if (!account?.providerAccountId) {
    return NextResponse.json({
      error: "Payment setup hasn't started for this business yet.",
      accountStatus: account?.status ?? "NOT_STARTED",
    }, { status: 409 });
  }

  let result;
  try {
    result = await syncAccountFromStripe(account.providerAccountId);
  } catch (err) {
    const e = err as Stripe.errors.StripeError;
    await audit(user.id, "stripe.account.resync_failed", account.id, businessId, {
      message: e.message, code: e.code ?? null,
    });
    return NextResponse.json({ error: `Stripe could not be reached: ${e.message}` }, { status: 502 });
  }

  if (!result) {
    return NextResponse.json({ error: "No payment account to sync." }, { status: 409 });
  }

  await audit(
    user.id,
    result.changed ? "stripe.account.resynced_changed" : "stripe.account.resynced",
    account.id,
    businessId,
    { from: result.from, to: result.to, mismatch: result.mismatch },
  );

  return NextResponse.json({
    ok: true,
    accountStatus: result.to,
    previousStatus: result.from,
    changed: result.changed,
    // What the user must do, in plain English. `requirementsDue` keeps the raw
    // Stripe codes for debugging.
    requirements: result.requirements,
    pendingVerification: result.pendingVerification,
    requirementsDue: result.requirementsDue,
    disabledReason: result.disabledReason,
    individualMismatch: result.mismatch,
  });
}

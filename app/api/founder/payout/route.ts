// The founder asks for money to be sent to the bank account on the Stripe
// account.
//
// Founder-only: a guardian oversees and is told, but does not request money on
// someone else's behalf. The amount is checked against the folded wallet, not
// against anything the client sends, so a request can never exceed what is
// actually available in that currency.
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { audit } from "@/lib/auth";
import { foldWallet, walletFor } from "@/lib/ledger";
import { resolveScope, isResponse, readJson, cap } from "../_scope";
import { sendPayoutNotification } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await readJson(req);
  if (body instanceof NextResponse) return body;

  const scope = await resolveScope(body.founderId);
  if (isResponse(scope)) return scope;
  if (scope.asGuardian) {
    return NextResponse.json(
      { error: "Only the founder can request a payout." },
      { status: 403 },
    );
  }

  const amountMinor = Number(body.amountMinor);
  const currency = (cap(body.currency, 3) || "USD").toUpperCase();

  const errors: Record<string, string> = {};
  if (!Number.isInteger(amountMinor) || amountMinor <= 0) {
    errors.amountMinor = "Enter a whole number of minor units, above zero.";
  }
  if (!/^[A-Z]{3}$/.test(currency)) errors.currency = "Currency must be a three-letter code.";
  if (Object.keys(errors).length) return NextResponse.json({ errors }, { status: 400 });

  // The account has to be live before money can leave it.
  const account = await db.founderPaymentAccount.findUnique({
    where: { founderId: scope.founderId },
  });
  if (!account || account.status !== "ACTIVE") {
    return NextResponse.json(
      {
        error: "Payment setup isn't finished yet, so there is nowhere to send money.",
        accountStatus: account?.status ?? "NOT_STARTED",
      },
      { status: 409 },
    );
  }

  const wallet = await foldWallet(scope.founderId);
  const fold = walletFor(wallet, currency);

  if (!fold.balances) {
    // The fold disagrees with itself. Refuse rather than move money on a figure
    // nobody should trust.
    await audit(scope.user.id, "payout.blocked_unbalanced", scope.founderId, scope.founderId, {
      currency, available: fold.available,
    });
    return NextResponse.json(
      { error: "We can't reconcile your balance right now, so we won't move money. This is on us." },
      { status: 409 },
    );
  }

  if (amountMinor > fold.available) {
    return NextResponse.json(
      {
        errors: { amountMinor: "That is more than you have available." },
        availableMinor: fold.available,
        currency,
      },
      { status: 400 },
    );
  }

  const payout = await db.founderPayoutRequest.create({
    data: { founderId: scope.founderId, amountMinor, currency, status: "REQUESTED" },
  });

  await audit(scope.user.id, "payout.requested", payout.id, scope.founderId, {
    amountMinor, currency,
  });

  // The guardian is told, every time. On a Standard account they cannot stop a
  // payout — they get visibility and a permanent record, which is what Veyro
  // can honestly promise.
  const consent = await db.guardianConsent.findUnique({ where: { founderId: scope.founderId } });
  if (consent?.guardianId) {
    await db.notification.create({
      data: {
        userId: consent.guardianId,
        title: `${scope.user.name} requested a payout`,
        body:
          `${(amountMinor / 100).toFixed(2)} ${currency} has been requested. This is a notice, `
          + "not a request to approve — on this account type payouts run on Stripe's schedule.",
        routeName: "founder.payouts",
        routeId: scope.founderId,
      },
    });
    await audit(null, "guardian.payout_notified", payout.id, scope.founderId, { amountMinor, currency });

    // The in-app notification above is the record; this is the nudge. Both are
    // non-fatal, because the payout request itself has already been written.
    const guardian = await db.user.findUnique({ where: { id: consent.guardianId } });
    if (guardian) {
      await sendPayoutNotification(
        guardian.email, scope.user.name, amountMinor, currency, scope.founderId,
      );
    }
  }

  return NextResponse.json({ ok: true, payout, availableMinor: fold.available - amountMinor });
}

export async function GET(req: Request) {
  const scope = await resolveScope(new URL(req.url).searchParams.get("founderId"));
  if (isResponse(scope)) return scope;

  const payouts = await db.founderPayoutRequest.findMany({
    where: { founderId: scope.founderId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ ok: true, payouts });
}

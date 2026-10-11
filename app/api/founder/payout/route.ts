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
import { readPayoutSchedule, describeSchedule } from "@/lib/payout-schedule";
import { formatMinor } from "@/lib/money";

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

  // The guardian is told, every time. Veyro gives them visibility and a
  // permanent record; the account controls are Stripe's and belong to them as
  // the account holder, which is a different and larger thing. The older
  // wording here said they "cannot stop a payout", which was wrong -- they
  // own the connected account and can set payouts to manual, change the
  // schedule or close it, none of which passes through us.
  const consent = await db.guardianConsent.findUnique({ where: { founderId: scope.founderId } });
  if (consent?.guardianId) {
    await db.notification.create({
      data: {
        userId: consent.guardianId,
        title: `${scope.user.name} requested a payout`,
        body:
          `${formatMinor(amountMinor, currency)} has been requested. Veyro records the `
          + "request and tells you; the payout settings on the account are yours, in Stripe.",
        routeName: "founder.payouts",
        routeId: scope.founderId,
      },
    });
    await audit(null, "guardian.payout_notified", payout.id, scope.founderId, { amountMinor, currency });

    // The in-app notification above is the record; this is the nudge. Both are
    // non-fatal, because the payout request itself has already been written.
    const guardian = await db.user.findUnique({ where: { id: consent.guardianId } });
    if (guardian) {
      // What the email is allowed to say about scheduling depends entirely on
      // what Stripe is actually configured to do, so it is read here rather
      // than assumed. A null means the account could not be read just now,
      // and the email then says nothing about the schedule -- the one thing
      // it must never do is tell the account holder to go and schedule a
      // payout that is already running automatically.
      const sched = account.providerAccountId
        ? await readPayoutSchedule(account.providerAccountId)
        : null;

      await sendPayoutNotification(
        guardian.email,
        {
          founderName: scope.user.name,
          guardianName: guardian.name,
          amountMinor,
          currency,
          payouts: sched
            ? { interval: sched.interval, description: describeSchedule(sched),
                payoutsEnabled: sched.payoutsEnabled }
            : null,
        },
        scope.founderId,
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

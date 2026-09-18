// The guardian opens the founder's Stripe account and gets the onboarding link
// for their own signed-in session.
//
// Guardian-only, deliberately. The founder may be a minor; the guardian is the
// adult who must be the account login and the verified individual. So the
// account is created against the guardian's email, the link is only ever
// returned into a guardian session, and a founder calling this gets a 403.
// lib/stripe-account.ts then checks the person Stripe actually verified and
// holds the account at RESTRICTED on any mismatch.
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { db } from "@/lib/db";
import { stripe, assertStripeConfigured } from "@/lib/stripe";
import { currentUser, isGuardianOf, audit } from "@/lib/auth";
import { createFounderStripeAccount, syncAccountFromStripe } from "@/lib/stripe-account";
import { readJson, cap } from "../_scope";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  try {
    assertStripeConfigured();
  } catch {
    return NextResponse.json({ error: "Payments are not configured on this server." }, { status: 500 });
  }

  const body = await readJson(req);
  if (body instanceof NextResponse) return body;
  const founderId = cap(body.founderId, 40) || null;

  if (!founderId) {
    return NextResponse.json(
      { error: "Name the founder you are setting up payments for." },
      { status: 400 },
    );
  }

  if (!(await isGuardianOf(user.id, founderId))) {
    // Distinguish "you are the founder" from "no consent yet", without leaking
    // whether the founder exists to anyone unrelated.
    if (user.id === founderId) {
      await audit(user.id, "stripe.connect.blocked_founder", founderId, founderId);
      return NextResponse.json(
        { error: "Payment setup is completed by your guardian, not by you." },
        { status: 403 },
      );
    }
    // The explanatory 409 goes ONLY to the person the invite was addressed to.
    //
    // It used to go to anyone signed in, which meant this route answered
    // "does this founder have a consented guardian?" for any founderId a caller
    // cared to try. Founder ids are not secret: every public checkout URL
    // contains one, so anyone sent a payment link could probe the seller's
    // setup state. The comment above claimed that did not happen; it did.
    const consent = await db.guardianConsent.findUnique({ where: { founderId } });
    const isInvitedGuardian =
      consent != null && consent.invitedEmail === user.email.toLowerCase();

    if (isInvitedGuardian && !consent.consentedAt) {
      return NextResponse.json(
        {
          error: "A guardian must consent before payment setup can start.",
          accountStatus: "AWAITING_GUARDIAN",
        },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: "You don't have access to this founder." }, { status: 403 });
  }

  let account;
  try {
    account = await createFounderStripeAccount(founderId, user.id);
  } catch (err) {
    const e = err as Stripe.errors.StripeError;
    await audit(user.id, "stripe.connect.account_create_failed", founderId, founderId, {
      message: e.message, code: e.code ?? null,
    });
    return NextResponse.json(
      { error: `Stripe could not create the account: ${e.message}` },
      { status: 502 },
    );
  }

  await audit(user.id, "stripe.connect.account_created", account.id, founderId, {
    stripeAccountId: account.providerAccountId, individualEmail: user.email,
  });

  // Reconcile before handing back a link, so the status returned is current
  // even if an account.updated webhook was missed. Best effort: a sync hiccup
  // must not block a working onboarding link.
  let status: string = account.status;
  try {
    const synced = await syncAccountFromStripe(founderId);
    if (synced) status = synced.to;
  } catch (err) {
    console.warn(`payment-setup: resync of ${founderId} failed:`, (err as Error).message);
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || new URL(req.url).origin;
  let accountLink: Stripe.AccountLink;
  try {
    accountLink = await stripe.accountLinks.create({
      account: account.providerAccountId!,
      // Both land on the guardian's dashboard, which already renders the right
      // next step: "Live" once Stripe enables the account, or the itemised
      // requirements with a "Continue on Stripe" button while it has not.
      //
      // These used to point at /g/founder/<id>/payments, a route from the
      // prototype that has never existed in this app, so a guardian who
      // finished Stripe's form was dropped on a 404. refresh_url mattered just
      // as much: Stripe sends them there when the account link expires before
      // they complete it, which is common, and that 404'd too.
      refresh_url: `${origin}/dashboard/guardian?setup=refresh`,
      return_url: `${origin}/dashboard/guardian?setup=done`,
      type: "account_onboarding",
    });
  } catch (err) {
    const e = err as Stripe.errors.StripeError;
    await audit(user.id, "stripe.connect.onboarding_link_failed", account.id, founderId, {
      message: e.message, code: e.code ?? null,
    });
    return NextResponse.json(
      { error: `Stripe could not create the onboarding link: ${e.message}` },
      { status: 502 },
    );
  }

  await audit(user.id, "stripe.connect.onboarding_link_created", account.id, founderId);

  return NextResponse.json({ ok: true, onboardingUrl: accountLink.url, accountStatus: status });
}

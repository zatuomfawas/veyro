// The guardian opens the Stripe Connect account for a business and gets the
// hosted onboarding link for their own signed-in session.
//
// The guardian — not the founder, who may be a minor — must be the account
// login and the verified individual. So:
//   - the account is created with the guardian's session email;
//   - this endpoint is refused to the founder (and to anyone who is not the
//     accepted guardian on the relationship);
//   - the link is only ever returned into a guardian session, never emailed as
//     a raw URL and never handed to the founder.
// A later reconciliation (lib/stripe-account.ts) checks the person Stripe
// actually verified and holds the account at RESTRICTED on any mismatch.
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { db } from "@/lib/db";
import { stripe, assertStripeConfigured } from "@/lib/stripe";
import { currentUser, canActOnBusiness, guardianRelationshipFor, audit } from "@/lib/auth";
import { syncAccountFromStripe } from "@/lib/stripe-account";

export const runtime = "nodejs";

export async function POST(req: Request, { params }: { params: Promise<{ businessId: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  try {
    assertStripeConfigured();
  } catch {
    return NextResponse.json({ error: "Payments are not configured on this server." }, { status: 500 });
  }

  const { businessId } = await params;

  const relationship = await guardianRelationshipFor(user.id, businessId);
  if (!relationship || !relationship.guardianId) {
    // Give a useful reason without leaking whether the business exists.
    if (await canActOnBusiness(user.id, businessId)) {
      await audit(user.id, "stripe.connect.blocked_founder", businessId, businessId);
      return NextResponse.json(
        { error: "Payment setup is completed by the guardian, not the founder." },
        { status: 403 },
      );
    }
    const rel = await db.guardianRelationship.findUnique({ where: { businessId } });
    if (!rel || rel.status !== "ACCEPTED") {
      return NextResponse.json(
        { error: "A guardian must accept the invite before payment setup can start.", accountStatus: "AWAITING_GUARDIAN" },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: "You don't have access to this business." }, { status: 403 });
  }

  const business = await db.business.findUnique({ where: { id: businessId } });
  if (!business) return NextResponse.json({ error: "Business not found." }, { status: 404 });

  let account = await db.paymentAccount.findUnique({ where: { businessId } });

  // Create the Stripe account once, with the GUARDIAN's email, so the login and
  // the verified individual are the guardian. The idempotency-key token ("g2")
  // pins the current shape (Standard, guardian as individual). Bump it if the
  // accounts.create body below changes, or after a test account created with
  // the current token is deleted — Stripe caches keys ~24h and would otherwise
  // replay the dead account.
  if (!account?.providerAccountId) {
    let stripeAccount: Stripe.Account;
    try {
      stripeAccount = await stripe.accounts.create(
        {
          type: "standard",
          country: business.countryCode.trim(),
          email: user.email, // the guardian's own session email
          business_type: "individual",
          business_profile: {
            name: business.name,
            product_description: business.description,
            url: business.url ?? undefined,
          },
          metadata: { veyroBusinessId: businessId, veyroGuardianUserId: user.id },
        },
        { idempotencyKey: `veyro-connect-acct-g2-${businessId}` },
      );
    } catch (err) {
      const e = err as Stripe.errors.StripeError;
      await audit(user.id, "stripe.connect.account_create_failed", businessId, businessId, {
        message: e.message, code: e.code ?? null,
      });
      return NextResponse.json({ error: `Stripe could not create the account: ${e.message}` }, { status: 502 });
    }

    account = await db.paymentAccount.upsert({
      where: { businessId },
      create: {
        businessId,
        provider: "STRIPE_CONNECT",
        providerAccountId: stripeAccount.id,
        status: "PENDING",
        representativeUserId: relationship.guardianId,
      },
      update: {
        provider: "STRIPE_CONNECT",
        providerAccountId: stripeAccount.id,
        status: account?.status === "ACTIVE" ? "ACTIVE" : "PENDING",
        representativeUserId: relationship.guardianId,
      },
    });

    await audit(user.id, "stripe.connect.account_created", account.id, businessId, {
      stripeAccountId: stripeAccount.id, individualEmail: user.email,
    });
  } else {
    // Account already exists — reconcile against Stripe before returning a link
    // so the status we hand back is current. Best effort: a sync hiccup must not
    // block a working onboarding link.
    try {
      const synced = await syncAccountFromStripe(account.providerAccountId);
      if (synced) {
        account = { ...account, status: synced.to };
        if (synced.changed) {
          await audit(user.id, "stripe.account.resynced_changed", account.id, businessId, {
            from: synced.from, to: synced.to,
          });
        }
      }
    } catch (err) {
      console.warn(`payments/connect: resync of ${account.providerAccountId} failed:`, (err as Error).message);
    }
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || new URL(req.url).origin;
  let accountLink: Stripe.AccountLink;
  try {
    accountLink = await stripe.accountLinks.create({
      account: account.providerAccountId!,
      refresh_url: `${origin}/g/business/${businessId}/payments?refresh=1`,
      return_url: `${origin}/g/business/${businessId}/payments?onboarded=1`,
      type: "account_onboarding",
    });
  } catch (err) {
    const e = err as Stripe.errors.StripeError;
    await audit(user.id, "stripe.connect.onboarding_link_failed", account.id, businessId, {
      message: e.message, code: e.code ?? null,
    });
    return NextResponse.json({ error: `Stripe could not create the onboarding link: ${e.message}` }, { status: 502 });
  }

  await audit(user.id, "stripe.connect.onboarding_link_created", account.id, businessId);

  return NextResponse.json({ ok: true, onboardingUrl: accountLink.url, accountStatus: account.status });
}

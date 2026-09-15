// Guardian consent: one row per founder, established once.
//
// POST { invitedName?, invitedEmail, relation? }  — the FOUNDER invites an adult.
//   Returns the raw single-use token once. Only its hash is stored, same
//   pattern as session tokens: if the database leaks, the tokens in it cannot
//   be used to consent as anyone.
//
// POST { token, decision: "accept" | "decline" }  — the INVITED ADULT responds
//   from their own signed-in session. The token proves which invite; the
//   session proves who is answering; the email must match both.
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { currentUser, audit } from "@/lib/auth";
import { consentState, hashInviteToken } from "@/lib/consent";
import { readJson, cap } from "../_scope";

export const runtime = "nodejs";

const INVITE_DAYS = 14;

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const body = await readJson(req);
  if (body instanceof NextResponse) return body;

  return typeof body.token === "string" && body.token
    ? respond(user, body)
    : invite(user, body);
}

/* ---------------- the founder invites an adult ---------------- */

async function invite(
  user: NonNullable<Awaited<ReturnType<typeof currentUser>>>,
  body: Record<string, unknown>,
) {
  const invitedEmail = cap(body.invitedEmail, 254).toLowerCase();
  const invitedName = cap(body.invitedName, 80);

  const errors: Record<string, string> = {};
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(invitedEmail)) {
    errors.invitedEmail = "Enter a working email address.";
  }
  if (invitedEmail === user.email.toLowerCase()) {
    errors.invitedEmail = "Invite an adult other than yourself.";
  }
  if (Object.keys(errors).length) return NextResponse.json({ errors }, { status: 400 });

  const existing = await db.guardianConsent.findUnique({ where: { founderId: user.id } });
  if (existing?.consentedAt) {
    return NextResponse.json(
      { error: "This founder already has a guardian who has consented." },
      { status: 409 },
    );
  }

  const rawToken = randomBytes(32).toString("base64url");
  const inviteExpiresAt = new Date(Date.now() + INVITE_DAYS * 864e5);

  // Re-inviting replaces the outstanding invite rather than stacking rows —
  // founderId is @unique, and one guardian per founder is the whole point.
  const consent = await db.guardianConsent.upsert({
    where: { founderId: user.id },
    create: {
      founderId: user.id,
      invitedEmail,
      tokenHash: hashInviteToken(rawToken),
      inviteExpiresAt,
    },
    update: {
      invitedEmail,
      tokenHash: hashInviteToken(rawToken),
      invitedAt: new Date(),
      inviteExpiresAt,
      guardianId: null,
      respondedAt: null,
      consentedAt: null,
    },
  });

  await audit(user.id, "guardian.invited", consent.id, user.id, { invitedEmail, invitedName });

  // rawToken goes into the invite email link; it is never stored anywhere.
  // Sending the actual email is not wired up yet — this is the value to send.
  return NextResponse.json({ ok: true, consentId: consent.id, inviteToken: rawToken });
}

/* ---------------- the invited adult responds ---------------- */

async function respond(
  user: NonNullable<Awaited<ReturnType<typeof currentUser>>>,
  body: Record<string, unknown>,
) {
  const token = String(body.token ?? "");
  const decision =
    body.decision === "accept" ? "accept" : body.decision === "decline" ? "decline" : null;
  if (!decision) {
    return NextResponse.json({ error: 'decision must be "accept" or "decline".' }, { status: 400 });
  }

  const consent = await db.guardianConsent.findUnique({ where: { tokenHash: hashInviteToken(token) } });
  if (!consent) return NextResponse.json({ error: "This invite link is invalid." }, { status: 404 });

  if (consent.respondedAt) {
    return NextResponse.json({ error: "This invite has already been answered." }, { status: 409 });
  }
  if (consent.inviteExpiresAt < new Date()) {
    return NextResponse.json(
      { error: "This invite has expired. Ask the founder to send a new one." },
      { status: 410 },
    );
  }
  if (consent.invitedEmail !== user.email.toLowerCase()) {
    // Deliberately generic: don't confirm which email the invite was sent to.
    return NextResponse.json(
      { error: "This invite isn't addressed to your signed-in account." },
      { status: 403 },
    );
  }

  const now = new Date();
  const updated = await db.guardianConsent.update({
    where: { id: consent.id },
    data: {
      respondedAt: now,
      // guardianId and consentedAt are set together or not at all: a declined
      // invite leaves no guardian of record.
      guardianId: decision === "accept" ? user.id : null,
      consentedAt: decision === "accept" ? now : null,
    },
  });

  await audit(
    user.id,
    decision === "accept" ? "guardian.consented" : "guardian.declined",
    consent.id,
    consent.founderId,
  );

  if (decision === "accept") {
    await db.notification.create({
      data: {
        userId: consent.founderId,
        title: `${user.name} is now your guardian`,
        body: "They can open the payment account for you. Nothing can take a payment until they do.",
        routeName: "founder.payments",
        routeId: consent.founderId,
      },
    });
  }

  return NextResponse.json({
    ok: true,
    consent: {
      id: updated.id,
      founderId: updated.founderId,
      consentedAt: updated.consentedAt,
      expiresAt: updated.expiresAt,
    },
  });
}

/* ---------------- current state ---------------- */

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const consent = await db.guardianConsent.findUnique({ where: { founderId: user.id } });
  if (!consent) return NextResponse.json({ ok: true, consent: null });

  // Derived in lib/consent.ts, which the founder dashboard reads too.
  const state = consentState(consent);

  return NextResponse.json({
    ok: true,
    consent: {
      id: consent.id,
      state,
      invitedEmail: consent.invitedEmail,
      invitedAt: consent.invitedAt,
      consentedAt: consent.consentedAt,
      expiresAt: consent.expiresAt,
    },
  });
}

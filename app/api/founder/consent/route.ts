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
import {
  sendInviteNotification, sendGuardianAcceptedNotification, sendNewLinkRequest,
} from "@/lib/email";
import { readJson, cap } from "../_scope";

export const runtime = "nodejs";

const INVITE_DAYS = 14;

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const body = await readJson(req);
  if (body instanceof NextResponse) return body;

  // "request_link" is the invited adult asking for a fresh invite because the
  // one they hold does not work. Checked first and independently of the token:
  // a link replaced by a newer invite carries no usable token, which is the
  // whole reason they are asking.
  if (body.decision === "request_link") return requestNewLink(user, body);

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
      // Sending a new invite is the answer to "please send a new link", so the
      // request is cleared here rather than left to nag about work now done.
      newLinkRequestedAt: null,
    },
  });

  await audit(user.id, "guardian.invited", consent.id, user.id, { invitedEmail, invitedName });

  // Non-fatal. The consent row exists either way, and the founder is still
  // given the raw token below so they can send the link by hand if mail is down
  // or the sending domain is not verified yet.
  await sendInviteNotification(user.name, invitedEmail, rawToken, user.id);

  // rawToken is returned once and never stored. It is what the link contains.
  return NextResponse.json({ ok: true, consentId: consent.id, inviteToken: rawToken });
}

/* ---------------- the invited adult asks for a fresh link ---------------- */

/** How long before the same person can nudge the founder again. */
const REQUEST_COOLDOWN_MS = 6 * 3600_000;

/**
 * An expired invite used to be a dead end: the page told the guardian to ask
 * the founder, and left them to do it by text. This turns that sentence into a
 * button, and tells the founder in the one place they will see it.
 *
 * Deliberately does NOT mint a new token. Only the founder can issue an invite;
 * letting the holder of a dead link mint a live one would make expiry
 * meaningless. This records the request and notifies the founder, who decides.
 */
async function requestNewLink(
  user: NonNullable<Awaited<ReturnType<typeof currentUser>>>,
  body: Record<string, unknown>,
) {
  // Found by token when the reader still holds a working one, and by founder
  // when their link was replaced by a newer invite and no longer matches
  // anything. The token cannot be the authority in that second case, because
  // the token is precisely what failed; the session is, in both.
  const token = typeof body.token === "string" ? body.token : "";
  const founderId = typeof body.founderId === "string" ? body.founderId : "";
  const include = { founder: { select: { id: true, name: true, email: true } } };

  const consent = token
    ? await db.guardianConsent.findUnique({ where: { tokenHash: hashInviteToken(token) }, include })
    : founderId
      ? await db.guardianConsent.findUnique({ where: { founderId }, include })
      : null;
  if (!consent) return NextResponse.json({ error: "This invite link is invalid." }, { status: 404 });

  if (consent.invitedEmail !== user.email.toLowerCase()) {
    // Same generic wording as respond(): never confirm who an invite was for.
    return NextResponse.json(
      { error: "This invite isn't addressed to your signed-in account." },
      { status: 403 },
    );
  }

  const state = consentState(consent);
  if (state === "consented") {
    return NextResponse.json({ error: "You have already accepted this invitation." }, { status: 409 });
  }
  // A pending invite means the CURRENT link works. That is only a reason to
  // refuse if this person is holding it: the lookup succeeded by token, so they
  // are. Someone who arrived with a replaced link has a pending invite they
  // cannot use, which is exactly when a new one is worth sending.
  if (state === "pending" && token) {
    return NextResponse.json(
      { error: "This invitation has not expired yet, so the link you have still works." },
      { status: 409 },
    );
  }

  // A refresh or a double-click must not nudge the founder twice. Reported as
  // success, because from the guardian's side the request genuinely is on file.
  const last = consent.newLinkRequestedAt;
  if (last && Date.now() - last.getTime() < REQUEST_COOLDOWN_MS) {
    return NextResponse.json({ ok: true, alreadyRequested: true, requestedAt: last });
  }

  const now = new Date();
  await db.guardianConsent.update({
    where: { id: consent.id },
    data: { newLinkRequestedAt: now },
  });

  // An in-app record as well as the email: the founder may read one and not the
  // other, and this is the thing blocking their whole account.
  await db.notification.create({
    data: {
      userId: consent.founderId,
      title: "Your guardian asked for a new invite link",
      body: `${consent.invitedEmail} opened the invitation but it had already expired. `
        + "Send a new one to carry on.",
      routeName: "founder.guardian",
      routeId: consent.founderId,
    },
  });

  await audit(user.id, "guardian.new_link_requested", consent.id, consent.founderId, {
    invitedEmail: consent.invitedEmail,
  });

  await sendNewLinkRequest(consent.founder.email, consent.invitedEmail, consent.founderId);

  return NextResponse.json({ ok: true, requestedAt: now });
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
    // Tell the founder their guardian said yes, so they are not left refreshing.
    const founder = await db.user.findUnique({ where: { id: consent.founderId } });
    if (founder) {
      await sendGuardianAcceptedNotification(founder.email, user.name, consent.founderId);
    }

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

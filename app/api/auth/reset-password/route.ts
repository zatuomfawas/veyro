// Complete a password reset.
//
// POST only, and that is load-bearing. The verification link on this site was
// once spent by an email scanner fetching it before the human clicked, because
// a GET performed the mutation. Any one-time link reachable from an inbox has
// to be inert until a person submits something, so the page at
// /auth/reset-password only renders a form and this route does the work.
//
// Completing a reset has three effects beyond setting the password, all of them
// deliberate:
//
//   Every session is revoked, not just the others. Whoever is resetting is not
//   signed in, and the whole point of a reset is often that somebody else is.
//   Leaving their session alive would make the reset cosmetic.
//
//   The token is cleared, so the link works exactly once.
//
//   The address is marked verified if it was not already. Holding a token sent
//   to that inbox is the same proof the verification link asks for, and leaving
//   someone verified-but-locked-out after they proved ownership would be a
//   second dead end behind the first.
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, audit } from "@/lib/auth";
import { hashResetToken } from "@/lib/password-reset";
import { sendPasswordChangedEmail } from "@/lib/email";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { readJson, cap } from "../../founder/_scope";

export const runtime = "nodejs";

const MIN_LENGTH = 10;

export async function POST(req: Request) {
  const body = await readJson(req);
  if (body instanceof NextResponse) return body;

  // The token is 32 random bytes, so guessing is not the threat this stops;
  // it stops someone grinding the endpoint with stolen candidate tokens.
  const gate = rateLimit(`reset-submit-ip:${clientIp(req)}`, 10, 5 * 60_000);
  if (!gate.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Try again in a few minutes." },
      { status: 429, headers: { "retry-after": String(gate.retryAfter) } },
    );
  }

  const token = cap(body.token, 400);
  const password = typeof body.password === "string" ? body.password : "";

  if (!token) {
    return NextResponse.json({ error: "This reset link is not valid." }, { status: 400 });
  }
  if (password.length < MIN_LENGTH) {
    return NextResponse.json(
      { errors: { password: `Use at least ${MIN_LENGTH} characters. A short sentence is fine.` } },
      { status: 400 },
    );
  }

  const user = await db.user.findUnique({
    where: { passwordResetTokenHash: hashResetToken(token) },
  });

  // One answer for "no such token" and "expired": the form offers a new link
  // either way, so distinguishing them helps nobody except someone probing.
  if (!user || !user.passwordResetExpiresAt || user.passwordResetExpiresAt < new Date()) {
    await audit(user?.id ?? null, "auth.reset_failed", user?.email ?? "unknown");
    return NextResponse.json(
      { error: "This reset link has expired or has already been used.", expired: true },
      { status: 410 },
    );
  }

  await db.$transaction([
    db.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await hashPassword(password),
        passwordResetTokenHash: null,
        passwordResetExpiresAt: null,
        emailVerifiedAt: user.emailVerifiedAt ?? new Date(),
      },
    }),
    // Every session, including any the attacker holds.
    db.session.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);

  await audit(user.id, "auth.reset_completed", user.email);

  // Non-fatal, like every other send: the password really did change, and
  // failing the request now would leave the user unsure whether it had.
  await sendPasswordChangedEmail(user.email);

  return NextResponse.json({ ok: true });
}

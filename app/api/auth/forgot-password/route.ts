// Ask for a password reset link.
//
// Unauthenticated by necessity: someone who cannot sign in is exactly who needs
// this. That makes it, like resend-verification, an endpoint that sends mail to
// an arbitrary address on demand, so it carries the same two guards.
//
//   Enumeration. The answer is identical whether or not the address has an
//   account, and whether or not that account can even use a password. Anything
//   else turns this into a way to test which addresses are registered, which
//   matters more than usual here because the account holders are minors.
//
//   Rate. Three per address per five minutes, plus a wider per-IP ceiling.
//   Without it, one request per second at someone else's address is a free
//   mail-bomb sent from our domain, and it burns our sending reputation.
//
// Issuing a reset deliberately does NOT sign anyone out or change anything. A
// request nobody asked for must be harmless on its own, or asking becomes an
// attack. Only completing a reset has effects.
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { audit } from "@/lib/auth";
import { newResetToken, RESET_TTL_MS } from "@/lib/password-reset";
import { sendPasswordResetEmail } from "@/lib/email";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { readJson, cap } from "../../founder/_scope";

export const runtime = "nodejs";

const LIMIT = 3;
const WINDOW_MS = 5 * 60_000;

/**
 * Minimum gap between two reset emails to one address, enforced in the
 * database so it survives however many instances are running.
 */
const RESEND_COOLDOWN_MS = 3 * 60_000;

/** The same answer in every case, so no branch can leak by differing. */
const SAME_ANSWER = {
  ok: true,
  message: "If that address has an account, a reset link is on its way.",
};

export async function POST(req: Request) {
  const body = await readJson(req);
  if (body instanceof NextResponse) return body;

  const email = cap(body.email, 254).toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json(
      { errors: { email: "Enter a working email address." } },
      { status: 400 },
    );
  }

  const gate = rateLimit(`forgot:${email}`, LIMIT, WINDOW_MS);
  const ipGate = rateLimit(`forgot-ip:${clientIp(req)}`, LIMIT * 3, WINDOW_MS);
  if (!gate.ok || !ipGate.ok) {
    const retryAfter = Math.max(gate.retryAfter, ipGate.retryAfter);
    return NextResponse.json(
      { error: "Too many requests. Try again in a few minutes." },
      { status: 429, headers: { "retry-after": String(retryAfter) } },
    );
  }

  const user = await db.user.findUnique({ where: { email } });

  if (!user) {
    await audit(null, "auth.reset_unknown_address", email);
    return NextResponse.json(SAME_ANSWER);
  }
  // An account with no password is SSO-only; there is nothing to reset, and
  // saying so would confirm the address exists.
  if (!user.passwordHash) {
    await audit(user.id, "auth.reset_no_password", email);
    return NextResponse.json(SAME_ANSWER);
  }

  // A cooldown that lives in the database rather than in one instance's memory.
  //
  // The in-memory limiter above is per instance, so a caller spread across
  // several can send more mail than its stated limit. This cannot be dodged
  // that way: the last issue time is derived from the stored expiry, which
  // every instance reads from the same row.
  //
  // It is invisible to an honest user. The link already sent is still valid for
  // the rest of its hour, so someone clicking "send it again" because the first
  // one was slow still has a working link in their inbox — and gets the same
  // answer either way.
  if (user.passwordResetExpiresAt) {
    const issuedAt = user.passwordResetExpiresAt.getTime() - RESET_TTL_MS;
    if (Date.now() - issuedAt < RESEND_COOLDOWN_MS) {
      await audit(user.id, "auth.reset_throttled", email);
      return NextResponse.json(SAME_ANSWER);
    }
  }

  // A new token replaces any outstanding one, so the previous link stops
  // working. Two live reset links for one account is two ways in.
  const { token, hash, expiresAt } = newResetToken();
  await db.user.update({
    where: { id: user.id },
    data: { passwordResetTokenHash: hash, passwordResetExpiresAt: expiresAt },
  });

  await audit(user.id, "auth.reset_requested", email);
  await sendPasswordResetEmail(email, token);

  return NextResponse.json(SAME_ANSWER);
}

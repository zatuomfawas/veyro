// Send another verification link.
//
// Unauthenticated on purpose: someone who cannot sign in because they are
// unverified is exactly who needs this, and requiring a session would lock them
// out permanently.
//
// That makes it an endpoint which sends mail to an arbitrary address on demand,
// so it has two guards:
//
//   Enumeration. The response is identical whether or not the address has an
//   account, whether or not it is already verified. Anything else turns this
//   into a way to test which addresses are registered, which matters more here
//   than usual because the users are minors.
//
//   Rate. Three per address per five minutes. Without it, one request per second
//   at someone else's address is a free mail-bomb sent from our domain, which
//   also burns our sending reputation.
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { audit } from "@/lib/auth";
import { newVerificationToken, VERIFICATION_TTL_MS } from "@/lib/verification";
import { sendVerificationEmail } from "@/lib/email";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { readJson, cap } from "../../founder/_scope";

export const runtime = "nodejs";

const LIMIT = 3;
const WINDOW_MS = 5 * 60_000;

/** Minimum gap between two verification emails to one address. */
const RESEND_COOLDOWN_MS = 3 * 60_000;

/** The same answer in every case. Defined once so no branch can drift from it. */
const SAME_ANSWER = {
  ok: true,
  message: "If that address has an unverified account, a new link is on its way.",
};

export async function POST(req: Request) {
  const body = await readJson(req);
  if (body instanceof NextResponse) return body;

  const email = cap(body.email, 254).toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ errors: { email: "Enter a working email address." } }, { status: 400 });
  }

  // Keyed on the address and the caller, so one person cannot exhaust someone
  // else's allowance, and one caller cannot cycle addresses freely.
  const gate = rateLimit(`resend-verify:${email}`, LIMIT, WINDOW_MS);
  const ipGate = rateLimit(`resend-verify-ip:${clientIp(req)}`, LIMIT * 3, WINDOW_MS);
  if (!gate.ok || !ipGate.ok) {
    const retryAfter = Math.max(gate.retryAfter, ipGate.retryAfter);
    return NextResponse.json(
      { error: "Too many requests. Try again in a few minutes." },
      { status: 429, headers: { "retry-after": String(retryAfter) } },
    );
  }

  const user = await db.user.findUnique({ where: { email } });

  // Both of these return the same body as the success path below.
  if (!user) {
    await audit(null, "auth.resend_unknown_address", email);
    return NextResponse.json(SAME_ANSWER);
  }
  if (user.emailVerifiedAt) {
    await audit(user.id, "auth.resend_already_verified", email);
    return NextResponse.json(SAME_ANSWER);
  }

  // A database-backed cooldown, for the same reason as forgot-password: the
  // in-memory limiter above is per instance, and this endpoint sends mail to an
  // address supplied by the caller. Derived from the stored expiry, so every
  // instance reads the same answer.
  //
  // Invisible to an honest user, because the link already sent stays valid for
  // the rest of its 24 hours.
  if (user.emailVerificationExpiresAt) {
    const issuedAt = user.emailVerificationExpiresAt.getTime() - VERIFICATION_TTL_MS;
    if (Date.now() - issuedAt < RESEND_COOLDOWN_MS) {
      await audit(user.id, "auth.resend_throttled", email);
      return NextResponse.json(SAME_ANSWER);
    }
  }

  // A new token replaces the old one, so the previous link stops working.
  const verification = newVerificationToken();
  await db.user.update({
    where: { id: user.id },
    data: {
      emailVerificationTokenHash: verification.hash,
      emailVerificationExpiresAt: verification.expiresAt,
    },
  });

  await sendVerificationEmail(email, verification.token);
  await audit(user.id, "auth.verification_resent", email);

  return NextResponse.json(SAME_ANSWER);
}

// Real authentication. Three rules this file exists to enforce:
//   1. A password is never stored, only an argon2id hash of it.
//   2. A session token is never stored either, only a hash. If the database
//      leaks, the tokens in it cannot be used to sign in as anyone.
//   3. Authorisation is checked on the server, per resource, every request.
//      Hiding a screen in the client is a usability affordance, not security.
import { hash, verify } from "@node-rs/argon2";
import { randomBytes, createHash } from "crypto";
import { cookies } from "next/headers";
import { db } from "./db";

const SESSION_COOKIE = "veyro_session";
const SESSION_DAYS = 30;

// Tuned for interactive login. Raise memoryCost if your host can afford it.
const ARGON = { memoryCost: 19456, timeCost: 2, outputLen: 32, parallelism: 1 };

export const hashPassword = (plain: string) => hash(plain, ARGON);
export const checkPassword = (stored: string, plain: string) =>
  verify(stored, plain, ARGON).catch(() => false);

const sha256 = (v: string) => createHash("sha256").update(v).digest("hex");

/** Issues a session. The raw token goes to the browser; only its hash is stored. */
export async function createSession(userId: string) {
  const raw = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 864e5);
  await db.session.create({ data: { userId, tokenHash: sha256(raw), expiresAt } });

  (await cookies()).set(SESSION_COOKIE, raw, {
    httpOnly: true,                                   // JavaScript cannot read it
    secure: process.env.NODE_ENV === "production",    // HTTPS only in production
    sameSite: "lax",                                  // blocks most CSRF
    path: "/",
    expires: expiresAt,
  });
  return raw;
}

/**
 * Revoke every session for this user except the one making the request.
 *
 * Called when a password changes. The point of changing a password is usually
 * that someone else may have had it; leaving their existing sessions alive
 * would make the change cosmetic, since a stolen session cookie keeps working
 * on its own. The current session is spared so the person doing it is not
 * signed out mid-flow.
 */
export async function revokeOtherSessions(userId: string) {
  const raw = (await cookies()).get(SESSION_COOKIE)?.value;
  const { count } = await db.session.updateMany({
    where: {
      userId,
      revokedAt: null,
      ...(raw ? { NOT: { tokenHash: sha256(raw) } } : {}),
    },
    data: { revokedAt: new Date() },
  });
  return count;
}

/** The signed-in user, or null. Never trust anything the client says about identity. */
export async function currentUser() {
  const raw = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!raw) return null;

  const session = await db.session.findUnique({
    where: { tokenHash: sha256(raw) },
    include: { user: true },
  });
  if (!session || session.revokedAt || session.expiresAt < new Date()) return null;
  if (session.user.deletedAt) return null;
  return session.user;
}

export async function endSession() {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  if (raw) {
    await db.session.updateMany({
      where: { tokenHash: sha256(raw) },
      data: { revokedAt: new Date() },
    });
  }
  jar.delete(SESSION_COOKIE);
}

/* ---------------- Authorisation ----------------
   Every one of these asks the database, not the request. A client can claim
   anything; only these answers count.

   Scope is the founder. A guardian reaches a founder's data only through a
   GuardianConsent that has actually been consented to and has not expired. */

/** Consent that is accepted and still in force. Null expiresAt means no expiry. */
function activeConsentWhere(founderId: string, guardianId: string) {
  return {
    founderId,
    guardianId,
    consentedAt: { not: null },
    OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
  };
}

/**
 * Every founder this guardian may act for.
 *
 * The same clause isGuardianOf() asks about one founder, minus the founderId —
 * so the guardian dashboard lists exactly the founders the authorization check
 * would let them touch. Writing the query a second time by hand is how a
 * dashboard ends up showing a founder whose consent has since expired.
 */
export function guardianScopeWhere(guardianId: string) {
  return {
    guardianId,
    consentedAt: { not: null },
    OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
  };
}

/** The founder themselves, or the guardian who has consented for them. */
export async function canActOnFounder(userId: string, founderId: string) {
  if (userId === founderId) {
    const self = await db.user.findUnique({ where: { id: founderId } });
    return !!self && !self.deletedAt;
  }
  return isGuardianOf(userId, founderId);
}

/** The guardian of record for this founder, and nobody else. */
export async function isGuardianOf(userId: string, founderId: string) {
  const consent = await db.guardianConsent.findFirst({
    where: activeConsentWhere(founderId, userId),
  });
  return !!consent;
}

/** Append-only. There is deliberately no update or delete path. */
export function audit(actorId: string | null, action: string, target: string,
                      founderId?: string, metadata: object = {}) {
  return db.auditEvent.create({
    data: { actorId, action, target, founderId, metadata: metadata as never },
  });
}

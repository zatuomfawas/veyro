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
   anything; only these answers count. */

/** A founder may act on a business only if they own it. */
export async function canActOnBusiness(userId: string, businessId: string) {
  const b = await db.business.findUnique({ where: { id: businessId } });
  return !!b && b.founderId === userId && !b.archivedAt;
}

/** A guardian may read a business only through an accepted relationship. */
export async function canViewBusiness(userId: string, businessId: string) {
  if (await canActOnBusiness(userId, businessId)) return true;
  const rel = await db.guardianRelationship.findUnique({ where: { businessId } });
  return !!rel && rel.guardianId === userId && rel.status === "ACCEPTED";
}

/** Only the guardian approves. A founder approving their own payout would make
    the consent record worthless, which is the one thing this product sells. */
export async function canApprove(userId: string, businessId: string) {
  const rel = await db.guardianRelationship.findUnique({ where: { businessId } });
  return !!rel && rel.guardianId === userId && rel.status === "ACCEPTED";
}

/** The ACCEPTED guardian relationship in which `userId` is the guardian of
    `businessId`, or null. Use this where an action is the guardian's alone —
    opening the Stripe account, where the guardian must be the verified adult,
    not the (possibly minor) founder. */
export async function guardianRelationshipFor(userId: string, businessId: string) {
  const rel = await db.guardianRelationship.findUnique({ where: { businessId } });
  if (!rel || rel.status !== "ACCEPTED" || rel.guardianId !== userId) return null;
  return rel;
}

/** Append-only. There is deliberately no update or delete path. */
export function audit(actorId: string | null, action: string, target: string,
                      businessId?: string, metadata: object = {}) {
  return db.auditEvent.create({
    data: { actorId, action, target, businessId, metadata: metadata as never },
  });
}

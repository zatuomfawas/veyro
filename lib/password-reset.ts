import { randomBytes, createHash } from "crypto";

// Password reset tokens.
//
// Same shape as lib/verification.ts, kept separate on purpose: these two
// tokens do very different things and must not share a TTL by accident. A
// verification link proves an address. A reset link opens the account.
//
// Only the SHA-256 is stored, so a database leak yields nothing usable.

/**
 * One hour.
 *
 * Deliberately far shorter than the 24 hours a verification link gets. This
 * token is a way into the account, so every extra hour it stays valid is an
 * hour a forwarded, logged, or screenshotted email is a working key. An hour
 * is long enough to read your mail and type a password.
 */
export const RESET_TTL_MS = 60 * 60 * 1000;

export const hashResetToken = (raw: string) =>
  createHash("sha256").update(raw).digest("hex");

/**
 * A fresh token and everything needed to store it.
 * The caller writes `hash` and `expiresAt`, and emails `token`.
 *
 * 32 bytes rather than the 16 used for verification: this one is worth
 * guessing, so the search space should be the expensive kind.
 */
export function newResetToken() {
  const token = randomBytes(32).toString("base64url");
  return {
    token,
    hash: hashResetToken(token),
    expiresAt: new Date(Date.now() + RESET_TTL_MS),
  };
}

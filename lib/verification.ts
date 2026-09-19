import { randomBytes, createHash } from "crypto";

// Verification tokens, generated and hashed in one place.
//
// Same pattern as session and invite tokens: the plaintext exists only long
// enough to go into an email, and only its SHA-256 is stored. A database leak
// therefore yields nothing that can be used to verify as anyone.

/** 24 hours. Long enough to find the email, short enough to matter. */
export const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;

export const hashVerificationToken = (raw: string) =>
  createHash("sha256").update(raw).digest("hex");

/**
 * A fresh token and everything needed to store it.
 * The caller writes `hash` and `expiresAt`, and emails `token`.
 */
export function newVerificationToken() {
  const token = randomBytes(16).toString("hex"); // 32 hex characters
  return {
    token,
    hash: hashVerificationToken(token),
    expiresAt: new Date(Date.now() + VERIFICATION_TTL_MS),
  };
}

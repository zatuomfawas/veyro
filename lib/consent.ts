// What a GuardianConsent row currently means.
//
// GuardianConsent has no status column on purpose — three timestamps encode the
// state, and a column would be a fourth source of truth that could contradict
// them. The cost is that "what state is this in" has to be derived, and derived
// the same way everywhere. This is that one way.
//
// Shared by GET /api/founder/consent and the founder dashboard, which reads the
// row directly rather than calling the route. Two hand-written copies of this
// ladder would eventually disagree about, say, whether an invite accepted
// before its window closed is still consented.
import type { GuardianConsent } from "@/generated/prisma/client";

export type ConsentState =
  /** No invite has ever been sent. */
  | "none"
  /** Invited, still within the window, no answer yet. */
  | "pending"
  /** Answered, and the answer was no. */
  | "declined"
  /** Never answered, and the window has closed. */
  | "expired"
  /** Answered yes. The only state that lets payment setup begin. */
  | "consented";

/** The columns this derivation actually reads. */
export type ConsentTimestamps = Pick<
  GuardianConsent,
  "consentedAt" | "respondedAt" | "inviteExpiresAt"
>;

/**
 * Order matters. consentedAt is checked first because it is the only state that
 * grants anything, and respondedAt is set alongside it — testing respondedAt
 * first would report every consented invite as "declined".
 *
 * Expiry is checked last, and only for an unanswered invite: an invite that was
 * accepted before its window closed stays accepted. The window governs how long
 * the token may be used, not how long the answer lasts.
 */
export function consentState(
  consent: ConsentTimestamps | null | undefined,
  now: Date = new Date(),
): ConsentState {
  if (!consent) return "none";
  if (consent.consentedAt) return "consented";
  if (consent.respondedAt) return "declined";
  return consent.inviteExpiresAt < now ? "expired" : "pending";
}

/** True when this founder may have a payment account opened for them. */
export function isConsented(consent: ConsentTimestamps | null | undefined): boolean {
  return consentState(consent) === "consented";
}

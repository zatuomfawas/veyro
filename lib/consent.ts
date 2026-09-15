// What a GuardianConsent row currently means.
//
// GuardianConsent has no status column on purpose — three timestamps encode the
// state, and a column would be a fourth source of truth that could contradict
// them. The cost is that "what state is this in" has to be derived, and derived
// the same way everywhere. This is that one way.
//
// Extracted from GET /api/founder/consent so the API and the dashboard cannot
// drift apart: the dashboard reads the row directly rather than calling the
// route, and two hand-written copies of this ladder would eventually disagree
// about, say, whether an expired invite is still "pending".
import type { GuardianConsent } from "@/generated/prisma/client";

export type ConsentState =
  /** Invited, still within the window, no answer yet. */
  | "pending"
  /** Answered, and the answer was no. */
  | "declined"
  /** Never answered, and the window has closed. */
  | "expired"
  /** Answered yes. The only state that lets payment setup begin. */
  | "consented";

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
  consent: Pick<GuardianConsent, "consentedAt" | "respondedAt" | "inviteExpiresAt">,
  now: Date = new Date(),
): ConsentState {
  if (consent.consentedAt) return "consented";
  if (consent.respondedAt) return "declined";
  return consent.inviteExpiresAt < now ? "expired" : "pending";
}

/** True when this founder may have a payment account opened for them. */
export function isConsented(
  consent: Pick<GuardianConsent, "consentedAt" | "respondedAt" | "inviteExpiresAt"> | null,
): boolean {
  return consent != null && consentState(consent) === "consented";
}

// Chargebacks: mirroring them, and telling the two people who need to know.
//
// WHAT THIS DELIBERATELY DOES NOT DO: submit evidence. We are on Standard
// connected accounts, where the account holder has their own Stripe Dashboard
// and is the party Stripe expects to respond. The platform cannot submit
// evidence on their behalf through the API, so a "respond here" form inside
// Veyro would be a button that cannot do what it says.
//
// What a founder actually loses today is not the ability to respond -- it is
// knowing there is anything to respond to. Stripe mails the account holder,
// which on these accounts is the guardian, and a teenager can lose a dispute
// by default because a deadline passed in somebody else's inbox. So this
// notifies both, with the amount, the reason and the deadline, and links
// straight into the dispute. That is what the Terms promise and all we can
// honestly build.
import type { Prisma } from "@/generated/prisma/client";
import type { DisputeState } from "@/generated/prisma/enums";

type Tx = Prisma.TransactionClient;

/** Stripe's dispute status vocabulary, mapped to ours. */
export function mapDisputeState(status: string): DisputeState {
  switch (status) {
    case "needs_response":
    case "warning_needs_response":
      return "NEEDS_RESPONSE";
    case "under_review":
    case "warning_under_review":
      return "UNDER_REVIEW";
    case "won":
      return "WON";
    case "lost":
      return "LOST";
    case "warning_closed":
      return "WARNING_CLOSED";
    default:
      return "OTHER";
  }
}

/** Where the account holder actually responds. Their dashboard, not ours. */
export function disputeUrl(stripeDisputeId: string): string {
  return `https://dashboard.stripe.com/disputes/${stripeDisputeId}`;
}

/**
 * Plain-English reason text, and what evidence tends to matter.
 *
 * The guidance half is the enhanced service; the reason text is shown to
 * everybody, because "fraudulent" on its own tells a fifteen-year-old nothing.
 * Every entry ends at what evidence is relevant -- never at what will win.
 */
export const DISPUTE_GUIDANCE: Record<string, { label: string; evidence: readonly string[] }> = {
  fraudulent: {
    label: "The cardholder says they did not authorise this payment.",
    evidence: ["Proof the customer received what they bought", "Any account or login records tying the purchase to them", "Your refund policy as they saw it"],
  },
  product_not_received: {
    label: "The customer says what they bought never arrived.",
    evidence: ["Proof of delivery or of access being granted", "The date and method you delivered by", "Any messages where they acknowledged receiving it"],
  },
  duplicate: {
    label: "The customer says they were charged twice for one thing.",
    evidence: ["Records of both payments showing they were for different things", "Any refund already issued for the duplicate"],
  },
  product_unacceptable: {
    label: "The customer says what they got was not as described.",
    evidence: ["What you advertised, as they saw it", "Proof of what you actually delivered", "Your refund policy and any support exchange"],
  },
  subscription_canceled: {
    label: "The customer says they cancelled before this charge.",
    evidence: ["Your cancellation policy", "The cancellation date in your records", "Proof the service was still available to them"],
  },
  credit_not_processed: {
    label: "The customer says a refund you promised never arrived.",
    evidence: ["The refund record, if one was issued", "Your refund policy", "Any message explaining why a refund was declined"],
  },
};

/** The one sentence that must appear wherever dispute guidance does. */
export const DISPUTE_DISCLAIMER =
  "Veyro provides guidance and administrative support. The outcome is decided by the card "
  + "network and issuer. Veyro does not guarantee any dispute will be won.";

/** Shown above every evidence list. Templates must not become invitations. */
export const EVIDENCE_HONESTY = "Only submit evidence that is true and accurate.";

export function guidanceFor(reason: string) {
  return DISPUTE_GUIDANCE[reason] ?? {
    label: "The cardholder has disputed this payment.",
    evidence: ["Proof the customer received what they bought", "Your refund policy as they saw it"],
  };
}

export type { Tx };

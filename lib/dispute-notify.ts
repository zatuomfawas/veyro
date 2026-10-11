// Telling a founder and their guardian that a payment has been disputed.
//
// This is the baseline promise in §1, and it is the one dispute feature that
// matters most. On Standard accounts Stripe writes to the account holder --
// the guardian -- so without this a teenager can lose a chargeback by default
// because a deadline passed in a parent's inbox, possibly unread. Both of them
// get told, in plain words, with the deadline stated.
//
// Nothing here suggests an outcome. The deadline is a fact Stripe gave us; the
// result is not ours to predict.
import type Stripe from "stripe";
import { db } from "@/lib/db";
import { sendDisputeNotification } from "@/lib/email";
import { formatMinor } from "@/lib/money";
import { disputeUrl, guidanceFor, DISPUTE_DISCLAIMER } from "@/lib/disputes";
import {
  disputeMailForFounder, disputeMailForGuardian,
  disputeSubjectForFounder, disputeSubjectForGuardian,
} from "@/lib/email-bodies";

/** The guardian of record for a founder, if one has consented. */
async function guardianFor(founderId: string) {
  const consent = await db.guardianConsent.findUnique({
    where: { founderId },
    select: { guardianId: true },
  });
  if (!consent?.guardianId) return null;
  return db.user.findUnique({ where: { id: consent.guardianId } });
}

export async function notifyDispute(founderId: string, dispute: Stripe.Dispute): Promise<void> {
  const founder = await db.user.findUnique({ where: { id: founderId } });
  if (!founder) return;
  const guardian = await guardianFor(founderId);

  const args = {
    founderName: founder.name,
    guardianName: guardian?.name ?? null,
    amount: formatMinor(dispute.amount, (dispute.currency ?? "usd").toUpperCase()),
    reason: guidanceFor(dispute.reason ?? "").label,
    // Stripe's own deadline, formatted and not interpreted. Null when Stripe
    // has not set one, which the body turns into "go and look" rather than a
    // number of days.
    due: dispute.evidence_details?.due_by
      ? new Date(dispute.evidence_details.due_by * 1000).toUTCString()
      : null,
    opened: dispute.created ? new Date(dispute.created * 1000).toUTCString() : null,
    disputeId: dispute.id,
    url: disputeUrl(dispute.id),
    disclaimer: DISPUTE_DISCLAIMER,
  };

  await sendDisputeNotification(
    founder.email, disputeSubjectForFounder(args.amount), disputeMailForFounder(args),
    { founderId, disputeId: dispute.id, audience: "founder" },
  );

  if (guardian) {
    await sendDisputeNotification(
      guardian.email, disputeSubjectForGuardian(founder.name), disputeMailForGuardian(args),
      { founderId, disputeId: dispute.id, audience: "guardian" },
    );
  }

  // In the dashboard too, because an email is not a guarantee of being read.
  await db.notification.create({
    data: {
      userId: founderId,
      title: "A customer disputed a charge",
      body: `${args.amount} is being disputed.`
        + (args.due ? ` A response is due by ${args.due}.` : ""),
    },
  });
}

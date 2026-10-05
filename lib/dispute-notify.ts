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

  const amount = formatMinor(dispute.amount, (dispute.currency ?? "usd").toUpperCase());
  const due = dispute.evidence_details?.due_by
    ? new Date(dispute.evidence_details.due_by * 1000).toUTCString()
    : null;
  const g = guidanceFor(dispute.reason ?? "");
  const url = disputeUrl(dispute.id);

  const body = [
    `A customer has disputed a payment of ${amount}.`,
    "",
    g.label,
    "",
    due
      ? `Stripe needs a response by ${due}. If nothing is sent by then, the dispute is lost by default.`
      : "Stripe has not given a response deadline for this one yet.",
    "",
    "The account holder responds in the Stripe dashboard:",
    url,
    "",
    DISPUTE_DISCLAIMER,
  ].join("\n");

  await sendDisputeNotification(
    founder.email, `A payment of ${amount} has been disputed`, body,
    { founderId, disputeId: dispute.id, audience: "founder" },
  );

  if (guardian) {
    await sendDisputeNotification(
      guardian.email,
      `A payment on ${founder.name}'s account has been disputed`,
      [
        `A customer has disputed a payment of ${amount} on the account you are the verified adult on.`,
        "",
        g.label,
        "",
        due
          ? `Stripe needs a response by ${due}. Responding is done in your Stripe dashboard.`
          : "Stripe has not given a response deadline for this one yet.",
        "",
        url,
        "",
        DISPUTE_DISCLAIMER,
      ].join("\n"),
      { founderId, disputeId: dispute.id, audience: "guardian" },
    );
  }

  // In the dashboard too, because an email is not a guarantee of being read.
  await db.notification.create({
    data: {
      userId: founderId,
      title: "A payment was disputed",
      body: `${amount} is being disputed.${due ? ` A response is due by ${due}.` : ""}`,
    },
  });
}

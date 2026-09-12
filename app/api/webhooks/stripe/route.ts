// Stripe calls this as a connected account moves through onboarding and, later,
// as it takes payments and pays out. This is the only place PaymentAccount.status
// is allowed to move to ACTIVE — never from a client request.
//
// Order of every request:
//   1. Verify the signature. A bad signature is the only thing that gets a non-2xx
//      without a recorded row.
//   2. Record the event in WebhookEvent (keyed by Stripe's event id) BEFORE any
//      type-specific logic. If step 3 throws, the row is left with processedAt
//      null and Stripe's retry re-runs it — a recorded-but-unprocessed row is
//      recoverable; a 200 with no row is not.
//   3. Act on the event type. Every handler is idempotent.
//   4. Stamp processedAt.
//
// Standard accounts run their own payout schedule; Veyro can't stop or
// reschedule a payout, only observe it and — per the guardian's policy — notify.
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { audit } from "@/lib/auth";
import { syncAccountFromStripe } from "@/lib/stripe-account";

export const runtime = "nodejs";

type PayoutStatus = "IN_TRANSIT" | "PAID" | "FAILED" | "CANCELED";

// Connect events that signal a connected account's onboarding/verification state
// changed but do NOT carry the full account object. Each one triggers a re-fetch.
const ACCOUNT_PROGRESS_EVENTS = new Set<string>([
  "capability.updated",
  "person.updated",
  "person.created",
  "account.external_account.created",
  "account.external_account.updated",
  "account.external_account.deleted",
]);

// Notify the guardian and the founder that Stripe onboarding was completed by
// the wrong person and the account is on hold. Fired once, on the transition
// into RESTRICTED (see the caller's `changed` guard).
async function notifyIndividualMismatch(businessId: string): Promise<void> {
  const business = await db.business.findUnique({ where: { id: businessId } });
  if (!business) return;
  const rel = await db.guardianRelationship.findUnique({ where: { businessId } });

  const recipients = new Set<string>([business.founderId]);
  if (rel?.guardianId) recipients.add(rel.guardianId);

  await Promise.all(
    [...recipients].map((userId) =>
      db.notification.create({
        data: {
          userId,
          title: `Payment setup needs redoing for ${business.name}`,
          body:
            "Stripe verified the payment account against the wrong person. The guardian must "
            + "complete Stripe's form as themselves. The account is on hold until then.",
          routeName: "business.payments",
          routeId: businessId,
        },
      }),
    ),
  );
}

// Reconcile PaymentAccount against Stripe (shared with the on-demand sync
// endpoint) and log a row only when the status actually moved. A Stripe API
// failure propagates so the caller returns 500 and Stripe redelivers.
async function syncAndAudit(acctId: string, known?: Stripe.Account): Promise<void> {
  const result = await syncAccountFromStripe(acctId, known);
  if (!result?.changed) return;

  await audit(null, "stripe.account.status_changed", result.paymentAccountId, result.businessId, {
    from: result.from, to: result.to,
  });

  if (result.mismatch) {
    await audit(null, "stripe.connect.individual_mismatch", result.paymentAccountId, result.businessId, {
      field: result.mismatch.field, expected: result.mismatch.expected, got: result.mismatch.got,
    });
    await notifyIndividualMismatch(result.businessId);
  }
}

// Prefer the event type; fall back to the payout object's own status.
function mapPayoutStatus(eventType: string, stripeStatus: string | null): PayoutStatus | null {
  if (eventType === "payout.paid" || stripeStatus === "paid") return "PAID";
  if (eventType === "payout.failed" || stripeStatus === "failed") return "FAILED";
  if (eventType === "payout.canceled" || stripeStatus === "canceled") return "CANCELED";
  if (
    eventType === "payout.created" ||
    stripeStatus === "pending" ||
    stripeStatus === "in_transit"
  ) return "IN_TRANSIT";
  return null;
}

function describePayoutDestination(payout: Stripe.Payout): string {
  const d = payout.destination;
  if (d && typeof d === "object" && !("deleted" in d && d.deleted)) {
    if (d.object === "bank_account") {
      const parts = [d.bank_name, d.last4 ? `••${d.last4}` : null].filter(Boolean);
      if (parts.length) return parts.join(" ");
    }
    if (d.object === "card" && d.last4) return `card ••${d.last4}`;
  }
  return "the connected bank account";
}

function formatMinor(amountMinor: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amountMinor / 100);
  } catch {
    return `${(amountMinor / 100).toFixed(2)} ${currency}`;
  }
}

async function handleConnectedPayout(event: Stripe.Event): Promise<void> {
  const acctId = event.account;
  if (!acctId) return; // the platform's own payout, not a connected account

  const payout = event.data.object as Stripe.Payout;
  const status = mapPayoutStatus(event.type, payout.status ?? null);
  if (!status) return;

  const account = await db.paymentAccount.findUnique({ where: { providerAccountId: acctId } });
  if (!account) return;

  const business = await db.business.findUnique({ where: { id: account.businessId } });
  if (!business) return;

  const currency = (payout.currency ?? "usd").toUpperCase().slice(0, 3);
  const destination = describePayoutDestination(payout);
  const now = new Date();

  // Keyed on the Stripe payout id (providerRef is @unique), so redelivered or
  // out-of-order payout events converge on one row.
  const row = await db.payout.upsert({
    where: { providerRef: payout.id },
    create: {
      businessId: account.businessId,
      amountMinor: payout.amount,
      currency,
      status,
      destination,
      // Stripe-initiated on a Standard account: the founder owns the account.
      requestedById: business.founderId,
      providerRef: payout.id,
      sentAt: status === "IN_TRANSIT" ? now : null,
      completedAt: status === "PAID" ? now : null,
      failureCode: status === "FAILED" ? payout.failure_code ?? null : null,
      failureText: status === "FAILED" ? payout.failure_message ?? null : null,
      isSandbox: !event.livemode,
    },
    update: {
      status,
      destination,
      sentAt: status === "IN_TRANSIT" ? now : undefined,
      completedAt: status === "PAID" ? now : undefined,
      failureCode: status === "FAILED" ? payout.failure_code ?? null : undefined,
      failureText: status === "FAILED" ? payout.failure_message ?? null : undefined,
    },
  });

  await audit(null, `stripe.payout.${status.toLowerCase()}`, row.id, account.businessId, {
    amountMinor: payout.amount, currency, stripePayoutId: payout.id,
  });

  // Guardian notification — the part the guardian's policy actually gates now.
  const rel = await db.guardianRelationship.findUnique({ where: { businessId: account.businessId } });
  if (!rel || rel.status !== "ACCEPTED" || !rel.guardianId) return;

  const notable =
    rel.approvePayouts ||
    (rel.payoutThresholdMinor > 0 && payout.amount >= rel.payoutThresholdMinor);
  // Tell them once when the payout appears, and again only if it fails.
  const notify = notable && (event.type === "payout.created" || event.type === "payout.failed");
  if (!notify) return;

  const amount = formatMinor(payout.amount, currency);
  const failed = status === "FAILED";
  await db.notification.create({
    data: {
      userId: rel.guardianId,
      title: failed ? `A payout for ${business.name} failed` : `${business.name} sent a payout`,
      body: failed
        ? `A ${amount} payout to ${destination} could not be completed` +
          (payout.failure_message ? `: ${payout.failure_message}` : ".")
        : `A ${amount} payout to ${destination} is on its way. A Standard account pays out on ` +
          `Stripe's own schedule, so this is a notice, not a request to approve.`,
      routeName: "business.payments",
      routeId: account.businessId,
    },
  });

  await audit(null, "guardian.payout_notified", rel.id, account.businessId, {
    stripePayoutId: payout.id, failed,
  });
}

export async function POST(req: Request) {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook not configured." }, { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header." }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.warn("Stripe webhook signature check failed:", (err as Error).message);
    return NextResponse.json({ error: `Signature check failed: ${(err as Error).message}` }, { status: 400 });
  }

  // Step 2: record the verified event before doing anything with it. Skip the
  // work only if a prior delivery already ran to completion (processedAt set) —
  // a row with processedAt null means processing failed partway and Stripe's
  // retry should finish it, so we fall through and re-process.
  const already = await db.webhookEvent.findUnique({
    where: { provider_providerRef: { provider: "STRIPE_CONNECT", providerRef: event.id } },
  });
  if (already?.processedAt) return NextResponse.json({ ok: true, duplicate: true });

  const record = await db.webhookEvent.upsert({
    where: { provider_providerRef: { provider: "STRIPE_CONNECT", providerRef: event.id } },
    create: {
      provider: "STRIPE_CONNECT",
      providerRef: event.id,
      type: event.type,
      payload: event as never,
      signatureOk: true,
    },
    update: {}, // re-processing an existing, not-yet-finished record
  });

  // Step 3: act on the event. If anything here throws, processedAt stays null
  // and we return 500 so Stripe retries.
  try {
    if (event.type === "account.updated") {
      const acct = event.data.object as Stripe.Account;
      await syncAndAudit(acct.id, acct);
    } else if (ACCOUNT_PROGRESS_EVENTS.has(event.type)) {
      if (event.account) await syncAndAudit(event.account);
    } else if (event.type === "account.application.deauthorized") {
      // On Connect events the connected account id is on the event, not the object.
      const acctId = event.account ?? null;
      if (acctId) {
        const account = await db.paymentAccount.findUnique({ where: { providerAccountId: acctId } });
        if (account) {
          await db.paymentAccount.update({
            where: { id: account.id },
            data: { status: "DISCONNECTED", disconnectedAt: new Date() },
          });
          await audit(null, "stripe.account.deauthorized", account.id, account.businessId);
        }
      }
    } else if (event.type.startsWith("payout.")) {
      await handleConnectedPayout(event);
    }
  } catch (err) {
    console.error(
      `Webhook ${event.id} (${event.type}) failed mid-processing:`,
      (err as Error).message,
    );
    return NextResponse.json({ error: "Processing failed; will retry." }, { status: 500 });
  }

  // Step 4.
  await db.webhookEvent.update({ where: { id: record.id }, data: { processedAt: new Date() } });

  return NextResponse.json({ ok: true });
}

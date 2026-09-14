// Stripe calls this as a founder's connected account moves through onboarding.
// This is the only place FounderPaymentAccount.status is allowed to move to
// ACTIVE — never from a client request.
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
// payment_intent.succeeded is what creates a FounderTransaction. charge.* is
// deliberately ignored: one payment emits several events, so treating more than
// one as "money arrived" double-posts it.
//
// payout.* is ignored too. On a Standard account those describe the connected
// account paying itself out, which is a different thing from
// FounderPayoutRequest (the founder asking us to send money). Forcing one into
// the other would corrupt the balance foldWallet derives.
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { audit } from "@/lib/auth";
import { syncAccountFromStripe } from "@/lib/stripe-account";

export const runtime = "nodejs";


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
async function notifyIndividualMismatch(founderId: string): Promise<void> {
  const founder = await db.user.findUnique({ where: { id: founderId } });
  if (!founder) return;
  const consent = await db.guardianConsent.findUnique({ where: { founderId } });

  const recipients = new Set<string>([founderId]);
  if (consent?.guardianId) recipients.add(consent.guardianId);

  await Promise.all(
    [...recipients].map((userId) =>
      db.notification.create({
        data: {
          userId,
          title: "Payment setup needs redoing",
          body:
            "Stripe verified the payment account against the wrong person. The guardian must "
            + "complete Stripe's form as themselves. The account is on hold until then.",
          routeName: "founder.payments",
          routeId: founderId,
        },
      }),
    ),
  );
}

/**
 * Record a completed payment. This is the ONLY place a FounderTransaction is
 * created — the customer's browser is never trusted to say a payment happened.
 *
 * Only payment_intent.succeeded is handled, not charge.succeeded: one payment
 * emits several events, and treating more than one of them as "money arrived"
 * would post the same charge twice under different event ids.
 */
async function recordPayment(event: Stripe.Event): Promise<void> {
  const intent = event.data.object as Stripe.PaymentIntent;

  // Direct charges arrive on the connected account, so event.account is the
  // authority on whose money this is. Metadata says the same thing; if they
  // disagree, something is wrong and we credit nobody.
  const acctId = event.account;
  if (!acctId) return; // a platform-account payment, not a founder's

  const ownerId = await founderForAccount(acctId);
  if (!ownerId) return; // not an account we know about

  const founderId = intent.metadata?.veyroFounderId;
  const productId = intent.metadata?.veyroProductId;
  if (!founderId || !productId) {
    console.warn(`PaymentIntent ${intent.id} has no Veyro metadata; not recorded.`);
    return;
  }
  if (founderId !== ownerId) {
    console.error(
      `PaymentIntent ${intent.id} metadata names founder ${founderId} but arrived on `
      + `${acctId}, which belongs to ${ownerId}. Not recorded.`,
    );
    await audit(null, "payment.attribution_mismatch", intent.id, ownerId, {
      metadataFounderId: founderId, accountFounderId: ownerId,
    });
    return;
  }

  // The product has to still exist and still belong to this founder.
  const product = await db.founderProduct.findUnique({ where: { id: productId } });
  if (!product || product.founderId !== founderId) {
    console.error(`PaymentIntent ${intent.id} names product ${productId}, which does not match.`);
    return;
  }

  try {
    const tx = await db.founderTransaction.create({
      data: {
        founderId,
        productId,
        amountMinor: intent.amount_received || intent.amount,
        currency: intent.currency.toUpperCase(),
        status: "COMPLETED",
        stripePaymentIntentId: intent.id,
      },
    });
    await audit(null, "payment.completed", tx.id, founderId, {
      amountMinor: tx.amountMinor, currency: tx.currency, paymentIntentId: intent.id,
    });
    await db.notification.create({
      data: {
        userId: founderId,
        title: "You got paid",
        body: `${(tx.amountMinor / 100).toFixed(2)} ${tx.currency} for ${product.name}.`,
        routeName: "founder.transactions",
        routeId: founderId,
      },
    });
  } catch (err) {
    // Unique on stripePaymentIntentId: this payment is already recorded, which
    // is the answer we want from a redelivery, not an error.
    if ((err as { code?: string }).code === "P2002") return;
    throw err;
  }
}

/** Which founder owns this Stripe connected account, if any. */
async function founderForAccount(providerAccountId: string): Promise<string | null> {
  const account = await db.founderPaymentAccount.findUnique({ where: { providerAccountId } });
  return account?.founderId ?? null;
}

// Reconcile FounderPaymentAccount against Stripe (shared with the on-demand sync
// endpoint) and log a row only when the status actually moved. A Stripe API
// failure propagates so the caller returns 500 and Stripe redelivers.
async function syncAndAudit(founderId: string, known?: Stripe.Account): Promise<void> {
  const result = await syncAccountFromStripe(founderId, known);
  if (!result?.changed) return;

  await audit(null, "stripe.account.status_changed", result.paymentAccountId, result.founderId, {
    from: result.from, to: result.to,
  });

  if (result.mismatch) {
    await audit(null, "stripe.connect.individual_mismatch", result.paymentAccountId, result.founderId, {
      field: result.mismatch.field, expected: result.mismatch.expected, got: result.mismatch.got,
    });
    await notifyIndividualMismatch(result.founderId);
  }
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
      const founderId = await founderForAccount(acct.id);
      if (founderId) await syncAndAudit(founderId, acct);
    } else if (ACCOUNT_PROGRESS_EVENTS.has(event.type)) {
      const founderId = event.account ? await founderForAccount(event.account) : null;
      if (founderId) await syncAndAudit(founderId);
    } else if (event.type === "payment_intent.succeeded") {
      await recordPayment(event);
    } else if (event.type === "account.application.deauthorized") {
      // On Connect events the connected account id is on the event, not the object.
      const acctId = event.account ?? null;
      if (acctId) {
        const account = await db.founderPaymentAccount.findUnique({
          where: { providerAccountId: acctId },
        });
        if (account) {
          await db.founderPaymentAccount.update({
            where: { id: account.id },
            data: { status: "DISCONNECTED", disconnectedAt: new Date() },
          });
          await audit(null, "stripe.account.deauthorized", account.id, account.founderId);
        }
      }
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

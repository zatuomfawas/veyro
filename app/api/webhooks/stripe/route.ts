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
import { applyFeeForPayment, reduceQme } from "@/lib/fees";
import { mapDisputeState } from "@/lib/disputes";
import { notifyDispute } from "@/lib/dispute-notify";
import { syncAccountFromStripe } from "@/lib/stripe-account";
import { sendPaymentNotification } from "@/lib/email";
import { formatMinor } from "@/lib/money";

export const runtime = "nodejs";


// Connect events that signal a connected account's onboarding/verification state
// changed but do NOT carry the full account object. Each one triggers a re-fetch.
// Chargebacks. Every one of these can change what we must show a founder, and
// `closed` is the one that can move money, so all four are handled rather than
// just the opening.
const DISPUTE_EVENTS = new Set<string>([
  "charge.dispute.created",
  "charge.dispute.updated",
  "charge.dispute.closed",
  "charge.dispute.funds_withdrawn",
]);

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
/**
 * Money going back out: a refund the founder issued.
 *
 * Lowers Qualifying Monthly Earnings so later payments in the same month may
 * owe nothing, and does NOT return a fee already taken. That asymmetry is the
 * Terms, not an oversight -- see lib/fees.ts.
 *
 * Keyed on the charge's own payment intent, so a replayed event cannot
 * subtract the same refund twice: the row records a cumulative total and is
 * set, never incremented.
 */
async function recordRefund(event: Stripe.Event): Promise<void> {
  const charge = event.data.object as Stripe.Charge;
  const acctId = event.account;
  if (!acctId) return;

  const intentId = typeof charge.payment_intent === "string"
    ? charge.payment_intent : charge.payment_intent?.id;
  if (!intentId) return;

  const row = await db.founderTransaction.findUnique({
    where: { stripePaymentIntentId: intentId },
  });
  if (!row) return; // a payment we never recorded; nothing to reduce

  const refundedMinor = charge.amount_refunded ?? 0;
  const delta = refundedMinor - row.refundedMinor;
  if (delta <= 0) return; // replay, or a refund we already have

  // Convert at the rate fixed when the payment settled, never a fresh one.
  // A refund is the same money going back; revaluing it at today's rate would
  // invent a gain or a loss that nobody experienced.
  const usdDelta = row.exchangeRate
    ? Math.round(delta * Number(row.exchangeRate))
    : delta;

  await db.$transaction(async (trx) => {
    await trx.founderTransaction.update({
      where: { id: row.id },
      data: {
        refundedMinor,
        status: refundedMinor >= row.amountMinor ? "REFUNDED" : row.status,
      },
    });
    await reduceQme(trx, {
      founderId: row.founderId,
      usdAmountMinor: usdDelta,
      stripeCreatedUnixSeconds: charge.created,
    });
  });

  await audit(null, "payment.refunded", row.id, row.founderId, {
    refundedMinor, deltaMinor: delta, usdDeltaMinor: usdDelta,
  });
}

/**
 * A chargeback opened, updated or closed.
 *
 * Mirrors Stripe's state so the dashboard can show it, and reduces QME only
 * when the dispute is actually lost -- an open dispute is money at risk, not
 * money gone, and treating it as gone would understate what a founder owes
 * and then surprise them when it resolves in their favour.
 */
async function recordDispute(event: Stripe.Event): Promise<void> {
  const dispute = event.data.object as Stripe.Dispute;
  const acctId = event.account;
  if (!acctId) return;

  const founderId = await founderForAccount(acctId);
  if (!founderId) return;

  const chargeId = typeof dispute.charge === "string" ? dispute.charge : dispute.charge?.id;
  const state = mapDisputeState(dispute.status);
  const existing = await db.founderDispute.findUnique({
    where: { stripeDisputeId: dispute.id },
  });

  await db.founderDispute.upsert({
    where: { stripeDisputeId: dispute.id },
    create: {
      founderId,
      stripeDisputeId: dispute.id,
      stripeChargeId: chargeId ?? "",
      amountMinor: dispute.amount,
      currency: (dispute.currency ?? "usd").toUpperCase(),
      reason: dispute.reason ?? "unknown",
      state,
      evidenceDueBy: dispute.evidence_details?.due_by
        ? new Date(dispute.evidence_details.due_by * 1000) : null,
    },
    update: {
      state,
      evidenceDueBy: dispute.evidence_details?.due_by
        ? new Date(dispute.evidence_details.due_by * 1000) : null,
      closedAt: state === "WON" || state === "LOST" || state === "WARNING_CLOSED"
        ? new Date() : null,
    },
  });

  // Lost means the money is gone. Reduce QME once, on the transition only.
  if (state === "LOST" && existing?.state !== "LOST") {
    const row = chargeId
      ? await db.founderTransaction.findFirst({ where: { founderId, stripePaymentIntentId: { not: "" } } })
      : null;
    const usd = row?.exchangeRate ? Math.round(dispute.amount * Number(row.exchangeRate)) : dispute.amount;
    await db.$transaction(async (trx) => {
      await reduceQme(trx, {
        founderId, usdAmountMinor: usd, stripeCreatedUnixSeconds: dispute.created,
      });
    });
    await audit(null, "dispute.lost", dispute.id, founderId, { amountMinor: dispute.amount });
  }

  // Tell both of them, once. The guardian is the account holder and the one
  // Stripe wrote to; the founder is the one whose money it is.
  if (!existing?.notifiedAt && state === "NEEDS_RESPONSE") {
    await notifyDispute(founderId, dispute);
    await db.founderDispute.update({
      where: { stripeDisputeId: dispute.id },
      data: { notifiedAt: new Date() },
    });
  }
}

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

  // Stripe's actual processing fee, read rather than estimated.
  //
  // On a direct charge the money and the fee both live on the connected
  // account, so the balance transaction has to be fetched with { stripeAccount }
  // or Stripe looks on the platform and finds nothing. A fee calculated from a
  // published percentage would be wrong the moment a card is international, or
  // Stripe changes pricing, or the account has negotiated rates.
  //
  // Null is a real answer, not a failure: some payment methods settle their
  // balance transaction after the PaymentIntent succeeds, so the fee genuinely
  // is not known yet. It is stored as null and shown as unknown, never as zero.
  let feeMinor: number | null = null;
  // The USD value of this payment, and the rate that produced it.
  //
  // Qualifying Monthly Earnings are denominated in USD, so a non-USD payment
  // has to be converted once, at settlement, and then never again (Terms,
  // "Currency"). Stripe's own per-transaction rate is the one figure that will
  // agree with what the founder sees in their own dashboard.
  let usdAmountMinor: number | null = null;
  let exchangeRate: number | null = null;
  try {
    const chargeId =
      typeof intent.latest_charge === "string" ? intent.latest_charge : intent.latest_charge?.id;
    if (chargeId) {
      const charge = await stripe.charges.retrieve(
        chargeId,
        { expand: ["balance_transaction"] },
        { stripeAccount: acctId },
      );
      const bt = charge.balance_transaction;
      if (bt && typeof bt !== "string") {
        feeMinor = bt.fee;
        if (intent.currency.toLowerCase() === "usd") {
          // Already USD: no rate, and the figure is itself.
          usdAmountMinor = intent.amount_received || intent.amount;
        } else if (typeof bt.exchange_rate === "number" && bt.exchange_rate > 0) {
          exchangeRate = bt.exchange_rate;
          usdAmountMinor = Math.round((intent.amount_received || intent.amount) * bt.exchange_rate);
        }
      }
    }
  } catch (err) {
    // A missing fee must never stop the payment being recorded. The money
    // arrived; the fee is a detail we can live without and backfill later.
    console.warn(`Could not read the fee for ${intent.id}:`, (err as Error).message);
  }

  try {
    // The payment row and the month's running totals move together or not at
    // all. A payment recorded without its fee, or a fee without its payment,
    // is a reconciliation job somebody has to do by hand later.
    const { tx, fee } = await db.$transaction(async (trx) => {
      const tx = await trx.founderTransaction.create({
        data: {
          founderId,
          productId,
          amountMinor: intent.amount_received || intent.amount,
          feeMinor,
          usdAmountMinor,
          exchangeRate,
          currency: intent.currency.toUpperCase(),
          status: "COMPLETED",
          stripePaymentIntentId: intent.id,
        },
      });
      // Only count what we can denominate. A payment whose balance transaction
      // has not settled has no USD figure yet, so it does not move QME until a
      // later sweep fills it in -- counting it at face value would quietly
      // treat 100 AED as 100 USD.
      const fee = usdAmountMinor == null ? null : await applyFeeForPayment(trx, {
        founderId,
        usdAmountMinor,
        stripeCreatedUnixSeconds: intent.created,
      });
      return { tx, fee };
    });

    await audit(null, "payment.completed", tx.id, founderId, {
      amountMinor: tx.amountMinor, currency: tx.currency, paymentIntentId: intent.id,
      usdAmountMinor, month: fee?.month ?? null,
      veyroFeeMinor: fee?.feeMinor ?? null, feeCollected: fee?.collected ?? false,
    });

    // Non-fatal, and deliberately after the row is written: the payment is
    // recorded whether or not the founder can be told about it.
    const founder = await db.user.findUnique({ where: { id: founderId } });
    if (founder) {
      await sendPaymentNotification(founder.email, tx.amountMinor, tx.currency, founderId);
    }
    await db.notification.create({
      data: {
        userId: founderId,
        title: "You got paid",
        // formatMinor rather than a hand-rolled /100, which is the one place a
        // currency bug reliably gets in: the divisor depends on the currency,
        // and Stripe reports whatever the customer actually paid in.
        body: `${formatMinor(tx.amountMinor, tx.currency)} for ${product.name}.`,
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
    } else if (event.type === "charge.refunded") {
      await recordRefund(event);
    } else if (DISPUTE_EVENTS.has(event.type)) {
      await recordDispute(event);
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

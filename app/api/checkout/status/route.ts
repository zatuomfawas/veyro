// Has this payment landed yet?
//
// The SDK polls this after opening checkout. It answers from the row the Stripe
// webhook already writes, so it inherits that path's guarantees rather than
// asking Stripe a second time: FounderTransaction.stripePaymentIntentId is
// unique, and the webhook is the only thing that creates it.
//
// Deliberately says very little. A payment intent id is known to the person who
// is paying and to the founder, and nothing more than "is it done" should fall
// out of holding one. No amount, no product, no seller — someone who guessed an
// id would learn nothing about a business they are not part of.
import { db } from "@/lib/db";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { corsJson, corsPreflight } from "@/lib/cors";

export const runtime = "nodejs";

/**
 * Deliberately far higher than the create limit.
 *
 * A customer takes half a minute to type a card, and the SDK polls while they
 * do. At one call every two seconds a single honest checkout is around thirty
 * requests, so a ceiling of ten a minute — as first specified — would have
 * throttled the SDK before the customer finished. This is a single indexed
 * read on a unique column; the cost of allowing it is close to nothing.
 */
const LIMIT = 120;
const WINDOW_MS = 60_000;

export function OPTIONS() {
  return corsPreflight();
}

export async function GET(req: Request) {
  const gate = rateLimit(`sdk-status:${clientIp(req)}`, LIMIT, WINDOW_MS);
  if (!gate.ok) {
    return corsJson(
      { ok: false, error: "Too many requests." },
      { status: 429, headers: { "retry-after": String(gate.retryAfter) } },
    );
  }

  const intent = new URL(req.url).searchParams.get("intent")?.trim() ?? "";
  if (!/^pi_[A-Za-z0-9_]+$/.test(intent)) {
    return corsJson({ ok: false, error: "Pass the intent id returned by checkout/create." }, { status: 400 });
  }

  const tx = await db.founderTransaction.findUnique({
    where: { stripePaymentIntentId: intent },
    select: { id: true, status: true },
  });

  // No row is the ordinary answer, not an error: the customer is still typing,
  // or the webhook has not arrived yet. Saying "pending" rather than 404 keeps
  // the SDK's polling loop simple and stops an integrator treating a normal
  // wait as a failure.
  if (!tx) return corsJson({ ok: true, status: "pending", transactionId: null });

  const status =
    tx.status === "COMPLETED" ? "completed"
      : tx.status === "REFUNDED" ? "refunded"
        : "pending";

  return corsJson({ ok: true, status, transactionId: status === "pending" ? null : tx.id });
}

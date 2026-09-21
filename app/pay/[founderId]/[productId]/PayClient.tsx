"use client";

// The embedded PaymentElement. The customer never leaves this page.
//
// Stripe.js is loaded AS THE CONNECTED ACCOUNT (`stripeAccount`), which is what
// makes this a direct charge — the same account the PaymentIntent was created
// on. Load it without that and the client secret won't resolve.

import { useCallback, useEffect, useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";

type Props = {
  founderId: string;
  productId: string;
  amountLabel: string;
  /** An intent the SDK already created, so one payment spans click to charge. */
  intentHint?: string;
};

type Intent = { clientSecret: string; stripeAccount: string };

export default function PayClient({ founderId, productId, amountLabel, intentHint }: Props) {
  const [intent, setIntent] = useState<Intent | null>(null);
  const [error, setError] = useState<string | null>(null);

  // One id for this page load, so the server can tell a repeated request from
  // this browser apart from a different customer opening the same product.
  // Without it the idempotency key was identical for everyone and Stripe handed
  // the second buyer the first buyer's PaymentIntent. useMemo rather than
  // useState so the effect below, which runs twice in development, sees the
  // same value both times: that repeat is precisely what should be deduplicated.
  const attempt = useMemo(() => crypto.randomUUID(), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/founder/${founderId}/products/${productId}/checkout-intent`,
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ attempt, intent: intentHint }),
          },
        );
        const body = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(body?.error ?? "We couldn't start this payment.");
          return;
        }
        setIntent({ clientSecret: body.clientSecret, stripeAccount: body.stripeAccount });
      } catch {
        if (!cancelled) setError("We couldn't reach the payment provider. Nothing has been charged.");
      }
    })();
    return () => { cancelled = true; };
  }, [founderId, productId, attempt, intentHint]);

  // Recreated only when the account changes, never on every render.
  const stripePromise = useMemo(() => {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key || !intent) return null;
    return loadStripe(key, { stripeAccount: intent.stripeAccount });
  }, [intent]);

  if (error) {
    return (
      <div className="statusblock sb-error">
        <div className="row" style={{ alignItems: "flex-start", gap: 12 }}>
          <span className="sb-mark sb-mark-clay" />
          <div>
            <div className="sb-head">This payment can&rsquo;t start</div>
            <p className="sb-body">{error} Nothing has been charged.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!intent || !stripePromise) {
    return <p className="small">Loading payment form…</p>;
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret: intent.clientSecret,
        appearance: {
          // Match the design system rather than shipping Stripe's default look.
          variables: {
            colorPrimary: "#1e4636",
            colorBackground: "#faf9f5",
            colorText: "#191814",
            colorDanger: "#8a2e21",
            borderRadius: "0px",
            fontSizeBase: "14px",
            spacingUnit: "4px",
          },
        },
      }}
    >
      <CheckoutForm amountLabel={amountLabel} founderId={founderId} productId={productId} />
    </Elements>
  );
}

function CheckoutForm({
  amountLabel, founderId, productId,
}: { amountLabel: string; founderId: string; productId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!stripe || !elements || submitting) return;

      setSubmitting(true);
      setMessage(null);

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/pay/${founderId}/${productId}/return`,
        },
      });

      // Only card errors and validation failures come back here; anything else
      // has already redirected. The payment is recorded by the webhook, not by
      // this page, so there is nothing to report on success.
      if (error) {
        setMessage(error.message ?? "That payment didn't go through. You have not been charged.");
        setSubmitting(false);
      }
    },
    [stripe, elements, submitting, founderId, productId],
  );

  return (
    <form onSubmit={onSubmit}>
      <PaymentElement />
      <button
        type="submit"
        className="btn btn-lg btn-w"
        style={{ marginTop: 16 }}
        disabled={!stripe || submitting}
        aria-busy={submitting ? "true" : undefined}
      >
        {submitting ? "Paying…" : `Pay ${amountLabel}`}
      </button>
      {message && (
        <p className="err" style={{ marginTop: 12 }} role="alert">{message}</p>
      )}
    </form>
  );
}

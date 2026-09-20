"use client";

// Ask for money to be sent to the bank account on the Stripe account.
//
// A wallet that says "$240.00 available" with no way to ask for it is an
// unfinished product, and the API, the ledger fold and the guardian
// notification all already existed. This is the missing button.
//
// The confirm step is there because this is the one action here that moves real
// money and cannot be undone from this page. What it confirms is the amount and
// the currency, in words, because "Request" alone does not tell you what you are
// about to request.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Btn, Field, Notice } from "@/app/_ui/form";
import { ConfirmModal } from "@/app/_ui/ConfirmModal";
import { formatMinor, parseMinor } from "@/lib/money";



export default function RequestPayout({
  currency, availableMinor, accountActive,
}: { currency: string; availableMinor: number; accountActive: boolean }) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ amountMinor: number; leftMinor: number } | null>(null);

  const minor = parseMinor(amount, currency);

  // Checked here only for a message beside the field. The API folds the wallet
  // again and decides; a number sent from the browser is never trusted.
  function check(): string | null {
    if (minor === null) return "Enter an amount like 20 or 20.00.";
    if (minor <= 0) return "Enter an amount above zero.";
    if (minor > availableMinor) {
      return `That is more than the ${formatMinor(availableMinor, currency)} you have available.`;
    }
    return null;
  }

  async function submit() {
    setBusy(true);
    setFormError(null);
    try {
      const res = await fetch("/api/founder/payout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ amountMinor: minor, currency }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setError(body?.errors?.amountMinor ?? null);
        setFormError(body?.errors?.amountMinor ? null : (body?.error ?? "Nothing was requested."));
        setBusy(false);
        setConfirming(false);
        return;
      }
      setDone({ amountMinor: minor!, leftMinor: body.availableMinor ?? 0 });
      setAmount("");
      setBusy(false);
      setConfirming(false);
      router.refresh();
    } catch {
      setFormError("We couldn't reach the server. Nothing was requested.");
      setBusy(false);
      setConfirming(false);
    }
  }

  if (!accountActive) {
    return (
      <Notice tone="grey" head="Payouts open once your account is live">
        Money can only be sent to a bank account Stripe has verified. Your guardian finishes that
        step, and this appears here when it is done.
      </Notice>
    );
  }

  if (availableMinor <= 0) {
    return (
      <Notice tone="grey" head="Nothing to pay out yet">
        Once a customer pays and the payment clears, the amount available shows here and you can
        ask for it.
      </Notice>
    );
  }

  if (done) {
    return (
      <Notice tone="pine" head={`${formatMinor(done.amountMinor, currency)} requested`}>
        <p style={{ margin: "0 0 8px" }}>
          Your guardian has been told, and the request is on your permanent record. Payouts run on
          Stripe&rsquo;s own schedule, so this is a request to Stripe, not a transfer Veyro makes.
        </p>
        <p style={{ margin: "0 0 12px" }}>
          {formatMinor(done.leftMinor, currency)} still available.
        </p>
        <Btn type="button" variant="q" size="sm" onClick={() => setDone(null)}>
          Request another
        </Btn>
      </Notice>
    );
  }

  return (
    <div>
      {formError && (
        <div style={{ marginBottom: 12 }}>
          <Notice tone="clay" head="That didn&rsquo;t work" live>{formError}</Notice>
        </div>
      )}

      <Field
        label={`How much do you want to withdraw?`}
        error={error || undefined}
        hint={`${formatMinor(availableMinor, currency)} available in ${currency}.`}
      >
        <input
          className="input"
          inputMode="decimal"
          value={amount}
          maxLength={12}
          placeholder={(availableMinor / 100).toFixed(2)}
          onBlur={() => amount.trim() && setError(check())}
          onChange={(e) => { setAmount(e.target.value); setError(null); }}
        />
      </Field>

      <Btn
        type="button"
        disabled={busy || !amount.trim()}
        onClick={() => {
          const bad = check();
          if (bad) { setError(bad); return; }
          setError(null);
          setConfirming(true);
        }}
      >
        Request payout
      </Btn>

      <ConfirmModal
        open={confirming}
        title="Request this payout?"
        confirmLabel={minor !== null ? `Request ${formatMinor(minor, currency)}` : "Request"}
        cancelLabel="Not yet"
        busy={busy}
        onConfirm={submit}
        onCancel={() => setConfirming(false)}
      >
        <p style={{ marginTop: 0 }}>
          You are asking for <strong>{minor !== null ? formatMinor(minor, currency) : ""}</strong> to
          be sent to the bank account on your Stripe account.
        </p>
        <p style={{ marginBottom: 0 }}>
          Your guardian is told every time, and the request is permanent on your record. They are
          not asked to approve it, because on this account type nobody can be given that power.
        </p>
      </ConfirmModal>
    </div>
  );
}

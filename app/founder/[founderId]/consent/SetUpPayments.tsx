"use client";

// Open the Stripe account, as the guardian.
//
// This button works here and nowhere else. POST /api/founder/payment-setup is
// guardian-only — it refuses the founder with "Payment setup is completed by
// your guardian, not by you" — because Stripe verifies the adult on the
// account. That is why the founder's dashboard reports this state but does not
// offer the action.

import { useState } from "react";
import { Btn, Notice } from "@/app/_ui/form";

export default function SetUpPayments({
  founderId, resume = false,
}: { founderId: string; resume?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      {error && (
        <div style={{ marginBottom: 14 }}>
          <Notice tone="clay" head="That didn&rsquo;t work">{error}</Notice>
        </div>
      )}

      <Btn
        type="button"
        disabled={busy}
        aria-busy={busy ? "true" : undefined}
        onClick={async () => {
          setBusy(true);
          setError(null);
          try {
            const res = await fetch("/api/founder/payment-setup", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ founderId }),
            });
            const body = await res.json().catch(() => null);
            if (!res.ok || !body?.onboardingUrl) {
              setError(body?.error ?? "Stripe could not be reached. Nothing was changed.");
              setBusy(false);
              return;
            }
            // Stripe's hosted form, on Stripe's domain. Veyro never sees the
            // identity documents entered there. Full navigation rather than a
            // new tab: account links are single-use and short-lived, so a
            // background tab is a link that has expired by the time it is read.
            window.location.href = body.onboardingUrl;
          } catch {
            setError("We couldn't reach the server. Nothing was changed.");
            setBusy(false);
          }
        }}
      >
        {busy ? "Opening Stripe…" : resume ? "Continue on Stripe" : "Set up payments"}
      </Btn>

      <p className="tiny" style={{ marginTop: 10, marginBottom: 0 }}>
        This opens Stripe&rsquo;s own form. You will be asked for your identity details and a bank
        account — Veyro never receives them.
      </p>
    </div>
  );
}

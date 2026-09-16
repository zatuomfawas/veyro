"use client";

// Accept or decline a guardian invitation.
//
// Both go to the same endpoint with the same token. Declining is offered as
// plainly as accepting: an agreement someone cannot refuse on the page that
// asks for it is not consent, and this one carries real liability — the
// guardian becomes the adult Stripe verifies.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Btn, Notice } from "@/app/_ui/form";
import { ConfirmModal } from "@/app/_ui/ConfirmModal";

export default function ConsentActions({ token }: { token: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"accept" | "decline" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  async function respond(decision: "accept" | "decline") {
    setBusy(decision);
    setError(null);
    try {
      const res = await fetch("/api/founder/consent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, decision }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setError(body?.error ?? "That didn't go through. Nothing was recorded.");
        setBusy(null);
        return;
      }
      // The page re-reads the consent row and renders the next state.
      router.refresh();
    } catch {
      setError("We couldn't reach the server. Nothing was recorded.");
      setBusy(null);
    }
  }

  return (
    <div>
      {error && (
        <div style={{ marginBottom: 12 }}>
          <Notice tone="clay" head="That didn&rsquo;t work">{error}</Notice>
        </div>
      )}

      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
        <Btn type="button" disabled={busy !== null} aria-busy={busy === "accept" ? "true" : undefined}
          onClick={() => respond("accept")}>
          {busy === "accept" ? "Accepting…" : "Accept"}
        </Btn>
        <Btn type="button" variant="2" disabled={busy !== null}
          onClick={() => setConfirming(true)}>
          Decline
        </Btn>
      </div>

      <ConfirmModal
        open={confirming}
        title="Decline this invitation?"
        confirmLabel="Decline"
        cancelLabel="Go back"
        tone="d"
        busy={busy === "decline"}
        onConfirm={() => respond("decline")}
        onCancel={() => setConfirming(false)}
      >
        <p style={{ marginTop: 0 }}>
          They will not be able to take payments without a guardian.
        </p>
        <p style={{ marginBottom: 0 }}>
          This is not permanent: they can invite you again, and you can accept then.
        </p>
      </ConfirmModal>
    </div>
  );
}

"use client";

// Invite an adult to be the guardian of record.
//
// The API returns the raw invite token exactly once and stores only its hash,
// so this is the only moment it can ever be shown. It is held in component
// state and never written to storage or the URL — a token in localStorage or a
// query string outlives the moment it was needed for.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Btn, Field, Notice } from "@/app/_ui/form";

/**
 * The one-time code, with a copy button.
 *
 * Shown after a first invite and after a re-invite alike. A re-invite replaces
 * the stored hash, so the previous code stops working — telling someone only
 * "Invite sent" would leave them holding a code that no longer opens anything.
 */
function TokenReveal({
  token, email, founderId, onDone,
}: { token: string; email: string; founderId: string; onDone: () => void }) {
  const [copied, setCopied] = useState(false);

  // The whole link, not the bare code. A code on its own has nowhere to be
  // typed — there is no "enter your invite code" screen — so handing someone
  // one would be handing them a dead end. window.location.origin keeps this
  // right on localhost, on a preview deployment and in production alike.
  const link =
    (typeof window === "undefined" ? "" : window.location.origin)
    + `/founder/${founderId}/consent?token=${encodeURIComponent(token)}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch {
      // Clipboard access is denied in some browsers and over plain http. The
      // code is on screen and selectable either way, so this is not an error
      // worth interrupting anyone over.
      setCopied(false);
    }
  }

  return (
    <Notice tone="pine" head="Invite created. Copy this link now.">
      <p style={{ margin: "0 0 10px" }}>
        This is the only time it is shown. Veyro stores a hash of the code inside it, not the code
        itself, so it cannot be looked up again. If you lose it, send a new invite.
      </p>
      <div
        className="mono"
        style={{
          background: "var(--surface)", border: "1px solid var(--line)", padding: "10px 12px",
          wordBreak: "break-all", fontSize: "var(--fs-2)", marginBottom: 8,
        }}
      >
        {link}
      </div>
      {copied ? (
        <p style={{ margin: "0 0 10px" }}>
          Copied. Send it to <strong>{email}</strong> yourself. Veyro does not email it yet. They
          sign in to their own guardian account to accept, which is what ties the consent to a real
          adult.
        </p>
      ) : (
        <p style={{ margin: "0 0 10px" }}>
          Send it to <strong>{email}</strong> yourself. They sign in to their own guardian account
          to accept, which is what ties the consent to a real adult.
        </p>
      )}
      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
        <Btn type="button" variant="2" size="sm" onClick={copy}>
          {copied ? "Copied" : "Copy link"}
        </Btn>
        <Btn type="button" variant="q" size="sm" onClick={onDone}>Done</Btn>
      </div>
    </Notice>
  );
}

async function postInvite(invitedEmail: string) {
  const res = await fetch("/api/founder/consent", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ invitedEmail }),
  });
  const body = await res.json().catch(() => null);
  return { ok: res.ok, body };
}

/** One-click re-invite of an address already on the record. */
export function ResendInvite({ email, founderId }: { email: string; founderId: string }) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (token) {
    return (
      <TokenReveal
        token={token}
        email={email}
        founderId={founderId}
        onDone={() => { setToken(null); router.refresh(); }}
      />
    );
  }

  return (
    <div>
      {error && (
        <div style={{ marginBottom: 12 }}>
          <Notice tone="clay" head="That didn&rsquo;t work">{error}</Notice>
        </div>
      )}
      <Btn
        type="button"
        variant="2"
        disabled={busy}
        aria-busy={busy ? "true" : undefined}
        onClick={async () => {
          setBusy(true);
          setError(null);
          try {
            const { ok, body } = await postInvite(email);
            if (!ok) {
              setError(body?.errors?.invitedEmail ?? body?.error ?? "No invite was sent.");
            } else {
              setToken(body.inviteToken);
              router.refresh();
            }
          } catch {
            setError("We couldn't reach the server. No invite was sent.");
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "Sending…" : `Re-invite ${email}`}
      </Btn>
    </div>
  );
}

export default function InviteGuardian({ founderId }: { founderId: string }) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setErrors({});
    setFormError(null);

    try {
      const { ok, body } = await postInvite(email);
      if (!ok) {
        if (body?.errors) setErrors(body.errors);
        else setFormError(body?.error ?? "Something went wrong. No invite was sent.");
        setSubmitting(false);
        return;
      }
      setSentTo(email);
      setToken(body.inviteToken);
      setSubmitting(false);
      // Repaint the server-rendered panels: the consent row now exists.
      router.refresh();
    } catch {
      setFormError("We couldn't reach the server. No invite was sent.");
      setSubmitting(false);
    }
  }

  if (token) {
    return (
      <TokenReveal
        token={token}
        email={sentTo}
        founderId={founderId}
        onDone={() => { setToken(null); setEmail(""); router.refresh(); }}
      />
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      {formError && (
        <div style={{ marginBottom: 12 }}>
          <Notice tone="clay" head="That didn&rsquo;t work">{formError}</Notice>
        </div>
      )}

      <Field
        label="Your parent or guardian&rsquo;s email"
        error={errors.invitedEmail}
        hint="They need to be 18 or over. They become the adult the payment provider verifies."
      >
        <input
          className="input"
          type="email"
          value={email}
          autoComplete="email"
          maxLength={254}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="parent@example.com"
        />
      </Field>

      <Btn type="submit" disabled={submitting} aria-busy={submitting ? "true" : undefined}>
        {submitting ? "Creating invite…" : "Invite my guardian"}
      </Btn>
    </form>
  );
}

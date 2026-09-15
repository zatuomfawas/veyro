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

export default function InviteGuardian({ reinvite = false }: { reinvite?: boolean }) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
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
      const res = await fetch("/api/founder/consent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ invitedEmail: email }),
      });
      const body = await res.json().catch(() => null);

      if (!res.ok) {
        if (body?.errors) setErrors(body.errors);
        else setFormError(body?.error ?? "Something went wrong. No invite was sent.");
        setSubmitting(false);
        return;
      }

      setToken(body.inviteToken);
      setSubmitting(false);
      // Repaint the server-rendered panels: the consent row now exists.
      router.refresh();
    } catch {
      setFormError("We couldn't reach the server. No invite was sent.");
      setSubmitting(false);
    }
  }

  async function copy() {
    if (!token) return;
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access is denied in some browsers and over plain http. The
      // code is on screen and selectable either way, so this is not an error
      // worth interrupting anyone over.
      setCopied(false);
    }
  }

  if (token) {
    return (
      <Notice tone="pine" head="Invite created. Copy this code now.">
        <p style={{ margin: "0 0 10px" }}>
          This is the only time it is shown. Veyro stores a hash of it, not the code itself, so
          it cannot be looked up again. If you lose it, send a new invite.
        </p>
        <div
          className="mono"
          style={{
            background: "var(--surface)", border: "1px solid var(--line)", padding: "10px 12px",
            wordBreak: "break-all", fontSize: "var(--fs-2)", marginBottom: 10,
          }}
        >
          {token}
        </div>
        <p style={{ margin: "0 0 10px" }}>
          Send it to <strong>{email}</strong> yourself — Veyro does not email it yet. They sign in
          to their own guardian account to accept, which is what ties the consent to a real adult.
        </p>
        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          <Btn type="button" variant="2" size="sm" onClick={copy}>
            {copied ? "Copied" : "Copy code"}
          </Btn>
          <Btn type="button" variant="q" size="sm" onClick={() => { setToken(null); setEmail(""); }}>
            Done
          </Btn>
        </div>
      </Notice>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      {formError && (
        <div style={{ marginBottom: 14 }}>
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
          onChange={(e) => setEmail(e.target.value)}
          placeholder="parent@example.com"
        />
      </Field>

      <Btn type="submit" disabled={submitting} aria-busy={submitting ? "true" : undefined}>
        {submitting ? "Creating invite…" : reinvite ? "Send a new invite" : "Invite my guardian"}
      </Btn>
    </form>
  );
}

"use client";

import { useState } from "react";
import { Btn, Field, Notice } from "@/app/_ui/form";

export default function ResendForm() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setErrors({}); setFormError(null);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        if (body?.errors) setErrors(body.errors);
        else setFormError(body?.error ?? "That didn't go through.");
        setBusy(false);
        return;
      }
      setSent(true);
      setBusy(false);
    } catch {
      setFormError("We couldn't reach the server. Nothing was sent.");
      setBusy(false);
    }
  }

  // The confirmation deliberately does not say whether an account exists. The
  // API answers identically either way, and a message here that said "sent!"
  // for real addresses and something else for unknown ones would undo that.
  if (sent) {
    return (
      <Notice tone="pine" head="Check your email" live>
        If that address has an unverified account, a new link is on its way. It lasts 24 hours.
        Look in spam before asking us: a first message from a new sender often lands there.
      </Notice>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      {formError && (
        <div style={{ marginBottom: 12 }}>
          <Notice tone="clay" head="That didn&rsquo;t work" live>{formError}</Notice>
        </div>
      )}
      <Field label="Your email address" error={errors.email}
        hint="The address you signed up with.">
        <input className="input" type="email" value={email} autoComplete="email"
          maxLength={254} onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com" />
      </Field>
      <Btn type="submit" disabled={busy} aria-busy={busy ? "true" : undefined}>
        {busy ? "Sending…" : "Send a new link"}
      </Btn>
    </form>
  );
}

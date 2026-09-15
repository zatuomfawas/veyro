"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Btn, Field, Notice } from "@/app/_ui/form";

export default function SigninForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setFormError(null);

    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const body = await res.json().catch(() => null);

      if (!res.ok) {
        // The API answers the same way for a wrong password and an unknown
        // email, on purpose. Repeating it verbatim keeps that property.
        setFormError(body?.error ?? "Email or password is wrong.");
        setSubmitting(false);
        return;
      }

      // Founders have somewhere to be. Guardians do not yet — their dashboard
      // is the next phase — so they land on the marketing page for now.
      router.push(body?.user?.role === "FOUNDER" ? "/dashboard/founder" : "/");
      router.refresh();
    } catch {
      setFormError("We couldn't reach the server. Try again in a moment.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      {formError && (
        <div style={{ marginBottom: 16 }}>
          <Notice tone="clay" head="Could not sign you in">{formError}</Notice>
        </div>
      )}

      <Field label="Email address">
        <input className="input" type="email" value={email} autoComplete="email"
          onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
      </Field>

      <Field label="Password">
        <input className="input" type="password" value={password} autoComplete="current-password"
          onChange={(e) => setPassword(e.target.value)} />
      </Field>

      <Btn className="btn-w" type="submit" disabled={submitting}
        aria-busy={submitting ? "true" : undefined}>
        {submitting ? "Signing in…" : "Sign in"}
      </Btn>
    </form>
  );
}

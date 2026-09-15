"use client";

// The form only stops obvious mistakes early. Everything that matters — the
// age floor, the 18+ rule for guardians, whether the email is taken — is
// decided by /api/auth/signup, because anything checked here can be bypassed
// by anyone who opens the network tab.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Btn, Field, Notice } from "@/app/_ui/form";
import { SIGNUP_COUNTRIES } from "@/app/_ui/countries";

type FieldErrors = Record<string, string>;

export default function SignupForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [country, setCountry] = useState("");
  const [isGuardian, setIsGuardian] = useState(false);

  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    // The one check the API cannot make: it never receives the confirmation.
    if (password !== confirm) {
      setErrors({ confirm: "Those two passwords are different." });
      setFormError(null);
      return;
    }

    setSubmitting(true);
    setErrors({});
    setFormError(null);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name, email, password, dateOfBirth, country,
          ...(isGuardian ? { role: "GUARDIAN" } : {}),
        }),
      });
      const body = await res.json().catch(() => null);

      if (!res.ok) {
        // Two shapes: {errors: {field: msg}} for validation, {error: msg} otherwise.
        if (body?.errors) setErrors(body.errors);
        else setFormError(body?.error ?? "Something went wrong. Nothing was created.");
        setSubmitting(false);
        return;
      }

      // Signup already issued the session cookie, so this account is signed in.
      // Founders go straight to their dashboard; a guardian's next step is the
      // invite link their founder sends them, not a page here.
      router.push(body?.user?.role === "FOUNDER" ? "/dashboard/founder" : "/");
      router.refresh();
    } catch {
      setFormError("We couldn't reach the server. Nothing was created.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      {formError && (
        <div style={{ marginBottom: 16 }}>
          <Notice tone="clay" head="That didn&rsquo;t work">{formError}</Notice>
        </div>
      )}

      <Field label="Your name" error={errors.name}>
        <input className="input" value={name} autoComplete="name"
          onChange={(e) => setName(e.target.value)} placeholder="Alex Taylor" />
      </Field>

      <Field label="Email address" error={errors.email}>
        <input className="input" type="email" value={email} autoComplete="email"
          onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
      </Field>

      <Field label="Password" error={errors.password}
        hint="At least 10 characters. A short sentence is easier to remember than a jumble.">
        <input className="input" type="password" value={password} autoComplete="new-password"
          onChange={(e) => setPassword(e.target.value)} />
      </Field>

      <Field label="Confirm password" error={errors.confirm}>
        <input className="input" type="password" value={confirm} autoComplete="new-password"
          onChange={(e) => setConfirm(e.target.value)} />
      </Field>

      <Field label="Date of birth" error={errors.dateOfBirth}
        hint="The full date, because the age rules turn on it. It is never shown publicly.">
        <input className="input" type="date" value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)} max="2026-12-31" />
      </Field>

      <Field label="Where do you live?" error={errors.country}
        hint="The legal age to sign a contract is set locally, and it decides which route is open to you.">
        <select className="select" value={country} onChange={(e) => setCountry(e.target.value)}>
          <option value="">Choose a country</option>
          {SIGNUP_COUNTRIES.map(([code, label]) => (
            <option key={code} value={code}>{label}</option>
          ))}
        </select>
      </Field>

      <button
        type="button"
        className="choice"
        data-on={isGuardian ? "1" : "0"}
        onClick={() => setIsGuardian((v) => !v)}
        aria-pressed={isGuardian}
        style={{ marginBottom: 14 }}
      >
        <span className="tick" />
        <span>
          <span style={{ display: "block", fontSize: "var(--fs-3)", fontWeight: 500 }}>
            I am a parent or guardian
          </span>
          <span className="tiny" style={{ display: "block", marginTop: 2 }}>
            Tick this if you are the adult signing for someone else. You have to be 18 or over —
            you are the person the payment provider verifies.
          </span>
        </span>
      </button>

      <Btn className="btn-w" type="submit" disabled={submitting}
        aria-busy={submitting ? "true" : undefined}>
        {submitting ? "Creating your account…" : "Create account"}
      </Btn>
    </form>
  );
}

"use client";

// The form only stops obvious mistakes early. Everything that matters — the
// age floor, the 18+ rule for guardians, whether the email is taken — is
// decided by /api/auth/signup, because anything checked here can be bypassed
// by anyone who opens the network tab.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Btn, Field, Notice, PasswordField } from "@/app/_ui/form";
import { SIGNUP_COUNTRIES } from "@/app/_ui/countries";
import { safeNextPath } from "@/lib/next-path";

type FieldErrors = Record<string, string>;

/**
 * The same rules /api/auth/signup applies, checked when a field loses focus.
 * On blur rather than on every keystroke: validating as someone types tells
 * them their email is wrong after two letters, which teaches people to ignore
 * the red text. The API still decides — this only saves a round trip.
 */
function checkField(field: string, value: string, isGuardian: boolean): string | null {
  if (!value.trim()) return null;
  switch (field) {
    case "email":
      return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value.trim())
        ? null : "Enter a working email address.";
    case "password":
      return value.length < 10
        ? "Use at least 10 characters. A short sentence is fine." : null;
    case "name":
      return value.trim().length < 2
        ? "Enter the name your guardian will recognise." : null;
    case "dateOfBirth": {
      const born = new Date(value);
      if (Number.isNaN(born.getTime())) return "Enter your full date of birth.";
      const now = new Date();
      if (born > now) return "That date is in the future.";
      let age = now.getFullYear() - born.getFullYear();
      const m = now.getMonth() - born.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < born.getDate())) age--;
      if (isGuardian && age < 18) {
        return "A parent or guardian has to be at least 18. They are the adult the payment "
          + "provider verifies.";
      }
      if (age < 13) return "You must be at least 13 to create an account.";
      return null;
    }
    default:
      return null;
  }
}

export default function SignupForm({ next }: { next?: string | null }) {
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

  // Which required fields are still empty. The API is still the authority on
  // whether each value is *valid*; this only answers "has it been filled in",
  // which is the question the submit button needs.
  const missing = [
    ["name", name], ["email", email], ["password", password],
    ["confirm", confirm], ["dateOfBirth", dateOfBirth], ["country", country],
  ].filter(([, v]) => !String(v).trim()).map(([k]) => k as string);
  const complete = missing.length === 0;

  const blur = (field: string, value: string) => () => {
    const message = checkField(field, value, isGuardian);
    setErrors((e) => ({ ...e, [field]: message ?? "" }));
  };
  const clear = (field: string) => setErrors((e) => ({ ...e, [field]: "" }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    // Flag every empty field at once rather than letting the server answer a
    // question the browser already knows, and rather than revealing them one at
    // a time as each is fixed.
    if (!complete) {
      const blanks: FieldErrors = {};
      for (const f of missing) blanks[f] = "This one is needed.";
      setErrors(blanks);
      setFormError(null);
      return;
    }

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

      // No session is issued at signup any more: the address has to be verified
      // first. So this cannot go to a dashboard, which would redirect straight
      // back out. The return path is preserved through the verification detour
      // by handing it to the sign-in page.
      const after = safeNextPath(next);
      router.push(
        "/auth/signin?registered=1" + (after ? `&next=${encodeURIComponent(after)}` : ""),
      );
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

      <Field label="Your name" error={errors.name || undefined}>
        <input className="input" value={name} autoComplete="name"
          onBlur={blur("name", name)}
          onChange={(e) => { setName(e.target.value); clear("name"); }} placeholder="Alex Taylor" />
      </Field>

      <Field label="Email address" error={errors.email || undefined}>
        <input className="input" type="email" value={email} autoComplete="email"
          onBlur={blur("email", email)}
          onChange={(e) => { setEmail(e.target.value); clear("email"); }} placeholder="you@example.com" />
      </Field>

      <PasswordField label="Password" error={errors.password || undefined}
        hint="At least 10 characters. A short sentence is easier to remember than a jumble."
        value={password} autoComplete="new-password"
        onBlur={blur("password", password)}
        onChange={(v) => { setPassword(v); clear("password"); }} />

      <PasswordField label="Confirm password" error={errors.confirm || undefined}
        value={confirm} autoComplete="new-password"
        onBlur={() => setErrors((x) => ({ ...x, confirm: confirm && confirm !== password ? "Those two passwords are different." : "" }))}
        onChange={(v) => { setConfirm(v); clear("confirm"); }} />

      <Field label="Date of birth" error={errors.dateOfBirth || undefined}
        hint="The full date, because the age rules turn on it. It is never shown publicly.">
        <input className="input" type="date" value={dateOfBirth}
          onBlur={blur("dateOfBirth", dateOfBirth)}
          onChange={(e) => { setDateOfBirth(e.target.value); clear("dateOfBirth"); }} max="2026-12-31" />
      </Field>

      <Field label="Where do you live?" error={errors.country || undefined}
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
        onClick={() => {
          const now = !isGuardian;
          setIsGuardian(now);
          setErrors((x) => ({ ...x, dateOfBirth: checkField("dateOfBirth", dateOfBirth, now) ?? "" }));
        }}
        aria-pressed={isGuardian}
        style={{ marginBottom: 12 }}
      >
        <span className="tick" />
        <span>
          <span style={{ display: "block", fontSize: "var(--fs-3)", fontWeight: 500 }}>
            I am a parent or guardian
          </span>
          <span className="tiny" style={{ display: "block", marginTop: 4 }}>
            Tick this if you are the adult signing for someone else. You have to be 18 or over:
            you are the person the payment provider verifies.
          </span>
        </span>
      </button>

      <Btn className="btn-w" type="submit" disabled={submitting || !complete}
        aria-busy={submitting ? "true" : undefined}>
        {submitting ? "Creating your account…" : "Create account"}
      </Btn>

      {!complete && (
        <p className="hint" style={{ marginTop: 8 }} role="status">
          {missing.length} {missing.length === 1 ? "field" : "fields"} left to fill in.
        </p>
      )}
    </form>
  );
}

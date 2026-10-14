"use client";

// The form only stops obvious mistakes early. Everything that matters — the
// age floor, the 18+ rule for guardians, whether the email is taken — is
// decided by /api/auth/signup, because anything checked here can be bypassed
// by anyone who opens the network tab.

import { useRef, useState } from "react";
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

export default function SignupForm({
  next, initialGuardian = false,
}: { next?: string | null; initialGuardian?: boolean }) {
  const router = useRouter();
  const form = useRef<HTMLFormElement>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [country, setCountry] = useState("");
  const [isGuardian, setIsGuardian] = useState(initialGuardian);

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

  const focusField = (field: string | undefined) => {
    if (!field) return;
    requestAnimationFrame(() => {
      const control = form.current?.elements.namedItem(field);
      if (control instanceof HTMLElement) control.focus();
    });
  };

  const selectRole = (guardian: boolean) => {
    setIsGuardian(guardian);
    setErrors((previous) => ({
      ...previous,
      dateOfBirth: checkField("dateOfBirth", dateOfBirth, guardian) ?? "",
    }));
  };

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
      focusField(missing[0]);
      return;
    }

    // The one check the API cannot make: it never receives the confirmation.
    if (password !== confirm) {
      setErrors({ confirm: "Those two passwords are different." });
      setFormError(null);
      focusField("confirm");
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
        if (body?.errors) {
          setErrors(body.errors);
          focusField(Object.keys(body.errors)[0]);
        } else setFormError(body?.error ?? "Something went wrong. Nothing was created.");
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
    <form ref={form} onSubmit={onSubmit} noValidate>
      {formError && (
        <div style={{ marginBottom: 16 }}>
          <Notice tone="clay" head="That didn&rsquo;t work" live>{formError}</Notice>
        </div>
      )}

      <fieldset className="auth-role" disabled={submitting}>
        <legend>Which account are you creating?</legend>
        <div className="auth-role-options">
          <label className="auth-role-option" data-selected={!isGuardian ? "true" : undefined}>
            <input type="radio" name="accountRole" value="founder" checked={!isGuardian}
              onChange={() => selectRole(false)} />
            <span><strong>Founder</strong>{" "}<span>I am building a business.</span></span>
          </label>
          <label className="auth-role-option" data-selected={isGuardian ? "true" : undefined}>
            <input type="radio" name="accountRole" value="guardian" checked={isGuardian}
              onChange={() => selectRole(true)} />
            <span><strong>Guardian</strong>{" "}<span>I am the adult helping a founder.</span></span>
          </label>
        </div>
        <p className="hint">{isGuardian
          ? "You must be 18 or over. Enter your own details: Stripe verifies the adult on the payment account."
          : "Founders can join from 13. A parent or legal guardian is needed before payments can be set up."}</p>
      </fieldset>

      <div className="auth-field-pair">
        <Field label="Your name" error={errors.name || undefined}>
          <input className="input" name="name" value={name} autoComplete="name"
            onBlur={blur("name", name)}
            onChange={(e) => { setName(e.target.value); clear("name"); }} placeholder="Alex Taylor" />
        </Field>

        <Field label="Email address" error={errors.email || undefined}>
          <input className="input" name="email" type="email" value={email} autoComplete="email"
            onBlur={blur("email", email)}
            onChange={(e) => { setEmail(e.target.value); clear("email"); }} placeholder="you@example.com" />
        </Field>
      </div>

      <PasswordField label="Password" error={errors.password || undefined}
        hint="At least 10 characters. A short sentence is easier to remember than a jumble."
        name="password" value={password} autoComplete="new-password"
        onBlur={blur("password", password)}
        onChange={(v) => { setPassword(v); clear("password"); }} />

      <PasswordField label="Confirm password" error={errors.confirm || undefined}
        name="confirm" value={confirm} autoComplete="new-password"
        onBlur={() => setErrors((x) => ({ ...x, confirm: confirm && confirm !== password ? "Those two passwords are different." : "" }))}
        onChange={(v) => { setConfirm(v); clear("confirm"); }} />

      <div className="auth-field-pair">
        <Field label="Date of birth" error={errors.dateOfBirth || undefined}
          hint="The full date, because the age rules turn on it. It is never shown publicly.">
          <input className="input" name="dateOfBirth" type="date" value={dateOfBirth}
            onBlur={blur("dateOfBirth", dateOfBirth)}
            onChange={(e) => { setDateOfBirth(e.target.value); clear("dateOfBirth"); }} max="2026-12-31" />
        </Field>

        <Field label="Where do you live?" error={errors.country || undefined}
          hint="The legal age to sign a contract is set locally, and it decides which route is open to you.">
          <select className="select" name="country" value={country} onChange={(e) => { setCountry(e.target.value); clear("country"); }}>
            <option value="">Choose a country</option>
            {SIGNUP_COUNTRIES.map(([code, label]) => (
              <option key={code} value={code}>{label}</option>
            ))}
          </select>
        </Field>
      </div>

      <Btn className="btn-w" type="submit" disabled={submitting}
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

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Btn, Field, Notice } from "@/app/_ui/form";
import { SIGNUP_COUNTRIES } from "@/app/_ui/countries";

/* ---------------- name and country ---------------- */

export function ProfileForm({
  initialName, initialCountry, countryLocked, lockedReason,
}: {
  initialName: string;
  initialCountry: string;
  countryLocked: boolean;
  lockedReason: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [country, setCountry] = useState(initialCountry);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  const dirty = name !== initialName || (!countryLocked && country !== initialCountry);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !dirty) return;

    setBusy(true); setErrors({}); setFormError(null); setSaved(false);
    try {
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        // Country is omitted entirely when locked, so a tampered select cannot
        // even attempt the change. The server refuses it regardless.
        body: JSON.stringify({ name, ...(countryLocked ? {} : { countryCode: country }) }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        if (body?.errors) setErrors(body.errors);
        else setFormError(body?.error ?? "Nothing was changed.");
        setBusy(false);
        return;
      }
      setSaved(true);
      setBusy(false);
      router.refresh();
    } catch {
      setFormError("We couldn't reach the server. Nothing was changed.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      {formError && (
        <div style={{ marginBottom: 12 }}>
          <Notice tone="clay" head="That didn&rsquo;t work">{formError}</Notice>
        </div>
      )}
      {saved && (
        <div style={{ marginBottom: 12 }}>
          <Notice tone="pine" head="Saved">Your details are up to date.</Notice>
        </div>
      )}

      <Field label="Your name" error={errors.name}>
        <input className="input" value={name} autoComplete="name" maxLength={80}
          onChange={(e) => { setName(e.target.value); setSaved(false); }} />
      </Field>

      <Field
        label="Where you live"
        error={errors.countryCode}
        hint={countryLocked ? undefined : "This decides which rules apply to you."}
      >
        <select className="select" value={country} disabled={countryLocked}
          onChange={(e) => { setCountry(e.target.value); setSaved(false); }}>
          {SIGNUP_COUNTRIES.map(([code, label]) => (
            <option key={code} value={code}>{label}</option>
          ))}
        </select>
      </Field>

      {countryLocked && (
        <div style={{ marginTop: -4, marginBottom: 12 }}>
          <Notice tone="grey" head="Your country is fixed now">{lockedReason}</Notice>
        </div>
      )}

      <Btn type="submit" disabled={busy || !dirty} aria-busy={busy ? "true" : undefined}>
        {busy ? "Saving…" : "Save changes"}
      </Btn>
    </form>
  );
}

/* ---------------- password ---------------- */

export function PasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;

    // The server never receives the confirmation, so this check is only here.
    if (next !== confirm) {
      setErrors({ confirm: "Those two passwords are different." });
      setFormError(null);
      return;
    }

    setBusy(true); setErrors({}); setFormError(null); setDone(null);
    try {
      const res = await fetch("/api/account/password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        if (body?.errors) setErrors(body.errors);
        else setFormError(body?.error ?? "Your password was not changed.");
        setBusy(false);
        return;
      }
      setDone(body.signedOutElsewhere ?? 0);
      setCurrent(""); setNext(""); setConfirm("");
      setBusy(false);
    } catch {
      setFormError("We couldn't reach the server. Your password was not changed.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      {formError && (
        <div style={{ marginBottom: 12 }}>
          <Notice tone="clay" head="That didn&rsquo;t work">{formError}</Notice>
        </div>
      )}
      {done !== null && (
        <div style={{ marginBottom: 12 }}>
          <Notice tone="pine" head="Password changed">
            {done > 0
              ? `You are still signed in here. ${done === 1 ? "One other session was" : `${done} other sessions were`} signed out.`
              : "You are still signed in here, and there were no other sessions to end."}
          </Notice>
        </div>
      )}

      <Field label="Current password" error={errors.currentPassword}>
        <input className="input" type="password" value={current} autoComplete="current-password"
          onChange={(e) => { setCurrent(e.target.value); setDone(null); }} />
      </Field>

      <Field label="New password" error={errors.newPassword}
        hint="At least 10 characters. A short sentence is easier to remember than a jumble.">
        <input className="input" type="password" value={next} autoComplete="new-password"
          onChange={(e) => { setNext(e.target.value); setDone(null); }} />
      </Field>

      <Field label="Confirm new password" error={errors.confirm}>
        <input className="input" type="password" value={confirm} autoComplete="new-password"
          onChange={(e) => { setConfirm(e.target.value); setDone(null); }} />
      </Field>

      <Btn type="submit" disabled={busy} aria-busy={busy ? "true" : undefined}>
        {busy ? "Changing…" : "Change password"}
      </Btn>
    </form>
  );
}

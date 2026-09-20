"use client";

// Set a new password from a reset link.
//
// The token arrives in the URL and is submitted with the form rather than acted
// on when the page loads. That is the fix for the bug that bit the verification
// link on this site: an email scanner fetched the link before the human did and
// spent the one-time token, so the person clicking got "already used". A page
// that only renders until someone submits cannot be consumed by a scanner.

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Btn, Notice, PasswordField } from "@/app/_ui/form";

export default function ResetForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setErrors({}); setFormError(null);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        // A dead link is its own state, not a form error: the answer is a new
        // link, and telling someone "that didn't work" next to a password box
        // invites them to retype the password instead.
        if (body?.expired) setExpired(true);
        else if (body?.errors) setErrors(body.errors);
        else setFormError(body?.error ?? "That didn't go through.");
        setBusy(false);
        return;
      }
      setDone(true);
      setBusy(false);
    } catch {
      setFormError("We couldn’t reach the server. Your password has not changed.");
      setBusy(false);
    }
  }

  if (done) {
    return (
      <Notice tone="pine" head="Password changed" live>
        <p style={{ margin: "0 0 12px" }}>
          Every device that was signed in has been signed out, including this one. Sign in with
          your new password.
        </p>
        <Btn type="button" onClick={() => router.push("/auth/signin")}>Sign in</Btn>
      </Notice>
    );
  }

  if (expired) {
    return (
      <Notice tone="amber" head="This link has expired" live>
        <p style={{ margin: "0 0 12px" }}>
          Reset links last one hour and work once. Your password has not changed, and asking for
          another takes a moment.
        </p>
        <Link className="btn" href="/auth/forgot-password">Send me a new link</Link>
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
      <PasswordField
        label="Your new password"
        value={password}
        onChange={setPassword}
        error={errors.password}
        autoComplete="new-password"
        hint="At least 10 characters. A short sentence you will remember beats something clever."
      />
      <Btn type="submit" disabled={busy} aria-busy={busy ? "true" : undefined}>
        {busy ? "Saving…" : "Set my new password"}
      </Btn>
    </form>
  );
}

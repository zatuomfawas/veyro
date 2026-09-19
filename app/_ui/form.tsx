"use client";

// Form and feedback primitives, verbatim from prototype/veyro.jsx. Shared by
// the checker and the auth pages so there is one Btn, one Field, one Notice —
// including Notice's inline borderRadius: 8, which is the prototype's actual
// current state and not mine to quietly "fix" here.

import React, { useId, useMemo, useState } from "react";

type BtnVariant = "1" | "2" | "q" | "d";
type BtnSize = "sm" | "lg";
const VARIANT_CLASS: Record<BtnVariant, string> = { "1": "", "2": " btn-2", q: " btn-q", d: " btn-d" };

// `ref` is declared explicitly because React 19 passes it as an ordinary prop
// to function components, but ButtonHTMLAttributes does not include it.
export function Btn({
  variant = "1", size, className = "", ...p
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: BtnVariant;
  size?: BtnSize;
  ref?: React.Ref<HTMLButtonElement>;
}) {
  const z = size === "lg" ? " btn-lg" : size === "sm" ? " btn-sm" : "";
  return <button {...p} className={"btn" + VARIANT_CLASS[variant] + z + (className ? " " + className : "")} />;
}

let fieldSeq = 0;
export function Field({
  label, hint, error, children,
}: { label: React.ReactNode; hint?: React.ReactNode; error?: React.ReactNode; children: React.ReactNode }) {
  const id = useMemo(() => "f" + ++fieldSeq, []);
  const child = React.isValidElement<{ "aria-invalid"?: string; "aria-describedby"?: string }>(children)
    ? React.cloneElement(children, {
        "aria-invalid": error ? "true" : undefined,
        "aria-describedby": error ? id + "-e" : hint ? id + "-h" : undefined,
      })
    : children;
  return (
    <label className="field">
      <span className="lbl">{label}</span>
      {child}
      {error ? <span className="err" id={id + "-e"} role="alert">{error}</span>
        : hint ? <span className="hint" id={id + "-h"}>{hint}</span> : null}
    </label>
  );
}

type Tone = "amber" | "clay" | "pine" | "slate" | "grey";
const NOTICE_BG: Record<Tone, string> = {
  amber: "var(--amber-bg)", clay: "var(--clay-bg)", pine: "var(--pine-bg)", slate: "var(--slate-bg)", grey: "var(--surface)",
};
const NOTICE_BORDER: Record<Tone, string> = {
  amber: "var(--amber-line)", clay: "var(--clay-line)", pine: "var(--pine-line)", slate: "var(--slate-line)", grey: "var(--line)",
};

/** Failure and blocked states. Never a code, always: what happened, why, what next. */
export function Notice({
  tone = "amber", head, children, action,
}: { tone?: Tone; head: React.ReactNode; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div style={{ background: NOTICE_BG[tone], border: "1px solid " + NOTICE_BORDER[tone], borderRadius: 8, padding: "14px 16px" }}>
      <div style={{ fontSize: "var(--fs-3)", fontWeight: 560, marginBottom: 4 }}>{head}</div>
      <div className="small" style={{ maxWidth: "var(--m-body)" }}>{children}</div>
      {action && <div style={{ marginTop: 12 }}>{action}</div>}
    </div>
  );
}

/**
 * A password input with a show/hide toggle.
 *
 * Hiding a password protects it from someone reading over your shoulder, which
 * is a real threat. It also makes typos invisible, which is why people paste
 * passwords, retype them three times, or pick something shorter. Offering the
 * toggle keeps the protection and removes the guessing.
 *
 * The button is type="button" so it never submits the form, and it is labelled
 * for screen readers rather than relying on the visible "Show" text alone.
 * `.pwwrap` and `.pwtoggle` were already in the design system, unused.
 */
export function PasswordField({
  label, hint, error, value, onChange, onBlur, autoComplete, name,
}: {
  label: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  autoComplete?: string;
  name?: string;
}) {
  const [shown, setShown] = useState(false);
  // Caps Lock is invisible behind dots, so the classic failure is typing the
  // right password in the wrong case three times and concluding the account is
  // broken. getModifierState is read from the event rather than tracked from
  // keystrokes, so it is correct even when the key was pressed before the field
  // was focused, or in another window.
  const [capsLock, setCapsLock] = useState(false);
  const id = useId();

  const readCapsLock = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setCapsLock(e.getModifierState("CapsLock"));
  };

  return (
    <Field label={label} hint={hint} error={error}>
      <span className="pwwrap" style={{ display: "block" }}>
        <input
          id={id}
          className="input"
          name={name}
          type={shown ? "text" : "password"}
          value={value}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          onBlur={(e) => { setCapsLock(false); onBlur?.(); void e; }}
          onKeyDown={readCapsLock}
          onKeyUp={readCapsLock}
          style={{ paddingRight: 64 }}
          aria-describedby={capsLock ? id + "-caps" : undefined}
        />
        <button
          type="button"
          className="pwtoggle"
          aria-controls={id}
          aria-pressed={shown}
          onClick={() => setShown((v) => !v)}
        >
          {shown ? "Hide" : "Show"}
          <span className="sr-only"> password</span>
        </button>
      </span>

      {/* role="status" rather than "alert": it is a heads-up, not an error, and
          an assertive announcement would interrupt someone mid-password. */}
      {capsLock && (
        <span
          id={id + "-caps"}
          role="status"
          className="hint"
          style={{ display: "block", marginTop: 6, color: "var(--amber)" }}
        >
          Caps Lock is on.
        </span>
      )}
    </Field>
  );
}

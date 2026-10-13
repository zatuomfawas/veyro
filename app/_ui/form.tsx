"use client";

import React, { useId, useState } from "react";

type BtnVariant = "1" | "2" | "q" | "d";
type BtnSize = "sm" | "lg";
const VARIANT_CLASS: Record<BtnVariant, string> = { "1": "", "2": " btn-2", q: " btn-q", d: " btn-d" };

export function Btn({
  variant = "1", size, className = "", ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: BtnVariant;
  size?: BtnSize;
  ref?: React.Ref<HTMLButtonElement>;
}) {
  const sizeClass = size === "lg" ? " btn-lg" : size === "sm" ? " btn-sm" : "";
  return <button {...props} className={"btn" + VARIANT_CLASS[variant] + sizeClass + (className ? " " + className : "")} />;
}

type FieldControlProps = {
  id?: string;
  "aria-invalid"?: React.AriaAttributes["aria-invalid"];
  "aria-describedby"?: string;
};

export function Field({
  label, hint, error, children, id: idProp,
}: {
  label: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  children: React.ReactNode;
  /** For wrapped controls, supply their ID and wire their ARIA descriptions. */
  id?: string;
}) {
  const autoId = useId();
  const control = React.isValidElement<FieldControlProps>(children) ? children : null;
  const id = idProp ?? control?.props.id ?? autoId;
  const describedBy = [
    control?.props["aria-describedby"],
    error ? id + "-e" : hint ? id + "-h" : undefined,
  ].filter(Boolean).join(" ") || undefined;
  const child = idProp === undefined && control
    ? React.cloneElement(control, {
        id,
        "aria-invalid": error ? true : control.props["aria-invalid"],
        "aria-describedby": describedBy,
      })
    : children;

  return (
    <div className="field">
      <label className="lbl" htmlFor={id}>{label}</label>
      {child}
      {error ? <span className="err" id={id + "-e"} role="alert">{error}</span>
        : hint ? <span className="hint" id={id + "-h"}>{hint}</span> : null}
    </div>
  );
}

type Tone = "amber" | "clay" | "pine" | "slate" | "grey";

export function Notice({
  tone = "amber", head, children, action, live, lead,
}: {
  tone?: Tone;
  head: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
  /** Announce feedback that appears after an action. */
  live?: boolean;
  /** Larger heading for a primary result, such as eligibility. */
  lead?: boolean;
}) {
  return (
    <div role={live ? "status" : undefined} className={"notice notice-" + tone}>
      <div className={"notice-head" + (lead ? " notice-lead" : "")}>{head}</div>
      <div className="notice-body">{children}</div>
      {action && <div className="notice-action">{action}</div>}
    </div>
  );
}

export function PasswordField({
  label, hint, error, value, onChange, onBlur, autoComplete, name,
}: {
  label: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  autoComplete?: string;
  name?: string;
}) {
  const [shown, setShown] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const id = useId();
  const readCapsLock = (event: React.KeyboardEvent<HTMLInputElement>) => {
    setCapsLock(event.getModifierState("CapsLock"));
  };
  const describedBy = [
    error ? id + "-e" : hint ? id + "-h" : null,
    capsLock ? id + "-caps" : null,
  ].filter(Boolean).join(" ") || undefined;

  return (
    <Field label={label} hint={hint} error={error} id={id}>
      <span className="pwwrap">
        <input
          id={id}
          className="input password-input"
          name={name}
          type={shown ? "text" : "password"}
          value={value}
          autoComplete={autoComplete}
          onChange={(event) => onChange(event.target.value)}
          onBlur={() => { setCapsLock(false); onBlur?.(); }}
          onKeyDown={readCapsLock}
          onKeyUp={readCapsLock}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
        />
        <button
          type="button"
          className="pwtoggle"
          aria-controls={id}
          aria-pressed={shown}
          onClick={() => setShown((value) => !value)}
        >
          {shown ? "Hide" : "Show"}
          <span className="sr-only"> password</span>
        </button>
      </span>
      {capsLock && (
        <span id={id + "-caps"} role="status" className="hint caps-lock-note">
          Caps Lock is on.
        </span>
      )}
    </Field>
  );
}

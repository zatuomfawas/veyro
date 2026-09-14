"use client";

// Form and feedback primitives, verbatim from prototype/veyro.jsx. Shared by
// the checker and the auth pages so there is one Btn, one Field, one Notice —
// including Notice's inline borderRadius: 8, which is the prototype's actual
// current state and not mine to quietly "fix" here.

import React, { useMemo } from "react";

type BtnVariant = "1" | "2" | "q" | "d";
type BtnSize = "sm" | "lg";
const VARIANT_CLASS: Record<BtnVariant, string> = { "1": "", "2": " btn-2", q: " btn-q", d: " btn-d" };

export function Btn({
  variant = "1", size, className = "", ...p
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; size?: BtnSize }) {
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

"use client";

// An illustrative USD estimate, using the account's shared fee arithmetic.
// The native range and exact amount field describe the same value. No
// account data, payment request or network call is involved.

import { useId, useState } from "react";
import { formatMinor, parseMinor } from "@/lib/money";
import { feeMinor, FREE_FLOOR_MINOR } from "@/lib/pricing";

const BASE_MAX_MINOR = 100000;
const MAX_INPUT_USD = 1000000;
const STEP_MINOR = 2500;
const PRESETS_MINOR = [10000, 40000, 100000] as const;

export function PriceCalculator() {
  const [amount, setAmount] = useState("400.00");
  const id = useId();

  const entry = amount.trim();
  const numeric = /^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{0,2})?$/.test(entry);
  const parsed = numeric ? parseMinor(entry.replace(/\.$/, ""), "USD") : null;
  const earned = parsed !== null && parsed <= MAX_INPUT_USD * 100 ? parsed : null;
  const valid = earned !== null;
  const fee = earned === null ? null : feeMinor(earned);
  const keep = earned === null || fee === null ? null : earned - fee;
  const effective = earned !== null && earned > 0 && fee !== null ? (fee / earned) * 100 : 0;
  const free = fee === 0;
  // Larger exact entries remain usable; the range expands to include them.
  // A cent step also keeps an exact input aligned with its range value.
  const maxMinor = Math.max(BASE_MAX_MINOR, earned ?? 0);
  const stepMinor = earned !== null && earned % STEP_MINOR !== 0 ? 1 : STEP_MINOR;
  const setMinor = (minor: number) => setAmount((minor / 100).toFixed(2));

  return (
    <div className="calc contrast-surface">
      <div className="calc-top">
        <label className="fig-k" htmlFor={`${id}-amount`}>Your monthly earnings (USD)</label>
        <div className="calc-amount-field">
          <span aria-hidden="true">$</span>
          <input
            id={`${id}-amount`}
            className="calc-amount"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            spellCheck={false}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            onBlur={() => { if (earned !== null) setMinor(earned); }}
            aria-invalid={!valid}
            aria-describedby={`${id}-help${valid ? "" : ` ${id}-error`}`}
          />
        </div>
        <p className="calc-help" id={`${id}-help`}>Enter an amount or adjust the slider.</p>
        {!valid && (
          <p className="calc-input-error" id={`${id}-error`} role="status">
            Enter a USD amount from 0 to 1,000,000 with up to two decimal places.
          </p>
        )}
      </div>

      <label className="sr-only" htmlFor={id}>Adjust monthly earnings in US dollars</label>
      <input
        id={id}
        className="calc-range"
        type="range"
        min={0}
        max={maxMinor}
        step={stepMinor}
        value={earned ?? 0}
        onChange={(e) => setMinor(Number(e.target.value))}
        aria-valuetext={formatMinor(earned ?? 0, "USD")}
        aria-describedby={`${id}-out`}
        style={{ ["--calc-free" as string]: `${(FREE_FLOOR_MINOR / maxMinor) * 100}%` }}
      />
      <div className="calc-scale" aria-hidden="true">
        <span>$0</span>
        <span className="calc-mark">First $100 free</span>
        <span>${(maxMinor / 100).toLocaleString("en-US")}</span>
      </div>

      <div className="calc-presets" role="group" aria-label="Example monthly earnings">
        {PRESETS_MINOR.map((minor) => (
          <button type="button" key={minor} aria-pressed={earned === minor} onClick={() => setMinor(minor)}>
            ${(minor / 100).toLocaleString("en-US")}
          </button>
        ))}
      </div>

      <div className="calc-out figrow" id={`${id}-out`}>
        <div>
          <span className="fig-k">Veyro fee at the planned rate</span>
          <span className="fig fig-md" data-free={free ? "1" : undefined}>
            {fee === null ? "—" : formatMinor(fee, "USD")}
          </span>
          <span className="fig-sub">
            {earned === null
              ? "Enter a valid amount to calculate."
              : earned <= FREE_FLOOR_MINOR
              ? "Your first $100 each month is free."
              : `${effective.toFixed(2)}% of what you earned`}
          </span>
        </div>
        <div>
          <span className="fig-k">After the planned fee</span>
          <span className="fig fig-md fig-pos">{keep === null ? "—" : formatMinor(keep, "USD")}</span>
          <span className="fig-sub">Fee launch postponed. Stripe processing fees apply separately.</span>
        </div>
      </div>
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {earned !== null && fee !== null && keep !== null
          ? `Illustrative planned pricing. Monthly earnings ${formatMinor(earned, "USD")}. Veyro fee ${formatMinor(fee, "USD")}. After Veyro's fee ${formatMinor(keep, "USD")}, before Stripe processing fees. Fee launch postponed.`
          : "Enter a valid USD amount to see the fee estimate."}
      </p>
      <noscript>
        <p className="calc-help">This is a $400 example. Enable JavaScript to calculate another amount.</p>
      </noscript>
    </div>
  );
}

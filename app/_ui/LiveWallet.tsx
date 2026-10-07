"use client";

// The hero's product surface: a founder wallet you can actually poke.
//
// What it does, once, when scrolled into view:
//
//   the balance counts     from nothing up to $195.00, the real figure
//   a sale arrives         a row slides into the ledger
//   it settles             the row walks received -> settling -> available
//
// Then it stops. A loop would turn the hero into a screensaver.
//
// WHAT IS NEW: the month's arithmetic is a row of controls rather than a
// figure you take on trust. Hover or focus any term and the line underneath
// says what that number is; the others go quiet so the one you asked about is
// the one you see. Requesting a payout is a real click with a real state
// change.
//
// THE RULE THIS FILE IS STILL BUILT AROUND: nothing changes without a cause
// the viewer can see. That rule is why the button used to be inert -- it
// flipped itself to "Payout requested" on a timer, which is the interface
// claiming something happened that nobody did. A click is a cause. The timer
// was the problem, not the state change, so the button works now and nothing
// moves on its own.
//
// WHAT THE PAYOUT STATE DELIBERATELY DOES NOT DO: imply a duration. There is
// no progress bar, no countdown, no "arriving in 2 days". On a Standard
// connected account the payout runs on the provider's schedule and Veyro
// cannot predict it, so the state says what is true -- it has been asked for
// -- and says who decides when.
//
// ACCESSIBILITY: this used to be role="img" with aria-hidden on the body,
// which was right when it was a picture. It is not a picture any more, and
// focusable controls inside an aria-hidden subtree are reachable by keyboard
// and invisible to a screen reader, which is the worst of both. The figures
// are real buttons, the description is a visually-hidden summary, and the
// explanation line is a live region.

import { Fragment, useEffect, useReducer, useRef, useState } from "react";
import { formatMinor } from "@/lib/money";
import { feeMinor, FREE_FLOOR_MINOR } from "@/lib/pricing";
import { CountUp } from "@/app/_ui/CountUp";

// The arithmetic has to survive a sceptical parent adding it up.
const SALE_GROSS_MINOR = 2400;
const SALE_FEE_MINOR = 86;

// One month, and it balances: 210.00 - 8.55 - 3.30 - 3.15 = 195.00.
const COLLECTED_MINOR = 21000;
const PROCESSING_MINOR = 855;
const SETTLING_MINOR = 315;
// Not a literal. The example fee is computed by the same function that
// decides what a founder is actually charged, so a change to the pricing
// model cannot leave a wrong number sitting in the hero.
const VEYRO_FEE_MINOR = feeMinor(COLLECTED_MINOR);
const BALANCE_MINOR =
  COLLECTED_MINOR - PROCESSING_MINOR - VEYRO_FEE_MINOR - SETTLING_MINOR;

type Phase = 0 | 1 | 2 | 3;

const SEQUENCE: { at: number; to: Phase }[] = [
  { at: 1500, to: 1 },
  { at: 2400, to: 2 },
  { at: 3300, to: 3 },
];

const PRIOR = [
  { name: "Commission slot", sub: "Paid", amt: 4339 },
  { name: "Sticker pack", sub: "Paid", amt: 1135 },
];

/** The month, as five terms that add up. */
type TermKey = "collected" | "processing" | "veyro" | "settling" | "available";

const TERMS: { k: TermKey; label: string; amount: number; op?: string; note: string }[] = [
  {
    k: "collected", label: "Collected", amount: COLLECTED_MINOR,
    note: "Everything customers paid this month, before anything is taken out.",
  },
  {
    k: "processing", label: "Processing", amount: PROCESSING_MINOR, op: "−",
    note: "The card processor's own fee. It sets this and deducts it; Veyro never touches it.",
  },
  {
    k: "veyro", label: "Veyro", amount: VEYRO_FEE_MINOR, op: "−",
    note: `3% of the amount above ${formatMinor(FREE_FLOOR_MINOR, "USD")}. `
      + `On ${formatMinor(COLLECTED_MINOR, "USD")} that is 3% of `
      + `${formatMinor(COLLECTED_MINOR - FREE_FLOOR_MINOR, "USD")}.`,
  },
  {
    k: "settling", label: "Settling", amount: SETTLING_MINOR, op: "−",
    note: "Paid, but not cleared yet. It joins the balance once the processor releases it.",
  },
  {
    k: "available", label: "Available", amount: BALANCE_MINOR, op: "=",
    note: "Yours to request, whenever you like. Nobody has to approve it.",
  },
];

export function LiveWallet() {
  const [phase, setPhase] = useReducer((_: Phase, n: Phase) => n, 0 as Phase);
  /** Which term the pointer or keyboard is on. Null means none. */
  const [term, setTerm] = useState<TermKey | null>(null);
  const [requested, setRequested] = useState(false);
  const node = useRef<HTMLDivElement>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    const el = node.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver === "undefined") {
      ran.current = true;
      setPhase(3);
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting) || ran.current) return;
      ran.current = true;
      io.disconnect();
      for (const s of SEQUENCE) timers.push(setTimeout(() => setPhase(s.to), s.at));
    }, { threshold: 0.15 });

    io.observe(el);
    return () => { io.disconnect(); for (const t of timers) clearTimeout(t); };
  }, []);

  const saleVisible = phase >= 1;
  const saleState = phase >= 3 ? "available" : phase === 2 ? "settling" : "received";
  const saleTone = phase >= 3 ? "pine" : phase === 2 ? "amber" : "slate";
  const active = TERMS.find((t) => t.k === term);

  return (
    <div className="dp" ref={node} data-dim={term ? "1" : undefined}>
      {/* The whole thing in words, for anyone not seeing it. The controls
          below are real and reachable; this is the summary they sit in. */}
      <p className="sr-only">
        An example founder wallet. {formatMinor(COLLECTED_MINOR, "USD")} collected this month,
        less {formatMinor(PROCESSING_MINOR, "USD")} in processing fees,{" "}
        {formatMinor(VEYRO_FEE_MINOR, "USD")} to Veyro and{" "}
        {formatMinor(SETTLING_MINOR, "USD")} still settling, leaving{" "}
        {formatMinor(BALANCE_MINOR, "USD")} available to request. Every figure is invented.
      </p>

      <div className="dp-bar" aria-hidden="true">
        <span className="dp-dots"><i /><i /><i /></span>
        <span className="dp-title">Your wallet</span>
        <span className="dp-tag">Example</span>
      </div>

      <div className="dp-body">
        <div className="dp-head">
          <div>
            <span className="fig-k">{requested ? "Requested" : "Available to request"}</span>
            <span className="fig fig-xl lw-bal">
              <CountUp amountMinor={BALANCE_MINOR} currency="USD" />
            </span>
          </div>
          <button
            type="button"
            className="dp-cta"
            data-state={requested ? "done" : undefined}
            aria-pressed={requested}
            onClick={() => setRequested((v) => !v)}
          >
            {requested ? "Payout requested" : "Request a payout"}
          </button>
        </div>

        {/* The month's arithmetic, as controls. Hover, focus or tap a term
            and the line below says what it is; the rest go quiet so the
            answer is the only thing lit. */}
        <div
          className="lw-flow"
          onMouseLeave={() => setTerm(null)}
        >
          {TERMS.map((t) => (
            <Fragment key={t.k}>
              {t.op ? <span className="lw-op" aria-hidden="true">{t.op}</span> : null}
              <button
                type="button"
                className="lw-term"
                data-k={t.k}
                data-on={term === t.k ? "1" : undefined}
                onMouseEnter={() => setTerm(t.k)}
                onFocus={() => setTerm(t.k)}
                onBlur={() => setTerm(null)}
                onClick={() => setTerm((v) => (v === t.k ? null : t.k))}
                aria-describedby="lw-note"
              >
                <span className="lw-term-k">{t.label}</span>
                <span className="lw-term-v">{formatMinor(t.amount, "USD")}</span>
              </button>
            </Fragment>
          ))}
        </div>

        {/* One line, and it always holds the height of two so the card
            cannot change size as you move across the terms. */}
        <p className="lw-note" id="lw-note" role="status" aria-live="polite">
          {requested && !active
            ? "Asked for. The processor pays out on its own schedule — Veyro cannot speed that "
              + "up, slow it down, or stop it."
            : active
              ? active.note
              : "Hover any term to see what it is."}
        </p>

        <div className="chips lw-chips">
          {([
            ["Received", "slate", phase >= 1],
            ["Settling", "amber", phase >= 2],
            ["Available", "pine", phase >= 3],
          ] as const).map(([label, tone, on], i) => (
            <Fragment key={label}>
              {i > 0 && <span className="chip-sep" aria-hidden="true">&rarr;</span>}
              <span className="chip" data-tone={tone} data-on={on ? "1" : undefined}>{label}</span>
            </Fragment>
          ))}
        </div>

        <div className="led lw-led" aria-hidden="true">
          <div className="led-row lw-new" data-in={saleVisible ? "1" : undefined}>
            <span className="led-n">
              Notion Second Brain template
              <span className="led-sub">
                {formatMinor(SALE_GROSS_MINOR, "USD")} &minus;{" "}
                {formatMinor(SALE_FEE_MINOR, "USD")} fee
              </span>
            </span>
            <span className="chip" data-tone={saleTone} data-on="1">{saleState}</span>
            <span className="led-amt fig-pos">
              +{formatMinor(SALE_GROSS_MINOR - SALE_FEE_MINOR, "USD")}
            </span>
          </div>

          {PRIOR.map((r) => (
            <div className="led-row" key={r.name}>
              <span className="led-n">
                {r.name}
                <span className="led-sub">{r.sub}</span>
              </span>
              <span className="chip" data-tone="pine" data-on="1">Paid</span>
              <span className="led-amt">{formatMinor(r.amt, "USD")}</span>
            </div>
          ))}
        </div>

        <div className="dp-foot" aria-hidden="true">
          <span className="dp-dot" /> Last payout $49.50, sent to your bank on 20 Sept
        </div>
      </div>
    </div>
  );
}

"use client";

// The full founder wallet: the month, interrogable, on /how-it-works.
//
// It was the homepage hero's product surface too, in a cut-down "bare" mode
// with a reduced row count. That is gone. The hero needs a money position a
// visitor reads in two seconds; this needs the whole month a sceptic can add
// up. Trying to be both gave the hero five interrogable terms, three status
// chips, a live region and a ledger -- fourteen things competing with a
// headline. app/_ui/HeroWallet.tsx is the calm one; this is the thorough
// one, and they share their figures through wallet-example.ts.
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
// says what that number is. Activated explanations persist after a tap and
// all other financial values retain readable contrast.
//
// THE RULE THIS FILE IS STILL BUILT AROUND: nothing changes without a cause
// the viewer can see. That rule is why the button used to be inert -- it
// flipped itself to "Payout requested" on a timer, which is the interface
// claiming something happened that nobody did. A click is a cause. The timer
// was the problem, not the state change, so the button works now and nothing
// moves on its own.
//
// THE PAYOUT CONTROL IS A LINK NOW, NOT A BUTTON, and that is the most
// important thing in this file.
//
// It used to say "Request a payout" and flip to "Payout requested". Both
// halves were wrong in the same direction: on a Standard connected account
// the payouts belong to the account holder, who is the guardian, and they
// are scheduled in Stripe. Veyro can show the position; it cannot move the
// money, and it has no payout object to report a status for -- payout.*
// webhooks are deliberately not ingested. A founder reading the old button
// would have concluded they could take their money out from here.
//
// So it is "View in Stripe", it goes to the real dashboard destination, and
// the line underneath names who schedules the payout. No interactivity is
// lost: the figures are still interrogable, which is where the interactivity
// was doing honest work.
//
// WHAT IT STILL DELIBERATELY DOES NOT DO: imply a duration. No progress bar,
// no countdown, no "arriving in 2 days". The provider's schedule is not ours
// to predict.
//
// ACCESSIBILITY: this used to be role="img" with aria-hidden on the body,
// which was right when it was a picture. It is not a picture any more, and
// focusable controls inside an aria-hidden subtree are reachable by keyboard
// and invisible to a screen reader, which is the worst of both. The figures
// are real buttons, the description is a visually-hidden summary, and the
// explanation line is a live region.

import { Fragment, useEffect, useReducer, useRef, useState } from "react";
import { formatMinor } from "@/lib/money";
import { FREE_FLOOR_MINOR } from "@/lib/pricing";
import { CountUp } from "@/app/_ui/CountUp";
import { PAYOUTS_URL } from "@/lib/stripe-urls";
// The invented month lives in one file now, because the hero draws a calmer
// version of the same account and two components inventing their own
// figures is how two pages end up quoting different balances.
import {
  COLLECTED_MINOR, PROCESSING_MINOR, SETTLING_MINOR, VEYRO_FEE_MINOR, BALANCE_MINOR,
  SALE_GROSS_MINOR, SALE_FEE_MINOR, SALE_NAME, PRIOR,
} from "@/app/_ui/wallet-example";

type Phase = 0 | 1 | 2 | 3;

const SEQUENCE: { at: number; to: Phase }[] = [
  { at: 500, to: 1 },
  { at: 1100, to: 2 },
  { at: 1800, to: 3 },
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
    // Name the provider-owned transfer without asserting who holds the
    // Stripe login; that remains an unresolved setup detail in PRODUCT.md.
    note: "Cleared for payout under the account’s Stripe settings. Veyro keeps the record; "
      + "Stripe handles the bank transfer.",
  },
];

export function LiveWallet() {
  const [phase, setPhase] = useReducer((_: Phase, n: Phase) => n, 0 as Phase);
  /** Which term the pointer or keyboard is on. Null means none. */
  const [term, setTerm] = useState<TermKey | null>(null);
  const [chosenTerm, chooseTerm] = useState<TermKey | null>(null);
  const node = useRef<HTMLDivElement>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    const el = node.current;
    if (!el) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches || typeof IntersectionObserver === "undefined") {
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

    const finish = () => {
      ran.current = true;
      io.disconnect();
      for (const timer of timers) clearTimeout(timer);
      setPhase(3);
    };
    const onMotion = () => { if (motion.matches) finish(); };
    const onVisibility = () => { if (document.hidden && ran.current) finish(); };

    io.observe(el);
    motion.addEventListener("change", onMotion);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      io.disconnect();
      for (const timer of timers) clearTimeout(timer);
      motion.removeEventListener("change", onMotion);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const saleVisible = phase >= 1;
  // Capitalised like every other chip in the ledger. It was lower case
  // while the settled rows beside it said "Paid", which read as two kinds of
  // label in one column.
  const saleState = phase >= 3 ? "Available" : phase === 2 ? "Settling" : "Received";
  const saleTone = phase >= 3 ? "pine" : phase === 2 ? "amber" : "slate";
  // Pointer leave and blur end a preview; they must not clear a deliberate tap.
  const currentTerm = term ?? chosenTerm;
  const active = TERMS.find((t) => t.k === currentTerm);

  return (
    <div className="dp" ref={node} data-dim={term ? "1" : undefined}>
      {/* The whole thing in words, for anyone not seeing it. The controls
          below are real and reachable; this is the summary they sit in. */}
      <p className="sr-only">
        An example founder wallet at the planned pricing. Veyro fee launch is postponed.
        {formatMinor(COLLECTED_MINOR, "USD")} collected this month,
        less {formatMinor(PROCESSING_MINOR, "USD")} in processing fees,{" "}
        {formatMinor(VEYRO_FEE_MINOR, "USD")} to Veyro and{" "}
        {formatMinor(SETTLING_MINOR, "USD")} still settling, leaving an available balance of{" "}
        {formatMinor(BALANCE_MINOR, "USD")}. Payouts follow the payment account’s
        schedule in Stripe. Every figure is invented.
      </p>

      <div className="dp-bar" aria-hidden="true">
        <span className="dp-dots"><i /><i /><i /></span>
        <span className="dp-title">Your wallet</span>
        <span className="dp-tag">Example</span>
      </div>

      <div className="dp-body">
        <p className="lw-pricing-note small">Illustrative planned pricing. Veyro fees are postponed.</p>
        <div className="dp-head">
          <div>
            {/* "Available to request" implied the founder does the
                requesting. It is the available balance, which is the
                provider's own word for it and is what this figure is. */}
            <span className="fig-k">Available balance</span>
            <span className="fig fig-xl lw-bal">
              <CountUp amountMinor={BALANCE_MINOR} currency="USD" />
            </span>
          </div>
          {/* A real link to the real destination. The figures beside it are
              an example and say so; the place you would go is not. */}
          <a className="dp-cta" href={PAYOUTS_URL} target="_blank" rel="noopener noreferrer">
            View in Stripe
          </a>
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
                data-on={currentTerm === t.k ? "1" : undefined}
                onMouseEnter={() => setTerm(t.k)}
                onFocus={() => setTerm(t.k)}
                onBlur={() => setTerm(null)}
                onClick={() => { chooseTerm(t.k); setTerm(t.k); }}
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
          {active
            ? active.note
            : "Hover or choose a term to understand it. Stripe handles bank transfers "
              + "under the payment account’s settings."}
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
              {SALE_NAME}
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
          {/* Not "your bank". The bank account is the one attached to the
              connected account, which is in the guardian's name -- which is
              the sentence the rest of the site is at pains to make. */}
          <span className="dp-dot" /> Last payout $49.50, to the account&rsquo;s bank on 20 Sept
        </div>
      </div>
    </div>
  );
}

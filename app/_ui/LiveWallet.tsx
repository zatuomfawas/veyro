"use client";

// The hero's right-hand side: a founder wallet that actually does something.
//
// The static preview this replaces was a good picture of the product and a bad
// argument for it. A picture of a dashboard says "we drew a dashboard"; a
// balance that moves when a payment lands says "this is running". The whole
// difference the homepage needs is in those few seconds.
//
// What it does, once, when scrolled into view:
//
//   a sale arrives        a row slides into the ledger and the figures move
//   it settles            the row's chip walks received -> settling -> available
//   the money is taken    the balance steps up and a payout is requested
//
// Then it stops. A loop would turn the hero into a screensaver and the figures
// into decoration; this runs the product's actual sequence one time and leaves
// the result on screen, which is also the frame someone screenshotting it gets.
//
// THE RULE THIS FILE IS BUILT AROUND: the final state is what renders on the
// server. Not the first state, not a zero. With no JavaScript, with reduced
// motion, or if this never hydrates, the wallet shows the finished, internally
// consistent figures. On a page about money an empty number waiting to be
// filled in would be the worst thing that could happen, so it cannot: every
// value below is derived from END, and the animation walks backwards from it
// before walking forwards again.

import { Fragment, useEffect, useReducer, useRef } from "react";
import { formatMinor } from "@/lib/money";

// The arithmetic has to survive a sceptical parent adding it up, so it is
// stated once here and everything else is derived.
//
//   opening available   171.86
//   the sale            + 23.14  gross 24.00, less the 0.86 processing fee
//   closing available   195.00   <- the figure in the aria label
//
// Those three lines add up, and the opening figure is the one that was chosen
// to make them: a round 171.00 would have closed at 194.14 and the card would
// have been quietly wrong in front of exactly the reader who checks.
const OPENING_MINOR = 17186;
const SALE_GROSS_MINOR = 2400;
const SALE_FEE_MINOR = 86;
const END_MINOR = 19500;

type Phase = 0 | 1 | 2 | 3 | 4;
// 0 idle (opening balance)      3 available, balance steps up
// 1 sale lands, row appears     4 payout requested  <- the server-rendered end
// 2 settling

const SEQUENCE: { at: number; to: Phase }[] = [
  { at: 600, to: 1 },
  { at: 1500, to: 2 },
  { at: 2600, to: 3 },
  { at: 3900, to: 4 },
];

const PRIOR = [
  { name: "Commission slot", sub: "Paid", amt: 4339 },
  { name: "Sticker pack", sub: "Paid", amt: 1135 },
];

export function LiveWallet() {
  // Starts at the end. Only JS, having checked the motion setting, ever winds
  // it back to the beginning to play forwards.
  const [phase, setPhase] = useReducer((_: Phase, n: Phase) => n, 4 as Phase);
  const node = useRef<HTMLDivElement>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    const el = node.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (typeof IntersectionObserver === "undefined") return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting) || ran.current) return;
      ran.current = true;
      io.disconnect();
      // Wind back, then play. The rewind is applied in the same tick as the
      // first timer is scheduled so the end state is never painted twice.
      setPhase(0);
      for (const s of SEQUENCE) timers.push(setTimeout(() => setPhase(s.to), s.at));
    }, { threshold: 0.35 });

    io.observe(el);
    return () => { io.disconnect(); for (const t of timers) clearTimeout(t); };
  }, []);

  const saleVisible = phase >= 1;
  const balance = phase >= 3 ? END_MINOR : OPENING_MINOR;
  const requested = phase >= 4;

  const saleState = phase >= 3 ? "available" : phase === 2 ? "settling" : "received";
  const saleTone = phase >= 3 ? "pine" : phase === 2 ? "amber" : "slate";

  return (
    <div
      className="dp" ref={node}
      role="img"
      aria-label={
        "Example founder wallet. A $24.00 sale arrives, settles, and brings the balance "
        + "available to request to $195.00, which is then requested as a payout."
      }
    >
      <div className="dp-bar" aria-hidden="true">
        <span className="dp-dots"><i /><i /><i /></span>
        <span className="dp-title">Your wallet</span>
        <span className="dp-tag">Example</span>
      </div>

      <div className="dp-body" aria-hidden="true">
        <div className="dp-head">
          <div>
            <span className="fig-k">Available to request</span>
            {/* data-bump drives one short lift when the figure changes, so the
                eye is told where to look without the number itself moving. */}
            <span className="fig fig-xl lw-bal" data-bump={phase >= 3 ? "1" : undefined}>
              {formatMinor(balance, "USD")}
            </span>
          </div>
          <span className="dp-cta" data-state={requested ? "done" : undefined}>
            {requested ? "Payout requested" : "Request a payout"}
          </span>
        </div>

        {/* The sequence, named. This is the one place on the marketing site
            where a payment's whole life is visible at once, and the chips are
            the same component the rest of the site uses for it. */}
        <div className="chips lw-chips">
          {([
            ["Received", "slate", phase >= 1],
            ["Settling", "amber", phase >= 2],
            ["Available", "pine", phase >= 3],
            ["Requested", "pine", phase >= 4],
          ] as const).map(([label, tone, on], i) => (
            <Fragment key={label}>
              {i > 0 && <span className="chip-sep">&rarr;</span>}
              <span className="chip" data-tone={tone} data-on={on ? "1" : undefined}>{label}</span>
            </Fragment>
          ))}
        </div>

        <div className="led lw-led">
          {/* The arriving row. It holds its space from the first paint so the
              card never changes height -- a hero that grows by 44px as you
              read it is worse than one that does not move at all. */}
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

        <div className="dp-foot">
          <span className="dp-dot" /> {requested
            ? "Payout #00421 on its way to your bank"
            : "Last payout $49.50, 20 Sept"}
        </div>
      </div>
    </div>
  );
}

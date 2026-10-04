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
// THE RULE THIS FILE IS BUILT AROUND: the figures only ever move forwards.
//
// This used to render the FINISHED state on the server and wind back to the
// beginning to play. In the hero that rewind happens on screen at load, so
// the balance went 195 -> 171 -> 195 and read as a glitch, which is exactly
// what it was. Money going backwards in a wallet is the single worst thing
// this component could do, and it was doing it on the home page.
//
// So the server renders the OPENING state instead: $171.86 available, the
// sale not yet in the ledger, nothing requested. That is a complete and
// truthful wallet, just an earlier moment of one -- not a zero waiting to be
// filled in. The client starts exactly there and only advances.
//
// Reduced motion, and anything without an IntersectionObserver, is moved
// straight to the finished state: the whole story, none of the movement.

import { Fragment, useEffect, useReducer, useRef } from "react";
import { formatMinor } from "@/lib/money";
import { CountUp } from "@/app/_ui/CountUp";

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
  // Starts at the opening state, which is what the server rendered. Nothing
  // below ever sets a phase lower than the one before it.
  const [phase, setPhase] = useReducer((_: Phase, n: Phase) => n, 0 as Phase);
  const node = useRef<HTMLDivElement>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    const el = node.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver === "undefined") {
      // Straight to the end. One state change, no animation -- the balance
      // still never goes backwards, it simply arrives.
      ran.current = true;
      setPhase(4);
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting) || ran.current) return;
      ran.current = true;
      io.disconnect();
      for (const s of SEQUENCE) timers.push(setTimeout(() => setPhase(s.to), s.at));
      // 0.15, not a third. The card is tall -- 479px -- and on a short window
      // a third of it may never be on screen at once while the reader is
      // looking straight at the hero, which would mean the sequence silently
      // never plays. A sixth is enough to know it has been seen.
    }, { threshold: 0.15 });

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
        "Example founder wallet. A $24.00 sale arrives and settles, taking the balance "
        + "available to request from $171.86 to $195.00, which is then requested as a payout."
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
            {/* The money animation: the figure counts from the opening
                balance to the closing one as the sale becomes available. It
                is the only number on the site that moves, and it only moves
                up. */}
            <span className="fig fig-xl lw-bal">
              <CountUp to={balance} currency="USD" />
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

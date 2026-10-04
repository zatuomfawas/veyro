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
//   the balance counts     from nothing up to $195.00, the real figure
//   a sale arrives         a row slides into the ledger
//   it settles             the row walks received -> settling -> available
//
// Then it stops. A loop would turn the hero into a screensaver and the
// figures into decoration; this runs the product's actual sequence one time
// and leaves the result on screen, which is also the frame someone
// screenshotting it gets.
//
// TWO THINGS THIS DELIBERATELY DOES NOT DO, both of which it used to:
//
// It does not move the balance between two real figures. It showed $171.86
// stepping up to $195.00 as the sale settled, which is arithmetically right
// and reads as a glitch -- two numbers in the one place the page wants you
// to look, smaller one first. There is one balance here and it is $195.00.
//
// It does not change the button. "Request a payout" is a call to action, and
// flipping it to "Payout requested" on a timer is the interface claiming
// something happened that nobody did. The payment lifecycle is the chips'
// job; the button stays an invitation. For the same reason the sequence ends
// at Available rather than Requested: available is a state money is in, and
// requested is something a person chooses to do.
//
// THE RULE THIS FILE IS BUILT AROUND: nothing changes without a cause the
// viewer can see. The sale row sliding in is the cause of the chips moving.
// The count is a first-sight flourish on a figure that never changes again.

import { Fragment, useEffect, useReducer, useRef } from "react";
import { formatMinor } from "@/lib/money";
import { CountUp } from "@/app/_ui/CountUp";

// The arithmetic has to survive a sceptical parent adding it up. The sale is
// the one the ledger shows arriving; $195.00 is the balance it is part of,
// across the fourteen payments the card does not have room to list.
const SALE_GROSS_MINOR = 2400;
const SALE_FEE_MINOR = 86;
const BALANCE_MINOR = 19500;

type Phase = 0 | 1 | 2 | 3;
// 0 before the sale arrives (what the server renders)
// 1 the row slides in, received
// 2 settling
// 3 available  <- where it stops

// The balance count runs first and finishes before the sale starts arriving,
// so the two are read as two things rather than as one confusing one.
const SEQUENCE: { at: number; to: Phase }[] = [
  { at: 1500, to: 1 },
  { at: 2400, to: 2 },
  { at: 3300, to: 3 },
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
      // Straight to the end. One state change, no animation: the same final
      // frame everyone else arrives at, reached without the journey.
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
      // 0.15, not a third. The card is tall -- 479px -- and on a short window
      // a third of it may never be on screen at once while the reader is
      // looking straight at the hero, which would mean the sequence silently
      // never plays. A sixth is enough to know it has been seen.
    }, { threshold: 0.15 });

    io.observe(el);
    return () => { io.disconnect(); for (const t of timers) clearTimeout(t); };
  }, []);

  const saleVisible = phase >= 1;
  const saleState = phase >= 3 ? "available" : phase === 2 ? "settling" : "received";
  const saleTone = phase >= 3 ? "pine" : phase === 2 ? "amber" : "slate";

  return (
    <div
      className="dp" ref={node}
      role="img"
      aria-label={
        "Example founder wallet showing $195.00 available to request. A $24.00 sale arrives "
        + "and settles into it, leaving $23.14 after the processing fee."
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
              <CountUp amountMinor={BALANCE_MINOR} currency="USD" />
            </span>
          </div>
          <span className="dp-cta">Request a payout</span>
        </div>

        {/* The sequence, named. This is the one place on the marketing site
            where a payment's whole life is visible at once, and the chips are
            the same component the rest of the site uses for it. */}
        <div className="chips lw-chips">
          {([
            ["Received", "slate", phase >= 1],
            ["Settling", "amber", phase >= 2],
            ["Available", "pine", phase >= 3],
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
          <span className="dp-dot" /> Last payout $49.50, sent to your bank on 20 Sept
        </div>
      </div>
    </div>
  );
}

"use client";

// Pricing, as the instrument rather than the sentence.
//
// The page already said "earn $400 and you pay $9", which is correct and does
// nothing: the reader has to find themselves in someone else's example. A
// slider lets them put their own number in and watch the fee follow it, which
// is both a better answer and a demonstration of the one thing the pricing
// model is trying to prove -- that below $100 the number stays at zero.
//
// The free band is the point, so it is drawn: the track is tinted up to $100
// and the figure stays at $0.00 across the whole of it. Someone dragging from
// the left watches nothing happen for a quarter of the track, which is the
// argument the paragraph was making in words.
//
// Server-rendered at the default position with the real figures already in
// place, so this is readable and correct with no JavaScript -- it just stops
// being draggable.

import { useId, useState } from "react";
import { formatMinor } from "@/lib/money";
import { feeMinor, FREE_FLOOR_MINOR } from "@/lib/pricing";

const MAX_MINOR = 100000; // $1,000 a month: past this the band is rare enough
const START_MINOR = 40000; // $400, the figure the copy has always used
const STEP_MINOR = 2500;

export function PriceCalculator() {
  const [earned, setEarned] = useState(START_MINOR);
  const id = useId();

  const fee = feeMinor(earned);
  const keep = earned - fee;
  // The rate against the whole amount, which is the number a reader is
  // actually comparing with other platforms. It is always below 3%, and on
  // the free tier it is zero -- stating it is the strongest thing this
  // component does.
  const effective = earned > 0 ? (fee / earned) * 100 : 0;
  const free = fee === 0;

  return (
    <div className="calc">
      <div className="calc-top">
        <label className="fig-k" htmlFor={id}>You earn, in a month</label>
        <output className="fig fig-lg" htmlFor={id}>{formatMinor(earned, "USD")}</output>
      </div>

      <input
        id={id}
        className="calc-range"
        type="range"
        min={0}
        max={MAX_MINOR}
        step={STEP_MINOR}
        value={earned}
        onChange={(e) => setEarned(Number(e.target.value))}
        aria-describedby={`${id}-out`}
        style={{ ["--calc-free" as string]: `${(FREE_FLOOR_MINOR / MAX_MINOR) * 100}%` }}
      />
      <div className="calc-scale" aria-hidden="true">
        <span>$0</span>
        <span className="calc-mark">free under $100</span>
        <span>${(MAX_MINOR / 100).toLocaleString("en-US")}</span>
      </div>

      <div className="calc-out figrow" id={`${id}-out`}>
        <div>
          <span className="fig-k">Veyro&rsquo;s fee</span>
          <span className="fig fig-md" data-free={free ? "1" : undefined}>
            {formatMinor(fee, "USD")}
          </span>
          <span className="fig-sub">
            {free
              ? "Nothing. You are under the free limit."
              : `${effective.toFixed(2)}% of what you earned`}
          </span>
        </div>
        <div>
          <span className="fig-k">You keep</span>
          <span className="fig fig-md fig-pos">{formatMinor(keep, "USD")}</span>
          <span className="fig-sub">Before card processing fees, which are not ours.</span>
        </div>
      </div>
    </div>
  );
}

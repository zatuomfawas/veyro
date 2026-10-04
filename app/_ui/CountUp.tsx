"use client";

// A money figure that counts to its target instead of jumping to it.
//
// Used on one number: the available balance in the hero wallet, as a sale
// lands and it goes up. That restraint is the point. A page where every
// figure counts is a page of slot machines, and it undoes the thing the
// design system is for -- money you can read at a glance. One figure moving
// says "this is live software"; six say "this is a landing page".
//
// It animates BETWEEN values rather than up from zero. The earlier version
// always ran 0 -> target on first view, which meant the server's correct
// figure was painted, replaced by 0, and counted back up again. In the hero
// that rewind is on screen at load and reads as a glitch. This one only ever
// moves when its target moves, and only in the direction the target moved.
//
// requestAnimationFrame rather than an interval, so it tracks real elapsed
// time and lands exactly on the target rather than accumulating drift.

import { useEffect, useRef, useState } from "react";
import { formatMinor } from "@/lib/money";

export function CountUp({
  to, currency, durationMs = 950,
}: {
  /** The figure to display. Changing it animates from whatever is on screen. */
  to: number;
  currency: string;
  durationMs?: number;
}) {
  // Renders its target. On the server, and on the client's first paint, the
  // number on screen is simply the number it was given -- never a zero
  // waiting to be filled in, which on a page about money would be the worst
  // possible failure.
  const [shown, setShown] = useState(to);
  // What is actually painted, tracked outside React so a run that is already
  // in flight knows where it started from.
  const painted = useRef(to);
  const target = useRef(to);

  useEffect(() => {
    if (target.current === to) return;
    const from = painted.current;
    target.current = to;

    const set = (v: number) => { painted.current = v; setShown(v); };

    // Reduced motion gets the destination, immediately. That is what the
    // setting asks for: the information without the movement.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      set(to);
      return;
    }

    let raf = 0;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      // The same decelerate the rest of the page uses, so the figure settles
      // rather than stopping.
      const eased = 1 - Math.pow(1 - t, 3);
      if (t < 1) {
        set(Math.round(from + (to - from) * eased));
        raf = requestAnimationFrame(step);
      } else {
        // Landing on the exact figure matters more than the easing: the last
        // frame is set explicitly rather than trusted to arithmetic.
        set(to);
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to, durationMs]);

  return <span className="num">{formatMinor(shown, currency)}</span>;
}

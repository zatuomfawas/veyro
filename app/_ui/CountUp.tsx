"use client";

// A money figure that counts up the first time it is seen.
//
// Used on exactly one number: the available balance in the hero wallet. That
// restraint is the point. A page where every figure counts is a page of slot
// machines, and it undoes the thing the design system is for -- money you can
// read at a glance. One figure moving says "this is live software"; six say
// "this is a landing page".
//
// It runs ONCE, from zero, to the real figure. An earlier version animated
// between two real balances instead, so the hero showed $171.86 stepping up
// to $195.00 as a sale settled. That was accurate and it read as a glitch:
// two different numbers in the one place the page wants you to look, with
// the smaller one on screen first. The balance is $195.00. Counting to it
// from nothing is a flourish; counting to it from another balance is a
// change, and a change needs a reason the viewer can see.
//
// The final value is what renders on the server and what sits in the HTML.
// With no JavaScript, with reduced motion, or if this never hydrates, the
// correct number is already on screen. Nothing is ever a zero waiting to be
// filled in -- on a page about money that would be the worst possible
// failure. The run begins and ends inside one animation frame boundary, so
// the zero is never painted on its own.
//
// requestAnimationFrame rather than an interval, so it tracks real elapsed
// time and lands exactly on the target rather than accumulating drift.

import { useEffect, useRef, useState } from "react";
import { formatMinor } from "@/lib/money";

export function CountUp({
  amountMinor, currency, durationMs = 1100, startDelayMs = 0,
}: {
  amountMinor: number;
  currency: string;
  durationMs?: number;
  /** Hold at zero briefly so the count reads as deliberate, not as a stutter. */
  startDelayMs?: number;
}) {
  // Starts at the real value. Only JS, having checked the motion setting,
  // ever moves it away from that.
  const [shown, setShown] = useState(amountMinor);
  const node = useRef<HTMLSpanElement>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    const el = node.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (typeof IntersectionObserver === "undefined") return;

    let raf = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting) || ran.current) return;
      ran.current = true;
      io.disconnect();

      const run = () => {
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / durationMs);
          // The same decelerate the rest of the page uses, so the number
          // settles rather than stopping.
          const eased = 1 - Math.pow(1 - t, 3);
          if (t < 1) {
            setShown(Math.round(amountMinor * eased));
            raf = requestAnimationFrame(tick);
          } else {
            // Landing on the exact figure matters more than the easing: the
            // last frame is set explicitly rather than trusted to arithmetic.
            setShown(amountMinor);
          }
        };
        setShown(0);
        raf = requestAnimationFrame(tick);
      };

      if (startDelayMs > 0) timer = setTimeout(run, startDelayMs);
      else run();
    }, { threshold: 0.15 });

    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      if (timer) clearTimeout(timer);
    };
  }, [amountMinor, durationMs, startDelayMs]);

  return (
    <span ref={node} className="num">
      {formatMinor(shown, currency)}
    </span>
  );
}

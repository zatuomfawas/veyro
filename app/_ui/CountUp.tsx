"use client";

// A money figure that counts up the first time it is seen.
//
// Used on exactly one number: the available balance in the hero preview. That
// restraint is the point. A page where every figure counts is a page of slot
// machines, and it undoes the thing the design system is for — money you can
// read at a glance. One figure moving says "this is live software"; six say
// "this is a landing page".
//
// The final value is what renders on the server and what sits in the HTML. With
// no JavaScript, with reduced motion, or if this component never hydrates, the
// correct number is already on screen. Nothing is ever a zero waiting to be
// filled in — on a page about money that would be the worst possible failure.
//
// requestAnimationFrame rather than an interval, so it tracks real elapsed time
// and lands exactly on the target rather than accumulating drift.

import { useEffect, useRef, useState } from "react";
import { formatMinor } from "@/lib/money";

export function CountUp({
  amountMinor, currency, durationMs = 900,
}: {
  amountMinor: number;
  currency: string;
  durationMs?: number;
}) {
  // Starts at the real value. Only JS, having checked the motion setting, ever
  // moves it away from that.
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
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting) || ran.current) return;
      ran.current = true;
      io.disconnect();

      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / durationMs);
        // The same decelerate the rest of the page uses, so the number settles
        // rather than stopping.
        const eased = 1 - Math.pow(1 - t, 3);
        setShown(Math.round(amountMinor * eased));
        if (t < 1) raf = requestAnimationFrame(tick);
        // Landing on the exact figure matters more than the easing: the last
        // frame is set explicitly rather than trusted to arithmetic.
        else setShown(amountMinor);
      };
      // Hide the start of the run behind one frame so the jump to 0 is never
      // painted on its own.
      setShown(0);
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.4 });

    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [amountMinor, durationMs]);

  return (
    <span ref={node} className="num">
      {formatMinor(shown, currency)}
    </span>
  );
}

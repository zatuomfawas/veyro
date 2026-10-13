"use client";

import { useEffect, useRef } from "react";
import { formatMinor } from "@/lib/money";

/** A one-time illustrative preview. Account balances should render directly. */
export function CountUp({
  amountMinor, currency, durationMs = 920, fromMinor = 0,
}: {
  amountMinor: number;
  currency: string;
  durationMs?: number;
  fromMinor?: number;
}) {
  const node = useRef<HTMLSpanElement>(null);
  const value = useRef<HTMLSpanElement>(null);
  const ran = useRef(false);
  const formatted = formatMinor(amountMinor, currency);

  useEffect(() => {
    const el = node.current;
    const display = value.current;
    if (!el || !display) return;

    // The HTML and accessible text always contain the final formatted value.
    display.textContent = formatMinor(amountMinor, currency);
    if (ran.current) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches || typeof IntersectionObserver === "undefined") {
      ran.current = true;
      return;
    }

    let raf = 0;
    const finish = () => {
      ran.current = true;
      cancelAnimationFrame(raf);
      display.textContent = formatMinor(amountMinor, currency);
      observer.disconnect();
    };

    // Related figures can observe the same preview, starting in one frame.
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting) || ran.current) return;
      ran.current = true;
      observer.disconnect();
      const start = performance.now();
      const duration = Math.max(1, durationMs);

      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 4);
        const amount = Math.round(fromMinor + (amountMinor - fromMinor) * eased);
        display.textContent = formatMinor(progress === 1 ? amountMinor : amount, currency);
        if (progress < 1) raf = requestAnimationFrame(tick);
      };

      // Do not paint a separate zero frame before the animation starts.
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.2 });

    observer.observe(el.closest("[data-count-group]") ?? el);
    const onMotion = () => { if (motion.matches) finish(); };
    const onVisibility = () => { if (document.hidden && ran.current) finish(); };
    motion.addEventListener("change", onMotion);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
      motion.removeEventListener("change", onMotion);
      document.removeEventListener("visibilitychange", onVisibility);
      display.textContent = formatMinor(amountMinor, currency);
    };
  }, [amountMinor, currency, durationMs, fromMinor]);

  return (
    <span ref={node} className="num countup">
      <span className="countup-reserve" aria-hidden="true">{formatted}</span>
      <span ref={value} className="countup-value" aria-hidden="true">{formatted}</span>
      <span className="sr-only">{formatted}</span>
    </span>
  );
}

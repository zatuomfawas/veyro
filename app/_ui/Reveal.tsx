"use client";

// Reveals elements as they scroll into view. Renders nothing.
//
// ONE OBSERVER, AND THE PAGE DECLARES WHAT MOVES. Groups are passed in rather
// than inferred from class names in here, so the intent is readable where it
// is decided. Each group names a selector, optionally a kind of motion, and
// optionally a per-item delay, which is how a row of three reads as one
// movement instead of three coincidences.
//
// THE SAFETY PROPERTY MATTERS MORE THAN THE EFFECT, and it is the reason this
// is built the way it is. The stylesheet hides a revealed element only under
// [data-motion="on"], and that flag goes on here, after mount, after the
// motion preference has been checked. With no JavaScript, with a crawler, with
// an old browser, or with reduced motion, every element renders placed and
// opaque. Content is never hidden first and left waiting on a script to bring
// it back -- which is the failure that turns a scroll animation into a blank
// page.
//
// NOTHING RE-HIDES ON THE WAY OUT. An element that fades as you scroll back up
// is motion nobody asked for, and on a long page it reads as the page coming
// apart. Each target is unobserved the moment it arrives.
//
// WHAT CHANGED, AND WHY IT IS NOT THE OLD ONE. This used to take a single
// selector and give every match the same fade-up: forty elements performing
// one identical gesture, which stops being an entrance by the third section
// and is the thing the craft floor means by scattered effects. Motion is
// authored per group now, the delays are inline so a group of any length can
// stagger properly instead of stopping at three, and the kinds are built on
// the hairlines this layout is actually made of.

import { useEffect } from "react";

export type RevealGroup = {
  /** What to reveal, relative to the scope. */
  select: string;
  /** Which entrance. Omitted is the plain rise. */
  kind?: "rule" | "rule-y" | "settle";
  /** Milliseconds between one item and the next. */
  stagger?: number;
  /**
   * How many items keep staggering before the delay stops growing. A long
   * list that kept adding delay would leave its last rows waiting seconds
   * after the first arrived, which reads as lag rather than as rhythm.
   */
  maxStagger?: number;
};

export function Reveal({ scope, groups }: { scope: string; groups: RevealGroup[] }) {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(scope);
    if (!root) return;

    // Asked for less motion, or the browser cannot observe: leave everything
    // visible and do nothing else.
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (still.matches || typeof IntersectionObserver === "undefined") return;

    const targets: HTMLElement[] = [];
    for (const g of groups) {
      const found = Array.from(root.querySelectorAll<HTMLElement>(g.select));
      found.forEach((el, i) => {
        // Already claimed by an earlier group. Two entrances on one element
        // would fight over the same transform.
        if (el.dataset.reveal !== undefined) return;
        el.dataset.reveal = "";
        if (g.kind) el.dataset.rv = g.kind;
        if (g.stagger) {
          const step = Math.min(i, g.maxStagger ?? 4);
          if (step > 0) el.style.transitionDelay = step * g.stagger + "ms";
        }
        targets.push(el);
      });
    }
    if (targets.length === 0) return;

    // Anything already on screen at load is marked before the flag goes on, so
    // the first viewport does not flash from hidden to visible. That is the
    // difference between an entrance and a layout bug.
    const vh = window.innerHeight;
    for (const el of targets) {
      if (el.getBoundingClientRect().top < vh * 0.92) {
        el.dataset.shown = "1";
        // No delay on what is already there: a stagger is for a group the
        // reader watches arrive, not for the screen they opened on.
        el.style.transitionDelay = "";
      }
    }
    root.dataset.motion = "on";

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          // Promoted for the length of the animation and then put back.
          // will-change left on permanently keeps a compositing layer per
          // element for the rest of the session, which on a page with forty
          // of them costs memory and can make later scrolling worse than the
          // animation ever improved it.
          el.style.willChange = "opacity, transform";
          el.dataset.shown = "1";
          io.unobserve(el);
          el.addEventListener("transitionend", () => {
            el.style.willChange = "";
            // The delay has done its job; leaving it on would apply to any
            // later transition this element happens to run.
            el.style.transitionDelay = "";
          }, { once: true });
        }
      },
      // Positive, so the root box is grown downward and an element starts
      // moving just before it scrolls into view. This used to be -12%, which
      // shrinks the box and fires LATE: the comment said "a little before the
      // edge" and the sign said the opposite, so content began arriving only
      // once it was already being looked at. Measured on the money band, the
      // whole dark section read as a blank rectangle for the first fifth of
      // its own entrance.
      { rootMargin: "0px 0px 12% 0px", threshold: 0.01 },
    );
    for (const el of targets) if (el.dataset.shown !== "1") io.observe(el);

    // If the setting changes mid-session, put everything back and stop.
    const onChange = () => {
      if (!still.matches) return;
      io.disconnect();
      delete root.dataset.motion;
      for (const el of targets) el.dataset.shown = "1";
    };
    still.addEventListener("change", onChange);

    return () => {
      io.disconnect();
      still.removeEventListener("change", onChange);
      delete root.dataset.motion;
      for (const el of targets) {
        delete el.dataset.reveal;
        delete el.dataset.rv;
        delete el.dataset.shown;
        el.style.transitionDelay = "";
        el.style.willChange = "";
      }
    };
  }, [scope, groups]);

  return null;
}

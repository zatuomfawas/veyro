"use client";

// Reveals [data-reveal] elements as they come into view. Renders nothing.
//
// One IntersectionObserver for the whole page rather than a component per
// element: the landing page has around forty things worth revealing, and forty
// React components and forty observers to move some opacity would be a worse
// trade than the effect is worth.
//
// The safety property matters more than the effect. CSS hides a revealed
// element only under [data-motion="on"], and this sets that flag after it
// mounts — so with no JavaScript, with a crawler, or with an old browser, every
// element renders placed and opaque exactly as it does today. Content is never
// hidden first and then waiting on a script to bring it back.
//
// prefers-reduced-motion is checked before the flag is set, so under that
// setting nothing is ever hidden and no observer is created at all. The
// stylesheet carries a belt-and-braces rule for the same case.

import { useEffect } from "react";

export function Reveal({
  scope, select, stagger,
}: {
  /** The element the [data-motion] flag goes on. */
  scope: string;
  /**
   * What to reveal, as a selector. Explicit and passed from the page so the
   * intent is readable where it is decided, rather than hidden in here as a
   * rule about class names that nobody finds later.
   */
  select: string;
  /** Selectors whose matched children arrive one after another, up to three. */
  stagger?: string;
}) {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(scope);
    if (!root) return;

    // Asked for less motion, or the browser cannot observe: leave everything
    // visible and do nothing else.
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (still.matches || typeof IntersectionObserver === "undefined") return;

    const targets = Array.from(root.querySelectorAll<HTMLElement>(select));
    if (targets.length === 0) return;
    for (const el of targets) el.dataset.reveal = "";

    // Children of a staggered container follow each other rather than landing
    // together, which is what makes a row of three read as one movement.
    if (stagger) {
      for (const group of Array.from(root.querySelectorAll<HTMLElement>(stagger))) {
        Array.from(group.children).forEach((child, i) => {
          if (i === 0 || i > 3) return;
          (child as HTMLElement).dataset.delay = String(i);
        });
      }
    }

    // Anything already on screen when the page loads is marked before the flag
    // goes on, so the first viewport does not flash from hidden to visible.
    // That is the difference between an entrance and a layout bug.
    const vh = window.innerHeight;
    for (const el of targets) {
      if (el.getBoundingClientRect().top < vh * 0.9) el.dataset.shown = "1";
    }
    root.dataset.motion = "on";

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          (e.target as HTMLElement).dataset.shown = "1";
          // Once shown, stop watching. Nothing here re-hides on the way out:
          // an element that fades as you scroll back up is motion nobody asked
          // for, and on a long page it reads as the page coming apart.
          io.unobserve(e.target);
        }
      },
      // A little before the edge, so the movement finishes as the element
      // arrives rather than starting once it is already being read.
      { rootMargin: "0px 0px -12% 0px", threshold: 0.01 },
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
    };
  }, [scope, select, stagger]);

  return null;
}

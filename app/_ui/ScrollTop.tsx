"use client";

// Back to the top, once you are far enough down to want it.
//
// Appears after one viewport height, which is the point at which the header has
// been out of sight long enough that scrolling back by hand is a chore. No
// bounce, no pulse, no fade: it is either there or it is not.
//
// The scroll itself asks for smooth behaviour unless the reader has said they
// prefer reduced motion, in which case it jumps. The CSS makes the same
// promise for anchor links; this is the JavaScript half of it.

import { useEffect, useState } from "react";

export function ScrollTop({ label = "Top" }: { label?: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      type="button"
      className="totop"
      onClick={() => {
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
        // Send focus back to the top of the document as well, so a keyboard
        // user is not left reading the top of the page with their focus still
        // at the bottom of it.
        document.getElementById("main")?.focus?.();
      }}
    >
      <span className="totop-mark" aria-hidden="true">
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M6 10V2M6 2L2.5 5.5M6 2l3.5 3.5" stroke="var(--reverse)" strokeWidth="1.6" />
        </svg>
      </span>
      {label}
      <span className="sr-only"> of page</span>
    </button>
  );
}

"use client";

// How far through a long page you are.
//
// Only worth showing where there is enough to read that the answer is not
// obvious from the scrollbar: the Stripe article and the three legal documents.
// On a short page it is decoration, so it is not used there.
//
// aria-hidden, deliberately. It tells you nothing a screen reader cannot get
// better from the document structure, and announcing a percentage that changes
// on every scroll event would be noise.

import { useEffect, useState } from "react";

export function ScrollProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const update = () => {
      const doc = document.documentElement;
      // How much of the document is actually scrollable. Zero on a page that
      // fits the viewport, which would otherwise divide by zero and render a
      // full bar on a page with nothing to scroll.
      const scrollable = doc.scrollHeight - window.innerHeight;
      setPct(scrollable > 0 ? Math.min(100, (window.scrollY / scrollable) * 100) : 0);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div className="progress" aria-hidden="true">
      <i style={{ width: `${pct}%` }} />
    </div>
  );
}

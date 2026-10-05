"use client";

// The left margin of a long page, doing something.
//
// /how-it-works is nine thousand pixels tall and until now the 400px either
// side of it held nothing at all. That is not restraint, it is the reading
// column being correct and the page being the wrong shape around it -- the
// measure should stay at 66 characters and the space beside it should earn
// its place.
//
// So: where you are, how much is left, and one click to anywhere else. On a
// page this long that is the single most useful thing a margin can hold, and
// it is information the page already has rather than copy invented to fill a
// gap.
//
// It reads the document rather than taking a list of sections as props. A
// prop list is a second copy of the headings that silently goes stale the
// first time one is reworded, and these pages get reworded constantly. The
// cost is that the rail only exists once JavaScript has run; the grid track
// is reserved either way, so nothing moves when it arrives.

import { useEffect, useRef, useState } from "react";

type Item = { id: string; text: string };

const slug = (t: string) =>
  "s-" + t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48);

export function SectionRail({
  label = "On this page", selector = "h2", max = 24,
}: {
  label?: string;
  /** What counts as a section here. An FAQ's are its questions, not its one heading. */
  selector?: string;
  /** Past this many a rail stops being navigation and becomes a second page. */
  max?: number;
}) {
  const [items, setItems] = useState<Item[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const nav = useRef<HTMLElement>(null);

  // Collect the headings once, giving each one an id if it has not got one.
  //
  // Deferred a frame rather than run straight through. Partly because setting
  // state synchronously in an effect cascades a second render before paint,
  // and partly because it is the honest moment to measure: the web font
  // settles first, and these positions are what the active-section test reads.
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const main = document.querySelector("main");
      if (!main) return;
      const heads = [...main.querySelectorAll<HTMLElement>(selector)].filter(
        (h) => (h.textContent || "").trim().length > 0,
      ).slice(0, max);
      const seen = new Set<string>();
      const next: Item[] = [];
      for (const h of heads) {
        const text = (h.textContent || "").trim();
        let id = h.id || slug(text);
        // Two sections can legitimately share a heading; ids cannot.
        let n = 2;
        while (seen.has(id)) id = `${slug(text)}-${n++}`;
        seen.add(id);
        if (!h.id) h.id = id;
        next.push({ id, text });
      }
      // Below three sections a rail is furniture rather than navigation.
      setItems(next.length >= 3 ? next : []);
    });
    return () => cancelAnimationFrame(raf);
  }, [selector, max]);

  // Which section is being read, and how far through the page we are.
  useEffect(() => {
    if (!items.length) return;

    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, h.scrollTop / max)) : 0);
    };
    addEventListener("scroll", onScroll, { passive: true });

    // The active section is the last heading above the reading line, which is
    // what a reader means by "where am I". An IntersectionObserver alone
    // reports nothing while a long section's heading is off the top of the
    // screen, which is most of the time on these pages.
    const pick = () => {
      const line = 140;
      let current: string | null = items[0]?.id ?? null;
      for (const it of items) {
        const el = document.getElementById(it.id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= line) current = it.id;
        else break;
      }
      setActive(current);
    };
    addEventListener("scroll", pick, { passive: true });
    // Both readouts are seeded on the next frame for the same reason the
    // headings are: a synchronous set here renders twice before first paint.
    const raf = requestAnimationFrame(() => { onScroll(); pick(); });
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("scroll", onScroll);
      removeEventListener("scroll", pick);
    };
  }, [items]);

  // Keep the active entry in view when the rail is longer than its box.
  useEffect(() => {
    if (!active || !nav.current) return;
    const el = nav.current.querySelector<HTMLElement>(`[data-for="${CSS.escape(active)}"]`);
    if (!el) return;
    const box = nav.current.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    if (r.top < box.top || r.bottom > box.bottom) {
      el.scrollIntoView({ block: "nearest" });
    }
  }, [active]);

  if (!items.length) return null;

  const index = Math.max(0, items.findIndex((i) => i.id === active));

  return (
    <aside className="lfrail" aria-label={label}>
      <div className="lfrail-k">{label}</div>

      {/* The progress line is the rail's spine: the list hangs off it and the
          fill is literally how far down the page you are. */}
      <div className="lfrail-body">
        <div className="lfrail-line" aria-hidden="true">
          <span className="lfrail-fill" style={{ transform: `scaleY(${progress})` }} />
        </div>

        <nav className="lfrail-nav" ref={nav}>
          {items.map((it) => (
            <a
              key={it.id}
              href={`#${it.id}`}
              className="lfrail-a"
              data-for={it.id}
              data-on={it.id === active ? "1" : undefined}
              aria-current={it.id === active ? "true" : undefined}
            >
              {it.text}
            </a>
          ))}
        </nav>
      </div>

      <div className="lfrail-foot" aria-hidden="true">
        <span className="fig-ref">{String(index + 1).padStart(2, "0")}</span>
        <span className="lfrail-sep">/</span>
        <span className="fig-ref">{String(items.length).padStart(2, "0")}</span>
      </div>
    </aside>
  );
}

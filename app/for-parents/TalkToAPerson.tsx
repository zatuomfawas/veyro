"use client";

// "Rather talk to a person?", as a panel you can close.
//
// It was a sticky margin note, which meant it either scrolled past before a
// parent had decided anything or sat in the margin being ignored. The offer is
// most useful at the point someone has read enough to have a question, so it
// arrives then and can be sent away for good.
//
// FOUR THINGS IT DELIBERATELY IS NOT.
//
// Not a modal. A parent weighing whether to put their name on a payment
// account should never have the page they are reading taken away from them to
// be offered help. It is a corner panel; the page stays usable behind it and
// nothing is trapped.
//
// Not on page load. A panel that appears before anyone has read a sentence is
// an interruption rather than an offer, and the thing it offers only makes
// sense once there is a question to ask. It waits until the reader has got a
// screen and a half in, which is also roughly where the first hard answer is.
//
// Not coming back. Closing it writes to localStorage, so it stays closed on
// the next visit. A dismissal that is forgotten is not a dismissal. The write
// is wrapped because a private window throws on it, and if it does the panel
// simply behaves as it did before -- shown once per visit, still closeable.
//
// Not timed out. It does not leave on its own. Something that removes itself
// while you are reading it is worse than something that waits.

import { useEffect, useRef, useState } from "react";

const KEY = "veyro-talk-dismissed";

export function TalkToAPerson({ href }: { href: string }) {
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const dismissed = useRef(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(KEY) === "1") { dismissed.current = true; return; }
    } catch { /* a refused store is not a reason to withhold the offer */ }

    // A screen and a half: far enough in to have a question, early enough to
    // still be deciding.
    const trigger = () => {
      if (dismissed.current) return;
      if (window.scrollY > window.innerHeight * 1.5) {
        setOpen(true);
        window.removeEventListener("scroll", trigger);
      }
    };
    window.addEventListener("scroll", trigger, { passive: true });
    trigger();
    return () => window.removeEventListener("scroll", trigger);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function close() {
    dismissed.current = true;
    setOpen(false);
    try { localStorage.setItem(KEY, "1"); } catch { /* survivable */ }
  }

  if (!open) return null;

  return (
    // A complementary landmark, not a dialog: nothing here demands an answer
    // and nothing should steal the focus of somebody mid-sentence.
    <aside className="talkpop" ref={panel} aria-labelledby="talkpop-h">
      <div className="talkpop-h">
        <h2 className="talkpop-t" id="talkpop-h">Rather talk to a person?</h2>
        <button
          type="button"
          className="talkpop-x"
          onClick={close}
          aria-label="Close. This will not show again."
        >
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <p className="talkpop-b">
        <a className="linkbtn" href={href}>Email us directly</a> and a person replies &mdash; not
        a form, and not your child&rsquo;s account manager. Reading all of this and still saying
        no is a perfectly good outcome.
      </p>
    </aside>
  );
}

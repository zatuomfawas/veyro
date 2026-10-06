"use client";

// In-page links that work even when their target is folded away.
//
// The dashboard keeps Setup, Your guardian, Payments and Products inside a
// collapsed <details class="acct">. Three buttons in the wallet overview point
// into it -- "Invite guardian", "Send a new invite", "Create product" -- and a
// browser cannot scroll to something a closed <details> is not rendering. So
// the one button a founder with no guardian most needs did nothing at all,
// which reads as the page being broken rather than as a section being shut.
//
// The fix is a document-level click handler rather than an onClick on each
// button, for two reasons. The wallet overview is a Server Component, so it
// cannot carry a handler without becoming a Client Component and pulling the
// whole money summary across the boundary. And the same breakage reaches the
// page from outside it: the "your guardian asked for a new link" email sends
// founders to /dashboard/founder#guardian, and that link landed them at the
// top of a page with the section still shut. One mechanism fixes the buttons,
// the email, a bookmark, and anything added later.
//
// It only ever intervenes when the target actually exists on this page. A
// hash link to somewhere else, or to an id that is not here, is left entirely
// to the browser.

import { useEffect } from "react";

export function RevealAnchor() {
  useEffect(() => {
    const prefersReduced = () =>
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /**
     * Open every <details> the element is folded inside.
     *
     * Outermost first. Opening an inner one while its parent is still shut
     * changes nothing on screen and leaves the measurement for the scroll
     * taken mid-flight, so the page lands in the wrong place.
     */
    function unfold(el: Element) {
      const chain: HTMLDetailsElement[] = [];
      let d = el.parentElement?.closest("details");
      while (d) {
        chain.push(d);
        d = d.parentElement?.closest("details");
      }
      for (const node of chain.reverse()) node.open = true;
    }

    /** Reveal, scroll, and put the keyboard where the eye went. */
    function go(id: string, smooth: boolean): boolean {
      if (!id) return false;
      const el = document.getElementById(id);
      if (!el) return false;

      unfold(el);
      el.scrollIntoView({
        behavior: smooth && !prefersReduced() ? "smooth" : "auto",
        block: "start",
      });

      // Without this the page moves and the focus ring does not, so a
      // keyboard tab after clicking carries on from the button at the top and
      // a screen reader never hears that anything happened. preventScroll
      // because the scroll above already decided where to land -- focusing
      // would otherwise jump again, ignoring scroll-margin-top and putting
      // the heading under the sticky header.
      if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
      (el as HTMLElement).focus({ preventScroll: true });
      return true;
    }

    function onClick(e: MouseEvent) {
      // Leave alone anything that is not a plain left click on a link: a
      // modified click is someone asking for a new tab.
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const a = (e.target as Element | null)?.closest?.("a");
      if (!a) return;

      // Resolved rather than read raw, so "#guardian" and
      // "/dashboard/founder#guardian" are the same case.
      let url: URL;
      try { url = new URL((a as HTMLAnchorElement).href, location.href); }
      catch { return; }
      if (url.origin !== location.origin) return;
      if (url.pathname !== location.pathname || url.search !== location.search) return;

      const id = decodeURIComponent(url.hash.slice(1));
      if (!id || !document.getElementById(id)) return;

      // Both, and in that order. preventDefault stops the browser's own jump
      // to a target that is still folded away; stopPropagation keeps the click
      // from reaching next/link, which would otherwise route the hash itself
      // and scroll -- or fail to -- on its own terms.
      e.preventDefault();
      e.stopPropagation();
      go(id, true);
      // The URL still changes, so Back returns and the link can be copied.
      history.pushState(null, "", url.hash);
    }

    // CAPTURE, not bubble. next/link attaches its handler through React's
    // delegated listener on the root container, which sits inside document and
    // therefore runs first on the way back up -- and it calls preventDefault
    // for client-side navigation. A bubble-phase listener here saw
    // defaultPrevented already set and stood down, so the hash changed, the
    // section stayed shut, and the button looked broken exactly as reported.
    // Capture gets there before React does.
    document.addEventListener("click", onClick, true);

    // Arriving with the hash already set -- from the email, or a reload. Not
    // smooth: animating a scroll the moment a page appears looks like a
    // glitch. One frame late so the sections have been laid out, otherwise
    // the target's position is measured before the fold above it has height.
    const landing = decodeURIComponent(location.hash.slice(1));
    const raf = landing ? requestAnimationFrame(() => go(landing, false)) : 0;

    const onHash = () => go(decodeURIComponent(location.hash.slice(1)), true);
    window.addEventListener("hashchange", onHash);

    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("hashchange", onHash);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}

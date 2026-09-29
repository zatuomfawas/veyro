"use client";

// Light by default. Dark if you ask for it, and then it remembers.
//
// This used to follow prefers-color-scheme until someone chose otherwise, so
// a visitor on a dark operating system met a dark site before they had any
// idea what the site was. Now the stylesheet reads one thing — the data-theme
// attribute — and the absence of it is light. The system setting is no longer
// consulted anywhere.
//
// The flag is written once, on <html>. The tokens live on .fw — a page injects
// its own <style> and scopes everything to .fw rather than :root — but the
// dark rules match on an ancestor carrying the attribute, so a .fw inherits it
// wherever and whenever it mounts.
//
// No state is read during render. The server cannot know what is in
// localStorage, so rendering from it would produce markup the client
// disagrees with; useSyncExternalStore gives the server "light" — which is
// also the default, so the server is not guessing — and the client the stored
// answer.

import { useCallback, useEffect, useSyncExternalStore } from "react";

// Two states, not three. There used to be a "system" value that deferred to
// prefers-color-scheme, and the stylesheet had a media query to match it. Both
// are gone: light is what you get until you say otherwise, so the only
// question left is whether this browser has a stored choice.
type Theme = "light" | "dark";
const KEY = "veyro-theme";

function read(): Theme {
  try {
    return localStorage.getItem(KEY) === "dark" ? "dark" : "light";
  } catch {
    // Private windows and blocked site data both throw here. Light is the
    // default anyway, so the page is correct; it just will not remember.
    return "light";
  }
}

/**
 * Puts the flag where the CSS can see it: once, on <html>.
 *
 * It used to be copied onto every .fw wrapper as well, because the dark rules
 * were scoped to .fw itself. They now read it from an ancestor, so one write
 * covers the whole document — including a .fw that mounts later, which is what
 * a loading skeleton is and what the copying always missed.
 */
function apply(t: Theme) {
  document.documentElement.setAttribute("data-theme", t);
}

const listeners = new Set<() => void>();
function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}
function emit() { for (const fn of listeners) fn(); }

export function ThemeToggle() {
  // The inline script in the layout has already set the attribute before
  // paint. This re-applies it after hydration so a page that mounted a new
  // .fw wrapper gets the flag too.
  useEffect(() => { apply(read()); }, []);

  // No matchMedia subscription any more. Nothing about the rendered theme
  // depends on the system setting, so listening for it would re-render the
  // switch in response to something that no longer changes anything.
  const resolved = useSyncExternalStore<Theme>(subscribe, read, () => "light");

  const flip = useCallback(() => {
    const next: Theme = resolved === "dark" ? "light" : "dark";
    try { localStorage.setItem(KEY, next); } catch { /* not remembering is survivable */ }
    apply(next);
    emit();
  }, [resolved]);

  const goingTo = resolved === "dark" ? "light" : "dark";

  // role="switch" rather than a plain button: this records a state rather than
  // performing an action, and a screen reader should say which state it is in.
  // The name stays "Dark mode" in both positions, because a switch's name is
  // the thing being switched, not the direction of travel -- aria-checked
  // carries that. The title still says what a click will do, for a mouse.
  return (
    <button
      type="button"
      role="switch"
      aria-checked={resolved === "dark"}
      aria-label="Dark mode"
      title={`Switch to ${goingTo} mode`}
      className="themeswitch"
      onClick={flip}
    >
      <span className="themeswitch-track" aria-hidden="true">
        <span className="themeswitch-thumb">{resolved === "dark" ? "☾" : "☀"}</span>
      </span>
    </button>
  );
}

/**
 * Runs before first paint, so someone who chose dark never sees a white flash
 * on the way to it.
 *
 * Inline and synchronous on purpose: anything deferred happens after the
 * browser has already painted, which is the flash this exists to prevent.
 *
 * Only "dark" needs writing. Light is what the stylesheet does with no
 * attribute at all, so a first-time visitor runs this, finds nothing stored,
 * and the page is already correct.
 */
export const THEME_SCRIPT =
  `(function(){try{`
  + `if(localStorage.getItem('veyro-theme')==='dark'){`
  + `document.documentElement.setAttribute('data-theme','dark');}`
  + `}catch(e){}})();`;

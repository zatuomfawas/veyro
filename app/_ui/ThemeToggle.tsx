"use client";

// Light and dark, with the system preference honoured until someone says
// otherwise.
//
// The flag goes on <html> as data-theme, and the stylesheet reads it two ways:
// a media query guarded by :not([data-theme="light"]), so the system setting
// applies by default but an explicit light choice still wins; and a plain
// attribute selector, so an explicit dark choice wins on a system set to light.
// Both directions need saying or the toggle only works one way.
//
// The value is mirrored onto every .fw wrapper, because that is where the
// tokens live — a page injects its own <style> and scopes everything to .fw
// rather than :root.
//
// No state is read during render. The server cannot know what is in
// localStorage, so rendering from it would produce markup the client disagrees
// with; useSyncExternalStore gives the server "system" and the client the real
// answer, which is a documented value rather than a hydration mismatch.

import { useCallback, useEffect, useSyncExternalStore } from "react";

type Theme = "light" | "dark" | "system";
const KEY = "veyro-theme";

function read(): Theme {
  try {
    const v = localStorage.getItem(KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    // Private windows and blocked site data both throw here. The page is
    // perfectly usable on the system preference; it just will not remember.
    return "system";
  }
}

/** Puts the flag where the CSS can see it, or removes it for "system". */
function apply(t: Theme) {
  const root = document.documentElement;
  if (t === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", t);
  for (const el of document.querySelectorAll<HTMLElement>(".fw")) {
    if (t === "system") delete el.dataset.theme;
    else el.dataset.theme = t;
  }
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

  const resolved = useSyncExternalStore<"light" | "dark">(
    (fn) => {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      mq.addEventListener("change", fn);
      const un = subscribe(fn);
      return () => { mq.removeEventListener("change", fn); un(); };
    },
    () => {
      const t = read();
      if (t !== "system") return t;
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    },
    () => "light",
  );

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
 * Runs before first paint, so the page never renders light and then flips.
 *
 * Inline and synchronous on purpose: anything deferred happens after the
 * browser has already painted, which is the flash this exists to prevent.
 */
export const THEME_SCRIPT =
  `(function(){try{var t=localStorage.getItem('veyro-theme');`
  + `if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t);}`
  + `}catch(e){}})();`;

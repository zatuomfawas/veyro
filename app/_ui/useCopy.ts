"use client";

// Writing to the clipboard, and admitting when it did not work.
//
// One implementation, because there are now two callers — the bare checkout
// link in a product row, and the editable share message — and the interesting
// part is the failure. navigator.clipboard throws on plain http and is blocked
// outright in some browsers, so a button wired straight to it can silently do
// nothing. Both callers need to say so instead, and a second copy of that
// try/catch is a second place for the honest path to rot.
//
// Deliberately not a component: the two callers look nothing alike. This owns
// the write, the outcome and the timer; they own what to show.

import { useCallback, useEffect, useRef, useState } from "react";

export type CopyState = "idle" | "copied" | "failed";

export function useCopy(resetAfterMs = 4000) {
  const [state, setState] = useState<CopyState>("idle");
  // What was actually written. The failure path tells someone to copy it by
  // hand, which needs the real text rather than whatever the caller thinks it
  // passed.
  const [text, setText] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // A component that unmounts while the countdown is running — a modal closing
  // on copy, say — would otherwise set state on something that is gone.
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const copy = useCallback(async (value: string) => {
    setText(value);
    // Restart rather than stack, so a second click does not let the first
    // timer clear the label while the button still says "Copied".
    if (timer.current) clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(value);
      setState("copied");
      timer.current = setTimeout(() => setState("idle"), resetAfterMs);
      return true;
    } catch {
      // Left on "failed" with no timer: an error that clears itself is an
      // error nobody reads.
      setState("failed");
      return false;
    }
  }, [resetAfterMs]);

  const reset = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setState("idle");
  }, []);

  return { state, text, copy, reset };
}

/**
 * A root-relative path as something someone can paste anywhere.
 *
 * From window rather than a configured base URL, so the result is right on
 * localhost, on a preview deployment and in production with nothing to set.
 * Callers must only run this after mount; during render on the server there is
 * no origin and the result would be a bare path.
 */
export function absoluteUrl(path: string): string {
  return (typeof window === "undefined" ? "" : window.location.origin) + path;
}

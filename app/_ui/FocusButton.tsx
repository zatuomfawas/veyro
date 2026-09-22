"use client";

// Sends someone to a control that is already on this page.
//
// The founder dashboard has no separate "new product" route: the create form
// sits directly above the list it fills. So the empty state's action is not a
// link to somewhere else, it is "start typing in the thing above you". A plain
// anchor would move the viewport without focusing the input, leaving the cursor
// wherever it was, so this scrolls and focuses in one go.
//
// If the target is missing the button does nothing rather than throwing, since
// a dead button is a smaller failure than a crashed dashboard.

import { useCallback } from "react";
import { Btn } from "@/app/_ui/form";

export function FocusButton({
  target, label, variant = "1",
}: {
  /** id of the control to focus. */
  target: string;
  label: string;
  variant?: "1" | "2" | "q";
}) {
  const go = useCallback(() => {
    const el = document.getElementById(target);
    if (!el) return;
    // `block: "center"` rather than the default "start": the field sits inside
    // a card with a heading, and scrolling it to the very top of the viewport
    // hides the label that says what to type.
    //
    // The smooth scroll is opt-out. The stylesheet honours prefers-reduced-
    // motion everywhere else, and a scripted scroll is exactly the kind of
    // movement that setting exists to stop.
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ block: "center", behavior: still ? "auto" : "smooth" });
    el.focus({ preventScroll: true });
  }, [target]);

  return <Btn type="button" variant={variant} onClick={go}>{label}</Btn>;
}

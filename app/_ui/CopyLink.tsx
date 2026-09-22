"use client";

// Copy a checkout link to the clipboard.
//
// Follows the pattern already in InviteGuardian: attempt the write, and if the
// browser refuses, say so rather than pretending it worked. navigator.clipboard
// throws on plain http and is blocked outright in some browsers, and a button
// that silently does nothing is worse than one that admits it. The link is
// always shown as selectable text alongside, so there is a manual route out.
//
// The origin comes from window rather than a configured base URL, which keeps
// the copied link correct on localhost, on a preview deployment and in
// production without anything to configure.

import { useCallback, useRef, useState } from "react";
import { Btn, Notice } from "@/app/_ui/form";

type State = "idle" | "copied" | "failed";

export function CopyLink({
  path, label = "Copy your payment link", variant = "1", size, compact = false,
}: {
  /** Root-relative, e.g. /pay/{founderId}/{productId}. */
  path: string;
  label?: string;
  variant?: "1" | "2" | "q";
  size?: "sm";
  /**
   * Inside a table cell, where a Notice would stretch the row. The outcome is
   * still announced, through a visually hidden live region, because the label
   * flipping to "Copied" is a change a sighted person sees and nobody else
   * does.
   */
  compact?: boolean;
}) {
  const [state, setState] = useState<State>("idle");
  // The absolute URL that was attempted. Kept in state rather than recomputed
  // for display, because the fallback tells someone to copy the link by hand
  // and a root-relative path is not a link anyone can paste anywhere.
  const [url, setUrl] = useState("");
  // Holds the timer so a second click restarts the countdown rather than
  // letting the first one reset the label while the button still says "Copied".
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = useCallback(async () => {
    const full = (typeof window === "undefined" ? "" : window.location.origin) + path;
    setUrl(full);
    if (timer.current) clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(full);
      setState("copied");
      timer.current = setTimeout(() => setState("idle"), 4000);
    } catch {
      setState("failed");
    }
  }, [path]);

  if (compact) {
    return (
      <>
        <Btn type="button" variant={variant} size={size} onClick={copy}>
          {state === "copied" ? "Copied" : label}
        </Btn>
        <span className="sr-only" role="status">
          {state === "copied" ? "Payment link copied to the clipboard."
            : state === "failed" ? "Your browser blocked the copy. Open the checkout link and copy it from the address bar."
              : ""}
        </span>
      </>
    );
  }

  return (
    <>
      <Btn type="button" variant={variant} size={size} onClick={copy}>
        {state === "copied" ? "Copied" : label}
      </Btn>
      {state === "copied" && (
        <Notice tone="pine" head="Link copied" live>
          Send it to anyone. They can pay without making an account.
        </Notice>
      )}
      {state === "failed" && (
        <Notice tone="amber" head="Your browser blocked the copy" live>
          Copy it by hand instead: <span className="mono">{url || path}</span>
        </Notice>
      )}
    </>
  );
}

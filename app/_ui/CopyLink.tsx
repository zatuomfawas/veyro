"use client";

// Copy a checkout link to the clipboard.
//
// Follows the pattern already in InviteGuardian: attempt the write, and if the
// browser refuses, say so rather than pretending it worked. The write itself
// lives in useCopy, shared with the share-message modal, so the failure path is
// written once.

import { Btn, Notice } from "@/app/_ui/form";
import { useCopy, absoluteUrl } from "@/app/_ui/useCopy";

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
  const { state, text, copy } = useCopy();

  // absoluteUrl is called here, inside the handler, rather than during render:
  // on the server there is no origin and the copied value would be a bare path.
  const onClick = () => copy(absoluteUrl(path));

  if (compact) {
    return (
      <>
        <Btn type="button" variant={variant} size={size} onClick={onClick}>
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
      <Btn type="button" variant={variant} size={size} onClick={onClick}>
        {state === "copied" ? "Copied" : label}
      </Btn>
      {state === "copied" && (
        <Notice tone="pine" head="Link copied" live>
          Send it to anyone. They can pay without making an account.
        </Notice>
      )}
      {state === "failed" && (
        <Notice tone="amber" head="Your browser blocked the copy" live>
          Copy it by hand instead: <span className="mono">{text || path}</span>
        </Notice>
      )}
    </>
  );
}

"use client";

// A confirmation step for actions that are hard to undo.
//
// Deliberately plain: no entrance animation, no scale or fade. A dialog that
// animates in delays the moment someone can read it, and this one exists to be
// read. `.modal` and `.scrim` were already in the design system, unused.
//
// The confirm button is labelled with the action itself ("Decline", "Request
// $240.00") rather than "OK". "OK" makes someone reconstruct what they are
// agreeing to from the question above, which is exactly the reading people skip
// when they are in a hurry.

import { useEffect, useRef } from "react";
import { Btn } from "@/app/_ui/form";

export function ConfirmModal({
  open, title, confirmLabel, cancelLabel = "Cancel", tone = "1", busy = false,
  onConfirm, onCancel, children,
}: {
  open: boolean;
  title: string;
  confirmLabel: string;
  cancelLabel?: string;
  /** "d" for a destructive confirm, "1" for an ordinary one. */
  tone?: "1" | "d";
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children: React.ReactNode;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  // Focus moves into the dialog when it opens, and Escape closes it. Without
  // this a keyboard user stays on the page behind and cannot reach the buttons.
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    confirmRef.current?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !busy) {
        e.preventDefault();
        onCancel();
        return;
      }
      if (e.key !== "Tab" || !panel.current) return;

      // Keep Tab inside the dialog. Otherwise focus walks off into the page
      // behind, which is still there and still interactive.
      const focusable = panel.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [open, busy, onCancel]);

  if (!open) return null;

  return (
    <div
      className="scrim"
      // A click on the backdrop cancels, the same as Escape. Clicks inside the
      // panel must not, hence the stopPropagation below.
      onClick={() => { if (!busy) onCancel(); }}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        ref={panel}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="card-h">
          <h2 className="h4" id="confirm-title" style={{ margin: 0 }}>{title}</h2>
        </div>
        <div className="card-b">
          <div className="body">{children}</div>
          <div className="row" style={{ gap: 8, flexWrap: "wrap", marginTop: 20 }}>
            <Btn
              ref={confirmRef}
              type="button"
              variant={tone}
              disabled={busy}
              aria-busy={busy ? "true" : undefined}
              onClick={onConfirm}
            >
              {busy ? "Working…" : confirmLabel}
            </Btn>
            <Btn type="button" variant="q" disabled={busy} onClick={onCancel}>
              {cancelLabel}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

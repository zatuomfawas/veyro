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
  initialFocus = "confirm", dismissOnBackdrop = true,
  onConfirm, onCancel, children,
}: {
  open: boolean;
  title: string;
  confirmLabel: string;
  cancelLabel?: string;
  /** "d" for a destructive confirm, "1" for an ordinary one. */
  tone?: "1" | "d";
  busy?: boolean;
  /**
   * Where focus lands when the dialog opens. "confirm" is right when the only
   * question is yes or no. "body" is right when the dialog contains something
   * to work with — an editable message, say — and landing on the button would
   * put the caret nowhere and make the first thing a keyboard user does be
   * shift-tab.
   */
  initialFocus?: "confirm" | "body";
  /**
   * Whether a click on the backdrop cancels. True suits a confirm step, where
   * the only state is the answer. False suits a dialog holding text someone
   * has written, where a stray click on the scrim would throw their work away
   * with no warning and no undo.
   */
  dismissOnBackdrop?: boolean;
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
    if (initialFocus === "body") {
      // The first thing in the body that can take focus, which is the control
      // the dialog is actually about. Falls back to the confirm button so a
      // body with nothing focusable still moves focus into the dialog.
      const target = panel.current?.querySelector<HTMLElement>(
        '.card-b textarea, .card-b input, .card-b select',
      );
      (target ?? confirmRef.current)?.focus();
      // A textarea opened with prepared text: put the caret at the end rather
      // than selecting everything, so typing appends instead of wiping it.
      if (target instanceof HTMLTextAreaElement) {
        const end = target.value.length;
        target.setSelectionRange(end, end);
      }
    } else {
      confirmRef.current?.focus();
    }

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
  }, [open, busy, onCancel, initialFocus]);

  if (!open) return null;

  return (
    <div
      className="scrim"
      // A click on the backdrop cancels, the same as Escape. Clicks inside the
      // panel must not, hence the stopPropagation below.
      onClick={() => { if (!busy && dismissOnBackdrop) onCancel(); }}
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

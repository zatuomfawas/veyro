"use client";

import { useEffect, useId, useRef } from "react";
import { Btn } from "@/app/_ui/form";

function focusableControls(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(
    'a[href], button, input:not([type="hidden"]), select, textarea, [contenteditable="true"], [tabindex]',
  )).filter((element) => {
    const style = window.getComputedStyle(element);
    return element.tabIndex >= 0
      && !element.matches(":disabled")
      && !element.closest('[hidden], [inert], [aria-hidden="true"]')
      && style.visibility !== "hidden"
      && style.display !== "none"
      && element.getClientRects().length > 0;
  });
}

export function ConfirmModal({
  open, title, confirmLabel, cancelLabel = "Cancel", tone = "1", busy = false,
  initialFocus = "confirm", dismissOnBackdrop = true,
  onConfirm, onCancel, children,
}: {
  open: boolean;
  title: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: "1" | "d";
  busy?: boolean;
  initialFocus?: "confirm" | "body";
  /** Disable for dialogs containing work that a stray click could discard. */
  dismissOnBackdrop?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children: React.ReactNode;
}) {
  const titleId = useId();
  const scrim = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open || !panel.current || !scrim.current) return;
    const previous = document.activeElement as HTMLElement | null;
    const background = new Map<HTMLElement, boolean>();

    // Inert sibling branches all the way to the body, retaining existing state.
    let branch: HTMLElement = scrim.current;
    while (branch.parentElement) {
      const parent = branch.parentElement;
      for (const sibling of parent.children) {
        if (sibling !== branch && sibling instanceof HTMLElement) {
          background.set(sibling, sibling.inert);
          sibling.inert = true;
        }
      }
      if (parent === document.body) break;
      branch = parent;
    }

    const controls = focusableControls(panel.current);
    const bodyControl = controls.find((element) =>
      element.closest(".card-b") && element.matches("input, textarea, select"),
    );
    const confirm = controls.find((element) => element === confirmRef.current);
    const target = (initialFocus === "body" ? bodyControl : confirm)
      ?? confirm ?? controls[0] ?? panel.current;
    target.focus();
    if (target instanceof HTMLTextAreaElement) {
      target.setSelectionRange(target.value.length, target.value.length);
    }

    return () => {
      for (const [element, wasInert] of background) element.inert = wasInert;
      if (previous?.isConnected && !previous.closest("[inert]")) previous.focus();
    };
  }, [open, initialFocus]);

  useEffect(() => {
    if (!open) return;
    if (busy && document.activeElement instanceof HTMLElement
      && document.activeElement.matches(":disabled")) {
      panel.current?.focus();
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !busy) {
        event.preventDefault();
        onCancel();
        return;
      }
      if (event.key !== "Tab" || !panel.current) return;
      const controls = focusableControls(panel.current);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (!first || !last) {
        event.preventDefault();
        panel.current.focus();
        return;
      }
      const active = document.activeElement;
      if (!controls.some((element) => element === active)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, busy, onCancel]);

  if (!open) return null;

  return (
    <div
      className="scrim"
      ref={scrim}
      onClick={() => { if (!busy && dismissOnBackdrop) onCancel(); }}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-busy={busy || undefined}
        tabIndex={-1}
        ref={panel}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="card-h">
          <h2 className="h4" id={titleId}>{title}</h2>
        </div>
        <div className="card-b">
          <div className="body">{children}</div>
          <div className="modal-actions">
            <Btn
              ref={confirmRef}
              type="button"
              variant={tone}
              disabled={busy}
              aria-busy={busy || undefined}
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

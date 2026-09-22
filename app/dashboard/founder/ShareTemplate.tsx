"use client";

// A ready-made message about a product, editable before it is copied.
//
// The gap this fills is small and real: a founder with a working checkout link
// still has to decide what to say around it, and "here is a link" is the thing
// people write when they cannot think of anything better. Three starting points
// are easier to improve than a blank box.
//
// Everything here is the founder's own words about their own product. No
// template claims a number, a review, a customer count or anything else the
// database cannot back, because a founder pasting one of these into a group
// chat is vouching for it under their own name.
//
// Only offered on live products. Every template carries the checkout URL, and a
// draft's URL cannot take money — the dead end Features 2 and 4 both removed.
// The default template also says the product is live, which would be a lie on a
// draft rather than merely unhelpful.

import { useCallback, useEffect, useRef, useState } from "react";
import { ConfirmModal } from "@/app/_ui/ConfirmModal";
import { Notice } from "@/app/_ui/form";
import { useCopy, absoluteUrl } from "@/app/_ui/useCopy";

type TemplateId = "default" | "short" | "personal";

const TEMPLATES: { id: TemplateId; label: string; build: (p: Ctx) => string }[] = [
  {
    id: "default",
    label: "Announcement",
    build: ({ name, url, founder }) =>
      `${name} is now live!\nCheck it out: ${url}\nMade by ${founder}`,
  },
  {
    id: "short",
    label: "Short",
    build: ({ name, url }) => `I made ${name}. Get it here: ${url}`,
  },
  {
    id: "personal",
    label: "Personal",
    build: ({ name, url }) =>
      `Hey! I made ${name} and I think you'd love it. Check it out: ${url}`,
  },
];

type Ctx = { name: string; url: string; founder: string };

export function ShareTemplate({
  productName, founderName, path, onCopied,
}: {
  productName: string;
  founderName: string;
  /** Root-relative checkout path. Made absolute once the modal is open. */
  path: string;
  /** Raised in the row behind, because a notice inside a closing modal is one nobody reads. */
  onCopied: (message: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<TemplateId>("default");
  const [text, setText] = useState("");
  // `text` from useCopy is unused here: the failure path points at the
  // textarea, which is already on screen holding exactly what was attempted.
  const { state, copy, reset } = useCopy();

  // Built on open rather than during render: absoluteUrl needs window, and on
  // the server it would bake a bare path into the message.
  const ctx = useCallback(
    (): Ctx => ({ name: productName, url: absoluteUrl(path), founder: founderName }),
    [productName, path, founderName],
  );

  const openWith = useCallback((id: TemplateId) => {
    const t = TEMPLATES.find((x) => x.id === id) ?? TEMPLATES[0];
    setPicked(id);
    setText(t.build(ctx()));
  }, [ctx]);

  const onOpen = useCallback(() => {
    reset();
    openWith("default");
    setOpen(true);
  }, [openWith, reset]);

  // Switching template replaces whatever is in the box, including edits. That
  // is what a template picker does, and the text is one click from coming back,
  // so it is not worth a confirmation step in front of a message nobody has
  // sent yet.
  const onPick = useCallback((id: TemplateId) => { reset(); openWith(id); }, [openWith, reset]);

  const onCopy = useCallback(async () => {
    const ok = await copy(text);
    if (ok) {
      setOpen(false);
      onCopied("Message copied. Paste it wherever you like.");
    }
  }, [copy, text, onCopied]);

  // Size to the text as it actually wraps, not to how many newlines it has.
  // A checkout URL is long enough to wrap two or three times on a narrow
  // screen, and counting "\n" left the last line of the message clipped out of
  // sight at 320px — on the one control the whole dialog exists for.
  const box = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = box.current;
    if (!open || !el) return;
    el.style.height = "auto";
    // Capped, so a founder who pastes an essay gets a scrollbar rather than a
    // dialog taller than the window.
    el.style.height = Math.min(el.scrollHeight, 260) + "px";
  }, [open, text, picked]);

  return (
    <>
      <button type="button" className="btn btn-2 btn-sm" onClick={onOpen}>
        Share
        <span className="sr-only"> {productName}: copy a ready-made message</span>
      </button>

      <ConfirmModal
        open={open}
        title="Share this product"
        confirmLabel="Copy message"
        cancelLabel="Close"
        // The dialog is about the text, so focus belongs in it; and a stray
        // click on the scrim must not throw away something they have written.
        initialFocus="body"
        dismissOnBackdrop={false}
        onConfirm={onCopy}
        onCancel={() => setOpen(false)}
      >
        <div className="seg" role="group" aria-label="Message style" style={{ marginBottom: 14 }}>
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-pressed={picked === t.id}
              onClick={() => onPick(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <label className="field" style={{ marginBottom: 0 }}>
          <span className="lbl">Your message</span>
          <textarea
            ref={box}
            className="ta"
            rows={3}
            value={text}
            onChange={(e) => { setText(e.target.value); if (state !== "idle") reset(); }}
          />
          <span className="hint">
            Edit it however you like. Picking another style replaces what&rsquo;s here.
          </span>
        </label>

        {state === "failed" && (
          <div style={{ marginTop: 12 }}>
            <Notice tone="amber" head="Your browser blocked the copy" live>
              Select the message above and copy it by hand. Nothing was sent, and the text is
              still exactly as you left it.
            </Notice>
          </div>
        )}
      </ConfirmModal>
    </>
  );
}

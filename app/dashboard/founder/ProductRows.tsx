"use client";

// The product table, with an editor that opens in place.
//
// Editing exists because of one specific accident: pricing a $100 template at
// $1 and only noticing after the link is already in a Discord server. The
// checkout link is the product's id, and editing never touches the id, so
// every link already shared keeps working — which is the thing a founder is
// actually afraid of when they open this.
//
// The editor is a second row rather than a modal, and the reason first written
// here was wrong: it said no modal primitive existed. ConfirmModal does exist,
// and it is a real one — focus moves in, Tab is trapped, Escape closes, focus
// returns to whatever opened it.
//
// The actual reason is what each is for. A modal suits a question with one
// answer, which is why RequestPayout uses it: stop, confirm this, go back.
// Editing is not that. It is four fields the founder wants to check against
// the row they are editing, sometimes more than once, and a dialog that covers
// that row to ask about it is working against them. Inline keeps the thing
// being edited on screen and does not take the page hostage to do it.

import { Fragment, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Btn, Field, Notice } from "@/app/_ui/form";
import { Icon } from "@/app/_ui/marks";
import { CopyLink } from "@/app/_ui/CopyLink";
import { formatMinor, parseMinor, toMajorInput } from "@/lib/money";

export type ProductRow = {
  id: string;
  name: string;
  description: string;
  priceMinor: number;
  currency: string;
  status: string;
  /** How many payments this product has taken. Drives the price warning. */
  sales: number;
};

const BADGE: Record<string, string> = { LIVE: "b-pine", DRAFT: "b-amber", ARCHIVED: "b-grey" };
const LABEL: Record<string, string> = { LIVE: "Live", DRAFT: "Draft", ARCHIVED: "Archived" };


function Editor({
  product, founderId, active, onDone, onCancel,
}: {
  product: ProductRow;
  founderId: string;
  /** True once the panel has expanded. Focus waits for it. */
  active: boolean;
  onDone: (message: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description);
  const [price, setPrice] = useState(toMajorInput(product.priceMinor, product.currency));
  const [status, setStatus] = useState(product.status);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Opening the editor puts the caret in it. Without this the form appears
  // below a button that still has focus, so a keyboard or screen-reader user
  // has to go looking for what the button just opened.
  //
  // Waits for `active` rather than firing on mount: the panel mounts collapsed
  // and expands a frame later, and focusing something inside a zero-height box
  // makes the browser scroll to find it.
  const firstField = useRef<HTMLInputElement>(null);
  useEffect(() => { if (active) firstField.current?.focus(); }, [active]);

  const priceMinor = parseMinor(price, product.currency);
  const priceChanged = priceMinor !== null && priceMinor !== product.priceMinor;
  const goingDark = product.status === "LIVE" && status !== "LIVE";

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;

    if (priceMinor === null) {
      setErrors({ priceMinor: "Enter an amount like 12 or 12.00." });
      return;
    }

    // Send only what moved.
    //
    // Sending all four every time meant opening the editor and pressing Save
    // without typing still wrote "product.updated" to the audit log. That log
    // is the permanent record of what happened to someone's business, and an
    // entry for a change that did not happen makes it worth less.
    const changed: Record<string, unknown> = { founderId };
    if (name !== product.name) changed.name = name;
    if (description !== product.description) changed.description = description;
    if (priceMinor !== product.priceMinor) changed.priceMinor = priceMinor;
    if (status !== product.status) changed.status = status;

    if (Object.keys(changed).length === 1) {
      onDone(`Nothing to change in “${product.name}”.`);
      return;
    }

    setSaving(true);
    setErrors({});
    setFormError(null);
    try {
      const res = await fetch(`/api/founder/products/${product.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(changed),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        if (body?.errors) setErrors(body.errors);
        else setFormError(body?.error ?? "That didn't save. Nothing was changed.");
        setSaving(false);
        return;
      }
      onDone(`“${body.product.name}” updated.`);
    } catch {
      setFormError("We couldn’t reach the server. Nothing was changed.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} noValidate>
      {formError && (
        <div style={{ marginBottom: 12 }}>
          <Notice tone="clay" head="That didn&rsquo;t work" live>{formError}</Notice>
        </div>
      )}

      <Field label="Name" error={errors.name}>
        <input ref={firstField} className="input" value={name} maxLength={120}
          onChange={(e) => setName(e.target.value)} />
      </Field>

      <Field
        label="Description"
        error={errors.description}
        hint={
          <>
            What the customer reads on the checkout page before paying.
            <span className="charcount" data-near={description.length > 450 ? "1" : undefined}>
              {description.length}/500
            </span>
          </>
        }
      >
        <textarea className="input ta" rows={3} value={description} maxLength={500}
          onChange={(e) => setDescription(e.target.value)} />
      </Field>

      <Field
        label={`Price in ${product.currency}`}
        error={errors.priceMinor}
        hint={`Between ${formatMinor(1, product.currency)} and ${formatMinor(99999999, product.currency)}. `
          + "Card payments have a minimum of about $0.50."}
      >
        <input className="input" inputMode="decimal" value={price}
          onChange={(e) => setPrice(e.target.value)} />
      </Field>

      <Field label="Status" error={errors.status}>
        <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="LIVE">Live — customers can pay</option>
          <option value="DRAFT">Draft — not for sale yet</option>
          <option value="ARCHIVED">Archived — no longer sold</option>
        </select>
      </Field>

      {/* Warnings, not blocks. Both describe a consequence the founder cannot
          see from here, and both are things they are allowed to do. */}
      {priceChanged && product.sales > 0 && (
        <div style={{ marginTop: 12 }}>
          <Notice tone="amber" head="This product has sales" live>
            {product.sales === 1 ? "One person has" : `${product.sales} people have`} already paid{" "}
            {formatMinor(product.priceMinor, product.currency)} for this. Changing the price only
            affects people who buy from now on; what they paid stays as it was.
          </Notice>
        </div>
      )}

      {goingDark && (
        <div style={{ marginTop: 12 }}>
          <Notice tone="clay" head="This will turn off your checkout link" live>
            The link you have shared stops working while this is not live, and anyone who opens it
            is told the item is not available. The link itself is not lost — setting this back to
            Live makes the same link work again.
          </Notice>
        </div>
      )}

      <div className="row" style={{ marginTop: 16, gap: 8, flexWrap: "wrap" }}>
        <Btn type="submit" disabled={saving} aria-busy={saving ? "true" : undefined}>
          {saving ? "Saving…" : "Save changes"}
        </Btn>
        <Btn type="button" variant="2" onClick={onCancel} disabled={saving}>Cancel</Btn>
      </div>
    </form>
  );
}

export default function ProductRows({
  founderId, products,
}: { founderId: string; products: ProductRow[] }) {
  const router = useRouter();

  // Two pieces of state, because a panel that unmounts the instant you close it
  // cannot animate on the way out. `mounted` is which row's editor is in the
  // DOM; `open` is whether it is expanded. Opening mounts it closed and expands
  // on the next frame, so the browser has a start value to transition from;
  // closing collapses it and unmounts once the transition has run.
  const [mounted, setMounted] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // The button that opened the panel, so focus can go back to it rather than
  // being dropped on the body when the panel unmounts.
  const opener = useRef<HTMLButtonElement | null>(null);

  // Read the duration from the stylesheet rather than repeating it here, so the
  // unmount can never drift out of step with the transition it is waiting for.
  const collapseMs = () => {
    if (typeof window === "undefined") return 170;
    const raw = getComputedStyle(document.documentElement).getPropertyValue("--t-2").trim();
    const ms = raw.endsWith("ms") ? parseFloat(raw) : raw.endsWith("s") ? parseFloat(raw) * 1000 : NaN;
    return Number.isFinite(ms) ? ms : 170;
  };

  const openEditor = (id: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setSaved(null);
    setMounted(id);
    // Next frame: the row exists at 0fr, so this is a change to transition.
    requestAnimationFrame(() => requestAnimationFrame(() => setOpen(true)));
  };

  const closeEditor = () => {
    setOpen(false);
    opener.current?.focus();
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMounted(null), collapseMs());
  };

  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);

  return (
    <>
      {saved && (
        <div style={{ marginBottom: 12 }}>
          <Notice tone="pine" head="Product updated" live>{saved}</Notice>
        </div>
      )}

      <div className="tblwrap">
        <table className="tbl">
          <thead>
            <tr>
              <th scope="col">Product</th>
              <th scope="col">Price</th>
              <th scope="col">Status</th>
              <th scope="col">Checkout</th>
              <th scope="col"><span className="sr-only">Edit</span></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const live = p.status === "LIVE";
              const isOpen = mounted === p.id && open;
              const isMounted = mounted === p.id;
              return (
                <Fragment key={p.id}>
                  <tr style={live ? undefined : { color: "var(--ink-3)" }}>
                    <td>{p.name}</td>
                    <td className="num">{formatMinor(p.priceMinor, p.currency)}</td>
                    <td><span className={"badge " + (BADGE[p.status] ?? "b-grey")}>{LABEL[p.status]}</span></td>
                    <td>
                      {/* Preview and share are different jobs, and every
                          product gets the first one. A draft used to say
                          "(not published)" and offer nothing, which is exactly
                          backwards: the moment a founder most wants to look at
                          their checkout is before they publish it. Live goes to
                          the real page, because for a live product the real
                          page is the truth; anything else goes to the
                          dashboard's own preview.

                          An anchor rather than window.open: it survives popup
                          blockers, supports cmd- and middle-click, and is
                          announced as a link instead of a button. */}
                      <span className="row" style={{ gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                        <a
                          className="linkbtn"
                          href={live ? `/pay/${founderId}/${p.id}` : `/dashboard/founder/preview/${p.id}`}
                          target="_blank"
                          rel="noopener"
                        >
                          Preview
                          <span className="sr-only"> (opens in a new tab)</span>
                        </a>
                        {live && (
                          /* Live only. A draft's URL does not take money, and
                             handing someone a link that cannot be paid is the
                             dead end Feature 2 set out to remove. */
                          <CopyLink
                            path={`/pay/${founderId}/${p.id}`}
                            label="Copy link"
                            variant="2"
                            size="sm"
                            compact
                          />
                        )}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        type="button"
                        className="btn btn-2 btn-sm"
                        ref={(el) => { if (isMounted) opener.current = el; }}
                        aria-expanded={isOpen}
                        aria-controls={`edit-${p.id}`}
                        onClick={() => (isMounted ? closeEditor() : openEditor(p.id))}
                      >
                        <Icon name="pencil" size={13} />
                        {isMounted ? "Close" : "Edit"}
                      </button>
                    </td>
                  </tr>
                  {isMounted && (
                    // data-panel keeps the hover highlight off this row: it
                    // holds a form, not a line of data to point at. The cell
                    // has no padding of its own so the panel can collapse to
                    // nothing; the padding lives inside, where it collapses too.
                    <tr data-panel="1">
                      <td
                        colSpan={5}
                        id={`edit-${p.id}`}
                        style={{ background: "var(--surface)", padding: 0 }}
                      >
                        <div className="expand" data-open={isOpen ? "1" : undefined}>
                          <div>
                            <div style={{ padding: "var(--sp-4) var(--sp-3)" }}>
                              <Editor
                                product={p}
                                founderId={founderId}
                                active={isOpen}
                                onCancel={closeEditor}
                                onDone={(message) => {
                                  closeEditor();
                                  setSaved(message);
                                  router.refresh();
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

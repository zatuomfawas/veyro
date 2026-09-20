"use client";

// The product table, with an editor that opens in place.
//
// Editing exists because of one specific accident: pricing a $100 template at
// $1 and only noticing after the link is already in a Discord server. The
// checkout link is the product's id, and editing never touches the id, so
// every link already shared keeps working — which is the thing a founder is
// actually afraid of when they open this.
//
// The editor is a second row rather than a modal. A modal needs focus
// trapping, a scroll lock and an escape route to be usable with a keyboard,
// and none of that exists in this design system yet; a row that expands needs
// none of it and stays put on a phone.

import { Fragment, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Btn, Field, Notice } from "@/app/_ui/form";
import { Icon } from "@/app/_ui/marks";
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
  product, founderId, onDone, onCancel,
}: {
  product: ProductRow;
  founderId: string;
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
  const firstField = useRef<HTMLInputElement>(null);
  useEffect(() => { firstField.current?.focus(); }, []);

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
          <Notice tone="clay" head="That didn&rsquo;t work">{formError}</Notice>
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
          <Notice tone="amber" head="This product has sales">
            {product.sales === 1 ? "One person has" : `${product.sales} people have`} already paid{" "}
            {formatMinor(product.priceMinor, product.currency)} for this. Changing the price only
            affects people who buy from now on; what they paid stays as it was.
          </Notice>
        </div>
      )}

      {goingDark && (
        <div style={{ marginTop: 12 }}>
          <Notice tone="clay" head="This will turn off your checkout link">
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
  const [editing, setEditing] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

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
              const open = editing === p.id;
              return (
                <Fragment key={p.id}>
                  <tr style={live ? undefined : { color: "var(--ink-3)" }}>
                    <td>{p.name}</td>
                    <td className="num">{formatMinor(p.priceMinor, p.currency)}</td>
                    <td><span className={"badge " + (BADGE[p.status] ?? "b-grey")}>{LABEL[p.status]}</span></td>
                    <td>
                      {live ? (
                        <a className="linkbtn" href={`/pay/${founderId}/${p.id}`}>
                          Open checkout
                        </a>
                      ) : (
                        <span className="tiny">(not published)</span>
                      )}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        type="button"
                        className="btn btn-2 btn-sm"
                        aria-expanded={open}
                        aria-controls={`edit-${p.id}`}
                        onClick={() => { setSaved(null); setEditing(open ? null : p.id); }}
                      >
                        <Icon name="pencil" size={13} />
                        {open ? "Close" : "Edit"}
                      </button>
                    </td>
                  </tr>
                  {open && (
                    <tr>
                      <td colSpan={5} id={`edit-${p.id}`} style={{ background: "var(--surface)" }}>
                        <Editor
                          product={p}
                          founderId={founderId}
                          onCancel={() => setEditing(null)}
                          onDone={(message) => {
                            setEditing(null);
                            setSaved(message);
                            router.refresh();
                          }}
                        />
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

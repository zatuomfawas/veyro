"use client";

// Add something to sell.
//
// Currency is fixed to USD. The API takes any three-letter code, but
// formatMinor() divides by 100 unconditionally, so a JPY product would render
// as "¥5.00" for ¥500 everywhere it appears. Offering a currency picker here
// would ship that bug into the UI; one currency until the formatter handles
// zero-decimal currencies properly.
//
// Status offers Draft or Live only, not Archived. Archiving is something you do
// to an existing product, not a state you create one in.
//
// Description is required, not optional: POST /api/founder/products rejects
// anything under 10 characters, and it is what the customer reads on the
// checkout page before paying.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Btn, Field, Notice } from "@/app/_ui/form";

const NAME_MAX = 100;
const DESC_MAX = 500;
const PRICE_MIN_MINOR = 1;             // $0.01
const PRICE_MAX_MINOR = 99_999_999;    // $999,999.99

/**
 * "12.50" -> 1250, as an integer, without ever multiplying a float.
 * (12.10 * 100 is 1210.0000000000002 in IEEE 754, and Math.round hides that
 * rather than avoiding it.) Returns null if the text isn't money.
 */
function toMinor(input: string): number | null {
  const text = input.trim().replace(/^\$/, "").replace(/,/g, "");
  const m = /^(\d+)(?:\.(\d{1,2}))?$/.exec(text);
  if (!m) return null;
  const whole = Number(m[1]);
  const cents = Number((m[2] ?? "").padEnd(2, "0") || "0");
  if (!Number.isSafeInteger(whole)) return null;
  return whole * 100 + cents;
}

export default function NewProduct() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState<"LIVE" | "DRAFT">("LIVE");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    // Checked here only to give a useful message next to the field. The API
    // decides: anything validated in the browser can be skipped entirely.
    const priceMinor = toMinor(price);
    if (priceMinor === null) {
      setErrors({ price: "Enter an amount like 5 or 5.00." });
      setFormError(null);
      return;
    }
    if (priceMinor < PRICE_MIN_MINOR) {
      setErrors({ price: "The lowest you can charge is $0.01." });
      setFormError(null);
      return;
    }
    if (priceMinor > PRICE_MAX_MINOR) {
      setErrors({ price: "The most you can charge here is $999,999.99." });
      setFormError(null);
      return;
    }

    setSubmitting(true);
    setErrors({});
    setFormError(null);
    setDone(null);

    try {
      const res = await fetch("/api/founder/products", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, description, priceMinor, currency: "USD", status }),
      });
      const body = await res.json().catch(() => null);

      if (!res.ok) {
        // The API reports priceMinor; this form's field is called price.
        const mapped: Record<string, string> = { ...(body?.errors ?? {}) };
        if (mapped.priceMinor) { mapped.price = mapped.priceMinor; delete mapped.priceMinor; }
        if (body?.errors) setErrors(mapped);
        else setFormError(body?.error ?? "Something went wrong. Nothing was created.");
        setSubmitting(false);
        return;
      }

      setDone(body.product?.name ?? name);
      setName(""); setDescription(""); setPrice("");
      setSubmitting(false);
      router.refresh();
    } catch {
      setFormError("We couldn't reach the server. Nothing was created.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      {formError && (
        <div style={{ marginBottom: 14 }}>
          <Notice tone="clay" head="That didn&rsquo;t work">{formError}</Notice>
        </div>
      )}
      {done && (
        <div style={{ marginBottom: 14 }}>
          <Notice tone="pine" head={`“${done}” added`}>
            It is in your products below. A live product has a checkout link you can share.
          </Notice>
        </div>
      )}

      <Field label="What are you selling?" error={errors.name}>
        <input className="input" value={name} maxLength={NAME_MAX}
          onChange={(e) => setName(e.target.value)} placeholder="Sticker pack" />
      </Field>

      <Field
        label="Description"
        error={errors.description}
        hint={
          <>
            At least a sentence. This is what the customer reads before paying.{" "}
            <span className="charcount">{description.length}/{DESC_MAX}</span>
          </>
        }
      >
        <textarea className="ta" value={description} rows={3} maxLength={DESC_MAX}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ten hand-drawn vinyl stickers, posted anywhere in the US." />
      </Field>

      <Field label="Price in US dollars" error={errors.price}
        hint="Between $0.01 and $999,999.99. Stripe has a minimum of about $0.50 for card payments.">
        <input className="input" inputMode="decimal" value={price} maxLength={12}
          onChange={(e) => setPrice(e.target.value)} placeholder="5.00" />
      </Field>

      <Field label="Status" error={errors.status}
        hint="Only a live product can take a payment. A draft is yours to finish first.">
        <select className="select" value={status}
          onChange={(e) => setStatus(e.target.value as "LIVE" | "DRAFT")}>
          <option value="LIVE">Live — ready to sell</option>
          <option value="DRAFT">Draft — not for sale yet</option>
        </select>
      </Field>

      <Btn type="submit" disabled={submitting} aria-busy={submitting ? "true" : undefined}>
        {submitting ? "Creating…" : "Create product"}
      </Btn>
    </form>
  );
}

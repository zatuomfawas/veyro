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
//
// Validation runs on blur rather than on every keystroke. Validating as someone
// types tells them their email is invalid when they have typed two letters of
// it, which trains people to ignore the red text. Nothing here is authoritative
// either way — the API decides, because anything checked in the browser can be
// skipped by anyone who opens the network tab.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Btn, Field, Notice } from "@/app/_ui/form";
import { formatMinor } from "@/lib/money";

const NAME_MAX = 100;
const DESC_MAX = 500;
const DESC_MIN = 10;
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

/** The same rules the API applies, for a message shown before submitting. */
function checkField(field: "name" | "description" | "price", value: string): string | null {
  if (field === "name") {
    return value.trim().length < 2 ? "Give the product a name." : null;
  }
  if (field === "description") {
    return value.trim().length < DESC_MIN
      ? "Describe what the customer is paying for, and a sentence is enough."
      : null;
  }
  const minor = toMinor(value);
  if (minor === null) return "Enter an amount like 5 or 5.00.";
  if (minor < PRICE_MIN_MINOR) return "The lowest you can charge is $0.01.";
  if (minor > PRICE_MAX_MINOR) return "The most you can charge here is $999,999.99.";
  return null;
}

type Created = { id: string; name: string; priceMinor: number; currency: string; status: string };

export default function NewProduct({ founderId }: { founderId: string }) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState<"LIVE" | "DRAFT">("LIVE");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<Created | null>(null);
  const [copied, setCopied] = useState(false);

  const blur = (field: "name" | "description" | "price", value: string) => () => {
    // Only complain about a field someone has actually filled in and left.
    if (!value.trim()) return;
    const message = checkField(field, value);
    setErrors((e) => ({ ...e, [field]: message ?? "" }));
  };

  const clear = (field: string) => setErrors((e) => ({ ...e, [field]: "" }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    const found: Record<string, string> = {};
    for (const [field, value] of [["name", name], ["description", description], ["price", price]] as const) {
      const message = checkField(field, value);
      if (message) found[field] = message;
    }
    if (Object.keys(found).length) {
      setErrors(found);
      setFormError(null);
      return;
    }

    setSubmitting(true);
    setErrors({});
    setFormError(null);
    setCreated(null);

    try {
      const res = await fetch("/api/founder/products", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name, description, priceMinor: toMinor(price), currency: "USD", status,
        }),
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

      setCreated(body.product);
      setName(""); setDescription(""); setPrice("");
      setSubmitting(false);
      router.refresh();
    } catch {
      setFormError("We couldn't reach the server. Nothing was created.");
      setSubmitting(false);
    }
  }

  // Shown after a successful create. A product nobody can reach is not finished,
  // so the checkout link is produced here rather than left to be hunted for.
  if (created) {
    const live = created.status === "LIVE";
    const link =
      (typeof window === "undefined" ? "" : window.location.origin)
      + `/pay/${founderId}/${created.id}`;

    return (
      <Notice tone="pine" head={`“${created.name}” is ready`}>
        <p style={{ margin: "0 0 10px" }}>
          {formatMinor(created.priceMinor, created.currency)}
          {live
            ? ". Anyone with this link can pay for it."
            : ". It is a draft, so this link will not take a payment until you make it live."}
        </p>
        <div
          className="mono"
          style={{
            background: "var(--surface)", border: "1px solid var(--line)", padding: "10px 12px",
            wordBreak: "break-all", fontSize: "var(--fs-2)", marginBottom: 8,
          }}
        >
          {link}
        </div>
        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          <Btn
            type="button" variant="2" size="sm"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(link);
                setCopied(true);
              } catch {
                // Clipboard is blocked in some browsers and over plain http. The
                // link is on screen and selectable, so this is not worth an alarm.
                setCopied(false);
              }
            }}
          >
            {copied ? "Copied" : "Copy checkout link"}
          </Btn>
          <a className="btn btn-q btn-sm" href={link} target="_blank" rel="noreferrer">
            Open it
          </a>
          <Btn type="button" variant="q" size="sm"
            onClick={() => { setCreated(null); setCopied(false); }}>
            Add another
          </Btn>
        </div>
      </Notice>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      {formError && (
        <div style={{ marginBottom: 12 }}>
          <Notice tone="clay" head="That didn&rsquo;t work">{formError}</Notice>
        </div>
      )}

      <Field label="What are you selling?" error={errors.name || undefined}>
        <input className="input" value={name} maxLength={NAME_MAX}
          onBlur={blur("name", name)}
          onChange={(e) => { setName(e.target.value); clear("name"); }}
          placeholder="Sticker pack" />
      </Field>

      <Field
        label="How would you describe it to a customer?"
        error={errors.description || undefined}
        hint={
          <>
            A sentence is enough. This is what they read before paying.{" "}
            <span className="charcount">{description.length}/{DESC_MAX}</span>
          </>
        }
      >
        <textarea className="ta" value={description} rows={3} maxLength={DESC_MAX}
          onBlur={blur("description", description)}
          onChange={(e) => { setDescription(e.target.value); clear("description"); }}
          placeholder="Ten hand-drawn vinyl stickers, posted anywhere in the US." />
      </Field>

      <Field label="What does it cost?" error={errors.price || undefined}
        hint="US dollars, between $0.01 and $999,999.99. Card payments have a minimum of about $0.50.">
        <input className="input" inputMode="decimal" value={price} maxLength={12}
          onBlur={blur("price", price)}
          onChange={(e) => { setPrice(e.target.value); clear("price"); }}
          placeholder="5.00" />
      </Field>

      <Field label="Ready to sell, or still working on it?" error={errors.status || undefined}
        hint="Only a live product can take a payment. A draft is yours to finish first.">
        <select className="select" value={status}
          onChange={(e) => setStatus(e.target.value as "LIVE" | "DRAFT")}>
          <option value="LIVE">Live, ready to sell</option>
          <option value="DRAFT">Draft, not for sale yet</option>
        </select>
      </Field>

      <Btn type="submit" disabled={submitting} aria-busy={submitting ? "true" : undefined}>
        {submitting ? "Creating…" : "Create product"}
      </Btn>
    </form>
  );
}

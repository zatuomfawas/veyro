// The parts of a checkout page that are not the card form.
//
// These exist so the homepage preview and the real checkout page render from
// one source. A preview typed out by hand looks right on the day it is written
// and is a lie a month later, when a price line moves or the wording about
// where the money goes is corrected in one place and not the other. Importing
// the same components means the preview cannot drift without the build
// noticing, which is the only version of "shows what your customer sees" that
// stays true.
//
// No hooks and no handlers, so a Server Component can render them.

import Link from "next/link";
import { formatMinor } from "@/lib/money";

/** Product name, and who is selling it. */
export function CheckoutHeading({
  name, sellerName, as: Tag = "h1",
}: {
  name: string;
  sellerName?: string | null;
  /**
   * The heading level. h1 on /pay, where the product IS the page.
   *
   * The landing page previews this component inside a page that already has an
   * h1, which gave that page two top-level headings — someone navigating by
   * heading would meet the demo product as a peer of the site's own title.
   * Previews pass a lower level.
   */
  as?: "h1" | "h3";
}) {
  return (
    <>
      <Tag className="d2" style={{ fontSize: "var(--fs-7)" }}>{name}</Tag>
      {sellerName && (
        <p className="tiny" style={{ marginTop: 4 }}>
          Sold by {sellerName}, through Veyro
        </p>
      )}
    </>
  );
}

/** What is being bought, and what it costs. */
export function CheckoutSummary({
  description, priceMinor, currency, recurring,
}: {
  description: string;
  priceMinor: number;
  currency: string;
  recurring?: boolean;
}) {
  return (
    <div className="card" style={{ marginTop: 20 }}>
      <div className="card-b">
        <p className="small">{description}</p>
        <div className="row-b" style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid var(--line)" }}>
          <span className="lbl">Total</span>
          <span className="num" style={{ fontSize: "var(--fs-6)", fontWeight: 600 }}>
            {formatMinor(priceMinor, currency)}
            {recurring && <span className="tiny" style={{ marginLeft: 4 }}>per month</span>}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Where the money and the card details go.
 *
 * The one paragraph on the page a customer needs in order to decide whether to
 * trust it, so it is also the one that must never say two different things in
 * two places.
 */
export function CheckoutAssurance({ underAgeNote = true }: { underAgeNote?: boolean }) {
  return (
    <>
      <div className="statusblock" style={{ marginTop: 20 }}>
        <div className="row" style={{ alignItems: "flex-start", gap: 12 }}>
          <span className="sb-mark sb-mark-pine" />
          <div>
            <div className="sb-head">Where your money and your card details go</div>
            <p className="sb-body">
              Your card details are entered on Stripe&rsquo;s own form and are never seen by
              Veyro or by the seller. The payment goes directly to the seller&rsquo;s Stripe
              account. Veyro never holds it and takes no percentage of it.
            </p>
          </div>
        </div>
      </div>

      {underAgeNote && (
        <p className="tiny" style={{ marginTop: 16, maxWidth: "var(--m-body)" }}>
          This seller is under 18 and has a parent or guardian named on the payment account, as
          the provider requires. Questions about a payment? Email{" "}
          <a className="linkbtn" href="mailto:hello@withveyro.com">hello@withveyro.com</a>.
        </p>
      )}
    </>
  );
}

/**
 * A still of Stripe's card form.
 *
 * The real form is Stripe's PaymentElement and it will not render without a
 * client secret, which means a live PaymentIntent — so putting the real one on
 * the homepage would create a Stripe payment every time a stranger scrolled
 * past. This is the only part of the preview that is a representation rather
 * than the component itself, and it says so: it is inert, it is labelled, and
 * it is never rendered on a page that can take a payment.
 */
function StillField({ label }: { label: string }) {
  return (
    <div style={{ marginTop: 12 }}>
      <span className="lbl" style={{ display: "block", marginBottom: 5 }}>{label}</span>
      <div
        style={{
          height: "var(--h-md)", width: "100%",
          border: "1px solid var(--line)", background: "var(--card)",
        }}
      />
    </div>
  );
}

export function CardFormStill({ amountLabel }: { amountLabel: string }) {
  return (
    <div aria-hidden="true" style={{ marginTop: 16 }}>
      <StillField label="Card number" />
      <div className="row" style={{ gap: 12, alignItems: "flex-end" }}>
        <div style={{ flex: "1 1 0", minWidth: 0 }}><StillField label="Expiry" /></div>
        <div style={{ flex: "1 1 0", minWidth: 0 }}><StillField label="CVC" /></div>
      </div>
      <div
        className="btn btn-lg btn-w"
        style={{ marginTop: 16, pointerEvents: "none" }}
      >
        Pay {amountLabel}
      </div>
    </div>
  );
}

/** A checkout page a stranger cannot use: the dead-link state. */
export function CheckoutUnavailable({
  reason, sellerName,
}: { reason: string; sellerName?: string | null }) {
  return (
    <>
      <h1 className="d2" style={{ fontSize: "var(--fs-7)" }}>Not available</h1>
      <p className="body" style={{ marginTop: 12 }}>{reason}</p>
      <p className="body" style={{ marginTop: 16 }}>
        You have not been charged and nothing has been taken from your card.{" "}
        {sellerName
          ? `Ask ${sellerName} for an up-to-date link; only they can change this.`
          : "Ask whoever sent you this link for an up-to-date one."}
      </p>
      {/* A stranger who followed a link to a page that does not work deserves
          to know whose site they are on. Without this the page is a dead end
          that also looks like a scam. */}
      <p className="tiny" style={{ marginTop: 16 }}>
        Veyro is the software this seller uses to take payments.{" "}
        <Link className="linkbtn" href="/">What Veyro is</Link>
      </p>
    </>
  );
}

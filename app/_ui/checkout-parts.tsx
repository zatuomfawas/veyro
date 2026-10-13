import Link from "next/link";
import { formatMinor } from "@/lib/money";
import { SUPPORT_EMAIL } from "@/lib/support";

/** Shared by the live checkout and inert previews. */
export function CheckoutHeading({
  name, sellerName, as: Tag = "h1",
}: {
  name: string;
  sellerName?: string | null;
  as?: "h1" | "h3";
}) {
  return (
    <div className="checkout-heading">
      <Tag className="checkout-product-name">{name}</Tag>
      {sellerName && (
        <p className="checkout-seller">Sold by {sellerName}, through Veyro</p>
      )}
    </div>
  );
}

export function CheckoutSummary({
  description, priceMinor, currency, recurring,
}: {
  description: string;
  priceMinor: number;
  currency: string;
  recurring?: boolean;
}) {
  return (
    <div className="checkout-summary">
      <p className="checkout-description">{description}</p>
      <dl className="checkout-price">
        <div>
          <dt>Total</dt>
          <dd>
            {formatMinor(priceMinor, currency)}
            {recurring && <span className="checkout-price-period"> per month</span>}
          </dd>
        </div>
      </dl>
    </div>
  );
}

export function CheckoutAssurance({ underAgeNote = true }: { underAgeNote?: boolean }) {
  return (
    <div className="checkout-assurance">
      <p>
        Card details stay with Stripe. Your payment goes directly to the seller&rsquo;s
        Stripe account. Veyro never holds it.
      </p>
      {underAgeNote && (
        <p>
          This seller is under 18, with a parent or guardian named on the payment account.
          Questions about a payment? Email{" "}
          <a className="linkbtn" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
        </p>
      )}
    </div>
  );
}

function StillField({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div className="checkout-still-field">
      <span className="checkout-still-label">{label}</span>
      <div className="checkout-still-control">{placeholder}</div>
    </div>
  );
}

/** No inputs or handlers: the real Stripe PaymentElement stays on /pay. */
export function CardFormStill({ amountLabel }: { amountLabel: string }) {
  return (
    <div className="checkout-card-still">
      <div aria-hidden="true">
        <StillField label="Card number" placeholder="1234 1234 1234 1234" />
        <div className="checkout-still-row">
          <StillField label="Expiry" placeholder="MM / YY" />
          <StillField label="CVC" placeholder="CVC" />
        </div>
        <div className="checkout-still-pay">Pay {amountLabel}</div>
      </div>
      <p className="checkout-still-note">Illustration only. No payment can be made here.</p>
    </div>
  );
}

export function CheckoutUnavailable({
  reason, sellerName,
}: { reason: string; sellerName?: string | null }) {
  return (
    <>
      <h1 className="checkout-product-name">Not available</h1>
      <p className="body" style={{ marginTop: "var(--sp-3)" }}>{reason}</p>
      <p className="body" style={{ marginTop: "var(--sp-4)" }}>
        You have not been charged and nothing has been taken from your card.{" "}
        {sellerName
          ? `Ask ${sellerName} for an up-to-date link; only they can change this.`
          : "Ask whoever sent you this link for an up-to-date one."}
      </p>
      <p className="tiny" style={{ marginTop: "var(--sp-4)" }}>
        Veyro is the software this seller uses to take payments.{" "}
        <Link className="linkbtn" href="/">What Veyro is</Link>
      </p>
    </>
  );
}

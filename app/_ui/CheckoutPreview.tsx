import { formatMinor } from "@/lib/money";
import {
  CheckoutHeading, CheckoutSummary, CheckoutAssurance, CardFormStill,
} from "@/app/_ui/checkout-parts";
import { PRODUCT_NAME, PRODUCT_PRICE_MINOR } from "@/app/_ui/wallet-example";

const DEMO = {
  sellerName: "Alex Taylor",
  name: PRODUCT_NAME,
  description: "A Notion workspace for notes, tasks and reading, ready to duplicate.",
  priceMinor: PRODUCT_PRICE_MINOR,
  currency: "USD",
};

/** Shares the real checkout's presentation without creating a payment. */
export function CheckoutPreview() {
  return (
    <div className="checkout-preview">
      <div className="checkout-preview-head">
        <span>Your customer&rsquo;s checkout</span>
        <span>Example</span>
      </div>
      <div className="checkout-preview-body">
        <CheckoutHeading as="h3" name={DEMO.name} sellerName={DEMO.sellerName} />
        <CheckoutSummary
          description={DEMO.description}
          priceMinor={DEMO.priceMinor}
          currency={DEMO.currency}
        />
        <CardFormStill amountLabel={formatMinor(DEMO.priceMinor, DEMO.currency)} />
        <CheckoutAssurance underAgeNote={false} />
      </div>
    </div>
  );
}

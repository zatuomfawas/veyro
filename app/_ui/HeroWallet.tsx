import { formatMinor } from "@/lib/money";
import { FREE_FLOOR_MINOR, RATE } from "@/lib/pricing";
import { CountUp } from "@/app/_ui/CountUp";
import {
  PRODUCT_NAME, PRODUCT_PRICE_MINOR, PRODUCT_SALES, PRODUCT_EARNED_MINOR, PRODUCT_FEE_MINOR,
} from "@/app/_ui/wallet-example";

/** An illustrative example; earnings and fees use the product's shared arithmetic. */
export function HeroWallet() {
  return (
    <div className="hw contrast-surface" data-count-group>
      <div className="hw-head">
        <p className="hw-k">Product earnings</p>
        <span className="hw-eg">Example</span>
      </div>

      <div className="hw-body">
        <p className="hw-product">{PRODUCT_NAME}</p>
        <p className="hw-terms">
          {formatMinor(PRODUCT_PRICE_MINOR, "USD")} each &middot; {PRODUCT_SALES} sales
        </p>

        <p className="hw-total-label">Sales this month</p>
        <p className="hw-bal"><CountUp amountMinor={PRODUCT_EARNED_MINOR} currency="USD" /></p>

        <dl className="hw-breakdown">
          <div>
            <dt>Veyro fee</dt>
            <dd>{formatMinor(PRODUCT_FEE_MINOR, "USD")}</dd>
          </div>
        </dl>
        <p className="hw-note">
          First {formatMinor(FREE_FLOOR_MINOR, "USD")} each month free.
          {" "}{RATE * 100}% on earnings above it. Stripe processing fees excluded.
        </p>
      </div>
    </div>
  );
}

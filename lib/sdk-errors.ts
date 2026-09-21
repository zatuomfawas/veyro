// What went wrong, in words, plus something to do about it.
//
// The audience is a founder who wired this up with an AI tool and may not know
// what a PaymentIntent is. "402 payment_intent_unexpected_state" tells them
// nothing; "your product is still a draft" tells them everything.
//
// Every entry carries a fixPrompt: a sentence they can paste back into the
// assistant that wrote the integration, or follow by hand. It is written to be
// useful to a person first and a model second, because a prompt that only a
// model can act on is a dead end for anyone reading it themselves.

export type SdkErrorCode =
  | "product_not_found"
  | "product_not_live"
  | "price_not_set"
  | "price_below_minimum"
  | "payments_not_set_up"
  | "no_product_id"
  | "rate_limited"
  | "not_configured"
  | "stripe_unavailable";

type Entry = { error: string; fixPrompt: string };

const ERRORS: Record<SdkErrorCode, Entry> = {
  product_not_found: {
    error: "No product with that ID.",
    fixPrompt:
      "The product ID does not match anything on Veyro. Open your Veyro dashboard, copy the ID "
      + "from the product row, and replace the one in the code.",
  },
  product_not_live: {
    error: "That product is a draft, so it cannot take a payment yet.",
    fixPrompt:
      "The product exists but is not published. Open your Veyro dashboard, edit the product and "
      + "set its status to Live. The checkout link does not change when you do.",
  },
  price_not_set: {
    error: "That product has no price.",
    fixPrompt:
      "Open your Veyro dashboard, edit the product and give it a price. Nothing can be charged "
      + "until there is an amount to charge.",
  },
  price_below_minimum: {
    error: "That price is below what a card network will process.",
    fixPrompt:
      "Card payments have a minimum of roughly $0.50. Edit the product on your Veyro dashboard "
      + "and raise the price above it.",
  },
  payments_not_set_up: {
    error: "This account cannot take payments yet.",
    fixPrompt:
      "Payment setup is not finished. If you are under 18 this is your guardian's step: invite "
      + "them from your Veyro dashboard, and they complete Stripe's identity form as themselves. "
      + "Nothing can be charged until Stripe has accepted them.",
  },
  no_product_id: {
    error: "No product ID was sent.",
    fixPrompt:
      "The call reached Veyro without a productId. Check that the productId prop is set and is "
      + "not undefined when the button is clicked.",
  },
  rate_limited: {
    error: "Too many attempts from here. Wait a moment.",
    fixPrompt:
      "Checkout is being started more often than a person could click. Make sure the checkout "
      + "call runs inside the click handler and not on every render.",
  },
  not_configured: {
    error: "Payments are not configured on this server.",
    fixPrompt: "This one is ours, not yours. Email hello@withveyro.com and we will look.",
  },
  stripe_unavailable: {
    error: "We could not reach the payment provider. Nothing has been charged.",
    fixPrompt:
      "A temporary problem between Veyro and Stripe. Try again in a moment; if it keeps "
      + "happening, email hello@withveyro.com.",
  },
};

/** The body every SDK endpoint returns when it refuses. */
export function explain(code: SdkErrorCode) {
  const e = ERRORS[code];
  return { ok: false as const, code, error: e.error, fixPrompt: e.fixPrompt };
}

/** The same table, for rendering the documentation from one source. */
export const SDK_ERROR_TABLE: { code: SdkErrorCode; error: string; fixPrompt: string }[] =
  (Object.keys(ERRORS) as SdkErrorCode[]).map((code) => ({ code, ...ERRORS[code] }));

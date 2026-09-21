// @veyro/sdk — take a payment from your own app.
//
// The whole surface is: give it a product id, get told when the money lands.
// Everything the payment itself needs — the amount, the currency, the seller's
// account, the card form — happens on Veyro's own checkout page, which is why
// this package has no dependencies and never sees a card number.
//
// It opens that page in a popup rather than redirecting, so your app is still
// running underneath when the customer finishes and your callback can act on
// it. The popup is opened synchronously inside the click, because a browser
// blocks a window opened after an await.

/** How long a checkout may stay open before we stop watching it. */
const WATCH_TIMEOUT_MS = 20 * 60 * 1000;
/** Gap between status checks. Slow enough to be polite, quick enough to feel instant. */
const POLL_INTERVAL_MS = 2000;

export type CheckoutStatus = "pending" | "completed" | "refunded";

export type VeyroError = Error & {
  /** A stable string to branch on, e.g. "product_not_live". */
  code?: string;
  /** A sentence to act on, or to paste back into the tool that wrote the integration. */
  fixPrompt?: string;
};

export type VeyroOptions = {
  /** Where Veyro lives. Only set this to point at a local Veyro. */
  baseUrl?: string;
};

export type CheckoutHandle = {
  /** The payment this checkout is for. Useful if you poll yourself. */
  intentId: string;
  /** Resolves when the payment is recorded, or rejects if it cannot be. */
  done: Promise<{ transactionId: string; status: CheckoutStatus }>;
  /** Stop watching. Does not cancel the payment; the customer may still pay. */
  cancel: () => void;
};

const DEFAULT_BASE = "https://withveyro.com";

function fail(message: string, code?: string, fixPrompt?: string): VeyroError {
  const e = new Error(message) as VeyroError;
  if (code) e.code = code;
  if (fixPrompt) e.fixPrompt = fixPrompt;
  return e;
}

async function post(baseUrl: string, path: string, body: unknown) {
  let res: Response;
  try {
    res = await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw fail(
      "Could not reach Veyro. Check the connection and try again.",
      "network",
      "The browser could not reach Veyro at all. If this is a local setup, check that baseUrl "
        + "points at the right address.",
    );
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw fail(
      data?.error ?? "Veyro could not start this checkout.",
      data?.code,
      data?.fixPrompt,
    );
  }
  return data;
}

/**
 * Create a checkout and get the URL a customer pays on.
 *
 * Most integrations want `openCheckout` instead; this is here for the cases
 * that need the URL itself — emailing it, printing a QR code, or opening it in
 * a way this package does not do for you.
 */
export async function createCheckout(
  productId: string,
  options: VeyroOptions = {},
): Promise<{ checkoutUrl: string; intentId: string }> {
  if (!productId) {
    throw fail(
      "No product ID was given.",
      "no_product_id",
      "openCheckout was called without a product ID. Check the value is set before the click.",
    );
  }
  const base = options.baseUrl ?? DEFAULT_BASE;
  const data = await post(base, "/api/checkout/create", { productId });
  return { checkoutUrl: data.checkoutUrl, intentId: data.intentId };
}

/** Ask whether a payment has been recorded yet. */
export async function getCheckoutStatus(
  intentId: string,
  options: VeyroOptions = {},
): Promise<{ status: CheckoutStatus; transactionId: string | null }> {
  const base = options.baseUrl ?? DEFAULT_BASE;
  const res = await fetch(`${base}/api/checkout/status?intent=${encodeURIComponent(intentId)}`);
  const data = await res.json().catch(() => null);
  if (!res.ok) throw fail(data?.error ?? "Could not check this payment.", data?.code);
  return { status: data.status, transactionId: data.transactionId };
}

/**
 * Open checkout and watch it.
 *
 * Call this from inside a click handler. It opens the window first and fills
 * it in afterwards: a popup opened after an `await` is blocked by every
 * browser, and that failure looks like "the SDK does nothing" rather than
 * "the popup was blocked", which is the kind of bug nobody finds.
 */
export function openCheckout(
  productId: string,
  options: VeyroOptions & { onSuccess?: (transactionId: string) => void; onError?: (e: VeyroError) => void } = {},
): CheckoutHandle {
  // Opened now, before any network call, while the click is still trusted.
  const popup = typeof window !== "undefined"
    ? window.open("about:blank", "veyro-checkout", "width=460,height=760")
    : null;

  let stopped = false;
  let intentId = "";
  const cancel = () => { stopped = true; };

  const done = (async () => {
    if (typeof window === "undefined") {
      throw fail("openCheckout needs a browser.", "no_window");
    }
    if (!popup) {
      throw fail(
        "The payment window was blocked by the browser.",
        "popup_blocked",
        "Call openCheckout directly inside the click handler, with no await before it. A window "
          + "opened after an await is treated as a pop-up and blocked.",
      );
    }

    let created: { checkoutUrl: string; intentId: string };
    try {
      created = await createCheckout(productId, options);
    } catch (e) {
      popup.close();
      throw e;
    }

    intentId = created.intentId;
    popup.location.href = created.checkoutUrl;

    const startedAt = Date.now();
    // The customer may close the window after paying, or before. Neither is
    // conclusive on its own, so a closed window is checked once more rather
    // than treated as a failure.
    let closedAt: number | null = null;

    for (;;) {
      if (stopped) throw fail("Checkout was cancelled.", "cancelled");
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));

      const { status, transactionId } = await getCheckoutStatus(intentId, options);
      if (status !== "pending" && transactionId) {
        if (!popup.closed) popup.close();
        return { transactionId, status };
      }

      if (popup.closed && closedAt === null) closedAt = Date.now();
      // A payment confirmed in the last moment before the window closed still
      // has to reach us by webhook, so the close is given a few seconds' grace.
      if (closedAt !== null && Date.now() - closedAt > 8000) {
        throw fail(
          "The payment window was closed before the payment finished.",
          "window_closed",
          "The customer closed checkout without completing payment. Nothing was charged.",
        );
      }
      if (Date.now() - startedAt > WATCH_TIMEOUT_MS) {
        throw fail("Stopped waiting for this payment.", "timeout");
      }
    }
  })();

  if (options.onSuccess || options.onError) {
    done.then(
      (r) => options.onSuccess?.(r.transactionId),
      (e) => options.onError?.(e as VeyroError),
    );
  }

  return { get intentId() { return intentId; }, done, cancel };
}

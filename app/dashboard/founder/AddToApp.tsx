"use client";

// The product id, handed over.
//
// It was already on the page — inside the href of every Preview link — but
// never as text anyone could select, while /docs/sdk tells a founder to paste
// "your-product-id" into a prompt. Somebody following those docs had to open
// the network tab or read a URL out of the status bar to find it, which is a
// silly thing to ask of a sixteen-year-old who just wants a buy button.
//
// useCopy rather than a second try/catch: clipboard access is refused over
// plain http and blocked outright in some browsers, and the failure path has
// to say so rather than pretend. One implementation, three callers.

import Link from "next/link";
import { Btn } from "@/app/_ui/form";
import { useCopy } from "@/app/_ui/useCopy";

/** The prompt a founder pastes into an assistant, with their real id in it. */
function promptFor(productId: string) {
  return `Add Veyro payments to this project.

Veyro is a REST API. This prompt uses it directly, so there is nothing to
install.

1. Add a "Buy" button. When it is clicked, POST to:
   https://withveyro.com/api/checkout/create
   with JSON body: { "productId": "${productId}" }

2. The response is JSON:
   { "ok": true, "checkoutUrl": "...", "intentId": "..." }
   Send the customer to checkoutUrl. They pay there, on Veyro's hosted page,
   so no card details ever touch this project.

3. To find out whether they paid, GET:
   https://withveyro.com/api/checkout/status?intent=INTENT_ID
   Response: { "ok": true, "status": "pending" | "completed" | "refunded" }

Do not add any other payment code, keys or webhooks. Veyro needs none.`;
}

export function AddToApp({ productId, productName }: { productId: string; productName: string }) {
  const id = useCopy();
  const prompt = useCopy();

  return (
    <section className="addapp" aria-labelledby="addapp-h">
      <div className="addapp-h">
        <h2 className="addapp-t" id="addapp-h">Add it to your app</h2>
        <span className="badge b-grey">{productName}</span>
      </div>
      <p className="addapp-d">
        Paste the prompt below into Claude, Cursor or Lovable and it will add a working checkout
        button to whatever you have already built. Your product id is in it, so there is nothing
        to fill in.
      </p>

      <div className="addapp-id">
        <span className="addapp-key">Product id</span>
        <code>{productId}</code>
        <span style={{ flex: "1 1 auto" }} />
        <Btn
          type="button"
          variant="2"
          size="sm"
          onClick={() => id.copy(productId)}
        >
          {id.state === "copied" ? "Copied" : id.state === "failed" ? "Copy failed" : "Copy id"}
        </Btn>
      </div>

      <div className="row" style={{ gap: 8, marginTop: "var(--sp-5)", flexWrap: "wrap" }}>
        <Btn type="button" onClick={() => prompt.copy(promptFor(productId))}>
          {prompt.state === "copied"
            ? "Prompt copied"
            : prompt.state === "failed"
              ? "Copy failed"
              : "Copy the prompt"}
        </Btn>
        <Link className="btn btn-2" href="/docs/sdk">Read the integration guide</Link>
      </div>

      {(id.state === "failed" || prompt.state === "failed") && (
        <p className="addapp-foot" role="status">
          Your browser refused clipboard access. Both the id and the prompt are on screen and can
          be selected by hand.
        </p>
      )}
    </section>
  );
}

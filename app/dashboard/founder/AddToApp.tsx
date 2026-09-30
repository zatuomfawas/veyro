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

export function AddToApp({
  productId, productName, live, blockedReason,
}: {
  productId: string;
  productName: string;
  /** True only when this product is LIVE and the account can actually charge. */
  live: boolean;
  /** Why it cannot take money yet. Shown as-is; null when it can. */
  blockedReason: string | null;
}) {
  const id = useCopy();
  const code = useCopy();
  const prompt = useCopy();

  // The real component from the docs, with their own id already in it. The
  // point of the starter product is that this is copy-and-paste on the first
  // visit rather than copy, go and make a product, come back, copy again.
  const snippet = `import { VeyroCheckout } from "veyro-sdk/react";

export function BuyButton() {
  return (
    <VeyroCheckout
      productId="${productId}"
      onSuccess={(transactionId) => {
        // The money has landed. Unlock the thing, send the file, show a receipt.
        console.log("paid", transactionId);
      }}
      onError={(error) => console.error(error.message, error.fixPrompt)}
    >
      Buy now
    </VeyroCheckout>
  );
}`;

  return (
    <section className="addapp" aria-labelledby="addapp-h">
      <div className="addapp-h">
        <h2 className="addapp-t" id="addapp-h">Add payments to your app in 2 minutes</h2>
        {/* The status is the product's real one, not a decoration. A founder
            who signed up a minute ago has no payment account, so their starter
            product is a draft and this says so rather than showing a tick. */}
        <span className={"badge " + (live ? "b-pine" : "b-grey")}>
          {live ? "Live \u2713" : "Not live yet"}
        </span>
      </div>

      {/* Two columns from 900px up. The snippet's longest line is about 70
          characters, so on a full-width dashboard panel it left a third of the
          row empty to the right of the code. The actions move into that space
          instead of sitting under it, which also puts "Copy code" beside the
          code rather than below a block you have to scroll past. */}
      <div className="addapp-grid">
        <pre className="addapp-code"><code>{snippet}</code></pre>

        <div className="addapp-side">
      <p className="addapp-d">
        This is the code for <b>{productName}</b>, with its id already in it. Paste it into your
        project and the button opens a Veyro checkout.
        {blockedReason && <> {blockedReason}</>}
      </p>

      <div className="row" style={{ gap: 8, marginTop: "var(--sp-5)", flexWrap: "wrap" }}>
        <Btn type="button" onClick={() => code.copy(snippet)}>
          {code.state === "copied" ? "Copied" : code.state === "failed" ? "Copy failed" : "Copy code"}
        </Btn>
        <Btn type="button" variant="2" onClick={() => prompt.copy(promptFor(productId))}>
          {prompt.state === "copied"
            ? "Prompt copied"
            : prompt.state === "failed"
              ? "Copy failed"
              : "Copy an AI prompt instead"}
        </Btn>
        <Link className="btn btn-2" href="/docs/sdk">Read the guide</Link>
      </div>

      <div className="addapp-id" style={{ marginTop: "var(--sp-5)" }}>
        <span className="addapp-key">Product id</span>
        <code>{productId}</code>
        <span style={{ flex: "1 1 auto" }} />
        <Btn type="button" variant="2" size="sm" onClick={() => id.copy(productId)}>
          {id.state === "copied" ? "Copied" : id.state === "failed" ? "Copy failed" : "Copy id"}
        </Btn>
      </div>

      <p className="addapp-foot">
        This is your first product and you can change anything about it &mdash; its name, what it
        says, what it costs.{" "}
        <Link className="linkbtn" href="/dashboard/founder/products">Edit it, or add another</Link>.
      </p>
        </div>
      </div>

      {(id.state === "failed" || code.state === "failed" || prompt.state === "failed") && (
        <p className="addapp-foot" role="status">
          Your browser refused clipboard access. The code and the id are both on screen and can be
          selected by hand.
        </p>
      )}
    </section>
  );
}

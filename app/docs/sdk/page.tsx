import Link from "next/link";
import { IntegrationPanel } from "@/app/_ui/IntegrationPanel";
import type { Metadata } from "next";
import { buildViewport, SITE } from "@/lib/seo";
import { CSS, CSS2 } from "@/app/_ui/css";
import { Wordmark, SkipLink } from "@/app/_ui/marks";
import { Notice } from "@/app/_ui/form";
import { SiteFooter } from "@/app/_ui/SiteFooter";
import { MobileNav } from "@/app/_ui/MobileNav";
import { ScrollTop } from "@/app/_ui/ScrollTop";
import { SDK_ERROR_TABLE } from "@/lib/sdk-errors";
import { Copyable } from "./Copyable";

export const viewport = buildViewport();

export const metadata: Metadata = {
  title: "Add Veyro to your app",
  description:
    "Take payments from an app you already built. One product ID, one button, no payment "
    + "infrastructure to understand.",
  alternates: { canonical: SITE + "/docs/sdk" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "Veyro",
    title: "Add Veyro to your app",
    description: "One product ID, one button.",
    url: SITE + "/docs/sdk",
  },
};

// The package name in one place, so the install line, the imports and the AI
// prompts cannot disagree about what to type.
const PKG = "veyro-sdk";

/** True once the package is on npm. Until then the docs say so. */
const PUBLISHED = false;

const AI_PROMPTS: [string, string][] = [
  [
    "Claude Code, or Cursor",
    `Add Veyro payments to my [framework] project.

- Install the SDK: npm install ${PKG}
- Product ID: [paste it from your Veyro dashboard]
- Add a "Buy now" button on [which page]
- Import { VeyroCheckout } from "${PKG}/react" and use it for the button
- On successful payment, [what should happen]
- Keep the existing design and do not change anything else
- Follow the official docs at ${SITE}/docs/sdk`,
  ],
  [
    "Lovable, or another in-browser builder",
    `Add Veyro payments to this project using the npm package ${PKG}.

- Add a button that opens Veyro checkout for product ID [paste it here]
- Handle both the success and the error callback
- Show the customer something after a successful payment
- Do not change the rest of the design`,
  ],
  [
    "When something is not working",
    `Veyro checkout is not working in my app. The error is:

[paste the whole error, including the fixPrompt if there is one]

Read ${SITE}/docs/sdk and fix only what that error points at.`,
  ],
];

export default function SdkDocs() {
  return (
    <div className="fw">
      <style>{CSS + CSS2}</style>
      <SkipLink />

      <div className="navbar">
        <div className="wrap-lp">
          <nav className="lp-nav" aria-label="Main">
            <Link href="/" aria-label="Veyro, home"><Wordmark size={20} /></Link>
            <div className="lp-links">
              <Link className="btn btn-q btn-sm hide-s" href="/get-started">Get started</Link>
              <Link className="btn btn-q btn-sm hide-s" href="/how-it-works">How it works</Link>
              <Link className="btn btn-sm" href="/check">Check eligibility</Link>
              <MobileNav
                items={[
                  { href: "/get-started", label: "Get started" },
                  { href: "/how-it-works", label: "How it works" },
                  { href: "/wallet", label: "The Founder Wallet" },
                  { href: "/faq", label: "Questions" },
                  { href: "/check", label: "Check eligibility" },
                ]}
              />
            </div>
          </nav>
        </div>
      </div>

      <main id="main" className="wrap-lp" style={{ paddingTop: 32, paddingBottom: 56 }}>
        <span className="lp-eyebrow">For developers</span>
        <h1 className="lp-h2" style={{ marginTop: "var(--sp-2)" }}>Add Veyro to your app.</h1>
        <p className="lead" style={{ marginTop: 16 }}>
          You already built something. This is how it takes money: one product ID, one button, and
          nothing about payment infrastructure that you have to learn first.
        </p>

        {!PUBLISHED && (
          <div style={{ marginTop: 24, maxWidth: "var(--m-body)" }}>
            <Notice tone="amber" head={`${PKG} is not on npm yet`}>
              Everything on this page is built and the endpoints are live, but the package has not
              been published, so <span className="mono">npm install {PKG}</span> will answer 404
              today. Until it does, the same thing works with no package at all — see{" "}
              <Link className="linkbtn" href="#nopackage">Without the SDK</Link> below. This notice
              comes down when the install works.
            </Notice>
          </div>
        )}

        <hr className="rule" style={{ margin: "30px 0" }} />

        {/* ---------------- 1 ---------------- */}
        <h2 className="h3">1. What you need</h2>
        <div className="ruled" style={{ marginTop: 14 }}>
          <div>
            <h3 className="h4" style={{ margin: 0 }}>A product with a price</h3>
            <p className="body" style={{ margin: 0 }}>
              Made on your Veyro dashboard. Its ID is what the button needs.
            </p>
          </div>
          <div>
            <h3 className="h4" style={{ margin: 0 }}>A guardian, if you are under 18</h3>
            <p className="body" style={{ margin: 0 }}>
              They complete the payment provider&rsquo;s identity form once.{" "}
              <Link className="linkbtn" href="/get-started">The steps, in order</Link>.
            </p>
          </div>
          <div>
            <h3 className="h4" style={{ margin: 0 }}>That is it</h3>
            <p className="body" style={{ margin: 0 }}>
              No API keys, no webhook to set up, no server code. Veyro holds none of your
              customer&rsquo;s card details and neither does your app.
            </p>
          </div>
        </div>

        {/* ---------------- 2 ---------------- */}
        <h2 className="h3" style={{ marginTop: 34 }}>2. Install it</h2>
        <Copyable label="Terminal" code={`npm install ${PKG}`} />

        {/* ---------------- 3 ---------------- */}
        <h2 className="h3" style={{ marginTop: 34 }}>3. Add the button</h2>
        <p className="body" style={{ marginTop: 8, maxWidth: "var(--m-body)" }}>
          React, with the component:
        </p>
        <Copyable
          label="React"
          code={`import { VeyroCheckout } from "${PKG}/react";

export function BuyButton() {
  return (
    <VeyroCheckout
      productId="your-product-id"
      onSuccess={(transactionId) => {
        // The money has landed. Unlock the thing, send the file, show a receipt.
        console.log("paid", transactionId);
      }}
      onError={(error) => {
        console.error(error.message, error.fixPrompt);
      }}
    >
      Buy now — $25
    </VeyroCheckout>
  );
}`}
        />

        <p className="body" style={{ marginTop: 20, maxWidth: "var(--m-body)" }}>
          Anything else — Vue, Svelte, plain HTML — with the same function underneath:
        </p>
        <Copyable
          label="Any framework"
          code={`import { openCheckout } from "${PKG}";

document.querySelector("#buy").addEventListener("click", () => {
  openCheckout("your-product-id", {
    onSuccess: (transactionId) => { /* … */ },
    onError: (error) => console.error(error.message, error.fixPrompt),
  });
});`}
        />
        <p className="small" style={{ marginTop: 14, maxWidth: "var(--m-body)" }}>
          Call it <strong>inside the click</strong>, with no <span className="mono">await</span>{" "}
          before it. Checkout opens in a window, and a browser blocks a window opened after an
          await — which looks like the button doing nothing at all.
        </p>

        {/* ---------------- without the package ---------------- */}
        <div id="nopackage" />
        <h2 className="h3" style={{ marginTop: 34 }}>Without the SDK</h2>
        <p className="body" style={{ marginTop: 8, maxWidth: "var(--m-body)" }}>
          The package is a convenience, not a requirement — it calls two public endpoints. This
          does the same job with no dependency, and works today whether or not the package is
          published.
        </p>
        <Copyable
          label="Plain fetch"
          code={`async function buy(productId) {
  const res = await fetch("${SITE}/api/checkout/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);

  window.open(data.checkoutUrl, "_blank");

  // Ask every couple of seconds whether the payment has landed.
  for (;;) {
    await new Promise((r) => setTimeout(r, 2000));
    const s = await fetch(
      "${SITE}/api/checkout/status?intent=" + data.intentId,
    ).then((r) => r.json());
    if (s.status === "completed") return s.transactionId;
  }
}`}
        />

        {/* ---------------- 4 ---------------- */}
        <h2 className="h3" style={{ marginTop: 34 }}>4. Check it before you ship</h2>
        <p className="body" style={{ marginTop: 8, maxWidth: "var(--m-body)" }}>
          Paste this into your browser console, anywhere. It answers from Veyro, so it tells you
          about your product rather than about your code.
        </p>
        <Copyable
          label="Browser console"
          code={`await fetch("${SITE}/api/integration-test", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ productId: "your-product-id" }),
}).then((r) => r.json()).then(console.log);`}
        />
        <p className="small" style={{ marginTop: 14, maxWidth: "var(--m-body)" }}>
          Every field is something the server can actually see. It cannot tell whether the package
          is installed in your project — nothing on our side can — so it does not pretend to.
          <br />
          <span className="mono">readyToLaunch: true</span> means a customer opening your link
          right now would get a payment form.
        </p>

        {/* The same check without the console, moved here from the landing
            page. It was a developer tool sitting in the middle of marketing —
            a tool picker, a product id field, a live test and a REST
            reference — which made the homepage read as four different kinds of
            page stacked together. Here it is beside the docs it belongs to and
            in front of the people who want it. */}
        <div style={{ marginTop: 22, maxWidth: "var(--m-wide)" }}>
          <IntegrationPanel />
        </div>

        {/* ---------------- 5 ---------------- */}
        <h2 className="h3" style={{ marginTop: 34 }}>5. Go live</h2>
        <p className="body" style={{ marginTop: 8, maxWidth: "var(--m-body)" }}>
          There is no switch. Once that check comes back ready, the button takes real money. Your
          first payment appears in your wallet, and{" "}
          <Link className="linkbtn" href="/wallet">the wallet</Link> shows what has settled and
          what is still on its way.
        </p>

        <hr className="rule" style={{ margin: "34px 0 30px" }} />

        {/* ---------------- prompts ---------------- */}
        <h2 className="h3">If an AI tool is writing this for you</h2>
        <p className="body" style={{ marginTop: 8, maxWidth: "var(--m-body)" }}>
          Copy one of these, fill in the brackets, and paste it in. They are written so the
          assistant changes the payment button and nothing else.
        </p>
        {AI_PROMPTS.map(([label, code]) => (
          <div key={label} style={{ marginTop: 18 }}>
            <Copyable label={label} code={code} />
          </div>
        ))}

        <hr className="rule" style={{ margin: "34px 0 30px" }} />

        {/* ---------------- errors ---------------- */}
        <h2 className="h3">When something goes wrong</h2>
        <p className="body" style={{ marginTop: 8, maxWidth: "var(--m-body)" }}>
          Every refusal comes back with a <span className="mono">code</span>, a sentence in plain
          words, and a <span className="mono">fixPrompt</span> you can act on or paste back into
          whatever wrote the integration. This table is generated from the same source the API
          answers from, so it cannot fall out of date.
        </p>
        <div className="tblwrap" style={{ marginTop: 16 }}>
          <table className="tbl">
            <thead>
              <tr>
                <th scope="col">Code</th>
                <th scope="col">What it means</th>
                <th scope="col">What to do</th>
              </tr>
            </thead>
            <tbody>
              {SDK_ERROR_TABLE.map((e) => (
                <tr key={e.code}>
                  <td><span className="mono">{e.code}</span></td>
                  <td>{e.error}</td>
                  <td>{e.fixPrompt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <hr className="rule" style={{ margin: "34px 0 30px" }} />

        <h2 className="h3">Where the card details go</h2>
        <p className="body" style={{ marginTop: 8, maxWidth: "var(--m-body)" }}>
          Not to your app, and not to your server. The button opens Veyro&rsquo;s own checkout
          page, and the card form on it belongs to Stripe. Your site never receives a card number,
          which is why this package needs no keys and asks for no configuration.
        </p>
        <p className="small" style={{ marginTop: 14, maxWidth: "var(--m-body)" }}>
          The payment goes straight to your Stripe account. Veyro is never in the path of the
          money. <Link className="linkbtn" href="/how-it-works">How that works</Link>
        </p>

        <div className="row" style={{ marginTop: 26, gap: 8, flexWrap: "wrap" }}>
          <Link className="btn btn-lg" href="/get-started">Get a product ID</Link>
          <Link className="btn btn-2 btn-lg" href="/contact">Ask us something</Link>
        </div>
      </main>

      <ScrollTop />
      <SiteFooter />
    </div>
  );
}

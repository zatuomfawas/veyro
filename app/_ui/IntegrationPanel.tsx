"use client";

// Connect a product you have already built.
//
// Everything in this panel is real. The prompt describes the two endpoints that
// exist and are CORS-enabled today, POST /api/checkout/create and GET
// /api/checkout/status, and the test button calls POST /api/integration-test
// and reports what came back. Nothing is mocked and nothing is staged.
//
// Three things it deliberately does not claim:
//
// 1. "Veyro connected". The server sees a product id, not somebody's
//    node_modules, so whether a project imports anything is not observable from
//    here. /api/integration-test dropped the same field for the same reason,
//    and re-adding it as a green tick on the homepage would be worse: a check
//    that reports what it cannot know gets believed.
//
// 2. npm install. veyro-sdk is written but not published, so a prompt telling
//    an agent to install it fails at the first line. The REST API needs no
//    package, so the prompt uses fetch and works today.
//
// 3. Tested support for any particular AI tool. The picker changes where the
//    prompt says to paste it, and nothing else. Nobody has verified Veyro
//    inside Lovable or Bolt, so the UI does not imply it.

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { Btn, Field, Notice } from "@/app/_ui/form";
import { useCopy } from "@/app/_ui/useCopy";

type ToolId = "claude" | "cursor" | "lovable" | "bolt" | "replit" | "other";

// Label and paste instruction only. No capability claim attaches to any of
// these, which is why there is no "supported" flag on the type.
const TOOLS: { id: ToolId; label: string; where: string }[] = [
  { id: "claude", label: "Claude Code", where: "Paste it into Claude Code, in the project you want to take payments." },
  { id: "cursor", label: "Cursor", where: "Paste it into Cursor's chat with your project open." },
  { id: "lovable", label: "Lovable", where: "Paste it into Lovable's prompt box on the project." },
  { id: "bolt", label: "Bolt", where: "Paste it into Bolt's prompt box on the project." },
  { id: "replit", label: "Replit", where: "Paste it into Replit's AI panel with your Repl open." },
  { id: "other", label: "Other", where: "Paste it into whichever AI coding tool you built with." },
];

/** The observable half of an integration-test response. */
type TestResult = {
  ok: boolean;
  productFound?: boolean;
  productLive?: boolean;
  priceValid?: boolean;
  accountActive?: boolean;
  checkoutOpens?: boolean;
  everSold?: boolean;
  readyToLaunch?: boolean;
  error?: string;
  fixPrompt?: string;
};

// The page's origin, read safely across the server/client boundary.
//
// useSyncExternalStore exists for exactly this: a value the server cannot know.
// getServerSnapshot supplies the production host for the HTML, getSnapshot
// supplies the real one once hydrated, and React reconciles the two without a
// mismatch — where reading window during render threw #418, and reading it in
// an effect meant calling setState from an effect, which the hooks lint
// correctly refuses. Nothing ever changes the origin without a full navigation,
// so subscribe is a no-op that returns an unsubscribe.
const subscribeToNothing = () => () => {};
const clientOrigin = () => window.location.origin;
const serverOrigin = () => "https://withveyro.com";

function buildPrompt(origin: string, productId: string) {
  const id = productId.trim() || "YOUR_PRODUCT_ID";
  return `Add Veyro payments to this project.

Veyro is a REST API. There is no package to install.

1. Add a "Buy" button. When it is clicked, POST to:
   ${origin}/api/checkout/create
   with JSON body: { "productId": "${id}" }

2. The response is JSON:
   { "ok": true, "checkoutUrl": "...", "intentId": "..." }
   Send the customer to checkoutUrl. They pay there, on Veyro's hosted
   page, so no card details ever touch this project.

3. To find out whether they paid, GET:
   ${origin}/api/checkout/status?intent=INTENT_ID
   Response: { "ok": true, "status": "pending" | "completed" | "refunded",
   "transactionId": "..." }
   Poll it after the customer returns, or check it when they land back on
   the site. "pending" is normal and means keep waiting.

4. On any error the response is { "ok": false, "code", "error", "fixPrompt" }.
   Show me the "error" text; do not invent your own message.

Rules:
- Do not store or handle card details anywhere in this project.
- Do not put any secret key in client-side code. These two endpoints need
  no key at all.
- Keep the product id in one place so it is easy to change.`;
}

function Check({ ok, label, detail }: { ok: boolean; label: string; detail: string }) {
  return (
    <div className="ck">
      {/* The mark is decorative; the word carries the state, so this never
          depends on colour or on a glyph being recognised. */}
      <span className={"ck-m " + (ok ? "ck-y" : "ck-n")} aria-hidden="true" />
      <span>
        <span className="ck-t">
          {label}
          <span className="ck-s">{ok ? "Connected" : "Not yet"}</span>
        </span>
        <span className="ck-d">{detail}</span>
      </span>
    </div>
  );
}

export function IntegrationPanel() {
  const [tool, setTool] = useState<ToolId>("claude");
  const [productId, setProductId] = useState("");
  const [result, setResult] = useState<TestResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);
  const prompt = useCopy();
  const fix = useCopy();

  const where = TOOLS.find((t) => t.id === tool)?.where ?? TOOLS[5].where;

  const origin = useSyncExternalStore(subscribeToNothing, clientOrigin, serverOrigin);
  const text = useMemo(() => buildPrompt(origin, productId), [origin, productId]);

  const test = useCallback(async () => {
    const id = productId.trim();
    if (!id) return;
    setBusy(true);
    setFailed(null);
    try {
      const res = await fetch("/api/integration-test", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ productId: id }),
      });
      setResult(await res.json());
    } catch {
      // The network, not the integration. Saying "not connected" here would
      // blame the founder's project for our own failure to reach the server.
      setFailed("We couldn't reach Veyro to run the test. Nothing about your project has changed.");
      setResult(null);
    } finally {
      setBusy(false);
    }
  }, [productId]);

  return (
    <div className="card">
      <div className="card-h">
        <span style={{ fontSize: "var(--fs-3)", fontWeight: 560 }}>Connect your project</span>
        <span className="badge b-grey">Integration preview</span>
      </div>

      <div className="card-b">
        <p className="small" style={{ marginTop: 0 }}>
          Veyro is a REST API, so there is nothing to install. Paste the prompt below into the tool
          you built with and it will add a working checkout.
        </p>

        <div style={{ marginTop: 18 }}>
          <span className="lbl" id="tool-label" style={{ display: "block", marginBottom: 6 }}>
            Where are you building?
          </span>
          <div className="seg segwrap" role="group" aria-labelledby="tool-label">
            {TOOLS.map((t) => (
              <button
                key={t.id}
                type="button"
                aria-pressed={tool === t.id}
                onClick={() => setTool(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
          <p className="hint" style={{ marginTop: 8 }}>
            {where} This only changes the instruction above &mdash; the prompt is the same, and
            Veyro has not tested these tools individually.
          </p>
        </div>

        <hr className="rule" style={{ margin: "20px 0 18px" }} />

        <Field
          label="Your product id (optional)"
          hint="Add one and it goes straight into the prompt. Leave it blank and the prompt says where to put it."
        >
          <input
            className="input mono"
            value={productId}
            onChange={(e) => { setProductId(e.target.value); setResult(null); }}
            placeholder="prod_…"
            spellCheck={false}
            autoComplete="off"
          />
        </Field>

        <span className="lbl" style={{ display: "block", marginTop: 4, marginBottom: 6 }}>
          Your integration prompt
        </span>
        <pre className="code codescroll" tabIndex={0} aria-label="Integration prompt">{text}</pre>

        <div className="row" style={{ gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          <Btn type="button" variant="2" onClick={() => prompt.copy(text)}>
            {prompt.state === "copied" ? "Copied" : "Copy prompt"}
          </Btn>
          <span className="sr-only" role="status">
            {prompt.state === "copied" ? "Integration prompt copied to the clipboard." : ""}
          </span>
          {prompt.state === "failed" && (
            <span className="tiny">Your browser blocked the copy. Select the prompt above instead.</span>
          )}
        </div>

        <hr className="rule" style={{ margin: "22px 0 18px" }} />

        <span className="lbl" style={{ display: "block", marginBottom: 8 }}>Integration status</span>

        {!result && !failed && (
          <p className="small" style={{ marginTop: 0 }}>
            Add a product id above and run the test. Veyro checks what it can actually see from the
            server: whether the checkout opens, and whether a payment has ever arrived through
            Stripe&rsquo;s signed webhook.
          </p>
        )}

        {failed && <Notice tone="amber" head="Test didn&rsquo;t run" live>{failed}</Notice>}

        {result && result.productFound === false && (
          <Notice tone="clay" head="No product with that id" live>
            {result.error ?? "Check the id on your dashboard and try again."}
          </Notice>
        )}

        {result && result.productFound && (
          <>
            <div className="cklist">
              <Check
                ok={Boolean(result.checkoutOpens)}
                label="Checkout"
                detail="Whether a customer opening your link would get a payment form right now."
              />
              <Check
                ok={Boolean(result.everSold)}
                label="Payment events"
                detail="Whether a completed payment has reached Veyro through Stripe's signed webhook."
              />
            </div>

            {result.fixPrompt && (
              <div style={{ marginTop: 14 }}>
                <Notice tone="amber" head="Integration needs attention" live>
                  <p style={{ margin: "0 0 10px" }}>{result.error}</p>
                  <p className="mono" style={{ margin: "0 0 10px", fontSize: "var(--fs-2)" }}>
                    {result.fixPrompt}
                  </p>
                  <Btn type="button" variant="2" size="sm" onClick={() => fix.copy(result.fixPrompt!)}>
                    {fix.state === "copied" ? "Copied" : "Copy fix prompt"}
                  </Btn>
                  <span className="sr-only" role="status">
                    {fix.state === "copied" ? "Fix prompt copied to the clipboard." : ""}
                  </span>
                </Notice>
              </div>
            )}

            {!result.fixPrompt && result.checkoutOpens && !result.everSold && (
              <p className="tiny" style={{ marginTop: 12 }}>
                Nothing is wrong. A payment event appears here the first time someone actually pays.
              </p>
            )}
          </>
        )}

        <div className="row" style={{ gap: 8, marginTop: 14, flexWrap: "wrap" }}>
          <Btn type="button" onClick={test} disabled={!productId.trim() || busy} aria-busy={busy ? "true" : undefined}>
            {busy ? "Testing…" : result ? "Test again" : "Run integration test"}
          </Btn>
        </div>
      </div>

      <div className="card-f">
        <p className="tiny" style={{ margin: 0 }}>
          The two endpoints in the prompt are live now. The <span className="mono">veyro-sdk</span>{" "}
          package, which wraps them in a few lines of JavaScript, is written but not yet published
          &mdash; the REST route above needs nothing installed and works today.
        </p>
      </div>
    </div>
  );
}

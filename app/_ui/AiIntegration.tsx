"use client";

// Telling an AI tool to wire up payments, as the way this is actually done in
// 2026 rather than as a footnote to the REST docs.
//
// The prompt is the real one — the same text the dashboard hands a founder
// once they have a product id, minus the id, because there is nothing to paste
// yet on a page you have not signed up from. If the SDK's surface changes this
// has to change with it; it is not marketing copy, it is an instruction that
// has to still work when someone pastes it.

import { useCopy } from "@/app/_ui/useCopy";

const PROMPT = `Add Veyro payments to my project.

- Install the SDK: npm install veyro-sdk
- Product ID: [paste it from your Veyro dashboard]
- Add a "Buy now" button on [which page]
- Import { VeyroCheckout } from "veyro-sdk/react" and use it for the button
- On successful payment, [what should happen]
- Keep the existing design and do not change anything else
- Follow the official docs at https://withveyro.com/docs/sdk`;

const TOOLS = ["Claude Code", "Cursor", "Lovable", "Windsurf", "Copilot"];

export function AiIntegration() {
  const prompt = useCopy();

  return (
    <div className="ai">
      <div className="ai-l">
        <span className="lp-eyebrow">The fast way</span>
        <h2 className="lp-h2" style={{ marginTop: "var(--sp-2)" }}>
          Tell Claude to add Veyro.
        </h2>
        <p className="body" style={{ marginTop: 12 }}>
          You probably did not write every line of your project by hand, and you do not have to
          write this part either. Copy the prompt, paste it into whatever you build with, and it
          wires up the button, the checkout and what happens after someone pays.
        </p>

        <ul className="ai-tools" aria-label="Tools this works with">
          {TOOLS.map((t) => <li key={t}>{t}</li>)}
        </ul>

        <div className="row" style={{ marginTop: "var(--sp-5)", gap: 8, flexWrap: "wrap" }}>
          <button type="button" className="btn" onClick={() => prompt.copy(PROMPT)}>
            {prompt.state === "copied" ? "Copied" : prompt.state === "failed" ? "Press ⌘C" : "Copy the prompt"}
          </button>
          <a className="btn btn-2" href="/docs/sdk">Read the guide</a>
        </div>
        {prompt.state === "failed" && (
          <p className="small" style={{ marginTop: 10 }}>
            Your browser blocked the clipboard. Select the prompt and copy it by hand.
          </p>
        )}
      </div>

      <figure className="ai-r">
        <figcaption className="ai-cap">
          <span className="ai-dot" aria-hidden="true" />
          Paste this into your editor
        </figcaption>
        <pre className="ai-pre">{PROMPT}</pre>
      </figure>
    </div>
  );
}

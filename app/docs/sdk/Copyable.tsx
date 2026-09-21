"use client";

// A code block with a copy button.
//
// The audience is meant to paste these, so the block is a real <pre> that
// selects cleanly, and the button is a convenience on top rather than the only
// way to get the text. Clipboard access is refused in some browsers and over
// plain http; when that happens the code is still on screen and selectable, so
// the failure is quiet rather than an alarm.

import { useState } from "react";
import { Btn } from "@/app/_ui/form";

export function Copyable({ label, code }: { label: string; code: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div style={{ marginTop: "var(--sp-4)" }}>
      <div className="codecap">
        <span>{label}</span>
        <Btn
          type="button"
          variant="q"
          size="sm"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(code);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 2000);
            } catch {
              setCopied(false);
            }
          }}
        >
          {copied ? "Copied" : "Copy"}
        </Btn>
      </div>
      <pre className="code">{code}</pre>
    </div>
  );
}

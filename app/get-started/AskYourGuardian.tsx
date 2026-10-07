"use client";

// The message a founder sends their parent, written for them.
//
// This exists because of where accounts actually stop. Of the founders on the
// platform today, more invited a guardian than got one to accept, and fewer
// still got through the payment provider's form -- the drop is at the asking,
// not at the software. The page used to answer that with a sentence telling
// people to "ask them early", which is advice, not help. A thirteen-year-old
// explaining identity verification to a parent over text is the hardest thing
// this product asks of anyone, and it was the one step we handed over with
// nothing.
//
// So the words are here, written for the parent rather than for the founder,
// and they are deliberately an ASK rather than an announcement: it ends on a
// question, because a message that ends on a question gets answered and one
// that ends on a link does not.
//
// What it does not do is oversell. It does not say the guardian approves each
// sale, or that they can stop a payout -- neither is true on this account type
// -- and it sends them to the page that explains the whole arrangement rather
// than trying to be that page.
//
// Clipboard access is refused in some browsers and over plain http. The text
// is real selectable prose either way, so a refusal costs the button and
// nothing else.

import { useState } from "react";
import { Btn } from "@/app/_ui/form";

const MESSAGE = `Hi — I've built something I want to sell online, and there's one part I need you for.

I'm using Veyro. Because I'm under 18, the payment account has to be in an adult's name, and that would be you. It's one form and about ten minutes. Stripe, the payment company, is who verifies you — Veyro never sees your ID or your bank details.

What it means for you: your name is on the payment account, and you're told every time I request a payout. You're not running the business and it doesn't cost you anything.

This page explains it properly, including the parts that aren't settled yet:
https://withveyro.com/for-parents

Can I send you the invite?`;

export function AskYourGuardian() {
  const [copied, setCopied] = useState(false);

  return (
    <div className="askg">
      <div className="askg-h">
        <span className="askg-k">Send them this</span>
        <Btn
          type="button"
          variant="q"
          size="sm"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(MESSAGE);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 2000);
            } catch {
              setCopied(false);
            }
          }}
        >
          {copied ? "Copied" : "Copy message"}
        </Btn>
      </div>
      {/* Real prose, not a <pre>: this is a message to a person, and
          monospace would make it look like something a machine wrote. */}
      <div className="askg-b">
        {MESSAGE.split("\n\n").map((para) => (
          <p key={para.slice(0, 24)}>{para}</p>
        ))}
      </div>
    </div>
  );
}

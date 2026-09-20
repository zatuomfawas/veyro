"use client";

// Ask the founder for a fresh invite link.
//
// An expired invitation used to end the conversation: the page said "ask them
// to send a new one from their dashboard" and left the guardian to chase it by
// text, with the founder unaware anyone was waiting. This turns that sentence
// into a button.
//
// It does not mint a new token. Only the founder can issue an invite, and
// letting whoever holds a dead link create a live one would make expiry mean
// nothing. This records the request and tells the founder; they decide.

import { useState } from "react";
import { Btn, Notice } from "@/app/_ui/form";

/**
 * Identified by the token when there is a working one (an expired invite), and
 * by the founder alone when there is not (a link replaced by a newer invite).
 * The token is what failed in that second case, so it cannot be what identifies
 * the request; the server authorises on the signed-in session either way.
 */
export default function RequestNewLink({
  token, founderId, founderName,
}: { token?: string; founderId?: string; founderName: string }) {
  const [state, setState] = useState<"idle" | "busy" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  if (state === "sent") {
    return (
      <Notice tone="pine" head="Asked" live>
        {founderName} has been told you need a new link, by email and on their dashboard. They
        send it; the new link will arrive at this same address. Nothing else is needed from you.
      </Notice>
    );
  }

  return (
    <div>
      {error && (
        <div style={{ marginBottom: 12 }}>
          <Notice tone="clay" head="That didn&rsquo;t go through" live>{error}</Notice>
        </div>
      )}
      <Btn
        type="button"
        disabled={state === "busy"}
        aria-busy={state === "busy" ? "true" : undefined}
        onClick={async () => {
          setState("busy");
          setError(null);
          try {
            const res = await fetch("/api/founder/consent", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify(
                token ? { token, decision: "request_link" }
                      : { founderId, decision: "request_link" },
              ),
            });
            const body = await res.json().catch(() => null);
            if (!res.ok) {
              setError(body?.error ?? "Nothing was sent. Try again in a moment.");
              setState("idle");
              return;
            }
            // alreadyRequested comes back when a refresh or a second click lands
            // inside the cooldown. From here that is still success: the founder
            // has the message, and saying otherwise would invite a third try.
            setState("sent");
          } catch {
            setError("We couldn’t reach the server. Nothing was sent.");
            setState("idle");
          }
        }}
      >
        {state === "busy" ? "Asking…" : `Ask ${founderName} for a new link`}
      </Btn>
    </div>
  );
}

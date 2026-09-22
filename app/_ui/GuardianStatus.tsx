// The guardian's part of the setup, shown as the product shows it.
//
// Built from the same .card, .badge and .req* classes the founder dashboard
// uses, so it cannot drift from the real thing the way a screenshot would.
// The figures are illustrative and the panel says so: nobody named here is a
// real guardian and no verification has happened.
//
// The states are the real ones. lib/consent.ts resolves a GuardianConsent into
// none, pending, declined, expired or consented, and the dashboard renders all
// five. This shows the finished one, because the question a visitor has is what
// it looks like when it works.
//
// The tone is deliberate. Guardian involvement is a requirement of the payment
// provider, not an embarrassment to be buried, so this states what the adult
// actually does and what they explicitly do not get — ownership of the
// business.

import { Icon } from "@/app/_ui/marks";

function Step({ done, label, detail }: { done: boolean; label: string; detail: string }) {
  return (
    <div className="reqrow">
      <div>
        <span className="req-t">
          {label}
          {/* The word, not just the mark: state is never carried by colour or
              by a glyph alone. */}
          <span className="badge b-grey" style={{ marginLeft: 8 }}>
            {done ? "Done" : "Waiting"}
          </span>
        </span>
        <span className="req-d">{detail}</span>
      </div>
    </div>
  );
}

export function GuardianStatus() {
  return (
    <div className="card">
      <div className="card-h">
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <Icon name="home" size={14} />
          <span style={{ fontSize: "var(--fs-3)", fontWeight: 560 }}>Guardian setup</span>
        </span>
        <span className="badge b-grey">Example</span>
      </div>

      <div className="card-b">
        <div style={{ marginBottom: 14 }}>
          <span style={{ fontSize: "var(--fs-5)", fontWeight: "var(--fw-bold)" }}>Sam Taylor</span>
          <span className="tiny" style={{ display: "block", marginTop: 2 }}>
            Guardian on the payment account
          </span>
        </div>

        <div className="reqlist">
          <Step
            done
            label="Invitation accepted"
            detail="They made their own Veyro login. Yours and theirs stay separate."
          />
          <Step
            done
            label="Identity verified by Stripe"
            detail="On Stripe's own form. Veyro never sees the documents."
          />
          <Step
            done
            label="Payment account connected"
            detail="Money settles into the account in your name."
          />
        </div>

        <p className="small" style={{ marginTop: 16, marginBottom: 0 }}>
          Your guardian is the verified adult the payment provider requires. They are notified of
          every payout request. They do not own your business, and on this account type they cannot
          block a payout.
        </p>
      </div>

      <div className="card-f">
        <p className="tiny" style={{ margin: 0 }}>
          Illustrative. Nobody shown here is a real guardian and no verification has taken place.
        </p>
      </div>
    </div>
  );
}

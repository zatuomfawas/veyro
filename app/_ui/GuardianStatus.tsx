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
import { FlowDiagram, type FlowStop } from "@/app/_ui/FlowDiagram";

// Who does what, in the order it happens. The same four-stop shape the
// payment path uses, because it is the same kind of fact: a sequence with
// exactly one party responsible at each point. The two outlined stops are the
// founder's — which is the answer to the question this section exists for.
const SETUP: FlowStop[] = [
  { n: "Founder", t: "Invites", d: "You send one invitation.", you: true },
  { n: "Guardian", t: "Verifies", d: "On Stripe's own form." },
  { n: "Stripe", t: "Opens the account", d: "In your name." },
  { n: "Founder", t: "Gets paid", d: "You request a payout.", you: true },
];


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
        <FlowDiagram stops={SETUP} label="Guardian setup, in order" style={{ marginBottom: 20 }} />

        <div style={{ marginBottom: 14 }}>
          <span style={{ fontSize: "var(--fs-5)", fontWeight: "var(--fw-bold)" }}>Sam Taylor</span>
          <span className="badge b-pine" style={{ marginLeft: 10 }}>Setup complete</span>
          <span className="tiny" style={{ display: "block", marginTop: 4 }}>
            Guardian on the payment account. All three checks done.
          </span>
        </div>

        {/* The three step rows that were here said Invitation accepted,
            Identity verified, Payment account connected — which is the diagram
            above rewritten as a checklist. One statement of state is enough,
            and the diagram is the one that also explains the order. */}

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

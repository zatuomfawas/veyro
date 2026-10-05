import { formatMinor } from "@/lib/money";
import { disputeUrl, guidanceFor, DISPUTE_DISCLAIMER, EVIDENCE_HONESTY } from "@/lib/disputes";

// A chargeback, where the founder can actually see it.
//
// The notification email is the part that stops somebody losing by default.
// This is the part that stops them losing track afterwards: what is disputed,
// why, by when, and the one link that leads to where it is answered.
//
// The response happens in Stripe, not here. On Standard connected accounts
// the account holder -- the guardian -- is who Stripe expects to respond, and
// the platform cannot submit evidence through the API on their behalf. A form
// in this panel would be a button that cannot do what it says, so there is a
// link instead, and the panel says plainly who it leads to.
//
// The guidance below the link is the enhanced service and is shown only to
// eligible accounts. What is NOT gated is knowing the dispute exists: every
// founder sees the row, the reason and the deadline, because that is the
// baseline the Terms promise from 5 November.

export type DisputeRow = {
  id: string;
  stripeDisputeId: string;
  amountMinor: number;
  currency: string;
  reason: string;
  state: string;
  evidenceDueBy: string | null;
  openedAt: string;
};

const STATE_LABEL: Record<string, { text: string; tone: string }> = {
  NEEDS_RESPONSE: { text: "Needs a response", tone: "clay" },
  UNDER_REVIEW: { text: "Under review", tone: "amber" },
  WON: { text: "Won", tone: "pine" },
  LOST: { text: "Lost", tone: "clay" },
  WARNING_CLOSED: { text: "Closed", tone: "slate" },
  OTHER: { text: "Open", tone: "slate" },
};

function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  return Math.ceil(ms / 86_400_000);
}

export function Disputes({
  rows, eligible, guardianName,
}: {
  rows: DisputeRow[];
  /** Enhanced guidance is for eligible accounts. The rows are for everybody. */
  eligible: boolean;
  guardianName: string;
}) {
  if (!rows.length) {
    return (
      <p className="body" style={{ margin: 0 }}>
        No payments have been disputed. If one ever is, it appears here and we email you and{" "}
        {guardianName} the same day, with the deadline.
      </p>
    );
  }

  return (
    <div className="stack">
      {rows.map((d) => {
        const s = STATE_LABEL[d.state] ?? STATE_LABEL.OTHER;
        const left = daysUntil(d.evidenceDueBy);
        const g = guidanceFor(d.reason);
        return (
          <div className="dispute" key={d.id}>
            <div className="dispute-h">
              <span className="fig fig-sm">{formatMinor(d.amountMinor, d.currency)}</span>
              <span className="chip" data-tone={s.tone} data-on="1">{s.text}</span>
            </div>

            <p className="body" style={{ marginTop: "var(--sp-3)" }}>{g.label}</p>

            {d.evidenceDueBy && d.state === "NEEDS_RESPONSE" && (
              <p className="dispute-due">
                A response is due by{" "}
                <strong>{new Date(d.evidenceDueBy).toUTCString()}</strong>
                {left !== null && left >= 0 ? ` — ${left} day${left === 1 ? "" : "s"} left.` : "."}
                {" "}If nothing is sent by then, the dispute is lost by default.
              </p>
            )}

            <p className="small" style={{ marginTop: "var(--sp-3)" }}>
              Responding is done in the Stripe dashboard, by {guardianName} as the account holder.{" "}
              <a className="linkbtn" href={disputeUrl(d.stripeDisputeId)}
                 target="_blank" rel="noopener noreferrer">
                Open this dispute in Stripe
              </a>
            </p>

            {eligible && (
              <div className="dispute-help">
                <span className="fig-k">What tends to be relevant</span>
                <ul className="ticks" style={{ marginTop: "var(--sp-2)" }}>
                  {g.evidence.map((e) => <li key={e}>{e}</li>)}
                </ul>
                <p className="tiny" style={{ marginTop: "var(--sp-3)", marginBottom: 0 }}>
                  <strong>{EVIDENCE_HONESTY}</strong>
                </p>
              </div>
            )}

            <p className="tiny" style={{ marginTop: "var(--sp-4)", marginBottom: 0 }}>
              {DISPUTE_DISCLAIMER}{" "}
              <a className="linkbtn" href="https://docs.stripe.com/disputes"
                 target="_blank" rel="noopener noreferrer">
                Stripe&rsquo;s guide to disputes
              </a>
            </p>
          </div>
        );
      })}
    </div>
  );
}

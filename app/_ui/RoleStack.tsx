import { Icon } from "@/app/_ui/marks";

// Who does what, as a stack rather than a sentence.
//
// The single most common misunderstanding about Veyro is that it is the payment
// provider. It is not, and a paragraph saying so is easier to skim past than a
// diagram showing four separate parties with the money sitting firmly outside
// Veyro. The order is the real order: nothing below a row can happen until the
// row above it has.
const LAYERS = [
  {
    icon: "person",
    who: "Founder",
    does: "Builds the business, lists what they sell, and asks for payouts.",
    controls: "Owns the business",
  },
  {
    icon: "list",
    who: "Veyro",
    does: "Guides the setup, tracks who has done what, and keeps the ledger.",
    controls: "Never touches the money",
  },
  {
    icon: "home",
    who: "Guardian",
    does: "Completes the adult verification the provider requires, while the founder is under 18.",
    controls: "Named on the account",
  },
  {
    icon: "card",
    who: "Stripe",
    does: "Verifies identity, processes payments, holds the balance and sends payouts.",
    controls: "Handles all money",
  },
];

export function RoleStack() {
  return (
    <ol className="reqlist" style={{ listStyle: "none", margin: 0, padding: 0 }}>
      {LAYERS.map((l) => (
        <li className="reqrow" key={l.who}>
          <div style={{ display: "flex", gap: 12, alignItems: "baseline", width: "100%" }}>
            <Icon name={l.icon} size={14} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <span className="req-t">{l.who}</span>
              <span className="req-d">{l.does}</span>
            </div>
            <span className="tiny" style={{ whiteSpace: "nowrap", color: "var(--ink-3)" }}>
              {l.controls}
            </span>
          </div>
        </li>
      ))}
    </ol>
  );
}

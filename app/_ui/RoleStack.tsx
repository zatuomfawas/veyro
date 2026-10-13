const ROLES = [
  {
    who: "Founder",
    does: "Builds the business, lists products and keeps track of sales.",
    controls: "Runs the business",
  },
  {
    who: "Guardian",
    does: "Gives consent and completes the adult verification Stripe requires.",
    controls: "Consent and visibility",
  },
  {
    who: "Veyro",
    does: "Guides setup and brings products, sales and payout records together.",
    controls: "Never holds money",
  },
  {
    who: "Stripe",
    does: "Verifies identity, processes payments and sends payouts.",
    controls: "Handles payments",
  },
];

export function RoleStack() {
  return (
    <dl className="role-list">
      {ROLES.map((role) => (
        <div className="role-row" key={role.who}>
          <dt className="role-name">{role.who}</dt>
          <dd className="role-description">{role.does}</dd>
          <dd className="role-control">{role.controls}</dd>
        </div>
      ))}
    </dl>
  );
}

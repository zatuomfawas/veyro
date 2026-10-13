const STEPS = [
  ["Invitation", "Your child sends you a link to review."],
  ["Your consent", "Read the arrangement and accept from your own Veyro account."],
  ["Your verification", "Complete Stripe’s hosted identity and bank-account forms."],
  ["Account status", "Your dashboard shows when Stripe needs more information."],
] as const;

const CONTROLS = [
  ["Pause payouts", "Keep the account open while stopping money from leaving."],
  ["Close the account", "Close it directly in Stripe. Veyro cannot prevent this."],
  ["Export your records", "Get payment and payout records from Stripe."],
] as const;

/** An illustrative guide; account controls are provided by Stripe, not Veyro. */
export function ParentPanel() {
  return (
    <div className="dp pp">
      <div className="dp-bar">
        <span className="dp-title">Your role as guardian</span>
        <span className="pp-example">Example</span>
      </div>
      <div className="dp-body">
        <div className="pp-seq">
          <h2 className="pp-section-title">Setting up</h2>
          <ol className="pp-steps">
            {STEPS.map(([title, description], i) => (
              <li key={title} className="pp-step">
                <span className="pp-step-number" aria-hidden="true">{i + 1}</span>
                <span className="pp-step-b">
                  <span className="pp-step-t">{title}</span>
                  <span className="pp-step-d">{description}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
        <div className="pp-ctl">
          <h2 className="pp-section-title">Account controls in Stripe</h2>
          <div className="pp-btns">
            {CONTROLS.map(([title, description]) => (
              <div className="pp-btn" key={title}>
                <span className="pp-btn-t">{title}</span>
                <span className="pp-btn-d">{description}</span>
              </div>
            ))}
          </div>
          <p className="pp-controls-note">These controls live in Stripe, rather than in Veyro.</p>
        </div>
      </div>
    </div>
  );
}

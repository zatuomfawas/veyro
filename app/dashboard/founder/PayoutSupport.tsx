import { PAYOUT_SETTINGS_URL, describeSchedule, type PayoutSchedule } from "@/lib/payout-schedule";

// Payout frequency: what it is, and how to change it.
//
// There is no toggle here, and that is not a shortcut. On Standard connected
// accounts the schedule is the account holder's setting and the platform
// cannot write it. A switch in this panel would either fail silently or lie,
// so the panel shows the real schedule, says who can change it and links
// straight to the page where they do.
//
// Nothing here promises when money arrives. "Subject to processing and
// account status" is on the one line that gives a date, because a payout can
// be held, reserved or delayed by Stripe for reasons we never see.

export function PayoutSupport({
  schedule, eligible, guardianName,
}: {
  schedule: PayoutSchedule | null;
  /** Assistance with weekly scheduling is an enhanced service. The reading is not. */
  eligible: boolean;
  guardianName: string;
}) {
  return (
    <div className="stack">
      <p className="body" style={{ margin: 0 }}>
        {schedule ? describeSchedule(schedule) : "We could not read the payout schedule just now."}
      </p>

      {schedule && !schedule.payoutsEnabled && (
        <p className="small" style={{ margin: 0 }}>
          Payouts are not enabled on this account yet, so nothing will be sent until that is
          resolved.
        </p>
      )}

      {schedule?.delayDays != null && (
        <p className="small" style={{ margin: 0 }}>
          Stripe holds funds for about {schedule.delayDays} day
          {schedule.delayDays === 1 ? "" : "s"} after a payment before they become payable
          &mdash; subject to processing and account status.
        </p>
      )}

      {eligible ? (
        <div className="payout-help">
          <span className="fig-k">Weekly payout support</span>
          <p className="body" style={{ marginTop: "var(--sp-2)" }}>
            You are over $100 this month, so weekly payouts are available to you. The schedule is a
            setting on the Stripe account itself, which means {guardianName} changes it as the
            account holder &mdash; we cannot set it for you.
          </p>
          <ol className="numbered" style={{ marginTop: "var(--sp-3)" }}>
            <li><span>Open payout settings</span><span>In the Stripe dashboard, under Settings.</span></li>
            <li><span>Choose weekly</span><span>And pick the day of the week it should run.</span></li>
            <li><span>Save</span><span>It applies from the next payout onwards.</span></li>
          </ol>
          <p className="small" style={{ marginTop: "var(--sp-3)", marginBottom: 0 }}>
            <a className="linkbtn" href={PAYOUT_SETTINGS_URL} target="_blank" rel="noopener noreferrer">
              Open payout settings in Stripe
            </a>
            {" "}&middot; stuck? Ask us and a person will walk through it.
          </p>
        </div>
      ) : (
        <p className="small" style={{ margin: 0 }}>
          Weekly payout support is available in any month you earn more than $100. Until then the
          account runs on whatever schedule Stripe has set for it.
        </p>
      )}
    </div>
  );
}

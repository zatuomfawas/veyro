import Link from "next/link";
import type { PayoutSchedule } from "@/lib/payout-schedule";
import { PAYOUTS_URL } from "@/lib/stripe-urls";
import { formatMinor } from "@/lib/money";
import { fmtDate } from "@/app/_ui/dash";

type LatestRequest = { amountMinor: number; currency: string; status: string; createdAt: Date };

function cadence(schedule: PayoutSchedule): string {
  if (schedule.interval === "weekly") return schedule.weeklyAnchor
    ? `Weekly · ${schedule.weeklyAnchor[0].toUpperCase()}${schedule.weeklyAnchor.slice(1)}` : "Weekly";
  if (schedule.interval === "monthly") return schedule.monthlyAnchor
    ? `Monthly · day ${schedule.monthlyAnchor}` : "Monthly";
  if (schedule.interval === "daily") return "Daily";
  if (schedule.interval === "manual") return "Manual payouts";
  return "Schedule unavailable";
}

export function PayoutOverview({ schedule, latest, hasAccount, guardianName }: {
  schedule: PayoutSchedule | null; latest: LatestRequest | null; hasAccount: boolean; guardianName: string;
}) {
  return (
    <section className="payout-overview" aria-labelledby="payout-overview-heading">
      <div className="payout-overview-heading">
        <h2 id="payout-overview-heading">Next payout</h2>
        {schedule && <span className="payout-enabled">{schedule.payoutsEnabled ? "Payouts enabled" : "Not enabled yet"}</span>}
      </div>
      <p className="payout-cadence">{schedule ? cadence(schedule) : hasAccount ? "Schedule unavailable" : "Waiting for setup"}</p>
      <p className="payout-context">
        {!hasAccount ? `${guardianName} completes payment setup before payouts can begin.`
          : !schedule ? "We could not read Stripe’s schedule right now. Check the provider for current timing."
          : !schedule.payoutsEnabled ? "Stripe has not enabled payouts yet. The schedule will not send money until setup is resolved."
          : schedule.interval === "manual" ? "The account holder sends payouts from Stripe. No automatic payout is scheduled."
          : "This is the current Stripe schedule. A bank arrival date has not been confirmed here."}
      </p>
      {schedule?.delayDays != null && <p className="payout-delay">Funds become payable after about {schedule.delayDays} {schedule.delayDays === 1 ? "day" : "days"}, subject to Stripe processing and account status.</p>}
      <div className="payout-latest">
        <span>Latest request</span>
        {latest ? (
          <>
            <div className="payout-latest-value"><strong className="num">{formatMinor(latest.amountMinor, latest.currency)} <span>{latest.currency}</span></strong><span>{latest.status.charAt(0) + latest.status.slice(1).toLowerCase()}</span></div>
            <p>Requested {fmtDate(latest.createdAt)}{latest.status === "REQUESTED" || latest.status === "APPROVED" ? "; reserved, not yet recorded as sent." : latest.status === "FAILED" ? "; it did not go through." : "; recorded as sent."}</p>
          </>
        ) : <p>No payout requests yet.</p>}
      </div>
      <div className="payout-overview-actions">
        <Link className="linkbtn" href="#payouts">View payout requests</Link>
        {hasAccount && <a className="linkbtn" href={PAYOUTS_URL} target="_blank" rel="noopener noreferrer">View in Stripe</a>}
      </div>
    </section>
  );
}

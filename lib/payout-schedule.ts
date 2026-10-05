// What Stripe is set to do with this account's money, read rather than set.
//
// On Standard connected accounts the payout schedule belongs to the account
// holder. The platform can read it; it cannot write it. `accounts.update` with
// settings.payouts.schedule is rejected for Standard, and pretending otherwise
// would mean shipping a toggle that silently does nothing.
//
// So the Terms promise "weekly payout support and visibility, including
// assistance accessing and configuring Stripe's available payout scheduling
// options" -- which is exactly this: show what the schedule is, show when the
// next payout is due, and tell them where to change it. Support, not control.
import { stripe } from "@/lib/stripe";

export type PayoutSchedule = {
  interval: "manual" | "daily" | "weekly" | "monthly" | "unknown";
  /** Weekly anchor, e.g. "friday". */
  weeklyAnchor: string | null;
  /** Monthly anchor, 1-31. */
  monthlyAnchor: number | null;
  /** Stripe's own delay before funds become payable, in days. */
  delayDays: number | null;
  payoutsEnabled: boolean;
};

/** Where the account holder changes it. Their dashboard, not ours. */
export const PAYOUT_SETTINGS_URL = "https://dashboard.stripe.com/settings/payouts";

export async function readPayoutSchedule(
  connectedAccountId: string,
): Promise<PayoutSchedule | null> {
  try {
    const acct = await stripe.accounts.retrieve(connectedAccountId);
    const sched = acct.settings?.payouts?.schedule;
    return {
      interval: (sched?.interval as PayoutSchedule["interval"]) ?? "unknown",
      weeklyAnchor: sched?.weekly_anchor ?? null,
      monthlyAnchor: sched?.monthly_anchor ?? null,
      delayDays: typeof sched?.delay_days === "number" ? sched.delay_days : null,
      payoutsEnabled: Boolean(acct.payouts_enabled),
    };
  } catch {
    // A schedule we cannot read is not an error worth showing anybody. The
    // panel falls back to "we could not read this right now", which is true
    // and better than an empty box or a guess.
    return null;
  }
}

/** How the schedule reads in a sentence. Never a promise about arrival. */
export function describeSchedule(s: PayoutSchedule): string {
  switch (s.interval) {
    case "manual":
      return "Payouts are set to manual, so money stays in the Stripe balance until it is sent.";
    case "daily":
      return "Payouts run daily.";
    case "weekly":
      return s.weeklyAnchor
        ? `Payouts run weekly, on ${s.weeklyAnchor[0].toUpperCase()}${s.weeklyAnchor.slice(1)}.`
        : "Payouts run weekly.";
    case "monthly":
      return s.monthlyAnchor
        ? `Payouts run monthly, on day ${s.monthlyAnchor}.`
        : "Payouts run monthly.";
    default:
      return "We could not read the payout schedule just now.";
  }
}

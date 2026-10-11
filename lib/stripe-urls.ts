// Stripe dashboard destinations, as constants with no imports.
//
// Their own module so that something which only needs a URL -- lib/email.ts,
// for one -- does not pull the Stripe SDK into its dependency graph to get a
// string. lib/payout-schedule.ts re-exports them, because that is where the
// reasoning about payouts lives and it is the import most callers want.
//
// These are the account holder's own dashboard, not a Veyro page. Every one
// of them is somewhere the guardian is already entitled to be.

/** Where the account holder changes the payout schedule. Theirs, not ours. */
export const PAYOUT_SETTINGS_URL = "https://dashboard.stripe.com/settings/payouts";

/**
 * Where the account holder sees the payouts themselves, with the status
 * Stripe actually holds for each one.
 *
 * Veyro does not have that status. payout.* webhooks are deliberately not
 * ingested (see app/api/webhooks/stripe/route.ts): on a Standard account they
 * describe the connected account paying itself out, which is a different
 * event from a founder asking us to send money, and folding one into the
 * other would corrupt the derived balance. So anything that wants to know
 * whether a payout is pending, in transit or paid sends the reader here
 * rather than guessing.
 */
export const PAYOUTS_URL = "https://dashboard.stripe.com/payouts";

/** One dispute, in the account holder's own dashboard. */
export const disputeUrl = (stripeDisputeId: string) =>
  `https://dashboard.stripe.com/disputes/${stripeDisputeId}`;

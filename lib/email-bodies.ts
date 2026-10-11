// The two messages whose wording is a claim, built where they can be tested.
//
// Everything else that goes out is prose: a verification link, a receipt, a
// password notice. These two are different. The payout email tells an adult
// what control they have over money, and the dispute email tells them what
// they are responsible for answering and by when. Both have been wrong
// before, in ways nobody would have noticed until a parent compared the email
// with the Stripe dashboard and found they disagreed.
//
// So they are built here, as pure functions over their inputs, and the test
// suite exercises them directly. lib/email.ts cannot be imported by a test
// without standing up a database, which is why the assertions about it have
// always had to read its source as a string -- a weaker check that cannot see
// what a given set of inputs actually produces.
//
// Imports are limited to modules with no database and no SDK, for the same
// reason.
import { formatMinor } from "./money.ts";
import { PAYOUTS_URL, PAYOUT_SETTINGS_URL } from "./stripe-urls.ts";
import type { MailBody, Fact } from "./email-html.ts";

/* ---------------- a payout was requested ---------------- */

/**
 * What Stripe actually says this account does with its money.
 *
 * Read by the caller rather than here: lib/payout-schedule.ts reaches for the
 * Stripe client. Null when the account could not be read, which is a real
 * state -- the email then says nothing about the schedule rather than
 * guessing at it.
 */
export type PayoutContext = {
  interval: "manual" | "daily" | "weekly" | "monthly" | "unknown";
  /** The schedule in a sentence, from describeSchedule(). */
  description: string;
  payoutsEnabled: boolean;
};

export type PayoutMailArgs = {
  founderName: string;
  /** What the guardian is called in-app. Null if we never asked. */
  guardianName: string | null;
  amountMinor: number;
  currency: string;
  payouts: PayoutContext | null;
};

/**
 * The guardian is told that the founder asked for money to be sent.
 *
 * THREE CLAIMS WERE REMOVED, and they are why this was rewritten rather than
 * restyled.
 *
 * It said "nobody, including you, can block one". That is false. The guardian
 * owns the connected account: they can set payouts to manual, change the
 * schedule, or close the account, none of which passes through Veyro. The
 * same sentence was corrected across three pages of the site in af30662, and
 * this was the copy of it that survived in an inbox.
 *
 * It implied the founder controls payouts. The founder asks; the account
 * holder is the one the provider lets configure and send them, and on a
 * manual schedule the money does not move until the account holder moves it.
 *
 * It gave a status that was not a status. There is no Stripe payout object to
 * report on here -- payout.* webhooks are deliberately not ingested, so Veyro
 * knows a REQUEST was recorded and nothing more. The email says exactly that
 * and sends the reader to Stripe for what Stripe knows. It does not map,
 * invent or approximate pending / in transit / paid.
 *
 * The scheduling sentence is conditional on `interval === "manual"`, because
 * that is the only configuration in which there is a specific payout for the
 * guardian to schedule. On an automatic schedule nothing is waiting to be
 * sent, and telling them to go and schedule it would send them hunting for a
 * button that is not there.
 */
export function payoutMail(args: PayoutMailArgs): MailBody {
  const amount = formatMinor(args.amountMinor, args.currency);
  const you = args.guardianName ? `${args.guardianName}, you` : "You";
  const p = args.payouts;

  const role = !p
    ? `${you} are the account holder, so the payout settings on this account are yours. `
      + "We could not read the current schedule just now; Stripe has it."
    : !p.payoutsEnabled
      ? `${you} are the account holder. Payouts are not enabled on this account yet, so `
        + "nothing can be sent until the provider's remaining checks are done."
      : p.interval === "manual"
        ? `${you} can schedule this payout in Stripe. Payouts on this account are set to `
          + "manual, which means the balance stays with the provider until the account holder "
          + "sends it."
        : `${you} are the account holder, so the payout settings are yours. ${p.description} `
          + "You can change that schedule in Stripe whenever you like.";

  const facts: Fact[] = [
    { k: "Amount requested", v: amount },
    { k: "Requested by", v: args.founderName },
    // Veyro's own record, named as such. Stripe's status for the payout
    // itself is in Stripe, and this does not pretend to know it.
    { k: "Recorded by Veyro as", v: "Requested" },
  ];
  if (p && !p.payoutsEnabled) facts.push({ k: "Payouts on the account", v: "Not enabled yet" });

  return {
    intro: `${args.founderName} asked for ${amount} to be paid out to the bank account on `
      + "their payment account.",
    facts,
    cta: { label: "View in Stripe", href: PAYOUTS_URL },
    outro: role
      + "\n\nVeyro records the request and tells you every time one is made. Whether a payout "
      + "is pending, in transit or paid is Stripe's to report, and the link above is where it "
      + `says so. Your payout settings: ${PAYOUT_SETTINGS_URL}`,
    dashboard: "/dashboard/guardian",
  };
}

/** The subject line, beside the body so the two are read together. */
export const payoutSubject = (founderName: string, amountMinor: number, currency: string) =>
  `${founderName} requested a payout of ${formatMinor(amountMinor, currency)}`;

/* ---------------- a payment was disputed ---------------- */

export type DisputeMailArgs = {
  founderName: string;
  guardianName: string | null;
  amount: string;
  /** Stripe's own reason, in plain English. From guidanceFor(). */
  reason: string;
  /** Stripe's deadline, already formatted. Null when Stripe has not set one. */
  due: string | null;
  /** When the dispute opened, already formatted. */
  opened: string | null;
  disputeId: string;
  /** The dispute in the account holder's Stripe dashboard. */
  url: string;
  disclaimer: string;
};

/**
 * Enough to find the charge, and no more.
 *
 * The customer's name is deliberately absent. Stripe's dispute object can
 * carry it, and neither reader needs it to answer: the amount, the date and
 * the dispute id identify the transaction on their own, and the dashboard
 * behind the link has the rest under Stripe's own access controls. Putting a
 * buyer's name into two inboxes to save one click is not a trade worth
 * making.
 *
 * The deadline is whatever Stripe said, formatted and not interpreted. When
 * Stripe has not given one the email says to go and look, because the window
 * varies by network, by reason and by region -- a hardcoded number of days
 * here is a dispute lost on our arithmetic.
 */
function disputeFacts(a: DisputeMailArgs): Fact[] {
  return [
    { k: "Amount", v: a.amount },
    ...(a.opened ? [{ k: "Disputed on", v: a.opened }] : []),
    { k: "Reason", v: a.reason, prose: true },
    { k: "Response deadline", v: a.due ?? "See the dispute in Stripe" },
    { k: "Dispute ID", v: a.disputeId },
  ];
}

const deadlineLine = (due: string | null) => due
  ? `Stripe needs a response by ${due}. If nothing is sent by then, the dispute is lost by `
    + "default."
  : "Stripe has not given a response deadline for this one yet. The dispute details in Stripe "
    + "carry the deadline — check there rather than assuming a number of days.";

/**
 * What Veyro does here is what lib/disputes.ts does and no more: it tells
 * both of them, names the reason, repeats Stripe's deadline and links to the
 * dispute. It does not submit evidence -- on a Standard connected account the
 * platform cannot -- and it does not respond, decide or predict.
 */
const WHAT_VEYRO_DOES =
  "Veyro told you both, and keeps the transaction records on your dashboard. Veyro cannot "
  + "respond to this for you: on this account type the response is submitted from the Stripe "
  + "dashboard by the account holder.";

export function disputeMailForFounder(a: DisputeMailArgs): MailBody {
  const coordinate = a.guardianName
    ? `${a.founderName}, please coordinate with ${a.guardianName} so the dispute can be `
      + `addressed promptly — ${a.guardianName} is the account holder and is the one `
      + "Stripe expects to respond."
    : `${a.founderName}, the response goes in through the Stripe dashboard on the account.`;

  return {
    intro: `A customer disputed a charge of ${a.amount}.\n\n${deadlineLine(a.due)}`,
    facts: disputeFacts(a),
    cta: { label: "Respond in Stripe", href: a.url },
    outro: `${coordinate}\n\n${WHAT_VEYRO_DOES}\n\n${a.disclaimer}`,
  };
}

export function disputeMailForGuardian(a: DisputeMailArgs): MailBody {
  const you = a.guardianName ? `${a.guardianName}, you'll` : "You'll";
  return {
    intro: `A customer disputed a charge of ${a.amount} on the account you are the verified `
      + `adult on.\n\n${deadlineLine(a.due)}`,
    facts: disputeFacts(a),
    cta: { label: "Respond in Stripe", href: a.url },
    outro: `${you} need to respond through Stripe — you are the account holder, so you `
      + "are the one the provider expects to answer, and the response is submitted from your "
      + `own dashboard.\n\n${WHAT_VEYRO_DOES}\n\n${a.disclaimer}`,
    dashboard: "/dashboard/guardian",
  };
}

export const disputeSubjectForFounder = (amount: string) =>
  `A customer disputed a charge of ${amount}`;
export const disputeSubjectForGuardian = (founderName: string) =>
  `A customer disputed a charge on ${founderName}'s account`;

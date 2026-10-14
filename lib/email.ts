// Sending mail.
//
// Every function here is non-fatal by design. Signing up, inviting a guardian
// and recording a payment must all succeed whether or not mail goes out: the
// account was created, the consent row exists, the money arrived. A send that
// throws into the request would undo real work because of a third party being
// slow, and a founder would be told their signup failed when it did not.
//
// So the contract is: never throw, always record. A failure writes
// email.send_failed to AuditEvent with the reason, which is how you find out
// that nothing has been delivered for a week rather than discovering it from a
// confused user.
//
// With no RESEND_API_KEY the module no-ops and logs. That keeps local
// development and preview deployments working without a key, and means a
// missing key degrades to "no email" rather than to "signup is broken".
//
// Amounts are passed in MINOR UNITS and formatted here. Callers doing their own
// `/100` is exactly where a currency bug gets in, and the formatter already
// knows how to render a currency.
import { Resend } from "resend";
import { audit } from "./auth";
import { formatMinor } from "./money";
// From pricing rather than fees: lib/fees.ts reaches for the database client,
// and this module has to stay loadable without one.
import { FREE_FLOOR_MINOR as FREE_LIMIT_MINOR, FEES_EFFECTIVE_LABEL, FEE_COLLECTION_ENABLED } from "./pricing";
import { renderText, renderHtml, type MailInput } from "./email-html";
// The two bodies whose wording is a claim rather than prose live in their own
// module, with no database import, so the tests can build them and read what
// they actually say for a given account.
import { payoutMail, payoutSubject, type PayoutMailArgs } from "./email-bodies";
import { SUPPORT_EMAIL } from "./support";

// Two addresses, and they have to be different.
//
// The support inbox moved to withveyro@gmail.com, and the obvious change --
// send from it -- does not work. Resend will only send from a domain
// verified in the account, and nobody can verify gmail.com. Probed against
// the live API before writing this:
//
//   Veyro <withveyro@gmail.com>   403  "The gmail.com domain is not verified"
//   Veyro <hello@withveyro.com>   200  accepted
//
// So the sending address stays on the domain. Had it followed the support
// inbox, every transactional email on the platform would have stopped at
// once: verification, password reset, guardian invite, the threshold notice,
// disputes and payouts.
//
// The note that used to be here argued the two should be one constant,
// because a From address that accepts no mail is the commonest reason
// transactional mail gets filtered. That argument still stands and this does
// not answer it with a header: hello@withveyro.com has to keep accepting
// mail and forwarding it to the support inbox. Flagged at the point of
// change rather than assumed.
const SENDING_ADDRESS = "hello@withveyro.com";
const FROM = `Veyro <${SENDING_ADDRESS}>`;
const REPLY_TO = SUPPORT_EMAIL;

/**
 * The public origin, for links inside emails.
 *
 * A relative URL is meaningless in an inbox, so every link has to be absolute.
 * Falls back to production rather than localhost: a link to localhost in a real
 * email is worse than no link.
 */
const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://withveyro.com").replace(/\/$/, "");

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

type SendResult = { sent: boolean; reason?: string };

/**
 * One place where mail is actually handed to Resend, so the no-key path, the
 * failure path and the audit record cannot drift between senders.
 *
 * `actorId` is null because mail is sent by the system, not by a user, which is
 * what audit() expects for provider-driven events.
 */
async function send(
  to: string,
  subject: string,
  mail: MailInput,
  context: { action: string; founderId?: string; meta?: Record<string, unknown> },
  /** Optional files. Only the annual summary uses this. */
  attachments?: { filename: string; content: Buffer }[],
): Promise<SendResult> {
  if (!resend) {
    console.info(`Email send skipped (no API key): "${subject}" to ${to}`);
    return { sent: false, reason: "no_api_key" };
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to,
      subject,
      replyTo: REPLY_TO,
      text: renderText(mail),
      html: renderHtml(mail),
      ...(attachments?.length ? { attachments } : {}),
    });

    if (error) {
      // Resend reports failures in the response rather than by throwing, so
      // this branch is the common one: an unverified domain, a bad address.
      console.warn(`Email failed: "${subject}" to ${to}:`, error.message);
      await audit(null, "email.send_failed", to, context.founderId, {
        subject, reason: error.message, ...context.meta,
      });
      return { sent: false, reason: error.message };
    }

    await audit(null, context.action, to, context.founderId, { subject, ...context.meta });
    return { sent: true };
  } catch (err) {
    const reason = err instanceof Error ? err.message : "unknown";
    console.warn(`Email threw: "${subject}" to ${to}:`, reason);
    await audit(null, "email.send_failed", to, context.founderId, {
      subject, reason, ...context.meta,
    });
    return { sent: false, reason };
  }
}

// The sign-off used to be appended here, as a string, to the text half only.
// It is the footer now -- brand line, Dashboard, Terms, Privacy and the
// address -- and lib/email-html renders it into both halves, so the HTML can
// no longer end without a reply path while the text ends with one.

/* ---------------- verification ---------------- */

/**
 * @param token the PLAINTEXT token. Only its hash is stored; this is the one
 *   moment the readable value exists, and it exists only inside the email.
 */
export function sendVerificationEmail(email: string, token: string) {
  const link = `${SITE}/auth/verify?token=${encodeURIComponent(token)}`;
  return send(
    email,
    "Verify your email to finish signing up",
    "Welcome to Veyro. You build it, we get it paid for.\n\n"
      + "One click and you are in:\n\n"
      + `${link}\n\n`
      + "The link works for 24 hours. If it expires you can request a new one from the sign-in "
      + "page.\n\n"
      + "If you did not create a Veyro account, ignore this email. Nothing was set up and no one "
      + "can use the address without this link.",
    { action: "email.verification_sent" },
  );
}

/* ---------------- password reset ---------------- */

/**
 * @param token the PLAINTEXT reset token. Stored only as a hash; this is the
 *   one moment the usable value exists.
 *
 * Says plainly what to do if the request was not theirs, because a reset email
 * nobody asked for is alarming, and the honest answer is reassuring: the link
 * alone changes nothing until it is used, and ignoring it is enough.
 */
export function sendPasswordResetEmail(email: string, token: string) {
  const link = `${SITE}/auth/reset-password?token=${encodeURIComponent(token)}`;
  return send(
    email,
    "Reset your Veyro password",
    "Someone asked to reset the password on this account.\n\n"
      + "Set a new one here:\n\n"
      + `${link}\n\n`
      + "The link works for one hour and can be used once. Using it signs out every device "
      + "that was signed in, which is what you want if someone else had got in.\n\n"
      + "If this was not you, you can ignore this email. Your password has not changed and "
      + "nobody can change it without this link.",
    { action: "email.password_reset_sent" },
  );
}

/**
 * Sent after a reset completes, to the address that was reset.
 *
 * This is the one that catches an account takeover. If someone else reset the
 * password, this is the only message the real owner receives, so it goes out
 * even though the reset already succeeded.
 */
export function sendPasswordChangedEmail(email: string) {
  return send(
    email,
    "Your Veyro password was changed",
    "The password on this account has just been changed, and every device that was "
      + "signed in has been signed out.\n\n"
      + "If that was you, there is nothing to do.\n\n"
      + "If it was not, reply to this email straight away. Whoever changed it had access to "
      + `this inbox, so securing your email account is the first step: ${REPLY_TO}`,
    { action: "email.password_changed_sent" },
  );
}

/* ---------------- guardian invitation ---------------- */

export function sendInviteNotification(
  founderName: string, guardianEmail: string, token: string, founderId: string,
) {
  const link = `${SITE}/founder/${founderId}/consent?token=${encodeURIComponent(token)}`;
  return send(
    guardianEmail,
    `${founderName} has asked you to be their guardian on Veyro`,
    {
      intro: `${founderName} invited you to help manage their business payments.\n\n`
        + "Veyro is software that helps young founders take payments legitimately. Because they "
        + "are under 18, an adult has to be the verified person on the payment account. That is "
        + "what you are being asked to do.",
      cta: { label: "Review the invitation", href: link },
      outro:
        "You will be asked to sign in with this email address first, which is what ties the "
        + "agreement to you. The link works for 14 days.\n\n"
        + "Declining is a normal answer and the page offers it as plainly as accepting.",
      dashboard: "/dashboard/guardian",
    },
    { action: "email.invite_sent", founderId, meta: { guardianEmail } },
  );
}

/* ---------------- guardian asked for a fresh link ---------------- */

/**
 * The invited adult opened a dead link and asked for another.
 *
 * Sent to the FOUNDER, because they are the only one who can issue a new
 * invite. Without this the request sits on a dashboard nobody has a reason to
 * open, and the guardian is left assuming they were ignored.
 */
export function sendNewLinkRequest(
  founderEmail: string, guardianEmail: string, founderId: string,
) {
  return send(
    founderEmail,
    "Your guardian asked for a new invite link",
    `${guardianEmail} cannot use the invitation you sent, and has asked for a new one.\n\n`
      + "That usually means the link expired, or a later invite replaced it and they opened an "
      + "older email. Invite links last 14 days, and sending a new one replaces every earlier "
      + "link.\n\n"
      + `Send it from your dashboard: ${SITE}/dashboard/founder#guardian\n\n`
      + "Nothing is wrong with your account. An invite expiring is normal and this is the "
      + "ordinary way to fix it.",
    { action: "email.new_link_requested_sent", founderId, meta: { guardianEmail } },
  );
}

/* ---------------- guardian accepted ---------------- */

export function sendGuardianAcceptedNotification(
  founderEmail: string, guardianName: string, founderId: string,
) {
  return send(
    founderEmail,
    `${guardianName} accepted`,
    {
      intro: `${guardianName} agreed to be your guardian.\n\n`
        + "They are now the adult on your payment account. The next step is theirs: they "
        + "complete the payment provider's identity form, and you will be able to sell once "
        + "that is done.\n\n"
        + "The provider can also come back to them for more information later. That is normal, "
        + "and your dashboard says so when it happens.",
      cta: { label: "Open your dashboard", href: `${SITE}/dashboard/founder` },
    },
    { action: "email.guardian_accepted_sent", founderId },
  );
}

/* ---------------- payment received ---------------- */

export function sendPaymentNotification(
  founderEmail: string, amountMinor: number, currency: string, founderId: string,
) {
  const amount = formatMinor(amountMinor, currency);
  return send(
    founderEmail,
    `Payment received: ${amount}`,
    {
      intro: `Someone paid ${amount}. It is on your record and in your wallet.`,
      facts: [{ k: "Amount paid", v: amount }],
      cta: { label: "Open your wallet", href: `${SITE}/dashboard/founder` },
      outro:
        "The payment provider takes its processing fee before the money reaches your balance, "
        + "so what you keep is a little less than the figure above. Your wallet shows both.",
    },
    { action: "email.payment_sent", founderId, meta: { amountMinor, currency } },
  );
}

/* ---------------- passed the free limit ---------------- */

/**
 * The month just went over $100 (F2).
 *
 * A notice, not an offer. The dashboard panel this mirrors was written with
 * no button and no "upgrade" on purpose, and the email keeps that: there is
 * nothing to accept, because the services apply in any month that is over the
 * line whether or not anybody reads this.
 *
 * It branches on `collecting` for one reason that matters more than tone.
 * While collection is postponed, passing $100 costs nothing in Veyro fees,
 * and an email must label the planned amount as an estimate. If a future
 * launch enables collection with a confirmed future date, the pre-launch
 * notice can name that date; once collecting, it states the actual fee.
 *
 * The services are named and not described. The detail lives on the dashboard
 * and in the Terms, and restating it in a third place is how a promise we can
 * keep turns into one we cannot -- on Standard connected accounts the payout
 * schedule belongs to the account holder, so "support" is the honest word and
 * anything stronger would be wrong.
 *
 * @param qmeMinor this month's qualifying earnings, USD minor units
 * @param feeMinor what the month owes so far, USD minor units. Shown as a
 *   real figure when collecting, and as a planned estimate when not.
 */
export function sendThresholdEmail(
  founderEmail: string,
  args: { qmeMinor: number; feeMinor: number; month: string; collecting: boolean },
  founderId: string,
) {
  const qme = formatMinor(args.qmeMinor, "USD");
  const fee = formatMinor(args.feeMinor, "USD");
  const limit = formatMinor(FREE_LIMIT_MINOR, "USD");

  const money = args.collecting
    ? `The first ${limit} of every month is free, and 3% applies to the amount above it. `
      + `So far this month that is ${fee}.\n\n`
      + "It is taken from payments as they arrive, not billed to you separately, and it is "
      + "only ever charged on the amount over the line."
    : FEE_COLLECTION_ENABLED
      ? `Nothing is being charged. Veyro's fee starts on ${FEES_EFFECTIVE_LABEL}, and from then `
        + `it is 3% of the amount above ${limit} in a month. On this month's earnings so far `
        + `that would be ${fee}.\n\n`
        + `The first ${limit} of a month is always free.`
      : "Nothing is being charged. Veyro's fee collection is postponed for now, and no new start date is set. "
        + `The planned fee is 3% of the amount above ${limit} in a month. On this month's earnings so far `
        + `that would be ${fee}. This is an estimate, not an amount charged.\n\n`
        + `The first ${limit} of a month is always free.`;

  // The figures come from the same ledger decision that charges the money:
  // qmeMinor and feeMinor are handed in by lib/fees.ts under the row lock, so
  // the email cannot quote a number the ledger disagrees with.
  const facts = [
    { k: "Earnings this month", v: qme },
    { k: `Free every month`, v: limit },
    { k: args.collecting ? "Veyro fee so far"
      : FEE_COLLECTION_ENABLED ? `Veyro fee from ${FEES_EFFECTIVE_LABEL}` : "Estimated Veyro fee (not charged)", v: fee },
  ];

  return send(
    founderEmail,
    `You've passed ${limit} this month`,
    {
      intro: `Your earnings this month have reached ${qme}.`,
      facts,
      cta: { label: "Open your dashboard", href: `${SITE}/dashboard/founder` },
      outro: money
        + "\n\n"
        + "Payout support and priority support apply for the rest of the month. There is "
        + "nothing to accept \u2014 they apply in any month you are over the line.\n\n"
        + `What this costs: ${SITE}/pricing`,
    },
    {
      action: "email.threshold_sent",
      founderId,
      meta: { qmeMinor: args.qmeMinor, feeMinor: args.feeMinor, month: args.month,
        collecting: args.collecting },
    },
  );
}

/* ---------------- the annual summary ---------------- */

/**
 * Last year's record, attached.
 *
 * The body says what the document is and, as plainly, what it is not. A
 * teenager receiving a PDF headed "Annual Earnings" in January will reasonably
 * wonder whether it is a tax form, and the answer has to be in the email as
 * well as in the footer of the file.
 */
export function sendAnnualSummary(to: string, year: number, pdf: Buffer) {
  return send(
    to,
    `Your ${year} earnings and payout summary`,
    {
      intro: `Attached is a record of what you earned and what was paid out in ${year}.`,
      cta: { label: "Open your dashboard", href: `${SITE}/dashboard/founder` },
      outro:
        "It is for your records. It is not a tax form and it is not tax advice \u2014 if you "
        + "need to file something, this is a document to give an accountant, not one to file.",
    },
    { action: "email.annual_summary", meta: { year } },
    [{ filename: `veyro-annual-summary-${year}.pdf`, content: pdf }],
  );
}

/* ---------------- a payment was disputed ---------------- */

/**
 * Both halves of a chargeback notice.
 *
 * Two senders rather than one with a flag, because the two readers need
 * different things: the founder needs to know their money is at risk and that
 * a deadline exists, and the guardian needs to know they are the one Stripe
 * expects to answer. Neither is told what the outcome will be.
 */
export function sendDisputeNotification(
  to: string, subject: string, mail: MailInput,
  context: { founderId: string; disputeId: string; audience: "founder" | "guardian" },
) {
  return send(to, subject, mail, {
    action: `email.dispute_${context.audience}`,
    founderId: context.founderId,
    meta: { disputeId: context.disputeId },
  });
}

/* ---------------- a payout was requested ---------------- */

/**
 * The guardian is told that the founder asked for money to be sent.
 *
 * The body is built in lib/email-bodies.ts, where a test can reach it. The
 * wording of this one is a claim about who controls money, and it has been
 * wrong before; see the note on payoutMail for the three claims that were
 * taken out of it and why each was false.
 */
export function sendPayoutNotification(
  guardianEmail: string, args: PayoutMailArgs, founderId: string,
) {
  return send(
    guardianEmail,
    payoutSubject(args.founderName, args.amountMinor, args.currency),
    payoutMail(args),
    {
      action: "email.payout_sent",
      founderId,
      meta: {
        amountMinor: args.amountMinor, currency: args.currency,
        interval: args.payouts?.interval ?? null,
        payoutsEnabled: args.payouts?.payoutsEnabled ?? null,
      },
    },
  );
}

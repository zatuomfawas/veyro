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
import { FREE_FLOOR_MINOR as FREE_LIMIT_MINOR, FEES_EFFECTIVE_LABEL } from "./pricing";
import { textToHtml } from "./email-html";

// One address, sending and receiving.
//
// It used to send as noreply@ and set Reply-To to hello@. That worked, but it
// asks the reader to trust a header their mail client may not show: the name
// on the message said "do not reply" while the footer invited a reply. Sending
// as the inbox a person actually reads makes the invitation true at a glance,
// and removes the commonest reason transactional mail gets filtered -- a
// From address that accepts no mail.
//
// Both halves are the same constant so they cannot drift apart.
const SUPPORT_INBOX = "hello@withveyro.com";
const FROM = `Veyro <${SUPPORT_INBOX}>`;
const REPLY_TO = SUPPORT_INBOX;

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
  text: string,
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
      text,
      html: textToHtml(text),
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

/** Every email closes the same way, so the reply path is never a dead end. */
const SIGNOFF = "\n\n—\nVeyro\nReply to this email and a person will answer.";

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
      + "can use the address without this link."
      + SIGNOFF,
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
      + "nobody can change it without this link."
      + SIGNOFF,
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
      + `this inbox, so securing your email account is the first step: ${REPLY_TO}`
      + SIGNOFF,
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
    `${founderName} invited you to help manage their business payments.\n\n`
      + "Veyro is software that helps young founders take payments legitimately. Because they are "
      + "under 18, an adult has to be the verified person on the payment account. That is what you "
      + "are being asked to do.\n\n"
      + "Review what it involves and accept or decline here:\n\n"
      + `${link}\n\n`
      + "You will be asked to sign in with this email address first, which is what ties the "
      + "agreement to you. The link works for 14 days.\n\n"
      + "Declining is a normal answer and the page offers it as plainly as accepting."
      + SIGNOFF,
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
      + "ordinary way to fix it."
      + SIGNOFF,
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
    `${guardianName} agreed to be your guardian.\n\n`
      + "They are now the adult on your payment account. The next step is theirs: they complete "
      + "the payment provider's identity form, and you will be able to sell once that is done.\n\n"
      + `Your dashboard: ${SITE}/dashboard/founder`
      + SIGNOFF,
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
    `Someone paid ${amount}.\n\n`
      + "It is on your record and in your wallet. The payment provider takes its processing fee "
      + "before the money reaches your balance, so what you keep is a little less than the figure "
      + "above; your wallet shows both.\n\n"
      + `Your wallet: ${SITE}/dashboard/founder`
      + SIGNOFF,
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
 * Until the Terms introducing the fee are in force, passing $100 costs
 * nothing, and an email that implied otherwise would be claiming money was
 * owed under a document that does not yet govern. Before the date it says
 * what the fee WILL be and when; after it, what it IS.
 *
 * The services are named and not described. The detail lives on the dashboard
 * and in the Terms, and restating it in a third place is how a promise we can
 * keep turns into one we cannot -- on Standard connected accounts the payout
 * schedule belongs to the account holder, so "support" is the honest word and
 * anything stronger would be wrong.
 *
 * @param qmeMinor this month's qualifying earnings, USD minor units
 * @param feeMinor what the month owes so far, USD minor units. Shown as a
 *   real figure when collecting, and as the future figure when not.
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
    : `Nothing is being charged. Veyro's fee starts on ${FEES_EFFECTIVE_LABEL}, and from then `
      + `it is 3% of the amount above ${limit} in a month. On this month's earnings so far `
      + `that would be ${fee}.\n\n`
      + `The first ${limit} of a month is always free.`;

  return send(
    founderEmail,
    `You've passed ${limit} this month`,
    `Your earnings this month have reached ${qme}.\n\n`
      + money
      + "\n\n"
      + "Payout support and priority support apply for the rest of the month. There is nothing "
      + "to accept \u2014 they apply in any month you are over the line.\n\n"
      + `Your dashboard: ${SITE}/dashboard/founder\n`
      + `What this costs: ${SITE}/pricing`
      + SIGNOFF,
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
    `Attached is a record of what you earned and what was paid out in ${year}.\n\n`
      + "It is for your records. It is not a tax form and it is not tax advice \u2014 if you need "
      + "to file something, this is a document to give an accountant, not one to file.\n\n"
      + `Your dashboard: ${SITE}/dashboard/founder`
      + SIGNOFF,
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
  to: string, subject: string, body: string,
  context: { founderId: string; disputeId: string; audience: "founder" | "guardian" },
) {
  return send(to, subject, body + SIGNOFF, {
    action: `email.dispute_${context.audience}`,
    founderId: context.founderId,
    meta: { disputeId: context.disputeId },
  });
}

/* ---------------- payout requested ---------------- */

export function sendPayoutNotification(
  guardianEmail: string, founderName: string, amountMinor: number, currency: string,
  founderId: string,
) {
  const amount = formatMinor(amountMinor, currency);
  return send(
    guardianEmail,
    `${founderName} requested a payout of ${amount}`,
    `${founderName} asked for ${amount} to be paid out to the bank account on their payment `
      + "account.\n\n"
      + "This is a notice, not a request to approve. On this account type payouts run on the "
      + "provider's own schedule and nobody, including you, can block one. You get told every "
      + "time and the request is on the permanent record.\n\n"
      + `Your dashboard: ${SITE}/dashboard/guardian`
      + SIGNOFF,
    { action: "email.payout_sent", founderId, meta: { amountMinor, currency } },
  );
}

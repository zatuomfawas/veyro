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

const FROM = "Veyro <noreply@withveyro.com>";
const REPLY_TO = "hello@withveyro.com";

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
    "Welcome to Veyro.\n\n"
      + "Click the link below to finish signing up:\n\n"
      + `${link}\n\n`
      + "The link works for 24 hours. If it expires you can request a new one from the sign-in "
      + "page.\n\n"
      + "If you did not create a Veyro account, ignore this email. Nothing was set up and no one "
      + "can use the address without this link."
      + SIGNOFF,
    { action: "email.verification_sent" },
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
    `${guardianEmail} opened the invitation you sent, but it had already expired.\n\n`
      + "They have asked for a new one. Invite links last 14 days, and sending a new one "
      + "replaces the old link.\n\n"
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

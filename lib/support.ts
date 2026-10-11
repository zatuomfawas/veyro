// Support routing: a tagged subject line, and nothing more.
//
// The brief is explicit that a ticketing system is not wanted, and it is
// right -- what "priority support" has to mean in practice is that the message
// is visibly first in the inbox, and a subject prefix does that today with no
// infrastructure to run or go down.
//
// "Target", never "guaranteed". A 24-hour target is a commitment we intend to
// keep and cannot promise, and the Terms say exactly that.
// THE address. Eleven files used to declare this independently -- four pages,
// four shared components, two lib modules and this one -- so changing it meant
// finding all eleven and the eleventh was always the one that got missed. They
// all import it from here now.
//
// NOT the address mail is SENT from. See lib/email.ts: Resend will only send
// from a domain verified in the account, and nobody can verify gmail.com, so
// the sending address stays on withveyro.com and this is what Reply-To is set
// to.
const SUPPORT_EMAIL = "withveyro@gmail.com";

export type SupportAudience = "founder" | "guardian";

/**
 * A mailto that arrives pre-sorted.
 *
 *   [PRIORITY] ...   an eligible account, so it is answered first
 *   [GUARDIAN] ...   a parent, who gets a person rather than a queue
 *
 * The account reference goes in the body rather than the subject, so the
 * prefix stays scannable and a filter can match on it exactly.
 */
export function supportMailto(opts: {
  audience: SupportAudience;
  priority: boolean;
  founderId?: string;
  subject?: string;
}): string {
  const tags = [
    opts.priority ? "[PRIORITY]" : null,
    opts.audience === "guardian" ? "[GUARDIAN]" : null,
  ].filter(Boolean).join(" ");
  const subject = [tags, opts.subject ?? "Support request"].filter(Boolean).join(" ");
  const body = opts.founderId
    ? `\n\n---\nAccount reference: ${opts.founderId}\n(Leave this line so we can find your account.)`
    : "";
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`
    + (body ? `&body=${encodeURIComponent(body)}` : "");
}

/** The response commitment, worded as the Terms word it. */
export const PRIORITY_TARGET = "Target response within 24 hours.";
export { SUPPORT_EMAIL };

// Support routing: a tagged subject line, and nothing more.
//
// The brief is explicit that a ticketing system is not wanted, and it is
// right -- what "priority support" has to mean in practice is that the message
// is visibly first in the inbox, and a subject prefix does that today with no
// infrastructure to run or go down.
//
// "Target", never "guaranteed". A 24-hour target is a commitment we intend to
// keep and cannot promise, and the Terms say exactly that.
const SUPPORT_EMAIL = "hello@withveyro.com";

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

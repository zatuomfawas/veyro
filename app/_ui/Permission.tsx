import Link from "next/link";
import { REPLY_DATE, Q_CORE } from "@/app/_ui/provider-reply";

// The sentence that allows the whole product, on the page where it convinces.
//
// WHY THIS IS ON THE HOMEPAGE. Everything else here can be copied. A rival can
// build the dashboard, write better headlines and undercut the fee inside a
// month. What they cannot do is produce a dated written answer from the payment
// provider saying a thirteen-year-old may hold an account, because getting one
// meant asking and waiting. It was reachable only through a small link reading
// "How this is allowed", which is the quietest possible treatment of the single
// strongest asset the company has.
//
// THE QUOTE IS NOT PARAPHRASED, and the restraint is the argument. Anybody can
// write "we checked, it's allowed". Showing the sentence, naming who said it
// and dating it is a claim a reader can go and verify, which is the only kind
// worth making to an audience that has been told all its life that this sort
// of thing is not for them.
//
// THE LIMIT IS PART OF THE PITCH, not a disclaimer bolted to the end of it.
// Provider policy permitting something is not the same as it being settled
// where you live, and a page that published the permission without the limit
// would be doing the overclaiming this company's whole voice exists to avoid.
// It is also, in practice, the more persuasive half: a site that volunteers
// what it cannot prove is a site you believe about what it can.
//
// NO BADGE, NO SEAL, NO LOGO. The evidence is a sentence, so it is set as a
// sentence. A trust mark here would be decoration standing where the actual
// proof is, which is the substitution this section exists to refuse.

export function Permission() {
  return (
    <div className="permit">
      <h2 className="lp-h2 permit-h">
        This is allowed, and here is the sentence that says so.
      </h2>

      <div className="permit-body">
      <figure className="permit-fig">
        <blockquote className="permit-q">{Q_CORE}</blockquote>
        <figcaption className="permit-c">
          Stripe Support, in writing, {REPLY_DATE}. We asked them directly, because the answer
          decides whether any of this is possible.
        </figcaption>
      </figure>

      <p className="permit-lim">
        What they would not confirm is availability country by country, and we publish that too.
        Their policy permitting this is not the same as it being settled where you live: no
        lawyer in any country has confirmed that a minor may hold such an account.{" "}
        <Link className="linkbtn" href="/how-it-works">Read the whole reply</Link>, or{" "}
        <Link className="linkbtn" href="/legal">what is still unsettled</Link>.
      </p>
      </div>
    </div>
  );
}

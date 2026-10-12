import Link from "next/link";

// Two people read this site and they want opposite things from it.
//
// The founder's answer REFERENCES the three steps above rather than
// restating them. It used to re-explain the whole arrangement -- country,
// guardian, verification, who runs it afterwards -- which made this the
// third telling on one page after the hero and the Journey. The Journey is
// the diagram and the diagram carries the concept; this panel's job is to
// answer "can I", not to teach the model again.
//
// A founder is asking "can I start, and what do I have to do". A parent is
// asking "is this legitimate, and what am I on the hook for". Written as one
// column of prose, every paragraph is half-addressed to someone else and both
// readers skim. Split, each one can find their half in about a second, which
// is all the time either of them is giving the page.
//
// The two panels differ in ground as well as in heading because a reader
// looking for "the bit that is for me" is reading shape before words.

// Four of these six were overstated, and all four were about control of
// money. "You decide when the money moves" and then "Ask for a payout
// whenever you like" were both the founder's line about a setting the
// guardian holds in Stripe; "You verify once, not every time they get paid"
// is contradicted by REQUIREMENTS_DUE; and the export comes from Stripe,
// which holds the payments, not from Veyro. Each is replaced by the nearest
// true version rather than dropped, because all four answer a question
// somebody actually has -- the founder's is now about seeing the money,
// which is the thing Veyro genuinely does.
const FOUNDER = [
  "Paste one snippet and take your first payment",
  "Your own wallet, products and payout history",
  "See every payment, fee and payout as it happens",
] as const;

const PARENT = [
  "You are not asked to approve individual sales",
  "You own the account and can close or freeze it whenever",
  "Every payment and fee on the record, and on your dashboard",
] as const;

export function AudienceSplit() {
  return (
    <div className="aud">
      <section className="aud-p" data-who="founder">
        <h3 className="aud-k">If you are building something</h3>
        <p className="aud-h">Can I start selling?</p>
        <p className="aud-b">
          Yes, if the payment provider supports your country. The three steps above are the
          whole of it, and after that the product is yours to run with nobody signing off your
          sales.
        </p>
        <ul className="ticks" style={{ marginTop: "var(--sp-4)" }}>
          {FOUNDER.map((x) => <li key={x}>{x}</li>)}
        </ul>
        <div className="aud-foot">
          <Link className="btn" href="/get-started">Start &mdash; it&rsquo;s free</Link>
        </div>
      </section>

      <section className="aud-p" data-who="parent">
        <h3 className="aud-k">If your child sent you a link</h3>
        <p className="aud-h">Is this legitimate?</p>
        <p className="aud-b">
          Your name goes on the account. We wrote the whole of what that means: the
          responsibilities, the limits, and the parts no lawyer has confirmed yet.
        </p>
        <ul className="ticks" style={{ marginTop: "var(--sp-4)" }}>
          {PARENT.map((x) => <li key={x}>{x}</li>)}
        </ul>
        <div className="aud-foot">
          <Link className="btn btn-2" href="/for-parents">Read the parents&rsquo; page</Link>
        </div>
      </section>
    </div>
  );
}

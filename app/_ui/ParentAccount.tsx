import Link from "next/link";

// "Why not just use your parent's account?"
//
// This is the only objection that matters, because it is free, it mostly works,
// and it is what the visitor is already doing. It is answered in those words,
// on the page, rather than implied by a feature list.
//
// The processor is not named anywhere in these five. This section exists to
// close the free-workaround objection, and naming the rails inside the answer
// re-opens it: a reader told which company permits this can go and arrange it
// themselves. What is being compared is two accounts, and that comparison is
// true whoever is underneath. The rails are named on /how-it-works and on
// /legal, where a reader has already decided they want this.
//
// Four of these are wins. The fifth is not, and it says so: there is no
// handover at 18 yet, so on that point a Veyro account and a parent's account
// are currently the same. Writing it as a win would be the one claim on this
// page that does not survive someone checking it, and /legal says the opposite
// in as many words.

type Answer = { q: string; a: React.ReactNode; tie?: boolean };

const ANSWERS: Answer[] = [
  {
    q: "Your parent ends up running a business they did not start",
    a: (
      <>
        On their account, every refund, chargeback and dispute is theirs. It arrives in their
        dashboard, under their name, and they deal with it. On yours, it is yours.
      </>
    ),
  },
  {
    q: "They approve once here, not every time",
    a: (
      <>
        Your parent verifies themselves once, when the account is opened. That is the approval.
        They are not asked again each time you get paid, and they are not a bottleneck between
        you and your money. They can still close or freeze the account &mdash; they own it
        &mdash; but they are not in the middle of it.
      </>
    ),
  },
  {
    q: "The earnings are yours",
    a: (
      <>
        Your parent is the account owner on paper. That is the part that makes this legal: an
        adult has to be the enforceable party. But you control where the money goes and the
        earnings are yours, not theirs.{" "}
        <Link className="linkbtn" href="/for-parents">What that means at tax time</Link>.
      </>
    ),
  },
  {
    q: "You get tools built for you",
    a: (
      <>
        Your own dashboard, your own products, your own payout history &mdash; instead of being
        a guest in an adult&rsquo;s account, reading someone else&rsquo;s numbers to find yours.
      </>
    ),
  },
  {
    q: "At 18, this one is a tie",
    tie: true,
    a: (
      <>
        A parent&rsquo;s account never becomes yours: you start over and lose your payment
        history. Right now Veyro is the same &mdash; there is no handover yet. We are building
        the transfer so you keep your history, and until it exists we are not going to pretend it
        does.{" "}
        <Link className="linkbtn" href="/legal">What else is unfinished</Link>.
      </>
    ),
  },
];

export function ParentAccount() {
  return (
    <div className="objection">
      <div className="headc">
        <span className="lp-eyebrow">The obvious question</span>
        <h2 className="lp-h2" style={{ marginTop: "var(--sp-2)" }}>
          Why not just use your parent&rsquo;s account?
        </h2>
        <p className="lp-lead" style={{ marginTop: 16 }}>
          Most people do. It is free, it mostly works, and it is probably what you were about to
          do. Here is what you are trading for it.
        </p>
      </div>

      <dl className="objlist">
        {ANSWERS.map((x) => (
          <div className="objrow" key={x.q} data-tie={x.tie ? "1" : undefined}>
            <dt className="obj-q">
              <span className="obj-mark" aria-hidden="true">
                {x.tie ? (
                  <svg viewBox="0 0 16 16"><path d="M3 8h10" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" /></svg>
                ) : (
                  <svg viewBox="0 0 16 16"><path d="m3.5 8.5 3 3 6-7" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                )}
              </span>
              {x.q}
            </dt>
            <dd className="obj-a">{x.a}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

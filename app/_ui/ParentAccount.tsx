import Link from "next/link";

// "Why not just use your parent's account?"
//
// The only objection that matters, because it is free, it mostly works, and it
// is what the visitor was about to do. It is answered in those words rather
// than implied by a feature list.
//
// WHY IT IS A COMPARISON NOW. It was five claims with a tick drawn beside each
// one, which is the pattern DESIGN.md names as forbidden and, worse, the wrong
// rhetorical shape: a row of ticks asks to be believed, where a trade asks to
// be read. The lead has always said "here is what you are trading for it", so
// the section is now the trade itself, in two columns, with the same hairline
// idiom the rest of the site uses for money.
//
// The last row is a tie and the layout says so without a word: both columns
// carry the same weight and the same ink, because there is no handover at 18
// yet and writing that as a win would be the one claim here that does not
// survive somebody checking it. /legal says the same thing in as many words.
//
// THE PROCESSOR IS NOT NAMED. This section exists to close the free-workaround
// objection, and naming the rails inside the answer re-opens it: a reader told
// which company permits this can go and arrange it themselves. What is being
// compared is two accounts, and that comparison holds whoever is underneath.
// The rails are named on /how-it-works and /legal, where a reader has already
// decided they want this.
//
// EVERY CLAIM IS ONE THE SITE ALREADY STANDS BEHIND. The three costs come from
// the checker's own "What you can still do" panel, which it shows to the people
// it has just turned away: the business is legally theirs, at 18 you transfer
// rather than take over, and signing in with their password breaches the
// provider's terms. Nothing here is argued that is not already said to
// somebody we are sending away.

type Row = { t: string; theirs: React.ReactNode; yours: React.ReactNode; tie?: boolean };

const ROWS: Row[] = [
  {
    t: "Whose business it is",
    theirs: <>Legally it is theirs. You are building something that belongs to an adult, and
      every record of it says so.</>,
    yours: <>An adult still has to be the enforceable party, so the account is in your
      guardian&rsquo;s name. The products on it, and the earnings, are yours.</>,
  },
  {
    t: "Using it day to day",
    theirs: <>You are a guest in an adult&rsquo;s account, reading somebody else&rsquo;s numbers
      to find yours among them.</>,
    yours: <>Your own dashboard, your own products, your own payout history, in your own
      login.</>,
  },
  {
    t: "Signing in",
    theirs: <>If you use their password you are breaching the provider&rsquo;s terms, and the
      account can be closed with the money still in it.</>,
    yours: <>You sign in as yourself and your guardian signs in as themselves. Nobody is
      pretending to be anybody.</>,
  },
  {
    t: "At 18",
    tie: true,
    theirs: <>The account never becomes yours. You transfer it or you start again, and the
      payment history does not come with you.</>,
    yours: <>The same, today. There is no handover yet, we are building it, and we are not
      going to pretend it exists.{" "}
      <Link className="linkbtn" href="/legal">What else is unfinished</Link>.</>,
  },
];

export function ParentAccount() {
  return (
    <div className="objection">
      <div className="secth">
        <div>
          <h2 className="lp-h2">Why not just use your parent&rsquo;s account?</h2>
        </div>
        <p className="secth-l">
          Most people do. It is free, it mostly works, and it is probably what you were about to
          do. Here is what you are trading for it.
        </p>
      </div>

      <dl className="trade">
        {/* The column headers are the comparison's own labels and exist once,
            at the top, on a width that can hold them. Below 760 each cell
            carries its own label instead, because a stacked row with no label
            is two paragraphs nobody can tell apart. */}
        <div className="trade-head" aria-hidden="true">
          <span />
          <span className="trade-hl">On your parent&rsquo;s account</span>
          <span className="trade-hr">On your own</span>
        </div>

        {ROWS.map((r) => (
          <div className="trade-r" key={r.t} data-tie={r.tie ? "1" : undefined}>
            <dt className="trade-t">{r.t}</dt>
            <dd className="trade-a">
              <span className="trade-l">On your parent&rsquo;s account</span>
              {r.theirs}
            </dd>
            <dd className="trade-b">
              <span className="trade-l">On your own</span>
              {r.yours}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

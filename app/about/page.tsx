import Link from "next/link";
import { buildViewport, SITE } from "@/lib/seo";
import type { Metadata } from "next";
import { CSS, CSS2 } from "@/app/_ui/css";
import { Wordmark, SkipLink } from "@/app/_ui/marks";
import { SiteFooter } from "@/app/_ui/SiteFooter";
import { MobileNav } from "@/app/_ui/MobileNav";
import { ScrollTop } from "@/app/_ui/ScrollTop";

export const viewport = buildViewport();

export const metadata: Metadata = {
  title: "About Veyro, and why it exists",
  description:
    "Who is building Veyro and why, what it commits to, and what is not finished yet. "
    + "Written by the person building it.",
  alternates: { canonical: SITE + "/about" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "Veyro",
    title: "About Veyro, and why it exists",
    description: "Who is building Veyro and why, and what it commits to.",
    url: SITE + "/about",
  },
};

const SUPPORT_EMAIL = "hello@withveyro.com";

// The commitments are every one of them checkable in this repository today,
// which is the only reason they are worth printing. Each names the file or the
// behaviour that makes it true, so a reader who does not believe one can go and
// look, and so nobody here can quietly stop honouring one without the code
// changing first.
const COMMITMENTS: { head: string; body: React.ReactNode }[] = [
  {
    head: "Your guardian consents, and Stripe verifies them. They cannot block a payout.",
    body: (
      <>
        A guardian accepts in their own account, and Stripe checks their identity, not the
        founder&rsquo;s. They are told about every payout request and keep a permanent record of it.
        They get no veto, because on the Stripe account type this is built on nobody can be given
        one. A guardian should know that before agreeing, not after.
      </>
    ),
  },
  {
    head: "Money settles to the founder's own account, never through Veyro.",
    body: (
      <>
        A customer pays the founder&rsquo;s Stripe connected account directly. Veyro is never in the
        path of the money and never holds a balance. The wallet you see is folded from your own
        records each time it is shown, so it cannot drift from them.
      </>
    ),
  },
  {
    head: "Veyro never receives identity documents or bank details.",
    body: (
      <>
        Passports, ID numbers, and the bank account payouts go to are entered on Stripe&rsquo;s own
        hosted form. Veyro stores a reference to the account and nothing that could be used to
        impersonate anyone. That is an architectural choice, not a promise about our intentions.
      </>
    ),
  },
  {
    head: "Veyro takes no percentage of what you earn.",
    body: (
      <>
        No cut, no platform fee. Stripe charges its own processing fees, which Stripe sets and
        deducts. Future pricing is undecided, and if that ever changes you will be told before it
        applies to you.
      </>
    ),
  },
  {
    head: "The checker is free, needs no account, and says no when the answer is no.",
    body: (
      <>
        Two questions, no email address. If your country is closed to this route, or you are old
        enough not to need us at all, it tells you that instead of signing you up.
      </>
    ),
  },
  {
    head: "This is software, not a bank, and none of it is settled law.",
    body: (
      <>
        Stripe&rsquo;s written policy permits a 13-year-old to hold an account where a guardian
        completes their onboarding, and{" "}
        <Link className="linkbtn" href="/how-it-works">we publish their exact words</Link>. Whether
        that is settled where you live has not been confirmed by a lawyer in any country. Provider
        policy allowing something is not the same as it being tested.
      </>
    ),
  },
];

export default function About() {
  return (
    <div className="fw">
      <style>{CSS + CSS2}</style>
      <SkipLink />

      <div className="navbar">
        <div className="wrap-lp">
          <nav className="lp-nav" aria-label="Main">
            <Link href="/" aria-label="Veyro, home"><Wordmark size={20} /></Link>
            <div className="lp-links">
              <Link className="btn btn-q btn-sm hide-s" href="/how-it-works">How it works</Link>
              <Link className="btn btn-q btn-sm hide-s" href="/for-guardians">For parents</Link>
              <Link className="btn btn-sm" href="/check">Check eligibility</Link>
              <MobileNav
                items={[
                  { href: "/how-it-works", label: "What Stripe told us" },
                  { href: "/for-guardians", label: "For parents" },
                  { href: "/check", label: "Check eligibility" },
                  { href: "/", label: "Home" },
                ]}
              />
            </div>
          </nav>
        </div>
      </div>

      <main id="main" className="wrap-lp" style={{ paddingTop: 40, paddingBottom: 80 }}>
        <span className="lp-eyebrow">About</span>
        <h1 className="lp-h2" style={{ marginTop: "var(--sp-2)" }}>
          Why Veyro exists.
        </h1>

        {/* ---------------- the story ----------------

            The em dash in the third paragraph is deliberate and must stay.
            DESIGN.md forbids em dashes in copy, and that rule is right for
            marketing and interface text, which is written in the product's
            voice. This section is not that: it is Mike Daniels' own account in
            his own phrasing, quoted as given. Do not let a find-and-replace
            pass flatten it. See DESIGN.md, "Patterns that are forbidden". */}
        <div className="truthgrid" style={{ marginTop: 40, alignItems: "start" }}>
          <div>
            <h2 className="h3" style={{ marginTop: 0 }}>Built by Mike Daniels</h2>
            <p className="small" style={{ marginTop: 8 }}>
              Veyro is a small, early project. There is no team page below this, because there is no
              team.
            </p>
          </div>

          <div style={{ maxWidth: "var(--m-wide)" }}>
            <p className="lead" style={{ marginTop: 0 }}>
              I built Veyro after seeing a problem firsthand with my brother. He had ideas for online
              businesses and was capable of actually building and launching them, but when it came
              time to accept payments, financial infrastructure became the obstacle. Setting up
              payment processing, dealing with age requirements, finding the right account, and
              involving a parent could turn something that should have been simple into a
              frustrating process.
            </p>
            <p className="body" style={{ marginTop: 16 }}>
              It made me realize that young founders can be capable of building a real business long
              before they have easy access to the financial infrastructure needed to operate one.
            </p>
            <p className="body" style={{ marginTop: 16 }}>
              Veyro was created to simplify that gap — giving young founders a straightforward way
              to set up their business, involve a guardian when required, connect legitimate payment
              infrastructure, and understand what is happening with their money.
            </p>
            <p className="body" style={{ marginTop: 16 }}>
              Veyro isn&rsquo;t about finding loopholes or bypassing financial requirements.
              It&rsquo;s about making the legitimate process dramatically simpler.
            </p>
            <p className="body" style={{ marginTop: 16, fontWeight: 500, color: "var(--ink)" }}>
              Build your business. Invite your guardian. Start selling.
            </p>
            <p className="tiny" style={{ marginTop: 16 }}>Mike Daniels</p>
          </div>
        </div>

        <hr className="rule" style={{ margin: "48px 0" }} />

        {/* ---------------- commitments ---------------- */}
        <span className="lp-eyebrow">What Veyro commits to</span>
        <h2 className="lp-h2" style={{ marginTop: "var(--sp-2)" }}>
          Six things, all checkable.
        </h2>
        <p className="sec-lead body" style={{ marginTop: 12, marginBottom: 28 }}>
          Every one of these is true of the code as it stands, not an intention. They are written
          down so that changing any of them has to be a decision somebody makes on purpose.
        </p>

        <ol className="numbered">
          {COMMITMENTS.map((c) => (
            <li key={c.head}>
              <strong style={{ fontSize: "var(--fs-3)" }}>{c.head}</strong>
              <span className="small">{c.body}</span>
            </li>
          ))}
        </ol>

        <hr className="rule" style={{ margin: "48px 0" }} />

        {/* ---------------- what is not done ---------------- */}
        <div className="truthgrid">
          <div>
            <h2 className="h3" style={{ marginTop: 0 }}>What is not finished</h2>
          </div>
          <div style={{ maxWidth: "var(--m-wide)" }}>
            <p className="body" style={{ marginTop: 0 }}>
              This is early software and some of it is visibly unfinished. Naming the gaps is more
              useful than waiting until someone trips over them.
            </p>
            <ul className="arrowlist" style={{ marginTop: 16 }}>
              <li>
                <strong>A founder&rsquo;s date of birth is self-declared.</strong> Nobody verifies
                it. Stripe verifies the guardian&rsquo;s identity, not the founder&rsquo;s age. This
                is a current limitation, and tightening it is scheduled before launch.
              </li>
              <li>
                <strong>Nothing happens when a founder turns 18.</strong> It has not been built. The
                guardian&rsquo;s name stays on the Stripe account and the account itself does not
                change. This will be addressed before launch.
              </li>
              <li>
                <strong>Veyro cannot send email yet.</strong> That is why a guardian invitation is a
                link you copy and send yourself, and why an email address cannot be changed in
                settings: an unverified change would be the easiest way to take over an account.
              </li>
              <li>
                <strong>The legal pages are drafted, not lawyer-reviewed</strong>, and Veyro is not
                yet incorporated, so they name no governing jurisdiction. Each page says so at the
                top.
              </li>
              <li>
                <strong>No screen reader has been used on this product.</strong> The{" "}
                <Link className="linkbtn" href="/accessibility">accessibility statement</Link> is
                specific about what has been measured and what has only been designed for.
              </li>
            </ul>
          </div>
        </div>

        <div className="row" style={{ marginTop: 40, gap: 10, flexWrap: "wrap" }}>
          <Link className="btn btn-lg" href="/check">Check what applies to you</Link>
          <Link className="btn btn-2 btn-lg" href="/how-it-works">Read what Stripe told us</Link>
        </div>

        <p className="tiny" style={{ marginTop: 20 }}>
          Questions, corrections, or something that does not work:{" "}
          <a className="linkbtn" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
        </p>
      </main>

      <ScrollTop />
      <SiteFooter />
    </div>
  );
}

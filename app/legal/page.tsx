import Link from "next/link";
import type { Metadata } from "next";
import { buildViewport, SITE } from "@/lib/seo";
import { CSS, CSS2 } from "@/app/_ui/css";
import { Wordmark, SkipLink } from "@/app/_ui/marks";
import { SiteFooter } from "@/app/_ui/SiteFooter";
import { MoneyRail } from "@/app/_ui/MoneyRail";
import { MobileNav } from "@/app/_ui/MobileNav";
import { ScrollTop } from "@/app/_ui/ScrollTop";
import { ThemeToggle } from "@/app/_ui/ThemeToggle";
import { SectionRail } from "@/app/_ui/SectionRail";
import { PageNext } from "@/app/_ui/PageNext";

export const viewport = buildViewport();

export const metadata: Metadata = {
  title: "What is not settled yet",
  description:
    "The parts of taking payments under 18 that are untested, unfinished or weaker than they "
    + "sound: no court has ruled on the guardian route, there is no handover at 18, and age is "
    + "self-declared.",
  alternates: { canonical: SITE + "/legal" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "Veyro",
    title: "What is not settled yet",
    description: "The untested and unfinished parts, written down.",
    url: SITE + "/legal",
  },
};

// The page for the person who is not going to take the homepage's word for it.
//
// A homepage that sells an identity and a page that lists what is unproven are
// not in conflict; a product that only had the first one would be. Everything
// here is already true and already said elsewhere on the site — this page is
// where someone who wants to dig can find it in one place, rather than having
// to read a marketing page closely enough to notice the qualifiers.
//
// Nothing here should be softened later without the underlying thing changing
// first. If a gap gets closed, the entry goes; it does not get reworded.

type Gap = { h: string; body: React.ReactNode };

const GAPS: Gap[] = [
  {
    h: "No court has tested this, anywhere",
    body: (
      <>
        Stripe&rsquo;s own policy permits someone aged 13 to 17 to hold a connected account when a
        guardian is the verified adult on it. That is a provider&rsquo;s written position, and it
        is what Veyro is built on. It is not the same thing as a court in your country having
        ruled on whether a minor can be bound by the contracts that sit under it. No lawyer has
        confirmed it in any country, and we are not going to imply otherwise by staying quiet.
      </>
    ),
  },
  {
    h: "Nothing happens automatically when you turn 18",
    body: (
      <>
        The guardian&rsquo;s name stays on the Stripe account and the account does not change
        itself. There is no handover flow today. This is a real gap rather than a design
        decision, it is on the list to fix before launch, and until it is fixed it would be
        wrong to let anyone assume the account quietly becomes theirs on a birthday.
      </>
    ),
  },
  {
    h: "Age is self-declared and nobody checks it",
    body: (
      <>
        The founder&rsquo;s date of birth is typed in by the founder. Veyro checks it against the
        13 floor; nobody verifies that it is real. Stripe verifies the{" "}
        <em>guardian&rsquo;s</em> identity, which is a different person and a different question.
        So &ldquo;age verification&rdquo; is a stronger phrase than what actually happens here,
        and it will be tightened before launch.
      </>
    ),
  },
  {
    h: "Your guardian cannot block a payout, and that is not a feature",
    body: (
      <>
        On a Stripe Standard connected account the platform cannot hold money, delay a payout or
        approve one, so neither we nor your guardian can. They are notified of every payout
        request and keep a permanent record. The honest version is that this follows from
        Veyro&rsquo;s platform being registered in the UAE, which limits us to Standard accounts
        — not from anything about the under-18 rules. If another product promises a guardian
        veto, ask which account type it uses.
      </>
    ),
  },
  {
    h: "Where it does not work at all",
    body: (
      <>
        Brazil is excluded outright: Stripe requires account holders there to be 18 or over,
        guardian or no guardian. Beyond that, self-serve signup covers 43 countries, and the{" "}
        <Link className="linkbtn" href="/check">eligibility checker</Link> answers for yours in
        two questions — including when the answer is no.
      </>
    ),
  },
  {
    h: "The API underneath this is being replaced",
    body: (
      <>
        Stripe no longer recommends Accounts v1 for new Connect integrations, and on a fresh
        platform account it is off until explicitly enabled. Migrating is in development. It is
        written here rather than left for you to discover in a changelog.
      </>
    ),
  },
];

export default function LegalPage() {
  return (
    <div className="fw">
      <style href="veyro-css" precedence="default">{CSS + CSS2}</style>
      <SkipLink />

      <div className="navbar">
        <div className="wrap-lp">
          <nav className="lp-nav" aria-label="Main">
            <Link href="/" aria-label="Veyro, home"><Wordmark size={21} tile /></Link>
            <div className="lp-links">
              <Link className="btn btn-q btn-sm hide-s" href="/how-it-works">How it works</Link>
              <Link className="btn btn-q btn-sm hide-s" href="/faq">Questions</Link>
              <Link className="btn btn-sm" href="/check">Check eligibility</Link>
              <ThemeToggle />
              <MobileNav
                items={[
                  { href: "/how-it-works", label: "How it works" },
                  { href: "/faq", label: "Questions" },
                  { href: "/for-parents", label: "For parents" },
                  { href: "/check", label: "Check eligibility" },
                ]}
              />
            </div>
          </nav>
        </div>
      </div>

      <main id="main" className="wrap-lp longform has-rail" style={{ paddingTop: 32, paddingBottom: 56 }}>
        {/* The sections of this page are the six doubts, not its one heading. */}
        <SectionRail label="What is unproven" selector=".numbered > li > span:first-child" />
        <span className="lp-eyebrow">Straight answers</span>
        <h1 className="lp-h2" style={{ marginTop: "var(--sp-2)" }}>What is not settled yet.</h1>
        <p className="lead" style={{ marginTop: 16 }}>
          Veyro is built on a route that a payment provider permits and that no court has ruled
          on. Six things about that are unproven, unfinished or weaker than they sound. They are
          all here, in one place, so you do not have to read a marketing page carefully enough to
          spot them.
        </p>
        <p className="small" style={{ marginTop: 16 }}>
          If you are a parent deciding whether to put your name on an account, this is the page to
          read. <Link className="linkbtn" href="/for-parents">What you are agreeing to</Link>.
        </p>

        {/* The six doubts below are all about one arrangement, and a reader
            who has not seen it drawn is being asked to hold it in their head
            while being told what is wrong with it. No product UI on this
            page: it exists to be sober, and a dashboard here would be the
            page selling while it apologises. */}
        <div style={{ marginTop: "var(--sp-8)" }}>
          <MoneyRail />
        </div>

        <hr className="rule" style={{ margin: "var(--sp-8) 0 30px" }} />

        <ol className="numbered">
          {GAPS.map((g) => (
            <li key={g.h}>
              <span>{g.h}</span>
              <span>{g.body}</span>
            </li>
          ))}
        </ol>

        <hr className="rule" style={{ margin: "30px 0" }} />

        <h2 className="h3">What is solid</h2>
        <p className="body" style={{ marginTop: 8 }}>
          For balance, and because the list above is not the whole picture. The guardian is the
          account owner, which is the part that makes the arrangement lawful, and the founder
          controls the payouts and owns the earnings. Veyro charges nothing under $100 a month
          and 3% on the amount above it, with the same product either way. Veyro never sees identity documents or bank details
          — those go to Stripe&rsquo;s own hosted form. Every figure in the wallet is folded
          from the founder&rsquo;s own payment records each time it is read, so no stored balance
          can drift from the payments behind it.
        </p>
        <p className="small" style={{ marginTop: 20 }}>
          <Link className="linkbtn" href="/how-it-works">How we built it, in full</Link>
          {" · "}
          <Link className="linkbtn" href="/terms">Terms</Link>
          {" · "}
          <Link className="linkbtn" href="/privacy">Privacy</Link>
        </p>
        <PageNext
          head="Read the worst of it. Now the rest."
          lead="Everything above is true and none of it is the whole picture. How the thing is
            actually built, and what the adult on the account is actually agreeing to."
          primary={{ href: "/how-it-works", label: "How it is built" }}
          secondary={{ href: "/for-parents", label: "What a guardian takes on" }}
          note="If one of these six is the thing stopping you, say which — it is the most useful
            mail we get."
        />
      </main>

      <ScrollTop />
      <SiteFooter />
    </div>
  );
}

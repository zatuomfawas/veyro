import Link from "next/link";
import type { Metadata } from "next";
import { buildViewport, SITE } from "@/lib/seo";
import { CSS, CSS2 } from "@/app/_ui/css";
import { Wordmark, SkipLink } from "@/app/_ui/marks";
import { SiteFooter } from "@/app/_ui/SiteFooter";
import { SectionRail } from "@/app/_ui/SectionRail";
import { MobileNav } from "@/app/_ui/MobileNav";
import { ScrollTop } from "@/app/_ui/ScrollTop";
import { ThemeToggle } from "@/app/_ui/ThemeToggle";
import { GuardianPermissions } from "@/app/_ui/GuardianPermissions";
import { ParentPanel } from "@/app/_ui/ParentPanel";
import { MoneyRail } from "@/app/_ui/MoneyRail";
import { TalkToAPerson } from "./TalkToAPerson";
import { PageNext } from "@/app/_ui/PageNext";
import { supportMailto } from "@/lib/support";

export const viewport = buildViewport();

export const metadata: Metadata = {
  title: "For parents: what you are agreeing to",
  description:
    "Is it legal, are you liable, what does it do to your taxes, and can you stop it. "
    + "Four questions answered plainly, including the parts that are not settled.",
  alternates: { canonical: SITE + "/for-parents" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "Veyro",
    title: "For parents: what you are agreeing to",
    description: "Four questions answered plainly, including the parts that are not settled.",
    url: SITE + "/for-parents",
  },
};

// The page a parent reads before they say yes, and the one that decides whether
// the account ever exists.
//
// Written in the third person and at a lower temperature than the rest of the
// site: a parent arriving here has been sent a link by their kid and is looking
// for reasons this is not a scam. Any sales voice reads as one. The four
// questions are in the order they are actually asked, and each answer leads
// with the unwelcome half.

type QA = {
  q: string;
  /** Two or three words. The answer, before the reasoning. */
  verdict: string;
  /** pine = yes, amber = qualified, slate = not ours to answer. */
  tone: "pine" | "amber" | "slate";
  /** One sentence a reader can stop at and still have the truth. */
  lead: string;
  a: React.ReactNode;
};

const QUESTIONS: QA[] = [
  {
    q: "Is this legal?",
    verdict: "Permitted, not settled",
    tone: "amber",
    lead:
      "The processor's own written policy allows it. No court has ruled on it, and we are not going to pretend one has.",
    a: (
      <>
        <p className="body" style={{ marginTop: 0 }}>
          That policy is quoted in full &mdash; named, dated and unedited &mdash; on{" "}
          <Link className="linkbtn" href="/how-it-works">how it works</Link>, and it is what this
          product is built on.
        </p>
        <p className="body" style={{ marginTop: 12 }}>
          What it is not is a court ruling. No judge anywhere has tested whether a minor can be
          bound by the contracts underneath, and no lawyer has confirmed it in any country. The
          arrangement is permitted by the processor and lawful on its face; it is not settled law.
          If that distinction matters to you, it should, and{" "}
          <Link className="linkbtn" href="/legal">the full list of what is unproven</Link> is a
          page rather than a footnote.
        </p>
      </>
    ),
  },
  {
    q: "Am I liable if it goes wrong?",
    verdict: "Yes \u2014 and that is the point",
    tone: "pine",
    lead:
      "You are the account owner, because an adult has to be the party anyone can actually hold to the agreement.",
    a: (
      <>
        <p className="body" style={{ marginTop: 0 }}>
          A contract with a minor is voidable at the minor&rsquo;s election, which is why the enforceable party has to be an adult. It is you who gets identity-checked, not your child, and the account exists in your name.
        </p>
        <p className="body" style={{ marginTop: 12 }}>
          In practice that means refunds, chargebacks and disputes on this account are ultimately
          yours, the same as they would be if your child simply used your own account.
          What changes is that it is a separate account for a separate activity, rather than
          mixed into your personal payments, and that your child handles the day-to-day instead
          of you.
        </p>
        <p className="body" style={{ marginTop: 12 }}>
          Veyro never holds the money and is never in the path of it. Payments go from the
          customer to the payment account in your name; Veyro keeps the record.
        </p>
      </>
    ),
  },
  {
    q: "Does this mess up my taxes?",
    verdict: "Possibly. Ask an accountant",
    tone: "slate",
    lead:
      "Tax documentation for the account is issued against you. What that means for your household is a question for somebody who knows it.",
    a: (
      <>
        <p className="body" style={{ marginTop: 0 }}>
          That is a real consequence of the arrangement and not something to wave away. It follows from your being the account owner, which is the thing that makes the whole route lawful in the first place.
        </p>
        <p className="body" style={{ marginTop: 12 }}>
          What Veyro does is keep the two things separable: the account is for your child&rsquo;s
          activity only, the ledger records every payment and fee against it, and the records are
          exportable. Whether their earnings are treated as yours or theirs depends on where you
          live and on facts about your household that we do not know.
        </p>
        <p className="body" style={{ marginTop: 12 }}>
          We will not tell you it has no effect on your taxes, because we do not know that and
          nobody selling you something should say it.
        </p>
      </>
    ),
  },
  {
    q: "Can I stop it if I need to?",
    verdict: "Yes, completely",
    tone: "pine",
    lead:
      "You can close or freeze the account at any time, directly with the processor. Nothing in Veyro can prevent that.",
    a: (
      <>
        <p className="body" style={{ marginTop: 0 }}>
          Nothing in Veyro is designed to prevent it either. The account is yours, and the route to closing it does not pass through us.
        </p>
        <p className="body" style={{ marginTop: 12 }}>
          What you do not do is approve each payout. You verify yourself once at setup, and after
          that your child moves their own money without asking. That is deliberate &mdash; a
          parent who has to approve every payment is a parent who becomes a bottleneck, and a
          teenager who needs permission for every sale is not running anything. You keep the
          control that matters: the account itself.
        </p>
      </>
    ),
  },
];

export default function ForParents() {
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
              <Link className="btn btn-q btn-sm hide-s" href="/legal">What is not settled</Link>
              <Link className="btn btn-sm" href="/check">Check eligibility</Link>
              <ThemeToggle />
              <MobileNav
                items={[
                  { href: "/how-it-works", label: "How it works" },
                  { href: "/legal", label: "What is not settled" },
                  { href: "/check", label: "Check eligibility" },
                  { href: "/pricing", label: "Pricing" },
                  { href: "/faq", label: "Questions" },
                  { href: "/contact", label: "Contact" },
                ]}
              />
            </div>
          </nav>
        </div>
      </div>

      <main id="main" className="wrap-lp longform has-rail" style={{ paddingTop: 32, paddingBottom: 56 }}>
        <SectionRail />
        <span className="lp-eyebrow">For parents</span>
        <h1 className="lp-h2" style={{ marginTop: "var(--sp-2)", maxWidth: "24ch" }}>
          What you are actually being asked to agree to.
        </h1>
        <p className="lead" style={{ marginTop: 12 }}>
          Your child has probably sent you a link and asked you to approve something. This page
          is the whole of what that means, including the parts that are not finished and the
          parts no lawyer has confirmed. It is not a sales page and there is nothing to buy.
        </p>

        {/* Layer 2. A parent arrives having been asked to agree to something
            and not knowing what it looks like, and four well-written answers
            below cannot fix that as quickly as showing them. The controls are
            the part that matters: the fear is being locked in, and a visible
            Close the account answers it before the prose gets there. */}
        {/* The one thing a parent may want at any point on this page, so it
            stays with them rather than waiting at the bottom. It is also what
            fills the right-hand track: the alternative was 236px of nothing
            beside two thousand words about liability. */}

        <ParentPanel />

        <p className="body" style={{ marginTop: "var(--sp-6)" }}>
          Your name is on the account, so the money that reaches it is traceable to a real,
          verified adult &mdash; which is the entire reason this is allowed. It does not pass
          through Veyro on the way.
        </p>

        <MoneyRail />

        <hr className="rule" style={{ margin: "var(--sp-9) 0 var(--sp-7)" }} />

        {/* Layer 3: the four questions, at length, for the reader who wants
            them. */}
        {/* Four answers, each readable at two depths.
            ------------------------------------------------------------------
            These were four headings with three paragraphs under each, stacked,
            and nothing to catch the eye between the top of one and the top of
            the next. A parent who has been sent a link by their kid and wants
            to know whether this is a scam will not read eleven paragraphs to
            find out -- they will scan, and a wall of prose gives them nothing
            to scan.

            So each one now states its answer before its reasoning: a verdict
            in two or three words, then one sentence that is true on its own,
            then the detail for whoever wants it. The verdict colours are the
            product's own -- pine for yes, amber for a real caveat, slate for
            a question that is not ours to answer -- so four of them read as a
            summary of the whole page. */}
        <ol className="qalist">
          {QUESTIONS.map((x, i) => (
            <li className="qa" key={x.q}>
              <div className="qa-head">
                <span className="fig-ref qa-n">{String(i + 1).padStart(2, "0")}</span>
                <h2 className="qa-q">{x.q}</h2>
              </div>
              {/* A sibling of the flex row, not a member of it. Inside, the
                  only way to drop the badge onto its own line was
                  flex-basis:100%, which sets the flex base size -- so a
                  three-word verdict stretched the width of the column. */}
              <span className="chip qa-verdict" data-tone={x.tone} data-on="1">{x.verdict}</span>
              <p className="qa-lead">{x.lead}</p>
              <div className="qa-body">{x.a}</div>
            </li>
          ))}
        </ol>

        <hr className="rule" style={{ margin: "36px 0 28px" }} />

        <h2 className="h3">What you do and what you do not</h2>
        <p className="body" style={{ marginTop: 8 }}>
          The same list your child sees, so there is nothing you are being told that they are not.
        </p>
        <div style={{ marginTop: "var(--sp-6)" }}>
          <GuardianPermissions />
        </div>

        <hr className="rule" style={{ margin: "36px 0 28px" }} />

        {/* The processor is named here and nowhere else on this page. Every
            other mention has been reframed, because naming the rails inside an
            argument hands the reader a free workaround. This block is not an
            argument -- it is the disclosure of who the parent is about to
            contract with, and a link to the agreement they will sign. A
            counterparty you are asked to sign with has to be named. */}
        <h2 className="h3">Before you decide</h2>
        <p className="body" style={{ marginTop: 8 }}>
          The identity check happens on Stripe&rsquo;s own hosted form. Veyro never receives your
          documents, your bank details or the money &mdash; read{" "}
          <a className="linkbtn" href="https://stripe.com/legal/connect-account" target="_blank" rel="noopener noreferrer">
            Stripe&rsquo;s Connected Account Agreement
          </a>{" "}
          for what you are signing with them. Veyro&rsquo;s own{" "}
          <Link className="linkbtn" href="/terms">terms</Link> and{" "}
          <Link className="linkbtn" href="/privacy">privacy policy</Link> cover what we hold.
        </p>
        <p className="body" style={{ marginTop: 12 }}>
          If you would rather talk to a person first,{" "}
          <Link className="linkbtn" href="/contact">contact us</Link>. A parent who reads all of
          this and still says no was right to, and that is a perfectly good outcome.
        </p>
        <PageNext
          head="Want the uncomfortable version?"
          lead="This page is written to be fair to Veyro. The other one is written to be fair to
            you: every part of this that is untested, unfinished, or weaker than it sounds."
          primary={{ href: "/legal", label: "What is not settled yet" }}
          secondary={{ href: "/contact", label: "Ask a person" }}
          note="You are not committing to anything by reading. A guardian invite needs your
            agreement, and declining is a normal answer the page offers as plainly as accepting."
        />
      </main>

      {/* Was a sticky margin note. See TalkToAPerson.tsx for why it is a
          closeable panel now and why it is not a modal. The href is built
          here so the component stays presentational and the mailto tagging
          rules keep living in lib/support. */}
      <TalkToAPerson
        href={supportMailto({
          audience: "guardian", priority: false,
          subject: "A question before I agree",
        })}
      />
      <ScrollTop />
      <SiteFooter />
    </div>
  );
}

import Link from "next/link";
import type { Metadata } from "next";
import { buildViewport, SITE } from "@/lib/seo";
import { CSS, CSS2 } from "@/app/_ui/css";
import { Wordmark, SkipLink } from "@/app/_ui/marks";
import { SiteFooter } from "@/app/_ui/SiteFooter";
import { MobileNav } from "@/app/_ui/MobileNav";
import { ScrollTop } from "@/app/_ui/ScrollTop";
import { ThemeToggle } from "@/app/_ui/ThemeToggle";
import { GuardianPermissions } from "@/app/_ui/GuardianPermissions";

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

type QA = { q: string; a: React.ReactNode };

const QUESTIONS: QA[] = [
  {
    q: "Is this legal?",
    a: (
      <>
        <p className="body" style={{ marginTop: 0 }}>
          The payment processor&rsquo;s own written policy permits someone aged 13 to 17 to hold a
          connected account when a parent or legal guardian is the verified adult on it. That is
          their guidance, not our reading of it, and it is quoted in full &mdash; named, dated and
          unedited &mdash; on{" "}
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
    a: (
      <>
        <p className="body" style={{ marginTop: 0 }}>
          You are the account owner. That is the honest answer and it is the point: an adult has
          to be the enforceable party, because a contract with a minor is voidable at the
          minor&rsquo;s election. It is you who gets identity-checked, not your child, and the
          account exists in your name.
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
    a: (
      <>
        <p className="body" style={{ marginTop: 0 }}>
          Possibly, and this is the question to take to an accountant rather than to a website.
          Because you are the account owner, tax documentation the processor issues for the
          account is issued against you. That is a real consequence of the arrangement and not something
          to wave away.
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
    a: (
      <>
        <p className="body" style={{ marginTop: 0 }}>
          Yes. You own the account and you can close or freeze it at any time, with the processor
          directly and not through us. Nothing in Veyro can prevent that, and nothing in Veyro is
          designed to.
        </p>
        <p className="body" style={{ marginTop: 12 }}>
          What you do not do is approve each payout. You verify yourself once at setup, and after
          that your child moves their own money without asking. That is deliberate &mdash; a
          parent who has to approve every payment is a parent who becomes a bottleneck, and a
          teenager who needs permission for every pound is not running anything. You keep the
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

      <main id="main" className="wrap-lp longform" style={{ paddingTop: 32, paddingBottom: 56 }}>
        <span className="lp-eyebrow">For parents</span>
        <h1 className="d2" style={{ marginTop: 8, maxWidth: "24ch" }}>
          What you are actually being asked to agree to.
        </h1>
        <p className="lead" style={{ marginTop: 12 }}>
          Your child has probably sent you a link and asked you to approve something. This page
          is the whole of what that means, including the parts that are not finished and the
          parts no lawyer has confirmed. It is not a sales page and there is nothing to buy.
        </p>

        <hr className="rule" style={{ margin: "30px 0" }} />

        {QUESTIONS.map((x, i) => (
          <section key={x.q}>
            <h2 className="h3" style={{ marginTop: i === 0 ? 0 : 36 }}>{x.q}</h2>
            <div style={{ marginTop: 8 }}>{x.a}</div>
          </section>
        ))}

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
      </main>

      <ScrollTop />
      <SiteFooter />
    </div>
  );
}

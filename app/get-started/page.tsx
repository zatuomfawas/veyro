import Link from "next/link";
import { CheckoutPreview } from "@/app/_ui/CheckoutPreview";
import type { Metadata } from "next";
import { buildViewport, SITE } from "@/lib/seo";
import { SkipLink } from "@/app/_ui/marks";
import { SiteFooter } from "@/app/_ui/SiteFooter";
import { SiteReveal } from "@/app/_ui/SiteReveal";
import { SiteNav } from "@/app/_ui/SiteNav";
import { ScrollTop } from "@/app/_ui/ScrollTop";
import { AskYourGuardian } from "./AskYourGuardian";
import { Accordion } from "@/app/_ui/Accordion";

export const viewport = buildViewport();

export const metadata: Metadata = {
  title: "Get started: from your app to your first payment",
  description:
    "The whole path, in order: create an account, get a parent verified, add a product, paste "
    + "the link into your app, get paid. About fifteen minutes, and ten of them are your parent's.",
  alternates: { canonical: SITE + "/get-started" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "Veyro",
    title: "Get started",
    description: "From your app to your first payment, step by step.",
    url: SITE + "/get-started",
  },
};

/** The three phases, by who is holding the work. */
const PHASES = [
  {
    who: "You",
    key: "you",
    time: "2 minutes",
    title: "Make your account",
    d: "Add your name, email, full date of birth and country. Your age and country decide "
      + "which payment route is available.",
  },
  {
    who: "Your guardian",
    key: "parent",
    time: "About 10 minutes, once",
    title: "They get verified",
    d: "They accept your invite and complete Stripe's own identity and bank-account forms. "
      + "Payments stay unavailable until verification is complete.",
  },
  {
    who: "You",
    key: "you",
    time: "A few minutes",
    title: "Add a product, paste the link",
    d: "Set a product name and price, then share its checkout link in your app, site or bio.",
  },
];

/** What the guardian is actually agreeing to, with the honest timings. */
const GUARDIAN_DOES = [
  ["Accepts the invite", "They make their own login, so the agreement is tied to a real adult "
    + "rather than to whoever opened the email. Two minutes."],
  ["Verifies themselves with Stripe", "On Stripe's own hosted form: their name, an ID document, "
    + "and a bank account. Veyro never sees any of it. This is the long part, and it is still "
    + "about ten minutes."],
  ["Gets told what happens", "An email every time you request a payout, and a permanent record. "
    + "They are not asked to approve individual sales, and on this account type nobody can block "
    + "a payout, not them and not us."],
];

const FAQ: [string, React.ReactNode][] = [
  [
    "Does my parent have to do anything after the first ten minutes?",
    <>
      No. The verification happens once. After it, they are the named adult on the payment
      account and they get an email each time you request a payout, which is a notice rather
      than a request to approve. They do not touch your products, your prices or your links.
      The one thing that stays theirs is the payment account itself. Refunds are issued
      from it, and so is anything the provider asks for later.
    </>,
  ],
  [
    "What if my parent says no, or never replies?",
    <>
      Then the account cannot take payments, and there is no way around that: it is the
      part that makes the whole arrangement lawful rather than a workaround. You can send a fresh
      invite whenever you like, and invites last fourteen days. If the hesitation is about what
      they are signing up for, the page written for them answers it in their words, including
      the parts that are not settled:{" "}
      <Link className="linkbtn" href="/for-parents">what you are agreeing to</Link>.
    </>,
  ],
  [
    "Can I embed the checkout inside my own app?",
    <>
      Not the card field. Payment happens on a page Veyro hosts, and that is deliberate rather
      than a gap: card details entered on a page you control are card details you become
      responsible for, and the compliance that follows is not something to hand a fifteen-year-old
      by accident. What does exist is{" "}
      <Link className="linkbtn" href="/docs/sdk">an npm package</Link>: a React component
      that opens the checkout and tells your code when the payment lands, so you can unlock the
      thing or send the file without writing a webhook. The card form itself stays on our page.
    </>,
  ],
  [
    "How long until the money reaches a bank account?",
    <>
      Two separate waits, and it is worth knowing which is which. First the payment clears with
      the processor, usually a couple of days. Then it pays out to the bank account on your
      payment account, on <strong>its own schedule</strong>, typically longer for the first
      payout and shorter after that, varying by country.{" "}
      <Link className="linkbtn" href="/how-it-works">Your wallet</Link> shows which money is still
      settling and which is available, so you are never guessing. Veyro never holds the money and
      cannot speed a payout up, slow one down, or stop one.
    </>,
  ],
  [
    "Can I use this for more than one app?",
    <>
      Yes. One founder account, as many products as you like, each with its own checkout link.
      Two apps can be two products, or one app can sell five things. Every payment lands in the
      same wallet and each row names the product it came from.
    </>,
  ],
  [
    "What happens if a customer wants a refund?",
    <>
      Your guardian issues it from the Stripe dashboard, because that is where the money actually
      sits. The customer gets their money back and the processor keeps its original fee, so a
      refunded sale costs you that fee. Veyro records the refund against the payment and your
      wallet subtracts it, so what you see is what you have. A refunded sale stops counting
      towards the free limit too.
    </>,
  ],
];

export default function GetStarted() {
  return (
    <div className="fw public-page onboarding-page">
      <SkipLink />
      <SiteNav />

      <main id="main">
        <div className="hero-band">
          <div className="wrap-lp gs-hero">
            <div className="gs-hero-grid">
              <div>
                <h1 className="hero-h1">Your first payment, step by step.</h1>
                <p className="hero-lead">
                  Make an account, get your guardian verified, then share a checkout link.
                  Here is what each of you needs to do.
                </p>

                <div className="hero-cta">
                  <Link className="btn btn-lg" href="/check">Check eligibility</Link>
                  <Link className="linkbtn" href="/auth/signup">Create a founder account</Link>
                </div>
              </div>

              <ol className="gs-phases" aria-label="Setup steps and estimated time">
                {PHASES.map((p, i) => (
                  <li className="gs-phase" data-who={p.key} key={p.title}>
                    <span className="gs-phase-n" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                    <div className="gs-phase-h">
                      <h2 className="gs-phase-t">{p.title}</h2>
                      <span className="gs-phase-time">{p.time}</span>
                    </div>
                    <p className="gs-phase-d">{p.d}</p>
                    <span className="gs-phase-who">{p.who}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        <section className="lp ch">
          <div className="wrap-lp">
            <div className="aside-grid">
              <div className="aside-head">
                <h2 className="lp-h2">Start with your guardian.</h2>
                <p className="body" style={{ marginTop: "var(--sp-4)" }}>
                  They will verify their identity with Stripe and take responsibility for
                  the payment account. Help them understand the role before sending your invite.
                </p>
                <p className="small" style={{ marginTop: "var(--sp-4)" }}>
                  <Link className="linkbtn" href="/for-parents">The page written for them</Link>
                  {" · "}
                  <Link className="linkbtn" href="/legal">What is not settled yet</Link>
                </p>
              </div>

              <div>
                <h3 className="h4" style={{ marginTop: 0 }}>What they agree to</h3>
                <div className="reqlist" style={{ marginTop: "var(--sp-4)" }}>
                  {GUARDIAN_DOES.map(([k, v]) => (
                    <div className="reqrow" key={k}>
                      <div>
                        <span className="req-t">{k}</span>
                        <span className="req-d">{v}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <AskYourGuardian />
              </div>
            </div>
          </div>
        </section>

        <section className="lp ch ch-surface">
          <div className="wrap-lp gs-hero-grid">
              <div>
                <h2 className="lp-h2">A checkout ready to share.</h2>
                <p className="body" style={{ marginTop: "var(--sp-4)" }}>
                  Your customer sees your name, product and price on one hosted page.
                  Stripe&rsquo;s card field sends payment details directly to Stripe.
                  They never reach you or Veyro.
                </p>
                <ul className="arrowlist" style={{ marginTop: "var(--sp-5)" }}>
                  <li>Works from a link in a bio, a DM, or a button in your app</li>
                  <li>One checkout link for every product you create</li>
                  <li>Stripe holds the money; Veyro records the payment in your wallet</li>
                </ul>
                <p className="small" style={{ marginTop: "var(--sp-4)" }}>
                  Nothing here to build, style or keep running.
                </p>
              </div>
              <CheckoutPreview />
          </div>
        </section>

        <section className="lp ch">
          <div className="wrap-lp">
            <div className="aside-grid">
              <div className="aside-head">
                <h2 className="lp-h2">Add the link to your app.</h2>
                <p className="body" style={{ marginTop: "var(--sp-4)" }}>
                  There is nothing to install and no key to keep secret. It is a URL, so anything
                  that can hold a link can sell your work.
                </p>
                <p className="small" style={{ marginTop: "var(--sp-4)" }}>
                  Want the button to tell your code when the money lands?{" "}
                  <Link className="linkbtn" href="/docs/sdk">Use the SDK instead</Link>.
                </p>
              </div>

              <div>
                <div className="codecap">
                  <span>Plain HTML</span>
                  <span>A button that goes to checkout</span>
                </div>
                <pre className="code" role="region" aria-label="HTML checkout link example" tabIndex={0}>{`<a
  class="buy"
  href="https://withveyro.com/pay/`}<span className="c">{"{your-id}"}</span>{`/`}<span className="c">{"{product-id}"}</span>{`"
  target="_blank"
  rel="noopener noreferrer"
>
  Buy the template ($12)
</a>`}</pre>

                <p className="small" style={{ marginTop: "var(--sp-4)" }}>
                  Replace the two IDs with your checkout link from the dashboard.
                  Keep <span className="mono">rel=&ldquo;noopener noreferrer&rdquo;</span> when
                  opening a new tab so it cannot access your page through <span className="mono">window.opener</span>.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="lp ch ch-surface">
          <div className="wrap-lp aside-grid">
            <div className="aside-head">
              <h2 className="lp-h2">Before you get started.</h2>
              <p className="body" style={{ marginTop: "var(--sp-4)" }}>
                The guardian&rsquo;s role, refunds and when money reaches the bank.
              </p>
              <p className="small" style={{ marginTop: "var(--sp-5)" }}>
                <Link className="linkbtn" href="/faq">All questions</Link>
              </p>
            </div>
            <div className="public-faq">
              {FAQ.map(([q, a]) => (
                <Accordion key={q} summary={q}>
                  <p className="body">{a}</p>
                </Accordion>
              ))}
            </div>
          </div>
        </section>

        <section className="lp ch public-close">
          <div className="wrap-lp">
            <h2 className="lp-h2">Ready to set up your side?</h2>
            <p className="body" style={{ marginTop: "var(--sp-4)" }}>
              If you are 13 or over and there is an adult who will be the guardian, you can set
              your side up in about five minutes. Send them the message above first, though:
              nothing you build can take a payment until they are verified.
            </p>
            <div className="hero-cta">
              <Link className="btn btn-lg" href="/auth/signup">Create your founder account</Link>
              <Link className="linkbtn" href="/check">Check eligibility</Link>
            </div>
            <p className="small" style={{ marginTop: "var(--sp-5)" }}>
              Free under $100 a month, then 3% of the amount above it. Card processing fees still
              apply.{" "}
              <Link className="linkbtn" href="/pricing">Pricing</Link>
              {" · "}
              <Link className="linkbtn" href="/how-it-works">How the setup works</Link>
            </p>
          </div>
        </section>

      </main>

      <ScrollTop />
      <SiteReveal />
      <SiteFooter />
    </div>
  );
}

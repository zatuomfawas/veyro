import Link from "next/link";
import { CheckoutPreview } from "@/app/_ui/CheckoutPreview";
import { FlowDiagram } from "@/app/_ui/FlowDiagram";
import type { Metadata } from "next";
import { buildViewport, SITE } from "@/lib/seo";
import { CSS, CSS2 } from "@/app/_ui/css";
import { Wordmark, SkipLink, Icon } from "@/app/_ui/marks";
import { SiteFooter } from "@/app/_ui/SiteFooter";
import { MobileNav } from "@/app/_ui/MobileNav";
import { ScrollTop } from "@/app/_ui/ScrollTop";
import { StickyCta } from "@/app/_ui/StickyCta";
import { ThemeToggle } from "@/app/_ui/ThemeToggle";
import { Reveal } from "@/app/_ui/Reveal";
import { AskYourGuardian } from "./AskYourGuardian";

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

/* ------------------------------------------------------------------ *
 * WHY THIS PAGE IS SHAPED THE WAY IT IS
 *
 * It was rebuilt against two sets of measurements rather than taste.
 *
 * THE LAYOUT, measured on the page it replaces:
 *
 *   7,309px tall, and the primary action -- "Create my founder
 *   account", the entire purpose of a page called Get started -- sat at
 *   6,773px. Ninety-three per cent of the way down. A reader had to
 *   finish a 1,626-word document before being offered the thing they
 *   arrived to do.
 *
 *   637px of content inside a 1,432px viewport. The rail took 208 and
 *   the remaining 538px -- 38% of the screen -- was empty, all of it
 *   stacked down one side, so the composition sat off-centre with a
 *   column of nothing beside it.
 *
 *   Body text ran to 77 characters. The design system's own reading
 *   measure is --m-body, 66ch, and it exists because the eye loses the
 *   line on the return sweep past about 75.
 *
 *   Six steps, each heading + paragraph + mock screenshot, in one
 *   unbroken rhythm. Nothing told you which of the six actually
 *   decides whether you get paid.
 *
 * THE FUNNEL, counted from the live database:
 *
 *   6 founders -> 5 verified their email -> 4 invited a guardian ->
 *   2 had one accept -> 1 started the payment form -> 0 finished.
 *
 *   Small numbers, and said plainly as such: six accounts is a
 *   direction, not a statistic. But the direction is unambiguous and it
 *   agrees with what the old page already admitted in prose -- "that is
 *   the part people are surprised by", "it is the step that holds
 *   people up". The guardian is where this stops. Half the founders who
 *   asked never got a yes.
 *
 * SO:
 *
 *   The action is in the hero. Not at 6,773px.
 *   The guardian gets its own section, with the words to ask with --
 *   see AskYourGuardian.tsx. The old page's answer to the step that
 *   kills half the funnel was a sentence saying "ask them early".
 *   Three phases by WHO DOES THE WORK, not six flat steps, because the
 *   handoff is the risk and the old shape hid it.
 *   Full-width landing sections instead of one off-centre column, so
 *   the 538px of nothing carries the previews.
 *   A time budget, because "how long is this going to take" is the
 *   first question anyone has and the old page never answered it.
 *
 * The interface previews are built from the product's own components,
 * never screenshotted: an image goes stale when a button moves, cannot
 * be read aloud or translated, and a real one would mean showing
 * somebody's account. Every figure is invented and every panel says so.
 * ------------------------------------------------------------------ */

const FLOW = [
  { n: "Your app", t: "The link", d: "A normal link or button in whatever you built.", you: true },
  { n: "Veyro", t: "Checkout", d: "A hosted page with the product, price and card form." },
  { n: "The processor", t: "The payment", d: "Takes the card, charges it, holds the money." },
  { n: "Your wallet", t: "The record", d: "Veyro folds the payment into your ledger.", you: true },
];

/** The three phases, by who is holding the work. */
const PHASES = [
  {
    who: "You",
    key: "you",
    time: "2 minutes",
    title: "Make your account",
    d: "Name, email, date of birth, country. The date of birth decides which route is open to "
      + "you; the country decides what the provider will ask your guardian for.",
  },
  {
    who: "Your parent",
    key: "parent",
    time: "About 10 minutes, once",
    title: "They get verified",
    d: "They accept your invite, then fill in the payment provider's own form with their ID and "
      + "a bank account. Nothing can take a payment until this is done.",
  },
  {
    who: "You",
    key: "you",
    time: "A few minutes",
    title: "Add a product, paste the link",
    d: "A name, a price, and you get a checkout link. Put it anywhere a link goes. The money "
      + "lands in the account with your name on the products.",
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
    + "a payout — not them, and not us."],
];

const FAQ: [string, React.ReactNode][] = [
  [
    "Does my parent have to do anything after the first ten minutes?",
    <>
      No. The verification happens once. After it, they are the named adult on the payment
      account and they get an email each time you request a payout, which is a notice rather
      than a request to approve. They do not touch your products, your prices or your links.
      The one thing that stays theirs is the payment account itself &mdash; refunds are issued
      from it, and so is anything the provider asks for later.
    </>,
  ],
  [
    "What if my parent says no, or never replies?",
    <>
      Then the account cannot take payments, and there is no way around that &mdash; it is the
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
      <Link className="linkbtn" href="/docs/sdk">an npm package</Link> &mdash; a React component
      that opens the checkout and tells your code when the payment lands, so you can unlock the
      thing or send the file without writing a webhook. The card form itself stays on our page.
    </>,
  ],
  [
    "How long until the money reaches a bank account?",
    <>
      Two separate waits, and it is worth knowing which is which. First the payment clears with
      the processor, usually a couple of days. Then it pays out to the bank account on your
      payment account, on <strong>its own schedule</strong> &mdash; typically longer for the first
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
      wallet subtracts it, so what you see is what you have &mdash; a refunded sale stops counting
      towards the free limit too.
    </>,
  ],
];

export default function GetStarted() {
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
              <Link className="btn btn-q btn-sm hide-s" href="/for-parents">For parents</Link>
              {/* hide-s, because "Check eligibility" is the longest label in
                  the set and at 375px it pushed the menu button onto a second
                  row -- measured on the live page, so this is an old fault
                  rather than a new one. The mobile menu below already carries
                  it, and the sticky bar carries the primary action, so nothing
                  is lost by dropping it from the bar on a phone. */}
              <Link className="btn btn-sm hide-s" href="/check">Check eligibility</Link>
              <ThemeToggle />
              <MobileNav
                items={[
                  { href: "/how-it-works", label: "How it works" },
                  { href: "/for-parents", label: "For parents" },
                  { href: "/docs/sdk", label: "Docs" },
                  { href: "/faq", label: "Questions" },
                  { href: "/check", label: "Check eligibility" },
                ]}
              />
            </div>
          </nav>
        </div>
      </div>

      <main id="main" className="has-sticky">

        {/* ---------------- hero: the action is here, not at 6,773px --------- */}
        <div className="hero-band">
          <div className="wrap-lp gs-hero">
            <div className="gs-hero-grid">
              <div>
                <p className="hero-kicker">
                  <span className="hero-kicker-dot" aria-hidden="true" />
                  Get started
                </p>
                <h1 className="hero-h1">From your app to your first payment.</h1>
                <p className="hero-lead">
                  About fifteen minutes, and ten of them belong to a parent. The whole path in
                  the order you will actually do it &mdash; including the part that stops most
                  people, which is not the code.
                </p>

                <div className="hero-cta">
                  <Link className="btn btn-lg" href="/auth/signup">Create my founder account</Link>
                  <Link className="btn btn-2 btn-lg" href="/check">Check where I live</Link>
                </div>
              </div>

              {/* The path itself, beside the promise rather than a screen
                  below it. Grouped by who holds the work, because the
                  handoff in the middle is the only part with risk in it. */}
              <ol className="gs-phases">
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

        {/* ---------------- the guardian: the one that decides it ------------
            Its own section, at full width, immediately after the overview and
            before anything about code. On the page this replaces it was step 2
            of 6, drawn identically to "add a product" -- and it is the step
            half the founders here never got past. */}
        <section className="lp ch">
          <div className="wrap-lp">
            <div className="aside-grid">
              <div className="aside-head">
                <span className="lp-eyebrow">The part that decides it</span>
                <h2 className="lp-h2" style={{ marginTop: "var(--sp-2)" }}>
                  Asking your parent is the hard bit. Not the code.
                </h2>
                <p className="body" style={{ marginTop: "var(--sp-4)" }}>
                  Everything else here is filling in a form. This is a conversation, and it is
                  where people stall &mdash; so do it first, before you build the buy button.
                </p>
                <p className="small" style={{ marginTop: "var(--sp-4)" }}>
                  <Link className="linkbtn" href="/for-parents">The page written for them</Link>
                  {" · "}
                  <Link className="linkbtn" href="/legal">What is not settled yet</Link>
                </p>
              </div>

              <div>
                <h3 className="h4" style={{ marginTop: 0 }}>What they are actually agreeing to</h3>
                <div className="reqlist" style={{ marginTop: "var(--sp-4)" }}>
                  {GUARDIAN_DOES.map(([k, v]) => (
                    <div className="reqrow" key={k}>
                      <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
                        <span style={{ color: "var(--pine)", display: "inline-flex", marginTop: 2 }}>
                          <Icon name="check" size={13} />
                        </span>
                        <span>
                          <span className="req-t">{k}</span>
                          <span className="req-d">{v}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <AskYourGuardian />
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- where the money goes ---------------------------- */}
        <section className="lp ch ch-surface">
          <div className="wrap-lp">
            <span className="lp-eyebrow">Where a payment goes</span>
            <h2 className="lp-h2" style={{ marginTop: "var(--sp-2)", maxWidth: "20ch" }}>
              Four stops. The money only ever rests at one.
            </h2>

            <FlowDiagram stops={FLOW} label="Payment flow, in order" style={{ marginTop: "var(--sp-7)" }} />
            <p className="tiny" style={{ marginTop: 12 }}>
              The two outlined in green are the parts you touch. Veyro keeps the record and shows
              you the position; it is never in the path of the money.
            </p>

            <div className="gs-split">
              <div>
                <h3 className="h4" style={{ marginTop: 0 }}>What your customer sees</h3>
                <p className="body" style={{ marginTop: 10 }}>
                  One page: your product name, your price, and a card field. Veyro hosts it and
                  the card field belongs to the processor, so the number goes straight to them.
                </p>
                <ul className="ticks" style={{ marginTop: "var(--sp-4)" }}>
                  <li>Your product name and price, not ours</li>
                  <li>A processor-hosted card field, so the number never reaches you or us</li>
                  <li>Works from a link in a bio, a DM, or a button in your app</li>
                  <li>Your name on it, so a buyer knows who they are paying</li>
                </ul>
                <p className="small" style={{ marginTop: "var(--sp-4)" }}>
                  Nothing here to build, style or keep running.
                </p>
              </div>
              <CheckoutPreview />
            </div>
          </div>
        </section>

        {/* ---------------- the code, for the part that is code -------------- */}
        <section className="lp ch">
          <div className="wrap-lp">
            <div className="aside-grid">
              <div className="aside-head">
                <span className="lp-eyebrow">Your half</span>
                <h2 className="lp-h2" style={{ marginTop: "var(--sp-2)" }}>
                  The integration is a link.
                </h2>
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
                <pre className="code">{`<a
  class="buy"
  href="https://withveyro.com/pay/`}<span className="c">{"{your-id}"}</span>{`/`}<span className="c">{"{product-id}"}</span>{`"
  target="_blank"
  rel="noopener noreferrer"
>
  Buy the template — $12
</a>`}</pre>

                <div className="codecap" style={{ marginTop: "var(--sp-5)" }}>
                  <span>React</span>
                  <span>The same link as a component</span>
                </div>
                <pre className="code"><span className="c">{`// One constant, so a price or a product change is one edit.`}</span>{`
const CHECKOUT = "https://withveyro.com/pay/`}<span className="c">{"{your-id}"}</span>{`/`}<span className="c">{"{product-id}"}</span>{`";

export function BuyButton() {
  return (
    <a href={CHECKOUT} target="_blank" rel="noopener noreferrer" className="buy">
      Buy the template — $12
    </a>
  );
}`}</pre>

                <p className="small" style={{ marginTop: "var(--sp-4)" }}>
                  <strong>rel=&ldquo;noopener noreferrer&rdquo;</strong> is not decoration. Without
                  it the page you open can reach back into yours through{" "}
                  <span className="mono">window.opener</span>. Any link with{" "}
                  <span className="mono">target=&ldquo;_blank&rdquo;</span> should carry it, not
                  just this one.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- questions --------------------------------------- */}
        <section className="lp ch ch-surface">
          <div className="wrap-lp">
            <span className="lp-eyebrow">Before you start</span>
            <h2 className="lp-h2" style={{ marginTop: "var(--sp-2)", maxWidth: "22ch" }}>
              Questions people ask at exactly this point.
            </h2>
            <div className="ruled" style={{ marginTop: "var(--sp-7)" }}>
              {FAQ.map(([q, a]) => (
                <div key={q}>
                  <h3 className="h4" style={{ margin: 0 }}>{q}</h3>
                  <p className="body" style={{ margin: 0, maxWidth: "var(--m-body)" }}>{a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- close ------------------------------------------- */}
        <section className="lp ch ch-9 lp-dark">
          <div className="wrap-lp lp-center">
            <h2 className="lp-h2">Start with the ask, not the code.</h2>
            <p className="body" style={{ marginTop: 14, marginLeft: "auto", marginRight: "auto" }}>
              If you are 13 or over and there is an adult who will be the guardian, you can set
              your side up in about five minutes. Send them the message above first, though
              &mdash; nothing you build can take a payment until they are verified.
            </p>
            <div className="row" style={{ marginTop: 24, gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
              <Link className="btn btn-lg" href="/auth/signup">Create my founder account</Link>
              <Link className="btn btn-2 btn-lg" href="/check">Check where I live</Link>
            </div>
            <p className="tiny" style={{ marginTop: 16 }}>
              Free under $100 a month, then 3% of the amount above it. Card processing fees still
              apply.{" "}
              <Link className="linkbtn" href="/pricing">Pricing</Link>
              {" · "}
              <Link className="linkbtn" href="/how-it-works">How the setup works</Link>
            </p>
          </div>
        </section>

      </main>

      <Reveal
        scope=".fw"
        select="section.lp > .wrap-lp > *"
        stagger=".jn"
      />

      <ScrollTop />
      <StickyCta href="/auth/signup" label="Create my founder account" note="Free. Two minutes." />
      <SiteFooter />
    </div>
  );
}

import Link from "next/link";
import { FlowDiagram } from "@/app/_ui/FlowDiagram";
import type { Metadata } from "next";
import { buildViewport, SITE } from "@/lib/seo";
import { CSS, CSS2 } from "@/app/_ui/css";
import { Wordmark, SkipLink, Icon } from "@/app/_ui/marks";
import { Notice } from "@/app/_ui/form";
import { SiteFooter } from "@/app/_ui/SiteFooter";
import { MobileNav } from "@/app/_ui/MobileNav";
import { ScrollTop } from "@/app/_ui/ScrollTop";
import { StickyCta } from "@/app/_ui/StickyCta";

export const viewport = buildViewport();

export const metadata: Metadata = {
  title: "Get started: from your app to your first payment",
  description:
    "The whole path, in order: create an account, invite a guardian, let them open the payment "
    + "account, add a product, paste the checkout link into your app, get paid.",
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
 * The interface previews below are built from the same components the
 * product uses, not captured as images. Three reasons, and they are the
 * same ones the home page's wallet preview was built this way for:
 *
 *   A screenshot goes stale the first time a button moves, and nothing
 *   in the build would catch it.
 *   Text in an image cannot be read out, selected, translated or scaled.
 *   A real screenshot would have to show somebody's account, so it would
 *   either be a fabricated record dressed as a real one, or a live one.
 *
 * Every figure in them is invented and every panel says so.
 * ------------------------------------------------------------------ */

/** A labelled preview of one screen of the product. */
function Preview({
  title, badge, children,
}: { title: string; badge?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="card" style={{ marginTop: "var(--sp-4)" }}>
      <div className="card-h">
        <span style={{ fontSize: "var(--fs-2)", fontWeight: "var(--fw-med)", color: "var(--ink-3)" }}>
          {title}
        </span>
        {badge ?? <span className="badge b-grey">Example</span>}
      </div>
      <div className="card-b">{children}</div>
    </div>
  );
}

/** One step of the walkthrough. */
function Step({
  n, title, who, children,
}: { n: number; title: string; who: string; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: "var(--sp-8)" }}>
      <div className="row" style={{ gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
        <span className="num" style={{ fontSize: "var(--fs-2)", color: "var(--ink-3)", letterSpacing: "0.06em" }}>
          {String(n).padStart(2, "0")}
        </span>
        <h3 className="h3" style={{ margin: 0 }}>{title}</h3>
        <span className="badge b-slate">{who}</span>
      </div>
      <div style={{ marginTop: "var(--sp-3)" }}>{children}</div>
    </section>
  );
}

const FLOW = [
  { n: "Your app", t: "The link", d: "A normal link or button in whatever you built.", you: true },
  { n: "Veyro", t: "Checkout", d: "A hosted page with the product, price and card form." },
  { n: "Stripe", t: "The payment", d: "Takes the card, charges it, holds the money." },
  { n: "Your wallet", t: "The record", d: "Veyro folds the payment into your ledger.", you: true },
];

const FAQ: [string, React.ReactNode][] = [
  [
    "Can I embed the checkout inside my own app?",
    <>
      Not today. Payments happen on a page Veyro hosts, and the customer leaves your app to reach
      it. That is deliberate for now rather than a gap waiting to be filled: card details entered
      on a page you control are card details you become responsible for, and the compliance that
      follows is not something to hand a fifteen-year-old by accident.{" "}
      <strong>There is no date for an embedded version</strong>, and this page will not promise one
      it cannot keep. A link that opens in a new tab is what exists.
    </>,
  ],
  [
    "How long until the money reaches a bank account?",
    <>
      Two separate waits, and it is worth knowing which is which. First the payment has to clear
      at Stripe, which is usually a couple of days. Then Stripe pays out to the bank account on
      the connected account, on <strong>Stripe&rsquo;s own schedule</strong> — typically longer for
      the first payout on a new account, and shorter after that, varying by country.{" "}
      <Link className="linkbtn" href="/wallet">The wallet</Link> shows which of your money is still
      settling and which is available, so you are never guessing. Veyro never holds the money and
      cannot speed a payout up, slow one down, or stop one.
    </>,
  ],
  [
    "Can I use this for more than one app?",
    <>
      Yes. One founder account, as many products as you like, and each one gets its own checkout
      link. Two apps can be two products, or one app can sell five things. There is no limit on
      how many you create and nothing to set up per app beyond adding the product and copying the
      link. Every payment lands in the same wallet, and each row names the product it came from.
    </>,
  ],
  [
    "What happens if a customer wants a refund?",
    <>
      Your guardian issues it from the Stripe dashboard, because that is where the money actually
      sits. The customer gets their money back and Stripe keeps its original processing fee, so a
      refunded sale costs you that fee.
      {" "}
      <strong>
        Veyro does not record refunds yet, so your wallet will still count a refunded payment as
        earned.
      </strong>{" "}
      Until that ships, Stripe&rsquo;s own dashboard is the accurate figure after any refund. We
      would rather say that plainly than let the number quietly drift.
    </>,
  ],
];

export default function GetStarted() {
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
              <Link className="btn btn-q btn-sm hide-s" href="/wallet">The Wallet</Link>
              <Link className="btn btn-sm" href="/check">Check eligibility</Link>
              <MobileNav
                items={[
                  { href: "/how-it-works", label: "How it works" },
                  { href: "/wallet", label: "The Founder Wallet" },
                  { href: "/for-founders", label: "For founders" },
                  { href: "/for-guardians", label: "For parents" },
                  { href: "/faq", label: "Questions" },
                  { href: "/check", label: "Check eligibility" },
                ]}
              />
            </div>
          </nav>
        </div>
      </div>

      <main id="main" className="wrap-lp has-sticky" style={{ paddingTop: 32 }}>
        <span className="lp-eyebrow">Get started</span>
        <h1 className="lp-h2" style={{ marginTop: "var(--sp-2)" }}>
          From your app to your first payment.
        </h1>
        <p className="lead" style={{ marginTop: 16 }}>
          Say you built a site that sells Notion templates. It works, people want them, and there
          is no way to charge. Here is the whole path from that to money in an account with your
          name on it, in the order you will actually do it.
        </p>

        {/* ---------------- the diagram ---------------- */}
        <h2 className="h3" style={{ marginTop: 40 }}>Where a payment goes</h2>
        <p className="body" style={{ marginTop: 8 }}>
          Four stops. Veyro is the first and the last; the money itself only ever touches Stripe.
        </p>

        {/* Each li carries the list semantics and nothing else: display:contents
            takes its box out of the flex row, so the step and the arrow after it
            become siblings of the other steps and the row lays out evenly. The
            visible box is the div inside. */}
        <FlowDiagram stops={FLOW} label="Payment flow, in order" style={{ marginTop: 20 }} />

        <p className="tiny" style={{ marginTop: 12 }}>
          The two outlined in green are the parts you touch. Veyro keeps the record and shows you
          the position; it is never in the path of the money.
        </p>

        <hr className="rule" style={{ margin: "30px 0" }} />

        {/* ---------------- the walkthrough ---------------- */}
        <h2 className="h3">Doing it, in order</h2>
        <p className="body" style={{ marginTop: 8, maxWidth: "var(--m-body)" }}>
          Steps one and four are yours. Two and three belong to your guardian, and nothing can take
          a payment until they are done — that is the part people are surprised by, so it is worth
          starting the invite early.
        </p>

        <Step n={1} title="Create your founder account" who="You">
          <p className="body" style={{ marginTop: 0 }}>
            Your name, your email, your date of birth and the country you live in. The date of
            birth decides which route is open to you, and the country decides what the payment
            provider will ask your guardian for later. Nothing is shown publicly.
          </p>
          <Preview title="Create your account">
            <div className="reqlist">
              {[
                ["Your name", "Alex Taylor"],
                ["Email address", "alex@example.com"],
                ["Date of birth", "14 March 2010 — fifteen"],
                ["Where do you live?", "United Kingdom"],
              ].map(([k, v]) => (
                <div className="reqrow" key={k}>
                  <div>
                    <span className="req-t">{k}</span>
                    <span className="req-d">{v}</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="tiny" style={{ marginTop: 12, marginBottom: 0 }}>
              You verify the address by clicking a link we email you. Until then you cannot sign in.
            </p>
          </Preview>
        </Step>

        <Step n={2} title="Invite your guardian" who="You">
          <p className="body" style={{ marginTop: 0 }}>
            A parent or guardian, 18 or over. They are the adult the payment provider verifies —
            not the owner of your business, and not somebody who has to approve each sale. Veyro
            emails them a link; it works for fourteen days, and you can send a fresh one whenever.
          </p>
          <Preview title="Your guardian" badge={<span className="badge b-amber">Invited</span>}>
            <div className="reqlist">
              <div className="reqrow">
                <div>
                  <span className="req-t">Waiting for sam@example.com</span>
                  <span className="req-d">
                    Sent today. The link expires in fourteen days. They sign in to their own
                    guardian account to accept, which is what ties the agreement to a real adult.
                  </span>
                </div>
              </div>
            </div>
          </Preview>
        </Step>

        <Step n={3} title="Your guardian opens the payment account" who="Your guardian">
          <p className="body" style={{ marginTop: 0 }}>
            They do this on Stripe&rsquo;s own form, as themselves: their name, their identity
            document, their bank details. You cannot do this part and Veyro will not let you try —
            the whole arrangement depends on the verified adult being the actual adult.
          </p>
          <Preview title="Payments" badge={<span className="badge b-pine">Live</span>}>
            <div className="reqlist">
              {[
                ["Guardian consented", "Sam Taylor agreed and is the adult on the account."],
                ["Identity verified", "Stripe checked Sam's details and accepted them."],
                ["Payouts enabled", "A bank account is attached and payouts are on."],
              ].map(([k, v]) => (
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
          </Preview>
        </Step>

        <Step n={4} title="Add the template as a product" who="You">
          <p className="body" style={{ marginTop: 0 }}>
            A name, a sentence describing it, and a price. The description is what the customer
            reads on the checkout page before paying, so write it for them rather than for you.
            Publishing it gives you a checkout link.
          </p>
          <Preview title="Products" badge={<span className="badge b-pine">Live</span>}>
            <div className="reqlist">
              <div className="reqrow">
                <div>
                  <span className="req-t">Notion Second Brain template &middot; $12.00</span>
                  <span className="req-d">
                    A Notion workspace for notes, tasks and reading, set up and ready to duplicate.
                  </span>
                </div>
              </div>
            </div>
            <p className="tiny" style={{ marginTop: 14, marginBottom: 6 }}>Checkout link</p>
            <div
              className="code"
              style={{ padding: "10px 12px", fontSize: "var(--fs-2)", whiteSpace: "normal", wordBreak: "break-all" }}
            >
              https://withveyro.com/pay/<span className="c">{"{your-id}"}</span>/<span className="c">{"{product-id}"}</span>
            </div>
            <p className="tiny" style={{ marginTop: 8, marginBottom: 0 }}>
              Your real link has the two ids filled in. Copy it from the product row on your
              dashboard rather than typing it.
            </p>
          </Preview>
        </Step>

        <Step n={5} title="Put the link in your app" who="You">
          <p className="body" style={{ marginTop: 0 }}>
            There is nothing to install. It is a URL, so anything that can hold a link can sell
            your template: a button on your site, an anchor in a README, a message to a customer.
          </p>

          <div className="codecap" style={{ marginTop: "var(--sp-4)" }}>
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
    <a
      href={CHECKOUT}
      target="_blank"
      rel="noopener noreferrer"
      className="buy"
    >
      Buy the template — $12
    </a>
  );
}`}</pre>

          <p className="small" style={{ marginTop: "var(--sp-4)", maxWidth: "var(--m-body)" }}>
            Building with React and want a button that tells you when the money lands?{" "}
            <Link className="linkbtn" href="/docs/sdk">Use the SDK instead</Link>.
          </p>

          <p className="small" style={{ marginTop: "var(--sp-4)", maxWidth: "var(--m-body)" }}>
            <strong>rel=&ldquo;noopener noreferrer&rdquo;</strong> is not decoration. Without it the
            page you open can reach back into yours through <span className="mono">window.opener</span>.
            Any link with <span className="mono">target=&ldquo;_blank&rdquo;</span> should carry it,
            not just this one.
          </p>
        </Step>

        <Step n={6} title="Someone buys it" who="Your customer">
          <p className="body" style={{ marginTop: 0 }}>
            They click, land on a page that shows what they are buying and what it costs, and pay
            with a card. The card details go to Stripe&rsquo;s own form — neither you nor Veyro
            ever sees them. The money goes straight to the account in your name.
          </p>
          <Preview title="Your wallet" badge={<span className="badge b-pine">Live</span>}>
            <span
              className="num"
              style={{ fontSize: "clamp(30px, 9vw, var(--fs-9))", fontWeight: "var(--fw-bold)", letterSpacing: "-0.022em" }}
            >
              $12.00
            </span>
            <span className="tiny" style={{ display: "block", marginTop: 4 }}>earned, example figures</span>
            <div className="reqlist" style={{ marginTop: "var(--sp-4)" }}>
              <div className="reqrow">
                <div>
                  <span className="req-t">Notion Second Brain template</span>
                  <span className="req-d">Paid &middot; $12.00 &middot; Stripe fee $0.65</span>
                </div>
              </div>
            </div>
            <p className="tiny" style={{ marginTop: 12, marginBottom: 0 }}>
              Stripe takes its fee before the money reaches your balance, so what you keep is a
              little less than the price. The wallet shows both figures rather than one.
            </p>
          </Preview>
        </Step>

        <hr className="rule" style={{ margin: "34px 0 30px" }} />

        {/* ---------------- FAQ ---------------- */}
        <h2 className="h3">Questions people ask at this point</h2>
        <div className="ruled" style={{ marginTop: 16 }}>
          {FAQ.map(([q, a]) => (
            <div key={q}>
              <h3 className="h4" style={{ margin: 0 }}>{q}</h3>
              <p className="body" style={{ margin: 0, maxWidth: "var(--m-body)" }}>{a}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "var(--sp-6)" }}>
          <Notice tone="grey" head="One thing to sort out before you start">
            Payment setup is your guardian&rsquo;s to do and it needs their identity document and
            bank details. Ask them before you build the buy button, not after — it is the step that
            holds people up.
          </Notice>
        </div>

        <hr className="rule" style={{ margin: "30px 0" }} />

        {/* ---------------- call to action ---------------- */}
        <h2 className="lp-h3" style={{ marginTop: 0 }}>Ready?</h2>
        <p className="body" style={{ marginTop: 10, maxWidth: "var(--m-body)" }}>
          If you are 13 or over and have an adult who will be the guardian on the account, you can
          start now. If you are not sure it is available where you live, the checker answers that
          in two questions and needs no account.
        </p>
        <div className="row" style={{ marginTop: 20, gap: 8, flexWrap: "wrap" }}>
          <Link className="btn btn-lg" href="/auth/signup">Create my founder account</Link>
          <Link className="btn btn-2 btn-lg" href="/check">Check my eligibility first</Link>
        </div>
        <p className="tiny" style={{ marginTop: 12 }}>
          Veyro takes no percentage of what you earn. Stripe&rsquo;s own processing fees still
          apply. <Link className="linkbtn" href="/how-it-works">How the setup works</Link>
        </p>
      </main>

      <ScrollTop />
      <StickyCta label="Create my founder account" note="Free. Two minutes." />
      <SiteFooter />
    </div>
  );
}

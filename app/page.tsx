import Link from "next/link";
import { buildMetadata, buildViewport } from "@/lib/seo";
import { currentUser } from "@/lib/auth";
import { defaultLandingFor } from "@/lib/next-path";
import { CSS, CSS2 } from "@/app/_ui/css";
import { Wordmark, SkipLink } from "@/app/_ui/marks";
import { HeroPreview } from "@/app/_ui/HeroPreview";
import { WalletTabs } from "@/app/_ui/WalletTabs";
import { FlowDiagram } from "@/app/_ui/FlowDiagram";
import { EligibilityInline } from "@/app/check/CheckClient";
import { Reveal } from "@/app/_ui/Reveal";
import { SiteFooter } from "@/app/_ui/SiteFooter";
import { MobileNav } from "@/app/_ui/MobileNav";
import { ScrollTop } from "@/app/_ui/ScrollTop";
import { StickyCta } from "@/app/_ui/StickyCta";
import { FAQ } from "@/app/_ui/faq";

export const metadata = buildMetadata("landing");
export const viewport = buildViewport();

// Server Component. Three islands of client JS and nothing else: the wallet
// tabs, the integration panel and the mobile nav. The section links are plain
// anchors and the FAQ is <details>, so the page still reads end to end with
// JavaScript switched off — only the tabs and the prompt generator need it.
//
// The order is the product's order rather than the argument's. It used to open
// by explaining Stripe's age policy, which answers a question nobody has asked
// yet. What a visitor actually arrives with is "I built something — can I sell
// it?", so the page now answers that first and reaches the eligibility rules
// once they matter.
//
// currentUser() reads the session cookie, which opts this route out of static
// rendering. For anonymous traffic, which is nearly all of it, that costs a
// cookie read and no database query: currentUser() returns null before it
// touches the db.
//
// The Stripe evidence still matters and still exists in full on /how-it-works:
// the verbatim reply, the country grading, and what they would not confirm. It
// is linked from here rather than argued here.

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="disc">
      <summary className="disc-q">
        <span style={{ fontSize: "var(--fs-3)", fontWeight: 500 }}>{q}</span>
        <span className="disc-sign" aria-hidden="true" />
      </summary>
      <p className="disc-a">{children}</p>
    </details>
  );
}

export default async function Home() {
  // A revoked or expired session must still show "Sign in". Hiding it because
  // a stale cookie exists would strand someone who is, in fact, logged out.
  const user = await currentUser();

  return (
    <div className="fw">
      <style>{CSS + CSS2}</style>
      <SkipLink />

      <div className="navbar">
        <div className="wrap-lp">
          <nav className="lp-nav" aria-label="Main">
            <Link href="/" aria-label="Veyro, home"><Wordmark size={20} /></Link>
            <div className="lp-links">
              <Link className="btn btn-q btn-sm hide-s" href="#how">How it works</Link>
              <Link className="btn btn-q btn-sm hide-s" href="#wallet">Founder Wallet</Link>
              <Link className="btn btn-q btn-sm hide-s" href="/for-guardians">For parents</Link>
              {user ? (
                <Link className="btn btn-sm" href={defaultLandingFor(user.role)}>
                  Back to your dashboard
                </Link>
              ) : (
                <>
                  <Link className="btn btn-q btn-sm hide-s" href="/auth/signin">Sign in</Link>
                  <Link className="btn btn-sm" href="/get-started">Get started</Link>
                </>
              )}
              <MobileNav
                items={[
                  { href: "#wallet", label: "Founder Wallet" },
                  { href: "#how", label: "How money moves" },
                  { href: "#connect", label: "Add it to your app" },
                  { href: "#guardian", label: "Your guardian" },
                  { href: "#eligibility", label: "Check eligibility" },
                  { href: "/for-guardians", label: "For parents" },
                  { href: "/how-it-works", label: "What Stripe told us" },
                  { href: "#faq", label: "Questions" },
                  { href: "/auth/signin", label: "Sign in" },
                ]}
              />
            </div>
          </nav>
        </div>
      </div>

      <main id="main" className="has-sticky">
        <div className="hero-band">
          <div className="wrap-lp hero">
            <div className="split-lead hero-grid">
              <div>
                <h1 className="hero-h">
                  <Wordmark hero />
                  <span className="tagline">Your idea. Your app. Your money.</span>
                </h1>

                {/* "Block you at 18" is a compression rather than a claim we
                    cannot stand behind, and the clause after it supplies the
                    context: on your own the bar is majority age, and the
                    guardian route this product arranges is what moves it. The
                    figure further down carries its own qualifier — "with a
                    guardian on the account" — so the two are consistent read
                    together.

                    Where it is not universally true, the page says so within a
                    line: the disclaimer directly below, and the checker as the
                    secondary CTA, which exists precisely to answer "does this
                    apply where I live" and which returns no for Brazil. */}
                <div className="hero-accent" style={{ marginTop: "var(--sp-5)" }}>
                  <p className="lead" style={{ margin: 0 }}>
                    You built something people want. Payment processors block you at 18. Veyro
                    removes that blocker &mdash; add payments to your app, keep your products and
                    business decisions fully yours, and get paid to an account in your name.
                  </p>
                </div>

                {/* Supporting, not the headline. The age rules are why Veyro
                    exists, but they are not what someone arrives wanting to
                    read; the checker two clicks away answers them properly. */}
                <p className="foldwho">
                  Built for young founders. Guardian involvement may be required depending on your
                  setup.
                </p>

                <div className="row" style={{ marginTop: 24, gap: 8, flexWrap: "wrap" }}>
                  <Link className="btn btn-lg" href="/get-started">Get started</Link>
                  <Link className="btn btn-2 btn-lg" href="/check">Check eligibility</Link>
                </div>

                <p className="tiny" style={{ marginTop: 12 }}>
                  The checker takes two questions. No account, no email address.
                </p>

              </div>

              <div>
                <HeroPreview />
                {/* The three numbers were their own chapter directly under the
                    hero, which gave three facts the same weight as the wallet.
                    Folded in here they are what they are: supporting detail
                    beside the product, read after it rather than instead. */}
                <div className="herofacts herofacts-sm" style={{ marginTop: "var(--sp-3)" }}>
                  <div>
                    <span className="hf-n">13</span>
                    <span className="hf-l">Minimum age with a guardian on the account, not 18</span>
                  </div>
                  <div>
                    <span className="hf-n">43</span>
                    <span className="hf-l">Countries the provider supports for self-serve signup</span>
                  </div>
                  <div>
                    <span className="hf-n">0%</span>
                    <span className="hf-l">Veyro&rsquo;s cut. Stripe&rsquo;s own fees still apply</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= 2. what you get ================= */}
        <section className="lp ch ch-2" id="value">
          <div className="wrap-lp">
            {/* Centred head, rail beneath. Three parallel facts have no
                natural left-hand argument to lead them, so the heading sits
                over the middle of the three rather than at the start of the
                first. */}
            <div className="headc">
              <span className="lp-eyebrow">What you get</span>
              <h2 className="lp-h2" style={{ marginTop: "var(--sp-2)", marginBottom: 20 }}>
                Three things that are yours.
              </h2>
            </div>
            <div className="props">
              <div>
                <span className="pr-t">See every payment</span>
                <span className="pr-d">Each sale, each fee, what is settling, what you can draw today.</span>
              </div>
              <div>
                <span className="pr-t">Your account, your login</span>
                <span className="pr-d">Opened in your name. Separate logins, and no guardian can block a payout.</span>
              </div>
              <div>
                <span className="pr-t">No cut</span>
                <span className="pr-d">Veyro takes no percentage. Stripe charges its own processing fees.</span>
              </div>
            </div>
          </div>
        </section>

        {/* ================= 3. the wallet ================= */}
        {/* The chapter the rest of the page is arranged around: its own ground,
            120px top and bottom against its neighbours' 52 and 56, and the only
            place the full money position appears. The hero shows a balance; this
            shows where it came from. */}
        {/* Centred and monumental. The wallet used to sit in the 7fr column
            with a reading column beside it, which made the climax of the page
            the same shape as the four chapters around it. Now the copy sits
            over it, the product takes the optical centre at 920px — wider
            than the 760 it had — and the six states become the supporting
            band underneath rather than a competing column. */}
        <section className="lp ch ch-3 ch-surface" id="wallet">
          <div className="wrap-lp">
            <div className="headc">
              <span className="lp-eyebrow">Founder Wallet</span>
              <h2 className="lp-h2" style={{ marginTop: "var(--sp-2)" }}>
                Know where every dollar is.
              </h2>
              <p className="lp-lead" style={{ marginTop: 16 }}>
                What was collected, what Stripe took, what is settling, what you can draw today
                and what has already been paid out.
              </p>
            </div>

            <div className="stage" style={{ marginTop: 36 }}>
              <WalletTabs />
            </div>

            {/* The six states, restored in an earlier pass and kept: they are
                wallet content and they belong to the wallet. Three columns
                under the product reads as a legend for it. */}
            <dl className="states" style={{ marginTop: 40 }}>
              <div><dt>Earned</dt><dd>A customer paid, and it cleared.</dd></div>
              <div><dt>Still settling</dt><dd>Paid, not yet cleared by the provider.</dd></div>
              <div><dt>Refunded</dt><dd>Sent back to a customer.</dd></div>
              <div><dt>Committed</dt><dd>You have asked for it, so it cannot be spent twice.</dd></div>
              <div><dt>Available</dt><dd>What you can request today.</dd></div>
              <div><dt>Paid out</dt><dd>Already in the bank account on the payment account.</dd></div>
            </dl>

            <p className="small centred-note" style={{ marginTop: 24 }}>
              Every figure is folded from your own payment records each time you look, so no
              stored balance can drift from the payments behind it.{" "}
              <Link className="linkbtn" href="/wallet">How each figure is calculated</Link>
            </p>
          </div>
        </section>

        {/* ================= 4. how money moves ================= */}
        {/* One diagram, replacing three: the old four-step flow, the separate
            "who does what" list, and the process prose. The node captions carry
            what the roles section used to say in paragraphs; the full version
            still lives on /how-it-works. */}
        <section className="lp ch ch-4" id="how">
          <div className="wrap-lp">
            {/* Centred head over a diagram that spans the whole container.
                The five stops are the composition here; the words are a
                caption for them. */}
            <div className="headc" style={{ marginBottom: 28 }}>
              <span className="lp-eyebrow">How money moves</span>
              <h2 className="lp-h2" style={{ marginTop: "var(--sp-2)" }}>
                Five stops, one direction.
              </h2>
              <p className="sec-lead body" style={{ marginTop: 12 }}>
                Veyro is the first stop and the last. The money itself only ever touches Stripe.
              </p>
            </div>

            <FlowDiagram
              label="Where a payment goes, in order"
              stops={[
                { n: "Customer", t: "Pays", d: "On a page with your name and price on it." },
                { n: "Checkout", t: "Veyro's page", d: "You send a link. Nothing to build.", you: true },
                { n: "Stripe", t: "Takes the card", d: "Processes it. Veyro never sees the number." },
                { n: "Your account", t: "Holds the money", d: "In your name, with your guardian verified on it." },
                { n: "Veyro", t: "Records it", d: "Folds it into your ledger. Never in the path of the money.", you: true },
              ]}
            />

            {/* The checkout preview used to sit here. Measured, this chapter
                came to 1251px against the wallet's 715 — the diagram plus a
                second composition outweighed the chapter the page is meant to
                be arranged around. It moved to /get-started, which walks the
                payment path and is where someone asking "what will my customer
                see" actually is. This chapter is one diagram, as intended. */}
            <p className="small centred-note" style={{ marginTop: 24 }}>
              <Link className="linkbtn" href="/get-started">
                What your customer sees at the middle stop
              </Link>
            </p>
          </div>
        </section>

        {/* ================= 5. add it to your app ================= */}
        {/* The lightest thing on the page in weight, if not in height: no
            boxes, no frames, no card. The tool picker, product id field, live
            test and REST reference moved to /docs/sdk, which is the
            integration guide and where a developer is already looking.

            This was a rail of three arrowed labels beside a bordered code
            slab, which measured as chapter 4's flow in the same type at the
            same size one chapter down \u2014 and showed three stops under a
            heading that says two. It is now what the heading says: the two
            calls, each paired with what it does. The buy button the first
            node carried moved into the lead, where it is a precondition
            rather than a step. */}
        <section className="lp ch ch-5 ch-surface" id="connect">
          <div className="wrap-lp offset-r">
            <div>
              <span className="lp-eyebrow">Already built it?</span>
              <h2 className="lp-h2" style={{ marginTop: "var(--sp-2)" }}>Two calls.</h2>
              <p className="sec-lead body" style={{ marginTop: 12, marginBottom: 22 }}>
                Your app does not need rebuilding and there is no package to install. You add a
                buy button; these two calls do the rest.
              </p>
            </div>

            <ol className="calls">
              <li>
                <div>
                  <h3 className="cl-t"><span className="cl-n">1</span>Open a checkout</h3>
                  <p className="cl-d">
                    Veyro hosts the page. Send your customer to the URL it returns.
                  </p>
                </div>
                <pre className="cl-c">{`POST /api/checkout/create
  { "productId": "prod_..." }
  -> { "checkoutUrl": "...", "intentId": "..." }`}</pre>
              </li>
              <li>
                <div>
                  <h3 className="cl-t"><span className="cl-n">2</span>Read the answer</h3>
                  <p className="cl-d">
                    Unlock what you sold once the status comes back completed.
                  </p>
                </div>
                <pre className="cl-c">{`GET /api/checkout/status?intent=...
  -> { "status": "pending" | "completed" | "refunded" }`}</pre>
              </li>
            </ol>

            <p className="small" style={{ marginTop: 20 }}>
              <Link className="linkbtn" href="/docs/sdk">The full integration guide</Link>
              {" \u00b7 "}
              <Link className="linkbtn" href="/get-started">The steps, without the code</Link>
            </p>
          </div>
        </section>

        {/* ================= 6. the guardian ================= */}
        {/* A vertical spine with circular dots, not the horizontal boxes of
            chapter 4 or the unboxed rail of chapter 5. The shape is the point:
            this is who is involved, not a sequence of tasks. .tl was written
            into the stylesheet long ago and never used. */}
        <section className="lp ch ch-6" id="guardian">
          <div className="wrap-lp">
            {/* Centred, with the spine down the middle. Four parties in a
                fixed order is a relationship, and a relationship has no left
                to start from — putting a paragraph beside it made it look
                like a sidebar illustration.

                The spine now follows the heading directly and the explanation
                comes after it. Every other chapter on the page names itself,
                explains itself, then shows the thing; this one shows the
                relationship and then explains it, which is the order the
                hierarchy actually has — and it is the only chapter where the
                visual leads. */}
            <div className="headc" style={{ marginBottom: 34 }}>
              <span className="lp-eyebrow">Your guardian</span>
              <h2 className="lp-h2" style={{ marginTop: "var(--sp-2)" }}>
                An adult on the account, not on your business.
              </h2>
            </div>

            <ol className="tl" aria-label="Who is involved">
                <li>
                  <span className="pt" data-on="1" aria-hidden="true" />
                  <span>
                    <span className="tl-t">You</span>
                    <span className="tl-d">Own the business. Build the products, set the prices, send the links.</span>
                  </span>
                </li>
                <li>
                  <span className="pt" data-on="1" aria-hidden="true" />
                  <span>
                    <span className="tl-t">Veyro</span>
                    <span className="tl-d">Coordinates the setup and keeps your ledger. Never holds the money.</span>
                  </span>
                </li>
                <li>
                  <span className="pt" data-on="1" aria-hidden="true" />
                  <span>
                    <span className="tl-t">Your guardian</span>
                    <span className="tl-d">The verified adult on the account. Notified of every payout, and cannot block one.</span>
                  </span>
                </li>
                <li>
                  <span className="pt" data-on="1" aria-hidden="true" />
                  <span>
                    <span className="tl-t">Stripe</span>
                    <span className="tl-d">Runs the identity checks and settles the money into the account in your name.</span>
                  </span>
                </li>
            </ol>

            <div className="headc" style={{ marginTop: 34 }}>
              {/* marginTop, not margin. The shorthand also zeroed the auto
                  side margins .headc uses to centre its children, and an
                  inline style beats any selector — so this paragraph rendered
                  flush left at x=48 while the heading, the spine and the link
                  above and below it were all centred on 720. */}
              <p className="sec-lead body" style={{ marginTop: 0 }}>
                Under 18 the payment provider requires a verified adult. What they do not get is
                your business: you keep the products, the links and the decisions.
              </p>
              <p className="small" style={{ marginTop: 14 }}>
                <Link className="linkbtn" href="/for-guardians">What a guardian is agreeing to</Link>
              </p>
            </div>
          </div>
        </section>

        {/* ================= 7. eligibility ================= */}
        {/* Isolated on purpose: one question, one form, nothing else in the
            chapter competing with it. Centred and compact, so it reads as an
            object you use rather than a chapter you read — the only thing on
            the page that answers back. */}
        <section className="lp ch ch-7 ch-surface" id="eligibility">
          <div className="wrap-lp">
            <div className="headc" style={{ marginBottom: 28 }}>
              <span className="lp-eyebrow">Before you build around it</span>
              <h2 className="lp-h2" style={{ marginTop: "var(--sp-2)" }}>
                Is Veyro available for you?
              </h2>
              <p className="sec-lead body" style={{ marginTop: 14 }}>
                Two questions, no account and no email address. It tells you when the answer is
                no, and when you do not need Veyro at all.
              </p>
            </div>

            <div className="tool">
              <EligibilityInline />
            </div>

            <p className="small centred-note" style={{ marginTop: 20 }}>
              <Link className="linkbtn" href="/how-it-works">What Stripe told us, quoted in full</Link>
            </p>
          </div>
        </section>

        {/* ================= 8. trust, story, questions ================= */}
        {/* Closing material, and packed like it: six commitments as six lines
            rather than six cards, the story as a quote on open ground, and the
            questions collapsed. The full versions are one link away each. */}
        <section className="lp ch ch-8" id="trust">
          <div className="wrap-lp">
            {/* Heading beside its grid rather than above it. This is the
                page's second left anchor after the hero — without it
                everything from the wallet down is centred, which is the same
                repetition as nine left edges, only symmetrical. */}
            <div className="band-side">
              <div>
                <span className="lp-eyebrow">What Veyro commits to</span>
                <h2 className="lp-h2" style={{ marginTop: "var(--sp-2)" }}>
                  Six things, all checkable.
                </h2>
                <p className="small" style={{ marginTop: 18 }}>
                  <Link className="linkbtn" href="/about">
                    Read all six in detail, and what is not finished yet
                  </Link>
                </p>
              </div>
              <ul className="commits">
              <li><span className="ck-t" aria-hidden="true">&#10003;</span><span>Stripe verifies your guardian, and they cannot block a payout.</span></li>
              <li><span className="ck-t" aria-hidden="true">&#10003;</span><span>The money is never ours. Veyro is not in its path.</span></li>
              <li><span className="ck-t" aria-hidden="true">&#10003;</span><span>We never see your identity documents or bank details.</span></li>
              <li><span className="ck-t" aria-hidden="true">&#10003;</span><span>We take no percentage and charge no platform fee.</span></li>
              <li><span className="ck-t" aria-hidden="true">&#10003;</span><span>The eligibility checker is free and needs no account.</span></li>
              <li><span className="ck-t" aria-hidden="true">&#10003;</span><span>Software, not a bank. No court has tested this route.</span></li>
              </ul>
            </div>

            <hr className="rule" style={{ margin: "56px 0" }} />

            {/* The quote centred on open ground, then the questions in a
                column narrower than anything above them. Two centred blocks,
                but nothing else on the page is 26px type with air around it
                and nothing else is a 640px reading column, so they do not
                read as the same composition twice. */}
            <div className="quote-c">
              <p className="story">
                &ldquo;Building the business was the easy part. Getting the financial
                infrastructure to run it wasn&rsquo;t.&rdquo;
                <span className="story-by">
                  Mike Daniels, who built Veyro after watching his brother hit the same wall.{" "}
                  <Link className="linkbtn" href="/about">The full story</Link>
                </span>
              </p>
            </div>

            {/* id="faq": the mobile menu has linked to #faq since it was
                written, but the target was lost when the page became nine
                chapters, so that item silently did nothing. */}
            <div className="readcol" id="faq" style={{ marginTop: 64 }}>
              <h3 className="h4 centred-note" style={{ marginTop: 0, marginBottom: 16 }}>Questions</h3>
              {FAQ.filter((f) => f.homepage).map((f) => (
                <Faq key={f.q} q={f.q}>{f.a}</Faq>
              ))}
              {/* Five here, nine there. Saying the number gives the link a
                  reason to be clicked rather than being a polite full stop. */}
              <p className="small centred-note" style={{ marginTop: 16 }}>
                <Link className="linkbtn" href="/faq">
                  See all nine questions, with the longer answers
                </Link>
              </p>
            </div>
          </div>
        </section>

        {/* ================= 9. the end ================= */}
        <section className="lp ch ch-9 lp-dark">
          <div className="wrap-lp lp-center">
            <h2 className="lp-h2">You built it. Now make it sellable.</h2>
            <p className="body" style={{ marginTop: 14, marginLeft: "auto", marginRight: "auto" }}>
              Connect what you made, complete the setup with your guardian, and start taking
              payments.
            </p>
            <div className="row" style={{ marginTop: 24, gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
              <Link className="btn btn-lg" href="/get-started">Get started</Link>
            </div>
          </div>
        </section>

      </main>

      {/* Scroll entrances for everything below the hero, which has its own
          CSS entrance. One observer for the page; the selector is here rather
          than inside the component so what moves is readable where it is
          decided. */}
      <Reveal
        scope=".fw"
        select="section.lp > .wrap-lp > *, section.lp .truthgrid > *, section.lp .band-side > *"
        stagger=".props, .commits, .calls, .tl"
      />

      <ScrollTop />
      {/* The checker, not "Get started". The navbar is sticky on a phone and
          already carries "Get started" at every scroll position, so a second
          fixed bar saying the same thing was duplication the whole way down
          the page — and at the foot it put four identical buttons on one
          screen: navbar, the closing CTA, the footer link and this. The bar
          is worth keeping for the action the page keeps offering as the
          lower-commitment one. */}
      <StickyCta note="Two questions. No account, no email address." />
      <SiteFooter />
    </div>
  );
}

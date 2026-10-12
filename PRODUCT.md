# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary: the founder, aged 13 to 17.** Someone who has already built or made
something sellable online — an app, a template, a commission — and has hit the
point where taking money for it requires an adult's account. They arrive with
"I built this, can I sell it?", not with a question about payment
infrastructure. The product exists to win *their* decision: when the founder's
and the guardian's readings conflict, the founder is primary.

**Second: the parent or legal guardian.** The verified adult on the payment
account. They accept or decline consent from their own signed-in account, and it
is their identity Stripe checks, not the founder's. Their control is over the
account itself (close or freeze), plus notification and a permanent record of
every payout. They are a gate the founder has to clear, not a second buyer:
guardian-facing material exists to let the founder through, not to sell the
parent a product.

`ADMIN` exists as a third role in the schema with no dedicated surface.

## Product Purpose

Software that lets an under-18 founder take online payments with a guardian as
the verified adult on a Stripe Connect account. Veyro is not a bank and not a
payment processor, and it never holds anyone's money.

Success, at this stage, is one founder going from "I built something" to a
working checkout link with a verified guardian on the account — without
borrowing a parent's own payment account and watching first sales land in the
middle of a grocery shop.

## Positioning

- **The minimum age is 13, not 18.** Stripe confirmed in writing on 8 September
  2026 that a user aged at least 13 can create a Connect account where the
  required parent or legal guardian involvement is completed through Stripe's
  onboarding before the account accepts charges or receives payouts. Veyro
  publishes that reply verbatim on `/how-it-works`, including the parts Stripe
  would not confirm.
- **The guardian is verified, not merely asked.** Stripe checks the adult's
  identity; the founder, who may be a minor, is not the verified individual.
- **Veyro is never in the path of the money and holds no balance.** The wallet
  is folded from the founder's own records every time it is shown, so it cannot
  drift from them.
- **Veyro never receives identity documents or bank details.** Those are entered
  on Stripe's hosted forms. Veyro stores a reference to the account and nothing
  that could be used to impersonate anyone. Architecture, not a promise of good
  intentions.
- **The eligibility checker says no.** Free, two questions, no account, no email.
  If the country is closed or the person is old enough not to need Veyro, it
  tells them instead of signing them up.
- **It publishes what is unsettled.** Provider policy permitting something is
  not the same as it being tested in law, and `/legal` says so.

A neighbouring product could copy the dashboard. It could not truthfully copy
the 13-plus route with a verified guardian, because that rests on a written
provider reply Veyro obtained and publishes in full.

## Operating Context

- **Eligibility checker** (`/check`): two questions, no auth, no database, no API
  calls. Where country and age get decided.
- **Guardian consent**: the founder invites an adult; the adult signs in as
  themselves and accepts or declines.
- **Stripe Connect Standard onboarding**, completed by the guardian, who becomes
  the verified individual on the account.
- **Founder dashboard**: products, a checkout link per product, a folded wallet,
  payout requests, notifications, annual summary PDF.
- **Guardian dashboard**: consent state, account status, the payout record.
- **`veyro-sdk`** npm package plus `/docs/sdk`, for embedding checkout in the
  founder's own app or site with one product ID and no keys.
- **Public surfaces**: `/`, `/how-it-works`, `/for-parents`, `/for-guardians`,
  `/pricing`, `/faq`, `/legal`, `/terms` (with a dated archive), `/privacy`,
  `/accessibility`, `/status`, `/about`, `/contact`, `/get-started`.
- **Signup reaches 53 countries** (`app/_ui/countries.ts`). Signing up is not the
  same as being able to take payments; the checker decides that. Brazil is in the
  signup list and is excluded from the under-18 route: Stripe named it as the
  exception, where account holders must be 18 or over, guardian or no guardian.

## Capabilities and Constraints

- **Stripe Connect Standard**, which means the connected account controls its own
  payout schedule and **Veyro cannot block a payout**. No veto exists for anyone
  to grant. Copy must never promise guardian approval of individual payouts;
  `COPY-FIXES.md` records every string where it once did.
- **Age floor of 13**, computed from a full date of birth honouring month and
  day. A birth year alone is rejected: the floor is a hard provider requirement
  and cannot be proven without the exact date.
- **Pricing**: nothing below $100 earned in a calendar month, 3% on the amount
  above it, no plan and no subscription. The fee rounds down, always, so a
  fraction of a cent is never charged. It is incremental and ratcheted: refunds
  reduce qualifying monthly earnings for deciding what later payments owe, but
  never claw back a fee already taken. **Fees start 15 October 2026.** Card
  processing fees are charged on top by Stripe, which sets and deducts them.
  The arithmetic lives in `lib/pricing.ts` and the prose figures are rendered
  from it, so a quoted number cannot disagree with the rule.
- **Currency** is formatted from the currency's own minor-unit exponent via
  `Intl`, not from an assumed two decimals. Figures quoted in prose are USD.
- **Stack**: Next.js 16 App Router, React 19, Prisma 7 against Postgres, Stripe,
  Resend for mail, pdfkit for the annual summary, deployed on Vercel. Tests run
  under `node --test` over `scripts/*.test.ts`; `npm run contrast` parses the
  colour tokens and fails on a contrast regression.
- **The legal pages are AI-drafted and not lawyer-reviewed, and say so on the
  page.** That disclosure is not optional and is not a placeholder to be tidied
  away.
- **Open question, unresolved**: whether the founder or the guardian ends up
  holding the Stripe account login and the `individual` record, since whoever
  completes Stripe's onboarding becomes that individual. `COPY-FIXES.md` flags
  it. Until it is confirmed against a live account, copy must not state it
  either way.
- **Open question, scope**: the user expects "more features introducing more
  streamlined processes." Nothing specific is committed. The SDK as a
  first-class developer product, an admin or ops surface for the `ADMIN` role,
  additional processors, and additional markets are all unconfirmed and must not
  be designed for as though they were decided.

## Brand Commitments

- **Veyro**, withveyro.com, hello@withveyro.com. The two role words are
  **founder** and **guardian**, used consistently.
- **Built solo by Moutaz Duwaji.** `/about` says there is no team page because
  there is no team. His first-person account there is quoted voice: it keeps his
  phrasing, including punctuation the house style forbids elsewhere, and is not
  edited to match a style rule.
- **Stripe's quoted reply on `/how-it-works` is verbatim** and is never edited to
  match house style or to read better.
- **Voice**: plain, concrete, and as willing to state what is not true or not
  finished as what is. `/about` carries six commitments, each one checkable
  against the code rather than an intention. `/accessibility` lists what has not
  been tested.
- The visual and copy system is recorded in `DESIGN.md` and is incumbent design
  authority.

## Evidence on Hand

- **Stripe's written reply of 8 September 2026**, quoted in full on
  `/how-it-works` with the country grading and the parts they declined to
  confirm. This is the product's central piece of evidence.
- **Working code as evidence**: the pricing arithmetic with tests, the folded
  wallet derived from records, `/status` naming every dependency and what is
  monitored, `/accessibility` naming the gaps.
- **No users, no sales, no testimonials, no case studies, no press, no
  benchmarks, no traction of any kind.** Veyro is pre-launch. Future work must
  not invent any of these, must not imply a userbase, and must not reach for
  social proof that does not exist. The evidence available is the provider
  reply, the mechanism, and the honesty of the disclosures.
- Brand assets in repo: `app/icon.svg`, `app/apple-icon.tsx`, the `Wordmark`
  component, and OG images generated in code. No photography, no illustration.
- **`public/llms.txt` is stale on pricing.** It states "Veyro takes no
  percentage of transactions", which the 3% fee contradicts. `lib/pricing.ts`,
  `/pricing`, and `/terms` are authoritative.

## Product Principles

1. **The founder decides; the guardian is a gate.** Parent-facing material exists
   to get the founder through it, not to sell the parent.
2. **Never claim a control that does not exist.** On Standard accounts the
   guardian gets visibility and a permanent record, never a veto. A product
   about consent cannot be loose about what consent buys.
3. **No financial state is carried by implication.** Every state a founder or
   guardian needs is written in words, not signalled by colour, position, or
   tone alone.
4. **Publish what is unsettled.** Untested law, untested accessibility,
   unconfirmed account ownership: stated on the page, not buried or softened.
5. **Money truth has one source.** Figures in prose are rendered from the
   function that computes them, so a stale number cannot survive in copy.

## Accessibility & Inclusion

- Target is WCAG 2.2 AA. Contrast is machine-checked: `npm run contrast` reads
  the tokens out of `app/_ui/css.ts` and fails the build on a regression. Touch
  targets are at least 44px at mobile widths.
- One `h1`, one `main` landmark, a skip link first, labelled inputs, errors
  announced with `role="alert"`, every grid collapsing, nothing fixed above
  360px.
- **Stated gaps that future work must not paper over**: no screen reader testing
  (not VoiceOver, NVDA or JAWS), nobody who relies on assistive technology has
  used this, no automated accessibility scan, and Stripe's hosted pages are
  outside Veyro's control.
- The readership includes 13-year-olds and non-technical parents reading about
  money and liability. Plain language is an accessibility requirement here, not
  a stylistic preference.

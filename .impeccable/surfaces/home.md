# Homepage surface brief

**Route:** `/` · **Mode:** Persuade · **Visual authority:** `DESIGN.md`, “The Clear Record”.

The founder should understand what they can sell, see the checkout and payment record, then check their country and age. The primary action remains **Check eligibility** → `/check`, with no account required. This extends the incumbent neutral palette, Onest interface type, Archivo wordmark, square geometry and thin rules.

## Current composition

1. **Hero:** a short product promise and eligibility action, plus **Explore the product** → `#product-demo`. `HeroWallet` pairs an authored “Second Brain” product cover with an explicitly labelled earnings example; its working checkout link leads to the tour.
2. **Product tour:** **Customer checkout** and **Payment record** views beside three practical benefits and the SDK destination. The tour precedes the benefits in DOM order and in the mobile stack.
3. **Setup:** founder account, guardian verification, checkout link; the full sequence links to `/get-started`.
4. **Money and pricing:** the separate business record, Stripe’s processing/funds role, planned allowance and rate, and routes to parent responsibilities and pricing.
5. **Provider evidence:** the exact shared `Q_CORE` quotation, attributed to Stripe Support and dated 8 September 2026. Its visible qualification distinguishes provider guidance from legal approval and links to the complete reply.
6. **Questions:** three shared FAQ disclosures, with routes to the full FAQ, provider evidence and unsettled legal questions.
7. **Closing action:** check country and age. The shared neutral footer follows with actual navigation, support contact and the full processing disclosure.

## Layout and behavior

The outer public container is capped at 1248px with fluid 20–48px gutters. The hero uses a 1.35:1 split and 64px gap. The tour uses a .85:1.15 split with its copy and benefits beside the example. At 980px gaps tighten; at 760px paired content stacks. Main homepage sections use 56px vertical padding on desktop and 48px on mobile; the product tour section uses 56px and 40px respectively. The hero retains its existing 64px/56px desktop and 40px/56px collapsed padding. Section headings remain in the established 32px/28px hierarchy.

The hero follows the page theme. Money/pricing uses the existing black contrast surface; the close uses recessed paper and the footer uses the quieter `surface-2` foundation. Flat boundaries and rules establish hierarchy.

The tour uses native buttons with ARIA tab semantics, linked tab panels, selected state and roving tab stops. Left/Right arrows, Home and End select and focus a tab. The inactive panel is hidden; both panels remain mounted so example sequences do not replay on switching.

`CheckoutPreview` shares live checkout presentation primitives but its card form is an inert illustration with a visible no-payment explanation. `LiveWallet` labels all amounts as invented; hover, focus, click or tap on an arithmetic term reveals its explanation in a polite status region. **View in Stripe** is an external dashboard link, not a payout command. Its example sale progresses once from Received through Settling to Available. Reduced motion settles immediately. Neither example performs a payment or reads account data.

The hero’s example is $12 × 12 sales = $144. Its $1.32 planned Veyro fee comes from the shared arithmetic, with processing fees excluded. Illustrative totals count once using `CountUp`, with final server-rendered and accessible values preserved. Real account balances render directly. Shared FAQ disclosures retain native `details` semantics and reduced-motion handling.

## Constraints and evidence

Preserve the skip link, one main landmark/page heading, named sections, visible focus, explicit example labels and written financial states. Retain the verbatim provider text and legal qualifications. Standard accounts do not give Veyro or guardians a per-payout veto. This surface does not establish payment readiness or accessibility certification.

The owner confirmed on 14 October 2026 that Veyro fees are postponed, with no replacement start date. Planned fee illustrations explain the existing formula; they are not evidence of a charge. Stripe processing fees remain separate.

Source checked: `app/page.tsx`, `app/_ui/{HeroWallet,ProductTour,CheckoutPreview,LiveWallet,CountUp,Accordion,SiteFooter}.tsx`, `app/_ui/{veyro.css,wallet-example.ts,provider-reply.ts}` and `lib/pricing.ts`. The saved `.impeccable/review/professional-final/report.json` records the bounded route, layout and automated accessibility checks; no additional browser review was performed for this documentation pass.

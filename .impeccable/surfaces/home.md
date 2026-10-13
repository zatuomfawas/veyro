# Homepage surface brief

The homepage introduces the actual payment route to a young founder and gives their guardian enough context to continue. Its primary action is **Check eligibility**, pointing to `/check`, with no account needed for that check. It uses the global visual tokens and shared public navigation and footer.

## Implemented composition

1. **Hero:** one clear promise, short supporting copy, eligibility action and a secondary route to `/how-it-works`. One quiet product-earnings example accompanies the copy.
2. **Setup:** three numbered steps: founder account, guardian verification, checkout link. Link to `/get-started` for the full sequence.
3. **Money and pricing:** explain the dashboard record, state Stripe's role, give the shared free allowance and rate, and link to parents and pricing.
4. **Questions:** three shared FAQ entries in native disclosures, plus links to the full FAQ, the provider's reply and the open legal questions.
5. **Closing action:** a brief invitation to check country and age, with the same eligibility destination.

The shared footer follows the five main sections. It supplies real product, company and legal destinations, support contact and the complete processing disclosure.

## Geometry and typography

The public outer container is capped at 1248px and uses the global 20–48px fluid gutters. The hero uses a 1.35:1 column split and 64px gap; paired gaps reduce at 980px and stack at 760px. The hero uses 64px top and 56px bottom padding; the intermediate layout uses 56px, and the collapsed layout uses 40px top and 56px bottom. Main sections use 72px vertical padding on desktop and 48px when collapsed. The closing region uses 56px.

The hero heading caps at 58px, uses 44px at intermediate widths, 40px in the collapsed layout and 36px at narrow mobile widths. Section headings are 32px, reducing to 28px. Leads are 18px, reducing to 16px; reading copy is 16px. Use the established hierarchy rather than adding new heading sizes, category labels or competing actions.

The default hero, setup and questions are light; the hero follows the page theme. Money/pricing and the shared footer use the black contrast surface and existing dark semantic colors; these stay black in dark theme. Recessed neutral paper groups the final action. Thin horizontal and vertical rules do the structural work; no decorative shadow or browser frame belongs in the example.

## Example truth and interactions

The hero shows one illustrative product at **$12.00 × 12 sales = $144.00**, with **$1.32** as the current computed Veyro fee. Its values come from `app/_ui/wallet-example.ts` and `lib/pricing.ts`, and the preview states that Stripe processing fees are excluded. The total counts once when the example enters view, over 920ms with quartic ease-out; the fee stays static. The total is 40px on desktop and 32px at the narrow mobile breakpoint. Width is reserved for the final value, and final server-rendered and accessible text remain correct without JavaScript. Reduced motion shows the final total immediately. Real account balances never count up.

The FAQ uses shared native `details` disclosures enhanced with interruptible measured-height WAAPI motion: 240ms, `cubic-bezier(.2,.8,.2,1)`, immediate settlement for reduced motion and external anchor openings. The menu/theme controls stay functional. Elsewhere, pricing, sharing and integration examples retain useful interactions; the pricing calculator uses the black contrast surface. The guardian setup guide is static and identifies controls as belonging to Stripe. Checkout previews and live checkout reuse the shared content primitives.

## Accessibility and constraints

Use one page heading, named sections, a main landmark and the first-position skip link. Preserve current-page navigation semantics, labelled controls, visible keyboard focus and accessible descriptions. Tables and code that overflow must have labelled, focusable scroll containers. The layout must remain usable at 320px with the primary action and menu visible; reduced-motion mode must retain readable content.

Preserve the full provider and legal disclosures. This surface is not evidence of payment launch readiness or a full accessibility certification. `PRODUCT.md` flags unresolved fee-launch timing drift; this UI overhaul does not correct or select a launch date.

## Sources

`app/page.tsx`, `app/_ui/veyro.css`, `app/_ui/HeroWallet.tsx`, `app/_ui/CountUp.tsx`, `app/_ui/Accordion.tsx`, `app/_ui/SiteNav.tsx`, `app/_ui/SiteFooter.tsx`, `app/_ui/faq.tsx`, `app/_ui/wallet-example.ts` and `lib/pricing.ts`.

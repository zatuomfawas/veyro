# How-it-works surface brief

**Route:** `/how-it-works` · **Mode:** Read · **Visual authority:** `DESIGN.md`, “The Clear Record”.

This compact guide explains practical setup before offering detailed provider evidence. Keep the incumbent identity, source dates, country/age qualifications, account restrictions and legal uncertainty intact.

## Current composition

The introduction states the founder, guardian, Stripe and Veyro roles, with **Check eligibility** and setup-guide actions. The existing six chapter anchors remain, in this reading order:

1. `#setup`: four practical steps, from checking eligibility to following payments and payout requests.
2. `#roles`: the shared role record and the software/provider division of responsibility.
3. `#money`: guardian account controls, an explicitly labelled illustrative wallet and checkout integration routes.
4. `#provider-reply`: a native disclosure containing all five exact provider quotations; the provider-versus-law qualification stays visible outside it.
5. `#countries`: direct country/age qualifications, local differences and the open legal question.
6. `#account-limits`: the Standard-account payout limitation stays open; a separate disclosure carries UAE platform restrictions, guardian verification and the unfinished Accounts v1 migration.

The closing eligibility action follows the chapters. The sticky index has legal context rather than a second eligibility prompt. Scroll progress, scroll-to-top and the shared neutral footer remain.

## Layout and interactions

Desktop uses a 200px sticky index, 56px gap and reading column capped at 780px. At 980px the index becomes 160px with a 32px gap; at 760px it becomes a static two-column list above the article. Chapter rules separate 32px desktop and 24px mobile vertical padding; headings use 26px and 22px. Reading text is 16px with 1.65 leading, bounded by the incumbent reading measure.

**Read the complete quoted reply** identifies all five quotations and their 8 September 2026 date before opening. **Read the integration limits** identifies its technical contents. Both use shared `Accordion` native `details`/`summary`, interruptible measured-height motion and immediate reduced-motion settlement. All quoted text stays server-rendered and comes from `app/_ui/provider-reply.ts`.

The wallet uses actual buttons for five arithmetic explanations, with a polite status region and a written accessible summary. Its invented sale sequence runs once; reduced motion shows the final state. The Stripe link opens the provider dashboard. This demonstration creates no payment, payout request or account balance. Its fee figures illustrate the planned formula: Veyro fee collection is postponed, with no replacement date, as confirmed by the owner on 14 October 2026.

## Constraints and evidence

Guardian consent alone is not completed payment setup. Stripe processes and holds funds; Veyro maintains records. Standard-account settings and transfers remain in Stripe, with no per-sale or per-payout approval supplied by Veyro. A recorded payout request does not confirm a bank transfer. Preserve the visible legal qualification, exact quotations, local availability distinctions and incomplete migration disclosure. The provider check date of 13 September 2026 remains the incumbent page fact, not a new verification.

Source checked: `app/how-it-works/page.tsx`, `app/_ui/{veyro.css,provider-reply.ts}`, and shared `RoleStack`, `GuardianPermissions`, `LiveWallet`, `Accordion`, navigation and footer components. The saved `.impeccable/review/professional-final/report.json` records desktop/mobile native disclosure and five-quotation checks alongside the route/layout review. This documentation pass did not rerun the browser or verify current provider policy.

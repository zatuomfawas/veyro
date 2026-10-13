# Founder dashboard surface brief

The private founder overview reads authenticated, founder-scoped database records. The redesign preserves the existing queries, API mutations, authorization, guardian responsibilities and fee-start logic. Presentation must not invent payment availability, a bank arrival date or a completed setup state.

## Composition and money

The 1320px workspace uses dark founder navigation above a light default account view. When setup is incomplete, the required action appears before the balance. Available funds are primary, in Pine on the page surface; an adjacent black payout overview gives Stripe's actual cadence, payout-enabled status and latest request. It states when timing cannot be read and that an arrival date is unconfirmed.

Money states have separate visible labels: **Still settling**, **Reserved for requests**, **Paid out**. Every amount renders directly from its ledger value, without count-up motion. Currencies remain separate. The main overview uses the greatest-earned currency; the request form uses the greatest-available currency, with explicit context when they differ. The monthly ledger is explicitly USD. A weekly revenue chart appears only for one currency; mixed-currency totals are never combined.

Recent transactions lead the next row, with payout requests and updates beside them. Each transaction names its original currency, paid amount, processing fee, net result and state; missing reported fees stay unknown. Refunds and dispute losses stay visible. The request history distinguishes reserved, approved, sent and failed records.

## Secondary tools and responsive behavior

Shared native `Accordion` disclosures contain integration, revenue/fees, account/setup, payout support and account activity. Existing forms, notifications, reports, disputes and support remain available. Anchors into closed disclosures open and settle them before revealing the target.

The balance/payout split is 1.4:1 with a 32px gap. The balance figure uses `clamp(40px,4vw,56px)` and becomes 38px at 420px. The workspace collapses to one column on mobile; narrow money states become labelled rows. Keep visible keyboard focus and immediate reduced-motion disclosure behavior. These checks provide targeted accessibility evidence, not full certification.

## Sources

`app/dashboard/founder/page.tsx`, `app/dashboard/founder/EarningsHero.tsx`, `app/dashboard/founder/PayoutOverview.tsx`, `app/dashboard/founder/RevealAnchor.tsx`, `app/_ui/Accordion.tsx` and `app/_ui/veyro.css`.

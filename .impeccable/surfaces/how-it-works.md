# How-it-works surface brief

This page explains the implemented guardian payment route as one compact article. Keep provider evidence, account limitations, country/age qualifications and legal uncertainty visible. Its updated/check dates and product claims remain incumbent facts; visual changes do not resolve them.

## Composition

A short introduction leads into six indexed chapters: getting started, roles, Stripe's written reply, country/age limits, account limitations, and money/guardian controls. The desktop layout uses a 200px sticky index, 56px gap and a reading column capped at 780px. At 980px the index narrows to 160px with a 32px gap; at 760px it becomes a static two-column list above the article.

Chapters use thin rules, 32px vertical padding and 26px headings, reducing to 24px padding and 22px headings on mobile. Reading copy is 16px with 1.65 leading. Compact steps, role context, country records and limitations support the prose. Use one illustrative wallet with a clear example label; avoid repeating diagrams or stretching chapters into tall bands.

All five provider quotations come verbatim from the shared `app/_ui/provider-reply.ts` source. Keep the distinction between provider guidance and legal approval, and between guardian consent and completed Stripe payment setup. Standard-account controls stay in Stripe; Veyro records requests and does not promise per-payout guardian approval.

Eligibility actions remain in the public header, introduction and closing article section. The duplicate sticky eligibility prompt is removed. The shared footer follows, retaining its processing disclosure; scroll progress and scroll-to-top controls remain.

## Sources

`app/how-it-works/page.tsx`, `app/_ui/veyro.css`, `app/_ui/provider-reply.ts`, `app/_ui/RoleStack.tsx`, `app/_ui/GuardianPermissions.tsx`, `app/_ui/LiveWallet.tsx`, `app/_ui/SiteNav.tsx` and `app/_ui/SiteFooter.tsx`.

# Public journeys surface brief

**Routes:** `/pricing`, `/for-parents`, `/get-started`, `/auth/signup`, `/auth/signin`, `/check`.

These surfaces extend “The Clear Record” within the incumbent palette, typography, square controls and thin rules. Pricing and the parent decision are Persuade surfaces, setup is Read, and authentication/checking are Operate. Surface changes explain the existing process; APIs, account queries, schema, eligibility rules, payment rules and fee mathematics remain authoritative.

## Pricing

The first view pairs the planned allowance/rate explanation with the calculator. Its labelled exact USD entry, native range and $100/$400/$1,000 presets share one value and call `feeMinor`. Valid exact amounts support cents up to $1,000,000; the range expands for larger entries and preserves cent precision. Invalid entry shows written guidance and empty calculated results. Output distinguishes the planned Veyro fee, earnings after that fee and separate Stripe processing fees, with a polite accessible summary. Without JavaScript, the server-rendered $400 example remains visible.

The local index leads to fee examples, included services and refund/fee timing. The sourced example table precedes the service inventory. The inventory has two ruled groups, **Included at every size** and **In months above $100**, with the latter’s eligibility/availability qualification; they are not plan selectors. The groups stack at 760px. The table has a caption, column headers and a labelled, focusable scroll region.

The owner confirmed on 14 October 2026 that Veyro fees are postponed, with no replacement date. Displayed fee examples describe the planned rule, not a current charge; processing fees still apply separately. The fee formula remains unchanged. Its ratcheted refund rule affects later qualifying earnings without returning fees already incurred when collection operates.

## Parents and guardians

The first view pairs the adult account responsibility with **Before you accept**, covering identity verification, obligations, oversight and the ability to decline. **Understand your role** opens the first indexed section. Four section links cover the role, money/account controls, disputes/refunds and questions before consent.

The role sequence, money flow, shared guardian permissions and dispute boundaries remain directly readable. Four native FAQ disclosures cover legality, liability, tax and stopping the account; each keeps its verdict in the summary, and the legal answer starts open. The page preserves provider-policy-versus-law distinctions and links to the provider agreement, Terms and Privacy. Header and closing account actions target `/auth/signup?role=guardian`.

Stripe receives identity documents and bank details, processes funds and provides account controls. The guardian’s account responsibilities remain explicit. Notifications and records do not imply individual payout approval. The support mail link uses the existing shared address; no message is sent automatically.

## Getting started

The first view pairs three setup phases with a short preflight: eligible country/age, a willing adult and a product name/price. Existing phase times remain estimates. The four-section index leads to guardian preparation, checkout, adding the link and setup questions.

Guardian preparation precedes checkout and keeps the responsibilities visible. **Open a message to send your guardian** is a native disclosure around selectable prose and a clipboard action. Copying changes the button to **Copied** temporarily; clipboard refusal leaves the prose available for manual copying. The message asks for permission to send an invitation and links to the parent page; it does not send an invitation or email.

The shared checkout illustration remains inert and visibly says no payment can be made. The HTML example has a named focusable scroll region; the SDK remains a separate destination. Six native setup FAQ disclosures retain the existing answers. Founder signup and eligibility destinations remain in the closing action. Payments require completed guardian verification and enabled payment setup.

## Signup and sign-in

`AuthShell` uses the shared public header, a single page heading and a flat form panel. Account-switch links sit below the panel. Its 960px desktop composition stacks into the existing 560px maximum at 760px; the signup “What happens next” aside is hidden at that breakpoint so fields come sooner.

Signup begins with a native radio fieldset for Founder or Guardian, followed by own-name/email, password/confirmation and full date-of-birth/country. Name/email and birth-date/country pair on desktop and stack on mobile. `/auth/signup?role=guardian` selects Guardian on the server; users can still choose either role. The written role hint changes with the choice, and an entered birth date is rechecked when the role changes.

Labels, autocomplete, password visibility controls, field descriptions and explicit validation remain. Missing fields are reported together and focus moves to the first one; password mismatch targets confirmation. Busy state names the action. Client checks provide early feedback; the signup API remains the authority for eligibility, guardian age and account creation.

Successful signup goes to `/auth/signin?registered=1`, preserving a validated return path. Its **Your account is created** notice tells the user to verify email before signing in and offers resend; it does not imply an authenticated session. Verified-email, unverified-signin, password-reset and API error states remain written notices. Sign-in preserves safe return-path behavior and the existing role-based landing destination.

## Eligibility checker

The route heading is **Check what applies to you**. A centered native form asks for country, a region where required and birth year. Enter and the submit button use the same form submission. Input changes clear the previous result; the action is unavailable until the estimate can be computed.

Birth year is explicitly an estimate; signup checks a full birth date. Results name the applicable route and limitations, including guardian, adult, too-young, unsupported, preview, extended-network and adult-only outcomes. Secondary **Sources and limits of this result** evidence uses a native disclosure where applicable, while the immediate route qualification remains visible. The broader source explanation and next-step links remain below the tool. The checker is client-side, requires no account/email, calls no API/database and stores nothing entered.

## Shared constraints and checked evidence

Keep the first-position skip link, one page heading/main landmark, visible focus, labelled controls, written status/error feedback and reduced-motion settlement. Public pages use the shared neutral footer and full processing disclosure; authentication remains a focused form frame. No surface should imply a lawyer’s confirmation, guaranteed onboarding duration, guaranteed payout timing, payment availability or a guardian payout veto.

Source checked: the six route pages, `SignupForm`, `SigninForm`, `CheckClient`, `AskYourGuardian`, `PriceCalculator`, `AuthShell`, shared form/accordion/checkout components, `app/_ui/veyro.css` and `lib/pricing.ts`. The saved `.impeccable/review/professional-final/report.json` contains 44 route/theme/width cases at 320, 390, 768 and 1440px, all returning 200, with no recorded runtime errors, page overflow or axe findings. Its interaction records cover the tour and provider reply. These bounded checks are evidence, not accessibility certification or validation of external Stripe behavior; no new browser pass was run for documentation.

---
name: "Veyro"
description: "Clear payment records for young founders and their guardians."
colors:
  paper: "#ffffff"
  surface: "#f7f7f6"
  surface-2: "#eeeeec"
  card: "#ffffff"
  reverse: "#ffffff"
  line: "#e3e3e0"
  line-soft: "#eeeeec"
  line-hover: "#d4d4d1"
  control-line: "#878d92"
  brand: "#111315"
  brand-h: "#2b2f33"
  brand-a: "#000000"
  ink: "#111315"
  ink-2: "#4a4f54"
  ink-3: "#61666b"
  placeholder: "#6b7075"
  pine: "#12513a"
  pine-h: "#0b3a29"
  pine-line: "#acc2ba"
  amber: "#8a5a12"
  amber-line: "#cdb899"
  slate: "#22456b"
  slate-line: "#adbac8"
  clay: "#9c2b22"
  clay-line: "#d5a6a2"
  track-free: "#e4efe9"
  track-rest: "#ececeb"
  select-bg: "#e2e3e3"
  scrim: "rgba(17,19,21,.32)"
  dark-paper: "#0f1113"
  dark-surface: "#16191c"
  dark-surface-2: "#1e2226"
  dark-card: "#14171a"
  dark-reverse: "#0f1113"
  dark-line: "#2a2f34"
  dark-line-soft: "#22262a"
  dark-control-line: "#7b848b"
  dark-brand: "#e8eaec"
  dark-brand-h: "#ffffff"
  dark-ink: "#e8eaec"
  dark-ink-2: "#aab1b7"
  dark-ink-3: "#8c949b"
  dark-pine: "#5fb48f"
  dark-pine-h: "#7cc9a6"
  dark-pine-bg: "#12251e"
  dark-pine-line: "#245040"
  dark-amber: "#d9a441"
  dark-amber-bg: "#2a2112"
  dark-amber-line: "#4f3f19"
  dark-slate: "#83aadb"
  dark-slate-bg: "#15202e"
  dark-slate-line: "#294660"
  dark-clay: "#e39089"
  dark-clay-bg: "#2b1917"
  dark-clay-line: "#5d322c"
typography:
  fs-1:
    fontSize: "12px"
  fs-2:
    fontSize: "13px"
  fs-3:
    fontSize: "14px"
  fs-4:
    fontSize: "16px"
  fs-5:
    fontSize: "18px"
  fs-6:
    fontSize: "22px"
  fs-7:
    fontSize: "26px"
  fs-8:
    fontSize: "32px"
  fs-9:
    fontSize: "44px"
  fs-10:
    fontSize: "56px"
  home-display:
    fontFamily: "Onest, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif"
    fontSize: "clamp(38px, 4.2vw, 58px)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.035em"
  display:
    fontFamily: "Onest, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif"
    fontSize: "clamp(36px, 4vw, 52px)"
    fontWeight: 600
    lineHeight: 1.12
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Onest, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif"
    fontSize: "32px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Onest, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif"
    fontSize: "22px"
    fontWeight: 600
    lineHeight: 1.32
    letterSpacing: "-0.016em"
  body:
    fontFamily: "Onest, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  lead:
    fontFamily: "Onest, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Onest, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.5
  wordmark:
    fontFamily: "Archivo, \"Helvetica Neue\", \"Arial Black\", Helvetica, Arial, sans-serif"
    fontSize: "21px"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.035em"
    fontVariation: "\"wdth\" 118"
rounded:
  square: "0"
spacing:
  sp-1: "4px"
  sp-2: "8px"
  sp-3: "12px"
  sp-4: "16px"
  sp-5: "20px"
  sp-6: "24px"
  sp-7: "32px"
  sp-8: "40px"
  sp-9: "56px"
  sp-10: "72px"
  gutter: "clamp(20px, 4vw, 48px)"
  public-section: "64px"
  public-section-mobile: "48px"
components:
  button-primary:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.reverse}"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    padding: "0 16px"
    height: "38px"
  button-primary-hover:
    backgroundColor: "{colors.brand-h}"
    textColor: "{colors.reverse}"
    rounded: "{rounded.square}"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    padding: "0 16px"
    height: "38px"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.ink-2}"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    padding: "0 16px"
    height: "38px"
  button-danger:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.clay}"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    padding: "0 16px"
    height: "38px"
  button-large:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.reverse}"
    typography: "{typography.body}"
    rounded: "{rounded.square}"
    padding: "0 20px"
    height: "46px"
  input:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    padding: "0 12px"
    height: "38px"
    width: "100%"
  status-badge:
    backgroundColor: "transparent"
    textColor: "{colors.pine}"
    rounded: "{rounded.square}"
    padding: "0 7px"
    height: "20px"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    padding: "20px"
  navigation:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.square}"
    height: "72px"
  hero-wallet:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    padding: "24px 32px"
  guardian-guide:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    padding: "24px"
  pricing-calculator:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.dark-ink}"
    rounded: "{rounded.square}"
    padding: "24px"
---

# Design System: Veyro

## Overview

**Creative North Star: "The Clear Record"**

Veyro uses a plain financial record as its visual model: readable type, square controls, thin rules and deliberate space. White and neutral paper carry the interface; selected black regions establish money and payout context. Meaningful color marks money, action and status without becoming decoration.

The system serves young founders and guardians together. Product explanations feel approachable; account tasks stay direct and legible. Use the shared primitives so public pages, authentication, checkout and dashboards remain recognizably part of the same product.

**Key Characteristics:**

- Onest for interface text; Archivo for the existing wordmark.
- Square controls and surfaces, with thin rules instead of decorative framing.
- Neutral foundations with explicit, named financial states.
- Shared components, responsive layouts and keyboard-visible interaction states.

The implementation source is `app/_ui/veyro.css`; fonts are loaded in `app/layout.tsx`. The root layout imports the native global stylesheet once; pages inherit it instead of injecting CSS strings. Frontmatter records the actual primitives. The `dark-` color entries describe the corresponding overrides in the shared dark theme and contrast surfaces, rather than a second independent palette. The sidecar adds behavior and self-contained component previews. Its synthesized tonal ramps are preview strips, not a new runtime color scale. Surface composition lives in `.impeccable/surfaces/`.

## Colors

The palette is neutral paper with restrained, functional accents.

### Primary

- **Record Ink** (`brand`, `brand-h`, `brand-a`): primary actions and their hover/press states. The dominant action is dark in the light theme and reverses in dark mode.
- **Pine** (`pine`, `pine-h`, `pine-line`): money and positive states, text links, focus, and the incumbent Veyro mark. Its reuse carries a recognizable action and identity role; financial state is always written explicitly.

### Secondary

- **Amber** (`amber`, `amber-line`): attention, limitations and pending information.
- **Slate** (`slate`, `slate-line`): informational account states.
- **Clay** (`clay`, `clay-line`): errors and destructive intent.

### Neutral

- **Paper and Card** (`paper`, `card`): page and panel foundations. A panel earns its boundary from a rule rather than a shadow.
- **Recessed Paper** (`surface`, `surface-2`): grouped regions, secondary states and selected neutral areas.
- **Ink** (`ink`, `ink-2`, `ink-3`): primary, supporting and tertiary text. Placeholder text has its own token.
- **Rules** (`line`, `line-soft`, `line-hover`): dividers and passive surface boundaries.
- **Control Boundary** (`control-line`): input, select and toggle boundaries. Do not substitute the quieter divider token.
- **Reverse, Selection and Scrim** (`reverse`, `select-bg`, `scrim`): reversed text, selected text and modal background separation.
- **Allowance Track** (`track-free`, `track-rest`): the pricing slider's labelled free portion and remaining range.

Dark mode remaps the same roles. Semantic badges gain dark tinted fills; their text and meaning stay explicit. `.contrast-surface`, founder navigation and the payout overview use Record Ink as their background with the existing dark semantic palette and Pine focus indicators. These regions remain black in either theme. The homepage hero follows the page theme; its default presentation is light. Recheck `npm run contrast` after palette changes; that check is targeted evidence, not a claim of full accessibility certification.

**The Written State Rule.** Every financial and account state has a visible label. Color supports the wording; it never replaces it.

## Typography

**Interface Font:** Onest, with the system sans-serif fallback stack in the frontmatter.

**Wordmark Font:** Archivo, with the existing variable width treatment. The mark uses the heavy weight and extended width; neither treatment carries into interface text.

**Code Font:** The system monospace stack for code, integration prompts and compact ordinals.

### Hierarchy

The ten shared size steps run from `fs-1` through `fs-10`. Regular text uses weight 400, labels and controls 500, and headings 600. Wordmark weight 800 is an identity exception. Numeric displays use tabular figures.

- **Home display:** the `home-display` role, capped at 58px on desktop. Intermediate layouts use 44px, the collapsed layout uses 40px, and the narrow mobile heading is 36px. Preserve its balanced, short measure.
- **Supporting public display:** the `display` role, capped at 52px and reduced to 36px at the main mobile collapse.
- **Public section headline:** 32px on desktop and 28px on mobile, with slightly tightened tracking. Application task titles use the shared 32px title and reduce to 26px where their layout requires it.
- **Body and lead:** normal body is 16px; public hero leads use 18px and become 16px on mobile. Supporting content remains 14px where density matters.
- **Labels and metadata:** controls use clear 14px labels; compact supporting metadata uses the 13px and 12px steps. Do not make main reading copy metadata-sized.

Reading measure tokens are tight (34ch), lead (52ch), body (54ch), and wide (62ch). These are layout limits, not a guarantee of a character count with every font. Check the rendered line length before widening prose.

**The One Interface Voice Rule.** Use Onest for headings, prose, labels and numbers. Keep Archivo in the wordmark.

## Layout

Public pages share a centered outer container capped at 1248px, including fluid inline gutters from 20px to 48px. The header, main content and footer align to it. General application wrappers can use 1280px, 1600px for wide account views, 880px for prose and 720px for compact tasks. Authentication uses a 960px two-column composition inside the public frame and a 560px single-column composition when collapsed.

Use the ten spacing steps for component rhythm. Public sections use 64px vertical padding on desktop and 48px on mobile; the homepage uses its documented surface rhythm. Arrange explanatory copy and evidence in simple two-column layouts, with thin rules where related content needs separation.

Founder overview content uses a 1320px wrapper: available funds and payout context come first, followed by transactions and a narrower requests/updates column. Setup action precedes the balance when incomplete. Secondary tools use shared disclosures. The how-it-works guide uses a compact article with a 200px sticky index, 56px gap and 780px reading column; at 760px its index becomes a two-column list above the article. Keep these arrangements in their surface briefs rather than imposing them on unrelated pages.

The main collapse is 760px: navigation becomes a menu, explanatory columns and authentication stack, and section headings reduce. A 980px adjustment reduces wide gaps before collapse; 940px and 900px support existing split and content grids. The 560px and 420px adjustments simplify dense panels and tight layouts. Layouts must remain usable at 320px with the eligibility action and menu visible.

Keep intrinsic widths flexible. Tables and code blocks can scroll inside their own labelled, focusable region rather than forcing the page wide. Use a caption and column headers for tabular records. Coarse-pointer controls use the shared 44px minimum target; the mobile navigation action and menu preserve that minimum.

## Elevation & Depth

Hierarchy comes from spacing, neutral fills, borders and clear text. Buttons have no drop shadow in either rest or hover states. Passive cards, the earnings example, the guardian guide and checkout previews remain flat. Existing clickable card links may use the small shared lift on hover; that exception communicates an actual link. A fixed floating prompt can use the same lift because it sits above document flow.

Zero-blur inset rings are focus, validation or selection boundaries. They remain part of the system and must not be removed by a blanket ban on the `box-shadow` property. Confirmation dialogs use a scrim and solid outlined panel, with no decorative elevation treatment.

**The Flat Record Rule.** Buttons and passive panels have no drop shadow. Use borders, fill changes and spacing to establish hierarchy.

## Shapes

Rectangular controls and surfaces have square corners. Buttons, cards, form controls, notices, dialogs, navigation treatments and the theme switch all follow that geometry. Existing circular timeline or status markers and circles within icons are semantic marks rather than rounded rectangular surfaces.

Borders are thin and deliberate. Use the control boundary for fields; use the quiet line for passive panels and separators. Reuse the existing SVG V and Archivo lockup rather than creating a second logo or drawing replacement browser framing.

## Components

### Buttons

Primary actions are solid Record Ink with reverse text. Secondary actions are paper with a thin rule; quiet actions use transparent backgrounds and neutral text; destructive actions use Clay text and its boundary. Standard, small and large buttons share the same geometry and label weight. Desktop heights are 38px, 30px and 46px respectively; coarse pointers receive the 44px minimum.

Hover changes fill or boundary without a lift. Presses acknowledge immediately; release uses the short shared transition. Busy state keeps a clear text label and a compact marker. Disabled controls use neutral fills and remain visibly different from active controls. Keyboard focus uses the shared offset ring.

### Cards / Containers

Flat outlined rectangles carry product content. Header and footer rules separate related content without creating nested decoration. Standard card bodies use the 20px spacing step; the earnings example uses 24px vertical and 32px horizontal padding, with 24px throughout on narrow mobile; authentication forms use 32px on desktop and 24px when collapsed. A card's appearance alone does not make it clickable.

### Inputs / Fields

Inputs, selects and textareas use white or dark-card fill, the control boundary, square corners and visible labels. Field focus changes to the brand boundary with a zero-blur inset ring. Errors add explicit text and an invalid state, alongside the Clay boundary. Hints and errors are linked through accessible descriptions. Password reveal is a labelled button with a pressed state; Caps Lock feedback appears as text.

### Status Badges / Notices

Compact rectangular badges pair a status label with a semantic text color and boundary. Neutral badges use recessed paper. Notices combine a heading, explanation and optional action; new feedback can use a status announcement. Never use an unlabeled colored dot as the sole account state.

### Navigation / Footer

`SiteNav` supplies the steady, solid public header: Veyro mark, the same product links, account access, a prominent eligibility or contextual action, and the theme control. Active links use current-page semantics. The mobile menu exposes the relevant links, closes on selection, outside focus or Escape, and returns focus to its trigger on Escape. Its scroll height stays within the viewport.

Focused task and dashboard headers retain their distinct labels, destinations and account semantics. `AuthShell` shares the public navigation and aligns its explanation with the form. Avoid replacing task-specific navigation with a generic marketing menu.

`SiteFooter` is navigation and context: actual product, company and legal URLs, the shared support email, and the complete disclosure of Veyro's software role and Stripe's processing role. Its small text remains readable and its mobile links have adequate targets.

### Examples / Checkout

The earnings preview is one visibly labelled sales example. Price and sales produce the total; the fee uses the shared arithmetic and remains static. Only the illustrative total counts once on entering view, over 920ms with quartic ease-out. Its 40px desktop figure becomes 32px on narrow mobile. Reserve the final value's width and keep the final formatted value in server-rendered HTML and accessible text; reduced motion shows it immediately. Real account balances always render directly. The guardian preview is a static guide with numbered setup steps and clear descriptions of controls provided in Stripe. It has no simulated browser chrome or animated completion sequence.

Keep useful interactions in the pricing calculator, share and integration examples, and applicable account demonstrations. The pricing range is a real labelled control with correct server-rendered starting figures. Checkout previews and live checkout share heading, summary and assurance primitives; their card-form behavior remains appropriate to each context. A still preview must visibly explain that no payment is taken.

### Dialogs / Motion

Confirmation dialogs carry a title and dialog semantics, move focus into the panel, contain keyboard focus, make background branches inert, and restore prior focus when dismissed. Escape and backdrop dismissal respect busy state and the configured task behavior. Reuse the shared dialog rather than reproducing only its appearance.

Motion communicates a state change. The shared 110ms and 170ms transitions keep ordinary interactions quick; button presses acknowledge with a 1px downward translation. Shared `Accordion` disclosures retain native `details` semantics and animate measured height with WAAPI over 240ms using `cubic-bezier(.2,.8,.2,1)`. Reversals continue from the presented height; closing keeps native `open` until the visual exit completes and immediately removes closing content from focus. Anchor-triggered openings settle directly. The preview enters over 240ms with `cubic-bezier(.16,1,.3,1)`; the mobile menu enters over 150ms. Reduced motion removes these movements, settles disclosures immediately and retains final readable values. Keep the guardian guide static and real account values free of counting motion.

## Do's and Don'ts

### Do:

- **Do** reuse the shared buttons, fields, notices, navigation, footer and checkout content primitives.
- **Do** use the established type and spacing scales, with the documented responsive heading exceptions.
- **Do** keep money figures tabular, examples visibly labelled and fees derived from the shared calculation.
- **Do** render real account balances immediately and keep currencies separate in revenue, fee and payout records.
- **Do** preserve real link destinations, guardian-role wording and full product disclosures.
- **Do** retain labelled controls, visible focus, keyboard access to scroll regions and reduced-motion behavior.
- **Do** test new layouts at 320px and at the main 760px collapse, including open menus and long content.

### Don't:

- **Don't** add rounded rectangles, decorative gradients, blurred ornaments or simulated browser chrome to explanatory panels.
- **Don't** give buttons or passive panels a lift, scale animation or drop shadow.
- **Don't** duplicate a heading with a category label above it unless that label adds a distinct navigation or structural meaning.
- **Don't** present example account controls as live actions, or remove useful calculator and share interactions while simplifying their appearance.
- **Don't** invent testimonials, activity, payment availability or a launch-ready state.
- **Don't** treat this design document as a replacement for product facts. The fee-launch drift remains an unresolved issue in PRODUCT.md.

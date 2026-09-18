# Veyro design system

The system lives in `app/_ui/css.ts` as two exported strings (`CSS`, `CSS2`),
injected by each page inside a `.fw` wrapper. This file records the decisions
behind it so they get referenced rather than reinvented.

Everything here is already true of the code. If you change one, change it here
too.

---

## Typefaces

**Archivo** for display, **Onest** for interface text. Both are loaded by
`next/font/google` in `app/layout.tsx`, which downloads them at build time and
serves them from our own origin.

Why these two:

- **Archivo** has a real variable width axis. The wordmark stretches to 118%
  (`--display-wdth`), and a variable axis is the only way to do that without
  scaling glyphs and distorting the strokes. It is used for the wordmark and
  nothing else. Never for interface text.
- **Onest** is a plain, high-x-height workhorse that stays readable at 11.5px,
  the smallest step in the type scale. It does not compete with the display face.

Why not the obvious ones: Inter, Geist and Space Grotesk are the default picks
and read as such. Archivo and Onest are well-made, freely licensed, and
distinctive without being decorative.

**Never load fonts with `@import` from a CDN.** That is what this codebase used
to do, inside the injected `<style>` block. Two problems: an `@import` is only
honoured at the top of a stylesheet, so a browser was entitled to ignore it
where it sat; and when it did work, first paint waited on a third-party request
that can be slow, blocked, or unreachable, with no signal. The page would
silently render in Arial.

`--ui` still names **Haffer** first. Haffer is the intended primary and is
commercially licensed; Onest is the implemented stand-in. Licensing it is a
change to that one line.

---

## Scale

**Type.** Ten steps, `--fs-1` (11.5px) to `--fs-10` (56px). Nothing between
them. Three weights only: 400 reads, 500 labels, 600 headings.

**Spacing.** `--sp-1` to `--sp-10`: 4, 8, 12, 16, 20, 24, 32, 40, 56, 72.

Every margin, padding and gap traces to one of those, inline styles included.
There are no 10s, 14s, 18s or 22s. If a value feels like it wants to be 18, it
is 16 or 20.

Page-level rhythm is separate and deliberately larger: `--lp-pad-lg/md/sm`
(104/72/48) for landing sections, and section padding above 72px is allowed to
sit outside the component scale.

**Measure.** Four line lengths, chosen once: `--m-tight` 34ch, `--m-lead` 52ch,
`--m-body` 66ch, `--m-wide` 76ch.

**Containers.** `--lp-max` 1200px for marketing, `.wrap-w` 1400px for
dashboards, `.wrap-n` 768px for prose, `.wrap-s` 560px for auth. Gutter is
`--lp-gut`, 32px, dropping to 18px then 14px at the narrow breakpoints.

---

## Colour

The background is never pure white. `--paper` (#f2f0ea) is the page,
`--card` (#faf9f5) is raised surfaces, `--surface` and `--surface-2` are recessed
ones. This is consistent across every page, marketing and application alike.

- Brand `#1e4636`, hover `#2a5c48`
- Ink `#191814`, with `--ink-2` and `--ink-3` for secondary and tertiary text
- Status families, each with a text colour and a line colour: pine (good),
  amber (attention), clay (bad), slate (informational), grey (neutral)

No pastels. No gradients of any kind. No coloured left-border stripe on cards.

---

## Rules that do not bend

**Border radius is 0.** `--radius: 0`. The only exceptions are three uses of
`border-radius: 50%`, which are circles by definition: the radio tick in
`.choice`, and the timeline dot in `.tl .pt`. A circle is not a rounded
rectangle. Nothing else gets a radius, including anything pasted in from a
component library.

**No drop shadows.** Elevation is a border or a fill change, never blur.

There are five `box-shadow` declarations and all five are `inset` with **zero
blur radius**. They are borders drawn inside the element's box, used where a
real border would shift layout:

- `.ta:focus`, `.ta.bad` — the focus and error ring on a textarea
- `.choice[data-on="1"]`, `.hpanel-on`, `.frame-rail button[data-on="1"]` —
  selected state
- `.stagebar button[data-on="1"]` — a 3px top rule on the active tab

Two of those are **visible focus indicators**. Removing them to satisfy a
"no box-shadow" rule read literally would be an accessibility regression. The
rule is *no drop shadows*, not *no use of the property*.

**Touch targets are at least 44px** at mobile widths (`--tap`). WCAG 2.2 AA
asks for 24px; 44px is the size a thumb actually hits.

---

## Patterns that are forbidden

These are the things that make a site read as machine-generated. None of them
are in the codebase and none should arrive:

- Bento grid layouts
- Terminal or code-window decoration
- Radial gradient orbs, blurred colour blobs
- Dot-grid or graph-paper backgrounds
- Sparkle or star icons as ornament
- Animated arrows: bouncing, pulsing, drifting
- Checkmark bullet lists (`✓ Feature one`). Write prose, or use `.arrowlist`
- Soft or large radius on cards and buttons
- Skeleton shimmer loaders. Use a plain, honest loading state
- Hover states that scale, rotate or add shadow. A hover is a background or
  border change, nothing else
- **Em dashes in user-facing copy.** Use the punctuation the sentence needs: a
  period for two statements, a comma for an aside, a colon where the second half
  explains the first, parentheses for a true parenthetical. Code comments are
  exempt, they are not copy.

  **One further exemption: quoted human voice.** The rule governs text written
  in the product's voice. It does not govern someone's own words. The founder's
  account on `/about` keeps its em dash because that is his phrasing and his
  rhythm, quoted as given, and flattening a person's sentence to satisfy a
  house style is not a style fix. The same goes for the verbatim Stripe quotes
  on `/how-it-works`: never edit quoted material to match this document. Both
  places carry a comment saying so, because a find-and-replace pass will not
  read this file.

---

## Components

`app/_ui/form.tsx` holds `Btn`, `Field` and `Notice`. `app/_ui/marks.tsx` holds
`Icon`, `Wordmark` and `SkipLink`. `app/_ui/dash.tsx` holds the signed-in
furniture: `DashNav`, `DashHeader`, `Section`, `EmptyState`, plus one shared
`fmtDate` so dates read the same everywhere.

Use them. A second button implementation is how a design system dies.

Layout blocks available and already styled: `card` / `card-h` / `card-b` /
`card-f`, `tbl` inside `tblwrap`, `badge` with `b-*` tones, `statusblock`,
`reqlist` / `reqrow`, `grid-2`, `grid-4`, `truthgrid`, `trustgrid`, `herofacts`,
`journey`, `numbered`, `disc`, `hero-band`, `split-lead`.

---

## Responsive

Breakpoints, in the order they apply: 940 (hero splits), 900 (two-column
explanatory grids), 760 (the main collapse: `grid-2`, `grid-4`, `herofacts`,
`numbered`, nav links hide), 560, 420 (tightest gutters).

Tables always sit inside `.tblwrap`, which scrolls horizontally rather than
breaking the page. Nothing carries a fixed `min-width` above 360px.

// The Veyro design system, verbatim from prototype/veyro.jsx (its CSS + CSS2
// blocks). Shared by every page so the stylesheet exists once, not once per
// route.
//
// The custom properties are scoped to `.fw`, not `:root`, so that class has to
// wrap any page using them or every token resolves to nothing. Zero border
// radius (--radius:0) is deliberate; don't "fix" it.
//
// Typefaces are NOT loaded here. Archivo and Onest come from next/font in
// app/layout.tsx, which self-hosts them at build time; --display and --ui read
// the variables it sets. An @import of fonts.googleapis.com used to sit at the
// top of this string, which was both unreliable (an @import in an injected
// <style> block may be ignored) and a silent third-party dependency on first
// paint. See DESIGN.md.

export const CSS = `

.fw, .fw *, .fw *::before, .fw *::after { box-sizing: border-box; }
/* Safety net: no single long word, email or URL may widen the page. Acts only
   when a word would overflow its box, so ordinary prose is unaffected. */
.fw { overflow-wrap: break-word; }
/* Visible to a screen reader, not to the eye. The clip-path/1px pattern is
   used rather than display:none, which removes the text from the
   accessibility tree entirely, or a negative text-indent, which some
   screen readers skip. */
.fw .sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px;
  overflow:hidden; clip-path:inset(50%); white-space:nowrap; border:0; }
.fw {
  /* ---- Type scale: 10 steps, nothing between them ---- */
  --fs-1:11.5px; --fs-2:12.5px; --fs-3:14px;  --fs-4:15.5px; --fs-5:17px;
  --fs-6:20px;   --fs-7:24px;   --fs-8:30px;  --fs-9:44px;   --fs-10:56px;
  /* ---- Weight: three only. 400 reads, 500 labels, 600 headings ---- */
  --fw-reg:400; --fw-med:500; --fw-bold:600;
  /* ---- Line height ---- */
  --lh-tight:1.14; --lh-snug:1.35; --lh-body:1.6;
  /* ---- Spacing: 4px base, 10 steps ---- */
  --sp-1:4px;  --sp-2:8px;  --sp-3:12px; --sp-4:16px; --sp-5:20px;
  --sp-6:24px; --sp-7:32px; --sp-8:40px; --sp-9:56px; --sp-10:72px;
  /* ---- Control heights ---- */
  --h-sm:30px; --h-md:38px; --h-lg:46px;
  /* ---- Borders and focus. No radius anywhere by decision ---- */
  --bw:1px; --radius:0; --focus-w:2px; --focus-offset:2px;
  /* ---- Touch target floor. WCAG 2.2 AA minimum is 24px; 44px is the usable target ---- */
  --tap:44px; --marker:7px;
  --nav-h:62px;
  /* Line length. Four measures, chosen once */
  --m-tight:34ch; --m-lead:52ch; --m-body:66ch; --m-wide:76ch;
  /* Layout: one asymmetric split, used everywhere a section has two parts */
  --split-a:minmax(0,5fr); --split-b:minmax(0,7fr);

  --paper:#ffffff; --surface:#f7f7f6; --surface-2:#eeeeec;
  /* --card is the raised content surface. On a white page it cannot be lighter
     than --paper, so it matches it and every .card earns its edge from --line
     instead. The alternating landing sections that used to rely on card being
     lighter than paper now use --surface. */
  --card:#ffffff; --reverse:#ffffff;
  /* The colour the sticky nav takes once the page has scrolled under it.
     Translucent, because the blur behind it is the point; a token, because
     it was a literal white and the nav went on turning white in dark mode
     the moment anyone scrolled. It is --paper with the alpha applied. */
  --nav-veil:rgba(255,255,255,.88);
  /* The highlight that sweeps a loading block. White works on a light
     skeleton and flashes on a dark one, so it is a token: the sweep is a
     suggestion of movement, not a light source. */
  /* A skeleton block is the opposite of the surface it sits on, not a
     slightly different shade of it. --surface-2 put it at 1.16:1 against
     the page, which is a block you cannot see -- the shape of the page was
     being drawn in a colour nobody could read. Dark on light here, light on
     dark below, at the same strength both ways so the wait looks the same
     whichever theme you are in. */
  --skel-block:#7c8287;
  --skel-sheen:rgba(255,255,255,.45);
  /* Interaction states. These were literals, and a literal cannot invert:
     pressed-black stays black when the button itself has gone white, and a
     pale selection stays pale when the text on it has gone light. Measured
     in dark before this existed: 1.11:1 on a pressed button, 1.07:1 on
     selected text. Both are "the label disappears while you touch it". */
  --brand-a:#000000;
  --clay-a:#f3e6e4;
  --line-hover:#d4d4d1;
  --select-bg:#e2e3e3;
  /* The dimming behind a modal. On a white page a light scrim is enough to
     push the page back; on a dark one the same scrim has almost nothing to
     darken, so dark asks for more of it. */
  --scrim:rgba(17,19,21,.32);
  --line:#e3e3e0; --line-soft:#eeeeec;
  /* Dividers are decorative, so --line may stay quiet. An input border is a UI
     component boundary and WCAG 1.4.11 wants 3:1 for it; --line measured
     1.29:1 on white, so controls get their own token. #878d92 is 3.36:1 on
     --paper and 3.13:1 on --surface, the two grounds inputs sit on. */
  --control-line:#878d92;
  /* Black, not green. Green now means settled money and nothing else, so it
     never appears on a button, a focus ring or the wordmark. */
  --brand:#111315; --brand-h:#2b2f33;
  /* --ink-3 is the quietest text in the system and --surface-2 the darkest
     ground it lands on, so that pair sets the floor. It measures 4.99:1 there,
     clearing WCAG AA's 4.5:1 with room; every other text pair is higher. Do
     not lighten these without re-running the measurement. See DESIGN.md. */
  --ink:#111315; --ink-2:#4a4f54; --ink-3:#61666b;
  /* One step quieter than --ink-3, because a placeholder is a hint and
     should not read as a filled value. It is a token rather than a literal
     so it can invert with the theme: in dark, "quieter" means darker, and
     there is no room below --ink-3 there, so dark simply uses --ink-3. */
  --placeholder:#6b7075;
  --pine:#12513a; --pine-h:#0b3a29; --pine-bg:transparent; --pine-line:#acc2ba;
  --amber:#8a5a12; --amber-bg:transparent; --amber-line:#cdb899;
  --slate:#22456b; --slate-bg:transparent; --slate-line:#adbac8;
  --clay:#9c2b22; --clay-bg:transparent; --clay-line:#d5a6a2;
  /* Display face, wordmark only. Never for interface text. */
  --display: var(--font-archivo), "Archivo", "Helvetica Neue", "Arial Black", Helvetica, Arial, sans-serif;
  --display-wdth: 118%; --display-wght: 800;
  /* Logotype scale. Deliberately separate from the UI type scale */
  --wm-lg:72px; --wm-md:52px; --wm-sm:38px; --wm-nav:20px;
  /* Kern pair for V + e. The V's box edge is 0.097em wider than its ink at
     x-height, so this pulls the following letter into that wedge. One number. */
  --wm-kern:-0.085em;
  /* Landing only. The application keeps the smaller dashboard scale. */
  --lp-1:64px; --lp-2:44px; --lp-3:26px; --lp-lead:19px;
  --lp-gut:32px; --lp-max:1600px;
  /* Section rhythm and the tail a page leaves under itself, as tokens so a
     full-bleed closing band can cancel the tail exactly rather than
     guessing at it.
     72px, not the 48px it was: eleven sections at 48 read as one continuous
     column of text, and the hairline between them did all the separating. */
  --lp-pad:72px; --tail:56px;
  /* One gutter, fluid. 16px on a small phone, growing to 48px on a wide
     desktop. Replaces four hand-written padding values that each needed
     their own breakpoint. */
  --gut: clamp(16px, 4vw, 48px);
  --lp-pad-lg:104px; --lp-pad-md:72px; --lp-pad-sm:48px;
  /* Haffer (Displaay) is the intended primary. Its files are commercially
     licensed and unavailable here, so Onest is the implemented fallback, per the
     brief. Swapping Haffer in is a change to this one line. */
  --ui: var(--font-onest), "Onest", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  /* Code only. Not loaded over the network: every face here ships with an OS,
     so a snippet costs no request and cannot flash an unstyled fallback. */
  --code: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
  /* One family. Everything below is the same typeface at a different size or weight. */
  font-family: var(--ui);
  color: var(--ink);
  background: var(--paper);
  -webkit-font-smoothing: antialiased;
  font-size:var(--fs-3);
  line-height: 1.5;
  font-variant-numeric: tabular-nums;
  text-rendering: optimizeLegibility;
}
/* Selected text was the browser's default blue, the one colour on the page
   from outside this palette — and it shows up constantly here, because people
   select amounts, account ids and invite links to copy them. */
.fw ::selection { background:var(--select-bg); color:var(--ink); }
.fw button, .fw input, .fw select, .fw textarea { font: inherit; color: inherit; }
.fw a { color: inherit; text-decoration: none; }
/* Focus is pine. On the dark band .lp-dark overrides it back to white a few
   hundred lines below, and must keep doing so: pine on --ink measures 2.01:1,
   under the 3:1 a focus indicator has to clear, so a green ring there would be
   a ring only sighted users in good light could find. */
.fw :focus-visible { outline:2px solid var(--pine); outline-offset:2px; border-radius:0; }
.fw .page-h { padding-bottom:2px; }
.fw .page-h .d2 + .small { margin-top:5px; }
.fw .rail-sec { padding:16px 8px 6px; font-size:var(--fs-1); color:var(--ink-3); }
/* Motion.
   One curve and two durations, so everything moves as though one hand drew it.
   The curve is a standard decelerate: quick to start, easing into place, which
   is what makes a change read as settling rather than stopping.

   --t-1 is for a control answering you — a hover, a focus ring, a pressed
   segment. 110ms is under the threshold where a transition starts to feel like
   a delay, which is the point: it should read as the control responding, not
   as an animation playing.

   --t-2 is for something arriving or leaving: a panel opening, a message
   appearing. A larger change needs longer or it snaps, but past about 200ms it
   starts to feel like waiting.

   Inside the product nothing animates on page load and nothing moves that was
   not asked to move. This is an interface for looking at money, and motion
   nobody triggered reads as instability. Motion that answers a click is the
   opposite: it says the click landed. --t stays as the shorthand the controls
   already use.

   The landing page is a different room. There, content arriving as you reach
   it is the convention rather than a surprise, and it is doing a job: it paces
   a long page and points at what to read next. Those are --t-3 and --t-4 on
   --ease-out, a decelerate that travels further before settling, which is what
   makes a larger movement read as deliberate rather than merely slow. They are
   used only on .lp sections and the hero. Nothing in the dashboard touches
   them, and every one of them is off under prefers-reduced-motion. */
.fw {
  --ease: cubic-bezier(.4, 0, .2, 1);
  --t-1: 110ms;
  --t-2: 170ms;
  --t: var(--t-1) var(--ease);

  /* Landing only. Entrances and the larger product transitions. */
  --ease-out: cubic-bezier(.22, 1, .36, 1);
  --t-3: 320ms;
  --t-4: 560ms;
  /* How far a revealed element travels. One number, so every entrance on the
     page agrees. */
  --rise: 14px;
  /* The only blurred shadow in the system, and it exists to answer a pointer
     rather than to decorate a resting state. Nothing wears it until it is
     hovered. See DESIGN.md. */
  --lift: 0 1px 2px rgba(17,19,21,.06), 0 4px 12px rgba(17,19,21,.07);
}
.fw .btn, .fw .linkbtn, .fw .input, .fw .select, .fw .ta,
.fw .choice, .fw .tick, .fw .tick::after, .fw a.card, .fw .mobmenu {
  transition: background-color var(--t), border-color var(--t), color var(--t), box-shadow var(--t);
}
/* The only motion in the product otherwise is scroll, handled in JS via
   scrollBehavior(). This is the belt-and-braces version for the browser. */
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior:auto !important; }
  .fw *, .fw *::before, .fw *::after { transition-duration:0ms !important; animation-duration:0ms !important; }
  /* Duration 0 alone would leave a revealed element sitting at its start
     transform forever, which is how "reduced motion" turns into "invisible
     content". Everything is placed and opaque instead. */
  .fw [data-reveal] { opacity:1 !important; transform:none !important; }
}

/* ---- the hero's entrance -------------------------------------------------
   CSS, not the observer, and deliberately so. A load entrance driven by
   JavaScript means the first thing anyone sees is hidden until hydration
   finishes — the page paying for its own animation. A keyframe runs from the
   first paint, costs no script, and cannot leave the headline invisible if
   something further down the bundle throws.

   animation-fill-mode both holds the start frame, so the stagger reads as one
   movement arriving rather than five things appearing. The preview follows
   the copy: the words
   say what this is, the picture confirms it. */
@keyframes veyro-rise { from { opacity:0; transform:translateY(var(--rise)); } to { opacity:1; transform:none; } }

.fw .hero-grid > div > *,
.fw .hero-grid > div:last-child {
  animation:veyro-rise var(--t-4) var(--ease-out) both;
}
.fw .hero-grid > div:first-child > *:nth-child(2) { animation-delay:60ms; }
.fw .hero-grid > div:first-child > *:nth-child(3) { animation-delay:120ms; }
.fw .hero-grid > div:first-child > *:nth-child(4) { animation-delay:180ms; }
.fw .hero-grid > div:first-child > *:nth-child(5) { animation-delay:240ms; }
.fw .hero-grid > div:last-child { animation-delay:200ms; }
/* The preview's own rows follow it in. Capped at four: past that a stagger
   stops reading as one movement and starts reading as a queue. */
.fw .hero-grid > div:last-child .card { animation:veyro-rise var(--t-4) var(--ease-out) both; }
.fw .hero-grid > div:last-child .card:nth-of-type(2) { animation-delay:300ms; }
@media (prefers-reduced-motion: reduce) {
  .fw .hero-grid > div > *, .fw .hero-grid > div:last-child,
  .fw .hero-grid > div:last-child .card { animation:none !important; }
}

/* The steps themselves come after the line has been drawn, not alongside it. */
  opacity:0; transition:opacity var(--t-3) var(--ease-out);
}

/* ---- the money band, growing into place --------------------------------
   The proportions are the point of this component — how much is settled
   against how much is still moving — and a bar that draws itself from the left
   makes that read as a quantity rather than as a decorative stripe.

   scaleX, not width, so it never triggers layout: the segments keep their real
   proportions and the browser only composites. transform-origin is the left
   edge so the bar fills in reading order, and each segment follows the one
   before it so the eye travels along it once rather than watching four things
   grow at once.

   Only under [data-motion="on"], which is the landing page. The dashboard's
   own wallet is left alone. */
.fw[data-motion="on"] [data-reveal] .band-fill > span {
  transform:scaleX(0); transform-origin:left center;
  transition:transform var(--t-4) var(--ease-out);
}
.fw[data-motion="on"] [data-reveal][data-shown="1"] .band-fill > span { transform:scaleX(1); }
.fw[data-motion="on"] [data-reveal][data-shown="1"] .band-fill > span:nth-child(2) { transition-delay:90ms; }
.fw[data-motion="on"] [data-reveal][data-shown="1"] .band-fill > span:nth-child(3) { transition-delay:180ms; }
.fw[data-motion="on"] [data-reveal][data-shown="1"] .band-fill > span:nth-child(4) { transition-delay:270ms; }
@media (prefers-reduced-motion: reduce) {
  .fw .band-fill > span { transform:none !important; }
}

/* ---- reveal on scroll ----------------------------------------------------
   Opt-in, and off unless JavaScript has said otherwise. The hidden state lives
   behind [data-motion="on"], which Reveal.tsx puts on the wrapper after it
   mounts and after it has checked the reduced-motion query. Without that flag
   — no JS, a crawler, an old browser — every element renders exactly as it
   does today, placed and opaque, because the rule that hides it never matches.
   That ordering is the whole design: content is never hidden by default and
   then waiting on a script to bring it back. */
.fw[data-motion="on"] [data-reveal] {
  opacity:0;
  transform:translateY(var(--rise));
  transition:opacity var(--t-4) var(--ease-out), transform var(--t-4) var(--ease-out);
}
.fw[data-motion="on"] [data-reveal][data-shown="1"] { opacity:1; transform:none; }
/* The one chapter that sits off to the right arrives from its own side, so
   the movement agrees with the composition instead of contradicting it. 10px
   of x on one chapter: enough to feel, not enough to notice. Everything else
   on the page still rises straight up — cards coming in from four directions
   is the failure mode this avoids, not the effect it wants. */
/* Two more, one per composition, and both are the transform that is already
   there rather than a new animation. The flow arrives across, because across
   is the direction it asks the eye to travel. The wallet settles instead of
   sliding: a product screenshot that slides reads as a carousel, and this one
   is meant to read as the thing itself arriving. .flow keeps a single
   entrance rather than a stagger because its list items are display:contents
   and have no box to move. */
.fw[data-motion="on"] .flow[data-reveal] { transform:translate(-14px, 6px); }
.fw[data-motion="on"] .flow[data-reveal][data-shown="1"] { transform:none; }
.fw[data-motion="on"] .stage[data-reveal] { transform:translateY(10px) scale(.994); }
.fw[data-motion="on"] .stage[data-reveal][data-shown="1"] { transform:none; }
/* A second and third element in the same group follow the first rather than
   arriving together, which is what makes a row read as one movement. Kept to
   three steps: past that it stops being a stagger and becomes a queue. */
.fw[data-motion="on"] [data-reveal][data-delay="1"] { transition-delay:70ms; }
.fw[data-motion="on"] [data-reveal][data-delay="2"] { transition-delay:140ms; }
.fw[data-motion="on"] [data-reveal][data-delay="3"] { transition-delay:210ms; }

/* type */
.fw h1,.fw h2,.fw h3,.fw h4 { margin:0; font-weight:var(--fw-bold); letter-spacing:-0.016em; font-family:inherit; }

.fw p { margin:0; }
.fw .d2 { font-size:var(--fs-8); line-height:1.21; letter-spacing:-0.022em; font-weight:var(--fw-bold); }
.fw .h3 { font-size:var(--fs-6); line-height:1.32; letter-spacing:-0.016em; font-weight:var(--fw-bold); }
.fw .h4 { font-size:var(--fs-4); line-height:1.4; letter-spacing:-0.008em; font-weight:var(--fw-bold); }
.fw .lead { font-size:var(--fs-5); line-height:1.58; color:var(--ink-2); max-width:var(--m-lead); }
.fw .body { font-size:var(--fs-4); line-height:1.5; color:var(--ink-2); max-width:70ch; }
.fw .small { font-size:var(--fs-3); line-height:1.5; color:var(--ink-2); }
.fw .tiny { font-size:var(--fs-2); line-height:1.45; color:var(--ink-3); }
.fw .lbl { font-size:var(--fs-2); color:var(--ink-3); letter-spacing:0.004em; }
.fw .num { font-variant-numeric: tabular-nums lining-nums; font-feature-settings:"tnum" 1; }
.fw .mono { font-size:var(--fs-2); letter-spacing:0.03em; font-variant-numeric:tabular-nums lining-nums; }
.fw .ink3 { color:var(--ink-3); }

/* layout */
.fw .wrap { max-width:1280px; margin:0 auto; padding:0 var(--gut); }
.fw .wrap-lp { max-width:var(--lp-max); margin:0 auto; padding:0 var(--gut); }
.fw .lp-h1 { font-size:var(--lp-1); line-height:1.02; letter-spacing:-0.035em; font-weight:var(--fw-bold); }
/* text-wrap:balance for the same reason the hero tagline has it: at 44px an
   18ch measure drops the last word onto a line of its own — "is.", "made." —
   which reads as a mistake rather than as a line break. Browsers without it
   wrap exactly as before. */
.fw .lp-h2 { font-size:var(--lp-2); line-height:1.1; letter-spacing:-0.028em;
  font-weight:var(--fw-bold); max-width:18ch; text-wrap:balance; }
.fw .lp-h3 { font-size:var(--lp-3); line-height:1.2; letter-spacing:-0.02em; font-weight:var(--fw-bold); }
.fw .lp-lead { font-size:var(--lp-lead); line-height:1.55; color:var(--ink-2); max-width:56ch; }
.fw .lp-note { font-size:var(--fs-2); line-height:1.5; color:var(--ink-3); max-width:var(--m-wide); }
.fw section.lp-pad-lg { padding:var(--lp-pad-lg) 0; }
.fw section.lp-pad-md { padding:var(--lp-pad-md) 0; }
.fw section.lp.lp-pad-sm { padding:var(--lp-pad-sm) 0; }
.fw section.lp-pad-sm { padding:var(--lp-pad-sm) 0; }
@media (max-width:900px) {
  .fw { --lp-1:40px; --lp-2:32px; --lp-3:21px; --lp-lead:17px; --lp-gut:20px;
        --lp-pad:48px;
        --lp-pad-lg:64px; --lp-pad-md:48px; --lp-pad-sm:36px; }
  .fw .lp-h2 { max-width:24ch; }
}
.fw .wrap-n { max-width:880px; margin:0 auto; padding:0 var(--gut); }
  .fw .wrap-w { max-width:1600px; margin:0 auto; padding:0 var(--gut); }
.fw .wrap-s { max-width:720px; margin:0 auto; padding:0 var(--gut); }
.fw .row { display:flex; align-items:center; gap:10px; }
.fw .row-b { display:flex; align-items:center; justify-content:space-between; gap:16px; }
.fw .grow { flex:1 1 auto; min-width:0; }
.fw .grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
.fw .grid-4 { display:grid; grid-template-columns:repeat(4,1fr); gap:0; }
/* A grid item's automatic minimum size is its min-content, so one unshrinkable
   descendant (a table, a long number) widens the whole TRACK and every sibling
   with it. The item then renders wider than the grid box, and because body has
   overflow-x:clip the page does not scroll: the overflow is silently cut off
   instead. That failure is invisible to a scrollWidth check, which is why it
   survived earlier passes.

   Tracks written as minmax(0,1fr) are already immune; a bare 1fr is not. Rather
   than depend on every future track being written the careful way, every layout
   grid's children get min-width:0 here. Items can then shrink, and the scroll
   containers inside them (.tblwrap) do the scrolling they were put there to do. */
.fw .grid-2 > *, .fw .grid-4 > *, .fw .cardgrid > *,
.fw .herofacts > *, .fw .footgrid > *, .fw .reality > *, .fw .stagebar > *,
.fw .ruled > div > *, .fw .split > *, .fw .split-lead > *, .fw .truthgrid > *,
.fw .ownership > *, .fw .pricegrid > *, .fw .trustgrid > *, .fw .hstage > *,
.fw .hpanel-rows > div > *, .fw .numbered li > * { min-width:0; }
.fw .rule { height:1px; background:var(--line); border:0; margin:0; }
.fw .stack > * + * { margin-top:14px; }

/* buttons */
.fw .btn {
  display:inline-flex; align-items:center; justify-content:center; text-align:center; gap:7px;
  height:var(--h-md); padding:0 var(--sp-4); border-radius:0; border:1px solid var(--brand);
  background:var(--brand); color:var(--reverse); font-size:var(--fs-3); font-weight:var(--fw-med); letter-spacing:-0.006em;
  cursor:pointer;
  white-space:nowrap;
}
.fw .btn:hover { background:var(--brand-h); border-color:var(--brand-h); }
/* One pixel, and it goes back on press. More than that and a button reads as
   floating rather than as answering. transform is listed explicitly because
   the shared transition above covers colour and shadow only. */
.fw .btn:hover:not(:disabled) { transform:translateY(-1px); box-shadow:var(--lift); }
.fw .btn:active:not(:disabled) { transform:translateY(0); box-shadow:none; }
.fw .btn { transition:background-color var(--t), border-color var(--t), color var(--t),
  box-shadow var(--t), transform var(--t); }
.fw .btn:active { background:var(--brand-a); border-color:var(--brand-a); }
.fw .btn[aria-busy="true"] { background:var(--brand-h); border-color:var(--brand-h); opacity:.85; cursor:progress; }
.fw .btn[aria-busy="true"]::before { content:""; width:var(--marker); height:var(--marker); background:var(--reverse); flex:none; }
.fw .btn-2:active { background:var(--surface-2); border-color:var(--ink-3); }
.fw .btn-q:active { background:var(--surface-2); }
.fw .btn-d:active { background:var(--clay-a); }
/* Disabled is a state, not a faded version of the enabled one.
   This was opacity .38 over the brand, green at the time, which rendered
   white text on a washed-out green at roughly 2:1 — the label was the least readable thing on
   the page at the moment someone is trying to work out why they cannot submit.
   A neutral surface with muted text reads as "not yet" and clears AA. */
.fw .btn:disabled, .fw .btn:disabled:hover {
  opacity:1; cursor:not-allowed;
  background:var(--surface-2); border-color:var(--line); color:var(--ink-3); }
.fw .btn-2:disabled, .fw .btn-2:disabled:hover { background:var(--card); border-color:var(--line); color:var(--ink-3); }

.fw .nav button:not(.btn)[data-on="1"] { font-weight:var(--fw-med); }
/* (the disabled rule lives above; a second one here used to override it) */
.fw .btn-2 { background:var(--paper); color:var(--ink); border-color:var(--line); }
.fw .btn-2:hover { background:var(--surface); border-color:var(--line-hover); }
.fw .btn-q { background:transparent; border-color:transparent; color:var(--ink-2); }
.fw .btn-q:hover { background:var(--surface-2); border-color:transparent; color:var(--ink); }
.fw .btn-d { background:var(--paper); color:var(--clay); border-color:var(--clay-line); }
.fw .btn-d:hover { background:var(--clay-bg); border-color:var(--clay-line); }
.fw .linkbtn { background:none; border:0; padding:0; font:inherit; color:var(--pine); cursor:pointer;
  text-decoration:underline; text-underline-offset:2px; }
.fw .linkbtn:hover { color:var(--pine-h); }
.fw .btn-lg { height:var(--h-lg); padding:0 var(--sp-5); font-size:var(--fs-4); }
.fw .btn-sm { height:var(--h-sm); padding:0 var(--sp-3); font-size:var(--fs-2); border-radius:0; }
.fw .btn-w { width:100%; }

/* surfaces */
.fw .card { background:var(--card); border:1px solid var(--line); }
/* a.card only: the wallet preview and the guardian panel are cards you read,
   not cards you click, and lifting them would promise something that is not
   there. */
.fw a.card { transition:border-color var(--t), box-shadow var(--t), transform var(--t); }
.fw a.card:hover { border-color:var(--ink-3); box-shadow:var(--lift); transform:translateY(-2px); }
.fw a.card:active { transform:translateY(0); box-shadow:none; }
.fw .card-h { padding:var(--sp-3) var(--sp-5); min-height:45px; border-bottom:1px solid var(--line-soft); display:flex; align-items:center; justify-content:space-between; gap:12px; }
.fw .card-b { padding:var(--sp-5); }
.fw .card-f { padding:var(--sp-3) var(--sp-5); border-top:1px solid var(--line-soft); background:transparent; }
.fw .panel { background:transparent; border-top:1px solid var(--line); padding:14px 0 0; }

/* badges */
.fw .badge { display:inline-flex; align-items:center; height:20px; padding:0 7px; font-size:var(--fs-1); font-weight:var(--fw-bold);
  border:1px solid; letter-spacing:0.02em; text-transform:none; background:transparent; }
.fw .b-pine { color:var(--pine); background:var(--pine-bg); border-color:var(--pine-line); }
.fw .b-amber { color:var(--amber); background:var(--amber-bg); border-color:var(--amber-line); }
.fw .b-slate { color:var(--slate); background:var(--slate-bg); border-color:var(--slate-line); }
.fw .b-clay { color:var(--clay); background:var(--clay-bg); border-color:var(--clay-line); }
.fw .b-grey { color:var(--ink-2); background:var(--surface-2); border-color:var(--line); }

/* forms */
.fw .field { display:block; margin-bottom:14px; }
.fw .field > .lbl { display:block; margin-bottom:6px; color:var(--ink); font-size:var(--fs-3); font-weight:var(--fw-med); }
.fw .input, .fw .select, .fw .ta {
  width:100%; height:var(--h-md); padding:0 var(--sp-3); border:1px solid var(--control-line); border-radius:0;
  background:var(--card); font-size:var(--fs-3);
}
.fw .ta { height:auto; padding:9px 11px; resize:vertical; line-height:1.5; }
.fw .input:focus, .fw .select:focus, .fw .ta:focus { outline:none; border-color:var(--brand); box-shadow:inset 0 0 0 1px var(--brand); }
.fw .input::placeholder, .fw .ta::placeholder { color:var(--placeholder); }
.fw .input:hover:not(:focus):not(:disabled), .fw .select:hover:not(:focus):not(:disabled) { border-color:var(--ink-3); }
.fw .input:disabled, .fw .select:disabled, .fw .ta:disabled {
  background:var(--surface); color:var(--ink-3); cursor:not-allowed; border-color:var(--line-soft); }
.fw .input.bad, .fw .select.bad, .fw .ta.bad { border-color:var(--clay); box-shadow:inset 0 0 0 1px var(--clay); }
.fw .input.bad:focus, .fw .ta.bad:focus { border-color:var(--clay); box-shadow:inset 0 0 0 1px var(--clay); }
.fw .input.good { border-color:var(--pine); }
/* The eligibility form sits in a wide column on both the landing page and
   /check, and its fields were inheriting that width: a 742px input for a
   four-digit year, and a country select wider than most sentences on the page.
   A field should be about as wide as what goes in it — long ones are harder to
   scan and make a short answer look like a mistake. The card keeps its width;
   only the controls are capped. */
.fw .checkform .field { max-width:var(--m-tight); }
.fw .checkform .field > .hint, .fw .checkform .field > .err { max-width:var(--m-lead); }
/* The same checker is embedded on the homepage, where --m-tight caps each
   field at 317px inside a much wider card — which left most of the card empty
   and the Check button stretched to more than twice the width of the fields
   it belongs to. Three columns now the card is centred and compact, so the
   whole thing is one row: location, year, Check. When the region question
   appears the three fields take the row and Check drops below them. Scoped to
   #eligibility, because /check itself is narrow and was already right. */
@media (min-width:901px) {
  .fw #eligibility .checkform { display:grid;
    grid-template-columns:repeat(3,minmax(0,1fr)); gap:0 var(--sp-6); align-items:start; }
  .fw #eligibility .checkform .field { max-width:none; }
  /* The button shares a row with a field whenever the region question is
     showing, so it aligns on the control, not on the label above it: the
     same 14px .field leaves under itself, so Check sits level with the input
     beside it rather than with that input's caption. */
  .fw #eligibility .checkform > .btn { align-self:end; margin-bottom:14px; }
}
/* The submit fills its column: it is the one thing on the card that should be
   impossible to miss, and it closes the form rather than collecting anything.
   On /check that column is the whole card; embedded on the homepage the rule
   above gives it one of two. */
.fw .charcount { float:right; font-size:var(--fs-1); color:var(--ink-3); font-variant-numeric:tabular-nums; }
.fw .charcount[data-near="1"] { color:var(--amber); }
.fw .charcount[data-over="1"] { color:var(--clay); font-weight:var(--fw-med); }
.fw .hint { display:block; margin-top:5px; font-size:var(--fs-2); color:var(--ink-3); }
.fw .err { display:block; margin-top:5px; font-size:var(--fs-2); color:var(--clay); }
/* Something arriving because you asked for it.
   A confirmation, an error, a panel that just opened. It rises 4px and fades,
   which is about the smallest movement that still reads as "this is new"
   rather than "this was always here and you missed it". Entrance only: there
   is no exit, because an element that has already gone is not worth waiting
   for. The global reduced-motion rule zeroes the duration, so it still
   appears, instantly. */
@keyframes veyro-reveal {
  from { opacity:0; transform:translateY(-4px); }
  to   { opacity:1; transform:none; }
}
.fw .reveal { animation:veyro-reveal var(--t-2) var(--ease) both; }

/* A panel that opens and closes in place, height and all.
   grid-template-rows 0fr -> 1fr is the one way to transition to an unknown
   height without measuring it in JavaScript, and it is already how the FAQ
   accordion works, so this is that pattern and not a second one. */
.fw .expand { display:grid; grid-template-rows:0fr; opacity:0;
  transition:grid-template-rows var(--t-2) var(--ease), opacity var(--t-2) var(--ease); }
.fw .expand[data-open="1"] { grid-template-rows:1fr; opacity:1; }
.fw .expand > * { overflow:hidden; min-height:0; }

/* Rows answer the cursor. Only where a cursor exists — on a touch screen
   :hover sticks to whatever was tapped last, which leaves a row looking
   selected for no reason. The panel row is excluded: it is a container for a
   form, not a row of data to point at. */
@media (hover: hover) {
  .fw .tbl tbody tr:not([data-panel]) { transition:background-color var(--t); }
  .fw .tbl tbody tr:not([data-panel]):hover { background:var(--surface); }
}

/* Code.
   .mono is the UI face with tabular figures, which is right for an account id
   inside a sentence and wrong for a block of markup: it has no real monospace
   metrics, so indentation does not line up. This is the one place a second
   family is justified, and it is a stack of faces already on the machine. */
.fw .code { font-family:var(--code); font-size:var(--fs-2); line-height:1.7;
  background:var(--surface); border:1px solid var(--line); padding:14px 16px;
  overflow-x:auto; white-space:pre; tab-size:2; color:var(--ink); margin:0; }
.fw .code .c { color:var(--ink-3); }
.fw .code b { font-weight:var(--fw-bold); color:var(--brand); }
.fw .codecap { display:flex; align-items:center; justify-content:space-between; gap:12px;
  border:1px solid var(--line); border-bottom:0; background:var(--card);
  padding:8px 14px; font-size:var(--fs-2); color:var(--ink-3); }
.fw .codecap + .code { border-top:0; }

/* Flow diagram.
   Four stages and the arrows between them. A row on a wide screen, a column on
   a narrow one, with the arrows turning a quarter turn rather than being
   swapped for different glyphs. The arrows are decorative: the list itself
   carries the order for anyone not looking at it. */
.fw .flow { display:flex; align-items:stretch; flex-wrap:wrap; list-style:none; margin:0; padding:0; }
/* 140, not 170, and the reason is a browser that has neither :has() nor
   container queries — anything older than about Chrome 105 or Safari 16. There
   the container rule below never applies, so this basis is what decides
   whether the stops fit. At 132px four fit a 719px card on one line
   (4x132 + 3x34 = 630) and five fit the homepage band down to 901px
   (5x132 + 4x34 = 796); at 170 four wrapped to three and a stranded fourth.
   Modern browsers stack the same diagram via the container query long before
   the basis matters, so nothing changes for them. */
.fw .flow-step { flex:1 1 132px; min-width:0; border:1px solid var(--ink);
  background:var(--card); padding:13px 15px; }
.fw .flow-step .fs-n { display:block; font-size:var(--fs-1); letter-spacing:0.06em;
  text-transform:uppercase; color:var(--ink-3); margin-bottom:5px; }
.fw .flow-step .fs-t { display:block; font-size:var(--fs-4); font-weight:var(--fw-bold);
  letter-spacing:-0.01em; }
.fw .flow-step .fs-d { display:block; font-size:var(--fs-2); color:var(--ink-2); margin-top:4px; }
.fw .flow-step[data-you="1"] { border-color:var(--brand); box-shadow:inset 0 0 0 1px var(--brand); }

/* An interactive diagram. The stops become buttons, so they reset the browser
   defaults a button brings and pick up the pointer. */
.fw button.flow-step { font:inherit; color:inherit; text-align:left; cursor:pointer;
  transition:border-color var(--t), box-shadow var(--t), opacity var(--t-1) var(--ease); }
/* Quietening the others is what makes the highlight read as "this one". Opacity
   rather than a colour change, so nothing in the diagram has to invent a shade
   that is not in the palette, and never below .5 — a dimmed stop is still text
   somebody may be reading. */
.fw .flow[data-dim="1"] button.flow-step { opacity:.5; }
.fw .flow[data-dim="1"] button.flow-step[data-active="1"] { opacity:1; }
.fw button.flow-step[data-active="1"] { border-color:var(--ink); box-shadow:inset 0 0 0 1px var(--ink); }
.fw button.flow-step[data-you="1"][data-active="1"] { border-color:var(--brand); box-shadow:inset 0 0 0 2px var(--brand); }
@media (prefers-reduced-motion: reduce) { .fw button.flow-step { transition:none; } }

/* The connectors drawing themselves as the diagram arrives. The arrow is the
   only part that says these stops are a sequence rather than a list. */
.fw[data-motion="on"] [data-reveal] .flow-arrow {
  opacity:0; transition:opacity var(--t-3) var(--ease-out); }
.fw[data-motion="on"] [data-reveal][data-shown="1"] .flow-arrow { opacity:1; }
.fw[data-motion="on"] [data-reveal][data-shown="1"] .flow-arrow:nth-of-type(1) { transition-delay:180ms; }
.fw[data-motion="on"] [data-reveal][data-shown="1"] .flow-arrow:nth-of-type(2) { transition-delay:280ms; }
.fw[data-motion="on"] [data-reveal][data-shown="1"] .flow-arrow:nth-of-type(3) { transition-delay:380ms; }
@media (prefers-reduced-motion: reduce) { .fw .flow-arrow { opacity:1 !important; } }
.fw .flow-arrow { flex:0 0 34px; display:flex; align-items:center; justify-content:center;
  color:var(--ink-3); font-size:var(--fs-5); }
/* 900, not 760. That number was set when this diagram had four stops; the
   homepage flow has five, which need 5x132 + 4x34 = 796px of basis, and
   between 761 and about 911 the row wrapped to four and a lone fifth — the
   fifth stretched by flex-grow to the full width, ending further right than
   the row above it, with the fourth arrow stranded at the end of row one
   pointing at nothing. Stacking at the same 900 every other two-column
   block on this page uses closes that band, and the basis drop from 140
   keeps five on one line at 901px (829px of content against 796 of basis)
   instead of leaving a 10px strip where it still wraps. */
@media (max-width:900px) {
  .fw .flow { flex-direction:column; }
  .fw .flow-step { flex:1 1 auto; }
  .fw .flow-arrow { flex:0 0 26px; transform:rotate(90deg); }
}
/* A four-stop diagram inside a card is narrow while the viewport is wide, so a
   media query is the wrong instrument: on a 1440px screen the integration card
   is about 740px and the row wrapped to three stops and a lone fourth, with an
   arrow left pointing at the wrap. The question is how much room the diagram
   has, not how big the screen is, which is what a container query asks.
   Scoped with :has so only cards that actually contain one become containers. */
.fw .card-b:has(> .flow) { container-type:inline-size; }
/* 780, not 640. Four stops at a 170px basis plus three 34px arrows need about
   780px to sit on one line; below that the row wrapped to three and a lone
   fourth, which is worse than stacking because the sequence stops reading in
   order. */
@container (max-width: 780px) {
  .fw .flow { flex-direction:column; }
  .fw .flow-step { flex:1 1 auto; }
  .fw .flow-arrow { flex:0 0 26px; transform:rotate(90deg); }
}

/* Segmented control.
   Two mutually exclusive views of the same figure, so they belong inside one
   border rather than sitting as a button next to a word. Built from the same
   1px edge and brand fill as everything else; the selected segment is filled,
   the other is quiet, and a single hairline divides them. */
.fw .seg { display:inline-flex; border:1px solid var(--line); background:var(--card); }
.fw .seg > button {
  appearance:none; border:0; background:transparent; cursor:pointer;
  font-size:var(--fs-2); font-weight:var(--fw-med); color:var(--ink-2);
  padding:0 var(--sp-3); height:26px; white-space:nowrap;
  transition: background-color var(--t), color var(--t); }
.fw .seg > button + button { border-left:1px solid var(--line); }
.fw .seg > button:hover:not([aria-pressed="true"]):not([aria-selected="true"]) { background:var(--surface); color:var(--ink); }
/* Two attributes for one look: a segmented picker uses aria-pressed, a
   tablist uses aria-selected, and aria-pressed is invalid on role="tab". */
.fw .seg > button[aria-pressed="true"],
.fw .seg > button[aria-selected="true"] { background:var(--brand); color:var(--reverse); }
@media (pointer: coarse) { .fw .seg > button { height:var(--tap); } }

/* A segmented control with six options cannot stay on one line on a phone, and
   a horizontal scroller hides the options nobody scrolled to. It wraps, and the
   left border that separates buttons is reset per row so a wrapped row does not
   start with a doubled edge. */
.fw .segwrap { display:flex; flex-wrap:wrap; border-width:1px 0 0 1px; }
.fw .segwrap > button { border-right:1px solid var(--line); border-bottom:1px solid var(--line); }
.fw .segwrap > button + button { border-left:0; }

/* A long generated prompt. Scrolls in its own box rather than setting the width
   of the page, and is focusable so it can be reached and read by keyboard. */
.fw .codescroll { max-height:280px; overflow:auto; white-space:pre-wrap; word-break:break-word;
  margin:0; -webkit-overflow-scrolling:touch; }

/* Integration checks. The mark is decorative: every row states its condition in
   words, so none of this depends on seeing a colour. */
.fw .cklist { display:grid; gap:12px; }
.fw .ck { display:flex; gap:10px; align-items:flex-start; }
.fw .ck-m { width:9px; height:9px; flex:none; margin-top:6px; border:1px solid var(--line); }
.fw .ck-y { background:var(--pine); border-color:var(--pine); }
.fw .ck-n { background:transparent; border-color:var(--ink-3); }
.fw .ck-t { display:block; font-size:var(--fs-3); font-weight:var(--fw-med); }
.fw .ck-s { font-size:var(--fs-2); font-weight:var(--fw-reg); color:var(--ink-3); margin-left:8px; }
.fw .ck-d { display:block; font-size:var(--fs-2); line-height:1.45; color:var(--ink-3); margin-top:2px;
  max-width:60ch; }

/* The column count follows the item count rather than being declared.
   It was repeat(5,...) from when there were five steps; dropping to four left
   a 261px column standing empty at the right end with the top rule running
   across it, which read as a missing step. auto-flow cannot go stale that
   way. */
  border-top:1px solid var(--ink);
  /* An <ol> brings padding-inline-start:40px and a 1em block margin of its
     own. Without this reset the whole row sat 40px right of the heading above
     it at every width — the numbers are rendered as text here, so the marker
     box it was reserving was space for nothing. */
  margin:0; padding:0; }
/* Every cell had padding-left:0, which is right for the first — it lines up
   with the page's own left edge — and wrong for the rest, whose text sat hard
   against the divider belonging to the cell before it. */
  color:var(--ink-3); font-variant-numeric:tabular-nums; }
/* The miniature. Pushed to the bottom of the cell so all four line up along one
   baseline however long the description above them runs — four fragments at
   four different heights would read as clutter rather than as a row. */
  border:1px solid var(--line); padding:3px 6px; max-width:100%; overflow:hidden;
  text-overflow:ellipsis; white-space:nowrap; }

.fw .choice { display:flex; gap:10px; align-items:flex-start; padding:12px 13px; border:1px solid var(--line); cursor:pointer; background:var(--card); text-align:left; width:100%; }
.fw .choice:hover { border-color:var(--ink-3); }
/* Selected borrows --brand, which is now near-black itself: green was retired
   from interface colour and means settled money and nothing else. One control
   still answers in one colour, and the edge stays 1px rather than doubling to
   2px, which was the heaviest line on the page for a checkbox being ticked. */
.fw .choice[data-on="1"] { border-color:var(--brand); background:var(--card); box-shadow:inset 0 0 0 1px var(--brand); }
/* A square box with a tick, not a filled circle.
   Two reasons. A circle is the established shape for "one of several", and this
   is a single on/off answer, so the shape was promising a choice that is not
   there. And --radius:0 is the first rule of this system: a 50% radius was the
   one curve in the whole interface.
   The mark is a real tick rather than a filled square, which reads as "yes" at
   15px in a way a dot does not. The dashboard's setup markers already use this
   square, so the two now agree. */
.fw .tick { width:15px; height:15px; border-radius:0; border:1.5px solid var(--control-line);
  flex:none; margin-top:3px; position:relative; background:var(--card); }
.fw .choice:hover .tick { border-color:var(--ink-3); }
.fw .choice[data-on="1"] .tick { border-color:var(--brand); background:var(--brand); }
.fw .choice[data-on="1"] .tick::after {
  content:""; position:absolute; left:4px; top:1px; width:4px; height:8px;
  border:solid var(--reverse); border-width:0 1.5px 1.5px 0; transform:rotate(45deg); }

/* table */
.fw .tbl { width:100%; border-collapse:collapse; }
.fw .tbl th { text-align:left; font-size:var(--fs-2); font-weight:var(--fw-med); color:var(--ink-3); padding:var(--sp-2) var(--sp-5); border-bottom:1px solid var(--line); }
/* The tinted ground belongs to a COLUMN header, where it spans the row. A
   row-scoped th (scope="row") is one cell, so the same rule painted a grey
   block across half the row and read as a half-filled bar. The warm palette
   hid it because --surface sat a hair off --card; on white it is plain. */
.fw .tbl thead th { background:var(--surface); }
/* A row header is a label cell, so it takes the body divider (--line-soft),
   not the heavier --line a column header draws. Mismatched, one row was
   divided by two different greys across its width. */
.fw .tbl tbody th { color:var(--ink-2); border-bottom-color:var(--line-soft); }
.fw .tbl td { padding:var(--sp-3) var(--sp-5); border-bottom:1px solid var(--line-soft); font-size:var(--fs-3); vertical-align:middle; }
.fw .tbl tr:last-child td, .fw .tbl tr:last-child th { border-bottom:0; }
/* A badge is a label, not a paragraph. In the transactions table, which sits
   in a half-width column with six columns of its own, "Still settling" and
   "Refunded" were wrapping mid-word and rendering as "Settlin" and "Refun"
   with the rest clipped off the cell. */
.fw .tbl td .badge, .fw .tbl th .badge { white-space:nowrap; }
.fw .tbl .r { text-align:right; }
.fw .tbl-c tbody tr { cursor:pointer; }
.fw .tbl-c tbody tr:hover { background:var(--surface); }
.fw .tbl-c tbody tr:active { background:var(--surface-2); }
.fw .nav button:not(.btn):active { background:var(--surface-2); }
.fw .frame-rail button:not(.btn):active { background:var(--surface-2); }
.fw .linkrow:active { background:var(--surface-2); }
.fw .footgrid button:active { color:var(--brand-h); }
.fw .choice:active { background:var(--surface); }
.fw .linkbtn:active { color:var(--pine-h); }

/* app shell */
.fw .shell { display:flex; min-height:100vh; align-items:stretch; }
.fw .rail { width:205px; flex:none; border-right:1px solid var(--line); background:var(--surface); display:flex; flex-direction:column; }
.fw .rail-top { padding:16px 16px 12px; }
.fw .nav { padding:6px 8px; display:flex; flex-direction:column; gap:1px; }
.fw .nav a, .fw .nav button:not(.btn) {
  display:flex; align-items:center; justify-content:space-between; gap:8px; width:100%;
  padding:7px 10px; border-radius:0; font-size:var(--fs-3); color:var(--ink-2); cursor:pointer;
  background:transparent; border:0; text-align:left;
}
.fw .nav button:not(.btn):hover { background:var(--surface-2); color:var(--ink); }
.fw .nav button:not(.btn)[data-on="1"] { background:var(--card); color:var(--ink); font-weight:var(--fw-bold); box-shadow:inset 0 0 0 1px var(--line); }
.fw .main { flex:1 1 auto; min-width:0; display:flex; flex-direction:column; }
.fw .topbar { height:53px; flex:none; border-bottom:1px solid var(--line); display:flex; align-items:center; justify-content:space-between; padding:0 24px; gap:16px; background:var(--card); }
.fw .page { padding:26px 24px 72px; flex:1 1 auto; }
.fw .page-in { max-width:940px; }
.fw .page-h { margin-bottom:20px; }

/* env bar */
.fw .env { height:30px; background:var(--ink); color:#e2e3e3; display:flex; align-items:center; justify-content:center; gap:10px; font-size:var(--fs-2); padding:0 16px; }
.fw .env b { font-weight:560; color:var(--reverse); }
.fw .env .sep { width:1px; height:12px; background:#454748; }
.fw .env button:not(.btn) { background:transparent; border:0; color:#b8b8b9; cursor:pointer; font-size:var(--fs-2);
  text-decoration:underline; text-underline-offset:2px; padding:0; }
.fw .env button:not(.btn):hover { color:var(--reverse); }

/* money position band */
.fw .band { display:flex; height:12px; border-radius:0; overflow:hidden; background:var(--surface-2); border:1px solid var(--line); }
.fw .band i { display:block; height:100%; }
.fw .band-key { display:flex; flex-wrap:wrap; gap:0 22px; margin-top:12px; }
.fw .keyitem { display:flex; align-items:baseline; gap:7px; padding:6px 0; }
.fw .keysw { width:8px; height:8px; border-radius:0; align-self:center; flex:none; }

/* timeline */
.fw .tl { list-style:none; margin:0; padding:0; }
.fw .tl li { display:flex; gap:12px; padding-bottom:16px; position:relative; }
.fw .tl li:last-child { padding-bottom:0; }
.fw .tl li::before { content:""; position:absolute; left:5px; top:14px; bottom:-2px; width:1px; background:var(--line); }
.fw .tl li:last-child::before { display:none; }
.fw .tl .pt { width:11px; height:11px; border-radius:50%; border:2px solid var(--line); background:var(--paper); flex:none; margin-top:4px; z-index:1; }
.fw .tl .pt[data-on="1"] { border-color:var(--ink); background:var(--ink); }
.fw .tl .pt[data-on="bad"] { border-color:var(--clay); background:var(--clay); }

/* modal / drawer */
.fw .scrim { position:fixed; inset:0; background:var(--scrim); z-index:60; display:flex; align-items:center; justify-content:center; padding:20px; }
.fw .modal { background:var(--card); border:1px solid var(--line); border-radius:0; width:100%; max-width:460px;  max-height:90vh; overflow:auto; }
.fw .drawer { position:fixed; top:0 ; right:0; bottom:0; width:352px; max-width:92vw; background:var(--card); border-left:1px solid var(--line); z-index:70; overflow:auto;  }
.fw .pop { position:absolute; top:46px; right:0; width:360px; max-width:calc(100vw - 32px); background:var(--card); border:1px solid var(--line); border-radius:0;  z-index:50; overflow:hidden; }

/* toasts */
.fw .toasts { position:fixed; bottom:18px; right:18px; z-index:90; display:flex; flex-direction:column; gap:8px; align-items:flex-end; }
.fw .toast { background:var(--ink); color:var(--reverse); padding:10px 14px; border-radius:0; font-size:var(--fs-3); max-width:330px;  }

/* landing */
.fw .lp-nav { height:62px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid var(--line); }
/* 52/44, down from 76/60.
   The hero and the wallet had come out within five pixels of each other, which
   makes the opening and the climax the same size and leaves the page without a
   subject. The height is driven entirely by the right column — the preview at
   540 plus the figures at 88 — so this comes out of the surrounding space
   rather than out of the product or the three figures, both of which earn
   their place in the first viewport. About 54px in total, across four places
   so nothing is gutted to find it. */
.fw .hero { padding-block:52px 44px; }

/* The one accent on the page.
   Pine is reserved for money — see DESIGN.md — and this is the single
   deliberate exception, documented there rather than left to rot the rule. It
   sits on the hero's text column, not on the full-bleed band: a 4px stripe at
   the very edge of the viewport reads as a rendering artifact rather than as a
   decision. */
.fw .hero-accent { border-left:6px solid var(--pine); padding-left:var(--sp-6); }
@media (max-width:760px) { .fw .hero-accent { padding-left:var(--sp-5); } }

/* Three value props. A plain row of hairline-separated columns, not cards:
   cards would put a box around three sentences and call it a feature grid. */
.fw .props { display:grid; grid-auto-flow:column; grid-auto-columns:minmax(0,1fr); gap:0;
  border-top:1px solid var(--ink); }
.fw .props > div { padding:18px 20px 4px 0; border-right:1px solid var(--line); }
.fw .props > div + div { padding-left:var(--sp-5); }
.fw .props > div:last-child { border-right:0; }
.fw .props > div > * { min-width:0; }
.fw .props .pr-t { display:block; font-size:var(--fs-4); font-weight:var(--fw-bold); }
/* No measure cap. Each column is 448px at 1440 and 38ch capped the text at
   354, so every one of the three ended ~126px short of its own column and the
   rail read as three left-hugging blocks under a centred heading rather than
   one rail using the width. 428px at 14px is about 61 characters, which is a
   measure, not a sprawl. */
.fw .props .pr-d { display:block; font-size:var(--fs-3); line-height:1.5; color:var(--ink-2);
  margin-top:6px; }
@media (max-width:900px) {
  .fw .props { grid-auto-flow:row; grid-template-columns:1fr; border-top:0; }
  .fw .props > div { border-right:0; border-top:1px solid var(--line); padding:16px 0 4px; }
  .fw .props > div + div { padding-left:0; }
  .fw .props > div:first-child { border-top:1px solid var(--ink); }
}
/* Dashboard figures. Wraps rather than fixing a column count, because the
   revenue cell disappears when nothing has sold and a fixed grid would leave a
   hole where it was. minmax(0,...) so a long currency line shrinks instead of
   pushing the row wider than the card. */
.fw .metrics { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(148px,100%),1fr));
  gap:var(--sp-5) var(--sp-6); }
.fw .metrics .m-n { display:block; font-size:var(--fs-7); font-weight:var(--fw-bold);
  letter-spacing:-0.022em; font-variant-numeric:tabular-nums; }
/* Unknown is not zero, and must not look like a number. */
.fw .metrics .m-n[data-unknown="1"] { color:var(--ink-3); font-weight:var(--fw-med); }
.fw .metrics .m-l { display:block; font-size:var(--fs-2); line-height:1.45; color:var(--ink-3); margin-top:5px; }
.fw .metrics .m-s { display:block; font-size:var(--fs-2); line-height:1.4; color:var(--ink-3); margin-top:3px; }
.fw .herofacts { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:var(--sp-6); }
.fw .herofacts .hf-n { display:block; font-size:var(--fs-7); font-weight:var(--fw-bold); letter-spacing:-0.022em; }
.fw .herofacts .hf-l { display:block; font-size:var(--fs-2); line-height:1.45; color:var(--ink-3); margin-top:5px; }
/* Folded into the hero beside the product rather than standing as their own
   chapter, so they are sized as supporting detail: the figure drops from the
   display scale to interface scale and the whole row sits under the preview. */
.fw .herofacts-sm { gap:var(--sp-5); padding-top:var(--sp-4); border-top:1px solid var(--line); }
.fw .herofacts-sm .hf-n { font-size:var(--fs-6); }
.fw .herofacts-sm .hf-l { font-size:var(--fs-1); line-height:1.4; }
@media (max-width:760px) { .fw .herofacts { grid-template-columns:1fr; gap:14px; }
  .fw .herofacts > div { display:flex; gap:12px; align-items:baseline; }
  .fw .herofacts .hf-n { font-size:var(--fs-6); }
  .fw .herofacts .hf-l { margin-top:0; } }
.fw .foot { border-top:1px solid var(--ink); padding:44px 0 40px; margin-top:0; background:var(--paper); }
.fw .footgrid { display:grid; grid-template-columns:minmax(0,1.6fr) repeat(3,minmax(0,1fr)); gap:36px; }
.fw .footgrid h3 { font-size:var(--fs-2); font-weight:var(--fw-bold); letter-spacing:0.03em; color:var(--ink-3); margin-bottom:11px; }
.fw .footgrid button { display:block; background:none; border:0; padding:0 0 9px; font-size:var(--fs-3);
  color:var(--ink-2); cursor:pointer; text-align:left; }
.fw .footgrid button:hover { color:var(--brand); }
/* Footer navigation. Was an inline style on each link, which meant the
   coarse-pointer tap-target rule below could not reach it. */
.fw .footlink { display:block; padding:0 0 9px; font-size:var(--fs-3); }
.fw .footbase { display:flex; justify-content:space-between; align-items:flex-end; gap:28px; flex-wrap:wrap;
  margin-top:40px; padding-top:20px; border-top:1px solid var(--line); }
@media (max-width:760px) {
  .fw .footgrid { grid-template-columns:1fr 1fr; gap:28px; }
  .fw .footbase { margin-top:28px; }
}

/* Empty states. Left-aligned on the same axis as the content that will
   replace them, so the column does not shift its optical centre the moment one
   item exists. The top rule is the only chrome: no card, no fill, no faded
   mark. The heading is a real heading rather than bold body text, because on
   an empty dashboard it is the only thing in the section and screen-reader
   users navigating by heading would otherwise skip past an empty region with
   no idea what it was. */
.fw .estate { border-top:1px solid var(--line); padding-top:var(--sp-5); }
.fw .estate-h { font-size:var(--fs-5); font-weight:var(--fw-bold); color:var(--ink);
  letter-spacing:-0.012em; margin:0; }
.fw .estate-b { font-size:var(--fs-3); line-height:1.55; color:var(--ink-3);
  margin:6px 0 0; max-width:var(--m-lead); }
.fw .estate-a { margin-top:var(--sp-4); display:flex; flex-wrap:wrap; align-items:center;
  gap:var(--sp-3) var(--sp-4); }
/* A notice raised by the action (a copied link) belongs under the row, not
   beside the button, so it never squeezes the control that produced it. */
.fw .estate-a > [role="status"] { flex:1 0 100%; }
.fw .vd { font-size:var(--fs-2); font-weight:var(--fw-med); white-space:nowrap; }
.fw .vd-ok { color:var(--pine); } .fw .vd-no { color:var(--clay); } .fw .vd-off { color:var(--ink-3); }
.fw .reqlist { border-top:1px solid var(--ink); }
/* One boundary, one line. A .reqlist opening a card drew its own dark rule a
   padding-gap below the header's rule, so every such card showed two
   separators for the same edge. The header already closes itself. */
.fw .card-b > .reqlist:first-child,
.fw .card-b > .tblwrap:first-child > .tbl { border-top:0; }
.fw .reqrow { display:flex; align-items:center; gap:var(--sp-4); padding:var(--sp-2) 0;
  border-bottom:1px solid var(--line); }
.fw .req-t { display:block; font-size:var(--fs-3); font-weight:var(--fw-med); }
.fw .req-d { display:block; font-size:var(--fs-2); color:var(--ink-2); margin-top:2px; max-width:var(--m-lead); }
.fw .captbl th:first-child { width:32%; }
.fw .provtbl th:first-child { width:44%; }
.fw .foldwho { font-size:var(--fs-2); letter-spacing:0.02em; color:var(--brand); font-weight:var(--fw-med);
  margin-top:var(--sp-5); padding-top:var(--sp-4); border-top:1px solid var(--line); }
.fw .foldwhy { list-style:none; margin:var(--sp-5) 0 0; padding:0; }
.fw .foldwhy li { position:relative; padding:7px 0 7px 20px; font-size:var(--fs-3); color:var(--ink-2);
  line-height:1.5; max-width:52ch; }
.fw .foldwhy li::before { content:""; position:absolute; left:0; top:14px; width:9px; height:9px;
  background:var(--brand);
  clip-path:polygon(0 0, 26% 0, 45% 62%, 64% 0, 100% 0, 58% 100%, 43% 100%); }
.fw .foldwhy strong { color:var(--ink); font-weight:var(--fw-med); }
.fw .reality { list-style:none; margin:var(--sp-7) 0 0; padding:0;
  display:grid; grid-template-columns:1fr 1fr; gap:0 var(--sp-8); border-top:1px solid var(--ink); }
.fw .reality li { display:flex; gap:var(--sp-4); padding:var(--sp-4) 0; border-bottom:1px solid var(--line); }
.fw .reality-n { font-size:var(--fs-2); letter-spacing:0.04em; color:var(--brand); flex:none; padding-top:2px; }
.fw .reality-t { display:block; font-size:var(--fs-4); font-weight:var(--fw-bold); letter-spacing:-0.008em; }
.fw .reality-d { display:block; font-size:var(--fs-3); line-height:var(--lh-body); color:var(--ink-2); margin-top:5px; }
@media (max-width:900px) { .fw .reality { grid-template-columns:1fr; gap:0; } }
.fw .lp-eyebrow { display:block; font-size:var(--fs-2); font-weight:var(--fw-med); letter-spacing:0.02em;
  color:var(--brand); }
.fw .lp-dark .lp-eyebrow { color:#aeafaf; }
.fw .sec-lead { max-width:62ch; }
/* Five paragraphs ended on one short word — "fees.", "returns.", "name." —
   the worst at 32px under a 408px line. pretty is the property written for
   that, and where it is not supported the text wraps exactly as it does now. */
.fw .lp-lead, .fw .sec-lead, .fw .props .pr-d, .fw .cl-d, .fw .tl .tl-d,
.fw .states dd, .fw .story-by, .fw main .body { text-wrap:pretty; }
.fw .cardgrid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr));
  gap:var(--sp-6); align-items:stretch; }
.fw .cardgrid > * { min-width:0; }
.fw .truthgrid { display:grid; grid-template-columns:minmax(0,5fr) minmax(0,7fr); gap:var(--sp-8); align-items:start; }
.fw .ownership { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:var(--sp-8);
  margin-top:var(--sp-8); padding-top:var(--sp-6); border-top:1px solid var(--line); align-items:start; }
.fw .pricegrid { display:grid; grid-template-columns:minmax(0,6fr) minmax(0,5fr); gap:var(--sp-9); align-items:start; }
.fw .pricecard { border:1px solid var(--ink); background:var(--card); }
.fw .pricecard-h { display:flex; justify-content:space-between; align-items:center; gap:12px;
  padding:12px 20px; border-bottom:1px solid var(--line); }
.fw .pricecard-b { padding:20px; }
.fw .pricecard-f { padding:16px 20px; border-top:1px solid var(--line); background:var(--surface); }
.fw .priceamt { display:flex; align-items:baseline; gap:10px; }
.fw .priceamt .num { font-size:var(--lp-1); line-height:1; letter-spacing:-0.04em; font-weight:var(--fw-bold); }
.fw .priceunit { font-size:var(--fs-3); color:var(--ink-3); }
.fw .trustgrid { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:var(--sp-9); align-items:start; }
@media (max-width:900px) {
  .fw .truthgrid, .fw .ownership, .fw .pricegrid, .fw .trustgrid { grid-template-columns:minmax(0,1fr); gap:var(--sp-6); }
}
.fw .ddemo-ctl { display:flex; gap:var(--sp-4); align-items:stretch; flex-wrap:wrap; }
.fw .dtoggle { display:flex; gap:12px; align-items:flex-start; padding:14px 16px; background:transparent;
  border:1px solid rgba(255,255,255,.28); cursor:pointer; text-align:left; flex:1 1 300px; font-family:inherit; }
.fw .dtoggle:hover { border-color:rgba(255,255,255,.5); }
.fw .dtoggle[data-on="1"] { border-color:var(--reverse); }
.fw .dtoggle-box { width:15px; height:15px; border:1.5px solid rgba(255,255,255,.5); flex:none; margin-top:2px; position:relative; }
.fw .dtoggle[data-on="1"] .dtoggle-box { border-color:var(--reverse); }
.fw .dtoggle[data-on="1"] .dtoggle-box::after { content:""; position:absolute; inset:3px; background:var(--reverse); }
.fw .dtoggle-t { display:block; font-size:var(--fs-3); font-weight:var(--fw-med); color:var(--reverse); }
.fw .dtoggle-d { display:block; font-size:var(--fs-2); color:#bcbdbd; margin-top:2px; }
.fw .ddemo-out { margin-top:var(--sp-6); border-top:1px solid rgba(255,255,255,.2); padding-top:var(--sp-5); }
.fw .ddemo-sum { display:flex; gap:14px; align-items:baseline; flex-wrap:wrap; margin-bottom:var(--sp-4); }
.fw .dlist { list-style:none; margin:0; padding:0; }
.fw .dlist li { display:flex; gap:14px; align-items:flex-start; padding:12px 0;
  border-top:1px solid rgba(255,255,255,.16); }
.fw .dmark { width:9px; height:9px; flex:none; margin-top:5px;
  clip-path:polygon(0 0, 26% 0, 45% 62%, 64% 0, 100% 0, 58% 100%, 43% 100%); }
.fw .dlist li[data-ok="1"] .dmark { background:#a5bdb4; }
.fw .dlist li[data-ok="0"] .dmark { background:#d9aeab; }
.fw .dlabel { display:block; font-size:var(--fs-3); font-weight:var(--fw-med); color:var(--reverse); }
.fw .ddetail { display:block; font-size:var(--fs-2); color:#bcbdbd; margin-top:3px; max-width:56ch; }
.fw .lp-dark .vd-ok { color:#a5bdb4; } .fw .lp-dark .vd-no { color:#d9aeab; }
.fw .lp-dark .lp-note { color:#9b9c9d; }
.fw .lp-dark .btn { background:var(--reverse); border-color:var(--reverse); color:var(--ink); }
.fw .lp-dark .btn:hover { background:#fff; border-color:#fff; }
/* On paper the secondary button is a lighter fill; on ink that reads as the
   same button twice, because both end up pale on dark. It becomes an outline
   here so the hierarchy survives the inversion — one filled, one drawn. */
.fw .lp-dark .btn-2 { background:transparent; border-color:#676869; color:var(--reverse); }
.fw .lp-dark .btn-2:hover { background:rgba(255,255,255,.09); border-color:var(--reverse); color:var(--reverse); }
.fw .lp-dark .btn-2:active { background:rgba(255,255,255,.15); border-color:var(--reverse); }
.fw .lp-dark .linkbtn { color:#e2e3e3; }
.fw .lp-dark .linkbtn:hover { color:#ffffff; }
.fw .lp-dark :focus-visible { outline-color:var(--reverse); }
.fw .dlist li > span:last-child { margin-left:auto; }
@media (max-width:900px) { .fw .ddemo-ctl { flex-direction:column; } }
.fw .stagebar { display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); border:1px solid var(--line);
  border-bottom:0; }
.fw .stagebar button { display:flex; flex-direction:column; gap:6px; align-items:flex-start; padding:14px 16px;
  background:var(--surface); border:0; border-right:1px solid var(--line); cursor:pointer; text-align:left;
  font-size:var(--fs-3); font-weight:var(--fw-med); color:var(--ink-3); font-family:inherit; }
.fw .stagebar button:last-child { border-right:0; }
.fw .stagebar button:hover { color:var(--ink-2); }
.fw .stagebar button[data-on="1"] { background:var(--card); color:var(--ink); box-shadow:inset 0 3px 0 var(--brand); }
.fw .stage-n { font-size:var(--fs-1); letter-spacing:0.04em; color:var(--ink-3); }
.fw .stagebar button[data-on="1"] .stage-n { color:var(--brand); }
.fw .stage-body { border:1px solid var(--line); background:var(--card); padding:var(--sp-6);
  min-height:430px; animation:stagein 170ms cubic-bezier(.4,0,.2,1) both; }
@keyframes stagein { from { opacity:0; } to { opacity:1; } }
.fw .stagebar button { transition:background-color var(--t), color var(--t); }
@media (prefers-reduced-motion: reduce) {
  .fw .stage-body { animation:none; }
  .fw .stagebar button { transition:none; }
}
.fw .hstage { display:grid; grid-template-columns:minmax(0,1fr) 44px minmax(0,1fr); align-items:stretch; }
.fw .hlink { display:flex; align-items:center; justify-content:center; }
.fw .hlink span { display:block; width:100%; height:1px; background:var(--line); }
.fw .hpanel { border:1px solid var(--line); background:var(--paper); }
.fw .hpanel-on { border-color:var(--ink); background:var(--card); box-shadow:inset 0 0 0 1px var(--ink); }
.fw .hpanel-h { display:flex; justify-content:space-between; align-items:center; gap:12px;
  padding:10px 16px; border-bottom:1px solid var(--line-soft); }
.fw .hpanel-who { font-size:var(--fs-1); letter-spacing:0.04em; color:var(--ink-3); }
.fw .hpanel-b { padding:16px; }
.fw .hpanel-rows { margin:14px 0 0; }
.fw .hpanel-rows > div { display:grid; grid-template-columns:minmax(0,11ch) minmax(0,1fr); gap:14px;
  padding:8px 0; border-top:1px solid var(--line-soft); }
.fw .hpanel-rows dt { font-size:var(--fs-2); color:var(--ink-3); }
.fw .hpanel-rows dd { margin:0; font-size:var(--fs-2); color:var(--ink); }
.fw .hactor { display:flex; align-items:center; gap:14px; flex-wrap:wrap; margin-top:var(--sp-5);
  padding-top:var(--sp-4); border-top:1px solid var(--line); }
@media (max-width:900px) {
  .fw .stagebar { grid-template-columns:1fr 1fr; }
  .fw .stagebar button { border-bottom:1px solid var(--line); }
  .fw .hstage { grid-template-columns:minmax(0,1fr); gap:var(--sp-3); }
  .fw .hlink { height:20px; }
  .fw .hlink span { width:1px; height:100%; margin:0 auto; }
  .fw .stage-body { padding:var(--sp-4); }
}
@media (max-width:560px) { .fw .reqrow { flex-wrap:wrap; gap:var(--sp-2); } }
.fw .journey { list-style:none; margin:0; padding:0; border-top:1px solid var(--ink); }
.fw .journey li { display:flex; gap:var(--sp-4); align-items:baseline; padding:var(--sp-3) 0;
  border-bottom:1px solid var(--line); }
.fw .journey li[data-status="locked"] .j-t, .fw .journey li[data-status="locked"] .j-d { color:var(--ink-3); }
.fw .journey .j-n { font-size:var(--fs-2); letter-spacing:0.03em; color:var(--ink-3); width:22px; flex:none; }
.fw .journey .j-t { display:block; font-size:var(--fs-3); font-weight:var(--fw-med); }
.fw .journey .j-d { display:block; font-size:var(--fs-2); color:var(--ink-2); margin-top:2px; max-width:var(--m-lead); }
.fw .journey .j-s { flex:none; }
@media (max-width:560px) { .fw .journey li { flex-wrap:wrap; } .fw .journey .j-s { margin-left:38px; } }
.fw .statusblock { border:var(--bw) solid var(--line); padding:var(--sp-4) var(--sp-5); background:var(--card); }
.fw .statusblock.sb-error { border-color:var(--clay-line); }
.fw .statusblock.sb-success { border-color:var(--pine-line); }
.fw .statusblock.sb-loading { background:var(--surface); }
.fw .sb-mark { width:9px; height:9px; flex:none; align-self:center;
  clip-path:polygon(0 0, 26% 0, 45% 62%, 64% 0, 100% 0, 58% 100%, 43% 100%); }
.fw .sb-mark-grey { background:var(--ink-3); }
.fw .sb-mark-pine { background:var(--pine); }
.fw .sb-mark-clay { background:var(--clay); }
/* Section opener: the mark at 13px, above the heading, on the page's major turns */
.fw .sb-head { font-size:var(--fs-4); font-weight:var(--fw-bold); }
.fw .sb-body { font-size:var(--fs-3); line-height:var(--lh-body); color:var(--ink-2); max-width:var(--m-body); margin-top:var(--sp-1); }
.fw .sb-loading .sb-head::after { content:"…"; }


/* Default off. The 760px query below turns it on, and nothing later overrides it. */
.fw .stickycta { display:none; }
/* Tail padding for pages that carry the sticky bar, declared here rather than
   inline on each page. It used to be an inline paddingBottom, which beat the
   86px rule below on mobile and so had to stay larger than the bar whether or
   not that suited the page. With both values in the stylesheet, desktop can be
   tight and mobile still reserves room for the bar. */
.fw .has-sticky { padding-bottom:var(--tail); }
@media (max-width: 760px) {
  .fw .stickycta { display:block; position:fixed; left:0; right:0; bottom:0; z-index:75;
    background:var(--card); border-top:1px solid var(--ink); padding:11px 16px 13px; }
  .fw { --tail:86px; }
  .fw .has-sticky { padding-bottom:var(--tail); }
  /* has-sticky reserves the bar's space inside main, but the footer comes
     after main and got no reservation at all — measured, the bar covered
     the contact address and two footer links at the bottom of the scroll and
     elementFromPoint said they could not be tapped. The sibling selector
     means only a page that actually renders the bar pays for it. */
  .fw .stickycta ~ .foot { padding-bottom:calc(var(--tail) + 28px); }
  .fw .shell { flex-direction:column; }
  .fw .rail { width:100%; border-right:0; border-bottom:1px solid var(--line); }
  .fw .nav { flex-direction:row; overflow-x:auto; padding:6px 10px; gap:4px; }
  .fw .nav button:not(.btn) { width:auto; white-space:nowrap; justify-content:center; }
  .fw .grid-2, .fw .grid-4, .fw .cardgrid { grid-template-columns:1fr; }
  
  .fw .page { padding:20px 16px 60px; }
  .fw .topbar { padding:0 16px; }
  .fw .d2 { font-size:var(--fs-7); }
  .fw .hero { padding-block:44px 36px; }
  .fw .tbl th, .fw .tbl td { padding:10px 12px; }
  .fw .hide-s { display:none; }
  .fw .grid-4 > * { border-right:0 !important; border-bottom:1px solid var(--line-soft); }
}
@media (pointer: coarse) {
  .fw .btn { min-height:var(--tap); }
  .fw .btn-sm { min-height:var(--tap); }
  .fw .nav button:not(.btn), .fw .frame-rail button:not(.btn), .fw .mobpanel button { min-height:var(--tap); }
  .fw .input, .fw .select { min-height:var(--tap); }
  .fw .tbl td { padding-top:14px; padding-bottom:14px; }
  /* A .linkbtn in a table cell is the row's action ("Open checkout"). As inline
     text only its glyph box is tappable, about 16px tall, so the cell padding
     around it is dead space that looks tappable and is not. */
  .fw .tbl .linkbtn { display:inline-flex; align-items:center; min-height:var(--tap); }
  /* Footer navigation sat at 30px on every page. These are ordinary navigation
     links, not prose, so they get the same target as any other control. */
  .fw .footlink { display:flex; align-items:center; min-height:var(--tap); padding:0; }
  .fw .mobmenu, .fw .skiplink { min-height:var(--tap); }
  /* The wordmark is the "go home" control and wraps a 20px mark, so its link box
     was 23px tall. Targeted by its label rather than by adding a class to all
     fifteen places that render it. */
  .fw [aria-label="Veyro, home"] { display:inline-flex; align-items:center; min-height:var(--tap); }
  /* A .linkbtn alone in its paragraph is a standalone control ("Every question,
     with the longer answers", the support address in the footer), not a link
     inside a sentence, so it gets a real target. Links WITH text around them are
     deliberately untouched: WCAG exempts them, and padding one out would break
     the line it sits in. */
  .fw p > .linkbtn:only-child { display:inline-flex; align-items:center; min-height:var(--tap); }
  /* "See the payment" / "Mark read" on a notification are standalone controls
     sitting in a row, not links inside a sentence. */
  .fw .n-actions .linkbtn { display:inline-flex; align-items:center; min-height:var(--tap); }
}
@media (max-width: 420px) {
  .fw .d2 { font-size:var(--fs-7); }
  .fw .wordmark-hero { font-size:var(--wm-sm); font-stretch:110%; }
  .fw .tagline { font-size:var(--fs-5); }
  
  .fw .page { padding:16px 12px 56px; }
  .fw .tbl th, .fw .tbl td { padding:9px 10px; font-size:var(--fs-2); }
  .fw .card-b, .fw .card-h, .fw .card-f { padding-left:13px; padding-right:13px; }
  .fw .band-key { gap:0 14px; }
}
`;

export const CSS2 = `
.fw .wordmark { display:inline-block; line-height:1; white-space:nowrap;
  font-family:var(--display); font-weight:var(--display-wght); font-stretch:var(--display-wdth);
  letter-spacing:-0.035em; }
.fw .wordmark-hero { font-size:var(--wm-lg); }
/* The cropped viewBox makes the SVG's bottom edge the baseline, so no vertical
   nudge is needed and the alignment holds at every size. */
/* 0.72em is Archivo's cap height. Expressed in em so the V tracks the type at
   every size, including inside a media query. */
.fw .wm-v { display:inline-block; vertical-align:baseline; height:0.72em; width:auto;
  margin-right:var(--wm-kern); letter-spacing:normal; }
.fw .wm-rest { display:inline; }
/* text-wrap:balance evens the two lines instead of letting the last word fall
   alone. The headline changed from four words to eight and a 26ch measure left
   "for." orphaned on its own line, which reads as a mistake at hero size.
   Browsers without it simply wrap as before. */
.fw .tagline { display:block; font-size:var(--fs-6); line-height:1.36; letter-spacing:-0.014em;
  font-weight:var(--fw-reg); color:var(--ink-2); margin-top:var(--sp-5); max-width:30ch;
  text-wrap:balance; }
.fw h1.hero-h { margin:0; }
.fw .mark { display:block; flex:none; }
.fw .brand { display:inline-block; line-height:1; }
.fw .lp-links { display:flex; align-items:center; gap:4px; flex-wrap:wrap; justify-content:flex-end; }
.fw .lp-links button:not(.btn) { background:none; border:0; padding:7px 11px; border-radius:0; font-size:var(--fs-3);
  color:var(--ink-2); cursor:pointer; display:inline-flex; align-items:center; justify-content:center; text-align:center; }
.fw .lp-links button:not(.btn):hover { background:var(--surface-2); color:var(--ink); }
/* Section rhythm.
   72px top and bottom meant 144px of nothing between every two sections, which
   measured as the largest empty runs on the site and read as the page having
   been padded out. 48 is still an unmistakable break — there is a rule line at
   every boundary doing that work — while putting the next section's first line
   most of a screen earlier on a long page. */
.fw section.lp { padding:var(--lp-pad) 0; border-top:1px solid var(--line);
  scroll-margin-top:calc(var(--nav-h) + var(--sp-4)); }
.fw [id]:focus { outline:none; }
.fw #main { scroll-margin-top:calc(var(--nav-h) + var(--sp-4)); }
.fw section.lp:nth-of-type(even) { background:var(--surface); }

/* ---- chapters -----------------------------------------------------------
   The landing page is nine chapters, not fifteen sections, and the spacing
   between them is the thing that says so. Every section used to carry the same
   72px top and bottom, which is 144px between every pair — a uniform rhythm
   that reads as a list however different the content is.

   Each chapter now states its own top and bottom, and the gap between two
   chapters is the sum of the pair. The ladder, desktop:

     1 -> 2   112px   large
     2 -> 3   176px   the largest on the page
     3 -> 4   176px   the largest on the page
     4 -> 5    96px   moderate
     5 -> 6    96px   moderate
     6 -> 7   144px   large
     7 -> 8   104px   moderate
     8 -> 9   160px   second largest

   The two 176s bracket the wallet, which is the chapter everything else is
   arranged around. The 160 before the final call is the page arriving
   somewhere rather than continuing.

   .ch also turns off the nth-of-type(even) striping, because a chapter's
   ground is a decision about that chapter, not about whether it happens to be
   even.

   The selectors name the element deliberately. Written as .fw .ch-3 they are
   (0,2,0) and lose to .fw section.lp at (0,2,1), which is how the first
   attempt shipped nine chapters all still 72px apart — every measured gap came
   back 144px and identical. */
/* No rule at the top of a chapter.
   Every boundary was being signalled twice: the ground changes AND a 1px
   hairline draws across it. The hairline is 1.29:1 against white where the
   tint is only 1.072:1, so the line was doing most of the work — and two
   separators at every single boundary is what turns rhythm into a metronome,
   the page reading as ruled-off sections rather than one surface that shifts.
   The tonal change alone is enough, and it is quiet enough to feel continuous.
   Chapter 9 needs no help either; ink against paper is not subtle. */
.fw section.ch { background:transparent; border-top:0; }
.fw section.ch-surface { background:var(--surface); }
.fw section.ch-ink { background:var(--ink); }

/* 68 on top, not 52. The hero's bottom padding came down from 60 to 44 when
   it was compressed, which would have quietly dropped this boundary from the
   published 112 to 96. The gap is the thing that was specified, so it is held
   from this side instead. */
.fw section.ch-2 { padding:68px 0 56px; }
.fw section.ch-3 { padding:120px 0; }
.fw section.ch-4 { padding:56px 0 48px; }
.fw section.ch-5 { padding:48px 0; }
.fw section.ch-6 { padding:48px 0 56px; }
.fw section.ch-7 { padding:88px 0 56px; }
.fw section.ch-8 { padding:48px 0 64px; }
.fw section.ch-9 { padding:96px 0; }

/* Roughly 0.6 of the desktop ladder. The proportions are kept — the wallet
   still gets the most room and the ending still gets the second most — but a
   176px gap on a phone is a screenful of nothing. */
@media (max-width:900px) {
  .fw section.ch-2 { padding:32px 0 34px; }
  .fw section.ch-3 { padding:70px 0; }
  .fw section.ch-4 { padding:34px 0 30px; }
  .fw section.ch-5 { padding:30px 0; }
  .fw section.ch-6 { padding:30px 0 34px; }
  .fw section.ch-7 { padding:52px 0 34px; }
  .fw section.ch-8 { padding:30px 0 40px; }
  .fw section.ch-9 { padding:58px 0; }
}

/* ---- chapter 5: the two calls -------------------------------------------
   This chapter used to be three labels on a rule with an arrow between each,
   which claimed in its own comment to be a third diagram language. Measured,
   it was not: it used the same 11.5px uppercase label, the same 15.5px bold
   title and the same 12.5px grey line as chapter 4's flow, one chapter below
   it, and it was arrowed and horizontal too. Two arrowed sequences in the
   same typography read as one idea told twice. It also showed three stops
   under a heading that says "Two calls."

   So this is not a sequence. Two rows, numbered, each pairing what a call
   does with what it looks like. Mono is the medium and nothing else on the
   page uses it, which is what makes the chapter unmistakable at a glance.

   No border on the request blocks. The chapter already sits on its own
   ground, so a framed slab here would be the fourth boxed diagram — and the
   old one was 761px wide against a 543px rail, which made the code the
   larger half of a section that is not the documentation.

   The columns are --split-a / --split-b: the same split every other chapter
   uses, so the mono lands on the page's right-hand edge rather than near it.
   min-width:0 on both cells, because a pre with white-space:pre reports its
   content width as its minimum and would otherwise widen the whole grid. */
.fw .calls { list-style:none; margin:0; padding:0; display:grid; gap:var(--sp-6); }
.fw .calls > li { display:grid; grid-template-columns:var(--split-a) var(--split-b);
  gap:0 var(--sp-8); align-items:baseline; }
.fw .calls > li > * { min-width:0; }
.fw .cl-t { font-size:var(--fs-4); font-weight:var(--fw-bold); letter-spacing:-0.01em; }
.fw .cl-n { display:inline-block; min-width:1.8ch; color:var(--ink-3);
  font-weight:var(--fw-med); font-variant-numeric:tabular-nums; }
.fw .cl-d { margin:5px 0 0; font-size:var(--fs-2); line-height:1.5; color:var(--ink-3); }
.fw .cl-c { margin:0; font-family:var(--code); font-size:var(--fs-2); line-height:1.7;
  color:var(--ink-2); white-space:pre; overflow-x:auto; tab-size:2; }
/* 900, not 760: that is where .truthgrid stacks, and two adjacent sections
   changing shape at different widths is the kind of seam nobody can name but
   everybody feels. Wrapping rather than scrolling below it, because the
   status line is 361px against a 288px column on a small phone and a code
   block you have to drag sideways is worse than one that wraps. */
@media (max-width:900px) {
  .fw .calls > li { grid-template-columns:minmax(0,1fr); gap:10px; }
  .fw .cl-c { white-space:pre-wrap; word-break:break-word; }
}

/* ---- chapter 6: the relationship spine ----------------------------------
   .tl was written into this stylesheet and never used by anything. It is a
   vertical spine with circular dots, which is the right shape for "who is
   involved" — a relationship rather than a sequence — and the wrong shape for
   both of the other two diagrams. These add only what it needs to carry a
   title and a line of detail. */
.fw .tl .tl-t { display:block; font-size:var(--fs-4); font-weight:var(--fw-bold); letter-spacing:-0.01em; }
.fw .tl .tl-d { display:block; font-size:var(--fs-2); line-height:1.5; color:var(--ink-3); margin-top:3px;
  max-width:56ch; }
.fw .tl li { padding-bottom:var(--sp-6); }

/* ---- chapter 8: the commitments, one line each --------------------------
   Six paragraphs became six lines. The full versions are on /about, which the
   chapter links. */
/* The six money states, beside the wallet. A definition list because that is
   what it is: a term and what it means. Two columns so six rows do not run the
   height of the card next to them. */
.fw .states { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:14px var(--sp-7);
  margin:0; }
.fw .states > div { min-width:0; border-top:1px solid var(--line); padding-top:10px; }
.fw .states dt { font-size:var(--fs-3); font-weight:var(--fw-med); }
.fw .states dd { margin:2px 0 0; font-size:var(--fs-2); line-height:1.45; color:var(--ink-3); }
@media (max-width:760px) { .fw .states { grid-template-columns:1fr; } }


.fw .commits { list-style:none; margin:0; padding:0; display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px var(--sp-8); }
.fw .commits li { display:flex; gap:10px; align-items:baseline; font-size:var(--fs-3);
  line-height:1.5; color:var(--ink-2); }
.fw .commits .ck-t { color:var(--pine); flex:none; font-weight:var(--fw-bold); }
@media (max-width:760px) { .fw .commits { grid-template-columns:1fr; } }

/* ---- chapter 8: the story, with nothing around it -----------------------
   Five chapters of product interface, then one quote on open ground. The reset
   is the point, so it gets no card, no border and no figure. */
.fw .story { max-width:30ch; font-size:var(--lp-3); line-height:1.35; letter-spacing:-0.018em;
  font-weight:var(--fw-bold); }
.fw .story-by { display:block; font-size:var(--fs-2); color:var(--ink-3); margin-top:var(--sp-5);
  font-weight:var(--fw-reg); letter-spacing:0; }
.fw section.lp.lp-dark { background:var(--ink); }
.fw section.lp:first-of-type { border-top:0; }
.fw .skiplink { position:absolute; left:-9999px; top:0; z-index:200; background:var(--brand); color:var(--reverse);
  padding:10px 16px; font-size:var(--fs-3); font-weight:var(--fw-bold); }
.fw .skiplink:focus { left:0; }
.fw .progress { position:fixed; top:0; left:0; right:0; height:2px; background:transparent; z-index:90; }
.fw .progress i { display:block; height:100%; background:var(--brand); }
.fw .totop { position:fixed; right:24px; bottom:96px; z-index:70; display:flex; align-items:center; gap:9px;
  background:var(--card); border:1px solid var(--ink); color:var(--ink); font-size:var(--fs-2); font-weight:var(--fw-bold);
  letter-spacing:0.02em; padding:6px 13px 6px 6px; cursor:pointer; }
.fw .totop:hover { background:var(--surface); }
@media (pointer: coarse) { .fw .totop { min-height:var(--tap); } }
.fw .totop-mark { width:23px; height:23px; background:var(--brand); display:flex; align-items:center;
  justify-content:center; flex:none; }
.fw .lp-nav { border-bottom:1px solid transparent; }
.fw .navbar { position:sticky; top:0; z-index:60; background:var(--paper);
  border-bottom:1px solid transparent; }
/* A scroll-driven animation, so the nav gains its edge as the page moves under
   it without a scroll listener, a re-render or a single line of JavaScript.
   Behind @supports because Safari and Firefox do not have it yet: there, the
   nav simply stays as it is, which is the state it has today. Nothing is
   hidden or broken by its absence. */
@supports (animation-timeline: scroll()) {
  @keyframes veyro-nav {
    to { border-bottom-color:var(--line); background:var(--nav-veil);
         backdrop-filter:saturate(1.4) blur(10px); }
  }
  .fw .navbar { animation:veyro-nav linear both; animation-timeline:scroll();
    animation-range:0 96px; }
  /* The blur is the expensive part and the least of the effect. Asked for less
     motion, the nav keeps its hairline and drops the rest. */
  @media (prefers-reduced-motion: reduce) {
    .fw .navbar { animation:none; border-bottom-color:var(--line); backdrop-filter:none; }
  }
}
.fw .lp-nav.sticky { background:transparent; }
.fw .lp-nav.sticky[data-scrolled="1"] { border-bottom-color:var(--line); }
.fw .tblwrap { overflow-x:auto; -webkit-overflow-scrolling:touch; }
.fw .tblwrap .tbl { min-width:520px; }
/* Except in the hero, whose two sample tables are two and three simple
   columns, not the dense data tables that floor was written for. At 375 the
   520px floor pushed the amounts 205px off screen, so every phone visitor met
   a wallet showing "Earned / Still settling / Already paid out" with nothing
   beside them — labels and no money, on the one visual the page is built
   around. */
.fw .hero-band .tblwrap .tbl { min-width:0; }
.fw .disc { border-bottom:1px solid var(--line); }
.fw .disc-q { display:flex; width:100%; justify-content:space-between; align-items:baseline;
  gap:var(--sp-5); padding:var(--sp-4) 0; background:transparent; border:0; cursor:pointer;
  text-align:left; font-size:var(--fs-4); font-weight:var(--fw-bold); color:var(--ink);
  font-family:inherit; letter-spacing:-0.008em; }
.fw .disc-q:hover { color:var(--brand); }
.fw .disc-sign { position:relative; width:11px; height:11px; flex:none; align-self:center; }
.fw .disc-sign::before, .fw .disc-sign::after { content:""; position:absolute; background:var(--ink-3); }
.fw .disc-sign::before { left:0; right:0; top:5px; height:1.5px; }
.fw .disc-sign::after { top:0; bottom:0; left:5px; width:1.5px;
  transition:transform var(--t-2) var(--ease), opacity var(--t-2) var(--ease); }
.fw .disc[data-open="1"] .disc-sign::after { transform:scaleY(0); opacity:0; }
.fw details.disc[open] .disc-sign::after { transform:scaleY(0); opacity:0; }
.fw details.disc[open] .disc-q { color:var(--brand); }
.fw .disc-q::-webkit-details-marker { display:none; }
.fw summary.disc-q { list-style:none; }
.fw .disc[data-open="1"] .disc-q { color:var(--brand); }
/* 0fr to 1fr animates to the content's real height with no JS measurement */
.fw .disc-panel { display:grid; grid-template-rows:0fr;
  transition:grid-template-rows var(--t-2) var(--ease); }
.fw .disc[data-open="1"] .disc-panel { grid-template-rows:1fr; }
.fw .disc-panel > div { overflow:hidden; }
.fw .disc-a { margin:0; padding:0 0 var(--sp-4); font-size:var(--fs-3); line-height:var(--lh-body);
  color:var(--ink-2); max-width:var(--m-wide); }
@media (prefers-reduced-motion: reduce) {
  .fw .disc-panel, .fw .disc-sign::after { transition:none; }
}
.fw .pwwrap { position:relative; }
.fw .pwwrap .input { padding-right:66px; }
.fw .pwtoggle { position:absolute; right:1px; top:0; bottom:0; min-height:var(--tap); padding:0 11px; background:transparent; border:0;
  font-size:var(--fs-2); font-weight:var(--fw-bold); color:var(--ink-2); cursor:pointer; }
.fw .pwtoggle:hover { color:var(--ink); }
.fw .lp-links button.mobmenu { display:none; }
.fw .mobpanel { display:none; }
.fw .mobpanel button { display:block; width:100%; text-align:left; background:transparent; border:0;
  border-bottom:1px solid var(--line-soft); padding:14px 2px; font-size:var(--fs-4); font-weight:var(--fw-med);
  color:var(--ink); cursor:pointer; }
.fw .mobpanel button:last-child { border-bottom:0; color:var(--brand); font-weight:var(--fw-bold); }
.fw .mobpanel button:hover { color:var(--brand); }
.fw .searchbar { display:flex; gap:8px; align-items:center; }
.fw .searchbar .input { height:32px; font-size:var(--fs-3); max-width:260px; }
@media (max-width:760px) {
  .fw .lp-links button.mobmenu { display:inline-flex; }
  /* Dropped beneath the bar, not laid inside it.
     As a plain block it became a flex item in .lp-links alongside the Menu
     button, and .lp-nav is a fixed 62px row with align-items:center — so a
     222px-tall panel centred the button against itself and pushed it to
     y=-209, outside the visible bar. On a phone that meant you could open the
     menu and then had nothing left to tap to close it. Absolute, anchored to
     the sticky .navbar, so the button never moves. */
  .fw .navbar { position:sticky; }
  .fw .mobpanel { display:block; position:absolute; top:100%; left:0; right:0;
    background:var(--paper); border-top:1px solid var(--line);
    border-bottom:1px solid var(--line); padding:4px var(--gut) 18px;
    max-height:calc(100dvh - 62px); overflow-y:auto; z-index:59; }
  .fw .totop { bottom:152px; right:14px; }
}
@media print {
  .fw .rail, .fw .topbar, .fw .env, .fw .cookiebar, .fw .stickycta, .fw .totop, .fw .progress,
  .fw .drawer, .fw .scrim, .fw .toasts, .fw .lp-nav, .fw .foot, .fw .btn, .fw .skiplink { display:none !important; }
  .fw { background:#fff; color:#000; font-size:11pt; }
  .fw .card, .fw .panel { border:1px solid #999; break-inside:avoid; }
  .fw .page, .fw .page-in { padding:0; max-width:none; }
  .fw .tblwrap { overflow:visible; }
  .fw .tbl { min-width:0; }
  .fw .tbl tr { break-inside:avoid; }
  .fw .hide-s { display:table-cell !important; }
  .fw a[href]::after { content:" (" attr(href) ")"; font-size:9pt; color:#555; }

  /* Same-page anchors print their own href, so every contents entry came out as
     "What Veyro is (#clause-1)". The target is on the same sheet of paper. */
  .fw a[href^="#"]::after { content:none; }

  /* .navbar is the sticky wrapper. Its contents (.lp-nav) were already hidden,
     which left an empty bar at the top of the first page. */
  .fw .navbar, .fw .mobpanel, .fw .mobmenu { display:none !important; }

  /* body paints the page ivory on screen. Paper should be paper. */
  body { background:#fff !important; }

  /* A sticky contents column means nothing on paper, and a clause split across
     two sheets mid-sentence is the one thing a printed policy must not do. */
  .fw [style*="position: sticky"], .fw [style*="position:sticky"] { position:static !important; }
  .fw section[id^="clause-"] { break-inside:avoid; }
  .fw .truthgrid { display:block; }
}
.fw .cookiebar { position:fixed; left:0; right:0; bottom:0; z-index:80; background:var(--card); border-top:1px solid var(--ink); }

.fw .linkrow { display:block; width:100%; text-align:left; background:transparent; border:0; border-bottom:1px solid var(--line); padding:15px 0; cursor:pointer; }
.fw .linkrow:hover { background:var(--surface); }
.fw .linkrow-t { display:block; font-size:var(--fs-4); font-weight:var(--fw-bold); }
.fw .linkrow-d { display:block; font-size:var(--fs-3); color:var(--ink-2); margin-top:3px; }
.fw .numbered { list-style:none; margin:0; padding:0; counter-reset:s; border-top:1px solid var(--ink); }
.fw .numbered li { counter-increment:s; display:grid; grid-template-columns:2.2rem minmax(0,15ch) minmax(0,1fr); gap:18px; padding:12px 0; border-bottom:1px solid var(--line); align-items:baseline; }
.fw .numbered li::before { content:counter(s,decimal-leading-zero); font-size:var(--fs-2); letter-spacing:0.03em; color:var(--ink-3); }
.fw .numbered li > span:first-of-type { font-size:var(--fs-4); font-weight:var(--fw-bold); }
.fw .numbered li > span:last-of-type { font-size:var(--fs-3); color:var(--ink-2); line-height:1.55; }
@media (max-width:760px) { .fw .numbered li { grid-template-columns:2.2rem minmax(0,1fr); gap:6px 16px; }
  .fw .numbered li > span:last-of-type { grid-column:2; } }
.fw .ruled { margin:0; border-top:1px solid var(--ink); }
.fw .ruled > div { display:grid; grid-template-columns:minmax(0,16ch) minmax(0,1fr); gap:24px; padding:13px 0; border-bottom:1px solid var(--line); }
.fw .ruled dt { font-size:var(--fs-4); font-weight:var(--fw-bold); letter-spacing:-0.006em; }
.fw .ruled dd { margin:0; font-size:var(--fs-3); line-height:1.6; color:var(--ink-2); }
@media (max-width:760px) { .fw .ruled > div { grid-template-columns:1fr; gap:5px; } }
.fw .arrowlist { list-style:none; margin:0; padding:0; }
.fw .arrowlist li { padding:5px 0 5px 0; font-size:var(--fs-3); color:var(--ink-2); position:relative; }
.fw .arrowlist li + li { border-top:1px solid var(--line-soft); }
.fw .ctx { display:flex; align-items:center; gap:9px; margin:0 16px 10px; padding:0 0 12px; border-bottom:1px solid var(--line); }
.fw .initials { width:26px; height:26px; background:var(--brand); color:var(--reverse); font-size:var(--fs-1); font-weight:var(--fw-bold); letter-spacing:0.02em; display:flex; align-items:center; justify-content:center; flex:none; }
.fw .ctx-n { display:block; font-size:var(--fs-2); font-weight:var(--fw-med); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.fw .ctx-s { display:flex; align-items:center; gap:5px; font-size:var(--fs-1); color:var(--ink-3); margin-top:1px; }
.fw .nav button { color:var(--ink-2); }
.fw .nav button svg { color:var(--ink-3); }
.fw .nav button[data-on="1"] svg { color:var(--ink); }
.fw .frame { border:1px solid var(--line); overflow:hidden; background:var(--card); }
.fw .frame-bar { height:34px; background:var(--surface); border-bottom:1px solid var(--line); display:flex; align-items:center; padding:0 16px; gap:6px; }
.fw .frame-body { display:flex; min-height:250px; }
.fw .frame-rail { width:122px; flex:none; border-right:1px solid var(--line); background:var(--surface); padding:8px; }
.fw .frame-rail button:not(.btn) { width:100%; font-size:var(--fs-1); color:var(--ink-3); padding:6px 8px; border-radius:0;
  display:flex; align-items:center; gap:7px; background:transparent; border:0; cursor:pointer; text-align:left; }
.fw .frame-rail button:hover { background:var(--surface-2); color:var(--ink-2); }
.fw .frame-rail button[data-on="1"] { background:var(--card); color:var(--ink); box-shadow:inset 0 0 0 1px var(--line); font-weight:var(--fw-bold); }
.fw .frame-rail button[data-on="1"] svg { color:var(--brand); }
.fw .frame-main { flex:1 1 auto; padding:16px; min-width:0; min-height:196px; }

.fw .hrow { display:flex; align-items:center; gap:10px; padding:8px 0; border-top:1px solid var(--line-soft); }
.fw .hrow:first-child { border-top:0; padding-top:2px; }
.fw .hrow-t { display:block; font-size:var(--fs-3); font-weight:var(--fw-med); }
.fw .hrow-s { display:block; font-size:var(--fs-1); color:var(--ink-3); margin-top:1px; }
.fw .lp-dark { background:var(--ink); border-top:0; }
/* When the dark band is the last thing on the page, main's tail padding would
   show a strip of paper beneath it and make the band look misplaced rather
   than like the floor of the page. It absorbs that padding instead, so the
   colour runs to the footer while the space the sticky bar needs is kept. */
.fw main > section.lp-dark:last-child {
  margin-bottom:calc(-1 * var(--tail));
  padding-bottom:calc(var(--lp-pad) + var(--tail)); }
/* --lp-pad is the pre-ladder section padding, 72px. The closing chapter has
   had its own 96px since the rebuild, so the rule above was quietly giving
   the ending 96px of air above the heading and 72 below the button. The
   ending should not taper. */
.fw main > section.lp-dark.ch-9:last-child { padding-bottom:calc(96px + var(--tail)); }
@media (max-width:900px) {
  .fw main > section.lp-dark.ch-9:last-child { padding-bottom:calc(58px + var(--tail)); }
}
.fw .lp-dark .d1, .fw .lp-dark .d2, .fw .lp-dark h2, .fw .lp-dark .statement { color:var(--reverse); }
.fw .lp-dark .body, .fw .lp-dark .small, .fw .lp-dark .lead { color:#bcbdbd; }
.fw .lp-dark .tiny { color:#9b9c9d; }
.fw .lp-center { text-align:center; }
.fw .lp-center .mark { margin-left:auto; margin-right:auto; }
.fw .lp-center .statement, .fw .lp-center .statement-sub, .fw .lp-center .d2 { margin-left:auto; margin-right:auto; }
.fw .lp-center .sec-h { margin-left:auto; margin-right:auto; }
.fw .lp-center .lp-h2, .fw .lp-center .lp-h1, .fw .lp-center .body,
.fw .lp-center .lead, .fw .lp-center .sec-lead { margin-left:auto; margin-right:auto; }
/* ==== chapter compositions ==============================================
   Every chapter opened the same way: eyebrow, heading and paragraph from
   x=48, then the content beside or below. Measured, eight of the nine
   headings sat on that one left edge, so the page read as one component
   template repeated nine times however different the content was.

   The shared edge is also what makes a page feel like one system rather
   than a deck, so the variation here happens INSIDE the existing grid and
   tokens: same container, same --split-a/--split-b, same ladder. What
   changes is where each chapter puts its weight, chosen from what the
   chapter is saying rather than by alternating sides.

     1  hero          left, asymmetric    split, product-led
     2  what you get  centred head        a rail distributed beneath it
     3  the wallet    centred, monumental the product at the optical centre
     4  money moves   centred head        the diagram owns the full width
     5  two calls     RIGHT-WEIGHTED      the one hard directional break
     6  the guardian  centred             a spine down the middle
     7  eligibility   centred             a compact tool, not a chapter
     8  commitments   sidebar heading     heading beside the grid, not above
        the story     centred, narrow     large type on open ground
        questions     centred, narrow     a reading column
     9  the ending    centred, scaled     the only heading bigger than 44px

   Two chapters are deliberately held off centre. Seven centred chapters in
   a row is the same failure as nine left-aligned ones, just symmetrical. */

/* Centred head block. The HEAD only: body copy under it keeps its own
   alignment, because centred prose is measurably slower to read and this
   page spends its length asking to be believed. */
.fw .headc { text-align:center; }
.fw .headc .lp-h2, .fw .headc .lp-lead, .fw .headc .sec-lead,
.fw .headc .body, .fw .headc .small { margin-left:auto; margin-right:auto; }
.fw .centred-note { text-align:center; }

/* 3. The wallet at the optical centre. Wider than the 7fr column it used to
   sit in, not narrower: 920px against 760. The six states become the
   supporting band underneath rather than a left-hand reading column.
   .segwrap stretches so its tabs can wrap on a narrow screen; at 920 that
   left a third of the strip as empty chrome, so here it hugs its tabs and
   only fills when it actually has to wrap. */
.fw section.ch-3 { --stage-w:920px; }
.fw .stage { max-width:var(--stage-w,920px); margin-left:auto; margin-right:auto; }
.fw .stage .segwrap { width:fit-content; max-width:100%; }
/* The closing sentence is a caption for the product, so it takes the
   product's width. Measured, it ran as a single 1072px line under a 920px
   wallet — wider than the thing it explains, which reads as a page-level
   paragraph that happens to sit there rather than as the wallet's own note.
   One custom property, so the two cannot drift apart. */
.fw section.ch-3 .centred-note { max-width:var(--stage-w); margin-left:auto; margin-right:auto;
  text-wrap:balance; }
/* The link is one phrase, so it wraps as one. At the caption's new width it
   otherwise broke after "How", which reads as a typo rather than a line
   break. 190px at 14px, against 288px of container on the narrowest phone. */
.fw section.ch-3 .centred-note .linkbtn { white-space:nowrap; }
@media (min-width:901px) {
  .fw section.ch-3 .states { max-width:1100px; margin-left:auto; margin-right:auto;
    grid-template-columns:repeat(3,minmax(0,1fr)); column-gap:var(--sp-8); }
}

/* 5. Head beside the calls. This chapter used to push everything into the
   outer two thirds, which held its own at 1440 but left 528px of dead
   ground at 1920 — a documentation column shoved right rather than a
   composition. It leans on the same --split-a/--split-b as the rest of the
   page instead, so it is still asymmetric and still not centred, but it
   uses the whole canvas.

   Inside the 7fr column the calls stack their words above their request:
   splitting them again would give the mono about 366px at 1280 against a
   390px longest line, and a code block that scrolls sideways on a desktop
   is worse than one that sits under its own sentence. */
.fw .calls-grid { display:grid; grid-template-columns:var(--split-a) var(--split-b);
  gap:var(--sp-8); align-items:start; }
.fw .calls-grid > * { min-width:0; }
.fw .calls-grid .calls { gap:var(--sp-7); }
.fw .calls-grid .calls > li { grid-template-columns:minmax(0,1fr); gap:9px; }

/* 6. The spine down the middle. 460px keeps the dots near the optical centre
   while the lines of detail stay a comfortable measure. The connector between
   the dots was --line at 1.29:1, which at this size read as four bullets
   rather than one spine; --control-line is the token for a boundary that has
   to be seen, and a relationship diagram that does not connect is just a
   list. */
.fw section.ch-6 .tl { max-width:460px; margin-left:auto; margin-right:auto; }
.fw section.ch-6 .tl li::before { background:var(--control-line); }

/* 7. The checker as an object rather than a chapter: one compact card in the
   middle with location, year and Check on a single row. */
.fw .tool { max-width:780px; margin-left:auto; margin-right:auto; }

/* 8. Heading beside its grid, not above it. Full width and editorial, and
   the page's second anchor on the left edge after the hero — without it the
   lower half of the page is centred the whole way down. */
.fw .band-side { display:grid; grid-template-columns:minmax(0,4fr) minmax(0,8fr);
  gap:var(--sp-8); align-items:start; }
.fw .band-side > * { min-width:0; }

/* The story, centred and quiet. 34ch of 26px type with nothing beside it. */
.fw .quote-c { max-width:34ch; margin-left:auto; margin-right:auto; text-align:center; }
.fw .quote-c .story { max-width:none; }
.fw .quote-c .story-by { margin-top:var(--sp-6); }

/* The questions in a reading column, narrower than anything above them. */
.fw .readcol { max-width:640px; margin-left:auto; margin-right:auto; }

/* 9. The ending is the only heading on the page allowed past 44px. Scale is
   what makes it read as a conclusion rather than a tenth section. */
.fw section.ch-9 .lp-h2 { font-size:var(--lp-1); line-height:1.04; max-width:16ch; }

@media (max-width:900px) {
  /* Mobile gets its own composition rather than the desktop one folded flat:
     the offset chapter returns to full width, the sidebar heading sits back
     above its grid, and the centred blocks stay centred. */
  .fw .calls-grid { grid-template-columns:minmax(0,1fr); gap:var(--sp-6); }
  .fw .band-side { grid-template-columns:minmax(0,1fr); gap:var(--sp-6); }
  .fw .stage, .fw .tool, .fw .readcol { max-width:none; }
  .fw section.ch-3 { --stage-w:none; }
  .fw section.ch-6 .tl { max-width:none; }
}

/* ==== founder dashboard: hierarchy by container, not by repetition =======
   Nine <Section> cards in two columns, every one the same border, the same
   padding and the same visual weight — and the wallet rendered twice, once as
   a $207.00 card at the top and again as a $186.27 fold halfway down. A
   founder opening this could not tell what mattered, and the two money
   figures actively contradicted each other.

   These are the containers that break the stack: one dark hero for the money,
   a rail of unboxed figures for the numbers that are context rather than
   content, and a spine for payouts, which are a sequence and were a table. */

/* The money, as the one thing on the page with real scale. Dark because
   nothing else here is: on a page of white cards a dark band is the only
   hierarchy signal that cannot be missed, and it is the same reversal the
   marketing page ends on, so the product looks like what was promised. */
.fw .wallethero { background:var(--ink); color:var(--reverse); padding:var(--sp-8) var(--sp-7);
  margin-bottom:var(--sp-7); }
.fw .wallethero .wh-label { display:block; font-size:var(--fs-2); letter-spacing:0.02em;
  color:#9b9c9d; }
.fw .wallethero .wh-big { display:block; font-size:var(--fs-10); line-height:1.02;
  letter-spacing:-0.03em; font-weight:var(--fw-bold); font-variant-numeric:tabular-nums;
  margin-top:var(--sp-2); }
.fw .wallethero .wh-sub { display:block; font-size:var(--fs-3); color:#bcbdbd; margin-top:var(--sp-3);
  max-width:46ch; }
/* The breakdown, on one rule. Every figure a founder might question about the
   big number above, in the order the money actually moves through them. */
.fw .wh-break { display:grid; grid-auto-flow:column; grid-auto-columns:minmax(0,1fr);
  gap:var(--sp-5); margin-top:var(--sp-7); padding-top:var(--sp-5);
  border-top:1px solid rgba(255,255,255,.17); }
.fw .wh-break > div { min-width:0; }
.fw .wh-break dt { display:block; font-size:var(--fs-2); color:#9b9c9d; }
.fw .wh-break dd { display:block; margin:3px 0 0; font-size:var(--fs-5); font-weight:var(--fw-med);
  font-variant-numeric:tabular-nums; }
/* Settled money is pine everywhere else on the site, so it is pine here. On
   this ground the light tint carries it; --pine itself is 2.01:1 on ink. */
.fw .wh-break dd[data-tone="settled"] { color:#a5bdb4; }
.fw .wh-break dd[data-tone="out"] { color:#d9aeab; }
.fw .wallethero .row { margin-top:var(--sp-6); }
/* The breakdown, folded away.
   Five figures on a rule under the headline number meant the first thing a
   founder saw was six numbers, not one. They are still here, still exact, one
   click down: the question "how much do I have" gets answered before the
   question "why is it that much" is even asked. */
.fw .wh-more { margin-top:var(--sp-6); border-top:1px solid rgba(255,255,255,.17);
  padding-top:var(--sp-4); }
.fw .wh-more > summary { list-style:none; cursor:pointer; display:inline-flex;
  align-items:center; gap:8px; font-size:var(--fs-2); color:#bcbdbd; }
.fw .wh-more > summary::-webkit-details-marker { display:none; }
.fw .wh-more > summary:hover { color:var(--reverse); }
.fw .wh-more > summary::after { content:"+"; font-size:var(--fs-4); line-height:1; color:#9b9c9d; }
.fw .wh-more[open] > summary::after { content:"−"; }
.fw .wh-more[open] > summary { color:var(--reverse); margin-bottom:var(--sp-4); }

/* Add it to your app.
   The product id was in the page already, buried inside the href of a
   Preview link, and nowhere as text a founder could select — while the SDK
   docs tell them to paste "your-product-id" into a prompt. This is the one
   place that hands it over. */
.fw .addapp { border:1px solid var(--ink); background:var(--card);
  padding:var(--sp-6); margin-bottom:var(--sp-7); }
.fw .addapp-h { display:flex; flex-wrap:wrap; align-items:baseline; gap:8px var(--sp-4);
  margin-bottom:var(--sp-2); }
.fw .addapp-t { font-size:var(--fs-5); font-weight:var(--fw-bold); letter-spacing:-0.012em; }
.fw .addapp-d { font-size:var(--fs-3); line-height:1.5; color:var(--ink-2); max-width:64ch;
  margin:0 0 var(--sp-5); }
.fw .addapp-id { display:flex; flex-wrap:wrap; align-items:center; gap:10px;
  background:var(--surface); border:1px solid var(--line); padding:10px 12px; }
.fw .addapp-id code { font-family:var(--code); font-size:var(--fs-2); color:var(--ink);
  word-break:break-all; }
.fw .addapp-id .addapp-key { font-size:var(--fs-1); letter-spacing:0.06em;
  text-transform:uppercase; color:var(--ink-3); flex:none; }
.fw .addapp-foot { margin:var(--sp-5) 0 0; font-size:var(--fs-3); color:var(--ink-2); }
@media (max-width:560px) { .fw .addapp { padding:var(--sp-5); } }

@media (max-width:760px) {
  .fw .wallethero { padding:var(--sp-7) var(--sp-5); }
  .fw .wallethero .wh-big { font-size:var(--fs-9); }
  .fw .wh-break { grid-auto-flow:row; grid-template-columns:repeat(2,minmax(0,1fr));
    gap:var(--sp-5) var(--sp-6); }
}

/* Context figures. Deliberately not cards: these are things a founder glances
   at, and giving each one a border would put four more boxes on a page whose
   problem is boxes. */
.fw .stattiles { display:grid; grid-auto-flow:column; grid-auto-columns:minmax(0,1fr);
  gap:0; border-top:1px solid var(--ink); margin-bottom:var(--sp-7); }
.fw .stattiles > div { min-width:0; padding:var(--sp-5) var(--sp-5) var(--sp-4) 0;
  border-right:1px solid var(--line); }
.fw .stattiles > div:last-child { border-right:0; }
.fw .stattiles > div + div { padding-left:var(--sp-5); }
.fw .stattiles .st-n { display:block; font-size:var(--fs-7); font-weight:var(--fw-bold);
  letter-spacing:-0.02em; font-variant-numeric:tabular-nums; }
.fw .stattiles .st-l { display:block; font-size:var(--fs-2); color:var(--ink-3); margin-top:4px; }
@media (max-width:760px) {
  .fw .stattiles { grid-auto-flow:row; grid-template-columns:repeat(2,minmax(0,1fr)); }
  .fw .stattiles > div { border-right:0; border-bottom:1px solid var(--line); padding:var(--sp-4) 0; }
  .fw .stattiles > div + div { padding-left:0; }
  .fw .stattiles > div:nth-child(odd) { padding-right:var(--sp-5); }
}

/* Products as objects, not table cells. Five columns in a half-width
   column left the name clipped, the three checkout actions stacked into a
   vertical pile, and the status badges wrapping. A product is the thing a
   founder made; it gets a row of its own with the name at the size of a
   heading and its actions on one line beside it.

   Still a list, not cards: boxing each product would put three more borders
   on the page this rework exists to de-clutter. */
.fw .prodlist { border-top:1px solid var(--ink); list-style:none; margin:0; padding:0; }
.fw .proditem { min-width:0; }
.fw .prodrow { display:grid; grid-template-columns:minmax(0,1fr) auto; gap:var(--sp-4) var(--sp-6);
  align-items:start; padding:var(--sp-5) 0; border-bottom:1px solid var(--line); }
.fw .prodrow > * { min-width:0; }
/* A draft is not broken, it is unpublished — quietened, not greyed out to the
   point of looking disabled. */
.fw .prodrow[data-live="0"] .pd-name { color:var(--ink-2); }
.fw .pd-name { display:block; font-size:var(--fs-5); font-weight:var(--fw-bold);
  letter-spacing:-0.012em; }
.fw .pd-meta { display:flex; flex-wrap:wrap; gap:8px 12px; align-items:center; margin-top:6px; }
.fw .pd-price { font-size:var(--fs-4); font-weight:var(--fw-med); font-variant-numeric:tabular-nums; }
.fw .pd-desc { display:block; font-size:var(--fs-2); line-height:1.5; color:var(--ink-3);
  margin-top:6px; max-width:54ch; }
.fw .pd-actions { display:flex; flex-wrap:wrap; gap:8px; align-items:center;
  justify-content:flex-end; }
@media (max-width:700px) {
  .fw .prodrow { grid-template-columns:minmax(0,1fr); }
  .fw .pd-actions { justify-content:flex-start; }
}

/* The editor's own footer: what this one product has actually done, and a
   way to look at its checkout. Three figures on a rule, because a founder
   editing a price wants to know whether anyone is looking at it, and that
   question was previously only answerable from the whole-account rail at the
   top of the page. */
.fw .pdstats { display:flex; flex-wrap:wrap; align-items:baseline; gap:var(--sp-3) var(--sp-7);
  margin-top:var(--sp-6); padding-top:var(--sp-5); border-top:1px solid var(--line); }
.fw .pdstats > div { min-width:0; }
.fw .pdstats .ps-n { font-size:var(--fs-5); font-weight:var(--fw-med);
  font-variant-numeric:tabular-nums; }
.fw .pdstats .ps-l { font-size:var(--fs-2); color:var(--ink-3); margin-left:6px; }
.fw .pdstats .ps-spacer { flex:1 1 auto; }

/* Payments as money moving, grouped by the day it moved.
   Six numeric columns in a half-width card meant every figure was small,
   right-aligned and identical in weight, so "what was I paid", "what did
   Stripe take" and "what did I keep" all looked the same. Each payment is
   now one line that reads left to right: what came in, what came off, what
   is left — and the day above it carries that day's total, which the table
   never showed at all. */
.fw .txgroup + .txgroup { margin-top:var(--sp-6); }
.fw .txlist { list-style:none; margin:0; padding:0; }
.fw .txday { display:flex; justify-content:space-between; align-items:baseline;
  gap:var(--sp-4); padding-bottom:6px; border-bottom:1px solid var(--ink); }
.fw .txday-d { font-size:var(--fs-2); font-weight:var(--fw-med); color:var(--ink-2); }
.fw .txday-t { font-size:var(--fs-2); color:var(--ink-3); font-variant-numeric:tabular-nums; }
.fw .txrow { display:grid; grid-template-columns:minmax(0,1fr) auto; gap:4px var(--sp-5);
  align-items:baseline; padding:var(--sp-4) 0; border-bottom:1px solid var(--line-soft); }
.fw .txrow > * { min-width:0; }
.fw .tx-name { font-size:var(--fs-3); font-weight:var(--fw-med); }
.fw .tx-ref { display:block; font-size:var(--fs-1); color:var(--ink-3);
  font-family:var(--code); margin-top:3px; word-break:break-all; }
.fw .tx-flow { display:flex; flex-wrap:wrap; gap:4px 8px; align-items:baseline;
  justify-content:flex-end; font-size:var(--fs-2); color:var(--ink-3);
  font-variant-numeric:tabular-nums; }
.fw .tx-arrow { color:var(--ink-3); }
.fw .tx-net { font-size:var(--fs-4); font-weight:var(--fw-med); color:var(--ink); }
/* Settled money is pine on this site, and this is the one figure on the row
   that is actually the founder's. */
.fw .tx-net[data-tone="settled"] { color:var(--pine); }
.fw .tx-net[data-tone="out"] { color:var(--clay); }
@media (max-width:700px) {
  .fw .txrow { grid-template-columns:minmax(0,1fr); }
  .fw .tx-flow { justify-content:flex-start; }
}

/* Payouts as a sequence, because that is what they are. The table gave a
   requested payout and a sent one the same row and the same weight, so the
   one thing a founder wants to know — where is my money now — had to be
   read out of a badge. The spine is .tl, already in this stylesheet and
   already carrying the guardian relationship on the marketing page. */
.fw .payoutline .pt[data-on="waiting"] { border-color:var(--amber); background:var(--paper); }
.fw .payoutline .pt[data-on="done"] { border-color:var(--pine); background:var(--pine); }
.fw .payoutline .tl-t { display:flex; flex-wrap:wrap; gap:8px; align-items:baseline; }
.fw .payoutline .po-amt { font-size:var(--fs-4); font-weight:var(--fw-bold);
  font-variant-numeric:tabular-nums; letter-spacing:-0.01em; }

/* Skeletons.
   The old loading state was a line of text, and its comment argued a shimmer
   is dishonest because it draws fake content in the shape of real content and
   keeps claiming the page is nearly ready even when it is stuck. Half of that
   holds: so the shimmer runs for a bounded time and then rests, rather than
   pulsing forever at someone whose connection has died, and the live region
   below still says in words what is loading. What the text alone could not do
   is hold the shape of the page, so the header stopped jumping when the real
   thing arrived.

   Reduced motion gets the blocks and none of the movement. */
.fw .skel { background:var(--skel-block); border-radius:0; }

/* A skeleton is for waiting, so it does not appear until there is a wait.
   loading.tsx is a Suspense fallback and was already only rendered while the
   server work was pending, but "pending" includes the 40ms a warm page takes,
   and a placeholder that paints for 40ms is a flicker, not information.

   Every piece starts invisible and is revealed by an animation whose delay is
   the gate. Nothing shows before it elapses, so a fast page goes straight to
   content and a slow one gets the skeleton. It is a delay rather than a
   timer in JavaScript because the fallback is a server component: there is no
   effect to run, and the browser is already holding a clock. */
.fw .skel, .fw .skel-hero, .fw .skel-rail, .fw .skel-card {
  opacity:0; animation:veyro-skel-in .16s var(--ease) var(--skel-gate, 240ms) forwards; }
@keyframes veyro-skel-in { to { opacity:1; } }
/* The gate stays; only the fade goes. Someone who asked for less motion still
   wants a fast page to go straight to its content. */
@media (prefers-reduced-motion: reduce) {
  .fw .skel, .fw .skel-hero, .fw .skel-rail, .fw .skel-card { animation-duration:0s; }
}
.fw .skel[data-shimmer="1"] { position:relative; overflow:hidden; }
.fw .skel[data-shimmer="1"]::after { content:""; position:absolute; inset:0;
  transform:translateX(-100%);
  background:linear-gradient(90deg, transparent, var(--skel-sheen), transparent);
  animation:veyro-skel 1.25s var(--ease) 6; }
@keyframes veyro-skel { to { transform:translateX(100%); } }
@media (prefers-reduced-motion: reduce) {
  .fw .skel[data-shimmer="1"]::after { animation:none; }
}
.fw .skel-hero { background:var(--ink); padding:var(--sp-8) var(--sp-7); margin-bottom:var(--sp-7); }
/* This one panel is dark in both themes, so its blocks are light in both --
   the rule is "opposite of the surface", not "opposite of the theme".
   .46 is not a guess: it is the alpha at which white over this panel lands on
   the same grey as --skel-block does over the page, so a block inside the
   band and a block outside it are the same brightness. At .34 the band's
   blocks read as dimmer than the rest of the page, which made one skeleton
   look like two. */
.fw .skel-hero { --skel-sheen:rgba(255,255,255,.30); }
.fw .skel-hero .skel { background:rgba(255,255,255,.46); }
.fw .skel-rail { display:grid; grid-auto-flow:column; grid-auto-columns:minmax(0,1fr);
  border-top:1px solid var(--ink); margin-bottom:var(--sp-7); }
.fw .skel-rail > div { padding:var(--sp-5) var(--sp-5) var(--sp-4) 0;
  border-right:1px solid var(--line); }
.fw .skel-rail > div:last-child { border-right:0; }
.fw .skel-rail > div + div { padding-left:var(--sp-5); }
.fw .skel-card { border:1px solid var(--line); background:var(--card);
  padding:var(--sp-5); margin-bottom:var(--sp-5); }
@media (max-width:760px) {
  .fw .skel-hero { padding:var(--sp-7) var(--sp-5); }
  .fw .skel-rail { grid-auto-flow:row; grid-template-columns:repeat(2,minmax(0,1fr)); }
  .fw .skel-rail > div { border-right:0; border-bottom:1px solid var(--line); padding:var(--sp-4) 0; }
  .fw .skel-rail > div + div { padding-left:0; }
}

/* ==== dark mode =========================================================
   Every colour in this stylesheet reads from the 26 tokens defined on .fw,
   which is what makes a second theme a block of values rather than a rewrite.

   Two rules, deliberately:

     the media query, guarded by :not([data-theme="light"]), so the system
     preference applies by default but an explicit choice of light still wins;

     the attribute, so an explicit choice of dark wins on a system set to
     light. Without both, the toggle only works in one direction.

   No colour is defined ONLY in here. Every token has its light value on bare
   .fw above, so a browser that supports neither still gets a complete theme.

   What does not invert: .lp-dark and .wallethero were already dark, and their
   internals are hard-coded for a dark ground — #bcbdbd captions, white rules
   at 17% opacity. Flipping them would make a light band full of pale-grey
   text. They stay dark and take a border instead, since they can no longer
   rely on contrast with white to show their edges. */
@media (prefers-color-scheme: dark) {
  .fw:not([data-theme="light"]) {
  /* Surfaces invert; the cool monochrome character does not. Paper is a
     near-black with a trace of blue in it rather than #000, because pure
     black against a bright phone at night is a glare edge, and because every
     grey above it then has somewhere to sit. */
  --paper:#0f1113; --surface:#16191c; --surface-2:#1e2226; --card:#14171a;
  /* --reverse is "the colour text takes when it sits on --brand". Brand is
     light here, so reverse is dark. Swapping these two is the whole trick. */
  --reverse:#0f1113;
  --line:#2a2f34; --line-soft:#22262a;
  /* 1.4.11 wants 3:1 for a control's boundary. This measures 3.4:1 on --card. */
  --control-line:#7b848b;
  --brand:#e8eaec; --brand-h:#ffffff;
  --ink:#e8eaec; --ink-2:#aab1b7; --ink-3:#8c949b;
  --placeholder:#8c949b;
  --nav-veil:rgba(15,17,19,.88);
  --skel-block:#79818a;
  --skel-sheen:rgba(255,255,255,.45);
  /* Pressed is brighter here, not darker: --brand is already light. */
  --brand-a:#ffffff;
  --clay-a:#3a201d;
  --line-hover:#3a4046;
  --select-bg:#2e3841;
  --scrim:rgba(0,0,0,.62);
  /* The accents lighten. #12513a is 2.0:1 on this ground and would fail every
     rule it passes in the light theme; these are the same hues carried up
     until they clear 4.5:1 on --card. */
  --pine:#5fb48f; --pine-h:#7cc9a6;
  --pine-bg:#12251e; --pine-line:#245040;
  --amber:#d9a441; --amber-bg:#2a2112; --amber-line:#4f3f19;
  --slate:#83aadb; --slate-bg:#15202e; --slate-line:#294660;
  --clay:#e39089; --clay-bg:#2b1917; --clay-line:#5d322c;
  /* Native controls, scrollbars and form widgets follow the page. */
  color-scheme: dark;
  }
}
.fw[data-theme="dark"] {
  /* Surfaces invert; the cool monochrome character does not. Paper is a
     near-black with a trace of blue in it rather than #000, because pure
     black against a bright phone at night is a glare edge, and because every
     grey above it then has somewhere to sit. */
  --paper:#0f1113; --surface:#16191c; --surface-2:#1e2226; --card:#14171a;
  /* --reverse is "the colour text takes when it sits on --brand". Brand is
     light here, so reverse is dark. Swapping these two is the whole trick. */
  --reverse:#0f1113;
  --line:#2a2f34; --line-soft:#22262a;
  /* 1.4.11 wants 3:1 for a control's boundary. This measures 3.4:1 on --card. */
  --control-line:#7b848b;
  --brand:#e8eaec; --brand-h:#ffffff;
  --ink:#e8eaec; --ink-2:#aab1b7; --ink-3:#8c949b;
  --placeholder:#8c949b;
  --nav-veil:rgba(15,17,19,.88);
  --skel-block:#79818a;
  --skel-sheen:rgba(255,255,255,.45);
  /* Pressed is brighter here, not darker: --brand is already light. */
  --brand-a:#ffffff;
  --clay-a:#3a201d;
  --line-hover:#3a4046;
  --select-bg:#2e3841;
  --scrim:rgba(0,0,0,.62);
  /* The accents lighten. #12513a is 2.0:1 on this ground and would fail every
     rule it passes in the light theme; these are the same hues carried up
     until they clear 4.5:1 on --card. */
  --pine:#5fb48f; --pine-h:#7cc9a6;
  --pine-bg:#12251e; --pine-line:#245040;
  --amber:#d9a441; --amber-bg:#2a2112; --amber-line:#4f3f19;
  --slate:#83aadb; --slate-bg:#15202e; --slate-line:#294660;
  --clay:#e39089; --clay-bg:#2b1917; --clay-line:#5d322c;
  /* Native controls, scrollbars and form widgets follow the page. */
  color-scheme: dark;
}

/* The two panels that were always dark. On a dark page they would otherwise
   dissolve into it, so they earn an edge. */
@media (prefers-color-scheme: dark) {
  .fw:not([data-theme="light"]) .wallethero,
  .fw:not([data-theme="light"]) section.lp.lp-dark { background:#080a0b;
    border:1px solid var(--line); color:#e8eaec; }
  .fw:not([data-theme="light"]) .skel-hero { background:#080a0b; border:1px solid var(--line); }
}
.fw[data-theme="dark"] .wallethero,
.fw[data-theme="dark"] section.lp.lp-dark { background:#080a0b; border:1px solid var(--line);
  color:#e8eaec; }
.fw[data-theme="dark"] .skel-hero { background:#080a0b; border:1px solid var(--line); }

/* The toggle itself. A button, not a checkbox: it performs an action rather
   than recording a value, and it says which mode it will switch TO. */

/* These panels were always dark, so their text takes --reverse — "the colour
   that sits on --brand". In dark mode --reverse becomes dark, which is right
   everywhere except here, where the ground did not invert with it. The
   headline figure went near-black on near-black. The panels state their own
   ink rather than inheriting a token whose meaning flipped underneath them. */
.fw[data-theme="dark"] .wallethero .wh-big,
.fw[data-theme="dark"] .lp-dark .lp-h2,
.fw[data-theme="dark"] .lp-dark h2,
.fw[data-theme="dark"] .lp-dark .d1,
.fw[data-theme="dark"] .lp-dark .d2,
.fw[data-theme="dark"] .lp-dark .statement { color:#e8eaec; }
.fw[data-theme="dark"] .lp-dark .btn { background:#e8eaec; border-color:#e8eaec; color:#0f1113; }
.fw[data-theme="dark"] .wallethero .btn { background:#e8eaec; border-color:#e8eaec; color:#0f1113; }
@media (prefers-color-scheme: dark) {
  .fw:not([data-theme="light"]) .wallethero .wh-big,
  .fw:not([data-theme="light"]) .lp-dark .lp-h2,
  .fw:not([data-theme="light"]) .lp-dark h2,
  .fw:not([data-theme="light"]) .lp-dark .d1,
  .fw:not([data-theme="light"]) .lp-dark .d2,
  .fw:not([data-theme="light"]) .lp-dark .statement { color:#e8eaec; }
  .fw:not([data-theme="light"]) .lp-dark .btn,
  .fw:not([data-theme="light"]) .wallethero .btn {
    background:#e8eaec; border-color:#e8eaec; color:#0f1113; }
}
/* The theme switch. Square, because every other edge on this site is square
   and a pill here would read as imported from somewhere else. The track is a
   control boundary, so it takes --control-line and its 3:1, not --line.

   The thumb carries the icon rather than the track carrying two of them: one
   glyph in one place is less to read than two competing for the same meaning,
   and the thumb's position already says which side is active. */
.fw .themeswitch { display:inline-flex; align-items:center; justify-content:center;
  background:none; border:0; padding:6px; cursor:pointer; color:inherit; }
.fw .themeswitch-track { position:relative; display:block; width:46px; height:24px;
  background:var(--surface); border:1px solid var(--control-line); }
.fw .themeswitch-thumb { position:absolute; top:1px; left:1px; width:20px; height:20px;
  display:flex; align-items:center; justify-content:center; font-size:11px; line-height:1;
  background:var(--brand); color:var(--reverse);
  transition:transform var(--dur, .18s) var(--ease); }
.fw .themeswitch[aria-checked="true"] .themeswitch-thumb { transform:translateX(22px); }
.fw .themeswitch:hover .themeswitch-track { border-color:var(--brand); }
/* The focus ring goes on the track, because the button itself is only padding
   and a ring around the padding sits too far from the thing it identifies. */
.fw .themeswitch:focus-visible { outline:none; }
.fw .themeswitch:focus-visible .themeswitch-track { outline:2px solid var(--pine); outline-offset:2px; }
/* Someone who asked for less motion gets the state, not the slide. */
@media (prefers-reduced-motion: reduce) {
  .fw .themeswitch-thumb { transition:none; }
}
@media (pointer: coarse) { .fw .themeswitch { min-height:var(--tap); min-width:var(--tap); } }

.fw .lp-tall { padding:var(--sp-10) 0; }
.fw .lp-dark .statement-sub { color:#bcbdbd; }
/* The mark's own stroke angle, reused as a section divider */
@media (max-width:760px) {
  .fw .lp-tall { padding:var(--sp-9) 0; }
}
.fw .split { display:grid; grid-template-columns:var(--split-a) var(--split-b); gap:var(--sp-9); align-items:start; }
.fw .split-lead { display:grid; grid-template-columns:minmax(0,1.02fr) minmax(0,1fr); gap:var(--sp-9); align-items:start; }
@media (max-width:940px) {
  .fw .split, .fw .split-lead { grid-template-columns:minmax(0,1fr); gap:var(--sp-6); }
}
.fw .hero-band { background:var(--surface); border-bottom:1px solid var(--line); }
.fw .hero-band .frame { background:var(--card); }
@media (max-width:760px) {
  .fw .ctx { display:none; }
  .fw .frame-body { flex-direction:column; }
  .fw .frame-rail { width:100%; border-right:0; border-bottom:1px solid var(--line); display:flex; gap:3px; overflow-x:auto; padding:7px 8px; }
  .fw .frame-rail button:not(.btn) { width:auto; white-space:nowrap; justify-content:center; }
  .fw .frame-main { min-height:0; }
}
.fw .grid-4 > :last-child { border-right:0 !important; }
/* Centred, not top-aligned.
   The left column lost its three figures to their own band below, and against
   a preview card that runs the full height of the band that left roughly 240px
   of empty ground under the buttons — a hole rather than breathing room. With
   the columns centred the same whitespace is split above and below, which
   reads as air. Only from 940px up, where the two are side by side; below that
   they stack and there is nothing to centre against. */
.fw .hero-grid { align-items:start; }
@media (min-width:941px) {
  .fw .hero-grid { align-items:center; }
  /* The hero was a precise 50/50 at every width — 650 against 638 at 1440 —
     which is the symmetric "text one side, dashboard the other" arrangement
     rather than a composition with a subject. The product takes the larger
     half now. The text column keeps more than enough for its own measures:
     the tagline caps at 30ch and the lead at 56ch, both of which fit inside
     what is left at 1024 and up. */
  .fw .hero-grid { grid-template-columns:minmax(0,0.88fr) minmax(0,1.12fr); }
}
/* minmax(0,1fr), not 1fr: a bare 1fr track is floored at its item's min-content,
   so one long unbreakable line in the hero widened the track past the viewport
   and body's overflow-x:clip cut the hero off instead of scrolling. The !important
   here was overriding the minmax(0,...) that .split-lead sets for exactly this. */
@media (max-width:940px) { .fw .hero-grid { grid-template-columns:minmax(0,1fr) !important; gap:32px !important; } }
@media (max-width:760px) {
  .fw .wordmark-hero { font-size:var(--wm-md); font-stretch:114%; }
  .fw .tagline { font-size:var(--fs-6); }
  .fw .lp-links button.hide-s { display:none; }
  .fw { --lp-pad:32px; }
  .fw section.lp { padding:var(--lp-pad) 0; }
}
`;

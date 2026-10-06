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
  /* ---- Type scale: 10 steps, nothing between them ----
     The reading steps (3 to 5) and the display steps (6 to 10) were set for a
     denser interface than this turned out to be. On a 1400px screen a 15.5px
     paragraph in a 66ch column reads as small print, so the reading sizes come
     up about a step and the display sizes open up with them.

     1 and 2 deliberately do NOT move. They are the label and chip sizes, and
     the payment sequence in the hero fits 375px with about four pixels to
     spare -- a bump there is a wrapped diagram on every phone. */
  --fs-1:11.5px; --fs-2:12.5px; --fs-3:14.5px; --fs-4:16.5px; --fs-5:18.5px;
  --fs-6:22px;   --fs-7:26px;   --fs-8:34px;   --fs-9:50px;   --fs-10:64px;
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
  --skel-block:#c5c8cb;
  --skel-sheen:rgba(255,255,255,.14);
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
  /* The pricing slider's track. Decorative -- no text sits on either --
     but the free band has to be visible, and --pine-bg is transparent in
     this theme by design, so these are their own pair. */
  --track-free:#e4efe9; --track-rest:#ececeb;
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
/* A code block is a framed box with a visible right edge, and its lines have
   a natural length -- about seventy characters here. Left unbounded in a wide
   column it draws that edge six hundred pixels past where the code stops, and
   the empty band reads as a rendering fault rather than as breathing room.
   Bounded to its own measure, the frame lands where the content does. Lines
   longer than the cap still scroll; nothing is hidden. */
.fw .code { font-family:var(--code); font-size:var(--fs-2); line-height:1.7;
  background:var(--surface); border:1px solid var(--line); padding:14px 16px;
  overflow-x:auto; white-space:pre; tab-size:2; color:var(--ink); margin:0;
  max-width:78ch; }
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

/* The hero's three numbers, and the hero's code block.

   Both exist because the first screen has to answer two questions a builder
   actually asks -- what does this cost me, and what does the code look like --
   before the page starts explaining itself. */
.fw .wins { list-style:none; margin:var(--sp-5) 0 0; padding:0; display:flex; flex-wrap:wrap;
  gap:var(--sp-6); }
.fw .wins li { display:flex; flex-direction:column; gap:2px; }
.fw .wins b { font-size:var(--fs-6); font-weight:var(--fw-bold); letter-spacing:-0.02em;
  line-height:1; }
.fw .wins span { font-size:var(--fs-2); color:var(--ink-2); }
.fw .herocode { margin:var(--sp-5) 0 0; }
.fw .herocode pre { margin:0; padding:var(--sp-4) var(--sp-5); background:var(--surface);
  border:1px solid var(--line); overflow-x:auto; font-size:var(--fs-2); line-height:1.6;
  font-family:var(--code); tab-size:2; }
.fw .herocode figcaption { margin-top:8px; font-size:var(--fs-2); color:var(--ink-2); }
@media (max-width:760px) {
  .fw .wins { gap:var(--sp-5); }
  .fw .herocode pre { font-size:11px; padding:var(--sp-3) var(--sp-4); }
}

/* The two ways to take a payment, side by side. Equal weight on purpose:
   the link path is not a lesser version of the code path, it is the whole
   product for anyone who has an audience but not an app yet. */
.fw .paths { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:var(--sp-4);
  margin-top:var(--sp-6); }
.fw .path { border:1px solid var(--line); background:var(--card); padding:var(--sp-5); }
.fw .path[data-on="1"] { border-color:var(--control-line); }
.fw .path-k { display:block; font-size:var(--fs-1); font-weight:var(--fw-bold);
  letter-spacing:0.06em; text-transform:uppercase; color:var(--ink-3); }
.fw .path-t { margin-top:6px; font-size:var(--fs-4); }
.fw .path-d { margin:8px 0 0; font-size:var(--fs-2); line-height:1.6; color:var(--ink-2); }
@media (max-width:620px) { .fw .paths { grid-template-columns:minmax(0,1fr); } }

/* Founder stories. Styled now so that dropping real ones into lib/stories.ts
   is the only step left; the section renders nothing while that file is empty. */
.fw .stories { display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr));
  gap:var(--sp-5); margin-top:var(--sp-7); }
.fw .story { margin:0; border:1px solid var(--line); background:var(--card); padding:var(--sp-5); }
.fw .story-q { margin:0; font-size:var(--fs-4); line-height:1.5; text-wrap:pretty; }
/* Literal curly quotes rather than CSS unicode escapes: a backslash followed
   by digits is an octal escape to TypeScript, which rejects it before CSS
   ever sees the string, and the whole stylesheet stops compiling. */
.fw .story-q::before { content:"“"; }
.fw .story-q::after { content:"”"; }
.fw .story-by { display:flex; align-items:center; gap:10px; margin-top:var(--sp-5); }
.fw .story-by b { display:block; font-size:var(--fs-2); font-weight:var(--fw-bold); }
.fw .story-av { width:36px; height:36px; flex:none; object-fit:cover; background:var(--surface-2); }
.fw .story-ini { display:flex; align-items:center; justify-content:center; font-size:var(--fs-2);
  font-weight:var(--fw-bold); color:var(--ink-2); }
.fw .story-m { display:block; font-size:var(--fs-2); color:var(--ink-3); }
.fw .story-amt { margin-left:auto; font-size:var(--fs-2); font-weight:var(--fw-bold);
  color:var(--pine); white-space:nowrap; }

/* The milestone line. A rule above it and nothing else: it is a remark on the
   numbers directly above, not another card competing with them. */
.fw .milestone { border-top:1px solid var(--line); padding:var(--sp-5) 0 var(--sp-6);
  margin-bottom:var(--sp-6); }
.fw .ms-h { margin:0; font-size:var(--fs-5); font-weight:var(--fw-bold); letter-spacing:-0.016em; }
.fw .ms-s { margin:4px 0 0; font-size:var(--fs-3); color:var(--ink-2); max-width:var(--m-body); }
.fw .ms-c { margin:var(--sp-4) 0 0; font-size:var(--fs-2); color:var(--ink-3); }

/* The homepage dashboard preview.

   More decorated than anything else in this stylesheet, deliberately. The rest
   of the site is a document and reads better plain; this one object has to look
   like a product someone wants, so it gets a window frame, a chart and an
   accent edge. It is the exception that makes the restraint elsewhere read as
   restraint rather than as a lack of ideas. */
.fw .dp { border:1px solid var(--line); background:var(--card); box-shadow:var(--lift);
  overflow:hidden; }
.fw .dp-bar { display:flex; align-items:center; gap:10px; padding:10px var(--sp-5);
  border-bottom:1px solid var(--line); background:var(--surface); }
.fw .dp-dots { display:flex; gap:5px; }
.fw .dp-dots i { width:8px; height:8px; border-radius:50%; background:var(--line);
  border:1px solid var(--control-line); }
.fw .dp-title { font-size:var(--fs-2); font-weight:var(--fw-bold); color:var(--ink-2); }
.fw .dp-tag { margin-left:auto; font-size:var(--fs-1); font-weight:var(--fw-bold);
  letter-spacing:0.06em; text-transform:uppercase; color:var(--ink-3);
  border:1px solid var(--line); padding:2px 7px; }
.fw .dp-body { padding:var(--sp-6); }
/* The one gradient on the site: the top edge of the money, and nowhere else. */
.fw .dp-head { display:flex; align-items:flex-end; justify-content:space-between; gap:var(--sp-5);
  flex-wrap:wrap; padding-top:var(--sp-4); border-top:2px solid transparent;
  border-image:linear-gradient(90deg, var(--pine), var(--slate)) 1; }
.fw .dp-cta { display:inline-flex; align-items:center; height:var(--h-md); padding:0 var(--sp-4);
  background:var(--brand); color:var(--reverse); font-size:var(--fs-2);
  font-weight:var(--fw-med); white-space:nowrap; }
.fw .dp-foot { display:flex; align-items:center; gap:8px; margin-top:var(--sp-5);
  font-size:var(--fs-2); color:var(--ink-2); }
.fw .dp-dot { width:7px; height:7px; border-radius:50%; background:var(--pine); flex:none; }
@media (max-width:560px) {
  .fw .dp-body { padding:var(--sp-5); }
  /* The balance comes down a step so the card is not mostly one number.
     The sequence is three chips now, not four, and three fit on one line at
     375px with the padding tightened. It stays a line: a two-by-two grid of
     three leaves one stranded on its own row, and the whole value of drawing
     this is that it reads left to right.

     Doubling the class is deliberate. .chips sets flex-wrap:wrap and is
     declared later in this file, so an equal-specificity override here loses
     on source order no matter what it says. */
  .fw .dp-head .fig-xl { font-size:var(--fs-8); }
  .fw .chips.lw-chips { flex-wrap:nowrap; gap:4px; }
  .fw .chips.lw-chips .chip { padding:0 6px; letter-spacing:0.02em; }
  .fw .chips.lw-chips .chip-sep { font-size:10px; }
  .fw .dp-cta { height:var(--h-sm); }
}

/* ---- the four steps ----------------------------------------------------
   A row of four on a desktop, a column on a phone, and a hairline running
   between them either way so it reads as a sequence rather than as four
   unrelated facts. The rule is drawn on the card, not under the row, so it
   turns the corner when the row stacks. */
.fw .jn { list-style:none; margin:0; padding:0; display:grid;
  grid-template-columns:repeat(4,minmax(0,1fr)); gap:0; counter-reset:jn; }
.fw .jn[data-steps="3"] { grid-template-columns:repeat(3,minmax(0,1fr)); }
.fw .jn-s { position:relative; padding:var(--sp-6) var(--sp-5);
  border-top:2px solid var(--line); }
.fw .jn-s + .jn-s { border-left:1px solid var(--line); }
/* The first step gets the accent, so the eye starts at step one. */
.fw .jn-s:first-child { border-top-color:var(--pine); }
.fw .jn-ic { display:block; width:26px; height:26px; color:var(--pine); }
.fw .jn-ic svg { width:100%; height:100%; display:block; }
.fw .jn-n { display:block; margin-top:var(--sp-5); font-size:var(--fs-1);
  font-weight:var(--fw-bold); letter-spacing:0.14em; color:var(--ink-3); }
.fw .jn-t { margin:6px 0 0; font-size:var(--fs-5); letter-spacing:-0.018em; }
.fw .jn-d { margin:8px 0 0; font-size:var(--fs-2); line-height:1.6; color:var(--ink-2); }
.fw .jn-who { display:inline-block; margin-top:var(--sp-4); font-size:var(--fs-1);
  font-weight:var(--fw-bold); letter-spacing:0.04em; text-transform:uppercase;
  color:var(--slate); border:1px solid var(--slate-line); background:var(--slate-bg);
  padding:2px 7px; }
@media (max-width:900px) {
  .fw .jn { grid-template-columns:repeat(2,minmax(0,1fr)); }
  .fw .jn-s:nth-child(3) { border-left:0; }
}
@media (max-width:560px) {
  .fw .jn { grid-template-columns:minmax(0,1fr); }
  .fw .jn-s + .jn-s { border-left:0; }
}

/* ---- what is included ----------------------------------------------------
   One list, one column, no ticks and crosses. The two panels this replaced
   put some of the product in a right-hand column, which read as a feature
   gate and was not one: an account under the free limit is monitored and its
   chargebacks are handled exactly like any other. A list with nothing to
   compare against cannot imply otherwise. */
.fw .tierlist { margin:var(--sp-5) 0 0; display:flex; flex-direction:column; gap:var(--sp-4); }
.fw .tierlist dt { font-size:var(--fs-3); font-weight:var(--fw-bold); }
.fw .tierlist dd { margin:2px 0 0; font-size:var(--fs-2); color:var(--ink-2); line-height:1.55; }

/* ---- the parent's-account objection ------------------------------------
   A two-column row per answer: the claim on the left where it can be skimmed,
   the detail on the right for anyone who stops. The tie row is marked with a
   dash rather than a tick and takes the muted ink, so scanning only the marks
   still gives the honest answer. */
.fw .objlist { margin:var(--sp-7) 0 0; display:grid; gap:0; }
.fw .objrow { display:grid; grid-template-columns:minmax(0,4fr) minmax(0,7fr);
  gap:var(--sp-6); padding:var(--sp-5) 0; border-top:1px solid var(--line); }
.fw .objrow:last-child { border-bottom:1px solid var(--line); }
.fw .obj-q { display:flex; gap:10px; align-items:flex-start; margin:0;
  font-size:var(--fs-4); font-weight:var(--fw-bold); letter-spacing:-0.012em; }
.fw .obj-a { margin:0; font-size:var(--fs-3); line-height:1.6; color:var(--ink-2); }
.fw .obj-mark { width:20px; height:20px; flex:none; display:flex; align-items:center;
  justify-content:center; margin-top:2px; color:var(--pine);
  background:var(--pine-bg); border:1px solid var(--pine-line); }
.fw .obj-mark svg { width:14px; height:14px; }
.fw .objrow[data-tie="1"] .obj-mark { color:var(--ink-3); background:var(--surface-2);
  border-color:var(--line); }
.fw .objrow[data-tie="1"] .obj-q { color:var(--ink-2); }
@media (max-width:760px) {
  .fw .objrow { grid-template-columns:minmax(0,1fr); gap:var(--sp-3); }
}

/* ---- guardian permissions ----------------------------------------------
   Two columns, can and cannot. The marks carry colour because this is the one
   place on the site where skimming the wrong way round matters: someone who
   reads only the ticks should still come away with the right answer. */
.fw .gperm { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:var(--sp-6);
  border:1px solid var(--line); background:var(--card); padding:var(--sp-6); }
.fw .gperm-c { padding:var(--sp-5); gap:var(--sp-5); }
.fw .gperm-h { margin:0 0 var(--sp-4); font-size:var(--fs-2); font-weight:var(--fw-bold);
  letter-spacing:0.06em; text-transform:uppercase; color:var(--ink-3); }
.fw .gperm-l { list-style:none; margin:0; padding:0; display:flex; flex-direction:column;
  gap:var(--sp-4); }
.fw .gperm-l li { display:flex; gap:10px; align-items:flex-start; }
.fw .gperm-l b { display:block; font-size:var(--fs-3); font-weight:var(--fw-bold); }
.fw .gperm-d { display:block; margin-top:2px; font-size:var(--fs-2); color:var(--ink-2);
  line-height:1.55; }
.fw .gperm-m { width:20px; height:20px; flex:none; display:flex; align-items:center;
  justify-content:center; margin-top:1px; }
.fw .gperm-m svg { width:14px; height:14px; }
.fw .gperm-yes { color:var(--pine); background:var(--pine-bg); border:1px solid var(--pine-line); }
.fw .gperm-no { color:var(--clay); background:var(--clay-bg); border:1px solid var(--clay-line); }
@media (max-width:760px) { .fw .gperm { grid-template-columns:minmax(0,1fr); } }

/* ---- the AI prompt ------------------------------------------------------ */
.fw .ai { display:grid; grid-template-columns:var(--split-a) var(--split-b);
  gap:var(--sp-7); align-items:start; }
.fw .ai-tools { list-style:none; margin:var(--sp-5) 0 0; padding:0; display:flex;
  flex-wrap:wrap; gap:7px; }
.fw .ai-tools li { font-size:var(--fs-2); font-weight:var(--fw-med); color:var(--ink-2);
  border:1px solid var(--line); padding:3px 9px; background:var(--card); }
.fw .ai-r { margin:0; border:1px solid var(--line); background:var(--card); overflow:hidden; }
.fw .ai-cap { display:flex; align-items:center; gap:8px; padding:9px var(--sp-5);
  border-bottom:1px solid var(--line); background:var(--surface);
  font-size:var(--fs-1); font-weight:var(--fw-bold); letter-spacing:0.06em;
  text-transform:uppercase; color:var(--ink-3); }
/* A slow pulse, once every three seconds. It is the only thing on the page
   that moves on its own, which is what makes it read as "live" rather than
   as decoration. */
.fw .ai-dot { width:7px; height:7px; border-radius:50%; background:var(--pine); flex:none;
  animation:veyro-pulse 3s var(--ease) infinite; }
@keyframes veyro-pulse { 0%,70%,100% { opacity:1; } 85% { opacity:.25; } }
@media (prefers-reduced-motion: reduce) { .fw .ai-dot { animation:none; } }
.fw .ai-pre { margin:0; padding:var(--sp-5); font-family:var(--code); font-size:var(--fs-2);
  line-height:1.65; color:var(--ink-2); white-space:pre-wrap; overflow-x:auto; tab-size:2; }
@media (max-width:900px) { .fw .ai { grid-template-columns:minmax(0,1fr); gap:var(--sp-6); } }

/* A card that holds one column of prose or one narrow form.

   A .card draws a visible border, so its width is a line someone sees. Left to
   fill a wide page while its text wraps at a reading measure, it draws that
   line several hundred pixels past where the content stops, and the band
   between the two reads as something failing to load. This bounds the frame to
   roughly what it contains. Cards holding tables or grids do not take it --
   there the width is the content. */
/* Long-form pages: one article column, with full-bleed exceptions.

   /how-it-works is mostly prose in a 1344px container, each paragraph wrapping
   at a reading measure and sitting hard against the left, which leaves six
   hundred pixels of nothing down the right of the whole page. It is not a
   framed box, which is why the box-based check never saw it.

   The first attempt gave every child its own max-width and auto margins. That
   measures correctly and looks wrong: a heading, a paragraph and a blockquote
   have different intrinsic widths, so centring each one independently lines up
   their boxes and not their text, and the column grows three left edges.

   A grid with a named content column instead. Every child lands in the same
   column, so they share one left edge; the few things that are genuinely wide
   -- the roles grid, the payment flow, the integration paths, a preview beside
   its words -- opt into the full width by name. */
/* Three tracks, not one column floating in the middle of nothing.
   -------------------------------------------------------------------------
   NOTE ON THE SYNTAX: two bracketed line-name groups cannot sit next to each
   other. [rail-end] [content-start] is invalid, the whole declaration is
   thrown away, and the grid falls back to implicit tracks that look close
   enough to right that it took a computed-style dump to notice. They have to
   be one bracket: [rail-end content-start].
   -------------------------------------------------------------------------
   The reading measure was right and the page around it was the wrong shape:
   66 characters in a 1400px window left 400px of nothing down each side, on
   the five longest pages on the site. The measure has not changed. What has
   changed is that the space beside it now holds the two things a long page
   cannot otherwise give you -- where you are in it, and the asides that would
   otherwise interrupt the prose.

   justify-content:center keeps the whole assembly centred when the window is
   wider than the three tracks together, so the reading column stays where the
   eye expects it instead of drifting left as the rail appears. */
/* Both side tracks are earned, never assumed. A reserved 236px of nothing is
   worse than the margin it was meant to fix, so the grid has four shapes and
   the page gets whichever one its content justifies:

     content                    nothing to put beside it
     rail    + content          sections worth listing
     content + note             asides worth lifting out
     rail    + content + note   both

   The rail is a class because it depends on runtime headings. The note track
   asks the DOM with :has(), so adding a <MarginNote> is the whole of turning
   it on -- there is no second flag to forget. */
.fw .longform {
  --lf-rail:208px; --lf-note:236px; --lf-gap:clamp(28px, 3.4vw, 60px);
  display:grid; column-gap:var(--lf-gap); justify-content:center;
  grid-template-columns:
    [full-start content-start] minmax(0, var(--m-body)) [content-end full-end]; }
/* full-start sits AFTER the rail, not before it.
   -------------------------------------------------------------------------
   When the rail track was added, full-start stayed where it was -- at the
   very left edge -- so every full-bleed block (.flow, .truthgrid, .paths,
   .stage) spanned straight across the navigation. The rail is sticky, so the
   collision only appeared once a reader scrolled far enough for one of those
   blocks to draw level with it, which is why it survived a screenshot of the
   top of the page and showed up immediately for somebody actually reading.
   "Full" means the full reading area, never the furniture beside it. */
.fw .longform.has-rail {
  grid-template-columns:
    [rail-start] var(--lf-rail)
    [rail-end full-start content-start] minmax(0, var(--m-body)) [content-end full-end]; }
/* Guarded, and the fallback is the note simply staying in the reading column
   rather than being placed on a track that does not exist. */
/* A margin note must not size the row it lands in.
   -------------------------------------------------------------------------
   Auto-placed, a note occupies one row, and a row is as tall as its tallest
   item -- so a 163px note beside a 29px heading grew that row to 163px and
   punched the difference into the reading column as a hole. The note is in
   the margin precisely so it does NOT disturb the prose; a note that pushes
   the next heading down the page is doing the opposite of its job.

   Spanning twenty rows spreads its height across the content beside it
   instead of loading it onto one. Those rows already total far more than any
   note is tall, so nothing grows. Near the foot of a page the span runs into
   implicit rows, which are empty and free. */
.fw .longform > .lfnote { grid-row: span 20; align-self:start; }

@supports selector(:has(*)) {
  .fw .longform:has(> .lfnote) {
    grid-template-columns:
      [full-start content-start] minmax(0, var(--m-body))
      [content-end note-start] var(--lf-note) [note-end full-end]; }
  .fw .longform.has-rail:has(> .lfnote) {
    grid-template-columns:
      [rail-start] var(--lf-rail)
      [rail-end full-start content-start] minmax(0, var(--m-body))
      [content-end note-start] var(--lf-note) [note-end full-end]; }
  .fw .longform > .lfnote { grid-column:note; }
}
.fw .longform > * { grid-column: content; min-width:0; }
.fw .longform > .truthgrid,
.fw .longform > .flow,
.fw .longform > .paths,
.fw .longform > .objection,
.fw .longform > .stage,
.fw .longform > .code,
.fw .longform > .mrail,
.fw .longform > .dp,
.fw .longform > .calc,
.fw .longform > .aud,
.fw .longform > .codecap { grid-column: full; }
/* ...but the ones that are objects rather than bands cap and centre. 860px is
   a shade wider than the 66ch text column, which is the point: they are
   allowed to break the measure without becoming the page. */
.fw .longform > .dp,
.fw .longform > .calc { max-width:860px; margin-inline:auto; }
/* A diagram that arrives directly after a paragraph needs the room a heading
   would otherwise have given it. */
.fw .longform > .dp,
.fw .longform > .calc,
.fw .longform > .aud,
.fw .longform > .mrail { margin-block:var(--sp-8); }
/* The rail is the first thing to go: below about 1180px the three tracks stop
   fitting and the margin it lived in is gone anyway. The note track follows
   at 1040, and below 900 the whole thing is one column again and costs
   nothing. Each step drops furniture, never content: a margin note returns to
   the flow rather than disappearing. */
@media (max-width:1180px) {
  .fw .longform.has-rail {
    grid-template-columns:
      [full-start content-start] minmax(0, var(--m-body)) [content-end full-end]; }
  @supports selector(:has(*)) {
    .fw .longform.has-rail:has(> .lfnote) {
      grid-template-columns:
        [full-start content-start] minmax(0, var(--m-body))
        [content-end note-start] var(--lf-note) [note-end full-end]; }
  }
}
@media (max-width:1040px) {
  .fw .longform, .fw .longform.has-rail,
  .fw .longform:has(> .lfnote), .fw .longform.has-rail:has(> .lfnote) {
    grid-template-columns:
      [full-start content-start] minmax(0, var(--m-body)) [content-end full-end]; }
  .fw .longform > .lfnote { grid-column:content; }
}
@media (max-width:900px) {
  .fw .longform { display:block; }
}

/* ==== the section rail ===================================================
   A spine with the sections hanging off it. The fill is scroll position, so
   the line is both the decoration and the readout -- there is no separate
   progress bar because the list is already a vertical axis. */
/* grid-row:1 / 600, and the number is not arbitrary.
   -------------------------------------------------------------------------
   grid-row:1 / -1 does NOT do what it reads like here. The -1 line means the
   last line of the EXPLICIT grid, and this grid declares columns only -- so
   with no explicit rows, -1 resolves to line 1 and the rail occupied a single
   row. That row then sized itself to the rail's full height, which punched a
   680px hole into the top of every railed page: the eyebrow sat in row 1 and
   the heading was pushed into row 2, below the whole navigation.
   
   The rail has to span the content, and the content's row count is not known
   at authoring time. 600 is comfortably past the largest page (how-it-works
   has about a hundred children) and costs nothing: the extra rows are
   implicit, auto-sized, empty, and row-gap on this grid is zero, so they add
   no height whatsoever. */
.fw .lfrail { grid-column:rail; grid-row:1 / 600; position:sticky;
  align-self:start; top:calc(var(--nav-h) + 28px);
  max-height:calc(100vh - var(--nav-h) - 72px);
  display:flex; flex-direction:column; min-width:0; }
.fw .lfrail-k { font-size:var(--fs-1); letter-spacing:0.07em; text-transform:uppercase;
  color:var(--ink-3); font-weight:var(--fw-med); margin-bottom:var(--sp-4); }
.fw .lfrail-body { position:relative; display:flex; min-height:0; flex:1 1 auto; }
.fw .lfrail-line { position:relative; flex:none; width:2px; background:var(--line);
  margin-right:var(--sp-4); }
.fw .lfrail-fill { position:absolute; inset:0; background:var(--brand);
  transform-origin:top; transform:scaleY(0); }
.fw .lfrail-nav { display:flex; flex-direction:column; gap:2px; min-width:0;
  overflow-y:auto; scrollbar-width:none; }
.fw .lfrail-nav::-webkit-scrollbar { display:none; }
.fw .lfrail-a { display:block; padding:5px 0; font-size:var(--fs-2); line-height:1.4;
  color:var(--ink-3); text-decoration:none; border:0;
  transition:color var(--t-2) var(--ease); }
.fw .lfrail-a:hover { color:var(--ink-2); }
/* The current section is the one piece of state here, so it gets weight and
   the brand colour rather than a marker that would need its own alignment. */
.fw .lfrail-a[data-on="1"] { color:var(--brand); font-weight:var(--fw-med); }
.fw .lfrail-a:focus-visible { outline:var(--focus-w) solid var(--brand);
  outline-offset:2px; }
.fw .lfrail-foot { display:flex; align-items:baseline; gap:4px;
  margin-top:var(--sp-4); padding-top:var(--sp-3); border-top:1px solid var(--line); }
.fw .lfrail-sep { color:var(--ink-3); font-size:var(--fs-1); }
@media (prefers-reduced-motion: reduce) {
  .fw .lfrail-a { transition:none; }
  .fw .lfrail-fill { transition:none; }
}
/* Hidden below the width where its track exists. This has to live AFTER the
   rules above rather than inside the 1180 media query where it reads more
   naturally: .lfrail sets display:flex, the two selectors have equal
   specificity, and a media query does not beat source order. Written up
   there it was simply ignored, and the rail overlapped the text at every
   width from 1180 down -- which no amount of looking at a 1440px screen
   would ever have shown. */
@media (max-width:1180px) {
  .fw .lfrail { display:none; }
}

/* The label on a feature that is not built yet, e.g. "From 15 October".
   Quiet enough not to
   read as a badge of honour, loud enough that nobody misses it: this is the
   difference between a promise and a plan. */
.fw .soon { display:inline-block; margin-left:8px; padding:1px 7px;
  font-size:var(--fs-1); font-weight:var(--fw-med); letter-spacing:0.03em;
  color:var(--amber); border:1px solid var(--amber-line);
  background:var(--amber-bg); white-space:nowrap; vertical-align:middle; }
.fw .soon-inline { margin:0 2px; }
@media (max-width:480px) {
  .fw .soon { margin-left:0; margin-top:4px; }
  .fw .tierlist dt { display:flex; flex-wrap:wrap; align-items:center; gap:0 6px; }
}

/* A notice about which version of a document is in force. Two tones: amber
   for terms not yet effective, slate for a superseded copy. A left rule
   rather than a tinted panel, because the tinted grounds are transparent in
   the light theme and a panel would vanish in the theme most people see. */
.fw .archive-note { margin-top:var(--sp-6); padding:var(--sp-4) var(--sp-5);
  border-left:3px solid var(--slate); background:var(--surface);
  font-size:var(--fs-3); line-height:1.55; color:var(--ink);
  max-width:var(--m-body); }
.fw .archive-note[data-tone="pending"] { border-left-color:var(--amber); }
.fw .archive-note strong { font-weight:var(--fw-bold); }

/* A titled sub-part of a legal clause. Enough space above it to read as a
   division rather than as an emphasised line in the preceding paragraph. */
.fw .subclause { margin-top:var(--sp-6); }
.fw .subclause:first-of-type { margin-top:var(--sp-5); }
.fw .subclause > h3 { margin:0 0 var(--sp-2); }
.fw .subclause > p:first-of-type { margin-top:0; }

/* ==== margin notes =======================================================
   The right track. An aside that was interrupting the argument -- a date, a
   caveat, a figure worth knowing but not worth a paragraph -- sits beside it
   instead. Below 1040px the track is gone and the note returns to the flow as
   an ordinary indented aside, because the content must not depend on the
   window being wide. */
.fw .lfnote { font-size:var(--fs-2); line-height:1.55;
  color:var(--ink-3); border-top:2px solid var(--line); padding-top:var(--sp-3);
  align-self:start; }
.fw .lfnote strong { display:block; color:var(--ink-2); font-weight:var(--fw-med);
  margin-bottom:2px; }
.fw .lfnote .fig { margin:2px 0 4px; }
/* A note the reader may want at any point, not at the point it happens to be
   written. Sticky inside its track; back in the flow once the track is gone.

   grid-row:1/-1 is what makes the sticky actually travel. Auto-placed, the
   note gets one row, its grid area is that row's height, and there is nowhere
   for it to stick to -- it scrolls away like any other block while claiming
   to be pinned. Spanning every row gives it the page to move down. */
.fw .longform > .lfnote[data-sticky="1"] { grid-row:1 / 600; align-self:start;
  position:sticky; top:calc(var(--nav-h) + 28px); }
@media (max-width:1040px) {
  .fw .longform > .lfnote,
  .fw .longform > .lfnote[data-sticky="1"] { grid-row:auto; }
}
@media (max-width:1040px) {
  .fw .lfnote { grid-column:content; border-top:0; border-left:2px solid var(--line);
    padding:2px 0 2px var(--sp-4); margin:var(--sp-5) 0; }
  .fw .lfnote[data-sticky="1"] { position:static; }
}

.fw .card-prose { max-width:78ch; }
/* The eligibility card is the tight case: its fields already cap at --m-tight,
   so 78ch would still leave half the frame empty. It caps just past them. */
.fw .card-prose:has(> .checkform) { max-width:46ch; }

/* A fixed-width object under the words about it, centred.

   This was side by side. A checkout mock is 560 wide and 796 tall, and the
   three paragraphs explaining it are 304 tall, so the row left a five-hundred
   pixel hole beneath the text -- the exact shape this pass is removing. Making
   the text travel with a sticky column hid it while scrolling and left it in
   every screenshot; padding the text out to match would be writing filler.

   Stacked, the words sit in the article column and the object centres below
   them. What is left either side of it is margin on both sides, which reads as
   a measure rather than as something that failed to load. */
.fw .preview-stack { display:flex; flex-direction:column; gap:var(--sp-6); }
.fw .preview-stack > :last-child { align-self:center; width:100%; max-width:560px; }

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
/* 5fr/7fr gave the label column 543px at 1440 to hold a single 26px heading,
   so every row opened an L-shaped void under the label beside a block three to
   eighteen times its height. The editorial split is right; the ratio was not.
   4fr/9fr puts the column at roughly the width of the words in it, and hands
   the two hundred pixels it was wasting to the content. Measured on
   /for-guardians, /for-founders, /about and /wallet, which is every page that
   uses it. */
.fw .truthgrid { display:grid; grid-template-columns:minmax(0,4fr) minmax(0,9fr);
  gap:var(--sp-7); align-items:start; }
/* No sticky on the label column. It was tried and removed: a
   first-child selector catches whatever leads each row, which on /wallet is a 224px block of real
   content and not a heading at all, and a sticky grid item detaches from the
   rest of its row and drifts down the page as you scroll. The column ratio
   above is what fixes the empty space; movement was never the answer to it. */
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
.fw .tagline-2 { display:block; margin-top:var(--sp-3); font-size:var(--fs-4);
  line-height:1.4; letter-spacing:-0.01em; font-weight:var(--fw-med); color:var(--ink-2);
  font-family:var(--ui); }
@media (max-width:760px) { .fw .tagline-2 { font-size:var(--fs-3); } }
  
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
/* The tile. A pine block with the V reversed out of it, sized off the type so
   it tracks the wordmark at any font-size. The V keeps its own optical inset
   rather than filling the block edge to edge, which would read as a button. */
/* Bigger than the type it sits beside, not the same size as it. At parity the
   block read as a highlighted letter; a mark has to look like an object the
   word is standing next to. 0.88em of glyph in a block with generous padding
   comes out noticeably taller than the cap height of "eyro", which is what
   makes it register before the word does. */
.fw .wordmark-tile .wm-v { box-sizing:content-box; height:0.88em; width:0.80em;
  padding:0.20em 0.18em; background:var(--pine); margin-right:0.36em;
  vertical-align:-0.26em; }
/* The name beside the mark is the brand, so it is set tighter and heavier than
   the nav links around it rather than inheriting their weight. */
.fw .wordmark-tile .wm-rest { letter-spacing:-0.045em; }
.fw .wordmark-tile .wm-v path { transform-origin:center; }
/* The mark is a link target in every nav, so it gets the same lift the rest of
   the nav's controls have rather than being the one dead thing in the row. */
.fw a:hover .wordmark-tile .wm-v { background:var(--pine-h); }
/* text-wrap:balance evens the two lines instead of letting the last word fall
   alone. The headline changed from four words to eight and a 26ch measure left
   "for." orphaned on its own line, which reads as a mistake at hero size.
   Browsers without it simply wrap as before. */
.fw .tagline { display:block; font-size:var(--fs-6); line-height:1.36; letter-spacing:-0.014em;
  font-weight:var(--fw-reg); color:var(--ink-2); margin-top:var(--sp-5); max-width:30ch;
  text-wrap:balance; }
.fw h1.hero-h { margin:0; }

/* ==== the parents' four answers ==========================================
   Each one states its answer before its reasoning, so the page can be read
   in five seconds or in five minutes and is honest at both speeds.

   The left rule is the device that makes four of these read as a set rather
   than as four headings that happen to follow each other. It takes the
   verdict's colour, so scanning the rules down the page gives the shape of
   the answers before a word is read: amber, pine, slate, pine. */
.fw .qalist { list-style:none; margin:0; padding:0; counter-reset:qa; }
.fw .qa { position:relative; padding:0 0 0 var(--sp-6);
  border-left:3px solid var(--line); }
.fw .qa + .qa { margin-top:var(--sp-9); }
.fw .qa:has(.chip[data-tone="pine"])  { border-left-color:var(--pine); }
.fw .qa:has(.chip[data-tone="amber"]) { border-left-color:var(--amber); }
.fw .qa:has(.chip[data-tone="slate"]) { border-left-color:var(--slate); }

.fw .qa-head { display:flex; align-items:baseline; flex-wrap:wrap; gap:0 var(--sp-3); }
.fw .qa-n { flex:none; }
.fw .qa-q { margin:0; font-size:var(--fs-6); line-height:1.3;
  letter-spacing:-0.016em; font-weight:var(--fw-bold); }
/* The verdict sits on its own line below the question rather than beside it:
   at these lengths a wrapped chip trailing a wrapped heading reads as debris.
   It is a sibling of the flex row, not a member of it -- as a flex item the
   only way to force the line break was flex-basis:100%, and that sets the
   flex base size, so a three-word badge stretched the width of the column. */
.fw .qa-verdict { display:inline-flex; margin-top:var(--sp-3); }

/* The one sentence somebody can stop at. Larger than the detail beneath it
   and darker, because it is the answer and the rest is the working. */
.fw .qa-lead { margin:var(--sp-4) 0 0; font-size:var(--fs-5); line-height:1.5;
  color:var(--ink); max-width:52ch; }
/* And the detail, set back a step so the hierarchy survives being skimmed. */
.fw .qa-body { margin-top:var(--sp-4); }
.fw .qa-body > .body:first-child { margin-top:0; }

@media (max-width:760px) {
  .fw .qa { padding-left:var(--sp-5); }
  .fw .qa + .qa { margin-top:var(--sp-8); }
  .fw .qa-lead { font-size:var(--fs-4); }
}

/* ==== the money band ======================================================
   The dark break in the middle of the page. Built on .lp-dark's ground so
   the two dark sections agree, but laid out differently from the closing
   one: heading and lead side by side rather than stacked and centred, and
   the rail given the whole width beneath them.

   The rail's own tokens are redefined here rather than overridden
   per-element. Everything inside it reads from --line, --ink, --ink-3 and
   --brand, so restating those four for this subtree is the whole of making
   it work on a dark ground -- and it means the rail is not carrying a second
   set of colours it only uses in one place. */
/* The ground comes from .lp-dark, which the markup also carries. Setting it
   here was a self-reference bug worth remembering: .lp-dark grounds itself
   with background:var(--ink), and this rule redefined --ink on the very same
   element -- so the background resolved against the NEW near-white value and
   the band rendered white, with light grey text on it. Tokens for a subtree
   have to be redefined on a child of the element that paints with them, not
   on the element itself.

   So only layout lives here, and the rail's tokens are set on .moneyband-rail
   below, which paints no background of its own. */
.fw .moneyband .lp-h2 { color:var(--reverse); }
.fw .moneyband-h { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr);
  gap:var(--sp-7) var(--sp-10); align-items:end; }
.fw .moneyband-lead { margin:0; font-size:var(--fs-4); line-height:1.6;
  color:#bcbdbd; max-width:54ch; }
/* The rail reads from four tokens and nothing else, so restating them here
   is the whole of making it work on a dark ground. Safe on this element: it
   has no background of its own to resolve against them. */
.fw .moneyband-rail { margin-top:var(--sp-10); padding-top:var(--sp-8);
  border-top:1px solid #2c2f31;
  --line:#3a3e40; --ink:#f3f4f4; --ink-3:#9b9c9d; --brand:#5fb48f;
  --paper:#111315; --control-line:#5a5e61; }
@media (max-width:900px) {
  .fw .moneyband-h { grid-template-columns:1fr; gap:var(--sp-5); align-items:start; }
  .fw .moneyband-rail { margin-top:var(--sp-7); padding-top:var(--sp-6); }
}

/* ==== heading beside content =============================================
   The alternative to centring everything. The heading holds the left column
   and sticks while the content scrolls past it, so a reader three steps into
   a list still has the question those steps answer in view.

   Sticky only where there is a second column to scroll against: below 900
   the grid folds and a pinned heading would just sit on top of the content
   it introduces. */
.fw .aside-grid { display:grid; grid-template-columns:minmax(0,0.78fr) minmax(0,1.22fr);
  gap:var(--sp-10); align-items:start; }
.fw .aside-head { position:sticky; top:calc(var(--nav-h) + var(--sp-7)); }
.fw .aside-head .lp-h2 { max-width:16ch; }
.fw .aside-body { min-width:0; }
@media (max-width:900px) {
  .fw .aside-grid { grid-template-columns:1fr; gap:var(--sp-6); }
  .fw .aside-head { position:static; }
  .fw .aside-head .lp-h2 { max-width:20ch; }
}

/* ==== the hero =============================================================
   Rebuilt so the largest thing on the page is the sentence that does the
   work. The wordmark used to hold that slot at 56px, with the proposition
   beneath it at a third the size -- which put the brand name, meaningless to
   a first-time reader, above the one line that tells them what this is.

   The two columns are aligned to their tops rather than centred. Centring
   made the left column float against a much taller card, with the text
   starting a hundred pixels below the wallet's first line and ending a
   hundred above its last; tops-aligned, the headline and the balance begin
   together, which is the comparison the hero is making. */
.fw .hero-grid { align-items:start; }
.fw .hero-left { display:flex; flex-direction:column; min-width:0; }

/* A small claim of audience, before the big one of capability. The dot is a
   token square rather than an emoji: an emoji would be the one thing on this
   page rendering in somebody else's typeface. */
.fw .hero-kicker { display:flex; align-items:center; gap:9px; margin:0;
  font-size:var(--fs-2); letter-spacing:0.04em; text-transform:uppercase;
  font-weight:var(--fw-med); color:var(--ink-3); }
.fw .hero-kicker-dot { width:7px; height:7px; flex:none; background:var(--brand); }

/* clamp, not a step on the scale. The headline is two lines by design and
   has to stay two lines from 1440 down to about 900, where the grid folds --
   a fixed size either wraps to three on a laptop or shrinks the impact on a
   desktop. text-wrap:balance keeps the break even if the <br> is overridden
   by a narrower box. */
.fw .hero-h1 { margin:var(--sp-5) 0 0; font-size:clamp(34px, 4.6vw, 62px);
  line-height:1.04; letter-spacing:-0.035em; font-weight:var(--fw-bold);
  color:var(--ink); text-wrap:balance; }
.fw .hero-lead { margin:var(--sp-5) 0 0; font-size:var(--fs-5); line-height:1.55;
  color:var(--ink-2); max-width:46ch; }

.fw .hero-cta { display:flex; flex-wrap:wrap; gap:10px; margin-top:var(--sp-7); }

/* The three figures that close the column. They sit on a rule rather than in
   cards: three more bordered boxes directly under two buttons would read as a
   second row of controls. */
.fw .hero-facts { display:flex; flex-wrap:wrap; gap:var(--sp-7);
  margin:var(--sp-8) 0 0; padding-top:var(--sp-5);
  border-top:1px solid var(--line); }
.fw .hero-facts > div { min-width:0; }
.fw .hero-facts dd { margin:3px 0 0; }

@media (max-width:900px) {
  .fw .hero-h1 { font-size:clamp(30px, 8vw, 40px); }
  .fw .hero-lead { font-size:var(--fs-4); max-width:none; }
  .fw .hero-facts { gap:var(--sp-5) var(--sp-6); margin-top:var(--sp-6); }
  .fw .hero-cta > .btn { flex:1 1 auto; justify-content:center; }
}

/* The hero's second line. It is the qualifier on the headline above it, not a
   paragraph, so it stays one line of plain type: the argument that used to
   live here moved into the wallet on the right, which makes it better than
   prose could. */
.fw .hero-sub { margin:var(--sp-4) 0 0; font-size:var(--fs-5); line-height:1.5;
  color:var(--ink-2); max-width:34ch; }
@media (max-width:760px) { .fw .hero-sub { font-size:var(--fs-4); } }
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
/* An in-page link's landing spot.
   The dashboard header is sticky, so an anchor with no scroll margin puts the
   heading it precedes underneath it: you arrive having apparently scrolled to
   the wrong place. Zero height, so it only ever moves where a scroll stops. */
.fw .anchor { scroll-margin-top:calc(var(--nav-h) + var(--sp-4)); }
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

/* Opening a <details> smoothly.

   The .disc-panel rule above animates 0fr to 1fr, which is the usual trick,
   but it only works on markup where a wrapper is always rendered and a class
   marks the state. A native <details> does not render its content at all
   while it is closed, so there is nothing there to transition from -- which
   is why the FAQ snapped open while its plus sign animated politely beside it.

   ::details-content is the part the browser creates for that content, so it
   can be given a height and transitioned like anything else. Two things are
   needed with it: interpolate-size, because the open height is auto and auto
   is not otherwise animatable; and allow-discrete on content-visibility, so
   the content stays visible for the length of the close instead of vanishing
   on the first frame.

   Behind @supports, like the scroll-driven nav above. Firefox has neither
   part yet, and there it keeps today's instant toggle -- the disclosure still
   opens, closes and reads correctly, which is the behaviour the accessibility
   page promises. Nothing here is required for the content to be reachable. */
@supports selector(::details-content) and (interpolate-size: allow-keywords) {
  .fw .disc, .fw .wh-more { interpolate-size:allow-keywords; }
  .fw .disc::details-content, .fw .wh-more::details-content {
    block-size:0; overflow:hidden;
    transition:block-size var(--t-2) var(--ease),
               content-visibility var(--t-2) var(--ease) allow-discrete; }
  .fw .disc[open]::details-content, .fw .wh-more[open]::details-content { block-size:auto; }
  @media (prefers-reduced-motion: reduce) {
    .fw .disc::details-content, .fw .wh-more::details-content { transition:none; }
  }
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
.fw .wallethero { background:var(--surface); color:var(--ink);
  border:1px solid var(--line); padding:var(--sp-8) var(--sp-7);
  margin-bottom:var(--sp-7); }
.fw .wallethero .wh-label { display:block; font-size:var(--fs-2); letter-spacing:0.02em;
  color:var(--ink-3); }
.fw .wallethero .wh-big { display:block; font-size:var(--fs-10); line-height:1.02;
  letter-spacing:-0.03em; font-weight:var(--fw-bold); font-variant-numeric:tabular-nums;
  margin-top:var(--sp-2); }
.fw .wallethero .wh-sub { display:block; font-size:var(--fs-3); color:var(--ink-2);
  margin-top:var(--sp-3); max-width:46ch; }
/* The breakdown, on one rule. Every figure a founder might question about the
   big number above, in the order the money actually moves through them. */
.fw .wh-break { display:grid; grid-auto-flow:column; grid-auto-columns:minmax(0,1fr);
  gap:var(--sp-5); margin-top:var(--sp-7); padding-top:var(--sp-5);
  border-top:1px solid var(--line); }
.fw .wh-break > div { min-width:0; }
.fw .wh-break dt { display:block; font-size:var(--fs-2); color:var(--ink-3); }
.fw .wh-break dd { display:block; margin:3px 0 0; font-size:var(--fs-5); font-weight:var(--fw-med);
  font-variant-numeric:tabular-nums; }
/* Settled money is pine everywhere else on the site, so it is pine here --
   the token now, not a tint of it, because the ground is an ordinary surface
   and --pine is measured against exactly that in both themes. */
.fw .wh-break dd[data-tone="settled"] { color:var(--pine); }
.fw .wh-break dd[data-tone="out"] { color:var(--clay); }
.fw .wallethero .row { margin-top:var(--sp-6); }
/* The breakdown, folded away.
   Five figures on a rule under the headline number meant the first thing a
   founder saw was six numbers, not one. They are still here, still exact, one
   click down: the question "how much do I have" gets answered before the
   question "why is it that much" is even asked. */
.fw .wh-more { margin-top:var(--sp-6); border-top:1px solid var(--line);
  padding-top:var(--sp-4); }
.fw .wh-more > summary { list-style:none; cursor:pointer; display:inline-flex;
  align-items:center; gap:8px; font-size:var(--fs-2); color:var(--ink-2); }
.fw .wh-more > summary::-webkit-details-marker { display:none; }
.fw .wh-more > summary:hover { color:var(--ink); }
.fw .wh-more > summary::after { content:"+"; font-size:var(--fs-4); line-height:1; color:var(--ink-3); }
.fw .wh-more[open] > summary::after { content:"−"; }
.fw .wh-more[open] > summary { color:var(--ink); margin-bottom:var(--sp-4); }
/* Inside the disclosure the breakdown does not need its own rule and gap: the
   disclosure already draws one above its summary, and stacking both put two
   hairlines and forty pixels of nothing between the question and the answer. */
.fw .wh-more .wh-break { margin-top:0; padding-top:0; border-top:0; }

/* Account & setup, folded away. Everything here is real and occasionally
   necessary -- the guardian's state, what verification is waiting on -- and
   none of it is why anyone opened the page. It gets a disclosure rather than a
   column of its own, so the page can be about money. */
.fw .acct { border-top:1px solid var(--line); margin-top:var(--sp-7); }
.fw .acct > summary { list-style:none; cursor:pointer; display:inline-flex;
  align-items:center; gap:8px; padding:var(--sp-5) 0; font-size:var(--fs-4);
  font-weight:var(--fw-bold); letter-spacing:-0.012em; color:var(--ink); }
.fw .acct > summary::-webkit-details-marker { display:none; }
.fw .acct > summary::after { content:"+"; font-size:var(--fs-5); line-height:1;
  color:var(--ink-3); }
.fw .acct[open] > summary::after { content:"−"; }
.fw .acct-b { padding-bottom:var(--sp-5); }

/* The earnings hero's figures and its week of bars. The panel itself is
   .wallethero above; these are the parts that only exist on the dashboard. */
.fw .eh-top { display:flex; align-items:flex-end; justify-content:space-between;
  gap:var(--sp-6); flex-wrap:wrap; }
.fw .eh-figs { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:var(--sp-5);
  margin-top:var(--sp-7); padding-top:var(--sp-5); border-top:1px solid var(--line); }
.fw .eh-n { display:block; font-size:var(--fs-6); font-weight:var(--fw-bold);
  letter-spacing:-0.02em; line-height:1.1; font-variant-numeric:tabular-nums; }
.fw .eh-l { display:block; margin-top:3px; font-size:var(--fs-2); color:var(--ink-3); }
.fw .eh-chart { display:flex; align-items:stretch; gap:6px; height:88px;
  margin-top:var(--sp-6); }
.fw .eh-col { flex:1 1 0; display:flex; flex-direction:column; gap:6px; min-width:0; }
/* The track is what a bar's percentage is measured against, so the tallest day
   fills it exactly and the rest stay in proportion to it. */
.fw .eh-track { flex:1 1 auto; display:flex; align-items:flex-end; }
.fw .eh-bar { display:block; width:100%; background:var(--pine); min-height:2px; }
/* A day with nothing in it gets a hairline, not a bar: an empty day is a fact
   worth seeing, and a zero-height bar reads as a rendering fault. */
.fw .eh-bar[data-zero="1"] { background:var(--line); height:2px !important; }
.fw .eh-d { text-align:center; font-size:var(--fs-1); color:var(--ink-3); }
@media (max-width:560px) {
  .fw .eh-figs { grid-template-columns:repeat(3,minmax(0,1fr)); gap:var(--sp-3); }
  .fw .eh-n { font-size:var(--fs-5); }
  .fw .eh-chart { height:52px; }
}

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
/* The code beside what you do with it, rather than above it. A snippet whose
   longest line is ~70 characters in a 1300px panel leaves a third of the row
   empty; the actions take that space. */
.fw .addapp-grid { display:grid; grid-template-columns:minmax(0,1fr); gap:var(--sp-6);
  align-items:start; margin-top:var(--sp-5); }
@media (min-width:900px) {
  .fw .addapp-grid { grid-template-columns:minmax(0,7fr) minmax(0,5fr); gap:var(--sp-7); }
}
.fw .addapp-side > :first-child { margin-top:0; }

/* The snippet itself, with the founder's own product id in it. Scrolls rather
   than wraps: this is code someone is about to paste, and a soft-wrapped line
   reads as a line break that is not there. */
.fw .addapp-code { margin:0; padding:var(--sp-5); background:var(--surface);
  border:1px solid var(--line); overflow-x:auto; }
.fw .addapp-code code { font-family:var(--code); font-size:var(--fs-2); line-height:1.65;
  color:var(--ink-2); white-space:pre; tab-size:2; }
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
   right-aligned and identical in weight, so "what was I paid", "what did the
   fee take" and "what did I keep" all looked the same. Each payment is
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
  opacity:0; animation:veyro-skel-in .16s var(--ease) var(--skel-gate, 240ms) forwards; }
@keyframes veyro-skel-in { to { opacity:1; } }
/* The gate stays; only the fade goes. Someone who asked for less motion still
   wants a fast page to go straight to its content. */
@media (prefers-reduced-motion: reduce) {
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
/* Deliberately NOT var(--ink), which is what the real wallet band uses.
   Matching it put a black band across the top of a white page, so the loading
   screen read as two screens spliced together. A placeholder holds the shape
   and the proportions; it does not have to reproduce the colour of something
   that is not on screen yet. One tone, whichever theme you are in. */
.fw .skel-hero { background:var(--surface); border:1px solid var(--line-soft);
  padding:var(--sp-8) var(--sp-7); margin-bottom:var(--sp-7); }
/* Its blocks are the same blocks as everywhere else now. */
/* Balance on the left, action on the right, like the band it stands for. */
.fw .skel-herorow { display:flex; align-items:flex-start; justify-content:space-between;
  gap:var(--sp-6); flex-wrap:wrap; }
/* The dashboard skeleton's own pieces, each mirroring a real one: the three
   figures under the balance, the week as a strip, the snippet beside its
   actions, and a transaction row. Same dim blocks as everything else -- a
   placeholder that matches the layout does not also need to be loud. */
.fw .skel-figs { display:grid; grid-template-columns:repeat(3,minmax(0,1fr));
  gap:var(--sp-5); margin-top:var(--sp-7); padding-top:var(--sp-5);
  border-top:1px solid var(--line); }
.fw .skel-week { display:flex; align-items:flex-end; gap:6px; height:64px;
  margin-top:var(--sp-6); }
.fw .skel-weekcol { flex:1 1 0; display:flex; align-items:flex-end; height:100%; }
.fw .skel-weekbar { width:100%; }
.fw .skel-int { display:grid; grid-template-columns:minmax(0,1fr); gap:var(--sp-5);
  margin-top:var(--sp-5); align-items:start; }
@media (min-width:900px) {
  .fw .skel-int { grid-template-columns:minmax(0,7fr) minmax(0,5fr); gap:var(--sp-6); }
}
.fw .skel-row { display:flex; align-items:center; justify-content:space-between;
  gap:var(--sp-5); padding:12px 0; border-bottom:1px solid var(--line-soft); }
.fw .skel-row:first-of-type { margin-top:var(--sp-4); border-top:1px solid var(--line-soft); }
@media (max-width:560px) {
  .fw .skel-figs { gap:var(--sp-3); }
  .fw .skel-week { height:48px; }
}
.fw .skel-card { border:1px solid var(--line); background:var(--card);
  padding:var(--sp-5); margin-bottom:var(--sp-5); }
@media (max-width:760px) {
  .fw .skel-hero { padding:var(--sp-7) var(--sp-5); }
}

/* ==== instrument type ====================================================
   Marketing type and financial type are two different jobs and should not
   look like one. Prose wants a comfortable measure and proportional figures;
   a balance wants to read like a panel -- fixed-width digits that do not
   shuffle as they change, a label that is clearly a label, and enough
   letterspacing on the label to stop it competing with the number.

   .num already existed and did the tabular part. These build the rest of the
   treatment on top of it so a figure can be dropped anywhere on the site and
   arrive looking like the product rather than like a headline. */
.fw .fig { font-variant-numeric:tabular-nums lining-nums; font-feature-settings:"tnum" 1;
  font-weight:var(--fw-bold); letter-spacing:-0.022em; color:var(--ink); line-height:1.04;
  display:block; }
.fw .fig-xl { font-size:var(--fs-9); }
.fw .fig-lg { font-size:var(--fs-8); }
.fw .fig-md { font-size:var(--fs-7); }
.fw .fig-sm { font-size:var(--fs-5); }
/* The label above or below a figure. Uppercase at this size needs the extra
   tracking to stay legible, and the weight stays at 500 so it never reads as
   a heading. */
.fw .fig-k { display:block; font-size:var(--fs-1); letter-spacing:0.07em;
  text-transform:uppercase; color:var(--ink-3); font-weight:var(--fw-med); }
/* An identifier rather than a quantity: a payout number, a reference. Monospaced
   because it is read character by character, not at a glance. */
.fw .fig-ref { font-family:var(--code); font-size:var(--fs-1); letter-spacing:0.04em;
  color:var(--ink-3); font-variant-numeric:tabular-nums; text-transform:uppercase; }
.fw .fig-pos { color:var(--pine); }
.fw .fig-sub { display:block; margin-top:6px; font-size:var(--fs-2); color:var(--ink-3); }
/* A figure group: label, number, optional sub. Used wherever a page states a
   quantity it wants read as money rather than as copy. */
.fw .figrow { display:grid; grid-template-columns:repeat(auto-fit,minmax(140px,1fr));
  gap:var(--sp-5) var(--sp-6); }
.fw .figrow > div { min-width:0; }

/* ==== money rail =========================================================
   The one picture the whole product is: money entering at one end, arriving
   at the other, and Veyro being the thing it passes through. It appears on
   every page where the architecture matters, drawn identically each time,
   because five drawings of one idea is five chances to contradict yourself.

   The travelling spark is the only moving part. It is one element on a track,
   not an animation per segment, so the timing cannot drift out of step with
   the line it is running along. */
.fw .mrail { position:relative; }
.fw .mrail-track { margin:0; padding:0; list-style:none; display:grid; gap:var(--sp-2);
  grid-template-columns:repeat(var(--mrail-n,5),minmax(0,1fr)); }
/* The line the spark runs on, behind the nodes. Insets by half a cell so it
   starts and ends at the centre of the first and last node rather than at the
   edge of the row. */
.fw .mrail-line { display:block; position:absolute; top:13px;
  left:calc(50% / var(--mrail-n,5)); right:calc(50% / var(--mrail-n,5));
  height:1px; background:var(--line); overflow:hidden; }
.fw .mrail-spark { position:absolute; top:0; left:0; width:34%; height:100%;
  background:linear-gradient(90deg,transparent,var(--brand),transparent);
  animation:veyro-mrail 3.4s var(--ease) infinite; }
@keyframes veyro-mrail {
  0% { transform:translateX(-100%); }
  100% { transform:translateX(calc(100% / 0.34)); }
}
.fw .mrail-node { position:relative; display:flex; flex-direction:column;
  align-items:center; text-align:center; gap:6px; min-width:0; }
.fw .mrail-dot { width:9px; height:9px; border-radius:50%; background:var(--paper);
  border:1px solid var(--control-line); margin-top:9px; flex:none; position:relative; }
/* The stops Veyro owns. Filled rather than outlined, which is the whole
   claim the picture is making. */
.fw .mrail-node[data-ours="1"] .mrail-dot { background:var(--brand); border-color:var(--brand); }
.fw .mrail-k { font-size:var(--fs-1); letter-spacing:0.05em; text-transform:uppercase;
  color:var(--ink-3); font-weight:var(--fw-med); }
.fw .mrail-t { font-size:var(--fs-2); font-weight:var(--fw-med); color:var(--ink);
  line-height:1.3; }
.fw .mrail-node[data-ours="1"] .mrail-t { color:var(--brand); }
/* Below 620px the rail turns and runs down the page. The line moves to the
   left gutter and the labels sit beside it, which is the only arrangement
   that survives five stops at 375px. */
@media (max-width:620px) {
  .fw .mrail-track { grid-template-columns:1fr; gap:var(--sp-4); }
  .fw .mrail-line { top:14px; bottom:14px; left:4px; right:auto; width:1px; height:auto; }
  .fw .mrail-spark { width:100%; height:28%;
    background:linear-gradient(180deg,transparent,var(--brand),transparent);
    animation-name:veyro-mrail-v; }
  @keyframes veyro-mrail-v {
    0% { transform:translateY(-100%); }
    100% { transform:translateY(calc(100% / 0.28)); }
  }
  .fw .mrail-node { flex-direction:row; align-items:baseline; text-align:left;
    gap:var(--sp-3); }
  .fw .mrail-dot { margin-top:0; align-self:center; }
  .fw .mrail-k { flex:none; width:7ch; }
}
@media (prefers-reduced-motion: reduce) {
  .fw .mrail-spark { animation:none; opacity:.5; width:100%;
    background:linear-gradient(90deg,transparent,var(--brand),transparent); }
}

/* ==== the hero wallet's moving parts ======================================
   Everything here is a change of state in a card that must not change size.
   The hero is the first thing painted and the last thing that should reflow,
   so the arriving row holds its height from the first frame and only its
   contents fade in. */
.fw .lw-chips { margin-top:var(--sp-5); padding-top:var(--sp-4);
  border-top:1px solid var(--line); }
.fw .lw-led { margin-top:var(--sp-4); }
/* No animation on the figure itself. The digits now count to the new balance,
   and a lift underneath a count is two effects competing for the same glance.
   The counting is the signal. */
.fw .lw-bal { margin-top:5px; }
/* The row reserves its box immediately and reveals its contents. Collapsing
   the height instead would make the card grow under the reader's eye. */
.fw .lw-new { opacity:0; transition:opacity var(--t-3) var(--ease-out); }
.fw .lw-new[data-in="1"] { opacity:1; animation:veyro-lw-row 420ms var(--ease-out) 1; }
@keyframes veyro-lw-row {
  from { opacity:0; transform:translateY(-8px); }
  to { opacity:1; transform:none; }
}
.fw .dp-cta[data-state="done"] { background:var(--pine-bg); color:var(--pine);
  border-color:var(--pine-line); }
@media (prefers-reduced-motion: reduce) {
  .fw .lw-new, .fw .lw-new[data-in="1"] { animation:none; transition:none; }
  /* Reduced motion is moved straight to the finished state, so the row is
     simply there. */
  .fw .lw-new { opacity:1; }
}

/* ==== ledger ==============================================================
   A transaction list that is a transaction list, not a table of text. Rows
   arrive one after another the first time the block is seen, which is the
   only honest animation for a ledger: that is what a ledger does. */
.fw .led { border-top:1px solid var(--line); }
.fw .led-row { display:grid; grid-template-columns:1fr auto auto;
  align-items:center; gap:var(--sp-3); padding:11px 0;
  border-bottom:1px solid var(--line-soft); }
.fw .led-n { font-size:var(--fs-3); font-weight:var(--fw-med); min-width:0;
  overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.fw .led-sub { display:block; font-size:var(--fs-1); color:var(--ink-3);
  font-weight:var(--fw-reg); }
.fw .led-amt { font-variant-numeric:tabular-nums lining-nums; font-size:var(--fs-3);
  font-weight:var(--fw-bold); white-space:nowrap; }
.fw .led[data-animate="1"] .led-row { animation:veyro-led var(--t-3) var(--ease-out) both;
  animation-delay:calc(var(--i,0) * 90ms + 120ms); }
@keyframes veyro-led {
  from { opacity:0; transform:translateY(7px); }
  to { opacity:1; transform:none; }
}
@media (prefers-reduced-motion: reduce) {
  .fw .led[data-animate="1"] .led-row { animation:none; }
}
/* At phone width three columns leave the product name about 140px, which
   truncates almost every real one. The amount is what the eye goes to, so it
   keeps the top line beside the name; the state chip drops underneath, where
   there is room for it to stay a chip rather than become an abbreviation. */
@media (max-width:480px) {
  .fw .led-row { grid-template-columns:minmax(0,1fr) auto; row-gap:7px; }
  .fw .led-n { grid-column:1; grid-row:1; white-space:normal; overflow:visible;
    text-overflow:clip; }
  .fw .led-amt { grid-column:2; grid-row:1; align-self:start; }
  .fw .led-row > .chip { grid-column:1; grid-row:2; justify-self:start; }
}

/* ==== state chips =========================================================
   One spelling of a payment's life, used everywhere it is drawn: received,
   settling, available, requested, paid. The sequence is the product, so the
   chips that name it have to look the same on every page that shows it. */
.fw .chips { display:flex; flex-wrap:wrap; align-items:center; gap:6px; }
.fw .chip { display:inline-flex; align-items:center; gap:5px; height:22px;
  padding:0 8px; font-size:var(--fs-1); font-weight:var(--fw-bold);
  letter-spacing:0.03em; text-transform:uppercase; border:1px solid var(--line);
  color:var(--ink-3); background:var(--surface); white-space:nowrap;
  transition:color var(--t-2) var(--ease), border-color var(--t-2) var(--ease),
             background-color var(--t-2) var(--ease); }
.fw .chip[data-on="1"][data-tone="pine"]  { color:var(--pine);  border-color:var(--pine-line);  background:var(--pine-bg); }
.fw .chip[data-on="1"][data-tone="amber"] { color:var(--amber); border-color:var(--amber-line); background:var(--amber-bg); }
.fw .chip[data-on="1"][data-tone="slate"] { color:var(--slate); border-color:var(--slate-line); background:var(--slate-bg); }
.fw .chip-sep { color:var(--ink-3); font-size:var(--fs-1); flex:none; }
@media (prefers-reduced-motion: reduce) { .fw .chip { transition:none; } }

/* ==== the eligibility checker ============================================
   A page with one job, laid out so that job is the biggest thing on it.

   It has been wrong twice. First everything was stacked down the left of a
   1400px page with the right half empty. Then it was two columns -- a 240px
   form beside a 450px column of sourcing, neither aligned to the other, and
   the question a visitor actually came to answer reduced to the smaller of
   the two. Two questions do not need a column layout.

   Now: a header, the tool centred under it at a width that suits a form
   rather than an article, the answer directly beneath, and the evidence as a
   band across the full width below. The band is also what stops the page
   ending in six hundred pixels of nothing, which is what it did when the
   content ran out at half the viewport height. */
.fw .ckpage { background:var(--surface); }
.fw .ckhead { padding:var(--sp-10) 0 var(--sp-8); text-align:center; }
.fw .ckhead-h { margin:var(--sp-3) 0 0; font-size:clamp(30px, 4vw, 46px);
  line-height:1.08; letter-spacing:-0.03em; font-weight:var(--fw-bold); }
.fw .ckhead-lead { margin:var(--sp-5) auto 0; font-size:var(--fs-5); line-height:1.55;
  color:var(--ink-2); max-width:58ch; }

/* The tool. 640px is a form's width, not an article's -- wide enough for two
   fields side by side and narrow enough that the Check button is never a
   stretched bar the width of a desktop. */
.fw .cktool { max-width:640px; margin-inline:auto; padding-bottom:var(--sp-10); }
.fw .cktool .card { margin-top:0 !important; }
/* Overrides the 46ch cap the shared card-prose rule puts on anything holding
   a .checkform. That cap was written when this card sat in a wide column and
   needed reining in; here the card IS the column. */
.fw .cktool .card.card-prose { max-width:none; }
.fw .cktool .card-b { padding:var(--sp-7); }
/* Two fields across on anything wider than a phone. Stacked, a two-question
   form is a tall thin ladder with a button at the bottom. */
.fw .cktool .checkform { display:grid; grid-template-columns:repeat(2, minmax(0,1fr));
  gap:var(--sp-5); align-items:end; }
.fw .cktool .checkform > .field:only-child { grid-column:1 / -1; }
.fw .cktool .checkform > .btn,
.fw .cktool .checkform > button { grid-column:1 / -1; justify-content:center; }
@media (max-width:560px) {
  .fw .cktool .checkform { grid-template-columns:1fr; gap:var(--sp-4); }
  .fw .cktool .card-b { padding:var(--sp-5); }
  .fw .ckhead { padding:var(--sp-8) 0 var(--sp-6); }
}

/* The evidence band. A different ground from the tool above it, so the page
   reads as answer-then-working rather than as one long column. */
.fw .ckevidence { background:var(--paper); border-top:1px solid var(--line);
  padding:var(--sp-9) 0 var(--sp-10); }
/* 132px, not 160. At 375 the content box is 343px and two 160px tracks plus
   the gap came to 344 -- one pixel over, so the four figures fell to one per
   row and the band became a tall ladder on exactly the screen with least
   room for one. */
.fw .ckevidence .figrow { grid-template-columns:repeat(auto-fit, minmax(132px, 1fr));
  margin-top:var(--sp-5); }
/* The two filters read side by side here; the band is wide enough for it and
   stacking them would put the page back into one narrow strip. */
.fw .ckevidence .ckfilters { display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr));
  gap:var(--sp-5) var(--sp-8); margin-top:var(--sp-7);
  padding-top:var(--sp-6); border-top:1px solid var(--line); }
.fw .ckevidence .ckfilters p { margin:0; max-width:52ch; }

/* ==== the eligibility answer ==============================================
   The one place on the site where motion is a response rather than an
   entrance: the reader pressed a button and this is the reply. It is short
   and it rises rather than fading alone, because a block that merely appears
   at full opacity is easy to miss directly under the control you just used. */
.fw .check-res { margin-top:var(--sp-4);
  animation:veyro-check var(--t-3) var(--ease-out) both; }
@keyframes veyro-check {
  from { opacity:0; transform:translateY(8px); }
  to { opacity:1; transform:none; }
}
@media (prefers-reduced-motion: reduce) { .fw .check-res { animation:none; } }

/* ==== the parent's panel ==================================================
   Reuses the .dp window chrome, because the point is that this is the same
   application the founder is looking at rather than a marketing drawing of
   one. What is added is the setup sequence and the controls. */
/* Two columns above the fold-down point: the sequence on the left, what the
   parent keeps on the right. One column left every row two-thirds empty, and
   side by side is also the truer picture -- the controls are not something
   that happens after the setup, they are there the whole time. */
.fw .pp .dp-body { padding-top:var(--sp-5); display:grid; gap:var(--sp-6) var(--sp-7);
  grid-template-columns:minmax(0,1fr) minmax(0,1fr); align-items:start; }
@media (max-width:720px) {
  .fw .pp .dp-body { grid-template-columns:1fr; gap:var(--sp-5); }
}
.fw .pp-steps { list-style:none; margin:0; padding:0; }
.fw .pp-step { display:flex; gap:var(--sp-3); padding:10px 0;
  border-bottom:1px solid var(--line-soft); align-items:flex-start; }
.fw .pp-step:last-child { border-bottom:0; }
.fw .pp-tick { flex:none; width:19px; height:19px; margin-top:1px;
  display:inline-flex; align-items:center; justify-content:center;
  border:1px solid var(--control-line); color:transparent;
  background:var(--surface);
  transition:color var(--t-2) var(--ease), background-color var(--t-2) var(--ease),
             border-color var(--t-2) var(--ease); }
.fw .pp-step[data-done="1"] .pp-tick { color:var(--reverse); background:var(--pine);
  border-color:var(--pine); }
.fw .pp-step-b { min-width:0; }
.fw .pp-step-t { display:flex; align-items:center; gap:7px; flex-wrap:wrap;
  font-size:var(--fs-3); font-weight:var(--fw-med); color:var(--ink); }
.fw .pp-step-d { display:block; margin-top:2px; font-size:var(--fs-2); color:var(--ink-3); }
/* The two steps that are the parent's. Naming them inside the sequence is the
   clearest way to say that the other two are not. */
.fw .pp-you { font-size:var(--fs-1); font-weight:var(--fw-bold); letter-spacing:0.05em;
  text-transform:uppercase; color:var(--slate); border:1px solid var(--slate-line);
  background:var(--slate-bg); padding:1px 6px; }
.fw .pp-ctl { padding-left:var(--sp-7); border-left:1px solid var(--line); }
@media (max-width:720px) {
  .fw .pp-ctl { padding-left:0; border-left:0; padding-top:var(--sp-5);
    border-top:1px solid var(--line); }
}
.fw .pp-btns { display:grid; gap:var(--sp-2); margin-top:var(--sp-4); }
/* Drawn as controls, not as a list, because the reassurance is that these are
   buttons. Inert on purpose: a real one here would be a lie about what a
   button does. */
.fw .pp-btn { border:1px solid var(--control-line); background:var(--surface);
  padding:10px var(--sp-4); }
.fw .pp-btn-t { display:block; font-size:var(--fs-3); font-weight:var(--fw-med); }
.fw .pp-btn-d { display:block; margin-top:2px; font-size:var(--fs-2); color:var(--ink-3); }
@media (prefers-reduced-motion: reduce) { .fw .pp-tick { transition:none; } }

/* ==== this month, and disputes ===========================================
   Two dashboard blocks that both carry money facts a founder has to be able
   to take in at a glance, so both use the instrument type rather than prose. */
.fw .month { margin-top:var(--sp-6); padding:var(--sp-5) 0;
  border-top:1px solid var(--line); }
.fw .month-line { display:flex; flex-wrap:wrap; align-items:baseline; gap:0 8px; }
.fw .month-line .fig { display:inline; }
.fw .month-sep { font-size:var(--fs-3); color:var(--ink-3); }
.fw .month-free { font-size:var(--fs-3); color:var(--pine); font-weight:var(--fw-med); }
.fw .month-line .fig[data-fee="1"] { color:var(--ink); }
/* The crossing. Deliberately quiet: this is a fact about the month, not an
   offer, and anything that looks like a sales banner would be exactly the
   thing the brief says not to build. */
.fw .month-crossed { margin-top:var(--sp-4); padding:var(--sp-4) var(--sp-5);
  border-left:3px solid var(--pine); background:var(--surface);
  font-size:var(--fs-3); line-height:1.55; }

.fw .dispute { border:1px solid var(--line); background:var(--card);
  padding:var(--sp-5); }
.fw .dispute + .dispute { margin-top:var(--sp-4); }
.fw .dispute-h { display:flex; align-items:center; justify-content:space-between;
  gap:var(--sp-4); flex-wrap:wrap; }
.fw .dispute-h .fig { display:inline; }
/* A deadline is the one thing on this panel that can cost somebody money by
   being missed, so it is the one thing drawn in the warning colour. */
.fw .dispute-due { margin:var(--sp-3) 0 0; padding-left:var(--sp-4);
  border-left:3px solid var(--amber); font-size:var(--fs-3); line-height:1.55;
  color:var(--ink); }
.fw .dispute-help, .fw .payout-help { margin-top:var(--sp-4); padding-top:var(--sp-4);
  border-top:1px solid var(--line-soft); }
@media (max-width:560px) {
  .fw .dispute { padding:var(--sp-4); }
  .fw .month-line { gap:0 6px; }
}

/* ==== the deal, and the sum ==============================================
   Pricing used to be two bordered panels side by side, which is a comparison
   whether or not you mean it as one: the eye reads two boxes as two things to
   choose between, and the left one as the lesser. There is one product, so
   there is one column now and the panels are gone along with their CSS.

   The deal is three lines, not a table. Two figures and a sentence saying the
   figures are the only thing that changes. */
.fw .deal { margin-top:var(--sp-7); padding:var(--sp-6) 0;
  border-top:2px solid var(--brand); border-bottom:1px solid var(--line); }
.fw .deal-l { margin:0 0 6px; font-size:var(--fs-6); line-height:1.34;
  letter-spacing:-0.012em; color:var(--ink);
  font-variant-numeric:tabular-nums lining-nums; }
.fw .deal-l strong { font-weight:var(--fw-bold); }
.fw .deal-n { margin:var(--sp-4) 0 0; font-size:var(--fs-3); color:var(--ink-2); }
/* A disclosure that has to be read before somebody transacts, not a footnote.
   Given the amber rule rather than a tinted panel: tinted grounds are
   transparent in the light theme by design, so a panel would be a box that
   vanishes in the theme most people see. A left rule is visible in both. */
.fw .deal-warn { margin:var(--sp-5) 0 0; padding-left:var(--sp-4);
  border-left:3px solid var(--amber); font-size:var(--fs-3); line-height:1.55;
  color:var(--ink); max-width:56ch; }

/* The worked examples. A reader is being invited to check the arithmetic, so
   the figures are columns that line up rather than numbers in sentences:
   tabular digits, right-aligned, and the middle column quieter because it is
   the working rather than the answer. */
.fw .ptable { margin-top:var(--sp-5); }
.fw .ptable th:not(:first-child),
.fw .ptable td:not(:first-child) { text-align:right; }
.fw .ptable td { font-variant-numeric:tabular-nums lining-nums;
  font-feature-settings:"tnum" 1; }
.fw .ptable-mid { color:var(--ink-3); }
.fw .ptable-fee { font-weight:var(--fw-bold); }
/* Zero is the argument this table is making, so it is drawn as a result
   rather than as an absence. */
.fw .ptable-fee[data-free="1"] { color:var(--pine); }
@media (max-width:560px) {
  .fw .ptable th, .fw .ptable td { padding-left:var(--sp-3); padding-right:var(--sp-3); }
  .fw .ptable th:first-child, .fw .ptable td:first-child { padding-left:0; }
  .fw .ptable th:last-child, .fw .ptable td:last-child { padding-right:0; }
}

/* ==== the pricing calculator ==============================================
   A range input styled to carry an argument. The track is tinted across the
   free band so the reader can see, before touching it, that a quarter of the
   scale costs nothing -- and the thumb is a square because nothing else on
   this site has a radius.

   The vendor pseudo-elements cannot be combined into one selector list: a
   browser that does not recognise one of them drops the whole rule, so the
   WebKit and Firefox halves are written out separately on purpose. */
.fw .calc { border:1px solid var(--line); background:var(--card); padding:var(--sp-6); }
.fw .calc-top { display:flex; flex-direction:column; gap:5px; margin-bottom:var(--sp-5); }
.fw .calc-range { -webkit-appearance:none; appearance:none; width:100%; height:26px;
  background:transparent; display:block; cursor:pointer; }
.fw .calc-range:focus-visible { outline:var(--focus-w) solid var(--brand);
  outline-offset:var(--focus-offset); }
.fw .calc-range::-webkit-slider-runnable-track { height:6px; border:1px solid var(--control-line);
  background:linear-gradient(90deg, var(--track-free) 0, var(--track-free) var(--calc-free,10%),
    var(--track-rest) var(--calc-free,10%), var(--track-rest) 100%); }
.fw .calc-range::-moz-range-track { height:6px; border:1px solid var(--control-line);
  background:linear-gradient(90deg, var(--track-free) 0, var(--track-free) var(--calc-free,10%),
    var(--track-rest) var(--calc-free,10%), var(--track-rest) 100%); }
.fw .calc-range::-webkit-slider-thumb { -webkit-appearance:none; appearance:none;
  width:18px; height:18px; margin-top:-7px; background:var(--brand);
  border:1px solid var(--brand); }
.fw .calc-range::-moz-range-thumb { width:18px; height:18px; border-radius:0;
  background:var(--brand); border:1px solid var(--brand); }
.fw .calc-scale { display:flex; justify-content:space-between; gap:var(--sp-3);
  margin-top:7px; font-size:var(--fs-1); color:var(--ink-3); }
.fw .calc-mark { color:var(--pine); font-weight:var(--fw-med); }
.fw .calc-out { margin-top:var(--sp-6); padding-top:var(--sp-5);
  border-top:1px solid var(--line); }
/* Zero is the argument, so it is drawn as a result rather than as an absence. */
.fw .calc-out .fig[data-free="1"] { color:var(--pine); }
@media (max-width:560px) {
  .fw .calc { padding:var(--sp-5); }
  .fw .calc-scale .calc-mark { display:none; }
}

/* ==== audience split ======================================================
   Two people read this site and they are not reading for the same thing. A
   founder is asking whether they can start; a parent is asking whether this
   is legitimate. Where a page speaks to both, it says which half is which
   rather than hoping the reader sorts it out.

   The two panels differ in ground as well as in heading, because a reader
   skimming for "the bit that is for me" is looking at shape before words. */
.fw .aud { display:grid; grid-template-columns:repeat(2,minmax(0,1fr));
  gap:var(--sp-5); margin-top:var(--sp-6); }
.fw .aud-p { border:1px solid var(--line); padding:var(--sp-6); min-width:0;
  display:flex; flex-direction:column; }
.fw .aud-p[data-who="founder"] { background:var(--card); }
.fw .aud-p[data-who="parent"]  { background:var(--surface); }
.fw .aud-k { display:flex; align-items:center; gap:7px; font-size:var(--fs-1);
  letter-spacing:0.07em; text-transform:uppercase; font-weight:var(--fw-med);
  color:var(--ink-3); }
.fw .aud-k::before { content:""; width:7px; height:7px; flex:none; }
.fw .aud-p[data-who="founder"] .aud-k::before { background:var(--brand); }
.fw .aud-p[data-who="parent"]  .aud-k::before { background:var(--slate); }
.fw .aud-h { margin-top:var(--sp-3); font-size:var(--fs-6); line-height:1.3;
  letter-spacing:-0.016em; font-weight:var(--fw-bold); }
.fw .aud-b { margin-top:var(--sp-3); font-size:var(--fs-3); line-height:1.55;
  color:var(--ink-2); }
.fw .aud-foot { margin-top:auto; padding-top:var(--sp-5); }
@media (max-width:760px) {
  .fw .aud { grid-template-columns:1fr; gap:var(--sp-4); }
  .fw .aud-p { padding:var(--sp-5); }
}

/* ==== layer spacing =======================================================
   Three layers to every page: the one-sentence answer, the one diagram, and
   then everything else. The layers are told apart by the room around them
   more than by anything else, so the gap is a token rather than a number
   somebody picks again on each page. */
.fw .layer { margin-top:var(--sp-10); }
.fw .layer-tight { margin-top:var(--sp-8); }
@media (max-width:760px) {
  .fw .layer { margin-top:var(--sp-8); }
  .fw .layer-tight { margin-top:var(--sp-7); }
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

   What does not invert: .lp-dark was already dark, and its
   internals are hard-coded for a dark ground — #bcbdbd captions, white rules
   at 17% opacity. Flipping them would make a light band full of pale-grey
   text. They stay dark and take a border instead, since they can no longer
   rely on contrast with white to show their edges. */
/* No prefers-color-scheme block. Dark is applied by the data-theme attribute
   alone, so a first visit is light whatever the operating system is set to,
   and dark is a choice someone made here.

   The attribute is read from an ANCESTOR -- [data-theme="dark"] .fw -- not
   from .fw itself. It used to be the latter, which meant every .fw on the
   page had to have the attribute copied onto it by JavaScript, and any .fw
   rendered without the toggle beside it never got one. A loading.tsx skeleton
   is exactly that: its own .fw, its own <style>, no nav. On a dark page it
   came out light while the document around it stayed dark, which is the
   half-black half-white screen. Now it inherits, and no script is involved. */
[data-theme="dark"] .fw {
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
  --skel-block:#383d42;
  --skel-sheen:rgba(255,255,255,.14);
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
  --track-free:#163027; --track-rest:#24282c;
  --clay:#e39089; --clay-bg:#2b1917; --clay-line:#5d322c;
  /* Native controls, scrollbars and form widgets follow the page. */
  color-scheme: dark;
}

/* The landing page's dark band is still dark on a dark page, so it earns an
   edge to stop it dissolving into the page around it.

   The wallet hero used to be in this rule and is not any more. It was dark in
   both themes -- var(--ink) in light, this in dark -- which made "Available to
   request" a black panel on a white dashboard, and the one thing on the page
   that ignored the theme switch. It is an ordinary surface now and inverts
   with everything else. */
[data-theme="dark"] .fw section.lp.lp-dark { background:#080a0b; border:1px solid var(--line);
  color:#e8eaec; }

/* The toggle itself. A button, not a checkbox: it performs an action rather
   than recording a value, and it says which mode it will switch TO. */

/* These panels were always dark, so their text takes --reverse — "the colour
   that sits on --brand". In dark mode --reverse becomes dark, which is right
   everywhere except here, where the ground did not invert with it. The
   headline figure went near-black on near-black. The panels state their own
   ink rather than inheriting a token whose meaning flipped underneath them. */
[data-theme="dark"] .fw .lp-dark .lp-h2,
[data-theme="dark"] .fw .lp-dark h2,
[data-theme="dark"] .fw .lp-dark .d1,
[data-theme="dark"] .fw .lp-dark .d2,
[data-theme="dark"] .fw .lp-dark .statement { color:#e8eaec; }
[data-theme="dark"] .fw .lp-dark .btn { background:#e8eaec; border-color:#e8eaec; color:#0f1113; }
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

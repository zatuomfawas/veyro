// Turning one description of a message into the two halves that get sent.
//
// Its own module, with no imports, for two reasons. It is the only part of
// sending mail that is pure enough to test directly -- escaping, linking and
// table markup are exactly the kind of string handling that breaks quietly --
// and lib/email.ts reaches the database through audit(), so a test that
// wanted this would otherwise have to stand a database up to check that an
// ampersand survives.
//
// ONE SOURCE, TWO RENDERINGS. A hand-written HTML template beside a
// hand-written text template is two copies of every sentence, and the one
// nobody reads is the one that goes stale -- a reset email whose HTML still
// says "one hour" after the text was changed to fifteen minutes is a support
// ticket that looks like a security incident. A MailBody is described once
// and rendered twice, so the two cannot disagree about a figure, a deadline
// or a link.
//
// Both parts are sent. Text alone is fine, and some clients prefer it, but a
// message with only a text part is a mild spam signal and renders as
// monospace in clients that assume the worst.
//
// WHY TABLES. Styles are inline because that is the only thing mail clients
// reliably keep: <style> blocks are stripped by Gmail's web client among
// others. The layout is tables for the same reason -- Outlook renders through
// Word, which ignores max-width, so a <div> card becomes full-bleed on a
// desktop monitor. The tables are role="presentation" so a screen reader
// walks the prose, not the scaffolding. The one real table is the figures
// one, which keeps its <th scope="row"> because it genuinely is data.
//
// WHY NO IMAGES. Every client worth worrying about blocks remote images by
// default, so a logo served from withveyro.com is an empty box on first open
// -- which is the open that matters. The wordmark is text, which is also what
// it is on the site.
//
// LIGHT ONLY. color-scheme is declared light so clients stop short of
// auto-inverting the card, which is the failure this is guarding against: an
// inverted #ffffff card keeps the inline #1a1d1b text and becomes black on
// black. Declaring the scheme is not dark-mode styling; it is the thing that
// makes the light rendering hold.

/**
 * One figure. `k` is the label, `v` is already formatted for display.
 *
 * `prose` is for the rows that are a sentence rather than a number -- a
 * dispute's reason, say. Those get left-aligned regular text instead of
 * right-aligned bold, because a three-line sentence ragged off the right
 * margin in bold is the worst way to read anything.
 */
import { SUPPORT_EMAIL } from "./support.ts";

export type Fact = { k: string; v: string; prose?: boolean };

/** The one action a message asks for, if it asks for one. */
export type Cta = { label: string; href: string };

export type MailBody = {
  /** The prose. Blank lines separate paragraphs. */
  intro: string;
  /** Figures, as a table in HTML and "Label: value" lines in text. */
  facts?: Fact[];
  cta?: Cta;
  /** Prose after the action -- caveats, usually. */
  outro?: string;
  /**
   * Where the footer's "Dashboard" link goes. Guardian-addressed mail points
   * at the guardian dashboard; there is no bare /dashboard route to fall
   * back on, so this is explicit rather than guessed.
   */
  dashboard?: string;
};

/** Accepted anywhere a body is. A bare string is a message with only prose. */
export type MailInput = string | MailBody;

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://withveyro.com").replace(/\/$/, "");
// The one import this module allows itself. lib/support.ts has no imports of
// its own, so the reason this file stays directly testable -- nothing in its
// graph reaches a database -- still holds.
const SUPPORT = SUPPORT_EMAIL;
const TAGLINE = "Veyro — Payments for creators under 18";

/* ---------------- the palette ----------------
   The site's --pine, not a near miss. #0f5132 was close enough to look right
   on its own and wrong beside anything from the actual product. Measured on
   white: the green is 9.3:1 and the muted grey 6.4:1, so both clear AA at the
   12px the footer uses. */
const GREEN = "#12513a";
const INK = "#1a1d1b";
const MUTED = "#5a615d";
const LINE = "#e3e7e5";
const HAIRLINE = "#eceeed";
const PAPER = "#ffffff";
const GROUND = "#f4f6f5";

const body = (m: MailInput): MailBody => (typeof m === "string" ? { intro: m } : m);

const esc = (t: string) => t
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;");

// Linkify after escaping, so a URL containing & is both a valid href and
// valid markup. Trailing punctuation is left out of the link: a sentence
// ending "...at https://withveyro.com." should not link the full stop.
const linkify = (t: string) => t.replace(
  /(https?:\/\/[^\s<]+?)([.,)]?)(?=\s|$)/g,
  `<a href="$1" style="color:${GREEN};text-decoration:underline">$1</a>$2`,
);

const paras = (text: string) => text.trim().split(/\n\s*\n/).filter(Boolean).map((p) =>
  `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${INK}">`
  + linkify(esc(p)).replace(/\n/g, "<br>")
  + `</p>`).join("");

/**
 * The figures, as a table rather than a sentence.
 *
 * <th scope="row"> rather than two <td>s: a screen reader then reads "Veyro
 * fee, $3.30" instead of leaving the number unattached. Right-aligned values
 * so the decimal points line up, which is the only reason to use a table for
 * four numbers in the first place.
 */
function factsTable(facts: Fact[]): string {
  const rows = facts.map((f, i) => {
    const edge = i === facts.length - 1 ? "none" : `1px solid ${HAIRLINE}`;
    return `<tr>`
      + `<th scope="row" align="left" width="40%" style="padding:9px 12px 9px 0;`
        + `border-bottom:${edge};width:40%;font-size:14px;font-weight:400;line-height:1.4;`
        + `color:${MUTED};text-align:left">${esc(f.k)}</th>`
      + `<td align="${f.prose ? "left" : "right"}" style="padding:9px 0 9px 12px;`
        + `border-bottom:${edge};font-size:14px;line-height:1.4;color:${INK};`
        + `font-weight:${f.prose ? 400 : 700};text-align:${f.prose ? "left" : "right"};`
        // No white-space:nowrap. A money value never needs it, and a value
        // that is a sentence -- the reason on a dispute -- cannot wrap
        // without it, so the table pushes the card past the viewport and a
        // phone clips the right-hand edge of every paragraph in the message.
        // break-word is for the one genuinely unbreakable value, a Stripe id.
        + `word-break:break-word">${esc(f.v)}</td>`
      + `</tr>`;
  }).join("");

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" `
    + `style="width:100%;border-collapse:collapse;margin:0 0 20px">${rows}</table>`;
}

/**
 * The action, as a button.
 *
 * A table wrapping one cell, because a styled <a> with padding is dropped to
 * its text box by Word's engine and the background disappears with it.
 * Square, like every button on the site.
 */
function button(cta: Cta): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" `
    + `style="margin:0 0 20px"><tr><td style="background:${GREEN}">`
    + `<a href="${esc(cta.href)}" style="display:inline-block;padding:13px 22px;`
      + `font-size:15px;font-weight:700;line-height:1;color:${PAPER};text-decoration:none">`
      + `${esc(cta.label)}</a>`
    + `</td></tr></table>`;
}

/* ---------------- the footer ----------------
   The same four things in both halves. No unsubscribe: these are
   transactional -- a receipt, a deadline, a password change -- and there is
   nothing to unsubscribe from. Nothing here is marketing, which is the test
   that decides it rather than the convenience. */

const links = (dashboard: string) => [
  ["Dashboard", `${SITE}${dashboard}`],
  ["Terms", `${SITE}/terms`],
  ["Privacy", `${SITE}/privacy`],
] as const;

function footerHtml(dashboard: string): string {
  const nav = links(dashboard).map(([label, href]) =>
    `<a href="${href}" style="color:${MUTED};text-decoration:underline">${label}</a>`)
    .join(`<span style="color:${LINE}"> &middot; </span>`);

  return `<div style="border-top:1px solid ${LINE};margin:8px 0 0;padding:18px 0 0;`
      + `font-size:12px;line-height:1.6;color:${MUTED}">`
    + `<div style="font-size:13px;font-weight:700;letter-spacing:-0.01em;color:${GREEN};`
      + `margin:0 0 3px">Veyro</div>`
    + `<div>${TAGLINE}</div>`
    + `<div style="margin:9px 0 0">${nav}</div>`
    + `<div style="margin:9px 0 0">Reply to this email, or write to `
      + `<a href="mailto:${SUPPORT}" style="color:${MUTED};text-decoration:underline">`
      + `${SUPPORT}</a>. A person will answer.</div>`
    + `</div>`;
}

function footerText(dashboard: string): string {
  return ["—", TAGLINE, ...links(dashboard).map(([l, h]) => `${l}: ${h}`),
    `Reply to this email, or write to ${SUPPORT}. A person will answer.`].join("\n");
}

/* ---------------- the two renderings ---------------- */

/** The plain-text half. Also what a client that refuses HTML will show. */
export function renderText(input: MailInput): string {
  const m = body(input);
  const parts = [m.intro.trim()];
  if (m.facts?.length) parts.push(m.facts.map((f) => `${f.k}: ${f.v}`).join("\n"));
  if (m.cta) parts.push(`${m.cta.label}: ${m.cta.href}`);
  if (m.outro?.trim()) parts.push(m.outro.trim());
  parts.push(footerText(m.dashboard ?? "/dashboard/founder"));
  return parts.join("\n\n");
}

/** The HTML half. Same facts, same link, same footer. */
export function renderHtml(input: MailInput): string {
  const m = body(input);
  const inner = [
    paras(m.intro),
    m.facts?.length ? factsTable(m.facts) : "",
    m.cta ? button(m.cta) : "",
    m.outro?.trim() ? paras(m.outro) : "",
  ].join("");

  return [
    `<!doctype html><html lang="en"><head>`,
    `<meta charset="utf-8">`,
    `<meta name="viewport" content="width=device-width,initial-scale=1">`,
    `<meta name="color-scheme" content="light">`,
    `<meta name="supported-color-schemes" content="light">`,
    `</head>`,
    `<body style="margin:0;padding:0;background:${GROUND};color-scheme:light;`
      + `font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif">`,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" `
      + `style="width:100%;background:${GROUND}"><tr><td align="center" style="padding:24px 12px">`,
    `<table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" `
      + `style="width:100%;max-width:560px;table-layout:fixed;background:${PAPER};`
      + `border:1px solid ${LINE};`
      + `border-radius:10px"><tr><td style="padding:28px 24px 8px">`,
    `<div style="font-size:15px;font-weight:700;letter-spacing:-0.01em;color:${GREEN};`
      + `margin:0 0 20px">Veyro</div>`,
    inner,
    footerHtml(m.dashboard ?? "/dashboard/founder"),
    `</td></tr></table>`,
    `</td></tr></table></body></html>`,
  ].join("");
}

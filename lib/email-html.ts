// Turning a plain-text email into the HTML half of the same message.
//
// Its own module, with no imports, for two reasons. It is the only part of
// sending mail that is pure enough to test directly -- escaping and linking
// are exactly the kind of string handling that breaks quietly -- and
// lib/email.ts reaches the database through audit(), so a test that wanted
// this would otherwise have to stand a database up to check that an
// ampersand survives.

/**
 * The HTML half of every message, built from the plain text half.
 *
 * Deliberately derived rather than authored. A hand-written HTML template
 * beside a hand-written text template is two copies of every sentence, and
 * the one nobody reads is the one that goes stale -- a reset email whose HTML
 * still says "one hour" after the text was changed to fifteen minutes is a
 * support ticket that looks like a security incident. One body, two
 * renderings, no way for them to disagree.
 *
 * Both parts are sent. Text alone is fine, and some clients prefer it, but a
 * message with only a text part is a mild spam signal and renders as
 * monospace in clients that assume the worst.
 *
 * Styles are inline because that is the only thing mail clients reliably
 * keep: <style> blocks are stripped by Gmail's web client among others.
 */
export function textToHtml(text: string): string {
  const esc = (t: string) => t
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  // Linkify after escaping, so a URL containing & is both a valid href and
  // valid markup. Trailing punctuation is left out of the link: a sentence
  // ending "...at https://withveyro.com." should not link the full stop.
  const linkify = (t: string) => t.replace(
    /(https?:\/\/[^\s<]+?)([.,)]?)(?=\s|$)/g,
    `<a href="$1" style="color:#0f5132;text-decoration:underline">$1</a>$2`,
  );

  const body = text.trim().split(/\n\s*\n/).map((para) => {
    const inner = linkify(esc(para)).replace(/\n/g, "<br>");
    return `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#1a1d1b">${inner}</p>`;
  }).join("");

  return [
    `<!doctype html><html><body style="margin:0;padding:24px 12px;`
      + `background:#f4f6f5;font-family:-apple-system,BlinkMacSystemFont,`
      + `'Segoe UI',Helvetica,Arial,sans-serif">`,
    `<div style="max-width:560px;margin:0 auto;background:#ffffff;`
      + `border:1px solid #e3e7e5;border-radius:10px;padding:28px 28px 20px">`,
    `<div style="font-size:15px;font-weight:600;letter-spacing:-0.01em;`
      + `color:#0f5132;margin:0 0 20px">Veyro</div>`,
    body,
    `</div></body></html>`,
  ].join("");
}

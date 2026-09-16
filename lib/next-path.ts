// Where to send someone after they sign in or sign up.
//
// A ?next= parameter is attacker-controlled: whoever writes the link decides
// where the victim lands once they have just typed a password. Left unchecked
// it is an open redirect, which is what turns a phishing link into a convincing
// one — the user really was on withveyro.com, really did sign in, and is then
// handed to a page that is not.
//
// So this accepts only a path on this same site. Not "a URL that looks like
// ours", not "a URL whose host we recognise" — a path, with no host at all.
//
// Pure, with no imports, so the browser and the server both use this exact
// function rather than two implementations that could disagree.

/** How long a return path is allowed to be. Long enough for a nested invite. */
const MAX = 512;

/**
 * Returns a safe same-site path, or null.
 *
 * Rejected, with the reason each one matters:
 *
 *   "//evil.com"       protocol-relative — the browser reads this as a host
 *   "/\\evil.com"      WHATWG treats a backslash as a slash in http(s) URLs,
 *                      so this is the same attack wearing a hat
 *   "https://evil.com" absolute
 *   "javascript:…"     not a path, and not a navigation we want to perform
 *   "/foo\tbar"       browsers strip tab, newline and return from URLs before
 *                      parsing, so a string that looks inert here can become
 *                      "//evil.com" by the time it is followed
 *
 * The prefix checks are cheap and readable; the URL parse at the end is the
 * actual authority, because it normalises the same way a browser will.
 */
export function safeNextPath(raw: unknown): string | null {
  if (typeof raw !== "string") return null;

  const value = raw.trim();
  if (!value || value.length > MAX) return null;

  // Control characters, including the ones browsers silently strip.
  if (/[\u0000-\u001f\u007f]/.test(value)) return null;

  if (!value.startsWith("/")) return null;
  if (value.startsWith("//")) return null;
  if (value.startsWith("/\\")) return null;
  if (value.includes("://")) return null;

  // Resolve against a base that cannot exist. If the result leaves that origin,
  // the path was not a path.
  const base = "https://next-path.invalid";
  try {
    const url = new URL(value, base);
    if (url.origin !== base) return null;
    return url.pathname + url.search + url.hash;
  } catch {
    return null;
  }
}

/**
 * Build a link to an auth page that returns here afterwards.
 *
 * encodeURIComponent matters more than it looks: an invite return path is
 * itself "/founder/<id>/consent?token=<token>". Interpolated raw, that second
 * "?" starts a new parameter of the *auth* URL, so `next` silently loses the
 * token and the guardian is bounced to "Invalid link" after signing up.
 */
export function authUrlWithNext(page: "/auth/signin" | "/auth/signup", next: string): string {
  const safe = safeNextPath(next);
  return safe ? `${page}?next=${encodeURIComponent(safe)}` : page;
}

/** Where a role belongs when there is no return path. */
export function defaultLandingFor(role: string | undefined): string {
  if (role === "FOUNDER") return "/dashboard/founder";
  if (role === "GUARDIAN") return "/dashboard/guardian";
  return "/";
}

// Every page that waits should say so; no page that does not should pretend.
//
// Next renders loading.tsx while a server component awaits. That makes it
// valuable on exactly one kind of route -- one that goes to the database
// before it can draw anything -- and noise everywhere else: a skeleton on a
// page that renders instantly either never appears or flashes, which is worse
// than the blank frame it was meant to replace.
//
// This matters more here than on most projects because the database suspends.
// scripts/migrate.mjs has a "wait for the compute to wake" step for exactly
// that reason, so a cold read is a real wait rather than a theoretical one.
//
// The rule, both ways, so the file fails if somebody adds a page that waits
// and forgets the skeleton AND if somebody sprinkles skeletons onto static
// pages.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

function pages(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) pages(p, out);
    else if (name === "page.tsx") out.push(dir);
  }
  return out;
}

/**
 * Does this page's server component go to the database before it can render?
 *
 * currentUser() alone does not count. It reads the session cookie and returns
 * null before querying when there is none, so an anonymous visitor -- which is
 * nearly all landing-page traffic -- never waits. The homepage is the case
 * this rule exists for: it calls currentUser() and must NOT get a skeleton,
 * because replacing the first impression with grey bars would cost more than
 * the lookup it is hiding.
 */
function waitsOnDb(src: string): boolean {
  const stripped = src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "")
    .replace(/^\s*import .*$/gm, "")
    // String literals go too. Three static pages link to stripe.com, and
    // "support.stripe.com" matches a naive search for the Stripe client
    // perfectly well -- which would have put a skeleton on three pages that
    // never query anything.
    .replace(/"(?:[^"\\\n]|\\.)*"/g, '""')
    .replace(/'(?:[^'\\\n]|\\.)*'/g, "''")
    .replace(/`(?:[^`\\]|\\.)*`/g, "``");
  // Any use of the client, not just `await db.`: the dashboards fetch inside
  // Promise.all([...]), so the await sits on the wrapper and the query does
  // not follow it textually. Matching the client itself catches both.
  return /\b(db|stripe)\.[a-zA-Z$]/.test(stripped);
}

const ROUTES = pages("app").filter((d) => !d.startsWith("app/api"));

test("every page that queries before rendering has a skeleton", () => {
  const missing = ROUTES.filter(
    (d) => waitsOnDb(readFileSync(join(d, "page.tsx"), "utf8"))
      && !existsSync(join(d, "loading.tsx")),
  );
  assert.deepEqual(missing, [],
    `these pages go to the database and would show a blank frame: ${missing.join(", ")}`);
});

test("no page that renders instantly carries one", () => {
  const extra = ROUTES.filter(
    (d) => !waitsOnDb(readFileSync(join(d, "page.tsx"), "utf8"))
      && existsSync(join(d, "loading.tsx")),
  );
  assert.deepEqual(extra, [],
    `these pages do not wait, so a skeleton flashes or never shows: ${extra.join(", ")}`);
});

test("the homepage is deliberately excluded, and the reason still holds", () => {
  // If currentUser() ever starts querying before the cookie check, the
  // homepage becomes a page that waits and this exclusion stops being safe.
  const auth = readFileSync("lib/auth.ts", "utf8");
  const fn = auth.slice(auth.indexOf("export async function currentUser"));
  const body = fn.slice(0, fn.indexOf("\n}"));
  const cookieAt = body.indexOf("SESSION_COOKIE");
  const guardAt = body.indexOf("if (!raw) return null");
  const queryAt = body.indexOf("db.session");
  assert.ok(cookieAt >= 0 && guardAt > cookieAt && queryAt > guardAt,
    "currentUser must short-circuit on a missing cookie before touching the database");
  assert.ok(!existsSync("app/loading.tsx"),
    "the homepage should not have a skeleton while anonymous visitors never query");
});

test("every skeleton names what is loading, for people who cannot see it", () => {
  const sk = readFileSync("app/_ui/Skeleton.tsx", "utf8");
  const exported = [...sk.matchAll(/export function (\w+)/g)].map((m) => m[1]);
  assert.ok(exported.length >= 3);
  // One live region per variant, and the blocks themselves hidden: a row of
  // empty divs announced one by one is worse than silence.
  assert.equal((sk.match(/role="status" aria-live="polite"/g) ?? []).length, exported.length);
  assert.equal((sk.match(/aria-hidden="true"/g) ?? []).length, exported.length);
});

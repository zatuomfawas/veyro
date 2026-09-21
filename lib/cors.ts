// Cross-origin access for the endpoints the SDK calls.
//
// Everything else in this app is same-origin and stays that way. These three
// are different in kind: they exist to be called from a founder's own site, on
// a domain we will never know in advance, so there is no allowlist to write.
//
// `*` is the honest answer for them, and it is not the weakening it looks like.
// The checkout endpoints are already deliberately unauthenticated — a stranger
// with a payment link is exactly who they are for — so allowing another origin
// to call them grants no access that a plain fetch from a script did not
// already have. What bounds abuse is rate limiting, not the origin header.
//
// Two things follow from `*`, and both are deliberate:
//
//   No credentials. Access-Control-Allow-Credentials is never sent, and the
//   browser refuses to pair it with `*` anyway. These endpoints must therefore
//   never depend on a session cookie, which is the property that makes `*`
//   safe here rather than merely convenient.
//
//   No custom request headers beyond content-type, so nothing here can be used
//   to smuggle an authorization header from someone else's browser.
import { NextResponse } from "next/server";

export const CORS_HEADERS: Record<string, string> = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers": "content-type",
  "access-control-max-age": "86400",
  // Caches must not serve one origin's response to another. Harmless with `*`,
  // and correct if this ever narrows to a real allowlist.
  vary: "origin",
};

/** A JSON response the browser will hand to a cross-origin caller. */
export function corsJson(body: unknown, init?: { status?: number; headers?: HeadersInit }) {
  const headers = new Headers(init?.headers);
  for (const [k, v] of Object.entries(CORS_HEADERS)) headers.set(k, v);
  return NextResponse.json(body, { status: init?.status ?? 200, headers });
}

/**
 * The preflight answer.
 *
 * A POST carrying content-type: application/json is not a simple request, so
 * the browser asks first with OPTIONS. Without this the SDK's very first call
 * fails before it is ever sent, which is the failure mode that looks like
 * "the SDK is broken" and is actually a missing route handler.
 */
export function corsPreflight() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// A per-IP rate limit, and an honest account of how much it is worth.
//
// WHAT THIS DOES NOT DO. The counters live in the memory of one serverless
// instance. Vercel runs several, routes requests between them, and discards
// them when they go cold, so the same caller can be served by a fresh instance
// with an empty map. This will slow a naive script hammering one endpoint. It
// will not stop a distributed attempt, and it must not be described as though
// it will.
//
// Doing it properly needs shared state: Upstash, Vercel KV, or Redis. None is
// provisioned on this project. This is deliberately the weak version rather
// than nothing, and the limitation is written here rather than discovered
// later by someone trusting the function name.
//
// WHAT IT GUARDS. Four endpoints, all unauthenticated by design:
//
//   checkout-intent        a customer pays without an account, and every
//                          request calls Stripe. Abuse costs API quota and
//                          dashboard noise, not money moving.
//   resend-verification    sends mail to an arbitrary address
//   forgot-password        sends mail to an arbitrary address
//   reset-password         accepts a token, so it is the one worth grinding
//
// The three auth endpoints raise the stakes above what this module can carry
// alone. A caller spread across instances can still send more mail than the
// stated limit, which burns sending reputation and lands on someone who never
// asked for any of it.
//
// So the mail-sending endpoints do not rely on this. They also refuse to issue
// a second token while a recent one is still live, which is enforced in the
// database and therefore holds no matter which instance answers. This module
// is the cheap first pass; that check is the one that actually bounds how much
// mail one address can be sent.

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/** Drop expired buckets so a long-lived instance does not grow without bound. */
function sweep(now: number) {
  if (buckets.size < 5_000) return;
  for (const [key, b] of buckets) if (b.resetAt <= now) buckets.delete(key);
}

export type RateLimitResult = {
  ok: boolean;
  /** Requests left in this window. */
  remaining: number;
  /** Seconds until the window resets, for Retry-After. */
  retryAfter: number;
};

/**
 * Count one request against `key`.
 *
 * @param limit  requests allowed per window
 * @param windowMs  window length in milliseconds
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfter: 0 };
  }

  existing.count += 1;
  const retryAfter = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
  return {
    ok: existing.count <= limit,
    remaining: Math.max(0, limit - existing.count),
    retryAfter,
  };
}

/**
 * The caller's IP, as far as it can be known.
 *
 * x-forwarded-for is set by the proxy in front of us and is trivially spoofed
 * where there is no such proxy. On Vercel the leftmost entry is the real client
 * and anything a caller supplied is appended after it, so the first entry is
 * the one to use. Falling back to a constant means everyone shares one bucket,
 * which is a blunt global limit rather than no limit at all.
 */
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

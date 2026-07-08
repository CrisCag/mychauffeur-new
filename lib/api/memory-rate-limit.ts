/**
 * In-memory rate limiter — TEMPORARY, single-process only.
 *
 * Not suitable for multi-instance deployments, serverless cold starts, or horizontal
 * scaling. Replace with Redis/Upstash (or edge middleware) before high-traffic production.
 *
 * Buckets are keyed by caller-supplied strings (typically route + client IP).
 */

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export type RateLimitOptions = {
  windowMs: number;
  maxRequests: number;
};

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSec: number };

export function checkMemoryRateLimit(
  bucketKey: string,
  options: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(bucketKey);

  if (!existing || now >= existing.resetAt) {
    buckets.set(bucketKey, { count: 1, resetAt: now + options.windowMs });
    return { allowed: true };
  }

  if (existing.count >= options.maxRequests) {
    const retryAfterSec = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
    return { allowed: false, retryAfterSec };
  }

  existing.count += 1;
  return { allowed: true };
}

/** Prune expired buckets occasionally to limit memory growth. */
export function pruneExpiredRateLimitBuckets(): void {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (now >= bucket.resetAt) {
      buckets.delete(key);
    }
  }
}

export function getClientIpFromRequest(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) {
    return realIp;
  }
  return "unknown";
}

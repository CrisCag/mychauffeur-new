import { NextResponse } from "next/server";
import {
  checkMemoryRateLimit,
  getClientIpFromRequest,
  pruneExpiredRateLimitBuckets,
  type RateLimitOptions,
} from "@/lib/api/memory-rate-limit";
import { clientFacingMessage, isProductionEnvironment } from "@/lib/api/production-errors";

export const API_RATE_LIMITS = {
  booking: { windowMs: 15 * 60 * 1000, maxRequests: 8 },
  calculate: { windowMs: 15 * 60 * 1000, maxRequests: 40 },
  places: { windowMs: 15 * 60 * 1000, maxRequests: 80 },
  routePreview: { windowMs: 15 * 60 * 1000, maxRequests: 30 },
} as const satisfies Record<string, RateLimitOptions>;

type RateLimitBodyShape = { ok?: boolean; success?: boolean; error?: string };

/**
 * Returns a 429 response when limited, otherwise null (request may proceed).
 */
export function enforceApiRateLimit(
  request: Request,
  routeId: keyof typeof API_RATE_LIMITS,
  bodyShape: "ok" | "success" = "success"
): NextResponse<RateLimitBodyShape> | null {
  pruneExpiredRateLimitBuckets();

  const ip = getClientIpFromRequest(request);
  const options = API_RATE_LIMITS[routeId];
  const result = checkMemoryRateLimit(`${routeId}:${ip}`, options);

  if (result.allowed) {
    return null;
  }

  const error = clientFacingMessage(
    `Rate limit exceeded for ${routeId}. Retry after ${result.retryAfterSec}s.`,
    "Too many requests. Please try again later."
  );

  const body: RateLimitBodyShape =
    bodyShape === "ok" ? { ok: false, error } : { success: false, error };

  return NextResponse.json(body, {
    status: 429,
    headers: { "Retry-After": String(result.retryAfterSec) },
  });
}

export function rateLimitExceededMessage(): string {
  return isProductionEnvironment()
    ? "Too many requests. Please try again later."
    : "Rate limit exceeded.";
}

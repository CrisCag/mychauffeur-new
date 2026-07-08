import { NextResponse } from "next/server";

const PRODUCTION_DISABLED_MESSAGE = "Service unavailable";

/**
 * Trip-ops APIs are for local driver MVP only. Disabled in production until auth exists.
 */
export function assertTripOpsAvailableInCurrentEnvironment():
  | { ok: true }
  | { ok: false; response: NextResponse } {
  if (process.env.NODE_ENV === "production") {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: PRODUCTION_DISABLED_MESSAGE },
        { status: 503 }
      ),
    };
  }
  return { ok: true };
}

import {
  DEFAULT_DRIVER_ID,
  listOperationalTrips,
  syncBookingsToOperationalTrips,
} from "@/lib/platform/trip-ops-store";
import { assertTripOpsAvailableInCurrentEnvironment } from "@/lib/api/trip-ops-production-guard";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const guard = assertTripOpsAvailableInCurrentEnvironment();
  if (!guard.ok) {
    return guard.response;
  }

  const { searchParams } = new URL(request.url);
  const driverId = searchParams.get("driverId") ?? DEFAULT_DRIVER_ID;
  await syncBookingsToOperationalTrips();
  const trips = await listOperationalTrips(driverId);
  return NextResponse.json({ success: true, trips }, { status: 200 });
}

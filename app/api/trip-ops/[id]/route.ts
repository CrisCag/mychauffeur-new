import {
  addStopExtraMinutes,
  advanceStopIndex,
  endActiveWaitSession,
  getLatestLocationPing,
  getOperationalTrip,
  getWaitSession,
  recordLocationPing,
  startPickupWaitSession,
  startStopWaitSession,
  updateTripStatus,
} from "@/lib/platform/trip-ops-store";
import { assertTripOpsAvailableInCurrentEnvironment } from "@/lib/api/trip-ops-production-guard";
import { getDriverActions, type DriverAction } from "@/lib/platform/trip-status-machine";
import { buildWaitTimerSnapshot, calcPenaltyAmountEur } from "@/lib/platform/wait-timer";
import { NextResponse } from "next/server";

type PatchBody = { action?: DriverAction };

function tripOpsGuardOrNull():
  | { blocked: true; response: NextResponse }
  | { blocked: false } {
  const guard = assertTripOpsAvailableInCurrentEnvironment();
  if (!guard.ok) {
    return { blocked: true, response: guard.response };
  }
  return { blocked: false };
}

async function buildTripPayload(id: string) {
  const trip = await getOperationalTrip(id);
  if (!trip) return null;

  const waitSession = trip.activeWaitSessionId
    ? await getWaitSession(trip.activeWaitSessionId)
    : null;
  const lastPing = await getLatestLocationPing(id);

  let timer = null;
  if (waitSession && !waitSession.endedAt) {
    timer = buildWaitTimerSnapshot(new Date(waitSession.startedAt), new Date(), {
      comfortMode: waitSession.comfortMode,
      kind: waitSession.kind,
      bookedMinutes: waitSession.bookedMinutes,
      extraAppMinutes: waitSession.extraAppMinutes,
    });
    if (timer.phase === "penalty") {
      timer = {
        ...timer,
        penaltyAmountEur: calcPenaltyAmountEur(
          timer.penaltyMinutes,
          waitSession.penaltyRateEurPerMin
        ),
      };
    }
  }

  const actions = getDriverActions(
    trip.lifecycleStatus,
    trip.stops.length > 0,
    trip.currentStopIndex,
    trip.stops.length
  );

  return { trip, waitSession, timer, lastPing, actions };
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const guard = tripOpsGuardOrNull();
  if (guard.blocked) {
    return guard.response;
  }

  const { id } = await context.params;
  const payload = await buildTripPayload(id);
  if (!payload) {
    return NextResponse.json({ success: false, error: "Trip not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true, ...payload }, { status: 200 });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const guard = tripOpsGuardOrNull();
  if (guard.blocked) {
    return guard.response;
  }

  const { id } = await context.params;
  const tripBefore = await getOperationalTrip(id);
  if (!tripBefore) {
    return NextResponse.json({ success: false, error: "Trip not found" }, { status: 404 });
  }

  let body: PatchBody;
  try {
    body = (await request.json()) as PatchBody;
  } catch {
    return NextResponse.json({ success: false, error: "Invalid body" }, { status: 400 });
  }

  const actions = getDriverActions(
    tripBefore.lifecycleStatus,
    tripBefore.stops.length > 0,
    tripBefore.currentStopIndex,
    tripBefore.stops.length
  );
  const def = actions.find((a) => a.action === body.action);
  if (!def) {
    return NextResponse.json({ success: false, error: "Action not allowed" }, { status: 422 });
  }

  if (def.endsWait) {
    await endActiveWaitSession(id);
  }

  if (def.startsPickupWait) {
    await startPickupWaitSession(id);
  } else if (def.startsStopWait) {
    const stop = tripBefore.stops[tripBefore.currentStopIndex];
    if (!stop) {
      return NextResponse.json({ success: false, error: "No stop defined" }, { status: 422 });
    }
    await startStopWaitSession(id, stop.id);
  } else if (def.action === "depart_stop") {
    await advanceStopIndex(id, def.nextStatus);
  } else if (def.action === "passenger_on_board") {
    await updateTripStatus(
      id,
      tripBefore.stops.length > 0 ? "passenger_on_board" : "en_route_to_destination"
    );
  } else {
    await updateTripStatus(id, def.nextStatus);
  }

  const payload = await buildTripPayload(id);
  return NextResponse.json({ success: true, ...payload }, { status: 200 });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const guard = tripOpsGuardOrNull();
  if (guard.blocked) {
    return guard.response;
  }

  const { id } = await context.params;
  const trip = await getOperationalTrip(id);
  if (!trip) {
    return NextResponse.json({ success: false, error: "Trip not found" }, { status: 404 });
  }

  let body: { lat?: number; lng?: number; stopExtraMinutes?: number; stopId?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ success: false, error: "Invalid body" }, { status: 400 });
  }

  if (typeof body.lat === "number" && typeof body.lng === "number") {
    const ping = await recordLocationPing(id, body.lat, body.lng);
    return NextResponse.json({ success: true, ping }, { status: 200 });
  }

  if (body.stopExtraMinutes && body.stopId) {
    const stop = await addStopExtraMinutes(id, body.stopId, body.stopExtraMinutes);
    return NextResponse.json({ success: true, stop }, { status: 200 });
  }

  return NextResponse.json({ success: false, error: "Unknown operation" }, { status: 400 });
}

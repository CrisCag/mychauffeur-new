import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { calcRedStartsAt, calcWaitTimerLimits } from "@/lib/platform/wait-timer";
import type { StoredBookingRequest } from "@/lib/booking-requests";
import type {
  OperationalTripStop,
  TripLifecycleStatus,
  WaitSessionRecord,
} from "@/types/trip-ops";

export type StoredOperationalTrip = {
  id: string;
  bookingRequestId: string;
  comfortMode: "standard" | "no_rush_vip";
  lifecycleStatus: TripLifecycleStatus;
  pickupAddress: string;
  destinationAddress: string;
  scheduledPickupAt: string;
  passengerName?: string;
  passengerPhone?: string;
  passengerEmail?: string;
  quotedPriceEur?: number;
  vehicleType?: string;
  driverId: string;
  stops: OperationalTripStop[];
  activeWaitSessionId?: string | null;
  currentStopIndex: number;
  trackingStartedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type DriverLocationPing = {
  id: string;
  tripId: string;
  lat: number;
  lng: number;
  recordedAt: string;
};

type StoreFile = {
  trips: StoredOperationalTrip[];
  waitSessions: WaitSessionRecord[];
  locationPings: DriverLocationPing[];
};

const dataDir = path.join(process.cwd(), "data");
const storePath = path.join(dataDir, "operational-trips.json");

const DEFAULT_DRIVER_ID = "demo-driver";
const DEFAULT_PICKUP_INCLUDED_MIN = 15;
const DEFAULT_PICKUP_PENALTY_RATE = 1.2;
const DEFAULT_STOP_PENALTY_RATE = 1.5;

async function readStore(): Promise<StoreFile> {
  try {
    const raw = await readFile(storePath, "utf8");
    const parsed = JSON.parse(raw) as StoreFile;
    return {
      trips: parsed.trips ?? [],
      waitSessions: parsed.waitSessions ?? [],
      locationPings: parsed.locationPings ?? [],
    };
  } catch {
    return { trips: [], waitSessions: [], locationPings: [] };
  }
}

async function writeStore(store: StoreFile): Promise<void> {
  await mkdir(dataDir, { recursive: true });
  await writeFile(storePath, JSON.stringify(store, null, 2), "utf8");
}

export async function listOperationalTrips(driverId?: string): Promise<StoredOperationalTrip[]> {
  const store = await readStore();
  const trips = store.trips.filter((t) => t.lifecycleStatus !== "cancelled");
  if (driverId) {
    return trips.filter((t) => t.driverId === driverId).sort(byScheduledDesc);
  }
  return trips.sort(byScheduledDesc);
}

function byScheduledDesc(a: StoredOperationalTrip, b: StoredOperationalTrip): number {
  return new Date(b.scheduledPickupAt).getTime() - new Date(a.scheduledPickupAt).getTime();
}

export async function getOperationalTrip(id: string): Promise<StoredOperationalTrip | null> {
  const store = await readStore();
  return store.trips.find((t) => t.id === id) ?? null;
}

export async function createOperationalTripFromBooking(
  booking: StoredBookingRequest
): Promise<StoredOperationalTrip> {
  const store = await readStore();
  const existing = store.trips.find((t) => t.bookingRequestId === booking.id);
  if (existing) {
    return existing;
  }

  const scheduledPickupAt = `${booking.rideDate}T${booking.rideTime}:00.000Z`;
  const stops: OperationalTripStop[] = (booking.tripStops ?? []).map((s, index) => ({
    id: s.id,
    sequenceIndex: index,
    kind: s.kind,
    poiId: s.kind === "catalog" ? s.id : undefined,
    label: s.label,
    address: s.address,
    bookedDurationMinutes: s.durationMinutes,
    extraPurchasedMinutes: 0,
  }));

  const trip: StoredOperationalTrip = {
    id: randomUUID(),
    bookingRequestId: booking.id,
    comfortMode: booking.noRushVip ? "no_rush_vip" : "standard",
    lifecycleStatus: "assigned",
    pickupAddress: booking.pickupLocation,
    destinationAddress: booking.dropoffLocation,
    scheduledPickupAt,
    passengerName: booking.guestName,
    passengerPhone: booking.guestPhone,
    passengerEmail: booking.guestEmail,
    quotedPriceEur: booking.quotedPrice,
    vehicleType: booking.vehicleType,
    driverId: DEFAULT_DRIVER_ID,
    stops,
    activeWaitSessionId: null,
    currentStopIndex: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.trips.push(trip);
  await writeStore(store);
  return trip;
}

export async function updateTripStatus(
  tripId: string,
  nextStatus: TripLifecycleStatus
): Promise<StoredOperationalTrip | null> {
  const store = await readStore();
  const trip = store.trips.find((t) => t.id === tripId);
  if (!trip) return null;

  trip.lifecycleStatus = nextStatus;
  trip.updatedAt = new Date().toISOString();

  if (nextStatus === "en_route_to_pickup" && !trip.trackingStartedAt) {
    trip.trackingStartedAt = new Date().toISOString();
  }

  if (nextStatus === "completed" || nextStatus === "no_show") {
    trip.activeWaitSessionId = null;
    for (const ws of store.waitSessions) {
      if (ws.tripId === tripId && !ws.endedAt) {
        ws.endedAt = new Date().toISOString();
        ws.phase = "stopped";
      }
    }
  }

  await writeStore(store);
  return trip;
}

function buildWaitSessionRecord(
  trip: StoredOperationalTrip,
  kind: "pickup" | "stop",
  bookedMinutes: number,
  extraAppMinutes: number,
  penaltyRate: number,
  stopId?: string
): WaitSessionRecord {
  const startedAt = new Date();
  const comfortMode = trip.comfortMode;
  const limits = calcWaitTimerLimits({
    comfortMode,
    kind,
    bookedMinutes,
    extraAppMinutes,
  });
  const redStartsAt = calcRedStartsAt(startedAt, {
    comfortMode,
    kind,
    bookedMinutes,
    extraAppMinutes,
  });

  return {
    id: randomUUID(),
    tripId: trip.id,
    stopId,
    kind,
    comfortMode,
    startedAt: startedAt.toISOString(),
    bookedMinutes,
    extraAppMinutes,
    graceMinutes: limits.graceMinutes,
    redStartsAt: redStartsAt.toISOString(),
    phase: "included_countdown",
    penaltyMinutes: 0,
    penaltyAmountEur: 0,
    penaltyRateEurPerMin: penaltyRate,
  };
}

export async function startPickupWaitSession(
  tripId: string
): Promise<{ trip: StoredOperationalTrip; session: WaitSessionRecord } | null> {
  const store = await readStore();
  const trip = store.trips.find((t) => t.id === tripId);
  if (!trip) return null;

  const session = buildWaitSessionRecord(
    trip,
    "pickup",
    DEFAULT_PICKUP_INCLUDED_MIN,
    0,
    DEFAULT_PICKUP_PENALTY_RATE
  );

  store.waitSessions.push(session);
  trip.activeWaitSessionId = session.id;
  trip.lifecycleStatus = "waiting_at_pickup";
  trip.updatedAt = new Date().toISOString();
  await writeStore(store);
  return { trip, session };
}

export async function startStopWaitSession(
  tripId: string,
  stopId: string
): Promise<{ trip: StoredOperationalTrip; session: WaitSessionRecord } | null> {
  const store = await readStore();
  const trip = store.trips.find((t) => t.id === tripId);
  if (!trip) return null;

  const stop = trip.stops.find((s) => s.id === stopId);
  if (!stop) return null;

  const session = buildWaitSessionRecord(
    trip,
    "stop",
    stop.bookedDurationMinutes,
    stop.extraPurchasedMinutes,
    DEFAULT_STOP_PENALTY_RATE,
    stop.id
  );

  store.waitSessions.push(session);
  trip.activeWaitSessionId = session.id;
  trip.lifecycleStatus = "at_stop";
  trip.updatedAt = new Date().toISOString();
  await writeStore(store);
  return { trip, session };
}

export async function endActiveWaitSession(
  tripId: string
): Promise<WaitSessionRecord | null> {
  const store = await readStore();
  const trip = store.trips.find((t) => t.id === tripId);
  if (!trip?.activeWaitSessionId) return null;

  const session = store.waitSessions.find((w) => w.id === trip.activeWaitSessionId);
  if (!session) return null;

  session.endedAt = new Date().toISOString();
  session.phase = "stopped";
  trip.activeWaitSessionId = null;
  trip.updatedAt = new Date().toISOString();
  await writeStore(store);
  return session;
}

export async function addStopExtraMinutes(
  tripId: string,
  stopId: string,
  minutes: number
): Promise<OperationalTripStop | null> {
  const store = await readStore();
  const trip = store.trips.find((t) => t.id === tripId);
  if (!trip) return null;

  const stop = trip.stops.find((s) => s.id === stopId);
  if (!stop) return null;

  stop.extraPurchasedMinutes = Math.min(120, stop.extraPurchasedMinutes + minutes);

  const active = store.waitSessions.find(
    (w) => w.id === trip.activeWaitSessionId && w.stopId === stopId && !w.endedAt
  );
  if (active) {
    active.extraAppMinutes = stop.extraPurchasedMinutes;
    const limits = calcWaitTimerLimits({
      comfortMode: trip.comfortMode,
      kind: "stop",
      bookedMinutes: active.bookedMinutes,
      extraAppMinutes: active.extraAppMinutes,
    });
    active.graceMinutes = limits.graceMinutes;
    active.redStartsAt = calcRedStartsAt(new Date(active.startedAt), {
      comfortMode: trip.comfortMode,
      kind: "stop",
      bookedMinutes: active.bookedMinutes,
      extraAppMinutes: active.extraAppMinutes,
    }).toISOString();
  }

  trip.updatedAt = new Date().toISOString();
  await writeStore(store);
  return stop;
}

export async function getWaitSession(id: string): Promise<WaitSessionRecord | null> {
  const store = await readStore();
  return store.waitSessions.find((w) => w.id === id) ?? null;
}

export async function getActiveWaitSession(tripId: string): Promise<WaitSessionRecord | null> {
  const store = await readStore();
  const trip = store.trips.find((t) => t.id === tripId);
  if (!trip?.activeWaitSessionId) return null;
  return store.waitSessions.find((w) => w.id === trip.activeWaitSessionId) ?? null;
}

export async function recordLocationPing(
  tripId: string,
  lat: number,
  lng: number
): Promise<DriverLocationPing> {
  const store = await readStore();
  const ping: DriverLocationPing = {
    id: randomUUID(),
    tripId,
    lat,
    lng,
    recordedAt: new Date().toISOString(),
  };
  store.locationPings.push(ping);
  if (store.locationPings.length > 5000) {
    store.locationPings = store.locationPings.slice(-3000);
  }
  await writeStore(store);
  return ping;
}

export async function getLatestLocationPing(
  tripId: string
): Promise<DriverLocationPing | null> {
  const store = await readStore();
  const pings = store.locationPings.filter((p) => p.tripId === tripId);
  return pings.at(-1) ?? null;
}

export async function advanceStopIndex(
  tripId: string,
  nextStatus: TripLifecycleStatus
): Promise<StoredOperationalTrip | null> {
  const store = await readStore();
  const trip = store.trips.find((t) => t.id === tripId);
  if (!trip) return null;
  trip.currentStopIndex += 1;
  trip.lifecycleStatus = nextStatus;
  trip.updatedAt = new Date().toISOString();
  await writeStore(store);
  return trip;
}

export async function incrementStopIndexField(
  tripId: string,
  nextIndex: number
): Promise<void> {
  const store = await readStore();
  const trip = store.trips.find((t) => t.id === tripId);
  if (!trip) return;
  trip.currentStopIndex = nextIndex;
  trip.updatedAt = new Date().toISOString();
  await writeStore(store);
}

export async function syncBookingsToOperationalTrips(): Promise<number> {
  let bookings: StoredBookingRequest[] = [];
  try {
    const raw = await readFile(path.join(dataDir, "booking-requests.json"), "utf8");
    bookings = JSON.parse(raw) as StoredBookingRequest[];
  } catch {
    return 0;
  }
  let created = 0;
  for (const booking of bookings) {
    const store = await readStore();
    if (store.trips.some((t) => t.bookingRequestId === booking.id)) continue;
    await createOperationalTripFromBooking(booking);
    created += 1;
  }
  return created;
}

export { DEFAULT_DRIVER_ID };

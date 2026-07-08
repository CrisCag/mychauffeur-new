export type {
  ComfortMode,
  WaitSessionKind,
  WaitTimerPhase,
  WaitTimerInput,
  WaitTimerLimits,
  WaitTimerSnapshot,
} from "@/lib/platform/wait-timer";

export type TripLifecycleStatus =
  | "draft"
  | "confirmed"
  | "assigned"
  | "tracking_available"
  | "en_route_to_pickup"
  | "arrived_at_pickup"
  | "waiting_at_pickup"
  | "passenger_on_board"
  | "en_route_to_destination"
  | "at_stop"
  | "en_route_from_stop"
  | "arrived_at_destination"
  | "completed"
  | "no_show"
  | "cancelled";

export type StopTimePurchaseMinutes = 15 | 30 | 45 | 60;

export type OperationalTripStop = {
  id: string;
  sequenceIndex: number;
  kind: "catalog" | "custom";
  poiId?: string;
  label: string;
  address?: string;
  lat?: number;
  lng?: number;
  bookedDurationMinutes: number;
  extraPurchasedMinutes: number;
};

export type WaitSessionRecord = {
  id: string;
  tripId: string;
  stopId?: string;
  kind: "pickup" | "stop";
  comfortMode: "standard" | "no_rush_vip";
  startedAt: string;
  endedAt?: string;
  bookedMinutes: number;
  extraAppMinutes: number;
  graceMinutes: number;
  redStartsAt: string;
  phase: "included_countdown" | "grace_countdown" | "penalty" | "stopped";
  penaltyMinutes: number;
  penaltyAmountEur: number;
  penaltyRateEurPerMin: number;
};

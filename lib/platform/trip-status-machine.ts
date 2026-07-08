import type { TripLifecycleStatus } from "@/types/trip-ops";

export type DriverAction =
  | "start_tracking"
  | "arrived_pickup"
  | "passenger_on_board"
  | "start_next_stop"
  | "depart_stop"
  | "arrived_destination"
  | "complete"
  | "report_no_show";

export type DriverActionDef = {
  action: DriverAction;
  nextStatus: TripLifecycleStatus;
  labelIt: string;
  labelEn: string;
  startsPickupWait?: boolean;
  endsWait?: boolean;
  startsStopWait?: boolean;
};

const ACTIONS: Partial<Record<TripLifecycleStatus, DriverActionDef[]>> = {
  assigned: [
    {
      action: "start_tracking",
      nextStatus: "en_route_to_pickup",
      labelIt: "Avvia tracking · In viaggio verso pickup",
      labelEn: "Start tracking · En route to pickup",
    },
  ],
  en_route_to_pickup: [
    {
      action: "arrived_pickup",
      nextStatus: "waiting_at_pickup",
      labelIt: "Arrivato al pickup",
      labelEn: "Arrived at pickup",
      startsPickupWait: true,
    },
  ],
  arrived_at_pickup: [
    {
      action: "arrived_pickup",
      nextStatus: "waiting_at_pickup",
      labelIt: "Avvia contatore attesa",
      labelEn: "Start wait timer",
      startsPickupWait: true,
    },
  ],
  waiting_at_pickup: [
    {
      action: "passenger_on_board",
      nextStatus: "passenger_on_board",
      labelIt: "Cliente a bordo",
      labelEn: "Passenger on board",
      endsWait: true,
    },
    {
      action: "report_no_show",
      nextStatus: "no_show",
      labelIt: "No-show cliente",
      labelEn: "Passenger no-show",
      endsWait: true,
    },
  ],
  passenger_on_board: [
    {
      action: "start_next_stop",
      nextStatus: "at_stop",
      labelIt: "Inizio fermata",
      labelEn: "Start stop",
      startsStopWait: true,
    },
    {
      action: "arrived_destination",
      nextStatus: "arrived_at_destination",
      labelIt: "Arrivato a destinazione",
      labelEn: "Arrived at destination",
    },
  ],
  at_stop: [
    {
      action: "depart_stop",
      nextStatus: "en_route_from_stop",
      labelIt: "Ripartenza da fermata",
      labelEn: "Depart stop",
      endsWait: true,
    },
  ],
  en_route_from_stop: [
    {
      action: "start_next_stop",
      nextStatus: "at_stop",
      labelIt: "Prossima fermata",
      labelEn: "Next stop",
      startsStopWait: true,
    },
    {
      action: "arrived_destination",
      nextStatus: "arrived_at_destination",
      labelIt: "Arrivato a destinazione",
      labelEn: "Arrived at destination",
    },
  ],
  arrived_at_destination: [
    {
      action: "complete",
      nextStatus: "completed",
      labelIt: "Fine servizio",
      labelEn: "Complete service",
    },
  ],
};

export function getDriverActions(
  status: TripLifecycleStatus,
  hasStops: boolean,
  currentStopIndex: number,
  totalStops: number
): DriverActionDef[] {
  let actions = [...(ACTIONS[status] ?? [])];

  if (status === "passenger_on_board" || status === "en_route_from_stop") {
    if (!hasStops || currentStopIndex >= totalStops) {
      actions = actions.filter((a) => a.action !== "start_next_stop");
    }
    if ((status === "passenger_on_board" && hasStops && currentStopIndex < totalStops) ||
        status === "en_route_from_stop") {
      actions = actions.filter((a) => a.action !== "arrived_destination" || !hasStops || currentStopIndex >= totalStops);
    }
    if (status === "passenger_on_board" && hasStops && currentStopIndex < totalStops) {
      actions = actions.filter((a) => a.action !== "arrived_destination");
    }
  }

  const startStop = actions.find((a) => a.action === "start_next_stop");
  if (startStop && hasStops) {
    startStop.labelIt = `Inizio fermata ${currentStopIndex + 1} di ${totalStops}`;
    startStop.labelEn = `Start stop ${currentStopIndex + 1} of ${totalStops}`;
  }

  return actions;
}

export function getStatusLabel(status: TripLifecycleStatus, locale: string): string {
  const it: Record<TripLifecycleStatus, string> = {
    draft: "Bozza",
    confirmed: "Confermato",
    assigned: "Assegnato",
    tracking_available: "Tracking disponibile",
    en_route_to_pickup: "Verso pickup",
    arrived_at_pickup: "Al pickup",
    waiting_at_pickup: "Attesa pickup",
    passenger_on_board: "Cliente a bordo",
    en_route_to_destination: "Verso destinazione",
    at_stop: "In fermata",
    en_route_from_stop: "Dopo fermata",
    arrived_at_destination: "A destinazione",
    completed: "Completato",
    no_show: "No-show",
    cancelled: "Annullato",
  };
  const en: Record<TripLifecycleStatus, string> = {
    draft: "Draft",
    confirmed: "Confirmed",
    assigned: "Assigned",
    tracking_available: "Tracking available",
    en_route_to_pickup: "En route to pickup",
    arrived_at_pickup: "At pickup",
    waiting_at_pickup: "Waiting at pickup",
    passenger_on_board: "Passenger on board",
    en_route_to_destination: "En route to destination",
    at_stop: "At stop",
    en_route_from_stop: "After stop",
    arrived_at_destination: "At destination",
    completed: "Completed",
    no_show: "No-show",
    cancelled: "Cancelled",
  };
  return locale === "en" ? en[status] : it[status];
}

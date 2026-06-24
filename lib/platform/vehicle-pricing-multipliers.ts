import type { TripVehicleType } from "@/types/trip";

export const VEHICLE_MULTIPLIERS: Record<TripVehicleType, number> = {
  sedan: 1,
  van: 1.4,
  luxury: 2,
};

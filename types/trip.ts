export type TripVehicleType = "sedan" | "van" | "luxury";

export type QuoteBreakdown = {
  costoBase: number;
  costoKm: number;
  costoSoste: number;
  costoDeviazione: number;
  extraVeicolo: number;
  totalPrice: number;
};

export type VehicleQuote = {
  quoteId: string | null;
  totalPrice: number;
  breakdown: QuoteBreakdown;
  vehicleMultiplier: number;
  vehicleType: TripVehicleType;
};

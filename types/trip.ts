export type TripVehicleType = "sedan" | "van" | "luxury";

export type TripStopKind = "catalog" | "custom";

/** Fermata scelta dal cliente (catalogo o indirizzo libero). */
export type TripStopInput = {
  kind: TripStopKind;
  /** ID POI catalogo oppure UUID per fermata custom. */
  id: string;
  label: string;
  /** Indirizzo / hotel / sito — obbligatorio per custom. */
  address?: string;
  durationMinutes: number;
  lat?: number;
  lng?: number;
};

export type QuoteBreakdown = {
  costoBase: number;
  costoKm: number;
  costoSoste: number;
  costoAttesa: number;
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

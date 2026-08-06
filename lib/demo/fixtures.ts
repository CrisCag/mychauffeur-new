import type { LocationSnapshotInput } from "@/lib/modules/services";
import { DEMO_PRICING_VERSION } from "./constants";

/** Runtime catalog — prefer this over a type-only alias in Server Actions. */
export const DEMO_VEHICLE_CATEGORIES = ["SEDAN", "VAN"] as const;

export type DemoVehicleCategory = (typeof DEMO_VEHICLE_CATEGORIES)[number];

export function isDemoVehicleCategory(
  value: string
): value is DemoVehicleCategory {
  return (DEMO_VEHICLE_CATEGORIES as readonly string[]).includes(value);
}

/**
 * Demo-only capacity fixtures for UI selection and Application validation.
 * Not Domain rules and not production tariff constraints.
 */
export const DEMO_VEHICLE_CAPACITIES = Object.freeze({
  SEDAN: Object.freeze({ maxPassengers: 3, maxLuggage: 2 }),
  VAN: Object.freeze({ maxPassengers: 7, maxLuggage: 6 }),
}) satisfies Record<
  DemoVehicleCategory,
  { readonly maxPassengers: number; readonly maxLuggage: number }
>;

export type DemoVehiclePresentation = {
  readonly category: DemoVehicleCategory;
  readonly titleIt: string;
  readonly titleEn: string;
  readonly examplesIt: string;
  readonly examplesEn: string;
  readonly descriptionIt: string;
  readonly descriptionEn: string;
  readonly passengersLabelIt: string;
  readonly luggageLabelIt: string;
};

export const DEMO_VEHICLE_PRESENTATION: Record<
  DemoVehicleCategory,
  DemoVehiclePresentation
> = Object.freeze({
  SEDAN: Object.freeze({
    category: "SEDAN",
    titleIt: "Business Sedan",
    titleEn: "Business Sedan",
    examplesIt: "Mercedes Classe E, BMW Serie 5 o equivalente",
    examplesEn: "Mercedes E-Class, BMW 5 Series or equivalent",
    descriptionIt:
      "Ideale per coppie, viaggiatori business e piccoli nuclei.",
    descriptionEn: "Ideal for couples, business travellers and small parties.",
    passengersLabelIt: "fino a 3 passeggeri",
    luggageLabelIt: "fino a 2 bagagli grandi",
  }),
  VAN: Object.freeze({
    category: "VAN",
    titleIt: "Business Van",
    titleEn: "Business Van",
    examplesIt: "Mercedes Classe V o equivalente",
    examplesEn: "Mercedes V-Class or equivalent",
    descriptionIt: "Più spazio per famiglie, gruppi e bagagli.",
    descriptionEn: "More space for families, groups and luggage.",
    passengersLabelIt: "fino a 7 passeggeri",
    luggageLabelIt: "fino a 6 bagagli grandi",
  }),
});

export function isDemoVehicleCompatible(
  category: DemoVehicleCategory,
  passengerCount: number,
  luggageCount: number
): boolean {
  const cap = DEMO_VEHICLE_CAPACITIES[category];
  return (
    Number.isSafeInteger(passengerCount) &&
    Number.isSafeInteger(luggageCount) &&
    passengerCount >= 1 &&
    luggageCount >= 0 &&
    passengerCount <= cap.maxPassengers &&
    luggageCount <= cap.maxLuggage
  );
}

export function listCompatibleDemoVehicles(
  passengerCount: number,
  luggageCount: number
): readonly DemoVehicleCategory[] {
  return DEMO_VEHICLE_CATEGORIES.filter((category) =>
    isDemoVehicleCompatible(category, passengerCount, luggageCount)
  );
}

export const DEMO_VEHICLE_IMAGE_DISCLAIMER_IT =
  "Le immagini sono illustrative. Marca e modello dipendono dalla disponibilità; categoria e capacità prenotate restano il riferimento del servizio.";

export const DEMO_PRICE_DISCLAIMER_IT =
  "Prezzo dimostrativo. Non costituisce un’offerta commerciale.";

export type DemoLocationFixture = {
  readonly id: string;
  readonly displayLabel: string;
  readonly city: string;
  readonly countryCode: string;
  readonly timezone: string;
};

export const DEMO_ORIGIN: DemoLocationFixture = Object.freeze({
  id: "demo-origin-fco",
  displayLabel: "Fiumicino Aeroporto (DEMO)",
  city: "Fiumicino",
  countryCode: "IT",
  timezone: "Europe/Rome",
});

export const DEMO_DESTINATION: DemoLocationFixture = Object.freeze({
  id: "demo-dest-spoleto",
  displayLabel: "Spoleto Centro (DEMO)",
  city: "Spoleto",
  countryCode: "IT",
  timezone: "Europe/Rome",
});

/** Fixture estimate labels only — not live routing. */
export const DEMO_ROUTE_ESTIMATE = Object.freeze({
  estimatedDistanceMeters: 140_000,
  estimatedDurationMinutes: 120,
  labelIt: "Stima fixture (non da Maps live)",
  labelEn: "Fixture estimate (not live Maps)",
});

export type DemoPriceFixture = {
  readonly category: DemoVehicleCategory;
  readonly labelIt: string;
  readonly labelEn: string;
  readonly baseAmountMinor: number;
  readonly vatAmountMinor: number;
  readonly totalCustomerAmountMinor: number;
};

/** Distinct fictional demo prices (minor units EUR). Not real MyChauffeur tariffs. */
export const DEMO_PRICES: Record<DemoVehicleCategory, DemoPriceFixture> =
  Object.freeze({
    SEDAN: Object.freeze({
      category: "SEDAN",
      labelIt: "Business Sedan",
      labelEn: "Business Sedan",
      baseAmountMinor: 18_000,
      vatAmountMinor: 3_960,
      totalCustomerAmountMinor: 21_960,
    }),
    VAN: Object.freeze({
      category: "VAN",
      labelIt: "Business Van",
      labelEn: "Business Van",
      baseAmountMinor: 24_000,
      vatAmountMinor: 5_280,
      totalCustomerAmountMinor: 29_280,
    }),
  });

export const DEMO_SUGGESTED_GUEST = Object.freeze({
  displayName: "Mario Rossi Demo",
  email: "mario.rossi.demo@example.test",
  phone: "+39 333 0000000",
  noteIt:
    "Questa è una demo: utilizza esclusivamente i dati fittizi proposti.",
  noteEn: "This is a demo: use only the suggested fictional data.",
});

export const DEMO_POLICY = Object.freeze({
  cancellationPolicyCode: "demo.cancel.std",
  waitingPolicyCode: "demo.wait.15",
  noShowPolicyCode: "demo.noshow.std",
  modificationPolicyCode: "demo.mod.std",
  paymentTermsCode: "demo.prepaid.none",
  refundReadiness: "policy_ref" as const,
  nightSupplementApplicable: false,
  holidaySupplementApplicable: false,
});

export const DEMO_REASSURANCE_ITEMS = Object.freeze([
  Object.freeze({
    id: "door-to-door",
    labelIt: "Transfer door-to-door",
  }),
  Object.freeze({
    id: "private-vehicle",
    labelIt: "Veicolo riservato",
  }),
  Object.freeze({
    id: "price-before-confirm",
    labelIt: "Prezzo mostrato prima della conferma",
  }),
  Object.freeze({
    id: "assisted-flow",
    labelIt: "Flusso assistito MyChauffeur",
  }),
] as const);

export const DEMO_REASSURANCE_NOTE_IT =
  "Caratteristiche illustrate nella demo del prodotto.";

export function locationInputFromFixture(
  fixture: DemoLocationFixture
): LocationSnapshotInput {
  return {
    displayLabel: fixture.displayLabel,
    city: fixture.city,
    countryCode: fixture.countryCode,
    timezone: fixture.timezone,
  };
}

export function demoPriceProposalInput(category: DemoVehicleCategory) {
  const price = DEMO_PRICES[category];
  return {
    currency: "EUR",
    pricingVersion: DEMO_PRICING_VERSION,
    baseAmountMinor: price.baseAmountMinor,
    taxAmountMinor: 0,
    vatAmountMinor: price.vatAmountMinor,
    supplementsAmountMinor: 0,
    discountsAmountMinor: 0,
    totalCustomerAmountMinor: price.totalCustomerAmountMinor,
  };
}

import type { Locale } from "@/lib/i18n-config";
import { isLocale } from "@/lib/i18n-config";
import {
  DEMO_VEHICLE_PRESENTATION,
  type DemoVehicleCategory,
} from "./fixtures";

export type DemoUiLocale = "it" | "en";

export function resolveDemoLocale(locale: string): DemoUiLocale {
  if (isLocale(locale) && locale === "en") return "en";
  return "it";
}

export function demoNumberLocale(locale: string): string {
  return resolveDemoLocale(locale) === "en" ? "en-GB" : "it-IT";
}

/** Display pickup as date + HH:mm (no seconds). */
export function formatDemoPickup(
  iso: string,
  locale: string
): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const loc = demoNumberLocale(locale);
  const date = new Intl.DateTimeFormat(loc, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
  const time = new Intl.DateTimeFormat(loc, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
  return `${date}, ${time}`;
}

export function formatDemoEuro(minor: number, locale: string): string {
  return new Intl.NumberFormat(demoNumberLocale(locale), {
    style: "currency",
    currency: "EUR",
  }).format(minor / 100);
}

export function demoActionMessage(
  result: { messageIt: string; messageEn: string },
  locale: string
): string {
  return resolveDemoLocale(locale) === "en" ? result.messageEn : result.messageIt;
}

export function demoVehicleTitle(
  category: string,
  locale: string
): string {
  const key = category as DemoVehicleCategory;
  const presentation = DEMO_VEHICLE_PRESENTATION[key];
  if (!presentation) return category;
  return resolveDemoLocale(locale) === "en"
    ? presentation.titleEn
    : presentation.titleIt;
}

export function demoVehiclePresentation(
  category: DemoVehicleCategory,
  locale: string
) {
  const p = DEMO_VEHICLE_PRESENTATION[category];
  const en = resolveDemoLocale(locale) === "en";
  return {
    title: en ? p.titleEn : p.titleIt,
    examples: en ? p.examplesEn : p.examplesIt,
    description: en ? p.descriptionEn : p.descriptionIt,
    passengersLabel: en
      ? `up to ${category === "SEDAN" ? 3 : 7} passengers`
      : p.passengersLabelIt,
    luggageLabel: en
      ? `up to ${category === "SEDAN" ? 2 : 6} large bags`
      : p.luggageLabelIt,
  };
}

type DemoCopy = {
  readonly bannerLocal: string;
  readonly bannerFictional: string;
  readonly bannerPrices: string;
  readonly founderDemo: string;
  readonly navTransfer: string;
  readonly navOps: string;
  readonly privateTransferEyebrow: string;
  readonly heroTitle: string;
  readonly heroSubtitle: string;
  readonly heroMicro: string;
  readonly reassuranceNote: string;
  readonly flowSteps: readonly {
    readonly n: 1 | 2 | 3 | 4 | 5;
    readonly label: string;
  }[];
  readonly tripTitle: string;
  readonly tripSubtitle: string;
  readonly originLabel: string;
  readonly destinationLabel: string;
  readonly originHint: string;
  readonly destinationHint: string;
  readonly dateLabel: string;
  readonly timeLabel: string;
  readonly passengersLabel: string;
  readonly luggageLabel: string;
  readonly passengersHint: string;
  readonly luggageHint: string;
  readonly continueLabel: string;
  readonly backLabel: string;
  readonly vehicleTitle: string;
  readonly vehicleSubtitle: string;
  readonly vehicleLegend: string;
  readonly selectedBadge: string;
  readonly incompatibleWith: (pax: number, bags: number) => string;
  readonly imageDisclaimer: string;
  readonly silhouetteSedanDesc: string;
  readonly silhouetteVanDesc: string;
  readonly priceDisclaimer: string;
  readonly priceTotalLabel: string;
  readonly priceDemoLabel: string;
  readonly priceNotOffer: string;
  readonly incompatibleVehicles: string;
  readonly guestTitle: string;
  readonly guestNote: string;
  readonly guestNameLabel: string;
  readonly guestEmailLabel: string;
  readonly guestPhoneLabel: string;
  readonly summaryTitle: string;
  readonly blockItinerary: string;
  readonly blockDatetime: string;
  readonly blockVehicle: string;
  readonly blockPaxBags: string;
  readonly blockContact: string;
  readonly blockPrice: string;
  readonly blockConditions: string;
  readonly timezoneLabel: string;
  readonly conditionsBody: string;
  readonly confirmCta: string;
  readonly processing: string;
  readonly completed: string;
  readonly resultTitle: string;
  readonly quoteAccepted: string;
  readonly bookingConfirmed: string;
  readonly servicePlanned: string;
  readonly noPayment: string;
  readonly totalDemo: string;
  readonly openOps: string;
  readonly anotherTransfer: string;
  readonly resetSession: string;
  readonly opsEyebrow: string;
  readonly opsTitle: string;
  readonly opsDescription: string;
  readonly newTransfer: string;
  readonly kpiBookings: string;
  readonly kpiPlanned: string;
  readonly kpiReady: string;
  readonly kpiCancelled: string;
  readonly kpiRegion: string;
  readonly emptyTitle: string;
  readonly emptyBody: string;
  readonly emptyCta: string;
  readonly detailLink: string;
  readonly markReady: string;
  readonly cancel: string;
  readonly loadMore: string;
  readonly resetZoneTitle: string;
  readonly resetZoneBody: string;
  readonly passengersShort: string;
  readonly luggageShort: string;
  readonly pickupPrefix: string;
  readonly detailEyebrow: string;
  readonly backToOps: string;
  readonly loading: string;
  readonly notFound: string;
  readonly cardItinerary: string;
  readonly cardPickup: string;
  readonly cardVehicle: string;
  readonly cardContact: string;
  readonly cardPrice: string;
  readonly contactDetailOnly: string;
  readonly cancelPolicy: string;
  readonly markReadyFull: string;
  readonly cancelService: string;
  readonly timelineTitle: string;
  readonly timelineHint: string;
  readonly errDateRequired: string;
  readonly errTimeRequired: string;
  readonly errDateInvalid: string;
  readonly errTimeFuture: string;
  readonly errPassengers: string;
  readonly errLuggage: string;
  readonly errSelectVehicle: string;
  readonly errGuestName: string;
  readonly errGuestEmail: string;
  readonly errGuestPhone: string;
  readonly reassurance: readonly { readonly id: string; readonly label: string }[];
};

const COPY_IT: DemoCopy = {
  bannerLocal: "DEMO LOCALE",
  bannerFictional: "Dati fittizi",
  bannerPrices: "Prezzi dimostrativi e non vincolanti",
  founderDemo: "Founder Demo",
  navTransfer: "Nuovo transfer",
  navOps: "Pannello operativo",
  privateTransferEyebrow: "Transfer privato",
  heroTitle: "Il tuo transfer privato, dall’aeroporto alla destinazione.",
  heroSubtitle:
    "Viaggia senza cambi, con un servizio door-to-door pensato per persone e bagagli.",
  heroMicro: "Configura il viaggio e confronta le categorie disponibili.",
  reassuranceNote: "Caratteristiche illustrate nella demo del prodotto.",
  flowSteps: [
    { n: 1, label: "Viaggio" },
    { n: 2, label: "Veicolo" },
    { n: 3, label: "Passeggero" },
    { n: 4, label: "Riepilogo" },
    { n: 5, label: "Conferma" },
  ],
  tripTitle: "Dove possiamo accompagnarti?",
  tripSubtitle: "Origine e destinazione sono fixture della demo.",
  originLabel: "Luogo di partenza",
  destinationLabel: "Destinazione",
  originHint: "Aeroporto demo · non modificabile",
  destinationHint: "Città demo · non modificabile",
  dateLabel: "Data del pickup",
  timeLabel: "Ora del pickup",
  passengersLabel: "Passeggeri",
  luggageLabel: "Bagagli",
  passengersHint: "Incluse le persone a bordo",
  luggageHint: "Conta i bagagli grandi previsti",
  continueLabel: "Continua",
  backLabel: "Indietro",
  vehicleTitle: "Scegli il veicolo più adatto al tuo viaggio",
  vehicleSubtitle:
    "Il prezzo indicato si riferisce all’intero veicolo, non al singolo passeggero.",
  vehicleLegend: "Categoria veicolo demo",
  selectedBadge: "Selezionato",
  incompatibleWith: (pax, bags) =>
    `Non compatibile con ${pax} passeggeri e ${bags} bagagli (capacità demo).`,
  imageDisclaimer:
    "Le immagini sono illustrative. Marca e modello dipendono dalla disponibilità; categoria e capacità prenotate restano il riferimento del servizio.",
  silhouetteSedanDesc:
    "Illustrazione stilizzata di una berlina premium in profilo laterale.",
  silhouetteVanDesc:
    "Illustrazione stilizzata di un van premium in profilo laterale.",
  priceDisclaimer:
    "Prezzo dimostrativo. Non costituisce un’offerta commerciale.",
  priceTotalLabel: "Totale per il veicolo",
  priceDemoLabel: "Prezzo dimostrativo",
  priceNotOffer: "Non costituisce un’offerta commerciale",
  incompatibleVehicles:
    "Nessuna categoria demo è compatibile con passeggeri e bagagli indicati. Riduci i valori oppure torna allo step Viaggio.",
  guestTitle: "Chi viaggerà?",
  guestNote:
    "Questa è una demo: utilizza esclusivamente i dati fittizi proposti.",
  guestNameLabel: "Nome del passeggero",
  guestEmailLabel: "Email di contatto",
  guestPhoneLabel: "Telefono di contatto",
  summaryTitle: "Controlla i dettagli del transfer",
  blockItinerary: "Itinerario",
  blockDatetime: "Data e ora",
  blockVehicle: "Veicolo",
  blockPaxBags: "Passeggeri e bagagli",
  blockContact: "Contatto",
  blockPrice: "Prezzo demo",
  blockConditions: "Condizioni demo",
  timezoneLabel: "Fuso",
  conditionsBody:
    "Nessun pagamento · dati solo nel processo locale · nessuna disponibilità reale garantita · policy demo",
  confirmCta: "Conferma la prenotazione demo",
  processing: "Elaborazione…",
  completed: "Completato",
  resultTitle: "Prenotazione demo creata",
  quoteAccepted: "Quote accettata",
  bookingConfirmed: "Booking confermato",
  servicePlanned: "Service pianificato",
  noPayment: "Nessun pagamento effettuato.",
  totalDemo: "Totale demo",
  openOps: "Apri il pannello operativo",
  anotherTransfer: "Crea un altro transfer demo",
  resetSession: "Reset sessione demo",
  opsEyebrow: "Operazioni",
  opsTitle: "Founder Demo — Operazioni",
  opsDescription:
    "Panoramica dei Booking e Service creati in questa sessione demo locale. Nessuna assegnazione autista e nessun dato produttivo.",
  newTransfer: "Nuovo transfer demo",
  kpiBookings: "Booking creati",
  kpiPlanned: "Service pianificati",
  kpiReady: "Pronti per assegnazione",
  kpiCancelled: "Cancellati",
  kpiRegion: "Indicatori demo",
  emptyTitle: "Nessun Booking demo",
  emptyBody:
    "Crea un transfer dimostrativo per vedere qui itinerario, pickup e stato del Service.",
  emptyCta: "Crea la prima prenotazione",
  detailLink: "Dettaglio",
  markReady: "Segna pronto",
  cancel: "Cancella",
  loadMore: "Carica altri",
  resetZoneTitle: "Zona reset",
  resetZoneBody:
    "Il reset svuota la sessione demo in memoria. Non è un’azione operativa ordinaria.",
  passengersShort: "passeggeri",
  luggageShort: "bagagli",
  pickupPrefix: "Pickup",
  detailEyebrow: "Dettaglio",
  backToOps: "← Operazioni",
  loading: "Caricamento…",
  notFound: "Booking demo non trovato in questo scope.",
  cardItinerary: "Itinerario",
  cardPickup: "Pickup",
  cardVehicle: "Veicolo e capacità",
  cardContact: "Contatto demo",
  cardPrice: "Prezzo demo",
  contactDetailOnly:
    "Visibile solo nel dettaglio demo · non in elenco generale",
  cancelPolicy: "Policy cancellazione demo",
  markReadyFull: "Segna pronto per assegnazione",
  cancelService: "Cancella service",
  timelineTitle: "Timeline eventi",
  timelineHint:
    "Audit in-memory della sessione demo · nessuna PII negli eventi Domain",
  errDateRequired: "Seleziona la data del pickup.",
  errTimeRequired: "Seleziona l’ora del pickup.",
  errDateInvalid: "Data o ora non valide.",
  errTimeFuture: "Scegli un orario futuro.",
  errPassengers: "Indica tra 1 e 8 passeggeri.",
  errLuggage: "Indica tra 0 e 12 bagagli.",
  errSelectVehicle: "Seleziona una categoria veicolo compatibile.",
  errGuestName: "Il nome deve contenere “Demo”.",
  errGuestEmail: "Usa un’email che termini con .test",
  errGuestPhone: "Indica un telefono di contatto.",
  reassurance: [
    { id: "door-to-door", label: "Transfer door-to-door" },
    { id: "private-vehicle", label: "Veicolo riservato" },
    {
      id: "price-before-confirm",
      label: "Prezzo mostrato prima della conferma",
    },
    { id: "assisted-flow", label: "Flusso assistito MyChauffeur" },
  ],
};

const COPY_EN: DemoCopy = {
  bannerLocal: "LOCAL DEMO",
  bannerFictional: "Fictional data",
  bannerPrices: "Illustrative, non-binding prices",
  founderDemo: "Founder Demo",
  navTransfer: "New transfer",
  navOps: "Operations panel",
  privateTransferEyebrow: "Private transfer",
  heroTitle: "Your private transfer, from the airport to your destination.",
  heroSubtitle:
    "Travel without changes, with a door-to-door service designed for people and luggage.",
  heroMicro: "Configure the trip and compare available categories.",
  reassuranceNote: "Features illustrated in this product demo.",
  flowSteps: [
    { n: 1, label: "Trip" },
    { n: 2, label: "Vehicle" },
    { n: 3, label: "Passenger" },
    { n: 4, label: "Summary" },
    { n: 5, label: "Confirm" },
  ],
  tripTitle: "Where can we take you?",
  tripSubtitle: "Origin and destination are demo fixtures.",
  originLabel: "Pickup location",
  destinationLabel: "Destination",
  originHint: "Demo airport · not editable",
  destinationHint: "Demo city · not editable",
  dateLabel: "Pickup date",
  timeLabel: "Pickup time",
  passengersLabel: "Passengers",
  luggageLabel: "Luggage",
  passengersHint: "People travelling on board",
  luggageHint: "Count large bags expected",
  continueLabel: "Continue",
  backLabel: "Back",
  vehicleTitle: "Choose the vehicle that fits your trip",
  vehicleSubtitle:
    "The price shown is for the whole vehicle, not per passenger.",
  vehicleLegend: "Demo vehicle category",
  selectedBadge: "Selected",
  incompatibleWith: (pax, bags) =>
    `Not compatible with ${pax} passengers and ${bags} bags (demo capacity).`,
  imageDisclaimer:
    "Images are illustrative. Make and model depend on availability; booked category and capacity remain the service reference.",
  silhouetteSedanDesc:
    "Stylized illustration of a premium sedan in side profile.",
  silhouetteVanDesc:
    "Stylized illustration of a premium van in side profile.",
  priceDisclaimer:
    "Illustrative price. Does not constitute a commercial offer.",
  priceTotalLabel: "Vehicle total",
  priceDemoLabel: "Demo price",
  priceNotOffer: "Does not constitute a commercial offer",
  incompatibleVehicles:
    "No demo category matches the passengers and luggage indicated. Reduce the values or go back to the Trip step.",
  guestTitle: "Who will travel?",
  guestNote: "This is a demo: use only the suggested fictional data.",
  guestNameLabel: "Passenger name",
  guestEmailLabel: "Contact email",
  guestPhoneLabel: "Contact phone",
  summaryTitle: "Review transfer details",
  blockItinerary: "Itinerary",
  blockDatetime: "Date and time",
  blockVehicle: "Vehicle",
  blockPaxBags: "Passengers and luggage",
  blockContact: "Contact",
  blockPrice: "Demo price",
  blockConditions: "Demo conditions",
  timezoneLabel: "Timezone",
  conditionsBody:
    "No payment · process-local data only · no real availability guaranteed · demo policy",
  confirmCta: "Confirm demo booking",
  processing: "Processing…",
  completed: "Completed",
  resultTitle: "Demo booking created",
  quoteAccepted: "Quote accepted",
  bookingConfirmed: "Booking confirmed",
  servicePlanned: "Service planned",
  noPayment: "No payment was taken.",
  totalDemo: "Demo total",
  openOps: "Open operations panel",
  anotherTransfer: "Create another demo transfer",
  resetSession: "Reset demo session",
  opsEyebrow: "Operations",
  opsTitle: "Founder Demo — Operations",
  opsDescription:
    "Overview of Bookings and Services created in this local demo session. No driver assignment and no production data.",
  newTransfer: "New demo transfer",
  kpiBookings: "Bookings created",
  kpiPlanned: "Services planned",
  kpiReady: "Ready for assignment",
  kpiCancelled: "Cancelled",
  kpiRegion: "Demo indicators",
  emptyTitle: "No demo bookings",
  emptyBody:
    "Create a demo transfer to see itinerary, pickup and Service status here.",
  emptyCta: "Create the first booking",
  detailLink: "Detail",
  markReady: "Mark ready",
  cancel: "Cancel",
  loadMore: "Load more",
  resetZoneTitle: "Reset zone",
  resetZoneBody:
    "Reset clears the in-memory demo session. It is not an ordinary operational action.",
  passengersShort: "passengers",
  luggageShort: "bags",
  pickupPrefix: "Pickup",
  detailEyebrow: "Detail",
  backToOps: "← Operations",
  loading: "Loading…",
  notFound: "Demo booking not found in this scope.",
  cardItinerary: "Itinerary",
  cardPickup: "Pickup",
  cardVehicle: "Vehicle and capacity",
  cardContact: "Demo contact",
  cardPrice: "Demo price",
  contactDetailOnly: "Visible only in demo detail · not in the general list",
  cancelPolicy: "Demo cancellation policy",
  markReadyFull: "Mark ready for assignment",
  cancelService: "Cancel service",
  timelineTitle: "Event timeline",
  timelineHint:
    "In-memory demo audit · no PII in Domain events",
  errDateRequired: "Select a pickup date.",
  errTimeRequired: "Select a pickup time.",
  errDateInvalid: "Invalid date or time.",
  errTimeFuture: "Choose a future time.",
  errPassengers: "Enter between 1 and 8 passengers.",
  errLuggage: "Enter between 0 and 12 bags.",
  errSelectVehicle: "Select a compatible vehicle category.",
  errGuestName: "The name must contain “Demo”.",
  errGuestEmail: "Use an email ending with .test",
  errGuestPhone: "Enter a contact phone number.",
  reassurance: [
    { id: "door-to-door", label: "Door-to-door transfer" },
    { id: "private-vehicle", label: "Private vehicle" },
    {
      id: "price-before-confirm",
      label: "Price shown before confirmation",
    },
    { id: "assisted-flow", label: "MyChauffeur assisted flow" },
  ],
};

export function getDemoCopy(locale: string | Locale): DemoCopy {
  return resolveDemoLocale(String(locale)) === "en" ? COPY_EN : COPY_IT;
}

/** @deprecated Prefer getDemoCopy(locale) — kept for static tests / IT baseline. */
export const DEMO_ESSENTIAL_COPY = Object.freeze({
  heroTitle: COPY_IT.heroTitle,
  heroSubtitle: COPY_IT.heroSubtitle,
  heroMicro: COPY_IT.heroMicro,
  tripTitle: COPY_IT.tripTitle,
  vehicleTitle: COPY_IT.vehicleTitle,
  vehicleSubtitle: COPY_IT.vehicleSubtitle,
  guestTitle: COPY_IT.guestTitle,
  summaryTitle: COPY_IT.summaryTitle,
  confirmCta: COPY_IT.confirmCta,
  resultTitle: COPY_IT.resultTitle,
  priceTotalLabel: COPY_IT.priceTotalLabel,
  priceDemoLabel: COPY_IT.priceDemoLabel,
  priceNotOffer: COPY_IT.priceNotOffer,
  incompatibleVehicles: COPY_IT.incompatibleVehicles,
  opsTitle: COPY_IT.opsTitle,
  opsDescription: COPY_IT.opsDescription,
});

export const DEMO_FLOW_STEPS = COPY_IT.flowSteps;

const CANCELLATION_REASON: Record<
  DemoUiLocale,
  Record<string, string>
> = {
  it: {
    CUSTOMER_REQUEST: "Richiesta del cliente",
    BOOKING_CANCELLED: "Prenotazione annullata",
    OPERATIONAL: "Motivo operativo",
    DUPLICATE: "Duplicato",
    OTHER: "Altro",
  },
  en: {
    CUSTOMER_REQUEST: "Customer request",
    BOOKING_CANCELLED: "Booking cancelled",
    OPERATIONAL: "Operational reason",
    DUPLICATE: "Duplicate",
    OTHER: "Other",
  },
};

const AUDIT_TYPE: Record<DemoUiLocale, Record<string, string>> = {
  it: {
    "Quote.DraftCreated": "Preventivo in bozza",
    "Quote.Issued": "Preventivo emesso",
    "Quote.Accepted": "Preventivo accettato",
    "Quote.VersionSuperseded": "Versione preventivo sostituita",
    "Booking.Created": "Prenotazione creata",
    "Booking.PendingConfirmation": "Conferma in corso",
    "Booking.ConfirmationRequested": "Conferma richiesta",
    "Booking.Confirmed": "Prenotazione confermata",
    "Service.Created": "Servizio pianificato",
    "Service.ReadyForAssignment": "Pronto per assegnazione",
    "Service.Cancelled": "Servizio cancellato",
  },
  en: {
    "Quote.DraftCreated": "Quote drafted",
    "Quote.Issued": "Quote issued",
    "Quote.Accepted": "Quote accepted",
    "Quote.VersionSuperseded": "Quote version superseded",
    "Booking.Created": "Booking created",
    "Booking.PendingConfirmation": "Confirmation in progress",
    "Booking.ConfirmationRequested": "Confirmation requested",
    "Booking.Confirmed": "Booking confirmed",
    "Service.Created": "Service planned",
    "Service.ReadyForAssignment": "Ready for assignment",
    "Service.Cancelled": "Service cancelled",
  },
};

export function demoCancellationReasonLabel(
  reason: string,
  locale: string
): string {
  const lang = resolveDemoLocale(locale);
  return CANCELLATION_REASON[lang][reason] ?? reason;
}

export function demoAuditEventLabel(type: string, locale: string): string {
  const lang = resolveDemoLocale(locale);
  return AUDIT_TYPE[lang][type] ?? type.replaceAll(".", " · ");
}

export function demoServiceStatusLabel(
  status: string,
  locale: string
): string {
  const en = resolveDemoLocale(locale) === "en";
  switch (status) {
    case "PLANNED":
      return en ? "Planned" : "Pianificato";
    case "READY_FOR_ASSIGNMENT":
      return en ? "Ready for assignment" : "Pronto per assegnazione";
    case "CANCELLED":
      return en ? "Cancelled" : "Cancellato";
    default:
      return status;
  }
}

export function demoBookingStatusLabel(
  status: string,
  locale: string
): string {
  const en = resolveDemoLocale(locale) === "en";
  switch (status) {
    case "CONFIRMED":
      return en ? "Confirmed" : "Confermato";
    case "CANCELLED":
      return en ? "Cancelled" : "Cancellato";
    default:
      return status;
  }
}

/** Italian helpers kept for existing tests / call sites. */
export function demoCancellationReasonLabelIt(reason: string): string {
  return demoCancellationReasonLabel(reason, "it");
}
export function demoAuditEventLabelIt(type: string): string {
  return demoAuditEventLabel(type, "it");
}
export function demoServiceStatusLabelIt(status: string): string {
  return demoServiceStatusLabel(status, "it");
}
export function demoBookingStatusLabelIt(status: string): string {
  return demoBookingStatusLabel(status, "it");
}

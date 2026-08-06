/** Demo UI labels — presentation only, not Domain vocabulary. */

export const DEMO_FLOW_STEPS = [
  { n: 1, label: "Viaggio" },
  { n: 2, label: "Veicolo" },
  { n: 3, label: "Passeggero" },
  { n: 4, label: "Riepilogo" },
  { n: 5, label: "Conferma" },
] as const;

export const DEMO_ESSENTIAL_COPY = Object.freeze({
  heroTitle:
    "Il tuo transfer privato, dall’aeroporto alla destinazione.",
  heroSubtitle:
    "Viaggia senza cambi, con un servizio door-to-door pensato per persone e bagagli.",
  heroMicro: "Configura il viaggio e confronta le categorie disponibili.",
  tripTitle: "Dove possiamo accompagnarti?",
  vehicleTitle: "Scegli il veicolo più adatto al tuo viaggio",
  vehicleSubtitle:
    "Il prezzo indicato si riferisce all’intero veicolo, non al singolo passeggero.",
  guestTitle: "Chi viaggerà?",
  summaryTitle: "Controlla i dettagli del transfer",
  confirmCta: "Conferma la prenotazione demo",
  resultTitle: "Prenotazione demo creata",
  priceTotalLabel: "Totale per il veicolo",
  priceDemoLabel: "Prezzo dimostrativo",
  priceNotOffer: "Non costituisce un’offerta commerciale",
  incompatibleVehicles:
    "Nessuna categoria demo è compatibile con passeggeri e bagagli indicati. Riduci i valori oppure torna allo step Viaggio.",
  opsTitle: "Founder Demo — Operazioni",
  opsDescription:
    "Panoramica dei Booking e Service creati in questa sessione demo locale. Nessuna assegnazione autista e nessun dato produttivo.",
});

const CANCELLATION_REASON_IT: Record<string, string> = {
  CUSTOMER_REQUEST: "Richiesta del cliente",
  BOOKING_CANCELLED: "Prenotazione annullata",
  OPERATIONAL: "Motivo operativo",
  DUPLICATE: "Duplicato",
  OTHER: "Altro",
};

export function demoCancellationReasonLabelIt(reason: string): string {
  return CANCELLATION_REASON_IT[reason] ?? reason;
}

const AUDIT_TYPE_IT: Record<string, string> = {
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
};

export function demoAuditEventLabelIt(type: string): string {
  return AUDIT_TYPE_IT[type] ?? type.replaceAll(".", " · ");
}

export function demoServiceStatusLabelIt(status: string): string {
  switch (status) {
    case "PLANNED":
      return "Pianificato";
    case "READY_FOR_ASSIGNMENT":
      return "Pronto per assegnazione";
    case "CANCELLED":
      return "Cancellato";
    default:
      return status;
  }
}

export function demoBookingStatusLabelIt(status: string): string {
  switch (status) {
    case "CONFIRMED":
      return "Confermato";
    case "CANCELLED":
      return "Cancellato";
    default:
      return status;
  }
}

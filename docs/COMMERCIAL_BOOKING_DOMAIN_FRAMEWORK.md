# MyChauffeur OS — Commercial Booking Domain Framework

| Campo | Valore |
|-------|--------|
| **Codice documento** | MC-OS-032 |
| **Titolo** | Commercial Booking Domain Framework |
| **Versione** | 0.1.0 |
| **Stato** | Draft |
| **Data creazione** | 2026-08-02 |
| **Ultima modifica** | 2026-08-02 |
| **Owner** | Booking, Commerce & Customer Platform Engineering |
| **Autori** | MyChauffeur OS Team |
| **Documenti correlati** | MC-OS-000 · MC-OS-001 · MC-OS-009 · MC-OS-011 · MC-OS-012 · MC-OS-014 · MC-OS-015 · MC-OS-016 · MC-OS-017 · MC-OS-018 · MC-OS-019 · MC-OS-020 · MC-OS-021 · MC-OS-022 · MC-OS-025 (Baseline **B001**) · MC-OS-026 · MC-OS-027 · MC-OS-028 · MC-OS-029 · MC-OS-030 · MC-OS-031 · PLATFORM_MAP · HANDOFF |
| **Dipendenze** | Booking & Service Lifecycle (MC-OS-014); Pricing (MC-OS-017); Role/Permission Catalog (MC-OS-029); Dispatch (MC-OS-030); Support (MC-OS-031); Settlement/Finance (MC-OS-006); Notification (MC-OS-016); Customer Experience (MC-OS-018); Partner Exchange (MC-OS-012); Identity/Security/Data/Software (MC-OS-015/026/027/028); Entity Model (MC-OS-011); Glossary (MC-OS-009); Event Catalog (MC-OS-020); Baseline B001 (MC-OS-025) |
| **Classificazione** | Official Commercial Booking Domain Architecture Framework — Draft |
| **Documentation Release** | 0.1 (allineamento previsto) |
| **Baseline** | **B001** (MC-OS-025 Architecture Baseline Freeze v1) |
| **Source of Truth** | Commercial Booking Domain |

---

## Avvertenza

Questo documento è la **Source of Truth ufficiale** del **Commercial Booking Domain** di MyChauffeur OS.

**Dichiarazione obbligatoria:** MC-OS-032 approfondisce il Commercial Booking Domain e **non** sostituisce **MC-OS-014**, che resta la Source of Truth del lifecycle cross-domain Request → Quote → Booking → Service → Assignment → Trip.

**Non** è codice, **non** è schema SQL, **non** è specifica API definitiva, **non** sceglie provider Payment/Maps/Flight/AI, **non** definisce SLA numerici definitivi.

I nomi tecnici di Domain, Module, Aggregate, Entity, Value Object, Command, Query, Event, Policy, Snapshot e componenti software restano in **inglese**. Il testo normativo è in **italiano**.

Il runtime JSON legacy (`booking-requests`, `operational-trips`) **non** è modello architetturale di riferimento.

---

## Source of Truth

**MC-OS-032** governa:

- Booking Aggregate commerciale;
- Commercial Snapshot (Price / Policy / Contact / Billing);
- Customer / Booker / Passenger;
- Booking Source e Booking Type;
- revisioni, amendment e cancellazione commerciale;
- confini con Quote, Service, Payment, Support e Dispatch;
- preparazione implementativa dello **Step 5** Booking Foundation.

**Non** governa (SoT altrove): lifecycle cross-domain completo (MC-OS-014); Assignment/Dispatch/Recovery (MC-OS-030); SupportCase (MC-OS-031); Ledger/Settlement (MC-OS-006); Permission Catalog SoT (MC-OS-029); Pricing formulas (MC-OS-017).

---

## Indice sintetico

Sezioni §1–§151. Matrici in §152. Decisioni e readiness in §143–§151.

---

## 1. Scopo

Definire il modello ufficiale del **Booking commerciale**: cosa è, cosa non è, quali dati e stati gli appartengono, come si collega a Quote/Service/Payment/Support/Dispatch, e quale foundation tecnica (Step 5) è ammissibile senza implementare ancora il prodotto completo.

## 2. Relazione con Baseline B001

Allineato a **MC-OS-025 (B001)**: Modular Monolith CTD; Deny by Default; nessun microservices di default; nessun provider scelto; decisioni OPEN non chiuse. Il Commercial Booking Domain è un **Module** Application/Domain nel Modular Monolith (MC-OS-026). Path codice esistente da estendere: `lib/modules/bookings` (plurale).

## 3. Relazione normativa con MC-OS-014

| Aspetto | SoT |
|---------|-----|
| Lifecycle cross-domain Request→Quote→Booking→Service→Assignment→Trip | **MC-OS-014** |
| Booking Aggregate commerciale, Snapshot, Actor, Source, Type, Amendment, Cancellation commerciale, Step 5 prep | **MC-OS-032** |
| Assignment, Trip ops, Recovery | **MC-OS-014** + **MC-OS-030** (non MC-OS-032) |

**Regola di conflitto:**

- lifecycle cross-domain → **MC-OS-014**;
- struttura commerciale Booking → **MC-OS-032**.

Nessuna duplicazione di Assignment, Trip o Recovery in questo documento.

## 4. Ubiquitous Language

| Termine | Definizione ufficiale (sintesi) |
|---------|----------------------------------|
| **Request** | Domanda preliminare non ancora vincolante |
| **Quote** | Preventivo di prezzo versionabile prima/contestuale alla conferma |
| **Booking** | Accordo/richiesta commerciale per una o più prestazioni di trasporto |
| **Customer** | Soggetto commerciale che acquista o paga (persona o account) |
| **Booker** | Persona che effettua materialmente la prenotazione |
| **Passenger** | Persona che utilizza il servizio |
| **Service** | Prestazione operativa da eseguire (N per Booking) — MC-OS-014 |
| **Trip** | Istanza di esecuzione reale — MC-OS-014/030 |
| **Assignment** | Incarico INTERNAL XOR PARTNER — MC-OS-014/030 |
| **Payment** | Incasso/auth/capture/refund — Finance boundary |
| **Commercial Snapshot** | Insieme frozen di price/policy/contact/billing a conferma |
| **Booking Revision** | Versione storica post-amendment |
| **Amendment Request** | Richiesta di modifica material/non-material |
| **Booking Source** | Canale di origine commerciale |
| **Booking Type** | Classificazione commerciale del contratto |

### Definizione ufficiale — Booking

**Booking** rappresenta la richiesta o l’accordo commerciale tra un Customer, un account B2B o un Booker e MyChauffeur OS per una o più prestazioni di trasporto.

Spiegazione semplice: *è ciò che il cliente richiede, accetta o acquista.*

**Conferme:** Booking ≠ Quote; ≠ Service; ≠ Trip; ≠ Assignment; ≠ Payment; ≠ SupportCase; ≠ Ledger; ≠ GPS Tracking.

## 5. Booking Domain Principles

| ID | Principio |
|----|-----------|
| CBD-01 | Un Booking può generare uno o più Service |
| CBD-02 | Round trip: un Booking, tipicamente due Service |
| CBD-03 | Multi-service Booking → più Service |
| CBD-04 | Cambio Driver non modifica il Booking |
| CBD-05 | Cambio Assignment non modifica il Booking |
| CBD-06 | Recovery non riscrive il contratto commerciale |
| CBD-07 | Vehicle concreto non appartiene al Booking |
| CBD-08 | Booking conserva Commercial Snapshot |
| CBD-09 | Price e Policy Snapshot frozen alla conferma |
| CBD-10 | Listini futuri non modificano Booking confermati |
| CBD-11 | Customer, Booker e Passenger sono distinti |
| CBD-12 | Guest Booking e Account Booking convivono |
| CBD-13 | Passenger può non avere account |
| CBD-14 | B2C e B2B usano lo stesso Booking core |
| CBD-15 | Source Channel cambia regole/pricing/UX, non la semantica |
| CBD-16 | Deny by Default |
| CBD-17 | tenantId e organizationId obbligatori secondo contesto |
| CBD-18 | Nessun Role hardcoded |
| CBD-19 | Nessuna mutazione diretta cross-domain |
| CBD-20 | Audit completo |
| CBD-21 | Optimistic concurrency readiness |
| CBD-22 | Idempotency readiness |
| CBD-23 | Configurazione sopra hardcoding |
| CBD-24 | No JSON runtime come Source of Truth |
| CBD-25 | No findAll generico; Query tenant-safe e scope-aware |

## 6. Booking Aggregate Responsibility

Il **Booking Aggregate** è responsabile di: identità commerciale; Actor commerciali; source/type; stati commerciali; snapshot; revisioni/cancellazioni commerciali; riferimenti a Service generati; emissione eventi commerciali.  
**Non** è responsabile di: Assignment, Trip ops, GPS, Ledger, SupportCase content, Recovery state.

## 7. Dati che appartengono al Booking

Identificatori; Actor refs/snapshots; Source/Type/Status; schedule/location commerciali; requirements; vehicle **request**; Quote refs; Commercial Snapshot; serviceReferences; revision/version; audit metadata.

## 8. Dati che non appartengono al Booking

Esclusi esplicitamente: DriverId concreto; VehicleId concreto; Assignment state; GPS pings; Trip operational status; Ledger Entry; payout; SupportCase content; Recovery state; real-time flight state.

## 9. Aggregate Boundary

Un solo Aggregate root **Booking**. Quote può essere Aggregate/Entity collegato (Pricing Module). Service/Assignment/Trip sono Aggregate esterni. Payment e Support sono boundary esterni. Comunicazione via Command/Event, non mutazione diretta.

## 10. Customer / Booker / Passenger Model

| Ruolo | Significato |
|-------|-------------|
| Customer | Acquista/paga |
| Booker | Prenota |
| Passenger | Viaggia |

Casi: C=B=P; B≠P; azienda→dipendente; agenzia→turista; hotel→ospite; multi-Passenger; Passenger senza account.

## 11. Guest Booking

Booking senza `customerId`: `guestCustomerSnapshot` obbligatorio a conferma; linking successivo readiness (Identity).

## 12. Registered Customer Booking

`customerId` presente; snapshot comunque frozen a conferma (dati anagrafici possono cambiare in Identity senza riscrivere storia Booking).

## 13. Booking for Third Party

Booker ≠ Passenger ammessi; progressive disclosure; Permission `booking.create` + scope.

## 14. Corporate Booking

Account corporate; Booker/Corporate Admin; payment terms postpaid readiness; stesso core Booking.

## 15. Hotel Booking

Source `HOTEL_PORTAL`; ospite come Passenger; fatturazione hotel/guest secondo policy (**OPEN** dettagli).

## 16. Agency Booking

Source `AGENCY_PORTAL`; net/markup; Customer Price protetto verso executor (MC-OS-012/029).

## 17. Concierge Booking

Source tipica SUPPORT/OWNER/portal VIP; Concierge come Booker; requirements VIP/security.

## 18. Passenger Snapshot

Nome, contatti minimi, counts, note necessarie — frozen a conferma; PII minimized.

## 19. Customer Snapshot

Dati commerciali rilevanti frozen; non sostituisce Customer Profile Aggregate (futuro).

## 20. Booker Snapshot

Identità operativa di chi ha prenotato; ActorId + snapshot display.

## 21. Identity Linking Readiness

Guest → Registered link successivo senza distruggere snapshot storici.

## 22. Progressive Data Disclosure

Allineato MC-OS-029/012: pickup/phone/notes rilasciati per fase Service/Assignment.

## 23. Booking Source

Valori: `B2C_WEB`, `B2C_APP`, `B2B_PORTAL`, `HOTEL_PORTAL`, `AGENCY_PORTAL`, `CORPORATE_PORTAL`, `API`, `SUPPORT_CREATED`, `OWNER_CREATED`, `IMPORTED`, `PARTNER_REFERRAL`.

**Candidate Decision:** `sourceChannel` **immutabile** dopo create; `sourceReference` opzionale; variazioni (se mai consentite) auditate; source non modifica semantica Booking.

## 24. Booking Number

Public reference sicura, distinta da `BookingId` interno; non sequenziale prevedibile se pubblica; tenant-safe; collision-resistant readiness. Algoritmo esatto **OPEN**.

## 25. Booking Type

Candidati: `ONE_WAY`, `ROUND_TRIP`, `MULTI_SERVICE`, `HOURLY`, `DISPOSAL`, `AIRPORT_TRANSFER`, `TRAIN_STATION_TRANSFER`, `PORT_TRANSFER`, `INTERCITY`, `EVENT`, `WEDDING`, `TOUR`, `CORPORATE`, `VIP`, `ACCESSIBLE_SERVICE`.

Catalogo definitivo **OPEN**; configurazione sopra hardcoding; influenza `ServiceGenerationPolicy`; **non** assegna Driver/Vehicle.

## 26. Booking Aggregate Candidate Fields

| Field | Meaning | Classification | Mutability | Visibility | Snapshot rule | Notes |
|-------|---------|----------------|------------|------------|---------------|-------|
| BookingId | Id interno | REQUIRED | Immutable | INTERNAL/ops | — | Branded id |
| tenantId | Tenant | REQUIRED | Immutable | INTERNAL | — | Isolation |
| organizationId | Org | REQUIRED* | Immutable* | INTERNAL | — | *secondo contesto |
| bookingNumber | Ref pubblica | REQUIRED | Immutable | FULL own | — | Secure ref |
| bookedByActorId | Booker actor | REQUIRED | Immutable | LIMITED | Booker snap | |
| customerId | Customer account | OPTIONAL | Linkable | LIMITED | Customer snap | Guest OK |
| guestCustomerSnapshot | Guest data | OPTIONAL | Frozen@confirm | MASKED/own | Yes | |
| Booker | Booker model | REQUIRED | Frozen@confirm | LIMITED | Yes | |
| Passenger | Passenger model | REQUIRED | Frozen@confirm | PROGRESSIVE | Yes | Multi OK |
| BookingSource | Channel | REQUIRED | Immutable† | FULL ops | — | †Candidate |
| BookingType | Type | REQUIRED | Amend material | FULL | Policy | Config |
| BookingStatus | Commercial SM | REQUIRED | Transition | FULL own | — | |
| CommercialStatus | Alt/projection | OPEN | — | — | — | vs Status |
| requestedAt | Request time | REQUIRED | Immutable | FULL | — | |
| confirmedAt | Confirm time | OPTIONAL | Set once | FULL | — | |
| cancelledAt | Cancel time | OPTIONAL | Set once | FULL | — | |
| currency | Currency | REQUIRED | Frozen@confirm | FULL | Price snap | |
| priceSnapshot | Commercial price | REQUIRED@confirm | Immutable versions | FULL/LIMITED | Frozen | Tip excluded |
| policySnapshot | Policies | REQUIRED@confirm | Immutable versions | FULL/LIMITED | Frozen | |
| contactSnapshot | Contacts | REQUIRED@confirm | Immutable versions | MASKED | Frozen | |
| billingSnapshot | Billing | OPTIONAL@confirm | Immutable versions | FINANCIAL_OWN | Frozen | |
| notes | Notes | OPTIONAL | Amend | OPERATIONAL_ONLY | Snap if material | |
| specialRequirements | Requirements | OPTIONAL | Amend | PROGRESSIVE | Snap | |
| serviceReferences | Links to Service | DERIVED | Append | FULL own | — | Post gen |
| revision | Revision no. | REQUIRED | Monotonic | FULL | — | |
| version | Optimistic lock | REQUIRED | Monotonic | INTERNAL | — | |
| createdAt / updatedAt | Audit times | REQUIRED | System | INTERNAL | — | |
| DriverId / VehicleId / GPS / Ledger | — | SHOULD_NOT_BELONG | — | — | — | External |

## 27. Location Model

PickupLocation, DropoffLocation, Stop, AddressSnapshot (providerReference, PlaceId readiness, lat/lon, country, region, province, city, postalCode, timezone, accessInstructions, meetingPoint, airport/station/port terminal, ZTL/permit readiness).

**Regole:** AddressSnapshot frozen a conferma; provider reference ≠ unica SoT; nessun provider Maps scelto.

## 28. Schedule Model

requestedPickupAt; timezone; local + UTC; flexible window; return; requested arrival; estimated duration readiness; booking cutoff; lead time; night/holiday/same-day readiness.

**Invarianti:** no past date salvo import controllato; timezone obbligatoria; DST ambiguity rilevabile; cutoff configurabili; soglie numeriche **OPEN**.

## 29. Flight Reference

FlightNumber, airline, airport, terminal, scheduled arrival, pickup sign readiness — dichiarati e storicizzati.

## 30. Train Reference

TrainNumber, station, platform readiness — dichiarati e storicizzati.

## 31. Port / Cruise Reference

Ship/cruise/terminal refs — dichiarati e storicizzati.

## 32. Original Transport Data

Riferimenti dichiarati restano; live updates = overlay; originale non cancellato; live tracking → Dispatch/Integration (MC-OS-030).

## 33. Passenger Counts

adultCount, childCount, infantCount, passengerCount — commercial + operational inputs.

## 34. Luggage Model

Count, oversized — commercial/operational.

## 35. Accessibility Requirements

Wheelchair / special assistance — può essere sensitive; progressive disclosure.

## 36. Child Seats

Commercial requirement → operational fulfillment.

## 37. Pets

Policy-dependent; may affect vehicle/category.

## 38. Language Requirement

Soft/hard filter downstream (Dispatch) — stored on Booking as request.

## 39. Meet and Greet

Commercial/ops flag; may affect price supplements via Pricing.

## 40. Pickup Sign

Text/name for greeting — PII-aware.

## 41. VIP and Security Requirements

Commercial flags; security may be INTERNAL_ONLY / progressive.

## 42. Sensitive Requirements

Classificare ogni requirement come: commercial | operational | sensitive | progressive disclosure.

## 43. Vehicle Request

requestedVehicleCategory, features, passenger/luggage capacity, accessibility, premium level, exact vehicle request readiness.

Booking richiede categoria/caratteristiche; Vehicle concreto → Assignment/Execution; substitution compatibile può non amendare; upgrade/downgrade → consenso + nuovo snapshot.

## 44. Quote Boundary

Quote = preventivo Pricing; non è Booking. Booking può riferire QuoteVersion accettata.

## 45. Quote Versioning

QuoteVersion multiple ammesse; accettata frozen nel Commercial Snapshot.

## 46. Quote Expiration

Quote scaduta non accettabile; nuovo ciclo Request/Quote (MC-OS-014/017). Timing **OPEN**.

## 47. Estimate vs Binding Price

Estimate non vincolante; Binding Price a confirm via PriceSnapshot.

## 48. Instant Booking

Path canale: Quote→Confirm rapido se policy/payment OK.

## 49. Request to Book

Path con review/availability pending prima di Confirm.

## 50. Manual Review

Stato `PENDING_MANUAL_REVIEW`; Human Review; AI non decide.

## 51. Quote to Booking Conversion

Conversione produce/aggiorna Booking; cardinalità Quote→Booking, riutilizzo, max versioni, post-scadenza = **OPEN**.

## 52. Commercial Snapshot

Composto da Price + Policy + Contact + Billing snapshots a conferma.

## 53. Price Snapshot

base, taxes, VAT, supplements, discounts, B2B discount, cashback, agency commission, markup, coupon, promotion, currency, total customer price, pricing version. Tip **esclusa**.

## 54. Policy Snapshot

cancellation, waiting, no-show, modification, payment terms, refund readiness, night/holiday supplements.

## 55. Contact Snapshot

Contatti Customer/Booker/Passenger necessari — minimized.

## 56. Billing Snapshot

Billing party, address, tax ids readiness — FINANCIAL_OWN.

## 57. Snapshot Immutability

Frozen a conferma; revisioni creano nuova versione; no overwrite; listini futuri non cambiano Booking confermati.

## 58. Tip Separation

Tip ≠ Price Snapshot iniziale; evento finanziario successivo; non modifica Booking/Rating/Assignment Score (MC-OS-030).

## 59. Partner Cost and Margin Protection

Non visibili al Customer; non al Driver salvo compenso autorizzato; non nel Customer-facing snapshot; SoT Pricing/Finance.

## 60. Payment Boundary

Booking non è Payment Aggregate.

## 61. Payment Intent Reference

Reference opzionale a PaymentIntent.

## 62. Payment Status Projection

Projection/read model — non stato Trip.

## 63. Authorization / Capture

Finance boundary; provider **OPEN**.

## 64. Escrow / Funds Holding Readiness

Readiness; non implementato qui.

## 65. Refund Boundary

Eligibility ref su Booking; approval Finance/Support (MC-OS-031); calculation Pricing/Finance.

## 66. Chargeback Boundary

Finance/Support; audit.

## 67. Invoice Boundary

Billing/Finance; non Ledger nel Booking.

## 68. Postpaid B2B

Payment terms in Policy Snapshot; stesso Booking core.

Conferme: Booking ≠ Ledger; payment failure non corrompe incoerentemente; refund approval esterno; PaymentStatus projection; provider non scelto.

## 69. Booking Commercial Lifecycle

| Stato | Significato | In | Out | Invarianti | Eventi tipici | Side effect OK | Side effect NO |
|-------|-------------|----|-----|------------|---------------|----------------|----------------|
| DRAFT | Bozza | create | QUOTED, EXPIRED, CANCELLED | tenant/org | DraftCreated | save draft | Assignment |
| QUOTED | Quote attaccata | attach | PENDING_*, EXPIRED, CANCELLED | quote ref | QuoteAttached | — | Service gen |
| PENDING_CUSTOMER_CONFIRMATION | Attesa accept | | CONFIRMED, EXPIRED, CANCELLED | quote valid | ConfirmationRequested | notify | Capture auto senza policy |
| PENDING_PAYMENT | Pagamento richiesto | | CONFIRMED, CANCELLED, EXPIRED | payment ref | PaymentRequired | payment intent | Ledger invent |
| PENDING_MANUAL_REVIEW | Review umana | | CONFIRMED, CANCELLED | reason | ManualReviewRequested | queue | AI auto-confirm |
| CONFIRMED | Contratto attivo | | READY_*, PARTIALLY_CANCELLED, CANCELLED, COMPLETED | snapshots frozen | Confirmed | mark ready | Trip states |
| READY_FOR_SERVICE_GENERATION | Pronto generare Service | | CONFIRMED+refs | confirmed | Ready / GenerationRequested | request Service gen | Create Assignment |
| PARTIALLY_CANCELLED | Alcuni Service cancellati | | COMPLETED, CANCELLED | multi-service | PartiallyCancelled | cancel snap | Wipe history |
| CANCELLED | Chiuso commercialmente | | ARCHIVED | cancel snap | Cancelled | notify | Delete audit |
| COMPLETED | Service terminali OK | | ARCHIVED | all services terminal | Completed | — | financially_closed auto |
| EXPIRED | Scaduto pre-confirm | | ARCHIVED | | Expired | — | |
| ARCHIVED | Retention | — | — | | Archived | — | |

## 70. States Excluded from Booking

`DRIVER_ASSIGNED`, `ON_THE_WAY`, `AT_PICKUP`, `PASSENGER_ON_BOARD`, `IN_PROGRESS`, `AT_DESTINATION`, `DRIVER_LATE`, `RECOVERY_IN_PROGRESS`, e `PAYMENT_CAPTURED` come stato commerciale principale.

## 71. CommercialStatus vs BookingStatus

**OPEN:** unico status; due status; projection commerciale separata.

## 72. Booking Revision

Versione storica append-only post-amendment.

## 73. Amendment Request

Richiesta strutturata di modifica.

## 74. Change Set

Insieme field-level before/after.

## 75. Field-Level Audit

Actor, timestamp, reason, correlation.

## 76. Pre-Confirmation Amendment

Più libera; può invalidare Quote → re-quote.

## 77. Post-Confirmation Amendment

Material → nuovo snapshot/revision; approval policy.

## 78. Amendment after Assignment

Può richiedere Recovery/reassignment (MC-OS-030) senza riscrivere contratto se non material commerciale.

## 79. Amendment during Service

Ristretta; ops vs commercial separation.

## 80. Material Change Policy

Soglie materiality **OPEN**.

## 81. Price Impact

Può richiedere PriceRecalculation + nuovo PriceSnapshot.

## 82. Schedule Impact

Può richiedere Service regen / Dispatch notify.

## 83. Service Regeneration Readiness

Boundary verso Service Module — non mutazione diretta.

## 84. Customer Approval

Dove policy richiede.

## 85. Booking Revision History

No overwrite silenzioso; before/after; reason; actor; timestamp; correlation; audit; thresholds OPEN.

## 86. Cancellation Model

Commerciale; distinto da Trip cancel ops.

## 87. Full Cancellation

Tutti i Service previsti cancellati commercialmente.

## 88. Partial Cancellation

Sottoinsieme Service.

## 89. Service-Level Cancellation

CancelBookingService → può portare a PARTIALLY_CANCELLED.

## 90. Customer Cancellation

Policy Snapshot; eligibility ref.

## 91. Platform Cancellation

Audit rafforzato.

## 92. Partner Failure

Ops Recovery (MC-OS-030) + esito commerciale sul Booking.

## 93. Force Majeure

Reason + policy; Finance impact OPEN.

## 94. No-Show Boundary

Customer no-show ≠ auto cancel Booking intero; Driver no-show → Recovery; refund calc esterno; Booking registra esito; cancellation snapshot append-only.

## 95. Cancellation Reason

Codificato + free text interno.

## 96. Refund Eligibility Reference

Reference/outcome; non calcolo Ledger.

## 97. Cancellation Audit

Append-only.

## 98. Service Generation Boundary

BookingConfirmed/Ready → request generation; Service Aggregate esterno.

## 99. ServiceGenerationPolicy

Configurabile per BookingType; Configuration (MC-OS-021).

## 100. One-Way Generation

→ tipicamente 1 Service.

## 101. Round-Trip Generation

→ tipicamente 2 Service.

## 102. Multi-Service Generation

→ N Service.

## 103. Hourly / Disposal Generation

Struttura dedicata o multi-Service — **OPEN**.

## 104. Service Reference

`serviceReferences[]` sul Booking; ownership Service resta esterna.

## 105. Booking Completion

COMPLETED quando Service previsti hanno esito terminale compatibile; ≠ financially_closed (SFOF projection).

## 106. Domain Event Model

| Event | Producer | Consumers | Payload min | PII | Idempotency |
|-------|----------|-----------|-------------|-----|-------------|
| BookingDraftCreated | Booking | Analytics, Audit | ids, source, status | no | Yes |
| BookingQuoteAttached | Booking | Pricing, Audit | bookingId, quoteVersionId | no | Yes |
| BookingQuoteAccepted | Booking | Pricing, Payment | ids | no | Yes |
| BookingCreated | Booking | Notify, Analytics | ids, source | no | Yes |
| BookingConfirmationRequested | Booking | Notify, Customer | ids | no | Yes |
| BookingConfirmed | Booking | ServiceGen, Notify, Finance, Dispatch readiness | ids, confirmedAt | no | Yes |
| BookingPaymentRequired | Booking | Payment, Notify | ids, paymentRef | no | Yes |
| BookingManualReviewRequested | Booking | Support/Ops queue | ids, reasonCode | no | Yes |
| BookingAmendmentRequested | Booking | Notify, Ops | ids, changeSetId | no | Yes |
| BookingAmended | Booking | ServiceGen?, Notify, Pricing | ids, revision | no | Yes |
| BookingPriceRecalculationRequested | Booking | Pricing | ids | no | Yes |
| BookingCancelled | Booking | Notify, Finance, Dispatch, Support | ids, reasonCode | no | Yes |
| BookingPartiallyCancelled | Booking | Notify, Finance, Service | ids, serviceIds | no | Yes |
| BookingExpired | Booking | Analytics | ids | no | Yes |
| BookingReadyForServiceGeneration | Booking | ServiceGen | ids | no | Yes |
| BookingServiceGenerationRequested | Booking | Service Module | ids, type | no | Yes |
| BookingCompleted | Booking | Finance proj, Analytics, CX | ids | no | Yes |
| BookingArchived | Booking | Retention jobs | ids | no | Yes |

## 107. Event Naming Alignment

Allineare semanticamente a MC-OS-020 (`booking_*`, `quote_*`) senza modificare MC-OS-020 in questa sessione. Mapping formale = follow-up.

## 108. Command Model

CreateBookingDraft; AttachQuoteToBooking; ConfirmBooking; RequestBookingManualReview; AmendBooking; CancelBooking; CancelBookingService; ExpireBooking; MarkBookingReadyForServiceGeneration; CompleteBooking; ArchiveBooking.

## 109. Query Model

GetBooking; GetBookingSummary; GetBookingTimeline; ListBookingsByCustomer; ListBookingsByOrganization; ListBookingsNeedingReview; ListUpcomingBookings; GetBookingCommercialSnapshot; GetBookingServices; GetBookingPaymentProjection.

Regole: tenant-safe; scope-aware; paginated; **no** generic findAll.

## 110. Permission Integration

Esistenti (MC-OS-029): `booking.read|create|update|cancel`; `customer.read|manage`; `pricing.read`; `finance.read`; `payment.read`; `support.case.create`; `audit.read`.

Candidate/OPEN: `booking.amend`, `booking.confirm`, `booking.review`, `booking.archive`, `quote.read`, `quote.accept`. **Non implementate.**

## 111. Actor Permission Matrix

Vedi §152.2 / §152.23.

## 112. Data Visibility

FULL / LIMITED / MASKED / PROGRESSIVE / OPERATIONAL_ONLY / FINANCIAL_OWN / INTERNAL_ONLY su: Customer price; markup; cashback; commission; taxes; Passenger name/phone; pickup; destination; notes; special requirements; billing; Payment projection; Partner Cost; Margin.

## 113. Guest Booking Security

Minimizzazione; verification readiness; fraud review; rate limit.

## 114. Account Linking

Link guest→account senza overwrite snapshot.

## 115. Email / Phone Verification Readiness

OPEN provider; readiness.

## 116. PII Minimization

Need-to-know; progressive.

## 117. Snapshot Retention

Policy **OPEN**.

## 118. Data Subject Request Readiness

Export/erasure coordination con Identity/Data Arch.

## 119. Fraud Review Readiness

Manual review path; no auto Ledger.

## 120. Duplicate Booking Detection

Readiness; thresholds **OPEN**.

## 121. Idempotency Key

Su Command critici.

## 122. Rate Limiting Readiness

Create/confirm/public APIs.

## 123. Secure Booking Reference

bookingNumber non prevedibile.

## 124. Tenant Isolation

Obbligatoria.

## 125. Organization Isolation

Scope ORGANIZATION / OWN_RECORDS.

## 126. Audit by Design

Transizioni, amend, cancel, snapshot version.

## 127. Optimistic Concurrency

`version` su Aggregate.

## 128. Transaction Boundaries

Una transazione Application per Command; outbox eventi.

## 129. Cross-Domain Event Boundary

Solo eventi/port; no write esterni.

## 130. No Direct Mutation

Vietata mutazione diretta Service/Assignment/Trip/Payment/Ledger da Booking Module.

## 131. Current Repository Assessment

| Elemento | Class |
|----------|-------|
| `lib/modules/bookings` shell | ADAPTABLE |
| BookingId | REUSABLE |
| Repository port | ADAPTABLE |
| JSON booking-requests | LEGACY → REPLACE |
| operational-trips JSON + demo-driver | LEGACY → REPLACE |
| `/api/booking` | ADAPTABLE surface / LEGACY persist |
| quote calculation | ADAPTABLE |
| frontend booking flow | ADAPTABLE |
| Customer Module | MISSING |
| Booking state machine code | MISSING |
| Commercial Snapshot | MISSING |
| bookings migration | DEFERRED / MISSING |
| Domain events emitters | MISSING |
| Idempotency reale | MISSING |
| Optimistic concurrency reale | MISSING |

JSON runtime **non** è foundation architetturale.

## 132. Step 5 Technical Scope

BookingId; tenantId; organizationId; bookingNumber; bookedByActorId; customerId opzionale; guest snapshot minimo; BookingSource; BookingStatus subset; timestamps; version; Domain factory; invarianti; tenant-safe repository port; in-memory adapter non-production; migration scritta **non applicata**; RLS ENABLE + FORCE; nessuna policy permissiva; unit tests; repository contract tests; migration static tests; architecture fitness tests.

## 133. Step 5 Explicit Exclusions

Full Quote/Pricing Engine; Payment provider; Service generation reale; Dispatch; Assignment; Driver; Vehicle assignment; GPS; SupportCase implementation; Notification delivery; Refund; Invoice; Payout; AI; UI wiring.

## 134. Step 5 Candidate Status Subset

Minimo candidato senza chiudere lifecycle completo: `DRAFT`, `CONFIRMED`, `CANCELLED` (+ opzionale `EXPIRED`). Stati payment/review/ready restano documentati ma non obbligatori nello Step 5 shell.

## 135. Step 5 Aggregate Candidate

Estendere tipo `Booking` in `lib/modules/bookings` oltre `{id, tenantId, organizationId}` con campi minimi §132 — **non in questa sessione**.

## 136. Step 5 Repository Port

Estendere port esistente `findById`/`save` tenant-safe; list scope-aware paginated readiness.

## 137. Step 5 In-Memory Adapter

Non-production; contract tests.

## 138. Step 5 Migration Readiness

SQL draft + RLS ENABLE/FORCE; **non apply**; static tests forbid permissive policies.

## 139. Step 5 Test Strategy

Unit invarianti; repository contract; migration static; architecture fitness (no JSON SoT import in domain).

## 140. Step 5 Architecture Fitness

Guard: domain non dipende da `booking-requests` JSON / trip-ops store; no Role strings hardcoded.

## 141. Implementation Sequence

1. identifiers e status subset;  
2. Booking Aggregate minimo;  
3. repository port;  
4. in-memory adapter;  
5. migration non applicata;  
6. tests;  
7. Commercial Snapshot;  
8. Service generation boundary;  
9. application use cases;  
10. API futura;  
11. UI futura.

## 142. Architecture State Model

PROPOSED · CANDIDATE · APPROVED · IMPLEMENTED · DEPRECATED · SUPERSEDED · RETIRED.  
Commercial Booking Domain model = **CANDIDATE**. Step 5 scope = **CANDIDATE**.

## 143. Decisioni APPROVED

Principi CBD-01…25; separazione Booking≠…; MC-OS-014 lifecycle SoT; MC-OS-032 commercial SoT; Tip separation; Margin/Partner Cost protection; no Trip states in Booking; Deny by Default; B2C/B2B stesso core; Guest+Account; snapshot freeze; no JSON SoT.

## 144. Candidate Product Decisions

sourceChannel immutabile; bookingNumber non sequenziale pubblico; Step 5 status subset; ServiceGenerationPolicy per type; overlay transport updates.

## 145. Candidate Technical Decisions

Estendere `lib/modules/bookings`; in-memory first; migration unapplied; event names allineabili a MC-OS-020; optimistic `version`.

## 146. Decisioni OPEN

SLA/cutoff numerici; BookingType definitivo; CommercialStatus vs BookingStatus; Quote→Booking cardinalità; payment/Maps provider; split economico multi-Service; Dispatcher cancellation (OP-02); retention snapshot; duplicate threshold; hourly/disposal split; financially_closed projection; material amendment threshold; exact vehicle rules; source immutability formal approval; candidate Permission.

**Nessuna decisione OPEN è chiusa in questo documento.**

## 147. Deferred Scope

Full quote/pricing automation; payment capture; real Service gen; Dispatch wiring; UI; Customer module completo; AI booking; autonomous amendments.

## 148. Professional Validation

Product Architect; Booking Operations; NCC Operations; Commercial; Finance; Tax; Legal; Privacy/GDPR; Security; Data Architecture; Customer Experience; B2B/Agency Operations.

## 149. Implementation Readiness

| Classe | Contenuto |
|--------|-----------|
| READY | Separazione concetti; tenant/org/authz; BookingId shell; Permission names; principi |
| READY WITH OPEN DECISIONS | Status subset; snapshot fields; channel; Booker/Passenger; amendment materiality |
| DEFERRED | Full commercial automation; payments; multi-service economics |

## 150. Architecture Definition of Done

Sezioni §1–§151 e matrici presenti; ownership MC-OS-014/032 esplicita; nessun provider/SLA inventato; OPEN esplicite; Step 5 scope/exclusions chiari; EDGF/Blueprint aggiornati; nessun Trip state nel Booking SM.

## 151. Roadmap

Docs MC-OS-032 → Step 5 Booking Foundation → Commercial Snapshot → Service generation boundary → Application/API → UI → Quote/Payment integrations (senza violare confini).


## 152. Matrici

### 152.1 Concept Ownership Matrix

| Concetto | SoT |
|----------|-----|
| Cross-domain lifecycle | MC-OS-014 |
| Commercial Booking Aggregate | **MC-OS-032** |
| Dispatch / Assignment / Recovery | MC-OS-030 |
| SupportCase | MC-OS-031 |
| Pricing formulas | MC-OS-017 |
| Ledger / Settlement | MC-OS-006 |
| Permission Catalog | MC-OS-029 |

### 152.2 Actor Booking Matrix

| Actor | Create | Read | Amend | Confirm | Cancel | Third-party |
|-------|--------|------|-------|---------|--------|-------------|
| Guest | Sì | Own | Limit | Sì | Policy | No tipico |
| Registered Customer | Sì | Own | Policy | Sì | Policy | Possibile |
| Booker / Corporate | Sì | Scope | Policy | Sì | Policy | Sì |
| Hotel / Agency / Concierge | Portal | Scope | Policy | Policy | Policy | Sì |
| Support | Assistito | CASE | Assistito | No auto | Assistito | Assistito |
| Dispatcher | Limit | Org ops | Ops | No | OPEN | No |
| Owner | Sì | Org | Sì | Sì | Sì | Sì |
| Partner / Driver | No | Service scope | No | No | No | No |

### 152.3 Booking Source Matrix

| Source | Typical Actor | Instant path |
|--------|---------------|--------------|
| B2C_WEB/APP | Customer/Guest | Sì policy |
| B2B/CORPORATE/HOTEL/AGENCY | Booker | Review/terms |
| API | System/partner | Contract |
| SUPPORT/OWNER | Ops | Manual |
| IMPORTED / PARTNER_REFERRAL | System | Controlled |

### 152.4 Aggregate Field Matrix

Vedi §26.

### 152.5 Customer / Booker / Passenger Matrix

| Caso | Customer | Booker | Passenger |
|------|----------|--------|-----------|
| Self | Same | Same | Same |
| Gift / third party | Payer | Booker | Other |
| Corporate | Account | Employee booker | Traveler |
| Hotel | Hotel or guest | Hotel staff | Guest |
| Agency | Agency/end | Agent | Tourist |

### 152.6 Booking Type Matrix

| Type | Service gen tipica | Notes |
|------|--------------------|-------|
| ONE_WAY | 1 | |
| ROUND_TRIP | 2 | |
| MULTI_SERVICE | N | |
| HOURLY/DISPOSAL | OPEN split | |
| *_TRANSFER | 1+ | Flight/train/port refs |
| EVENT/WEDDING/TOUR | N possible | |
| CORPORATE/VIP/ACCESSIBLE | Policy flags | |

### 152.7 Location Matrix

| Element | Frozen@confirm | Provider SoT? |
|---------|----------------|---------------|
| AddressSnapshot | Sì | No |
| PlaceId/ref | Optional | No |
| Lat/Lon | If present | No |

### 152.8 Schedule Matrix

| Field | Required@confirm | OPEN thresholds |
|-------|------------------|-----------------|
| requestedPickupAt + tz | Sì | Cutoffs |
| Return | If round-trip | |
| Flexible window | Optional | |

### 152.9 Requirements Classification Matrix

| Requirement | Commercial | Operational | Sensitive | Progressive |
|-------------|------------|-------------|-----------|-------------|
| Luggage | Sì | Sì | No | Limitato |
| Accessibility | Sì | Sì | Possibile | Sì |
| VIP/Security | Sì | Sì | Spesso | INTERNAL/PROGRESSIVE |
| Language | Sì | Soft/Hard | No | Limitato |
| Pets | Sì | Sì | Possibile | Limitato |

### 152.10 Vehicle Request Matrix

| Item | On Booking | On Assignment |
|------|------------|---------------|
| Category/features | Sì | Filter |
| Concrete VehicleId | No | Sì |
| Compatible sub | No amend | Ops |
| Upgrade/downgrade | Amend+snap | After approval |

### 152.11 Quote / Booking Boundary Matrix

| Concern | Quote | Booking |
|---------|-------|---------|
| Price proposal | Sì | Snapshot after accept |
| Contract obligation | No | Sì |
| Expiration | Sì | EXPIRED pre-confirm |

### 152.12 Commercial Snapshot Matrix

| Part | Includes | Tip? | Margin? |
|------|----------|------|---------|
| Price | Customer-facing economics | No | No |
| Policy | Cancel/wait/no-show/modify/pay | — | — |
| Contact | Minimized PII | — | — |
| Billing | FINANCIAL_OWN | — | — |

### 152.13 Payment Boundary Matrix

| Concern | Booking | Finance |
|---------|---------|---------|
| PaymentStatus | Projection/ref | SoT movements |
| Refund approve | Eligibility ref | Approval |
| Ledger | No | Yes |

### 152.14 Booking State Matrix

Vedi §69.

### 152.15 State Transition Matrix

DRAFT→QUOTED→PENDING_*→CONFIRMED→READY_*→COMPLETED/CANCELLED/PARTIALLY_*→ARCHIVED; EXPIRED da pre-confirm. Illegali deny+audit.

### 152.16 Excluded State Matrix

Vedi §70 — tutti gli stati Trip/Recovery esclusi.

### 152.17 Amendment Matrix

| Timing | Re-quote? | New snapshot? | Dispatch impact |
|--------|-----------|---------------|-----------------|
| Pre-confirm | Spesso | N/A | No |
| Post-confirm material | Sì | Sì | Possibile |
| During Service | Raro | Se commercial | Ops/Recovery |

### 152.18 Cancellation Matrix

| Type | Booking status | Recovery? |
|------|----------------|-----------|
| Full | CANCELLED | Se ops live |
| Partial | PARTIALLY_CANCELLED | Per Service |
| Customer no-show | Non auto full cancel | Ops evidence |
| Driver no-show | Commercial outcome later | **Yes** MC-OS-030 |

### 152.19 Service Generation Matrix

| BookingType | Typical Services |
|-------------|------------------|
| ONE_WAY | 1 |
| ROUND_TRIP | 2 |
| MULTI_SERVICE | N |
| HOURLY/DISPOSAL | OPEN |

### 152.20 Domain Event Matrix

Vedi §106.

### 152.21 Command Matrix

Vedi §108 — ciascuno richiede Permission + scope.

### 152.22 Query Matrix

Vedi §109 — paginated, tenant-safe, no findAll.

### 152.23 Permission Matrix

| Permission | Status |
|------------|--------|
| booking.read/create/update/cancel | MC-OS-029 |
| booking.amend/confirm/review/archive | Candidate OPEN |
| quote.read/accept | Candidate OPEN |

### 152.24 Data Visibility Matrix

| Data | Customer | Driver | Partner | Support | Finance |
|------|----------|--------|---------|---------|---------|
| Customer price | FULL | No | No | LIMITED | FULL need |
| Margin/Partner Cost | No | No | No | No | INTERNAL |
| Passenger phone | Own | PROGRESSIVE | PROGRESSIVE | LIMITED | No |
| Billing | Own/FINANCIAL | No | No | LIMITED | FULL |

### 152.25 Security Matrix

| Control | MVP readiness |
|---------|---------------|
| Tenant/Org isolation | Required |
| Deny by Default | Required |
| Idempotency / rate limit | Readiness |
| Secure bookingNumber | Required design |
| RLS ENABLE+FORCE Step5 | Required |

### 152.26 Current Repository Assessment Matrix

Vedi §131.

### 152.27 Step 5 Scope Matrix

| In | Out |
|----|-----|
| Aggregate shell + port + memory + migration unapplied + tests | Pricing/Payment/ServiceGen/Dispatch/GPS/Support/AI/UI |

### 152.28 MVP / Phase 2 / Deferred Matrix

| Area | MVP docs/Step5 | Phase 2 | Deferred |
|------|----------------|---------|----------|
| Booking Aggregate | Shell | Full commercial SM | Autonomous |
| Snapshot | Design → implement post-shell | Full policy engine | — |
| Quote/Payment | Boundary only | Integrations | Providers chosen later OPEN |
| Service gen | Boundary | Real generation | — |

### 152.29 Decision Matrix

| Decision | Class |
|----------|-------|
| CBD principles / separation | APPROVED |
| sourceChannel immutable | CANDIDATE |
| Status subset Step5 | CANDIDATE |
| SLA numerici / providers / OP-02 | OPEN |
| Full automation | DEFERRED |

### 152.30 Implementation Readiness Matrix

Vedi §149.

---

## Cronologia revisioni

| Versione | Data | Autore | Descrizione modifica | Stato |
|----------|------|--------|----------------------|-------|
| 0.1.0 | 2026-08-02 | Booking, Commerce & Customer Platform Engineering | Creazione ex novo del Commercial Booking Domain Framework (MC-OS-032): Booking Aggregate commerciale, Snapshot, Actor, Source/Type, lifecycle commerciale, confini Quote/Payment/Service/Dispatch/Support, Step 5 scope, matrici, OPEN. Non sostituisce MC-OS-014. | Draft |

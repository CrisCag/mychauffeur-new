# MyChauffeur OS — System Domain Architecture

| Campo | Valore |
|-------|--------|
| **Codice documento** | MC-OS-019 |
| **Titolo** | System Domain Architecture |
| **Versione** | 0.1.0 |
| **Stato** | Draft |
| **Data creazione** | 2026-07-26 |
| **Ultima modifica** | 2026-07-26 |
| **Owner** | Chief Enterprise Architect |
| **Autori** | MyChauffeur OS Team |
| **Documenti correlati** | MC-OS-000 · MC-OS-001 · MC-OS-002 · MC-OS-005 · MC-OS-006 · MC-OS-009 · MC-OS-011 · MC-OS-012 · MC-OS-014 · MC-OS-015 · MC-OS-016 · MC-OS-017 · MC-OS-018 · MC-OS-013 · PLATFORM_MAP · HANDOFF |
| **Dipendenze** | Framework di dominio esistenti; Glossario; Business Entity Model; BOS; EDGF |
| **Classificazione** | Official System Domain Architecture — Draft |
| **Documentation Release** | 0.1 (allineamento previsto) |

---

## Avvertenza

Questo documento è la **Source of Truth dell’architettura logica a Bounded Context** di MyChauffeur OS.

**Non** descrive: database, SQL, API REST, codice, infrastruttura, diagrammi Draw.io.

Descrive esclusivamente l’**architettura dei domini software**, ownership, eventi e regole di interazione.

I nomi di domini, entità, eventi, aggregate, servizi e bounded context restano in **inglese**. Il testo normativo è in **italiano**.

---

## Source of Truth

**MC-OS-019** governa la scomposizione in Bounded Context, il context mapping e le responsabilità dei motori logici.

- Entità di business dettagliate → MC-OS-011
- Terminologia → MC-OS-009
- Lifecycle Booking → MC-OS-014
- Economics/Settlement → MC-OS-017 / MC-OS-006
- Identity → MC-OS-015

In caso di conflitto terminologico prevale il Glossario; in caso di conflitto di ownership di aggregate prevale questo documento previa ADR.

---

## 1. Scopo

Scomporre MyChauffeur OS in **Bounded Context** indipendenti, ciascuno con dati e responsabilità chiare, nel rispetto del **Single Responsibility Principle**.

Regola fondante di comunicazione:

> **Nessun dominio può modificare direttamente lo stato interno di un altro dominio.**
> Le modifiche cross-domain avvengono tramite **Domain/Integration Events** o **servizi/applicazioni pubbliche** del dominio proprietario.

---

## 2. Principi architetturali

| ID | Principio |
|----|-----------|
| SDA-01 | Un Bounded Context = un ownership di modello |
| SDA-02 | SRP per dominio: una ragion d’essere |
| SDA-03 | Nessuna mutazione diretta cross-domain |
| SDA-04 | Event-driven per fatti avvenuti; Commands nel dominio owner |
| SDA-05 | Write Model privato; Read Model condividibile |
| SDA-06 | Anti-Corruption Layer su sistemi esterni |
| SDA-07 | Shared Kernel minimo e versionato |
| SDA-08 | Core Domain protetto da coupling verso Generic |
| SDA-09 | Allineamento a BOS: CM/utile, XOR costi, no double-count |
| SDA-10 | Decisioni OPEN non chiuse in questo draft |

---

## 3. Linguaggio ubiquo (rinvio)

Il linguaggio ubiquo ufficiale è definito in **MC-OS-009**. Questo documento usa solo termini canonici (`Booking`, `Service`, `Trip`, `Assignment`, `Partner Cost`, `Internal Execution Cost`, `Platform Revenue`, `Contribution Margin`, ecc.).

---

## 4. Bounded Context overview

Sono definiti **21** Bounded Context (domini minimi obbligatori). Ciascuno è un confine di modello e di team ownership funzionale.

## 5. Catalogo dei domini

### 1. Identity Domain

| Campo | Contenuto |
|-------|-----------|
| **Classificazione DDD** | Supporting Domain |
| **Scopo** | Gestire Person, User, Membership, Role, Permission, Capability, Session e isolamento tenant. |
| **Ownership** | Identity, Security & Access Governance |
| **Documenti Source of Truth** | MC-OS-015 |
| **Responsabilità** | Possiede e governa gli aggregate elencati; espone comandi/servizi pubblici; emette eventi; non muta aggregate altrui |
| **Entità possedute** | Person, User, Organization (ref), TenantContext, Role, Permission, Capability, Invitation, Session |
| **Aggregate Root** | UserAccount, OrganizationMembership |
| **Domain Services** | AuthenticationService, AuthorizationService, MembershipService |
| **Value Objects** | TenantId, RoleCode, PermissionCode, SessionTokenRef |
| **Business Rules** | Person≠User≠Role≠Capability; deny by default; least privilege; active org context |
| **Eventi prodotti** | `user_authenticated, membership_activated, role_granted, role_revoked, session_revoked, user_suspended` |
| **Eventi consumati** | `offboarding_requested (Admin), compliance_hold (Compliance)` |
| **Dipendenze consentite** | Configuration (policy flags); Notification (security notices) |
| **Dipendenze vietate** | Booking write; Finance write; Settlement write; direct PII export senza audit |
| **Impatto software** | Bounded Context dedicato (modulo/servizio logico); API pubbliche di dominio solo via application services; persistenza privata al context |

### 2. Customer Domain

| Campo | Contenuto |
|-------|-----------|
| **Classificazione DDD** | Supporting Domain |
| **Scopo** | Possedere profilo Customer, preferenze, segmentazione CX e relazione Booker/Passenger. |
| **Ownership** | Customer Experience & Service Design |
| **Documenti Source of Truth** | MC-OS-018 · MC-OS-009 |
| **Responsabilità** | Possiede e governa gli aggregate elencati; espone comandi/servizi pubblici; emette eventi; non muta aggregate altrui |
| **Entità possedute** | Customer, Consumer, B2BCustomer, CorporateAccount (ref), Preference, GuestIdentity |
| **Aggregate Root** | CustomerProfile |
| **Domain Services** | CustomerProfileService, PreferenceService |
| **Value Objects** | LocaleCode, ContactChannel, AccessibilityNeed |
| **Business Rules** | Booker≠Passenger; data minimization; no promesse assolute |
| **Eventi prodotti** | `customer_registered, preference_updated, guest_converted` |
| **Eventi consumati** | `booking_confirmed, trip_completed, rating_submitted` |
| **Dipendenze consentite** | Identity (auth identity); Notification; Booking (read refs) |
| **Dipendenze vietate** | Pricing write; Partner Cost write; Settlement mutation |
| **Impatto software** | Bounded Context dedicato (modulo/servizio logico); API pubbliche di dominio solo via application services; persistenza privata al context |

### 3. Booking Domain

| Campo | Contenuto |
|-------|-----------|
| **Classificazione DDD** | Core Domain |
| **Scopo** | Lifecycle commerciale e operativo di Request, Quote, Booking, Service, Assignment e Trip senza fusione di stati. |
| **Ownership** | Booking, Service & Operations |
| **Documenti Source of Truth** | MC-OS-014 · MC-OS-011 |
| **Responsabilità** | Possiede e governa gli aggregate elencati; espone comandi/servizi pubblici; emette eventi; non muta aggregate altrui |
| **Entità possedute** | Request, Quote, Booking, Service, Trip, Assignment, ServiceOrder, Stop, Cancellation, RecoveryCase |
| **Aggregate Root** | Booking, Service, Assignment, Trip |
| **Domain Services** | BookingLifecycleService, AssignmentOrchestrationService, RecoveryService |
| **Value Objects** | BookingOrigin, AssignmentMode, GeoPoint, TimeWindow |
| **Business Rules** | Booking≠Service≠Trip≠Assignment; INTERNAL XOR PARTNER; max assignment budget; Evidence su critici |
| **Eventi prodotti** | `quote_issued, booking_confirmed, service_created, assignment_*, trip_*, cancellation_*, no_show_*, recovery_*` |
| **Eventi consumati** | `price_quoted (Pricing), payment_captured (Payment), offer_accepted (Marketplace), driver_status (Fleet/Dispatch)` |
| **Dipendenze consentite** | Pricing (quotes); Payment (status); Marketplace/Partner (offers); Fleet/Dispatch; Notification; Finance/Settlement (signals) |
| **Dipendenze vietate** | Direct Settlement ledger write; Identity Role mutation; Partner Score mutation diretta |
| **Impatto software** | Bounded Context dedicato (modulo/servizio logico); API pubbliche di dominio solo via application services; persistenza privata al context |

### 4. Marketplace Domain

| Campo | Contenuto |
|-------|-----------|
| **Classificazione DDD** | Core Domain |
| **Scopo** | Partner Exchange B2B: Listing, Offer, matching coverage, Progressive Data Disclosure, Exchange economics signals. |
| **Ownership** | Marketplace & Partner Operations |
| **Documenti Source of Truth** | MC-OS-012 |
| **Responsabilità** | Possiede e governa gli aggregate elencati; espone comandi/servizi pubblici; emette eventi; non muta aggregate altrui |
| **Entità possedute** | Listing, Offer, Counteroffer, DisclosureStage, PlatformFeeSignal, UnfilledCase |
| **Aggregate Root** | ExchangeListing, ExchangeOffer |
| **Domain Services** | ExchangeMatchingService, DisclosureService, ExchangeFeePolicyService |
| **Value Objects** | DisclosureStageCode, ListingExpiry, OfferAmount |
| **Business Rules** | Exchange≠B2C; Customer Price hidden to Executing by default; UNFILLED→no platform fee; progressive disclosure |
| **Eventi prodotti** | `listing_published, offer_made, offer_accepted, listing_unfilled, disclosure_unlocked` |
| **Eventi consumati** | `service_ready_for_exchange (Booking), partner_eligibility (Partner), budget_validated (Pricing)` |
| **Dipendenze consentite** | Booking; Partner; Pricing; Notification; Settlement (fee signals) |
| **Dipendenze vietate** | Customer PII full dump pre-accept; Finance arbitrary refund |
| **Impatto software** | Bounded Context dedicato (modulo/servizio logico); API pubbliche di dominio solo via application services; persistenza privata al context |

### 5. Partner Domain

| Campo | Contenuto |
|-------|-----------|
| **Classificazione DDD** | Core Domain |
| **Scopo** | Anagrafica e stato operativo Partner Company, Capability Partner, onboarding, Score, Evidence di compliance Partner. |
| **Ownership** | Partner Operations / Legal Ops |
| **Documenti Source of Truth** | MC-OS-005 · MC-OS-012 |
| **Responsabilità** | Possiede e governa gli aggregate elencati; espone comandi/servizi pubblici; emette eventi; non muta aggregate altrui |
| **Entità possedute** | PartnerCompany, PartnerCapability, PartnerDocumentRef, PartnerScore, SubcontractorAuth |
| **Aggregate Root** | PartnerCompany |
| **Domain Services** | PartnerOnboardingService, PartnerEligibilityService, PartnerScoreService |
| **Value Objects** | PartnerStatus, ScoreBand, CapabilityCode |
| **Business Rules** | Partner indipendente (no subordination); holdback solo con reason+Evidence+contestation |
| **Eventi prodotti** | `partner_onboarded, partner_suspended, partner_score_updated, capability_granted` |
| **Eventi consumati** | `no_show_driver, recovery_closed, dispute_opened, settlement_holdback` |
| **Dipendenze consentite** | Identity (membership); Document; Compliance; Marketplace; Booking (eligibility read) |
| **Dipendenze vietate** | Booking state machine rewrite; Customer Price storage |
| **Impatto software** | Bounded Context dedicato (modulo/servizio logico); API pubbliche di dominio solo via application services; persistenza privata al context |

### 6. Dispatch Domain

| Campo | Contenuto |
|-------|-----------|
| **Classificazione DDD** | Core Domain |
| **Scopo** | Orchestrazione operativa Dispatcher: code, eccezioni, reassignment decisioning, monitoring missioni. |
| **Ownership** | Booking, Service & Operations |
| **Documenti Source of Truth** | MC-OS-014 · PLATFORM_MAP |
| **Responsabilità** | Possiede e governa gli aggregate elencati; espone comandi/servizi pubblici; emette eventi; non muta aggregate altrui |
| **Entità possedute** | DispatchBoard, ExceptionCase, ManualAssignmentDecision, EscalationCase |
| **Aggregate Root** | DispatchQueueItem |
| **Domain Services** | DispatchDecisionService, EscalationService |
| **Value Objects** | PriorityCode, ExceptionType, ETASnapshot |
| **Business Rules** | Umano sulle eccezioni; automazione sul flusso ordinario; non fonde Trip con Booking |
| **Eventi prodotti** | `dispatch_override_applied, escalation_opened, manual_assignment_requested` |
| **Eventi consumati** | `trip_*, assignment_*, delay_*, unassigned_alert` |
| **Dipendenze consentite** | Booking; Fleet; Notification; Marketplace (publish trigger) |
| **Dipendenze vietate** | Pricing rule authorship; Settlement posting |
| **Impatto software** | Bounded Context dedicato (modulo/servizio logico); API pubbliche di dominio solo via application services; persistenza privata al context |

### 7. Fleet Domain

| Campo | Contenuto |
|-------|-----------|
| **Classificazione DDD** | Supporting Domain |
| **Scopo** | Vehicle, Fleet capacity, Driver Profile operativo, disponibilità e vincoli asset. |
| **Ownership** | Fleet & Driver Operations |
| **Documenti Source of Truth** | MC-OS-011 · MC-OS-014 |
| **Responsabilità** | Possiede e governa gli aggregate elencati; espone comandi/servizi pubblici; emette eventi; non muta aggregate altrui |
| **Entità possedute** | Fleet, Vehicle, VehicleCategory, DriverProfile, AvailabilitySlot |
| **Aggregate Root** | Vehicle, DriverProfile |
| **Domain Services** | AvailabilityService, AssetEligibilityService |
| **Value Objects** | PlateRef, CapacitySpec, ShiftWindow |
| **Business Rules** | Driver scope minimizzato; asset eligibility prima di Assignment active |
| **Eventi prodotti** | `vehicle_registered, availability_changed, driver_duty_changed` |
| **Eventi consumati** | `assignment_accepted, trip_en_route, trip_completed` |
| **Dipendenze consentite** | Identity (driver user link); Booking/Dispatch (read/write availability signals); Media (assets) |
| **Dipendenze vietate** | Payment capture; Partner Exchange fee calculation |
| **Impatto software** | Bounded Context dedicato (modulo/servizio logico); API pubbliche di dominio solo via application services; persistenza privata al context |

### 8. Pricing Domain

| Campo | Contenuto |
|-------|-----------|
| **Classificazione DDD** | Core Domain |
| **Scopo** | Customer Price, Quote, Pricing Rule/Profile, guardrail CM, Maximum Assignment Budget, Markup/Commission signals. |
| **Ownership** | Pricing, Revenue & Business Operations |
| **Documenti Source of Truth** | MC-OS-017 · MC-OS-003 · MC-OS-002 |
| **Responsabilità** | Possiede e governa gli aggregate elencati; espone comandi/servizi pubblici; emette eventi; non muta aggregate altrui |
| **Entità possedute** | PricingRule, PricingProfile, SurchargeRule, Discount, Coupon, MarginSimulation, AssignmentBudget |
| **Aggregate Root** | Quote, PricingProfile |
| **Domain Services** | PricingEngineService, MarginGuardrailService, BudgetCalculationService |
| **Value Objects** | Money, CurrencyCode, TaxRegimePlaceholder, TakeRateSignal |
| **Business Rules** | CM/utile > GBV guida; Commission≠Markup≠Platform Revenue; XOR costs; no % definitive qui |
| **Eventi prodotti** | `price_quoted, quote_expired, budget_calculated, margin_guardrail_breached, price_overridden` |
| **Eventi consumati** | `booking_drafted, service_modified, promo_redeemed, fx_rate_updated (Integration)` |
| **Dipendenze consentite** | Configuration; Booking (consume quotes); Marketplace (fee inputs); Finance (revenue components signal) |
| **Dipendenze vietate** | Trip operational state writes; Partner Score |
| **Impatto software** | Bounded Context dedicato (modulo/servizio logico); API pubbliche di dominio solo via application services; persistenza privata al context |

### 9. Finance Domain

| Campo | Contenuto |
|-------|-----------|
| **Classificazione DDD** | Core Domain |
| **Scopo** | Platform Revenue composition, ledger commerciale alto livello, invoice signals, GBV/CM reporting inputs. |
| **Ownership** | Finance & Business Operations |
| **Documenti Source of Truth** | MC-OS-006 · MC-OS-002 · MC-OS-017 |
| **Responsabilità** | Possiede e governa gli aggregate elencati; espone comandi/servizi pubblici; emette eventi; non muta aggregate altrui |
| **Entità possedute** | RevenueComponent, InvoiceSignal, CreditNoteSignal, GbvSnapshot, ContributionMarginSnapshot |
| **Aggregate Root** | FinancialCase |
| **Domain Services** | RevenueRecognitionSignalService, InvoiceOrchestrationService |
| **Value Objects** | Money, LedgerEntryRef, FiscalPlaceholder |
| **Business Rules** | GBV ≠ Platform Revenue; no double-count refund/compensation/recovery/chargeback; MoR OPEN |
| **Eventi prodotti** | `revenue_component_recorded, invoice_requested, credit_issued_signal` |
| **Eventi consumati** | `booking_completed, settlement_ready, payment_captured, refund_posted` |
| **Dipendenze consentite** | Payment; Settlement; Pricing; Booking (economic facts) |
| **Dipendenze vietate** | Dispatch assignment; Marketplace listing content |
| **Impatto software** | Bounded Context dedicato (modulo/servizio logico); API pubbliche di dominio solo via application services; persistenza privata al context |

### 10. Settlement Domain

| Campo | Contenuto |
|-------|-----------|
| **Classificazione DDD** | Core Domain |
| **Scopo** | Settlement line items, Holdback, Payout prep, Recovery Cost attribution, append-only financial ops post-service. |
| **Ownership** | Finance Operations |
| **Documenti Source of Truth** | MC-OS-006 |
| **Responsabilità** | Possiede e governa gli aggregate elencati; espone comandi/servizi pubblici; emette eventi; non muta aggregate altrui |
| **Entità possedute** | SettlementLineItem, Holdback, PayoutInstruction, RecoveryCostAllocation, DisputeFinanceLink |
| **Aggregate Root** | Settlement |
| **Domain Services** | SettlementEngineService, HoldbackService, PayoutPreparationService |
| **Value Objects** | SettlementStatus, HoldbackReasonCode, Money |
| **Business Rules** | Append-only ledger semantics; holdback solo motivato+Evidence+contestation; Partner Cost XOR Internal |
| **Eventi prodotti** | `settlement_opened, settlement_ready, holdback_applied, payout_instruction_created, recovery_cost_allocated` |
| **Eventi consumati** | `trip_completed, cancellation_settled, dispute_resolved, exchange_fee_due, payment_status` |
| **Dipendenze consentite** | Booking/Marketplace events; Finance; Payment; Partner; Document (Evidence refs) |
| **Dipendenze vietate** | Quote pricing authorship; Customer preference writes |
| **Impatto software** | Bounded Context dedicato (modulo/servizio logico); API pubbliche di dominio solo via application services; persistenza privata al context |

### 11. Payment Domain

| Campo | Contenuto |
|-------|-----------|
| **Classificazione DDD** | Supporting Domain |
| **Scopo** | Payment Intent/Capture/Refund orchestration verso PSP; stati pagamento Booking/Invoice. |
| **Ownership** | Payments & Checkout |
| **Documenti Source of Truth** | MC-OS-006 · DECISIONS #1 OPEN |
| **Responsabilità** | Possiede e governa gli aggregate elencati; espone comandi/servizi pubblici; emette eventi; non muta aggregate altrui |
| **Entità possedute** | PaymentAttempt, PaymentMethodRef, Refund, ChargebackCase, PayoutTransferRef |
| **Aggregate Root** | Payment |
| **Domain Services** | PaymentOrchestrationService, RefundService |
| **Value Objects** | PaymentStatus, PspReference, Money |
| **Business Rules** | Nessun provider fissato; no card data in domain events; idempotenza tentativi |
| **Eventi prodotti** | `payment_initiated, payment_captured, payment_failed, refund_posted, chargeback_opened` |
| **Eventi consumati** | `booking_confirmed_pending_payment, invoice_requested, payout_instruction_created` |
| **Dipendenze consentite** | Booking; Finance; Settlement; Notification; Integration (PSP ACL) |
| **Dipendenze vietate** | Direct PartnerCompany mutation; Pricing rule edits |
| **Impatto software** | Bounded Context dedicato (modulo/servizio logico); API pubbliche di dominio solo via application services; persistenza privata al context |

### 12. Notification Domain

| Campo | Contenuto |
|-------|-----------|
| **Classificazione DDD** | Supporting Domain |
| **Scopo** | Template, delivery, consent, canali, masked communication, delivery status. |
| **Ownership** | Communications & Customer Operations |
| **Documenti Source of Truth** | MC-OS-016 |
| **Responsabilità** | Possiede e governa gli aggregate elencati; espone comandi/servizi pubblici; emette eventi; non muta aggregate altrui |
| **Entità possedute** | ConsentRecord, DeliveryAttempt, ChannelPreference, MaskedChannelSession |
| **Aggregate Root** | NotificationMessage, NotificationTemplate |
| **Domain Services** | NotificationEngineService, TemplateService, ConsentService |
| **Value Objects** | ChannelCode, TemplateVersion, PriorityCode |
| **Business Rules** | Transactional≠promotional; no provider choice; minimization; quiet hours policy |
| **Eventi prodotti** | `notification_queued, notification_sent, notification_failed, consent_updated` |
| **Eventi consumati** | `Tutti gli eventi transazionali rilevanti da altri domini` |
| **Dipendenze consentite** | Identity (recipient resolution); Configuration; tutti i domini via events (consume) |
| **Dipendenze vietate** | Domain state mutation di Booking/Settlement |
| **Impatto software** | Bounded Context dedicato (modulo/servizio logico); API pubbliche di dominio solo via application services; persistenza privata al context |

### 13. Support Domain

| Campo | Contenuto |
|-------|-----------|
| **Classificazione DDD** | Supporting Domain |
| **Scopo** | Complaint, ticket, escalation Customer Support, correlazione booking_id. |
| **Ownership** | Customer Operations |
| **Documenti Source of Truth** | MC-OS-018 |
| **Responsabilità** | Possiede e governa gli aggregate elencati; espone comandi/servizi pubblici; emette eventi; non muta aggregate altrui |
| **Entità possedute** | Complaint, SupportCase, EscalationLink, GoodwillActionRequest |
| **Aggregate Root** | SupportTicket |
| **Domain Services** | SupportCaseService, EscalationRoutingService |
| **Value Objects** | TicketStatus, ComplaintType |
| **Business Rules** | Self-service ordinario; umano su eccezioni; goodwill con audit e guardrail pricing |
| **Eventi prodotti** | `complaint_opened, ticket_escalated, goodwill_requested` |
| **Eventi consumati** | `booking_*, payment_failed, notification_failed, rating_submitted` |
| **Dipendenze consentite** | Customer; Booking (read); Notification; Finance (refund signals) |
| **Dipendenze vietate** | Settlement ledger direct edit; Identity privilege grant |
| **Impatto software** | Bounded Context dedicato (modulo/servizio logico); API pubbliche di dominio solo via application services; persistenza privata al context |

### 14. Compliance Domain

| Campo | Contenuto |
|-------|-----------|
| **Classificazione DDD** | Supporting Domain |
| **Scopo** | Policy compliance, audit requests, privacy holds, regulatory checkpoints. |
| **Ownership** | Compliance & Legal Ops |
| **Documenti Source of Truth** | MC-OS-005 · MC-OS-015 |
| **Responsabilità** | Possiede e governa gli aggregate elencati; espone comandi/servizi pubblici; emette eventi; non muta aggregate altrui |
| **Entità possedute** | PrivacyRequest, AuditExportRequest, RegulatoryHold, LocalLawScheduleRef |
| **Aggregate Root** | ComplianceCase |
| **Domain Services** | ComplianceGateService, PrivacyRequestService |
| **Value Objects** | HoldCode, LawScheduleCode |
| **Business Rules** | Break-glass auditato; retention OPEN; Local Law Schedule internazionale |
| **Eventi prodotti** | `compliance_hold_applied, privacy_request_opened, audit_export_requested` |
| **Eventi consumati** | `partner_onboarded, offboarding_completed, dispute_opened, break_glass_used` |
| **Dipendenze consentite** | Identity; Partner; Document; Administration |
| **Dipendenze vietate** | Marketplace offer accept bypass; Pricing override senza audit |
| **Impatto software** | Bounded Context dedicato (modulo/servizio logico); API pubbliche di dominio solo via application services; persistenza privata al context |

### 15. Configuration Domain

| Campo | Contenuto |
|-------|-----------|
| **Classificazione DDD** | Generic Domain |
| **Scopo** | Feature flags, tenant Configuration, policy parameters, engine tunables (non segreti). |
| **Ownership** | Platform Engineering / Ops |
| **Documenti Source of Truth** | Blueprint · PLATFORM_MAP |
| **Responsabilità** | Possiede e governa gli aggregate elencati; espone comandi/servizi pubblici; emette eventi; non muta aggregate altrui |
| **Entità possedute** | FeatureFlag, TenantSetting, PolicyParameter, EngineTuneable |
| **Aggregate Root** | ConfigurationSet |
| **Domain Services** | ConfigurationEngineService |
| **Value Objects** | ConfigKey, ConfigScope, SemVerRef |
| **Business Rules** | Deny dangerous defaults; change audit; no secrets in config domain payloads |
| **Eventi prodotti** | `config_published, feature_flag_changed` |
| **Eventi consumati** | `admin_config_change_requested` |
| **Dipendenze consentite** | Administration; tutti i domini (read config) |
| **Dipendenze vietate** | Runtime secret storage; Payment PSP credentials store |
| **Impatto software** | Bounded Context dedicato (modulo/servizio logico); API pubbliche di dominio solo via application services; persistenza privata al context |

### 16. Analytics Domain

| Campo | Contenuto |
|-------|-----------|
| **Classificazione DDD** | Generic Domain |
| **Scopo** | Read models analitici, KPI snapshot, funnel metrics; non SoT operativa. |
| **Ownership** | Analytics & BI |
| **Documenti Source of Truth** | MC-OS-002 · frameworks KPI sections |
| **Responsabilità** | Possiede e governa gli aggregate elencati; espone comandi/servizi pubblici; emette eventi; non muta aggregate altrui |
| **Entità possedute** | KpiSnapshot, FunnelMetric, CohortSignal |
| **Aggregate Root** | AnalyticsSnapshot |
| **Domain Services** | AnalyticsIngestionService, MetricAggregationService |
| **Value Objects** | MetricName, TimeBucket |
| **Business Rules** | Analytics non è write-model operativo; eventual consistency accettata |
| **Eventi prodotti** | `kpi_snapshot_ready` |
| **Eventi consumati** | `Domain events (fan-in read-only)` |
| **Dipendenze consentite** | Tutti (consume events) |
| **Dipendenze vietate** | Qualsiasi write su aggregate operativi |
| **Impatto software** | Bounded Context dedicato (modulo/servizio logico); API pubbliche di dominio solo via application services; persistenza privata al context |

### 17. AI Domain

| Campo | Contenuto |
|-------|-----------|
| **Classificazione DDD** | Supporting Domain |
| **Scopo** | Assistenza decisionale/AI suggestions; mai bypass autonomo dei guardrail di dominio. |
| **Ownership** | AI & Decision Support |
| **Documenti Source of Truth** | Blueprint · future ADR |
| **Responsabilità** | Possiede e governa gli aggregate elencati; espone comandi/servizi pubblici; emette eventi; non muta aggregate altrui |
| **Entità possedute** | AiPromptContextRef, Recommendation, RiskHint |
| **Aggregate Root** | AiSuggestion |
| **Domain Services** | AiAssistantService, RecommendationService |
| **Value Objects** | ConfidenceScore, SuggestionType |
| **Business Rules** | AI non modifica stati; propone; Decision Engine umano/rules ha priorità; no PII inutile |
| **Eventi prodotti** | `ai_suggestion_created, ai_recommendation_accepted_signal` |
| **Eventi consumati** | `exception_opened, delay_*, fraud_signal, support_ticket` |
| **Dipendenze consentite** | Dispatch/Support/Risk (consume suggestions); Identity (authz) |
| **Dipendenze vietate** | Silent auto-accept Assignment; Settlement auto-holdback |
| **Impatto software** | Bounded Context dedicato (modulo/servizio logico); API pubbliche di dominio solo via application services; persistenza privata al context |

### 18. Document Domain

| Campo | Contenuto |
|-------|-----------|
| **Classificazione DDD** | Supporting Domain |
| **Scopo** | Document metadata, Evidence refs, versioning documentale operativo (non EDGF). |
| **Ownership** | Operations & Compliance |
| **Documenti Source of Truth** | MC-OS-005 · MC-OS-014 |
| **Responsabilità** | Possiede e governa gli aggregate elencati; espone comandi/servizi pubblici; emette eventi; non muta aggregate altrui |
| **Entità possedute** | Evidence, DocumentVersion, DocumentAccessGrant |
| **Aggregate Root** | DocumentArtifact |
| **Domain Services** | DocumentRegistryService, EvidenceService |
| **Value Objects** | DocumentType, ContentHashRef, RetentionClass |
| **Business Rules** | Evidence obbligatoria su eventi critici; access grant least privilege |
| **Eventi prodotti** | `document_uploaded, evidence_attached, document_access_granted` |
| **Eventi consumati** | `no_show_*, dispute_*, holdback_applied, partner_onboarded` |
| **Dipendenze consentite** | Partner; Booking; Settlement; Compliance; Media |
| **Dipendenze vietate** | Template marketing Notification content authorship |
| **Impatto software** | Bounded Context dedicato (modulo/servizio logico); API pubbliche di dominio solo via application services; persistenza privata al context |

### 19. Media Domain

| Campo | Contenuto |
|-------|-----------|
| **Classificazione DDD** | Generic Domain |
| **Scopo** | Media assets (immagini veicolo, allegati) storage refs e transformation signals. |
| **Ownership** | Platform Engineering |
| **Documenti Source of Truth** | PLATFORM_MAP |
| **Responsabilità** | Possiede e governa gli aggregate elencati; espone comandi/servizi pubblici; emette eventi; non muta aggregate altrui |
| **Entità possedute** | MediaObject, ThumbnailRef, MediaAccessPolicy |
| **Aggregate Root** | MediaAsset |
| **Domain Services** | MediaStorageService, MediaAccessService |
| **Value Objects** | MimeType, StorageKeyRef |
| **Business Rules** | No PII in filenames pubblici; access via policy |
| **Eventi prodotti** | `media_uploaded, media_deleted` |
| **Eventi consumati** | `document_uploaded, vehicle_registered` |
| **Dipendenze consentite** | Document; Fleet; Identity (authz) |
| **Dipendenze vietate** | Finance posting |
| **Impatto software** | Bounded Context dedicato (modulo/servizio logico); API pubbliche di dominio solo via application services; persistenza privata al context |

### 20. Integration Domain

| Campo | Contenuto |
|-------|-----------|
| **Classificazione DDD** | Generic Domain |
| **Scopo** | ACL verso sistemi esterni (PSP, maps, messaging, ERP); Published Language inbound/outbound. |
| **Ownership** | Platform Engineering |
| **Documenti Source of Truth** | PLATFORM_MAP · HANDOFF |
| **Responsabilità** | Possiede e governa gli aggregate elencati; espone comandi/servizi pubblici; emette eventi; non muta aggregate altrui |
| **Entità possedute** | ExternalSystemBinding, InboundMessage, OutboundMessage, SyncCheckpoint |
| **Aggregate Root** | IntegrationEndpoint |
| **Domain Services** | AntiCorruptionTranslationService, OutboundGatewayService |
| **Value Objects** | ExternalSystemCode, CorrelationId |
| **Business Rules** | Nessun modello esterno entra nei Core Domain senza ACL; idempotenza |
| **Eventi prodotti** | `integration_message_received, integration_message_sent, integration_failed` |
| **Eventi consumati** | `payment_*, notification_*, geo_update requests` |
| **Dipendenze consentite** | Payment; Notification; Fleet (maps); Finance (ERP) |
| **Dipendenze vietate** | Bypass ACL verso Booking aggregates |
| **Impatto software** | Bounded Context dedicato (modulo/servizio logico); API pubbliche di dominio solo via application services; persistenza privata al context |

### 21. Administration Domain

| Campo | Contenuto |
|-------|-----------|
| **Classificazione DDD** | Supporting Domain |
| **Scopo** | Backoffice Platform Admin: break-glass, tenant ops, cataloghi amministrativi. |
| **Ownership** | Platform Operations |
| **Documenti Source of Truth** | MC-OS-015 · Blueprint |
| **Responsabilità** | Possiede e governa gli aggregate elencati; espone comandi/servizi pubblici; emette eventi; non muta aggregate altrui |
| **Entità possedute** | BreakGlassSession, AdminAuditEntry, TenantOpsRequest |
| **Aggregate Root** | AdminAction |
| **Domain Services** | BreakGlassService, TenantOpsService |
| **Value Objects** | AdminActionType, BreakGlassReason |
| **Business Rules** | Least privilege; ogni azione privilegiata auditata; non default ops path |
| **Eventi prodotti** | `break_glass_opened, admin_action_performed, tenant_ops_requested` |
| **Eventi consumati** | `compliance_hold, user_suspended, config_change` |
| **Dipendenze consentite** | Identity; Compliance; Configuration |
| **Dipendenze vietate** | Silent Settlement mutation; Marketplace accept for Partner |
| **Impatto software** | Bounded Context dedicato (modulo/servizio logico); API pubbliche di dominio solo via application services; persistenza privata al context |

## 6. Classificazione Core / Supporting / Generic

| Tipo | Domini |
|------|--------|
| **Core Domain** | Booking, Marketplace, Partner, Dispatch, Pricing, Finance, Settlement |
| **Supporting Domain** | Identity, Customer, Fleet, Payment, Notification, Support, Compliance, AI, Document, Administration |
| **Generic Domain** | Configuration, Analytics, Media, Integration |

Il Core concentra differenziazione competitiva NCC/Exchange e economics. I Generic sono sostituibili/standardizzabili con minore rischio strategico.

---

## 7. Shared Kernel

Elementi minimi condivisi (versionati, cambiamento costoso):

- Identificatori: `booking_id`, `service_id`, `trip_id`, `assignment_id`, `partner_company_id`, `organization_id`, `tenant_id`
- Value objects condivisi: `Money`, `CurrencyCode`, `CorrelationId`, `TimeWindow`
- Enum concettuali stabili: `AssignmentMode` (`INTERNAL` \| `PARTNER`)

**Non** entramo nel Shared Kernel: regole Pricing, stati Trip granulari, template Notification, Score Partner.

---

## 8. Published Language

Linguaggio pubblicato per integrazione tra context e verso esterni (via Integration Domain):

- Catalogo eventi con nome stabile e payload minimo
- Codici stato pubblici (proiezioni), non tabelle private
- Errori di applicazione tipizzati (`BudgetExceeded`, `UnauthorizedContext`)

Evoluzione: compatibilità additiva; breaking change → ADR + version bump evento.

---

## 9. Anti-Corruption Layer (ACL)

L’**Integration Domain** traduce modelli PSP, maps, messaging, ERP nel Published Language interno.

I Core Domain **non** dipendono da DTO esterni. Payment/Notification consumano traduzioni ACL, non SDK grezzi nei propri aggregate.

---

## 10. Open Host Service

Domini che espongono un protocollo stabile a molti consumatori:

- **Identity** — authz queries / token introspection concettuale
- **Booking** — query stato Booking/Service/Trip autorizzate
- **Pricing** — Quote/Budget calculation
- **Notification** — enqueue message
- **Configuration** — read config

Accesso sempre autorizzato (MC-OS-015); non equivale a accesso DB.

---

## 11. Conformist

Context che si adeguano al modello a monte senza negoziare:

- **Analytics** conformist sugli eventi di tutti i domini
- **Media** conformist su policy Document/Identity dove applicabile

---

## 12. Customer / Supplier

| Upstream (Supplier) | Downstream (Customer) | Contratto |
|---------------------|-----------------------|-----------|
| Pricing | Booking | Quote valida / budget |
| Booking | Settlement | fatti completamento/cancel |
| Marketplace | Settlement | fee Exchange / UNFILLED |
| Payment | Booking/Finance | stati pagamento |
| Partner | Marketplace | eligibility |
| Identity | Tutti | soggetto autenticato/autorizzato |

Downstream non forza cambi sul modello upstream senza ADR.

---

## 13. Context Mapping (sintesi)

- **Partnership** (collaborazione stretta): Booking ↔ Dispatch ↔ Fleet
- **Customer/Supplier**: Pricing → Booking; Booking → Settlement; Marketplace → Settlement
- **OHS**: Identity, Configuration, Notification
- **ACL**: Integration → Payment/Notification/Finance
- **Conformist**: Analytics
- **Shared Kernel**: ID + Money + AssignmentMode

---

## 14. Event Driven Communication

Fatti di business → **Domain Events** nel context owner → pubblicazione → consumatori aggiornano il **proprio** modello.

Vietato: chiamate che scrivono tabelle/aggregate altrui “in process” senza passare dal servizio pubblico owner.

---

## 15. Command Responsibility

I **Commands** sono accettati **solo** dal dominio che possiede l’aggregate target (`ConfirmBooking`, `AcceptOffer`, `ApplyHoldback`, `GrantRole`).

UI/API gateway inviano comandi all’application service del context corretto.

---

## 16. Write Model Responsibility

Ogni context possiede il proprio Write Model. Invarianti e state machine vivono lì (es. Booking SM in Booking Domain — MC-OS-014).

---

## 17. Read Model Responsibility

Read Model / proiezioni CX, Dispatcher board, Analytics KPI possono essere denormalizzati e eventual-consistent, **senza** diventare SoT di scrittura.

---

## 18. Domain Events

Eventi ubiqui nel linguaggio del context (es. `booking_confirmed`, `assignment_accepted`). SoT semantica: dominio produttore + Glossario.

---

## 19. Integration Events

Eventi stabili cross-context o verso esterni (payload ridotto, versionati). Possono essere proiezione di Domain Events.

---

## 20. Internal Events

Eventi privati al context (non pubblicati). Usati per consistency interna / process managers locali.

---

## 21. Motori logici (Engines)

| Engine | Dominio primario | Responsabilità | Non fa |
|--------|------------------|----------------|--------|
| **Pricing Engine** | Pricing | Quote, surcharge, budget, margin simulation | Mutare Trip; postare Settlement |
| **Matching Engine** | Marketplace (+ Dispatch input) | Candidate Partner/Fleet match | Accettare Offer al posto del Partner |
| **Dispatch Engine** | Dispatch | Priorità coda, escalation, suggerimento assign | Riscrivere Pricing Rules |
| **Settlement Engine** | Settlement | Line item, holdback, payout prep | Capturare carte Payment |
| **Notification Engine** | Notification | Template, routing, retry/fallback | Cambiare stato Booking |
| **Configuration Engine** | Configuration | Flag/parametri versionati | Custodire secrets PSP |
| **Risk Engine** | Compliance (+ AI hints) | Risk scoring signals | Auto-ban senza policy |
| **Fraud Engine** | Payment/Compliance | Pattern fraud signals | Refund arbitrario |
| **Exchange Engine** | Marketplace | Listing lifecycle, disclosure, UNFILLED | Mostrare Customer Price a Executing by default |
| **AI Engine** | AI | Suggestion/recommendation | Bypass guardrail / auto-mutation stati |

---

## 22. Regole di comunicazione tra domini

1. **No direct state mutation** cross-domain.
2. **Commands** → solo owner.
3. **Events** → fatti immutabili (append semantico).
4. **Queries** → via OHS / read model autorizzato.
5. **Synchronous calls** ammesse solo verso servizi pubblici (es. Pricing quote) senza side-effect nascosti su altri aggregate.
6. **Orchestration** di processi lunghi: process manager/saga nel dominio coordinatore (tipicamente Booking/Dispatch/Settlement), non “god service” globale.
7. **PII**: disclosure secondo Identity + Marketplace Progressive Disclosure.
8. **Economics**: Partner Cost XOR Internal Execution Cost sempre rispettato nei segnali.

---

## 23. Domain Interaction Matrix

Legenda: **C** = Command/sync pubblico · **E** = Event consume · **Q** = Query/read · **—** = no dipendenza diretta

Righe = consumatore / chiamante; colonne = fornitore (estratto core).

| Da \ A | Identity | Booking | Marketplace | Partner | Pricing | Settlement | Payment | Notification |
|---------|----------|---------|-------------|---------|---------|------------|---------|--------------|
| Identity | ■ | — | — | Q | — | — | — | E |
| Booking | Q/C | ■ | C/E | Q | C/Q | E | E | E |
| Marketplace | Q | E/C | ■ | Q | Q | E | — | E |
| Partner | Q/C | E | E | ■ | — | E | — | E |
| Dispatch | Q | C/E | C | Q | Q | — | — | E |
| Pricing | Q | E | E | — | ■ | — | — | E |
| Settlement | Q | E | E | E | Q | ■ | E | E |
| Payment | Q | E | — | — | — | E | ■ | E |
| Notification | Q | E | E | E | E | E | E | ■ |
| Finance | Q | E | E | — | E | E | E | E |
| Analytics | Q | E | E | E | E | E | E | E |

■ = interno al dominio.

---

## 24. Domain Dependency Matrix

Dipendenze di modello **consentite** (direzione “dipende da” = freccia concettuale runtime/contratto):

| Dominio | Dipende da (consentito) |
|---------|-------------------------|
| Booking | Identity, Pricing, Payment, Fleet, Marketplace, Partner, Notification, Configuration |
| Marketplace | Identity, Partner, Booking, Pricing, Notification, Configuration |
| Dispatch | Booking, Fleet, Identity, Marketplace, Notification, Configuration |
| Settlement | Booking, Marketplace, Partner, Finance, Payment, Document, Configuration |
| Pricing | Identity, Configuration, (FX via Integration) |
| Payment | Identity, Integration(ACL), Configuration, Notification |
| Notification | Identity, Configuration |
| Analytics | (eventi di tutti — conformist) |
| AI | Identity, Configuration; legge eventi/support signals |
| Administration | Identity, Compliance, Configuration |

Dipendenze **vietate** tipiche: Analytics→write operativi; AI→auto-mutation; Integration→bypass ACL; Settlement→edit Quote rules; Marketplace→full Customer PII pre-accept.

---

## 25. Ownership Matrix

| Aggregate / concetto | Owner Domain |
|----------------------|--------------|
| User / Membership / Role | Identity |
| CustomerProfile / Preference | Customer |
| Booking / Service / Trip / Assignment | Booking |
| ExchangeListing / Offer | Marketplace |
| PartnerCompany / PartnerScore | Partner |
| DispatchQueueItem / ExceptionCase | Dispatch |
| Vehicle / DriverProfile | Fleet |
| Quote / PricingProfile / AssignmentBudget | Pricing |
| RevenueComponent / InvoiceSignal | Finance |
| Settlement / Holdback / PayoutInstruction | Settlement |
| Payment / Refund | Payment |
| NotificationTemplate / DeliveryAttempt | Notification |
| SupportTicket | Support |
| ComplianceCase / PrivacyRequest | Compliance |
| ConfigurationSet / FeatureFlag | Configuration |
| AnalyticsSnapshot | Analytics |
| AiSuggestion | AI |
| DocumentArtifact / Evidence | Document |
| MediaAsset | Media |
| ExternalSystemBinding | Integration |
| BreakGlassSession | Administration |

---

## 26. Business Capability Matrix

| Capability | Domini coinvolti | Note |
|------------|------------------|------|
| Book & confirm | Customer, Booking, Pricing, Payment, Notification | Core funnel |
| Assign INTERNAL/PARTNER | Booking, Dispatch, Fleet, Partner, Pricing | XOR costi |
| Partner Exchange fill | Marketplace, Partner, Booking, Pricing, Settlement | MC-OS-012 |
| Execute Trip | Booking, Fleet, Dispatch, Notification, Document | Ops |
| Settle & payout | Settlement, Finance, Payment, Partner | SFOF |
| Identity & access | Identity, Administration, Compliance | MC-OS-015 |
| Customer care | Support, Customer, Booking, Notification | CX |
| Observe & improve | Analytics, AI, Configuration | Non SoT write |

---

## 27. Decisioni approvate

| ID | Decisione |
|----|-----------|
| SDA-DA-01 | 21 Bounded Context minimi con ownership esclusivo aggregate |
| SDA-DA-02 | Nessuna mutazione diretta cross-domain |
| SDA-DA-03 | Commands solo sull’owner; Events per fatti |
| SDA-DA-04 | Write Model privato / Read Model condividibile |
| SDA-DA-05 | Shared Kernel minimo (ID, Money, AssignmentMode) |
| SDA-DA-06 | ACL obbligatorio verso sistemi esterni |
| SDA-DA-07 | Core vs Supporting vs Generic come da §6 |
| SDA-DA-08 | Engines sono responsabilità logiche, non licenza a bypassare domini |
| SDA-DA-09 | Allineamento BOS: CM, XOR costi, no double-count |
| SDA-DA-10 | Booking≠Service≠Trip≠Assignment restano nel Booking Domain ma come aggregate distinti |

---

## 28. Decisioni OPEN

| Tema | Note |
|------|------|
| Modular monolith vs multi-service fisico | ADR futuro (MC-OS-010) |
| Bus eventi / outbox technology | Non in scope |
| Boundary esatta Finance vs Settlement | Raffinare con Finance ops |
| Risk vs Fraud ownership fine | Possibile split successivo |
| AI autonoma su recovery | Vietata di default; policy futura |
| Provider Payment/Notification | DECISIONS #1 #8 |
| MoR / tax | BOS OPEN |

---

## 29. Roadmap evolutiva

1. **Foundation** — Identity, Configuration, Booking, Pricing, Notification
2. **Ops** — Fleet, Dispatch, Partner
3. **Money** — Payment, Finance, Settlement
4. **Exchange** — Marketplace + Exchange Engine
5. **Hardening** — Compliance, Support, Document, Administration
6. **Intelligence** — Analytics, AI, Risk/Fraud signals

Allineare fasi a PLATFORM_MAP senza anticipare implementazione.

---

## 30. Coerenza con framework esistenti

| Framework | Relazione |
|-----------|-----------|
| MC-OS-011 Entity Model | Entità canoniche; ownership qui le assegna ai context |
| MC-OS-014 Booking Lifecycle | State machine dentro Booking Domain |
| MC-OS-012 Exchange | Comportamento Marketplace Domain |
| MC-OS-015 Identity | Identity Domain |
| MC-OS-016 Notification | Notification Domain |
| MC-OS-017 Pricing | Pricing Domain |
| MC-OS-006 SFOF | Settlement (+ Finance signals) |
| MC-OS-018 CX | Customer + Support journey projections |
| MC-OS-013 Diagrams | Diagrammi futuri dovranno riflettere questi context |

---

## Cronologia revisioni

| Versione | Data | Autore | Descrizione modifica | Stato |
|----------|------|--------|----------------------|-------|
| 0.1.0 | 2026-07-26 | MyChauffeur OS Team | Prima stesura System Domain Architecture (21 Bounded Context, mapping, engines, matrici). | Draft |

---

*Fine MC-OS-019 v0.1.0 — Draft.*

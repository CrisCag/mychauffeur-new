# MyChauffeur OS — Data Architecture Framework

| Campo | Valore |
|-------|--------|
| **Codice documento** | MC-OS-027 |
| **Titolo** | Data Architecture Framework |
| **Versione** | 0.1.0 |
| **Stato** | Draft |
| **Data creazione** | 2026-07-26 |
| **Ultima modifica** | 2026-07-26 |
| **Owner** | Data Architecture & Platform Engineering |
| **Autori** | MyChauffeur OS Team |
| **Documenti correlati** | MC-OS-000 · MC-OS-001 · MC-OS-009 · MC-OS-011 · MC-OS-019 · MC-OS-020 · MC-OS-021 · MC-OS-026 · MC-OS-025 · MC-OS-014 · MC-OS-015 · MC-OS-006 · MC-OS-012 · PLATFORM_MAP · HANDOFF |
| **Dipendenze** | Baseline B001 (MC-OS-025); Business Entity Model (MC-OS-011); System Domain Architecture (MC-OS-019); Software Architecture Framework (MC-OS-026); System Event Catalog (MC-OS-020) |
| **Classificazione** | Official Data Architecture Framework — Draft |
| **Baseline di riferimento** | **B001** (MC-OS-025) |
| **Documentation Release** | 0.1 (allineamento previsto) |

---

## Avvertenza

Questo documento è la **Source of Truth della Data Architecture** di MyChauffeur OS.

**Non** contiene: SQL eseguibile, migration, schema fiscale definitivo, policy RLS eseguibili, scelta ORM, provider DB alternativo, Draw.io, PDF.

I nomi di Entity, Table, Aggregate, Schema, Column, Constraint, Index, Event, Policy, Projection restano in **inglese**. Il testo normativo è in **italiano**.

**Scelta tecnica raccomandata iniziale (Candidate Technical Decision):** PostgreSQL/Supabase; shared database; shared schema (o logicamente condiviso); isolamento tenant via `tenant_id` / `organization_id`; ownership logica per Module; nessuna scrittura cross-domain diretta; migrations versionate; transazioni locali al Modular Monolith. RLS da progettare nel Security Framework (ADR-OPEN-017 resta OPEN).

---

## Source of Truth

**MC-OS-027** governa modello dati concettuale/logico, ownership, tenancy dati, money/temporal/versioning, immutability, migration readiness.

- Entità di business → MC-OS-011
- Bounded Context → MC-OS-019
- Software Modules / layering → MC-OS-026
- Eventi → MC-OS-020
- Configuration → MC-OS-021
- Freeze → MC-OS-025 (B001)

---

## 1. Scopo

Tradurre Business Entity Model, Bounded Context, Software Modules, Event Catalog, Configuration, Audit, multi-tenancy, privacy e financial integrity in un modello dati **concettuale e logico**, implementabile successivamente su PostgreSQL/Supabase: tenant-safe, auditable, versionable, migration-ready, compatibile con Modular Monolith, separato per ownership di dominio, adatto all’OS Foundation ed estendibile a Marketplace, Finance e International.

## 2. Relazione con B001 e MC-OS-026

B001 congela comportamento funzionale e ADR Active. MC-OS-026 definisce Modular Monolith, Module ownership e Port/Repository. MC-OS-027 definisce **come i dati sono possessati, modellati e evoluti** senza violare B001: Domain-owned data; no cross-module direct writes; Projection ≠ SoT; AI/Analytics non write SoT; Payment ≠ Settlement ≠ Payout; Booking ≠ Service ≠ Trip ≠ Assignment.

## 3. Data Architecture Drivers

| Driver | Impatto dati |
|--------|-------------|
| Multi-tenant / Organization | `tenant_id`, `organization_id`, scope matrices |
| B2C / B2B / Corporate / Agency | Customer subtypes; commercial accounts |
| Partner Exchange | Listing/Offer; Progressive Disclosure tables |
| Financial integrity | Ledger/Wallet append-only; reversal |
| Auditability | AuditLog ≠ technical log ≠ Ledger |
| Configurabilità | ConfigurationVersion / FeatureFlagVersion |
| Privacy / Disclosure | PII classes; DataReleasePolicy |
| Modular Monolith | Shared DB + logical ownership |
| MVP operability | No sharding; no DB-per-tenant default |
| International | Currency, timezone, country reference |
| Migration from JSON | Strangler persistence; dual-write readiness |

## 4. Data Quality Attributes

Accuracy, Completeness, Consistency, Timeliness, Uniqueness, Integrity, Confidentiality, Traceability, Recoverability, Migratability. Priorità Foundation: Integrity, Tenant isolation, Auditability, Migratability.

## 5. Data Ownership Principles

- **Domain-owned data**: ogni Entity ha un Module owner di scrittura.
- **Shared database, separated ownership**: un DB condiviso; scritture solo dall’owner.
- **No cross-module direct writes**: altri Module leggono via contract/projection o reagiscono a eventi.
- **FK strategy esplicita**: FK ammesse entro confini chiari; cross-context preferire ID reference + enforcement applicativo dove l’accoppiamento fisico è dannoso (dettaglio OPEN per categoria).
- Tenant/Organization scoping by design.
- Immutable financial & audit history; soft delete solo dove giustificato.
- Projection tables ≠ Source of Truth.
- Avoid EAV for core domain; avoid premature sharding / DB-per-tenant.

## 6. Domain-to-Data Ownership Map

| Domain / BC (MC-OS-019) | Module owner (MC-OS-026) | Entità principali |
|-------------------------|--------------------------|-------------------|
| Identity | identity | Tenant, Person, User, Membership, Role, Permission |
| Customer | customers | Customer, ConsumerProfile, Corporate/Agency, ratings |
| Booking | bookings / operations | Booking, BookingRequest, Service, Stop, Route, Location |
| Dispatch | dispatch | Assignment, AssignmentAttempt, Offer |
| Fleet | fleet | Driver, Vehicle, Fleet, Availability |
| Partner | partners | PartnerCompany, PartnerProfile, Score |
| Marketplace | marketplace | ExchangeListing/Offer/Assignment, ServiceOrder (shared logical) |
| Pricing | pricing | PricingProfile/Rule, QuoteVersion, PriceSnapshot |
| Payment | payments | Payment, Attempt, Refund, Chargeback |
| Settlement / Finance | settlement / finance | Settlement, Payout, Ledger, Wallet, Invoice |
| Notification | notifications | Notification*, Template |
| Support / Compliance | support / compliance | SupportCase, Dispute, Risk, Fraud |
| Configuration | configuration | Configuration*, FeatureFlag* |
| Document / Media | documents / media | Document*, MediaAsset |
| AI | ai | AIRecommendation, HumanReview link |
| Analytics | analytics | Read projections only |
| Administration | administration | AuditLog platform; cross-tenant admin |
| Reference | platform/shared | Country…POI |

## 7. Conceptual Data Model

Vista indipendente dalla tecnologia: Aggregate Roots (Booking, Service, Assignment, Payment, Ledger…), Entity e Value Object (Money, Location), relazioni 1:N / N:M via membership, invarianti XOR e versioning. Allineato a MC-OS-011 senza duplicarne le schede narrative.

## 8. Logical Data Model

Tabelle logiche candidate, colonne comuni, chiavi, vincoli, indici candidati, classificazione PII/retention. Naming e PK style restano parzialmente OPEN. Nessun SQL eseguibile in questo documento.

## 9. Physical Data Model Boundary

Il **modello fisico definitivo** (tipi PostgreSQL, partitioning, tablespace, RLS statements, exact indexes) sarà definito nelle **migration** successive e nel Security Framework per RLS. Questo framework fissa confini e requisiti, non DDL.

## 10. Database Platform Candidate

**PostgreSQL / Supabase** come platform di persistenza iniziale (**CTD**). Non chiude ADR su dettagli Auth/RLS/Storage. Nessun provider DB alternativo selezionato qui.

## 11. Shared Database Strategy

Un database condiviso per il Modular Monolith MVP. Isolamento logico per tenant/organization e ownership di Module. **Database-per-tenant** non è default MVP (resta OPEN per futuro se giustificato).

## 12. Schema Strategy

Candidate: **shared schema** (o schema logicamente condiviso) con prefissi/moduli chiari. Schema-per-domain è **OPEN**. Evitare proliferazione prematura di schema PostgreSQL senza ownership chiara.

## 13. Multi-tenancy Model

Ogni riga operativa rilevante porta `tenant_id` e, dove applicabile, `organization_id`. Reference data globale senza tenant. Platform administration cross-tenant solo tramite servizi privilegiati espliciti. RLS è **complementare** (OPEN design), non sostituto di Application Authorization (MC-OS-015/026).

## 14. Tenant

| Attributo | Valore |
|-----------|--------|
| Domain owner | Identity / Administration |
| Aggregate relationship | Tenant Aggregate Root |
| Identity | tenant_id (UUID/ULID candidate) |
| Tenant scope | N/A (is Tenant) |
| Organization scope | 1:N Organization |
| Lifecycle | provisioned → active → suspended → retired |
| Mutability | Mutable metadata; identity immutable |
| Retention class | OPERATIONAL_LONG |
| PII classification | INTERNAL |
| Audit requirement | Business + Security |
| Key relationships | 1:N Organization; reference data scoping |
| Candidate indexes | (status), (slug unique candidate) |
| Soft-delete eligibility | No hard delete; soft/suspend preferred |
| Source of Truth | Identity Module write; canonical tenant registry |

## 15. Organization

| Attributo | Valore |
|-----------|--------|
| Domain owner | Identity / Organizations |
| Aggregate relationship | Organization Aggregate Root |
| Identity | organization_id |
| Tenant scope | Required tenant_id |
| Organization scope | Self |
| Lifecycle | created → active → suspended → closed |
| Mutability | Mutable profile; identity immutable |
| Retention class | OPERATIONAL_LONG |
| PII classification | CONFIDENTIAL (legal name, VAT candidate) |
| Audit requirement | Business |
| Key relationships | N:1 Tenant; 1:N Membership; 1:N Booking (as operator) |
| Candidate indexes | (tenant_id, status), (tenant_id, slug) |
| Soft-delete eligibility | Soft suspend; hard delete only approved workflow |
| Source of Truth | Organizations Module |

## 16. Person

| Attributo | Valore |
|-----------|--------|
| Domain owner | Identity |
| Aggregate relationship | Person Aggregate Root |
| Identity | person_id |
| Tenant scope | Optional / platform-global candidate |
| Organization scope | Via Membership |
| Lifecycle | created → active → anonymized → retired |
| Mutability | Mutable PII; identity immutable |
| Retention class | PRIVACY_CONTROLLED |
| PII classification | SENSITIVE_PII |
| Audit requirement | Business + Data Access |
| Key relationships | 1:N User; N:M Organization via Membership |
| Candidate indexes | (email hash candidate), (status) |
| Soft-delete eligibility | Anonymizable; soft delete eligible |
| Source of Truth | Identity Module |

## 17. User

| Attributo | Valore |
|-----------|--------|
| Domain owner | Identity |
| Aggregate relationship | User under Person / UserIdentity candidate |
| Identity | user_id |
| Tenant scope | Via memberships |
| Organization scope | Via Membership |
| Lifecycle | invited → active → locked → disabled |
| Mutability | Mutable credentials refs; identity immutable |
| Retention class | SECURITY_LONG |
| PII classification | PII (login identifiers) |
| Audit requirement | Security |
| Key relationships | N:1 Person; N:M Organization; auth provider subject OPEN |
| Candidate indexes | (auth_subject unique), (status) |
| Soft-delete eligibility | Disable preferred over delete |
| Source of Truth | Identity Module (Auth adapter maps, does not replace) |

## 18. OrganizationMembership

| Attributo | Valore |
|-----------|--------|
| Domain owner | Identity |
| Aggregate relationship | Part of Organization Aggregate |
| Identity | membership_id |
| Tenant scope | Inherited |
| Organization scope | Required organization_id |
| Lifecycle | invited → active → revoked |
| Mutability | Mutable role set; identity immutable |
| Retention class | SECURITY_LONG |
| PII classification | INTERNAL |
| Audit requirement | Security |
| Key relationships | User N:M Organization; Role assignments |
| Candidate indexes | (organization_id, user_id unique), (tenant_id, user_id) |
| Soft-delete eligibility | Revoke; retain history |
| Source of Truth | Identity Module |

## 19. Role

| Attributo | Valore |
|-----------|--------|
| Domain owner | Identity |
| Aggregate relationship | Authorization catalog |
| Identity | role_id |
| Tenant scope | Tenant or platform scoped |
| Organization scope | Optional org-custom roles |
| Lifecycle | defined → active → deprecated |
| Mutability | Mutable permission set via versions preferred |
| Retention class | OPERATIONAL_LONG |
| PII classification | INTERNAL |
| Audit requirement | Security |
| Key relationships | N:M Permission; Membership bindings |
| Candidate indexes | (tenant_id, code unique) |
| Soft-delete eligibility | Deprecate not delete if referenced |
| Source of Truth | Identity Module |

## 20. Permission

| Attributo | Valore |
|-----------|--------|
| Domain owner | Identity |
| Aggregate relationship | Capability catalog |
| Identity | permission_id / code |
| Tenant scope | Usually platform-global |
| Organization scope | N/A |
| Lifecycle | defined → active → deprecated |
| Mutability | Low; prefer append capabilities |
| Retention class | OPERATIONAL_LONG |
| PII classification | PUBLIC/INTERNAL |
| Audit requirement | Security |
| Key relationships | N:M Role |
| Candidate indexes | (code unique) |
| Soft-delete eligibility | No |
| Source of Truth | Identity Module |

## 21. Customer

| Attributo | Valore |
|-----------|--------|
| Domain owner | Customer |
| Aggregate relationship | Customer Aggregate Root |
| Identity | customer_id |
| Tenant scope | Required |
| Organization scope | Owning organization |
| Lifecycle | prospect → active → blocked → anonymized |
| Mutability | Mutable profile |
| Retention class | PRIVACY_CONTROLLED |
| PII classification | PII / SENSITIVE_PII |
| Audit requirement | Business + Data Access |
| Key relationships | 1:N Booking; 0:1 CorporateAccount; ConsumerProfile |
| Candidate indexes | (tenant_id, organization_id), (tenant_id, external_ref) |
| Soft-delete eligibility | Anonymizable / soft |
| Source of Truth | Customers Module |

## 22. ConsumerProfile

| Attributo | Valore |
|-----------|--------|
| Domain owner | Customer |
| Aggregate relationship | Under Customer |
| Identity | consumer_profile_id |
| Tenant scope | Required |
| Organization scope | Required |
| Lifecycle | created → active → closed |
| Mutability | Mutable preferences |
| Retention class | PRIVACY_CONTROLLED |
| PII classification | PII |
| Audit requirement | Business |
| Key relationships | 1:1 or 1:N Customer |
| Candidate indexes | (customer_id) |
| Soft-delete eligibility | Yes with Customer |
| Source of Truth | Customers Module |

## 23. CorporateAccount

| Attributo | Valore |
|-----------|--------|
| Domain owner | Customer / B2B |
| Aggregate relationship | CorporateAccount Aggregate |
| Identity | corporate_account_id |
| Tenant scope | Required |
| Organization scope | Required |
| Lifecycle | onboarded → active → suspended |
| Mutability | Mutable commercial terms refs |
| Retention class | OPERATIONAL_LONG |
| PII classification | CONFIDENTIAL |
| Audit requirement | Business |
| Key relationships | 1:N Customer users; N Booking |
| Candidate indexes | (tenant_id, code) |
| Soft-delete eligibility | Suspend preferred |
| Source of Truth | Customers Module |

## 24. AgencyAccount

| Attributo | Valore |
|-----------|--------|
| Domain owner | Customer / B2B |
| Aggregate relationship | AgencyAccount Aggregate |
| Identity | agency_account_id |
| Tenant scope | Required |
| Organization scope | Required |
| Lifecycle | onboarded → active → suspended |
| Mutability | Mutable |
| Retention class | OPERATIONAL_LONG |
| PII classification | CONFIDENTIAL |
| Audit requirement | Business |
| Key relationships | Booking channel; net rate OPEN |
| Candidate indexes | (tenant_id, code) |
| Soft-delete eligibility | Suspend preferred |
| Source of Truth | Customers Module |

## 25. Booker

| Attributo | Valore |
|-----------|--------|
| Domain owner | Customer / Booking |
| Aggregate relationship | Role on Booking / Customer |
| Identity | booker_id or role on Booking |
| Tenant scope | Required |
| Organization scope | Required |
| Lifecycle | per Booking / standing profile |
| Mutability | Mutable contact |
| Retention class | PRIVACY_CONTROLLED |
| PII classification | PII |
| Audit requirement | Business |
| Key relationships | Booking; Passenger may differ |
| Candidate indexes | (booking_id), (customer_id) |
| Soft-delete eligibility | With Booking/Customer policy |
| Source of Truth | Customers / Bookings Module |

## 26. Passenger

| Attributo | Valore |
|-----------|--------|
| Domain owner | Customer / Booking |
| Aggregate relationship | Booking / Service passenger set |
| Identity | passenger_id |
| Tenant scope | Required |
| Organization scope | Required |
| Lifecycle | attached → traveled → anonymized |
| Mutability | Mutable until service lock |
| Retention class | PRIVACY_CONTROLLED |
| PII classification | SENSITIVE_PII (name, phone, flight) |
| Audit requirement | Business + Disclosure |
| Key relationships | Booking/Service; Progressive Disclosure |
| Candidate indexes | (booking_id), (service_id) |
| Soft-delete eligibility | Anonymizable |
| Source of Truth | Bookings Module (disclosure-gated) |

## 27. PartnerCompany

| Attributo | Valore |
|-----------|--------|
| Domain owner | Partner |
| Aggregate relationship | PartnerCompany Aggregate Root |
| Identity | partner_company_id |
| Tenant scope | Platform/marketplace + org links |
| Organization scope | May map to Organization |
| Lifecycle | applied → approved → active → suspended → terminated |
| Mutability | Mutable compliance docs refs |
| Retention class | LEGAL_LONG |
| PII classification | CONFIDENTIAL / LEGAL_EVIDENCE |
| Audit requirement | Business + Legal |
| Key relationships | 1:N Driver; 1:N Vehicle; Assignments; Payouts |
| Candidate indexes | (status), (tenant_id, vat candidate) |
| Soft-delete eligibility | Terminate; retain legal |
| Source of Truth | Partners Module |

## 28. PartnerProfile

| Attributo | Valore |
|-----------|--------|
| Domain owner | Partner |
| Aggregate relationship | Under PartnerCompany |
| Identity | partner_profile_id |
| Tenant scope | As PartnerCompany |
| Organization scope | As PartnerCompany |
| Lifecycle | active profile versions |
| Mutability | Versioned preferred |
| Retention class | OPERATIONAL_LONG |
| PII classification | INTERNAL |
| Audit requirement | Business |
| Key relationships | PartnerCompany; Score; Coverage |
| Candidate indexes | (partner_company_id) |
| Soft-delete eligibility | Version supersede |
| Source of Truth | Partners Module |

## 29. Driver

| Attributo | Valore |
|-----------|--------|
| Domain owner | Fleet |
| Aggregate relationship | Driver Aggregate Root |
| Identity | driver_id |
| Tenant scope | Required for internal; partner-scoped for partner drivers |
| Organization scope | Owning org or PartnerCompany |
| Lifecycle | onboarded → active → suspended → retired |
| Mutability | Mutable operational attrs |
| Retention class | OPERATIONAL_LONG / LEGAL docs |
| PII classification | SENSITIVE_PII |
| Audit requirement | Business + Compliance |
| Key relationships | Person link; Vehicle; Assignment; Availability |
| Candidate indexes | (tenant_id, status), (partner_company_id, status) |
| Soft-delete eligibility | Suspend preferred |
| Source of Truth | Fleet Module |

## 30. DriverProfile

| Attributo | Valore |
|-----------|--------|
| Domain owner | Fleet |
| Aggregate relationship | Under Driver |
| Identity | driver_profile_id |
| Tenant scope | Inherited |
| Organization scope | Inherited |
| Lifecycle | versioned profile |
| Mutability | Mutable / versioned |
| Retention class | OPERATIONAL |
| PII classification | PII |
| Audit requirement | Business |
| Key relationships | Driver |
| Candidate indexes | (driver_id) |
| Soft-delete eligibility | With Driver |
| Source of Truth | Fleet Module |

## 31. Fleet

| Attributo | Valore |
|-----------|--------|
| Domain owner | Fleet |
| Aggregate relationship | Fleet Aggregate |
| Identity | fleet_id |
| Tenant scope | Required |
| Organization scope | Required |
| Lifecycle | active → archived |
| Mutability | Mutable |
| Retention class | OPERATIONAL |
| PII classification | INTERNAL |
| Audit requirement | Business |
| Key relationships | 1:N Vehicle; Organization |
| Candidate indexes | (tenant_id, organization_id) |
| Soft-delete eligibility | Archive |
| Source of Truth | Fleet Module |

## 32. Vehicle

| Attributo | Valore |
|-----------|--------|
| Domain owner | Fleet |
| Aggregate relationship | Vehicle Aggregate Root |
| Identity | vehicle_id |
| Tenant scope | Required / partner-scoped |
| Organization scope | Org or PartnerCompany |
| Lifecycle | registered → active → maintenance → retired |
| Mutability | Mutable attributes |
| Retention class | OPERATIONAL_LONG |
| PII classification | INTERNAL (plate may be CONFIDENTIAL) |
| Audit requirement | Business + Compliance |
| Key relationships | VehicleCategory; Assignment; Trip |
| Candidate indexes | (tenant_id, status), (category_id), (plate unique scoped) |
| Soft-delete eligibility | Retire preferred |
| Source of Truth | Fleet Module |

## 33. VehicleCategory

| Attributo | Valore |
|-----------|--------|
| Domain owner | Fleet / Pricing reference |
| Aggregate relationship | Reference / catalog |
| Identity | vehicle_category_id |
| Tenant scope | Tenant or platform catalog |
| Organization scope | Optional override |
| Lifecycle | active → deprecated |
| Mutability | Low mutability |
| Retention class | REFERENCE |
| PII classification | PUBLIC/INTERNAL |
| Audit requirement | Low |
| Key relationships | PricingProfile; Vehicle; Quote |
| Candidate indexes | (code unique scoped) |
| Soft-delete eligibility | Deprecate |
| Source of Truth | Fleet/Configuration reference ownership |

## 34. VehicleAvailability

| Attributo | Valore |
|-----------|--------|
| Domain owner | Fleet / Dispatch |
| Aggregate relationship | Availability projection or Aggregate slice |
| Identity | vehicle_availability_id |
| Tenant scope | Required |
| Organization scope | Required |
| Lifecycle | slot windows |
| Mutability | Highly mutable; or event-sourced readiness OPEN |
| Retention class | SHORT_OPERATIONAL |
| PII classification | INTERNAL |
| Audit requirement | Operational |
| Key relationships | Vehicle; Assignment conflicts |
| Candidate indexes | (vehicle_id, window), (tenant_id, from, to) |
| Soft-delete eligibility | Yes / expire |
| Source of Truth | Fleet/Dispatch Module |

## 35. DriverAvailability

| Attributo | Valore |
|-----------|--------|
| Domain owner | Fleet / Dispatch |
| Aggregate relationship | Availability slice |
| Identity | driver_availability_id |
| Tenant scope | Required |
| Organization scope | Required |
| Lifecycle | slot windows |
| Mutability | Highly mutable |
| Retention class | SHORT_OPERATIONAL |
| PII classification | INTERNAL |
| Audit requirement | Operational |
| Key relationships | Driver |
| Candidate indexes | (driver_id, window) |
| Soft-delete eligibility | Yes / expire |
| Source of Truth | Fleet/Dispatch Module |

## 36. Booking

| Attributo | Valore |
|-----------|--------|
| Domain owner | Booking |
| Aggregate relationship | Booking Aggregate Root |
| Identity | booking_id + human-readable reference |
| Tenant scope | Required |
| Organization scope | Required (operator) |
| Lifecycle | draft → quoted → confirmed → in_service → completed / cancelled |
| Mutability | Mutable until locked phases; identity immutable |
| Retention class | OPERATIONAL_LONG / FINANCIAL_LINK |
| PII classification | CONFIDENTIAL + linked PII |
| Audit requirement | Business high |
| Key relationships | 1:N Service; 1:N Payment; Quote; Customer; Dispute |
| Candidate indexes | (tenant_id, reference unique), (tenant_id, status, service_date), (customer_id) |
| Soft-delete eligibility | Cancel state preferred; soft hide only if justified |
| Source of Truth | Bookings Module — **≠ Service ≠ Trip ≠ Assignment** |

## 37. BookingRequest

| Attributo | Valore |
|-----------|--------|
| Domain owner | Booking |
| Aggregate relationship | Intake before Booking Aggregate or early Booking |
| Identity | booking_request_id |
| Tenant scope | Required |
| Organization scope | Required |
| Lifecycle | received → converted → rejected → expired |
| Mutability | Mutable until conversion |
| Retention class | OPERATIONAL |
| PII classification | PII |
| Audit requirement | Business |
| Key relationships | → Booking on conversion |
| Candidate indexes | (tenant_id, status, created_at) |
| Soft-delete eligibility | Yes after retention |
| Source of Truth | Bookings Module |

## 38. Quote

| Attributo | Valore |
|-----------|--------|
| Domain owner | Pricing / Booking |
| Aggregate relationship | Quote Aggregate |
| Identity | quote_id |
| Tenant scope | Required |
| Organization scope | Required |
| Lifecycle | draft → issued → accepted → expired → superseded |
| Mutability | Prefer versioning over in-place money overwrite |
| Retention class | FINANCIAL_EVIDENCE |
| PII classification | INTERNAL/CONFIDENTIAL |
| Audit requirement | Business + Financial |
| Key relationships | 1:N QuoteVersion; Booking; PriceSnapshot |
| Candidate indexes | (tenant_id, booking_id), (status, expires_at) |
| Soft-delete eligibility | No money wipe; supersede |
| Source of Truth | Pricing Module (amounts); Booking links |

## 39. QuoteVersion

| Attributo | Valore |
|-----------|--------|
| Domain owner | Pricing |
| Aggregate relationship | Under Quote |
| Identity | quote_version_id + version_no |
| Tenant scope | Inherited |
| Organization scope | Inherited |
| Lifecycle | immutable once issued |
| Mutability | **Immutable** after issue |
| Retention class | FINANCIAL_EVIDENCE |
| PII classification | INTERNAL |
| Audit requirement | Financial |
| Key relationships | Quote; PriceCalculation |
| Candidate indexes | (quote_id, version_no unique) |
| Soft-delete eligibility | No |
| Source of Truth | Pricing Module |

## 40. Service

| Attributo | Valore |
|-----------|--------|
| Domain owner | Booking / Operations |
| Aggregate relationship | Service Aggregate Root |
| Identity | service_id |
| Tenant scope | Required |
| Organization scope | Required |
| Lifecycle | planned → assigned → active → completed / failed / cancelled |
| Mutability | Mutable operational state |
| Retention class | OPERATIONAL_LONG |
| PII classification | CONFIDENTIAL |
| Audit requirement | Business high |
| Key relationships | N:1 Booking; 1:N AssignmentAttempt; 0..1 Active Assignment; Trip; Stops |
| Candidate indexes | (booking_id), (tenant_id, status, scheduled_at), (assignment_id) |
| Soft-delete eligibility | Cancel preferred |
| Source of Truth | Bookings/Operations — **≠ Booking ≠ Trip ≠ Assignment** |

## 41. Trip

| Attributo | Valore |
|-----------|--------|
| Domain owner | Operations |
| Aggregate relationship | Trip under Service / Trip Aggregate |
| Identity | trip_id |
| Tenant scope | Required |
| Organization scope | Required |
| Lifecycle | ready → en_route → onboard → completed |
| Mutability | Mutable telemetry refs |
| Retention class | OPERATIONAL |
| PII classification | INTERNAL + location trails (SENSITIVE) |
| Audit requirement | Operational |
| Key relationships | N:1 Service; Driver; Vehicle |
| Candidate indexes | (service_id), (tenant_id, status) |
| Soft-delete eligibility | No rewrite history; append events |
| Source of Truth | Operations Module — **≠ Service** |

## 42. Stop

| Attributo | Valore |
|-----------|--------|
| Domain owner | Booking / Operations |
| Aggregate relationship | Under Service/Booking itinerary |
| Identity | stop_id |
| Tenant scope | Inherited |
| Organization scope | Inherited |
| Lifecycle | planned → arrived → completed → skipped |
| Mutability | Mutable until locked |
| Retention class | OPERATIONAL |
| PII classification | Location may be PII context |
| Audit requirement | Operational |
| Key relationships | Service; Location; Sequence |
| Candidate indexes | (service_id, sequence) |
| Soft-delete eligibility | Soft hide rare |
| Source of Truth | Bookings/Operations |

## 43. Route

| Attributo | Valore |
|-----------|--------|
| Domain owner | Booking / Operations |
| Aggregate relationship | Route template or instance |
| Identity | route_id |
| Tenant scope | Tenant or platform |
| Organization scope | Optional |
| Lifecycle | template/active |
| Mutability | Mutable templates; snapshot on Booking |
| Retention class | REFERENCE / OPERATIONAL |
| PII classification | INTERNAL |
| Audit requirement | Low |
| Key relationships | Stops; Location endpoints |
| Candidate indexes | (tenant_id, code) |
| Soft-delete eligibility | Deprecate templates |
| Source of Truth | Bookings/Operations |

## 44. Location

| Attributo | Valore |
|-----------|--------|
| Domain owner | Booking / Reference |
| Aggregate relationship | Value Object persisted or Location Entity |
| Identity | location_id |
| Tenant scope | Tenant or shared ref |
| Organization scope | Optional |
| Lifecycle | created → verified → deprecated |
| Mutability | Mutable normalized address |
| Retention class | OPERATIONAL |
| PII classification | May be PII if residential |
| Audit requirement | As linked entity |
| Key relationships | Stop; Airport; POI; geocoding provider id |
| Candidate indexes | (tenant_id, place_hash), geo candidates OPEN |
| Soft-delete eligibility | Yes if unused |
| Source of Truth | Bookings / Integrations ACL |

## 45. Assignment

| Attributo | Valore |
|-----------|--------|
| Domain owner | Dispatch |
| Aggregate relationship | Assignment Aggregate Root |
| Identity | assignment_id |
| Tenant scope | Required |
| Organization scope | Required |
| Lifecycle | proposed → confirmed → in_progress → completed / cancelled |
| Mutability | Mutable status; XOR executor fixed at confirm |
| Retention class | OPERATIONAL_LONG / FINANCIAL_LINK |
| PII classification | INTERNAL |
| Audit requirement | Business high |
| Key relationships | N:1 Service; 0..1 Driver XOR PartnerCompany; Offer |
| Candidate indexes | (service_id unique active candidate), (tenant_id, status), (partner_company_id) |
| Soft-delete eligibility | Cancel; no dual executor |
| Source of Truth | Dispatch Module — **INTERNAL XOR PARTNER** |

## 46. AssignmentAttempt

| Attributo | Valore |
|-----------|--------|
| Domain owner | Dispatch |
| Aggregate relationship | Under Service/Assignment process |
| Identity | assignment_attempt_id |
| Tenant scope | Required |
| Organization scope | Required |
| Lifecycle | offered → accepted/rejected/expired/failed |
| Mutability | Mostly append outcomes |
| Retention class | OPERATIONAL |
| PII classification | INTERNAL |
| Audit requirement | Operational |
| Key relationships | Service; Offer; Partner/Driver candidates |
| Candidate indexes | (service_id, created_at), (status) |
| Soft-delete eligibility | No |
| Source of Truth | Dispatch Module |

## 47. Offer

| Attributo | Valore |
|-----------|--------|
| Domain owner | Dispatch / Marketplace |
| Aggregate relationship | Offer Aggregate |
| Identity | offer_id |
| Tenant scope | Required |
| Organization scope | Required |
| Lifecycle | sent → accepted/rejected/expired/countered |
| Mutability | Immutable terms once sent; counter creates new |
| Retention class | OPERATIONAL / COMMERCIAL |
| PII classification | INTERNAL |
| Audit requirement | Business |
| Key relationships | Service/Booking; Partner; CounterOffer; Assignment |
| Candidate indexes | (service_id, partner_company_id), (status, expires_at) |
| Soft-delete eligibility | No |
| Source of Truth | Dispatch/Marketplace Module |

## 48. CounterOffer

| Attributo | Valore |
|-----------|--------|
| Domain owner | Dispatch / Marketplace |
| Aggregate relationship | Under Offer negotiation |
| Identity | counter_offer_id |
| Tenant scope | Inherited |
| Organization scope | Inherited |
| Lifecycle | proposed → accepted/rejected/expired |
| Mutability | Immutable once proposed |
| Retention class | COMMERCIAL |
| PII classification | INTERNAL |
| Audit requirement | Business |
| Key relationships | Offer |
| Candidate indexes | (offer_id, version) |
| Soft-delete eligibility | No |
| Source of Truth | Marketplace/Dispatch |

## 49. ServiceOrder

| Attributo | Valore |
|-----------|--------|
| Domain owner | Booking / Partner Exchange |
| Aggregate relationship | ServiceOrder Aggregate (versioned) |
| Identity | service_order_id + version |
| Tenant scope | Required |
| Organization scope | Originating / Executing context |
| Lifecycle | draft → issued → accepted → amended → closed |
| Mutability | **Versioned**; amendments = new version |
| Retention class | LEGAL_EVIDENCE |
| PII classification | CONFIDENTIAL / LEGAL_EVIDENCE |
| Audit requirement | Business + Legal |
| Key relationships | Booking/Service; ExchangeAssignment; Document |
| Candidate indexes | (tenant_id, reference), (service_id, version) |
| Soft-delete eligibility | No overwrite; supersede version |
| Source of Truth | Bookings/Marketplace — versioned SoT |

## 50. ExchangeListing

| Attributo | Valore |
|-----------|--------|
| Domain owner | Marketplace |
| Aggregate relationship | ExchangeListing Aggregate |
| Identity | exchange_listing_id |
| Tenant scope | Marketplace scope |
| Organization scope | Originating Partner org |
| Lifecycle | draft → published → filled / withdrawn / expired / unfilled |
| Mutability | Mutable until accept; then lock + disclosure |
| Retention class | COMMERCIAL |
| PII classification | Progressive Disclosure gated |
| Audit requirement | Business + Access |
| Key relationships | 1:N ExchangeOffer; 0..1 ExchangeAssignment |
| Candidate indexes | (status, city, service_at), (originating_partner_id) |
| Soft-delete eligibility | Withdraw |
| Source of Truth | Marketplace Module |

## 51. ExchangeOffer

| Attributo | Valore |
|-----------|--------|
| Domain owner | Marketplace |
| Aggregate relationship | Under ExchangeListing |
| Identity | exchange_offer_id |
| Tenant scope | Marketplace |
| Organization scope | Executing Partner |
| Lifecycle | submitted → accepted/rejected/expired |
| Mutability | Immutable terms preferred |
| Retention class | COMMERCIAL |
| PII classification | INTERNAL |
| Audit requirement | Business |
| Key relationships | ExchangeListing; PartnerCompany |
| Candidate indexes | (listing_id, partner_id), (status) |
| Soft-delete eligibility | No |
| Source of Truth | Marketplace Module |

## 52. ExchangeAssignment

| Attributo | Valore |
|-----------|--------|
| Domain owner | Marketplace |
| Aggregate relationship | Links listing to execution Assignment |
| Identity | exchange_assignment_id |
| Tenant scope | Marketplace + service tenant |
| Organization scope | Executing + Originating |
| Lifecycle | created → active → completed |
| Mutability | Low after confirm |
| Retention class | OPERATIONAL_LONG |
| PII classification | INTERNAL |
| Audit requirement | Business |
| Key relationships | ExchangeListing 0..1; Assignment; ServiceOrder |
| Candidate indexes | (listing_id unique), (assignment_id) |
| Soft-delete eligibility | No |
| Source of Truth | Marketplace Module (links; Assignment remains Dispatch SoT) |

## 53. PricingProfile

| Attributo | Valore |
|-----------|--------|
| Domain owner | Pricing |
| Aggregate relationship | PricingProfile Aggregate |
| Identity | pricing_profile_id |
| Tenant scope | Required |
| Organization scope | Optional |
| Lifecycle | draft → active → deprecated |
| Mutability | Versioned rules preferred |
| Retention class | OPERATIONAL |
| PII classification | INTERNAL |
| Audit requirement | Business |
| Key relationships | 1:N PricingRule; VehicleCategory |
| Candidate indexes | (tenant_id, code, channel) |
| Soft-delete eligibility | Deprecate |
| Source of Truth | Pricing Module |

## 54. PricingRule

| Attributo | Valore |
|-----------|--------|
| Domain owner | Pricing |
| Aggregate relationship | Under PricingProfile |
| Identity | pricing_rule_id |
| Tenant scope | Inherited |
| Organization scope | Inherited |
| Lifecycle | effective_from/to windows |
| Mutability | Prefer new rule versions |
| Retention class | OPERATIONAL |
| PII classification | INTERNAL |
| Audit requirement | Business |
| Key relationships | PricingProfile; NCC components refs |
| Candidate indexes | (profile_id, effective_from) |
| Soft-delete eligibility | End-date |
| Source of Truth | Pricing Module |

## 55. PriceCalculation

| Attributo | Valore |
|-----------|--------|
| Domain owner | Pricing |
| Aggregate relationship | Calculation record under Quote |
| Identity | price_calculation_id |
| Tenant scope | Inherited |
| Organization scope | Inherited |
| Lifecycle | computed → snapshotted |
| Mutability | Immutable after snapshot |
| Retention class | FINANCIAL_EVIDENCE |
| PII classification | INTERNAL |
| Audit requirement | Financial |
| Key relationships | QuoteVersion; rule inputs snapshot |
| Candidate indexes | (quote_version_id) |
| Soft-delete eligibility | No |
| Source of Truth | Pricing Module |

## 56. PriceSnapshot

| Attributo | Valore |
|-----------|--------|
| Domain owner | Pricing |
| Aggregate relationship | Immutable commercial snapshot |
| Identity | price_snapshot_id |
| Tenant scope | Inherited |
| Organization scope | Inherited |
| Lifecycle | frozen at accept/confirm |
| Mutability | **Immutable** |
| Retention class | FINANCIAL_EVIDENCE |
| PII classification | INTERNAL/FINANCIAL |
| Audit requirement | Financial |
| Key relationships | Booking/Quote/ServiceOrder |
| Candidate indexes | (booking_id), (service_id) |
| Soft-delete eligibility | No |
| Source of Truth | Pricing Module |

## 57. ConfigurationDefinition

| Attributo | Valore |
|-----------|--------|
| Domain owner | Configuration |
| Aggregate relationship | ConfigurationDefinition Aggregate |
| Identity | configuration_key / definition_id |
| Tenant scope | Platform catalog |
| Organization scope | N/A |
| Lifecycle | defined → active → deprecated |
| Mutability | Metadata mutable; key stable |
| Retention class | OPERATIONAL_LONG |
| PII classification | INTERNAL |
| Audit requirement | Platform |
| Key relationships | 1:N ConfigurationVersion |
| Candidate indexes | (key unique) |
| Soft-delete eligibility | Deprecate |
| Source of Truth | Configuration Module — ≠ Secret ≠ Permission |

## 58. ConfigurationVersion

| Attributo | Valore |
|-----------|--------|
| Domain owner | Configuration |
| Aggregate relationship | Under Definition |
| Identity | configuration_version_id |
| Tenant scope | Scope in values |
| Organization scope | Scope in values |
| Lifecycle | draft → published → superseded |
| Mutability | Published immutable |
| Retention class | OPERATIONAL_LONG |
| PII classification | INTERNAL |
| Audit requirement | Platform |
| Key relationships | Definition; Values |
| Candidate indexes | (definition_id, version_no) |
| Soft-delete eligibility | No |
| Source of Truth | Configuration Module |

## 59. ConfigurationValue

| Attributo | Valore |
|-----------|--------|
| Domain owner | Configuration |
| Aggregate relationship | Scoped value rows |
| Identity | configuration_value_id |
| Tenant scope | Scope level (platform/tenant/org) |
| Organization scope | Optional |
| Lifecycle | effective windows |
| Mutability | Versioned overrides |
| Retention class | OPERATIONAL |
| PII classification | INTERNAL (no secrets) |
| Audit requirement | Platform |
| Key relationships | Version; Tenant; Organization |
| Candidate indexes | (key, tenant_id, organization_id, effective_from) |
| Soft-delete eligibility | End-date |
| Source of Truth | Configuration Module |

## 60. FeatureFlag

| Attributo | Valore |
|-----------|--------|
| Domain owner | Configuration |
| Aggregate relationship | FeatureFlag Aggregate |
| Identity | feature_flag_key |
| Tenant scope | Catalog |
| Organization scope | Override scopes |
| Lifecycle | defined → active → retired |
| Mutability | Mutable targeting via versions |
| Retention class | OPERATIONAL |
| PII classification | INTERNAL |
| Audit requirement | Platform |
| Key relationships | 1:N FeatureFlagVersion |
| Candidate indexes | (key unique) |
| Soft-delete eligibility | Retire |
| Source of Truth | Configuration Module — Flag ≠ Business Rule |

## 61. FeatureFlagVersion

| Attributo | Valore |
|-----------|--------|
| Domain owner | Configuration |
| Aggregate relationship | Under FeatureFlag |
| Identity | feature_flag_version_id |
| Tenant scope | Inherited scopes |
| Organization scope | Inherited |
| Lifecycle | published versions |
| Mutability | Published immutable |
| Retention class | OPERATIONAL |
| PII classification | INTERNAL |
| Audit requirement | Platform |
| Key relationships | FeatureFlag |
| Candidate indexes | (flag_key, version_no) |
| Soft-delete eligibility | No |
| Source of Truth | Configuration Module |

## 62. Payment

| Attributo | Valore |
|-----------|--------|
| Domain owner | Payment |
| Aggregate relationship | Payment Aggregate Root |
| Identity | payment_id |
| Tenant scope | Required |
| Organization scope | Required |
| Lifecycle | intent → authorized → captured / failed / cancelled |
| Mutability | Status mutable; amounts via attempts/refunds |
| Retention class | FINANCIAL_LONG |
| PII classification | FINANCIAL |
| Audit requirement | Financial high |
| Key relationships | Booking; 1:N PaymentAttempt; Refund; LedgerEntry refs |
| Candidate indexes | (booking_id), (tenant_id, status), (provider_ref) |
| Soft-delete eligibility | No financial wipe |
| Source of Truth | Payments Module — **≠ Settlement ≠ Payout** |

## 63. PaymentAttempt

| Attributo | Valore |
|-----------|--------|
| Domain owner | Payment |
| Aggregate relationship | Under Payment |
| Identity | payment_attempt_id |
| Tenant scope | Inherited |
| Organization scope | Inherited |
| Lifecycle | started → succeeded/failed |
| Mutability | Append outcomes |
| Retention class | FINANCIAL_LONG |
| PII classification | FINANCIAL |
| Audit requirement | Financial |
| Key relationships | Payment; IdempotencyRecord |
| Candidate indexes | (payment_id, created_at), (idempotency_key) |
| Soft-delete eligibility | No |
| Source of Truth | Payments Module |

## 64. Refund

| Attributo | Valore |
|-----------|--------|
| Domain owner | Payment |
| Aggregate relationship | Refund Aggregate / under Payment |
| Identity | refund_id |
| Tenant scope | Required |
| Organization scope | Required |
| Lifecycle | requested → succeeded/failed |
| Mutability | Append; no overwrite captured Payment |
| Retention class | FINANCIAL_LONG |
| PII classification | FINANCIAL |
| Audit requirement | Financial |
| Key relationships | Payment; Ledger adjustment |
| Candidate indexes | (payment_id), (status) |
| Soft-delete eligibility | No |
| Source of Truth | Payments Module |

## 65. Chargeback

| Attributo | Valore |
|-----------|--------|
| Domain owner | Payment |
| Aggregate relationship | Chargeback case |
| Identity | chargeback_id |
| Tenant scope | Required |
| Organization scope | Required |
| Lifecycle | opened → won/lost/pending |
| Mutability | Case mutable; money via Ledger |
| Retention class | FINANCIAL_LONG / LEGAL |
| PII classification | FINANCIAL / LEGAL_EVIDENCE |
| Audit requirement | Financial + Legal |
| Key relationships | Payment; Dispute; Evidence |
| Candidate indexes | (payment_id), (provider_case_ref) |
| Soft-delete eligibility | No |
| Source of Truth | Payments Module |

## 66. Settlement

| Attributo | Valore |
|-----------|--------|
| Domain owner | Settlement |
| Aggregate relationship | Settlement Aggregate Root |
| Identity | settlement_id |
| Tenant scope | Required / marketplace |
| Organization scope | Party orgs |
| Lifecycle | open → calculated → approved → closed |
| Mutability | Lines append; header status |
| Retention class | FINANCIAL_LONG |
| PII classification | FINANCIAL |
| Audit requirement | Financial high |
| Key relationships | 1:N SettlementLine; Services/Assignments |
| Candidate indexes | (tenant_id, period), (partner_company_id, status) |
| Soft-delete eligibility | No |
| Source of Truth | Settlement Module — **≠ Payment ≠ Payout** |

## 67. SettlementLine

| Attributo | Valore |
|-----------|--------|
| Domain owner | Settlement |
| Aggregate relationship | Under Settlement |
| Identity | settlement_line_id |
| Tenant scope | Inherited |
| Organization scope | Inherited |
| Lifecycle | included → adjusted via reversal line |
| Mutability | Prefer append adjustment lines |
| Retention class | FINANCIAL_LONG |
| PII classification | FINANCIAL |
| Audit requirement | Financial |
| Key relationships | Settlement; Service; Commission |
| Candidate indexes | (settlement_id), (service_id) |
| Soft-delete eligibility | No |
| Source of Truth | Settlement Module |

## 68. Payout

| Attributo | Valore |
|-----------|--------|
| Domain owner | Settlement / Finance |
| Aggregate relationship | Payout Aggregate Root |
| Identity | payout_id |
| Tenant scope | Required |
| Organization scope | Payee org/partner |
| Lifecycle | scheduled → processing → paid / failed / held |
| Mutability | Status mutable; amounts via lines |
| Retention class | FINANCIAL_LONG |
| PII classification | FINANCIAL |
| Audit requirement | Financial high |
| Key relationships | 1:N PayoutLine; Wallet; Holdback |
| Candidate indexes | (partner_company_id, status), (scheduled_at) |
| Soft-delete eligibility | No |
| Source of Truth | Settlement/Finance — **≠ Payment ≠ Settlement calc** |

## 69. PayoutLine

| Attributo | Valore |
|-----------|--------|
| Domain owner | Settlement |
| Aggregate relationship | Under Payout |
| Identity | payout_line_id |
| Tenant scope | Inherited |
| Organization scope | Inherited |
| Lifecycle | included |
| Mutability | Append adjustments |
| Retention class | FINANCIAL_LONG |
| PII classification | FINANCIAL |
| Audit requirement | Financial |
| Key relationships | Payout; SettlementLine |
| Candidate indexes | (payout_id) |
| Soft-delete eligibility | No |
| Source of Truth | Settlement Module |

## 70. Wallet

| Attributo | Valore |
|-----------|--------|
| Domain owner | Finance |
| Aggregate relationship | Wallet Aggregate |
| Identity | wallet_id |
| Tenant scope | Required |
| Organization scope | Owner org/partner |
| Lifecycle | open → frozen → closed |
| Mutability | Balance derived from entries |
| Retention class | FINANCIAL_LONG |
| PII classification | FINANCIAL |
| Audit requirement | Financial |
| Key relationships | 1:N WalletEntry |
| Candidate indexes | (owner_type, owner_id unique scoped) |
| Soft-delete eligibility | Close not delete |
| Source of Truth | Finance Module |

## 71. WalletEntry

| Attributo | Valore |
|-----------|--------|
| Domain owner | Finance |
| Aggregate relationship | Append-only under Wallet |
| Identity | wallet_entry_id |
| Tenant scope | Inherited |
| Organization scope | Inherited |
| Lifecycle | posted |
| Mutability | **Append-only** |
| Retention class | FINANCIAL_LONG |
| PII classification | FINANCIAL |
| Audit requirement | Financial |
| Key relationships | Wallet; Payout/Payment refs |
| Candidate indexes | (wallet_id, occurred_at), (idempotency_key) |
| Soft-delete eligibility | No |
| Source of Truth | Finance Module |

## 72. Ledger

| Attributo | Valore |
|-----------|--------|
| Domain owner | Finance |
| Aggregate relationship | Ledger book Aggregate |
| Identity | ledger_id / ledger_code |
| Tenant scope | Tenant or platform books |
| Organization scope | Optional |
| Lifecycle | open books |
| Mutability | Metadata low; entries append-only |
| Retention class | FINANCIAL_LONG |
| PII classification | FINANCIAL |
| Audit requirement | Financial |
| Key relationships | 1:N LedgerEntry |
| Candidate indexes | (code unique scoped) |
| Soft-delete eligibility | No |
| Source of Truth | Finance Module |

## 73. LedgerEntry

| Attributo | Valore |
|-----------|--------|
| Domain owner | Finance |
| Aggregate relationship | Append-only journal |
| Identity | ledger_entry_id |
| Tenant scope | Inherited |
| Organization scope | Inherited |
| Lifecycle | posted |
| Mutability | **Append-only**; corrections via reversal |
| Retention class | FINANCIAL_LONG |
| PII classification | FINANCIAL |
| Audit requirement | Financial critical |
| Key relationships | Ledger; source Payment/Settlement refs; **≠ Domain Event** |
| Candidate indexes | (ledger_id, occurred_at), (correlation_id), (idempotency_key) |
| Soft-delete eligibility | No |
| Source of Truth | Finance Module — never overwrite |

## 74. Reserve

| Attributo | Valore |
|-----------|--------|
| Domain owner | Finance / Settlement |
| Aggregate relationship | Reserve Aggregate |
| Identity | reserve_id |
| Tenant scope | Required |
| Organization scope | Partner/org |
| Lifecycle | held → released / applied |
| Mutability | Status + linked entries |
| Retention class | FINANCIAL_LONG |
| PII classification | FINANCIAL |
| Audit requirement | Financial |
| Key relationships | Wallet/Ledger; Partner |
| Candidate indexes | (partner_company_id, status) |
| Soft-delete eligibility | No |
| Source of Truth | Finance Module — amounts OPEN (ADR-OPEN-018) |

## 75. Holdback

| Attributo | Valore |
|-----------|--------|
| Domain owner | Finance / Partner Legal |
| Aggregate relationship | Holdback Aggregate |
| Identity | holdback_id |
| Tenant scope | Required |
| Organization scope | Partner |
| Lifecycle | held → released / claimed |
| Mutability | Status + entries |
| Retention class | LEGAL_LONG |
| PII classification | FINANCIAL / LEGAL |
| Audit requirement | Financial + Legal |
| Key relationships | Partner; Dispute; Payout |
| Candidate indexes | (partner_company_id, status) |
| Soft-delete eligibility | No |
| Source of Truth | Finance/Settlement — values OPEN |

## 76. Invoice

| Attributo | Valore |
|-----------|--------|
| Domain owner | Finance |
| Aggregate relationship | Invoice Aggregate |
| Identity | invoice_id |
| Tenant scope | Required |
| Organization scope | Billing party |
| Lifecycle | draft → issued → paid / void |
| Mutability | Issued immutable; credit notes for correction |
| Retention class | FISCAL_LONG |
| PII classification | FINANCIAL / CONFIDENTIAL |
| Audit requirement | Financial + Fiscal |
| Key relationships | Booking/Account; CreditNote; Tax fields configurable |
| Candidate indexes | (tenant_id, number unique), (status) |
| Soft-delete eligibility | Void not delete |
| Source of Truth | Finance Module — fiscal engine deferred / OPEN |

## 77. CreditNote

| Attributo | Valore |
|-----------|--------|
| Domain owner | Finance |
| Aggregate relationship | Under Invoice corrections |
| Identity | credit_note_id |
| Tenant scope | Required |
| Organization scope | Required |
| Lifecycle | issued |
| Mutability | Immutable once issued |
| Retention class | FISCAL_LONG |
| PII classification | FINANCIAL |
| Audit requirement | Financial |
| Key relationships | Invoice |
| Candidate indexes | (invoice_id) |
| Soft-delete eligibility | No |
| Source of Truth | Finance Module |

## 78. Commission

| Attributo | Valore |
|-----------|--------|
| Domain owner | Pricing / Settlement |
| Aggregate relationship | Commission record |
| Identity | commission_id |
| Tenant scope | Required |
| Organization scope | Required |
| Lifecycle | accrued → settled |
| Mutability | Prefer immutable accrual + adjustments |
| Retention class | FINANCIAL_LONG |
| PII classification | FINANCIAL |
| Audit requirement | Financial |
| Key relationships | Service; SettlementLine; PlatformRevenue |
| Candidate indexes | (service_id), (settlement_id) |
| Soft-delete eligibility | No |
| Source of Truth | Settlement/Pricing — rates OPEN |

## 79. PlatformRevenue

| Attributo | Valore |
|-----------|--------|
| Domain owner | Finance |
| Aggregate relationship | Revenue recognition record |
| Identity | platform_revenue_id |
| Tenant scope | Platform |
| Organization scope | N/A or tenant |
| Lifecycle | recognized / deferred OPEN |
| Mutability | Policy OPEN; append preferred |
| Retention class | FINANCIAL_LONG |
| PII classification | FINANCIAL |
| Audit requirement | Financial |
| Key relationships | Commission; Booking |
| Candidate indexes | (period, tenant_id) |
| Soft-delete eligibility | No |
| Source of Truth | Finance Module — recognition OPEN |

## 80. RecoveryCost

| Attributo | Valore |
|-----------|--------|
| Domain owner | Finance / Support |
| Aggregate relationship | Recovery cost record |
| Identity | recovery_cost_id |
| Tenant scope | Required |
| Organization scope | Required |
| Lifecycle | recorded → allocated |
| Mutability | Append adjustments |
| Retention class | FINANCIAL / LEGAL |
| PII classification | FINANCIAL |
| Audit requirement | Financial |
| Key relationships | Dispute; Booking; Ledger |
| Candidate indexes | (dispute_id), (booking_id) |
| Soft-delete eligibility | No |
| Source of Truth | Finance Module |

## 81. Compensation

| Attributo | Valore |
|-----------|--------|
| Domain owner | Support / Finance |
| Aggregate relationship | Compensation Aggregate |
| Identity | compensation_id |
| Tenant scope | Required |
| Organization scope | Required |
| Lifecycle | approved → paid / denied |
| Mutability | Status + payment link |
| Retention class | FINANCIAL / CX |
| PII classification | FINANCIAL / PII link |
| Audit requirement | Business + Financial |
| Key relationships | Booking; Customer; Payment/Wallet |
| Candidate indexes | (booking_id), (status) |
| Soft-delete eligibility | No money wipe |
| Source of Truth | Support/Finance |

## 82. Dispute

| Attributo | Valore |
|-----------|--------|
| Domain owner | Support / Compliance |
| Aggregate relationship | Dispute Aggregate Root |
| Identity | dispute_id |
| Tenant scope | Required |
| Organization scope | Required |
| Lifecycle | opened → evidence → resolved / escalated |
| Mutability | Case mutable |
| Retention class | LEGAL_LONG |
| PII classification | LEGAL_EVIDENCE / PII |
| Audit requirement | Business + Legal + Access |
| Key relationships | Booking; 1:N DisputeEvidence; Holdback |
| Candidate indexes | (booking_id), (status, deadline) |
| Soft-delete eligibility | No |
| Source of Truth | Support/Compliance |

## 83. DisputeEvidence

| Attributo | Valore |
|-----------|--------|
| Domain owner | Support / Documents |
| Aggregate relationship | Under Dispute |
| Identity | dispute_evidence_id |
| Tenant scope | Inherited |
| Organization scope | Inherited |
| Lifecycle | uploaded → accepted |
| Mutability | Metadata mutable; content versioned |
| Retention class | LEGAL_EVIDENCE |
| PII classification | LEGAL_EVIDENCE |
| Audit requirement | Legal + Access |
| Key relationships | Dispute; Document/Media |
| Candidate indexes | (dispute_id) |
| Soft-delete eligibility | No purge without legal workflow |
| Source of Truth | Support/Documents |

## 84. SupportCase

| Attributo | Valore |
|-----------|--------|
| Domain owner | Support |
| Aggregate relationship | SupportCase Aggregate |
| Identity | support_case_id |
| Tenant scope | Required |
| Organization scope | Required |
| Lifecycle | open → pending → resolved → closed |
| Mutability | Mutable case fields |
| Retention class | OPERATIONAL / CX |
| PII classification | PII |
| Audit requirement | Business |
| Key relationships | Booking; Customer; Dispute optional |
| Candidate indexes | (tenant_id, status), (booking_id) |
| Soft-delete eligibility | Close; retain |
| Source of Truth | Support Module |

## 85. Notification

| Attributo | Valore |
|-----------|--------|
| Domain owner | Notification |
| Aggregate relationship | Notification Aggregate |
| Identity | notification_id |
| Tenant scope | Required |
| Organization scope | Optional |
| Lifecycle | queued → sent / failed / suppressed |
| Mutability | Status mutable |
| Retention class | OPERATIONAL_SHORT+ |
| PII classification | PII (recipient) |
| Audit requirement | Communications |
| Key relationships | 1:N NotificationAttempt; Template; Domain Event cause |
| Candidate indexes | (tenant_id, status, created_at), (idempotency_key) |
| Soft-delete eligibility | Yes after retention |
| Source of Truth | Notifications Module — evaluation ≠ send |

## 86. NotificationAttempt

| Attributo | Valore |
|-----------|--------|
| Domain owner | Notification |
| Aggregate relationship | Under Notification |
| Identity | notification_attempt_id |
| Tenant scope | Inherited |
| Organization scope | Inherited |
| Lifecycle | attempted |
| Mutability | Append |
| Retention class | OPERATIONAL |
| PII classification | PII |
| Audit requirement | Communications |
| Key relationships | Notification; provider refs |
| Candidate indexes | (notification_id, attempted_at) |
| Soft-delete eligibility | No |
| Source of Truth | Notifications Module |

## 87. NotificationTemplate

| Attributo | Valore |
|-----------|--------|
| Domain owner | Notification |
| Aggregate relationship | Template Aggregate |
| Identity | template_id / key |
| Tenant scope | Platform/tenant |
| Organization scope | Optional override |
| Lifecycle | draft → published → deprecated |
| Mutability | Versioned content |
| Retention class | OPERATIONAL |
| PII classification | INTERNAL |
| Audit requirement | Platform |
| Key relationships | Notification; locale variants |
| Candidate indexes | (key, locale, version) |
| Soft-delete eligibility | Deprecate |
| Source of Truth | Notifications Module |

## 88. Document

| Attributo | Valore |
|-----------|--------|
| Domain owner | Documents |
| Aggregate relationship | Document Aggregate |
| Identity | document_id |
| Tenant scope | Required |
| Organization scope | Required |
| Lifecycle | uploaded → verified → expired → revoked |
| Mutability | Metadata mutable; content via versions |
| Retention class | LEGAL / COMPLIANCE |
| PII classification | LEGAL_EVIDENCE / SENSITIVE_PII possible |
| Audit requirement | Compliance + Access |
| Key relationships | 1:N DocumentVersion; Partner/Driver/Vehicle |
| Candidate indexes | (owner_type, owner_id), (type, expiry) |
| Soft-delete eligibility | Revoke; retain legal |
| Source of Truth | Documents Module |

## 89. DocumentVersion

| Attributo | Valore |
|-----------|--------|
| Domain owner | Documents |
| Aggregate relationship | Under Document |
| Identity | document_version_id |
| Tenant scope | Inherited |
| Organization scope | Inherited |
| Lifecycle | uploaded |
| Mutability | **Immutable** blob ref |
| Retention class | LEGAL |
| PII classification | As Document |
| Audit requirement | Compliance |
| Key relationships | Document; MediaAsset/Storage |
| Candidate indexes | (document_id, version_no) |
| Soft-delete eligibility | No |
| Source of Truth | Documents Module |

## 90. Attachment

| Attributo | Valore |
|-----------|--------|
| Domain owner | Documents / Support |
| Aggregate relationship | Attachment Entity |
| Identity | attachment_id |
| Tenant scope | Inherited |
| Organization scope | Inherited |
| Lifecycle | attached → removed |
| Mutability | Metadata mutable |
| Retention class | As parent |
| PII classification | Varies |
| Audit requirement | As parent |
| Key relationships | SupportCase/Dispute/Booking |
| Candidate indexes | (parent_type, parent_id) |
| Soft-delete eligibility | Yes if parent allows |
| Source of Truth | Documents Module |

## 91. MediaAsset

| Attributo | Valore |
|-----------|--------|
| Domain owner | Media |
| Aggregate relationship | MediaAsset Aggregate |
| Identity | media_asset_id |
| Tenant scope | Required |
| Organization scope | Optional |
| Lifecycle | stored → linked → deleted |
| Mutability | Metadata mutable; object storage ref |
| Retention class | As policy |
| PII classification | May be SENSITIVE |
| Audit requirement | Access |
| Key relationships | DocumentVersion; Trip evidence |
| Candidate indexes | (storage_key unique), (tenant_id) |
| Soft-delete eligibility | Yes with storage GC policy OPEN |
| Source of Truth | Media Module — storage provider OPEN |

## 92. AuditLog

| Attributo | Valore |
|-----------|--------|
| Domain owner | Administration / Platform |
| Aggregate relationship | Append-only audit |
| Identity | audit_log_id |
| Tenant scope | Required when applicable |
| Organization scope | Optional |
| Lifecycle | recorded |
| Mutability | **Append-only** |
| Retention class | AUDIT_LONG |
| PII classification | May contain PII refs — minimize |
| Audit requirement | Self (audit) |
| Key relationships | Actor; resource refs; correlation_id |
| Candidate indexes | (tenant_id, occurred_at), (resource_type, resource_id), (actor_id) |
| Soft-delete eligibility | No |
| Source of Truth | Platform Audit — ≠ technical log ≠ Ledger |

## 93. DomainEventRecord

| Attributo | Valore |
|-----------|--------|
| Domain owner | Platform / owning Module |
| Aggregate relationship | Event persistence |
| Identity | domain_event_id |
| Tenant scope | Inherited |
| Organization scope | Inherited |
| Lifecycle | recorded → (optionally published internally) |
| Mutability | **Append-only** |
| Retention class | EVENT_LONG |
| PII classification | Minimize payload |
| Audit requirement | Platform |
| Key relationships | Aggregate id/version; correlation/causation |
| Candidate indexes | (aggregate_type, aggregate_id, version), (occurred_at) |
| Soft-delete eligibility | No |
| Source of Truth | Owning Module / Event store table — catalog MC-OS-020 |

## 94. IntegrationEventRecord

| Attributo | Valore |
|-----------|--------|
| Domain owner | Platform / Integrations |
| Aggregate relationship | Published Language persistence |
| Identity | integration_event_id |
| Tenant scope | As applicable |
| Organization scope | As applicable |
| Lifecycle | pending → published → consumed refs |
| Mutability | Status for publication; payload immutable |
| Retention class | EVENT_LONG |
| PII classification | Minimize |
| Audit requirement | Platform |
| Key relationships | Outbox; consumers Inbox |
| Candidate indexes | (status, created_at), (event_type, event_id unique) |
| Soft-delete eligibility | No |
| Source of Truth | Platform event publication boundary |

## 95. IdempotencyRecord

| Attributo | Valore |
|-----------|--------|
| Domain owner | Platform |
| Aggregate relationship | Idempotency store |
| Identity | idempotency_key (+ scope) |
| Tenant scope | Scoped |
| Organization scope | Scoped |
| Lifecycle | started → completed → expired |
| Mutability | Result cached; key unique |
| Retention class | SHORT_TO_MEDIUM |
| PII classification | INTERNAL |
| Audit requirement | Platform |
| Key relationships | Command/PaymentAttempt/Webhook |
| Candidate indexes | (scope, idempotency_key unique) |
| Soft-delete eligibility | Expire/GC |
| Source of Truth | Platform |

## 96. OutboxMessage Candidate

| Attributo | Valore |
|-----------|--------|
| Domain owner | Platform |
| Aggregate relationship | Transactional Outbox candidate |
| Identity | outbox_message_id |
| Tenant scope | As event |
| Organization scope | As event |
| Lifecycle | pending → published → failed |
| Mutability | Status mutable; payload immutable |
| Retention class | EVENT_OPERATIONAL |
| PII classification | Minimize |
| Audit requirement | Platform |
| Key relationships | IntegrationEventRecord |
| Candidate indexes | (status, created_at) |
| Soft-delete eligibility | GC after success OPEN |
| Source of Truth | Candidate — technology OPEN (ADR-OPEN-012) |

## 97. InboxMessage Candidate

| Attributo | Valore |
|-----------|--------|
| Domain owner | Platform |
| Aggregate relationship | Inbox dedup candidate |
| Identity | inbox_message_id / event_id consumer |
| Tenant scope | As event |
| Organization scope | As event |
| Lifecycle | received → processed |
| Mutability | Status |
| Retention class | EVENT_OPERATIONAL |
| PII classification | Minimize |
| Audit requirement | Platform |
| Key relationships | Integration events consumed |
| Candidate indexes | (consumer, event_id unique) |
| Soft-delete eligibility | GC OPEN |
| Source of Truth | Candidate — technology OPEN |

## 98. PartnerScore

| Attributo | Valore |
|-----------|--------|
| Domain owner | Partner / Analytics read |
| Aggregate relationship | Score Aggregate or projection |
| Identity | partner_score_id |
| Tenant scope | Marketplace |
| Organization scope | Partner |
| Lifecycle | computed snapshots |
| Mutability | Snapshot replace or version |
| Retention class | OPERATIONAL |
| PII classification | INTERNAL |
| Audit requirement | Low |
| Key relationships | PartnerCompany |
| Candidate indexes | (partner_company_id, as_of) |
| Soft-delete eligibility | Yes old snapshots |
| Source of Truth | Partners write policy / Analytics projection — not operational SoT writer for Assignment |

## 99. CustomerRating

| Attributo | Valore |
|-----------|--------|
| Domain owner | Customer / CX |
| Aggregate relationship | Rating Entity |
| Identity | customer_rating_id |
| Tenant scope | Required |
| Organization scope | Required |
| Lifecycle | submitted → visible / hidden |
| Mutability | Mutable moderation |
| Retention class | CX |
| PII classification | PII possible |
| Audit requirement | Business |
| Key relationships | Customer; Booking/Service |
| Candidate indexes | (booking_id unique candidate), (customer_id) |
| Soft-delete eligibility | Hide |
| Source of Truth | Customers/CX Module |

## 100. PartnerRating

| Attributo | Valore |
|-----------|--------|
| Domain owner | Partner / CX |
| Aggregate relationship | Rating Entity |
| Identity | partner_rating_id |
| Tenant scope | Required |
| Organization scope | Required |
| Lifecycle | submitted → visible |
| Mutability | Moderation |
| Retention class | CX |
| PII classification | INTERNAL/PII |
| Audit requirement | Business |
| Key relationships | Partner; Service |
| Candidate indexes | (service_id), (partner_company_id) |
| Soft-delete eligibility | Hide |
| Source of Truth | Partners/CX |

## 101. RiskAssessment

| Attributo | Valore |
|-----------|--------|
| Domain owner | Compliance / Risk |
| Aggregate relationship | RiskAssessment Aggregate |
| Identity | risk_assessment_id |
| Tenant scope | Required |
| Organization scope | Optional |
| Lifecycle | scored → reviewed → expired |
| Mutability | Versioned assessments |
| Retention class | COMPLIANCE |
| PII classification | CONFIDENTIAL |
| Audit requirement | Security + Compliance |
| Key relationships | Customer/Partner/Booking |
| Candidate indexes | (subject_type, subject_id, as_of) |
| Soft-delete eligibility | Retain |
| Source of Truth | Compliance Module |

## 102. FraudSignal

| Attributo | Valore |
|-----------|--------|
| Domain owner | Compliance / Risk |
| Aggregate relationship | Signal append Entity |
| Identity | fraud_signal_id |
| Tenant scope | Required |
| Organization scope | Optional |
| Lifecycle | raised → cleared / confirmed |
| Mutability | Append signals; status updates |
| Retention class | SECURITY_LONG |
| PII classification | CONFIDENTIAL |
| Audit requirement | Security |
| Key relationships | RiskAssessment; Payment |
| Candidate indexes | (tenant_id, created_at), (signal_type) |
| Soft-delete eligibility | No delete raw signals casually |
| Source of Truth | Compliance Module |

## 103. AIRecommendation

| Attributo | Valore |
|-----------|--------|
| Domain owner | AI |
| Aggregate relationship | Recommendation record |
| Identity | ai_recommendation_id |
| Tenant scope | Required |
| Organization scope | Optional |
| Lifecycle | proposed → accepted/rejected/expired |
| Mutability | Immutable proposal; decision separate |
| Retention class | AI_AUDIT |
| PII classification | Minimize |
| Audit requirement | AI governance |
| Key relationships | HumanReview; target Aggregate **read-only influence** |
| Candidate indexes | (target_type, target_id), (created_at) |
| Soft-delete eligibility | Yes after retention |
| Source of Truth | AI Module — **does not own canonical operational data** |

## 104. HumanReview

| Attributo | Valore |
|-----------|--------|
| Domain owner | AI / Operations |
| Aggregate relationship | Review decision |
| Identity | human_review_id |
| Tenant scope | Required |
| Organization scope | Required |
| Lifecycle | pending → decided |
| Mutability | Decision recorded |
| Retention class | AI_AUDIT / OPERATIONAL |
| PII classification | INTERNAL |
| Audit requirement | AI + Business |
| Key relationships | AIRecommendation; actor |
| Candidate indexes | (recommendation_id) |
| Soft-delete eligibility | No |
| Source of Truth | Owning Module decision; AI not write SoT |

## 105. Country

| Attributo | Valore |
|-----------|--------|
| Domain owner | Reference / Configuration |
| Aggregate relationship | Reference data |
| Identity | country_code (ISO) |
| Tenant scope | Global |
| Organization scope | N/A |
| Lifecycle | active |
| Mutability | Low |
| Retention class | REFERENCE |
| PII classification | PUBLIC |
| Audit requirement | Low |
| Key relationships | Region; tax config refs OPEN |
| Candidate indexes | (code PK) |
| Soft-delete eligibility | No |
| Source of Truth | Platform reference |

## 106. Region

| Attributo | Valore |
|-----------|--------|
| Domain owner | Reference |
| Aggregate relationship | Reference |
| Identity | region_id |
| Tenant scope | Global/tenant |
| Organization scope | N/A |
| Lifecycle | active |
| Mutability | Low |
| Retention class | REFERENCE |
| PII classification | PUBLIC |
| Audit requirement | Low |
| Key relationships | Country; City |
| Candidate indexes | (country_code, code) |
| Soft-delete eligibility | Deprecate |
| Source of Truth | Platform reference |

## 107. City

| Attributo | Valore |
|-----------|--------|
| Domain owner | Reference / Marketplace |
| Aggregate relationship | Reference |
| Identity | city_id |
| Tenant scope | Global/tenant |
| Organization scope | N/A |
| Lifecycle | active |
| Mutability | Low + geo |
| Retention class | REFERENCE |
| PII classification | PUBLIC |
| Audit requirement | Low |
| Key relationships | Region; Exchange geo rules |
| Candidate indexes | (name, region), geo OPEN |
| Soft-delete eligibility | Deprecate |
| Source of Truth | Platform / Marketplace reference |

## 108. Airport

| Attributo | Valore |
|-----------|--------|
| Domain owner | Reference |
| Aggregate relationship | Reference POI subtype |
| Identity | airport_id / IATA |
| Tenant scope | Global |
| Organization scope | N/A |
| Lifecycle | active |
| Mutability | Low |
| Retention class | REFERENCE |
| PII classification | PUBLIC |
| Audit requirement | Low |
| Key relationships | Location; Booking endpoints |
| Candidate indexes | (iata unique) |
| Soft-delete eligibility | No |
| Source of Truth | Platform reference |

## 109. Station

| Attributo | Valore |
|-----------|--------|
| Domain owner | Reference |
| Aggregate relationship | Reference |
| Identity | station_id |
| Tenant scope | Global/tenant |
| Organization scope | N/A |
| Lifecycle | active |
| Mutability | Low |
| Retention class | REFERENCE |
| PII classification | PUBLIC |
| Audit requirement | Low |
| Key relationships | Location |
| Candidate indexes | (code), (city_id) |
| Soft-delete eligibility | Deprecate |
| Source of Truth | Platform reference |

## 110. Port

| Attributo | Valore |
|-----------|--------|
| Domain owner | Reference |
| Aggregate relationship | Reference |
| Identity | port_id |
| Tenant scope | Global |
| Organization scope | N/A |
| Lifecycle | active |
| Mutability | Low |
| Retention class | REFERENCE |
| PII classification | PUBLIC |
| Audit requirement | Low |
| Key relationships | Location |
| Candidate indexes | (code) |
| Soft-delete eligibility | Deprecate |
| Source of Truth | Platform reference |

## 111. POI

| Attributo | Valore |
|-----------|--------|
| Domain owner | Reference / Content |
| Aggregate relationship | POI Entity |
| Identity | poi_id |
| Tenant scope | Tenant or global |
| Organization scope | Optional |
| Lifecycle | active → hidden |
| Mutability | Mutable content |
| Retention class | REFERENCE |
| PII classification | PUBLIC/INTERNAL |
| Audit requirement | Low |
| Key relationships | Location; Route suggestions |
| Candidate indexes | (tenant_id, category), geo OPEN |
| Soft-delete eligibility | Hide |
| Source of Truth | Content/Reference — not Booking SoT |

## 112. Identifier Strategy

| Aspetto | Policy |
|---------|--------|
| UUID vs ULID | **OPEN** (entrambi candidate) |
| Internal surrogate | Chiave tecnica immutabile |
| External public IDs | Possono differire dal PK interno |
| Human-readable references | Es. booking reference; non usate come PK |
| Business meaning in PK | **Vietato** |
| Uniqueness scope | Dichiarato (tenant / org / global) |
| Collision handling | Unique constraint + retry/idempotency |

## 113. Naming Convention

- `snake_case` per column/table candidates.
- Plural vs singular table names: **OPEN**.
- PK `id` vs `<entity>_id`: **OPEN**.
- FK esplicite nominate.
- Timestamp: `*_at` in UTC.
- Boolean: `is_*` / `has_*`.
- Enum naming: tipo/dominio esplicito.
- Index: `idx_<table>_<cols>`; Unique: `uq_…`; Check: `ck_…`.
- Migration naming: timestamp + slug descrittivo (dettaglio tooling OPEN).

## 114. Common Columns

Colonne concettuali ricorrenti (non obbligatorie su ogni tabella):

`id`, `tenant_id`, `organization_id`, `created_at`, `updated_at`, `created_by`, `updated_by`, `version`, `status`, `deleted_at`, `deleted_by`, `correlation_id`, `source_system`, `external_reference`.

Tabelle append-only tipicamente **non** usano `updated_at` mutabile né soft delete.

## 115. Tenant Scoping

| Classe | Esempi | Regola |
|--------|--------|--------|
| Global tables | Country, Permission catalog | Nessun tenant_id |
| Tenant-scoped | Booking, Customer, Vehicle | `tenant_id` obbligatorio |
| Organization-scoped | Membership, org config | `organization_id` |
| User-scoped | User prefs | `user_id` + tenant via membership |
| Partner-scoped | Partner drivers/vehicles | `partner_company_id` |
| Public reference | Airport | Global |
| Cross-tenant admin | Platform Audit queries | Explicit privileged service |

## 116. Relationship Rules

- Tenant 1:N Organization
- Person 1:N UserIdentity candidate
- User N:M Organization via Membership
- Customer 1:N Booking
- Booking 1:N Service
- Service 1:N AssignmentAttempt
- Service 0..1 Active Assignment
- Assignment XOR InternalDriver / PartnerCompany
- PartnerCompany 1:N Driver; 1:N Vehicle
- Booking 1:N Payment
- Service 1:N Evidence (Document/Media)
- Booking 0:N Dispute
- Settlement 1:N SettlementLine; Payout 1:N PayoutLine
- Wallet 1:N WalletEntry; Ledger 1:N LedgerEntry
- ExchangeListing 1:N ExchangeOffer; 0..1 ExchangeAssignment
- ConfigurationDefinition 1:N ConfigurationVersion
- Document 1:N DocumentVersion

## 117. Booking / Service / Trip / Assignment

Modello dati **separato obbligatorio** (B001 / MC-OS-014 / MC-OS-026):

| Concetto | Ruolo dati |
|----------|------------|
| Booking | Contratto commerciale / richiesta confermata |
| Service | Prestazione eseguibile collegata al Booking |
| Trip | Esecuzione operativa / tracing del viaggio |
| Assignment | Attribuzione esecutore INTERNAL XOR PARTNER |

**Vietato:** tabella unica omnipotente; stato unico condiviso; Assignment direttamente solo su Booking quando esistono più Service; doppio esecutore INTERNAL+PARTNER.

## 118. INTERNAL XOR PARTNER

Alternative concettuali (nessun SQL):

- `assignment_mode` enum (`INTERNAL` | `PARTNER`);
- `internal_driver_id` nullable;
- `partner_company_id` nullable;
- CHECK constraint candidate che impone XOR a Assignment confermato.

**Invariante:** quando Assignment è confermato, **esattamente uno** tra INTERNAL e PARTNER deve essere valorizzato. Costi: INTERNAL XOR PARTNER (BOS) — nessun doppio conteggio.

## 119. Money Model

Campi concettuali: `currency_code`; `amount_minor` **oppure** fixed decimal (**OPEN**); `tax_amount`; `net_amount`; `gross_amount`; `fee_amount`; `partner_cost`; `internal_execution_cost`; `platform_revenue`; `commission_amount`; `markup_amount`; `contribution_margin`; `exchange_rate_snapshot`; rounding policy.

**Obblighi:** no floating point per money; precisione esplicita; tax fields configurabili; reversal invece di overwrite.

**OPEN:** minor units vs decimal; tax recognition; revenue recognition; MoR vs Intermediary (ADR-OPEN-011).

## 120. Temporal Data

`created_at`, `updated_at`, `effective_from`, `effective_to`, `valid_from`, `valid_to`, `occurred_at`, `recorded_at`, service timezone esplicita, **UTC storage** per timestamp istantanei, snapshot storici immutabili (Quote/Price/ServiceOrder).

## 121. Versioning

Optimistic lock `version`; DocumentVersion; QuoteVersion; price/config versions; ServiceOrder version; event version; schema version (migrations). Non confondere version colonne Aggregate con Documentation Version EDGF.

## 122. Immutability

Append-only candidates: LedgerEntry, AuditLog, DomainEventRecord, IntegrationEventRecord, WalletEntry, financial adjustments, evidence metadata, DocumentVersion history.

Correzioni finanziarie **solo** via reversal/adjustment.

## 123. Soft Delete Policy

Categorie: soft deletable; anonymizable; immutable; retention-controlled; hard deletable only by approved workflow.

**Durate di retention: OPEN.**

## 124. PII Classification

Classi: `PUBLIC`, `INTERNAL`, `CONFIDENTIAL`, `PII`, `SENSITIVE_PII`, `FINANCIAL`, `LEGAL_EVIDENCE`.

Esempi: Person/Passenger → SENSITIVE_PII; Payment/Ledger → FINANCIAL; DisputeEvidence → LEGAL_EVIDENCE; Airport → PUBLIC.

## 125. Customer Data Disclosure

Supporto dati per fasi Exchange/CX: `PRE_ACCEPTANCE`, `POST_ACCEPTANCE`, `T_MINUS_12_HOURS`, `T_MINUS_6_HOURS`, `SERVICE_ACTIVE`, `POST_SERVICE_RESTRICTED` (offset numerici OPEN — ADR-OPEN-019).

Entità candidate: `EndCustomerReference`, `DataReleasePolicy`, `DataAccessLog` con release timestamp, access reason, actor, audit.

## 126. Audit Model

| Tipo | Uso |
|------|-----|
| Technical log | Diagnostica infrastruttura |
| Business audit | AuditLog decisioni/stati |
| Security audit | Authn/Authz/deny |
| Data access audit | Disclosure / PII reads |
| Financial ledger | LedgerEntry |
| Event record | Domain/Integration events |

Non collassare Ledger, AuditLog e technical log in un’unica tabella.

## 127. Event Persistence

DomainEventRecord / IntegrationEventRecord: envelope (type, version, occurred_at), idempotency key, correlation_id, causation_id, aggregate_version, publication status, retry metadata candidate. Allineamento catalogo MC-OS-020.

## 128. Outbox / Inbox Readiness

Outbox: record co-transazionale, publication state, retry, dead-letter reference.
Inbox: deduplication per consumer.
**Tecnologia OPEN** (ADR-OPEN-012). Pattern raccomandato a livello dati.

## 129. Indexing Strategy

Principi (non DDL): primary lookup; tenant filtering; booking reference; service date; assignment status; partner availability; geographic search candidate; event status; payout status; document expiry; dispute deadline; audit time range. Indici compositi con `tenant_id` leading dove applicabile.

## 130. Constraint Strategy

NOT NULL; UNIQUE scoped; FK; CHECK; enum vs reference table; exclusion candidates; immutable fields; tenant consistency (child.tenant_id = parent.tenant_id); XOR invariants; non-negative money; currency consistency tra linee collegate.

## 131. Enum Strategy

Confronto: PostgreSQL ENUM | CHECK constraints | reference tables | application enum.
**Strategia definitiva per categoria: OPEN.** Preferire evolvibilità per stati di dominio ad alta volatilità.

## 132. Reference Data

| Dato | Ownership |
|------|-----------|
| country, currency, locale, timezone | Platform reference |
| vehicle/service category | Fleet/Pricing + Configuration |
| airport, station, port, POI | Platform / Content |
| document type, cancellation/dispute reason | Configuration / Compliance catalogs |

## 133. Geospatial Data

latitude, longitude, normalized address, provider place ID, geofence, city boundary, regola Exchange ~10 km (dettaglio OPEN), route geometry candidate, **PostGIS candidate (OPEN)**.

## 134. Search Model

Transactional lookup; filtered search; full-text (**OPEN**); geospatial (**OPEN**); analytics search; external search engine **deferred**.

## 135. Read Models

Projection candidates: booking dashboard; dispatcher board; driver trips; partner marketplace; customer history; finance dashboard; payout dashboard; partner score; city profitability; notification status.

**Le projection non sono canonical write model.**

## 136. Analytics Data

Separare: operational database; reporting projections; warehouse/lake **future**; KPI aggregati; anonymized analytics.
Nessun warehouse obbligatorio per MVP. Analytics **non** scrive stato operativo canonico.

## 137. Backup and Recovery Boundary

Principi: PITR readiness; backup; restore testing; audit preservation; recovery priority (Finance/Identity > projections). Dettaglio infrastruttura non in scope.

## 138. Migration Strategy

Forward-only migrations candidate; fasi backward-compatible; **expand / migrate / contract**; no destructive change nella stessa release; backfill; validation; limiti di rollback; migration audit; staging verification. Migration-first schema evolution.

## 139. Seed Data

System reference data; test fixtures; demo data; production seed minimo. **No PII** nei seed. Script candidate idempotenti.

## 140. Data Access Patterns

Repository per Aggregate; Query services / read models; **no** direct UI DB access; **no** cross-module write query; **no** generic repository per tutte le Entity; admin privilegiato solo via explicit service.

## 141. Supabase Boundary

| Capacità Supabase | Ruolo |
|-------------------|--------|
| PostgreSQL | Persistenza primaria candidate |
| Auth | Adapter Identity — **non** sostituisce Domain Identity |
| RLS | Defense-in-depth — **non** sostituisce Application Authorization (design OPEN) |
| Storage | Media/Document adapter |
| Realtime | Non default per ogni Entity |
| Edge Functions | Non business logic canonica |
| Service role | Non bypass governance; uso ristretto |

## 142. Data Architecture Matrices

1. Domain-to-Entity Ownership Matrix — §6 + §14–111
2. Entity-to-Aggregate Matrix — campi Aggregate relationship
3. Tenant Scope Matrix — §115
4. PII Classification Matrix — §124 + entity cards
5. Retention Class Matrix — entity cards
6. Immutability Matrix — §122
7. Soft Delete Eligibility Matrix — entity cards
8. Audit Requirement Matrix — entity cards
9. Event Persistence Matrix — §93–97, §127–128
10. Index Candidate Matrix — entity cards + §129
11. Relationship Matrix — §116
12. Constraint Matrix — §118, §130
13. Read Model Matrix — §135
14. Migration Risk Matrix — Finance/PII/Exchange high; reference low
15. OS Foundation Entity Matrix — §143
16. Deferred Entity Matrix — §143 deferred

## 143. OS Foundation Data Scope

**Indispensabile:** tenant, organization, person, user, membership, role, permission, customer, booking, service, assignment, driver, vehicle, configuration foundation, event record, audit log.

**Predisporre (non pienamente):** partner, exchange, payment stub, evidence, dispute.

**Rinviare:** ledger completo, payout, fiscal invoice engine, rolling reserve, advanced AI tables, warehouse, distributed event bus.

## 144. Current Repository Assessment

| Area | Stato concettuale |
|------|-------------------|
| JSON runtime | `data/` SoT di fatto in dev |
| `booking-requests.json` | Intake booking non relazionale |
| `operational-trips.json` | Trip ops accoppiato a JSON |
| API route | Persistenza mista JSON/Supabase opzionale |
| Pricing types | Tipi in codice; persistenza incompleta |
| Driver portal | Dati operativi coupling risk |
| Tenant model | Assente come modello durevole |
| Relational durable model | Non ancora SoT unica |
| Migration need | Alta — JSON → PostgreSQL/Supabase (PLATFORM_MAP) |

## 145. Gap Analysis

Gap principali: assenza di ownership tabellare per Module; mancanza di `tenant_id` coerente; Booking/Service/Trip/Assignment non normalizzati; Ledger/Audit non distinti; no outbox; no idempotency store; PII/disclosure non modellati; RLS non progettata (OPEN); dual-write JSON/Supabase rischioso.

## 146. Target Data Architecture Candidate

Shared PostgreSQL/Supabase + logical module ownership + UTC timestamps + money non-float + append-only finance/audit/events + versioned Quote/Config/ServiceOrder + XOR Assignment + read projections separate. Stato **CANDIDATE**.

## 147. Implementation Sequence

1. tenant / organization / identity
2. customer
3. booking / service
4. assignment / driver / vehicle
5. audit / event / configuration
6. partner
7. pricing persistence
8. evidence / dispute
9. payment foundation
10. settlement / finance later

## 148. Data Architecture Definition of Done

Entity ownership dichiarata; tenant/org scope chiaro; PII/retention classificati; invarianti XOR e separazioni Booking/Service/Trip/Assignment rispettati; money policy senza float; append-only dove richiesto; migration path definito; nessun SQL/RLS eseguibile preteso come completo in questo Draft; CTD/OPEN espliciti.

## 149. Decisioni approvate

Derivate da B001 / ADR Active / MC-OS-026 (non nuovi ADR): Domain-owned data; no cross-domain direct mutation; Booking≠Service≠Trip≠Assignment; INTERNAL XOR PARTNER; Payment≠Settlement≠Payout; Event≠Ledger Entry; AI/Analytics non write SoT; Configuration versionata / non hardcoded secrets; append-only financial history + reversal; shared DB platform iniziale allineata a CTD Software Architecture; Modular Monolith transactions locali.

## 150. Candidate Technical Decisions

| ID | Decisione | Stato |
|----|-----------|-------|
| CTD-DA-001 | PostgreSQL/Supabase persistenza iniziale | CANDIDATE |
| CTD-DA-002 | Shared database | CANDIDATE |
| CTD-DA-003 | Shared schema (logicamente condiviso) | CANDIDATE |
| CTD-DA-004 | Tenant isolation via tenant_id / organization_id | CANDIDATE |
| CTD-DA-005 | UUID/ULID come identifier candidate | CANDIDATE (scelta UUID vs ULID OPEN) |
| CTD-DA-006 | Money: minor units **o** fixed decimal (no float) | CANDIDATE (variante OPEN) |
| CTD-DA-007 | Enum strategy per-categoria | CANDIDATE/OPEN |
| CTD-DA-008 | PostGIS opzionale | CANDIDATE/OPEN |
| CTD-DA-009 | Outbox/Inbox readiness | CANDIDATE (tech OPEN) |
| CTD-DA-010 | Soft delete defaults per categoria | CANDIDATE (defaults OPEN) |
| CTD-DA-011 | Forward-only / expand-migrate-contract migrations | CANDIDATE |

## 151. Decisioni OPEN

ORM/query layer; UUID vs ULID; singular vs plural tables; `id` vs `<entity>_id`; minor units vs decimal; schema-per-domain; RLS design (ADR-OPEN-017); shared vs multiple schema; Auth identity mapping; soft-delete defaults; retention periods; PostGIS; outbox/inbox tech (ADR-OPEN-012); enum implementation; full-text search; archive strategy; partitioning; data warehouse; database-per-tenant future; backup RPO/RTO; encryption strategy; field-level encryption; audit storage physical; fiscal data mapping; MoR/tax recognition.

## 152. Professional Validation

| Ruolo | Focus |
|-------|-------|
| Data Architect | Modello logico, ownership, migrations |
| Security Architect | RLS boundary, service role, encryption |
| Privacy/GDPR | PII, retention, anonymization, disclosure |
| Fiscalista | Invoice/tax mapping (non definito qui) |
| Commercialista | Ledger/settlement semantics |
| PSD2/PSP | Payment data / provider fields |
| DevOps/DBA | Backup, PITR, performance |
| Normativa trasporto | Evidence/document retention ops |

## 153. Roadmap

1. **Data Foundation** — conventions, tenancy, audit/event skeletons
2. **Identity & Tenant**
3. **Booking & Operations**
4. **Partner & Marketplace**
5. **Finance Foundation**
6. **Analytics** (projections)
7. **International Data**
8. **Scale Evolution** (partitioning/extraction only if justified)

---

## Cronologia revisioni

| Versione | Data | Autore | Descrizione modifica | Stato |
|----------|------|--------|----------------------|-------|
| 0.1.0 | 2026-07-26 | MyChauffeur OS Team | Prima stesura Data Architecture Framework; PostgreSQL/Supabase shared DB come CTD; entity catalog 14–111. | Draft |

---

*Fine MC-OS-027 v0.1.0 — Draft. Nessun SQL, migration o modifica database.*

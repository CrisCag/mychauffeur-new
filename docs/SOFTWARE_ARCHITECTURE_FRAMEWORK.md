# MyChauffeur OS — Software Architecture Framework

| Campo | Valore |
|-------|--------|
| **Codice documento** | MC-OS-026 |
| **Titolo** | Software Architecture Framework |
| **Versione** | 0.1.0 |
| **Stato** | Draft |
| **Data creazione** | 2026-07-26 |
| **Ultima modifica** | 2026-07-26 |
| **Owner** | Software Architecture & Platform Engineering |
| **Autori** | MyChauffeur OS Team |
| **Documenti correlati** | MC-OS-000 · MC-OS-001 · MC-OS-009 · MC-OS-011 · MC-OS-019 · MC-OS-020 · MC-OS-021 · MC-OS-022 · MC-OS-023 · MC-OS-024 · MC-OS-025 · MC-OS-014 · MC-OS-015 · PLATFORM_MAP · HANDOFF |
| **Dipendenze** | Architecture Baseline Freeze B001 (MC-OS-025); System Domain Architecture; Event Catalog; ADR Index |
| **Classificazione** | Official Software Architecture Framework — Draft |
| **Baseline di riferimento** | **B001** (MC-OS-025) |
| **Documentation Release** | 0.1 (allineamento previsto) |

---

## Avvertenza

Questo documento è la **Source of Truth della Software Architecture** di MyChauffeur OS.

**Non** è: codice, SQL definitivo, OpenAPI definitiva, scelta di provider, Draw.io, né supersessione della Baseline B001.

I nomi di Domain, Bounded Context, Layer, Module, Package, Aggregate, Entity, Value Object, Command, Query, Event, Service, Repository, Adapter, Port, DTO restano in **inglese**. Il testo normativo è in **italiano**.

**Scelta tecnica raccomandata iniziale:** Modular Monolith.
Formalizzazione ADR: **CANDIDATE TECHNICAL DECISION** (ADR-OPEN-013 resta OPEN).

---

## Source of Truth

**MC-OS-026** governa layering, moduli, dipendenze e confini software.

- Domini / BC → MC-OS-019
- Eventi → MC-OS-020
- Config → MC-OS-021
- AI → MC-OS-022
- ADR → MC-OS-024
- Freeze → MC-OS-025 (B001)

---

## 1. Scopo

Trasformare la Baseline B001 in Software Architecture implementabile: modulare, testabile, sicura, manutenibile, scalabile, coerente con i Bounded Context, adatta all’MVP, evolvibile senza premature microservices.

## 2. Relazione con Baseline B001

B001 (MC-OS-025) congela SoT e ADR Active. Questo framework non modifica il comportamento funzionale B001: definisce come strutturare il software per rispettarlo. Violazioni richiedono ADR e, se rilevante, bump Baseline (B002+).

## 3. Architecture Drivers

| Driver | Impatto |
|--------|--------|
| Multi-tenant | Tenant Context, isolation |
| B2C / B2B / Corporate | channel/config/pricing |
| Partner Exchange | Marketplace Module, disclosure |
| Financial correctness | Ledger append-only; Payment≠Settlement≠Payout |
| Auditability | Audit Boundary |
| Configurabilità | Configuration Module |
| Internazionalizzazione | locale/timezone/currency |
| Premium reliability | fail-safe |
| Progressive Data Disclosure | enforcement Application |
| Modular evolution | Module Contracts |
| Small-team operability | Modular Monolith |
| Low operational overhead | no mesh/K8s obbligatori MVP |

## 4. Quality Attributes

Modifiability, Maintainability, Security, Privacy, Reliability, Availability, Auditability, Testability, Performance, Scalability, Portability, Observability, Recoverability, Interoperability. Priorità MVP: Security, Auditability, Modifiability, Testability, Reliability.

## 5. Architectural Style Decision

| Stile | Valutazione |
|-------|-------------|
| Traditional Monolith | Accoppiamento alto |
| **Modular Monolith** | **Raccomandato** |
| Microservices | Prematuro |
| Serverless Functions | Job isolati, non stile globale |
| Hybrid | Post-extraction selettiva |

**Modular Monolith** = un deployable + confini interni rigorosi. Formalizzazione ADR: **CANDIDATE TECHNICAL DECISION** (ADR-OPEN-013 resta OPEN).

## 6. Modular Monolith Principles

Un application deployable; Module ownership; public export only; no import internals; Domain indipendente; eventi per side-effect cross-module; fitness checks.

## 7. Criteria for Future Service Extraction

Estrarre solo se: independent scaling; different reliability profile; separate deployment need; separate team ownership; distinct data lifecycle; regulatory isolation; high integration load; persistent operational bottleneck. Sempre via ADR. Criteri non numerici.

## 8. Bounded Context Mapping

I 21 BC di MC-OS-019: Identity, Customer, Booking, Marketplace, Partner, Dispatch, Fleet, Pricing, Finance, Settlement, Payment, Notification, Support, Compliance, Configuration, Analytics, AI, Document, Media, Integration, Administration. Operations/Trip → Booking ownership.

## 9. Module Taxonomy

Core: bookings, marketplace, pricing, settlement, partners. Supporting: identity, customers, fleet, dispatch, notifications, support. Generic: configuration, documents, media. Platform: administration, shared. Integration: integrations.

## 10. Recommended Initial Module Set

Moduli: identity, organizations, customers, bookings, operations, dispatch, fleet, partners, marketplace, pricing, payments, settlement, finance, notifications, support, compliance, configuration, analytics, ai, documents, integrations, administration.

Condivisioni ammesse: bookings+operations (aggregate distinti); finance+settlement stesso deployable senza fondere Ledger/Payout; documents+media storage adapter condiviso. Evitare 21 micro-package prematuri.

## 11. Layered Architecture

Presentation → Application → Domain ← Infrastructure (verso Port). Integration affianca Infrastructure per esterni.

## 12. Clean Architecture

Dipendenze verso il Domain. Use Case in Application. Framework/DB esterni. Domain testabile senza UI/DB.

## 13. Hexagonal Architecture

Centro Domain+Application; Port inbound/outbound; Adapter UI/HTTP/DB/PSP. Usare dove riduce coupling, non ovunque per dogma.

## 14. Ports and Adapters

Port = interfaccia Application/Domain. Adapter = Infrastructure/Presentation/Integration. SDK solo negli Adapter.

## 15. Dependency Direction

Presentation → Application → Domain. Infrastructure → Application/Domain Ports. Domain non dipende da Infrastructure, Next.js, DB client o provider SDK.

## 16. Dependency Rules

1) Solo public contract cross-module. 2) Domain senza framework. 3) Application orchestra, non invarianti Aggregate. 4) Infrastructure implementa Port. 5) Shared Kernel minimo.

## 17. Forbidden Dependencies

Domain→Infrastructure/Next.js/Supabase/payment SDK/notification SDK; Module internals→internals altrui; Analytics/AI→Aggregate write; UI→persistence diretta; route handler→business rule complessa; DB model come DTO pubblico; cross-tenant access; Ledger overwrite.

## 18. Module Public Contract

Esporta commands/queries/event subscriptions. Niente Domain Entity mutabili grezze verso altri Module.

## 19. Module Internal Boundary

domain/application/infrastructure interni; fuori solo via contract.

## 20. Shared Kernel Policy

Solo ID stabili, Money, CurrencyCode, CorrelationId, AssignmentMode, TenantId.

## 21. Published Language

Integration Event e DTO di confine versionati (MC-OS-020).

## 22. Anti-Corruption Layer

Integration traduce PSP/maps/messaging nel linguaggio interno.

## 23. Open Host Service

Identity authz, Configuration resolve, Notification enqueue, Booking status query.

## 24. Application Contracts

Input/output DTO, errori tipizzati, idempotency key dove serve.

## 25. Use Case Model

Una intenzione applicativa; ownership per Module.

## 26. Command Model

Intenzione di modifica (imperativo).

## 27. Query Model

Lettura senza side effect.

## 28. Command Handler

Load Aggregate → Domain → persist Port → publish events.

## 29. Query Handler

Sola lettura; nessun Domain Event di scrittura.

## 30. CQRS Policy

Nessun CQRS globale. Separazione Command/Query concettuale. Read Model solo se giustificato. Stessa DB ammessa in MVP. Split futuro via ADR.

## 31. Event-Driven Communication

Side effect cross-module via eventi MC-OS-020.

## 32. Synchronous Communication

Verso Port pubblici senza side-effect nascosti.

## 33. Asynchronous Communication

Job/outbox/queue — tech OPEN.

## 34. Internal Domain Events

Privati al Module.

## 35. Integration Events

Pubblici cross-module; payload minimo; versionati.

## 36. Event Publication Boundary

Dopo commit invarianti (o outbox). Producer = owner.

## 37. Event Consumption Boundary

Solo proprio modello; idempotente; no write Aggregate altrui.

## 38. Transactional Outbox Readiness

Pattern raccomandato; implementazione OPEN.

## 39. Eventual Consistency

Default cross-module; forte solo in Aggregate transaction.

## 40. Transaction Boundary

Esplicita per Use Case di scrittura.

## 41. Unit of Work Boundary

Coordina persistenza Aggregate + outbox.

## 42. Aggregate Transaction Rule

Una TX → un Aggregate Root principale. Multi-Aggregate → orchestrazione esplicita.

## 43. Saga / Process Manager Policy

Solo workflow lunghi: booking-to-payment; booking-to-assignment; Exchange; settlement-to-payout; recovery; dispute. Tech non imposta.

## 44. Aggregate Design

Consistency boundary; invarianti interni; ref per ID.

## 45. Entity Design

Identità; mutabilità controllata.

## 46. Value Object Design

Immutabili; uguaglianza per valore.

## 47. Domain Service Design

Logica multi-Entity nello stesso BC.

## 48. Application Service Design

Orchestrazione Use Case, authz, TX, eventi.

## 49. Repository Pattern

Port persistenza Aggregate; non query report generiche.

## 50. Repository Boundary

Niente Repository condiviso cross-module.

## 51. Persistence Independence

Domain/Application senza SQL/ORM vendor.

## 52. Domain Model vs Persistence Model

Separati; mapping in Infrastructure.

## 53. Mapping Policy

Infra↔Domain; DTO↔Application; no leak Persistence in API pubblica.

## 54. DTO Policy

DTO ≠ Domain Entity.

## 55. Validation Layers

Syntactic → Application → Domain invariant → Compliance → External provider.

## 56. Error Model

Errori tipizzati.

## 57. Domain Error

Violazione invariante/business.

## 58. Application Error

Authz, not found, conflict, validation.

## 59. Infrastructure Error

Timeout, provider, persistence.

## 60. User-facing Error

Sicuro, localizzato; no leak.

## 61. Error Translation

Infra/Domain → Application → Presentation.

## 62. Idempotency

Obbligatoria su side effect.

## 63. Concurrency Control

aggregate_version su Aggregate critici.

## 64. Optimistic Concurrency

Preferita in MVP.

## 65. Duplicate Request Handling

Dedup idempotency_key/event_id.

## 66. Retry Policy Boundary

Solo transient + idempotenti; limiti OPEN.

## 67. Timeout Boundary

Su Port esterni; fail-safe.

## 68. Circuit Breaker Readiness

Concettuale; tech OPEN.

## 69. External Provider Abstraction

Sempre dietro Port/Adapter.

## 70. Provider Adapter

Implementa Port; contiene SDK.

## 71. Payment Provider Boundary

Solo payments Adapter; provider OPEN.

## 72. Notification Provider Boundary

Solo notifications; provider OPEN.

## 73. Storage Provider Boundary

Object storage Port; tech OPEN.

## 74. Geocoding and Maps Boundary

Integration/ACL; VO risultati.

## 75. Flight Tracking Boundary

Integration Adapter se presente.

## 76. Integration Boundary

Inbound/outbound via Integration + ACL.

## 77. Webhook Boundary

Firma, idempotency, ACL; Use Case per write.

## 78. Configuration Integration

Resolve MC-OS-021; no hardcode.

## 79. Feature Flag Integration

Flag ≠ Business Rule.

## 80. Secret Management Boundary

Fuori business Configuration Store.

## 81. Identity Integration

Contracts MC-OS-015.

## 82. Authorization Boundary

Deny by default in Application.

## 83. Tenant Isolation Boundary

Tenant Context; no cross-tenant.

## 84. Audit Boundary

Append-only sensibili.

## 85. PII Boundary

Minimization; classification.

## 86. Progressive Data Disclosure Boundary

Enforcement Application/Marketplace.

## 87. Financial Integrity Boundary

XOR costi; no double-count; guardrail.

## 88. Ledger Boundary

Append-only; reversal; Event≠Ledger Entry.

## 89. Payment / Settlement / Payout Separation

Moduli e stati distinti.

## 90. AI Boundary

Recommendation; no Aggregate write.

## 91. Analytics Boundary

Read projections; no write SoT.

## 92. Notification Boundary

Evaluation ≠ send.

## 93. Document Boundary

Evidence/metadata ownership.

## 94. Media Boundary

Storage refs + access policy.

## 95. Background Jobs

Eseguono Use Case; no logica sparsa.

## 96. Scheduler

Trigger → Command; tech OPEN.

## 97. Queue Readiness

Opzionale MVP; tech OPEN.

## 98. Realtime Boundary

Adapter push; Domain SoT.

## 99. Cache Boundary

Config/read models; tech OPEN.

## 100. Search Boundary

Read-side; non sostituisce Aggregate.

## 101. File and Object Storage Boundary

Port storage; tech OPEN.

## 102. Logging

Structured; correlation; PII redaction.

## 103. Observability

Logs+metrics+traces; stack OPEN.

## 104. Metrics

Latency, errors, queue, provider.

## 105. Tracing

trace_id/causation_id.

## 106. Audit Logging vs Technical Logging

Audit business vs diagnostica.

## 107. Security Logging

Authn fail, deny, break-glass.

## 108. Performance Principles

Misurare path critici prima di distribuire.

## 109. Scalability Principles

Modulare prima; extraction con §7.

## 110. Reliability Principles

Fail-safe; idempotency; timeout.

## 111. Availability Principles

Degrade non-critical; preserva finance.

## 112. Graceful Degradation

Maps/AI down non corrompe confirm se policy ok.

## 113. Failure Isolation

Adapter failure ≠ Domain corrupt.

## 114. Recovery Principles

Replay/retry senza duplicate money effects.

## 115. Testability Principles

Domain senza DB/UI; Port mock.

## 116. Testing Pyramid Boundary

Unit>Integration>Contract>E2E. Testing Architecture = doc futuro.

## 117. Unit Test Boundary

Domain + Application con fake Port.

## 118. Integration Test Boundary

Adapter + test doubles.

## 119. Contract Test Boundary

Module contract + Integration Event schema.

## 120. End-to-End Test Boundary

Pochi flussi critici.

## 121. Architecture Test Boundary

Forbidden imports; module/layer; naming; public contract. Tooling OPEN.

## 122. Package and Folder Principles

Module = cartella sotto modules/; layer interni; public export unico; shared/ = Shared Kernel; platform/ cross-cutting; integrations/ ACL.

## 123. Proposed Logical Folder Structure

Target (non creare ora):

```text
src/
  modules/
    bookings/
      domain/
      application/
      infrastructure/
      presentation/
      index.ts
  platform/
  shared/
  integrations/
```

App Router può restare in `app/` come Presentation adapter. Migrazione non immediata obbligatoria.

## 124. Next.js Boundary

Next.js = Presentation/hosting adapter; non Domain.

## 125. Server Component Boundary

UI read via Query contracts; no invarianti Domain.

## 126. Client Component Boundary

UX only; chiama API/Server Action.

## 127. Route Handler Boundary

HTTP adapter → Use Case. Policy OPEN.

## 128. Server Action Boundary

Command adapter; stessi vincoli. Policy OPEN.

## 129. UI Component Boundary

Presentational; no persistence; no Domain import.

## 130. Domain Logic in Frontend

Vietata business logic canonica nei componenti React.

## 131. API-first vs Application-first

Application Use Case al centro; API e UI sono adapter.

## 132. Modular Public Exports

Solo index pubblico; deep import vietato.

## 133. Dependency Injection

Composition Root Port→Adapter; tech OPEN.

## 134. Factory and Composition Root

Bootstrap server + test composition.

## 135. Runtime Composition

Wiring a bootstrap; no service locator nel Domain.

## 136. Environment Separation

dev/test/staging/production.

## 137. Build-time vs Runtime Configuration

Business config runtime via Configuration Module.

## 138. Multi-tenancy Architecture

Shared app + isolation logica; DB-per-tenant OPEN.

## 139. Tenant Context Propagation

TenantId su request ed eventi applicabili.

## 140. Organization Context Propagation

Active organization context multi-org.

## 141. Request Context

request_id, trace_id, actor, tenant, organization, locale, timezone, currency, permissions.

## 142. Security Context

Authn + authz capabilities; deny by default.

## 143. Transaction Context

UoW correlato al Use Case write.

## 144. Correlation Context

correlation_id/causation_id (MC-OS-020).

## 145. Software Architecture Matrices

1. **Module Ownership** — §10 + MC-OS-019
2. **Layer Dependency** — Presentation→Application→Domain; Infra→Ports
3. **Allowed Dependency** — public contracts; same-module Application→Domain
4. **Forbidden Dependency** — §17
5. **Domain-to-Module Mapping** — Booking→bookings/operations; Payment→payments; …
6. **Module Public Contract** — commands/queries/events esposti
7. **Use Case Ownership** — ConfirmBooking→bookings; CapturePayment→payments; …
8. **Event Communication** — producer→consumers MC-OS-020
9. **Transaction Boundary** — single Aggregate default; saga §43
10. **Provider Adapter** — PSP/payments; messaging/notifications; maps/integrations
11. **Data Classification Boundary** — NONE/MIN/PSEUDO/SENSITIVE
12. **Test Boundary** — unit/integration/contract/E2E
13. **Architecture Fitness Check** — imports/layers/modules
14. **Future Extraction Candidate** — payments, notifications, marketplace se §7

## 146. Architecture Decision Process

Proposta → review → ADR (MC-OS-024) → implementazione.

## 147. ADR Integration

Stile/tech rilevanti → ADR. Non chiude ADR-OPEN-013.

## 148. Architecture Review Process

PR su public contract, layering, Adapter, Integration Event.

## 149. Architecture Exception Process

Eccezioni temporanee con expiry e piano rientro.

## 150. Technical Debt Governance

No bypass boundary senza tracking/ADR.

## 151. Architecture Fitness Functions

Check concettuali su import graph; tooling OPEN.

## 152. Evolution Strategy

Modular Monolith → selective extraction → hybrid. No big-bang microservices.

## 153. MVP Simplicity Rules

Stessa deployable app; stessa DB platform; no broker obbligatorio; no distributed TX; no service mesh; no K8s obbligatorio; no Event Sourcing globale; no CQRS globale; adapter solo con variabilità reale; automazione incrementale; isolation prima della distribuzione.

## 154. Extraction Strategy

Contract stabile + data ownership + ops readiness + ADR.

## 155. Migration Strategy

Strangler: nuovi Use Case in modules/; legacy delegano; no rewrite totale.

## 156. Legacy Integration Strategy

JSON/booking API esistenti via ACL fino a cutover.

## 157. Current Repository Assessment

| Area | Nota |
|------|------|
| App Router | Presentation dominante |
| API booking | Application/persistence accoppiati |
| JSON runtime | Non Domain-centric |
| Driver portal | Coupling risk |
| Pricing functions | Rischio fuori Module Pricing |
| Booking flow | Da avvolgere con Use Case |
| Tests | Livelli misti |
| Coupling | UI↔lib↔JSON; no Module contracts |

## 158. Gap Analysis

Mancano Module boundaries, Domain isolato, outbox, fitness checks, docs Security/Data/API, RLS, payment module reale.

## 159. Target Architecture Candidate

Modular Monolith + modules/* + shared minimo + integrations ACL + Config/Event/Audit foundations. Stato CANDIDATE.

## 160. OS Foundation Architecture

identity, organization, customer, booking, service, assignment, driver, vehicle, configuration foundation, event envelope, audit.

## 161. Deferred Architecture

payment execution; payout; tax engine; complete Exchange; AI automation; distributed bus; advanced analytics; microservices.

## 162. Implementation Sequence

1 Module skeleton+fitness 2 Identity/Org/Customer 3 Booking/Service/Assignment+events 4 Config+Audit 5 Fleet/Dispatch 6 Pricing ports 7 Partners/Marketplace 8 Payments/Settlement post-validation.

## 163. Architecture Definition of Done

Use Case in Application; Domain free framework; Module contract; Domain tests; eventi catalogati; no forbidden import; deny-by-default; audit write sensibili.

## 164. Decisioni approvate

Vincoli B001/ADR Active (MC-OS-024): BC separati; no cross-domain mutation; Booking≠Service≠Trip≠Assignment; XOR costi; Event≠Command≠Ledger; AI/Analytics non write SoT; Configuration over hardcoding; append-only/reversal; provider abstraction di principio. Non ridichiarate come nuovi ADR.

## 165. Decisioni OPEN

ADR-OPEN-013 Modular Monolith formale; package/workspace; src/ layout; DI; ORM; TX manager; event dispatcher; outbox; queue/cache/search/realtime/jobs; object storage; API style; validation lib; error serialization; observability; arch test tools; adapter granularity; server actions/route policy; extraction thresholds; deploy topology; Supabase role; RLS; db-per-tenant vs shared; sync vs async; monorepo; mobile boundary.

## 166. Professional and Technical Validation

CTO/Software Architect; Security Architect; Data Architect; DevOps; Privacy; PSD2/PSP; Fiscalista; Commercialista.

## 167. Roadmap

Software Architecture Foundation → Data Architecture → Security Architecture → API & Integration Architecture → Infrastructure Architecture → Testing Architecture → Implementation Foundation.


---

## Architecture State Model

`PROPOSED` · `CANDIDATE` · `APPROVED` · `IMPLEMENTED` · `DEPRECATED` · `SUPERSEDED` · `RETIRED`
(≠ stati EDGF documento)

Modular Monolith target = **CANDIDATE** fino ad ADR formale.

---

## Candidate Technical Decisions

| ID | Decisione | Stato |
|----|-----------|-------|
| CTD-001 | Modular Monolith stile iniziale raccomandato | CANDIDATE (ADR-OPEN-013) |
| CTD-002 | Application Use Case al centro; UI/API adapter | CANDIDATE |
| CTD-003 | No CQRS globale / no Event Sourcing globale | CANDIDATE MVP |
| CTD-004 | Stessa DB platform iniziale | CANDIDATE MVP |
| CTD-005 | Outbox readiness senza tech obbligatoria | CANDIDATE |

---

## Module Interaction Example

1. Presentation riceve `ConfirmBooking`
2. Application valida Actor e input
3. Booking Domain conferma Aggregate `Booking`
4. Persistenza via Repository Port
5. Emit `Booking.BookingConfirmed`
6. Handler richiede al Dispatch Module l’avvio Assignment
7. Notification Module valuta comunicazioni
8. Analytics aggiorna Read Projection
9. Nessun consumer modifica direttamente il Booking Aggregate
10. Side effect idempotenti e auditabili

---

## Cronologia revisioni

| Versione | Data | Autore | Descrizione modifica | Stato |
|----------|------|--------|----------------------|-------|
| 0.1.0 | 2026-07-26 | MyChauffeur OS Team | Prima stesura Software Architecture Framework; Modular Monolith CANDIDATE. | Draft |

---

*Fine MC-OS-026 v0.1.0 — Draft.*

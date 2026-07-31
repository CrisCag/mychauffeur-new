# MyChauffeur OS — Role, Capability and Permission Catalog

| Campo | Valore |
|-------|--------|
| **Codice documento** | MC-OS-029 |
| **Titolo** | Role, Capability and Permission Catalog |
| **Versione** | 0.1.0 |
| **Stato** | Draft |
| **Data creazione** | 2026-07-31 |
| **Ultima modifica** | 2026-07-31 |
| **Owner** | Identity, Authorization & Product Operations |
| **Autori** | MyChauffeur OS Team |
| **Documenti correlati** | MC-OS-000 · MC-OS-001 · MC-OS-009 · MC-OS-011 · MC-OS-012 · MC-OS-014 · MC-OS-015 · MC-OS-016 · MC-OS-025 (Baseline **B001**) · MC-OS-026 · MC-OS-027 · MC-OS-028 |
| **Dipendenze** | Identity Framework (MC-OS-015); Security Architecture (MC-OS-028); Partner Exchange (MC-OS-012); Booking Lifecycle (MC-OS-014); Software/Data Architecture (MC-OS-026/027); Glossary (MC-OS-009); Entity Model (MC-OS-011); Baseline Freeze B001 (MC-OS-025) |
| **Classificazione** | Official Product & Authorization Catalog — Draft |
| **Documentation Release** | 0.1 (allineamento previsto) |
| **Baseline** | **B001** (MC-OS-025 Architecture Baseline Freeze v1) |

---

## Avvertenza

Questo documento è un **catalogo ufficiale di prodotto e Authorization**.  
Non è codice, non è schema SQL, non contiene seed eseguibili, non è policy RLS, non è specifica API.

I nomi tecnici di Entity, Role, Capability, Permission, Scope, Engine, Event, State e componenti software restano in **inglese**. Il testo normativo è in **italiano**.

Questo catalogo guida direttamente **OS Foundation — Step 4 — Authorization Engine Foundation**.

---

## Source of Truth

**MC-OS-029** è la Source of Truth implementabile per:

- Actor;
- Role (template MVP e futuri);
- Capability;
- Permission (catalogo atomico);
- Scope;
- Data Visibility;
- Assignment governance (confini vs Matching / Reputation / Risk);
- Feedback / Score types (governance, non formule numeriche);
- Authorization Decision (input/output/reason code);
- Permission Matrix MVP.

**MC-OS-015** resta Source of Truth di Identity & Access Governance (Person, User, Membership, principi Identity).  
**MC-OS-028** resta Source of Truth di Security Architecture.  
In caso di conflitto su Role/Permission/Scope/Data Visibility/Authorization Decision Catalog, prevale **MC-OS-029**.

---

## Indice

1. [Scopo](#1-scopo)
2. [Definizioni semplici](#2-definizioni-semplici)
3. [Principi obbligatori](#3-principi-obbligatori)
4. [Actor da modellare](#4-actor-da-modellare)
5. [Role MVP](#5-role-mvp)
6. [Role futuri](#6-role-futuri)
7. [Permission Catalog Foundation](#7-permission-catalog-foundation)
8. [Scope Model](#8-scope-model)
9. [Data Visibility Model](#9-data-visibility-model)
10. [Permission Matrix MVP](#10-permission-matrix-mvp)
11. [Company Owner Matrix](#11-company-owner-matrix)
12. [Dispatcher Matrix](#12-dispatcher-matrix)
13. [Driver Matrix](#13-driver-matrix)
14. [Company Finance Matrix](#14-company-finance-matrix)
15. [Platform Admin Matrix](#15-platform-admin-matrix)
16. [Support Operator Matrix](#16-support-operator-matrix)
17. [Operazioni sensibili](#17-operazioni-sensibili)
18. [Use Case → Permission Matrix](#18-use-case--permission-matrix)
19. [Authorization Decision Input](#19-authorization-decision-input)
20. [Authorization Decision Output](#20-authorization-decision-output)
21. [Assignment Architecture](#21-assignment-architecture)
22. [Assignment Modes](#22-assignment-modes)
23. [Eligibility Filter](#23-eligibility-filter)
24. [Matching Score](#24-matching-score)
25. [Feedback Sources](#25-feedback-sources)
26. [Score Types](#26-score-types)
27. [Funzioni del Feedback](#27-funzioni-del-feedback)
28. [Protezione Feedback](#28-protezione-feedback)
29. [Implementation Phases](#29-implementation-phases)
30. [Decisioni approvate](#30-decisioni-approvate)
31. [Decisioni OPEN](#31-decisioni-open)
32. [Implementation Readiness](#32-implementation-readiness)
33. [Cronologia revisioni](#33-cronologia-revisioni)

---

## 1. Scopo

Il presente catalogo stabilisce, in forma implementabile:

- **chi** utilizza la piattaforma (Actor);
- **quali funzioni** può svolgere (Capability);
- **quali Permission** possiede (Permission atomiche);
- **su quali dati** valgono (Scope);
- **quali informazioni** può vedere (Data Visibility);
- **quali azioni** devono essere negate (Deny by Default).

Obiettivo operativo: fornire la specifica di prodotto per lo **Authorization Engine** dello Step 4, senza implementare codice in questa sessione.

---

## 2. Definizioni semplici

| Concetto | Definizione |
|----------|-------------|
| **Actor** | La persona o figura che utilizza la piattaforma. |
| **Role** | Un insieme configurabile di Permission. Non è comportamento applicativo hardcoded. |
| **Capability** | Una funzione di business (es. assegnare un Driver). |
| **Permission** | Il permesso tecnico atomico (es. `assignment.manage`). |
| **Scope** | Indica su quali dati vale la Permission. |
| **Data Visibility** | Indica quali informazioni l’utente può vedere all’interno dello Scope autorizzato. |
| **Authorization** | Decisione server-side se l’azione richiesta è `ALLOWED` o `DENIED`. |

Distinzioni obbligatorie:

- Actor ≠ Role ≠ Capability ≠ Permission;
- Permission ≠ Scope ≠ Data Visibility;
- UI visibility ≠ Authorization;
- RLS ≠ Application Authorization (complementari; RLS non sostituisce il controllo Application).

---

## 3. Principi obbligatori

| ID | Principio |
|----|-----------|
| RCP-01 | Una **Person** può avere più **Role** (via Membership / Assignment di Role). |
| RCP-02 | Il **Role** non è hardcoded nel comportamento applicativo. |
| RCP-03 | Il **Role** non concede Permission implicite. |
| RCP-04 | La **Permission** è atomica. |
| RCP-05 | Lo **Scope** è separato dalla Permission. |
| RCP-06 | La **Data Visibility** è separata dalla Permission. |
| RCP-07 | **Deny by Default**. |
| RCP-08 | Assenza di Permission = operazione **negata**. |
| RCP-09 | Il controllo avviene nel **server / Application Layer**. |
| RCP-10 | La sola visibility UI **non** equivale ad Authorization. |
| RCP-11 | **RLS** non sostituisce Application Authorization. |
| RCP-12 | Nessuna wildcard globale (`*`). |
| RCP-13 | Nessun super-admin implicito. |
| RCP-14 | Ogni accesso sensibile deve poter essere **auditato**. |
| RCP-15 | **CompanyOwner** limitato alla propria Organization (nessuna Permission PLATFORM automatica). |
| RCP-16 | **Driver** limitato ai Service assegnati (`ASSIGNED_SERVICES`). |
| RCP-17 | **PlatformAdmin** usa solo Permission PLATFORM **esplicite**. |

---

## 4. Actor da modellare

Per ciascun Actor: descrizione, responsabilità, Capability consentite/vietate, Scope tipico, Data Visibility, dati riservati, fase, Role suggeriti, Permission associate (sintesi). I dettagli normativi della Matrix MVP sono nelle sezioni 10–16.

### 4.1 CompanyOwner — MVP

| Campo | Valore |
|-------|--------|
| Descrizione | Titolare dell’azienda. |
| Responsabilità | Controlla Organization, Membership, Role, operazioni e finance della propria azienda. |
| Capability consentite | Governance Organization; Membership; Role assignment; Booking/Service/Assignment; fleet; pricing; finance org. |
| Capability vietate | Amministrazione piattaforma; bypass Authorization; impersonation. |
| Scope | `ORGANIZATION`, `FINANCIAL_ORGANIZATION` |
| Data Visibility | `FULL` operativo/economico org; `INTERNAL_ONLY` su audit org |
| Dati riservati | Nessun accesso automatico PLATFORM / altri Tenant |
| Fase | **MVP** |
| Role suggeriti | `CompanyOwner` |
| Permission | Vedi §11 |

### 4.2 Dispatcher — MVP

| Campo | Valore |
|-------|--------|
| Descrizione | Coordina Booking, Service, Driver, Vehicle e Assignment. |
| Responsabilità | Operatività quotidiana della Organization. |
| Capability consentite | Booking/Service/Assignment operativi; lettura Driver/Vehicle; contatto Customer limitato. |
| Capability vietate | `role.manage`, `permission.assign`, `platform.*`, finance completa, audit completo (default). |
| Scope | `ORGANIZATION` |
| Data Visibility | Operativo completo; economico limitato; Margin/Platform Fee/fiscali non di default |
| Dati riservati | Margin, Platform Fee, dati fiscali, audit completo |
| Fase | **MVP** (alcune visibility OPEN) |
| Role suggeriti | `Dispatcher` |
| Permission | Vedi §12 |

### 4.3 Driver — MVP

| Campo | Valore |
|-------|--------|
| Descrizione | Esegue solo i Service assegnati. |
| Responsabilità | Accettazione/rifiuto Assignment; status Service; disponibilità propria. |
| Capability consentite | Operazioni sui soli Service assegnati; contatto Customer masked/progressive. |
| Capability vietate | Dispatch altrui; finance; pricing; membership/role; altri Driver/Service. |
| Scope | `ASSIGNED_SERVICES`, `OWN_RECORDS` |
| Data Visibility | `OPERATIONAL_ONLY`, `MASKED`, `PROGRESSIVE` |
| Dati riservati | Customer Price, Margin, Platform Fee, Payment, Settlement, Payout, fiscali |
| Fase | **MVP** |
| Role suggeriti | `Driver` |
| Permission | Vedi §13 |

### 4.4 CompanyFinance — MVP

| Campo | Valore |
|-------|--------|
| Descrizione | Gestisce funzioni economiche autorizzate della Organization. |
| Responsabilità | Lettura finance/payment/settlement/payout/invoice; reconciliation. |
| Capability consentite | Finance dashboard e documenti economici org. |
| Capability vietate | Dispatch operativo; role/permission; platform.*; status Service. |
| Scope | `FINANCIAL_ORGANIZATION` |
| Data Visibility | `FINANCIAL_OWN` |
| Dati riservati | Operazioni di guida/dispatch |
| Fase | **MVP** (refund OPEN) |
| Role suggeriti | `CompanyFinance` |
| Permission | Vedi §14 |

### 4.5 PlatformAdmin — MVP

| Campo | Valore |
|-------|--------|
| Descrizione | Amministra MyChauffeur OS con Permission PLATFORM esplicite. |
| Responsabilità | Tenant/org platform ops, compliance, configuration, security incident, audit. |
| Capability consentite | Solo Permission `platform.*` e `audit.read` esplicite. |
| Capability vietate | Impersonation automatica; modifica diretta Ledger Entry; bypass silenzioso. |
| Scope | `PLATFORM` |
| Data Visibility | `INTERNAL_ONLY` / least privilege |
| Dati riservati | Accesso finanziario separato e non implicito |
| Fase | **MVP** (impersonation OPEN) |
| Role suggeriti | `PlatformAdmin` |
| Permission | Vedi §15 |

### 4.6 SupportOperator — MVP

| Campo | Valore |
|-------|--------|
| Descrizione | Assiste utenti/aziende sui soli Support Case assegnati. |
| Responsabilità | Letture limitate correlate al case; contatto masked; evidence candidate. |
| Capability consentite | Accesso `CASE_ASSIGNED`; letture limitate booking/service/customer. |
| Capability vietate | pricing.manage; finance completo; payout; role/permission; platform.configuration.manage; modifiche non collegate al case. |
| Scope | `CASE_ASSIGNED` |
| Data Visibility | `LIMITED`, `MASKED` |
| Dati riservati | Finance completa, payout, configurazione piattaforma |
| Fase | **MVP** (READY WITH OPEN) |
| Role suggeriti | `SupportOperator` |
| Permission | Vedi §16 |

### 4.7 OriginatingPartner — PHASE 2 / FUTURE

Pubblica Exchange Listing; mantiene Customer Price; non espone automaticamente il prezzo all’Executing Partner. Scope tipici: `PARTNER_OWN`, `EXCHANGE_ELIGIBLE`. Role Exchange futuri — **non** nel seed Step 4.

### 4.8 ExecutingPartner — PHASE 2 / FUTURE

Esegue servizi Exchange accettati; vede Exchange Price / Executor Net secondo regole MC-OS-012; non vede Customer Price di default.

### 4.9 PartnerManager — PHASE 2 / FUTURE

Coordina operazioni Partner (membership/ops partner), distinto da CompanyOwner generico.

### 4.10 PartnerDriver — PHASE 2 / FUTURE

Driver nel contesto Partner Exchange; Scope `ASSIGNED_SERVICES` + vincoli Exchange.

### 4.11 Reviewer — PHASE 2 / FUTURE

Gestisce Review Case, Evidence, approve/dispute service (Permission `review.*`).

### 4.12 CorporateManager — PHASE 2 / FUTURE

Amministra Corporate Account e policy travel.

### 4.13 CorporateBooker — PHASE 2 / FUTURE

Crea Booking corporate nello Scope autorizzato.

### 4.14 TravelAgent — PHASE 2 / FUTURE

Prenota per conto clienti agenzia; Scope `OWN_RECORDS` / org agency.

### 4.15 Customer — PHASE 2 / FUTURE

End Customer portale; Scope `CUSTOMER_OWN`.

### 4.16 Passenger — PHASE 2 / FUTURE

Passeggero del Service; dati progressivi; non è necessariamente User con Role operativo.

---

## 5. Role MVP

I seguenti Role sono **template iniziali configurabili**. Non costituiscono comportamento applicativo hardcoded. L’Authorization Engine valuta **Permission + Scope + Data Visibility**, non il nome del Role.

| Role | Spiegazione semplice |
|------|----------------------|
| **CompanyOwner** | Titolare dell’azienda, con controllo completo della propria Organization. |
| **Dispatcher** | Coordina Booking, Service, Driver, Vehicle e Assignment. |
| **Driver** | Vede ed esegue esclusivamente i Service assegnati. |
| **CompanyFinance** | Consulta e gestisce le funzioni economiche autorizzate della propria Organization. |
| **PlatformAdmin** | Amministra MyChauffeur OS tramite Permission globali esplicite e audit obbligatorio. |
| **SupportOperator** | Assiste utenti e aziende limitatamente ai Support Case assegnati. |

---

## 6. Role futuri

Classificati **PHASE 2 / FUTURE**. **Non** rientrano nel primo seed implementativo dello Step 4:

- OriginatingPartner
- ExecutingPartner
- PartnerManager
- PartnerDriver
- Reviewer
- CorporateManager
- CorporateBooker
- TravelAgent
- Customer
- Passenger

---

## 7. Permission Catalog Foundation

Convenzione codice: `resource.action` (atomico). Nuove Permission richiedono **governance e review** documentale prima dell’implementazione.

### 7.1 Organization
- `organization.read`
- `organization.manage`

### 7.2 Membership
- `membership.read`
- `membership.manage`

### 7.3 Role
- `role.read`
- `role.manage`

### 7.4 Permission
- `permission.read`
- `permission.assign`

### 7.5 Booking
- `booking.read`
- `booking.create`
- `booking.update`
- `booking.cancel`

### 7.6 Service
- `service.read`
- `service.manage`
- `service.status_update`

### 7.7 Assignment
- `assignment.read`
- `assignment.manage`
- `assignment.accept`
- `assignment.reject`

### 7.8 Driver
- `driver.read`
- `driver.manage`
- `driver.availability_manage`
- `driver.availability_manage_own`

### 7.9 Vehicle
- `vehicle.read`
- `vehicle.manage`
- `vehicle.select_authorized`

### 7.10 Customer
- `customer.read`
- `customer.manage`
- `customer.contact`
- `customer.contact_masked`
- `customer.data_progressive`

### 7.11 Pricing
- `pricing.read`
- `pricing.manage`

### 7.12 Finance
- `finance.read`
- `payment.read`
- `settlement.read`
- `payout.read`
- `invoice.read`
- `reconciliation.manage`

### 7.13 Exchange (PHASE 2 catalog — documentato, non seed Step 4)
- `exchange.listing.create`
- `exchange.listing.read_eligible`
- `exchange.listing.update`
- `exchange.listing.cancel`
- `exchange.offer.create`
- `exchange.offer.read`
- `exchange.offer.accept`
- `exchange.counteroffer.create`
- `exchange.counteroffer.accept`
- `exchange.assignment.read_own`
- `exchange.assignment.monitor`
- `exchange.dispute.create`

### 7.14 Review (PHASE 2 catalog)
- `review.case.read_assigned`
- `review.evidence.read`
- `review.evidence.request`
- `review.service.approve`
- `review.service.dispute`
- `review.adjustment.propose`

### 7.15 Audit
- `audit.read`

### 7.16 Platform
- `platform.tenant.read`
- `platform.tenant.manage`
- `platform.organization.suspend`
- `platform.compliance.review`
- `platform.configuration.manage`
- `platform.security.incident.manage`

### 7.17 Candidate Extension (non implementare)
| Codice proposto | Note |
|-----------------|------|
| `evidence.read` | Proposta per SupportOperator su CASE_ASSIGNED; Candidate Extension fino a review governance. Preferire allineamento a `review.evidence.read` in fase Review. |

---

## 8. Scope Model

| Scope | Significato |
|-------|-------------|
| **PLATFORM** | Vale su tutta la piattaforma. |
| **TENANT** | Vale sul Tenant autorizzato. |
| **ORGANIZATION** | Vale solo sulla propria Organization. |
| **OWN_RECORDS** | Vale solo sui dati creati o posseduti dall’utente. |
| **ASSIGNED_SERVICES** | Vale soltanto sui Service assegnati al Driver (o actor assegnato). |
| **PARTNER_OWN** | Vale sui dati Partner di proprietà dell’attore. |
| **CUSTOMER_OWN** | Vale sui dati Customer di proprietà dell’attore. |
| **CASE_ASSIGNED** | Vale solo sui Support Case assegnati all’operatore. |
| **EXCHANGE_ELIGIBLE** | Vale sulle Exchange Listing/offer per cui l’attore è eligible. |
| **FINANCIAL_ORGANIZATION** | Vale sui dati economici della propria Organization. |

**Regola:** lo stesso codice Permission può produrre risultati diversi in base allo Scope.

Esempi:

| Combinazione | Effetto |
|--------------|---------|
| `booking.read` + `ORGANIZATION` | Lettura Booking della propria Organization. |
| `booking.read` + `OWN_RECORDS` | Lettura solo dei propri Booking. |
| `service.read` + `ASSIGNED_SERVICES` | Il Driver legge soltanto i Service assegnati. |

---

## 9. Data Visibility Model

| Visibility | Significato |
|------------|-------------|
| **FULL** | Accesso completo ai dati autorizzati dallo Scope. |
| **LIMITED** | Solo una parte dei campi/attributi. |
| **MASKED** | Dati oscurati (es. telefono parzialmente nascosto). |
| **PROGRESSIVE** | Dati rilasciati gradualmente nel tempo / stato Service. |
| **OPERATIONAL_ONLY** | Solo dati utili all’esecuzione del Service. |
| **FINANCIAL_OWN** | Solo dati finanziari della propria Organization/posizione. |
| **INTERNAL_ONLY** | Informazioni esclusivamente interne alla piattaforma. |

### 9.1 Applicazione minima ai dati sensibili

| Dato | Regola di default (MVP) |
|------|-------------------------|
| Customer Price | Non esposto a Driver / ExecutingPartner di default; CompanyOwner FULL org; Dispatcher OPEN |
| Partner Cost | Limitato a ruoli economici/partner autorizzati |
| Executor Net | Visibile a ExecutingPartner/Finance secondo Exchange; non a Driver come Margin |
| Platform Fee | Non visibile a Dispatcher/Driver di default; INTERNAL / Finance-controlled |
| Margin | Non visibile a Dispatcher/Driver di default |
| Customer name | FULL org ops; MASKED/PROGRESSIVE per Driver |
| Customer phone | `customer.contact` / `customer.contact_masked` |
| Pickup address | OPERATIONAL / PROGRESSIVE per Driver |
| Invoice | FINANCIAL_OWN |
| Payment | FINANCIAL_OWN; non Driver |
| Settlement | FINANCIAL_OWN; non Driver |
| Payout | FINANCIAL_OWN; non Driver (salvo futuro `earnings.read_own` OPEN) |
| Audit Log | INTERNAL_ONLY; least privilege |
| Risk Score | INTERNAL_ONLY / Risk Engine; non pubblico |

---

## 10. Permission Matrix MVP

Colonne canoniche: **Actor · Role · Capability · Permission · Scope · Data Visibility · Phase · Authorization Notes**.

La matrice completa per i Role MVP è nelle sezioni 11–16. Sintesi:

| Role | Phase | Note |
|------|-------|------|
| CompanyOwner | MVP | Nessuna Permission PLATFORM implicita |
| Dispatcher | MVP | Visibility finanziarie OPEN su alcuni punti |
| Driver | MVP | Solo ASSIGNED_SERVICES / OWN_RECORDS |
| CompanyFinance | MVP | Solo FINANCIAL_ORGANIZATION |
| PlatformAdmin | MVP | Solo Permission PLATFORM esplicite |
| SupportOperator | MVP | Solo CASE_ASSIGNED |

---

## 11. Company Owner Matrix

Actor: CompanyOwner · Role: CompanyOwner · Phase: MVP

| Capability | Permission | Scope | Data Visibility | Authorization Notes |
|------------|------------|-------|-----------------|---------------------|
| Read Organization | organization.read | ORGANIZATION | FULL | — |
| Manage Organization | organization.manage | ORGANIZATION | FULL | Sensibile |
| Read Membership | membership.read | ORGANIZATION | FULL | — |
| Manage Membership | membership.manage | ORGANIZATION | FULL | Sensibile + audit |
| Read Role | role.read | ORGANIZATION | FULL | — |
| Manage Role | role.manage | ORGANIZATION | FULL | Sensibile |
| Read Permission catalog | permission.read | ORGANIZATION | FULL | Catalogo assegnabile in org |
| Assign Permission/Role grants | permission.assign | ORGANIZATION | FULL | Sensibile; OPEN vs role.manage su AssignRole |
| Read Booking | booking.read | ORGANIZATION | FULL | — |
| Create Booking | booking.create | ORGANIZATION | FULL | — |
| Update Booking | booking.update | ORGANIZATION | FULL | — |
| Cancel Booking | booking.cancel | ORGANIZATION | FULL | — |
| Read Service | service.read | ORGANIZATION | FULL | — |
| Manage Service | service.manage | ORGANIZATION | FULL | — |
| Read Assignment | assignment.read | ORGANIZATION | FULL | — |
| Manage Assignment | assignment.manage | ORGANIZATION | FULL | — |
| Read Driver | driver.read | ORGANIZATION | FULL | — |
| Manage Driver | driver.manage | ORGANIZATION | FULL | — |
| Read Vehicle | vehicle.read | ORGANIZATION | FULL | — |
| Manage Vehicle | vehicle.manage | ORGANIZATION | FULL | — |
| Read Customer | customer.read | ORGANIZATION | FULL | — |
| Manage Customer | customer.manage | ORGANIZATION | FULL | — |
| Read Pricing | pricing.read | ORGANIZATION | FULL | — |
| Manage Pricing | pricing.manage | ORGANIZATION | FULL | Sensibile |
| Read Finance | finance.read | FINANCIAL_ORGANIZATION | FULL | Sensibile |
| Read Audit | audit.read | ORGANIZATION | INTERNAL_ONLY | Sensibile |

**Vincolo:** CompanyOwner **non** possiede automaticamente Permission `platform.*`.

---

## 12. Dispatcher Matrix

Actor: Dispatcher · Role: Dispatcher · Scope tipico: ORGANIZATION · Phase: MVP

### 12.1 Consentite

| Capability | Permission | Scope | Data Visibility | Authorization Notes |
|------------|------------|-------|-----------------|---------------------|
| Read Booking | booking.read | ORGANIZATION | FULL operativo | — |
| Create Booking | booking.create | ORGANIZATION | FULL operativo | — |
| Update Booking | booking.update | ORGANIZATION | FULL operativo | — |
| Cancel Booking | booking.cancel | ORGANIZATION | FULL operativo | **Configurabile / OPEN** |
| Read Service | service.read | ORGANIZATION | FULL operativo | — |
| Manage Service | service.manage | ORGANIZATION | FULL operativo | — |
| Read Assignment | assignment.read | ORGANIZATION | FULL operativo | — |
| Manage Assignment | assignment.manage | ORGANIZATION | FULL operativo | — |
| Read Driver | driver.read | ORGANIZATION | FULL operativo | — |
| Read Vehicle | vehicle.read | ORGANIZATION | FULL operativo | — |
| Read Customer | customer.read | ORGANIZATION | LIMITED | — |
| Contact Customer | customer.contact | ORGANIZATION | LIMITED | — |
| Read Pricing | pricing.read | ORGANIZATION | LIMITED | **Configurabile / OPEN** |

### 12.2 Data Visibility

- Dati operativi: completi nello Scope ORGANIZATION.
- Informazioni economiche: **limitate**.
- **Margin**: non visibile di default.
- **Platform Fee**: non visibile.
- Dati fiscali: non visibili.
- **Customer Price**: OPEN (vedi §31).

### 12.3 Vietate di default

- `role.manage`
- `permission.assign`
- `platform.*`
- `pricing.manage`
- `finance.read`
- `payout.read`
- `audit.read` completo

---

## 13. Driver Matrix

Actor: Driver · Role: Driver · Phase: MVP

| Capability | Permission | Scope | Data Visibility | Authorization Notes |
|------------|------------|-------|-----------------|---------------------|
| Read assigned Service | service.read | ASSIGNED_SERVICES | OPERATIONAL_ONLY | — |
| Update Service status | service.status_update | ASSIGNED_SERVICES | OPERATIONAL_ONLY | — |
| Read Assignment | assignment.read | ASSIGNED_SERVICES | OPERATIONAL_ONLY | — |
| Accept Assignment | assignment.accept | ASSIGNED_SERVICES | OPERATIONAL_ONLY | — |
| Reject Assignment | assignment.reject | ASSIGNED_SERVICES | OPERATIONAL_ONLY | — |
| Manage own availability | driver.availability_manage_own | OWN_RECORDS | OPERATIONAL_ONLY | — |
| Select authorized Vehicle | vehicle.select_authorized | ASSIGNED_SERVICES | OPERATIONAL_ONLY | — |
| Contact Customer masked | customer.contact_masked | ASSIGNED_SERVICES | MASKED | — |
| Progressive Customer data | customer.data_progressive | ASSIGNED_SERVICES | PROGRESSIVE | — |

### 13.1 Non deve vedere

Customer Price; Margin; Platform Fee; altri Driver; altri Service; dati fiscali; Payment; Settlement; Payout (salvo futuro `earnings.read_own` specifico — OPEN).

---

## 14. Company Finance Matrix

Actor: CompanyFinance · Role: CompanyFinance · Scope: FINANCIAL_ORGANIZATION · Visibility: FINANCIAL_OWN · Phase: MVP

| Capability | Permission | Scope | Data Visibility | Notes |
|------------|------------|-------|-----------------|-------|
| Finance dashboard | finance.read | FINANCIAL_ORGANIZATION | FINANCIAL_OWN | Sensibile |
| Read Payment | payment.read | FINANCIAL_ORGANIZATION | FINANCIAL_OWN | — |
| Read Settlement | settlement.read | FINANCIAL_ORGANIZATION | FINANCIAL_OWN | — |
| Read Payout | payout.read | FINANCIAL_ORGANIZATION | FINANCIAL_OWN | — |
| Read Invoice | invoice.read | FINANCIAL_ORGANIZATION | FINANCIAL_OWN | — |
| Reconciliation | reconciliation.manage | FINANCIAL_ORGANIZATION | FINANCIAL_OWN | Sensibile |
| Read Booking (economic slice) | booking.read | FINANCIAL_ORGANIZATION | LIMITED | Solo dati economici necessari |

### 14.1 Vietate

`assignment.manage`; `driver.manage`; `service.status_update`; `role.manage`; `permission.assign`; `platform.*`.

Refund prepare/approve: **OPEN**.

---

## 15. Platform Admin Matrix

Actor: PlatformAdmin · Role: PlatformAdmin · Scope: PLATFORM · Phase: MVP

Consentite **solo** tramite Permission PLATFORM esplicite:

| Capability | Permission | Scope | Data Visibility | Notes |
|------------|------------|-------|-----------------|-------|
| Read Tenant | platform.tenant.read | PLATFORM | INTERNAL_ONLY | Audit |
| Manage Tenant | platform.tenant.manage | PLATFORM | INTERNAL_ONLY | Sensibile |
| Suspend Organization | platform.organization.suspend | PLATFORM | INTERNAL_ONLY | Sensibile |
| Compliance review | platform.compliance.review | PLATFORM | INTERNAL_ONLY | Audit |
| Configuration | platform.configuration.manage | PLATFORM | INTERNAL_ONLY | Sensibile |
| Security incident | platform.security.incident.manage | PLATFORM | INTERNAL_ONLY | Sensibile |
| Read Audit | audit.read | PLATFORM | INTERNAL_ONLY | Sensibile |

### 15.1 Regole

- Nessuna impersonation automatica (impersonation = OPEN).
- Accesso supportato da **reason** obbligatoria.
- Audit obbligatorio.
- Least privilege.
- Accessi finanziari **separati** (non impliciti dal Role).
- Nessuna modifica diretta alle Ledger Entry.
- Nessun bypass silenzioso dell’Authorization.

---

## 16. Support Operator Matrix

Actor: SupportOperator · Role: SupportOperator · Scope: CASE_ASSIGNED · Phase: MVP

| Capability | Permission | Scope | Data Visibility | Notes |
|------------|------------|-------|-----------------|-------|
| Access assigned case | *(case access via Scope)* | CASE_ASSIGNED | LIMITED | Enforcement Scope |
| Read Customer | customer.read | CASE_ASSIGNED | LIMITED | — |
| Read Booking | booking.read | CASE_ASSIGNED | LIMITED | — |
| Read Service | service.read | CASE_ASSIGNED | LIMITED | — |
| Contact masked | customer.contact_masked | CASE_ASSIGNED | MASKED | — |
| Evidence read | evidence.read *(Candidate)* / `review.evidence.read` | CASE_ASSIGNED | LIMITED | Candidate Extension |
| Technical audit (case) | audit.read | CASE_ASSIGNED | INTERNAL_ONLY | Limitato al case |

### 16.1 Vietate

`pricing.manage`; `finance.read` completo; `payout.*`; `role.manage`; `permission.assign`; `platform.configuration.manage`; modifiche non collegate al Support Case.

---

## 17. Operazioni sensibili

| Permission | Rischio | Scope tipico | auditRequired | MFA readiness | Human approval futura | Fase |
|------------|---------|--------------|---------------|---------------|----------------------|------|
| membership.manage | Alto | ORGANIZATION | Sì | Candidate | Possible | MVP audit; MFA OPEN |
| role.manage | Alto | ORGANIZATION | Sì | Candidate | Possible dual | MVP audit; dual OPEN |
| permission.assign | Critico | ORGANIZATION / PLATFORM | Sì | Candidate | Possible dual | MVP audit; dual OPEN |
| pricing.manage | Alto | ORGANIZATION | Sì | Candidate | Possible | MVP |
| finance.read | Alto | FINANCIAL_ORGANIZATION | Sì | Candidate | — | MVP |
| reconciliation.manage | Critico | FINANCIAL_ORGANIZATION | Sì | Candidate | Possible | MVP audit; approval OPEN |
| audit.read | Alto | ORGANIZATION / PLATFORM / CASE | Sì | Candidate | — | MVP |
| platform.tenant.manage | Critico | PLATFORM | Sì | Candidate | Possible | MVP |
| platform.organization.suspend | Critico | PLATFORM | Sì | Candidate | Possible | MVP |
| platform.configuration.manage | Critico | PLATFORM | Sì | Candidate | Possible | MVP |
| platform.security.incident.manage | Critico | PLATFORM | Sì | Candidate | Possible | MVP |

---

## 18. Use Case → Permission Matrix

| Use Case | Permission | Scope | Note |
|----------|------------|-------|------|
| CreateOrganization | organization.manage | ORGANIZATION / TENANT context | Non implementare ora |
| ReadOrganization | organization.read | ORGANIZATION | — |
| InviteOrganizationMember | membership.manage | ORGANIZATION | — |
| AssignRoleToMembership | **OPEN** | ORGANIZATION | Tra `role.manage` e/o `permission.assign` |
| ReadBooking | booking.read | dipende Actor | — |
| CreateBooking | booking.create | ORGANIZATION tipico | — |
| UpdateBooking | booking.update | ORGANIZATION tipico | — |
| CancelBooking | booking.cancel | ORGANIZATION tipico | Dispatcher cancel OPEN |
| ReadAssignedService | service.read | ASSIGNED_SERVICES | — |
| UpdateAssignedServiceStatus | service.status_update | ASSIGNED_SERVICES | — |
| AssignDriverToService | assignment.manage | ORGANIZATION | — |
| ReadFinanceDashboard | finance.read | FINANCIAL_ORGANIZATION | — |
| ReadAuditLog | audit.read | dipende Actor | — |

I Use Case **non** sono implementati in questa sessione.

---

## 19. Authorization Decision Input

Dati minimi per lo Step 4 Authorization Engine:

| Campo | Obbligatorio | Note |
|-------|--------------|------|
| actorId | Sì | — |
| userId | Sì | — |
| tenantId | Sì | — |
| organizationId | Sì* | Contesto attivo; *salvo sole operazioni PLATFORM documentate |
| authenticationState | Sì | Autenticato / no |
| requiredPermission | Sì | Codice atomico |
| grantedPermissions | Sì | Insieme risolto (senza implicite) |
| requiredScope | Sì | Scope richiesto |
| resourceTenantId | Sì | Tenant della risorsa |
| resourceOrganizationId | Sì* | Se applicabile |
| resourceOwnerId | No | Per OWN_RECORDS |
| assignedActorId | No | Per ASSIGNED_SERVICES |
| assignedCaseActorId | No | Per CASE_ASSIGNED |
| dataVisibilityRequirement | No | Visibility richiesta |
| requestId | Sì | Tracciabilità |
| correlationId | No | Correlazione cross-service |

---

## 20. Authorization Decision Output

Decisioni: **ALLOWED** | **DENIED**

| Campo | Descrizione |
|-------|-------------|
| decision | ALLOWED / DENIED |
| reasonCode | Vedi sotto |
| requiredPermission | Permission valutata |
| evaluatedScope | Scope valutato |
| missingPermissions | Lista mancanti (se DENIED) |
| auditRequired | Boolean |
| dataVisibility | Visibility applicabile se ALLOWED |
| evaluatedAt | Timestamp valutazione |

### 20.1 Reason Code minimi

- `AUTHENTICATION_REQUIRED`
- `PERMISSION_MISSING`
- `TENANT_MISMATCH`
- `ORGANIZATION_MISMATCH`
- `OWNER_SCOPE_MISMATCH`
- `ASSIGNMENT_SCOPE_MISMATCH`
- `CASE_SCOPE_MISMATCH`
- `RESOURCE_NOT_AVAILABLE`
- `ALLOWED`

---

## 21. Assignment Architecture

I cinque Engine restano **distinti** e non fusi:

| Engine | Responsabilità |
|--------|----------------|
| **Assignment Engine** | Processo concreto di assegnazione: manual, direct, sequential offer, batch offer, marketplace offer, timeout, assignment lock, reassignment, recovery. |
| **Matching Engine** | Ordina i candidati idonei. |
| **Reputation Engine** | Elabora feedback e performance. |
| **Risk Engine** | Valuta rischio, frodi e compliance. |
| **Authorization Engine** | Decide chi può eseguire un’azione (`ALLOWED`/`DENIED`). |

---

## 22. Assignment Modes

| Mode | Stato |
|------|-------|
| MANUAL_ASSIGNMENT | MVP / Foundation ops |
| DIRECT_ASSIGNMENT | MVP / Foundation ops |
| SEQUENTIAL_OFFER | Planned |
| BATCH_OFFER | Planned |
| RANKED_MARKETPLACE_OFFER | Exchange / Marketplace |
| AUTOMATIC_ASSIGNMENT_CANDIDATE | **Candidate** — non approvato come default |

---

## 23. Eligibility Filter

Fattori di idoneità (senza pesi numerici inventati):

- availability
- schedule compatibility
- vehicle class
- passenger capacity
- luggage capacity
- valid documents
- compliance
- authorized territory
- estimated arrival time
- language requirement
- corporate requirement
- suspension status
- operational limits

---

## 24. Matching Score

Fattori (senza pesi numerici):

- operational_fit
- reliability
- quality
- punctuality
- acceptance_behavior
- cancellation_rate
- no_show_rate
- compliance
- proximity
- fairness
- economics
- customer_preference
- contractual_priority

**Regola:** il prezzo più basso **non** è l’unico criterio.

---

## 25. Feedback Sources

### 25.1 EndCustomer → Driver / Service
Puntualità; pulizia; guida; comportamento; comunicazione; qualità complessiva.

### 25.2 OriginatingPartner → ExecutingPartner
Precisione; affidabilità; comunicazione; rispetto istruzioni; Evidence; riservatezza.

### 25.3 ExecutingPartner → OriginatingPartner
Completezza informazioni; correttezza dati; supporto; modifiche; contestazioni.

### 25.4 Driver → Incident
Non è un voto pubblico libero. Segnalazioni: no-show; ritardo; aggressione; danni; bagagli eccedenti; passeggeri non dichiarati; modifica percorso; richiesta irregolare.

### 25.5 Dispatcher / Reviewer
Valutazione interna.

### 25.6 System-generated Performance
Dati oggettivi operativi.

---

## 26. Score Types

Mantenere separati:

- **PublicRating**
- **InternalPerformanceScore**
- **RiskScore**
- **ComplianceScore**
- **AssignmentScore**

Nessun unico score opaco deve determinare tutto.

---

## 27. Funzioni del Feedback

Il Feedback può influenzare:

- assignment ranking;
- accesso alle offerte;
- badge;
- payout velocity;
- reserve e holdback quando validati;
- formazione;
- warning;
- suspension review;
- dispute;
- recovery;
- quality monitoring.

**Regola:** nessuna sospensione definitiva automatica per singolo feedback.

---

## 28. Protezione Feedback

- un feedback per Service;
- solo dopo Service valido;
- finestra temporale (parametri OPEN);
- diritto di risposta;
- contestazione;
- Evidence;
- anomaly detection;
- peso maggiore ai dati oggettivi;
- human review per decisioni gravi;
- audit delle modifiche.

---

## 29. Implementation Phases

| Fase | Contenuti |
|------|-----------|
| **OS Foundation** | Role, Permission, Scope, Data Visibility, Authorization |
| **Booking / Service / Assignment** | Manual assignment, offers, acceptance, timeout, reassignment |
| **Matching** | Eligibility, ranking, fairness |
| **Reputation** | Rating, performance, badge, feedback dispute |
| **Risk** | Fraud signals, compliance, anomaly |
| **AI Future** | Recommendation only; nessuna assegnazione critica autonoma senza governance |

---

## 30. Decisioni approvate

| ID | Decisione |
|----|-----------|
| AD-01 | Person con più Role |
| AD-02 | Role configurabile (non hardcoded) |
| AD-03 | Nessuna Permission implicita |
| AD-04 | Permission atomica |
| AD-05 | Scope separato |
| AD-06 | Data Visibility separata |
| AD-07 | Deny by Default |
| AD-08 | Authorization server-side / Application Layer |
| AD-09 | UI non è controllo di sicurezza |
| AD-10 | CompanyOwner limitato alla propria Organization |
| AD-11 | Driver limitato ad ASSIGNED_SERVICES |
| AD-12 | PlatformAdmin con Permission PLATFORM esplicite |
| AD-13 | Progressive data disclosure |
| AD-14 | Assignment, Matching, Reputation, Risk e Authorization separati |
| AD-15 | Prezzo più basso non unico criterio Matching |
| AD-16 | PublicRating, InternalPerformanceScore e RiskScore separati |
| AD-17 | Nessuna sospensione definitiva automatica da singolo feedback |
| AD-18 | Operazioni sensibili auditabili |
| AD-19 | Nessuna wildcard globale |
| AD-20 | Nessun super-admin implicito |

---

## 31. Decisioni OPEN

| ID | Decisione OPEN |
|----|----------------|
| OP-01 | Permission necessarie per AssignRoleToMembership (`role.manage` vs `permission.assign`) |
| OP-02 | Dispatcher può cancellare Booking o solo richiedere cancellazione |
| OP-03 | Dispatcher vede Customer Price |
| OP-04 | Dispatcher vede `pricing.read` |
| OP-05 | CompanyFinance può preparare o approvare refund |
| OP-06 | PlatformAdmin impersonation |
| OP-07 | MFA obbligatoria per operazioni sensibili |
| OP-08 | Approvazione duale per Permission e Finance |
| OP-09 | Wildcard future |
| OP-10 | Deny espliciti |
| OP-11 | Custom Role self-service |
| OP-12 | Permission override individuali |
| OP-13 | Durata cache Authorization |
| OP-14 | Audit retention |
| OP-15 | Mapping completo Role → Permission futuri |
| OP-16 | Pesi Matching Score |
| OP-17 | Formula Assignment Score |
| OP-18 | Soglie rating |
| OP-19 | Finestra feedback |
| OP-20 | Badge |
| OP-21 | Payout acceleration |
| OP-22 | Reserve impact |
| OP-23 | Fairness algorithm details |
| OP-24 | Auto-assignment |
| OP-25 | Timeout offerte |
| OP-26 | Batch size |
| OP-27 | Ranking tie-breaker |
| OP-28 | Feedback retention |
| OP-29 | AI threshold |

Nessuna decisione OPEN è chiusa in questo documento.

---

## 32. Implementation Readiness

### READY
- Permission check
- Tenant Scope
- Organization Scope
- Own Records
- Assigned Services
- Deny by Default
- Authorization Decision

### READY WITH OPEN DECISIONS
- Role template
- Dispatcher financial visibility
- Sensitive operation approval
- Support access

### DEFERRED
- ABAC avanzato
- Policy dinamiche
- Auto-assignment
- Risk-based Authorization
- MFA enforcement
- Impersonation
- Financial approval workflow

---

## 33. Cronologia revisioni

| Versione | Data | Autore | Descrizione modifica | Stato |
|----------|------|--------|----------------------|-------|
| 0.1.0 | 2026-07-31 | Identity, Authorization & Product Operations | Creazione ex novo del Role, Capability and Permission Catalog (MC-OS-029): Actor, Role MVP/futuri, Permission Catalog, Scope, Data Visibility, Permission Matrix MVP, operazioni sensibili, Use Case map, Authorization Decision I/O, Assignment/Matching/Feedback/Risk governance, decisioni approvate/OPEN, Implementation Readiness per Step 4. | Draft |

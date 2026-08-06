# MyChauffeur OS — System Architecture and Process Diagrams

| Campo | Valore |
|-------|--------|
| **Codice documento** | MC-OS-013 |
| **Titolo** | System Architecture and Process Diagrams |
| **Versione** | 0.1.0 |
| **Stato** | Draft |
| **Data creazione** | 2026-07-26 |
| **Ultima modifica** | 2026-07-26 |
| **Owner** | Chief Enterprise Architect |
| **Autori** | MyChauffeur OS Team |
| **Documenti correlati** | MC-OS-000 EDGF · MC-OS-001 Blueprint · MC-OS-002 BOS · MC-OS-005 Partner · MC-OS-006 SFOF · MC-OS-009 Glossary · MC-OS-011 Entity Model · MC-OS-012 Partner Exchange · MC-OS-003 NCC · MC-OS-007 Platform Map |
| **Dipendenze** | Framework di dominio elencati; EDGF Diagram Policy (§10) |
| **Classificazione** | Official Architecture Diagram Catalog — Draft |
| **Documentation Release** | 0.1 (allineamento previsto) |

---

## Avvertenza

Questo documento è il **catalogo ufficiale della documentazione grafica** di MyChauffeur OS.

**Non** contiene: codice, UML di classi software, SQL, DDL, OpenAPI.

Contiene esclusivamente **diagrammi concettuali e di processo**, in forma di **placeholder documentali**.

Per ogni diagramma, in futuro dovranno esistere:

| Artefatto | Ruolo |
|-----------|--------|
| **`.drawio`** | **Source of Truth** del diagramma |
| **`.svg`** | Derivato vettoriale |
| **`.png`** | Derivato raster |
| **`.pdf`** | Derivato stampa/lettura |

**In questa versione non vengono creati file Draw.io, SVG, PNG o PDF.** Solo la struttura documentale.

Identificativi diagramma: `DGM-NNN` — **immutabili** per tutta la vita del diagramma (vedi Diagram Evolution Policy).

---

## 1. Scopo

Fornire la mappa grafica ufficiale di:

- ecosistema e business architecture;
- lifecycle di Booking, Exchange, Settlement, Payment;
- state machine di dominio;
- finance (Wallet, Ledger);
- matching, dispatcher, permission/RBAC;
- tenant, international, audit, notification, AI futura.

I diagrammi rinviano ai documenti Source of Truth di comportamento; non li sostituiscono.

---

## 2. Convenzioni

| Elemento | Convenzione |
|----------|-------------|
| Codice diagramma | `DGM-001` … `DGM-NNN` (immutabile) |
| Lingua etichette nel disegno | Inglese (entità, stati, eventi) |
| Testo descrittivo nel documento | Italiano |
| Path target futuro | `docs/07_DIAGRAMS/MC-OS-013/` (cartella **non** creata ora) |
| Naming file futuro | `MC-OS-013_vX.Y.Z_DGM-NNN_<slug>.drawio` (+ svg/png/pdf) |

---

## 3. Categorie di diagrammi

| Categoria | Codici |
|-----------|--------|
| Ecosystem & Business | DGM-001, DGM-002 |
| Lifecycle | DGM-003 … DGM-009 |
| Matching & Ops | DGM-010 … DGM-012 |
| State Machines | DGM-013 … DGM-018 |
| Security & Access | DGM-019, DGM-020 |
| Domain & Finance | DGM-021, DGM-022 |
| Engines | DGM-023 … DGM-025 |
| Cross-cutting | DGM-026 … DGM-030 |

---

## 4. Catalogo diagrammi

### DGM-001 — Overall Ecosystem

| Campo | Valore |
|-------|--------|
| **Nome** | Overall Ecosystem |
| **Codice Diagramma** | DGM-001 |
| **Scopo** | Vista contestuale dell’ecosistema MyChauffeur OS (attori, superfici, piattaforma) |
| **Documenti Source of Truth** | MC-OS-001 Blueprint; MC-OS-007 Platform Map |
| **Descrizione** | Mostra Customer, Partner, Driver, Dispatcher, Admin, Agency/Corporate, MyChauffeur Platform, PSP, Maps, Notification providers |
| **Componenti coinvolti** | Customer Portal, Partner Portal, Driver Portal, Dispatcher Console, Admin/Hub, Core Platform, External Providers |
| **Eventi principali** | `booking_requested`, `partner_assigned`, `payment_captured` (esemplificativi) |
| **Diagramma (placeholder)** | `[PLACEHOLDER — Draw.io SoT non ancora creato: DGM-001 Overall Ecosystem]` |
| **Future evoluzioni** | C4 Context raffinato; confini Exchange vs owned booking |
| **Artefatti futuri** | `.drawio` (SoT) · `.svg` · `.png` · `.pdf` |

---

### DGM-002 — Business Architecture

| Campo | Valore |
|-------|--------|
| **Nome** | Business Architecture |
| **Codice Diagramma** | DGM-002 |
| **Scopo** | Mappa delle capability di business (Booking, Pricing, Exchange, Settlement, Fleet, CRM) |
| **Documenti Source of Truth** | MC-OS-001; MC-OS-002 BOS; MC-OS-011 |
| **Descrizione** | Capability map collegata a linee di ricavo Marketplace/SaaS/B2B/Corporate |
| **Componenti coinvolti** | Booking Engine, Pricing Engine, Partner Exchange, Settlement, Fleet, Reporting |
| **Eventi principali** | Capability-level (non tecnici) |
| **Diagramma (placeholder)** | `[PLACEHOLDER — Draw.io SoT non ancora creato: DGM-002 Business Architecture]` |
| **Future evoluzioni** | Heatmap maturità per fase roadmap |
| **Artefatti futuri** | `.drawio` (SoT) · `.svg` · `.png` · `.pdf` |

---

### DGM-003 — Booking Lifecycle

| Campo | Valore |
|-------|--------|
| **Nome** | Booking Lifecycle |
| **Codice Diagramma** | DGM-003 |
| **Scopo** | Ciclo end-to-end del Booking owned (richiesta → chiusura finanziaria) |
| **Documenti Source of Truth** | MC-OS-006 SFOF §3; MC-OS-011; Handoff |
| **Descrizione** | Fasi: request, quote, confirm, payment, assignment, trip, completion, settlement path |
| **Componenti coinvolti** | Booking, Quote, Payment, Assignment, Trip, Invoice |
| **Eventi principali** | `quote_issued`, `booking_confirmed`, `partner_assigned`, `service_completed`, `booking_financially_closed` |
| **Diagramma (placeholder)** | `[PLACEHOLDER — Draw.io SoT non ancora creato: DGM-003 Booking Lifecycle]` |
| **Future evoluzioni** | Branch cancel/no-show |
| **Artefatti futuri** | `.drawio` (SoT) · `.svg` · `.png` · `.pdf` |

---

### DGM-004 — Partner Exchange Lifecycle

| Campo | Valore |
|-------|--------|
| **Nome** | Partner Exchange Lifecycle |
| **Codice Diagramma** | DGM-004 |
| **Scopo** | Ciclo Exchange Listing → accept → execution → settlement |
| **Documenti Source of Truth** | MC-OS-012 Partner Exchange |
| **Descrizione** | Originating publish, funds reserve, matching, accept, Service Order, progressive disclosure, UNFILLED release |
| **Componenti coinvolti** | ExchangeListing, ExchangeOffer, ServiceOrder, PartnerWallet, SettlementLine |
| **Eventi principali** | `exchange_listing_published`, `exchange_funds_reserved`, `exchange_accepted`, `exchange_funds_released_unfilled` |
| **Diagramma (placeholder)** | `[PLACEHOLDER — Draw.io SoT non ancora creato: DGM-004 Partner Exchange Lifecycle]` |
| **Future evoluzioni** | Counteroffer e escalation paths |
| **Artefatti futuri** | `.drawio` (SoT) · `.svg` · `.png` · `.pdf` |

---

### DGM-005 — Progressive Data Disclosure

| Campo | Valore |
|-------|--------|
| **Nome** | Progressive Data Disclosure |
| **Codice Diagramma** | DGM-005 |
| **Scopo** | Livelli di rilascio dati End Customer all’Executing Partner |
| **Documenti Source of Truth** | MC-OS-012 §§12–17 |
| **Descrizione** | PRE_ACCEPTANCE → POST_ACCEPTANCE → T_MINUS_12_HOURS → T_MINUS_6_HOURS → SERVICE_ACTIVE → POST_SERVICE_RESTRICTED; regola geofence 10 km |
| **Componenti coinvolti** | DataReleasePolicy, DataAccessLog, EndCustomerReference, ExchangeAssignment |
| **Eventi principali** | `data_released_t_minus_12`, `data_released_t_minus_6`, `geo_disclosure_applied` |
| **Diagramma (placeholder)** | `[PLACEHOLDER — Draw.io SoT non ancora creato: DGM-005 Progressive Data Disclosure]` |
| **Future evoluzioni** | Last-minute immediate release path |
| **Artefatti futuri** | `.drawio` (SoT) · `.svg` · `.png` · `.pdf` |

---

### DGM-006 — Settlement Lifecycle

| Campo | Valore |
|-------|--------|
| **Nome** | Settlement Lifecycle |
| **Codice Diagramma** | DGM-006 |
| **Scopo** | Dal completamento servizio all’approvazione settlement |
| **Documenti Source of Truth** | MC-OS-006 SFOF §§5, 55–60 |
| **Descrizione** | Calculate → hold/contestation gate → approve → post ledgers → enqueue payout |
| **Componenti coinvolti** | Settlement Engine, SettlementLine, Contestation, Ledger |
| **Eventi principali** | `settlement_calculated`, `settlement_held`, `settlement_approved` |
| **Diagramma (placeholder)** | `[PLACEHOLDER — Draw.io SoT non ancora creato: DGM-006 Settlement Lifecycle]` |
| **Future evoluzioni** | Exchange-specific settlement branch |
| **Artefatti futuri** | `.drawio` (SoT) · `.svg` · `.png` · `.pdf` |

---

### DGM-007 — Payment Flow

| Campo | Valore |
|-------|--------|
| **Nome** | Payment Flow |
| **Codice Diagramma** | DGM-007 |
| **Scopo** | Flusso Payment Intent / auth / capture / refund / chargeback |
| **Documenti Source of Truth** | MC-OS-006 §4; DECISIONS_PENDING #1 (PSP OPEN) |
| **Descrizione** | State path draft → authorized → captured → reconciled; branch refund/chargeback |
| **Componenti coinvolti** | Payment, Payment Provider adapter, Payment Ledger |
| **Eventi principali** | `payment_authorized`, `payment_captured`, `refund_posted`, `chargeback_opened` |
| **Diagramma (placeholder)** | `[PLACEHOLDER — Draw.io SoT non ancora creato: DGM-007 Payment Flow]` |
| **Future evoluzioni** | Multi-PSP; acconto+saldo |
| **Artefatti futuri** | `.drawio` (SoT) · `.svg` · `.png` · `.pdf` |

---

### DGM-008 — Wallet Flow

| Campo | Valore |
|-------|--------|
| **Nome** | Wallet Flow |
| **Codice Diagramma** | DGM-008 |
| **Scopo** | Movimenti tra wallet logici (Customer/Partner/Platform/Escrow/Reserve) |
| **Documenti Source of Truth** | MC-OS-006 §9; MC-OS-012 §§57–59 |
| **Descrizione** | available / pending / reserved / disputed / reserve / withdrawable |
| **Componenti coinvolti** | PartnerWallet, WalletEntry, Escrow Wallet, Reserve Wallet |
| **Eventi principali** | `funds_escrowed`, `holdback_placed`, `payout_paid`, `exchange_funds_reserved` |
| **Diagramma (placeholder)** | `[PLACEHOLDER — Draw.io SoT non ancora creato: DGM-008 Wallet Flow]` |
| **Future evoluzioni** | Originating vs Executing wallet swimlanes |
| **Artefatti futuri** | `.drawio` (SoT) · `.svg` · `.png` · `.pdf` |

---

### DGM-009 — Ledger Flow

| Campo | Valore |
|-------|--------|
| **Nome** | Ledger Flow |
| **Codice Diagramma** | DGM-009 |
| **Scopo** | Append-only posting e reversal across ledger types |
| **Documenti Source of Truth** | MC-OS-006 §8 |
| **Descrizione** | Booking/Payment/Payout/Refund/Adjustment/Reserve/Commission/Chargeback/Tax ledgers |
| **Componenti coinvolti** | Ledger, Ledger Entry, Financial Events |
| **Eventi principali** | `*_posted`, reversal linked entries |
| **Diagramma (placeholder)** | `[PLACEHOLDER — Draw.io SoT non ancora creato: DGM-009 Ledger Flow]` |
| **Future evoluzioni** | Double-entry visual |
| **Artefatti futuri** | `.drawio` (SoT) · `.svg` · `.png` · `.pdf` |

---

### DGM-010 — Marketplace Matching Engine

| Campo | Valore |
|-------|--------|
| **Nome** | Marketplace Matching Engine |
| **Codice Diagramma** | DGM-010 |
| **Scopo** | Matching generico marketplace (capability level) |
| **Documenti Source of Truth** | MC-OS-001 §20; MC-OS-002 Marketplace line |
| **Descrizione** | Distinguere owned booking matching vs Exchange (vedi DGM-012) |
| **Componenti coinvolti** | Matching Engine, Availability, Offer |
| **Eventi principali** | `offer_proposed`, `assignment_attempts` |
| **Diagramma (placeholder)** | `[PLACEHOLDER — Draw.io SoT non ancora creato: DGM-010 Marketplace Matching Engine]` |
| **Future evoluzioni** | Separare chiaramente B2C vs B2B Exchange overlays |
| **Artefatti futuri** | `.drawio` (SoT) · `.svg` · `.png` · `.pdf` |

---

### DGM-011 — Dispatcher Decision Flow

| Campo | Valore |
|-------|--------|
| **Nome** | Dispatcher Decision Flow |
| **Codice Diagramma** | DGM-011 |
| **Scopo** | Decisioni manuali/automatiche del Dispatcher |
| **Documenti Source of Truth** | PLATFORM_MAP; MC-OS-005; MC-OS-011 |
| **Descrizione** | Coda → assign internal / partner / publish to Exchange → exception handling |
| **Componenti coinvolti** | Dispatcher Console, Assignment, ExchangeListing trigger |
| **Eventi principali** | `partner_assigned`, `exchange_listing_published`, reassignment |
| **Diagramma (placeholder)** | `[PLACEHOLDER — Draw.io SoT non ancora creato: DGM-011 Dispatcher Decision Flow]` |
| **Future evoluzioni** | Human-in-the-loop vs auto rules |
| **Artefatti futuri** | `.drawio` (SoT) · `.svg` · `.png` · `.pdf` |

---

### DGM-012 — Partner Exchange Matching

| Campo | Valore |
|-------|--------|
| **Nome** | Partner Exchange Matching |
| **Codice Diagramma** | DGM-012 |
| **Scopo** | Matching specifico Originating → Executing |
| **Documenti Source of Truth** | MC-OS-012 §§31–36 |
| **Descrizione** | Filtri territorio, vehicle_class, score, invite, fairness, budget, timeout |
| **Componenti coinvolti** | Matching Engine, AssignmentAttempt, ExchangeOffer, CommissionPlan |
| **Eventi principali** | `exchange_offer_proposed`, `no_response`, escalation (concettuale) |
| **Diagramma (placeholder)** | `[PLACEHOLDER — Draw.io SoT non ancora creato: DGM-012 Partner Exchange Matching]` |
| **Future evoluzioni** | Ranking weights visualization |
| **Artefatti futuri** | `.drawio` (SoT) · `.svg` · `.png` · `.pdf` |

---

### DGM-013 — Booking State Machine

| Campo | Valore |
|-------|--------|
| **Nome** | Booking State Machine |
| **Codice Diagramma** | DGM-013 |
| **Scopo** | Stati ufficiali Booking |
| **Documenti Source of Truth** | MC-OS-011 §7.1; SFOF |
| **Descrizione** | requested → quoted → confirmed → in_progress → completed → financially_closed (+ cancelled) |
| **Componenti coinvolti** | Booking |
| **Eventi principali** | Transizioni di stato Booking |
| **Diagramma (placeholder)** | `[PLACEHOLDER — Draw.io SoT non ancora creato: DGM-013 Booking State Machine]` |
| **Future evoluzioni** | Dispute-hold overlay |
| **Artefatti futuri** | `.drawio` (SoT) · `.svg` · `.png` · `.pdf` |

---

### DGM-014 — Listing State Machine

| Campo | Valore |
|-------|--------|
| **Nome** | Listing State Machine |
| **Codice Diagramma** | DGM-014 |
| **Scopo** | Stati ExchangeListing |
| **Documenti Source of Truth** | MC-OS-012 §77 |
| **Descrizione** | DRAFT … PUBLISHED … ACCEPTED … SETTLED/PAID … UNFILLED/EXPIRED/CANCELLED |
| **Componenti coinvolti** | ExchangeListing |
| **Eventi principali** | Transizioni Listing |
| **Diagramma (placeholder)** | `[PLACEHOLDER — Draw.io SoT non ancora creato: DGM-014 Listing State Machine]` |
| **Future evoluzioni** | Evidenziare UNFILLED fee=0 path |
| **Artefatti futuri** | `.drawio` (SoT) · `.svg` · `.png` · `.pdf` |

---

### DGM-015 — Assignment State Machine

| Campo | Valore |
|-------|--------|
| **Nome** | Assignment State Machine |
| **Codice Diagramma** | DGM-015 |
| **Scopo** | Stati Assignment / ExchangeAssignment |
| **Documenti Source of Truth** | MC-OS-011; MC-OS-012 §79 |
| **Descrizione** | pending → offered → accepted → active → completed (+ rejected/expired/reassigned) |
| **Componenti coinvolti** | Assignment, Offer |
| **Eventi principali** | accept/reject/reassign |
| **Diagramma (placeholder)** | `[PLACEHOLDER — Draw.io SoT non ancora creato: DGM-015 Assignment State Machine]` |
| **Future evoluzioni** | INTERNAL XOR PARTNER annotation |
| **Artefatti futuri** | `.drawio` (SoT) · `.svg` · `.png` · `.pdf` |

---

### DGM-016 — Service State Machine

| Campo | Valore |
|-------|--------|
| **Nome** | Service State Machine |
| **Codice Diagramma** | DGM-016 |
| **Scopo** | Stati operativi Trip/Service |
| **Documenti Source of Truth** | Handoff trip-ops; MC-OS-012 §78 |
| **Descrizione** | scheduled → en_route → arrived → ongoing → completed (+ no_show/cancelled) |
| **Componenti coinvolti** | Trip, Driver Portal |
| **Eventi principali** | trip status transitions |
| **Diagramma (placeholder)** | `[PLACEHOLDER — Draw.io SoT non ancora creato: DGM-016 Service State Machine]` |
| **Future evoluzioni** | Wait timer overlays |
| **Artefatti futuri** | `.drawio` (SoT) · `.svg` · `.png` · `.pdf` |

---

### DGM-017 — Settlement State Machine

| Campo | Valore |
|-------|--------|
| **Nome** | Settlement State Machine |
| **Codice Diagramma** | DGM-017 |
| **Scopo** | Stati settlement |
| **Documenti Source of Truth** | MC-OS-006; MC-OS-012 §80 |
| **Descrizione** | calculated → held → approved → posted (+ disputed/adjusted) |
| **Componenti coinvolti** | Settlement Engine |
| **Eventi principali** | `settlement_*` |
| **Diagramma (placeholder)** | `[PLACEHOLDER — Draw.io SoT non ancora creato: DGM-017 Settlement State Machine]` |
| **Future evoluzioni** | Auto vs manual approve thresholds |
| **Artefatti futuri** | `.drawio` (SoT) · `.svg` · `.png` · `.pdf` |

---

### DGM-018 — Payout State Machine

| Campo | Valore |
|-------|--------|
| **Nome** | Payout State Machine |
| **Codice Diagramma** | DGM-018 |
| **Scopo** | Stati payout |
| **Documenti Source of Truth** | MC-OS-006 §6; MC-OS-012 §81 |
| **Descrizione** | scheduled → initiated → paid \| failed \| suspended |
| **Componenti coinvolti** | Payout Engine, PartnerWallet |
| **Eventi principali** | `payout_*` |
| **Diagramma (placeholder)** | `[PLACEHOLDER — Draw.io SoT non ancora creato: DGM-018 Payout State Machine]` |
| **Future evoluzioni** | Acceleration path |
| **Artefatti futuri** | `.drawio` (SoT) · `.svg` · `.png` · `.pdf` |

---

### DGM-019 — Permission Model

| Campo | Valore |
|-------|--------|
| **Nome** | Permission Model |
| **Codice Diagramma** | DGM-019 |
| **Scopo** | Matrice permessi concettuale (chi vede cosa) |
| **Documenti Source of Truth** | MC-OS-012 §74; Blueprint RBAC; Partner privacy |
| **Descrizione** | Originating vs Executing vs Admin vs Finance vs Driver data scopes |
| **Componenti coinvolti** | RBAC, DataReleasePolicy, RLS (target) |
| **Eventi principali** | `data_access_*` |
| **Diagramma (placeholder)** | `[PLACEHOLDER — Draw.io SoT non ancora creato: DGM-019 Permission Model]` |
| **Future evoluzioni** | Tabella permesso × risorsa |
| **Artefatti futuri** | `.drawio` (SoT) · `.svg` · `.png` · `.pdf` |

---

### DGM-020 — RBAC Overview

| Campo | Valore |
|-------|--------|
| **Nome** | RBAC Overview |
| **Codice Diagramma** | DGM-020 |
| **Scopo** | Ruoli piattaforma: Admin, Dispatcher, Driver, Partner, Customer |
| **Documenti Source of Truth** | PLATFORM_MAP; Blueprint §12 |
| **Descrizione** | Ruoli e superfici; Partner buyer/seller dual role |
| **Componenti coinvolti** | Auth (futuro), middleware, portals |
| **Eventi principali** | login/session (futuro) |
| **Diagramma (placeholder)** | `[PLACEHOLDER — Draw.io SoT non ancora creato: DGM-020 RBAC Overview]` |
| **Future evoluzioni** | Tenant vs platform roles |
| **Artefatti futuri** | `.drawio` (SoT) · `.svg` · `.png` · `.pdf` |

---

### DGM-021 — Business Entity Relationships

| Campo | Valore |
|-------|--------|
| **Nome** | Business Entity Relationships |
| **Codice Diagramma** | DGM-021 |
| **Scopo** | Relazioni concettuali tra entità core |
| **Documenti Source of Truth** | MC-OS-011 §§5–6; MC-OS-009 |
| **Descrizione** | Customer–Booking–Assignment–Trip–Payment–Settlement–Partner (+ Exchange overlay) |
| **Componenti coinvolti** | Entità MC-OS-011 / MC-OS-012 |
| **Eventi principali** | N/A (strutturale) |
| **Diagramma (placeholder)** | `[PLACEHOLDER — Draw.io SoT non ancora creato: DGM-021 Business Entity Relationships]` |
| **Future evoluzioni** | Bounded context coloring |
| **Artefatti futuri** | `.drawio` (SoT) · `.svg` · `.png` · `.pdf` |

---

### DGM-022 — Finance Architecture

| Campo | Valore |
|-------|--------|
| **Nome** | Finance Architecture |
| **Codice Diagramma** | DGM-022 |
| **Scopo** | Architettura finance: Payment, Ledger, Wallet, Settlement, Payout |
| **Documenti Source of Truth** | MC-OS-006 |
| **Descrizione** | Engines e ledgers; Configuration Engine; PSP boundary |
| **Componenti coinvolti** | Settlement Engine, Payout Engine, Contestation Engine, Ledgers |
| **Eventi principali** | Financial Events catalog |
| **Diagramma (placeholder)** | `[PLACEHOLDER — Draw.io SoT non ancora creato: DGM-022 Finance Architecture]` |
| **Future evoluzioni** | MoR vs Intermediary lanes (quando deciso) |
| **Artefatti futuri** | `.drawio` (SoT) · `.svg` · `.png` · `.pdf` |

---

### DGM-023 — Partner Score Engine

| Campo | Valore |
|-------|--------|
| **Nome** | Partner Score Engine |
| **Codice Diagramma** | DGM-023 |
| **Scopo** | Input KPI → Partner Score / Exchange Score |
| **Documenti Source of Truth** | MC-OS-005 §18; MC-OS-012 §§65–66 |
| **Descrizione** | Originating vs Executing performance components |
| **Componenti coinvolti** | Partner Score, Exchange Score, Matching |
| **Eventi principali** | score recalculation snapshots |
| **Diagramma (placeholder)** | `[PLACEHOLDER — Draw.io SoT non ancora creato: DGM-023 Partner Score Engine]` |
| **Future evoluzioni** | Weight configuration UI |
| **Artefatti futuri** | `.drawio` (SoT) · `.svg` · `.png` · `.pdf` |

---

### DGM-024 — Risk Engine

| Campo | Valore |
|-------|--------|
| **Nome** | Risk Engine |
| **Codice Diagramma** | DGM-024 |
| **Scopo** | Segnali rischio/frode/collusion/side-payment |
| **Documenti Source of Truth** | MC-OS-006 alerts; MC-OS-012 §68; Partner anti-disintermediazione |
| **Descrizione** | Risk score interno → matching limits / suspension |
| **Componenti coinvolti** | Risk Engine, Alerting, Holdback triggers |
| **Eventi principali** | risk alerts, suspension events |
| **Diagramma (placeholder)** | `[PLACEHOLDER — Draw.io SoT non ancora creato: DGM-024 Risk Engine]` |
| **Future evoluzioni** | ML scoring (futuro) |
| **Artefatti futuri** | `.drawio` (SoT) · `.svg` · `.png` · `.pdf` |

---

### DGM-025 — Configuration Engine

| Campo | Valore |
|-------|--------|
| **Nome** | Configuration Engine |
| **Codice Diagramma** | DGM-025 |
| **Scopo** | Business rules configurabili (non hardcoded) |
| **Documenti Source of Truth** | MC-OS-006 §16; MC-OS-012 §§75–76; EDGF |
| **Descrizione** | Scope global/org/country/partner; versioned config snapshots |
| **Componenti coinvolti** | FinancialConfig, DataReleasePolicy, CommissionPlan |
| **Eventi principali** | `config_activated` |
| **Diagramma (placeholder)** | `[PLACEHOLDER — Draw.io SoT non ancora creato: DGM-025 Configuration Engine]` |
| **Future evoluzioni** | Config diff/audit UI |
| **Artefatti futuri** | `.drawio` (SoT) · `.svg` · `.png` · `.pdf` |

---

### DGM-026 — Audit Trail

| Campo | Valore |
|-------|--------|
| **Nome** | Audit Trail |
| **Codice Diagramma** | DGM-026 |
| **Scopo** | Flusso append-only di audit e correlation |
| **Documenti Source of Truth** | MC-OS-005 PG-07; MC-OS-006; MC-OS-012 §70; EDGF |
| **Descrizione** | Actor → action → entity → evidence refs → immutable store |
| **Componenti coinvolti** | Audit Log, DataAccessLog, Ledger |
| **Eventi principali** | all decision events |
| **Diagramma (placeholder)** | `[PLACEHOLDER — Draw.io SoT non ancora creato: DGM-026 Audit Trail]` |
| **Future evoluzioni** | Hash-chain annotation |
| **Artefatti futuri** | `.drawio` (SoT) · `.svg` · `.png` · `.pdf` |

---

### DGM-027 — Notification Flow

| Campo | Valore |
|-------|--------|
| **Nome** | Notification Flow |
| **Codice Diagramma** | DGM-027 |
| **Scopo** | Da Event a canali di notifica |
| **Documenti Source of Truth** | Blueprint Notifiche; DECISIONS #8 OPEN |
| **Descrizione** | Event → template → channel (email/SMS/push) → delivery status |
| **Componenti coinvolti** | Notification service, templates |
| **Eventi principali** | notification queued/sent/failed |
| **Diagramma (placeholder)** | `[PLACEHOLDER — Draw.io SoT non ancora creato: DGM-027 Notification Flow]` |
| **Future evoluzioni** | Provider adapters |
| **Artefatti futuri** | `.drawio` (SoT) · `.svg` · `.png` · `.pdf` |

---

### DGM-028 — International Architecture

| Campo | Valore |
|-------|--------|
| **Nome** | International Architecture |
| **Codice Diagramma** | DGM-028 |
| **Scopo** | Multi-country: tax regime, Local Law, currency, PSP |
| **Documenti Source of Truth** | MC-OS-006 §17; MC-OS-005 Local Law; BOS tax |
| **Descrizione** | Core globale + schedule per Paese |
| **Componenti coinvolti** | Configuration, Tax, FX, Local Law Schedule |
| **Eventi principali** | country activation (governance) |
| **Diagramma (placeholder)** | `[PLACEHOLDER — Draw.io SoT non ancora creato: DGM-028 International Architecture]` |
| **Future evoluzioni** | Country pack checklist |
| **Artefatti futuri** | `.drawio` (SoT) · `.svg` · `.png` · `.pdf` |

---

### DGM-029 — Tenant Architecture

| Campo | Valore |
|-------|--------|
| **Nome** | Tenant Architecture |
| **Codice Diagramma** | DGM-029 |
| **Scopo** | Isolamento multi-tenant e scoping dati |
| **Documenti Source of Truth** | Blueprint §9; MC-OS-011 |
| **Descrizione** | organization_id boundaries; shared platform services |
| **Componenti coinvolti** | Tenant context, RLS (target), config per tenant |
| **Eventi principali** | tenant provisioning (futuro) |
| **Diagramma (placeholder)** | `[PLACEHOLDER — Draw.io SoT non ancora creato: DGM-029 Tenant Architecture]` |
| **Future evoluzioni** | Cross-tenant Exchange controls |
| **Artefatti futuri** | `.drawio` (SoT) · `.svg` · `.png` · `.pdf` |

---

### DGM-030 — Future AI Architecture

| Campo | Valore |
|-------|--------|
| **Nome** | Future AI Architecture |
| **Codice Diagramma** | DGM-030 |
| **Scopo** | Visione assistente AI con guardrail |
| **Documenti Source of Truth** | Blueprint §26 AI Assistant |
| **Descrizione** | Grounding su SoT documentali/dati; human-in-the-loop; no autonomia su payout/dispute critici |
| **Componenti coinvolti** | AI Assistant, knowledge grounding, ops tools |
| **Eventi principali** | assist suggestions (futuro) |
| **Diagramma (placeholder)** | `[PLACEHOLDER — Draw.io SoT non ancora creato: DGM-030 Future AI Architecture]` |
| **Future evoluzioni** | Eval/quality loops |
| **Artefatti futuri** | `.drawio` (SoT) · `.svg` · `.png` · `.pdf` |

---

## 5. Diagram Evolution Policy

1. Ogni diagramma può evolvere nel tempo (nuove versioni grafiche).
2. L’identificativo **`DGM-NNN` non cambia mai**, anche se cambia il contenuto del disegno.
3. La cronologia delle revisioni grafiche resta in questo documento (Revision History + note per DGM).
4. Gli aggiornamenti dei diagrammi seguono il **Semantic Versioning del documento MC-OS-013** (Patch/Minor/Major secondo EDGF).
5. Il file **`.drawio` è sempre la Source of Truth**; SVG/PNG/PDF sono **derivati** e non si aggiornano isolatamente.
6. Un cambio breaking della semantica di un DGM incrementa almeno **Minor** (o Major se invalida riferimenti cross-doc).
7. I riferimenti esterni citano `MC-OS-013` + `DGM-NNN` + versione documento.

---

## 6. Indice rapido DGM

| Codice | Nome |
|--------|------|
| DGM-001 | Overall Ecosystem |
| DGM-002 | Business Architecture |
| DGM-003 | Booking Lifecycle |
| DGM-004 | Partner Exchange Lifecycle |
| DGM-005 | Progressive Data Disclosure |
| DGM-006 | Settlement Lifecycle |
| DGM-007 | Payment Flow |
| DGM-008 | Wallet Flow |
| DGM-009 | Ledger Flow |
| DGM-010 | Marketplace Matching Engine |
| DGM-011 | Dispatcher Decision Flow |
| DGM-012 | Partner Exchange Matching |
| DGM-013 | Booking State Machine |
| DGM-014 | Listing State Machine |
| DGM-015 | Assignment State Machine |
| DGM-016 | Service State Machine |
| DGM-017 | Settlement State Machine |
| DGM-018 | Payout State Machine |
| DGM-019 | Permission Model |
| DGM-020 | RBAC Overview |
| DGM-021 | Business Entity Relationships |
| DGM-022 | Finance Architecture |
| DGM-023 | Partner Score Engine |
| DGM-024 | Risk Engine |
| DGM-025 | Configuration Engine |
| DGM-026 | Audit Trail |
| DGM-027 | Notification Flow |
| DGM-028 | International Architecture |
| DGM-029 | Tenant Architecture |
| DGM-030 | Future AI Architecture |

---

## 7. Diagrammi suggeriti (non ancora codificati)

Suggeriti per release successive (prossimi `DGM-031+` dopo sync registro EDGF):

- Contestation / Dispute Flow
- Recovery & Reassignment Flow
- NCC Pricing Composition
- Funds UNFILLED Release Sequence
- C4 Container (Next.js / API / Supabase)
- Evidence Chain of Custody

---

## Cronologia revisioni

| Versione | Data | Autore | Descrizione modifica | Stato |
|----------|------|--------|----------------------|-------|
| 0.1.0 | 2026-07-26 | MyChauffeur OS Team | Creazione catalogo ufficiale diagrammi MC-OS-013: DGM-001…030 placeholder, policy evoluzione, senza file grafici. | Draft |

---

*Fine di MC-OS-013 System Architecture and Process Diagrams v0.1.0 — Draft. Solo placeholder documentali; Draw.io/SVG/PNG/PDF non generati in questa versione.*

# MyChauffeur OS — Architecture Consolidation Release v1

| Campo | Valore |
|-------|--------|
| **Codice documento** | MC-OS-023 |
| **Titolo** | Architecture Consolidation Release v1 |
| **Versione** | 0.1.0 |
| **Stato** | Draft |
| **Data creazione** | 2026-07-26 |
| **Ultima modifica** | 2026-07-26 |
| **Owner** | Enterprise Architecture & Documentation Governance |
| **Autori** | MyChauffeur OS Team |
| **Documenti correlati** | MC-OS-000 … MC-OS-022 · PLATFORM_MAP · HANDOFF · DECISIONS_PENDING |
| **Dipendenze** | Intero corpus documentale autorizzato; EDGF registro |
| **Classificazione** | Official Architecture Consolidation Report — Draft |
| **Documentation Release** | 0.1 (allineamento previsto) |

---

## Avvertenza

Questo documento è il **report ufficiale della prima consolidazione architetturale**.
**Non** duplica integralmente i framework. **Non** chiude decisioni fiscali/legali/economiche/tecniche OPEN. **Non** introduce soglie, provider o formule definitive.

I nomi di Domain, Entity, Event, State, Aggregate, Framework, Decision ID restano in **inglese**. Il testo normativo è in **italiano**.

---

## Source of Truth

**MC-OS-023** è la Source of Truth dello **stato di consolidamento** e della **baseline documentale candidata** pre-implementazione.
Non sostituisce i framework di dominio: li verifica e ne mappa ownership e gap.

---

## 1. Scopo

Verificare coerenza del corpus, normalizzare Source of Truth, consolidare decisioni approvate e OPEN, individuare duplicazioni/contraddizioni, aggiornare lo stato reale della documentazione, predisporre OS Foundation / Software Architecture, e **fermare la proliferazione** di nuovi framework prima del sync.

---

## 2. Ambito della Consolidation Release

**In ambito:** audit documentale cross-framework; SoT map; ownership; consistency audits; contradiction/open/approved registers; diagram readiness; pre-implementation readiness; OS Foundation scope recommendation; sync plan.

**Fuori ambito:** codice, SQL, API, Draw.io, PDF, nuovi framework di dominio, assegnazione codici oltre MC-OS-023 in questa sessione (prossimo libero post-registrazione: MC-OS-024), chiusura OPEN fiscali/legali.

---

## 3. Corpus analizzato

| # | Documento | Path |
|---|-----------|------|
| 1 | EDGF | `docs/DOCUMENTATION_MANAGEMENT_FRAMEWORK.md` |
| 2 | Master Blueprint | `docs/MASTER_BLUEPRINT.md` |
| 3 | Glossary | `docs/DOMAIN_GLOSSARY_AND_BUSINESS_DICTIONARY.md` |
| 4 | Business Entity Model | `docs/BUSINESS_ENTITY_MODEL.md` |
| 5 | Business Operating System | `docs/BUSINESS_OPERATING_SYSTEM.md` |
| 6 | Partner Legal & Operating | `docs/PARTNER_LEGAL_AND_OPERATING_FRAMEWORK.md` |
| 7 | Settlement & Financial Ops | `docs/SETTLEMENT_AND_FINANCIAL_OPERATIONS_FRAMEWORK.md` |
| 8 | Partner Exchange | `docs/PARTNER_EXCHANGE_MARKETPLACE_FRAMEWORK.md` |
| 9 | System Architecture Diagrams | `docs/SYSTEM_ARCHITECTURE_AND_PROCESS_DIAGRAMS.md` |
| 10 | Booking & Service Lifecycle | `docs/BOOKING_AND_SERVICE_LIFECYCLE_FRAMEWORK.md` |
| 11 | Identity Roles Permission | `docs/IDENTITY_ROLES_AND_PERMISSION_FRAMEWORK.md` |
| 12 | Notification & Communication | `docs/NOTIFICATION_AND_COMMUNICATION_FRAMEWORK.md` |
| 13 | Pricing & Revenue | `docs/PRICING_AND_REVENUE_MANAGEMENT_FRAMEWORK.md` |
| 14 | Customer Experience | `docs/CUSTOMER_EXPERIENCE_FRAMEWORK.md` |
| 15 | System Domain Architecture | `docs/SYSTEM_DOMAIN_ARCHITECTURE.md` |
| 16 | System Event Catalog | `docs/SYSTEM_EVENT_CATALOG.md` |
| 17 | Configuration & Feature Mgmt | `docs/CONFIGURATION_AND_FEATURE_MANAGEMENT_FRAMEWORK.md` |
| 18 | AI & Automation Governance | `docs/AI_AND_AUTOMATION_GOVERNANCE_FRAMEWORK.md` |
| 19 | NCC Tariff Requirements | `docs/NCC_TARIFF_REQUIREMENTS.md` |
| 20 | Decisions Pending | `docs/DECISIONS_PENDING.md` |
| 21 | Platform Map | `PLATFORM_MAP.md` |
| 22 | Handoff | `HANDOFF.md` |

**Totale analizzati: 22.**

---

## 4. Metodo di verifica

1. Lettura header/registro EDGF e presenza file
2. Verifica SoT dichiarate vs cross-reference Blueprint
3. Audit terminologico su Glossario + Entity Model + frameworks
4. Audit state machine / eventi / finance / Exchange / identity / config / AI
5. Estrazione decisioni APPROVED vs OPEN senza chiuderle
6. Classificazione stale/legacy e diagram readiness
7. Valutazione pre-implementation e OS Foundation minimo

Criterio: **contraddizione** = affermazioni incompatibili; **duplicazione** = stesso contenuto normativo ripetuto; **gap** = header/SoT/sync mancante.

---

## 5. Stato generale della documentazione

| Documento | Classificazione Consolidation |
|-----------|-------------------------------|
| MC-OS-000 EDGF | READY_FOR_BASELINE (Draft; registro aggiornato) |
| MC-OS-001 Blueprint | DRAFT + gap header; scheletro + cross-ref |
| MC-OS-002 BOS | READY_FOR_BASELINE candidate (no EDGF header formal) |
| MC-OS-003 NCC | DRAFT / LEGACY-format (no MC-OS header) |
| MC-OS-004 Decisions Pending | STALE rispetto ai registri framework; ancora utile |
| MC-OS-005 Partner Legal | READY_FOR_BASELINE candidate (no header) |
| MC-OS-006 SFOF | READY_FOR_BASELINE candidate (no header) |
| MC-OS-007 Platform Map | STALE / delivery-state (no header) |
| MC-OS-008 Handoff | STALE / session ops (no header) |
| MC-OS-009 Glossary | READY_FOR_BASELINE |
| MC-OS-010 ADR Index | BLOCKED (non creato; riservato) |
| MC-OS-011 Entity Model | READY_FOR_BASELINE |
| MC-OS-012…022 Frameworks | DRAFT → READY_FOR_BASELINE candidate |
| MC-OS-013 Diagrams catalog | DRAFT (placeholder only; no Draw.io) |
| Filename EDGF vs titolo EDGF | SUPERSEDED_CANDIDATE naming fisico futuro |

---

## 6. Registro MC-OS verificato

| Codice | Titolo | File | Ver | Stato doc | Owner (dichiarato/atteso) | SoT domain | Dipendenze | Gap |
|--------|--------|------|-----|-----------|---------------------------|------------|------------|-----|
| 000 | EDGF | DOCUMENTATION_MANAGEMENT_FRAMEWORK.md | 0.10.0→0.11.0 post-sync | Draft | Documentation Governance | Doc governance | — | Filename storico vs titolo EDGF |
| 001 | Master Blueprint | MASTER_BLUEPRINT.md | 0.1.x | Bozza strutturale | — | Master architecture index | All | **Header MC-OS mancante** |
| 002 | BOS | BUSINESS_OPERATING_SYSTEM.md | — | — | — | Business economics | Glossary | **Header mancante** |
| 003 | NCC Tariff | NCC_TARIFF_REQUIREMENTS.md | — | — | — | Tariff requirements | Pricing | **Header mancante** |
| 004 | Decisions Pending | DECISIONS_PENDING.md | — | — | — | Open product decisions (parziale) | Platform Map | **Header mancante**; non unificato |
| 005 | Partner Legal | PARTNER_LEGAL_… | — | — | — | Partner legal/ops | BOS | **Header mancante** |
| 006 | SFOF | SETTLEMENT_… | — | — | — | Settlement/finance ops | BOS, Partner | **Header mancante** |
| 007 | Platform Map | PLATFORM_MAP.md | — | — | — | Current delivery state | Handoff | **Header mancante**; stale risk |
| 008 | Handoff | HANDOFF.md | — | — | — | Session handoff | Platform Map | **Header mancante**; stale risk |
| 009 | Glossary | DOMAIN_GLOSSARY_… | 0.1.0 | Draft | — | Terminology | EDGF | OK header |
| 010 | ADR Index | — | — | Non creato | — | ADR | — | **Riservato / mancante** |
| 011 | Entity Model | BUSINESS_ENTITY_MODEL.md | 0.1.0 | Draft | CEA / Domain Owners | Entity model | Glossary | OK |
| 012 | Partner Exchange | PARTNER_EXCHANGE_… | 0.1.0 | Draft | Marketplace & Partner Ops | Exchange B2B | 005,006,009,011 | OK |
| 013 | Diagrams Catalog | SYSTEM_ARCHITECTURE_… | 0.1.0 | Draft | CEA | Diagram placeholders | Frameworks | No .drawio |
| 014 | Booking Lifecycle | BOOKING_AND_SERVICE_… | 0.1.0 | Draft | Booking, Service & Ops | Booking lifecycle | 011,012,017 | OK |
| 015 | Identity | IDENTITY_ROLES_… | 0.1.0 | Draft | Identity Security | Identity/RBAC | 011 | OK; no SQL RLS |
| 016 | Notification | NOTIFICATION_… | 0.1.0 | Draft | Communications | Notifications | 014,015 | OK; no provider |
| 017 | Pricing | PRICING_… | 0.1.0 | Draft | Pricing Revenue | Pricing/revenue | 002,003 | OK; no % |
| 018 | CX | CUSTOMER_EXPERIENCE_… | 0.1.0 | Draft | CX & Service Design | Customer experience | 014,016 | OK |
| 019 | Domain Architecture | SYSTEM_DOMAIN_… | 0.1.0 | Draft | CEA | Bounded contexts | 011–018 | OK |
| 020 | Event Catalog | SYSTEM_EVENT_… | 0.1.0 | Draft | EA & Platform Eng | Events | 019 | OK |
| 021 | Configuration | CONFIGURATION_… | 0.1.0 | Draft | Platform Config | Configuration/flags | 019,020 | OK |
| 022 | AI Governance | AI_AND_AUTOMATION_… | 0.1.0 | Draft | AI Automation Governance | AI/automation | 019–021 | OK |
| 023 | Consolidation Release | questo file | 0.1.0 | Draft | EA & Doc Governance | Consolidation status | Corpus | — |

Nessun codice duplicato rilevato nel registro EDGF pre-023.

---

## 7. Source of Truth Map

| Materia | SoT unica | Altri: solo cross-ref |
|---------|-----------|------------------------|
| Documentation Governance | MC-OS-000 | Blueprint §0 |
| Master Architecture (indice) | MC-OS-001 | — |
| Glossary | MC-OS-009 | Tutti |
| Business Entity Model | MC-OS-011 | 019 ownership |
| Business Economics | MC-OS-002 | 017,006 |
| Partner Legal and Operations | MC-OS-005 | 012 |
| Settlement and Financial Operations | MC-OS-006 | 017,020 financial events |
| Partner Exchange | MC-OS-012 | 014 assignment, 020 events |
| Booking and Service Lifecycle | MC-OS-014 | 018 journey projection |
| Identity and Permissions | MC-OS-015 | 021 permission boundary |
| Notifications and Communications | MC-OS-016 | 020 notification events |
| Pricing and Revenue | MC-OS-017 | 003 NCC, 002 CM |
| Customer Experience | MC-OS-018 | 014 lifecycle |
| System Domain Architecture | MC-OS-019 | 020/021/022 |
| Event Catalog | MC-OS-020 | 019 events sections |
| Configuration and Feature Management | MC-OS-021 | 022 AI config |
| AI Governance | MC-OS-022 | 020 AI events |
| NCC Tariff Requirements | MC-OS-003 | 017 |
| Open Decisions (unificato target) | **Questo report §23** + sync futuro MC-OS-004 | Framework OPEN locali |
| Current Delivery State | MC-OS-007 PLATFORM_MAP | Handoff |
| Session Handoff | MC-OS-008 HANDOFF | — |
| Architecture Diagrams | MC-OS-013 | Draw.io futuri |
| Consolidation status | **MC-OS-023** | — |

---

## 8. Domain Ownership Map

Allineata a MC-OS-019: Identity, Customer, Booking, Marketplace, Partner, Dispatch, Fleet, Pricing, Finance, Settlement, Payment, Notification, Support, Compliance, Configuration, Analytics, AI, Document, Media, Integration, Administration.

**Nota:** `Operations.*` events → ownership funzionale Booking Domain / aggregate `Trip`.

---

## 9. Entity Ownership Map

| Entity / Aggregate | Owner Domain | SoT lifecycle |
|--------------------|--------------|---------------|
| Booking, Service, Assignment, Trip | Booking | MC-OS-014 |
| ExchangeListing, Offer | Marketplace | MC-OS-012 |
| PartnerCompany | Partner | MC-OS-005/012 |
| Quote, PricingProfile | Pricing | MC-OS-017 |
| Settlement, Holdback, PayoutInstruction | Settlement | MC-OS-006 |
| Payment | Payment | MC-OS-006 + OPEN provider |
| User, Membership, Role | Identity | MC-OS-015 |
| Recommendation | AI | MC-OS-022 |
| ConfigurationVersion, FeatureFlag | Configuration | MC-OS-021 |

---

## 10. Event Ownership Map

Producer unico per prefisso (MC-OS-020): Identity.*, Booking.*, Marketplace.*, Dispatch.*, Operations.* (Booking/Trip), Pricing.*, Payment.*, Settlement.*, Finance.*, AI.*, Configuration.*, ecc.
Consumers non ribattezzano eventi.

---

## 11. Configuration Ownership Map

Prefix `domain.module.setting` → Domain owner (MC-OS-021 §84/87). Meta-config → Platform Configuration & Product Governance.

---

## 12. Decision Ownership Map

| Tipo | Owner di consolidamento | SoT |
|------|-------------------------|-----|
| Product OPEN (#1–10) | Product Owner (Cristian) | MC-OS-004 + §23 |
| Economics approved | BOS owner | MC-OS-002 |
| Exchange approved | Marketplace owner | MC-OS-012 |
| Architecture approved | CEA | 019–023 |
| Fiscal/legal OPEN | Professional validators | BOS/Partner/SFOF |

---

## 13. Terminology Consistency Audit

| Termine | Stato | SoT | Allineare in futuro |
|---------|-------|-----|---------------------|
| Booking / Service / Trip / Assignment | Coerente (distinti) | 009/011/014 | Blueprint prose |
| Listing / Marketplace Listing | Coerente Exchange | 012/009 | Evitare “Listing” B2C |
| Offer | Coerente; ≠ AssignmentAccepted | 012/020 | — |
| Quote | Coerente | 014/017 | — |
| Partner / Partner Company | Coerente | 009/005 | No Supplier/Vendor |
| Originating / Executing Partner | Coerente | 012 | — |
| Customer / Consumer / B2B / Corporate / Agency | Coerente | 009/018 | — |
| Driver / Internal Driver | Coerente | 009 | — |
| Partner Cost XOR Internal Execution Cost | Coerente | 002/009/017 | Vietare “costo assegnato” ambiguo |
| Commission ≠ Markup ≠ Platform Revenue | Coerente | 009/017 | Analytics prose |
| GBV / Gross Margin / Contribution Margin | Coerente; CM primario | 002/009 | No GMV-as-revenue |
| Settlement / Payout / Payment | Coerente distinti | 006/020 | — |
| Refund / Compensation / Recovery Cost / Chargeback | Coerente; no double-count | 002/006 | — |
| Dispute / Contestation / Chargeback | Coerente distinti | 006/012/020 | — |
| Reserve / Holdback | Coerente; holdback motivato | 005/006 | — |
| Feature Flag ≠ Business Rule | Coerente | 021 | — |
| Configuration ≠ Secret ≠ Permission | Coerente | 021/015 | — |
| Recommendation ≠ Decision ≠ Execution | Coerente | 022/020 | — |

**Conflitti terminologici aperti:** nessuno strutturale; rischio residuo in PLATFORM_MAP/HANDOFF language legacy.

---

## 14. State Machine Consistency Audit

| SM | Owner | Esito |
|----|-------|-------|
| Request/Quote/Booking/Service | Booking 014 | Separate OK |
| Trip / Operational Execution | Booking 014 + Operations events | OK; non fondere con Booking state |
| Assignment | Booking/Dispatch 014/019 | OK; ≠ Offer Exchange |
| Exchange Listing | Marketplace 012 | OK |
| Payment | Payment 020 | Auth ≠ Capture OK |
| Settlement / Payout | Settlement 006/020 | Separate OK |
| Dispute | Support 018/020 | ≠ Chargeback |
| Configuration / Feature Flag | 021 | SM separate OK |
| AI Recommendation / Automation / Incident | 022 | Tre SM separate OK |

**Rischi:** overlap semantico “ServiceCompleted” (Booking vs Operations) — mitigato da prefisso Domain; ownership Trip vs Service da tenere esplicita in implementazione.
**Cross-domain mutation:** vietata coerentemente in 019/020/022.

---

## 15. Event Consistency Audit

| Check | Esito |
|-------|-------|
| Past-tense naming | OK (catalogo 353) |
| Single producer | OK |
| Event ≠ Command | OK |
| Event ≠ Ledger Entry | OK (Finance.LedgerEntryPosted distinto) |
| PaymentAuthorized ≠ PaymentCaptured | OK |
| SettlementApproved ≠ PayoutCompleted | OK |
| OfferAccepted ≠ AssignmentAccepted | OK (Marketplace vs Dispatch) |
| DisputeOpened ≠ ChargebackOpened | OK |
| BookingCancelled ≠ ServiceCancelled | OK |
| Recommendation ≠ Decision ≠ Execution | OK |

**Gap:** molti eventi ancora `PROPOSED`; wire format/bus OPEN.

---

## 16. Financial Consistency Audit

| Regola | Esito |
|--------|-------|
| Partner Cost XOR Internal Execution Cost | Coerente |
| Commission ≠ Markup ≠ Platform Revenue | Coerente |
| CM / utile > GBV come guida | Coerente (BOS) |
| Max Assignment Budget / Min Margin Guardrail | Coerenti, valori OPEN |
| No double-count refund/compensation/recovery/chargeback | Coerente |
| Holdback reason+evidence+contestation | Coerente |
| Ledger reversal not overwrite | Coerente |
| Tax/MoR/Agency/IVA/PSD2 | **OPEN** — non chiusi |

Wallet / Commission Invoice / B2B giroconto: modellati a livello framework; dettagli **OPEN**.

---

## 17. Partner Exchange Consistency Audit

Coerente su: Originating/Executing/End Customer; Listing/Matching/Offer/CounterOffer; Service Order; Assignment PARTNER; Progressive Disclosure; Customer Price protection; Platform Fee; UNFILLED no fee + funds release; anti-disintermediation; data access audit.

**Geofence 10 km:** citato come soglia configurabile tipica in fonti Exchange — trattare come **valore configurabile OPEN** (non hardcode normativo irreversibile).
Payment conditional / settlement / payout: allineati a SFOF; provider payment OPEN.

---

## 18. Identity and Security Consistency Audit

Person ≠ User ≠ Role ≠ Capability; Tenant ≠ Organization; Membership; multi-role; active organization; RBAC; capability; deny by default; least privilege; progressive disclosure: **coerenti**.

RLS: principi in 015; implementazione Blueprint §13 **NOT_READY**.
AI non supera Permission; Config non concede Permission: **coerenti** (021/022).

---

## 19. Configuration Consistency Audit

Scope, precedence, override espliciti, published immutability, rollback, Flag≠Rule, Config≠Secret≠Permission≠Operational Data, tax OPEN, country/tenant/AI/settlement/pricing config: **coerenti**.
Tech storage/cache/provider: OPEN.

---

## 20. AI Governance Consistency Audit

AI non SoT; Rec≠Dec≠Exec; no operational aggregates; no Ledger; no RBAC/Config/Margin/Compliance bypass; Human Review HIGH/CRITICAL; fallback; kill switch; model/prompt version; audit; cost attribution: **coerenti**.
Provider/modelli/soglie: OPEN.

---

## 21. Duplicate Content Audit

| Tipo | Esempi | Azione futura |
|------|--------|---------------|
| Sintesi accettabile | Principi CM/XOR ripetuti in 002/017/019 | Cross-ref verso BOS |
| Da sostituire con cross-ref | Liste eventi nei framework vs catalogo 020 | Citare EVT-ID |
| Con conflitto | Nessuna maggiore rilevata | — |
| Obsoleta | “prossimo codice MC-OS-013” in testi vecchi se residui | Sync EDGF già fatto; sweep residuali |
| Delivery vs Target | PLATFORM_MAP fasi vs Blueprint target | Mantenere separate |

---

## 22. Contradiction Register

| ID | Documenti | Sintesi | Tech | Econ | Ops | Legal | SoT proposta | Decisione | Owner | Professionista | Priorità |
|----|-----------|---------|------|------|-----|-------|--------------|-----------|-------|----------------|----------|
| CTR-001 | 004 vs frameworks OPEN | DECISIONS_PENDING non elenca OPEN Exchange/AI/Config | M | M | L | L | §23 + sync 004 | Unificare registro | Product+CEA | — | P1 |
| CTR-002 | 001 header vs EDGF | Blueprint senza header MC-OS-001 | L | — | L | — | EDGF | Applicare header | Doc Gov | — | P1 |
| CTR-003 | 007/008 vs 012–022 | Delivery docs non citano nuovi framework | M | L | M | — | 007/008 sync | Aggiornare handoff/map | Product | — | P2 |
| CTR-004 | 013 vs readiness | Diagrammi placeholder vs “pronto Draw.io” percepito | M | — | L | — | 013 + §26 | Solo DGM stabili | CEA | — | P2 |
| CTR-005 | Finance vs Settlement boundary | Ownership fine Finance↔Settlement ancora OPEN | H | H | M | M | 006+019 | ADR futuro | Finance+CEA | Commercialista | P1 |
| CTR-006 | MoR / tax | Placeholder multipli; nessuna chiusura | H | H | M | H | 002 | Validazione | Product | Fiscalista | P0 |
| CTR-007 | Filename EDGF | File ancora DOCUMENTATION_MANAGEMENT… | L | — | L | — | 000 | Rename futuro (non ora) | Doc Gov | — | P3 |

Nessuna contraddizione che neghi XOR costi o fusione Booking=Trip.

---

## 23. Open Decision Register unificato

| Unified ID | Domanda | Alternative / note | Docs | Dominio | Impatto | Blocca OS Found. | Blocca Finance | Blocca Exchange | Owner | Consulenza | Priorità | Quando |
|------------|---------|-------------------|------|---------|---------|------------------|----------------|-----------------|-------|------------|----------|--------|
| UOD-001 | Provider pagamenti | Stripe/Nexi/… | 004#1,006,016 | Payment | Alto | N | **Y** | Y | Product | PSP/PSD2 | P0 | Pre-payment impl |
| UOD-002 | Policy acconto/rimborso | % OPEN | 004#2,014,018 | Booking/Finance | Alto | N | Y | N | Product | Legal | P0 | Pre-checkout |
| UOD-003 | Cancellazioni/penali | % OPEN | 004#3,014 | Booking | Alto | N | Y | N | Product | Legal | P0 | Pre-terms |
| UOD-004 | Struttura commissioni | % OPEN | 004#4,017,012 | Pricing | Alto | N | Y | Y | Product | Finance | P0 | Pre-settlement |
| UOD-005 | Modello partner portal | Email vs portal | 004#5,005 | Partner | Medio | N | N | Partial | Product | — | P1 | Fase partner |
| UOD-006 | Voci NCC go-live | Subset matrix | 004#6,003,017 | Pricing | Medio | N | Partial | N | Product | Transport | P1 | Pre-pricing eng |
| UOD-007 | Assignment default | Manual vs offer | 004#7,014 | Dispatch | Medio | N | N | Y | Product | — | P1 | Pre-dispatch |
| UOD-008 | Provider notifiche | Email/SMS/Push | 004#8,016 | Notification | Medio | N | N | N | Product | — | P1 | Pre-notify |
| UOD-009 | Lingue go-live | IT/EN+? | 004#9,016,018 | CX | Basso | N | N | N | Product | — | P2 | Pre-i18n |
| UOD-010 | Criteri go-live | Auth/pay/MVP | 004#10 | Delivery | Alto | Partial | Y | Partial | Product | — | P0 | Pre-prod |
| UOD-011 | MoR vs intermediario | Per paese | 002,006 | Finance/Legal | Critico | N | **Y** | Y | Product | Fiscalista+Legal | P0 | Pre-invoice |
| UOD-012 | Event bus / outbox | Tech OPEN | 020,019 | Platform | Alto | Partial | Y | Y | Eng | — | P1 | Pre-integration |
| UOD-013 | Modular monolith vs services | OPEN | 019,021,022 | Platform | Alto | Partial | N | N | CEA | — | P1 | Pre-impl arch |
| UOD-014 | Finance vs Settlement split | Boundary OPEN | 019,006 | Finance | Alto | N | Y | Y | Finance+CEA | Commercialista | P1 | Pre-ledger |
| UOD-015 | AI provider/models | OPEN | 022 | AI | Medio | N | N | N | AI Gov | Privacy+AI Act | P2 | Pre-AI |
| UOD-016 | Config storage/cache | OPEN | 021 | Config | Medio | Partial | N | N | Platform | — | P1 | Pre-config |
| UOD-017 | RLS implementation patterns | OPEN detail | 015,Blueprint | Security | Alto | **Y** | Y | Y | Security | — | P0 | OS Foundation |
| UOD-018 | Holdback/reserve numeric | OPEN | 006,021 | Settlement | Alto | N | Y | Y | Finance | Legal | P0 | Pre-payout |
| UOD-019 | Disclosure timing values | T-12/T-6 config | 012,021 | Exchange | Medio | N | N | Y | Marketplace | Privacy | P1 | Pre-exchange |
| UOD-020 | ADR Index creation | MC-OS-010 | EDGF | Governance | Medio | N | N | N | CEA | — | P1 | Baseline |

*(Elenco non esaustivo di ogni OPEN locale; rappresenta il set unificato prioritario. Framework OPEN restano aperti.)*

---

## 24. Approved Decision Register unificato

| Unified ID | Testo normalizzato | SoT | Richiamato da | Impatto software | Validazione residua | Stato |
|------------|-------------------|-----|---------------|------------------|---------------------|-------|
| UAD-001 | CM e utile prioritari rispetto a GBV/GMV | 002 | 017,019,021 | KPI/pricing guardrail | — | Approved |
| UAD-002 | Partner Cost XOR Internal Execution Cost | 002/009 | 014,017,019,020 | Assignment costing | — | Approved |
| UAD-003 | No double-count Refund/Compensation/Recovery/Chargeback | 002/006 | 014,022 | Ledger rules | Legal edge cases | Approved |
| UAD-004 | Booking ≠ Service ≠ Trip ≠ Assignment | 014/009 | 019,020,023 | Separate aggregates/SM | — | Approved |
| UAD-005 | Exchange B2B ≠ B2C; Originating keeps customer | 012 | 019 | Marketplace BC | — | Approved |
| UAD-006 | Progressive Data Disclosure; Customer Price hidden to Executing by default | 012 | 015,016,021 | Disclosure config | Privacy counsel | Approved |
| UAD-007 | UNFILLED → release fondi; no platform fee | 012 | 017,020 | Settlement path | — | Approved |
| UAD-008 | Holdback solo con reason+Evidence+contestation | 005/006 | 021 | Settlement | Legal | Approved |
| UAD-009 | Person ≠ User ≠ Role ≠ Capability; deny by default | 015 | 019,021,022 | AuthZ model | — | Approved |
| UAD-010 | Config over hardcoding; published immutable; no silent override | 021 | 017,022 | Config service | — | Approved |
| UAD-011 | Feature Flag ≠ Business Rule; Config ≠ Secret ≠ Permission | 021 | 015,022 | Boundaries | — | Approved |
| UAD-012 | Event immutable fact; Event ≠ Command ≠ Ledger | 020 | 019,022 | Eventing | Tech bus OPEN | Approved |
| UAD-013 | AI Supporting; Rec≠Dec≠Exec; no Ledger/RBAC/Config/Margin/Compliance bypass | 022 | 019,020,021 | AI gates | AI Act readiness | Approved |
| UAD-014 | Max Assignment Budget & Min Margin Guardrail configurabili | 017 | 014,021,022 | Pricing engine | Numeric OPEN | Approved |
| UAD-015 | Partner indipendente; no subordination | 005 | 012 | Partner model | Labor counsel | Approved |
| UAD-016 | Tax regime configurabile; no fiscal definitive without professionals | 002 | 017,021 | Tax flags | **Required** | Approved principle |
| UAD-017 | Append-only audit / financial reversal not overwrite | 006/020 | 022 | Ledger/audit | — | Approved |
| UAD-018 | No cross-domain direct state mutation | 019 | 020,022 | Integration style | — | Approved |
| UAD-019 | Analytics/AI not operational write SoT | 019/022 | 020 | Read models | — | Approved |
| UAD-020 | Documentation codes MC-OS immutabili; EDGF SoT registry | 000 | All | Doc ops | — | Approved |

---

## 25. Legacy and Stale Documentation

| Item | Issue | Piano sync (non eseguito qui) |
|------|-------|-------------------------------|
| PLATFORM_MAP | Delivery SoT; non cita 012–023 | Aggiornare sezione docs + fase |
| HANDOFF | Session file; può essere stale | Refresh post-consolidation |
| DECISIONS_PENDING | Solo #1–10; incompleto vs UOD | Espandere o puntare a §23 |
| Docs 001–008 | Header MC-OS mancante | Migrazione header EDGF |
| Filename EDGF | Nome file ≠ titolo EDGF | Rename in fase cartelle 00–09 |
| “Da creare” obsoleti | Roadmap che citava prossimo 013/019 già usati | Sweep testuale |
| Fase 0 / test status | In 007/BACKUP | Non confondere con target arch |

---

## 26. Diagram Readiness Audit

| DGM | SoT disponibili | Stabilità | Pronto Draw.io? | Decisioni mancanti | Priorità | Rischio rifacimento |
|-----|-----------------|-----------|-----------------|--------------------|----------|---------------------|
| 001–002 Ecosystem/Business | 002,019 | Media | Partial | — | P2 | Medio |
| 003 Booking Lifecycle | 014 | Alta | **Sì candidate** | Cancel % | P1 | Basso |
| 004 Exchange Lifecycle | 012 | Alta | **Sì candidate** | Fee % | P1 | Medio |
| 005 Progressive Disclosure | 012,015 | Alta | **Sì candidate** | Timing values | P1 | Medio |
| 006 Settlement | 006 | Media | Partial | MoR, numeric | P1 | Alto |
| 007 Payment | 006,004 | Bassa | **No** | Provider | P0 | Alto |
| 008–009 Wallet/Ledger | 006 | Bassa | **No** | MoR/Wallet | P0 | Alto |
| 010–012 Matching/Ops | 012,014 | Media | Partial | Assignment default | P2 | Medio |
| 013–018 State machines | 014,012,006,020 | Alta | **Sì candidate** | — | P1 | Basso |
| 019–020 Security/Access | 015 | Media | Partial | RLS detail | P1 | Medio |
| 021–022 Domain/Finance | 019,006 | Media | Partial | Finance split | P2 | Medio |
| 023–025 Engines | 017,012,014 | Media | Partial | Numeric | P2 | Medio |
| 026–030 Cross-cutting | 020,021,022 | Media | Partial | Bus tech | P2 | Medio |
| **DGM-031+ Contestation** | 006 | Media | Partial | Legal | P2 | Medio |
| **DGM-032 Recovery** | 014 | Alta | **Sì candidate** | — | P1 | Basso |
| **DGM-033 NCC Pricing** | 003,017 | Media | Partial | NCC subset | P2 | Medio |
| **DGM-034 UNFILLED** | 012 | Alta | **Sì candidate** | — | P1 | Basso |
| **DGM-035 C4 Container** | 019 | Bassa | **No** | Monolith vs services | P1 | Alto |
| **DGM-036 Evidence Chain** | 014,005,006 | Media | Partial | — | P2 | Basso |

---

## 27. Architecture Baseline Candidate

Documenti candidati a **Architecture Baseline v1 Candidate** (senza cambio stato ufficiale):

- MC-OS-000, 002, 005, 006, 009, 011
- MC-OS-012 … 023 (Draft ma coerenti)
- Blueprint come indice (con gap header)

**Non ancora baseline:** 003 (tariffe go-live OPEN), 004 (incompleto), 007/008 (stale delivery), 010 (mancante), 013 Draw.io files.

---

## 28. Pre-Implementation Readiness

| Area | Stato |
|------|-------|
| Tenant model | READY_WITH_OPEN_VALUES |
| Identity/Auth | READY_WITH_OPEN_VALUES (MFA/provider OPEN) |
| RBAC | READY_WITH_OPEN_VALUES |
| RLS | NOT_READY (patterns TBD) |
| Booking persistence | READY_WITH_OPEN_VALUES |
| Service model | READY |
| Assignment model | READY_WITH_OPEN_VALUES (#7) |
| Pricing foundation | READY_WITH_OPEN_VALUES |
| Event foundation | READY_WITH_OPEN_VALUES (bus OPEN) |
| Configuration foundation | READY_WITH_OPEN_VALUES |
| Partner onboarding | READY_WITH_OPEN_VALUES |
| Partner Exchange | READY_WITH_OPEN_VALUES |
| Payment | PROFESSIONAL_VALIDATION_REQUIRED + NOT_READY provider |
| Settlement | READY_WITH_OPEN_VALUES + PROFESSIONAL_VALIDATION_REQUIRED |
| Payout | PROFESSIONAL_VALIDATION_REQUIRED |
| AI | READY (recommendation-only) / NOT_READY autonomy |

---

## 29. OS Foundation Scope Recommendation

**Includere (minimo):** Tenant, Organization, Person, User, Membership, Role, Permission, Customer, Booking, Service, Assignment, Driver, Vehicle, Event Envelope foundation, Configuration foundation, Audit foundation.

**NON includere ancora:** Payment capture production, Payout automation, Partner Exchange matching completo, AI supervised automation, tax engine definitivo, multi-country full Local Law, Draw.io obbligatori, distributed services split.

---

## 30. Next Architecture Documents

Ordine proposto **dopo** sync consolidamento (senza assegnare codici):

1. Security Architecture
2. Data Architecture
3. API & Integration Architecture
4. Payment Architecture
5. Dispatch Engine Specification
6. Matching Engine Specification
7. Observability
8. Infrastructure
9. Disaster Recovery
10. Enterprise Reference Architecture
(+ ADR Index MC-OS-010)

---

## 31. Documentation Sync Plan

Sequenza unica limitata:

1. EDGF registro (questa release)
2. Blueprint cross-ref MC-OS-023
3. Header MC-OS su 001–008
4. Glossary sweep termini legacy in 007/008
5. Entity Model cross-check ownership 019
6. DECISIONS_PENDING → puntatore a UOD §23 + merge #1–10
7. PLATFORM_MAP: sezione “Target docs” vs delivery
8. HANDOFF refresh
9. Roadmap sweep “prossimo codice” obsoleto
10. Solo dopo: nuovi documenti architetturali

---

## 32. Consolidation Exit Criteria

Checklist:

- [x] SoT univoche mappate (§7)
- [x] Nessun codice MC-OS duplicato
- [x] Glossario coerente sui termini chiave
- [x] State machine separate
- [x] Ownership chiara
- [x] Eventi coerenti (catalogo)
- [x] OPEN unificati (§23)
- [x] Approved normalizzati (§24)
- [x] Delivery roadmap ≠ target architecture
- [x] Diagram readiness classificata
- [x] OS Foundation scope definito
- [x] Nessuna chiusura fiscale/legale senza professionisti

Residuo per “consolidation complete” formale: sync header 001–008 + refresh 004/007/008.

---

## 33. Decisioni approvate (consolidation)

| ID | Decisione |
|----|-----------|
| ACR-DA-01 | Fermare nuovi framework dominio fino a sync plan §31 |
| ACR-DA-02 | SoT map §7 è normativa per cross-ref |
| ACR-DA-03 | UAD/UOD sono registri unificati candidati |
| ACR-DA-04 | OS Foundation scope §29 è raccomandazione pre-impl |
| ACR-DA-05 | Delivery (007/008) distinta da target architecture |
| ACR-DA-06 | Nessuna chiusura OPEN fiscale/legale in consolidation |

---

## 34. Decisioni OPEN (emerse dalla consolidation)

- Formalizzare MC-OS-004 come Decision Register unificato vs mantenere §23+004
- Priorità P0 UOD-001/011/017
- Quando creare MC-OS-010 ADR Index
- Rename fisico file EDGF
- Criteri promozione Draft → Under Review per Baseline v1

---

## 35. Roadmap di consolidamento

1. **Immediate Documentation Sync** — header 001–008; DECISIONS; PLATFORM_MAP; HANDOFF
2. **Architecture Baseline Candidate** — review Under Review dei framework core
3. **Professional Validation** — fiscalista, legale, PSD2, privacy, AI Act readiness
4. **OS Foundation Design** — Security/Data/API docs + ADR
5. **Software Implementation Readiness** — solo dopo P0 UOD chiusi dove bloccanti

---

## Cronologia revisioni

| Versione | Data | Autore | Descrizione modifica | Stato |
|----------|------|--------|----------------------|-------|
| 0.1.0 | 2026-07-26 | MyChauffeur OS Team | Prima Architecture Consolidation Release v1. | Draft |

---

*Fine MC-OS-023 v0.1.0 — Draft.*

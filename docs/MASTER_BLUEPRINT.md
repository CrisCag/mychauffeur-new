# MyChauffeur OS — Master Blueprint

**Documento:** Master Blueprint Architetturale  
**Prodotto:** MyChauffeur OS  
**Repository di riferimento:** `mychauffeur-new`  
**Branch di lavoro:** `fase-0/stabilizzazione-sicurezza-baseline`  
**Classificazione:** Documentazione ufficiale di progetto  
**Stato:** Bozza strutturale (indice e scheletro)  
**Versione documento:** 0.1.1  

| Campo | Valore |
|-------|--------|
| Ruolo del documento | Indice normativo e scheletro architetturale di lungo periodo |
| Fonte operativa | [`HANDOFF.md`](../HANDOFF.md) |
| Fonte tecnico-roadmap | [`PLATFORM_MAP.md`](../PLATFORM_MAP.md) |
| Audit / baseline Fase 0 | [`BACKUP_FASE_0_PRE_MAIN_2026-07-09.md`](../BACKUP_FASE_0_PRE_MAIN_2026-07-09.md) |
| Allegati prodotto | [`NCC_TARIFF_REQUIREMENTS.md`](./NCC_TARIFF_REQUIREMENTS.md) · [`DECISIONS_PENDING.md`](./DECISIONS_PENDING.md) |

---

## Introduzione

Il presente Master Blueprint costituisce il documento architetturale ufficiale di **MyChauffeur OS**, la piattaforma enterprise destinata alla gestione operativa, commerciale e amministrativa di servizi di noleggio con conducente (NCC) e mobilità premium.

Questo documento non descrive ancora nel dettaglio le soluzioni tecniche adottate. Nella versione corrente definisce esclusivamente la **struttura normativa** del Blueprint: titolo, introduzione, indice completo, capitoli, sottocapitoli e segnaposto di contenuto. Ogni sezione sarà sviluppata progressivamente, in coerenza con le decisioni di prodotto, le Architecture Decision Records (ADR) e l’evoluzione del codice sul repository di riferimento.

Il Blueprint è pensato per accompagnare il progetto nel lungo periodo: deve restare la fonte di verità condivisa tra product, engineering, operations e stakeholder di business. Le sezioni marcate con `TODO` indicano contenuto ancora da redigere; non rappresentano decisioni incomplete nel codice, bensì lacune documentali da colmare in fasi successive.

**Ambito di questa edizione**

- Definizione dell’indice ufficiale e della numerazione dei capitoli.
- Contorno di ciascun capitolo (descrizione sintetica + struttura dei sottocapitoli).
- Allineamento terminologico preliminare verso il Glossario e gli ADR.
- Mappa dei riferimenti e cross-reference verso i documenti operativi esistenti.

**Fuori ambito di questa edizione**

- Specifiche implementative dettagliate.
- Diagrammi di sequenza, ERD completi o cataloghi API.
- Decisioni di prodotto non ancora formalizzate.
- Modifica dei contenuti tecnici già presenti in `HANDOFF.md`, `PLATFORM_MAP.md` o nell’audit Fase 0.

---

## 0. Mappa documentale e riferimenti

Sezione di navigazione documentale. Non sostituisce i documenti sorgente: li indicizza e li collega ai capitoli del Blueprint.

> **Riferimenti (governance documentale / Costituzione della documentazione):** [`docs/DOCUMENTATION_MANAGEMENT_FRAMEWORK.md`](./DOCUMENTATION_MANAGEMENT_FRAMEWORK.md) (MC-OS-000).  
> **Riferimenti (Architecture Consolidation Release v1):** [`docs/ARCHITECTURE_CONSOLIDATION_RELEASE_V1.md`](./ARCHITECTURE_CONSOLIDATION_RELEASE_V1.md) (**MC-OS-023**).  
> **Riferimenti (Architecture Baseline Freeze v1 — B001):** [`docs/ARCHITECTURE_BASELINE_FREEZE_V1.md`](./ARCHITECTURE_BASELINE_FREEZE_V1.md) (**MC-OS-025**).  
> **Riferimenti (Software Architecture Framework):** [`docs/SOFTWARE_ARCHITECTURE_FRAMEWORK.md`](./SOFTWARE_ARCHITECTURE_FRAMEWORK.md) (**MC-OS-026**).  
> **Riferimenti (Data Architecture Framework):** [`docs/DATA_ARCHITECTURE_FRAMEWORK.md`](./DATA_ARCHITECTURE_FRAMEWORK.md) (**MC-OS-027**).  
> **Riferimenti (Security Architecture Framework):** [`docs/SECURITY_ARCHITECTURE_FRAMEWORK.md`](./SECURITY_ARCHITECTURE_FRAMEWORK.md) (**MC-OS-028**).  
> **Riferimenti (Role, Capability and Permission Catalog):** [`docs/ROLE_CAPABILITY_AND_PERMISSION_CATALOG.md`](./ROLE_CAPABILITY_AND_PERMISSION_CATALOG.md) (**MC-OS-029**).  
> **Riferimenti (Dispatch & Operations Engine Framework):** [`docs/DISPATCH_AND_OPERATIONS_ENGINE_FRAMEWORK.md`](./DISPATCH_AND_OPERATIONS_ENGINE_FRAMEWORK.md) (**MC-OS-030**).

| ID | Documento | Ruolo | Path |
|----|-----------|-------|------|
| D01 | Master Blueprint | Indice architetturale ufficiale (questo file) | `docs/MASTER_BLUEPRINT.md` |
| D02 | Handoff | Passaggio operativo di sessione | [`HANDOFF.md`](../HANDOFF.md) |
| D03 | Platform Map | Stato reale, architettura, roadmap ufficiale fasi 0–5 | [`PLATFORM_MAP.md`](../PLATFORM_MAP.md) |
| D04 | Audit / Backup Fase 0 | Baseline pre-merge e verifiche di fase | [`BACKUP_FASE_0_PRE_MAIN_2026-07-09.md`](../BACKUP_FASE_0_PRE_MAIN_2026-07-09.md) |
| D05 | Requisiti tariffari NCC | Allegato prodotto pricing | [`docs/NCC_TARIFF_REQUIREMENTS.md`](./NCC_TARIFF_REQUIREMENTS.md) |
| D06 | Decisioni pendenti | Decisioni da approvare prima del codice | [`docs/DECISIONS_PENDING.md`](./DECISIONS_PENDING.md) |

### 0.1 Precedenza documentale

1. **Contenuto normativo di lungo periodo** → questo Blueprint (capitoli 1–47).  
2. **Stato reale e roadmap operativa** → `PLATFORM_MAP.md` (fonte fino a integrazione nel cap. 44).  
3. **Ripresa sessione / file da toccare** → `HANDOFF.md`.  
4. **Esito verifiche Fase 0 (baseline)** → `BACKUP_FASE_0_PRE_MAIN_2026-07-09.md`.  
5. **Requisiti e decisioni di prodotto** → allegati in `docs/`.

### 0.2 Cross-reference Blueprint ↔ documenti esistenti

| Capitolo Blueprint | Documento sorgente | Sezione / nota di riferimento |
|--------------------|--------------------|-------------------------------|
| 1 Visione | D03 | `PLATFORM_MAP.md` → Visione |
| 4 Filosofia del prodotto | D03 | Filosofia Daytrip / hub operativo |
| 6 Architettura generale | D03 | Stack e architettura; Architettura target |
| 8 Database | D03 | Piano migrazione JSON → Supabase |
| 10 Sicurezza | D03, D04 | Fase 0 DoD; contenuto baseline audit |
| 11–13 Auth / RBAC / RLS | D03, D02 | Fondamenta mancanti; Fase 2 roadmap |
| 14 Booking Engine | D02, D03 | Handoff § Booking; Cosa esiste oggi |
| 15 Pricing Engine | D03, D05 | Motore tariffario NCC; allegato requisiti |
| 16 Dispatcher Console | D03 | Modello operativo; superfici Operator/Dispatch |
| 17 Driver Portal | D02, D03 | Portale driver; superficie Driver web |
| 18 Customer Portal | D03 | Superficie Customer web IT/EN |
| 19 Partner Portal | D03, D06 | Fase 4; decisioni scope partner |
| 23 Payments | D03, D06 | Fase 3; decisioni provider |
| 24 Billing | D05, D06 | Livelli economici NCC; decisioni pendenti |
| 27 API | D02, D03 | Inventario route `app/api/` |
| 33 Backup | D03, D04 | Protocollo «mi fermo»; audit/backup Fase 0 |
| 41 Testing Strategy | D03, D04 | Fase 0 test DoD; esiti audit baseline |
| 44 Roadmap | D03, D02 | Roadmap ufficiale fasi 0–5; Handoff §5 |
| 45 ADR | D06 | `DECISIONS_PENDING.md` (pre-ADR) |
| 47 Appendici | D01–D06 | Indice documenti correlati |

> **TODO (solo riferimenti):** mantenere aggiornata la tabella 0.2 a ogni evoluzione di `HANDOFF.md` / `PLATFORM_MAP.md` / audit di fase, senza alterare i contenuti tecnici di quei documenti da questo file.

---

## Indice

0. [Mappa documentale e riferimenti](#0-mappa-documentale-e-riferimenti)
1. [Visione del progetto](#1-visione-del-progetto)
2. [Mission](#2-mission)
3. [Obiettivi](#3-obiettivi)
4. [Filosofia del prodotto](#4-filosofia-del-prodotto)
5. [Principi architetturali](#5-principi-architetturali)
6. [Architettura generale](#6-architettura-generale)
7. [Domain Model](#7-domain-model)
8. [Database](#8-database)
9. [Multi-tenant](#9-multi-tenant)
10. [Sicurezza](#10-sicurezza)
11. [Autenticazione](#11-autenticazione)
12. [RBAC](#12-rbac)
13. [RLS](#13-rls)
14. [Booking Engine](#14-booking-engine)
15. [Pricing Engine](#15-pricing-engine)
16. [Dispatcher Console](#16-dispatcher-console)
17. [Driver Portal](#17-driver-portal)
18. [Customer Portal](#18-customer-portal)
19. [Partner Portal](#19-partner-portal)
20. [Marketplace](#20-marketplace)
21. [CRM](#21-crm)
22. [Fleet Management](#22-fleet-management)
23. [Payments](#23-payments)
24. [Billing](#24-billing)
25. [Reporting](#25-reporting)
26. [AI Assistant](#26-ai-assistant)
27. [API](#27-api)
28. [Workflow operativi](#28-workflow-operativi)
29. [Eventi di dominio](#29-eventi-di-dominio)
30. [Notifiche](#30-notifiche)
31. [Logging](#31-logging)
32. [Monitoring](#32-monitoring)
33. [Backup](#33-backup)
34. [Disaster Recovery](#34-disaster-recovery)
35. [Performance](#35-performance)
36. [Scalabilità](#36-scalabilità)
37. [UX Guidelines](#37-ux-guidelines)
38. [UI Guidelines](#38-ui-guidelines)
39. [Standard di sviluppo](#39-standard-di-sviluppo)
40. [Naming Convention](#40-naming-convention)
41. [Testing Strategy](#41-testing-strategy)
42. [DevOps](#42-devops)
43. [Deployment](#43-deployment)
44. [Roadmap](#44-roadmap)
45. [Architecture Decision Records (ADR)](#45-architecture-decision-records-adr)
46. [Glossario](#46-glossario)
47. [Appendici](#47-appendici)

---

## 1. Visione del progetto

Definisce la direzione strategica di MyChauffeur OS: il problema di mercato che affronta, il posizionamento rispetto alle piattaforme di mobilità tradizionali e l’orizzonte di valore per operatori NCC, partner e clienti finali.

### 1.1 Contesto di mercato
### 1.2 Problema da risolvere
### 1.3 Proposta di valore
### 1.4 Stakeholder principali
### 1.5 Orizzonte strategico

> **Riferimenti:** [`PLATFORM_MAP.md`](../PLATFORM_MAP.md) → Visione.  
> **TODO:** Redigere la visione di prodotto, il posizionamento competitivo e gli stakeholder target. Collegare eventuali riferimenti alla CHAT MASTER e alle decisioni di prodotto già consolidate.

---

## 2. Mission

Descrive lo scopo operativo e duraturo della piattaforma: cosa MyChauffeur OS si impegna a rendere possibile ogni giorno per le organizzazioni che la adottano.

### 2.1 Dichiarazione di mission
### 2.2 Ambito funzionale primario
### 2.3 Ambito escluso (non-goals)
### 2.4 Criteri di successo della mission

> **TODO:** Formalizzare la mission statement, i confini del prodotto e i criteri qualitativi/quantitativi di aderenza alla mission.

---

## 3. Obiettivi

Elenca gli obiettivi di business, di prodotto e tecnici che guidano le priorità di delivery, misurabili e revisionabili nel tempo.

### 3.1 Obiettivi di business
### 3.2 Obiettivi di prodotto
### 3.3 Obiettivi tecnici e di affidabilità
### 3.4 KPI e metriche di successo
### 3.5 Vincoli e assunti

> **TODO:** Definire obiettivi SMART, KPI associati e vincoli (normativi, economici, tecnologici) che condizionano il raggiungimento.

---

## 4. Filosofia del prodotto

Espone i principi di prodotto che orientano le scelte di UX, di priorità funzionale e di esperienza operativa per dispatcher, driver, clienti e partner.

### 4.1 Principi di prodotto
### 4.2 Esperienza operativa-first
### 4.3 Semplicità controllata vs. potenza enterprise
### 4.4 Coerenza multi-superficie (console e portal)
### 4.5 Evoluzione incrementale del valore

> **Riferimenti:** [`PLATFORM_MAP.md`](../PLATFORM_MAP.md) → Visione (filosofia Daytrip / dispatcher / hub).  
> **TODO:** Documentare i principi di product design e le trade-off ricorrenti (completezza vs. velocità operativa, automazione vs. controllo umano).

---

## 5. Principi architetturali

Stabilisce le regole non negoziabili dell’architettura software: multi-tenancy, sicurezza by design, modularità, osservabilità e governabilità del cambiamento.

### 5.1 Security by design
### 5.2 Multi-tenancy by design
### 5.3 Separazione dei bounded context
### 5.4 Idempotenza e consistenza operativa
### 5.5 Observability by default
### 5.6 Preferenza per decisioni esplicite e ADR

> **Riferimenti (Software Architecture Framework — principi, layering, moduli):** [`docs/SOFTWARE_ARCHITECTURE_FRAMEWORK.md`](./SOFTWARE_ARCHITECTURE_FRAMEWORK.md) (**MC-OS-026**).  
> **TODO:** Codificare i principi architetturali vincolanti, con esempi di applicazione e anti-pattern da evitare.

---

## 6. Architettura generale

Fornisce la mappa ad alto livello dei componenti del sistema, dei confini applicativi e dei flussi principali tra servizi, dati e interfacce utente.

### 6.1 Vista contestuale (C4 — Context)
### 6.2 Vista dei container (C4 — Container)
### 6.3 Vista dei componenti principali
### 6.4 Stack tecnologico di riferimento
### 6.5 Integrazioni esterne
### 6.6 Diagramma di deployment logico

> **Riferimenti:** [`PLATFORM_MAP.md`](../PLATFORM_MAP.md) → Stack e architettura; Architettura target. [`HANDOFF.md`](../HANDOFF.md) → Architettura — file da conoscere.  
> **Riferimenti (catalogo diagrammi ufficiali):** [`docs/SYSTEM_ARCHITECTURE_AND_PROCESS_DIAGRAMS.md`](./SYSTEM_ARCHITECTURE_AND_PROCESS_DIAGRAMS.md) (**MC-OS-013**, DGM-001…030).  
> **Riferimenti (System Domain Architecture / Bounded Context):** [`docs/SYSTEM_DOMAIN_ARCHITECTURE.md`](./SYSTEM_DOMAIN_ARCHITECTURE.md) (**MC-OS-019**).  
> **Riferimenti (System Event Catalog):** [`docs/SYSTEM_EVENT_CATALOG.md`](./SYSTEM_EVENT_CATALOG.md) (**MC-OS-020**).  
> **Riferimenti (Configuration & Feature Management):** [`docs/CONFIGURATION_AND_FEATURE_MANAGEMENT_FRAMEWORK.md`](./CONFIGURATION_AND_FEATURE_MANAGEMENT_FRAMEWORK.md) (**MC-OS-021**).  
> **Riferimenti (AI & Automation Governance):** [`docs/AI_AND_AUTOMATION_GOVERNANCE_FRAMEWORK.md`](./AI_AND_AUTOMATION_GOVERNANCE_FRAMEWORK.md) (**MC-OS-022**).  
> **Riferimenti (Software Architecture Framework — Modular Monolith, Components, Modules, Layering):** [`docs/SOFTWARE_ARCHITECTURE_FRAMEWORK.md`](./SOFTWARE_ARCHITECTURE_FRAMEWORK.md) (**MC-OS-026**).  
> **TODO:** Redigere le viste C4, lo stack ufficiale e il perimetro delle integrazioni. Nessun dettaglio implementativo in questa fase di scheletro; i disegni Draw.io seguiranno i placeholder DGM.

---

## 7. Domain Model

Descrive il linguaggio ubiquo e le entità di dominio centrali (tenant, booking, viaggio, veicolo, autista, cliente, tariffa, fattura, ecc.).

### 7.1 Linguaggio ubiquo
### 7.2 Aggregati e entità principali
### 7.3 Relazioni di dominio
### 7.4 Cicli di vita delle entità chiave
### 7.5 Invarianti di business
### 7.6 Bounded context e ownership

> **Riferimenti (Business Domain Model ufficiale):** [`docs/BUSINESS_ENTITY_MODEL.md`](./BUSINESS_ENTITY_MODEL.md) (MC-OS-011). Terminologia: [`docs/DOMAIN_GLOSSARY_AND_BUSINESS_DICTIONARY.md`](./DOMAIN_GLOSSARY_AND_BUSINESS_DICTIONARY.md) (MC-OS-009).  
> **Riferimenti (System Domain Architecture / Bounded Context):** [`docs/SYSTEM_DOMAIN_ARCHITECTURE.md`](./SYSTEM_DOMAIN_ARCHITECTURE.md) (**MC-OS-019**).  
> **Riferimenti (Data Architecture Framework — Entity / persistence ownership):** [`docs/DATA_ARCHITECTURE_FRAMEWORK.md`](./DATA_ARCHITECTURE_FRAMEWORK.md) (**MC-OS-027**).  
> **TODO:** Pubblicare invarianti di dominio nel Blueprint rinviano al modello entità; non duplicare schede entità.

---

## 8. Database

Documenta la strategia dati: schema logico, policy di migrazione, vincoli di integrità, naming e criteri di evoluzione dello schema.

### 8.1 Strategia di persistenza
### 8.2 Schema logico e aree funzionali
### 8.3 Migrazioni e versionamento dello schema
### 8.4 Vincoli, indici e integrità referenziale
### 8.5 Soft delete, audit fields e storicizzazione
### 8.6 Linee guida per evoluzione dello schema

> **Riferimenti:** [`PLATFORM_MAP.md`](../PLATFORM_MAP.md) → Piano di migrazione dati JSON → Supabase. [`HANDOFF.md`](../HANDOFF.md) → Persistenza JSON / Supabase.  
> **Riferimenti (Data Architecture Framework — Persistence, Database, Logical Model):** [`docs/DATA_ARCHITECTURE_FRAMEWORK.md`](./DATA_ARCHITECTURE_FRAMEWORK.md) (**MC-OS-027**).  
> **TODO:** Definire le linee guida di database design e i confini tra documentazione blueprint e artefatti tecnici (migration, schema dump).

---

## 9. Multi-tenant

Definisce il modello di isolamento tra organizzazioni (tenant), le strategie di scoping dei dati e le regole di coesistenza su infrastruttura condivisa.

### 9.1 Modello di tenancy
### 9.2 Identità del tenant e contesto di richiesta
### 9.3 Isolamento dei dati
### 9.4 Configurazione per-tenant
### 9.5 Provisioning e onboarding tenant
### 9.6 Cross-tenant: casi ammessi e divieti

> **Riferimenti (Configuration & Feature Management):** [`docs/CONFIGURATION_AND_FEATURE_MANAGEMENT_FRAMEWORK.md`](./CONFIGURATION_AND_FEATURE_MANAGEMENT_FRAMEWORK.md) (**MC-OS-021**).  
> **Riferimenti (Data Architecture Framework — Tenant / Organization scoping):** [`docs/DATA_ARCHITECTURE_FRAMEWORK.md`](./DATA_ARCHITECTURE_FRAMEWORK.md) (**MC-OS-027**).  
> **TODO:** Formalizzare il modello multi-tenant, i meccanismi di isolamento e i casi d’uso cross-tenant ammessi (es. marketplace).

---

## 10. Sicurezza

Copre i requisiti di sicurezza applicativa, di infrastruttura e di processo: threat model, hardening, gestione dei segreti e conformità di base.

### 10.1 Threat model di riferimento
### 10.2 Superfici di attacco
### 10.3 Gestione dei segreti e delle credenziali
### 10.4 Protezione dei dati in transito e a riposo
### 10.5 Hardening applicativo
### 10.6 Security review e checklist di rilascio

> **Riferimenti:** [`PLATFORM_MAP.md`](../PLATFORM_MAP.md) → Fase 0 (DoD sicurezza). [`BACKUP_FASE_0_PRE_MAIN_2026-07-09.md`](../BACKUP_FASE_0_PRE_MAIN_2026-07-09.md) → Contenuto baseline Fase 0.  
> **Riferimenti (System Event Catalog — Audit / Security events):** [`docs/SYSTEM_EVENT_CATALOG.md`](./SYSTEM_EVENT_CATALOG.md) (**MC-OS-020**).  
> **Riferimenti (AI & Automation Governance — security threats / kill switch):** [`docs/AI_AND_AUTOMATION_GOVERNANCE_FRAMEWORK.md`](./AI_AND_AUTOMATION_GOVERNANCE_FRAMEWORK.md) (**MC-OS-022**).  
> **Riferimenti (Security Architecture Framework):** [`docs/SECURITY_ARCHITECTURE_FRAMEWORK.md`](./SECURITY_ARCHITECTURE_FRAMEWORK.md) (**MC-OS-028**).  
> **Riferimenti (Role, Capability and Permission Catalog — Authorization / Security Scope / Data Visibility):** [`docs/ROLE_CAPABILITY_AND_PERMISSION_CATALOG.md`](./ROLE_CAPABILITY_AND_PERMISSION_CATALOG.md) (**MC-OS-029**).  
> **TODO:** Documentare threat model, controlli obbligatori e checklist di sicurezza allineate alla fase di stabilizzazione baseline.

---

## 11. Autenticazione

Descrive come identità e sessioni vengono stabilite, validate e terminate per utenti umani e, dove previsto, per client di sistema.

### 11.1 Modelli di identità
### 11.2 Flussi di login e logout
### 11.3 Sessioni e token
### 11.4 MFA e recovery
### 11.5 Autenticazione service-to-service
### 11.6 Ciclo di vita delle credenziali

> **Riferimenti:** [`PLATFORM_MAP.md`](../PLATFORM_MAP.md) → Fondamenta mancanti; Fase 2. [`HANDOFF.md`](../HANDOFF.md) → Auth / RLS / admin assenti.  
> **Riferimenti (Identity, Roles & Permission):** [`docs/IDENTITY_ROLES_AND_PERMISSION_FRAMEWORK.md`](./IDENTITY_ROLES_AND_PERMISSION_FRAMEWORK.md) (**MC-OS-015**).  
> **Riferimenti (Role, Capability and Permission Catalog):** [`docs/ROLE_CAPABILITY_AND_PERMISSION_CATALOG.md`](./ROLE_CAPABILITY_AND_PERMISSION_CATALOG.md) (**MC-OS-029**).  
> **Riferimenti (Security Architecture Framework — Authentication, Session, MFA/JWT readiness):** [`docs/SECURITY_ARCHITECTURE_FRAMEWORK.md`](./SECURITY_ARCHITECTURE_FRAMEWORK.md) (**MC-OS-028**).  
> **TODO:** Specificare i flussi di autenticazione ufficiali, i requisiti di sessione e le policy di rotazione/revoca.

---

## 12. RBAC

Definisce ruoli, permessi e matrici di autorizzazione per le diverse superfici applicative e i profili operativi del dominio NCC.

### 12.1 Modello ruoli/permessi
### 12.2 Ruoli di piattaforma e di tenant
### 12.3 Matrice di autorizzazione
### 12.4 Privilege escalation: controlli e divieti
### 12.5 Amministrazione dei ruoli
### 12.6 Auditing delle variazioni di privilegio

> **Riferimenti:** [`PLATFORM_MAP.md`](../PLATFORM_MAP.md) → Modello operativo MyChauffeur (ruoli previsti); Fase 2.  
> **Riferimenti (Identity, Roles & Permission):** [`docs/IDENTITY_ROLES_AND_PERMISSION_FRAMEWORK.md`](./IDENTITY_ROLES_AND_PERMISSION_FRAMEWORK.md) (**MC-OS-015**).  
> **Riferimenti (Role, Capability and Permission Catalog — Authorization Matrix / Scope / Data Visibility):** [`docs/ROLE_CAPABILITY_AND_PERMISSION_CATALOG.md`](./ROLE_CAPABILITY_AND_PERMISSION_CATALOG.md) (**MC-OS-029**).  
> **Riferimenti (Security Architecture Framework — Authorization, RBAC, matrici):** [`docs/SECURITY_ARCHITECTURE_FRAMEWORK.md`](./SECURITY_ARCHITECTURE_FRAMEWORK.md) (**MC-OS-028**).  
> **TODO:** Pubblicare il modello RBAC, i ruoli canonici e la matrice permesso × azione × risorsa.

---

## 13. RLS

Documenta le policy di Row Level Security come meccanismo di enforcement a livello dati, complementare a RBAC applicativo.

### 13.1 Ruolo della RLS nell’architettura
### 13.2 Policy pattern per tenant
### 13.3 Policy pattern per ruolo/profilo
### 13.4 Bypass controllati e service role
### 13.5 Testing e verifica delle policy
### 13.6 Operatività e troubleshooting RLS

> **Riferimenti:** [`PLATFORM_MAP.md`](../PLATFORM_MAP.md) → Fondamenta mancanti (RLS); Fase 2. [`BACKUP_FASE_0_PRE_MAIN_2026-07-09.md`](../BACKUP_FASE_0_PRE_MAIN_2026-07-09.md) → Non ancora incluso (RLS).  
> **Riferimenti (Security Architecture Framework — RLS readiness, Defense in Depth):** [`docs/SECURITY_ARCHITECTURE_FRAMEWORK.md`](./SECURITY_ARCHITECTURE_FRAMEWORK.md) (**MC-OS-028**).  
> **TODO:** Descrivere i pattern RLS ufficiali, le regole di ownership delle policy e i criteri di test obbligatori.

---

## 14. Booking Engine

È il cuore operativo della piattaforma: creazione, modifica, assegnazione e ciclo di vita delle prenotazioni e dei servizi di trasporto.

### 14.1 Ciclo di vita del booking
### 14.2 Tipologie di servizio
### 14.3 Regole di disponibilità e capacità
### 14.4 Assegnazione e riassegnazione
### 14.5 Modifiche, cancellazioni e no-show
### 14.6 Integrazione con pricing, fleet e notifiche

> **Riferimenti:** [`HANDOFF.md`](../HANDOFF.md) → Booking (flusso cliente). [`PLATFORM_MAP.md`](../PLATFORM_MAP.md) → Cosa esiste oggi / Funnel `/book`.  
> **Riferimenti (Booking & Service Lifecycle):** [`docs/BOOKING_AND_SERVICE_LIFECYCLE_FRAMEWORK.md`](./BOOKING_AND_SERVICE_LIFECYCLE_FRAMEWORK.md) (**MC-OS-014**).  
> **Riferimenti (Dispatch & Operations Engine Framework — Assignment / Live Journey):** [`docs/DISPATCH_AND_OPERATIONS_ENGINE_FRAMEWORK.md`](./DISPATCH_AND_OPERATIONS_ENGINE_FRAMEWORK.md) (**MC-OS-030**).  
> **TODO:** Documentare stati, transizioni e regole di business del booking engine, senza entrare in dettaglio di implementazione.

---

## 15. Pricing Engine

Definisce come vengono calcolati prezzi, tariffe, supplementi e quotazioni, in coerenza con i requisiti tariffari NCC e le policy commerciali del tenant.

### 15.1 Modelli tariffari supportati
### 15.2 Componenti di prezzo
### 15.3 Regole di calcolo e priorità
### 15.4 Quotazione preventiva vs. prezzo definitivo
### 15.5 Override manuali e audit
### 15.6 Allineamento a requisiti tariffari NCC

> **Riferimenti:** [`PLATFORM_MAP.md`](../PLATFORM_MAP.md) → Motore tariffario NCC. [`docs/NCC_TARIFF_REQUIREMENTS.md`](./NCC_TARIFF_REQUIREMENTS.md). [`HANDOFF.md`](../HANDOFF.md) → Pricing.  
> **Riferimenti (Pricing & Revenue Management):** [`docs/PRICING_AND_REVENUE_MANAGEMENT_FRAMEWORK.md`](./PRICING_AND_REVENUE_MANAGEMENT_FRAMEWORK.md) (**MC-OS-017**).  
> **TODO:** Formalizzare il modello di pricing, i riferimenti ai requisiti tariffari e le regole di override/audit.

---

## 16. Dispatcher Console

Descrive la console operativa per la centrale: monitoraggio servizi, assegnazione autisti/veicoli, gestione eccezioni e controllo in tempo reale.

### 16.1 Ruolo della console nel processo operativo
### 16.2 Viste e capacità principali
### 16.3 Flussi critici del dispatcher
### 16.4 Gestione eccezioni e escalation
### 16.5 Requisiti di freschezza dati e latenza
### 16.6 Permessi e profili dispatcher

> **Riferimenti:** [`PLATFORM_MAP.md`](../PLATFORM_MAP.md) → Modello operativo (Dispatcher); Le 5 superfici (Operator / Dispatch); Fase 2–4.  
> **Riferimenti (Role, Capability and Permission Catalog — Assignment / Dispatcher Matrix):** [`docs/ROLE_CAPABILITY_AND_PERMISSION_CATALOG.md`](./ROLE_CAPABILITY_AND_PERMISSION_CATALOG.md) (**MC-OS-029**).  
> **Riferimenti (Dispatch & Operations Engine Framework):** [`docs/DISPATCH_AND_OPERATIONS_ENGINE_FRAMEWORK.md`](./DISPATCH_AND_OPERATIONS_ENGINE_FRAMEWORK.md) (**MC-OS-030**).  
> **TODO:** Definire capacità, flussi critici e requisiti UX/operativi della Dispatcher Console.

---

## 17. Driver Portal

Copre l’interfaccia destinata agli autisti: accettazione servizi, stato missione, comunicazioni operative e adempimenti di turno.

### 17.1 Ambito del Driver Portal
### 17.2 Ciclo operativo del driver
### 17.3 Notifiche e aggiornamenti missione
### 17.4 Consensi, check e adempimenti
### 17.5 Offline / degraded mode (se previsto)
### 17.6 Sicurezza e privacy lato driver

> **Riferimenti:** [`HANDOFF.md`](../HANDOFF.md) → Portale driver. [`PLATFORM_MAP.md`](../PLATFORM_MAP.md) → Driver web; [`BACKUP_FASE_0_PRE_MAIN_2026-07-09.md`](../BACKUP_FASE_0_PRE_MAIN_2026-07-09.md) → Non ancora incluso (production-ready).  
> **Riferimenti (Dispatch & Operations Engine Framework — Driver Scope / Tracking / Candidate):** [`docs/DISPATCH_AND_OPERATIONS_ENGINE_FRAMEWORK.md`](./DISPATCH_AND_OPERATIONS_ENGINE_FRAMEWORK.md) (**MC-OS-030**).  
> **TODO:** Documentare scope funzionale, stati missione e vincoli di usabilità del Driver Portal.

---

## 18. Customer Portal

Descrive l’esperienza del cliente finale o corporate: richiesta servizi, tracking, storico e self-service dove abilitato.

### 18.1 Ambito del Customer Portal
### 18.2 Percorsi di prenotazione
### 18.3 Tracking e comunicazione stato
### 18.4 Profilo, preferenze e storico
### 18.5 Self-service vs. assistenza umana
### 18.6 Accessibilità e multi-canale

> **Riferimenti:** [`PLATFORM_MAP.md`](../PLATFORM_MAP.md) → Le 5 superfici (Customer web IT/EN); Cosa esiste oggi.  
> **Riferimenti (Customer Experience):** [`docs/CUSTOMER_EXPERIENCE_FRAMEWORK.md`](./CUSTOMER_EXPERIENCE_FRAMEWORK.md) (**MC-OS-018**).  
> **Riferimenti (Dispatch & Operations Engine Framework — Live Journey / Customer Tracking):** [`docs/DISPATCH_AND_OPERATIONS_ENGINE_FRAMEWORK.md`](./DISPATCH_AND_OPERATIONS_ENGINE_FRAMEWORK.md) (**MC-OS-030**).  
> **TODO:** Definire i journey cliente, i confini del self-service e i requisiti di comunicazione dello stato servizio.

---

## 19. Partner Portal

Riguarda l’accesso riservato a partner commerciali (hotel, travel agency, corporate partner): richieste, commissioni, reporting e collaborazione operativa.

### 19.1 Tipologie di partner
### 19.2 Capacità del Partner Portal
### 19.3 Onboarding e credenziali partner
### 19.4 Commissioni e regole commerciali
### 19.5 Visibilità dati e isolamento
### 19.6 SLA e supporto partner

> **Riferimenti:** [`PLATFORM_MAP.md`](../PLATFORM_MAP.md) → Fase 4; Partner web. [`docs/DECISIONS_PENDING.md`](./DECISIONS_PENDING.md) → Modello partner. [`docs/PARTNER_LEGAL_AND_OPERATING_FRAMEWORK.md`](./PARTNER_LEGAL_AND_OPERATING_FRAMEWORK.md) → framework legale-operativo partner (progettazione, non contratto).  
> **TODO:** Specificare modello partner, capacità del portale e regole di visibilità/commissione.

---

## 20. Marketplace

Definisce il perimetro di matching o intermediazione tra domanda e offerta tra tenant/partner, ove previsto dalla strategia di prodotto.

### 20.1 Visione marketplace
### 20.2 Modelli di matching
### 20.3 Regole di pubblicazione offerta/domanda
### 20.4 Settlement e responsabilità
### 20.5 Trust, rating e compliance
### 20.6 Confini rispetto al booking diretto

> **Riferimenti (Partner Exchange Marketplace B2B):** [`docs/PARTNER_EXCHANGE_MARKETPLACE_FRAMEWORK.md`](./PARTNER_EXCHANGE_MARKETPLACE_FRAMEWORK.md) (**MC-OS-012**).  
> **Riferimenti (Role, Capability and Permission Catalog — Exchange Permission / Matching):** [`docs/ROLE_CAPABILITY_AND_PERMISSION_CATALOG.md`](./ROLE_CAPABILITY_AND_PERMISSION_CATALOG.md) (**MC-OS-029**).  
> **TODO:** Delimitare nel Blueprint i confini rispetto al booking owned e al marketplace B2C; dettaglio normativo nell’MC-OS-012.

---

## 21. CRM

Documenta la gestione anagrafiche, relazioni commerciali, pipeline e interazioni con clienti e account corporate.

### 21.1 Entità CRM e ownership
### 21.2 Anagrafiche e segmentazione
### 21.3 Pipeline e opportunità
### 21.4 Storico interazioni
### 21.5 Integrazione con booking e billing
### 21.6 Privacy e retention dei dati CRM

> **TODO:** Definire il perimetro CRM, le entità canoniche e l’integrazione con i processi commerciali e operativi.

---

## 22. Fleet Management

Copre veicoli, disponibilità, manutenzioni, documenti e vincoli di assegnazione rispetto a servizi e autisti.

### 22.1 Anagrafica flotta
### 22.2 Stati veicolo e disponibilità
### 22.3 Assegnazione veicolo–autista
### 22.4 Documenti, scadenze e compliance
### 22.5 Manutenzione e fuori servizio
### 22.6 Regole di idoneità al servizio

> **TODO:** Documentare modello flotta, stati operativi e regole di idoneità per l’assegnazione ai servizi.

---

## 23. Payments

Descrive l’acquisizione dei pagamenti, i provider, gli stati di pagamento e la riconciliazione operativa con i booking.

### 23.1 Metodi di pagamento supportati
### 23.2 Provider e adapter
### 23.3 Ciclo di vita del pagamento
### 23.4 Autorizzazioni, capture e rimborsi
### 23.5 Riconciliazione con booking
### 23.6 Requisiti PCI e gestione dati sensibili

> **Riferimenti:** [`PLATFORM_MAP.md`](../PLATFORM_MAP.md) → Fase 3. [`docs/DECISIONS_PENDING.md`](./DECISIONS_PENDING.md) → Provider pagamenti / acconto / cancellazioni.  
> **TODO:** Formalizzare flussi di pagamento, stati e requisiti di compliance PCI/privacy applicabili.

---

## 24. Billing

Tratta fatturazione, cicli di addebito, documenti fiscali e regole di fatturazione per clienti privati e corporate.

### 24.1 Modelli di fatturazione
### 24.2 Cicli di billing
### 24.3 Documenti fiscali e numerazione
### 24.4 Note di credito e rettifiche
### 24.5 Integrazione contabile esterna
### 24.6 Vincoli fiscali e localizzazione

> **Riferimenti (modello economico e operativo):** [`docs/BUSINESS_OPERATING_SYSTEM.md`](./BUSINESS_OPERATING_SYSTEM.md).  
> **Riferimenti (settlement e operazioni finanziarie):** [`docs/SETTLEMENT_AND_FINANCIAL_OPERATIONS_FRAMEWORK.md`](./SETTLEMENT_AND_FINANCIAL_OPERATIONS_FRAMEWORK.md).  
> **TODO:** Definire modelli di billing, documenti e integrazioni contabili, con attenzione ai vincoli fiscali locali.

---

## 25. Reporting

Definisce report operativi, commerciali e finanziari, nonché i criteri di correttezza, latenza e accesso ai dati aggregati.

### 25.1 Catalogo report ufficiali
### 25.2 Report operativi
### 25.3 Report commerciali e finanziari
### 25.4 Export e scheduling
### 25.5 Autorizzazione all’accesso report
### 25.6 Definizioni metriche canoniche

> **TODO:** Pubblicare il catalogo report, le metriche canoniche e le policy di accesso/export.

---

## 26. AI Assistant

Descrive il ruolo dell’assistente AI nel prodotto: ambiti ammessi, guardrail, fonti di verità e limiti di autonomia decisionale.

### 26.1 Ambiti di assistenza ammessi
### 26.2 Fonti di verità e grounding
### 26.3 Guardrail e human-in-the-loop
### 26.4 Privacy e minimizzazione dei dati
### 26.5 Valutazione qualità e drift
### 26.6 Roadmap capacità AI

> **Riferimenti (AI & Automation Governance):** [`docs/AI_AND_AUTOMATION_GOVERNANCE_FRAMEWORK.md`](./AI_AND_AUTOMATION_GOVERNANCE_FRAMEWORK.md) (**MC-OS-022**).  
> **Riferimenti (Dispatch & Operations Engine Framework — AI Dispatch Assistant boundary):** [`docs/DISPATCH_AND_OPERATIONS_ENGINE_FRAMEWORK.md`](./DISPATCH_AND_OPERATIONS_ENGINE_FRAMEWORK.md) (**MC-OS-030**).  
> **TODO:** Definire scope dell’AI Assistant, guardrail obbligatori e confini rispetto alle decisioni operative automatiche.

---

## 27. API

Documenta la strategia API (pubbliche, partner, interne): versionamento, contratti, autenticazione, rate limiting e policy di evoluzione.

### 27.1 Tipologie di API
### 27.2 Versionamento e compatibilità
### 27.3 Contratti e documentazione
### 27.4 Autenticazione e autorizzazione API
### 27.5 Rate limiting e quota
### 27.6 Deprecazione e sunset policy

> **Riferimenti:** [`PLATFORM_MAP.md`](../PLATFORM_MAP.md) → API esistenti. [`HANDOFF.md`](../HANDOFF.md) → API (tutte in `app/api/`).  
> **TODO:** Stabilire la strategia API ufficiale, le regole di versionamento e i requisiti minimi di documentazione dei contratti.

---

## 28. Workflow operativi

Descrive i processi end-to-end (es. dalla richiesta alla chiusura servizio) e le responsabilità tra ruoli umani e automazioni.

### 28.1 Catalogo workflow ufficiali
### 28.2 Booking-to-completion
### 28.3 Exception handling operativo
### 28.4 Handoff tra ruoli
### 28.5 Automazioni e trigger
### 28.6 KPI di processo

> **Riferimenti (Role, Capability and Permission Catalog — Operations / Assignment Modes):** [`docs/ROLE_CAPABILITY_AND_PERMISSION_CATALOG.md`](./ROLE_CAPABILITY_AND_PERMISSION_CATALOG.md) (**MC-OS-029**).  
> **Riferimenti (Dispatch & Operations Engine Framework — Operations / Assignment / Recovery):** [`docs/DISPATCH_AND_OPERATIONS_ENGINE_FRAMEWORK.md`](./DISPATCH_AND_OPERATIONS_ENGINE_FRAMEWORK.md) (**MC-OS-030**).  
> **TODO:** Mappare i workflow operativi canonici, gli handoff e i punti di automazione/controllo umano.

---

## 29. Eventi di dominio

Definisce il catalogo degli eventi di dominio, la semantica, le garanzie di delivery e l’uso per integrazioni e side-effect controllati.

### 29.1 Convenzioni sugli eventi
### 29.2 Catalogo eventi ufficiali
### 29.3 Produttori e consumatori
### 29.4 Garanzie di delivery e idempotenza
### 29.5 Schema evolution degli eventi
### 29.6 Eventi vs. comandi

> **Riferimenti (System Domain Architecture — Domain / Integration Events):** [`docs/SYSTEM_DOMAIN_ARCHITECTURE.md`](./SYSTEM_DOMAIN_ARCHITECTURE.md) (**MC-OS-019**).  
> **Riferimenti (System Event Catalog — SoT eventi):** [`docs/SYSTEM_EVENT_CATALOG.md`](./SYSTEM_EVENT_CATALOG.md) (**MC-OS-020**).  
> **TODO:** Allineare naming Blueprint agli eventi canonici MC-OS-020; dettagli delivery tecnologici restano OPEN.

---

## 30. Notifiche

Copre canali, template, regole di invio e preferenze utente per comunicazioni operative e commerciali.

### 30.1 Canali supportati
### 30.2 Template e localizzazione
### 30.3 Regole di triggering
### 30.4 Preferenze e opt-in/opt-out
### 30.5 Deduplicazione e quiet hours
### 30.6 Audit delle comunicazioni

> **Riferimenti (Notification & Communication):** [`docs/NOTIFICATION_AND_COMMUNICATION_FRAMEWORK.md`](./NOTIFICATION_AND_COMMUNICATION_FRAMEWORK.md) (**MC-OS-016**).  
> **TODO:** Definire canali, template, regole di invio e requisiti di audit/privacy delle notifiche.

---

## 31. Logging

Stabilisce standard di logging applicativo: livelli, correlazione, PII redaction e retention.

### 31.1 Livelli e categorie di log
### 31.2 Correlation ID e tracing context
### 31.3 Redaction PII e dati sensibili
### 31.4 Retention e accesso ai log
### 31.5 Logging strutturato
### 31.6 Anti-pattern di logging

> **TODO:** Codificare lo standard di logging, le regole di redaction e le policy di retention/accesso.

---

## 32. Monitoring

Definisce metriche, alert, health check e responsabilità operative per lo stato di salute del sistema.

### 32.1 Metriche golden signals
### 32.2 Health check e readiness
### 32.3 Alerting e severity
### 32.4 Dashboard ufficiali
### 32.5 On-call e runbook
### 32.6 SLO/SLI di riferimento

> **TODO:** Definire metriche, alert, dashboard e SLO/SLI minimi per gli ambienti supportati.

---

## 33. Backup

Documenta strategia di backup dei dati, frequenza, verifica di ripristino e ownership operativa.

### 33.1 Ambito dei backup
### 33.2 Frequenza e retention
### 33.3 Verifica di restore
### 33.4 Backup di configurazioni e segreti (policy)
### 33.5 Ownership e checklist operative
### 33.6 Registrazione esiti di backup

> **Riferimenti:** [`PLATFORM_MAP.md`](../PLATFORM_MAP.md) → Protocollo «mi fermo»; Backup e Git (Fase 0). [`BACKUP_FASE_0_PRE_MAIN_2026-07-09.md`](../BACKUP_FASE_0_PRE_MAIN_2026-07-09.md).  
> **TODO:** Formalizzare policy di backup, test di restore e responsabilità operative.

---

## 34. Disaster Recovery

Descrive scenari di disastro, RTO/RPO, piani di ripristino e criteri di dichiarazione/chiusura incidente maggiore.

### 34.1 Scenari di disastro
### 34.2 RTO e RPO target
### 34.3 Piani di ripristino
### 34.4 Comunicazione in emergenza
### 34.5 Esercitazioni DR
### 34.6 Post-mortem e miglioramento continuo

> **TODO:** Definire RTO/RPO, playbook DR e cadenza delle esercitazioni di ripristino.

---

## 35. Performance

Stabilisce obiettivi di performance, budget di latenza e pratiche di profiling/ottimizzazione accettate.

### 35.1 Obiettivi di latenza e throughput
### 35.2 Budget di performance per superficie
### 35.3 Profiling e diagnosi
### 35.4 Caching: principi e limiti
### 35.5 Query e path critici
### 35.6 Regression performance nei rilasci

> **TODO:** Pubblicare budget di performance, path critici e criteri di accettazione nei rilasci.

---

## 36. Scalabilità

Descrive strategie di crescita orizzontale/verticale, limiti noti e criteri di capacity planning.

### 36.1 Assunti di carico
### 36.2 Scaling applicativo
### 36.3 Scaling dati
### 36.4 Bottleneck noti e mitigazioni
### 36.5 Capacity planning
### 36.6 Limiti espliciti di design

> **TODO:** Documentare assunti di carico, strategie di scaling e limiti di design da non oltrepassare senza ADR.

---

## 37. UX Guidelines

Fornisce principi di esperienza utente trasversali alle superfici prodotto, orientati all’efficienza operativa e alla chiarezza.

### 37.1 Principi UX di MyChauffeur OS
### 37.2 Journey critici
### 37.3 Feedback, errori e stati vuoti
### 37.4 Accessibilità (a11y)
### 37.5 Consistenza multi-superficie
### 37.6 Ricerca e validazione UX

> **Riferimenti (Customer Experience):** [`docs/CUSTOMER_EXPERIENCE_FRAMEWORK.md`](./CUSTOMER_EXPERIENCE_FRAMEWORK.md) (**MC-OS-018**).  
> **TODO:** Redigere i principi UX ufficiali, i pattern di feedback e i requisiti di accessibilità minimi.

---

## 38. UI Guidelines

Definisce linguaggio visivo, componenti, layout e regole di coerenza dell’interfaccia, in continuità con il design system del progetto.

### 38.1 Linguaggio visivo
### 38.2 Design tokens e temi
### 38.3 Componenti e pattern UI
### 38.4 Layout e densità informativa
### 38.5 Stati interattivi e motion
### 38.6 Do / Don’t di interfaccia

> **TODO:** Pubblicare le UI guidelines e i riferimenti al design system, evitando divergenze non governate.

---

## 39. Standard di sviluppo

Codifica le pratiche di engineering: qualità del codice, review, branching, gestione dipendenze e disciplina di cambiamento.

### 39.1 Standard di codice
### 39.2 Code review
### 39.3 Branching e flusso di contributo
### 39.4 Gestione dipendenze
### 39.5 Definition of Done
### 39.6 Sicurezza nello sviluppo quotidiano

> **Riferimenti (Software Architecture Framework — Implementation boundaries, DoD architetturale):** [`docs/SOFTWARE_ARCHITECTURE_FRAMEWORK.md`](./SOFTWARE_ARCHITECTURE_FRAMEWORK.md) (**MC-OS-026**).  
> **TODO:** Formalizzare gli standard di sviluppo, DoD e regole di review allineate al repository ufficiale.

---

## 40. Naming Convention

Stabilisce convenzioni di naming per codice, database, API, eventi, ambienti e artefatti documentali.

### 40.1 Naming nel codice
### 40.2 Naming database e migration
### 40.3 Naming API ed eventi
### 40.4 Naming ambienti e risorse infra
### 40.5 Naming documenti e ADR
### 40.6 Glossario dei prefissi/suffix ufficiali

> **TODO:** Pubblicare le naming convention canoniche per tutti gli artefatti tecnici e documentali.

---

## 41. Testing Strategy

Definisce piramide di test, ambiti obbligatori (unit, integration, e2e, security) e criteri di copertura per i path critici.

### 41.1 Piramide di test
### 41.2 Test di dominio e invarianti
### 41.3 Test di integrazione e RLS/RBAC
### 41.4 Test end-to-end delle superfici
### 41.5 Test di sicurezza e regressione
### 41.6 Gate di qualità in CI

> **Riferimenti:** [`PLATFORM_MAP.md`](../PLATFORM_MAP.md) → Fase 0 (test unitari/API/smoke). [`BACKUP_FASE_0_PRE_MAIN_2026-07-09.md`](../BACKUP_FASE_0_PRE_MAIN_2026-07-09.md) → Stato verifiche. [`HANDOFF.md`](../HANDOFF.md) → Roadmap Fase 0.  
> **TODO:** Definire strategia di test, ambiti obbligatori e gate CI per i path business-critical.

---

## 42. DevOps

Descrive toolchain, ambienti, CI/CD, secret management operativo e responsabilità tra development e operations.

### 42.1 Ambienti ufficiali
### 42.2 CI pipeline
### 42.3 CD e promozione tra ambienti
### 42.4 Secret e configurazione
### 42.5 Infrastructure as Code (se adottata)
### 42.6 Responsabilità Dev / Ops

> **Riferimenti (Configuration & Feature Management):** [`docs/CONFIGURATION_AND_FEATURE_MANAGEMENT_FRAMEWORK.md`](./CONFIGURATION_AND_FEATURE_MANAGEMENT_FRAMEWORK.md) (**MC-OS-021**).  
> **TODO:** Documentare ambienti, pipeline CI/CD e responsabilità operative DevOps.

---

## 43. Deployment

Copre modalità di rilascio, rollback, feature flag e checklist di go-live per cambi applicativi e di schema.

### 43.1 Strategie di rilascio
### 43.2 Rollback e forward-fix
### 43.3 Feature flag
### 43.4 Rilascio schema dati
### 43.5 Checklist di go-live
### 43.6 Comunicazione dei rilasci

> **Riferimenti (Configuration & Feature Management — Feature Flags):** [`docs/CONFIGURATION_AND_FEATURE_MANAGEMENT_FRAMEWORK.md`](./CONFIGURATION_AND_FEATURE_MANAGEMENT_FRAMEWORK.md) (**MC-OS-021**).  
> **TODO:** Formalizzare strategie di deployment, rollback e checklist di rilascio sicure.

---

## 44. Roadmap

Organizza le fasi di evoluzione del prodotto e dell’architettura, con dipendenze e criteri di avanzamento tra fasi.

### 44.1 Principi di roadmap
### 44.2 Fasi ufficiali (Fase 0–5 secondo `PLATFORM_MAP.md`)
### 44.3 Dipendenze tra epiche
### 44.4 Criteri di avanzamento fase
### 44.5 Debito tecnico governato
### 44.6 Revisione periodica della roadmap

> **Riferimenti (fonte roadmap operativa):**  
> - [`PLATFORM_MAP.md`](../PLATFORM_MAP.md) → **Roadmap (ordine ufficiale)** — Fasi 0–5 (fonte primaria).  
> - [`HANDOFF.md`](../HANDOFF.md) → §5 Roadmap (stato sintetico).  
> - [`BACKUP_FASE_0_PRE_MAIN_2026-07-09.md`](../BACKUP_FASE_0_PRE_MAIN_2026-07-09.md) → baseline / audit Fase 0.  
> - [`docs/DISPATCH_AND_OPERATIONS_ENGINE_FRAMEWORK.md`](./DISPATCH_AND_OPERATIONS_ENGINE_FRAMEWORK.md) (**MC-OS-030**) → Implementation Sequence Dispatch/Operations.  
> **Numerazione:** le fasi operative del progetto sono **0–5** (non confondere con i capitoli 1–47 di questo Blueprint).  
> **TODO:** Integrare nel Blueprint il dettaglio delle fasi 0–5 senza duplicare lo stato runtime già mantenuto in `PLATFORM_MAP.md` / `HANDOFF.md`.

---

## 45. Architecture Decision Records (ADR)

Definisce il processo ADR: quando aprire una decisione, formato, stato del ciclo di vita e collegamento al Blueprint.

### 45.1 Quando serve un ADR
### 45.2 Formato ufficiale ADR
### 45.3 Ciclo di vita (proposed → accepted → superseded)
### 45.4 Indice ADR
### 45.5 Relazione ADR ↔ Blueprint
### 45.6 Decisioni pendenti

> **Riferimenti:** [`docs/DECISIONS_PENDING.md`](./DECISIONS_PENDING.md) (registro pre-ADR). [`PLATFORM_MAP.md`](../PLATFORM_MAP.md) → Decisioni da approvare prima di scrivere codice.  
> **Riferimenti (Architecture Consolidation Release v1 — baseline / OPEN unificati):** [`docs/ARCHITECTURE_CONSOLIDATION_RELEASE_V1.md`](./ARCHITECTURE_CONSOLIDATION_RELEASE_V1.md) (**MC-OS-023**).  
> **Riferimenti (Architecture Decision Records Index):** [`docs/ARCHITECTURE_DECISION_RECORDS_INDEX.md`](./ARCHITECTURE_DECISION_RECORDS_INDEX.md) (**MC-OS-024**).  
> **TODO:** Istituire il processo ADR, l’indice ufficiale e il collegamento a `docs/DECISIONS_PENDING.md` ove applicabile.

---

## 46. Glossario

Raccoglie termini di dominio, acronimi e definizioni canoniche per evitare ambiguità tra business e engineering.

### 46.1 Termini di dominio
### 46.2 Acronimi tecnici
### 46.3 Ruoli e profili
### 46.4 Stati canonici (booking, pagamento, veicolo, …)
### 46.5 Sinonimi deprecati
### 46.6 Regole di aggiornamento del glossario

> **Riferimenti (Source of Truth terminologica):** [`docs/DOMAIN_GLOSSARY_AND_BUSINESS_DICTIONARY.md`](./DOMAIN_GLOSSARY_AND_BUSINESS_DICTIONARY.md) (MC-OS-009).  
> **TODO:** Allineare i capitoli Blueprint al Glossario ufficiale; non duplicare definizioni di merito.

---

## 47. Appendici

Contiene materiale di supporto: riferimenti, template, checklist e indici di documenti correlati nel repository `docs/`.

### 47.1 Documenti correlati nel repository
### 47.2 Template ufficiali
### 47.3 Checklist operative
### 47.4 Riferimenti normativi e compliance
### 47.5 Cronologia revisioni del Blueprint
### 47.6 Contatti e ownership documentale

#### 47.1.1 Indice documenti correlati (cross-reference)

| ID | Documento | Path |
|----|-----------|------|
| D01 | Master Blueprint | `docs/MASTER_BLUEPRINT.md` |
| D02 | Handoff operativo | [`HANDOFF.md`](../HANDOFF.md) |
| D03 | Platform Map + roadmap ufficiale | [`PLATFORM_MAP.md`](../PLATFORM_MAP.md) |
| D04 | Audit / Backup Fase 0 pre-main | [`BACKUP_FASE_0_PRE_MAIN_2026-07-09.md`](../BACKUP_FASE_0_PRE_MAIN_2026-07-09.md) |
| D05 | Requisiti tariffari NCC | [`docs/NCC_TARIFF_REQUIREMENTS.md`](./NCC_TARIFF_REQUIREMENTS.md) |
| D06 | Decisioni pendenti | [`docs/DECISIONS_PENDING.md`](./DECISIONS_PENDING.md) |

Vedere anche [§0 Mappa documentale e riferimenti](#0-mappa-documentale-e-riferimenti).

> **TODO:** Completare template, checklist e ownership; non alterare i contenuti tecnici dei documenti D02–D06 da questo Blueprint.

---

## Cronologia revisioni

| Versione | Data | Autore | Descrizione |
|----------|------|--------|-------------|
| 0.1.1 | 2026-07-26 | Documentation Architect | Allineamento indici/riferimenti/cross-reference a HANDOFF, PLATFORM_MAP, roadmap e audit Fase 0. Nessuna modifica a contenuti tecnici. |
| 0.1.0 | 2026-07-26 | Lead Software Engineer | Creazione scheletro ufficiale: titolo, introduzione, indice, capitoli, sottocapitoli e TODO. |

---

*Fine del Master Blueprint — edizione strutturale 0.1.1. Il contenuto dettagliato di ciascun capitolo sarà sviluppato in iterazioni successive.*

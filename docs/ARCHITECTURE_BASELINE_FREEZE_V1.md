# MyChauffeur OS — Architecture Baseline Freeze v1

| Campo | Valore |
|-------|--------|
| **Codice documento** | MC-OS-025 |
| **Titolo** | Architecture Baseline Freeze v1 |
| **Versione** | 1.0.0 |
| **Stato** | Approved Candidate |
| **Data creazione** | 2026-07-26 |
| **Ultima modifica** | 2026-07-26 |
| **Owner** | Chief Enterprise Architect |
| **Autori** | MyChauffeur OS Team |
| **Documenti correlati** | MC-OS-000 … MC-OS-024 · PLATFORM_MAP · HANDOFF |
| **Dipendenze** | Architecture Consolidation Release v1 (MC-OS-023); ADR Index (MC-OS-024); EDGF |
| **Classificazione** | Official Architecture Baseline Freeze — Approved Candidate |
| **Baseline ID** | **B001** |
| **Baseline label** | Architecture Baseline v1.0 |
| **Documentation Release** | allineamento a B001 |

---

## Avvertenza

Questo documento è il **congelamento ufficiale della prima Architecture Baseline** di MyChauffeur OS.

**Non** introduce nuove regole di business.
**Non** modifica il contenuto funzionale dei framework.
**Non** sostituisce alcun documento.
**Non** chiude decisioni OPEN.

Stabilisce esclusivamente: documenti in Baseline; Source of Truth; decisioni congelate vs OPEN; ambiti sviluppabili; ambiti che richiedono validazione professionale.

I nomi di Domain, Entity, Event, Aggregate, Framework, State Machine e concetti software restano in **inglese**. Il testo normativo è in **italiano**.

---

## Source of Truth

**MC-OS-025** è la Source of Truth dello **stato di freeze della Architecture Baseline B001 (v1.0)**.

- Contenuto normativo di dominio → framework SoT rispettivi (MC-OS-023 §7 / §7 di questo doc)
- Numerazione ADR → MC-OS-024
- Stato consolidamento pre-freeze → MC-OS-023

---

## 1. Scopo

Congelare la prima baseline architetturale documentale (Enterprise Documentation completa fino a MC-OS-024) come riferimento stabile per la successiva fase di **Software Architecture**, senza riaprire o riscrivere i framework di dominio.

---

## 2. Obiettivi della Baseline

1. Fissare il perimetro documentale B001.
2. Dichiarare le Source of Truth ufficiali.
3. Congelare gli ADR Active come vincoli di progetto.
4. Esporre gli ADR-OPEN senza chiuderli.
5. Separare READY / OPEN VALUES / NOT READY / PROFESSIONAL VALIDATION.
6. Chiudere la fase “Enterprise Documentation” come attività primaria.
7. Abilitare la fase successiva: **Software Architecture**.

---

## 3. Ambito

**Incluso:** documenti MC-OS-000…024 presenti nel repository (con eccezioni esplicite §6); decisioni ADR/ADR-OPEN di MC-OS-024; readiness da MC-OS-023.

**Escluso:** codice applicativo; SQL; API definitive; Draw.io; nuovi framework; chiusura OPEN fiscali/legali/tecniche; implementazione software.

---

## 4. Principi della Baseline

| ID | Principio |
|----|-----------|
| BL-01 | La Baseline non sostituisce i framework; li referenzia |
| BL-02 | Una sola Source of Truth per materia |
| BL-03 | ADR Active sono vincolanti per il design software |
| BL-04 | ADR-OPEN restano OPEN fino a decisione formale |
| BL-05 | Nessuna modifica di framework senza ADR |
| BL-06 | Incremento Baseline (B002…) per cambiamenti importanti |
| BL-07 | Codici MC-OS immutabili |
| BL-08 | Delivery state (PLATFORM_MAP / HANDOFF) ≠ target architecture |
| BL-09 | Nessuna soglia/provider/fiscale inventata in freeze |
| BL-10 | Prossima fase primaria = Software Architecture, non nuova documentazione di dominio |

---

## 5. Elenco completo dei documenti inclusi nella Baseline

| Codice | Titolo | Versione | Stato doc | Owner | Source of Truth (materia) | Dipendenze principali |
|--------|--------|----------|-----------|-------|---------------------------|------------------------|
| MC-OS-000 | EDGF | 0.12.0→0.13.0 (post-registrazione) | Draft | Documentation Governance | Documentation Governance | — |
| MC-OS-001 | Master Blueprint | 0.1.x | Bozza strutturale | CEA (atteso) | Master Architecture index | Tutti |
| MC-OS-002 | Business Operating System | — | Draft / no header formale | Business | Business Economics | Glossary |
| MC-OS-003 | NCC Tariff Requirements | — | Draft / no header | Product | NCC Tariff Requirements | Pricing |
| MC-OS-005 | Partner Legal and Operating Framework | — | Draft / no header | Partner Legal | Partner Legal & Ops | BOS |
| MC-OS-006 | Settlement and Financial Operations Framework | — | Draft / no header | Finance Ops | Settlement & Financial Ops | BOS, Partner |
| MC-OS-009 | Domain Glossary and Business Dictionary | 0.1.0 | Draft | CEA / Domain | Glossary | EDGF |
| MC-OS-011 | Business Entity Model | 0.1.0 | Draft | CEA / Domain Owners | Business Entity Model | Glossary |
| MC-OS-012 | Partner Exchange Marketplace Framework | 0.1.0 | Draft | Marketplace & Partner Ops | Partner Exchange | 005,006,009,011 |
| MC-OS-013 | System Architecture and Process Diagrams | 0.1.0 | Draft | CEA | Diagram catalog (placeholders) | Frameworks |
| MC-OS-014 | Booking & Service Lifecycle Framework | 0.1.0 | Draft | Booking, Service & Ops | Booking & Service Lifecycle | 011,012,017 |
| MC-OS-015 | Identity, Roles & Permission Framework | 0.1.0 | Draft | Identity & Security | Identity & Permissions | 011 |
| MC-OS-016 | Notification & Communication Framework | 0.1.0 | Draft | Communications | Notifications | 014,015 |
| MC-OS-017 | Pricing & Revenue Management Framework | 0.1.0 | Draft | Pricing & Revenue | Pricing & Revenue | 002,003 |
| MC-OS-018 | Customer Experience Framework | 0.1.0 | Draft | CX & Service Design | Customer Experience | 014,016 |
| MC-OS-019 | System Domain Architecture | 0.1.0 | Draft | CEA | System Domain Architecture | 011–018 |
| MC-OS-020 | System Event Catalog | 0.1.0 | Draft | EA & Platform Eng | Event Catalog | 019 |
| MC-OS-021 | Configuration & Feature Management Framework | 0.1.0 | Draft | Platform Config | Configuration & Features | 019,020 |
| MC-OS-022 | AI & Automation Governance Framework | 0.1.0 | Draft | AI Governance | AI Governance | 019–021 |
| MC-OS-023 | Architecture Consolidation Release v1 | 0.1.0 | Draft | EA & Doc Governance | Consolidation status | Corpus |
| MC-OS-024 | Architecture Decision Records Index | 0.1.0 | Draft | CEA | ADR / ADR-OPEN index | 023, frameworks |
| MC-OS-025 | Architecture Baseline Freeze v1 | **1.0.0** | **Approved Candidate** | CEA | Baseline freeze B001 | 023,024 |

**Nota:** MC-OS-004, 007, 008 sono gestiti in §6 (esclusi o esclusi parziali dalla Baseline normativa target).

---

## 6. Documenti esclusi dalla Baseline

| Codice / File | Motivo esclusione dalla Baseline normativa |
|---------------|--------------------------------------------|
| **MC-OS-004** Decisions Pending | Registro prodotto parziale/stale; OPEN unificati in MC-OS-024. Resta input operativo, non SoT Baseline. |
| **MC-OS-007** PLATFORM_MAP | Delivery state; distinto dal target architecture (ADR-025). |
| **MC-OS-008** HANDOFF | Session ops; non target architecture. |
| **MC-OS-010** | Riservato storicamente; indice operativo = MC-OS-024 (relazione OPEN ADR-OPEN-020). Non incluso come file. |
| BACKUP Fase 0 / audit file | Baseline storica delivery; non SoT architetturale target. |
| Qualsiasi codice applicativo / `.env` | Fuori perimetro documentale Baseline. |

Questi documenti **possono essere usati** per delivery, ma **non** congelano il target architecture.

---

## 7. Source of Truth ufficiali

| Materia | SoT congelata in B001 |
|---------|------------------------|
| Documentation Governance | MC-OS-000 |
| Master Architecture (indice) | MC-OS-001 |
| Glossary | MC-OS-009 |
| Business Entity Model | MC-OS-011 |
| Business Economics | MC-OS-002 |
| Partner Legal and Operations | MC-OS-005 |
| Settlement and Financial Operations | MC-OS-006 |
| Partner Exchange | MC-OS-012 |
| Booking and Service Lifecycle | MC-OS-014 |
| Identity and Permissions | MC-OS-015 |
| Notifications | MC-OS-016 |
| Pricing and Revenue | MC-OS-017 |
| Customer Experience | MC-OS-018 |
| System Domain Architecture | MC-OS-019 |
| Event Catalog | MC-OS-020 |
| Configuration and Feature Management | MC-OS-021 |
| AI Governance | MC-OS-022 |
| Consolidation status | MC-OS-023 |
| ADR Index | MC-OS-024 |
| Baseline Freeze status | **MC-OS-025** |
| NCC Tariff Requirements | MC-OS-003 |
| Current Delivery State | MC-OS-007 (fuori Baseline normativa) |
| Session Handoff | MC-OS-008 (fuori Baseline normativa) |
| Architecture Diagrams catalog | MC-OS-013 |

Gli altri documenti usano **cross-reference**, senza duplicare la regola.

---

## 8. Decisioni congelate

Le decisioni **Active** sono quelle registrate in **MC-OS-024** come `ADR-001` … `ADR-026`.

Questo freeze **non** le ridichiara: le dichiara **vincolanti per B001**.

Riferimento obbligatorio: [`ARCHITECTURE_DECISION_RECORDS_INDEX.md`](./ARCHITECTURE_DECISION_RECORDS_INDEX.md) §3.

Estratto identificativi congelati:

`ADR-001` … `ADR-026` (CM>GBV; XOR costi; no double-count; Booking≠Service≠Trip≠Assignment; Exchange B2B; Progressive Disclosure; UNFILLED; Holdback rules; Identity model; Configuration principles; Event immutability; AI boundaries; guardrail configurabili; Partner independence; tax placeholder; append-only/reversal; no cross-domain mutation; Analytics/AI non write SoT; EDGF codes; consolidation ACR-DA alias ADR-021…026).

---

## 9. Decisioni OPEN

Le decisioni **OPEN** restano quelle in **MC-OS-024** come `ADR-OPEN-001` … `ADR-OPEN-020`.

**Nessuna viene chiusa** da questo freeze.

Riferimento: MC-OS-024 §4.

Priorità P0 (bloccanti tipici Finance / Foundation / Payment):
`ADR-OPEN-001, 002, 003, 004, 010, 011, 017, 018`.

---

## 10. Ambiti pronti per lo sviluppo

Classificazione allineata a MC-OS-023 §28 (nessun nuovo giudizio di business):

| Ambito | Classificazione |
|--------|-----------------|
| Tenant model | READY WITH OPEN VALUES |
| Identity / Auth (concettuale) | READY WITH OPEN VALUES |
| RBAC (concettuale) | READY WITH OPEN VALUES |
| RLS | NOT READY |
| Booking / Service model | READY / READY WITH OPEN VALUES |
| Assignment model | READY WITH OPEN VALUES |
| Pricing foundation | READY WITH OPEN VALUES |
| Event foundation | READY WITH OPEN VALUES |
| Configuration foundation | READY WITH OPEN VALUES |
| Partner onboarding (concettuale) | READY WITH OPEN VALUES |
| Partner Exchange (concettuale) | READY WITH OPEN VALUES |
| Notification (concettuale) | READY WITH OPEN VALUES |
| Payment | NOT READY + PROFESSIONAL VALIDATION REQUIRED |
| Settlement | READY WITH OPEN VALUES + PROFESSIONAL VALIDATION REQUIRED |
| Payout | PROFESSIONAL VALIDATION REQUIRED |
| AI (recommendation-only design) | READY WITH OPEN VALUES |
| AI (automation) | NOT READY |
| Analytics (read models) | READY WITH OPEN VALUES |
| Tax / MoR / Invoice definitiva | PROFESSIONAL VALIDATION REQUIRED |

**Sviluppabile in OS Foundation (raccomandato):** Tenant, Organization, Person, User, Membership, Role, Permission, Customer, Booking, Service, Assignment, Driver, Vehicle, Event Envelope, Configuration foundation, Audit — secondo MC-OS-023 §29 / ADR-024.

---

## 11. Ambiti che richiedono consulenza

| Professionista | Ambiti / ADR-OPEN tipici |
|----------------|-------------------------|
| **Commercialista** | Invoice, accounting, Finance↔Settlement (ADR-OPEN-014) |
| **Fiscalista** | MoR vs intermediario, IVA, tax regime (ADR-OPEN-011, ADR-016 principle) |
| **Avvocato** | Cancel/refund terms, Partner, holdback contestation (ADR-OPEN-002,003,018) |
| **PSD2 / PSP** | Provider pagamenti, payout rails (ADR-OPEN-001) |
| **Privacy / GDPR** | Disclosure timing, AI training data, retention (ADR-OPEN-019,015) |
| **Normativa trasporto** | NCC go-live subset (ADR-OPEN-006) |
| **EU AI Act counsel** | Classification use case (ADR-OPEN-015) |
| **Security** | RLS patterns (ADR-OPEN-017) |

---

## 12. Regole di evoluzione della Baseline

1. **Nessun framework** di Baseline può essere modificato nel contenuto normativo **senza ADR** (nuovo o aggiornamento stato in MC-OS-024).
2. Ogni modifica **importante** (nuova SoT, cambio principio Active, ingresso/uscita documenti dalla Baseline) **incrementa** la Baseline: B001 → **B002**, ecc.
3. I documenti mantengono il proprio **codice MC-OS** immutabile.
4. Patch editoriali minori (typo, cross-ref) non richiedono nuova Baseline se non alterano SoT/ADR.
5. Chiusura di ADR-OPEN richiede aggiornamento MC-OS-024 e, se rilevante, bump Baseline.
6. Nuovi framework di dominio solo dopo sync plan (ADR-021) e con codice da EDGF (≥ MC-OS-026).

---

## 13. Versioning della Baseline

| Campo | Valore B001 |
|-------|-------------|
| **Baseline ID** | **B001** |
| **Label** | Architecture Baseline **v1.0** |
| **Freeze document** | MC-OS-025 v1.0.0 |
| **Stato freeze** | Approved Candidate |

Future baseline:

- **B002** — Architecture Baseline v1.1 o v2.0 (secondo impatto)
- **B003**, **B004**, …

Il Document Version di MC-OS-025 segue SemVer; il **Baseline ID** è la sequenza B00N.

---

## 14. Stato della documentazione

| Categoria | Documenti |
|-----------|-----------|
| **Consolidati (in Baseline B001)** | 000,001,002,003,005,006,009,011–025 (come §5) |
| **Ancora in Draft** | Maggioranza framework 0.1.0; Blueprint scheletro; 002/003/005/006 senza header formale |
| **Candidate** | **MC-OS-025** Approved Candidate; Baseline Candidate set da MC-OS-023 §27 |
| **Legacy / fuori Baseline normativa** | MC-OS-004 (parziale), 007, 008; filename EDGF storico; BACKUP Fase 0 |

---

## 15. Diagram Readiness

Rimando obbligatorio a **MC-OS-013** (catalogo DGM-001…030) e alla classificazione in **MC-OS-023 §26**.

Questo freeze **non** autorizza la creazione di Draw.io; conferma solo che i placeholder restano sotto MC-OS-013.

---

## 16. Readiness dello sviluppo

| Area | Readiness B001 |
|------|----------------|
| **Identity** | READY WITH OPEN VALUES (MFA/provider OPEN; RLS NOT READY) |
| **Booking** | READY WITH OPEN VALUES |
| **Assignment** | READY WITH OPEN VALUES (default manual vs offer OPEN) |
| **Marketplace** | READY WITH OPEN VALUES |
| **Exchange** | READY WITH OPEN VALUES (fee/timing OPEN) |
| **Pricing** | READY WITH OPEN VALUES (numeric OPEN) |
| **Finance** | PROFESSIONAL VALIDATION REQUIRED + OPEN MoR |
| **Settlement** | READY WITH OPEN VALUES + PROFESSIONAL VALIDATION REQUIRED |
| **Configuration** | READY WITH OPEN VALUES (storage tech OPEN) |
| **Notification** | READY WITH OPEN VALUES (provider OPEN) |
| **AI** | READY WITH OPEN VALUES per recommendation-only; NOT READY per automation |
| **Analytics** | READY WITH OPEN VALUES (non write SoT) |

---

## 17. Criteri di uscita

La Baseline B001 potrà diventare **definitiva** (es. stato Approved non più “Candidate”) solo se:

1. Header MC-OS applicati ai documenti prenotati rilevanti (001–008 dove applicabile).
2. Sync MC-OS-004 con ADR-OPEN (o deprecazione formale del ruolo SoT).
3. Almeno i P0 bloccanti per l’ambito di implementazione scelto sono chiusi **oppure** esplicitamente deferiti con ADR.
4. Validazioni professionali avviate per Finance/Tax se si entra in Payment/Invoice.
5. ADR-OPEN-020 (010 vs 024) risolto o accettato con ADR.
6. Review formale Under Review → Approved su MC-OS-025.
7. Nessuna contraddizione aperti su XOR costi / entità Booking-Service-Trip-Assignment.

Fino ad allora: **Approved Candidate** = vincolante per design, soggetto a formalizzazione.

---

## 18. Roadmap

### Fine fase Enterprise Documentation

Con B001, l’attività primaria di **Enterprise Documentation / Domain Framework proliferation** è **conclusa**.

### Fase successiva (obbligatoria): Software Architecture

Documenti futuri previsti (codici da assegnare via EDGF a partire da **MC-OS-026+**, senza crearli in questa sessione):

- Data Architecture
- Security Architecture
- API & Integration Architecture
- Infrastructure Architecture
- Deployment Architecture
- Software Design

Eventualmente: Dispatch Engine Specification, Matching Engine Specification, Observability, Disaster Recovery, Enterprise Reference Architecture (ordine da MC-OS-023 §30).

**Non** aprire nuovi framework di dominio business finché non richiesto da Software Architecture + ADR.

---

## 19. Allegati

Riferimenti ai framework della Baseline:

| Codice | Path |
|--------|------|
| MC-OS-000 | `docs/DOCUMENTATION_MANAGEMENT_FRAMEWORK.md` |
| MC-OS-001 | `docs/MASTER_BLUEPRINT.md` |
| MC-OS-002 | `docs/BUSINESS_OPERATING_SYSTEM.md` |
| MC-OS-003 | `docs/NCC_TARIFF_REQUIREMENTS.md` |
| MC-OS-005 | `docs/PARTNER_LEGAL_AND_OPERATING_FRAMEWORK.md` |
| MC-OS-006 | `docs/SETTLEMENT_AND_FINANCIAL_OPERATIONS_FRAMEWORK.md` |
| MC-OS-009 | `docs/DOMAIN_GLOSSARY_AND_BUSINESS_DICTIONARY.md` |
| MC-OS-011 | `docs/BUSINESS_ENTITY_MODEL.md` |
| MC-OS-012 | `docs/PARTNER_EXCHANGE_MARKETPLACE_FRAMEWORK.md` |
| MC-OS-013 | `docs/SYSTEM_ARCHITECTURE_AND_PROCESS_DIAGRAMS.md` |
| MC-OS-014 | `docs/BOOKING_AND_SERVICE_LIFECYCLE_FRAMEWORK.md` |
| MC-OS-015 | `docs/IDENTITY_ROLES_AND_PERMISSION_FRAMEWORK.md` |
| MC-OS-016 | `docs/NOTIFICATION_AND_COMMUNICATION_FRAMEWORK.md` |
| MC-OS-017 | `docs/PRICING_AND_REVENUE_MANAGEMENT_FRAMEWORK.md` |
| MC-OS-018 | `docs/CUSTOMER_EXPERIENCE_FRAMEWORK.md` |
| MC-OS-019 | `docs/SYSTEM_DOMAIN_ARCHITECTURE.md` |
| MC-OS-020 | `docs/SYSTEM_EVENT_CATALOG.md` |
| MC-OS-021 | `docs/CONFIGURATION_AND_FEATURE_MANAGEMENT_FRAMEWORK.md` |
| MC-OS-022 | `docs/AI_AND_AUTOMATION_GOVERNANCE_FRAMEWORK.md` |
| MC-OS-023 | `docs/ARCHITECTURE_CONSOLIDATION_RELEASE_V1.md` |
| MC-OS-024 | `docs/ARCHITECTURE_DECISION_RECORDS_INDEX.md` |

---

## Cronologia revisioni

| Versione | Data | Autore | Descrizione modifica | Stato |
|----------|------|--------|----------------------|-------|
| 1.0.0 | 2026-07-26 | MyChauffeur OS Team | Freeze Architecture Baseline B001 / v1.0 (Approved Candidate). | Approved Candidate |

---

*Fine MC-OS-025 v1.0.0 — Architecture Baseline Freeze B001 — Approved Candidate.*

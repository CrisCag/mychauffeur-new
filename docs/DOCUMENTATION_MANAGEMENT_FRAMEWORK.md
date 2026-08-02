# MyChauffeur OS — Enterprise Documentation Governance Framework (EDGF)

| Campo | Valore |
|-------|--------|
| **Codice documento** | MC-OS-000 |
| **Titolo** | Enterprise Documentation Governance Framework (EDGF) |
| **Versione** | 0.19.0 |
| **Stato** | Draft |
| **Data creazione** | 2026-07-26 |
| **Ultima modifica** | 2026-08-02 |
| **Owner** | Documentation Governance Lead |
| **Autori** | Enterprise Documentation Architect |
| **Documenti correlati** | [`MASTER_BLUEPRINT.md`](./MASTER_BLUEPRINT.md), [`BUSINESS_OPERATING_SYSTEM.md`](./BUSINESS_OPERATING_SYSTEM.md), [`PARTNER_LEGAL_AND_OPERATING_FRAMEWORK.md`](./PARTNER_LEGAL_AND_OPERATING_FRAMEWORK.md), [`SETTLEMENT_AND_FINANCIAL_OPERATIONS_FRAMEWORK.md`](./SETTLEMENT_AND_FINANCIAL_OPERATIONS_FRAMEWORK.md), [`DECISIONS_PENDING.md`](./DECISIONS_PENDING.md), [`PLATFORM_MAP.md`](../PLATFORM_MAP.md), [`HANDOFF.md`](../HANDOFF.md) |
| **Dipendenze** | Nessuna dipendenza software; governa tutti i documenti di progetto |
| **Classificazione** | Governance — Enterprise Documentation Governance |
| **Documentation Release** | 0.1 (prevista; non pubblicata come release formale fino ad Approved) |

---

## Avvertenza operativa

Questo documento definisce **standard e governance**.  
**Non** crea cartelle, **non** migra file, **non** genera PDF/diagrammi, **non** modifica codice o database.

La struttura target `docs/00_GOVERNANCE` … `09_ARCHIVE` è **soltanto progettuale**: **NON deve essere ancora creata**. Nessuna cartella di quella struttura esiste o va creata in questa fase. La migrazione fisica dei documenti sarà eseguita **esclusivamente in una fase successiva**.

---

## Purpose

L’**Enterprise Documentation Governance Framework (EDGF)** costituisce il **riferimento normativo** per tutta la documentazione del progetto MyChauffeur OS.  
Ogni documento di progetto — presente o futuro — deve conformarsi alle regole definite dall’EDGF in materia di ownership, Source of Truth, versioning, release, classificazione, lifecycle, approvazione, archiviazione, diagrammi e PDF ufficiali.

---

## Indice

1. [Scopo](#1-scopo)
2. [Principi della documentazione](#2-principi-della-documentazione)
3. [Struttura futura del repository documentale](#3-struttura-futura-del-repository-documentale)
4. [Document Identifier (codifica ufficiale)](#4-document-identifier-codifica-ufficiale)
5. [Document Version (Semantic Versioning)](#5-document-version-semantic-versioning)
6. [Document Status (stato dei documenti)](#6-document-status-stato-dei-documenti)
7. [Document Header (header standard obbligatorio)](#7-document-header-header-standard-obbligatorio)
8. [Revision History (cronologia revisioni)](#8-revision-history-cronologia-revisioni)
9. [MyChauffeur OS Documentation Release](#9-mychauffeur-os-documentation-release)
10. [Diagram Policy (policy diagrammi)](#10-diagram-policy-policy-diagrammi)
11. [PDF Policy (policy PDF ufficiali)](#11-pdf-policy-policy-pdf-ufficiali)
12. [Cross References](#12-cross-references)
13. [Source of Truth](#13-source-of-truth)
14. [Glossary & Domain Dictionary](#14-glossary--domain-dictionary)
15. [Politica di archiviazione](#15-politica-di-archiviazione)
16. [Regole di modifica](#16-regole-di-modifica)
17. [Checklist di revisione](#17-checklist-di-revisione)
18. [Checklist pubblicazione PDF](#18-checklist-pubblicazione-pdf)
19. [Roadmap documentale](#19-roadmap-documentale)
20. [Template standard](#20-template-standard)

---

## 1. Scopo

L’**Enterprise Documentation Governance Framework (EDGF)** è il **sistema ufficiale di governance della documentazione** di MyChauffeur OS.

Disciplina:

- **ownership** dei documenti;
- **Source of Truth** per dominio;
- **versioning** (Document Version);
- **release** (MyChauffeur OS Documentation Release);
- **classificazione** documentale;
- **lifecycle** e stati del documento;
- **approvazione** e revisioni;
- **archiviazione**;
- **diagrammi** (Diagram Policy);
- **PDF ufficiali** (PDF Policy).

Definisce inoltre organizzazione documentale, standard editoriali e di metadati, cross-reference e anti-duplicazione.

**Fuori ambito:** funzionalità software, schema database, API, contratti firmati, codice applicativo.

Ogni documento futuro di MyChauffeur OS **deve** rispettare questo framework (salvo eccezioni esplicitamente approvate e registrate).

---

## 2. Principi della documentazione

| Principio | Regola |
|-----------|--------|
| **Single Source of Truth** | Ogni materia ha **un solo** documento proprietario. Gli altri citano, non riscrivono. |
| **No duplicazioni** | Vietato copiare paragrafi di merito tra documenti. Consentiti solo riassunti di una riga + link. |
| **Cross Reference** | I collegamenti usano codice documento (`MC-OS-xxx`), path e sezione quando possibile. |
| **Auditabilità** | Ogni versione Approved lascia traccia: autore, data, motivo, review. |
| **Tracciabilità** | Decisioni di prodotto restano in `DECISIONS_PENDING` / ADR; i framework le richiamano per ID. |
| **Versionamento** | Document Version (Semantic Versioning) su ogni documento + MyChauffeur OS Documentation Release globale. |
| **Consistenza** | Terminologia solo dal Glossario ufficiale (§14). |
| **Manutenibilità** | Preferire documenti focalizzati per dominio; evitare “mega-file” che mescolano SoT diverse. |

---

## 3. Struttura futura del repository documentale

### 3.0 Dichiarazione vincolante (target only)

La struttura `00_GOVERNANCE` … `09_ARCHIVE` è la **struttura target** del repository documentale.

| Vincolo | Regola |
|---------|--------|
| Creazione cartelle | **NON** creare ancora queste cartelle |
| Spostamento file | **NON** spostare ancora i documenti esistenti |
| Uso corrente | I documenti restano nei path attuali fino alla fase di migrazione |
| Migrazione | Sarà un task dedicato, successivo all’adozione degli standard EDGF |

Qualsiasi implementazione fisica prima di quel task è **fuori policy**.

### 3.1 Albero target (NON implementato — NON creare)

```text
docs/
├── README_DOCUMENTATION.md          # Indice navigabile dell’EDGF (da creare in migrazione)
├── 00_GOVERNANCE/                   # Costituzione, registri, ADR index, glossario
├── 01_BUSINESS/                     # Visione economica, BOS, metriche business
├── 02_PRODUCT/                      # Requisiti prodotto, pricing NCC, roadmap prodotto
├── 03_FINANCE/                      # Settlement, ledger, payout, config finance
├── 04_LEGAL/                        # Partner legal-ops, privacy briefs, local law notes
├── 05_OPERATIONS/                   # Handoff-like ops, runbook documentali, checklist ops
├── 06_TECHNICAL/                    # Blueprint, platform map (o link), ADR tecnici, API docs
├── 07_DIAGRAMS/                     # Sorgenti draw.io + export SVG/PNG per codice doc
├── 08_PDF_OFFICIAL/                 # PDF Approved versionati
└── 09_ARCHIVE/                      # Superseded / storici immutabili
```

### 3.2 Mapping indicativo documenti attuali → cartella futura

| Documento attuale (path corrente) | Cartella target | Note |
|-----------------------------------|-----------------|------|
| `DOCUMENTATION_MANAGEMENT_FRAMEWORK.md` | `00_GOVERNANCE/` | MC-OS-000 |
| `MASTER_BLUEPRINT.md` | `06_TECHNICAL/` | Resta anche indice globale |
| `BUSINESS_OPERATING_SYSTEM.md` | `01_BUSINESS/` | |
| `NCC_TARIFF_REQUIREMENTS.md` | `02_PRODUCT/` | |
| `DECISIONS_PENDING.md` | `00_GOVERNANCE/` | Registro decisioni |
| `PARTNER_LEGAL_AND_OPERATING_FRAMEWORK.md` | `04_LEGAL/` | |
| `SETTLEMENT_AND_FINANCIAL_OPERATIONS_FRAMEWORK.md` | `03_FINANCE/` | |
| `PLATFORM_MAP.md` (root repo) | `06_TECHNICAL/` *o* resta in root con link | Decisione migrazione aperta |
| `HANDOFF.md` (root repo) | `05_OPERATIONS/` *o* resta in root con link | Decisione migrazione aperta |

**IMPORTANTE:** nessuna cartella creata e nessun file spostato in questa attività. La struttura sopra è **solo target**.

### 3.3 README_DOCUMENTATION.md (futuro)

Contenuto previsto: elenco MC-OS-*, Documentation Release corrente, link SoT, legenda stati, istruzioni “come contribuire”.

---

## 4. Document Identifier (codifica ufficiale)

L’EDGF definisce il sistema ufficiale di **identificazione dei documenti** di MyChauffeur OS.

### 4.1 Formato Document Identifier

```text
MC-OS-000
MC-OS-001
MC-OS-002
…
MC-OS-NNN
```

- `MC-OS` = MyChauffeur OS  
- `NNN` = numero progressivo a tre cifre (000–999)

Esempi validi: `MC-OS-000`, `MC-OS-001`, `MC-OS-002`.

### 4.2 Immutabilità del codice (regola primaria)

**Il Document Identifier (`MC-OS-NNN`) NON cambia mai durante la vita del documento.**

| Evento | Il codice MC-OS-NNN… |
|--------|----------------------|
| Rinomina del titolo | **non cambia** |
| Cambio path / migrazione cartella | **non cambia** |
| Nuova versione SemVer (0.1.0 → 2.0.0) | **non cambia** |
| Passaggio Draft → Approved → Superseded | **non cambia** |
| Documentation Release diversa | **non cambia** |
| Archiviazione | **non cambia** (resta l’identità storica) |

Solo un **nuovo** documento riceve un **nuovo** codice. I codici di documenti Archived **non si riusano**.

### 4.3 Registro ufficiale Document Identifier

Il presente registro (§4.3) è la **Source of Truth** per l’assegnazione dei codici documentali MC-OS.

| Codice | Documento | File | Stato registro |
|--------|-----------|------|----------------|
| **MC-OS-000** | Enterprise Documentation Governance Framework (EDGF) | `docs/DOCUMENTATION_MANAGEMENT_FRAMEWORK.md` | **Esistente** |
| **MC-OS-001** | Master Blueprint | `docs/MASTER_BLUEPRINT.md` | **Codice prenotato** — header da applicare in una futura migrazione documentale |
| **MC-OS-002** | Business Operating System | `docs/BUSINESS_OPERATING_SYSTEM.md` | **Codice prenotato** — header da applicare in una futura migrazione documentale |
| **MC-OS-003** | NCC Tariff Requirements | `docs/NCC_TARIFF_REQUIREMENTS.md` | **Codice prenotato** — header da applicare in una futura migrazione documentale |
| **MC-OS-004** | Decisions Pending | `docs/DECISIONS_PENDING.md` | **Codice prenotato** — header da applicare in una futura migrazione documentale |
| **MC-OS-005** | Partner Legal and Operating Framework | `docs/PARTNER_LEGAL_AND_OPERATING_FRAMEWORK.md` | **Codice prenotato** — header da applicare in una futura migrazione documentale |
| **MC-OS-006** | Settlement and Financial Operations Framework | `docs/SETTLEMENT_AND_FINANCIAL_OPERATIONS_FRAMEWORK.md` | **Codice prenotato** — header da applicare in una futura migrazione documentale |
| **MC-OS-007** | Platform Map | `PLATFORM_MAP.md` | **Codice prenotato** — header da applicare in una futura migrazione documentale |
| **MC-OS-008** | Handoff | `HANDOFF.md` | **Codice prenotato** — header da applicare in una futura migrazione documentale |
| **MC-OS-009** | Domain Glossary and Business Dictionary | `docs/DOMAIN_GLOSSARY_AND_BUSINESS_DICTIONARY.md` | **Esistente** |
| **MC-OS-010** | Architecture Decision Record Index | — | **Riservato** — documento non ancora creato |
| **MC-OS-011** | Business Entity Model | `docs/BUSINESS_ENTITY_MODEL.md` | **Esistente** |
| **MC-OS-012** | Partner Exchange Marketplace Framework | `docs/PARTNER_EXCHANGE_MARKETPLACE_FRAMEWORK.md` | **Esistente** (Draft v0.1.0 — Owner: Marketplace & Partner Operations) |
| **MC-OS-013** | System Architecture and Process Diagrams | `docs/SYSTEM_ARCHITECTURE_AND_PROCESS_DIAGRAMS.md` | **Esistente** (Draft v0.1.0 — Owner: Chief Enterprise Architect) |
| **MC-OS-014** | Booking & Service Lifecycle Framework | `docs/BOOKING_AND_SERVICE_LIFECYCLE_FRAMEWORK.md` | **Esistente** (Draft v0.1.0 — Owner: Booking, Service & Operations) |
| **MC-OS-015** | Identity, Roles & Permission Framework | `docs/IDENTITY_ROLES_AND_PERMISSION_FRAMEWORK.md` | **Esistente** (Draft v0.1.0 — Owner: Identity, Security & Access Governance) |
| **MC-OS-016** | Notification & Communication Framework | `docs/NOTIFICATION_AND_COMMUNICATION_FRAMEWORK.md` | **Esistente** (Draft v0.1.0 — Owner: Communications & Customer Operations) |
| **MC-OS-017** | Pricing & Revenue Management Framework | `docs/PRICING_AND_REVENUE_MANAGEMENT_FRAMEWORK.md` | **Esistente** (Draft v0.1.0 — Owner: Pricing, Revenue & Business Operations) |
| **MC-OS-018** | Customer Experience Framework | `docs/CUSTOMER_EXPERIENCE_FRAMEWORK.md` | **Esistente** (Draft v0.1.0 — Owner: Customer Experience & Service Design) |
| **MC-OS-019** | System Domain Architecture | `docs/SYSTEM_DOMAIN_ARCHITECTURE.md` | **Esistente** (Draft v0.1.0 — Owner: Chief Enterprise Architect) |
| **MC-OS-020** | System Event Catalog | `docs/SYSTEM_EVENT_CATALOG.md` | **Esistente** (Draft v0.1.0 — Owner: Enterprise Architecture & Platform Engineering) |
| **MC-OS-021** | Configuration & Feature Management Framework | `docs/CONFIGURATION_AND_FEATURE_MANAGEMENT_FRAMEWORK.md` | **Esistente** (Draft v0.1.0 — Owner: Platform Configuration & Product Governance) |
| **MC-OS-022** | AI & Automation Governance Framework | `docs/AI_AND_AUTOMATION_GOVERNANCE_FRAMEWORK.md` | **Esistente** (Draft v0.1.0 — Owner: AI, Automation & Decision Governance) |
| **MC-OS-023** | Architecture Consolidation Release v1 | `docs/ARCHITECTURE_CONSOLIDATION_RELEASE_V1.md` | **Esistente** (Draft v0.1.0 — Owner: Enterprise Architecture & Documentation Governance) |
| **MC-OS-024** | Architecture Decision Records Index | `docs/ARCHITECTURE_DECISION_RECORDS_INDEX.md` | **Esistente** (Draft v0.1.0 — Owner: Chief Enterprise Architect) |
| **MC-OS-025** | Architecture Baseline Freeze v1 | `docs/ARCHITECTURE_BASELINE_FREEZE_V1.md` | **Esistente** (Approved Candidate v1.0.0 — Owner: Chief Enterprise Architect; Baseline **B001**) |
| **MC-OS-026** | Software Architecture Framework | `docs/SOFTWARE_ARCHITECTURE_FRAMEWORK.md` | **Esistente** (Draft v0.1.0 — Owner: Software Architecture & Platform Engineering) |
| **MC-OS-027** | Data Architecture Framework | `docs/DATA_ARCHITECTURE_FRAMEWORK.md` | **Esistente** (Draft v0.1.0 — Owner: Data Architecture & Platform Engineering) |
| **MC-OS-028** | Security Architecture Framework | `docs/SECURITY_ARCHITECTURE_FRAMEWORK.md` | **Esistente** (Draft v0.1.0 — Owner: Security Architecture & Platform Engineering) |
| **MC-OS-029** | Role, Capability and Permission Catalog | `docs/ROLE_CAPABILITY_AND_PERMISSION_CATALOG.md` | **Esistente** (Draft v0.1.0 — Owner: Identity, Authorization & Product Operations) |
| **MC-OS-030** | Dispatch & Operations Engine Framework | `docs/DISPATCH_AND_OPERATIONS_ENGINE_FRAMEWORK.md` | **Esistente** (Draft v0.1.1 — Owner: Dispatch, Operations & Platform Engineering) |
| **MC-OS-031** | Customer, Driver & Partner Support Framework | `docs/CUSTOMER_DRIVER_PARTNER_SUPPORT_FRAMEWORK.md` | **Esistente** (Draft v0.1.0 — Owner: Customer Operations, Support & Trust Engineering) |

### 4.3.1 Prossimo codice disponibile

Il prossimo Document Identifier disponibile per un **nuovo** documento ufficiale di dominio è:

```text
MC-OS-032
```

**MC-OS-013 … MC-OS-031 non sono più disponibili** (già assegnati / Esistenti).  
Non assegnare `MC-OS-010` (riservato storicamente ADR Index; indice operativo = **MC-OS-024** — relazione formale OPEN) né riusare codici Esistenti / Prenotati / Riservati.

### 4.4 Regole operative

1. Il **Document Identifier è immutabile** per l’intera vita logica del documento (§4.2).  
2. Un nuovo documento riceve il **prossimo codice libero** indicato in §4.3.1 (oggi `MC-OS-032`); non si riusano codici di documenti Archived.  
3. Il codice compare nell’header, nei cross-reference, nel nome PDF ufficiale e nei file diagramma (quando applicati).  
4. I sotto-allegati possono usare suffisso: `MC-OS-005-A` (schedule), solo se necessario; il codice padre resta immutabile.  
5. L’assegnazione è registrata **solo** in questo EDGF (§4.3); in futuro anche in `00_GOVERNANCE/DOCUMENT_REGISTER.md` (cartella non ancora creata).

### 4.5 Regola anti-duplicazione (obbligatoria)

**Prima della creazione di ogni nuovo documento ufficiale deve essere verificato il registro EDGF (§4.3).**

Nessun agente (umano o AI) può assegnare autonomamente un codice già:

- **utilizzato** (Esistente) — incluso **MC-OS-012** … **MC-OS-031**,
- **prenotato**,
- **riservato**.

Il prossimo codice **assegnabile** è **MC-OS-032** (§4.3.1).  
Ogni nuovo codice deve essere verificato nel registro EDGF prima della creazione del documento.

In caso di dubbio: aggiornare prima il registro EDGF, poi creare il documento con il prossimo codice libero.

---

## 5. Document Version (Semantic Versioning)

Ogni documento ufficiale utilizza **Semantic Versioning** come **Document Version**.

### 5.1 Formato Document Version

```text
MAJOR.MINOR.PATCH
```

Esempi: `0.1.0`, `0.2.0`, `1.0.0`, `1.1.0`, `2.0.0`.

### 5.2 Quando incrementare

| Incremento | Quando |
|------------|--------|
| **Patch** (`x.y.Z`) | Correzioni editoriali, link, typo, chiarimenti **senza** nuovo contenuto normativo. Esempio: `0.1.0` → `0.1.1`. |
| **Minor** (`x.Y.0`) | Aggiunta di sezioni, standard, requisiti o template **compatibile** con la lettura precedente. Esempio: `0.1.0` → `0.2.0`, `1.0.0` → `1.1.0`. |
| **Major** (`X.0.0`) | Cambiamento incompatibile di struttura, principi, SoT, o riscrittura che invalida riferimenti / decisioni basate sulla versione precedente. Esempio: `1.0.0` → `2.0.0`. |

### 5.3 Esempi di traiettoria

| Versione | Significato tipico |
|----------|-------------------|
| `0.1.0` | Prima bozza strutturale |
| `0.2.0` | Espansione / integrazione standard in Draft |
| `1.0.0` | Prima **Approved** stabile |
| `1.1.0` | Estensione compatibile post-approval |
| `2.0.0` | Breaking change / supersessione strutturale |

### 5.4 Pre-1.0.0

Fino a `1.0.0`, lo stato tipico è Draft o Under Review; la **MyChauffeur OS Documentation Release** può restare `0.x`.

**Nota:** la Document Version (§5) **non** sostituisce il Document Identifier (§4): a parità di `MC-OS-NNN`, cambia solo `MAJOR.MINOR.PATCH`.

---

## 6. Document Status (stato dei documenti)

Ogni documento ufficiale **deve** dichiarare uno **Document Status** tra i seguenti (insieme minimo obbligatorio):

| Stato | Significato | Uso consentito |
|-------|-------------|----------------|
| **Draft** | In redazione; può cambiare liberamente | Lavoro interno; non PDF ufficiale |
| **Under Review** | In revisione formale | Commenti; freeze soft consigliato |
| **Approved** | Approvato; Source of Truth operativa per il dominio | PDF ufficiale obbligatorio; citabile |
| **Superseded** | Sostituito da una versione/documento più recente | Solo lettura storica; link alla sostituzione |
| **Archived** | Chiuso definitivamente; non più evoluto | Solo archivio (`09_ARCHIVE/` in futuro; non creare ora) |

Transizioni tipiche: `Draft` → `Under Review` → `Approved` → (`Superseded` →) `Archived`.

Lo **stato** è indipendente dal Document Identifier (immutabile) e dalla Document Version (SemVer).

---

## 7. Document Header (header standard obbligatorio)

Ogni documento ufficiale **deve** aprire con un **Document Header** obbligatorio (tabella o blocco equivalente) contenente **almeno**:

| Campo | Obbligatorio | Descrizione |
|-------|--------------|-------------|
| **Codice documento** | Sì | Document Identifier `MC-OS-NNN` (immutabile) |
| **Titolo** | Sì | Nome completo |
| **Versione** | Sì | Document Version SemVer |
| **Stato** | Sì | Document Status (§6) |
| **Data creazione** | Sì | ISO `YYYY-MM-DD` |
| **Ultima modifica** | Sì | ISO `YYYY-MM-DD` |
| **Owner** | Sì | Ruolo responsabile |
| **Autori** | Sì | Chi ha redatto/modificato |
| **Documenti correlati** | Sì | Codici/path |
| **Dipendenze** | Sì | Documenti o decisioni da cui dipende |
| **Classificazione** | Sì | Governance / Business / Product / Finance / Legal / Technical / Operations |
| Documentation Release | Consigliato | MyChauffeur OS Documentation Release a cui è allineato |

Il presente file (MC-OS-000 — EDGF) è il modello di riferimento dell’header.

---

## 8. Revision History (cronologia revisioni)

Ogni documento ufficiale **deve** contenere una **Revision History** con tabella standard.

### 8.1 Colonne obbligatorie (ordine ufficiale)

| Versione | Data | Autore | Descrizione modifica | Stato |
|----------|------|--------|----------------------|-------|

### 8.2 Template standard

```markdown
## Cronologia revisioni

| Versione | Data | Autore | Descrizione modifica | Stato |
|----------|------|--------|----------------------|-------|
| 0.1.0 | YYYY-MM-DD | Nome / Ruolo | Creazione iniziale. | Draft |
```

### 8.3 Regole

- Ogni incremento di Document Version **aggiunge** una riga (non si riscrivono le righe storiche).  
- La descrizione spiega il **perché**, non solo “update”.  
- Il passaggio a Approved richiede riga dedicata e checklist §17 completata.  
- Il PDF ufficiale Approved deve riflettere la **stessa** Revision History (§11).

---

## 9. MyChauffeur OS Documentation Release

Oltre alla **Document Version** del singolo file, il progetto adotta:

### **MyChauffeur OS Documentation Release**

Esempi: `Documentation Release 0.1`, `Documentation Release 0.2`, `Documentation Release 1.0`.

### 9.1 Differenza tra le due versioni

| Concetto | Cosa misura | Esempio | Cambia quando… |
|----------|-------------|---------|----------------|
| **Document Version** (Versione Documento) | Evoluzione di **un** documento (`MC-OS-NNN`) | `MC-OS-002` → `1.1.0` | Si modifica quel singolo documento |
| **Documentation Release** (Versione della Documentazione) | Coerenza dell’**insieme** ufficiale dei documenti pubblicati agli stakeholder | `Documentation Release 0.2` | Un pacchetto coerente di documenti (con relative Document Version) è pronto come release di sistema |

Una Documentation Release **non sostituisce** le Document Version: le **elenca** in un manifest (documento X @ vA.B.C, documento Y @ vD.E.F, …).

### 9.2 Traiettoria orientativa

| Release | Significato orientativo |
|---------|-------------------------|
| **Documentation Release 0.1** | Costituzione EDGF + framework dominio in Draft (fase attuale) |
| **Documentation Release 0.2** | Registri allineati, glossario unico, header MC-OS su tutti i doc core |
| **Documentation Release 0.3** | Migrazione cartelle target (fase futura), diagrammi SoT, cross-ref completi |
| **Documentation Release 1.0** | Primo set Approved + PDF ufficiali dei documenti core |

### 9.3 Regole

1. Una Documentation Release elenca i documenti e le **Document Version** incluse (manifest).  
2. Incrementare la Release quando un insieme coerente di documenti è pronto per stakeholder.  
3. Il manifest futuro vivrà in `00_GOVERNANCE/DOCUMENTATION_RELEASE_NOTES.md` (**cartella non ancora creata**; non creare ora).

---

## 10. Diagram Policy (policy diagrammi)

### 10.1 Ambito

Ogni **documento architetturale** (es. Blueprint, framework di dominio con viste strutturali, documenti in percorso Approved che espongono architettura) **deve** possedere, per ciascun diagramma ufficiale:

| Artefatto | Ruolo |
|-----------|--------|
| **Draw.io (`.drawio`)** | **Source of Truth** del diagramma — sempre |
| **PDF** | Export lettura/stampa |
| **SVG** | Export vettoriale per docs web |
| **PNG** | Export raster per preview |

### 10.2 Source of Truth

Il file **Draw.io rappresenta sempre la Source of Truth** del diagramma.  
È vietato aggiornare solo PNG/SVG/PDF diagramma senza aggiornare il `.drawio`.

### 10.3 Naming (futuro — cartella non ancora creata)

```text
MC-OS-NNN_vX.Y.Z_<slug-diagramma>.drawio
MC-OS-NNN_vX.Y.Z_<slug-diagramma>.svg
MC-OS-NNN_vX.Y.Z_<slug-diagramma>.png
MC-OS-NNN_vX.Y.Z_<slug-diagramma>.pdf
```

Cartella target (non creare ora): `docs/07_DIAGRAMS/MC-OS-NNN/`.

### 10.4 Regole

- Il documento Markdown cita il diagramma per Document Identifier + Document Version + slug.  
- Gli export devono corrispondere alla stessa versione del `.drawio`.  
- **Non** generare diagrammi in questo task.

---

## 11. PDF Policy (policy PDF ufficiali)

### 11.1 Obbligo

Ogni documento in stato **Approved** **deve** avere un **PDF ufficiale**.

Cartella target (non creare ora): `docs/08_PDF_OFFICIAL/`.

### 11.2 Parità obbligatoria Markdown ↔ PDF

Il PDF ufficiale **deve** avere:

| Elemento | Regola di parità |
|----------|------------------|
| **Codice documento** | Stesso Document Identifier (`MC-OS-NNN`) del Markdown |
| **Versione** | Stessa Document Version SemVer del Markdown |
| **Changelog / Revision History** | Stessa tabella di cronologia revisioni del Markdown |
| **Data** | Stessa data di riferimento della versione Approved (Ultima modifica / data riga Approved in Revision History) |

Uno scostamento tra Markdown Approved e PDF ufficiale è **difetto di pubblicazione**.

### 11.3 Naming convention

```text
MC-OS-NNN_<SHORT-TITLE>_vX.Y.Z.pdf
```

Esempio: `MC-OS-000_DOCUMENTATION-MANAGEMENT-FRAMEWORK_v1.0.0.pdf`

### 11.4 Header PDF

- Codice documento  
- Titolo  
- Versione (Document Version)  
- Stato: Approved  
- Documentation Release  
- Classificazione  

### 11.5 Footer PDF

- “MyChauffeur OS — Official Documentation”  
- Numero pagina `p. X di Y`  
- Data generazione / data versione  
- Path/codice sorgente Markdown  

### 11.6 Watermark

| Stato | Watermark |
|-------|-----------|
| Draft / Under Review | `DRAFT` / `UNDER REVIEW` (solo se si produce PDF di lavoro) |
| Approved | Nessun watermark “DRAFT”; eventuale marchio “OFFICIAL” discreto |
| Superseded / Archived | `SUPERSEDED` / `ARCHIVED` |

### 11.7 Revisioni PDF

- Nuova Document Version Approved ⇒ nuovo PDF (non overwrite silenzioso).  
- PDF precedenti → archivio (`09_ARCHIVE/` o `08_PDF_OFFICIAL/archive/` in futuro; **non creare ora**).

**Non** generare PDF in questo task.

---
## 12. Cross References

### 12.1 Formato consigliato

```markdown
Vedere [MC-OS-002 Business Operating System](./BUSINESS_OPERATING_SYSTEM.md) §9 Contribution margin.
```

Dopo la migrazione cartelle, aggiornare i path relativi; il **codice MC-OS-NNN resta stabile**.

### 12.2 Regole

1. Citare il **proprietario SoT**, non una copia.  
2. Non ripetere tabelle di decisioni: link a MC-OS-004.  
3. Blueprint (MC-OS-001) mantiene indici e puntatori, non il dettaglio di dominio.  
4. Se due documenti sembrano proprietari della stessa regola → escalare a governance (aggiornare §13).  
5. I riferimenti rotti sono difetto di release: checklist §17.

---

## 13. Source of Truth

| Dominio | Source of Truth | Codice |
|---------|-----------------|--------|
| Governance documentale / standard docs | Enterprise Documentation Governance Framework (EDGF) | **MC-OS-000** |
| **Assegnazione codici documentali MC-OS** | **Registro EDGF §4.3** (questo documento) | **MC-OS-000** |
| Indice architetturale / mappa capitoli | Master Blueprint | **MC-OS-001** |
| Economia gestionale / CM / unit economics | Business Operating System | **MC-OS-002** |
| Tariffazione NCC / regole prezzo servizio | NCC Tariff Requirements | **MC-OS-003** |
| Decisioni aperte (registro) | Decisions Pending | **MC-OS-004** |
| Partner legal-ops / prove / trattenute / subordinazione | Partner Legal and Operating Framework | **MC-OS-005** |
| Pagamenti / ledger / settlement / payout | Settlement & Financial Operations Framework | **MC-OS-006** |
| Stato implementativo reale + roadmap delivery 0–5 | Platform Map | **MC-OS-007** |
| Ripresa sessione operativa | Handoff | **MC-OS-008** |
| Glossario e dizionario di business | Domain Glossary and Business Dictionary (**esistente**) | **MC-OS-009** |
| ADR tecnici (indice) | Architecture Decision Records Index (**esistente**, Draft) | **MC-OS-024** (indice operativo); **MC-OS-010** resta **riservato** storicamente — relazione formale OPEN |
| Architecture Consolidation status | Architecture Consolidation Release v1 (**esistente**, Draft) | **MC-OS-023** |
| Architecture Baseline Freeze (B001) | Architecture Baseline Freeze v1 (**Esistente**, Approved Candidate v1.0.0) | **MC-OS-025** |
| Software Architecture (layering, moduli, dipendenze) | Software Architecture Framework (**Esistente**, Draft v0.1.0) | **MC-OS-026** |
| Data Architecture (modello dati, ownership, persistence) | Data Architecture Framework (**Esistente**, Draft v0.1.0) | **MC-OS-027** |
| Security Architecture (AuthN/AuthZ, isolation, secrets, audit security) | Security Architecture Framework (**Esistente**, Draft v0.1.0) | **MC-OS-028** |
| Role / Capability / Permission Catalog (Actor, Scope, Data Visibility, Matrix MVP, Authorization Decision) | Role, Capability and Permission Catalog (**Esistente**, Draft v0.1.0) | **MC-OS-029** |
| Dispatch & Operations Engine (Hybrid Timed Multi-Candidate, Ranking, Recovery, Tracking) | Dispatch & Operations Engine Framework (**Esistente**, Draft v0.1.1) | **MC-OS-030** |
| Customer / Driver / Partner Support (SupportCase, Live Ops Support, Trust & Safety) | Customer, Driver & Partner Support Framework (**Esistente**, Draft v0.1.0) | **MC-OS-031** |
| Modello concettuale entità di business | Business Entity Model (**esistente**) | **MC-OS-011** |
| Partner Exchange Marketplace B2B (Partner-to-Partner) | Partner Exchange Marketplace Framework (**esistente**, Draft) | **MC-OS-012** |

**Note su MC-OS-012:** disciplina il marketplace B2B Partner-to-Partner (Originating / Executing Partner). **Non** disciplina il marketplace B2C generale. **Non** sostituisce il Partner Legal and Operating Framework (MC-OS-005) né il Settlement and Financial Operations Framework (MC-OS-006). Va letto insieme a Business Entity Model (MC-OS-011), Domain Glossary (MC-OS-009), BOS (MC-OS-002), Partner Framework (MC-OS-005) e SFOF (MC-OS-006).

In caso di conflitto tra documenti: prevale la SoT di dominio; l’EDGF (MC-OS-000) prevale su **come** documentare e sull’**assegnazione dei codici**; le decisioni di prodotto non chiuse restano in MC-OS-004.

---

## 14. Glossary & Domain Dictionary

### 14.1 Principio

Esiste **un solo Glossario ufficiale** per MyChauffeur OS.

- Codice: **MC-OS-009** (**Esistente**)  
- Path attuale: `docs/DOMAIN_GLOSSARY_AND_BUSINESS_DICTIONARY.md`  
- Path target futuro (migrazione cartelle, non eseguita): `docs/00_GOVERNANCE/` (nome file da allineare in fase di migrazione)  
- Le definizioni sparse residue in altri documenti sono da trattare come **rinvii** al Glossario, non come SoT concorrenti.

### 14.2 Regole

1. Nuovi termini si aggiungono solo nel Glossario (MC-OS-009).  
2. I framework di dominio possono avere “legende locali” di 5–10 termini con link al Glossario.  
3. Sinonimi deprecati vanno marcati esplicitamente nel Glossario.

---

## 15. Politica di archiviazione

| Caso | Azione |
|------|--------|
| Nuova MAJOR che sostituisce struttura | Documento precedente → **Superseded**; PDF in archive |
| Documento abbandonato | Stato **Archived**; move logico in `09_ARCHIVE/` (in migrazione) |
| Versione PATCH/MINOR Approved | PDF vecchio archiviato; Markdown corrente aggiornato |
| Checkpoint di fase (es. audit Fase 0) | Conservare immutabile; non “sistemare” la storia |

Divieti: cancellare silenziosamente Approved; riscrivere cronologia revisioni.

---

## 16. Regole di modifica

### 16.1 Chi modifica

| Ruolo | Permesso |
|-------|----------|
| Owner del documento | Propone e integra modifiche di merito |
| Autori delegati | Draft su incarico Owner |
| Reviewer | Commenta; non merge senza Owner |
| Documentation Governance Lead | Vincoli EDGF, codici MC-OS, Release |
| Product Owner | Approva decisioni di prodotto (MC-OS-004) che impattano i doc |

### 16.2 Processo

```text
Proposta → Draft (bump versione) → Under Review → Checklist §17
→ Approved (Owner + reviewer) → (se richiesto) PDF §18 → aggiorna Release manifest
```

### 16.3 Changelog e versione

1. Aggiornare contenuto.  
2. Incrementare SemVer (**Document Version**) secondo §5.  
3. Aggiungere riga in Revision History (§8).  
4. Aggiornare “Ultima modifica” nell’header.  
5. Se Approved: generare PDF con parità obbligatoria (§11) in task dedicato.  
6. Aggiornare cross-ref nei documenti dipendenti se cambiano ancore/sezioni.

---

## 17. Checklist di revisione

Prima di passare a **Approved**:

- [ ] Header completo (§7) con Document Identifier MC-OS  
- [ ] Document Status e Document Version coerenti  
- [ ] Revision History aggiornata (colonne: Versione, Data, Autore, Descrizione modifica, Stato)  
- [ ] Nessuna duplicazione di SoT altrui (solo cross-ref)  
- [ ] Terminologia allineata al Glossario ufficiale MC-OS-009 (esistente)  
- [ ] Nuovo documento: codice verificato sul registro EDGF §4.3 (anti-duplicazione §4.5)  
- [ ] Decisioni aperte non chiuse “di nascosta”  
- [ ] Link interni/esterni verificati  
- [ ] Conflitti noti dichiarati esplicitamente (non risolti in silenzio)  
- [ ] Owner e reviewer identificati  
- [ ] Impatto su Documentation Release valutato  
- [ ] Diagram Policy: per documenti architetturali, `.drawio` + PDF/SVG/PNG allineati se presenti figure  

---

## 18. Checklist pubblicazione PDF

Prima di generare/pubblicare il PDF ufficiale:

- [ ] Documento in stato **Approved**  
- [ ] Document Version SemVer congelata per il PDF  
- [ ] **Stesso** Document Identifier del Markdown  
- [ ] **Stessa** Document Version del Markdown  
- [ ] **Stessa** Revision History / changelog del Markdown  
- [ ] **Stessa** data di riferimento della versione Approved  
- [ ] Naming `MC-OS-NNN_<SHORT-TITLE>_vX.Y.Z.pdf`  
- [ ] Header/footer/watermark conformi §11  
- [ ] Indice e numeri di pagina corretti  
- [ ] Diagrammi ad alta risoluzione / vettoriali dove previsto  
- [ ] PDF precedente archiviato (non sovrascritto)  
- [ ] Manifest Documentation Release aggiornato  
- [ ] Hash o path registrato nel registro documenti (futuro)  

---

## 19. Roadmap documentale

Ordine consigliato dei lavori **ancora mancanti** (solo documentazione):

| Ordine | Deliverable | Codice previsto |
|--------|-------------|-----------------|
| 1 | Approvazione EDGF (questo file) → Under Review → Approved | MC-OS-000 |
| 2 | Espansione `DECISIONS_PENDING` a Decision Register unificato (OD/AD) | MC-OS-004 |
| 3 | ~~Glossario ufficiale~~ — **completato**: MC-OS-009 Domain Glossary (**Esistente**) | MC-OS-009 |
| 4 | Allineamento header MC-OS su documenti core esistenti (prenotati) | MC-OS-001…008 |
| 5 | `DOCUMENT_REGISTER.md` + `DOCUMENTATION_RELEASE_NOTES.md` | Governance |
| 6 | Migrazione fisica cartelle `00_`–`09_` + `README_DOCUMENTATION.md` | — |
| 7 | ~~ADR Index~~ — **indice operativo creato**: MC-OS-024 Architecture Decision Records Index (**Esistente** Draft); MC-OS-010 resta riservato (relazione OPEN) | **MC-OS-024** |
| 8 | ~~Business Entity Model~~ — **completato**: MC-OS-011 (**Esistente**) | MC-OS-011 |
| 8b | ~~Partner Exchange Marketplace Framework~~ — **Creato — Draft — da sottoporre a revisione architetturale e professionale** | **MC-OS-012** |
| 9 | Diagrammi SoT (C4, lifecycle settlement, partner onboarding) | `07_DIAGRAMS` |
| 10 | PDF ufficiali dei documenti Approved | `08_PDF_OFFICIAL` |
| 11 | Local Law Schedule / privacy brief (da Partner framework) | Legal |
| 12 | Runbook operativi documentali (oltre HANDOFF) | Operations |
| 13 | Documentation Release **1.0** | — |
| — | ~~Software Architecture Framework~~ — **completato**: MC-OS-026 (**Esistente** Draft v0.1.0) | **MC-OS-026** |
| — | ~~Data Architecture Framework~~ — **completato**: MC-OS-027 (**Esistente** Draft v0.1.0) | **MC-OS-027** |
| — | ~~Security Architecture Framework~~ — **completato**: MC-OS-028 (**Esistente** Draft v0.1.0) | **MC-OS-028** |
| — | ~~Role, Capability and Permission Catalog~~ — **completato**: MC-OS-029 (**Esistente** Draft v0.1.0) | **MC-OS-029** |
| — | ~~Dispatch & Operations Engine Framework~~ — **completato**: MC-OS-030 (**Esistente** Draft v0.1.1) | **MC-OS-030** |
| — | ~~Customer, Driver & Partner Support Framework~~ — **completato**: MC-OS-031 (**Esistente** Draft v0.1.0) | **MC-OS-031** |
| — | Prossimo nuovo documento di dominio (non ancora definito) | **MC-OS-032** |

Note: le voci 3, 8 e 8b restano in tabella solo come tracciabilità di completamento; non sono più deliverable di creazione aperti (8b resta in revisione).

---

## 20. Template standard

### 20.1 Template documento

```markdown
# MyChauffeur OS — <TITOLO>

| Campo | Valore |
|-------|--------|
| **Codice documento** | MC-OS-NNN |
| **Titolo** | <TITOLO> |
| **Versione** | 0.1.0 |
| **Stato** | Draft |
| **Data creazione** | YYYY-MM-DD |
| **Ultima modifica** | YYYY-MM-DD |
| **Owner** | <Ruolo> |
| **Autori** | <Nomi/Ruoli> |
| **Documenti correlati** | MC-OS-… |
| **Dipendenze** | MC-OS-… / decisioni OD-… |
| **Classificazione** | <Governance|Business|Product|Finance|Legal|Operations|Technical> |
| **Documentation Release** | 0.x |

---

## 1. Scopo
…

## Cronologia revisioni

| Versione | Data | Autore | Descrizione modifica | Stato |
|----------|------|--------|----------------------|-------|
| 0.1.0 | YYYY-MM-DD | … | Creazione iniziale. | Draft |
```

### 20.2 Template changelog (riga)

```markdown
| X.Y.Z | YYYY-MM-DD | Autore | Descrizione focalizzata sul perché. | Draft|Under Review|Approved|… |
```

### 20.3 Template PDF (specifica di composizione)

```text
[HEADER]
MC-OS-NNN | <TITLE> | vX.Y.Z | Approved | Doc Release R.r | Classification

[BODY]
Contenuto conforme al Markdown Approved
(stessa Document Version, stesso codice, stessa Revision History, stessa data)

[FOOTER]
MyChauffeur OS — Official Documentation | Generated YYYY-MM-DD | Source: docs/... | Page X of Y

[WATERMARK]
(secondo stato — §11.6)
```

### 20.4 Template Diagramma

```text
File SoT:  MC-OS-NNN_vX.Y.Z_<slug>.drawio
Exports:   .svg .png .pdf (stesso basename — obbligatori per documenti architetturali)
Metadati nel draw.io (proprietà documento):
  - mc_os_code
  - doc_version
  - diagram_slug
  - owner
  - last_modified
Citazione nel Markdown:
  Figura: MC-OS-NNN / <slug> / vX.Y.Z (SoT: .drawio)
```

---

## Cronologia revisioni

| Versione | Data | Autore | Descrizione modifica | Stato |
|----------|------|--------|----------------------|-------|
| 0.19.0 | 2026-08-02 | Enterprise Documentation Governance Architect | Registrazione MC-OS-031 Customer, Driver & Partner Support Framework come Esistente (Draft v0.1.0); prossimo codice libero MC-OS-032; aggiornamento SoT e roadmap. | Draft |
| 0.18.1 | 2026-08-01 | Enterprise Documentation Governance Architect | Aggiornamento registro MC-OS-030 a Draft v0.1.1 (patch documentale Dispatch: tracking end-to-end, feedback reciproco, Phase 2/Deferred marketplace, OWNER_OPERATED); prossimo codice libero resta MC-OS-031. | Draft |
| 0.18.0 | 2026-08-01 | Enterprise Documentation Governance Architect | Registrazione MC-OS-030 Dispatch & Operations Engine Framework come Esistente (Draft v0.1.0); prossimo codice libero MC-OS-031; aggiornamento SoT e roadmap. | Draft |
| 0.17.0 | 2026-07-31 | Enterprise Documentation Governance Architect | Registrazione MC-OS-029 Role, Capability and Permission Catalog come Esistente (Draft v0.1.0); prossimo codice libero MC-OS-030; aggiornamento SoT e roadmap. | Draft |
| 0.16.0 | 2026-07-26 | Enterprise Documentation Governance Architect | Registrazione MC-OS-028 Security Architecture Framework come Esistente (Draft v0.1.0); prossimo codice libero MC-OS-029; aggiornamento SoT e roadmap. | Draft |
| 0.15.0 | 2026-07-26 | Enterprise Documentation Governance Architect | Registrazione MC-OS-027 Data Architecture Framework come Esistente (Draft v0.1.0); prossimo codice libero MC-OS-028; aggiornamento SoT e roadmap. | Draft |
| 0.14.0 | 2026-07-26 | Enterprise Documentation Governance Architect | Registrazione MC-OS-026 Software Architecture Framework come Esistente (Draft v0.1.0); prossimo codice libero MC-OS-027; aggiornamento SoT e roadmap. | Draft |
| 0.13.0 | 2026-07-26 | Enterprise Documentation Governance Architect | Registrazione MC-OS-025 Architecture Baseline Freeze v1 (B001, Approved Candidate v1.0.0) come Esistente; prossimo codice libero MC-OS-026. | Draft |
| 0.12.0 | 2026-07-26 | Enterprise Documentation Governance Architect | Registrazione MC-OS-024 Architecture Decision Records Index come Esistente (Draft); prossimo codice libero MC-OS-025; nota relazione OPEN con MC-OS-010 riservato. | Draft |
| 0.11.0 | 2026-07-26 | Enterprise Documentation Governance Architect | Registrazione MC-OS-023 Architecture Consolidation Release v1 come Esistente (Draft); prossimo codice libero MC-OS-024. | Draft |
| 0.10.0 | 2026-07-26 | Enterprise Documentation Governance Architect | Registrazione MC-OS-022 AI & Automation Governance Framework come Esistente (Draft); prossimo codice libero MC-OS-023. | Draft |
| 0.9.0 | 2026-07-26 | Enterprise Documentation Governance Architect | Registrazione MC-OS-021 Configuration & Feature Management Framework come Esistente (Draft); prossimo codice libero MC-OS-022. | Draft |
| 0.8.0 | 2026-07-26 | Enterprise Documentation Governance Architect | Registrazione MC-OS-020 System Event Catalog come Esistente (Draft); prossimo codice libero MC-OS-021. | Draft |
| 0.7.0 | 2026-07-26 | Enterprise Documentation Governance Architect | Registrazione MC-OS-019 System Domain Architecture come Esistente (Draft); prossimo codice libero MC-OS-020. | Draft |
| 0.6.0 | 2026-07-26 | Enterprise Documentation Governance Architect | Registrazione MC-OS-013…018 come Esistenti (Draft); prossimo codice libero MC-OS-019. | Draft |
| 0.5.0 | 2026-07-26 | Enterprise Documentation Governance Architect | Registrazione MC-OS-012 Partner Exchange Marketplace Framework come Esistente (Draft); prossimo codice libero MC-OS-013; aggiornamento SoT, roadmap e anti-duplicazione. | Draft |
| 0.4.0 | 2026-07-26 | Enterprise Documentation Governance Architect | Sync registro MC-OS con repository reale: 000/009/011 Esistenti; 001–008 prenotati; 010 riservato ADR; prossimo libero 012; SoT e roadmap aggiornate; regola anti-duplicazione §4.5. | Draft |
| 0.3.0 | 2026-07-26 | Enterprise Documentation Architect | Rinomina ufficiale in Enterprise Documentation Governance Framework (EDGF); aggiornamento descrizione di governance; aggiunta sezione Purpose come riferimento normativo. | Draft |
| 0.2.0 | 2026-07-26 | Enterprise Documentation Architect | Integrazione standard: Document Identifier immutabile; Document Version Patch/Minor/Major; Document Status; Revision History a colonne ufficiali; header obbligatorio; Documentation Release vs Document Version; PDF Policy di parità; Diagram Policy architetturale; struttura 00–09 solo target non creabile. | Draft |
| 0.1.0 | 2026-07-26 | Enterprise Documentation Architect | Creazione Costituzione documentale (poi EDGF): principi, struttura futura, codifica MC-OS, SemVer, stati, header, Release, diagrammi, PDF, SoT, glossario, archiviazione, checklist, roadmap, template. Nessuna migrazione fisica. | Draft |

---

*Fine di MC-OS-000 Enterprise Documentation Governance Framework (EDGF) v0.19.0 — Draft. Standard di governance documentale; non implementa cartelle, PDF o diagrammi.*

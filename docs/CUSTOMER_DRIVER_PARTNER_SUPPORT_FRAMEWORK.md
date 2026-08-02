# MyChauffeur OS — Customer, Driver & Partner Support Framework

| Campo | Valore |
|-------|--------|
| **Codice documento** | MC-OS-031 |
| **Titolo** | Customer, Driver & Partner Support Framework |
| **Versione** | 0.1.0 |
| **Stato** | Draft |
| **Data creazione** | 2026-08-02 |
| **Ultima modifica** | 2026-08-02 |
| **Owner** | Customer Operations, Support & Trust Engineering |
| **Autori** | MyChauffeur OS Team |
| **Documenti correlati** | MC-OS-000 · MC-OS-001 · MC-OS-009 · MC-OS-011 · MC-OS-012 · MC-OS-014 · MC-OS-015 · MC-OS-016 · MC-OS-017 · MC-OS-018 · MC-OS-019 · MC-OS-020 · MC-OS-021 · MC-OS-022 · MC-OS-025 (Baseline **B001**) · MC-OS-026 · MC-OS-027 · MC-OS-028 · MC-OS-029 · MC-OS-030 · PLATFORM_MAP · HANDOFF |
| **Dipendenze** | Booking & Service Lifecycle (MC-OS-014); Dispatch & Operations (MC-OS-030); Role/Permission Catalog (MC-OS-029); Notification (MC-OS-016); Customer Experience (MC-OS-018); Partner frameworks (MC-OS-005/012); Settlement/Finance (MC-OS-006); AI Governance (MC-OS-022); Identity/Security/Data/Software (MC-OS-015/026/027/028); Baseline B001 (MC-OS-025) |
| **Classificazione** | Official Support & Trust Operations Architecture Framework — Draft |
| **Documentation Release** | 0.1 (allineamento previsto) |
| **Baseline** | **B001** (MC-OS-025 Architecture Baseline Freeze v1) |

---

## Avvertenza

Questo documento è la **Source of Truth ufficiale** del dominio Support, Live Operations Support, Complaint e Trust & Safety di MyChauffeur OS.

**Non** è codice, **non** è schema SQL, **non** è specifica API definitiva, **non** sceglie provider chat/email/telefonia/WhatsApp/AI, **non** definisce SLA numerici definitivi.

I nomi tecnici di Domain, Module, Aggregate, Entity, Value Object, Command, Query, Event, Policy, Queue, Case e componenti software restano in **inglese**. Il testo normativo è in **italiano**.

---

## Source of Truth

**MC-OS-031** governa:

- SupportCase come record ufficiale del problema;
- tassonomia, priorità, lifecycle e queue di Support;
- confini Customer Support ≠ Live Operations ≠ Trust & Safety;
- canali come trasporto; piattaforma come record;
- OWNER_OPERATED → SMALL_TEAM → SPECIALIZED_OPERATIONS per Support;
- Permission/Data Visibility candidate per Support e Safety;
- AI support recommendation-only nell’MVP;
- integrazione con Booking/Service/Assignment (MC-OS-014/030) senza sostituirli.

**Non** sostituisce: MC-OS-014 (lifecycle), MC-OS-030 (Dispatch/Recovery operativo), MC-OS-029 (Permission Catalog SoT), MC-OS-022 (AI governance), MC-OS-016 (Notification), MC-OS-006 (Settlement/Finance).

---

## Indice sintetico

Le sezioni §1–§180 costituiscono il corpo normativo. Le matrici sono in §160. Decisioni e readiness in §161–§180.

---

## 1. Scopo

Definire come MyChauffeur OS:

1. riceve e classifica richieste di assistenza da Customer, Driver e Partner;
2. crea **SupportCase** contestuali collegati a Booking/Service/Assignment/Actor;
3. gestisce priorità basate anche sulla vicinanza temporale del Service;
4. orchestra Customer Support, Live Operations e Trust & Safety come domini distinti;
5. conserva Evidence e decisioni auditabili;
6. integra Recovery (MC-OS-030) senza duplicarne la SoT;
7. evolve da OWNER_OPERATED a team specializzati senza refactoring del core.

## 2. Relazione con Baseline B001

Allineato a **MC-OS-025 (B001)**: Modular Monolith CTD; Deny by Default; nessun microservices di default; nessun provider scelto; decisioni OPEN non chiuse. Support è un **Module** Application/Domain nel Modular Monolith (MC-OS-026).

## 3. Relazione con Booking, Service, Trip, Assignment e Recovery

| Concetto | Ownership | Relazione con Support |
|----------|-----------|------------------------|
| Booking / Service / Trip | MC-OS-014 | Collegamento contestuale obbligatorio quando applicabile |
| Assignment / Dispatch / RecoveryCase | MC-OS-030 | Support può triggerare o accompagnare Recovery; non sostituisce RecoveryCase |
| SupportCase | **MC-OS-031** | SoT del problema/assistenza |
| Complaint | MC-OS-031 | Distinto da Incident e da RecoveryCase |
| SafetyCase | MC-OS-031 (Safety queue) | Accesso ristretto; non Support ordinario |

**Complaint ≠ Incident ≠ RecoveryCase.** Un caso può *riferire* più di uno, ma le ownership restano distinte.

## 4. Benchmark Evidence Model

| Livello | Significato |
|---------|-------------|
| **DOCUMENTED EVIDENCE** | Pubblicamente verificabile (help center, career pages, safety pages, partner docs) |
| **PROBABLE PATTERN** | Inferenza ragionevole da pratiche di settore, non certezza competitiva |
| **MYCHAUFFEUR DECISION** | Scelta normativa di MyChauffeur OS |

### Sintesi competitor (senza pesi interni non pubblici)

| Player | Evidenza / pattern | Impatto MC-OS |
|--------|--------------------|---------------|
| **Uber** | DOCUMENTED: supporto contestuale alla corsa; segmentazione Actor; Safety separata da help ordinario | Contextual case; Safety queue separata |
| **Blacklane** | DOCUMENTED/PROBABLE: Partner Care, Corporate Care, compliance/document review | Code Partner/B2B/Compliance |
| **Welcome Pickups** | DOCUMENTED/PROBABLE: Dispatcher + Live Ops; ticketing contestuale; Driver Quality | Live Operations + Driver Quality |
| **Wheely** | DOCUMENTED/PROBABLE: supporto premium, Concierge, Academy, qualità Chauffeur | Concierge readiness; Quality |

Ciò che non è pubblico non è presentato come certo.

## 5. Architecture Drivers

- Trust durante e dopo il Service;
- Intervento rapido vicino al pickup/in-service;
- Isolamento Safety e PII;
- Auditabilità legale/operativa;
- Scalabilità da una sola Person a team specializzati;
- Canali multipli senza frammentare la SoT.

## 6. Quality Attributes

Auditability, Confidentiality, Availability operativa, Explainability (AI), Configurability, Isolation (CASE_ASSIGNED / SAFETY_RESTRICTED), Recoverability dei casi.

## 7. Support Principles

| ID | Principio |
|----|-----------|
| SUP-01 | Support non è una semplice pagina Contatti |
| SUP-02 | **SupportCase** è la Source of Truth del problema |
| SUP-03 | Customer Support ≠ Live Operations ≠ Trust & Safety |
| SUP-04 | Complaint ≠ Incident ≠ RecoveryCase |
| SUP-05 | Ogni caso collegabile a Booking, Service, Assignment, Customer, Driver, Vehicle, Partner o Organization |
| SUP-06 | Contextual case creation preferita |
| SUP-07 | Deny by Default |
| SUP-08 | Accesso ai soli dati necessari al caso |
| SUP-09 | Scope tipico **CASE_ASSIGNED** |
| SUP-10 | Progressive data disclosure |
| SUP-11 | Audit by Design |
| SUP-12 | Evidence ≠ semplici note |
| SUP-13 | WhatsApp, email e telefono sono **canali**, non Source of Truth |
| SUP-14 | Decisioni operative importanti rientrano nella piattaforma |
| SUP-15 | AI recommendation-only nell’MVP |
| SUP-16 | Rimborsi, sospensioni e Safety richiedono controllo umano |
| SUP-17 | Nessun super-admin implicito |
| SUP-18 | Configurazione sopra hardcoding |
| SUP-19 | Priorità basata anche sulla vicinanza temporale del Service |
| SUP-20 | Assistenza iniziale OWNER_OPERATED; delega futura senza refactoring core |

## 8. Domain Separation

| Dominio | Scopo | Esempi |
|---------|-------|--------|
| **Customer Support** | Assistenza commerciale/amministrativa/post-service | FAQ, invoice, amendment, complaint non-safety |
| **Live Operations** | Intervento su Service imminente/in corso | Driver late, no-show, vehicle issue, emergency dispatch link |
| **Trust & Safety** | Incidenti di sicurezza e gravi violazioni | Crash, harassment, dangerous driving |
| **Finance Support** | Refund review, payout, invoice | Collegato a MC-OS-006 boundary |
| **Compliance Support** | Documenti, identity, scadenze | Partner/Driver docs |
| **Driver Quality** | Coaching, low rating dispute (non Safety) | Quality review |

## 9. OWNER_OPERATED OPERATIONS MODEL

Nella fase iniziale una stessa **Person** può ricoprire, tramite **Role e Permission distinte**:

- CompanyOwner;
- Dispatcher;
- SupportOperator;
- LiveOperationsOperator;
- eventuale CompanyFinance.

**Vincoli:** nessun super-admin implicito; ogni Capability richiede Permission esplicita; operazioni sensibili auditabili; Control Tower unificata ammissibile; ownership delle responsabilità distinta anche se l’Actor è lo stesso.

### Control Tower unificata (OWNER_OPERATED)

Vista aggregata (read model) di:

- casi aperti;
- servizi imminenti;
- servizi in corso;
- Driver in ritardo;
- servizi non assegnati;
- richieste Customer;
- problemi Partner;
- rimborsi da approvare;
- documenti in scadenza;
- alert Safety e Recovery.

La Control Tower **non** fonde i domini: filtra per Permission.

## 10. SMALL_TEAM

Separazione graduale di: Dispatcher; Customer Support; Driver/Partner Support; Finance; Compliance. Stesse Aggregate/Queue; routing e staffing diversi.

## 11. SPECIALIZED_OPERATIONS

Code distinte candidate:

- Customer Support;
- B2B Support;
- Driver Support;
- Partner Support;
- Live Operations;
- Driver Quality;
- Finance Support;
- Compliance;
- Trust & Safety;
- Concierge / VIP.

Evoluzione senza refactoring del core SupportCase.

## 12. Actors

| Actor | Ruolo tipico verso Support |
|-------|----------------------------|
| Customer | Apre/consulta casi propri |
| Passenger | Può essere soggetto del caso; non necessariamente Booker |
| Corporate Admin | Casi B2B account-scoped |
| Booker | Chi ha creato il Booking |
| Hotel / Agency | Partner commerciale richiedente |
| Driver | Casi propri / Service assegnati |
| Partner Company | Casi Partner-scoped |
| Fleet Owner | Veicoli/documenti |
| Dispatcher | Live Ops + escalation |
| SupportOperator | Coda Support ordinaria |
| LiveOperationsOperator | Coda Live Ops |
| DriverQualityOperator | Quality / dispute rating |
| ComplianceReviewer | Document/identity |
| FinanceSupportOperator | Refund/payout review |
| TrustAndSafetyOperator | Safety ristretto |
| PlatformAdmin | Config/audit piattaforma (non ops implicite) |
| Owner / CompanyOwner | Config + Control Tower autorizzata |

## 13. SupportCase Aggregate

**SupportCase** è l’Aggregate root del problema. Contiene o riferisce:

| Concetto | Descrizione |
|----------|-------------|
| SupportCase | Record ufficiale |
| CaseCategory | Tassonomia |
| CasePriority | P0–P4 |
| CaseSeverity | Impatto (distinto da Priority se configurato) |
| CaseStatus | Lifecycle |
| CaseAssignment | Assegnazione operatore/queue |
| CaseMessage | Messaggio verso/da Actor esterno |
| InternalNote | Nota interna (INTERNAL_ONLY) |
| Evidence | Allegati/verifiche strutturate |
| CaseTimeline | Sequenza auditabile eventi |
| CaseEscalation | Escalation formalizzata |
| CaseResolution | Esito strutturato |
| CaseSla | Target configurabili (**valori OPEN**) |
| SupportQueue | Coda di routing |
| KnowledgeArticle | Articolo KB |
| ResponseTemplate | Template risposta |

## 14. Contextual Case Creation

Creazione da contesto Service/Booking/Assignment preferita: precompila riferimenti, Actor, orario pickup, stato operativo. Riduce errori e accelera Live Ops (Uber-like **DOCUMENTED** pattern di supporto contestuale).

## 15. Case Linkage

Un SupportCase può collegare (quando applicabile): `bookingId`, `serviceId`, `assignmentId`, `customerId`, `driverId`, `vehicleId`, `partnerId`, `organizationId`, `recoveryCaseId`, `safetyCaseId`. Linkage minimo richiesto dalla CaseCategory.

## 16. Case Status Model

Stati minimi:

`OPEN` → `TRIAGED` → `ASSIGNED` → `ACKNOWLEDGED` → `IN_PROGRESS` →  
`WAITING_CUSTOMER` | `WAITING_DRIVER` | `WAITING_PARTNER` | `WAITING_INTERNAL_TEAM` →  
`ESCALATED` → `RESOLVED` → `CLOSED` ; `REOPENED` rientra nel ciclo.

Transizioni illegali = deny + audit.

## 17. Case Priority Model

| Priority | Significato semplice |
|----------|----------------------|
| **P4_INFORMATIONAL** | Richiesta informativa |
| **P3_NORMAL** | Problema amministrativo o futuro |
| **P2_HIGH** | Service nelle prossime ore |
| **P1_CRITICAL** | Service imminente o in corso compromesso |
| **P0_SAFETY** | Sicurezza, incidente o emergenza |

Priorità influenzata da: categoria, stato Service, ETA/pickup proximity, Actor, Safety flag. **Nessun SLA numerico definitivo** in questo Draft. Durate/soglie = **OPEN** / Configuration (MC-OS-021).

## 18. Case Severity

Severity descrive gravità dell’impatto (es. LOW/MEDIUM/HIGH/CRITICAL) ed è distinta dalla Priority temporale. Mapping esatto = OPEN.

## 19. Case Taxonomy

Categorie minime (namespace):

- `booking.question`
- `booking.amendment`
- `booking.cancellation`
- `refund.request`
- `payment.issue`
- `invoice.request`
- `payout.issue`
- `driver.late`
- `driver.no_show`
- `customer.no_show`
- `vehicle.issue`
- `flight.delay`
- `train.delay`
- `customer.complaint`
- `driver.complaint`
- `low_rating.dispute`
- `lost_and_found`
- `compliance.document`
- `identity.issue`
- `account.access`
- `technical.issue`
- `incident`
- `crash`
- `harassment`
- `dangerous_driving`
- `medical_emergency`
- `privacy.incident`
- `fraud.suspected`
- `live_recovery`

Estensioni via Configuration; non hardcoding chiuso.

## 20. Complaint Model

Complaint = reclamo formale distinto da semplice feedback/rating (MC-OS-030 Feedback). Può generare SupportCase `customer.complaint` / `driver.complaint` e, se applicabile, SafetyCase.

## 21. Incident vs Safety vs Recovery

| Tipo | SoT | Note |
|------|-----|------|
| RecoveryCase | MC-OS-030 | Ripristino operativo Service |
| Incident (operativo) | SupportCase category `incident` o Live Ops | Non necessariamente Safety |
| SafetyCase | Queue Trust & Safety | Accesso SAFETY_RESTRICTED |

## 22. Evidence Model

**Evidence** è strutturata, tipizzata, auditabile, retention-aware. Distinta da InternalNote e CaseMessage. Tipi candidate: photo, document, GPS snapshot ref, call metadata, chat transcript ref, third-party report. Retention = **OPEN**.

## 23. Internal Notes

Visibilità **INTERNAL_ONLY**. Non esposte a Customer/Driver/Partner. Non sostituiscono Evidence.

## 24. Case Timeline

Timeline append-only di eventi di caso (status change, message, evidence, escalation, resolution). Base per Audit e Dispute.

## 25. Case Escalation

Escalation motivata verso queue/Role superiori (Live Ops, Finance, Safety, Owner). Audit obbligatorio. Dual approval dove policy (soglie **OPEN**).

## 26. Case Resolution & Closure

Resolution strutturata (`CaseResolution`) prima di CLOSED. REOPENED consentito con motivo; **non** cancella né sostituisce la cronologia precedente (CaseTimeline resta append-only). La chiusura **non** cancella CaseMessage, Evidence né Audit. Safety: chiusura solo da TrustAndSafetyOperator autorizzato; **non** dall’AI.

## 27. Case SLA Readiness

`CaseSla` come concetto; target numerici **OPEN**. Breach genera Alert, non azione autonoma distruttiva.

## 28. Support Queues

Queue candidate allineate alle fasi operative (§10–§11). Routing per category + priority + Actor + Organization.

## 29. Knowledge Base & Templates

KnowledgeArticle e ResponseTemplate per self-service e operatori. AI può suggerire; umano conferma nell’MVP dove policy richiede.

## 30. Channels

| Canale | Ruolo |
|--------|-------|
| Help Center / FAQ | Self-service |
| In-app support | Contextual |
| Live chat | Trasporto messaggi |
| Email | Trasporto |
| Telefono | Trasporto |
| Emergency phone | Safety / emergenza |
| SMS fallback | Trasporto fallback |
| WhatsApp fallback | Trasporto fallback — **non SoT** |
| Protected calling | Readiness (Phase 2 / OPEN) |
| Customer–Driver chat | Operativo; rilevante come Evidence ref |
| Account manager | B2B |
| Concierge | Readiness VIP |

**I canali trasportano i messaggi; SupportCase conserva il record ufficiale.** Email, telefono e WhatsApp **non** sono Source of Truth.

## 31. Omnichannel Ingestion Readiness

Phase 2: ingestione omnichannel verso SupportCase. MVP: creazione in-platform + template/email base senza provider scelto.

## 32. Live Operations Integration

Live Operations Support coordina interventi su Service imminente/in corso. **SoT Recovery/Dispatch resta MC-OS-030.** MC-OS-031 gestisce il caso di assistenza, comunicazione e timeline.

Flussi minimi:

- Service non assegnato;
- Driver non raggiungibile;
- Driver in ritardo;
- Customer no-show;
- Driver no-show;
- Vehicle breakdown;
- replacement Driver / Vehicle;
- flight / road disruption;
- emergency dispatch (link MC-OS-030);
- customer communication;
- Partner escalation;
- Dispatcher intervention;
- TriggerRecoveryFromSupport → RecoveryCase (MC-OS-030).

## 33. Trust & Safety

Separato dal Support ordinario. Categorie tipiche: crash; aggressione; molestie; guida pericolosa; emergenza medica; furto; violazione privacy; identity mismatch; grave violazione di sicurezza.

**Regole:**

- accesso ristretto (`safety.case.*`, SAFETY_RESTRICTED);
- Evidence obbligatoria dove possibile;
- Human Review obbligatorio;
- escalation formalizzata;
- Audit rafforzato;
- retention readiness (**OPEN**);
- **AI non chiude** casi Safety;
- **servizi pubblici di emergenza prima della piattaforma** quando necessario (112/911 o equivalente locale).

## 34. Refund & Finance Boundary

`refund.request` → review umana. AI può `refund.recommend` solo. Approve richiede `refund.approve` + Human Review. Nessuna modifica Ledger da Support Module senza boundary Finance (MC-OS-006). Soglie e dual approval = **OPEN**.

## 35. Lost & Found

`lost_and_found`: case dedicato; coordinamento Customer↔Driver; Evidence opzionale; non confondere con Safety furto (che può escalare).

## 36. Feedback Dispute

Allineato a MC-OS-030 Bidirectional Feedback / FeedbackDispute readiness: Human Review; nessun impatto automatico Tip; un singolo feedback non sospende.

## 37. AI & Automations (MVP recommendation-only)

**Consentito (assistito):** classificazione; routing; priorità suggerita; traduzione; riassunto; risposta suggerita; ricerca KB; duplicate detection readiness; sentiment readiness; Recovery recommendation; richiesta automatica Evidence.

**Vietato all’AI:**

- autorizzare rimborsi rilevanti;
- modificare Ledger;
- sospendere Driver o Partner;
- chiudere casi Safety;
- determinare responsabilità legali;
- cambiare Permission;
- rivelare PII non autorizzata;
- ignorare Human Review.

Allineato a MC-OS-022.

## 38. Permission Integration (Candidate)

Candidate Permission (registrazione formale futura in MC-OS-029):

- `support.case.read` / `create` / `update` / `assign` / `escalate` / `resolve` / `close` / `reopen`
- `support.evidence.read` / `manage`
- `support.internal_note.read` / `manage`
- `live_operations.read` / `manage`
- `complaint.read` / `manage`
- `safety.case.read` / `manage`
- `refund.recommend` / `refund.approve`
- `lost_found.read` / `manage`

Scope tipici: `CASE_ASSIGNED`, `ORGANIZATION`, `OWN_RECORDS`, `SAFETY_RESTRICTED`. **Nessuna implementazione codice in questa sessione.**

## 39. Authorization Boundary

Application Authorization (MC-OS-028/029). Deny by Default. Nessun super-admin implicito. PlatformAdmin ≠ ops Support automatico.

## 40. Data Visibility

Livelli: `FULL`, `LIMITED`, `MASKED`, `OPERATIONAL_ONLY`, `FINANCIAL_OWN`, `INTERNAL_ONLY`, `SAFETY_RESTRICTED`.

Minimizzazione su: telefono Customer/Driver; indirizzi; pagamento; payout; documenti; Risk Score; Internal Notes; Safety Evidence.

## 41. Privacy & Retention Readiness

Base giuridica; minimizzazione; retention Evidence/Safety **OPEN**; allineamento MC-OS-027/028.

## 42. Audit by Design

Ogni decisione rilevante (priority change, escalation, refund approve, safety action, reopen) produce audit trail correlabile.

## 43. Consoles / Surfaces

| Surface | Confine |
|---------|---------|
| Owner Control Tower | Aggregato KPI/code/alert; Permission distinte |
| Support Console | Coda Customer/Driver/Partner ordinaria |
| Live Operations Console | Service imminenti/in corso; link Dispatch |
| Driver Support Console | Casi Driver |
| Partner Support Console | Casi Partner |
| B2B Support Console | Corporate/Agency/Hotel |
| Finance Support Console | Refund/payout/invoice review |
| Trust & Safety Console | SAFETY_RESTRICTED |
| Customer App | Create/track own cases; contextual |
| Driver App | Create/track own cases; Evidence upload |
| Partner Console | Partner-scoped cases |

## 44. Notification Boundary

Support emette intent di notifica; MC-OS-016 governa delivery. Canali non diventano SoT.

## 45. Event Catalog Candidate

Esempi: `SupportCaseCreated`, `SupportCaseClassified`, `SupportCasePrioritized`, `SupportCaseAssigned`, `SupportCaseAcknowledged`, `CaseMessageAdded`, `InternalNoteAdded`, `EvidenceAttached`, `SupportCaseEscalated`, `SupportCaseResolved`, `SupportCaseClosed`, `SupportCaseReopened`, `LiveOperationsCaseStarted`, `RecoveryTriggeredFromSupport`, `SafetyCaseCreated`, `RefundReviewRequested`, `RefundApproved`, `LostAndFoundOpened`, `FeedbackDisputeOpened`. Registrazione formale futura in MC-OS-020.

## 46. Command / Use Case Catalog

- CreateSupportCase
- CreateContextualSupportCase
- ClassifySupportCase
- PrioritizeSupportCase
- AssignSupportCase
- AcknowledgeSupportCase
- AddCaseMessage
- AddInternalNote
- AttachEvidence
- EscalateSupportCase
- ResolveSupportCase
- CloseSupportCase
- ReopenSupportCase
- StartLiveOperationsCase
- TriggerRecoveryFromSupport
- CreateSafetyCase
- RequestRefundReview
- ApproveRefund
- OpenLostAndFoundCase
- DisputeFeedback
- SearchKnowledgeBase

**Non implementati** in questa sessione.

## 47. Domain Entities & Aggregates

Aggregate: SupportCase. Entity/VO correlati: CaseAssignment, CaseMessage, InternalNote, Evidence, CaseEscalation, CaseResolution, SupportQueue, KnowledgeArticle, ResponseTemplate. SafetyCase può essere specializzazione o Aggregate separato con boundary stretto (OPEN strutturale minore).

## 48. KPI

KPI minimi (senza valori numerici definitivi):

first response time; resolution time; backlog; case age; reopen rate; escalation rate; CSAT; contact rate per Service; Recovery success rate; refund rate; complaint rate; safety case volume; low-rating dispute rate; operator productivity; quality review completion; live case handling time; SLA breach rate.

## 49. Alerts

Alert su: P0/P1 unacked; SLA breach readiness; Safety created; refund pending approval; document expiry linked; Live Ops surge. Routing per Role/Permission.

## 50. Configuration over Hardcoding

Priority rules, queue mapping, templates, category extensions via MC-OS-021. Nessun provider hardcoded.

## 51. Current Repository Assessment

Valutazione concettuale (senza modificare codice):

| Area | Stato osservato |
|------|-----------------|
| SupportCase | Assente |
| Support Queue | Assente |
| Case Timeline | Assente |
| Evidence strutturata | Assente |
| Live Operations Support | Assente (Dispatch doc MC-OS-030 presente) |
| Trust & Safety module | Assente |
| Comunicazioni | Frammentate / canali non unificati in case SoT |
| AI support layer | Assente |
| JSON runtime legacy | Non foundation Support |
| Auth/Scope route legacy | Non collegati a CASE_ASSIGNED reale |

## 52. Gap Analysis

Gap: modello SupportCase; contextual creation; queue; Safety boundary; Evidence; omnichannel; Permission wiring; Control Tower Support; integrazione Recovery trigger; KB.

## 53. MVP Scope

SupportCase; contextual creation; Customer/Driver/Partner Support; OWNER_OPERATED Control Tower; priorità configurabili; messaggi; Internal Notes; Evidence base; template; traduzione assistita; manual assignment; escalation; link Booking/Service/Assignment; Live Ops integration; Audit; refund review manuale; lost & found; complaint; basic Knowledge Base.

## 54. Phase 2 Scope

Team/queue specializzate; SLA automation; protected calling; omnichannel ingestion; advanced AI assistant; sentiment; duplicate detection; Concierge; Partner Success; QA/coaching; workforce scheduling.

## 55. Deferred Scope

Fully autonomous support; autonomous refund approval; autonomous suspensions; autonomous Safety closure; global outsourced call center; fully automated legal responsibility decisions.

## 56. Architecture State Model

SupportCase model = **CANDIDATE**. Hybrid channel strategy = **CANDIDATE**. Autonomous support = **DEFERRED**.

## 57. Decisioni approvate (coerenti B001 / framework attivi)

- SupportCase = SoT del problema;
- Canali ≠ SoT;
- Customer Support ≠ Live Ops ≠ Safety;
- Complaint ≠ Incident ≠ RecoveryCase;
- Deny by Default; nessun super-admin implicito;
- AI recommendation-only MVP;
- Human control su refund rilevanti, sospensioni, Safety;
- OWNER_OPERATED iniziale;
- Priorità sensibile alla proximity temporale del Service;
- MC-OS-030 resta SoT Dispatch/Recovery.

## 58. Decisioni OPEN

SLA numerici; orari MVP di copertura; canale telefonico iniziale; provider chat; provider email; provider telefonia; WhatsApp integration; protected calling; retention Evidence; retention Safety; refund approval threshold; operazioni dual approval; staffing plan; outsourcing futuro; AI provider; livello di automazione; modalità Concierge; QA score; workforce scheduling; SafetyCase Aggregate vs specialization.

**Nessuna decisione OPEN è chiusa in questo documento.**

## 59. Professional Validation

CTO; Product Architect; Customer Operations; Dispatch Ops; Privacy/GDPR; Security; Legal; Insurance; Trust & Safety; Finance; NCC Operations.

## 60. Implementation Sequence (documentale)

1. SupportCase Aggregate + linkage;  
2. Contextual creation;  
3. OWNER_OPERATED Control Tower views;  
4. Manual assignment + messages + notes;  
5. Evidence base;  
6. Live Ops integration / Recovery trigger;  
7. Refund review;  
8. Safety queue boundary;  
9. KB base;  
10. Phase 2 queues/SLA/AI assist.

## 61. Architecture Definition of Done (documentale)

Sezioni e matrici presenti; OPEN esplicite; nessun provider/SLA numerico inventato; EDGF/Blueprint aggiornati; AI boundary chiaro; OWNER_OPERATED definito; Recovery non duplicato.

## 62–159. Normative Detail Index

Le sezioni seguenti approfondiscono senza introdurre nuove decisioni chiuse.

## 62. Service Proximity Priority Rule

La priorità cresce avvicinandosi a pickup/in-service, a parità di categoria non-Safety. P0 resta Safety-first indipendentemente dal tempo.

## 63. Waiting States Policy

Stati WAITING_* sospendono clock SLA solo secondo Configuration (**OPEN**); non nascondono il caso dalla coda.

## 64. Reopen Policy

REOPENED richiede motivo; eredita linkage e **conserva** CaseTimeline/messaggi/Evidence/Audit precedenti; può rialzare priority se Service ancora attivo.

## 65. Duplicate Case Readiness

Rilevamento duplicati assistito (Phase 2); merge manuale MVP.

## 66. Multilingual Support

Traduzione assistita MVP; qualità umana su Safety/Finance.

## 67. B2B Support Specifics

Corporate Admin/Booker/Hotel/Agency: scope Organization; invoice e SLA contrattuali come input (valori OPEN).

## 68. Partner Support Specifics

Partner Company / Fleet Owner: documenti, payout, assignment disputes; progressive disclosure Margin/Customer Price (MC-OS-029/012).

## 69. Driver Support Specifics

Availability, payout, rating dispute, vehicle docs, Live Ops assist.

## 70. Customer Support Specifics

Amendment, cancellation, tracking help, complaint, lost & found, refund request.

## 71. Concierge Readiness

VIP/Concierge queue Phase 2; non MVP obbligatorio.

## 72. Emergency Phone Policy

Emergency phone instrada a Safety/Live Ops e, se necessario, ricorda contatti pubblici di emergenza prima della piattaforma.

## 73. Protected Calling Readiness

Mascheramento numeri; provider **OPEN**; Phase 2.

## 74. Customer–Driver Chat Boundary

Chat operativa può essere referenziata come Evidence; moderazione/Safety escalation se abuse.

## 75. Account Manager Channel

B2B high-touch; comunque crea/aggiorna SupportCase.

## 76. Help Center Boundary

Self-service riduce contact rate; non sostituisce SupportCase per problemi aperti.

## 77. Template Governance

Template versionati; locale; no PII hardcodata.

## 78. Knowledge Article Lifecycle

Draft → Published → Deprecated; audit edit.

## 79. Operator Productivity Metrics

Readiness KPI; nessun target numerico MVP.

## 80. Quality Review Readiness

QA/coaching Phase 2; score **OPEN**.

## 81. Workforce Scheduling Readiness

Phase 2 / Deferred staffing automation.

## 82. Outsourcing Readiness

Deferred; se attivato, stessi Permission/Audit, no SoT esterna.

## 83. Legal Responsibility Boundary

Nessuna decisione legale automatica; Human + Legal review.

## 84. Suspension Boundary

Sospensioni Driver/Partner fuori da Support autonomo; richiede processo Identity/Compliance/Safety + Human.

## 85. Payment Data Visibility

Pagamento/payout: FINANCIAL_OWN / MASKED; Support vede solo quanto necessario al caso.

## 86. Risk Score Visibility

Risk Score INTERNAL_ONLY / SAFETY_RESTRICTED; non esposto a Customer.

## 87. Document Visibility

Compliance docs: least privilege; Partner/Driver own vs reviewer.

## 88. Address Minimization

Indirizzi mascherati fuori da OPERATIONAL_ONLY / CASE need-to-know.

## 89. Phone Minimization

Telefoni MASKED salvo necessità operativa Live Ops / Safety.

## 90. Idempotency of Case Commands

Command critici idempotenti (create contextual, escalate, approve refund).

## 91. Concurrency on CaseAssignment

Una assegnazione attiva primaria per caso; transfer auditato.

## 92. Correlation with Dispatch Events

Consumo eventi MC-OS-030 (`DelayRiskReported`, `RecoveryTriggered`, ecc.) per aprire/aggiornare casi Live Ops — senza mutare Aggregate Dispatch.

## 93. Correlation with Booking Events

Consumo eventi MC-OS-014 per amendment/cancellation context.

## 94. Notification Preferences Respect

Rispetto preferenze canale dove non Safety/P1 override policy.

## 95. CSAT Collection Readiness

Post-resolution CSAT opzionale; non influenza Tip/Rating Assignment (MC-OS-030).

## 96. Sentiment Readiness

Phase 2 signal; non azione autonoma.

## 97. Fraud Suspected Handling

`fraud.suspected` → Finance/Safety Human Review; no auto Ledger change.

## 98. Privacy Incident Handling

`privacy.incident` → Safety/Security; retention e breach process readiness.

## 99. Medical Emergency Handling

Priorità assoluta a emergenza pubblica; piattaforma documenta e supporta senza ritardare soccorsi.

## 100. Harassment / Dangerous Driving

SafetyCase; Evidence; possible temporary operational restriction solo via Human + policy — non AI.

## 101. Crash Handling

Safety + eventualmente Recovery/Insurance boundary; Evidence; Human.

## 102. Identity Issue Handling

`identity.issue` → Compliance/Identity; Deny by Default su elevation.

## 103. Account Access Handling

Reset/access via Identity flows; Support orchestra case, non bypassa Auth.

## 104. Technical Issue Handling

Bug/app issue; può linkare engineering ticket esterno ma SoT caso resta SupportCase.

## 105. Flight / Train Delay Cases

Input tracking readiness (provider OPEN); coordina Live Ops + customer communication.

## 106. Vehicle Issue Cases

Link Fleet; replacement vehicle flow via MC-OS-030 Recovery.

## 107. No-Show Cases

Customer/Driver no-show: Evidence; policy commerciale OPEN; Live Ops.

## 108. Driver Late Cases

P2/P1 tipici; comunicazione Customer; Recovery options.

## 109. Unassigned Service Cases

Live Ops + Dispatch; SupportCase può tracciare comunicazione Customer.

## 110. Partner Escalation Path

Partner → Partner Support → Live Ops / Owner secondo policy.

## 111. Dispatcher Intervention Path

Dispatcher può creare/prendere casi Live Ops con Permission; Manual Override Dispatch resta MC-OS-030.

## 112. Owner Override Path

Owner interviene con Permission esplicite + audit; non super-admin silenzioso.

## 113. Dual Approval Readiness

Refund alti, Safety grave, sospensioni: dual approval candidate (**OPEN** soglie).

## 114. Evidence Chain of Custody

Who uploaded, when, hash/ref readiness; no silent overwrite.

## 115. Case Export / Legal Hold Readiness

Export controllato; legal hold flag readiness; retention OPEN.

## 116. Analytics Boundary

Projection KPI; no write-back distruttivo su Case.

## 117. AI Control Center Boundary

Monitor recommendation Support; no write SoT Safety/Finance.

## 118. Module Interaction Example

1. Customer apre caso contestuale da Service in-app;  
2. Support Module crea SupportCase + linkage;  
3. AI suggerisce category/priority (opzionale);  
4. Operatore conferma (MVP);  
5. Se Driver late → Live Ops queue + event a Dispatch;  
6. TriggerRecoveryFromSupport può creare RecoveryCase (MC-OS-030);  
7. Messaggi su canale; record in CaseMessage;  
8. Evidence allegata;  
9. Resolution + CSAT readiness;  
10. Audit completo.

## 119. Anti-Patterns

- Gestire Recovery solo su WhatsApp;  
- Chiudere Safety senza Human;  
- Usare email come database casi;  
- Super-admin implicito Owner;  
- AI che approva refund;  
- Mescolare Complaint e Safety senza boundary;  
- Esporre InternalNote al Customer.

## 120. Glossary Hooks

SupportCase, CasePriority, Evidence, LiveOperations, TrustAndSafety, CASE_ASSIGNED — da allineare a MC-OS-009 senza duplicare il Glossario.

## 160. Matrici

### 160.1 Actor Support Matrix

| Actor | Create | Read own/org | Manage queue | Safety | Refund approve |
|-------|--------|--------------|--------------|--------|----------------|
| Customer | Sì (own) | Own | No | No | No |
| Driver | Sì (own) | Own/assigned | No | No | No |
| Partner | Sì (partner scope) | Partner scope | No | No | No |
| SupportOperator | Sì | CASE_ASSIGNED/Org | Sì (non-Safety) | No | Recommend |
| LiveOperationsOperator | Sì | Live queues | Sì Live | Limitato | No |
| TrustAndSafetyOperator | Sì Safety | SAFETY_RESTRICTED | Safety | Sì | No default |
| FinanceSupportOperator | Limitato | Finance cases | Finance | No | Sì se Permission |
| Owner | Config | Control Tower | Policy | Audit | Policy + audit |

### 160.2 Channel Matrix

| Canale | MVP | SoT? |
|--------|-----|------|
| In-app / Help Center | Sì | No (Case sì) |
| Email | Readiness | **No** |
| Telefono | OPEN | **No** |
| WhatsApp | Fallback readiness | **No** |
| Live chat | Phase 2/OPEN | No |
| Emergency phone | Readiness | No |
| Protected calling | Phase 2 | No |

### 160.3 Case Taxonomy Matrix

Vedi §19. Safety categories → Trust & Safety queue.

### 160.4 Priority and Severity Matrix

| Priority | Esempio | Severity tipica |
|----------|---------|-----------------|
| P4 | FAQ / info | LOW |
| P3 | Invoice futura | LOW/MED |
| P2 | Service in poche ore | MED/HIGH |
| P1 | In corso compromesso | HIGH |
| P0 | Crash / harassment | CRITICAL |

### 160.5 Case State Transition Matrix

OPEN→TRIAGED→ASSIGNED→ACKNOWLEDGED→IN_PROGRESS↔WAITING_*→ESCALATED→RESOLVED→CLOSED; REOPENED→IN_PROGRESS/ASSIGNED. Illegali deny+audit.

### 160.6 Queue Routing Matrix

| Category family | Queue tipica |
|-----------------|--------------|
| booking/payment/invoice | Customer / Finance |
| driver/vehicle/live_* | Live Operations |
| partner/compliance | Partner / Compliance |
| crash/harassment/safety | Trust & Safety |
| low_rating / quality | Driver Quality |
| lost_and_found | Customer/Driver Support |

### 160.7 Escalation Matrix

| Da | A | Trigger tipico |
|----|---|----------------|
| Customer Support | Live Ops | Service proximity / disruption |
| Live Ops | Dispatch Recovery | Need reassignment |
| Any | Finance | Refund |
| Any | Safety | P0 / safety category |
| Any | Owner | Policy / dual approval |

### 160.8 Live Operations Matrix

| Trigger | Support action | Dispatch link |
|---------|----------------|---------------|
| Driver late | Case P1/P2 + notify | Journey Health / Recovery |
| No-show | Evidence + case | Reassign / policy |
| Vehicle issue | Case + replacement req | Recovery |
| Unassigned | Customer comms case | Dispatch Engine |

### 160.9 Trust & Safety Matrix

| Caso | AI close? | Human | Emergency public first |
|------|-----------|-------|------------------------|
| Crash | No | Sì | Se necessario sì |
| Harassment | No | Sì | Se necessario sì |
| Medical | No | Sì | **Sì** |
| Privacy incident | No | Sì | Policy |

### 160.10 Evidence Matrix

| Tipo | Visibilità tipica |
|------|-------------------|
| Photo/doc caso ordinario | CASE_ASSIGNED |
| Call metadata | INTERNAL_ONLY / LIMITED |
| Safety Evidence | SAFETY_RESTRICTED |
| Chat transcript ref | CASE need-to-know |

### 160.11 Permission Matrix

Vedi §38.

### 160.12 Data Visibility Matrix

| Dato | Customer | Driver | Support | Safety |
|------|----------|--------|---------|--------|
| Phone counterpart | MASKED/progressive | MASKED/progressive | LIMITED | FULL need |
| Payment | OWN/MASKED | No | LIMITED finance | Policy |
| InternalNote | No | No | INTERNAL_ONLY | Yes if permitted |
| Safety Evidence | No | No | No default | SAFETY_RESTRICTED |

### 160.13 AI Boundary Matrix

| Azione | MVP |
|--------|-----|
| Classify / route / suggest reply | Sì (recommend) |
| Approve refund | **No** |
| Close Safety | **No** |
| Change Permission / Ledger | **No** |
| Suspend Actor | **No** |

### 160.14 Owner-Operated Matrix

| Capability | Stessa Person? | Permission distinta? | Audit |
|------------|----------------|----------------------|-------|
| Dispatch | Sì | Sì | Sì |
| Support | Sì | Sì | Sì |
| Live Ops | Sì | Sì | Sì |
| Finance approve | Sì | Sì | Sì |
| Safety | Limitato MVP | Sì | Sì rafforzato |

### 160.15 Team Evolution Matrix

| Fase | Code | Staffing |
|------|------|----------|
| OWNER_OPERATED | Logiche separate, UI unificata | 1 Person multi-Role |
| SMALL_TEAM | Code separabili | Ruoli spezzati |
| SPECIALIZED_OPERATIONS | Code dedicate §11 | Team specialistici |

### 160.16 KPI Matrix

Vedi §48 — metriche senza target numerici.

### 160.17 MVP / Phase 2 / Deferred Matrix

| Ambito | MVP | Phase 2 | Deferred |
|--------|-----|---------|----------|
| SupportCase + contextual | Sì | — | — |
| OWNER_OPERATED Tower | Sì | SMALL_TEAM | SPECIALIZED |
| Omnichannel | Base | Sì | — |
| Autonomous refund/Safety | No | No | Vietato/autonomous deferred |
| Concierge / QA / workforce | No | Sì | Outsourcing globale deferred |

### 160.18 Competitor Evidence Matrix

Vedi §4.

### 160.19 Current Repository Gap Matrix

Vedi §51–§52.

## 161. Implementation Readiness

### READY
Principi; separazione domini; linkage concettuale a MC-OS-014/030; Permission candidate; AI boundary.

### READY WITH OPEN DECISIONS
SLA; provider canali; retention; refund thresholds; staffing.

### DEFERRED
Autonomous support/refund/Safety closure; outsourced global CC.

## 162. Roadmap

Foundation AuthZ → SupportCase MVP → Control Tower OWNER_OPERATED → Live Ops link → Safety boundary → Phase 2 specialization → Deferred autonomy ban maintained.

## 163–179. Reserved Cross-References

Cross-ref stabili: MC-OS-014, 016, 018, 022, 029, 030, 006, 012, 028, 021, 020, 009, 025 (B001).

## 180. Closing Normative Statement

MC-OS-031 stabilisce Support come sistema operativo di fiducia e assistenza, non come pagina contatti. Ogni problema rilevante vive in un **SupportCase** auditabile; i canali sono trasporto; Live Operations e Trust & Safety restano domini separati; l’AI assiste e non decide il critico; l’evoluzione da OWNER_OPERATED a team specializzati non richiede riscrittura del core.

---

## Cronologia revisioni

| Versione | Data | Autore | Descrizione modifica | Stato |
|----------|------|--------|----------------------|-------|
| 0.1.0 | 2026-08-02 | Customer Operations, Support & Trust Engineering | Creazione ex novo del Customer, Driver & Partner Support Framework (MC-OS-031): SupportCase SoT, priorità P0–P4, tassonomia, Live Ops/Safety boundaries, OWNER_OPERATED, AI recommendation-only, matrici, MVP/Phase2/Deferred, decisioni OPEN. | Draft |

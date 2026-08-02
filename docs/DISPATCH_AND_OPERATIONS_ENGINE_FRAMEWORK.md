# MyChauffeur OS — Dispatch & Operations Engine Framework

| Campo | Valore |
|-------|--------|
| **Codice documento** | MC-OS-030 |
| **Titolo** | Dispatch & Operations Engine Framework |
| **Versione** | 0.1.1 |
| **Stato** | Draft |
| **Data creazione** | 2026-08-01 |
| **Ultima modifica** | 2026-08-01 |
| **Owner** | Dispatch, Operations & Platform Engineering |
| **Autori** | MyChauffeur OS Team |
| **Documenti correlati** | MC-OS-000 · MC-OS-001 · MC-OS-009 · MC-OS-011 · MC-OS-012 · MC-OS-014 · MC-OS-015 · MC-OS-016 · MC-OS-017 · MC-OS-019 · MC-OS-020 · MC-OS-021 · MC-OS-022 · MC-OS-025 (Baseline **B001**) · MC-OS-026 · MC-OS-027 · MC-OS-028 · MC-OS-029 · PLATFORM_MAP · HANDOFF |
| **Dipendenze** | Booking & Service Lifecycle (MC-OS-014); Role/Permission Catalog (MC-OS-029); Partner Exchange (MC-OS-012); Notification (MC-OS-016); Pricing (MC-OS-017); AI Governance (MC-OS-022); Software/Data/Security Architecture (MC-OS-026/027/028); Entity Model (MC-OS-011); Glossary (MC-OS-009); Baseline Freeze B001 (MC-OS-025) |
| **Classificazione** | Official Dispatch & Operations Architecture Framework — Draft |
| **Documentation Release** | 0.1 (allineamento previsto) |
| **Baseline** | **B001** (MC-OS-025 Architecture Baseline Freeze v1) |

---

## Avvertenza

Questo documento è la **Source of Truth ufficiale** del Dispatch & Operations Engine di MyChauffeur OS.

**Non** è codice, **non** è schema SQL, **non** è specifica API definitiva, **non** sceglie provider GPS/Maps/Flight/Messaging/AI, **non** definisce formule numeriche definitive di ranking.

I nomi tecnici di Domain, Module, Aggregate, Entity, Value Object, Command, Query, Event, Engine, Policy, Score, State, Workflow e componenti software restano in **inglese**. Il testo normativo è in **italiano**.

---

## Source of Truth

**MC-OS-030** governa:

- Dispatch Modes e Hybrid Timed Multi-Candidate Model;
- Eligibility, Candidate Pool, Offer, Ranking, Assignment Decision;
- Operational Tracking end-to-end (T-120 → CompleteOperationalService), Journey Health, Recovery;
- Bidirectional Verified Feedback e Tip Separation;
- OWNER_OPERATED Operations Model e evoluzione SMALL_TEAM / SPECIALIZED_OPERATIONS;
- Boundary operativi verso Booking, Assignment, Notification, Analytics, AI;
- MVP / Phase 2 (distribuzione controllata estesa) / Deferred (Marketplace aperto).

**Non** sostituisce: MC-OS-014 (lifecycle Booking/Service), MC-OS-012 (Partner Exchange commerciale), MC-OS-029 (Permission Catalog), MC-OS-022 (AI governance).

---

## Indice sintetico

Le sezioni §1–§240 costituiscono il corpo normativo. Le matrici sono in §232. Decisioni e readiness in §233–§240.

---

## 1. Scopo

Definire come MyChauffeur OS:

1. riceve un **Service** da assegnare;
2. individua i candidati idonei;
3. pubblica un’**Offer** controllata;
4. raccoglie **CandidateApplication**;
5. classifica i candidati;
6. assegna il Service (conferma Dispatcher o Auto-Select autorizzato);
7. consente override manuale motivato;
8. monitora il pre-pickup;
9. gestisce tracking e stati operativi;
10. rileva ritardi e anomalie;
11. esegue recovery e riassegnazione;
12. comunica con Customer, Driver, Partner e Dispatcher;
13. produce dati per Reputation, Finance, Support, Analytics e AI.

B2C e B2B alimentano lo **stesso** Dispatch Engine, con priorità e Policy differenziate.

## 2. Relazione con Baseline B001

Allineato a **MC-OS-025 (B001)**: Modular Monolith come CTD, Deny by Default, nessun microservices di default, nessun provider scelto in questo documento, decisioni OPEN non chiuse. Il Dispatch Engine è un **Module** Application/Domain nel Modular Monolith (MC-OS-026), non un servizio distribuito obbligatorio.

## 3. Relazione con Booking, Service, Trip e Assignment

| Concetto | Ruolo |
|----------|-------|
| **Booking** | Accordo commerciale / richiesta cliente (MC-OS-014). |
| **Service** | Unità operativa da eseguire e assegnare. |
| **Trip** | Esecuzione fisica del trasporto (quando applicabile). |
| **Assignment** | Legame attivo Service ↔ Executor (Driver/Partner). |

**Booking ≠ Service ≠ Trip ≠ Assignment.**  
**Assignment INTERNAL XOR PARTNER** (un solo executor attivo; nessun doppio executor).

## 4. Benchmark Evidence Model

| Livello | Significato |
|---------|-------------|
| **DOCUMENTED** | Pratica osservabile/pubblica senza rivelare algoritmi interni non pubblici. |
| **PROBABLE** | Inferenza operativa ragionevole, non certificata. |
| **HYPOTHESIZED** | Ipotesi di design. |
| **MYCHAUFFEUR DECISION** | Scelta propria di prodotto/architettura. |

### Sintesi competitor (senza pesi interni non pubblici)

| Player | Evidenza usabile | Livello |
|--------|------------------|---------|
| Uber | Dispatch real-time, ETA, radius expansion, timeout/retry | DOCUMENTED / PROBABLE |
| Blacklane | Offer System, partner performance, accesso differenziato | DOCUMENTED / PROBABLE |
| Daytrip | Servizi futuri, payout visibile, self-selection | DOCUMENTED / PROBABLE |
| Connecto | Airport orchestration, flight tracking, support 24/7 | DOCUMENTED / PROBABLE |
| Welcome Pickups | Dispatcher-centric, riassegnazione umana, recovery | DOCUMENTED / PROBABLE |
| Limo Anywhere / Moovs | Tool operativi, GPS, stati, chat, alert | DOCUMENTED / PROBABLE |

Non si affermano come documentati algoritmi o pesi interni non pubblici.

## 5. Dispatch Architecture Drivers

- Affidabilità di fulfillment NCC/chauffeur.
- Controllo umano del Dispatcher nell’MVP.
- Isolamento Tenant/Organization e protezione PII.
- Spiegabilità del ranking e auditabilità.
- Recovery in-platform.
- Scalabilità configurabile senza Marketplace aperto Phase 1.

## 6. Quality Attributes

Availability operativa; Consistency delle Assignment; Auditability; Explainability; Privacy; Fairness controllata; Latency accettabile su offer/ranking; Resilience su timeout e recovery; Configurability (MC-OS-021).

## 7. Dispatch Principles

| ID | Principio |
|----|-----------|
| DOP-01 | Booking ≠ Service ≠ Trip ≠ Assignment |
| DOP-02 | Assignment INTERNAL XOR PARTNER |
| DOP-03 | Dispatch ibrido |
| DOP-04 | Sistema filtra e classifica; operatore si candida |
| DOP-05 | Dispatcher mantiene controllo (default MVP) |
| DOP-06 | Auto-assignment solo dove configurato |
| DOP-07 | Deny by Default |
| DOP-08 | Nessuna mutazione diretta cross-domain |
| DOP-09 | Niente Assignment solo per primo clic |
| DOP-10 | Primo clic = tie-breaker a parità sostanziale |
| DOP-11 | Ranking spiegabile e decisione auditabile |
| DOP-12 | Eligibility prima del ranking; revalidation prima del lock |
| DOP-13 | Una sola Assignment attiva per Service; nessun doppio executor |
| DOP-14 | Geolocalizzazione limitata allo scopo operativo |
| DOP-15 | Progressive data disclosure; Customer PII protetta |
| DOP-16 | No WhatsApp come Source of Truth operativo |
| DOP-17 | Recovery dentro la piattaforma |
| DOP-18 | Configurazione sopra hardcoding |
| DOP-19 | AI recommendation-only nell’MVP |
| DOP-20 | Manual Override motivato (conferma umana) |
| DOP-21 | Fairness senza penalizzare qualità/affidabilità |
| DOP-22 | No formula numerica definitiva nell’MVP |
| DOP-23 | No Marketplace aperto tra operatori in Phase 1; Phase 2 = distribuzione controllata estesa |

## 8. Dispatch Modes

| Mode | Descrizione | Fase tipica |
|------|-------------|-------------|
| **MANUAL_ASSIGNMENT** | Il Dispatcher assegna direttamente un executor idoneo. | MVP |
| **DISPATCHER_ASSISTED** | Candidature + ranking; conferma umana. | MVP default |
| **AUTO_SELECT** | Assegnazione automatica nei casi policy-autorizzati. | Phase 2 / configurabile |
| **SEQUENTIAL_OFFER** | Offerte sequenziali con timeout. | Emergenza / fallback |
| **EMERGENCY_RECOVERY** | Percorso accelerato di recovery/riassegnazione. | MVP readiness |

## 9. Hybrid Timed Multi-Candidate Model

**HYBRID TIMED MULTI-CANDIDATE DISPATCH** — Candidate Technical / Product Decision.

Flusso semplice:

1. il sistema seleziona gli operatori idonei;
2. pubblica il Service a un gruppo controllato;
3. attende candidature per una **Candidate Window** configurabile;
4. classifica i candidati;
5. il Dispatcher conferma **oppure** il sistema assegna automaticamente nei casi autorizzati;
6. il primo clic è criterio secondario / tie-breaker;
7. in emergenza può essere usato **SEQUENTIAL_OFFER**.

Non è Marketplace aperto tra operatori. La pubblicazione resta **distribuzione interna controllata** a Driver e Partner verificati (Phase 1). L’estensione controllata è Phase 2; il Marketplace aperto tra operatori resta **Deferred** (§229–§230).

## 10. Service Intake

Ingresso del Service eleggibile al dispatch (`ServiceReadyForDispatch` o equivalente). Validazione Tenant/Organization, requisiti veicolo, priorità, vincoli compliance.

## 11. Dispatch Request

**DispatchRequest** = Aggregate di lavoro dispatch per un Service. Contiene mode, window, radius, stato, correlazione audit.

## 12. Eligibility Engine

Filtra candidati **prima** del ranking: disponibilità, veicolo, schedule, compliance, territorio, sospensioni, limiti operativi. Ineligible ⇒ escluso (Deny by Default).

## 13. Candidate Discovery

Scoperta dei potenziali executor (Driver interni e/o Partner verificati secondo Policy). Scope controllato; non open marketplace Phase 1.

## 14. Candidate Pool

**CandidatePool** = insieme idoneo congelabile per una Offer round. Versionato e auditabile.

## 15. Offer Publication

Pubblicazione **ServiceOffer** al pool idoneo. Visibilità differenziata; progressive disclosure.

**Phase 1:** distribuzione interna controllata verso Driver e Partner verificati. Non è Marketplace aperto.  
**Phase 2:** stessa natura controllata, con pool/visibilità più ampi e regole di accesso/territorio/compliance (nessuna libera pubblicazione indiscriminata).  
**Deferred:** Marketplace aperto tra operatori (listing autonomi, exchange cross-company esteso, eventuale dynamic auction).

## 16. Offer Visibility

Cosa vede il candidato: dati operativi necessari, non Customer Price/Margin/Platform Fee di default (MC-OS-029 / MC-OS-012). La Candidate Visibility cresce solo entro policy di distribuzione controllata (Phase 1/2); non implica Marketplace aperto.

## 17. Candidate Window

Finestra temporale configurabile di raccolta candidature. Durata esatta = **OPEN**.

## 18. Candidate Application

**CandidateApplication**: l’operatore si candida. Non implica Assignment.

## 19. Candidate Withdrawal

Ritiro candidatura entro policy; impatto su metriche (non formula definitiva).

## 20. Candidate Revalidation

Revalidation obbligatoria **prima del lock**: eligibility ancora vera? Altrimenti esclusione.

## 21. Ranking Engine

Produce **RankingSnapshot** spiegabile. Fattori in §52–§58 e matrice §232.6. **Nessuna formula numerica definitiva MVP**.

## 22. Tie-Breaking Policy

A parità sostanziale (soglia OPEN): first click, fairness, contractual priority, ecc. Compliance/qualità non sovrascrivibili.

## 23. Assignment Decision

**AssignmentDecision** = esito formalizzato (conferma Dispatcher / Auto-Select / override). Audit obbligatorio.

## 24. Dispatcher Confirmation

Default MVP: conferma umana su ranking assistito. Candidate Product Decision.

## 25. Manual Override

**Manual Override** è il termine canonico per l’intervento umano motivato sul Dispatch/Assignment (`OverrideReason` obbligatorio). Non silenzioso. “Human override” è solo descrizione della conferma umana, non un secondo termine concorrente.

## 26. Assignment Lock

Lock anti doppio executor; una Assignment attiva. Revalidation già eseguita.

## 27. Assignment Confirmation

Conferma e creazione Assignment (INTERNAL XOR PARTNER). Eventi a Notification/Analytics.

## 28. Candidate Rejection Notification

Notifica ai non selezionati; nessun dettaglio sensibile inutile.

## 29. No Candidate Flow

Nessuna candidatura: expand radius / second round / manual sourcing / escalation recovery.

## 30. Radius Expansion

Espansione progressiva del raggio (Uber-like DOCUMENTED pattern). Regole esatte OPEN.

## 31. Compensation Adjustment Readiness

Readiness a suggerire/adeguare compenso in round successivi. Auto Phase 2; non formula MVP.

## 32. Second Round

Nuova Offer round con pool/radius/compenso aggiornati.

## 33. Manual Sourcing

Ricerca manuale Dispatcher/Owner entro isolation e Permission.

## 34. Recovery Escalation

Passaggio a RecoveryCase / EMERGENCY_RECOVERY quando i round falliscono o il Service è a rischio.

## 35. Immediate Dispatch

Dispatch a breve: window ridotta, mode più aggressivo, possible SEQUENTIAL_OFFER.

## 36. Scheduled Dispatch

Dispatch anticipato per Service futuri (pattern Daytrip DOCUMENTED).

## 37. Airport Dispatch

Orchestrazione aeroportuale; flight tracking come Provider Boundary (provider non scelto).

## 38. Intercity Dispatch

Vincoli distanza/tempo/veicolo; route fit rilevante.

## 39. Corporate / B2B Priority

Priorità SLA corporate; stesso Engine, Policy diverse. Conflitto B2B vs B2C = OPEN.

## 40. VIP Service Priority

Priorità VIP configurabile; abuse protection §140.

## 41. Accessibility Requirements

Requisiti accessibilità veicolo/autista come eligibility hard filter.

## 42. Vehicle Compatibility

Exact vehicle class/capacity/luggage = MVP hard requirement.

## 43. Language Compatibility

Requisito lingua come filter o soft factor (OPEN peso).

## 44. Compliance Eligibility

Documenti, licenze, sospensioni, territory authorization.

## 45. Driver Availability

Stato disponibilità e turni; `driver.availability_manage_own`.

## 46. Vehicle Availability

Disponibilità veicolo autorizzato; `vehicle.select_authorized`.

## 47. Schedule Conflict Detection

Conflitti schedule/overlap → ineligible.

## 48. Position and ETA

Posizione e ETA via Maps/ETA Provider Boundary (non scelto).

## 49. Geographic Radius

Raggio iniziale e expansion = OPEN.

## 50. Route Fit

Compatibilità percorso/esperienza storica come soft factor.

## 51. Operational Readiness

Readiness operativa (fatigue readiness Phase 2, check base MVP).

## 52. Partner Reliability

Input Reputation/Performance Partner (MC-OS-029 score types separati).

## 53. Driver Reliability

Affidabilità Driver: acceptance, punctuality, no-show (metriche, non formula).

## 54. Customer Preference Readiness

Preferenze Customer come input readiness; non override compliance.

## 55. Historical Route Experience

Esperienza storica tratta/airport come soft factor.

## 56. Fair Distribution

Fairness sul volume offerte/assignment senza abbassare qualità.

## 57. Economic Sustainability

Sostenibilità economica executor/platform; non solo prezzo più basso (MC-OS-029).

## 58. Candidate Response Time

Tempo di risposta candidatura: fattore secondario / tie-break context.

## 59. First Click Policy

Il **first click**:

- **non** garantisce Assignment;
- è fattore **secondario**;
- può diventare **tie-breaker** a parità sostanziale;
- **non** deve sovrascrivere compliance o qualità.

Candidate Product Decision.

## 60. Assignment Score

Score di ranking versionato (`AssignmentScore`). Componenti documentati; **pesi/formula = OPEN**. No fixed formula MVP.

## 61. Confidence Score

Confidence della raccomandazione (umana/AI). Non sostituisce eligibility.

## 62. Explainability

Ogni ranking deve essere spiegabile a Dispatcher (fattori applicati/esclusi).

## 63. Ranking Transparency

Trasparenza operativa interna; non implica esporre Margin/PII ai candidati.

## 64. Score Versioning

Versioning dello score model per audit e rollback configurazione.

## 65. Weight Configuration

Pesi via Configuration (MC-OS-021). Valori iniziali OPEN.

## 66. No Fixed Formula Policy

Vietato fissare in questo Draft una formula numerica definitiva.

## 67. Dispatcher Decision Record

Record strutturato della decisione (chi, quando, perché, snapshot).

## 68. Override Reason

Motivo obbligatorio per override/manual assignment eccezionale.

## 69. Assignment Audit

Audit trail correlato a requestId/correlationId; Permission `audit.read`.

## 70. Dispatch Event Model

Eventi candidate (non catalogo chiuso): `DispatchRequestCreated`, `OfferPublished`, `CandidateApplied`, `CandidateWithdrawn`, `CandidateWindowClosed`, `RankingGenerated`, `AssignmentConfirmed`, `AssignmentOverridden`, `OfferExpanded`, `RecoveryTriggered`, `OperationalTrackingStarted`, `OperationalTrackingEnded`, `LocationConsentMissing`, `MandatoryLocationUnavailable`, `DriverOnTheWay`, `DriverAtPickup`, `DelayRiskReported`, `CustomerNoShowMarked`, `OperationalServiceCompleted`, `DriverRatingSubmitted`, `CustomerRatingSubmitted`, `FeedbackDisputeOpened`. Allineamento a MC-OS-020.

## 71. Dispatch Command Model

Command candidate: CreateDispatchRequest, DiscoverCandidates, PublishOffer, SubmitCandidateApplication, WithdrawCandidateApplication, CloseCandidateWindow, RankCandidates, ConfirmAssignment, OverrideAssignment, RejectCandidate, ExpandCandidateRadius, StartSecondRound, TriggerRecovery, ReassignService, MarkDriverOnTheWay, MarkDriverAtPickup, ReportDelayRisk, MarkCustomerNoShow, CompleteOperationalService.

## 72. Dispatch Query Model

Query candidate: GetDispatchRequest, ListUnassignedServices, ListCandidateApplications, GetRankingSnapshot, GetJourneyHealth, ListAlerts, ListRecoveryQueue, GetLiveBoardProjection. Read model separati; no mutazione.

## 73. Dispatch State Model

Stati tipici DispatchRequest: `DRAFT` → `OPEN` → `RANKING` → `PENDING_CONFIRMATION` → `ASSIGNED` | `NO_CANDIDATE` | `RECOVERY` | `CANCELLED`. Transizioni auditabili.

## 74. Offer State Model

ServiceOffer: `SCHEDULED` → `PUBLISHED` → `CLOSED` → `EXPIRED` | `SUPERSEDED` (second round).

## 75. Candidate State Model

CandidateApplication: `SUBMITTED` → `WITHDRAWN` | `INVALIDATED` | `SHORTLISTED` | `SELECTED` | `REJECTED`.

## 76. Assignment State Model

Assignment (riferimento MC-OS-014/011): `PENDING` → `CONFIRMED` → `ACTIVE` → `COMPLETED` | `REASSIGNED` | `CANCELLED`. Una sola attiva per Service.

## 77. Service Operational State Model

Stati operativi post-assignment (es.): `ASSIGNED`, `PREPARING`, `ON_THE_WAY`, `AT_PICKUP`, `PASSENGER_ON_BOARD`, `IN_PROGRESS`, `AT_DESTINATION`, `COMPLETED` / `CompleteOperationalService`, `NO_SHOW`, `DISRUPTED`, `RECOVERY`. Alias legacy (`DRIVER_EN_ROUTE`, `IN_SERVICE`) restano mappabili. Dettaglio lifecycle in MC-OS-014.

## 78. Pre-Service Monitoring

Monitoraggio prima del pickup: readiness, posizione, alert.

## 79. T-120 Operational Tracking

Candidate Product Decision — **invariant operativo end-to-end**:

Per ogni **Service assegnato**, l’**Operational Tracking** deve attivarsi almeno da **T-120** minuti rispetto al pickup e restare attivo durante:

- `PREPARING`;
- `ON_THE_WAY`;
- `AT_PICKUP`;
- `PASSENGER_ON_BOARD`;
- `IN_PROGRESS`;
- `AT_DESTINATION`.

Può terminare **solamente** dopo `CompleteOperationalService` o stato terminale equivalente.

Se consenso assente o geolocalizzazione richiesta non disponibile: generare **Alert**; informare Driver e Dispatcher; applicare la **policy operativa configurata**; **non** inventare automaticamente cancellazione o sospensione.

Frequenza `LocationPing`, parametri di tolleranza e retention restano **OPEN**.

## 80. T-60 Readiness Check

Check readiness a T-60.

## 81. T-30 Departure Readiness

Verifica partenza/posizionamento a T-30.

## 82. T-15 Pickup Presence

Candidate Product Decision: presenza attesa a T-15.

## 83. Arrival Verification

Verifica arrivo al pickup (geofence/status).

## 84. Pickup Geofence

Geofence pickup; raggio OPEN.

## 85. Driver Location Consent

Consenso e base giuridica localizzazione Driver (Privacy/GDPR validation). Il consenso operativo copre lo scopo del Service assegnato da T-120 fino a `CompleteOperationalService` (o terminale equivalente). Il consenso post-servizio è distinto, facoltativo e revocabile. Assenza/revoca del consenso operativo → Alert + notifica Driver/Dispatcher + policy configurata; nessuna cancellazione/sospensione automatica inventata.

## 86. Mandatory Operational Geolocation

Geolocalizzazione **obbligatoria** limitata allo **scopo operativo del Service**: da T-120 fino a conclusione operativa (`CompleteOperationalService` / terminale equivalente), negli stati §79. Non si estende oltre il Service corrente. Obbligo ≠ Marketplace tracking permanente.

## 87. Optional Post-Service Geolocation

Dopo il completamento operativo la geolocalizzazione diventa **facoltativa** (Candidate Product Decision). Può migliorare Candidate Discovery per servizi futuri vicini. Il rifiuto della geolocalizzazione post-servizio **non** produce penalità disciplinare, né impatto automatico su Rating, Reputation o Assignment Score.

## 88. Customer Live Tracking

Tracking Customer abilitato nella fase prevista; progressive disclosure.

## 89. Progressive Location Disclosure

Rivelazione progressiva posizione secondo stato Service (MC-OS-029).

## 90. ETA Update

Aggiornamenti ETA via provider boundary.

## 91. Driver Status Updates

Aggiornamenti stato Driver in-app.

## 92. Customer Status Updates

Aggiornamenti stato Customer (MVP).

## 93. Dispatcher Live Board

Board live Dispatcher: unassigned, delayed, alerts, recovery.

## 94. Journey Health

| Stato | Significato |
|-------|-------------|
| **GREEN** | Operazione nei parametri. |
| **AMBER** | Rischio ritardo/anomalia; attenzione. |
| **RED** | Critico; recovery/escalation. |

Basato su ETA, presenza T-15, eventi disruption; soglie OPEN.

## 95. Delay Risk

Segnale rischio ritardo → AMBER/RED e alert.

## 96. Driver Late

Driver in ritardo: comunicazione + recovery options.

## 97. Customer No-Show

Policy Customer no-show + Evidence readiness.

## 98. Driver No-Show

Driver no-show → reassignment/emergency.

## 99. Vehicle Issue

Guasto/veicolo non idoneo → replacement vehicle/driver.

## 100. Flight Delay

Input flight tracking boundary (provider non scelto).

## 101. Train Delay

Input train tracking boundary.

## 102. Traffic Disruption

Disruption traffico → ETA/Journey Health.

## 103. Weather Disruption

Disruption meteo via Weather Boundary.

## 104. Road Closure

Chiusure stradali → route/ETA update.

## 105. Incident

Incidente operativo/sicurezza → Safety Escalation.

## 106. Safety Escalation

Escalation sicurezza prioritaria; human + support.

## 107. Service Recovery

Processo recovery in-platform (no WhatsApp SoT).

## 108. Reassignment

Nuova Assignment dopo failure; lock precedente chiuso.

## 109. Replacement Driver

Sostituzione Driver.

## 110. Replacement Vehicle

Sostituzione Vehicle.

## 111. Partner Failure

Failure Partner executor → INTERNAL/altro Partner secondo Policy.

## 112. Cancellation Recovery

Recovery post-cancellazione (ops + finance boundary).

## 113. Emergency Dispatch

Mode EMERGENCY_RECOVERY / Sequential Offer.

## 114. Manual Recovery Console

Console recovery umana obbligatoria MVP.

## 115. Recovery Timeline

Timeline e SLA recovery (dettaglio OPEN).

## 116. Support Escalation

Escalation a Support (CASE_ASSIGNED / MC-OS-029).

## 117. Customer Communication

Comunicazioni Customer via Notification Module (MC-OS-016).

## 118. Driver Communication

Comunicazioni Driver in-platform.

## 119. Partner Communication

Comunicazioni Partner console/app.

## 120. Dispatcher Communication

Comunicazioni e alert al Dispatcher.

## 121. Notification Rules

Regole evento→canale; Deny by Default su PII.

## 122. Push Notification Readiness

Readiness push; provider non scelto.

## 123. SMS / Email Fallback

Fallback SMS/Email.

## 124. In-Platform Chat

Chat in-platform come canale operativo preferito.

## 125. Translation Readiness

Readiness traduzione messaggi.

## 126. Protected Calling Readiness

Protected calling = Phase 2 / OPEN.

## 127. No External Chat as Source of Truth

WhatsApp/Telegram **non** sono Source of Truth operative.

## 128. Evidence

Evidence per dispute/no-show/incident.

## 129. Evidence Upload Readiness

Upload Evidence readiness.

## 130. Operational Notes

Note operative auditabili, non PII inutili.

## 131. Customer Contact Protection

Contatto Customer masked/progressive (MC-OS-029).

## 132. Customer Price Visibility

Customer Price protetto verso executor di default.

## 133. Partner Cost Visibility

Partner Cost solo a ruoli autorizzati.

## 134. Driver Compensation Visibility

Compenso Driver secondo Policy (Daytrip-like DOCUMENTED pattern readiness).

## 135. Platform Margin Protection

Margin/Platform Fee non esposti operativamente di default.

## 136. B2C Priority

Priorità B2C configurabile.

## 137. B2B Priority

Priorità B2B/SLA.

## 138. SLA Priority

SLA come fattore hard/soft secondo contratto.

## 139. Priority Conflict Rules

Regole conflitto priorità = OPEN (B2B vs B2C).

## 140. Priority Abuse Protection

Protezione abuso flag VIP/priority.

## 141. Driver Rating Input

**DriverRatingInput** (Customer → Driver): stelle 1–5; commento opzionale; tag qualitativi; reclamo separato dal semplice rating. Distinto da PublicRating/InternalPerformance e da Tip. Non è automaticamente pubblico.

## 142. Partner Rating Input

Input rating Partner (fulfillment, comunicazione, dispute). Separato da Tip e da Assignment Score automatico.

## 143. Operational Score Input

Input performance operativa da **VerifiedOperationalFeedback** / fatti di sistema (puntualità, no-show, GPS, cancellazioni, completion) — non da sola opinione.

## 144. Compliance Score Input

Input ComplianceScore.

## 145. Reputation Input

Input Reputation Engine (separato da Assignment Engine). Tip esclusa. Un singolo feedback non causa sospensione/esclusione automatica.

## 146. Assignment Score Input

Input verso AssignmentScore (no formula fissa). Tip esclusa. Feedback soggettivo ≠ unique automatic score.

## 147. Feedback Separation

### BIDIRECTIONAL VERIFIED FEEDBACK

Feedback reciproco **Customer ↔ Driver**, non automaticamente pubblico.

**Customer → Driver (`DriverRatingInput`):**

- stelle 1–5;
- commento opzionale;
- tag qualitativi;
- reclamo separato dal semplice rating.

**Driver → Customer (`CustomerRatingInput`):**

- stelle 1–5;
- commento operativo opzionale;
- tag: puntualità; correttezza pickup; bagagli conformi; comportamento; comunicazione; richieste extra non prenotate.

**Principi:**

- il Customer rating non deve diventare strumento discriminatorio;
- feedback soggettivo ≠ **Operational Facts** verificati dal sistema (puntualità, no-show, GPS, cancellazioni, Service completion);
- un singolo feedback non causa automaticamente sospensione o esclusione;
- contestazioni → **SupportCase** / Human Review; readiness **FeedbackDispute**;
- il Driver feedback sul Customer serve a preparazione Service, prevenzione rischi, Support/Dispute — **non** a classifica pubblica clienti;
- concetti: `DriverRatingInput`, `CustomerRatingInput`, `VerifiedOperationalFeedback`, `FeedbackDispute` (readiness).

Feedback ≠ AssignmentScore automatico unico. Allineamento Reputation/Feedback Sources: MC-OS-029.

## 148. Tip Separation

La **mancia (Tip)**: non influenza Assignment Score; non influenza Rating; non influenza Reputation; è evento finanziario separato.

## 149. Driver Performance Metrics

Acceptance, withdrawal, punctuality, no-show, completion, T-15 presence; metriche da Operational Facts e, dove policy consente, aggregati da feedback (non Tip).

## 150. Partner Performance Metrics

Fulfillment, communication, dispute, evidence quality.

## 151. Dispatcher Performance Metrics

Time-to-assignment, override rate, recovery success.

## 152. Service Performance Metrics

On-time pickup, disruption, reassignment, cancellation.

## 153. Dispatch KPI

KPI minimi: fulfillment rate; time-to-assignment; candidate count; acceptance rate; withdrawal rate; reassignment rate; recovery success rate; on-time pickup; T-15 presence; no-show rate; cancellation rate; manual override rate; automation rate; customer notification latency; support escalation rate.

## 154. Alerts

Alert operativi tipizzati.

## 155. Alert Severity

INFO / WARNING / CRITICAL (o equivalente).

## 156. Alert Routing

Routing a Dispatcher / Support / Owner / LiveOperations secondo Policy e Permission esplicite (anche in modello OWNER_OPERATED: stesso Actor, responsabilità distinte). Include alert geolocalizzazione/consenso mancante (§79).

## 157. Alert Acknowledgement

Ack obbligatorio su severità alta.

## 158. Alert Escalation

Escalation temporale se non ack.

## 159. Automation Boundary

Automazioni ammesse vs vietate; AI non SoT write.

## 160. AI Dispatch Assistant

Assistant recommendation-only MVP (MC-OS-022).

## 161. AI Recommendation

Suggerimenti ranking/recovery spiegabili.

## 162. AI Confidence

Confidence score AI.

## 163. AI Explainability

Explainability obbligatoria.

## 164. Human Approval

Approvazione umana dove policy richiede.

## 165. AI Prohibited Actions

L’AI **non** può: assegnare servizi critici senza policy; cambiare Payment; modificare Ledger; sospendere Partner; cambiare Permission; rivelare PII; ignorare eligibility; bypassare **Manual Override** / policy Dispatcher; pubblicare feedback; alterare Rating/Reputation/Tip; sospendere Actor su singolo feedback.

## 166. Application Use Cases

CreateDispatchRequest; DiscoverCandidates; PublishOffer; SubmitCandidateApplication; WithdrawCandidateApplication; CloseCandidateWindow; RankCandidates; ConfirmAssignment; OverrideAssignment; RejectCandidate; ExpandCandidateRadius; StartSecondRound; TriggerRecovery; ReassignService; MarkDriverOnTheWay; MarkDriverAtPickup; ReportDelayRisk; MarkCustomerNoShow; CompleteOperationalService.

## 167. Domain Entities

Candidate Entity/Aggregate concettuali: DispatchRequest; CandidatePool; ServiceOffer; CandidateApplication; RankingSnapshot; AssignmentDecision; Assignment; DispatchOverride; OperationalTrackingSession; LocationPing; JourneyHealthSnapshot; DispatchAlert; RecoveryCase; DriverRatingInput; CustomerRatingInput; VerifiedOperationalFeedback; FeedbackDispute.

## 168. Aggregate Boundaries

DispatchRequest governa offer/window/ranking decision. Assignment è Aggregate separato (no doppia ownership). TrackingSession separata. RecoveryCase separato. Nessuna mutazione diretta cross-domain.

## 169. Value Objects

CandidateWindow; GeographicRadius; ETA; JourneyHealthStatus; OverrideReason; ScoreVersion; AlertSeverity; LocationConsentScope; PriorityClass.

## 170. Domain Services

EligibilityEngine; RankingEngine; TieBreakPolicy; JourneyHealthEvaluator; RecoveryPolicy (puri / senza I/O provider).

## 171. Application Services

Orchestrazione Use Case, transazioni, idempotency, pubblicazione eventi, enforcement Authorization (MC-OS-029 / Step 4 Engine).

## 172. Repository Ports

DispatchRequestRepository; ServiceOfferRepository; CandidateApplicationRepository; RankingSnapshotRepository; AssignmentRepository (o port verso Assignment Module); RecoveryCaseRepository; AlertRepository; TrackingSessionRepository.

## 173. Provider Ports

MapsEtaProvider; FlightTrackingProvider; TrainTrackingProvider; WeatherProvider; NotificationProvider; LocationProvider; AiRecommendationProvider. **Nessun provider concreto scelto.**

## 174. Event Catalog Candidate

Vedi §70; registrazione formale futura in MC-OS-020.

## 175. Command Catalog Candidate

Vedi §71.

## 176. Query Catalog Candidate

Vedi §72.

## 177. Transaction Boundaries

Una transazione Application per comando; side effect outbox/idempotenti.

## 178. Idempotency

Tutti i Command critici idempotenti (key + requestId).

## 179. Concurrency Control

Controllo concorrenza su Offer close, lock Assignment, recovery.

## 180. Duplicate Assignment Prevention

Invariant: una Assignment attiva per Service.

## 181. Optimistic Concurrency

Version su DispatchRequest/Offer/Assignment.

## 182. Timeout Handling

Timeout window, offer sequential, ack alert.

## 183. Scheduler Readiness

Scheduler per T-120/T-60/T-30/T-15 e window close (tech OPEN).

## 184. Background Job Readiness

Job per ranking batch, expansion, cleanup.

## 185. Queue Readiness

Queue per eventi/comandi async (tech OPEN).

## 186. Realtime Readiness

Realtime board/tracking (tech OPEN).

## 187. Maps / ETA Provider Boundary

Port; provider non scelto.

## 188. Flight Tracking Boundary

Port; provider non scelto.

## 189. Train Tracking Boundary

Port; provider non scelto.

## 190. Weather Boundary

Port; provider non scelto.

## 191. Notification Provider Boundary

Port verso MC-OS-016.

## 192. Location Provider Boundary

Port localizzazione.

## 193. AI Provider Boundary

Port recommendation-only.

## 194. Security Boundary

Allineato MC-OS-028; nessun bypass.

## 195. Authorization Boundary

Application Authorization obbligatoria (MC-OS-029 + Engine Step 4). Nessun super-admin implicito: ogni Capability richiede Permission esplicita, anche se la stessa Person ricopre più Role.

## 196. Permission Integration

Permission minime (MC-OS-029): `assignment.read`, `assignment.manage`, `assignment.accept`, `assignment.reject`, `service.read`, `service.manage`, `service.status_update`, `driver.availability_manage_own`, `vehicle.select_authorized`, `customer.contact_masked`, `customer.data_progressive`, `audit.read`. Scope tipici: ORGANIZATION / ASSIGNED_SERVICES / OWN_RECORDS. In OWNER_OPERATED le Permission restano distinte per Role anche se assegnate alla stessa Person.

## OWNER_OPERATED OPERATIONS MODEL

Modello operativo iniziale (Candidate Product Decision). Una stessa **Person** può ricoprire, tramite **Role e Permission distinte**:

- PlatformOwner;
- CompanyOwner;
- Dispatcher;
- SupportOperator;
- LiveOperationsOperator;
- eventuale CompanyFinance.

**Vincoli:**

- non esiste un super-admin implicito;
- ogni Capability richiede Permission esplicita;
- le operazioni sensibili sono auditabili;
- l’interfaccia può presentare una Control Tower unificata;
- l’ownership delle responsabilità resta distinta anche se l’Actor è lo stesso;
- il sistema deve evolvere senza refactoring strutturale verso SMALL_TEAM e SPECIALIZED_OPERATIONS.

| Fase | Descrizione |
|------|-------------|
| **1. OWNER_OPERATED** | Una persona gestisce Dispatch, Support, Recovery e configurazioni autorizzate. |
| **2. SMALL_TEAM** | Dispatcher, SupportOperator, Finance e Compliance separabili. |
| **3. SPECIALIZED_OPERATIONS** | Customer Support, Driver Support, Partner Support, Live Operations, Safety, Finance e Quality come code separate. |

## 197. Tenant Isolation

Ogni DispatchRequest/Offer/Assignment tenant-scoped.

## 198. Organization Isolation

Scope ORGANIZATION per Dispatcher/Owner.

## 199. Partner Isolation

Partner vede solo OWN / EXCHANGE_ELIGIBLE entro distribuzione controllata. Phase 2 può ampliare candidate visibility e sharing tra Organization autorizzate con regole territorio/compliance; **non** è Marketplace aperto né libera pubblicazione indiscriminata.

## 200. Driver Scope

ASSIGNED_SERVICES + OWN_RECORDS.

## 201. Progressive Data Disclosure

Allineato MC-OS-012/029. Feedback reciproco e tracking Customer/Driver seguono Visibility FULL/LIMITED/MASKED/PROGRESSIVE/OPERATIONAL_ONLY; non automaticamente pubblici.

## 202. Privacy by Design

Minimizzazione PII; base giuridica tracking.

## 203. Location Privacy

Location solo per scopo operativo dichiarato (T-120 → CompleteOperationalService); post-service solo con consenso facoltativo distinto.

## 204. Location Retention

Retention dei `LocationPing` e frequenza di campionamento restano **OPEN**. Nessuna retention definitiva in questo documento.

## 205. Audit by Design

Decisioni e override auditati.

## 206. Data Minimization

Campi minimi in Offer/Candidate views.

## 207. Customer Tracking Security

AuthZ + disclosure phase per Customer tracking.

## 208. Driver Tracking Security

Consent + AuthZ + retention.

## 209. Operations Dashboard

Dashboard Owner/Ops KPI dispatch.

## 210. Dispatcher Console

Console primaria MVP: board, ranking, Manual Override, recovery. In OWNER_OPERATED può confluire nella Control Tower unificata senza fondere le Permission.

## 211. Driver App Boundary

App/Driver portal: offer/candidate/status/tracking; consenso geo operativo/post-service; feedback CustomerRatingInput readiness.

## 212. Partner Console Boundary

Console Partner per candidature/assignment monitor (distribuzione controllata, non open marketplace).

## 213. Customer App Boundary

Status updates + live tracking fase prevista; DriverRatingInput / reclamo; Tip separata dal rating.

## 214. Owner Console Boundary

Configurazione mode/window/priority; audit; vista Owner del modello OWNER_OPERATED / SMALL_TEAM (config e responsabilità, non super-admin implicito).

## 215. Support Console Boundary

Escalation case-scoped; FeedbackDispute / Human Review; non bypassa Authorization.

## 216. AI Control Center Boundary

Monitor recommendation; no write SoT.

## 217. Dashboard Widgets

KPI widgets §153.

## 218. Live Operations Board

Board tempo reale servizi/alert.

## 219. Map View

Mappa operativa candidati/veicoli/pickup.

## 220. Candidate Ranking View

Vista ranking spiegabile.

## 221. Recovery Queue

Coda recovery. Visibile a Dispatcher / LiveOperations / Support secondo Permission; in OWNER_OPERATED stessa Person può operare con Role distinti.

## 222. Alert Queue

Coda alert.

## 223. Unassigned Services Queue

Coda non assegnati.

## 224. Delayed Services Queue

Coda delayed/AMBER-RED.

## 225. Compliance Risk Queue

Coda rischio compliance.

## 226. Current Repository Assessment

Valutazione concettuale (senza modificare codice):

| Area | Stato osservato |
|------|-----------------|
| Driver portal | Presente ma legacy/ops limitate |
| trip-ops JSON | Persistenza runtime non Domain SoT |
| demo-driver | Scenario demo, non produzione |
| Polling | Pattern legacy possibile |
| Auth reale | Non collegata (Foundation in corso) |
| Tenant/Organization wiring | Foundation presente, non wired alle route dispatch |
| Service/Assignment separati | Non ancora persistence operativa completa |
| Real-time tracking | Assente |
| DispatchRequest | Assente |
| CandidateApplication | Assente |
| Ranking | Assente |
| Recovery console | Assente |

## 227. Gap Analysis

Gap principali: separazione Service/Assignment; DispatchRequest; Candidate flow; RankingSnapshot; Authorization wiring; tracking T-120/T-15; recovery console; eliminazione dipendenza trip-ops JSON come SoT operativa.

## 228. MVP Scope

Incluso MVP: manual assignment; dispatcher-assisted ranking; candidate application; configurazione finestra; eligibility base; exact vehicle requirements; tenant/org isolation; audit; basic alerts; T-120 tracking readiness; T-15 presence; manual recovery; customer status updates.

## 229. Phase 2 Scope

**Distribuzione controllata estesa** (non Marketplace aperto):

- più Partner verificati;
- candidate visibility più ampia;
- eventuale sharing tra Organization autorizzate;
- regole di accesso, territorio e compliance;
- nessuna libera pubblicazione indiscriminata.

Inoltre: Auto-select configurabile; advanced ranking; progressive radius; automatic compensation adjustment (readiness); AI prediction; real-time optimization; protected calling; advanced fatigue checks. **Non** anticipa domanda/offerta autonoma tra operatori.

## 230. Deferred Scope

**Marketplace aperto tra operatori**, con: domanda/offerta autonoma; listing creati direttamente dagli operatori; cross-company exchange esteso; eventuale dynamic auction; regole economiche e legali dedicate.

Inoltre deferred: global real-time Uber-like dispatch; autonomous AI assignment; distributed dispatch services; machine learning ranking; fully automated financial recovery.

## 231. Architecture State Model

Stati architetturali: **PROPOSED**, **CANDIDATE**, **APPROVED**, **IMPLEMENTED**, **DEPRECATED**, **SUPERSEDED**, **RETIRED**.  
Hybrid Timed Multi-Candidate = **CANDIDATE**.

## 232. Matrici

### 232.1 Dispatch Mode Matrix

| Mode | MVP | Auto | Human confirm |
|------|-----|------|---------------|
| MANUAL_ASSIGNMENT | Sì | No | Sì |
| DISPATCHER_ASSISTED | Sì (default) | No | Sì |
| AUTO_SELECT | Limitato/config | Sì | Policy |
| SEQUENTIAL_OFFER | Fallback | Parziale | Opzionale |
| EMERGENCY_RECOVERY | Readiness | Assistito | Sì |

### 232.2 Actor Responsibility Matrix

| Actor / Role | Candida | Conferma Assignment | Manual Override | Recovery | Note OWNER_OPERATED |
|--------------|---------|---------------------|-----------------|----------|---------------------|
| Dispatcher | No* | Sì | Sì | Sì | Role distinto anche se stessa Person |
| Driver | Sì | Accept/Reject | No | Limitato | — |
| PartnerManager | Sì (futuro) | Monitor | Limitato | Limitato | Distribuzione controllata |
| CompanyOwner | Config | Eccezione | Sì | Sì | Permission esplicite |
| PlatformOwner | Config piattaforma | No ops default | No default | Audit/support | Non super-admin implicito |
| SupportOperator | No | No | No | Case-scoped | FeedbackDispute |
| LiveOperationsOperator | No | Assistito | Policy | Sì | Board/alert |
| CompanyFinance | No | No | No | No | Boundary finanziario |

\* salvo policy specifica. Stessa Person può avere più Role; Capability sempre via Permission.

### 232.3 Service Priority Matrix

| Classe | Esempio | Note |
|--------|---------|------|
| VIP | VIP flag | Abuse protection |
| B2B SLA | Corporate | Conflitto OPEN vs B2C |
| B2C | Standard | Default |
| Airport | Flight-linked | Tracking boundary |

### 232.4 Eligibility Matrix

| Check | Tipo |
|-------|------|
| Availability | Hard |
| Vehicle exact | Hard MVP |
| Schedule conflict | Hard |
| Compliance | Hard |
| Radius | Hard (poi expansion) |
| Language | Soft/Hard config |
| Reliability | Soft |

### 232.5 Candidate Visibility Matrix

| Dato | Phase 1 (controllata) | Phase 2 (controllata estesa) | Marketplace aperto (Deferred) |
|------|------------------------|------------------------------|-------------------------------|
| Pool candidati | Driver/Partner verificati | Più Partner / Org autorizzate | Listing autonomi operatori |
| Pickup area | Limitato/progressivo | Limitato/progressivo più ampio | Policy dedicata (non anticipata) |
| Customer phone | No / masked late | No / masked late | Non anticipato |
| Customer Price | No | No (default) | Non anticipato |
| Margin | No | No default | Non anticipato |
| Compenso executor | Policy | Policy | Non anticipato |
| Libera pubblicazione | **No** | **No** | Sì (solo Deferred) |

### 232.6 Ranking Factor Matrix

| Fattore | Ruolo |
|---------|-------|
| operational_fit | Primario |
| reliability | Primario |
| compliance | Hard gate |
| proximity/ETA | Primario/secondario |
| fairness | Secondario |
| economics | Non unico |
| first click | Tie-break only |
| tip | **Escluso** |

### 232.7 Tie-Break Matrix

| Condizione | Azione |
|------------|--------|
| Parità sostanziale | First click / fairness / contract |
| Compliance diverge | Vince compliance |
| Quality diverge | Vince quality |

### 232.8 Assignment Decision Matrix

| Input | Esito |
|-------|-------|
| Dispatcher confirm | ASSIGNED |
| Auto-select policy OK | ASSIGNED |
| Override motivato | ASSIGNED + audit |
| No candidate | Expansion/Recovery |

### 232.9 State Transition Matrix

Vedi §73–§77. Transizioni illegali = deny + audit.

### 232.10 Event Matrix

Evento → consumer: Notification, Analytics, AI (read), Finance (boundary), Support.

### 232.11 Command Matrix

Command → Permission tipica (es. ConfirmAssignment → `assignment.manage`).

### 232.12 Alert Matrix

| Alert | Severity tipica |
|-------|-----------------|
| No candidate | WARNING |
| Location consent missing / geo unavailable | WARNING/CRITICAL |
| Driver late | WARNING/CRITICAL |
| Driver no-show | CRITICAL |
| Safety | CRITICAL |

### 232.13 Recovery Matrix

| Trigger | Azione |
|---------|--------|
| No-show Driver | Reassign / Emergency |
| Vehicle issue | Replacement |
| Partner failure | Reassign |

### 232.14 Geolocation Matrix

| Fase | Mandatoria | Opzionale | Note |
|------|------------|-----------|------|
| T-120 → PREPARING / ON_THE_WAY / AT_PICKUP | Sì | — | Operational Tracking |
| PASSENGER_ON_BOARD / IN_PROGRESS / AT_DESTINATION | Sì | — | Fino a CompleteOperationalService |
| Post CompleteOperationalService | — | Sì | Nessuna penalità se rifiutata |
| Consenso/geo mancante | — | — | Alert + policy; no cancel/sospensione automatica inventata |
| Retention / ping frequency | — | — | **OPEN** |

### 232.15 Data Disclosure Matrix

Allineata MC-OS-029 Visibility (FULL/LIMITED/MASKED/PROGRESSIVE/OPERATIONAL_ONLY). Feedback reciproco non automaticamente pubblico; CustomerRatingInput non è classifica clienti; Tip non in disclosure rating.

### 232.16 Permission Matrix

Vedi §196.

### 232.17 KPI Matrix

Vedi §153.

### 232.18 Automation Matrix

| Automazione | MVP | Phase 2 |
|-------------|-----|---------|
| Window close | Sì | Sì |
| Ranking compute | Sì | Sì |
| Auto-select | No/limit | Sì |
| AI assign | No | No (deferred autonomous) |

### 232.19 AI Boundary Matrix

| Azione | Consentito |
|--------|------------|
| Recommend | Sì |
| Explain | Sì |
| Write Assignment critica senza policy | **No** |
| Ledger/Payment/Permission | **No** |
| Alterare Rating / Reputation / Tip | **No** |
| Bypass Manual Override | **No** |

### 232.20 MVP / Phase 2 / Deferred Matrix

| Ambito | Phase 1 / MVP | Phase 2 | Deferred |
|--------|---------------|---------|----------|
| Distribuzione | Interna controllata Driver/Partner verificati | Controllata estesa (più Partner, visibility, Org sharing) | Marketplace aperto tra operatori |
| Libera pubblicazione listing | No | No | Sì (solo Deferred) |
| Dynamic auction | No | No | Eventuale |
| Auto-select | Limitato/config | Sì | — |
| OWNER_OPERATED → SMALL_TEAM → SPECIALIZED | OWNER_OPERATED | SMALL_TEAM readiness | SPECIALIZED_OPERATIONS |
| Open marketplace | No | No | Sì |

Vedi anche §228–§230.

### 232.21 Competitor Evidence Matrix

Vedi §4.

### 232.22 Current Repository Gap Matrix

Vedi §226–§227.

## 233. Decisioni approvate

Coerenti con B001 e documenti attivi:

- Booking ≠ Service ≠ Trip ≠ Assignment;
- Assignment INTERNAL XOR PARTNER;
- Deny by Default; Authorization server-side;
- Modular Monolith CTD;
- No Marketplace aperto operatori Phase 1; Phase 2 = distribuzione controllata estesa; Marketplace aperto = Deferred;
- AI non write Source of Truth (recommendation-only MVP);
- Tip separata da Rating/Score/Reputation;
- Recovery in-platform; no WhatsApp come SoT operativo;
- Eligibility prima del ranking; una Assignment attiva;
- Configurazione sopra hardcoding;
- Manual Override come termine canonico.

## 234. Candidate Product Decisions

- Hybrid Timed Multi-Candidate Dispatch;
- Dispatcher Confirmation come default MVP;
- Manual Override termine canonico;
- First click tie-breaker;
- Operational Tracking da T-120 fino a CompleteOperationalService;
- T-15 pickup presence;
- Ranking explainable;
- Optional post-service geolocation (no penalità se rifiutata);
- Bidirectional Verified Feedback Customer ↔ Driver;
- Tip separata da Rating/Reputation/Assignment Score;
- Customer live tracking;
- OWNER_OPERATED come modello operativo iniziale;
- No WhatsApp as operational SoT;
- Recovery inside platform;
- Phase 2 = distribuzione controllata estesa; Marketplace aperto = Deferred.

## 235. Decisioni OPEN

Durata Candidate Window; raggio iniziale; regole espansione; formula Assignment Score; pesi; soglia parità sostanziale; priorità B2B vs B2C; compenso dinamico; auto-select eligibility; geofence radius; **location ping frequency**; **retention LocationPing / GPS**; customer tracking start; AI/Maps/Flight provider; Realtime/Queue/Scheduler technology; fatigue detection; protected calling; dispute recovery; parametri di candidate visibility cross-company in distribuzione controllata Phase 2; soglie Journey Health; policy operativa esatta su geo/consenso mancante (oltre Alert obbligatorio).

**Nessuna decisione OPEN è chiusa in questo documento.** Il Marketplace aperto resta Deferred (non è una chiusura di OPEN parametrica Phase 2).

## 236. Professional Validation

Validazione richiesta da: CTO / Software Architect; Product Architect; Dispatch Operations; NCC Operations; Privacy / GDPR; Security Architect; Data Architect; Legal; Insurance; Employment / labor; transport regulation.

## 237. Implementation Readiness

### READY
Separazione concettuale Booking/Service/Assignment; Permission catalog; Authorization Engine foundation; principi Deny by Default.

### READY WITH OPEN DECISIONS
Hybrid model parametri; T-120/T-15; ranking factors senza formula; Dispatcher confirmation UX.

### DEFERRED
Marketplace aperto tra operatori; autonomous AI assignment; ML ranking; distributed dispatch services.

## 238. Implementation Sequence

1. Service / Assignment separation;  
2. DispatchRequest;  
3. Manual Assignment;  
4. CandidateApplication;  
5. Dispatcher ranking;  
6. Alerts;  
7. Pre-service tracking;  
8. Recovery;  
9. Customer tracking;  
10. Auto-select;  
11. AI assistance.

## 239. Architecture Definition of Done

DoD documentale: sezioni §1–§240 complete; matrici presenti; OPEN esplicite; nessun provider scelto; nessun peso numerico definitivo; Blueprint/EDGF aggiornati; Marketplace aperto Deferred; Phase 2 solo distribuzione controllata estesa; B2C/B2B stesso Engine; Tracking end-to-end e feedback reciproco documentati; OWNER_OPERATED presente.

## 240. Roadmap

Foundation → OWNER_OPERATED Control Tower → Manual + Assisted Dispatch → Tracking/Recovery end-to-end → Auto-select → AI assist → SMALL_TEAM → distribuzione controllata estesa (Phase 2) → SPECIALIZED_OPERATIONS → Deferred (Marketplace aperto e avanzati).

---

## Module Interaction Example

1. Booking Module crea un **Service**;
2. Dispatch Module riceve `ServiceReadyForDispatch`;
3. Eligibility Engine genera i candidati;
4. **ServiceOffer** viene pubblicata;
5. **CandidateApplication** vengono raccolte;
6. Candidate Window viene chiusa;
7. Ranking Engine genera **RankingSnapshot**;
8. Dispatcher conferma il candidato;
9. Assignment Module crea **Assignment**;
10. Notification Module informa gli interessati;
11. Operational Tracking si attiva a **T-120** e resta attivo fino a **CompleteOperationalService**;
12. Customer Tracking viene abilitato nella fase prevista;
13. Analytics aggiorna le projection;
14. AI può produrre **Recommendation**;
15. nessun consumer modifica direttamente Service o Assignment Aggregate;
16. ogni side effect è idempotente e auditabile;
17. feedback reciproco e Tip restano separati da Assignment Score.

---

## Cronologia revisioni

| Versione | Data | Autore | Descrizione modifica | Stato |
|----------|------|--------|----------------------|-------|
| 0.1.1 | 2026-08-01 | Dispatch, Operations & Platform Engineering | Chiariti Operational Tracking end-to-end, feedback reciproco verificato, separazione Phase 2/Marketplace aperto e modello iniziale Owner-Operated. | Draft |
| 0.1.0 | 2026-08-01 | Dispatch, Operations & Platform Engineering | Creazione ex novo del Dispatch & Operations Engine Framework (MC-OS-030): Hybrid Timed Multi-Candidate Dispatch, Eligibility/Ranking/Assignment, tracking T-120/T-15, Journey Health, Recovery, AI boundary, matrici, MVP/Phase2/Deferred, decisioni OPEN. | Draft |

# MyChauffeur OS — AI & Automation Governance Framework

| Campo | Valore |
|-------|--------|
| **Codice documento** | MC-OS-022 |
| **Titolo** | AI & Automation Governance Framework |
| **Versione** | 0.1.0 |
| **Stato** | Draft |
| **Data creazione** | 2026-07-26 |
| **Ultima modifica** | 2026-07-26 |
| **Owner** | AI, Automation & Decision Governance |
| **Autori** | MyChauffeur OS Team |
| **Documenti correlati** | MC-OS-000 · MC-OS-001 · MC-OS-002 · MC-OS-009 · MC-OS-011 · MC-OS-019 · MC-OS-020 · MC-OS-021 · MC-OS-014 · MC-OS-015 · MC-OS-016 · MC-OS-017 · MC-OS-018 · MC-OS-012 · MC-OS-006 · MC-OS-005 · PLATFORM_MAP · HANDOFF |
| **Dipendenze** | System Domain Architecture; Event Catalog; Configuration Framework; BOS; Identity; Compliance-related frameworks |
| **Classificazione** | Official AI Governance Framework — Draft |
| **Documentation Release** | 0.1 (allineamento previsto) |

---

## Avvertenza

Questo documento è la **Source of Truth per AI e automazione** in MyChauffeur OS.

**Non** è: codice, SQL, API definitiva, scelta di provider/modelli AI, consulenza legale definitiva, né tabella di soglie numeriche.

I nomi di Domain, Entity, Event, State, AI Capability, Automation Rule, Decision, Recommendation, Model restano in **inglese**. Il testo normativo è in **italiano**.

---

## Source of Truth

**MC-OS-022** governa dove l’AI può analizzare/suggerire/classificare/automatizzare, dove serve Human Review, cosa è vietato, e come distinguere Recommendation, Decision ed Execution.

- AI Domain (Supporting) → MC-OS-019
- Eventi AI → MC-OS-020
- Config AI → MC-OS-021
- Guardrail economici → MC-OS-017 / BOS

L’AI **non** è Source of Truth operativa e **non** possiede Aggregate operativi.

---

## 1. Scopo

Definire governance di AI e automazione: perimetro di analisi, suggestion, classification, automation; obbligo di Human Review; operazioni vietate; tracciamento Recommendation; separazione Recommendation / Decision / Execution; rischio, fallback, explainability, audit; introduzione progressiva senza perdita di controllo economico, operativo o legale.

## 2. Principi

| ID | Principio |
|----|-----------|
| AIG-01 | Human accountability |
| AIG-02 | Recommendation before automation |
| AIG-03 | Human-in-the-loop by default for high-risk actions |
| AIG-04 | Human-on-the-loop for supervised automation |
| AIG-05 | Human-out-of-the-loop only for low-risk deterministic flows |
| AIG-06 | AI is not a Source of Truth |
| AIG-07 | AI does not own operational aggregates |
| AIG-08 | AI does not modify Ledger directly |
| AIG-09 | AI does not override RBAC |
| AIG-10 | AI does not bypass Configuration |
| AIG-11 | AI does not bypass Margin Guardrails |
| AIG-12 | AI does not bypass Compliance |
| AIG-13 | AI does not create legal obligations autonomously |
| AIG-14 | AI does not disclose protected customer data |
| AIG-15 | Explainability proportional to risk |
| AIG-16 | Confidence is not authority |
| AIG-17 | Auditability |
| AIG-18 | Traceability |
| AIG-19 | Reproducibility where technically possible |
| AIG-20 | Data minimization |
| AIG-21 | Privacy by design |
| AIG-22 | Security by design |
| AIG-23 | Bias monitoring |
| AIG-24 | Drift monitoring |
| AIG-25 | Model versioning |
| AIG-26 | Prompt versioning |
| AIG-27 | Recommendation versioning |
| AIG-28 | Deterministic fallback |
| AIG-29 | Safe failure |
| AIG-30 | Kill switch |
| AIG-31 | Manual override |
| AIG-32 | Separation of training data and operational data |
| AIG-33 | No uncontrolled self-learning in production |
| AIG-34 | No autonomous financial commitment |
| AIG-35 | No irreversible action without authorized rule |
| AIG-36 | Automation must improve Contribution Margin, service quality or operational capacity |

## 3. AI Governance Scope

In ambito: Recommendation, Classification, Prediction, Generative Output assistito, Fraud/Risk signals, ranking, summarization, triage, explainability records, evaluation, kill switch.

Fuori ambito: ownership di Booking/Trip/Settlement Aggregate; scrittura Ledger; grant Permission; scelta provider; consulenza legale EU AI Act definitiva.

## 4. Automation Governance Scope

In ambito: Automation Rule deterministiche, Supervised/Conditional Automation entro Configuration e Policy, process automation reversibile a basso rischio.

Distinzione: **AI** = output probabilistico; **Automation Rule** = regola deterministica configurata. Possono collaborare via Decision Engine, restando concetti separati.

## 5. AI Capability Model

Capability tipiche: Observe, Classify, Recommend, Rank, Predict, Summarize, Draft, DetectAnomaly, DetectFraudSignal, Explain. Ogni Capability dichiara Autonomy Level massimo ammesso e Risk Class.

## 6. AI Entity Model concettuale

| Entità | Ruolo |
|--------|-------|
| **AICapability** | Funzione generale disponibile |
| **AIModelReference** | Riferimento a modello (senza vendor lock nel doc) |
| **AIModelVersion** | Versione modello |
| **PromptTemplate** | Istruzione versionata |
| **PromptVersion** | Versione prompt |
| **Recommendation** | Suggerimento non ancora applicato |
| **RecommendationEvidence** | Evidenze a supporto |
| **RecommendationDecision** | Collegamento Recommendation→Decision |
| **AutomationRule** | Regola deterministica |
| **AutomationPolicy** | Policy di automazione |
| **AutomationExecution** | Esecuzione regola |
| **HumanReview** | Review umana |
| **HumanOverride** | Override umano |
| **ConfidenceAssessment** | Confidence (non authority) |
| **RiskAssessment** | Risk Score separato |
| **FraudSignal** | Segnale da investigare ≠ frode provata |
| **ExplainabilityRecord** | Explainability |
| **ModelEvaluation** | Valutazione qualità |
| **ModelIncident** | Incidente modello |
| **ModelDriftAlert** | Drift |
| **BiasAssessment** | Bias |
| **AIConfiguration** | Config (MC-OS-021) |
| **AIUsageLog** | Uso/costi |
| **AIDataAccessLog** | Accesso dati |
| **AIKillSwitch** | Kill switch |
| **AIApprovalPolicy** | Policy approvazione |
| **AIRestriction** | Restriction/prohibitions |
| **AIExperiment** | Experiment controllato |
| **AIRelease** | Release capability |
| **AIProviderAdapter** | Adapter astratto (provider OPEN) |

Non è schema SQL.

## 7. AI Roles and Responsibilities

| Ruolo | Responsabilità |
|-------|----------------|
| AI Governance Owner | Framework, risk classes, prohibitions |
| Domain Owner | Use case nel proprio domain |
| Decision Engine Owner | Integrazione regole/config |
| Human Reviewer | Approve/reject high-risk |
| Security/Compliance | Threats, privacy, legal readiness |
| Platform Engineering | Adapter, observability, kill switch |

## 8. Human Accountability

Ogni Decision ad alto rischio ha un Actor umano o una Automation Rule esplicitamente autorizzata e auditata. L’AI non è accountable party.

## 9. AI Ownership

L’AI Domain possiede solo entità AI (Recommendation, Model refs, logs). Non possiede Booking, Assignment, Settlement, Payment, Ledger.

## 10. Data Ownership

I dati restano dei Domain proprietari (MC-OS-019). L’AI accede via query/eventi autorizzati con minimization; non diventa SoT dei dati.

## 11. Recommendation Lifecycle

`REQUESTED → PROCESSING → GENERATED → VALIDATION_PENDING → VALIDATED | REJECTED`
Rami: `HUMAN_REVIEW_REQUIRED → APPROVED → APPLIED` · `EXPIRED` · `SUPERSEDED` · `FAILED` · `ARCHIVED`

State machine **separata** da Automation Lifecycle.

## 12. Automation Lifecycle

`DRAFT → VALIDATION_PENDING → VALIDATED → UNDER_REVIEW → APPROVED → SCHEDULED → ACTIVE`
Rami: `PAUSED` · `DISABLED` · `FAILED` · `ROLLED_BACK` · `EXPIRED` · `ARCHIVED`

Separata dalla Recommendation State Machine e dalla Configuration SM (MC-OS-021).

## 13. Human-in-the-loop

Default per HIGH/CRITICAL: nessuna Execution senza Human Review/Approval nel momento della decisione.

## 14. Human-on-the-loop

Supervised Automation: Execution automatica entro regole, con monitoraggio umano, alert e possibilità di intervento/pause.

## 15. Human-out-of-the-loop

Solo flussi **LOW** risk, deterministicamente configurati, reversibili o a basso impatto, con kill switch e audit. Nessuna autonomia illimitata.

## 16. Risk Classification

Classi: `LOW` · `MODERATE` · `HIGH` · `CRITICAL`.
Mapping Use Case→classe via policy; **nessuna soglia numerica definitiva** di confidence in questo draft.

## 17. Allowed AI Actions

Analizzare eventi; classificare ticket/request; generare Recommendation; rank candidati; predire delay/acceptance (signal); riassumere evidence; draft risposte non inviate; anomaly/fraud **signals**; margin risk **alerts**; explainability records.

## 18. Restricted AI Actions

Assist/prefill azioni (LEVEL 3); supervised automation reversibile; generative communication verso Customer solo con policy/Human Review se sensibile; pricing recommendation entro guardrail.

## 19. Prohibited AI Actions

Vietato all’AI (autonomo o “nascosto”):

- modificare Ledger direttamente;
- autorizzare Payout irreversibile;
- emettere fatture fiscali definitive;
- sospendere definitivamente un Partner;
- approvare KYC/KYB senza regole validate;
- concedere permessi / modificare RBAC;
- rivelare dati cliente prima della Progressive Disclosure policy;
- accettare clausole contrattuali;
- chiudere dispute complesse senza autorizzazione;
- cancellare dati;
- modificare Configuration sensibili;
- superare Maximum Assignment Budget;
- applicare prezzi sotto Minimum Margin Guardrail;
- creare discriminazioni basate su attributi protetti;
- creare obblighi legali/fiscali/contrattuali autonomamente;
- commitment finanziario autonomo irreversibile.

## 20. AI Decision Boundary

AI produce Recommendation/Signal. Decision = regola deterministica autorizzata **oppure** Actor umano. Execution = Domain owner applica Command sul proprio Aggregate.

## 21. Deterministic Rule Boundary

Automation Rule e Configuration (MC-OS-021) hanno priorità sui suggerimenti AI in caso di conflitto con guardrail. Confidence non overridea regole.

## 22. Configuration Integration

Autonomy level, AI enabled, recommendation-only, human approval required, restricted domains, prohibited automatic actions, model/prompt version allowlist: keys MC-OS-021 (`ai.*`).

## 23. Event Architecture Integration

Eventi AI da MC-OS-020; Recommendation Accepted non crea Assignment — innesca Decision/Command nel Domain owner.

## 24. Domain Architecture Integration

AI = Supporting Domain (MC-OS-019). Dipende da Identity/Configuration; consuma eventi; non scrive Aggregate altrui.

## 25. Identity and Permission Boundary

Accesso AI soggetto a RBAC/Capability (MC-OS-015). AI non elevate privilege. Data access logged.

## 26. Audit Trail

Registrare separatamente: Recommendation (con model/prompt version), Decision, Execution, HumanReview, Override, KillSwitch. Append-only.

## 27. Explainability

ExplainabilityRecord proporzionale al rischio. HIGH/CRITICAL: motivazione e fattori principali obbligatori dove tecnicamente possibile.

## 28. Confidence Management

Confidence Score = indicatore tecnico. Non è verità, qualità garantita né autorizzazione. Soglie **OPEN**.

## 29. Uncertainty Management

Bassa confidence / alta uncertainty → Human Review o fallback deterministico; evento `ModelDecisionBlocked` se auto-apply impedito.

## 30. Fallback

Fallback deterministico obbligatorio: regole Configuration, coda umana, o no-op sicuro. Mai “best effort” finanziario.

## 31. Safe Failure

In errore modello/provider: fail-safe (deny auto-action), alert, non degradare guardrail.

## 32. Kill Switch

`AIKillSwitch` disabilita capability/use case/global AI. Audit + alert `kill_switch_activated`.

## 33. Manual Override

HumanOverride documentato: motivo, actor, recommendation id. Non silenzioso.

## 34. AI Data Access

Solo dati necessari allo Use Case; purpose-bound; AIDataAccessLog per PII/SENSITIVE.

## 35. Data Minimization

No dump Customer Price a contesti non autorizzati; no training su dati non consentiti.

## 36. PII Handling

Classi allineate Event Catalog; masking/pseudonymization preferiti nei prompt; divieto disclosure anticipata.

## 37. Sensitive Data Restrictions

Payment secrets, credentials, raw ID docs dove non necessari: vietati nei prompt. Settlement/holdback reason access controllato.

## 38. Data Retention

Retention Recommendation/logs/prompts **OPEN** (legal/privacy).

## 39. Training Data Boundary

Training/fine-tuning separati da produzione. Uso dati cliente per miglioramento modelli: **OPEN** + privacy validation. No uncontrolled self-learning in prod.

## 40. Production Data Boundary

Runtime usa operational data in read-minimized mode; non riscrive SoT domain.

## 41. Prompt Governance

PromptTemplate ownership, review, allowlist versioni; no prompt ad-hoc non tracciati per HIGH/CRITICAL.

## 42. Prompt Versioning

Ogni output rilevante cita `prompt_version`. Breaking change = nuova version + evaluation.

## 43. Model Versioning

`model_version` obbligatoria su Recommendation. Unapproved version → block + alert.

## 44. Recommendation Versioning

Recommendation immutabile dopo GENERATED; aggiornamenti = nuova version SUPERSEDED precedente.

## 45. Evaluation

ModelEvaluation offline/online: qualità, safety, bias, cost. Gate prima di ACTIVE automation.

## 46. Accuracy and Quality Metrics

Acceptance/rejection, false positive/negative su signals, review rate — soglie target **OPEN**.

## 47. Bias Monitoring

BiasAssessment su ranking/partner/customer outcomes; attributi protetti non usati come feature discriminatorie.

## 48. Drift Monitoring

ModelDriftAlert su input/output distribution; risposta: pause, review, rollback version.

## 49. Hallucination Risk

Generative Output non è fatto operativo. Draft sensibili → Human Review. Retrieval claims devono citare evidence refs dove possibile.

## 50. Security Threats

Prompt injection, data exfiltration, model abuse, adversarial inputs, supply-chain provider — controlli + alerts.

## 51. Prompt Injection

Sanitize/isolate untrusted content; least privilege tool access; alert `prompt_injection_suspected`.

## 52. Data Exfiltration

Block exfil via prompt/tools; DLP-like checks concettuali; alert `data_exfiltration_suspected`.

## 53. Model Abuse

Rate limit, purpose restriction, abuse monitoring.

## 54. Fraudulent Input

Input fraudolenti possono generare FraudSignal; non auto-condanna.

## 55. Rate and Cost Controls

Budget/rate concettuali per capability; ceiling **OPEN**.

## 56. AI Cost Attribution

AIUsageLog attribuisce costo a booking/case/tenant dove possibile. AI cost misurabile (principio approvato).

## 57. AI Contribution Margin Impact

Automazione giustificata se migliora CM, qualità servizio o capacità ops (AIG-36). Misura via Analytics, non vanity metrics.

## 58. Booking AI Use Cases

Request classification; data completeness check; booking summary; anomaly detection; duplicate request detection; customer intent extraction. Autonomy tipica LEVEL 1–2.

## 59. Pricing AI Use Cases

Price recommendation; demand signal; margin risk alert; route anomaly; surcharge recommendation; competitor signal input.

**AI non può superare Pricing Guardrail** (max budget / min margin).

## 60. Dispatch AI Use Cases

Assignment recommendation; candidate ranking; recovery recommendation; predicted acceptance; predicted delay; capacity forecast. Assignment creato solo da Dispatch/Booking Domain.

## 61. Marketplace AI Use Cases

Listing quality check; matching recommendation; counteroffer recommendation; disintermediation risk signal; fraud signal; partner suitability. Disclosure resta policy Exchange.

## 62. Partner AI Use Cases

Document completeness hints; score explanation assist; risk flags for review — no definitive suspension.

## 63. Customer Experience AI Use Cases

FAQ assist; journey summarization; preference suggestions — no absolute service guarantees; sensitive comms may need Human Review.

## 64. Support AI Use Cases

Ticket classification; response drafting; urgency detection; evidence summary; dispute triage; escalation recommendation.

Comunicazioni sensibili possono richiedere Human Review.

## 65. Finance AI Use Cases

Anomaly detection su revenue components; reconciliation mismatch hints — no Ledger write, no fiscal definitive invoice issue.

## 66. Settlement AI Use Cases

Eligibility hints; evidence completeness; holdback reason drafting assist — no irreversible payout authorization by AI.

## 67. Fraud AI Use Cases

FraudSignal generation; pattern alerts — signal ≠ proven fraud.

## 68. Risk AI Use Cases

RiskPredictionGenerated; risk scoring assist for review queues.

## 69. Compliance AI Use Cases

Checklist assist; expiry detection support — KYC/KYB approval not autonomous without validated rules + authority.

## 70. Document AI Use Cases

OCR/classify assist; evidence summary — not legal certification.

## 71. Notification AI Use Cases

Tone/locale assist for drafts; channel suggestion — provider choice not in AI; send via Notification Domain.

## 72. Analytics AI Use Cases

Insight narratives on projections — Analytics remains non-write SoT.

## 73. Corporate AI Use Cases

Policy fit suggestions for bookers; travel policy anomaly flags — no silent policy override.

## 74. International AI Use Cases

Locale/language assist; country rule reminder — Local Law Schedule governance OPEN; no legal advice as fact.

## 75. Recommendation Priority

Priority in coda review: CRITICAL > HIGH > MODERATE > LOW; kill/safety first.

## 76. Recommendation Expiration

Recommendation può scadere (`EXPIRED`); non applicabile dopo expiry. Durate **OPEN**.

## 77. Recommendation Approval

Approval umana o Automation Rule autorizzata → Decision record → poi Execution nel domain owner.

## 78. Recommendation Rejection

Rejection motivata; feedback per evaluation; non auto-retrain in prod.

## 79. Recommendation Application

Application = Command del Domain owner. AI non muta Aggregate.

## 80. Recommendation Feedback

Feedback strutturato (accepted/rejected/edited) per ModelEvaluation.

## 81. Learning Feedback Boundary

Il feedback **non** aggiorna automaticamente il modello in produzione. Retrain/fine-tune solo con release governata.

## 82. AI Events

Eventi MC-OS-020 (obbligatori da usare):

- `AI.RecommendationRequested`
- `AI.RecommendationGenerated`
- `AI.RecommendationAccepted`
- `AI.RecommendationRejected`
- `AI.ModelDecisionBlocked`
- `AI.HumanReviewRequested`
- `AI.RiskPredictionGenerated`
- `AI.PriceRecommendationGenerated`
- `AI.AssignmentRecommendationGenerated`
- `AI.SupportTriageSuggested`
- `AI.FraudSignalGenerated`

**PROPOSED** (non alterano MC-OS-020 finché non catalogati): `AI.KillSwitchActivated`, `AI.ModelDriftDetected`, `AI.BiasSignalDetected`, `AI.RecommendationExpired`, `AI.HumanOverrideApplied`.

## 83. AI Permission Matrix

| Azione | AI System | Human Reviewer | Domain Owner | Platform Admin |
|--------|-----------|----------------|--------------|----------------|
| Generate Recommendation | Y | — | config | config |
| Approve high-risk | N | Y | Y | Y |
| Execute Assignment command | N | via Dispatch UI | Dispatch | override audit |
| Modify Ledger | N | N | Finance only | break-glass |
| Enable kill switch | N | — | — | Y |

## 84. AI Risk Matrix

| Risk | Esempi | Autonomy max tipica |
|------|--------|---------------------|
| LOW | summary interno, classify | LEVEL 4–5 se config |
| MODERATE | ranking assignment | LEVEL 2–3 |
| HIGH | pricing change, disclosure | LEVEL 2 |
| CRITICAL | payout, suspend, delete data | LEVEL 0–1 observe/recommend only |

## 85. AI Use Case Matrix

| Domain | Use cases | Guardrail |
|--------|-----------|-----------|
| Booking | §58 | No state forge |
| Pricing | §59 | Margin/budget |
| Dispatch | §60 | Owner creates Assignment |
| Marketplace | §61 | Disclosure policy |
| Support | §64 | Human Review sensibile |
| Finance/Settlement | §65–66 | No ledger/payout |

## 86. Human Review Matrix

| Trigger | Review required |
|---------|-----------------|
| HIGH/CRITICAL recommendation apply | Y |
| Generative customer-sensitive message | Y (default) |
| LOW deterministic automation | N se policy |
| Prohibited action attempt | Block + review/security |

## 87. Prohibited Action Matrix

Vedi §19. Qualsiasi tentativo → `ModelDecisionBlocked` + alert `prohibited_action_attempted`.

## 88. Data Classification Matrix

| Classe | Uso AI |
|--------|--------|
| NONE/MIN | Preferito |
| PSEUDO | OK con log |
| SENSITIVE | Least privilege + access log; disclosure policy |
| Secrets | Vietati nei prompt |

## 89. Model Evaluation Matrix

| Gate | Prima di |
|------|----------|
| Offline quality/safety | Release |
| Bias check | Ranking use cases |
| Cost estimate | Wide rollout |
| Kill switch test | Any ACTIVE automation |

## 90. AI Event Matrix

| Event | Meaning |
|-------|---------|
| RecommendationGenerated | Fact: suggestion exists |
| RecommendationAccepted | Acceptance ≠ Execution complete |
| ModelDecisionBlocked | Guardrail blocked auto-apply |
| FraudSignalGenerated | Investigate |

## 91. AI Cost Matrix

| Dimensione | Note |
|------------|------|
| Cost per booking | Misurabile |
| Cost per support case | Misurabile |
| Ceiling | OPEN |

## 92. AI Configuration Matrix

Keys tipiche MC-OS-021: `ai.*.enabled`, `recommendation_only`, `human_approval_required`, `confidence` placeholders, `prohibited_automatic_actions`, `model_version_allowlist`, `kill_switch`.

## 93. AI Validation Matrix

| Validazione | Owner |
|-------------|-------|
| Privacy/GDPR | Privacy counsel |
| EU AI Act readiness | Legal AI counsel |
| Security | Security |
| Economic guardrail | Pricing/Finance |
| Transport regulation | Transport counsel |

## 94. AI Incident Management

ModelIncident con severity (**modello severity OPEN**), containment via kill switch, post-review obbligatorio per HIGH+.

## 95. AI Incident State Machine

`DETECTED → TRIAGE → CONTAINED → UNDER_INVESTIGATION → MITIGATED → RESOLVED → POST_REVIEW → CLOSED`

## 96. AI Observability

Latency, error rate, fallback rate, cost, acceptance, drift, bias signals, blocked decisions.

## 97. AI Logging

Structured logs: recommendation_id, model_version, prompt_version, actor, risk_class, data_classification. No secrets; PII minimized.

## 98. Alerts

`low_confidence_recommendation`; `high_risk_recommendation`; `prohibited_action_attempted`; `human_review_overdue`; `model_drift_detected`; `bias_signal_detected`; `unusual_ai_cost`; `prompt_injection_suspected`; `data_exfiltration_suspected`; `repeated_recommendation_rejection`; `model_error_spike`; `fallback_rate_high`; `kill_switch_activated`; `unapproved_model_version`; `unapproved_prompt_version`.

## 99. KPI

recommendation acceptance/rejection rate; human review rate; automation success/rollback rate; false positive/negative rate; AI cost per booking; AI cost per resolved support case; AI contribution margin impact; time saved; recovery improvement; pricing margin improvement; dispatch acceptance improvement; escalation reduction; incident rate; fallback rate; model drift rate.

## 100. Decision Engine Integration

Decision Engine valuta Configuration + Automation Rule + Recommendation + deterministic guardrails. Ordine: prohibitions → compliance/RBAC → margin/budget → autonomy level → human/auto path.

## 101. Configuration Engine Integration

Resolve `ai.*` via MC-OS-021; unapproved versions blocked; emergency config for kill switch.

## 102. Event Catalog Integration

Solo eventi catalogati MC-OS-020 per contratti pubblici; PROPOSED listati in §82 fino a sync catalogo.

## 103. API Boundary concettuale

Capability: request recommendation, get status, submit review, apply decision command to owner domain, activate kill switch. **Nessun endpoint REST definitivo**.

## 104. Database Boundary concettuale

Store privato AI Domain per Recommendation/logs. **Nessuno SQL**. Nessuna ownership tabelle Booking/Settlement.

## 105. Provider Abstraction

`AIProviderAdapter` astrae vendor. **Nessun provider scelto** in questo documento.

## 106. Multi-model Strategy

Routing multi-model concettuale possibile; strategia concreta **OPEN**.

## 107. Model Fallback

Fallback a modello secondario allowlisted **oppure** a regola deterministica / human queue.

## 108. Country and Legal Configuration

Country gates su AI use cases; Local Law Schedule refs; nessun consiglio legale come fatto automatico.

## 109. EU AI Act Readiness

Requisito di readiness: classificare Use Case, documentare rischio, human oversight, logging, transparency dove applicabile.

**Non** costituisce consulenza legale definitiva; classification per Use Case **OPEN** (validazione legale).

## 110. Privacy and GDPR Readiness

Base giuridica, minimization, access logs, retention OPEN, divieto training non autorizzato su PII. Validazione privacy counsel.

## 111. Decisioni approvate

| ID | Decisione |
|----|-----------|
| AIG-DA-01 | AI è Supporting Domain |
| AIG-DA-02 | AI non possiede Aggregate operativi |
| AIG-DA-03 | Recommendation ≠ Decision ≠ Execution |
| AIG-DA-04 | AI non modifica Ledger |
| AIG-DA-05 | AI non supera RBAC / Configuration / Margin Guardrail / Compliance |
| AIG-DA-06 | Human Review per high-risk |
| AIG-DA-07 | Recommendation versionata e auditabile; model+prompt version su output rilevanti |
| AIG-DA-08 | Fallback deterministico + kill switch obbligatori |
| AIG-DA-09 | Nessun provider hardcoded |
| AIG-DA-10 | AI cost misurabile; valore CM/ops verificabile |
| AIG-DA-11 | Nessun aggiornamento automatico incontrollato del modello in produzione |
| AIG-DA-12 | Confidence ≠ authority; FraudSignal ≠ frode provata |

## 112. Decisioni OPEN

Provider AI/model; hosting; data residency; fine-tuning; RAG; vector DB; prompt management tech; evaluation platform; observability provider; confidence thresholds; autonomy level per Use Case; approval model; retention; training data policy dettagliata; uso dati cliente per miglioramento; multi-model routing; cost ceiling; real-time vs batch; on-device vs cloud; explainability method; incident severity model; legal classification sistemi; EU AI Act classification per Use Case; policy generative customer communication.

## 113. Validazioni professionali

| Professionista | Ambito |
|----------------|--------|
| Avvocato privacy/GDPR | Dati, retention, training |
| Avvocato contrattuale | Obblighi, dispute, Partner |
| Consulente EU AI Act | Classification readiness |
| Consulente sicurezza | Injection, exfil, abuse |
| Consulente normativa trasporto | Use case country |
| Fiscalista | Divieti fiscali AI |
| Commercialista | Invoice/accounting boundary |
| Consulente PSD2/PSP | Payment boundary |
| Esperto AI Governance | Framework operativo |

## 114. Roadmap

1. **AI Governance Foundation** — entities, prohibitions, events, kill switch
2. **Recommendation-only** — LEVEL 1–2
3. **Supervised Automation** — LEVEL 4 low-risk
4. **Low-risk Automation** — LEVEL 5 conditional
5. **Advanced Decision Support** — richer explainability/evaluation
6. **International AI Governance** — country/legal gates
7. **Continuous Monitoring** — drift/bias/cost/incident loop

---

## AI Autonomy Levels

| Level | Nome | Descrizione |
|-------|------|-------------|
| **LEVEL 0** | DISABLED | Nessun uso AI |
| **LEVEL 1** | OBSERVE | Analisi senza Recommendation operativa |
| **LEVEL 2** | RECOMMEND | Produce Recommendation; applicazione umana |
| **LEVEL 3** | ASSIST | Precompila/prepara azione; conferma umana obbligatoria |
| **LEVEL 4** | SUPERVISED_AUTOMATION | Esegue azioni reversibili entro regole; monitoraggio umano |
| **LEVEL 5** | CONDITIONAL_AUTOMATION | Esegue azioni a basso rischio entro Configuration e Policy approvate |

**Non esiste** un livello di autonomia illimitata.

---

## AI Decision Example

Esempio concettuale (Dispatch):

1. Evento `Dispatch.AssignmentRequested`
2. Decision Engine richiede una Recommendation
3. AI produce `AI.AssignmentRecommendationGenerated`
4. Recommendation include candidati, motivazione, confidence e risk
5. Configuration determina Autonomy Level
6. Margin Guardrail e Compliance verificati **deterministicamente**
7. Actor umano approva **oppure** Automation Rule autorizzata applica
8. **Dispatch Domain** crea l’`Assignment` (Command owner)
9. Audit registra Recommendation, Decision ed Execution **separatamente**

L’AI **non** crea direttamente l’Assignment Aggregate.

---

## Distinzioni obbligatorie (riepilogo)

| Concetto | Non equivale a |
|----------|----------------|
| Recommendation | Decision / Execution |
| Automation Rule | AI Model |
| Confidence Score | Authority |
| Risk Score | Approval |
| Fraud Signal | Frode provata |
| Prediction | Fatto avvenuto |
| Generative Output | Source of Truth |
| Autonomous Action | Illimited autonomy |

---

## Cronologia revisioni

| Versione | Data | Autore | Descrizione modifica | Stato |
|----------|------|--------|----------------------|-------|
| 0.1.0 | 2026-07-26 | MyChauffeur OS Team | Prima stesura AI & Automation Governance Framework. | Draft |

---

*Fine MC-OS-022 v0.1.0 — Draft.*

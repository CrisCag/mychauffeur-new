# MyChauffeur OS — Configuration & Feature Management Framework

| Campo | Valore |
|-------|--------|
| **Codice documento** | MC-OS-021 |
| **Titolo** | Configuration & Feature Management Framework |
| **Versione** | 0.1.0 |
| **Stato** | Draft |
| **Data creazione** | 2026-07-26 |
| **Ultima modifica** | 2026-07-26 |
| **Owner** | Platform Configuration & Product Governance |
| **Autori** | MyChauffeur OS Team |
| **Documenti correlati** | MC-OS-000 · MC-OS-001 · MC-OS-002 · MC-OS-009 · MC-OS-011 · MC-OS-012 · MC-OS-014 · MC-OS-015 · MC-OS-016 · MC-OS-017 · MC-OS-018 · MC-OS-019 · MC-OS-020 · MC-OS-005 · MC-OS-006 · MC-OS-003 · PLATFORM_MAP · HANDOFF |
| **Dipendenze** | System Domain Architecture; System Event Catalog; framework di dominio; BOS; Glossario |
| **Classificazione** | Official Platform Framework — Draft |
| **Documentation Release** | 0.1 (allineamento previsto) |

---

## Avvertenza

Questo documento è la **Source of Truth della configurazione dinamica** di MyChauffeur OS.

**Non** è: codice, SQL, migration, API definitiva, scelta di provider, secrets store, né tabella di valori numerici/fiscali.

I nomi di Domain, Entity, Aggregate, Configuration Key, Feature Flag, Event, State, Scope restano in **inglese**. Il testo normativo è in **italiano**.

---

## Source of Truth

**MC-OS-021** governa Configuration, Feature Flags, Runtime Rules, override, versioning, approval, rollback e precedence.

- Domini software → MC-OS-019 (Configuration Domain)
- Eventi → MC-OS-020 (`Configuration.*`, `FeatureFlag*`)
- Regole economiche → MC-OS-017 / MC-OS-006 (valori OPEN)
- Identity/Permission → MC-OS-015 (config non concede accessi illegittimi)

---

## 1. Scopo

Impedire che regole di business, soglie, policy territoriali, comportamenti finanziari, feature e override per tenant/Paese siano **hardcoded**.

Disciplinare Configuration, Feature Flags, Runtime Rules, override, Country/Region rules, Environment Configuration, versioning, approval, rollback, audit, effective dating, conflict resolution e precedence.

## 2. Principi

| ID | Principio |
|----|-----------|
| CFG-01 | Configuration over hardcoding |
| CFG-02 | Secure defaults |
| CFG-03 | Deny by default |
| CFG-04 | Least privilege |
| CFG-05 | Explicit scope |
| CFG-06 | Explicit ownership |
| CFG-07 | Versioned configuration |
| CFG-08 | Immutable published versions |
| CFG-09 | Draft before activation |
| CFG-10 | Approval before sensitive activation |
| CFG-11 | Effective dating |
| CFG-12 | Rollback readiness |
| CFG-13 | Auditability |
| CFG-14 | Traceability |
| CFG-15 | Tenant isolation |
| CFG-16 | Country localization |
| CFG-17 | Environment separation |
| CFG-18 | No secrets in business configuration |
| CFG-19 | No fiscal rule without validation |
| CFG-20 | No silent override |
| CFG-21 | Deterministic precedence |
| CFG-22 | Fail-safe behavior |
| CFG-23 | Backward compatibility |
| CFG-24 | Schema validation |
| CFG-25 | Configuration testing |
| CFG-26 | Change impact visibility |
| CFG-27 | Separation of configuration and operational data |
| CFG-28 | Separation of feature flags and business rules |
| CFG-29 | Separation of configuration and authorization |

## 3. Ambito della Configuration

**In ambito:** chiavi di comportamento prodotto, policy parametrizzate, soglie Decision/Alert Engine, feature flags, country/tenant overrides, template refs, engine tunables non secret.

**Fuori ambito:** secrets/credenziali; dati operativi (Booking, Trip); Permission grants; contenuti fiscali definitivi non validati; hardcode in codice applicativo.

## 4. Configuration Domains

Domini di configurazione (allineati ai Bounded Context MC-OS-019): Identity, Customer, Booking, Marketplace, Partner, Dispatch, Fleet, Pricing, Finance, Settlement, Payment, Notification, Support, Compliance, Configuration (meta), Analytics, AI, Document, Media, Integration, Administration, più Country/Local Law e Platform System.

## 5. Configuration Entity Model concettuale

| Entità | Ruolo |
|--------|-------|
| **ConfigurationDefinition** | Definisce una key, schema, ownership, scopes ammessi |
| **ConfigurationKey** | Identificatore canonico (`domain.module.setting`) |
| **ConfigurationValue** | Valore tipizzato in uno scope |
| **ConfigurationVersion** | Versione immutabile una volta pubblicata |
| **ConfigurationScope** | Contesto di applicazione (GLOBAL, TENANT, …) |
| **ConfigurationOverride** | Valore che sovrascrive uno scope superiore |
| **ConfigurationApproval** | Record di approvazione |
| **ConfigurationActivation** | Attivazione con effective date |
| **ConfigurationRollback** | Ripristino a versione precedente |
| **FeatureFlag** | Capability on/off con targeting |
| **FeatureFlagVariant** | Variante experiment/release |
| **FeatureFlagTarget** | Targeting (tenant, %, country, …) |
| **PolicyDefinition** | Policy approvata (legale/ops/commerciale) |
| **PolicyVersion** | Versione policy |
| **ThresholdDefinition** | Soglia Decision/Alert Engine (valore **OPEN**) |
| **CountryRule** | Regola per Paese |
| **RegionRule** | Regola Region/City |
| **TenantRule** | Regola tenant |
| **OrganizationRule** | Regola Organization |
| **EnvironmentRule** | Regola environment |
| **ConfigurationAuditEntry** | Audit append-only |
| **ConfigurationValidationResult** | Esito validazione/conflict |
| **ConfigurationDependency** | Dipendenza tra keys/flags |
| **ConfigurationChangeRequest** | Richiesta di modifica |
| **ConfigurationRelease** | Bundle di versioni pubblicate insieme |

**Non** è schema SQL.

## 6. Configuration Scopes

Scope ammessi: `GLOBAL`, `ENVIRONMENT`, `COUNTRY`, `REGION`, `CITY`, `TENANT`, `ORGANIZATION`, `PARTNER`, `CORPORATE_ACCOUNT`, `CHANNEL`, `SERVICE_CATEGORY`, `VEHICLE_CATEGORY`, `USER`, `ROLE`, `EXPERIMENT`.

Non ogni `ConfigurationKey` supporta tutti gli scope: gli scope ammessi sono dichiarati in `ConfigurationDefinition`.

## 7. Precedence Model

Modello iniziale (**non** decisione irreversibile; raffinabile via ADR):

`GLOBAL → ENVIRONMENT → COUNTRY → REGION → CITY → TENANT → ORGANIZATION → ENTITY-SPECIFIC OVERRIDE`

Regole: override più specifico prevale; override **espliciti**; **nessun** override silenzioso; risoluzione tracciabile; ogni decisione può mostrare keys/versioni/scope applicati.

## 8. Configuration Resolution

Processo: carica definition → raccoglie valori per scope nel contesto richiesta → applica precedence → valida → produce `ResolvedConfiguration` (valore, version, provenance, approver, effective_at) → opzionale audit di risoluzione per decisioni sensibili.

## 9. Configuration Inheritance

Gli scope inferiori ereditano dal superiore se non esiste override. L’eredità non implica mutazione del valore parent. Breaking inheritance richiede override esplicito.

## 10. Configuration Override

`ConfigurationOverride` dichiara scope target, key, version, motivo, approvazione se sensitive. Vietati override impliciti da codice o da “default nascosti”.

## 11. Configuration Conflict Detection

Conflitti tipici: due override stesso scope; tipi incompatibili; dipendenze circolari; flag mutualmente esclusivi; country rule assente con tenant che la richiede. Esito: `INVALID` o alert `configuration_conflict`.

## 12. Configuration Validation

Schema type check, range/enum, required keys, dependency check, permission boundary check, fiscal/legal flag “requires professional validation”, simulation opzionale.

## 13. Configuration Schema

Schema concettuale per key: `data_type`, `unit`, `allowed_scopes`, `default_ref`, `sensitivity`, `owner`, `validators`, `dependencies`. Implementazione schema registry **OPEN**.

## 14. Data Types

`BOOLEAN`, `INTEGER`, `DECIMAL`, `STRING`, `ENUM`, `DATE`, `DATETIME`, `DURATION`, `MONEY`, `PERCENTAGE`, `JSON_OBJECT`, `STRING_LIST`, `NUMBER_RANGE`, `GEO_SCOPE`, `REFERENCE`.

`PERCENTAGE`/`MONEY`/`DURATION` descrivono il tipo — **non** fissano valori in questo documento.

## 15. Default Values

Ogni key ha default fail-safe (secure/deny-oriented dove applicabile). Default GLOBAL documentato; environment può restringere ma non indebolire security defaults senza approval.

## 16. Required Values

Keys marcate `required` devono risolvere a un valore prima di abilitare capability dipendente; altrimenti fail-safe + alert `missing_required_configuration`.

## 17. Nullable Values

Nullable solo se definition lo consente. Null ≠ false per BOOLEAN. Null in MONEY/PERCENTAGE non inventa zero silenzioso in contesti finanziari sensibili.

## 18. Effective Date

`effective_from` obbligatoria in activation. Attivazione futura = `SCHEDULED`. Risoluzione usa tempo di business della richiesta.

## 19. Expiration Date

`effective_to` opzionale. Alla scadenza: `EXPIRED` / fallback a scope superiore o default. Feature Flag e Experiment tipicamente datati.

## 20. Draft Lifecycle

Nuove modifiche nascono in `DRAFT`. Editabili; non influenzano runtime production.

## 21. Review Lifecycle

`UNDER_REVIEW`: peer/product review. Può tornare a `DRAFT` o avanzare.

## 22. Approval Lifecycle

`APPROVED` dopo approval workflow. Sensitive richiede four-eyes (§30). Eventi MC-OS-020 correlati.

## 23. Activation Lifecycle

`SCHEDULED` → `ACTIVE` a effective date. Pubblicazione versione immutabile. Evento `ConfigurationActivated` / `FeatureFlagEnabled`.

## 24. Deactivation Lifecycle

`DEACTIVATED` / `DISABLED` con motivo e audit. Fallback deterministico al valore precedente o default.

## 25. Rollback Lifecycle

`ROLLBACK_PENDING` → `ROLLED_BACK`. Ripristina versione pubblicata precedente. Eventi `ConfigurationRollbackRequested`, `ConfigurationRolledBack`. Automatic rollback **OPEN**.

## 26. Configuration Versioning

Ogni pubblicazione incrementa `ConfigurationVersion`. SemVer o monotonic **OPEN**; immutabilità post-publish obbligatoria.

## 27. Immutable Published Versions

Versioni `ACTIVE`/`SUPERSEDED` non sono edit-in-place. Correzioni = nuova versione.

## 28. Change Request

`ConfigurationChangeRequest`: motivazione, impact preview, keys tocate, requester, risk class.

## 29. Change Approval

Approvatori secondo Sensitivity Matrix. Numero approvatori **OPEN**.

## 30. Four-eyes Principle

Modifiche sensitive (finance, settlement, tax boundary, kill switch, permission-adjacent, privacy retention) richiedono almeno due attori distinti (requester ≠ approver).

## 31. Sensitive Configuration

Include: payout/holdback/reserve, margin/budget guardrail, disclosure timing Exchange, tax flags, retention, AI auto-apply toggles, emergency flags. Sempre audit + approval.

## 32. Secret Management Boundary

Credenziali, API key, password, token, private key **non** appartengono al Configuration Store di business. Vivono in secrets manager dedicato (**provider OPEN**). Config può solo referenziare un `secret_ref` opaco.

## 33. Feature Flag Principles

Flag ≠ Business Rule. Flag controlla availability di capability; rules determinano comportamento economico/operativo. Flag non concede Permission. Kill switch fail-safe.

## 34. Feature Flag Lifecycle

Stati: `DRAFT → UNDER_REVIEW → APPROVED → SCHEDULED → ACTIVE` (+ `PAUSED`, `DISABLED`, `EXPIRED`, `ARCHIVED`).
Vedi anche Feature Flag State Machine dedicata (§ oltre).

## 35. Feature Flag Types

`RELEASE`, `OPERATIONAL`, `EXPERIMENT`, `KILL_SWITCH`, `PERMISSION_GATED`, `COUNTRY_GATED`, `TENANT_GATED`, `PARTNER_TIER_GATED`, `RISK_GATED`.

## 36. Feature Flag Targeting

Target via `FeatureFlagTarget`: environment, country, tenant, organization, partner tier, role, user cohort, experiment bucket. Valutazione deterministica e auditabile.

## 37. Percentage Rollout

Concetto di rollout percentuale / bucketing stabile per soggetto. **Percentuali concrete OPEN** — non fissate qui.

## 38. Canary Release

Attivazione su sottoinsieme (tenant/country/users) prima dell’allargamento. Monitoraggio + kill switch pronti.

## 39. Kill Switch

Flag/config di emergenza per disabilitare capability pericolosa rapidamente, con audit e fail-safe. Non sostituisce incident response.

## 40. Emergency Configuration

Percorso accelerato con audit rafforzato, four-eyes dove possibile, expiry breve, review post-incident. Alert `emergency_flag_active`.

## 41. Business Rule Configuration

Business Rule parametrizzate (cancel windows, matching weights, disclosure offsets). Valori **OPEN**. Distinte da Feature Flag.

## 42. Pricing Configuration

Keys concettuali (esempi naming): `pricing.transfer.*`, vehicle, distance, time, waiting, stops, night/holiday/event surcharge, toll/parking mode, `minimum_margin`, `maximum_assignment_budget`, quote expiration, currency, FX, Partner Exchange fee.

**Nessun valore numerico** in questo draft. Allineamento MC-OS-017 / NCC; fiscalità OPEN.

## 43. Booking Configuration

Origini canale, guest booking enablement, multi-service rules, modification materiality flags. Non fondere stati Booking/Service.

## 44. Service Configuration

Categorie servizio, stop policy, return-trip linking, evidence requirements per completion.

## 45. Assignment Configuration

Mode default INTERNAL/PARTNER (**OPEN** DECISIONS #7), budget enforcement toggle, offer vs manual.

## 46. Dispatch Configuration

Parametri: acceptance timeout; offer strategy; sequential vs parallel offer; fallback; manual escalation; fairness/quality/margin/distance weights.

**Valori OPEN**.

## 47. Marketplace Configuration

Abilitazione marketplace B2B, eligibility gates, listing limits, visibility rules (MC-OS-012).

## 48. Partner Exchange Configuration

Concetti: listing expiration; counteroffer enablement; visibility; geofence threshold; progressive data disclosure; `T_MINUS_12_HOURS`; `T_MINUS_6_HOURS`; last-minute release; commission plan; refund on UNFILLED; matching strategy.

Offset/percentuali **OPEN**; UNFILLED → no platform fee (principio approvato MC-OS-012).

## 49. Customer Configuration

Preferenze default, guest conversion prompts, rating enablement, CX policy refs (MC-OS-018).

## 50. Corporate Configuration

Policy viaggio, approval workflows, billing cycle refs, priority flags (**regole OPEN**).

## 51. B2B Configuration

Net rate presentation, agency tools flags, booker≠passenger enforcement.

## 52. Cancellation Configuration

Windows/penali configurabili — **valori OPEN** (DECISIONS #3). Distinguere Booking vs Service cancel.

## 53. No-show Configuration

Waiting thresholds, evidence requirements, suspected→confirmed flow — valori OPEN.

## 54. Recovery Configuration

Recovery enablement, Exchange republish, cost attribution toggles — no double-count con refund.

## 55. Payment Configuration

Metodi abilitati per canale/country, capture timing flags. **Provider OPEN** (DECISIONS #1). No secrets.

## 56. Settlement Configuration

Concetti: payout frequency; contestation window; auto-approval; reserve; rolling reserve; holdback; minimum payout; payout delay; partner risk tier; evidence requirements.

**Valori e validità giuridica OPEN** (MC-OS-006). Holdback solo con reason+evidence+contestation.

## 57. Finance Configuration

Revenue component flags, invoice orchestration toggles, reconciliation schedules. GBV ≠ Platform Revenue.

## 58. Tax Configuration Boundary

Tax Regime / MoR flags sono **placeholder configurabili**. Regole fiscali definitive richiedono fiscalista e commercialista (**OPEN** + validazione professionale). Nessuna aliquota in questo documento.

## 59. Notification Configuration

enabled channels; fallback order; quiet hours; locale; timezone; retry; escalation; template version; transactional vs promotional.

Provider **OPEN** (DECISIONS #8).

## 60. Support Configuration

Routing, escalation, goodwill guardrail refs, dispute SLA placeholders (**OPEN**).

## 61. Compliance Configuration

KYC/KYB gates, document expiry warning offsets, policy violation thresholds placeholders.

## 62. Retention Configuration

Classi retention per dati/eventi/config history. **Durate OPEN**.

## 63. Privacy Configuration

Consent purposes, minimization profiles, disclosure policies — allineate MC-OS-015/016/012.

## 64. Identity Configuration

Session duration keys, MFA policy flags (**dettaglio OPEN**), invite expiry. No auth secrets.

## 65. Permission Configuration Boundary

Una Configuration **non può** concedere accessi in violazione del Permission Model (MC-OS-015). Flag `PERMISSION_GATED` richiede Capability/Role già legittimi.

## 66. Risk Configuration

Risk signals enablement, review gates — soglie numeriche OPEN.

## 67. Fraud Configuration

Fraud signal routing, block/review modes — no auto-ban senza policy.

## 68. AI Configuration

Concetti: AI enabled/disabled; recommendation-only; human approval required; confidence threshold; explainability required; restricted domains; prohibited automatic actions; model version; fallback behavior.

**Soglie numeriche OPEN**. AI non auto-applica decisioni non autorizzate (MC-OS-019/020).

## 69. Analytics Configuration

Projection enablement, KPI alert toggles. Analytics non è write SoT.

## 70. Country Configuration

Abilitazione paese, locale default, currency default, transport regulatory flags, Local Law Schedule ref.

## 71. Local Law Schedule Configuration

Riferimenti a schedule legali per paese (Partner Framework). Governance dettagliata **OPEN**; contenuti non inventati qui.

## 72. Currency and Locale Configuration

Currency ammesse, locale default, FX policy refs — FX dettagli OPEN (MC-OS-017).

## 73. Timezone Configuration

Timezone default per country/tenant; uso in quiet hours e reminder.

## 74. Multi-language Configuration

Lingue abilitate. Oltre IT/EN: **OPEN** (DECISIONS #9).

## 75. Configuration Cache

Cache concettuale di resolved values per performance. Tecnologia **OPEN**.

## 76. Cache Invalidation

Invalidazione su publish/activate/rollback/flag change. Coerenza eventual vs real-time **OPEN**.

## 77. Configuration Distribution

Propagazione versioni ai runtime (monolith o service). Modello deployment **OPEN**.

## 78. Offline and Failure Behavior

Se config store irraggiungibile: usare last-known-good + fail-safe defaults; alert drift/failure.

## 79. Fail-safe Defaults

In dubbio: deny capability rischiosa; non aprire payout/disclosure; non abbassare margin guardrail automaticamente.

## 80. Configuration Audit Trail

Append-only su create/update/approve/activate/deactivate/rollback/override. Attore, before/after version refs, motivo.

## 81. Configuration Events

Eventi canonici MC-OS-020: `Configuration.ConfigurationCreated`, `ConfigurationUpdated`, `ConfigurationActivated`, `ConfigurationDeactivated`, `ConfigurationVersionPublished`, `ConfigurationRollbackRequested`, `ConfigurationRolledBack`, `FeatureFlagEnabled`, `FeatureFlagDisabled`, `CountryRuleActivated`, `TenantOverrideActivated`.

## 82. Configuration Access Control

Solo ruoli autorizzati (Platform Admin segmentato, Org Owner limitato, Partner limitatissimo). Least privilege. Break-glass auditato.

## 83. Configuration Permission Matrix

| Azione | Platform Admin | Org Owner | Partner Ops | Dispatcher | System |
|--------|----------------|-----------|-------------|------------|--------|
| Read non-sensitive | Y | Y (scope) | limited | limited | Y |
| Draft change | Y | limited | N/limited | N | N |
| Approve sensitive | Y (four-eyes) | N | N | N | N |
| Activate kill switch | Y | N | N | N | emergency runbook |
| Manage secrets | via secrets role | N | N | N | secrets system |

## 84. Configuration Ownership Matrix

| Area | Owner funzionale |
|------|------------------|
| Pricing keys | Pricing, Revenue & Business Ops |
| Settlement keys | Finance Operations |
| Exchange keys | Marketplace & Partner Ops |
| Dispatch keys | Booking, Service & Operations |
| Notification keys | Communications & Customer Ops |
| Identity keys | Identity & Security |
| AI keys | AI & Decision Support + Platform Governance |
| Meta configuration | Platform Configuration & Product Governance |

## 85. Configuration Scope Matrix

| Key family | GLOBAL | COUNTRY | TENANT | ORG | PARTNER |
|------------|--------|---------|--------|-----|---------|
| pricing.* | Y | Y | Y | limited | N (executor price hidden rules) |
| settlement.* | Y | Y | Y | N | limited view |
| marketplace.exchange.* | Y | Y | Y | N | limited |
| notification.* | Y | Y | Y | Y | limited |
| ai.* | Y | Y | Y | N | N |

## 86. Configuration Precedence Matrix

Allineata a §7: più specifico vince; ENTITY-SPECIFIC > ORGANIZATION > TENANT > CITY > REGION > COUNTRY > ENVIRONMENT > GLOBAL.

## 87. Configuration Domain Matrix

Mapping key prefix → Bounded Context owner (pricing→Pricing, settlement→Settlement, marketplace→Marketplace, dispatch→Dispatch, identity→Identity, notification→Notification, ai→AI, compliance→Compliance, …).

## 88. Sensitive Change Matrix

| Classe | Esempi | Four-eyes | Professional validation |
|--------|--------|-----------|-------------------------|
| Financial | payout, holdback, reserve, fees | Y | Legal/Finance se richiesto |
| Tax | tax regime flags | Y | Fiscalista/Commercialista |
| Privacy | retention, disclosure offsets | Y | Privacy counsel |
| Safety/Kill | kill switch, emergency | Y se possibile | Security |
| AI auto-apply | prohibited actions toggle | Y | Product+Security |

## 89. Configuration Testing

Schema validation; rule validation; conflict validation; simulation; impact preview; dry-run; rollback test; tenant isolation test.

## 90. Configuration Simulation

Simula risoluzione per contesto (country/tenant/org/booking sample) senza attivare. Mostra provenance.

## 91. Impact Analysis

Prima di approve: keys impattate, domini, flag dipendenti, risk class, consumer events.

## 92. Observability

Metriche publish/activate/rollback, cache hit, resolution latency, drift detection. Correlazione `configuration_version` nei log decisionali.

## 93. Alert

Alert minimi: `configuration_conflict`, `invalid_configuration`, `missing_required_configuration`, `unsafe_override`, `feature_flag_stale`, `emergency_flag_active`, `rollback_failed`, `configuration_drift`, `country_rule_missing`, `tenant_override_excessive`, `sensitive_change_without_approval`.

## 94. KPI

KPI: active configurations; overrides per tenant; failed validations; rollback rate; stale feature flags; emergency changes; configuration-related incidents; average approval time; configuration drift rate; percentage of hardcoded rules removed.

## 95. Decision Engine Integration

Decision Engine legge solo `ResolvedConfiguration` versionata. Threshold missing → fail-safe + alert. Non bypassa Permission.

## 96. Event Architecture Integration

Publish/activate/rollback emettono eventi MC-OS-020. Consumer (Notification, Analytics) non mutano config store.

## 97. API Boundary concettuale

Capability concettuali: resolve, get version, submit change request, approve, activate, rollback, simulate. **Nessun endpoint REST definitivo** in questo documento.

## 98. Database Boundary concettuale

Persistenza privata del Configuration Domain (MC-OS-019). **Nessuno schema SQL** qui. Separata da operational booking tables e da secrets store.

## 99. Decisioni approvate

| ID | Decisione | Fonte |
|----|-----------|-------|
| CFM-DA-01 | Business rules configurabili, non hardcoded | BOS / Blueprint |
| CFM-DA-02 | Tax regime configurabile; valori fiscali non definitivi senza professionisti | BOS |
| CFM-DA-03 | Multi-country readiness | Partner / BOS |
| CFM-DA-04 | Tenant isolation | MC-OS-015/019 |
| CFM-DA-05 | Progressive Data Disclosure configurabile | MC-OS-012 |
| CFM-DA-06 | Partner Exchange fee configurabile | MC-OS-012 |
| CFM-DA-07 | Payout frequency / contestation / reserve / holdback configurabili | MC-OS-006 |
| CFM-DA-08 | Notification channels configurabili | MC-OS-016 |
| CFM-DA-09 | AI recommendation ≠ decisione eseguita | MC-OS-019/020 |
| CFM-DA-10 | Maximum Assignment Budget e Minimum Margin guardrail configurabili | MC-OS-017 |
| CFM-DA-11 | Versioning + audit obbligatori; published immutable | EDGF principles / questo framework |
| CFM-DA-12 | Nessun override silenzioso; precedence deterministica | Questo framework |
| CFM-DA-13 | Secrets fuori dal business Configuration Store | Security baseline |
| CFM-DA-14 | Config ≠ Permission grant | MC-OS-015 |

## 100. Decisioni OPEN

Storage technology; cache technology; feature flag provider; secrets manager; approval workflow definitivo; numero approvatori; durata cache; rollout percentage; naming definitivo environment; cosa può modificare il tenant; cosa è reserved Platform Admin; cosa possono modificare i Partner; limite massimo override; retention cronologia; schema registry; rollback automatico; emergency access; fiscal rule engine; Local Law Schedule governance; real-time vs eventual propagation; modular monolith vs distributed configuration service; valori numerici di tutte le soglie/fee/timeout.

## 101. Validazioni professionali

| Professionista | Ambito config |
|----------------|---------------|
| Commercialista | Invoice/accounting flags, revenue recognition placeholders |
| Fiscalista | Tax regime, aliquote, MoR |
| Avvocato | Policy legali, Local Law Schedule, holdback/contestation |
| Consulente PSD2/PSP | Payment configuration boundaries |
| Consulente privacy/GDPR | Retention, consent, disclosure |
| Consulente sicurezza | Secrets boundary, emergency, kill switch |
| Consulente normativa trasporto | Country transport regulatory flags / NCC |

## 102. Roadmap

1. **Foundation** — model, scopes, precedence, versioning, audit, events
2. **Booking and Pricing Configuration** — guardrail budget/margin, quote
3. **Marketplace Configuration** — Exchange disclosure/fees/UNFILLED
4. **Finance Configuration** — settlement/payout/holdback params (valori OPEN)
5. **Feature Management** — flags, canary, kill switch
6. **International Configuration** — country/locale/currency/Local Law refs
7. **Advanced Automation** — AI config gates, simulation, drift detection

---

## Configuration Key Naming

**Formato:** `domain.module.setting` (lowercase, dot notation).

Esempi:

- `pricing.transfer.minimum_margin`
- `pricing.vehicle.van.base_rate`
- `dispatch.assignment.acceptance_timeout`
- `marketplace.exchange.listing_expiration`
- `marketplace.exchange.customer_name_release_offset`
- `marketplace.exchange.customer_phone_release_offset`
- `settlement.partner.payout_frequency`
- `settlement.partner.contestation_window`
- `settlement.partner.reserve_percentage`
- `notification.booking.confirmation.email_enabled`
- `identity.session.maximum_duration`
- `compliance.partner.document_expiry_warning_offset`
- `ai.dispatch.recommendation_enabled`

Regole: nessun nome generico; nessun provider specifico salvo adapter; unità nel metadata; scope nel record non nella key; no tenant id nella key; no valori nella key; no duplicazione semantica.

---

## Configuration State Machine

Stati: `DRAFT` · `VALIDATION_PENDING` · `INVALID` · `VALIDATED` · `UNDER_REVIEW` · `APPROVED` · `SCHEDULED` · `ACTIVE` · `SUPERSEDED` · `DEACTIVATED` · `ROLLBACK_PENDING` · `ROLLED_BACK` · `EXPIRED` · `ARCHIVED`

| Transizione | Actor tipico | Evento | Precondizione | Audit | Rollback possibile |
|-------------|--------------|--------|---------------|-------|--------------------|
| → DRAFT | Config Editor | ConfigurationCreated/Updated | Change request | Y | n/a |
| DRAFT → VALIDATION_PENDING | System/Editor | — | Schema submit | Y | — |
| VALIDATION_PENDING → INVALID | System | — | Validation fail | Y | — |
| VALIDATION_PENDING → VALIDATED | System | — | Validation pass | Y | — |
| VALIDATED → UNDER_REVIEW | Editor | — | Submit review | Y | — |
| UNDER_REVIEW → APPROVED | Approver | — | Policy OK / four-eyes se sensitive | Y | — |
| APPROVED → SCHEDULED | Activator | ConfigurationVersionPublished | effective_from futuro | Y | Y (cancel schedule) |
| SCHEDULED/APPROVED → ACTIVE | System/Activator | ConfigurationActivated | effective_from raggiunto | Y | Y |
| ACTIVE → SUPERSEDED | System | ConfigurationVersionPublished | Nuova active | Y | Y via rollback |
| ACTIVE → DEACTIVATED | Admin | ConfigurationDeactivated | Motivo | Y | Y |
| ACTIVE → ROLLBACK_PENDING | Admin | ConfigurationRollbackRequested | Target version exists | Y | in corso |
| ROLLBACK_PENDING → ROLLED_BACK | System | ConfigurationRolledBack | Restore OK | Y | — |
| * → EXPIRED | System | — | effective_to | Y | — |
| * → ARCHIVED | Admin | — | Non più in uso | Y | N tipicamente |

---

## Feature Flag State Machine

**Separata** dalla Configuration State Machine.

Stati: `DRAFT` · `VALIDATED` · `APPROVED` · `SCHEDULED` · `PARTIALLY_ACTIVE` · `ACTIVE` · `PAUSED` · `DISABLED` · `EXPIRED` · `ARCHIVED`

`PARTIALLY_ACTIVE` = canary/percentage rollout. Eventi: `FeatureFlagEnabled`, `FeatureFlagDisabled`.

---

## Configuration Resolution Example

Esempio concettuale (senza dati reali):

1. Legge valore **GLOBAL** della key `dispatch.assignment.acceptance_timeout`
2. Applica **COUNTRY** override (se presente)
3. Applica **TENANT** override (se presente)
4. Applica **ORGANIZATION** override (se presente)
5. Valida tipo/`DURATION` e dipendenze
6. Registra Configuration Resolution (valore, versioni, scope vincenti)
7. Restituisce valore + version + provenance + approver + effective_at

Il sistema deve spiegare: valore applicato; scope di provenienza; versione; override prevalente; chi ha approvato; quando è efficace.

---

## Distinzioni obbligatorie (riepilogo)

| Concetto | Non confondere con |
|----------|-------------------|
| System Configuration | Environment secrets |
| Feature Flag | Business Rule / Policy |
| Threshold | Valore fiscale definitivo |
| Template Configuration | Notification provider |
| Experiment | Permanent policy |
| Secret | ConfigurationValue di business |
| Configuration | Permission / Role grant |
| Configuration | Operational data (Booking/Trip) |

---

## Cronologia revisioni

| Versione | Data | Autore | Descrizione modifica | Stato |
|----------|------|--------|----------------------|-------|
| 0.1.0 | 2026-07-26 | MyChauffeur OS Team | Prima stesura Configuration & Feature Management Framework. | Draft |

---

*Fine MC-OS-021 v0.1.0 — Draft.*

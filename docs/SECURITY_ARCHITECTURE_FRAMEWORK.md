# MyChauffeur OS — Security Architecture Framework

| Campo | Valore |
|-------|--------|
| **Codice documento** | MC-OS-028 |
| **Titolo** | Security Architecture Framework |
| **Versione** | 0.1.0 |
| **Stato** | Draft |
| **Data creazione** | 2026-07-26 |
| **Ultima modifica** | 2026-07-26 |
| **Owner** | Security Architecture & Platform Engineering |
| **Autori** | MyChauffeur OS Team |
| **Documenti correlati** | MC-OS-000 · MC-OS-001 · MC-OS-015 · MC-OS-020 · MC-OS-021 · MC-OS-022 · MC-OS-024 · MC-OS-025 · MC-OS-026 · MC-OS-027 · MC-OS-029 · MC-OS-012 · MC-OS-018 · PLATFORM_MAP · HANDOFF |
| **Dipendenze** | Baseline B001 (MC-OS-025); Identity Roles & Permission (MC-OS-015); Role/Capability/Permission Catalog (MC-OS-029); Software Architecture (MC-OS-026); Data Architecture (MC-OS-027); ADR-009 Active; ADR-OPEN-017 OPEN |
| **Classificazione** | Official Security Architecture Framework — Draft |
| **Baseline di riferimento** | **B001** (MC-OS-025) |
| **Documentation Release** | 0.1 (allineamento previsto) |

---

## Avvertenza

Questo documento è la **Source of Truth della Security Architecture** di MyChauffeur OS.

**Non** contiene: codice, middleware, API, SQL, migration, policy RLS eseguibili, scelta di provider OAuth/MFA/KMS/Secret Manager/WAF/SIEM, né nuovi ADR Active.

I termini tecnici (Identity, Authentication, Authorization, Permission, Policy, Role, Session, Token, Claim, JWT, OAuth, RLS, MFA, Secret, Audit, ecc.) restano in **inglese**. Il testo normativo è in **italiano**.

---

## Source of Truth

**MC-OS-028** governa principi di sicurezza, confini AuthN/AuthZ, isolamento, secret/encryption readiness, audit di sicurezza, protezioni applicative e roadmap security.

- Identity / Role / Permission di dominio (governance Identity) → **MC-OS-015**  
- Catalogo Role / Capability / Permission / Scope / Data Visibility / Matrix MVP / Authorization Decision → **MC-OS-029**  
- Layering / Security Context → **MC-OS-026**  
- PII / AuditLog / Tenant data → **MC-OS-027**  
- Security events → **MC-OS-020**  
- AI threats → **MC-OS-022**  
- Freeze → **MC-OS-025** (B001)  

### Allineamento MC-OS-029

- Authorization **server-side** / Application Layer obbligatoria.
- Operazioni sensibili: audit obbligatorio (membership/role/permission/pricing/finance/platform.*).
- Scope PLATFORM solo tramite Permission `platform.*` esplicite.
- Support Case Scope (`CASE_ASSIGNED`) distinto da ORGANIZATION.
- Data Visibility separata dalla Permission.
- Nessuna wildcard globale; nessun super-admin implicito.

---

## 1. Scopo

Definire la **Source of Truth della Security Architecture** di MyChauffeur OS: principi, Identity/Authentication/Authorization, isolamento Tenant/Organization, Secret/Key/Encryption readiness, Audit di sicurezza, protezioni applicative, Privacy by Design, confini AI/API/Webhook, incident response e roadmap.

Questo documento **non** sostituisce MC-OS-015 (Identity/Roles/Permission di dominio), MC-OS-027 (classificazione dati), MC-OS-022 (AI governance). Li integra sul piano architetturale di sicurezza.

## 2. Relazione con B001, MC-OS-015, MC-OS-026, MC-OS-027

| Documento | Relazione |
|-----------|-----------|
| B001 (MC-OS-025) | Nessuna modifica al comportamento funzionale freeze |
| MC-OS-015 | SoT Identity/Role/Permission/Capability; questo framework ne governa i confini di sicurezza |
| MC-OS-026 | Authorization Boundary, Deny by default in Application, Security Context |
| MC-OS-027 | PII classes, AuditLog, Tenant scoping, Secret non in business tables |
| MC-OS-020 | Security/Audit events catalogati |
| MC-OS-022 | AI non write SoT; kill switch; threat AI |
| ADR-009 | Person ≠ User ≠ Role ≠ Capability (Active) |
| ADR-OPEN-017 | RLS implementation patterns restano **OPEN** |

## 3. Security Drivers

Multi-tenant; Partner Exchange con Progressive Data Disclosure; financial access (Payment/Settlement/Payout/Ledger); PII/SENSITIVE_PII; guest booking pubblico; Driver/Dispatcher/Partner scopes; Modular Monolith shared DB; Supabase Auth/RLS/Storage come boundary candidate (non SoT Domain); small-team operability; low operational overhead senza WAF/SIEM obbligatori in MVP.

## 4. Security Quality Attributes

Confidentiality, Integrity, Availability, Authenticity, Non-repudiation, Accountability, Privacy, Resilience, Auditability, Least Privilege enforceability, Isolability (tenant/partner), Recoverability post-incident.

## 5. Security Principles

| Principio | Norma |
|-----------|-------|
| Secure by Design | Controlli nella progettazione Use Case, non come afterthought |
| Privacy by Design | Minimization, purpose limitation, disclosure gated |
| Zero Trust | Nessuna fiducia implicita a rete, UI o service role |
| Defense in Depth | Application Authorization + (futuro) RLS + encryption + audit |
| Least Privilege | Grant minimi; escalation temporanea auditata |
| Deny by Default | Assenza Permission = deny (ADR-009 / MC-OS-015) |
| Fail-safe defaults | Errore authz → deny; errore crypto → fail closed dove possibile |
| Separation of duties | Chi approva payout ≠ chi esegue senza controllo |
| Audit by Design | Operazioni sensibili append-only |
| No secrets in business tables | MC-OS-027 |
| Configuration ≠ Secret ≠ Permission | MC-OS-021 |
| AI non write SoT | MC-OS-022 |
| Service role non bypassa governance | MC-OS-015/026/027 |

## 6. Zero Trust

Ogni richiesta è autenticata e autorizzata nel contesto Tenant/Organization/Actor. Nessuna implicit trust da IP interno, shared secret UI, o “admin cookie”. Service-to-service richiede identità tecnica distinta e scope ristretto. Progressive trust (device/geo/MFA) è **readiness**, non requisito hard MVP ovunque.

## 7. Defense in Depth

Strati: (1) Perimeter/API validation readiness; (2) Authentication; (3) Application Authorization (obbligatorio); (4) Tenant/org filters; (5) RLS candidate (OPEN design); (6) Encryption in transit; (7) Encryption at rest readiness; (8) Audit/Security logging; (9) Monitoring/IR readiness. Un solo strato non è sufficiente.

## 8. Least Privilege

Allineato MC-OS-015 §27: Permission/Capability minimi; Role non “superuser” implicito; Platform Admin segmentato; break-glass con scadenza e audit. Nessun grant permanente di service role a utenti umani.

## 9. Deny by Default

Allineato MC-OS-015 §28 e MC-OS-026 Authorization Boundary. Wildcard `*` vietati salvo casi Platform Admin esplicitamente segmentati e auditati.

## 10. Secure by Design

Threat modeling sui flussi critici (login, booking confirm, assignment, payment, payout, disclosure Exchange, webhook). Security review prima di esporre Superfici pubbliche. Nessuna business logic di authz solo in UI.

## 11. Privacy by Design

Data minimization; purpose limitation; Progressive Data Disclosure (MC-OS-012/018/027); anonymization/soft-delete policies; Data Access Audit su PII/SENSITIVE_PII; AI/Analytics non espandono illegittimamente il perimetro PII.

## 12. Threat Model Boundary

Threat model di riferimento (non diagramma Draw.io): spoofing Identity; privilege escalation cross-tenant; IDOR su Booking/Service; leakage disclosure Exchange; webhook forgery; token theft; service role abuse; Ledger tampering; injection (XSS/SQLi readiness); SSRF via URL user-controlled; supply-chain dipendenze. Dettaglio ATT&CK-like resta evolutivo.

## 13. Attack Surface Map

Superfici: Web UI (App Router); Route Handler / Server Action; API pubbliche booking; Driver portal; Partner/Exchange surfaces; Webhook inbound; Admin; Storage signed URL; Realtime channels candidate; Background jobs; JSON legacy endpoints fino a cutover.

## 14. Identity Model

**Person ≠ User ≠ Role ≠ Capability ≠ Permission** (ADR-009, MC-OS-015).

| Concetto | Ruolo sicurezza |
|----------|-----------------|
| Person | Soggetto anagrafico / PII |
| User | Identità autenticabile |
| OrganizationMembership | Legame User↔Organization + Role |
| Role | Insieme di Permission |
| Permission | Azione atomica su Resource |
| Capability | Abilitazione operativa aggiuntiva / revocabile |
| Actor | User o Service Principal nel Security Context |

Supabase Auth (o IdP) è **Adapter**, non Domain Identity SoT.

## 15. Actor Model

Actor types: Guest (anonymous booking limitato); Customer User; Corporate/Agency User; Driver; Dispatcher; Owner/Org Admin; Partner User; Platform Administrator; Service Principal (worker); Break-glass Operator (temporaneo). Ogni Actor porta `actor_id`, tipo, tenant/org attivi, Permission effettivi.

## 16. Authentication

Verifica Identity del User o Service Principal. Necessaria ma **non sufficiente** per accesso dati tenant. Flussi: login, logout, session refresh, recovery. Provider OAuth/MFA **OPEN**. Password policy §24. Guest path autenticazione assente ma rate-limited e minimized.

## 17. Authentication Factors

Something you know (password); something you have (MFA device — readiness); something you are (future biometrics — out of MVP default). Factor step-up per Sensitive Operation (payout approve, role grant, disclosure override).

## 18. Session Management

Session con binding a User, device/context candidati, tenant/org context, expiry, idle timeout, absolute timeout. Logout invalida session server-side quando store lo consente. Session store technology **OPEN**. Vietare session fixation; ruotare session id post-login.

## 19. JWT Readiness

JWT ammessi come formato token candidate per access token. Requisiti: firma verificata; `exp`/`iat`; audience/issuer; claim minimi (sub, tenant hints non come unica authz); **Authorization sempre rivalutata server-side** — JWT non è source of Permission. Library **OPEN**.

## 20. Refresh Token Readiness

Refresh token: storage sicuro, rotazione, reuse detection candidate, binding a client. Non esporre in LocalStorage se evitabile su web sensibile; policy dettagliata OPEN. Revoca allineata a Token Revocation readiness.

## 21. MFA Readiness

MFA obbligatoria candidate per: Platform Admin; operazioni finanziarie sensibili; break-glass. MFA opzionale/configurabile per altri Role via Configuration. **Provider MFA OPEN** — nessuna scelta in questo documento.

## 22. Password Policy

Lunghezza minima elevata; blocco enumerazione username dove possibile; no password in log; hashing con algoritmo moderno (**algorithm OPEN**); reset via canale out-of-band; password ≠ usata come secret di integrazione.

## 23. Credential Rotation

Rotazione periodica e on-incident per: secret integrazione, webhook signing keys, service credentials, API keys partner. Dual-key window durante rotazione. Audit di rotazione obbligatorio.

## 24. Service Principal / Service Role

Identità tecnica per job/worker (MC-OS-015 §29). Non usabile da UI umana. Scope ristretto per job; correlazione audit obbligatoria. Supabase `service_role` non sostituisce governance Application — uso ristretto, mai esposto al client (MC-OS-027 Supabase Boundary).

## 25. Authorization

Decisione allow/deny su (Actor, Action, Resource, Context). Eseguita in **Application Layer** (MC-OS-026). Input: Role/Permission/Capability + Tenant + Organization + Resource ownership + Disclosure phase + Feature Flag (non come sola authz). Deny by default.

## 26. Permission Model

Permission atomiche tipo `resource.action` (es. `booking.read`, `assignment.manage`, `payout.read`). Concesse via Role o grant esplicito auditato. Catalogo canonico implementabile: **MC-OS-029** (con governance Identity in MC-OS-015). Questo framework ne definisce enforcement e matrici di rischio.

## 27. RBAC

Role-Based Access Control come base (MC-OS-015 §23). Role di piattaforma vs tenant/org. Multi-role = unione controllata Permission, non privilegio massimo implicito non auditato. Amministrazione Role solo da Actor autorizzati.

## 28. ABAC Readiness

Attribute-Based Access Control readiness: attributi Tenant, Organization, Assignment mode, Disclosure stage, geo/risk score, MFA satisfied. Non imposto come motore globale MVP; usabile per regole contestuali oltre RBAC puro.

## 29. Capability-Based Access

Capability operative (Exchange publish, payout view, holdback contest) revocabili indipendentemente dal Role se Configuration lo prevede (MC-OS-015 §24). Capability ≠ Feature Flag di marketing.

## 30. Context Based Authorization

Security Context obbligatorio (MC-OS-026): `request_id`, `trace_id`, `actor`, `tenant`, `organization`, `locale`, `timezone`, `currency`, `permissions`, più candidati: `mfa_level`, `disclosure_stage`, `channel`. Authz senza contesto tenant/org su risorse tenant-scoped = deny.

## 31. Tenant Isolation

Nessuna lettura/scrittura cross-tenant senza grant esplicito platform. Filtri `tenant_id` in Application e dati (MC-OS-027). Test fitness su cross-tenant access. Partner/Customer isolation §48–49.

## 32. Organization Isolation

Active Organization Context (MC-OS-015). Operazioni org-scoped richiedono membership attiva. Owner scope ≠ Platform Admin. Cross-org solo per flussi Exchange espliciti e disclosure-gated.

## 33. RLS Readiness

RLS = defense-in-depth su PostgreSQL/Supabase **candidate**. **Non** sostituisce Application Authorization. **Nessuna policy SQL eseguibile** in questo documento. Design patterns: ADR-OPEN-017 resta **OPEN**. Service role bypass solo job firmati e auditati.

## 34. Resource Model

Resource types sensibili: Booking, Service, Trip, Assignment, Payment, Settlement, Payout, LedgerEntry, Customer/Passenger PII, Document/Evidence, ExchangeListing, Configuration, RoleGrant, Secret refs, AuditLog.

## 35. Sensitive Operations

Operazioni ad alto rischio: role grant/revoke; payout approve/execute; Ledger adjustment/reversal; disclosure override; break-glass; export PII; webhook secret rotate; service_role usage; delete/anonymize; fiscal void. Richiedono Permission dedicati + audit + spesso step-up auth.

## 36. Session Hijacking Mitigation

HTTPS only; Secure/HttpOnly/SameSite cookie attributes dove applicabile; rotate session post-privilege change; idle timeout; anomaly candidate (device/geo — OPEN providers).

## 37. Replay Attack Mitigation

Nonce/idempotency key su side effect; `exp` token corti; webhook timestamp + signature window; reject reused idempotency with different payload.

## 38. Token Revocation Readiness

Deny-list / version epoch / server session invalidation candidates. Revoca su logout, password change, privilege downgrade, incident. Dettaglio store OPEN.

## 39. Device Trust Readiness

Device fingerprinting / trusted device list = readiness. Provider **OPEN**. Non gate unico di authz.

## 40. Geo Risk Readiness

Geo IP / impossible travel signals = readiness per step-up o alert. Geo provider **OPEN**. Non bloccare silenziosamente flussi critici senza policy esplicita.

## 41. Secret Management Boundary

Secret (API keys, signing keys, DB credentials, provider tokens) **fuori** business Configuration Store e business tables (MC-OS-021/027). Accesso via Secret Manager candidate; injection a runtime in Infrastructure. **Provider Secret Manager OPEN**.

## 42. Key Management Boundary

Chiavi di firma token, webhook, field encryption: lifecycle generate → rotate → retire; dual-key; least privilege su KMS. **KMS provider OPEN**. Nessun algoritmo specifico imposto.

## 43. Encryption in Transit

TLS per tutte le comunicazioni esterne e, ove applicabile, interne. Vietare credenziali in query string. HSTS readiness su superfici web.

## 44. Encryption at Rest Readiness

Disk/volume encryption platform-level candidate (Supabase/Postgres hosting). Field-level encryption readiness per SENSITIVE_PII selezionati. **Algoritmi e KMS OPEN**.

## 45. Field Encryption Readiness

Candidati: documenti fiscali sensibili, token PSP vault refs (mai PAN raw se evitabile), secrets residuali. Preferire tokenization/provider vault per pagamenti. Dettaglio OPEN.

## 46. Audit Security

AuditLog append-only (MC-OS-027): who/what/when/why/context; correlation_id; no overwrite. Separato da technical log e da LedgerEntry. Integrità: write-once, accesso lettura ristretto.

## 47. Security Logging

Log di sicurezza: authn success/fail, authz deny, MFA challenge, token revoke, secret access, service_role use, break-glass, rate-limit trip, webhook signature fail. PII redaction. Retention OPEN.

## 48. Security Events

Allineamento MC-OS-020 per eventi Security/Audit. Esempi logici: `Security.AuthenticationFailed`, `Security.AuthorizationDenied`, `Security.BreakGlassActivated`, `Security.SecretRotated`. Naming canonico nel catalogo eventi.

## 49. Data Access Audit

Accesso a SENSITIVE_PII / Progressive Disclosure / export: `DataAccessLog` candidate (MC-OS-027) con actor, reason, policy stage, resource. Obbligatorio per override disclosure.

## 50. Financial Access Protection

Payment ≠ Settlement ≠ Payout ≠ Ledger. Permission separati; dual-control candidate su payout; append-only Ledger; no direct Ledger overwrite; export finanziario auditato; PSD2/PSP constraints restano validazione professionale.

## 51. Progressive Data Disclosure Security

Fasi PRE_ACCEPTANCE … POST_SERVICE_RESTRICTED (MC-OS-012/027). Enforcement in Application Authorization + DataReleasePolicy. Executing Partner non vede End Customer oltre policy. Offset T-minus OPEN (ADR-OPEN-019).

## 52. Partner Data Isolation

Partner vede solo Assignment/Service/Document autorizzati; niente cross-partner leakage; Customer Price hidden da Executing by default; Isolation anche su Storage paths e signed URL.

## 53. Customer Data Isolation

Customer User: solo propri Booking/Profile; Corporate/Agency scoped agli account; Guest minimization; no escalate a Dispatcher dati.

## 54. API Security Principles

Authn obbligatoria salvo endpoint pubblici espliciti; authz per Use Case; input validation; output minimization; idempotency su write; no stack trace leak; versioning readiness; correlation ids. API definitive non progettate qui.

## 55. Webhook Security

Signature verification; timestamp tolerance; idempotency; allowlist source readiness; ACL Anti-Corruption; never trust payload per authz interna; secret rotation. Provider-specific details OPEN.

## 56. CSRF

Protezione su cookie-session state changing requests: SameSite, anti-CSRF token o double-submit candidate, Origin/Referer check readiness. Server Action / form POST in scope.

## 57. XSS

Escape output; CSP readiness; no `dangerouslySetInnerHTML` non sanitizzato; treat user content as untrusted; template notification injection awareness.

## 58. CSP Readiness

Content-Security-Policy candidate su superfici web. Policy dettagliata OPEN; report-only phase raccomandata prima di enforce.

## 59. Clickjacking

`X-Frame-Options` / CSP `frame-ancestors` readiness per console e portal.

## 60. SSRF

Vietare fetch server-side di URL arbitrari user-controlled senza allowlist; rischio su geocoding/webhooks outbound/preview. Metadata cloud endpoints blocked in allowlist design.

## 61. Injection Readiness

Parameterized queries / ORM ports (ORM OPEN); validazione input; comand injection avoidance in jobs; header injection awareness.

## 62. Rate Limiting Readiness

Limiti su login, booking pubblico, webhook, password reset, OTP. Technology **OPEN**. Fail policy: deny/throttle con audit.

## 63. Brute Force Protection

Lockout/backoff progressivo; captcha candidate OPEN; alert su distributed spray; no user enumeration dove evitabile.

## 64. Intrusion Detection Readiness

IDS/IPS / anomaly detection = readiness. **IDS/SIEM providers OPEN**. Segnali da Security Logging + FraudSignal (MC-OS-027).

## 65. Fraud Signal Integration

FraudSignal / RiskAssessment (MC-OS-027) informano step-up o hold — **non** scrivono Aggregate operativi autonomamente. Fraud provider **OPEN**.

## 66. AI Security Boundary

AI Recommendation only; HumanReview per effetti; no credential/PII unnecessary to models; prompt injection awareness; kill switch (MC-OS-022); AI provider OPEN (ADR-OPEN-015).

## 67. Compliance Boundary

Security Architecture supporta GDPR, obblighi contrattuali Partner, PSD2/PSP (validazione esterna), retention legale evidence. Non è parere legale.

## 68. GDPR

Liceità/purpose; minimization; access/erasure/anonymization workflows; DPA con processor; Data Access Audit; breach notification process link a Incident Response. Durate retention OPEN.

## 69. Security Incident

Definizione: breach confidenzialità/integrità/disponibilità, abuso service_role, leak secret, cross-tenant access, ransomware readiness. Severità e ownership da runbook futuro.

## 70. Incident Response

Fasi: Detect → Contain → Eradicate → Recover → Lessons learned. Azioni tipiche: revoke tokens, rotate secrets, freeze payouts se necessario, preserve audit, communicate per policy. Dettaglio runbook OPEN.

## 71. Security Monitoring

Dashboard/alert candidate su auth failures, authz denies spike, webhook fails, privilege changes, payout anomalies. SIEM **OPEN**. Correlazione con MC-OS-020 events.

## 72. Architecture Security Reviews

Review obbligatoria su: nuovi Actor/Role; superfici pubbliche; payment/payout; disclosure; webhook; uso service_role; export PII; AI features. Gate prima di produzione sensibile.

## 73. Security Technical Debt

Debt tipici: JSON legacy senza tenant; assenza RLS; secret in env non ruotati; UI authz-only; dual-write. Tracciare con expiry; no silent accept.

## 74. Security Fitness Functions

Controlli automatici candidate: forbidden cross-tenant tests; deny-by-default unit tests; no secret in repo; service_role not in client bundle; Permission required on Sensitive Operation handlers; header security smoke tests. Tooling OPEN.

## 75. Security Matrices

### 75.1 Permission Matrix
Allineata MC-OS-015: Permission × Resource × Action; enforcement Application.

### 75.2 Role Matrix
Platform Admin, Owner, Dispatcher, Driver, Partner, Customer, Corporate, Agency, Service Principal — Permission set minimi.

### 75.3 Actor Matrix
Actor type × Authentication strength × MFA expectation × typical Tenant scope.

### 75.4 Resource Matrix
Resource × PII/Financial class × required Permission × audit level.

### 75.5 Sensitive Operation Matrix
Operation × step-up MFA candidate × dual-control candidate × audit mandatory.

### 75.6 Audit Matrix
Event class (Security/Business/DataAccess/Financial) × retention class × reader Role.

### 75.7 Authentication Matrix
Channel (Web/Driver/Partner/Admin/API/Webhook) × method candidate × session/token.

### 75.8 Authorization Matrix
Layer (UI hint / Application / RLS candidate / Storage policy) × authoritative? → solo Application (+RLS defense).

### 75.9 Secret Matrix
Secret type × storage boundary × rotation × accessor Principal.

### 75.10 Encryption Matrix
Data class × in-transit × at-rest × field-level candidate.

### 75.11 Data Classification Matrix
Rinvio MC-OS-027 PII classes + handling security.

### 75.12 Security Review Matrix
Change type × reviewer (Security Architect / Privacy / Finance) × blocking?

## 76. OS Foundation Security Scope

Indispensabile: Identity model enforcement; Authentication base; Application Authorization deny-by-default; Tenant/Org context; AuditLog + Security logging; Secret boundary; TLS; CSRF/XSS baseline; rate limit login/public booking readiness.

Predisporre: MFA Admin/finance; RLS design; JWT/refresh hardening; webhook signing; disclosure audit.

Rinviare: SIEM pieno; IDS avanzato; device fingerprint provider; WAF enterprise; field encryption massiva.

## 77. Current Repository Assessment

| Area | Rischio concettuale |
|------|---------------------|
| Auth | Fondamenta incomplete (PLATFORM_MAP Fase 2) |
| RLS | Non progettata eseguibile; OPEN |
| JSON runtime | Senza tenant model durevole |
| API booking pubbliche | Superficie guest da rate-limit/minimize |
| Driver portal | Scope enforcement da irrigidire |
| Service role | Rischio bypass se usato da client |
| Dual JSON/Supabase | Inconsistenza e audit gap |

## 78. Gap Analysis

Gap P0: Authentication completa; Application Authorization coerente; Tenant isolation tests; Secret hygiene; Audit security events; RLS design (OPEN ma bloccante Foundation — ADR-OPEN-017). Gap P1: MFA, webhook security standard, disclosure access log, rate limiting. Gap P2: SIEM/IDS/device/geo providers.

## 79. Target Security Architecture Candidate

Zero Trust request path; RBAC+Capability+Context; Defense in Depth con RLS candidate; Secret/KMS boundaries; append-only security audit; Progressive Disclosure enforcement; AI/Finance guardrail. Stato **CANDIDATE**.

## 80. Implementation Sequence

1. Security Context + deny-by-default Use Case gates  
2. Authentication foundation (IdP adapter)  
3. Role/Permission enforcement (MC-OS-015)  
4. Tenant/Org isolation tests  
5. AuditLog + Security events  
6. Secret management boundary  
7. Public endpoint hardening (CSRF/XSS/rate limit)  
8. Webhook signing  
9. MFA readiness Admin/Finance  
10. RLS design (ADR-OPEN-017) → implementazione futura  
11. Monitoring/IR runbooks

## 81. Security Architecture Definition of Done

Principi documentati; Identity/Authz confini chiari; matrici presenti; CTD/OPEN espliciti; nessun provider/algoritmo imposto indebitamente; nessuna RLS SQL; allineamento B001/MC-OS-015/026/027; review professionale identificata.

## 82. Decisioni approvate

Da B001 / ADR Active / framework esistenti (non nuovi ADR): Person≠User≠Role≠Capability; Deny by default; Least Privilege; Application Authorization obbligatoria; Tenant isolation; AI non write SoT; Analytics non write SoT; Secret ≠ Configuration; Audit append-only; Ledger no overwrite; Progressive Disclosure; Service role non per UI; Auth Adapter ≠ Domain Identity.

## 83. Candidate Technical Decisions

| ID | Decisione | Stato |
|----|-----------|-------|
| CTD-SEC-001 | Application Authorization come authority primaria | CANDIDATE |
| CTD-SEC-002 | RLS come defense-in-depth (non sostituto AuthZ) | CANDIDATE |
| CTD-SEC-003 | JWT readiness per access token (library OPEN) | CANDIDATE |
| CTD-SEC-004 | Refresh token rotation readiness | CANDIDATE |
| CTD-SEC-005 | MFA readiness per Admin e Sensitive Operations | CANDIDATE |
| CTD-SEC-006 | Secret Manager boundary (provider OPEN) | CANDIDATE |
| CTD-SEC-007 | KMS boundary (provider OPEN) | CANDIDATE |
| CTD-SEC-008 | Encryption in transit obbligatorio; at-rest readiness | CANDIDATE |
| CTD-SEC-009 | Security Fitness Functions su cross-tenant/deny-default | CANDIDATE |
| CTD-SEC-010 | Break-glass con expiry + audit obbligatorio | CANDIDATE |

## 84. Decisioni OPEN

OAuth provider; MFA provider; JWT library; Secret Manager; KMS; RLS implementation (ADR-OPEN-017); encryption algorithms; password hashing algorithm; session store; rate limiting technology; WAF; SIEM; IDS; device fingerprinting; fraud provider; geo provider; CSP enforce details; dual-control payout thresholds; retention security logs; IdP mapping to User.

## 85. Professional and Technical Validation

| Ruolo | Focus |
|-------|-------|
| Security Architect | Framework, threat model, reviews |
| Identity & Access Architect | RBAC/ABAC, session, MFA |
| Privacy / GDPR | Disclosure, retention, DPIA |
| Data Architect | RLS vs data model, encryption fields |
| DevOps / SRE | Secrets, TLS, monitoring |
| PSD2/PSP counsel | Payment data / SCA |
| Legal | Breach notification, DPA |
| Fiscalista / Commercialista | Accesso dati finanziari (confine) |

## 86. Security Roadmap

1. **Security Foundation** — context, deny-default, audit  
2. **Identity & Authentication** — IdP adapter, session  
3. **Authorization Hardening** — matrices enforcement, fitness  
4. **Data Protection** — disclosure audit, encryption readiness  
5. **RLS Design** — ADR-OPEN-017 closure then implement  
6. **Fraud & Risk signals** — integration readiness  
7. **Monitoring & IR** — alerting, runbooks  
8. **Advanced controls** — device/geo/WAF/SIEM as justified |

---

## Cronologia revisioni

| Versione | Data | Autore | Descrizione modifica | Stato |
|----------|------|--------|----------------------|-------|
| 0.1.0 | 2026-07-26 | MyChauffeur OS Team | Prima stesura Security Architecture Framework; Application AuthZ authority; RLS/MFA/JWT readiness; CTD senza chiusura OPEN. | Draft |

---

*Fine MC-OS-028 v0.1.0 — Draft. Nessun codice, SQL, RLS eseguibile, provider o commit.*

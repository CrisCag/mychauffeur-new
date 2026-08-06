# MyChauffeur OS — System Event Catalog

| Campo | Valore |
|-------|--------|
| **Codice documento** | MC-OS-020 |
| **Titolo** | System Event Catalog |
| **Versione** | 0.1.0 |
| **Stato** | Draft |
| **Data creazione** | 2026-07-26 |
| **Ultima modifica** | 2026-07-26 |
| **Owner** | Enterprise Architecture & Platform Engineering |
| **Autori** | MyChauffeur OS Team |
| **Documenti correlati** | MC-OS-000 · MC-OS-001 · MC-OS-009 · MC-OS-011 · MC-OS-019 · MC-OS-014 · MC-OS-012 · MC-OS-015 · MC-OS-016 · MC-OS-017 · MC-OS-018 · MC-OS-006 · MC-OS-005 · MC-OS-002 · MC-OS-013 · PLATFORM_MAP · HANDOFF |
| **Dipendenze** | System Domain Architecture (MC-OS-019); Glossario; Entity Model; framework di dominio |
| **Classificazione** | Official Architecture Catalog — Draft |
| **Documentation Release** | 0.1 (allineamento previsto) |

---

## Avvertenza

Questo documento è la **Source of Truth ufficiale degli eventi** di MyChauffeur OS.

**Non** è: codice, SQL, API REST definitiva, scelta di broker, schema registry implementativo, né catalogo di log tecnici applicativi.

I nomi di Domain, Aggregate, Entity, Command, Event, State, Payload Field restano in **inglese**. Il testo normativo è in **italiano**.

---

## Source of Truth

**MC-OS-020** governa naming, ownership, envelope, classificazione e catalogo degli eventi.

- Bounded Context → MC-OS-019
- Lifecycle Booking/Trip → MC-OS-014
- Exchange → MC-OS-012
- Economics/Settlement → MC-OS-017 / MC-OS-006

**Regola:** un Domain **non** modifica direttamente lo stato interno di un altro Domain; i fatti cross-domain transitano come Event (o Command verso l’owner).

---

## 1. Scopo

Definire il linguaggio event-driven comune tra i Bounded Context, impedendo omonimi, ambiguità Command/Event, confusione con log tecnici, write-SoT da Analytics/AI, PII eccessiva nei payload e mutazioni retroattive di eventi pubblicati.

---

## 2. Principi dell’Event Architecture

| ID | Principio |
|----|-----------|
| EVA-01 | Event as immutable fact |
| EVA-02 | Past-tense naming |
| EVA-03 | Single event owner |
| EVA-04 | Single Source of Truth (catalogo) |
| EVA-05 | Domain ownership |
| EVA-06 | No cross-domain mutation |
| EVA-07 | Idempotent consumers |
| EVA-08 | At-least-once delivery readiness |
| EVA-09 | Duplicate event tolerance |
| EVA-10 | Event versioning |
| EVA-11 | Backward compatibility |
| EVA-12 | Schema evolution |
| EVA-13 | Correlation and causation |
| EVA-14 | Auditability |
| EVA-15 | Traceability |
| EVA-16 | Data minimization |
| EVA-17 | Tenant isolation |
| EVA-18 | Ordering only where required |
| EVA-19 | Eventual consistency |
| EVA-20 | Failure isolation |
| EVA-21 | Replay readiness |
| EVA-22 | Dead-letter handling readiness |
| EVA-23 | No secrets in payload |
| EVA-24 | No mutable financial history |
| EVA-25 | Reversal event instead of overwrite |

---

## 3. Command vs Event

| | **Command** | **Event** |
|--|-------------|-----------|
| Natura | Richiesta di fare | Fatto avvenuto |
| Tempo verbale | Imperativo (`ConfirmBooking`) | Passato (`BookingConfirmed`) |
| Fallibilità | Può essere rifiutato | Già successo (come fatto) |
| Ownership | Inviato all’aggregate owner | Emesso dall’owner dopo commit di fatto |
| Uso vietato | Usare un Event come istruzione di write altrui | Usare un Command come fatto storico |

Esempi Command (non eventi): `CreateBooking`, `ConfirmBooking`, `AssignDriver`, `ReservePayment`, `ApproveSettlement`.

---

## 4. Classificazione degli eventi

| Categoria | Definizione |
|-----------|-------------|
| **Domain Event** | Fatto immutabile in un Bounded Context |
| **Integration Event** | Pubblicato verso altri context o sistemi esterni |
| **Internal Event** | Tecnico interno; non contratto pubblico |
| **Audit Event** | Accessi, grant, override, operazioni sensibili |
| **Financial Event** | Influenza Ledger/Payment/Settlement/Payout/Refund/Reserve/Holdback |
| **Notification Event** | Richiede valutazione comunicazione; ≠ invio automatico garantito |
| **Analytics Event** | Proiezione/alert analitico; **non** write SoT operativa |
| **AI Recommendation Event** | Raccomandazione; **≠** decisione applicata |

---

## 5. Naming Convention

**Canonico documentale:** `Domain.EntityPastTenseEvent`
Esempi: `Booking.BookingCreated`, `Dispatch.AssignmentAccepted`, `Settlement.SettlementApproved`, `Payment.PaymentCaptured`.

**Tecnico suggerito (non definitivo):** `snake_case` — `booking_created`, `assignment_accepted`, `payment_captured`.

Regole: passato obbligatorio; vietati nomi generici (`updated`, `changed`, `processed`); soggetto esplicito; distinguere `Requested/Created/Approved/Rejected/Completed/Failed`; distinguere operativo vs finanziario; `BookingCancelled` ≠ `ServiceCancelled`; `DisputeOpened` ≠ `ChargebackOpened`; `SettlementApproved` ≠ `PayoutCompleted`; `PaymentAuthorized` ≠ `PaymentCaptured`; `OfferAccepted` (Marketplace) ≠ `AssignmentAccepted` (Dispatch).

---

## 6. Event Ownership

Ogni `event_name` ha **un solo** Producer Domain. I consumer non ribattezzano l’evento. Conflitti di naming → ADR + aggiornamento catalogo.

Operations.* eventi di esecuzione Trip sono ownership funzionale del **Booking Domain** (aggregate `Trip`), con prefisso `Operations` per chiarezza operativa (allineamento MC-OS-014 / MC-OS-019).

---

## 7. Event Envelope standard

| Campo | Obbligatorio | Note |
|-------|--------------|------|
| `event_id` | Sì | UUID univoco |
| `event_name` | Sì | Canonico catalogo |
| `event_version` | Sì | SemVer schema evento |
| `event_category` | Sì | Classificazione §4 |
| `occurred_at` | Sì | Tempo fatto di business |
| `recorded_at` | Sì | Tempo persistenza |
| `producer_domain` | Sì | Bounded Context |
| `producer_service` | Consigliato | Componente logico; **OPEN** naming runtime |
| `tenant_id` | Sì se applicabile | Isolamento |
| `organization_id` | Sì se applicabile | Contesto org |
| `aggregate_type` | Sì | |
| `aggregate_id` | Sì | |
| `aggregate_version` | Consigliato | Optimistic concurrency |
| `actor_type` / `actor_id` | Se noto | User/System/Partner |
| `correlation_id` | Sì per flussi | |
| `causation_id` | Consigliato | Event/Command causa |
| `trace_id` | Consigliato | Tracing |
| `idempotency_key` | Sì se side-effect | |
| `data_classification` | Sì | NONE/MIN/PSEUDO/SENSITIVE |
| `payload` | Sì | Minimizzato |
| `metadata` | Opzionale | Non-PII tecnico |

**Null ammessi:** `organization_id` solo se non applicabile; `actor_*` se system anonimo controllato.
**No PII nell’envelope** oltre ID opachi. **Pseudonimizzazione** per campi contatto. **Server-only:** segreti, raw token, PAN/CVV — mai in payload.

---

## 8. Event Payload Policy

Payload = fatti minimi per consumer autorizzati. Vietati: blob file, secrets, Customer Price verso Executing non autorizzato, dump anagrafici. Campi money con `currency`. Correzioni finanziarie → nuovo evento / reversal, non patch dell’evento passato.

---

## 9. PII e Data Minimization

Classi: `NONE`, `MIN`, `PSEUDO`, `SENSITIVE`.
Progressive Disclosure (Exchange) governa release dati. Accessi anticipati → Audit Event. Esempi catalogo **non** contengono PII complete.

---

## 10. Tenant Isolation

Consumer filtrano per `tenant_id` / `organization_id`. Cross-tenant solo break-glass Administration + Compliance audit.

---

## 11. Event Versioning

`event_version` per schema. Breaking change → nuova versione + consumers dual-read dove necessario. Eventi già pubblicati **immutabili**.

---

## 12. Backward Compatibility

Additive fields preferiti. Rinominare/semantica breaking → nuovo `event_name` o major version con piano deprecazione (**OPEN** dettagli tool).

---

## 13. Idempotency

Consumer con side-effect: obbligatori `idempotency_key` o `event_id` dedup. At-least-once readiness: duplicati tollerati.

---

## 14. Ordering

Ordinamento richiesto solo dove indicato (pagamenti, settlement, assignment accept). Altrimenti eventual consistency. Partition strategy **OPEN**.

---

## 15. Retry

Retry con backoff su failure transienti. Limiti/durate **OPEN**. Non ritentare side-effect non idempotenti senza dedup.

---

## 16. Dead Letter Concept

Dopo N fallimenti → `DEAD_LETTERED` concettuale + alert. Provider DLQ **OPEN**.

---

## 17. Replay

Replay per recovery/rebuild read model. Replay non deve duplicare effetti finanziari senza guardie. Policy **OPEN**.

---

## 18. Event Retention

Classi di retention per categoria; **durate temporali OPEN** (legal/compliance).

---

## 19. Audit e tracciabilità

Audit Event + envelope correlation/causation. Append-only. Accesso sensitive data tracciato.

---

## 20. Event Security

No secrets; authz publish/consume; encryption in transit/at rest (**OPEN** field-level). Threat model Blueprint §10.

---

## 21. Event Publishing Rules

Solo producer owner; dopo invarianti aggregate soddisfatte; nome da catalogo; envelope completo; no publish di Internal come Integration senza promozione esplicita.

---

## 22. Event Consumption Rules

Consumer aggiornano **solo** il proprio modello; idempotenti; non rinominano eventi; Notification valuta template senza assumere provider; Analytics/AI non scrivono aggregate core.

---

## 23. Event Failure Handling

Isolare failure per consumer; retry → DLQ; non bloccare publisher indefinitamente (pattern **OPEN**).

---

## 24. Domain Events vs Integration Events

Domain = linguaggio interno context. Integration = contratto stabile cross-context/esterno (spesso proiezione). Non tutti i Domain Event sono Integration Event.

---

## 25. Event-to-Notification separation

Business Event → `Notification.NotificationRequested` (valutazione). Invio effettivo = `NotificationSent`/`Delivered`/`Failed`. Quiet hours/consent possono sopprimere.

---

## 26. Event-to-Analytics separation

Analytics consuma e produce proiezioni/alert. **Non** Source of Truth operativa write.

---

## 27. Event-to-AI separation

AI emette Recommendation/Signal. Applicazione richiede Command sull’owner o HumanReview. `ModelDecisionBlocked` quando guardrail impediscono auto-apply.

---

## 28. Event-to-Ledger relationship

Financial Event può **originare** `Finance.LedgerEntryPosted` / reversal. L’evento **non sostituisce** il Ledger. Storia finanziaria immutabile + reversal.

---

## 29. Event-to-Audit relationship

Operazioni sensibili producono Audit Event dedicati oltre (o in vece) al solo log tecnico.

---

## 30. Event Lifecycle (tecnico)

`CREATED → VALIDATED → RECORDED → PUBLISHED → DELIVERED → CONSUMED`
Rami: `FAILED → RETRY_PENDING → DEAD_LETTERED`; `REPLAYED`.

**Non** confondere con stati business di Booking/Service/Trip/Assignment.

---

## 31. Catalogo eventi per Bounded Context

Convenzioni colonne:

- **PII:** NONE \| MIN \| PSEUDO \| SENSITIVE
- **Status:** APPROVED \| PROPOSED \| OPEN
- **Idem / Order / Audit:** Y/N

Side effect vietato comune a tutti: **mutazione diretta dello stato interno di un altro Domain**.

### Identity Domain

Eventi in questa sezione: **20**.

| Event ID | Canonical | Technical (suggerito) | Ver | Category | Aggregate | Trigger | Meaning | Required payload | Optional | PII | Consumers | Side effects OK | Side effects NO | Idem | Ord | Audit | Retention | SoT | Status |
|----------|-----------|----------------------|-----|----------|-----------|---------|---------|------------------|----------|-----|-----------|-----------------|-----------------|------|-----|-------|-----------|-----|--------|
| EVT-IDN-001 | `Identity.PersonCreated` | `person_created` | 0.1.0 | Domain | Person | Creazione anagrafica | Person creata | person_id,tenant_id | — | PSEUDO | Customer, Compliance | Profilo correlato | PII dump | Y | N | Y | OPEN | MC-OS-015 | PROPOSED |
| EVT-IDN-002 | `Identity.UserRegistered` | `user_registered` | 0.1.0 | Domain | User | Registrazione | User registrato | user_id,person_id? | channel | PSEUDO | Customer, Notification | Onboarding | Auto-grant admin | Y | N | Y | OPEN | MC-OS-015 | PROPOSED |
| EVT-IDN-003 | `Identity.UserActivated` | `user_activated` | 0.1.0 | Domain | User | Attivazione | User attivo | user_id | — | NONE | Notification | Access enable | — | Y | N | Y | OPEN | MC-OS-015 | PROPOSED |
| EVT-IDN-004 | `Identity.UserSuspended` | `user_suspended` | 0.1.0 | Audit | User | Sospensione | User sospeso | user_id,reason_code | actor_id | NONE | Notification, Admin | Session revoke | Hard delete | Y | Y | Y | OPEN | MC-OS-015 | APPROVED |
| EVT-IDN-005 | `Identity.UserReactivated` | `user_reactivated` | 0.1.0 | Domain | User | Riattivazione | User riattivato | user_id | — | NONE | Notification | Access restore | — | Y | N | Y | OPEN | MC-OS-015 | PROPOSED |
| EVT-IDN-006 | `Identity.UserDeactivated` | `user_deactivated` | 0.1.0 | Domain | User | Deattivazione | User disattivato | user_id,reason_code | — | NONE | Notification | Offboarding | — | Y | N | Y | OPEN | MC-OS-015 | PROPOSED |
| EVT-IDN-007 | `Identity.AuthenticationSucceeded` | `authentication_succeeded` | 0.1.0 | Audit | Session | Login OK | Auth riuscita | user_id,session_id | ip_hash | PSEUDO | Analytics | Session create | Log password | Y | N | Y | OPEN | MC-OS-015 | APPROVED |
| EVT-IDN-008 | `Identity.AuthenticationFailed` | `authentication_failed` | 0.1.0 | Audit | Session | Login KO | Auth fallita | attempt_id | ip_hash,reason | PSEUDO | Risk, Analytics | Throttle signal | PII email full | Y | N | Y | OPEN | MC-OS-015 | APPROVED |
| EVT-IDN-009 | `Identity.SessionCreated` | `session_created` | 0.1.0 | Domain | Session | Nuova sessione | Sessione creata | session_id,user_id | org_id | NONE | — | — | — | Y | N | Y | OPEN | MC-OS-015 | PROPOSED |
| EVT-IDN-010 | `Identity.SessionExpired` | `session_expired` | 0.1.0 | Domain | Session | Expiry | Sessione scaduta | session_id | — | NONE | — | — | — | Y | N | N | OPEN | MC-OS-015 | PROPOSED |
| EVT-IDN-011 | `Identity.SessionRevoked` | `session_revoked` | 0.1.0 | Audit | Session | Revoca | Sessione revocata | session_id,reason_code | actor_id | NONE | Notification | Force logout | — | Y | N | Y | OPEN | MC-OS-015 | APPROVED |
| EVT-IDN-012 | `Identity.OrganizationCreated` | `organization_created` | 0.1.0 | Domain | Organization | Creazione org | Organization creata | organization_id,tenant_id | type | NONE | Admin, Partner | — | — | Y | N | Y | OPEN | MC-OS-015 | PROPOSED |
| EVT-IDN-013 | `Identity.MembershipInvited` | `membership_invited` | 0.1.0 | Domain | OrganizationMembership | Invite | Membership invitata | membership_id,org_id | role_codes | PSEUDO | Notification | Invite mail | — | Y | N | Y | OPEN | MC-OS-015 | PROPOSED |
| EVT-IDN-014 | `Identity.MembershipActivated` | `membership_activated` | 0.1.0 | Domain | OrganizationMembership | Accept invite | Membership attiva | membership_id,user_id,org_id | — | NONE | — | Capability enable | — | Y | N | Y | OPEN | MC-OS-015 | APPROVED |
| EVT-IDN-015 | `Identity.MembershipRoleChanged` | `membership_role_changed` | 0.1.0 | Audit | OrganizationMembership | Role change | Ruoli membership cambiati | membership_id,roles_from,roles_to | actor_id | NONE | Admin, Audit | Authz refresh | Privilege silent | Y | Y | Y | OPEN | MC-OS-015 | APPROVED |
| EVT-IDN-016 | `Identity.MembershipSuspended` | `membership_suspended` | 0.1.0 | Audit | OrganizationMembership | Suspend | Membership sospesa | membership_id,reason_code | — | NONE | Notification | Access block | — | Y | N | Y | OPEN | MC-OS-015 | APPROVED |
| EVT-IDN-017 | `Identity.PermissionDenied` | `permission_denied` | 0.1.0 | Audit | Authorization | Deny | Permesso negato | actor_id,action,resource_type | resource_id | NONE | Security Analytics | Alert | — | Y | N | Y | OPEN | MC-OS-015 | APPROVED |
| EVT-IDN-018 | `Identity.ActiveOrganizationChanged` | `active_organization_changed` | 0.1.0 | Domain | Session | Context switch | Active org cambiata | user_id,organization_id | — | NONE | — | Scope change | — | Y | N | Y | OPEN | MC-OS-015 | PROPOSED |
| EVT-IDN-019 | `Identity.PlatformAdminGranted` | `platform_admin_granted` | 0.1.0 | Audit | User | Grant admin | Platform Admin concesso | user_id,actor_id | capability | NONE | Compliance | Elevated access | — | Y | Y | Y | OPEN | MC-OS-015 | APPROVED |
| EVT-IDN-020 | `Identity.PlatformAdminRevoked` | `platform_admin_revoked` | 0.1.0 | Audit | User | Revoke admin | Platform Admin revocato | user_id,actor_id | — | NONE | Compliance | — | — | Y | Y | Y | OPEN | MC-OS-015 | APPROVED |

### Customer Domain

Eventi in questa sezione: **14**.

| Event ID | Canonical | Technical (suggerito) | Ver | Category | Aggregate | Trigger | Meaning | Required payload | Optional | PII | Consumers | Side effects OK | Side effects NO | Idem | Ord | Audit | Retention | SoT | Status |
|----------|-----------|----------------------|-----|----------|-----------|---------|---------|------------------|----------|-----|-----------|-----------------|-----------------|------|-----|-------|-----------|-----|--------|
| EVT-CUS-001 | `Customer.CustomerCreated` | `customer_created` | 0.1.0 | Domain | CustomerProfile | Onboarding | Customer creato | customer_id,tenant_id | segment | PSEUDO | Booking, Notification | — | — | Y | N | Y | OPEN | MC-OS-018 | PROPOSED |
| EVT-CUS-002 | `Customer.CustomerProfileUpdated` | `customer_profile_updated` | 0.1.0 | Domain | CustomerProfile | Update profilo | Profilo aggiornato | customer_id,fields_changed | — | MIN | — | — | Full PII broadcast | Y | N | Y | OPEN | MC-OS-018 | PROPOSED |
| EVT-CUS-003 | `Customer.CustomerPreferenceUpdated` | `customer_preference_updated` | 0.1.0 | Domain | Preference | Preferenze | Preferenze aggiornate | customer_id,preference_keys | — | MIN | Notification | Channel prefs | — | Y | N | N | OPEN | MC-OS-018 | PROPOSED |
| EVT-CUS-004 | `Customer.CustomerConsentGranted` | `customer_consent_granted` | 0.1.0 | Audit | ConsentRecord | Consent | Consenso concesso | customer_id,purpose,channel | — | NONE | Notification | Promo enable | — | Y | Y | Y | OPEN | MC-OS-018 | APPROVED |
| EVT-CUS-005 | `Customer.CustomerConsentWithdrawn` | `customer_consent_withdrawn` | 0.1.0 | Audit | ConsentRecord | Withdraw | Consenso revocato | customer_id,purpose,channel | — | NONE | Notification | Promo suppress | Block transactional essenziali | Y | Y | Y | OPEN | MC-OS-018 | APPROVED |
| EVT-CUS-006 | `Customer.CorporateAccountCreated` | `corporate_account_created` | 0.1.0 | Domain | CorporateAccount | Create corporate | Corporate Account creato | corporate_account_id | — | NONE | Booking, Finance | — | — | Y | N | Y | OPEN | MC-OS-018 | PROPOSED |
| EVT-CUS-007 | `Customer.CorporateAccountActivated` | `corporate_account_activated` | 0.1.0 | Domain | CorporateAccount | Activate | Corporate attivo | corporate_account_id | — | NONE | Booking | — | — | Y | N | Y | OPEN | MC-OS-018 | PROPOSED |
| EVT-CUS-008 | `Customer.CorporateAccountSuspended` | `corporate_account_suspended` | 0.1.0 | Domain | CorporateAccount | Suspend | Corporate sospeso | corporate_account_id,reason_code | — | NONE | Booking, Notification | Block booking | — | Y | N | Y | OPEN | MC-OS-018 | PROPOSED |
| EVT-CUS-009 | `Customer.AgencyAccountCreated` | `agency_account_created` | 0.1.0 | Domain | CustomerProfile | Agency create | Agency account creato | agency_org_id | — | NONE | Booking | — | — | Y | N | Y | OPEN | MC-OS-018 | PROPOSED |
| EVT-CUS-010 | `Customer.BookerLinkedToPassenger` | `booker_linked_to_passenger` | 0.1.0 | Domain | CustomerProfile | Link | Booker collegato a Passenger | booker_id,passenger_id | booking_id | PSEUDO | Booking | — | — | Y | N | Y | OPEN | MC-OS-018 | PROPOSED |
| EVT-CUS-011 | `Customer.CustomerDataAccessRequested` | `customer_data_access_requested` | 0.1.0 | Audit | CustomerProfile | Access request | Richiesta accesso dati | request_id,customer_id | actor_id | NONE | Compliance | — | Auto export | Y | N | Y | OPEN | MC-OS-018 | APPROVED |
| EVT-CUS-012 | `Customer.CustomerDataExportRequested` | `customer_data_export_requested` | 0.1.0 | Audit | CustomerProfile | Export GDPR | Export dati richiesto | request_id,customer_id | — | NONE | Compliance, Document | — | — | Y | N | Y | OPEN | MC-OS-018 | APPROVED |
| EVT-CUS-013 | `Customer.CustomerDataDeletionRequested` | `customer_data_deletion_requested` | 0.1.0 | Audit | CustomerProfile | Deletion | Cancellazione dati richiesta | request_id,customer_id | — | NONE | Compliance | Schedule delete | Immediate hard wipe non policy | Y | N | Y | OPEN | MC-OS-018 | APPROVED |
| EVT-CUS-014 | `Customer.CustomerRatingSubmitted` | `customer_rating_submitted` | 0.1.0 | Domain | CustomerProfile | Rating | Rating inviato | rating_id,booking_id,score | comment_ref | MIN | Partner, Analytics | Score signal | Public PII | Y | N | Y | OPEN | MC-OS-018 | PROPOSED |

### Booking Domain

Eventi in questa sezione: **26**.

| Event ID | Canonical | Technical (suggerito) | Ver | Category | Aggregate | Trigger | Meaning | Required payload | Optional | PII | Consumers | Side effects OK | Side effects NO | Idem | Ord | Audit | Retention | SoT | Status |
|----------|-----------|----------------------|-----|----------|-----------|---------|---------|------------------|----------|-----|-----------|-----------------|-----------------|------|-----|-------|-----------|-----|--------|
| EVT-BKG-001 | `Booking.RequestSubmitted` | `request_submitted` | 0.1.0 | Domain | Request | Lifecycle MC-OS-014 | Fatto lifecycle: RequestSubmitted | booking_id|service_id,tenant_id | reason_code,version | NONE | Notification, Pricing, Payment, Dispatch, Analytics | Proiezioni/consumer propri | Mutazione diretta altri domain | Y | N | Y | OPEN | MC-OS-014 | PROPOSED |
| EVT-BKG-002 | `Booking.RequestValidated` | `request_validated` | 0.1.0 | Domain | Request | Lifecycle MC-OS-014 | Fatto lifecycle: RequestValidated | booking_id|service_id,tenant_id | reason_code,version | NONE | Notification, Pricing, Payment, Dispatch, Analytics | Proiezioni/consumer propri | Mutazione diretta altri domain | Y | N | Y | OPEN | MC-OS-014 | PROPOSED |
| EVT-BKG-003 | `Booking.QuoteRequested` | `quote_requested` | 0.1.0 | Domain | Quote | Lifecycle MC-OS-014 | Fatto lifecycle: QuoteRequested | booking_id|service_id,tenant_id | reason_code,version | NONE | Notification, Pricing, Payment, Dispatch, Analytics | Proiezioni/consumer propri | Mutazione diretta altri domain | Y | N | Y | OPEN | MC-OS-014 | PROPOSED |
| EVT-BKG-004 | `Booking.QuoteGenerated` | `quote_generated` | 0.1.0 | Domain | Quote | Lifecycle MC-OS-014 | Fatto lifecycle: QuoteGenerated | booking_id|service_id,tenant_id | reason_code,version | NONE | Notification, Pricing, Payment, Dispatch, Analytics | Proiezioni/consumer propri | Mutazione diretta altri domain | Y | N | Y | OPEN | MC-OS-014 | PROPOSED |
| EVT-BKG-005 | `Booking.QuoteSent` | `quote_sent` | 0.1.0 | Domain | Quote | Lifecycle MC-OS-014 | Fatto lifecycle: QuoteSent | booking_id|service_id,tenant_id | reason_code,version | MIN | Notification, Pricing, Payment, Dispatch, Analytics | Proiezioni/consumer propri | Mutazione diretta altri domain | Y | N | Y | OPEN | MC-OS-014 | PROPOSED |
| EVT-BKG-006 | `Booking.QuoteAccepted` | `quote_accepted` | 0.1.0 | Domain | Quote | Lifecycle MC-OS-014 | Fatto lifecycle: QuoteAccepted | booking_id|service_id,tenant_id | reason_code,version | NONE | Notification, Pricing, Payment, Dispatch, Analytics | Proiezioni/consumer propri | Mutazione diretta altri domain | Y | N | Y | OPEN | MC-OS-014 | APPROVED |
| EVT-BKG-007 | `Booking.QuoteRejected` | `quote_rejected` | 0.1.0 | Domain | Quote | Lifecycle MC-OS-014 | Fatto lifecycle: QuoteRejected | booking_id|service_id,tenant_id | reason_code,version | NONE | Notification, Pricing, Payment, Dispatch, Analytics | Proiezioni/consumer propri | Mutazione diretta altri domain | Y | N | Y | OPEN | MC-OS-014 | PROPOSED |
| EVT-BKG-008 | `Booking.QuoteExpired` | `quote_expired` | 0.1.0 | Domain | Quote | Lifecycle MC-OS-014 | Fatto lifecycle: QuoteExpired | booking_id|service_id,tenant_id | reason_code,version | NONE | Notification, Pricing, Payment, Dispatch, Analytics | Proiezioni/consumer propri | Mutazione diretta altri domain | Y | N | Y | OPEN | MC-OS-014 | PROPOSED |
| EVT-BKG-009 | `Booking.BookingCreated` | `booking_created` | 0.1.0 | Domain | Booking | Lifecycle MC-OS-014 | Fatto lifecycle: BookingCreated | booking_id|service_id,tenant_id | reason_code,version | NONE | Notification, Pricing, Payment, Dispatch, Analytics | Proiezioni/consumer propri | Mutazione diretta altri domain | Y | N | Y | OPEN | MC-OS-014 | APPROVED |
| EVT-BKG-010 | `Booking.BookingPendingConfirmation` | `booking_pending_confirmation` | 0.1.0 | Domain | Booking | Lifecycle MC-OS-014 | Fatto lifecycle: BookingPendingConfirmation | booking_id|service_id,tenant_id | reason_code,version | NONE | Notification, Pricing, Payment, Dispatch, Analytics | Proiezioni/consumer propri | Mutazione diretta altri domain | Y | N | Y | OPEN | MC-OS-014 | PROPOSED |
| EVT-BKG-011 | `Booking.BookingConfirmed` | `booking_confirmed` | 0.1.0 | Domain | Booking | Lifecycle MC-OS-014 | Fatto lifecycle: BookingConfirmed | booking_id|service_id,tenant_id | reason_code,version | MIN | Notification, Pricing, Payment, Dispatch, Analytics | Proiezioni/consumer propri | Mutazione diretta altri domain | Y | Y | Y | OPEN | MC-OS-014 | APPROVED |
| EVT-BKG-012 | `Booking.BookingModified` | `booking_modified` | 0.1.0 | Domain | Booking | Lifecycle MC-OS-014 | Fatto lifecycle: BookingModified | booking_id|service_id,tenant_id | reason_code,version | NONE | Notification, Pricing, Payment, Dispatch, Analytics | Proiezioni/consumer propri | Mutazione diretta altri domain | Y | N | Y | OPEN | MC-OS-014 | PROPOSED |
| EVT-BKG-013 | `Booking.BookingCancellationRequested` | `booking_cancellation_requested` | 0.1.0 | Domain | Booking | Lifecycle MC-OS-014 | Fatto lifecycle: BookingCancellationRequested | booking_id|service_id,tenant_id | reason_code,version | NONE | Payment, Settlement, Notification, Marketplace | Proiezioni/consumer propri | Mutazione diretta altri domain | Y | N | Y | OPEN | MC-OS-014 | PROPOSED |
| EVT-BKG-014 | `Booking.BookingCancelled` | `booking_cancelled` | 0.1.0 | Domain | Booking | Lifecycle MC-OS-014 | Fatto lifecycle: BookingCancelled | booking_id|service_id,tenant_id | reason_code,version | NONE | Payment, Settlement, Notification, Marketplace | Proiezioni/consumer propri | Mutazione diretta altri domain | Y | N | Y | OPEN | MC-OS-014 | APPROVED |
| EVT-BKG-015 | `Booking.BookingExpired` | `booking_expired` | 0.1.0 | Domain | Booking | Lifecycle MC-OS-014 | Fatto lifecycle: BookingExpired | booking_id|service_id,tenant_id | reason_code,version | NONE | Notification, Pricing, Payment, Dispatch, Analytics | Proiezioni/consumer propri | Mutazione diretta altri domain | Y | N | Y | OPEN | MC-OS-014 | PROPOSED |
| EVT-BKG-016 | `Booking.BookingCompleted` | `booking_completed` | 0.1.0 | Domain | Booking | Lifecycle MC-OS-014 | Fatto lifecycle: BookingCompleted | booking_id|service_id,tenant_id | reason_code,version | NONE | Settlement, Finance, Notification, Analytics | Proiezioni/consumer propri | Mutazione diretta altri domain | Y | Y | Y | OPEN | MC-OS-014 | PROPOSED |
| EVT-BKG-017 | `Booking.ServiceCreated` | `service_created` | 0.1.0 | Domain | Service | Lifecycle MC-OS-014 | Fatto lifecycle: ServiceCreated | booking_id|service_id,tenant_id | reason_code,version | MIN | Notification, Pricing, Payment, Dispatch, Analytics | Proiezioni/consumer propri | Mutazione diretta altri domain | Y | N | Y | OPEN | MC-OS-014 | APPROVED |
| EVT-BKG-018 | `Booking.ServiceScheduled` | `service_scheduled` | 0.1.0 | Domain | Service | Lifecycle MC-OS-014 | Fatto lifecycle: ServiceScheduled | booking_id|service_id,tenant_id | reason_code,version | NONE | Notification, Pricing, Payment, Dispatch, Analytics | Proiezioni/consumer propri | Mutazione diretta altri domain | Y | N | Y | OPEN | MC-OS-014 | PROPOSED |
| EVT-BKG-019 | `Booking.ServiceModified` | `service_modified` | 0.1.0 | Domain | Service | Lifecycle MC-OS-014 | Fatto lifecycle: ServiceModified | booking_id|service_id,tenant_id | reason_code,version | NONE | Notification, Pricing, Payment, Dispatch, Analytics | Proiezioni/consumer propri | Mutazione diretta altri domain | Y | N | Y | OPEN | MC-OS-014 | PROPOSED |
| EVT-BKG-020 | `Booking.ServiceCancellationRequested` | `service_cancellation_requested` | 0.1.0 | Domain | Service | Lifecycle MC-OS-014 | Fatto lifecycle: ServiceCancellationRequested | booking_id|service_id,tenant_id | reason_code,version | NONE | Payment, Settlement, Notification, Marketplace | Proiezioni/consumer propri | Mutazione diretta altri domain | Y | N | Y | OPEN | MC-OS-014 | PROPOSED |
| EVT-BKG-021 | `Booking.ServiceCancelled` | `service_cancelled` | 0.1.0 | Domain | Service | Lifecycle MC-OS-014 | Fatto lifecycle: ServiceCancelled | booking_id|service_id,tenant_id | reason_code,version | NONE | Payment, Settlement, Notification, Marketplace | Proiezioni/consumer propri | Mutazione diretta altri domain | Y | N | Y | OPEN | MC-OS-014 | PROPOSED |
| EVT-BKG-022 | `Booking.ServiceCompleted` | `service_completed` | 0.1.0 | Domain | Service | Lifecycle MC-OS-014 | Fatto lifecycle: ServiceCompleted | booking_id|service_id,tenant_id | reason_code,version | NONE | Settlement, Finance, Notification, Analytics | Proiezioni/consumer propri | Mutazione diretta altri domain | Y | Y | Y | OPEN | MC-OS-014 | APPROVED |
| EVT-BKG-023 | `Booking.ReturnServiceLinked` | `return_service_linked` | 0.1.0 | Domain | Service | Lifecycle MC-OS-014 | Fatto lifecycle: ReturnServiceLinked | booking_id|service_id,tenant_id | reason_code,version | NONE | Notification, Pricing, Payment, Dispatch, Analytics | Proiezioni/consumer propri | Mutazione diretta altri domain | Y | N | Y | OPEN | MC-OS-014 | PROPOSED |
| EVT-BKG-024 | `Booking.StopAdded` | `stop_added` | 0.1.0 | Domain | Service | Lifecycle MC-OS-014 | Fatto lifecycle: StopAdded | booking_id|service_id,tenant_id | reason_code,version | NONE | Notification, Pricing, Payment, Dispatch, Analytics | Proiezioni/consumer propri | Mutazione diretta altri domain | Y | N | Y | OPEN | MC-OS-014 | PROPOSED |
| EVT-BKG-025 | `Booking.StopModified` | `stop_modified` | 0.1.0 | Domain | Service | Lifecycle MC-OS-014 | Fatto lifecycle: StopModified | booking_id|service_id,tenant_id | reason_code,version | NONE | Notification, Pricing, Payment, Dispatch, Analytics | Proiezioni/consumer propri | Mutazione diretta altri domain | Y | N | Y | OPEN | MC-OS-014 | PROPOSED |
| EVT-BKG-026 | `Booking.StopRemoved` | `stop_removed` | 0.1.0 | Domain | Service | Lifecycle MC-OS-014 | Fatto lifecycle: StopRemoved | booking_id|service_id,tenant_id | reason_code,version | NONE | Notification, Pricing, Payment, Dispatch, Analytics | Proiezioni/consumer propri | Mutazione diretta altri domain | Y | N | Y | OPEN | MC-OS-014 | PROPOSED |

### Marketplace Domain

Eventi in questa sezione: **27**.

| Event ID | Canonical | Technical (suggerito) | Ver | Category | Aggregate | Trigger | Meaning | Required payload | Optional | PII | Consumers | Side effects OK | Side effects NO | Idem | Ord | Audit | Retention | SoT | Status |
|----------|-----------|----------------------|-----|----------|-----------|---------|---------|------------------|----------|-----|-----------|-----------------|-----------------|------|-----|-------|-----------|-----|--------|
| EVT-MKT-001 | `Marketplace.ExchangeListingDrafted` | `exchange_listing_drafted` | 0.1.0 | Domain | ExchangeListing | MC-OS-012 flow | Exchange: ExchangeListingDrafted | listing_id,tenant_id | offer_id,partner_id | NONE | Booking, Partner, Settlement, Notification, Compliance | Disclosure/settlement signals | Customer Price a Executing; write Booking diretto | Y | N | Y | OPEN | MC-OS-012 | PROPOSED |
| EVT-MKT-002 | `Marketplace.ExchangeListingPaymentRequested` | `exchange_listing_payment_requested` | 0.1.0 | Financial | ExchangeListing | MC-OS-012 flow | Exchange: ExchangeListingPaymentRequested | listing_id,tenant_id | offer_id,partner_id | NONE | Booking, Partner, Settlement, Notification, Compliance | Disclosure/settlement signals | Customer Price a Executing; write Booking diretto | Y | N | Y | OPEN | MC-OS-012 | PROPOSED |
| EVT-MKT-003 | `Marketplace.ExchangeFundsReserved` | `exchange_funds_reserved` | 0.1.0 | Financial | ExchangeListing | MC-OS-012 flow | Exchange: ExchangeFundsReserved | listing_id,tenant_id | offer_id,partner_id | NONE | Booking, Partner, Settlement, Notification, Compliance | Disclosure/settlement signals | Customer Price a Executing; write Booking diretto | Y | Y | Y | OPEN | MC-OS-012 | PROPOSED |
| EVT-MKT-004 | `Marketplace.ExchangeListingPublished` | `exchange_listing_published` | 0.1.0 | Domain | ExchangeListing | MC-OS-012 flow | Exchange: ExchangeListingPublished | listing_id,tenant_id | offer_id,partner_id | NONE | Booking, Partner, Settlement, Notification, Compliance | Disclosure/settlement signals | Customer Price a Executing; write Booking diretto | Y | N | Y | OPEN | MC-OS-012 | APPROVED |
| EVT-MKT-005 | `Marketplace.ExchangeListingVisibilityChanged` | `exchange_listing_visibility_changed` | 0.1.0 | Domain | ExchangeListing | MC-OS-012 flow | Exchange: ExchangeListingVisibilityChanged | listing_id,tenant_id | offer_id,partner_id | NONE | Booking, Partner, Settlement, Notification, Compliance | Disclosure/settlement signals | Customer Price a Executing; write Booking diretto | Y | N | Y | OPEN | MC-OS-012 | PROPOSED |
| EVT-MKT-006 | `Marketplace.ExchangeMatchingStarted` | `exchange_matching_started` | 0.1.0 | Domain | ExchangeListing | MC-OS-012 flow | Exchange: ExchangeMatchingStarted | listing_id,tenant_id | offer_id,partner_id | NONE | Booking, Partner, Settlement, Notification, Compliance | Disclosure/settlement signals | Customer Price a Executing; write Booking diretto | Y | N | Y | OPEN | MC-OS-012 | PROPOSED |
| EVT-MKT-007 | `Marketplace.ExchangeCandidateSelected` | `exchange_candidate_selected` | 0.1.0 | Domain | ExchangeListing | MC-OS-012 flow | Exchange: ExchangeCandidateSelected | listing_id,tenant_id | offer_id,partner_id | NONE | Booking, Partner, Settlement, Notification, Compliance | Disclosure/settlement signals | Customer Price a Executing; write Booking diretto | Y | N | Y | OPEN | MC-OS-012 | PROPOSED |
| EVT-MKT-008 | `Marketplace.ExchangeOfferSent` | `exchange_offer_sent` | 0.1.0 | Domain | ExchangeListing | MC-OS-012 flow | Exchange: ExchangeOfferSent | listing_id,tenant_id | offer_id,partner_id | NONE | Booking, Partner, Settlement, Notification, Compliance | Disclosure/settlement signals | Customer Price a Executing; write Booking diretto | Y | N | Y | OPEN | MC-OS-012 | PROPOSED |
| EVT-MKT-009 | `Marketplace.ExchangeOfferViewed` | `exchange_offer_viewed` | 0.1.0 | Domain | ExchangeListing | MC-OS-012 flow | Exchange: ExchangeOfferViewed | listing_id,tenant_id | offer_id,partner_id | NONE | Booking, Partner, Settlement, Notification, Compliance | Disclosure/settlement signals | Customer Price a Executing; write Booking diretto | Y | N | Y | OPEN | MC-OS-012 | PROPOSED |
| EVT-MKT-010 | `Marketplace.ExchangeOfferAccepted` | `exchange_offer_accepted` | 0.1.0 | Domain | ExchangeListing | MC-OS-012 flow | Exchange: ExchangeOfferAccepted | listing_id,tenant_id | offer_id,partner_id | NONE | Booking, Partner, Settlement, Notification, Compliance | Disclosure/settlement signals | Customer Price a Executing; write Booking diretto | Y | Y | Y | OPEN | MC-OS-012 | APPROVED |
| EVT-MKT-011 | `Marketplace.ExchangeOfferRejected` | `exchange_offer_rejected` | 0.1.0 | Domain | ExchangeListing | MC-OS-012 flow | Exchange: ExchangeOfferRejected | listing_id,tenant_id | offer_id,partner_id | NONE | Booking, Partner, Settlement, Notification, Compliance | Disclosure/settlement signals | Customer Price a Executing; write Booking diretto | Y | N | Y | OPEN | MC-OS-012 | PROPOSED |
| EVT-MKT-012 | `Marketplace.ExchangeOfferExpired` | `exchange_offer_expired` | 0.1.0 | Domain | ExchangeListing | MC-OS-012 flow | Exchange: ExchangeOfferExpired | listing_id,tenant_id | offer_id,partner_id | NONE | Booking, Partner, Settlement, Notification, Compliance | Disclosure/settlement signals | Customer Price a Executing; write Booking diretto | Y | N | Y | OPEN | MC-OS-012 | PROPOSED |
| EVT-MKT-013 | `Marketplace.CounterOfferSubmitted` | `counter_offer_submitted` | 0.1.0 | Domain | ExchangeListing | MC-OS-012 flow | Exchange: CounterOfferSubmitted | listing_id,tenant_id | offer_id,partner_id | NONE | Booking, Partner, Settlement, Notification, Compliance | Disclosure/settlement signals | Customer Price a Executing; write Booking diretto | Y | N | Y | OPEN | MC-OS-012 | PROPOSED |
| EVT-MKT-014 | `Marketplace.CounterOfferAccepted` | `counter_offer_accepted` | 0.1.0 | Domain | ExchangeListing | MC-OS-012 flow | Exchange: CounterOfferAccepted | listing_id,tenant_id | offer_id,partner_id | NONE | Booking, Partner, Settlement, Notification, Compliance | Disclosure/settlement signals | Customer Price a Executing; write Booking diretto | Y | Y | Y | OPEN | MC-OS-012 | PROPOSED |
| EVT-MKT-015 | `Marketplace.CounterOfferRejected` | `counter_offer_rejected` | 0.1.0 | Domain | ExchangeListing | MC-OS-012 flow | Exchange: CounterOfferRejected | listing_id,tenant_id | offer_id,partner_id | NONE | Booking, Partner, Settlement, Notification, Compliance | Disclosure/settlement signals | Customer Price a Executing; write Booking diretto | Y | N | Y | OPEN | MC-OS-012 | PROPOSED |
| EVT-MKT-016 | `Marketplace.ExchangeListingAccepted` | `exchange_listing_accepted` | 0.1.0 | Domain | ExchangeListing | MC-OS-012 flow | Exchange: ExchangeListingAccepted | listing_id,tenant_id | offer_id,partner_id | NONE | Booking, Partner, Settlement, Notification, Compliance | Disclosure/settlement signals | Customer Price a Executing; write Booking diretto | Y | Y | Y | OPEN | MC-OS-012 | PROPOSED |
| EVT-MKT-017 | `Marketplace.ExchangeListingAssigned` | `exchange_listing_assigned` | 0.1.0 | Domain | ExchangeListing | MC-OS-012 flow | Exchange: ExchangeListingAssigned | listing_id,tenant_id | offer_id,partner_id | NONE | Booking, Partner, Settlement, Notification, Compliance | Disclosure/settlement signals | Customer Price a Executing; write Booking diretto | Y | Y | Y | OPEN | MC-OS-012 | PROPOSED |
| EVT-MKT-018 | `Marketplace.ExchangeListingExpired` | `exchange_listing_expired` | 0.1.0 | Domain | ExchangeListing | MC-OS-012 flow | Exchange: ExchangeListingExpired | listing_id,tenant_id | offer_id,partner_id | NONE | Booking, Partner, Settlement, Notification, Compliance | Disclosure/settlement signals | Customer Price a Executing; write Booking diretto | Y | N | Y | OPEN | MC-OS-012 | PROPOSED |
| EVT-MKT-019 | `Marketplace.ExchangeListingUnfilled` | `exchange_listing_unfilled` | 0.1.0 | Domain | ExchangeListing | MC-OS-012 flow | Exchange: ExchangeListingUnfilled | listing_id,tenant_id | offer_id,partner_id | NONE | Booking, Partner, Settlement, Notification, Compliance | Disclosure/settlement signals | Customer Price a Executing; write Booking diretto | Y | N | Y | OPEN | MC-OS-012 | APPROVED |
| EVT-MKT-020 | `Marketplace.ExchangeListingCancelled` | `exchange_listing_cancelled` | 0.1.0 | Domain | ExchangeListing | MC-OS-012 flow | Exchange: ExchangeListingCancelled | listing_id,tenant_id | offer_id,partner_id | NONE | Booking, Partner, Settlement, Notification, Compliance | Disclosure/settlement signals | Customer Price a Executing; write Booking diretto | Y | N | Y | OPEN | MC-OS-012 | PROPOSED |
| EVT-MKT-021 | `Marketplace.ExchangeFundsReleased` | `exchange_funds_released` | 0.1.0 | Financial | ExchangeListing | MC-OS-012 flow | Exchange: ExchangeFundsReleased | listing_id,tenant_id | offer_id,partner_id | MIN | Booking, Partner, Settlement, Notification, Compliance | Disclosure/settlement signals | Customer Price a Executing; write Booking diretto | Y | Y | Y | OPEN | MC-OS-012 | APPROVED |
| EVT-MKT-022 | `Marketplace.ExchangeCommissionCalculated` | `exchange_commission_calculated` | 0.1.0 | Financial | ExchangeListing | MC-OS-012 flow | Exchange: ExchangeCommissionCalculated | listing_id,tenant_id | offer_id,partner_id | NONE | Booking, Partner, Settlement, Notification, Compliance | Disclosure/settlement signals | Customer Price a Executing; write Booking diretto | Y | N | Y | OPEN | MC-OS-012 | PROPOSED |
| EVT-MKT-023 | `Marketplace.ExchangeServiceOrderCreated` | `exchange_service_order_created` | 0.1.0 | Domain | ExchangeListing | MC-OS-012 flow | Exchange: ExchangeServiceOrderCreated | listing_id,tenant_id | offer_id,partner_id | NONE | Booking, Partner, Settlement, Notification, Compliance | Disclosure/settlement signals | Customer Price a Executing; write Booking diretto | Y | N | Y | OPEN | MC-OS-012 | PROPOSED |
| EVT-MKT-024 | `Marketplace.ExchangeCustomerDataReleaseScheduled` | `exchange_customer_data_release_scheduled` | 0.1.0 | Domain | ExchangeListing | MC-OS-012 flow | Exchange: ExchangeCustomerDataReleaseScheduled | listing_id,tenant_id | offer_id,partner_id | NONE | Booking, Partner, Settlement, Notification, Compliance | Disclosure/settlement signals | Customer Price a Executing; write Booking diretto | Y | N | Y | OPEN | MC-OS-012 | PROPOSED |
| EVT-MKT-025 | `Marketplace.ExchangeCustomerDataReleased` | `exchange_customer_data_released` | 0.1.0 | Domain | ExchangeListing | MC-OS-012 flow | Exchange: ExchangeCustomerDataReleased | listing_id,tenant_id | offer_id,partner_id | SENSITIVE | Booking, Partner, Settlement, Notification, Compliance | Disclosure/settlement signals | Customer Price a Executing; write Booking diretto | Y | Y | Y | OPEN | MC-OS-012 | APPROVED |
| EVT-MKT-026 | `Marketplace.ExchangeDataAccessed` | `exchange_data_accessed` | 0.1.0 | Audit | ExchangeListing | MC-OS-012 flow | Exchange: ExchangeDataAccessed | listing_id,tenant_id | offer_id,partner_id | SENSITIVE | Booking, Partner, Settlement, Notification, Compliance | Disclosure/settlement signals | Customer Price a Executing; write Booking diretto | Y | N | Y | OPEN | MC-OS-012 | PROPOSED |
| EVT-MKT-027 | `Marketplace.ExchangeDisintermediationRiskDetected` | `exchange_disintermediation_risk_detected` | 0.1.0 | Audit | ExchangeListing | MC-OS-012 flow | Exchange: ExchangeDisintermediationRiskDetected | listing_id,tenant_id | offer_id,partner_id | NONE | Booking, Partner, Settlement, Notification, Compliance | Disclosure/settlement signals | Customer Price a Executing; write Booking diretto | Y | N | Y | OPEN | MC-OS-012 | PROPOSED |

### Partner Domain

Eventi in questa sezione: **21**.

| Event ID | Canonical | Technical (suggerito) | Ver | Category | Aggregate | Trigger | Meaning | Required payload | Optional | PII | Consumers | Side effects OK | Side effects NO | Idem | Ord | Audit | Retention | SoT | Status |
|----------|-----------|----------------------|-----|----------|-----------|---------|---------|------------------|----------|-----|-----------|-----------------|-----------------|------|-----|-------|-----------|-----|--------|
| EVT-PTR-001 | `Partner.PartnerApplicationSubmitted` | `partner_application_submitted` | 0.1.0 | Domain | PartnerCompany | Partner lifecycle | Partner: PartnerApplicationSubmitted | partner_company_id,tenant_id | reason_code,score | NONE | Marketplace, Compliance, Notification, Settlement | Eligibility/score projections | Subordination employment model | Y | N | Y | OPEN | MC-OS-005 | PROPOSED |
| EVT-PTR-002 | `Partner.PartnerCreated` | `partner_created` | 0.1.0 | Domain | PartnerCompany | Partner lifecycle | Partner: PartnerCreated | partner_company_id,tenant_id | reason_code,score | NONE | Marketplace, Compliance, Notification, Settlement | Eligibility/score projections | Subordination employment model | Y | N | Y | OPEN | MC-OS-005 | PROPOSED |
| EVT-PTR-003 | `Partner.PartnerVerified` | `partner_verified` | 0.1.0 | Domain | PartnerCompany | Partner lifecycle | Partner: PartnerVerified | partner_company_id,tenant_id | reason_code,score | NONE | Marketplace, Compliance, Notification, Settlement | Eligibility/score projections | Subordination employment model | Y | N | Y | OPEN | MC-OS-005 | PROPOSED |
| EVT-PTR-004 | `Partner.PartnerActivated` | `partner_activated` | 0.1.0 | Domain | PartnerCompany | Partner lifecycle | Partner: PartnerActivated | partner_company_id,tenant_id | reason_code,score | NONE | Marketplace, Compliance, Notification, Settlement | Eligibility/score projections | Subordination employment model | Y | N | Y | OPEN | MC-OS-005 | APPROVED |
| EVT-PTR-005 | `Partner.PartnerSuspended` | `partner_suspended` | 0.1.0 | Audit | PartnerCompany | Partner lifecycle | Partner: PartnerSuspended | partner_company_id,tenant_id | reason_code,score | NONE | Marketplace, Compliance, Notification, Settlement | Eligibility/score projections | Subordination employment model | Y | N | Y | OPEN | MC-OS-005 | APPROVED |
| EVT-PTR-006 | `Partner.PartnerReactivated` | `partner_reactivated` | 0.1.0 | Domain | PartnerCompany | Partner lifecycle | Partner: PartnerReactivated | partner_company_id,tenant_id | reason_code,score | NONE | Marketplace, Compliance, Notification, Settlement | Eligibility/score projections | Subordination employment model | Y | N | Y | OPEN | MC-OS-005 | PROPOSED |
| EVT-PTR-007 | `Partner.PartnerOffboarded` | `partner_offboarded` | 0.1.0 | Audit | PartnerCompany | Partner lifecycle | Partner: PartnerOffboarded | partner_company_id,tenant_id | reason_code,score | NONE | Marketplace, Compliance, Notification, Settlement | Eligibility/score projections | Subordination employment model | Y | N | Y | OPEN | MC-OS-005 | PROPOSED |
| EVT-PTR-008 | `Partner.PartnerDocumentUploaded` | `partner_document_uploaded` | 0.1.0 | Domain | PartnerCompany | Partner lifecycle | Partner: PartnerDocumentUploaded | partner_company_id,tenant_id | reason_code,score | MIN | Marketplace, Compliance, Notification, Settlement | Eligibility/score projections | Subordination employment model | Y | N | Y | OPEN | MC-OS-005 | PROPOSED |
| EVT-PTR-009 | `Partner.PartnerDocumentVerified` | `partner_document_verified` | 0.1.0 | Domain | PartnerCompany | Partner lifecycle | Partner: PartnerDocumentVerified | partner_company_id,tenant_id | reason_code,score | MIN | Marketplace, Compliance, Notification, Settlement | Eligibility/score projections | Subordination employment model | Y | N | Y | OPEN | MC-OS-005 | PROPOSED |
| EVT-PTR-010 | `Partner.PartnerDocumentRejected` | `partner_document_rejected` | 0.1.0 | Domain | PartnerCompany | Partner lifecycle | Partner: PartnerDocumentRejected | partner_company_id,tenant_id | reason_code,score | MIN | Marketplace, Compliance, Notification, Settlement | Eligibility/score projections | Subordination employment model | Y | N | Y | OPEN | MC-OS-005 | PROPOSED |
| EVT-PTR-011 | `Partner.PartnerDocumentExpiring` | `partner_document_expiring` | 0.1.0 | Domain | PartnerCompany | Partner lifecycle | Partner: PartnerDocumentExpiring | partner_company_id,tenant_id | reason_code,score | MIN | Marketplace, Compliance, Notification, Settlement | Eligibility/score projections | Subordination employment model | Y | N | Y | OPEN | MC-OS-005 | PROPOSED |
| EVT-PTR-012 | `Partner.PartnerDocumentExpired` | `partner_document_expired` | 0.1.0 | Domain | PartnerCompany | Partner lifecycle | Partner: PartnerDocumentExpired | partner_company_id,tenant_id | reason_code,score | MIN | Marketplace, Compliance, Notification, Settlement | Eligibility/score projections | Subordination employment model | Y | N | Y | OPEN | MC-OS-005 | PROPOSED |
| EVT-PTR-013 | `Partner.PartnerCapabilityGranted` | `partner_capability_granted` | 0.1.0 | Audit | PartnerCompany | Partner lifecycle | Partner: PartnerCapabilityGranted | partner_company_id,tenant_id | reason_code,score | NONE | Marketplace, Compliance, Notification, Settlement | Eligibility/score projections | Subordination employment model | Y | N | Y | OPEN | MC-OS-005 | APPROVED |
| EVT-PTR-014 | `Partner.PartnerCapabilityRevoked` | `partner_capability_revoked` | 0.1.0 | Audit | PartnerCompany | Partner lifecycle | Partner: PartnerCapabilityRevoked | partner_company_id,tenant_id | reason_code,score | NONE | Marketplace, Compliance, Notification, Settlement | Eligibility/score projections | Subordination employment model | Y | N | Y | OPEN | MC-OS-005 | PROPOSED |
| EVT-PTR-015 | `Partner.PartnerScoreUpdated` | `partner_score_updated` | 0.1.0 | Domain | PartnerCompany | Partner lifecycle | Partner: PartnerScoreUpdated | partner_company_id,tenant_id | reason_code,score | NONE | Marketplace, Compliance, Notification, Settlement | Eligibility/score projections | Subordination employment model | Y | N | Y | OPEN | MC-OS-005 | APPROVED |
| EVT-PTR-016 | `Partner.PartnerWarningIssued` | `partner_warning_issued` | 0.1.0 | Audit | PartnerCompany | Partner lifecycle | Partner: PartnerWarningIssued | partner_company_id,tenant_id | reason_code,score | NONE | Marketplace, Compliance, Notification, Settlement | Eligibility/score projections | Subordination employment model | Y | N | Y | OPEN | MC-OS-005 | PROPOSED |
| EVT-PTR-017 | `Partner.PartnerAppealSubmitted` | `partner_appeal_submitted` | 0.1.0 | Audit | PartnerCompany | Partner lifecycle | Partner: PartnerAppealSubmitted | partner_company_id,tenant_id | reason_code,score | NONE | Marketplace, Compliance, Notification, Settlement | Eligibility/score projections | Subordination employment model | Y | N | Y | OPEN | MC-OS-005 | PROPOSED |
| EVT-PTR-018 | `Partner.PartnerAppealResolved` | `partner_appeal_resolved` | 0.1.0 | Audit | PartnerCompany | Partner lifecycle | Partner: PartnerAppealResolved | partner_company_id,tenant_id | reason_code,score | NONE | Marketplace, Compliance, Notification, Settlement | Eligibility/score projections | Subordination employment model | Y | N | Y | OPEN | MC-OS-005 | PROPOSED |
| EVT-PTR-019 | `Partner.SubcontractingRequested` | `subcontracting_requested` | 0.1.0 | Domain | PartnerCompany | Partner lifecycle | Partner: SubcontractingRequested | partner_company_id,tenant_id | reason_code,score | NONE | Marketplace, Compliance, Notification, Settlement | Eligibility/score projections | Subordination employment model | Y | N | Y | OPEN | MC-OS-005 | PROPOSED |
| EVT-PTR-020 | `Partner.SubcontractingApproved` | `subcontracting_approved` | 0.1.0 | Domain | PartnerCompany | Partner lifecycle | Partner: SubcontractingApproved | partner_company_id,tenant_id | reason_code,score | NONE | Marketplace, Compliance, Notification, Settlement | Eligibility/score projections | Subordination employment model | Y | N | Y | OPEN | MC-OS-005 | PROPOSED |
| EVT-PTR-021 | `Partner.SubcontractingRejected` | `subcontracting_rejected` | 0.1.0 | Domain | PartnerCompany | Partner lifecycle | Partner: SubcontractingRejected | partner_company_id,tenant_id | reason_code,score | NONE | Marketplace, Compliance, Notification, Settlement | Eligibility/score projections | Subordination employment model | Y | N | Y | OPEN | MC-OS-005 | PROPOSED |

### Dispatch Domain

Eventi in questa sezione: **19**.

| Event ID | Canonical | Technical (suggerito) | Ver | Category | Aggregate | Trigger | Meaning | Required payload | Optional | PII | Consumers | Side effects OK | Side effects NO | Idem | Ord | Audit | Retention | SoT | Status |
|----------|-----------|----------------------|-----|----------|-----------|---------|---------|------------------|----------|-----|-----------|-----------------|-----------------|------|-----|-------|-----------|-----|--------|
| EVT-DSP-001 | `Dispatch.AssignmentRequested` | `assignment_requested` | 0.1.0 | Domain | Assignment | Dispatch/Assignment MC-OS-014 | Dispatch: AssignmentRequested | assignment_id|service_id,tenant_id | executor_ref,budget_signal | NONE | Booking, Fleet, Notification, Marketplace, Pricing | Update own assignment model via owner services | Overwrite Trip state altrui senza comando | Y | N | Y | OPEN | MC-OS-014 | PROPOSED |
| EVT-DSP-002 | `Dispatch.AssignmentCreated` | `assignment_created` | 0.1.0 | Domain | Assignment | Dispatch/Assignment MC-OS-014 | Dispatch: AssignmentCreated | assignment_id|service_id,tenant_id | executor_ref,budget_signal | NONE | Booking, Fleet, Notification, Marketplace, Pricing | Update own assignment model via owner services | Overwrite Trip state altrui senza comando | Y | N | Y | OPEN | MC-OS-014 | APPROVED |
| EVT-DSP-003 | `Dispatch.AssignmentOfferSent` | `assignment_offer_sent` | 0.1.0 | Domain | Assignment | Dispatch/Assignment MC-OS-014 | Dispatch: AssignmentOfferSent | assignment_id|service_id,tenant_id | executor_ref,budget_signal | NONE | Booking, Fleet, Notification, Marketplace, Pricing | Update own assignment model via owner services | Overwrite Trip state altrui senza comando | Y | N | Y | OPEN | MC-OS-014 | PROPOSED |
| EVT-DSP-004 | `Dispatch.AssignmentOfferViewed` | `assignment_offer_viewed` | 0.1.0 | Domain | Assignment | Dispatch/Assignment MC-OS-014 | Dispatch: AssignmentOfferViewed | assignment_id|service_id,tenant_id | executor_ref,budget_signal | NONE | Booking, Fleet, Notification, Marketplace, Pricing | Update own assignment model via owner services | Overwrite Trip state altrui senza comando | Y | N | Y | OPEN | MC-OS-014 | PROPOSED |
| EVT-DSP-005 | `Dispatch.AssignmentAccepted` | `assignment_accepted` | 0.1.0 | Domain | Assignment | Dispatch/Assignment MC-OS-014 | Dispatch: AssignmentAccepted | assignment_id|service_id,tenant_id | executor_ref,budget_signal | NONE | Booking, Fleet, Notification, Marketplace, Pricing | Update own assignment model via owner services | Overwrite Trip state altrui senza comando | Y | Y | Y | OPEN | MC-OS-014 | APPROVED |
| EVT-DSP-006 | `Dispatch.AssignmentRejected` | `assignment_rejected` | 0.1.0 | Domain | Assignment | Dispatch/Assignment MC-OS-014 | Dispatch: AssignmentRejected | assignment_id|service_id,tenant_id | executor_ref,budget_signal | NONE | Booking, Fleet, Notification, Marketplace, Pricing | Update own assignment model via owner services | Overwrite Trip state altrui senza comando | Y | N | Y | OPEN | MC-OS-014 | PROPOSED |
| EVT-DSP-007 | `Dispatch.AssignmentTimedOut` | `assignment_timed_out` | 0.1.0 | Domain | Assignment | Dispatch/Assignment MC-OS-014 | Dispatch: AssignmentTimedOut | assignment_id|service_id,tenant_id | executor_ref,budget_signal | NONE | Booking, Fleet, Notification, Marketplace, Pricing | Update own assignment model via owner services | Overwrite Trip state altrui senza comando | Y | N | Y | OPEN | MC-OS-014 | PROPOSED |
| EVT-DSP-008 | `Dispatch.AssignmentCancelled` | `assignment_cancelled` | 0.1.0 | Domain | Assignment | Dispatch/Assignment MC-OS-014 | Dispatch: AssignmentCancelled | assignment_id|service_id,tenant_id | executor_ref,budget_signal | NONE | Booking, Fleet, Notification, Marketplace, Pricing | Update own assignment model via owner services | Overwrite Trip state altrui senza comando | Y | N | Y | OPEN | MC-OS-014 | PROPOSED |
| EVT-DSP-009 | `Dispatch.AssignmentReassigned` | `assignment_reassigned` | 0.1.0 | Domain | Assignment | Dispatch/Assignment MC-OS-014 | Dispatch: AssignmentReassigned | assignment_id|service_id,tenant_id | executor_ref,budget_signal | NONE | Booking, Fleet, Notification, Marketplace, Pricing | Update own assignment model via owner services | Overwrite Trip state altrui senza comando | Y | Y | Y | OPEN | MC-OS-014 | APPROVED |
| EVT-DSP-010 | `Dispatch.DriverAssigned` | `driver_assigned` | 0.1.0 | Domain | Assignment | Dispatch/Assignment MC-OS-014 | Dispatch: DriverAssigned | assignment_id|service_id,tenant_id | executor_ref,budget_signal | NONE | Booking, Fleet, Notification, Marketplace, Pricing | Update own assignment model via owner services | Overwrite Trip state altrui senza comando | Y | N | Y | OPEN | MC-OS-014 | APPROVED |
| EVT-DSP-011 | `Dispatch.VehicleAssigned` | `vehicle_assigned` | 0.1.0 | Domain | Assignment | Dispatch/Assignment MC-OS-014 | Dispatch: VehicleAssigned | assignment_id|service_id,tenant_id | executor_ref,budget_signal | NONE | Booking, Fleet, Notification, Marketplace, Pricing | Update own assignment model via owner services | Overwrite Trip state altrui senza comando | Y | N | Y | OPEN | MC-OS-014 | PROPOSED |
| EVT-DSP-012 | `Dispatch.PartnerAssigned` | `partner_assigned` | 0.1.0 | Domain | Assignment | Dispatch/Assignment MC-OS-014 | Dispatch: PartnerAssigned | assignment_id|service_id,tenant_id | executor_ref,budget_signal | NONE | Booking, Fleet, Notification, Marketplace, Pricing | Update own assignment model via owner services | Overwrite Trip state altrui senza comando | Y | N | Y | OPEN | MC-OS-014 | PROPOSED |
| EVT-DSP-013 | `Dispatch.MaximumAssignmentBudgetReached` | `maximum_assignment_budget_reached` | 0.1.0 | Financial | Assignment | Dispatch/Assignment MC-OS-014 | Dispatch: MaximumAssignmentBudgetReached | assignment_id|service_id,tenant_id | executor_ref,budget_signal | NONE | Booking, Fleet, Notification, Marketplace, Pricing | Update own assignment model via owner services | Overwrite Trip state altrui senza comando | Y | N | Y | OPEN | MC-OS-014 | PROPOSED |
| EVT-DSP-014 | `Dispatch.NoEligibleExecutorFound` | `no_eligible_executor_found` | 0.1.0 | Domain | DispatchQueueItem | Dispatch/Assignment MC-OS-014 | Dispatch: NoEligibleExecutorFound | assignment_id|service_id,tenant_id | executor_ref,budget_signal | NONE | Booking, Fleet, Notification, Marketplace, Pricing | Update own assignment model via owner services | Overwrite Trip state altrui senza comando | Y | N | Y | OPEN | MC-OS-014 | PROPOSED |
| EVT-DSP-015 | `Dispatch.RecoveryRequested` | `recovery_requested` | 0.1.0 | Domain | RecoveryCase | Dispatch/Assignment MC-OS-014 | Dispatch: RecoveryRequested | assignment_id|service_id,tenant_id | executor_ref,budget_signal | NONE | Booking, Fleet, Notification, Marketplace, Pricing | Update own assignment model via owner services | Overwrite Trip state altrui senza comando | Y | N | Y | OPEN | MC-OS-014 | PROPOSED |
| EVT-DSP-016 | `Dispatch.RecoveryStarted` | `recovery_started` | 0.1.0 | Domain | RecoveryCase | Dispatch/Assignment MC-OS-014 | Dispatch: RecoveryStarted | assignment_id|service_id,tenant_id | executor_ref,budget_signal | NONE | Booking, Fleet, Notification, Marketplace, Pricing | Update own assignment model via owner services | Overwrite Trip state altrui senza comando | Y | N | Y | OPEN | MC-OS-014 | PROPOSED |
| EVT-DSP-017 | `Dispatch.RecoveryExecutorFound` | `recovery_executor_found` | 0.1.0 | Domain | RecoveryCase | Dispatch/Assignment MC-OS-014 | Dispatch: RecoveryExecutorFound | assignment_id|service_id,tenant_id | executor_ref,budget_signal | NONE | Booking, Fleet, Notification, Marketplace, Pricing | Update own assignment model via owner services | Overwrite Trip state altrui senza comando | Y | N | Y | OPEN | MC-OS-014 | PROPOSED |
| EVT-DSP-018 | `Dispatch.RecoveryFailed` | `recovery_failed` | 0.1.0 | Domain | RecoveryCase | Dispatch/Assignment MC-OS-014 | Dispatch: RecoveryFailed | assignment_id|service_id,tenant_id | executor_ref,budget_signal | NONE | Booking, Fleet, Notification, Marketplace, Pricing | Update own assignment model via owner services | Overwrite Trip state altrui senza comando | Y | N | Y | OPEN | MC-OS-014 | PROPOSED |
| EVT-DSP-019 | `Dispatch.RecoveryCompleted` | `recovery_completed` | 0.1.0 | Domain | RecoveryCase | Dispatch/Assignment MC-OS-014 | Dispatch: RecoveryCompleted | assignment_id|service_id,tenant_id | executor_ref,budget_signal | NONE | Booking, Fleet, Notification, Marketplace, Pricing | Update own assignment model via owner services | Overwrite Trip state altrui senza comando | Y | N | Y | OPEN | MC-OS-014 | APPROVED |

### Fleet Domain

Eventi in questa sezione: **13**.

| Event ID | Canonical | Technical (suggerito) | Ver | Category | Aggregate | Trigger | Meaning | Required payload | Optional | PII | Consumers | Side effects OK | Side effects NO | Idem | Ord | Audit | Retention | SoT | Status |
|----------|-----------|----------------------|-----|----------|-----------|---------|---------|------------------|----------|-----|-----------|-----------------|-----------------|------|-----|-------|-----------|-----|--------|
| EVT-FLT-001 | `Fleet.DriverProfileCreated` | `driver_profile_created` | 0.1.0 | Domain | DriverProfile | Fleet ops | Fleet: DriverProfileCreated | vehicle_id|driver_profile_id,tenant_id | availability | NONE | Dispatch, Booking, Compliance, Notification | Availability projections | Payment mutation | Y | N | N | OPEN | MC-OS-011 | PROPOSED |
| EVT-FLT-002 | `Fleet.DriverActivated` | `driver_activated` | 0.1.0 | Domain | DriverProfile | Fleet ops | Fleet: DriverActivated | vehicle_id|driver_profile_id,tenant_id | availability | NONE | Dispatch, Booking, Compliance, Notification | Availability projections | Payment mutation | Y | N | N | OPEN | MC-OS-011 | PROPOSED |
| EVT-FLT-003 | `Fleet.DriverSuspended` | `driver_suspended` | 0.1.0 | Domain | DriverProfile | Fleet ops | Fleet: DriverSuspended | vehicle_id|driver_profile_id,tenant_id | availability | NONE | Dispatch, Booking, Compliance, Notification | Availability projections | Payment mutation | Y | N | Y | OPEN | MC-OS-011 | PROPOSED |
| EVT-FLT-004 | `Fleet.DriverDocumentExpiring` | `driver_document_expiring` | 0.1.0 | Domain | DriverProfile | Fleet ops | Fleet: DriverDocumentExpiring | vehicle_id|driver_profile_id,tenant_id | availability | MIN | Dispatch, Booking, Compliance, Notification | Availability projections | Payment mutation | Y | N | N | OPEN | MC-OS-011 | PROPOSED |
| EVT-FLT-005 | `Fleet.VehicleCreated` | `vehicle_created` | 0.1.0 | Domain | Vehicle | Fleet ops | Fleet: VehicleCreated | vehicle_id|driver_profile_id,tenant_id | availability | NONE | Dispatch, Booking, Compliance, Notification | Availability projections | Payment mutation | Y | N | N | OPEN | MC-OS-011 | PROPOSED |
| EVT-FLT-006 | `Fleet.VehicleUpdated` | `vehicle_updated` | 0.1.0 | Domain | Vehicle | Fleet ops | Fleet: VehicleUpdated | vehicle_id|driver_profile_id,tenant_id | availability | NONE | Dispatch, Booking, Compliance, Notification | Availability projections | Payment mutation | Y | N | N | OPEN | MC-OS-011 | PROPOSED |
| EVT-FLT-007 | `Fleet.VehicleActivated` | `vehicle_activated` | 0.1.0 | Domain | Vehicle | Fleet ops | Fleet: VehicleActivated | vehicle_id|driver_profile_id,tenant_id | availability | NONE | Dispatch, Booking, Compliance, Notification | Availability projections | Payment mutation | Y | N | N | OPEN | MC-OS-011 | PROPOSED |
| EVT-FLT-008 | `Fleet.VehicleSuspended` | `vehicle_suspended` | 0.1.0 | Domain | Vehicle | Fleet ops | Fleet: VehicleSuspended | vehicle_id|driver_profile_id,tenant_id | availability | NONE | Dispatch, Booking, Compliance, Notification | Availability projections | Payment mutation | Y | N | Y | OPEN | MC-OS-011 | PROPOSED |
| EVT-FLT-009 | `Fleet.VehicleDocumentExpiring` | `vehicle_document_expiring` | 0.1.0 | Domain | Vehicle | Fleet ops | Fleet: VehicleDocumentExpiring | vehicle_id|driver_profile_id,tenant_id | availability | MIN | Dispatch, Booking, Compliance, Notification | Availability projections | Payment mutation | Y | N | N | OPEN | MC-OS-011 | PROPOSED |
| EVT-FLT-010 | `Fleet.VehicleDocumentExpired` | `vehicle_document_expired` | 0.1.0 | Domain | Vehicle | Fleet ops | Fleet: VehicleDocumentExpired | vehicle_id|driver_profile_id,tenant_id | availability | MIN | Dispatch, Booking, Compliance, Notification | Availability projections | Payment mutation | Y | N | N | OPEN | MC-OS-011 | PROPOSED |
| EVT-FLT-011 | `Fleet.VehicleAvailabilityChanged` | `vehicle_availability_changed` | 0.1.0 | Domain | Vehicle | Fleet ops | Fleet: VehicleAvailabilityChanged | vehicle_id|driver_profile_id,tenant_id | availability | NONE | Dispatch, Booking, Compliance, Notification | Availability projections | Payment mutation | Y | N | N | OPEN | MC-OS-011 | APPROVED |
| EVT-FLT-012 | `Fleet.DriverAvailabilityChanged` | `driver_availability_changed` | 0.1.0 | Domain | DriverProfile | Fleet ops | Fleet: DriverAvailabilityChanged | vehicle_id|driver_profile_id,tenant_id | availability | NONE | Dispatch, Booking, Compliance, Notification | Availability projections | Payment mutation | Y | N | N | OPEN | MC-OS-011 | APPROVED |
| EVT-FLT-013 | `Fleet.VehicleAssignedToService` | `vehicle_assigned_to_service` | 0.1.0 | Domain | Vehicle | Fleet ops | Fleet: VehicleAssignedToService | vehicle_id|driver_profile_id,tenant_id | availability | NONE | Dispatch, Booking, Compliance, Notification | Availability projections | Payment mutation | Y | N | N | OPEN | MC-OS-011 | APPROVED |

### Operations (Booking Trip)

Eventi in questa sezione: **23**.

| Event ID | Canonical | Technical (suggerito) | Ver | Category | Aggregate | Trigger | Meaning | Required payload | Optional | PII | Consumers | Side effects OK | Side effects NO | Idem | Ord | Audit | Retention | SoT | Status |
|----------|-----------|----------------------|-----|----------|-----------|---------|---------|------------------|----------|-----|-----------|-----------------|-----------------|------|-----|-------|-----------|-----|--------|
| EVT-OPS-001 | `Operations.DriverEnRoute` | `driver_en_route` | 0.1.0 | Domain | Trip | Operational SM MC-OS-014 | Ops Trip: DriverEnRoute | trip_id,service_id,tenant_id | evidence_ref,geo_ref | NONE | Notification, Dispatch, Settlement, Support, Analytics | Trip projections; notify eval | Rewrite Booking commercial state; store raw GPS forever without policy | Y | N | Y | OPEN | MC-OS-014 | APPROVED |
| EVT-OPS-002 | `Operations.DriverArrived` | `driver_arrived` | 0.1.0 | Domain | Trip | Operational SM MC-OS-014 | Ops Trip: DriverArrived | trip_id,service_id,tenant_id | evidence_ref,geo_ref | NONE | Notification, Dispatch, Settlement, Support, Analytics | Trip projections; notify eval | Rewrite Booking commercial state; store raw GPS forever without policy | Y | Y | Y | OPEN | MC-OS-014 | APPROVED |
| EVT-OPS-003 | `Operations.ProofOfArrivalRecorded` | `proof_of_arrival_recorded` | 0.1.0 | Audit | Trip | Operational SM MC-OS-014 | Ops Trip: ProofOfArrivalRecorded | trip_id,service_id,tenant_id | evidence_ref,geo_ref | NONE | Notification, Dispatch, Settlement, Support, Analytics | Trip projections; notify eval | Rewrite Booking commercial state; store raw GPS forever without policy | Y | N | Y | OPEN | MC-OS-014 | PROPOSED |
| EVT-OPS-004 | `Operations.WaitingStarted` | `waiting_started` | 0.1.0 | Domain | Trip | Operational SM MC-OS-014 | Ops Trip: WaitingStarted | trip_id,service_id,tenant_id | evidence_ref,geo_ref | NONE | Notification, Dispatch, Settlement, Support, Analytics | Trip projections; notify eval | Rewrite Booking commercial state; store raw GPS forever without policy | Y | N | Y | OPEN | MC-OS-014 | PROPOSED |
| EVT-OPS-005 | `Operations.WaitingThresholdReached` | `waiting_threshold_reached` | 0.1.0 | Domain | Trip | Operational SM MC-OS-014 | Ops Trip: WaitingThresholdReached | trip_id,service_id,tenant_id | evidence_ref,geo_ref | NONE | Notification, Dispatch, Settlement, Support, Analytics | Trip projections; notify eval | Rewrite Booking commercial state; store raw GPS forever without policy | Y | N | Y | OPEN | MC-OS-014 | PROPOSED |
| EVT-OPS-006 | `Operations.PassengerContactAttempted` | `passenger_contact_attempted` | 0.1.0 | Domain | Trip | Operational SM MC-OS-014 | Ops Trip: PassengerContactAttempted | trip_id,service_id,tenant_id | evidence_ref,geo_ref | MIN | Notification, Dispatch, Settlement, Support, Analytics | Trip projections; notify eval | Rewrite Booking commercial state; store raw GPS forever without policy | Y | N | Y | OPEN | MC-OS-014 | PROPOSED |
| EVT-OPS-007 | `Operations.PassengerOnBoard` | `passenger_on_board` | 0.1.0 | Domain | Trip | Operational SM MC-OS-014 | Ops Trip: PassengerOnBoard | trip_id,service_id,tenant_id | evidence_ref,geo_ref | NONE | Notification, Dispatch, Settlement, Support, Analytics | Trip projections; notify eval | Rewrite Booking commercial state; store raw GPS forever without policy | Y | N | Y | OPEN | MC-OS-014 | PROPOSED |
| EVT-OPS-008 | `Operations.ServiceStarted` | `service_started` | 0.1.0 | Domain | Trip | Operational SM MC-OS-014 | Ops Trip: ServiceStarted | trip_id,service_id,tenant_id | evidence_ref,geo_ref | NONE | Notification, Dispatch, Settlement, Support, Analytics | Trip projections; notify eval | Rewrite Booking commercial state; store raw GPS forever without policy | Y | Y | Y | OPEN | MC-OS-014 | APPROVED |
| EVT-OPS-009 | `Operations.StopReached` | `stop_reached` | 0.1.0 | Domain | Trip | Operational SM MC-OS-014 | Ops Trip: StopReached | trip_id,service_id,tenant_id | evidence_ref,geo_ref | NONE | Notification, Dispatch, Settlement, Support, Analytics | Trip projections; notify eval | Rewrite Booking commercial state; store raw GPS forever without policy | Y | N | Y | OPEN | MC-OS-014 | PROPOSED |
| EVT-OPS-010 | `Operations.StopCompleted` | `stop_completed` | 0.1.0 | Domain | Trip | Operational SM MC-OS-014 | Ops Trip: StopCompleted | trip_id,service_id,tenant_id | evidence_ref,geo_ref | NONE | Notification, Dispatch, Settlement, Support, Analytics | Trip projections; notify eval | Rewrite Booking commercial state; store raw GPS forever without policy | Y | N | Y | OPEN | MC-OS-014 | PROPOSED |
| EVT-OPS-011 | `Operations.AdditionalStopRequested` | `additional_stop_requested` | 0.1.0 | Domain | Trip | Operational SM MC-OS-014 | Ops Trip: AdditionalStopRequested | trip_id,service_id,tenant_id | evidence_ref,geo_ref | NONE | Notification, Dispatch, Settlement, Support, Analytics | Trip projections; notify eval | Rewrite Booking commercial state; store raw GPS forever without policy | Y | N | Y | OPEN | MC-OS-014 | PROPOSED |
| EVT-OPS-012 | `Operations.AdditionalStopApproved` | `additional_stop_approved` | 0.1.0 | Domain | Trip | Operational SM MC-OS-014 | Ops Trip: AdditionalStopApproved | trip_id,service_id,tenant_id | evidence_ref,geo_ref | NONE | Notification, Dispatch, Settlement, Support, Analytics | Trip projections; notify eval | Rewrite Booking commercial state; store raw GPS forever without policy | Y | N | Y | OPEN | MC-OS-014 | PROPOSED |
| EVT-OPS-013 | `Operations.ServiceDelayed` | `service_delayed` | 0.1.0 | Domain | Trip | Operational SM MC-OS-014 | Ops Trip: ServiceDelayed | trip_id,service_id,tenant_id | evidence_ref,geo_ref | NONE | Notification, Dispatch, Settlement, Support, Analytics | Trip projections; notify eval | Rewrite Booking commercial state; store raw GPS forever without policy | Y | N | Y | OPEN | MC-OS-014 | PROPOSED |
| EVT-OPS-014 | `Operations.ServiceInterrupted` | `service_interrupted` | 0.1.0 | Domain | Trip | Operational SM MC-OS-014 | Ops Trip: ServiceInterrupted | trip_id,service_id,tenant_id | evidence_ref,geo_ref | NONE | Notification, Dispatch, Settlement, Support, Analytics | Trip projections; notify eval | Rewrite Booking commercial state; store raw GPS forever without policy | Y | N | Y | OPEN | MC-OS-014 | PROPOSED |
| EVT-OPS-015 | `Operations.ServiceResumed` | `service_resumed` | 0.1.0 | Domain | Trip | Operational SM MC-OS-014 | Ops Trip: ServiceResumed | trip_id,service_id,tenant_id | evidence_ref,geo_ref | NONE | Notification, Dispatch, Settlement, Support, Analytics | Trip projections; notify eval | Rewrite Booking commercial state; store raw GPS forever without policy | Y | N | Y | OPEN | MC-OS-014 | PROPOSED |
| EVT-OPS-016 | `Operations.ServiceCompleted` | `service_completed` | 0.1.0 | Domain | Trip | Operational SM MC-OS-014 | Ops Trip: ServiceCompleted | trip_id,service_id,tenant_id | evidence_ref,geo_ref | NONE | Notification, Dispatch, Settlement, Support, Analytics | Trip projections; notify eval | Rewrite Booking commercial state; store raw GPS forever without policy | Y | Y | Y | OPEN | MC-OS-014 | APPROVED |
| EVT-OPS-017 | `Operations.ServicePartiallyCompleted` | `service_partially_completed` | 0.1.0 | Domain | Trip | Operational SM MC-OS-014 | Ops Trip: ServicePartiallyCompleted | trip_id,service_id,tenant_id | evidence_ref,geo_ref | NONE | Notification, Dispatch, Settlement, Support, Analytics | Trip projections; notify eval | Rewrite Booking commercial state; store raw GPS forever without policy | Y | N | Y | OPEN | MC-OS-014 | PROPOSED |
| EVT-OPS-018 | `Operations.CustomerNoShowSuspected` | `customer_no_show_suspected` | 0.1.0 | Domain | Trip | Operational SM MC-OS-014 | Ops Trip: CustomerNoShowSuspected | trip_id,service_id,tenant_id | evidence_ref,geo_ref | MIN | Notification, Dispatch, Settlement, Support, Analytics | Trip projections; notify eval | Rewrite Booking commercial state; store raw GPS forever without policy | Y | N | Y | OPEN | MC-OS-014 | PROPOSED |
| EVT-OPS-019 | `Operations.CustomerNoShowConfirmed` | `customer_no_show_confirmed` | 0.1.0 | Domain | Trip | Operational SM MC-OS-014 | Ops Trip: CustomerNoShowConfirmed | trip_id,service_id,tenant_id | evidence_ref,geo_ref | MIN | Notification, Dispatch, Settlement, Support, Analytics | Trip projections; notify eval | Rewrite Booking commercial state; store raw GPS forever without policy | Y | N | Y | OPEN | MC-OS-014 | APPROVED |
| EVT-OPS-020 | `Operations.DriverNoShowSuspected` | `driver_no_show_suspected` | 0.1.0 | Domain | Trip | Operational SM MC-OS-014 | Ops Trip: DriverNoShowSuspected | trip_id,service_id,tenant_id | evidence_ref,geo_ref | MIN | Notification, Dispatch, Settlement, Support, Analytics | Trip projections; notify eval | Rewrite Booking commercial state; store raw GPS forever without policy | Y | N | Y | OPEN | MC-OS-014 | PROPOSED |
| EVT-OPS-021 | `Operations.DriverNoShowConfirmed` | `driver_no_show_confirmed` | 0.1.0 | Domain | Trip | Operational SM MC-OS-014 | Ops Trip: DriverNoShowConfirmed | trip_id,service_id,tenant_id | evidence_ref,geo_ref | MIN | Notification, Dispatch, Settlement, Support, Analytics | Trip projections; notify eval | Rewrite Booking commercial state; store raw GPS forever without policy | Y | N | Y | OPEN | MC-OS-014 | APPROVED |
| EVT-OPS-022 | `Operations.EvidenceCaptured` | `evidence_captured` | 0.1.0 | Audit | Trip | Operational SM MC-OS-014 | Ops Trip: EvidenceCaptured | trip_id,service_id,tenant_id | evidence_ref,geo_ref | NONE | Notification, Dispatch, Settlement, Support, Analytics | Trip projections; notify eval | Rewrite Booking commercial state; store raw GPS forever without policy | Y | N | Y | OPEN | MC-OS-014 | APPROVED |
| EVT-OPS-023 | `Operations.LocationPingRecorded` | `location_ping_recorded` | 0.1.0 | Internal | Trip | Operational SM MC-OS-014 | Ops Trip: LocationPingRecorded | trip_id,service_id,tenant_id | evidence_ref,geo_ref | SENSITIVE | Notification, Dispatch, Settlement, Support, Analytics | Trip projections; notify eval | Rewrite Booking commercial state; store raw GPS forever without policy | Y | N | N | OPEN | MC-OS-014 | PROPOSED |

### Pricing Domain

Eventi in questa sezione: **21**.

| Event ID | Canonical | Technical (suggerito) | Ver | Category | Aggregate | Trigger | Meaning | Required payload | Optional | PII | Consumers | Side effects OK | Side effects NO | Idem | Ord | Audit | Retention | SoT | Status |
|----------|-----------|----------------------|-----|----------|-----------|---------|---------|------------------|----------|-----|-----------|-----------------|-----------------|------|-----|-------|-----------|-----|--------|
| EVT-PRC-001 | `Pricing.PricingRequested` | `pricing_requested` | 0.1.0 | Domain | PricingProfile | Pricing engine | Pricing: PricingRequested | quote_id|rule_id,tenant_id,money_fields | currency | NONE | Booking, Marketplace, Settlement, Analytics | Budget/quote signals | Inventare % fiscali; mutare Settlement ledger | Y | N | N | OPEN | MC-OS-017 | PROPOSED |
| EVT-PRC-002 | `Pricing.PricingRuleSelected` | `pricing_rule_selected` | 0.1.0 | Domain | PricingProfile | Pricing engine | Pricing: PricingRuleSelected | quote_id|rule_id,tenant_id,money_fields | currency | NONE | Booking, Marketplace, Settlement, Analytics | Budget/quote signals | Inventare % fiscali; mutare Settlement ledger | Y | N | N | OPEN | MC-OS-017 | PROPOSED |
| EVT-PRC-003 | `Pricing.PriceCalculated` | `price_calculated` | 0.1.0 | Financial | Quote | Pricing engine | Pricing: PriceCalculated | quote_id|rule_id,tenant_id,money_fields | currency | NONE | Booking, Marketplace, Settlement, Analytics | Budget/quote signals | Inventare % fiscali; mutare Settlement ledger | Y | N | N | OPEN | MC-OS-017 | APPROVED |
| EVT-PRC-004 | `Pricing.PriceCalculationFailed` | `price_calculation_failed` | 0.1.0 | Financial | Quote | Pricing engine | Pricing: PriceCalculationFailed | quote_id|rule_id,tenant_id,money_fields | currency | NONE | Booking, Marketplace, Settlement, Analytics | Budget/quote signals | Inventare % fiscali; mutare Settlement ledger | Y | N | N | OPEN | MC-OS-017 | PROPOSED |
| EVT-PRC-005 | `Pricing.PriceAdjusted` | `price_adjusted` | 0.1.0 | Financial | Quote | Pricing engine | Pricing: PriceAdjusted | quote_id|rule_id,tenant_id,money_fields | currency | NONE | Booking, Marketplace, Settlement, Analytics | Budget/quote signals | Inventare % fiscali; mutare Settlement ledger | Y | N | N | OPEN | MC-OS-017 | PROPOSED |
| EVT-PRC-006 | `Pricing.PriceOverridden` | `price_overridden` | 0.1.0 | Financial | Quote | Pricing engine | Pricing: PriceOverridden | quote_id|rule_id,tenant_id,money_fields | currency | NONE | Booking, Marketplace, Settlement, Analytics | Budget/quote signals | Inventare % fiscali; mutare Settlement ledger | Y | N | Y | OPEN | MC-OS-017 | PROPOSED |
| EVT-PRC-007 | `Pricing.PriceApproved` | `price_approved` | 0.1.0 | Financial | Quote | Pricing engine | Pricing: PriceApproved | quote_id|rule_id,tenant_id,money_fields | currency | NONE | Booking, Marketplace, Settlement, Analytics | Budget/quote signals | Inventare % fiscali; mutare Settlement ledger | Y | N | Y | OPEN | MC-OS-017 | PROPOSED |
| EVT-PRC-008 | `Pricing.PriceRejected` | `price_rejected` | 0.1.0 | Financial | Quote | Pricing engine | Pricing: PriceRejected | quote_id|rule_id,tenant_id,money_fields | currency | NONE | Booking, Marketplace, Settlement, Analytics | Budget/quote signals | Inventare % fiscali; mutare Settlement ledger | Y | N | N | OPEN | MC-OS-017 | PROPOSED |
| EVT-PRC-009 | `Pricing.MarginCalculated` | `margin_calculated` | 0.1.0 | Financial | PricingProfile | Pricing engine | Pricing: MarginCalculated | quote_id|rule_id,tenant_id,money_fields | currency | NONE | Booking, Marketplace, Settlement, Analytics | Budget/quote signals | Inventare % fiscali; mutare Settlement ledger | Y | N | N | OPEN | MC-OS-017 | PROPOSED |
| EVT-PRC-010 | `Pricing.MarginBelowThreshold` | `margin_below_threshold` | 0.1.0 | Financial | PricingProfile | Pricing engine | Pricing: MarginBelowThreshold | quote_id|rule_id,tenant_id,money_fields | currency | NONE | Booking, Marketplace, Settlement, Analytics | Budget/quote signals | Inventare % fiscali; mutare Settlement ledger | Y | N | N | OPEN | MC-OS-017 | APPROVED |
| EVT-PRC-011 | `Pricing.MaximumAssignmentBudgetCalculated` | `maximum_assignment_budget_calculated` | 0.1.0 | Financial | PricingProfile | Pricing engine | Pricing: MaximumAssignmentBudgetCalculated | quote_id|rule_id,tenant_id,money_fields | currency | NONE | Booking, Marketplace, Settlement, Analytics | Budget/quote signals | Inventare % fiscali; mutare Settlement ledger | Y | N | N | OPEN | MC-OS-017 | APPROVED |
| EVT-PRC-012 | `Pricing.PricingProfileCreated` | `pricing_profile_created` | 0.1.0 | Domain | PricingProfile | Pricing engine | Pricing: PricingProfileCreated | quote_id|rule_id,tenant_id,money_fields | currency | NONE | Booking, Marketplace, Settlement, Analytics | Budget/quote signals | Inventare % fiscali; mutare Settlement ledger | Y | N | N | OPEN | MC-OS-017 | PROPOSED |
| EVT-PRC-013 | `Pricing.PricingProfileUpdated` | `pricing_profile_updated` | 0.1.0 | Domain | PricingProfile | Pricing engine | Pricing: PricingProfileUpdated | quote_id|rule_id,tenant_id,money_fields | currency | NONE | Booking, Marketplace, Settlement, Analytics | Budget/quote signals | Inventare % fiscali; mutare Settlement ledger | Y | N | N | OPEN | MC-OS-017 | PROPOSED |
| EVT-PRC-014 | `Pricing.PricingRuleCreated` | `pricing_rule_created` | 0.1.0 | Domain | PricingProfile | Pricing engine | Pricing: PricingRuleCreated | quote_id|rule_id,tenant_id,money_fields | currency | NONE | Booking, Marketplace, Settlement, Analytics | Budget/quote signals | Inventare % fiscali; mutare Settlement ledger | Y | N | N | OPEN | MC-OS-017 | PROPOSED |
| EVT-PRC-015 | `Pricing.PricingRuleActivated` | `pricing_rule_activated` | 0.1.0 | Domain | PricingProfile | Pricing engine | Pricing: PricingRuleActivated | quote_id|rule_id,tenant_id,money_fields | currency | NONE | Booking, Marketplace, Settlement, Analytics | Budget/quote signals | Inventare % fiscali; mutare Settlement ledger | Y | N | N | OPEN | MC-OS-017 | PROPOSED |
| EVT-PRC-016 | `Pricing.PricingRuleDeactivated` | `pricing_rule_deactivated` | 0.1.0 | Domain | PricingProfile | Pricing engine | Pricing: PricingRuleDeactivated | quote_id|rule_id,tenant_id,money_fields | currency | NONE | Booking, Marketplace, Settlement, Analytics | Budget/quote signals | Inventare % fiscali; mutare Settlement ledger | Y | N | N | OPEN | MC-OS-017 | PROPOSED |
| EVT-PRC-017 | `Pricing.QuotePriceLocked` | `quote_price_locked` | 0.1.0 | Financial | Quote | Pricing engine | Pricing: QuotePriceLocked | quote_id|rule_id,tenant_id,money_fields | currency | NONE | Booking, Marketplace, Settlement, Analytics | Budget/quote signals | Inventare % fiscali; mutare Settlement ledger | Y | N | N | OPEN | MC-OS-017 | APPROVED |
| EVT-PRC-018 | `Pricing.QuotePriceExpired` | `quote_price_expired` | 0.1.0 | Financial | Quote | Pricing engine | Pricing: QuotePriceExpired | quote_id|rule_id,tenant_id,money_fields | currency | NONE | Booking, Marketplace, Settlement, Analytics | Budget/quote signals | Inventare % fiscali; mutare Settlement ledger | Y | N | N | OPEN | MC-OS-017 | PROPOSED |
| EVT-PRC-019 | `Pricing.ExchangePriceCalculated` | `exchange_price_calculated` | 0.1.0 | Financial | Quote | Pricing engine | Pricing: ExchangePriceCalculated | quote_id|rule_id,tenant_id,money_fields | currency | NONE | Booking, Marketplace, Settlement, Analytics | Budget/quote signals | Inventare % fiscali; mutare Settlement ledger | Y | N | N | OPEN | MC-OS-017 | PROPOSED |
| EVT-PRC-020 | `Pricing.PlatformFeeCalculated` | `platform_fee_calculated` | 0.1.0 | Financial | PricingProfile | Pricing engine | Pricing: PlatformFeeCalculated | quote_id|rule_id,tenant_id,money_fields | currency | NONE | Booking, Marketplace, Settlement, Analytics | Budget/quote signals | Inventare % fiscali; mutare Settlement ledger | Y | N | N | OPEN | MC-OS-017 | APPROVED |
| EVT-PRC-021 | `Pricing.ExecutorNetCalculated` | `executor_net_calculated` | 0.1.0 | Financial | PricingProfile | Pricing engine | Pricing: ExecutorNetCalculated | quote_id|rule_id,tenant_id,money_fields | currency | NONE | Booking, Marketplace, Settlement, Analytics | Budget/quote signals | Inventare % fiscali; mutare Settlement ledger | Y | N | N | OPEN | MC-OS-017 | PROPOSED |

### Payment Domain

Eventi in questa sezione: **21**.

| Event ID | Canonical | Technical (suggerito) | Ver | Category | Aggregate | Trigger | Meaning | Required payload | Optional | PII | Consumers | Side effects OK | Side effects NO | Idem | Ord | Audit | Retention | SoT | Status |
|----------|-----------|----------------------|-----|----------|-----------|---------|---------|------------------|----------|-----|-----------|-----------------|-----------------|------|-----|-------|-----------|-----|--------|
| EVT-PAY-001 | `Payment.PaymentIntentCreated` | `payment_intent_created` | 0.1.0 | Financial | Payment | Payment orchestration | Payment: PaymentIntentCreated | payment_id,booking_id?,tenant_id,amount,currency | psp_ref | NONE | Booking, Finance, Settlement, Notification, Support | Update payment aggregate; ledger signals | Card PAN/CVV in payload; overwrite captured amount | Y | Y | Y | OPEN | MC-OS-006 | PROPOSED |
| EVT-PAY-002 | `Payment.PaymentAuthorizationRequested` | `payment_authorization_requested` | 0.1.0 | Financial | Payment | Payment orchestration | Payment: PaymentAuthorizationRequested | payment_id,booking_id?,tenant_id,amount,currency | psp_ref | NONE | Booking, Finance, Settlement, Notification, Support | Update payment aggregate; ledger signals | Card PAN/CVV in payload; overwrite captured amount | Y | Y | Y | OPEN | MC-OS-006 | PROPOSED |
| EVT-PAY-003 | `Payment.PaymentAuthorized` | `payment_authorized` | 0.1.0 | Financial | Payment | Payment orchestration | Payment: PaymentAuthorized | payment_id,booking_id?,tenant_id,amount,currency | psp_ref | NONE | Booking, Finance, Settlement, Notification, Support | Update payment aggregate; ledger signals | Card PAN/CVV in payload; overwrite captured amount | Y | Y | Y | OPEN | MC-OS-006 | APPROVED |
| EVT-PAY-004 | `Payment.PaymentAuthorizationFailed` | `payment_authorization_failed` | 0.1.0 | Financial | Payment | Payment orchestration | Payment: PaymentAuthorizationFailed | payment_id,booking_id?,tenant_id,amount,currency | psp_ref | NONE | Booking, Finance, Settlement, Notification, Support | Update payment aggregate; ledger signals | Card PAN/CVV in payload; overwrite captured amount | Y | Y | Y | OPEN | MC-OS-006 | PROPOSED |
| EVT-PAY-005 | `Payment.PaymentCaptureRequested` | `payment_capture_requested` | 0.1.0 | Financial | Payment | Payment orchestration | Payment: PaymentCaptureRequested | payment_id,booking_id?,tenant_id,amount,currency | psp_ref | NONE | Booking, Finance, Settlement, Notification, Support | Update payment aggregate; ledger signals | Card PAN/CVV in payload; overwrite captured amount | Y | Y | Y | OPEN | MC-OS-006 | PROPOSED |
| EVT-PAY-006 | `Payment.PaymentCaptured` | `payment_captured` | 0.1.0 | Financial | Payment | Payment orchestration | Payment: PaymentCaptured | payment_id,booking_id?,tenant_id,amount,currency | psp_ref | NONE | Booking, Finance, Settlement, Notification, Support | Update payment aggregate; ledger signals | Card PAN/CVV in payload; overwrite captured amount | Y | Y | Y | OPEN | MC-OS-006 | APPROVED |
| EVT-PAY-007 | `Payment.PaymentCaptureFailed` | `payment_capture_failed` | 0.1.0 | Financial | Payment | Payment orchestration | Payment: PaymentCaptureFailed | payment_id,booking_id?,tenant_id,amount,currency | psp_ref | NONE | Booking, Finance, Settlement, Notification, Support | Update payment aggregate; ledger signals | Card PAN/CVV in payload; overwrite captured amount | Y | Y | Y | OPEN | MC-OS-006 | PROPOSED |
| EVT-PAY-008 | `Payment.PaymentFailed` | `payment_failed` | 0.1.0 | Financial | Payment | Payment orchestration | Payment: PaymentFailed | payment_id,booking_id?,tenant_id,amount,currency | psp_ref | NONE | Booking, Finance, Settlement, Notification, Support | Update payment aggregate; ledger signals | Card PAN/CVV in payload; overwrite captured amount | Y | Y | Y | OPEN | MC-OS-006 | PROPOSED |
| EVT-PAY-009 | `Payment.PaymentCancelled` | `payment_cancelled` | 0.1.0 | Financial | Payment | Payment orchestration | Payment: PaymentCancelled | payment_id,booking_id?,tenant_id,amount,currency | psp_ref | NONE | Booking, Finance, Settlement, Notification, Support | Update payment aggregate; ledger signals | Card PAN/CVV in payload; overwrite captured amount | Y | Y | Y | OPEN | MC-OS-006 | PROPOSED |
| EVT-PAY-010 | `Payment.PaymentVoided` | `payment_voided` | 0.1.0 | Financial | Payment | Payment orchestration | Payment: PaymentVoided | payment_id,booking_id?,tenant_id,amount,currency | psp_ref | NONE | Booking, Finance, Settlement, Notification, Support | Update payment aggregate; ledger signals | Card PAN/CVV in payload; overwrite captured amount | Y | Y | Y | OPEN | MC-OS-006 | PROPOSED |
| EVT-PAY-011 | `Payment.PaymentExpired` | `payment_expired` | 0.1.0 | Financial | Payment | Payment orchestration | Payment: PaymentExpired | payment_id,booking_id?,tenant_id,amount,currency | psp_ref | NONE | Booking, Finance, Settlement, Notification, Support | Update payment aggregate; ledger signals | Card PAN/CVV in payload; overwrite captured amount | Y | Y | Y | OPEN | MC-OS-006 | PROPOSED |
| EVT-PAY-012 | `Payment.PaymentMethodAdded` | `payment_method_added` | 0.1.0 | Financial | Payment | Payment orchestration | Payment: PaymentMethodAdded | payment_id,booking_id?,tenant_id,amount,currency | psp_ref | NONE | Booking, Finance, Settlement, Notification, Support | Update payment aggregate; ledger signals | Card PAN/CVV in payload; overwrite captured amount | Y | Y | Y | OPEN | MC-OS-006 | PROPOSED |
| EVT-PAY-013 | `Payment.PaymentMethodRejected` | `payment_method_rejected` | 0.1.0 | Financial | Payment | Payment orchestration | Payment: PaymentMethodRejected | payment_id,booking_id?,tenant_id,amount,currency | psp_ref | NONE | Booking, Finance, Settlement, Notification, Support | Update payment aggregate; ledger signals | Card PAN/CVV in payload; overwrite captured amount | Y | Y | Y | OPEN | MC-OS-006 | PROPOSED |
| EVT-PAY-014 | `Payment.PaymentFeeCalculated` | `payment_fee_calculated` | 0.1.0 | Financial | Payment | Payment orchestration | Payment: PaymentFeeCalculated | payment_id,booking_id?,tenant_id,amount,currency | psp_ref | NONE | Booking, Finance, Settlement, Notification, Support | Update payment aggregate; ledger signals | Card PAN/CVV in payload; overwrite captured amount | Y | Y | Y | OPEN | MC-OS-006 | PROPOSED |
| EVT-PAY-015 | `Payment.PaymentRefundRequested` | `payment_refund_requested` | 0.1.0 | Financial | Payment | Payment orchestration | Payment: PaymentRefundRequested | payment_id,booking_id?,tenant_id,amount,currency | psp_ref | NONE | Booking, Finance, Settlement, Notification, Support | Update payment aggregate; ledger signals | Card PAN/CVV in payload; overwrite captured amount | Y | Y | Y | OPEN | MC-OS-006 | PROPOSED |
| EVT-PAY-016 | `Payment.PaymentRefunded` | `payment_refunded` | 0.1.0 | Financial | Payment | Payment orchestration | Payment: PaymentRefunded | payment_id,booking_id?,tenant_id,amount,currency | psp_ref | NONE | Booking, Finance, Settlement, Notification, Support | Update payment aggregate; ledger signals | Card PAN/CVV in payload; overwrite captured amount | Y | Y | Y | OPEN | MC-OS-006 | APPROVED |
| EVT-PAY-017 | `Payment.PaymentRefundFailed` | `payment_refund_failed` | 0.1.0 | Financial | Payment | Payment orchestration | Payment: PaymentRefundFailed | payment_id,booking_id?,tenant_id,amount,currency | psp_ref | NONE | Booking, Finance, Settlement, Notification, Support | Update payment aggregate; ledger signals | Card PAN/CVV in payload; overwrite captured amount | Y | Y | Y | OPEN | MC-OS-006 | PROPOSED |
| EVT-PAY-018 | `Payment.ChargebackOpened` | `chargeback_opened` | 0.1.0 | Financial | Payment | Payment orchestration | Payment: ChargebackOpened | payment_id,booking_id?,tenant_id,amount,currency | psp_ref | NONE | Booking, Finance, Settlement, Notification, Support | Update payment aggregate; ledger signals | Card PAN/CVV in payload; overwrite captured amount | Y | Y | Y | OPEN | MC-OS-006 | APPROVED |
| EVT-PAY-019 | `Payment.ChargebackEvidenceSubmitted` | `chargeback_evidence_submitted` | 0.1.0 | Financial | Payment | Payment orchestration | Payment: ChargebackEvidenceSubmitted | payment_id,booking_id?,tenant_id,amount,currency | psp_ref | NONE | Booking, Finance, Settlement, Notification, Support | Update payment aggregate; ledger signals | Card PAN/CVV in payload; overwrite captured amount | Y | Y | Y | OPEN | MC-OS-006 | PROPOSED |
| EVT-PAY-020 | `Payment.ChargebackWon` | `chargeback_won` | 0.1.0 | Financial | Payment | Payment orchestration | Payment: ChargebackWon | payment_id,booking_id?,tenant_id,amount,currency | psp_ref | NONE | Booking, Finance, Settlement, Notification, Support | Update payment aggregate; ledger signals | Card PAN/CVV in payload; overwrite captured amount | Y | Y | Y | OPEN | MC-OS-006 | PROPOSED |
| EVT-PAY-021 | `Payment.ChargebackLost` | `chargeback_lost` | 0.1.0 | Financial | Payment | Payment orchestration | Payment: ChargebackLost | payment_id,booking_id?,tenant_id,amount,currency | psp_ref | NONE | Booking, Finance, Settlement, Notification, Support | Update payment aggregate; ledger signals | Card PAN/CVV in payload; overwrite captured amount | Y | Y | Y | OPEN | MC-OS-006 | PROPOSED |

### Settlement Domain

Eventi in questa sezione: **23**.

| Event ID | Canonical | Technical (suggerito) | Ver | Category | Aggregate | Trigger | Meaning | Required payload | Optional | PII | Consumers | Side effects OK | Side effects NO | Idem | Ord | Audit | Retention | SoT | Status |
|----------|-----------|----------------------|-----|----------|-----------|---------|---------|------------------|----------|-----|-----------|-----------------|-----------------|------|-----|-------|-----------|-----|--------|
| EVT-STL-001 | `Settlement.SettlementEligibilityEvaluated` | `settlement_eligibility_evaluated` | 0.1.0 | Financial | Settlement | SFOF lifecycle | Settlement: SettlementEligibilityEvaluated | settlement_id|payout_id,tenant_id,money_fields | reason_code,evidence_ref | NONE | Finance, Partner, Payment, Notification, Support | Ledger posting signals; payout prep | Mute overwrite history; holdback senza reason | Y | Y | Y | OPEN | MC-OS-006 | PROPOSED |
| EVT-STL-002 | `Settlement.SettlementCreated` | `settlement_created` | 0.1.0 | Financial | Settlement | SFOF lifecycle | Settlement: SettlementCreated | settlement_id|payout_id,tenant_id,money_fields | reason_code,evidence_ref | NONE | Finance, Partner, Payment, Notification, Support | Ledger posting signals; payout prep | Mute overwrite history; holdback senza reason | Y | Y | Y | OPEN | MC-OS-006 | APPROVED |
| EVT-STL-003 | `Settlement.SettlementLineCreated` | `settlement_line_created` | 0.1.0 | Financial | Settlement | SFOF lifecycle | Settlement: SettlementLineCreated | settlement_id|payout_id,tenant_id,money_fields | reason_code,evidence_ref | NONE | Finance, Partner, Payment, Notification, Support | Ledger posting signals; payout prep | Mute overwrite history; holdback senza reason | Y | Y | Y | OPEN | MC-OS-006 | PROPOSED |
| EVT-STL-004 | `Settlement.SettlementPendingValidation` | `settlement_pending_validation` | 0.1.0 | Financial | Settlement | SFOF lifecycle | Settlement: SettlementPendingValidation | settlement_id|payout_id,tenant_id,money_fields | reason_code,evidence_ref | NONE | Finance, Partner, Payment, Notification, Support | Ledger posting signals; payout prep | Mute overwrite history; holdback senza reason | Y | Y | Y | OPEN | MC-OS-006 | PROPOSED |
| EVT-STL-005 | `Settlement.SettlementAutoApproved` | `settlement_auto_approved` | 0.1.0 | Financial | Settlement | SFOF lifecycle | Settlement: SettlementAutoApproved | settlement_id|payout_id,tenant_id,money_fields | reason_code,evidence_ref | NONE | Finance, Partner, Payment, Notification, Support | Ledger posting signals; payout prep | Mute overwrite history; holdback senza reason | Y | Y | Y | OPEN | MC-OS-006 | PROPOSED |
| EVT-STL-006 | `Settlement.SettlementApproved` | `settlement_approved` | 0.1.0 | Financial | Settlement | SFOF lifecycle | Settlement: SettlementApproved | settlement_id|payout_id,tenant_id,money_fields | reason_code,evidence_ref | NONE | Finance, Partner, Payment, Notification, Support | Ledger posting signals; payout prep | Mute overwrite history; holdback senza reason | Y | Y | Y | OPEN | MC-OS-006 | APPROVED |
| EVT-STL-007 | `Settlement.SettlementPartiallyApproved` | `settlement_partially_approved` | 0.1.0 | Financial | Settlement | SFOF lifecycle | Settlement: SettlementPartiallyApproved | settlement_id|payout_id,tenant_id,money_fields | reason_code,evidence_ref | NONE | Finance, Partner, Payment, Notification, Support | Ledger posting signals; payout prep | Mute overwrite history; holdback senza reason | Y | Y | Y | OPEN | MC-OS-006 | PROPOSED |
| EVT-STL-008 | `Settlement.SettlementRejected` | `settlement_rejected` | 0.1.0 | Financial | Settlement | SFOF lifecycle | Settlement: SettlementRejected | settlement_id|payout_id,tenant_id,money_fields | reason_code,evidence_ref | NONE | Finance, Partner, Payment, Notification, Support | Ledger posting signals; payout prep | Mute overwrite history; holdback senza reason | Y | Y | Y | OPEN | MC-OS-006 | PROPOSED |
| EVT-STL-009 | `Settlement.SettlementDisputed` | `settlement_disputed` | 0.1.0 | Financial | Settlement | SFOF lifecycle | Settlement: SettlementDisputed | settlement_id|payout_id,tenant_id,money_fields | reason_code,evidence_ref | NONE | Finance, Partner, Payment, Notification, Support | Ledger posting signals; payout prep | Mute overwrite history; holdback senza reason | Y | Y | Y | OPEN | MC-OS-006 | PROPOSED |
| EVT-STL-010 | `Settlement.SettlementAdjusted` | `settlement_adjusted` | 0.1.0 | Financial | Settlement | SFOF lifecycle | Settlement: SettlementAdjusted | settlement_id|payout_id,tenant_id,money_fields | reason_code,evidence_ref | NONE | Finance, Partner, Payment, Notification, Support | Ledger posting signals; payout prep | Mute overwrite history; holdback senza reason | Y | Y | Y | OPEN | MC-OS-006 | PROPOSED |
| EVT-STL-011 | `Settlement.SettlementClosed` | `settlement_closed` | 0.1.0 | Financial | Settlement | SFOF lifecycle | Settlement: SettlementClosed | settlement_id|payout_id,tenant_id,money_fields | reason_code,evidence_ref | NONE | Finance, Partner, Payment, Notification, Support | Ledger posting signals; payout prep | Mute overwrite history; holdback senza reason | Y | Y | Y | OPEN | MC-OS-006 | PROPOSED |
| EVT-STL-012 | `Settlement.HoldbackCreated` | `holdback_created` | 0.1.0 | Financial | Holdback | SFOF lifecycle | Settlement: HoldbackCreated | settlement_id|payout_id,tenant_id,money_fields | reason_code,evidence_ref | NONE | Finance, Partner, Payment, Notification, Support | Ledger posting signals; payout prep | Mute overwrite history; holdback senza reason | Y | Y | Y | OPEN | MC-OS-006 | APPROVED |
| EVT-STL-013 | `Settlement.HoldbackReleased` | `holdback_released` | 0.1.0 | Financial | Holdback | SFOF lifecycle | Settlement: HoldbackReleased | settlement_id|payout_id,tenant_id,money_fields | reason_code,evidence_ref | NONE | Finance, Partner, Payment, Notification, Support | Ledger posting signals; payout prep | Mute overwrite history; holdback senza reason | Y | Y | Y | OPEN | MC-OS-006 | PROPOSED |
| EVT-STL-014 | `Settlement.ReserveCreated` | `reserve_created` | 0.1.0 | Financial | Holdback | SFOF lifecycle | Settlement: ReserveCreated | settlement_id|payout_id,tenant_id,money_fields | reason_code,evidence_ref | NONE | Finance, Partner, Payment, Notification, Support | Ledger posting signals; payout prep | Mute overwrite history; holdback senza reason | Y | Y | Y | OPEN | MC-OS-006 | PROPOSED |
| EVT-STL-015 | `Settlement.ReserveAdjusted` | `reserve_adjusted` | 0.1.0 | Financial | Holdback | SFOF lifecycle | Settlement: ReserveAdjusted | settlement_id|payout_id,tenant_id,money_fields | reason_code,evidence_ref | NONE | Finance, Partner, Payment, Notification, Support | Ledger posting signals; payout prep | Mute overwrite history; holdback senza reason | Y | Y | Y | OPEN | MC-OS-006 | PROPOSED |
| EVT-STL-016 | `Settlement.ReserveReleased` | `reserve_released` | 0.1.0 | Financial | Holdback | SFOF lifecycle | Settlement: ReserveReleased | settlement_id|payout_id,tenant_id,money_fields | reason_code,evidence_ref | NONE | Finance, Partner, Payment, Notification, Support | Ledger posting signals; payout prep | Mute overwrite history; holdback senza reason | Y | Y | Y | OPEN | MC-OS-006 | PROPOSED |
| EVT-STL-017 | `Settlement.PayoutScheduled` | `payout_scheduled` | 0.1.0 | Financial | PayoutInstruction | SFOF lifecycle | Settlement: PayoutScheduled | settlement_id|payout_id,tenant_id,money_fields | reason_code,evidence_ref | NONE | Finance, Partner, Payment, Notification, Support | Ledger posting signals; payout prep | Mute overwrite history; holdback senza reason | Y | Y | Y | OPEN | MC-OS-006 | PROPOSED |
| EVT-STL-018 | `Settlement.PayoutBatchCreated` | `payout_batch_created` | 0.1.0 | Financial | PayoutInstruction | SFOF lifecycle | Settlement: PayoutBatchCreated | settlement_id|payout_id,tenant_id,money_fields | reason_code,evidence_ref | NONE | Finance, Partner, Payment, Notification, Support | Ledger posting signals; payout prep | Mute overwrite history; holdback senza reason | Y | Y | Y | OPEN | MC-OS-006 | PROPOSED |
| EVT-STL-019 | `Settlement.PayoutRequested` | `payout_requested` | 0.1.0 | Financial | PayoutInstruction | SFOF lifecycle | Settlement: PayoutRequested | settlement_id|payout_id,tenant_id,money_fields | reason_code,evidence_ref | NONE | Finance, Partner, Payment, Notification, Support | Ledger posting signals; payout prep | Mute overwrite history; holdback senza reason | Y | Y | Y | OPEN | MC-OS-006 | PROPOSED |
| EVT-STL-020 | `Settlement.PayoutProcessing` | `payout_processing` | 0.1.0 | Financial | PayoutInstruction | SFOF lifecycle | Settlement: PayoutProcessing | settlement_id|payout_id,tenant_id,money_fields | reason_code,evidence_ref | NONE | Finance, Partner, Payment, Notification, Support | Ledger posting signals; payout prep | Mute overwrite history; holdback senza reason | Y | Y | Y | OPEN | MC-OS-006 | PROPOSED |
| EVT-STL-021 | `Settlement.PayoutCompleted` | `payout_completed` | 0.1.0 | Financial | PayoutInstruction | SFOF lifecycle | Settlement: PayoutCompleted | settlement_id|payout_id,tenant_id,money_fields | reason_code,evidence_ref | NONE | Finance, Partner, Payment, Notification, Support | Ledger posting signals; payout prep | Mute overwrite history; holdback senza reason | Y | Y | Y | OPEN | MC-OS-006 | APPROVED |
| EVT-STL-022 | `Settlement.PayoutFailed` | `payout_failed` | 0.1.0 | Financial | PayoutInstruction | SFOF lifecycle | Settlement: PayoutFailed | settlement_id|payout_id,tenant_id,money_fields | reason_code,evidence_ref | NONE | Finance, Partner, Payment, Notification, Support | Ledger posting signals; payout prep | Mute overwrite history; holdback senza reason | Y | Y | Y | OPEN | MC-OS-006 | PROPOSED |
| EVT-STL-023 | `Settlement.PayoutReversed` | `payout_reversed` | 0.1.0 | Financial | PayoutInstruction | SFOF lifecycle | Settlement: PayoutReversed | settlement_id|payout_id,tenant_id,money_fields | reason_code,evidence_ref | NONE | Finance, Partner, Payment, Notification, Support | Ledger posting signals; payout prep | Mute overwrite history; holdback senza reason | Y | Y | Y | OPEN | MC-OS-006 | APPROVED |

### Finance Domain

Eventi in questa sezione: **18**.

| Event ID | Canonical | Technical (suggerito) | Ver | Category | Aggregate | Trigger | Meaning | Required payload | Optional | PII | Consumers | Side effects OK | Side effects NO | Idem | Ord | Audit | Retention | SoT | Status |
|----------|-----------|----------------------|-----|----------|-----------|---------|---------|------------------|----------|-----|-----------|-----------------|-----------------|------|-----|-------|-----------|-----|--------|
| EVT-FIN-001 | `Finance.LedgerEntryPosted` | `ledger_entry_posted` | 0.1.0 | Financial | FinancialCase | Finance ops | Finance: LedgerEntryPosted | ledger_entry_id|invoice_id,tenant_id | amount,currency | NONE | Settlement, Analytics, Compliance | Append ledger/reversal | Overwrite ledger entry; confondere Commission con Markup | Y | Y | Y | OPEN | MC-OS-006 · MC-OS-002 | APPROVED |
| EVT-FIN-002 | `Finance.LedgerReversalPosted` | `ledger_reversal_posted` | 0.1.0 | Financial | FinancialCase | Finance ops | Finance: LedgerReversalPosted | ledger_entry_id|invoice_id,tenant_id | amount,currency | NONE | Settlement, Analytics, Compliance | Append ledger/reversal | Overwrite ledger entry; confondere Commission con Markup | Y | Y | Y | OPEN | MC-OS-006 · MC-OS-002 | APPROVED |
| EVT-FIN-003 | `Finance.WalletCreated` | `wallet_created` | 0.1.0 | Financial | FinancialCase | Finance ops | Finance: WalletCreated | ledger_entry_id|invoice_id,tenant_id | amount,currency | NONE | Settlement, Analytics, Compliance | Append ledger/reversal | Overwrite ledger entry; confondere Commission con Markup | Y | Y | Y | OPEN | MC-OS-006 · MC-OS-002 | PROPOSED |
| EVT-FIN-004 | `Finance.WalletBalanceProjected` | `wallet_balance_projected` | 0.1.0 | Financial | FinancialCase | Finance ops | Finance: WalletBalanceProjected | ledger_entry_id|invoice_id,tenant_id | amount,currency | NONE | Settlement, Analytics, Compliance | Append ledger/reversal | Overwrite ledger entry; confondere Commission con Markup | Y | Y | Y | OPEN | MC-OS-006 · MC-OS-002 | PROPOSED |
| EVT-FIN-005 | `Finance.WalletFundsReserved` | `wallet_funds_reserved` | 0.1.0 | Financial | FinancialCase | Finance ops | Finance: WalletFundsReserved | ledger_entry_id|invoice_id,tenant_id | amount,currency | NONE | Settlement, Analytics, Compliance | Append ledger/reversal | Overwrite ledger entry; confondere Commission con Markup | Y | Y | Y | OPEN | MC-OS-006 · MC-OS-002 | PROPOSED |
| EVT-FIN-006 | `Finance.WalletFundsReleased` | `wallet_funds_released` | 0.1.0 | Financial | FinancialCase | Finance ops | Finance: WalletFundsReleased | ledger_entry_id|invoice_id,tenant_id | amount,currency | NONE | Settlement, Analytics, Compliance | Append ledger/reversal | Overwrite ledger entry; confondere Commission con Markup | Y | Y | Y | OPEN | MC-OS-006 · MC-OS-002 | PROPOSED |
| EVT-FIN-007 | `Finance.WalletFundsDisputed` | `wallet_funds_disputed` | 0.1.0 | Financial | FinancialCase | Finance ops | Finance: WalletFundsDisputed | ledger_entry_id|invoice_id,tenant_id | amount,currency | NONE | Settlement, Analytics, Compliance | Append ledger/reversal | Overwrite ledger entry; confondere Commission con Markup | Y | Y | Y | OPEN | MC-OS-006 · MC-OS-002 | PROPOSED |
| EVT-FIN-008 | `Finance.PlatformRevenueRecognized` | `platform_revenue_recognized` | 0.1.0 | Financial | FinancialCase | Finance ops | Riconoscimento fiscale definitivo OPEN | ledger_entry_id|invoice_id,tenant_id | amount,currency | NONE | Settlement, Analytics, Compliance | Append ledger/reversal | Overwrite ledger entry; confondere Commission con Markup | Y | Y | Y | OPEN | MC-OS-006 · MC-OS-002 | APPROVED |
| EVT-FIN-009 | `Finance.CommissionRecognized` | `commission_recognized` | 0.1.0 | Financial | FinancialCase | Finance ops | Riconoscimento fiscale definitivo OPEN | ledger_entry_id|invoice_id,tenant_id | amount,currency | NONE | Settlement, Analytics, Compliance | Append ledger/reversal | Overwrite ledger entry; confondere Commission con Markup | Y | Y | Y | OPEN | MC-OS-006 · MC-OS-002 | APPROVED |
| EVT-FIN-010 | `Finance.InvoiceRequested` | `invoice_requested` | 0.1.0 | Financial | FinancialCase | Finance ops | Riconoscimento fiscale definitivo OPEN | ledger_entry_id|invoice_id,tenant_id | amount,currency | NONE | Settlement, Analytics, Compliance | Append ledger/reversal | Overwrite ledger entry; confondere Commission con Markup | Y | Y | Y | OPEN | MC-OS-006 · MC-OS-002 | PROPOSED |
| EVT-FIN-011 | `Finance.InvoiceGenerated` | `invoice_generated` | 0.1.0 | Financial | FinancialCase | Finance ops | Riconoscimento fiscale definitivo OPEN | ledger_entry_id|invoice_id,tenant_id | amount,currency | NONE | Settlement, Analytics, Compliance | Append ledger/reversal | Overwrite ledger entry; confondere Commission con Markup | Y | Y | Y | OPEN | MC-OS-006 · MC-OS-002 | PROPOSED |
| EVT-FIN-012 | `Finance.InvoiceIssued` | `invoice_issued` | 0.1.0 | Financial | FinancialCase | Finance ops | Riconoscimento fiscale definitivo OPEN | ledger_entry_id|invoice_id,tenant_id | amount,currency | NONE | Settlement, Analytics, Compliance | Append ledger/reversal | Overwrite ledger entry; confondere Commission con Markup | Y | Y | Y | OPEN | MC-OS-006 · MC-OS-002 | PROPOSED |
| EVT-FIN-013 | `Finance.InvoiceCancelled` | `invoice_cancelled` | 0.1.0 | Financial | FinancialCase | Finance ops | Riconoscimento fiscale definitivo OPEN | ledger_entry_id|invoice_id,tenant_id | amount,currency | NONE | Settlement, Analytics, Compliance | Append ledger/reversal | Overwrite ledger entry; confondere Commission con Markup | Y | Y | Y | OPEN | MC-OS-006 · MC-OS-002 | PROPOSED |
| EVT-FIN-014 | `Finance.CreditNoteGenerated` | `credit_note_generated` | 0.1.0 | Financial | FinancialCase | Finance ops | Finance: CreditNoteGenerated | ledger_entry_id|invoice_id,tenant_id | amount,currency | NONE | Settlement, Analytics, Compliance | Append ledger/reversal | Overwrite ledger entry; confondere Commission con Markup | Y | Y | Y | OPEN | MC-OS-006 · MC-OS-002 | PROPOSED |
| EVT-FIN-015 | `Finance.ReconciliationStarted` | `reconciliation_started` | 0.1.0 | Financial | FinancialCase | Finance ops | Finance: ReconciliationStarted | ledger_entry_id|invoice_id,tenant_id | amount,currency | NONE | Settlement, Analytics, Compliance | Append ledger/reversal | Overwrite ledger entry; confondere Commission con Markup | Y | Y | Y | OPEN | MC-OS-006 · MC-OS-002 | PROPOSED |
| EVT-FIN-016 | `Finance.ReconciliationMismatchDetected` | `reconciliation_mismatch_detected` | 0.1.0 | Financial | FinancialCase | Finance ops | Finance: ReconciliationMismatchDetected | ledger_entry_id|invoice_id,tenant_id | amount,currency | NONE | Settlement, Analytics, Compliance | Append ledger/reversal | Overwrite ledger entry; confondere Commission con Markup | Y | Y | Y | OPEN | MC-OS-006 · MC-OS-002 | PROPOSED |
| EVT-FIN-017 | `Finance.ReconciliationCompleted` | `reconciliation_completed` | 0.1.0 | Financial | FinancialCase | Finance ops | Finance: ReconciliationCompleted | ledger_entry_id|invoice_id,tenant_id | amount,currency | NONE | Settlement, Analytics, Compliance | Append ledger/reversal | Overwrite ledger entry; confondere Commission con Markup | Y | Y | Y | OPEN | MC-OS-006 · MC-OS-002 | PROPOSED |
| EVT-FIN-018 | `Finance.AccountingPeriodClosed` | `accounting_period_closed` | 0.1.0 | Financial | FinancialCase | Finance ops | Finance: AccountingPeriodClosed | ledger_entry_id|invoice_id,tenant_id | amount,currency | NONE | Settlement, Analytics, Compliance | Append ledger/reversal | Overwrite ledger entry; confondere Commission con Markup | Y | Y | Y | OPEN | MC-OS-006 · MC-OS-002 | PROPOSED |

### Support Domain

Eventi in questa sezione: **18**.

| Event ID | Canonical | Technical (suggerito) | Ver | Category | Aggregate | Trigger | Meaning | Required payload | Optional | PII | Consumers | Side effects OK | Side effects NO | Idem | Ord | Audit | Retention | SoT | Status |
|----------|-----------|----------------------|-----|----------|-----------|---------|---------|------------------|----------|-----|-----------|-----------------|-----------------|------|-----|-------|-----------|-----|--------|
| EVT-SUP-001 | `Support.SupportCaseCreated` | `support_case_created` | 0.1.0 | Domain | SupportTicket | CX/Support MC-OS-018 | Support: SupportCaseCreated | case_id,booking_id?,tenant_id | reason_code | MIN | Settlement, Payment, Notification, Compliance, Booking | Case state; signals to finance | Equivalere a Chargeback; auto-refund senza policy | Y | N | Y | OPEN | MC-OS-018 | APPROVED |
| EVT-SUP-002 | `Support.SupportCaseAssigned` | `support_case_assigned` | 0.1.0 | Domain | SupportTicket | CX/Support MC-OS-018 | Support: SupportCaseAssigned | case_id,booking_id?,tenant_id | reason_code | MIN | Settlement, Payment, Notification, Compliance, Booking | Case state; signals to finance | Equivalere a Chargeback; auto-refund senza policy | Y | N | Y | OPEN | MC-OS-018 | PROPOSED |
| EVT-SUP-003 | `Support.SupportCaseEscalated` | `support_case_escalated` | 0.1.0 | Domain | SupportTicket | CX/Support MC-OS-018 | Support: SupportCaseEscalated | case_id,booking_id?,tenant_id | reason_code | MIN | Settlement, Payment, Notification, Compliance, Booking | Case state; signals to finance | Equivalere a Chargeback; auto-refund senza policy | Y | N | Y | OPEN | MC-OS-018 | PROPOSED |
| EVT-SUP-004 | `Support.SupportCaseResolved` | `support_case_resolved` | 0.1.0 | Domain | SupportTicket | CX/Support MC-OS-018 | Support: SupportCaseResolved | case_id,booking_id?,tenant_id | reason_code | MIN | Settlement, Payment, Notification, Compliance, Booking | Case state; signals to finance | Equivalere a Chargeback; auto-refund senza policy | Y | N | Y | OPEN | MC-OS-018 | PROPOSED |
| EVT-SUP-005 | `Support.DisputeOpened` | `dispute_opened` | 0.1.0 | Domain | SupportCase | CX/Support MC-OS-018 | Support: DisputeOpened | case_id,booking_id?,tenant_id | reason_code | MIN | Settlement, Payment, Notification, Compliance, Booking | Case state; signals to finance | Equivalere a Chargeback; auto-refund senza policy | Y | N | Y | OPEN | MC-OS-018 | APPROVED |
| EVT-SUP-006 | `Support.DisputeEvidenceRequested` | `dispute_evidence_requested` | 0.1.0 | Audit | SupportCase | CX/Support MC-OS-018 | Support: DisputeEvidenceRequested | case_id,booking_id?,tenant_id | reason_code | MIN | Settlement, Payment, Notification, Compliance, Booking | Case state; signals to finance | Equivalere a Chargeback; auto-refund senza policy | Y | N | Y | OPEN | MC-OS-018 | PROPOSED |
| EVT-SUP-007 | `Support.DisputeEvidenceSubmitted` | `dispute_evidence_submitted` | 0.1.0 | Audit | SupportCase | CX/Support MC-OS-018 | Support: DisputeEvidenceSubmitted | case_id,booking_id?,tenant_id | reason_code | MIN | Settlement, Payment, Notification, Compliance, Booking | Case state; signals to finance | Equivalere a Chargeback; auto-refund senza policy | Y | N | Y | OPEN | MC-OS-018 | PROPOSED |
| EVT-SUP-008 | `Support.DisputeUnderReview` | `dispute_under_review` | 0.1.0 | Domain | SupportCase | CX/Support MC-OS-018 | Support: DisputeUnderReview | case_id,booking_id?,tenant_id | reason_code | MIN | Settlement, Payment, Notification, Compliance, Booking | Case state; signals to finance | Equivalere a Chargeback; auto-refund senza policy | Y | N | Y | OPEN | MC-OS-018 | PROPOSED |
| EVT-SUP-009 | `Support.DisputePartiallyResolved` | `dispute_partially_resolved` | 0.1.0 | Domain | SupportCase | CX/Support MC-OS-018 | Support: DisputePartiallyResolved | case_id,booking_id?,tenant_id | reason_code | MIN | Settlement, Payment, Notification, Compliance, Booking | Case state; signals to finance | Equivalere a Chargeback; auto-refund senza policy | Y | N | Y | OPEN | MC-OS-018 | PROPOSED |
| EVT-SUP-010 | `Support.DisputeResolved` | `dispute_resolved` | 0.1.0 | Domain | SupportCase | CX/Support MC-OS-018 | Support: DisputeResolved | case_id,booking_id?,tenant_id | reason_code | MIN | Settlement, Payment, Notification, Compliance, Booking | Case state; signals to finance | Equivalere a Chargeback; auto-refund senza policy | Y | N | Y | OPEN | MC-OS-018 | APPROVED |
| EVT-SUP-011 | `Support.DisputeRejected` | `dispute_rejected` | 0.1.0 | Domain | SupportCase | CX/Support MC-OS-018 | Support: DisputeRejected | case_id,booking_id?,tenant_id | reason_code | MIN | Settlement, Payment, Notification, Compliance, Booking | Case state; signals to finance | Equivalere a Chargeback; auto-refund senza policy | Y | N | Y | OPEN | MC-OS-018 | PROPOSED |
| EVT-SUP-012 | `Support.AppealOpened` | `appeal_opened` | 0.1.0 | Domain | SupportCase | CX/Support MC-OS-018 | Support: AppealOpened | case_id,booking_id?,tenant_id | reason_code | MIN | Settlement, Payment, Notification, Compliance, Booking | Case state; signals to finance | Equivalere a Chargeback; auto-refund senza policy | Y | N | Y | OPEN | MC-OS-018 | PROPOSED |
| EVT-SUP-013 | `Support.AppealResolved` | `appeal_resolved` | 0.1.0 | Domain | SupportCase | CX/Support MC-OS-018 | Support: AppealResolved | case_id,booking_id?,tenant_id | reason_code | MIN | Settlement, Payment, Notification, Compliance, Booking | Case state; signals to finance | Equivalere a Chargeback; auto-refund senza policy | Y | N | Y | OPEN | MC-OS-018 | PROPOSED |
| EVT-SUP-014 | `Support.CompensationProposed` | `compensation_proposed` | 0.1.0 | Financial | SupportCase | CX/Support MC-OS-018 | Support: CompensationProposed | case_id,booking_id?,tenant_id | reason_code | MIN | Settlement, Payment, Notification, Compliance, Booking | Case state; signals to finance | Equivalere a Chargeback; auto-refund senza policy | Y | N | Y | OPEN | MC-OS-018 | PROPOSED |
| EVT-SUP-015 | `Support.CompensationApproved` | `compensation_approved` | 0.1.0 | Financial | SupportCase | CX/Support MC-OS-018 | Support: CompensationApproved | case_id,booking_id?,tenant_id | reason_code | MIN | Settlement, Payment, Notification, Compliance, Booking | Case state; signals to finance | Equivalere a Chargeback; auto-refund senza policy | Y | N | Y | OPEN | MC-OS-018 | PROPOSED |
| EVT-SUP-016 | `Support.VoucherCreated` | `voucher_created` | 0.1.0 | Financial | SupportCase | CX/Support MC-OS-018 | Support: VoucherCreated | case_id,booking_id?,tenant_id | reason_code | MIN | Settlement, Payment, Notification, Compliance, Booking | Case state; signals to finance | Equivalere a Chargeback; auto-refund senza policy | Y | N | Y | OPEN | MC-OS-018 | PROPOSED |
| EVT-SUP-017 | `Support.RecoveryCostRecorded` | `recovery_cost_recorded` | 0.1.0 | Financial | SupportCase | CX/Support MC-OS-018 | Support: RecoveryCostRecorded | case_id,booking_id?,tenant_id | reason_code | MIN | Settlement, Payment, Notification, Compliance, Booking | Case state; signals to finance | Equivalere a Chargeback; auto-refund senza policy | Y | N | Y | OPEN | MC-OS-018 | APPROVED |
| EVT-SUP-018 | `Support.ResponsiblePartyAssigned` | `responsible_party_assigned` | 0.1.0 | Domain | SupportCase | CX/Support MC-OS-018 | Support: ResponsiblePartyAssigned | case_id,booking_id?,tenant_id | reason_code | MIN | Settlement, Payment, Notification, Compliance, Booking | Case state; signals to finance | Equivalere a Chargeback; auto-refund senza policy | Y | N | Y | OPEN | MC-OS-018 | PROPOSED |

### Notification Domain

Eventi in questa sezione: **13**.

| Event ID | Canonical | Technical (suggerito) | Ver | Category | Aggregate | Trigger | Meaning | Required payload | Optional | PII | Consumers | Side effects OK | Side effects NO | Idem | Ord | Audit | Retention | SoT | Status |
|----------|-----------|----------------------|-----|----------|-----------|---------|---------|------------------|----------|-----|-----------|-----------------|-----------------|------|-----|-------|-----------|-----|--------|
| EVT-NTF-001 | `Notification.NotificationRequested` | `notification_requested` | 0.1.0 | Notification | NotificationMessage | Notification engine | Notification: NotificationRequested — non implica provider | notification_id,template_id,tenant_id | channel_code | PSEUDO | Analytics, Support | Delivery status proprio | Mutare Booking; scegliere provider nel payload business | Y | N | N | OPEN | MC-OS-016 | APPROVED |
| EVT-NTF-002 | `Notification.NotificationSuppressed` | `notification_suppressed` | 0.1.0 | Notification | NotificationMessage | Notification engine | Notification: NotificationSuppressed — non implica provider | notification_id,template_id,tenant_id | channel_code | PSEUDO | Analytics, Support | Delivery status proprio | Mutare Booking; scegliere provider nel payload business | Y | N | N | OPEN | MC-OS-016 | PROPOSED |
| EVT-NTF-003 | `Notification.NotificationQueued` | `notification_queued` | 0.1.0 | Notification | NotificationMessage | Notification engine | Notification: NotificationQueued — non implica provider | notification_id,template_id,tenant_id | channel_code | PSEUDO | Analytics, Support | Delivery status proprio | Mutare Booking; scegliere provider nel payload business | Y | N | N | OPEN | MC-OS-016 | PROPOSED |
| EVT-NTF-004 | `Notification.NotificationSent` | `notification_sent` | 0.1.0 | Notification | NotificationMessage | Notification engine | Notification: NotificationSent — non implica provider | notification_id,template_id,tenant_id | channel_code | PSEUDO | Analytics, Support | Delivery status proprio | Mutare Booking; scegliere provider nel payload business | Y | N | N | OPEN | MC-OS-016 | APPROVED |
| EVT-NTF-005 | `Notification.NotificationDelivered` | `notification_delivered` | 0.1.0 | Notification | NotificationMessage | Notification engine | Notification: NotificationDelivered — non implica provider | notification_id,template_id,tenant_id | channel_code | PSEUDO | Analytics, Support | Delivery status proprio | Mutare Booking; scegliere provider nel payload business | Y | N | N | OPEN | MC-OS-016 | PROPOSED |
| EVT-NTF-006 | `Notification.NotificationRead` | `notification_read` | 0.1.0 | Notification | NotificationMessage | Notification engine | Notification: NotificationRead — non implica provider | notification_id,template_id,tenant_id | channel_code | PSEUDO | Analytics, Support | Delivery status proprio | Mutare Booking; scegliere provider nel payload business | Y | N | N | OPEN | MC-OS-016 | PROPOSED |
| EVT-NTF-007 | `Notification.NotificationFailed` | `notification_failed` | 0.1.0 | Notification | NotificationMessage | Notification engine | Notification: NotificationFailed — non implica provider | notification_id,template_id,tenant_id | channel_code | PSEUDO | Analytics, Support | Delivery status proprio | Mutare Booking; scegliere provider nel payload business | Y | N | N | OPEN | MC-OS-016 | APPROVED |
| EVT-NTF-008 | `Notification.NotificationRetryScheduled` | `notification_retry_scheduled` | 0.1.0 | Notification | NotificationMessage | Notification engine | Notification: NotificationRetryScheduled — non implica provider | notification_id,template_id,tenant_id | channel_code | PSEUDO | Analytics, Support | Delivery status proprio | Mutare Booking; scegliere provider nel payload business | Y | N | N | OPEN | MC-OS-016 | PROPOSED |
| EVT-NTF-009 | `Notification.NotificationEscalated` | `notification_escalated` | 0.1.0 | Notification | NotificationMessage | Notification engine | Notification: NotificationEscalated — non implica provider | notification_id,template_id,tenant_id | channel_code | PSEUDO | Analytics, Support | Delivery status proprio | Mutare Booking; scegliere provider nel payload business | Y | N | N | OPEN | MC-OS-016 | PROPOSED |
| EVT-NTF-010 | `Notification.TemplateCreated` | `template_created` | 0.1.0 | Notification | NotificationMessage | Notification engine | Notification: TemplateCreated — non implica provider | notification_id,template_id,tenant_id | channel_code | PSEUDO | Analytics, Support | Delivery status proprio | Mutare Booking; scegliere provider nel payload business | Y | N | N | OPEN | MC-OS-016 | PROPOSED |
| EVT-NTF-011 | `Notification.TemplateVersionPublished` | `template_version_published` | 0.1.0 | Notification | NotificationMessage | Notification engine | Notification: TemplateVersionPublished — non implica provider | notification_id,template_id,tenant_id | channel_code | PSEUDO | Analytics, Support | Delivery status proprio | Mutare Booking; scegliere provider nel payload business | Y | N | N | OPEN | MC-OS-016 | PROPOSED |
| EVT-NTF-012 | `Notification.ConsentBlockedNotification` | `consent_blocked_notification` | 0.1.0 | Notification | NotificationMessage | Notification engine | Notification: ConsentBlockedNotification — non implica provider | notification_id,template_id,tenant_id | channel_code | PSEUDO | Analytics, Support | Delivery status proprio | Mutare Booking; scegliere provider nel payload business | Y | N | Y | OPEN | MC-OS-016 | APPROVED |
| EVT-NTF-013 | `Notification.FallbackChannelSelected` | `fallback_channel_selected` | 0.1.0 | Notification | NotificationMessage | Notification engine | Notification: FallbackChannelSelected — non implica provider | notification_id,template_id,tenant_id | channel_code | PSEUDO | Analytics, Support | Delivery status proprio | Mutare Booking; scegliere provider nel payload business | Y | N | N | OPEN | MC-OS-016 | PROPOSED |

### Compliance Domain

Eventi in questa sezione: **15**.

| Event ID | Canonical | Technical (suggerito) | Ver | Category | Aggregate | Trigger | Meaning | Required payload | Optional | PII | Consumers | Side effects OK | Side effects NO | Idem | Ord | Audit | Retention | SoT | Status |
|----------|-----------|----------------------|-----|----------|-----------|---------|---------|------------------|----------|-----|-----------|-----------------|-----------------|------|-----|-------|-----------|-----|--------|
| EVT-CMP-001 | `Compliance.ComplianceCheckRequested` | `compliance_check_requested` | 0.1.0 | Domain | ComplianceCase | Compliance gates | Compliance: ComplianceCheckRequested | case_id,tenant_id | subject_ref | PSEUDO | Identity, Partner, Document, Admin | Holds/gates | Silent data purge | Y | N | Y | OPEN | MC-OS-015 · MC-OS-005 | PROPOSED |
| EVT-CMP-002 | `Compliance.ComplianceCheckPassed` | `compliance_check_passed` | 0.1.0 | Domain | ComplianceCase | Compliance gates | Compliance: ComplianceCheckPassed | case_id,tenant_id | subject_ref | PSEUDO | Identity, Partner, Document, Admin | Holds/gates | Silent data purge | Y | N | Y | OPEN | MC-OS-015 · MC-OS-005 | PROPOSED |
| EVT-CMP-003 | `Compliance.ComplianceCheckFailed` | `compliance_check_failed` | 0.1.0 | Domain | ComplianceCase | Compliance gates | Compliance: ComplianceCheckFailed | case_id,tenant_id | subject_ref | PSEUDO | Identity, Partner, Document, Admin | Holds/gates | Silent data purge | Y | N | Y | OPEN | MC-OS-015 · MC-OS-005 | PROPOSED |
| EVT-CMP-004 | `Compliance.DocumentExpiryDetected` | `document_expiry_detected` | 0.1.0 | Domain | ComplianceCase | Compliance gates | Compliance: DocumentExpiryDetected | case_id,tenant_id | subject_ref | PSEUDO | Identity, Partner, Document, Admin | Holds/gates | Silent data purge | Y | N | Y | OPEN | MC-OS-015 · MC-OS-005 | PROPOSED |
| EVT-CMP-005 | `Compliance.AccessViolationDetected` | `access_violation_detected` | 0.1.0 | Audit | ComplianceCase | Compliance gates | Compliance: AccessViolationDetected | case_id,tenant_id | subject_ref | PSEUDO | Identity, Partner, Document, Admin | Holds/gates | Silent data purge | Y | N | Y | OPEN | MC-OS-015 · MC-OS-005 | APPROVED |
| EVT-CMP-006 | `Compliance.DataRetentionExpired` | `data_retention_expired` | 0.1.0 | Domain | ComplianceCase | Compliance gates | Compliance: DataRetentionExpired | case_id,tenant_id | subject_ref | PSEUDO | Identity, Partner, Document, Admin | Holds/gates | Silent data purge | Y | N | Y | OPEN | MC-OS-015 · MC-OS-005 | PROPOSED |
| EVT-CMP-007 | `Compliance.DataDeletionScheduled` | `data_deletion_scheduled` | 0.1.0 | Domain | ComplianceCase | Compliance gates | Compliance: DataDeletionScheduled | case_id,tenant_id | subject_ref | PSEUDO | Identity, Partner, Document, Admin | Holds/gates | Silent data purge | Y | N | Y | OPEN | MC-OS-015 · MC-OS-005 | PROPOSED |
| EVT-CMP-008 | `Compliance.DataDeletionCompleted` | `data_deletion_completed` | 0.1.0 | Domain | ComplianceCase | Compliance gates | Compliance: DataDeletionCompleted | case_id,tenant_id | subject_ref | PSEUDO | Identity, Partner, Document, Admin | Holds/gates | Silent data purge | Y | N | Y | OPEN | MC-OS-015 · MC-OS-005 | APPROVED |
| EVT-CMP-009 | `Compliance.KYCRequested` | `k_y_c_requested` | 0.1.0 | Domain | ComplianceCase | Compliance gates | Compliance: KYCRequested | case_id,tenant_id | subject_ref | PSEUDO | Identity, Partner, Document, Admin | Holds/gates | Silent data purge | Y | N | Y | OPEN | MC-OS-015 · MC-OS-005 | PROPOSED |
| EVT-CMP-010 | `Compliance.KYCCompleted` | `k_y_c_completed` | 0.1.0 | Domain | ComplianceCase | Compliance gates | Compliance: KYCCompleted | case_id,tenant_id | subject_ref | PSEUDO | Identity, Partner, Document, Admin | Holds/gates | Silent data purge | Y | N | Y | OPEN | MC-OS-015 · MC-OS-005 | PROPOSED |
| EVT-CMP-011 | `Compliance.KYCFailed` | `k_y_c_failed` | 0.1.0 | Domain | ComplianceCase | Compliance gates | Compliance: KYCFailed | case_id,tenant_id | subject_ref | PSEUDO | Identity, Partner, Document, Admin | Holds/gates | Silent data purge | Y | N | Y | OPEN | MC-OS-015 · MC-OS-005 | PROPOSED |
| EVT-CMP-012 | `Compliance.KYBRequested` | `k_y_b_requested` | 0.1.0 | Domain | ComplianceCase | Compliance gates | Compliance: KYBRequested | case_id,tenant_id | subject_ref | PSEUDO | Identity, Partner, Document, Admin | Holds/gates | Silent data purge | Y | N | Y | OPEN | MC-OS-015 · MC-OS-005 | PROPOSED |
| EVT-CMP-013 | `Compliance.KYBCompleted` | `k_y_b_completed` | 0.1.0 | Domain | ComplianceCase | Compliance gates | Compliance: KYBCompleted | case_id,tenant_id | subject_ref | PSEUDO | Identity, Partner, Document, Admin | Holds/gates | Silent data purge | Y | N | Y | OPEN | MC-OS-015 · MC-OS-005 | PROPOSED |
| EVT-CMP-014 | `Compliance.KYBFailed` | `k_y_b_failed` | 0.1.0 | Domain | ComplianceCase | Compliance gates | Compliance: KYBFailed | case_id,tenant_id | subject_ref | PSEUDO | Identity, Partner, Document, Admin | Holds/gates | Silent data purge | Y | N | Y | OPEN | MC-OS-015 · MC-OS-005 | PROPOSED |
| EVT-CMP-015 | `Compliance.PolicyViolationDetected` | `policy_violation_detected` | 0.1.0 | Audit | ComplianceCase | Compliance gates | Compliance: PolicyViolationDetected | case_id,tenant_id | subject_ref | PSEUDO | Identity, Partner, Document, Admin | Holds/gates | Silent data purge | Y | N | Y | OPEN | MC-OS-015 · MC-OS-005 | APPROVED |

### Configuration Domain

Eventi in questa sezione: **11**.

| Event ID | Canonical | Technical (suggerito) | Ver | Category | Aggregate | Trigger | Meaning | Required payload | Optional | PII | Consumers | Side effects OK | Side effects NO | Idem | Ord | Audit | Retention | SoT | Status |
|----------|-----------|----------------------|-----|----------|-----------|---------|---------|------------------|----------|-----|-----------|-----------------|-----------------|------|-----|-------|-----------|-----|--------|
| EVT-CFG-001 | `Configuration.ConfigurationCreated` | `configuration_created` | 0.1.0 | Domain | ConfigurationSet | Config change | Config: ConfigurationCreated | config_key,version,tenant_id? | scope | NONE | All domains (read) | Config projections | Secrets in payload | Y | Y | Y | OPEN | MC-OS-019 | PROPOSED |
| EVT-CFG-002 | `Configuration.ConfigurationUpdated` | `configuration_updated` | 0.1.0 | Domain | ConfigurationSet | Config change | Config: ConfigurationUpdated | config_key,version,tenant_id? | scope | NONE | All domains (read) | Config projections | Secrets in payload | Y | Y | Y | OPEN | MC-OS-019 | PROPOSED |
| EVT-CFG-003 | `Configuration.ConfigurationActivated` | `configuration_activated` | 0.1.0 | Domain | ConfigurationSet | Config change | Config: ConfigurationActivated | config_key,version,tenant_id? | scope | NONE | All domains (read) | Config projections | Secrets in payload | Y | Y | Y | OPEN | MC-OS-019 | PROPOSED |
| EVT-CFG-004 | `Configuration.ConfigurationDeactivated` | `configuration_deactivated` | 0.1.0 | Domain | ConfigurationSet | Config change | Config: ConfigurationDeactivated | config_key,version,tenant_id? | scope | NONE | All domains (read) | Config projections | Secrets in payload | Y | Y | Y | OPEN | MC-OS-019 | PROPOSED |
| EVT-CFG-005 | `Configuration.ConfigurationVersionPublished` | `configuration_version_published` | 0.1.0 | Domain | ConfigurationSet | Config change | Config: ConfigurationVersionPublished | config_key,version,tenant_id? | scope | NONE | All domains (read) | Config projections | Secrets in payload | Y | Y | Y | OPEN | MC-OS-019 | APPROVED |
| EVT-CFG-006 | `Configuration.ConfigurationRollbackRequested` | `configuration_rollback_requested` | 0.1.0 | Audit | ConfigurationSet | Config change | Config: ConfigurationRollbackRequested | config_key,version,tenant_id? | scope | NONE | All domains (read) | Config projections | Secrets in payload | Y | Y | Y | OPEN | MC-OS-019 | PROPOSED |
| EVT-CFG-007 | `Configuration.ConfigurationRolledBack` | `configuration_rolled_back` | 0.1.0 | Domain | ConfigurationSet | Config change | Config: ConfigurationRolledBack | config_key,version,tenant_id? | scope | NONE | All domains (read) | Config projections | Secrets in payload | Y | Y | Y | OPEN | MC-OS-019 | PROPOSED |
| EVT-CFG-008 | `Configuration.FeatureFlagEnabled` | `feature_flag_enabled` | 0.1.0 | Audit | ConfigurationSet | Config change | Config: FeatureFlagEnabled | config_key,version,tenant_id? | scope | NONE | All domains (read) | Config projections | Secrets in payload | Y | Y | Y | OPEN | MC-OS-019 | APPROVED |
| EVT-CFG-009 | `Configuration.FeatureFlagDisabled` | `feature_flag_disabled` | 0.1.0 | Audit | ConfigurationSet | Config change | Config: FeatureFlagDisabled | config_key,version,tenant_id? | scope | NONE | All domains (read) | Config projections | Secrets in payload | Y | Y | Y | OPEN | MC-OS-019 | APPROVED |
| EVT-CFG-010 | `Configuration.CountryRuleActivated` | `country_rule_activated` | 0.1.0 | Domain | ConfigurationSet | Config change | Config: CountryRuleActivated | config_key,version,tenant_id? | scope | NONE | All domains (read) | Config projections | Secrets in payload | Y | Y | Y | OPEN | MC-OS-019 | PROPOSED |
| EVT-CFG-011 | `Configuration.TenantOverrideActivated` | `tenant_override_activated` | 0.1.0 | Audit | ConfigurationSet | Config change | Config: TenantOverrideActivated | config_key,version,tenant_id? | scope | NONE | All domains (read) | Config projections | Secrets in payload | Y | Y | Y | OPEN | MC-OS-019 | PROPOSED |

### Document Domain

Eventi in questa sezione: **9**.

| Event ID | Canonical | Technical (suggerito) | Ver | Category | Aggregate | Trigger | Meaning | Required payload | Optional | PII | Consumers | Side effects OK | Side effects NO | Idem | Ord | Audit | Retention | SoT | Status |
|----------|-----------|----------------------|-----|----------|-----------|---------|---------|------------------|----------|-----|-----------|-----------------|-----------------|------|-----|-------|-----------|-----|--------|
| EVT-DOC-001 | `Document.DocumentCreated` | `document_created` | 0.1.0 | Domain | DocumentArtifact | Document ops | Document: DocumentCreated | document_id,tenant_id | hash_ref | MIN | Partner, Compliance, Settlement, Booking | Evidence refs | Embed file bytes in event | Y | N | Y | OPEN | MC-OS-014 · MC-OS-005 | PROPOSED |
| EVT-DOC-002 | `Document.DocumentVersionCreated` | `document_version_created` | 0.1.0 | Domain | DocumentArtifact | Document ops | Document: DocumentVersionCreated | document_id,tenant_id | hash_ref | MIN | Partner, Compliance, Settlement, Booking | Evidence refs | Embed file bytes in event | Y | N | Y | OPEN | MC-OS-014 · MC-OS-005 | PROPOSED |
| EVT-DOC-003 | `Document.DocumentApproved` | `document_approved` | 0.1.0 | Audit | DocumentArtifact | Document ops | Document: DocumentApproved | document_id,tenant_id | hash_ref | MIN | Partner, Compliance, Settlement, Booking | Evidence refs | Embed file bytes in event | Y | N | Y | OPEN | MC-OS-014 · MC-OS-005 | PROPOSED |
| EVT-DOC-004 | `Document.DocumentSuperseded` | `document_superseded` | 0.1.0 | Domain | DocumentArtifact | Document ops | Document: DocumentSuperseded | document_id,tenant_id | hash_ref | MIN | Partner, Compliance, Settlement, Booking | Evidence refs | Embed file bytes in event | Y | N | Y | OPEN | MC-OS-014 · MC-OS-005 | PROPOSED |
| EVT-DOC-005 | `Document.DocumentArchived` | `document_archived` | 0.1.0 | Domain | DocumentArtifact | Document ops | Document: DocumentArchived | document_id,tenant_id | hash_ref | MIN | Partner, Compliance, Settlement, Booking | Evidence refs | Embed file bytes in event | Y | N | Y | OPEN | MC-OS-014 · MC-OS-005 | PROPOSED |
| EVT-DOC-006 | `Document.AttachmentUploaded` | `attachment_uploaded` | 0.1.0 | Domain | DocumentArtifact | Document ops | Document: AttachmentUploaded | document_id,tenant_id | hash_ref | MIN | Partner, Compliance, Settlement, Booking | Evidence refs | Embed file bytes in event | Y | N | Y | OPEN | MC-OS-014 · MC-OS-005 | PROPOSED |
| EVT-DOC-007 | `Document.AttachmentVerified` | `attachment_verified` | 0.1.0 | Domain | DocumentArtifact | Document ops | Document: AttachmentVerified | document_id,tenant_id | hash_ref | MIN | Partner, Compliance, Settlement, Booking | Evidence refs | Embed file bytes in event | Y | N | Y | OPEN | MC-OS-014 · MC-OS-005 | PROPOSED |
| EVT-DOC-008 | `Document.AttachmentRejected` | `attachment_rejected` | 0.1.0 | Domain | DocumentArtifact | Document ops | Document: AttachmentRejected | document_id,tenant_id | hash_ref | MIN | Partner, Compliance, Settlement, Booking | Evidence refs | Embed file bytes in event | Y | N | Y | OPEN | MC-OS-014 · MC-OS-005 | PROPOSED |
| EVT-DOC-009 | `Document.EvidenceFileStored` | `evidence_file_stored` | 0.1.0 | Audit | DocumentArtifact | Document ops | Document: EvidenceFileStored | document_id,tenant_id | hash_ref | MIN | Partner, Compliance, Settlement, Booking | Evidence refs | Embed file bytes in event | Y | N | Y | OPEN | MC-OS-014 · MC-OS-005 | PROPOSED |

### Media Domain

Eventi in questa sezione: **4**.

| Event ID | Canonical | Technical (suggerito) | Ver | Category | Aggregate | Trigger | Meaning | Required payload | Optional | PII | Consumers | Side effects OK | Side effects NO | Idem | Ord | Audit | Retention | SoT | Status |
|----------|-----------|----------------------|-----|----------|-----------|---------|---------|------------------|----------|-----|-----------|-----------------|-----------------|------|-----|-------|-----------|-----|--------|
| EVT-MED-001 | `Media.MediaUploaded` | `media_uploaded` | 0.1.0 | Domain | MediaAsset | Media pipeline | Media: MediaUploaded | media_id,tenant_id | mime | NONE | Document, Fleet | Media status | PII in filename | Y | N | N | OPEN | MC-OS-019 | PROPOSED |
| EVT-MED-002 | `Media.MediaProcessed` | `media_processed` | 0.1.0 | Internal | MediaAsset | Media pipeline | Media: MediaProcessed | media_id,tenant_id | mime | NONE | Document, Fleet | Media status | PII in filename | Y | N | N | OPEN | MC-OS-019 | PROPOSED |
| EVT-MED-003 | `Media.MediaProcessingFailed` | `media_processing_failed` | 0.1.0 | Domain | MediaAsset | Media pipeline | Media: MediaProcessingFailed | media_id,tenant_id | mime | NONE | Document, Fleet | Media status | PII in filename | Y | N | N | OPEN | MC-OS-019 | PROPOSED |
| EVT-MED-004 | `Media.MediaRetentionExpired` | `media_retention_expired` | 0.1.0 | Domain | MediaAsset | Media pipeline | Media: MediaRetentionExpired | media_id,tenant_id | mime | NONE | Document, Fleet | Media status | PII in filename | Y | N | N | OPEN | MC-OS-019 | PROPOSED |

### Analytics Domain

Eventi in questa sezione: **7**.

| Event ID | Canonical | Technical (suggerito) | Ver | Category | Aggregate | Trigger | Meaning | Required payload | Optional | PII | Consumers | Side effects OK | Side effects NO | Idem | Ord | Audit | Retention | SoT | Status |
|----------|-----------|----------------------|-----|----------|-----------|---------|---------|------------------|----------|-----|-----------|-----------------|-----------------|------|-----|-------|-----------|-----|--------|
| EVT-ANL-001 | `Analytics.AnalyticsProjectionUpdated` | `analytics_projection_updated` | 0.1.0 | Analytics | AnalyticsSnapshot | Projection job | Analytics: AnalyticsProjectionUpdated — non write SoT | projection_name,tenant_id? | kpi_code | NONE | Admin, AI (hints) | Alerts/dashboards | Mutare Aggregate operativi | Y | N | N | OPEN | MC-OS-019 · MC-OS-002 | APPROVED |
| EVT-ANL-002 | `Analytics.KPIThresholdBreached` | `k_p_i_threshold_breached` | 0.1.0 | Analytics | AnalyticsSnapshot | Projection job | Analytics: KPIThresholdBreached — non write SoT | projection_name,tenant_id? | kpi_code | NONE | Admin, AI (hints) | Alerts/dashboards | Mutare Aggregate operativi | Y | N | N | OPEN | MC-OS-019 · MC-OS-002 | APPROVED |
| EVT-ANL-003 | `Analytics.BookingMarginProjectionUpdated` | `booking_margin_projection_updated` | 0.1.0 | Analytics | AnalyticsSnapshot | Projection job | Analytics: BookingMarginProjectionUpdated — non write SoT | projection_name,tenant_id? | kpi_code | NONE | Admin, AI (hints) | Alerts/dashboards | Mutare Aggregate operativi | Y | N | N | OPEN | MC-OS-019 · MC-OS-002 | APPROVED |
| EVT-ANL-004 | `Analytics.PartnerPerformanceProjectionUpdated` | `partner_performance_projection_updated` | 0.1.0 | Analytics | AnalyticsSnapshot | Projection job | Analytics: PartnerPerformanceProjectionUpdated — non write SoT | projection_name,tenant_id? | kpi_code | NONE | Admin, AI (hints) | Alerts/dashboards | Mutare Aggregate operativi | Y | N | N | OPEN | MC-OS-019 · MC-OS-002 | APPROVED |
| EVT-ANL-005 | `Analytics.CityProfitabilityProjectionUpdated` | `city_profitability_projection_updated` | 0.1.0 | Analytics | AnalyticsSnapshot | Projection job | Analytics: CityProfitabilityProjectionUpdated — non write SoT | projection_name,tenant_id? | kpi_code | NONE | Admin, AI (hints) | Alerts/dashboards | Mutare Aggregate operativi | Y | N | N | OPEN | MC-OS-019 · MC-OS-002 | APPROVED |
| EVT-ANL-006 | `Analytics.ChannelPerformanceProjectionUpdated` | `channel_performance_projection_updated` | 0.1.0 | Analytics | AnalyticsSnapshot | Projection job | Analytics: ChannelPerformanceProjectionUpdated — non write SoT | projection_name,tenant_id? | kpi_code | NONE | Admin, AI (hints) | Alerts/dashboards | Mutare Aggregate operativi | Y | N | N | OPEN | MC-OS-019 · MC-OS-002 | APPROVED |
| EVT-ANL-007 | `Analytics.DataQualityIssueDetected` | `data_quality_issue_detected` | 0.1.0 | Analytics | AnalyticsSnapshot | Projection job | Analytics: DataQualityIssueDetected — non write SoT | projection_name,tenant_id? | kpi_code | NONE | Admin, AI (hints) | Alerts/dashboards | Mutare Aggregate operativi | Y | N | N | OPEN | MC-OS-019 · MC-OS-002 | APPROVED |

### AI Domain

Eventi in questa sezione: **11**.

| Event ID | Canonical | Technical (suggerito) | Ver | Category | Aggregate | Trigger | Meaning | Required payload | Optional | PII | Consumers | Side effects OK | Side effects NO | Idem | Ord | Audit | Retention | SoT | Status |
|----------|-----------|----------------------|-----|----------|-----------|---------|---------|------------------|----------|-----|-----------|-----------------|-----------------|------|-----|-------|-----------|-----|--------|
| EVT-AID-001 | `AI.RecommendationRequested` | `recommendation_requested` | 0.1.0 | AI | AiSuggestion | AI engine | AI: RecommendationRequested — recommendation ≠ decisione applicata | suggestion_id,tenant_id | confidence | MIN | Dispatch, Support, Pricing, Human ops | Suggestion records | Auto-apply Assignment/Settlement | Y | N | Y | OPEN | MC-OS-019 | PROPOSED |
| EVT-AID-002 | `AI.RecommendationGenerated` | `recommendation_generated` | 0.1.0 | AI | AiSuggestion | AI engine | AI: RecommendationGenerated — recommendation ≠ decisione applicata | suggestion_id,tenant_id | confidence | MIN | Dispatch, Support, Pricing, Human ops | Suggestion records | Auto-apply Assignment/Settlement | Y | N | Y | OPEN | MC-OS-019 | APPROVED |
| EVT-AID-003 | `AI.RecommendationAccepted` | `recommendation_accepted` | 0.1.0 | AI | AiSuggestion | AI engine | AI: RecommendationAccepted — recommendation ≠ decisione applicata | suggestion_id,tenant_id | confidence | MIN | Dispatch, Support, Pricing, Human ops | Suggestion records | Auto-apply Assignment/Settlement | Y | N | Y | OPEN | MC-OS-019 | PROPOSED |
| EVT-AID-004 | `AI.RecommendationRejected` | `recommendation_rejected` | 0.1.0 | AI | AiSuggestion | AI engine | AI: RecommendationRejected — recommendation ≠ decisione applicata | suggestion_id,tenant_id | confidence | MIN | Dispatch, Support, Pricing, Human ops | Suggestion records | Auto-apply Assignment/Settlement | Y | N | Y | OPEN | MC-OS-019 | PROPOSED |
| EVT-AID-005 | `AI.ModelDecisionBlocked` | `model_decision_blocked` | 0.1.0 | AI | AiSuggestion | AI engine | AI: ModelDecisionBlocked — recommendation ≠ decisione applicata | suggestion_id,tenant_id | confidence | MIN | Dispatch, Support, Pricing, Human ops | Suggestion records | Auto-apply Assignment/Settlement | Y | N | Y | OPEN | MC-OS-019 | APPROVED |
| EVT-AID-006 | `AI.HumanReviewRequested` | `human_review_requested` | 0.1.0 | AI | AiSuggestion | AI engine | AI: HumanReviewRequested — recommendation ≠ decisione applicata | suggestion_id,tenant_id | confidence | MIN | Dispatch, Support, Pricing, Human ops | Suggestion records | Auto-apply Assignment/Settlement | Y | N | Y | OPEN | MC-OS-019 | PROPOSED |
| EVT-AID-007 | `AI.RiskPredictionGenerated` | `risk_prediction_generated` | 0.1.0 | AI | AiSuggestion | AI engine | AI: RiskPredictionGenerated — recommendation ≠ decisione applicata | suggestion_id,tenant_id | confidence | MIN | Dispatch, Support, Pricing, Human ops | Suggestion records | Auto-apply Assignment/Settlement | Y | N | Y | OPEN | MC-OS-019 | PROPOSED |
| EVT-AID-008 | `AI.PriceRecommendationGenerated` | `price_recommendation_generated` | 0.1.0 | AI | AiSuggestion | AI engine | AI: PriceRecommendationGenerated — recommendation ≠ decisione applicata | suggestion_id,tenant_id | confidence | MIN | Dispatch, Support, Pricing, Human ops | Suggestion records | Auto-apply Assignment/Settlement | Y | N | Y | OPEN | MC-OS-019 | PROPOSED |
| EVT-AID-009 | `AI.AssignmentRecommendationGenerated` | `assignment_recommendation_generated` | 0.1.0 | AI | AiSuggestion | AI engine | AI: AssignmentRecommendationGenerated — recommendation ≠ decisione applicata | suggestion_id,tenant_id | confidence | MIN | Dispatch, Support, Pricing, Human ops | Suggestion records | Auto-apply Assignment/Settlement | Y | N | Y | OPEN | MC-OS-019 | PROPOSED |
| EVT-AID-010 | `AI.SupportTriageSuggested` | `support_triage_suggested` | 0.1.0 | AI | AiSuggestion | AI engine | AI: SupportTriageSuggested — recommendation ≠ decisione applicata | suggestion_id,tenant_id | confidence | MIN | Dispatch, Support, Pricing, Human ops | Suggestion records | Auto-apply Assignment/Settlement | Y | N | Y | OPEN | MC-OS-019 | PROPOSED |
| EVT-AID-011 | `AI.FraudSignalGenerated` | `fraud_signal_generated` | 0.1.0 | AI | AiSuggestion | AI engine | AI: FraudSignalGenerated — recommendation ≠ decisione applicata | suggestion_id,tenant_id | confidence | MIN | Dispatch, Support, Pricing, Human ops | Suggestion records | Auto-apply Assignment/Settlement | Y | N | Y | OPEN | MC-OS-019 | APPROVED |

### Integration Domain

Eventi in questa sezione: **12**.

| Event ID | Canonical | Technical (suggerito) | Ver | Category | Aggregate | Trigger | Meaning | Required payload | Optional | PII | Consumers | Side effects OK | Side effects NO | Idem | Ord | Audit | Retention | SoT | Status |
|----------|-----------|----------------------|-----|----------|-----------|---------|---------|------------------|----------|-----|-----------|-----------------|-----------------|------|-----|-------|-----------|-----|--------|
| EVT-INT-001 | `Integration.ExternalRequestReceived` | `external_request_received` | 0.1.0 | Integration | IntegrationEndpoint | ACL/gateway | Integration: ExternalRequestReceived | correlation_id,system_code | http_status? | PSEUDO | Payment, Notification, Finance | ACL translation | Bypass ACL into Booking writes | Y | N | Y | OPEN | MC-OS-019 | PROPOSED |
| EVT-INT-002 | `Integration.ExternalRequestValidated` | `external_request_validated` | 0.1.0 | Integration | IntegrationEndpoint | ACL/gateway | Integration: ExternalRequestValidated | correlation_id,system_code | http_status? | PSEUDO | Payment, Notification, Finance | ACL translation | Bypass ACL into Booking writes | Y | N | Y | OPEN | MC-OS-019 | PROPOSED |
| EVT-INT-003 | `Integration.ExternalRequestRejected` | `external_request_rejected` | 0.1.0 | Integration | IntegrationEndpoint | ACL/gateway | Integration: ExternalRequestRejected | correlation_id,system_code | http_status? | PSEUDO | Payment, Notification, Finance | ACL translation | Bypass ACL into Booking writes | Y | N | Y | OPEN | MC-OS-019 | PROPOSED |
| EVT-INT-004 | `Integration.WebhookReceived` | `webhook_received` | 0.1.0 | Integration | IntegrationEndpoint | ACL/gateway | Integration: WebhookReceived | correlation_id,system_code | http_status? | PSEUDO | Payment, Notification, Finance | ACL translation | Bypass ACL into Booking writes | Y | N | Y | OPEN | MC-OS-019 | PROPOSED |
| EVT-INT-005 | `Integration.WebhookValidated` | `webhook_validated` | 0.1.0 | Integration | IntegrationEndpoint | ACL/gateway | Integration: WebhookValidated | correlation_id,system_code | http_status? | PSEUDO | Payment, Notification, Finance | ACL translation | Bypass ACL into Booking writes | Y | N | Y | OPEN | MC-OS-019 | PROPOSED |
| EVT-INT-006 | `Integration.WebhookRejected` | `webhook_rejected` | 0.1.0 | Integration | IntegrationEndpoint | ACL/gateway | Integration: WebhookRejected | correlation_id,system_code | http_status? | PSEUDO | Payment, Notification, Finance | ACL translation | Bypass ACL into Booking writes | Y | N | Y | OPEN | MC-OS-019 | PROPOSED |
| EVT-INT-007 | `Integration.WebhookProcessingFailed` | `webhook_processing_failed` | 0.1.0 | Integration | IntegrationEndpoint | ACL/gateway | Integration: WebhookProcessingFailed | correlation_id,system_code | http_status? | PSEUDO | Payment, Notification, Finance | ACL translation | Bypass ACL into Booking writes | Y | N | Y | OPEN | MC-OS-019 | PROPOSED |
| EVT-INT-008 | `Integration.ExternalEventPublished` | `external_event_published` | 0.1.0 | Integration | IntegrationEndpoint | ACL/gateway | Integration: ExternalEventPublished | correlation_id,system_code | http_status? | PSEUDO | Payment, Notification, Finance | ACL translation | Bypass ACL into Booking writes | Y | N | Y | OPEN | MC-OS-019 | PROPOSED |
| EVT-INT-009 | `Integration.ExternalEventDeliveryFailed` | `external_event_delivery_failed` | 0.1.0 | Integration | IntegrationEndpoint | ACL/gateway | Integration: ExternalEventDeliveryFailed | correlation_id,system_code | http_status? | PSEUDO | Payment, Notification, Finance | ACL translation | Bypass ACL into Booking writes | Y | N | Y | OPEN | MC-OS-019 | PROPOSED |
| EVT-INT-010 | `Integration.ProviderUnavailable` | `provider_unavailable` | 0.1.0 | Integration | IntegrationEndpoint | ACL/gateway | Integration: ProviderUnavailable | correlation_id,system_code | http_status? | PSEUDO | Payment, Notification, Finance | ACL translation | Bypass ACL into Booking writes | Y | N | Y | OPEN | MC-OS-019 | PROPOSED |
| EVT-INT-011 | `Integration.ProviderRecovered` | `provider_recovered` | 0.1.0 | Integration | IntegrationEndpoint | ACL/gateway | Integration: ProviderRecovered | correlation_id,system_code | http_status? | PSEUDO | Payment, Notification, Finance | ACL translation | Bypass ACL into Booking writes | Y | N | Y | OPEN | MC-OS-019 | PROPOSED |
| EVT-INT-012 | `Integration.ReconciliationFileImported` | `reconciliation_file_imported` | 0.1.0 | Integration | IntegrationEndpoint | ACL/gateway | Integration: ReconciliationFileImported | correlation_id,system_code | http_status? | PSEUDO | Payment, Notification, Finance | ACL translation | Bypass ACL into Booking writes | Y | N | Y | OPEN | MC-OS-019 | PROPOSED |

### Administration Domain

Eventi in questa sezione: **7**.

| Event ID | Canonical | Technical (suggerito) | Ver | Category | Aggregate | Trigger | Meaning | Required payload | Optional | PII | Consumers | Side effects OK | Side effects NO | Idem | Ord | Audit | Retention | SoT | Status |
|----------|-----------|----------------------|-----|----------|-----------|---------|---------|------------------|----------|-----|-----------|-----------------|-----------------|------|-----|-------|-----------|-----|--------|
| EVT-ADM-001 | `Administration.ManualOverrideRequested` | `manual_override_requested` | 0.1.0 | Audit | AdminAction | Admin ops | Admin: ManualOverrideRequested | action_id,actor_id,tenant_id? | reason_code | PSEUDO | Compliance, Identity, Audit store | Break-glass effects via owner domains | Silent settlement edit | Y | Y | Y | OPEN | MC-OS-015 | APPROVED |
| EVT-ADM-002 | `Administration.ManualOverrideApproved` | `manual_override_approved` | 0.1.0 | Audit | AdminAction | Admin ops | Admin: ManualOverrideApproved | action_id,actor_id,tenant_id? | reason_code | PSEUDO | Compliance, Identity, Audit store | Break-glass effects via owner domains | Silent settlement edit | Y | Y | Y | OPEN | MC-OS-015 | APPROVED |
| EVT-ADM-003 | `Administration.ManualOverrideRejected` | `manual_override_rejected` | 0.1.0 | Audit | AdminAction | Admin ops | Admin: ManualOverrideRejected | action_id,actor_id,tenant_id? | reason_code | PSEUDO | Compliance, Identity, Audit store | Break-glass effects via owner domains | Silent settlement edit | Y | Y | Y | OPEN | MC-OS-015 | APPROVED |
| EVT-ADM-004 | `Administration.ConfigurationChangeApproved` | `configuration_change_approved` | 0.1.0 | Audit | AdminAction | Admin ops | Admin: ConfigurationChangeApproved | action_id,actor_id,tenant_id? | reason_code | PSEUDO | Compliance, Identity, Audit store | Break-glass effects via owner domains | Silent settlement edit | Y | Y | Y | OPEN | MC-OS-015 | APPROVED |
| EVT-ADM-005 | `Administration.SensitiveDataAccessGranted` | `sensitive_data_access_granted` | 0.1.0 | Audit | AdminAction | Admin ops | Admin: SensitiveDataAccessGranted | action_id,actor_id,tenant_id? | reason_code | PSEUDO | Compliance, Identity, Audit store | Break-glass effects via owner domains | Silent settlement edit | Y | Y | Y | OPEN | MC-OS-015 | APPROVED |
| EVT-ADM-006 | `Administration.SensitiveDataAccessRevoked` | `sensitive_data_access_revoked` | 0.1.0 | Audit | AdminAction | Admin ops | Admin: SensitiveDataAccessRevoked | action_id,actor_id,tenant_id? | reason_code | PSEUDO | Compliance, Identity, Audit store | Break-glass effects via owner domains | Silent settlement edit | Y | Y | Y | OPEN | MC-OS-015 | APPROVED |
| EVT-ADM-007 | `Administration.PlatformOperationAudited` | `platform_operation_audited` | 0.1.0 | Audit | AdminAction | Admin ops | Admin: PlatformOperationAudited | action_id,actor_id,tenant_id? | reason_code | PSEUDO | Compliance, Identity, Audit store | Break-glass effects via owner domains | Silent settlement edit | Y | Y | Y | OPEN | MC-OS-015 | APPROVED |

## 32. Event Matrices

### 32.1 Event Ownership Matrix (estratto)

| Prefisso | Owner Domain |
|----------|--------------|
| Identity.* | Identity |
| Customer.* | Customer |
| Booking.* | Booking |
| Marketplace.* | Marketplace |
| Partner.* | Partner |
| Dispatch.* | Dispatch |
| Fleet.* | Fleet |
| Operations.* | Booking (Trip aggregate) |
| Pricing.* | Pricing |
| Payment.* | Payment |
| Settlement.* | Settlement |
| Finance.* | Finance |
| Support.* | Support |
| Notification.* | Notification |
| Compliance.* | Compliance |
| Configuration.* | Configuration |
| Document.* / Media.* | Document / Media |
| Analytics.* | Analytics |
| AI.* | AI |
| Integration.* | Integration |
| Administration.* | Administration |

### 32.2 Producer–Consumer Matrix (sintesi)

| Producer | Consumer tipici |
|----------|-----------------|
| Booking / Operations | Notification, Dispatch, Settlement, Payment, Analytics |
| Marketplace | Booking, Partner, Settlement, Notification, Compliance |
| Payment | Booking, Finance, Settlement, Notification |
| Settlement | Finance, Partner, Notification, Support |
| Identity | Tutti (authz), Notification, Compliance |
| Analytics | Admin/AI hints only |
| AI | Human/Dispatch/Support via Command, non auto-write |

### 32.3 Domain vs Integration Event Matrix

| Tipo | Esempio | Pubblico cross-context |
|------|---------|------------------------|
| Domain | `Booking.StopAdded` | Spesso no |
| Integration | `Booking.BookingConfirmed`, `Payment.PaymentCaptured` | Sì |
| Internal | `Operations.LocationPingRecorded` | No |

### 32.4 Financial Event Matrix

Include almeno: Payment.*, Settlement.*, Finance.Ledger*, Marketplace.ExchangeFunds*, Pricing.PlatformFee*, Support.RecoveryCost*, Support.Compensation*.

### 32.5 PII Classification Matrix

| Classe | Esempi |
|--------|--------|
| NONE | ID opachi, money, status codes |
| MIN | preference keys, rating score |
| PSEUDO | hashed contact, masked actor |
| SENSITIVE | data release Exchange, geo ping |

### 32.6 Idempotency Matrix

Y obbligatorio per consumer con effetti su Payment, Settlement, Finance, Assignment accept, Notification send, Admin override.

### 32.7 Ordering Matrix

Y tipicamente su: Payment auth→capture; Settlement approve→payout; Assignment accept→driver assign; No-show confirm→settlement eligibility.

### 32.8 Audit Requirement Matrix

Y su: Identity grant/suspend, Consent, Admin override, Exchange data access, Compliance violations, Financial postings.

### 32.9 Retention Class Matrix

Classi concettuali: `OPERATIONAL`, `FINANCIAL`, `AUDIT`, `TELEMETRY`, `ANALYTICS`. **Durate OPEN**.

### 32.10 Notification Trigger Matrix

| Business Event | Notification evaluation |
|----------------|-------------------------|
| BookingConfirmed | NotificationRequested |
| DriverEnRoute | NotificationRequested |
| BookingCancelled | NotificationRequested |
| PayoutCompleted | NotificationRequested (Partner) |
| ExchangeOfferSent | NotificationRequested |

### 32.11 Analytics Consumption Matrix

Analytics consuma eventi operativi/financial; produce solo Analytics.* projection/alert.

### 32.12 AI Recommendation Matrix

| AI Event | Equivale a decisione? |
|----------|----------------------|
| RecommendationGenerated | No |
| RecommendationAccepted | Accettazione umana/policy — poi Command owner |
| ModelDecisionBlocked | Sì blocco auto-apply |
| FraudSignalGenerated | Signal, non ban automatico |

---

## 33. Event Chains

### 33.1 Booking standard

`RequestSubmitted` → `QuoteGenerated` → `QuoteAccepted` → `BookingCreated` → `BookingConfirmed` → `ServiceCreated` → `AssignmentCreated` → `DriverAssigned` → `ServiceStarted` → `ServiceCompleted` → `SettlementCreated` → `SettlementApproved` → `PayoutCompleted` → `BookingCompleted`

### 33.2 Partner Exchange

`ExchangeListingDrafted` → `ExchangeFundsReserved` → `ExchangeListingPublished` → `ExchangeOfferAccepted` → `ExchangeServiceOrderCreated` → `ExchangeListingAssigned` → `ExchangeCustomerDataReleased` → `ServiceStarted` → `ServiceCompleted` → `SettlementApproved` → `PayoutCompleted`

### 33.3 Cancellation

`BookingCancellationRequested` → `BookingCancelled` → `PaymentRefundRequested` → `PaymentRefunded` → `LedgerEntryPosted`

### 33.4 No-show

`CustomerNoShowSuspected` → `EvidenceCaptured` → `CustomerNoShowConfirmed` → `SettlementEligibilityEvaluated` → (`SettlementApproved` **oppure** `DisputeOpened`)

### 33.5 Recovery

`ServiceInterrupted` → `RecoveryRequested` → `RecoveryExecutorFound` → `AssignmentReassigned` → `ServiceResumed` → `RecoveryCompleted` → `RecoveryCostRecorded`

### 33.6 Dispute

`DisputeOpened` → `DisputeEvidenceRequested` → `DisputeEvidenceSubmitted` → `DisputeUnderReview` → `DisputeResolved` → `SettlementAdjusted` → (`LedgerReversalPosted` **oppure** `PayoutScheduled`)

---

## 34. Decisioni approvate

| ID | Decisione | Fonte |
|----|-----------|-------|
| SEC-DA-01 | Eventi immutabili | MC-OS-019 / BOS audit |
| SEC-DA-02 | Append-only audit | Frameworks esistenti |
| SEC-DA-03 | No mutazione diretta cross-domain | MC-OS-019 |
| SEC-DA-04 | Booking ≠ Service ≠ Trip ≠ Assignment | MC-OS-014 |
| SEC-DA-05 | Domain Event ≠ Integration Event | MC-OS-019 |
| SEC-DA-06 | Event ≠ Command | Questo catalogo / Blueprint §29 |
| SEC-DA-07 | Event ≠ Ledger Entry | MC-OS-006 |
| SEC-DA-08 | Analytics = read projection | MC-OS-019 |
| SEC-DA-09 | AI Recommendation ≠ auto-decision | MC-OS-019 |
| SEC-DA-10 | Correzioni finanziarie via reversal | BOS/SFOF |
| SEC-DA-11 | tenant_id / organization_id quando applicabili | MC-OS-015 |
| SEC-DA-12 | Data minimization / Progressive Disclosure | MC-OS-012/015/016 |
| SEC-DA-13 | Idempotency per consumer con effetti | Principi EDA |
| SEC-DA-14 | Accesso anticipato dati sensibili tracciato | MC-OS-012/015 |

---

## 35. Decisioni OPEN

Tecnologia event bus; transactional outbox; message broker; delivery guarantee concreta; schema registry; formato wire definitivo; durata retention; replay policy; dead-letter provider; ordering per partition; limite dimensione payload; cifratura campo-per-campo; eventi pubblici partner esterni; webhook retry policy; granularità Finance vs Settlement; real-time vs batch per consumer; modular monolith vs distributed services; riconoscimento fiscale definitivo (Finance).

---

## 36. Roadmap

### Foundation
Naming, envelope, ownership, catalogo minimo, audit, idempotency, tenant scoping.

### Modular Monolith MVP
Internal domain events, transaction boundary, handler sincroni dove necessari, persistenza eventi critici.

### Integration Readiness
Outbox, integration events, webhooks, retries, dead-letter.

### Financial Eventing
Immutable financial events, Ledger integration, reconciliation, payout orchestration.

### Advanced Automation
AI Recommendations, anomaly detection, dynamic risk, automated dispute triage (sempre con guardrail).

### Distributed Architecture
Solo se giustificata da scala reale.

---

## 37. Anti-pattern vietati

- Eventi al presente/imperativo
- `*Updated` / `*Changed` generici senza soggetto
- Usare Analytics/AI come write SoT
- Mettere provider PSP/SMS nel payload di business event
- Confondere `ExchangeOfferAccepted` con `AssignmentAccepted`
- Sovrascrivere Ledger/Settlement history
- Pubblicare Internal Event come contratto pubblico senza promozione

---

## Cronologia revisioni

| Versione | Data | Autore | Descrizione modifica | Stato |
|----------|------|--------|----------------------|-------|
| 0.1.0 | 2026-07-26 | MyChauffeur OS Team | Prima stesura System Event Catalog: principi, envelope, catalogo per domain, matrici, chain. | Draft |

---

*Fine MC-OS-020 v0.1.0 — Draft.*

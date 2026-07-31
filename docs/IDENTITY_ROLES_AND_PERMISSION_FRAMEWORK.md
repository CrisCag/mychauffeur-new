# MyChauffeur OS — Identity, Roles & Permission Framework

| Campo | Valore |
|-------|--------|
| **Codice documento** | MC-OS-015 |
| **Titolo** | Identity, Roles & Permission Framework |
| **Versione** | 0.1.0 |
| **Stato** | Draft |
| **Data creazione** | 2026-07-26 |
| **Ultima modifica** | 2026-07-26 |
| **Owner** | Identity, Security & Access Governance |
| **Autori** | MyChauffeur OS Team |
| **Documenti correlati** | MC-OS-000 · MC-OS-001 · MC-OS-002 · MC-OS-005 · MC-OS-009 · MC-OS-011 · MC-OS-012 · MC-OS-014 · MC-OS-028 · MC-OS-029 · PLATFORM_MAP · HANDOFF |
| **Dipendenze** | Glossary; Entity Model; BOS; Partner Framework; Blueprint Auth/RBAC/RLS |
| **Classificazione** | Official Domain Framework — Draft |
| **Documentation Release** | 0.1 (allineamento previsto) |

---

## Avvertenza

Questo documento è un **framework ufficiale di dominio**.  
Non è contratto, non è codice, non è schema SQL, non contiene policy RLS eseguibili, non è specifica API.

I nomi di entità, stati, eventi, campi e concetti software restano in **inglese**. Il testo normativo è in **italiano**.

---

## Source of Truth

Questo documento (MC-OS-015) è la Source of Truth di **Identity, Roles, Permission e Capability** a livello di Identity & Access Governance (Person, User, Membership, principi).

Il **catalogo implementabile** di Actor, Role template, Permission atomiche, Scope, Data Visibility, Permission Matrix MVP e Authorization Decision (input/output) è **MC-OS-029** — [`ROLE_CAPABILITY_AND_PERMISSION_CATALOG.md`](./ROLE_CAPABILITY_AND_PERMISSION_CATALOG.md).

In caso di conflitto su Permission/Scope/Data Visibility/Matrix, prevale **MC-OS-029**.

---

## Allineamento MC-OS-029 (obbligatorio)

- Una Person può avere più Role.
- Role non è hardcoded nel comportamento applicativo.
- Role non concede Permission implicite.
- Permission atomica; Scope e Data Visibility sono separati.
- Deny by Default; assenza di Permission = operazione negata.
- Authorization server-side / Application Layer; UI visibility ≠ Authorization.
- RLS non sostituisce Application Authorization.

## 1. Scopo

Definire identità, tenant, organization membership, ruoli, capacità operative, permessi e isolamento dei dati in MyChauffeur OS.

Principio fondante: **Person ≠ User ≠ Role ≠ Capability**.

**Source of Truth:** MC-OS-015 per Identity & Access Governance. Non sostituisce RLS implementativa (Blueprint §13) né i lifecycle Booking (MC-OS-014).

## 2. Principi

| ID | Principio |
|----|-----------|
| IRP-01 | Person ≠ User ≠ Role ≠ Capability |
| IRP-02 | Deny by default |
| IRP-03 | Least privilege |
| IRP-04 | Tenant isolation |
| IRP-05 | Active organization context obbligatorio per azioni multi-org |
| IRP-06 | Audit su grant/revoke e accessi dati sensibili |
| IRP-07 | Nessuna policy SQL/RLS eseguibile in questo documento |
| IRP-08 | Service role solo per job di sistema controllati |

## 3. Person

**Person** = individuo anagrafico nel mondo reale (identità umana). Può esistere senza User. Non è un permesso.

## 4. User

**User** = credenziale/account di accesso collegato a una Person (o, in casi tecnici, a un’identità di servizio distinta). Autenticazione ≠ autorizzazione.

## 5. Organization

**Organization** = soggetto giuridico/operativo (tenant commerciale, Partner Company, Agency, Corporate Account owner, ecc.). Aggrega membership e dati.

## 6. Tenant

**Tenant** = confine di isolamento dati e configurazione. Un’Organization opera in uno o più contesti tenant secondo modello piattaforma. Cross-tenant access solo con grant esplicito e audit.

## 7. Organization Membership

Legame User ↔ Organization con stato (`invited`, `active`, `suspended`, `offboarded`). La membership non è un Role: i Role si assegnano nel contesto della membership.

## 8. Role

**Role** = etichetta di autorizzazione (es. Dispatcher, Owner, Driver-linked ops). Un User può avere più Role in Organization diverse. Role ≠ Capability automatica illimitata.

## 9. Permission

**Permission** = permesso atomico su risorsa/azione (es. `booking.read`, `assignment.assign`). Concessi via Role o grant esplicito. Matrice in §46.

## 10. Capability

**Capability** = abilità operativa abilitata (es. “può fare offer-based assignment”, “può pubblicare Exchange Listing”). Dipende da Role + stato Organization + Configuration. Capability ≠ Role.

## 11. Driver Profile

Profilo operativo collegato a Person/User per esecuzione Trip. Scope limitato a missioni assegnate e dati minimi necessari (Progressive Data Disclosure).

## 12. Dispatcher Capability

Abilita gestione coda, Assignment, eccezioni nel perimetro Organization. Non implica Platform Admin.

## 13. Partner Capability

Abilita operazioni Partner (accept Offer, Exchange buyer/seller, upload Evidence) nel perimetro Partner Company. Nessuna subordinazione lavorativa (Partner Framework).

## 14. Customer Identity

Identità Customer (Consumer registrato o guest correlato a Booking). Accesso solo ai propri Booking/dati. Guest ≠ User permanente.

## 15. Corporate User

User membership su Corporate Account (Travel Manager, booker interno). Scope: account policy e Booking dell’account.

## 16. Agency User

User membership su Agency: crea/gestisce Booking B2B per clienti Agency secondo Capability.

## 17. Platform Administrator

Ruolo piattaforma cross-tenant con least privilege per funzione (support, compliance, ops). Ogni azione privilegiata è auditata. Non usare come default ops.

## 18. Multi-role

Un User può detenere più Role (anche nella stessa Organization) se Configuration lo consente. Valutazione autorizzazione = unione controllata dei Permission, non “super-role” implicito.

## 19. Multi-organization

Un User può appartenere a più Organization. Le azioni richiedono **Active organization context** (§20).

## 20. Active organization context

Contesto Organization selezionato per la sessione/richiesta. Senza contesto valido, azioni multi-org sono deny. Cambio contesto tracciato.

## 21. Authentication

Verifica identità User (credenziali, session, MFA dove previsto). Dettaglio flussi: Blueprint §11. Qui: auth necessaria ma non sufficiente per dati tenant.

## 22. Authorization

Decisione allow/deny su azione+risorsa basata su Role/Permission/Capability + tenant + contesto. Deny by default.

## 23. RBAC

Modello Role-Based Access Control come base. Esteso da Capability e scope Organization. Matrice Role×Permission in §46 (concettuale).

## 24. Capability-based access

Oltre RBAC: feature flags / Capability operative (Exchange publish, payout view, holdback contest). Capability revoke indipendente dal Role se Configuration lo prevede.

## 25. RLS principles

Principi (non SQL): ogni riga sensibile porta tenant/org ownership; query utente filtrate dal contesto; service role bypass solo per job firmati. Implementazione: Blueprint §13 — **fuori** da questo doc.

## 26. Tenant isolation

Nessuna lettura/scrittura cross-tenant senza grant. Partner vede solo Assignment/Service autorizzati. Customer Price hidden da Executing by default (Exchange).

## 27. Least privilege

Grant minimi necessari alla funzione. Escalation temporanee con scadenza e audit.

## 28. Deny by default

Assenza di Permission esplicito = deny. Wildcard admin evitati salvo Platform Admin segmentato.

## 29. Service role

Identità tecnica per worker/system. Non usabile da UI umana. Scope ristretto a job; log obbligatorio.

## 30. Public anonymous booking

Consentito creare Request/Quote/Booking guest secondo canale pubblico, con data minimization. Conversione a User registrato opzionale post-booking.

## 31. Driver scope

Solo Trip/Assignment assegnati; comunicazione mascherata dove prevista; niente anagrafiche complete Customer oltre disclosure policy.

## 32. Dispatcher scope

Coda e risorse della propria Organization/tenant; eccezioni e reassignment nel perimetro; niente payout Partner altrui.

## 33. Owner scope

Amministrazione Organization: membership, Role grant, Configuration locale. Non implica Platform Admin.

## 34. Admin scope

Admin Organization o funzione: utenti, audit locale, override limitati. Distinto da Platform Admin.

## 35. Platform admin scope

Cross-tenant support/ops/compliance con break-glass procedure e audit. Segmentazione per Capability raccomandata.

## 36. Partner Exchange permissions

Publish Listing, browse eleggibile, offer/counteroffer, accept, Evidence, dispute — solo con Partner Capability e membership attiva. Progressive disclosure enforced.

## 37. Customer data access

Accesso a PII Customer solo per finalità esecuzione/supporto con base giuridica e minimization. Log accessi sensibili (§39).

## 38. Progressive disclosure permissions

Permission granulari su fasi disclosure (pre-accept vs post-accept vs en-route). Executing non ottiene Customer Price di default.

## 39. Data access logging

Accessi a PII, payout, dispute Evidence, break-glass: logati con attore, contesto, risorsa, timestamp.

## 40. Session lifecycle

Create → active → refresh → logout/expire/revoke. Revoca su offboarding/sospensione. MFA policy: **OPEN** di dettaglio.

## 41. Invitation lifecycle

`invited → accepted → membership active` oppure `expired/revoked`. Invito legato a Organization + Role proposti.

## 42. Membership lifecycle

`invited → active → suspended → offboarded`. Suspend blocca Capability; offboard revoca accessi e sessioni.

## 43. Suspension

Sospensione User o Membership per rischio/compliance/ops. Effetto immediato su sessioni e azioni; audit motivo.

## 44. Offboarding

Revoca membership, Role, Capability; rotazione/revoca credenziali; retention dati secondo policy legale (**OPEN** dettagli retention).

## 45. Audit trail

Grant/revoke Role, cambio Capability, invite, suspend, break-glass, export dati: append-only.

## 46. Permission matrix

Matrice concettuale (estratto):

| Capability area | Customer | Driver | Dispatcher | Partner Ops | Org Owner | Platform Admin |
|-----------------|----------|--------|------------|-------------|-----------|----------------|
| Own Booking read | Y | limited | Y (scope) | limited | Y (scope) | Y (audit) |
| Assign | N | N | Y | offer/accept | config | override |
| Exchange publish | N | N | se Capability | Y | config | override |
| Payout view | N | N | N | own | own | support |
| User admin | N | N | N | N | Y | Y |

Y = allow tipico di ruolo; limited = subset disclosure.

## 47. Events

`user_authenticated`, `session_revoked`, `invitation_sent`, `membership_activated`, `role_granted`, `role_revoked`, `capability_changed`, `user_suspended`, `offboarding_completed`, `break_glass_used`.

## 48. Alerts

Login anomalo; grant privilegiato; break-glass; tentativo cross-tenant; mass export; suspension.

## 49. Decisioni approvate

| ID | Decisione |
|----|-----------|
| IRP-DA-01 | Person ≠ User ≠ Role ≠ Capability |
| IRP-DA-02 | Deny by default + least privilege |
| IRP-DA-03 | Tenant isolation |
| IRP-DA-04 | Active organization context |
| IRP-DA-05 | Progressive Data Disclosure permissions |
| IRP-DA-06 | Nessuna SQL/RLS eseguibile in questo framework |
| IRP-DA-07 | Service role solo system jobs |

## 50. Decisioni OPEN

| Tema | Note |
|------|------|
| Provider auth / MFA obbligatorio | Blueprint / go-live DECISIONS #10 |
| Retention offboarding dettagliata | Legal/privacy |
| Elenco Role canonici go-live | Da approvare |
| Break-glass SLA | — |

## 51. Roadmap

1. Modello Person/User/Org/Membership  
2. RBAC + Capability matrix  
3. Session/invite lifecycle  
4. Enforcement allineato RLS (implementazione separata)  
5. Audit & break-glass

---

## Cronologia revisioni

| Versione | Data | Autore | Descrizione modifica | Stato |
|----------|------|--------|----------------------|-------|
| 0.1.0 | 2026-07-26 | MyChauffeur OS Team | Prima stesura Identity, Roles & Permission Framework. | Draft |

---

*Fine MC-OS-015 v0.1.0 — Draft.*

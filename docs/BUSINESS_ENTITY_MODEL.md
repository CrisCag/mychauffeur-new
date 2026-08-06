# MyChauffeur OS — Business Entity Model

| Campo | Valore |
|-------|--------|
| **Codice documento** | MC-OS-011 |
| **Titolo** | Business Entity Model |
| **Versione** | 0.1.0 |
| **Stato** | Draft |
| **Data creazione** | 2026-07-26 |
| **Ultima modifica** | 2026-07-26 |
| **Owner** | Chief Enterprise Architect / Domain Owners congiunti |
| **Autori** | Chief Enterprise Architect |
| **Documenti correlati** | MC-OS-001 Blueprint · MC-OS-009 Glossary · MC-OS-002 BOS · MC-OS-005 Partner · MC-OS-006 SFOF · MC-OS-003 NCC · MC-OS-004 Decisions · MC-OS-007 Platform Map · MC-OS-008 Handoff |
| **Dipendenze** | Domain Glossary (MC-OS-009); EDGF (MC-OS-000) |
| **Classificazione** | Technical / Business — Domain Model concettuale |
| **Documentation Release** | 0.1 (allineamento previsto) |

---

## Avvertenza

Questo documento è il **Business Domain Model** ufficiale.

**Non** descrive: schema SQL, migration, API, classi/ORM, DDL.

Descrive esclusivamente entità concettuali, responsabilità, cicli di vita e relazioni di business.

Terminologia allineata a [`DOMAIN_GLOSSARY_AND_BUSINESS_DICTIONARY.md`](./DOMAIN_GLOSSARY_AND_BUSINESS_DICTIONARY.md) (MC-OS-009).

---

## 1. Scopo

Definire l’insieme ufficiale delle **entità di business** di MyChauffeur OS e le loro relazioni, come riferimento condiviso per Product, Finance, Legal, Operations e Engineering.

Obiettivi:

- linguaggio ubiquo stabile;
- confini di ownership funzionale;
- base per OS Foundation (senza anticipare Settlement Engine completo);
- tracciabilità verso i documenti Source of Truth di comportamento.

---

## 2. Principi del Domain Model

| Principio | Regola |
|-----------|--------|
| Concettuale ≠ fisico | Nessun SQL/API in questo documento |
| Una definizione | Allineamento obbligatorio al Glossario MC-OS-009 |
| XOR esecuzione | Assignment INTERNAL **oppure** PARTNER (BOS) |
| CM over GBV | Decisioni di dominio privilegiano contribution margin (BOS) |
| Tracciabilità | Decisioni e mutazioni rilevanti → Event / Audit Log |
| No double count | Refund, Compensation, Recovery Cost, Chargeback distinti |
| Configurabilità | Regole numeriche via Configuration, non hardcoded |
| Multi-tenant ready | Entità operative scopabili per organizzazione/tenant |

---

## 3. Regole di modellazione

1. Ogni entità ha **un owner funzionale** di categoria (§8).
2. Stati elencati sono **principali**; sotto-stati tecnici possono esistere in SFOF/ops senza espandere qui.
3. Relazioni “crea / usa / genera” sono di dominio, non foreign key.
4. Entità **OPEN** o future non bloccano il naming ufficiale.
5. Broker resta entità controllata (uso sconsigliato finché non tipizzata — Glossario).
6. Non introdurre entità duplicate (es. Trip vs Service: ruoli distinti).

---

## 4. Categorie di entità

| Categoria | Ambito | Owner funzionale tipico |
|-----------|--------|-------------------------|
| **Identity** | Persone, ruoli, account, tenant | Product / Security |
| **Business** | Customer, Booking, Quote, Pricing | Product / Commercial |
| **Marketplace** | Listing, matching cross-offerta | Product Marketplace |
| **Fleet** | Vehicle, Fleet, location assets | Operations / Fleet |
| **Operations** | Trip, Assignment, Dispatch, Support | Operations |
| **Finance** | Payment, Ledger, Settlement, Payout, Tax | Finance |
| **Compliance** | Evidence, Dispute, Score, docs legali | Legal / Risk / Ops |
| **Documents** | Document, Attachment | Ops / Legal |
| **Configuration** | Configuration, Pricing profiles, rates | Product / Finance |

---

## 5. Business Entities

Formato scheda:

`Definizione · Responsabilità · Crea · Modifica · Legge · Stati · Relazioni · SoT · Impatto software`

### 5.1 Identity

#### Customer
| Campo | Valore |
|-------|--------|
| Definizione | Soggetto che richiede/beneficia del Service |
| Responsabilità | Anagrafica domanda; legame ai Booking |
| Crea | Customer (self), Agency, Admin, sistema import |
| Modifica | Customer (profilo), Admin, supporto autorizzato |
| Legge | Customer (self), Admin, Dispatcher (minimo), Finance (billing) |
| Stati | active, blocked, archived |
| Relazioni | 1—N Booking; 0—1 Corporate Account; Ratings |
| SoT | Glossary; PLATFORM_MAP ruoli |
| Impatto software | `customer_id`; privacy |

#### Consumer
| Campo | Valore |
|-------|--------|
| Definizione | Customer persona fisica con tutela consumatore |
| Responsabilità | Qualificare obblighi ToS/refund consumer |
| Crea | Derivata da Customer (classificazione) |
| Modifica | Policy/Legal via Configuration |
| Legge | Come Customer + Legal |
| Stati | (classificazione su Customer) |
| Relazioni | Specializza Customer |
| SoT | Glossary; Partner/Legal |
| Impatto software | Flag consumer |

#### Corporate Account
| Campo | Valore |
|-------|--------|
| Definizione | Account aziendale con condizioni e billing periodico |
| Responsabilità | Contratto, policy viaggio, fatturazione |
| Crea | Admin / Sales |
| Modifica | Admin, Finance |
| Legge | Corporate users, Admin, Finance |
| Stati | prospect, active, suspended, closed |
| Relazioni | 1—N Customer utenti; N Booking; Invoice cycles |
| SoT | BOS §3.4 |
| Impatto software | `corporate_account_id` |

#### Agency
| Campo | Valore |
|-------|--------|
| Definizione | B2B che porta domanda; può non eseguire |
| Responsabilità | Canale distribuzione domanda |
| Crea | Admin / onboarding B2B |
| Modifica | Admin, Agency self (limitato) |
| Legge | Agency, Admin, Dispatcher |
| Stati | active, suspended |
| Relazioni | Booking channel; net rate (OPEN) |
| SoT | Glossary; PLATFORM_MAP B2B |
| Impatto software | channel classification |

#### Partner
| Campo | Valore |
|-------|--------|
| Definizione | Impresa indipendente esecuzione e/o distribuzione |
| Responsabilità | Eseguire Assignment accettati; qualità; docs |
| Crea | Onboarding (Ops/Admin) |
| Modifica | Partner (profilo), Admin/Ops (status) |
| Legge | Partner (self), Dispatcher, Admin, Finance (payout) |
| Stati | applied, probation, active, suspended, offboarded |
| Relazioni | Partner Company; Drivers; Vehicles; Assignments; Score; Payouts |
| SoT | Partner Framework |
| Impatto software | `partner_id`; matching |

#### Partner Company
| Campo | Valore |
|-------|--------|
| Definizione | Entità legale del Partner |
| Responsabilità | KYC, contratti, tax id |
| Crea | Onboarding |
| Modifica | Admin/Legal; Partner (dati non critici) |
| Legge | Admin, Legal, Finance |
| Stati | verified, pending, rejected |
| Relazioni | 1 Partner operativo |
| SoT | Partner Framework |
| Impatto software | legal entity fields |

#### Driver
| Campo | Valore |
|-------|--------|
| Definizione | Persona che conduce il Vehicle |
| Responsabilità | Esecuzione Trip; aggiornamento stati |
| Crea | Admin / Partner (sub) |
| Modifica | Driver (profilo limitato), Admin, Partner owner |
| Legge | Driver (self), Dispatcher, Partner, Admin |
| Stati | active, inactive, suspended |
| Relazioni | Assignment, Trip, Vehicle; scope Partner o Internal |
| SoT | PLATFORM_MAP; Glossary |
| Impatto software | `driver_id`; RLS |

#### Dispatcher
| Campo | Valore |
|-------|--------|
| Definizione | Ruolo ops coda/assignment/eccezioni |
| Responsabilità | Assegnare, monitorare, escalare |
| Crea | Admin (utenti ruolo) |
| Modifica | Admin (ruoli) |
| Legge | Dispatcher console data scope |
| Stati | active (ruolo) |
| Relazioni | Opera su Booking, Assignment, Trip |
| SoT | PLATFORM_MAP |
| Impatto software | RBAC dispatcher |

#### Administrator
| Campo | Valore |
|-------|--------|
| Definizione | Ruolo amministrazione tenant/piattaforma |
| Responsabilità | Utenti, config, override autorizzati |
| Crea | Super-admin / provisioning |
| Modifica | Policy IAM |
| Legge | Ampio (auditato) |
| Stati | active, revoked |
| Relazioni | Configuration, Audit Log |
| SoT | PLATFORM_MAP; Blueprint RBAC |
| Impatto software | ruolo admin |

#### Broker
| Campo | Valore |
|-------|--------|
| Definizione | Intermediario domanda/offerta non tipizzato; **uso controllato** |
| Responsabilità | TBD se tipizzato |
| Crea | — (non attivare senza decisione) |
| Modifica | — |
| Legge | — |
| Stati | undefined |
| Relazioni | Eventuale futuro Marketplace |
| SoT | Glossary (deprecato generico) |
| Impatto software | Non introdurre `broker_id` senza OD |

---

### 5.2 Business (core commerciale)

#### Booking
| Campo | Valore |
|-------|--------|
| Definizione | Obbligazione commerciale Customer–Service–prezzo |
| Responsabilità | Ancora del ciclo economico e operativo |
| Crea | Customer, Agency, Admin, sistema |
| Modifica | Policy cancel/modifica; Dispatcher (ops fields); Finance (flags) |
| Legge | Customer (self), Dispatcher, Partner assegnato, Admin, Finance |
| Stati | requested, quoted, confirmed, in_progress, completed, cancelled, financially_closed |
| Relazioni | Quote, Payment, Assignment, Trip, Invoice, Dispute |
| SoT | SFOF lifecycle; Handoff booking |
| Impatto software | `booking_id` core |

#### Quote
| Campo | Valore |
|-------|--------|
| Definizione | Preventivo prezzo verso Customer |
| Responsabilità | Esporre gross/net; vincolare quotedPrice |
| Crea | Pricing Engine / sistema |
| Modifica | Sistema (supersede); Admin override manuale |
| Legge | Customer, Admin, Dispatcher |
| Stati | issued, superseded, accepted, expired |
| Relazioni | Booking, Pricing Rule, Vehicle Category |
| SoT | NCC; BOS; Handoff pricing |
| Impatto software | calculate API |

#### Service
| Campo | Valore |
|-------|--------|
| Definizione | Prestazione trasporto/NCC oggetto del Booking |
| Responsabilità | Tipologia e attributi servizio |
| Crea | Catalogo Product |
| Modifica | Product/Admin |
| Legge | Pubblico (catalogo), interni |
| Stati | active, retired |
| Relazioni | Service Category; Booking |
| SoT | Glossary; NCC |
| Impatto software | service type codes |

#### Service Category
| Campo | Valore |
|-------|--------|
| Definizione | Classificazione servizi (transfer, disposal, …) |
| Responsabilità | Raggruppamento pricing/ops |
| Crea | Product |
| Modifica | Product |
| Legge | Tutti autenticati rilevanti |
| Stati | active, retired |
| Relazioni | Service, Pricing Profile |
| SoT | NCC / Product |
| Impatto software | enum/catalog |

#### Pricing Rule
| Campo | Valore |
|-------|--------|
| Definizione | Regola tariffaria configurabile (minimo, km, notturno, …) |
| Responsabilità | Determinare componenti prezzo |
| Crea | Admin pricing |
| Modifica | Admin pricing |
| Legge | Pricing engine, Admin |
| Stati | draft, active, retired |
| Relazioni | Pricing Profile; Quote |
| SoT | NCC |
| Impatto software | `pricing_rules` |

#### Pricing Profile
| Campo | Valore |
|-------|--------|
| Definizione | Profilo aggregato di regole per tenant/mercato/veicolo |
| Responsabilità | Applicare set coerente di Pricing Rule |
| Crea | Admin |
| Modifica | Admin |
| Legge | Engine, Admin |
| Stati | active, retired |
| Relazioni | N Pricing Rule; Territory |
| SoT | NCC; BOS |
| Impatto software | profile binding |

#### Route
| Campo | Valore |
|-------|--------|
| Definizione | Tratta/percorso tipizzato (origine–destinazione / template) |
| Responsabilità | Redditività per tratta; template POI |
| Crea | Admin / sistema |
| Modifica | Admin |
| Legge | Pricing, Ops, Analytics |
| Stati | active, deprecated |
| Relazioni | Location endpoints; Booking; POI links |
| SoT | BOS §17; PLATFORM_MAP route_templates |
| Impatto software | `route_id` |

#### Location
| Campo | Valore |
|-------|--------|
| Definizione | Punto geografico indirizzo/coordinate |
| Responsabilità | Pickup/dropoff/stop |
| Crea | Sistema Places / utente |
| Modifica | Sistema geocode |
| Legge | Booking flow, Driver, Ops |
| Stati | resolved, unresolved |
| Relazioni | Booking stops; Airport/Station/Port/POI |
| SoT | Handoff Places |
| Impatto software | places API |

#### Availability
| Campo | Valore |
|-------|--------|
| Definizione | Capacità disponibile (Partner/Fleet/Driver) su finestra temporale |
| Responsabilità | Vincolare Offer/Assignment |
| Crea | Partner/Ops/sistema |
| Modifica | Owner capacità |
| Legge | Matching engine, Dispatcher |
| Stati | open, held, exhausted |
| Relazioni | Partner, Vehicle, Offer |
| SoT | Ops / Marketplace (futuro) |
| Impatto software | availability service futuro |

---

### 5.3 Marketplace

#### Listing
| Campo | Valore |
|-------|--------|
| Definizione | Pubblicazione generica di capacità/offerta |
| Responsabilità | Esporre disponibilità marketplace |
| Crea | Partner / Admin |
| Modifica | Owner listing |
| Legge | Matching, Admin |
| Stati | draft, published, paused, archived |
| Relazioni | Partner, Availability, Marketplace Listing |
| SoT | Blueprint Marketplace; Glossary |
| Impatto software | futuro |

#### Marketplace Listing
| Campo | Valore |
|-------|--------|
| Definizione | Listing nel contesto Marketplace cross-attore |
| Responsabilità | Distinguere da booking owned del tenant |
| Crea | Partner / sistema marketplace |
| Modifica | Owner; Admin compliance |
| Legge | Marketplace consumers, Admin |
| Stati | published, suspended |
| Relazioni | Listing; Offer marketplace |
| SoT | BOS Marketplace; Blueprint §20 |
| Impatto software | futuro canale |

#### Offer
| Campo | Valore |
|-------|--------|
| Definizione | Proposta Assignment a Partner (accept/reject) |
| Responsabilità | Negoziare costo entro budget |
| Crea | Dispatcher / sistema matching |
| Modifica | Sistema (stato); Partner (accept/reject) |
| Legge | Partner target, Dispatcher, Admin |
| Stati | proposed, accepted, rejected, expired, superseded |
| Relazioni | Booking, Assignment, Partner; budget check |
| SoT | Partner; SFOF; DECISIONS #7 OPEN |
| Impatto software | offer history fields |

---

### 5.4 Fleet & geo

#### Fleet
| Campo | Valore |
|-------|--------|
| Definizione | Insieme Vehicle sotto org/Partner |
| Responsabilità | Capacità e policy flotta |
| Crea | Admin / Partner |
| Modifica | Fleet manager |
| Legge | Ops, Partner, Admin |
| Stati | active, inactive |
| Relazioni | N Vehicle |
| SoT | Blueprint Fleet |
| Impatto software | fleet entity futura |

#### Vehicle
| Campo | Valore |
|-------|--------|
| Definizione | Mezzo classificato per esecuzione |
| Responsabilità | Idoneità Assignment; classe prezzo |
| Crea | Admin / Partner |
| Modifica | Owner flotta |
| Legge | Ops, Driver, Partner |
| Stati | available, assigned, maintenance, retired |
| Relazioni | Fleet, Vehicle Category, Assignment, Trip |
| SoT | NCC classi; PLATFORM_MAP |
| Impatto software | `vehicle_id` |

#### Vehicle Category
| Campo | Valore |
|-------|--------|
| Definizione | Classe veicolo (sedan, van, luxury, …) |
| Responsabilità | Pricing multipliers; matching |
| Crea | Product |
| Modifica | Product |
| Legge | Pubblico catalogo, engine |
| Stati | active, retired |
| Relazioni | Vehicle, Pricing Rule |
| SoT | NCC §4 |
| Impatto software | `vehicleType` |

#### Country / Region / City
| Campo | Valore |
|-------|--------|
| Definizione | Gerarchia geografica amministrativa |
| Responsabilità | Tax regime, Local Law, coverage RM |
| Crea | Configuration geo |
| Modifica | Admin |
| Legge | Ampio |
| Stati | active |
| Relazioni | Tax, Configuration, Airport… |
| SoT | BOS territory; Partner Local Law |
| Impatto software | geo dims; `territory_id` |

#### Airport / Station / Port
| Campo | Valore |
|-------|--------|
| Definizione | Nodi trasporto tipizzati (pickup policies) |
| Responsabilità | Wait policy, fees, POI |
| Crea | Admin catalogo |
| Modifica | Admin |
| Legge | Booking, Ops |
| Stati | active |
| Relazioni | Location; Pricing Rule (attesa aeroporto) |
| SoT | NCC wait airport; PLATFORM_MAP |
| Impatto software | pickup type |

#### POI
| Campo | Valore |
|-------|--------|
| Definizione | Point of Interest (fermata turistica/catalogo) |
| Responsabilità | Stop opzionali e pricing soste |
| Crea | Admin / static catalog |
| Modifica | Admin |
| Legge | Booking flow |
| Stati | active, hidden |
| Relazioni | Route templates; Booking stops |
| SoT | Handoff/PLATFORM_MAP POI |
| Impatto software | POI API; debito filtro on-route |

---

### 5.5 Operations

#### Trip
| Campo | Valore |
|-------|--------|
| Definizione | Esecuzione operativa del trasporto |
| Responsabilità | Stati missione, wait, geo |
| Crea | Sistema a conferma/assignment |
| Modifica | Driver, Dispatcher, sistema |
| Legge | Driver, Dispatcher, Customer (limitato), Partner |
| Stati | scheduled, en_route, arrived, ongoing, completed, no_show, cancelled |
| Relazioni | Booking, Assignment, Vehicle, Driver |
| SoT | Handoff trip-ops |
| Impatto software | trip-ops store/API |

#### Assignment
| Campo | Valore |
|-------|--------|
| Definizione | Attribuzione esecuzione INTERNAL \| PARTNER |
| Responsabilità | Collegare Booking a esecutore entro budget |
| Crea | Dispatcher / sistema |
| Modifica | Dispatcher (reassign); sistema |
| Legge | Dispatcher, Partner/Driver coinvolti, Admin |
| Stati | pending, offered, accepted, active, completed, reassigned, cancelled |
| Relazioni | Offer, Partner o Internal Driver, Vehicle, Trip |
| SoT | BOS; Partner; SFOF |
| Impatto software | `assignment_mode`, budget |

#### Notification
| Campo | Valore |
|-------|--------|
| Definizione | Messaggio multi-canale su eventi |
| Responsabilità | Informare attori |
| Crea | Sistema su Event |
| Modifica | Sistema (status delivery) |
| Legge | Destinatario, Admin |
| Stati | queued, sent, failed |
| Relazioni | Event, Customer/Driver/Partner |
| SoT | DECISIONS #8 OPEN provider |
| Impatto software | notification service |

#### Support Case
| Campo | Valore |
|-------|--------|
| Definizione | Caso supporto/eccezione umana |
| Responsabilità | Gestire eccezioni (BOS: umano su exception) |
| Crea | Customer, Ops, sistema |
| Modifica | Support agent |
| Legge | Support, Admin, soggetto caso |
| Stati | open, pending, resolved, closed |
| Relazioni | Booking, Dispute, Compensation |
| SoT | BOS supporto |
| Impatto software | support module futuro |

#### Partner Score
| Campo | Valore |
|-------|--------|
| Definizione | Indice qualità Partner |
| Responsabilità | Influenzare matching (senza subordinazione) |
| Crea | Sistema KPI |
| Modifica | Sistema; Ops override auditato |
| Legge | Partner (trasparenza), Dispatcher, Admin |
| Stati | current snapshot |
| Relazioni | Partner; KPI events |
| SoT | Partner Framework §18 |
| Impatto software | score job |

#### Customer Rating / Partner Rating / Vehicle-related ratings
| Campo | Valore |
|-------|--------|
| Definizione | Valutazioni post-servizio tra attori |
| Responsabilità | Feedback qualità |
| Crea | Customer / Partner secondo policy |
| Modifica | Moderazione Admin |
| Legge | Parti, Admin |
| Stati | submitted, hidden |
| Relazioni | Booking, Trip |
| SoT | Ops/Product (da dettagliare) |
| Impatto software | ratings tables future |

---

### 5.6 Finance

#### Payment
| Campo | Valore |
|-------|--------|
| Definizione | Obbligo/movimento pagamento Customer |
| Responsabilità | Auth/capture/offline receive |
| Crea | Sistema checkout |
| Modifica | PSP webhooks; Finance |
| Legge | Finance, Customer (self), Admin |
| Stati | Vedi SFOF Payment State Machine |
| Relazioni | Booking, Ledger Entry, Refund, Chargeback |
| SoT | SFOF §4 |
| Impatto software | PaymentIntent |

#### Settlement
| Campo | Valore |
|-------|--------|
| Definizione | Calcolo/approvazione line item post-service |
| Responsabilità | Determinare importi dovuti |
| Crea | Settlement Engine |
| Modifica | Finance (override motivato); sistema |
| Legge | Finance, Partner (proprie linee) |
| Stati | calculated, held, approved, posted |
| Relazioni | Booking, Ledger, Payout, Holdback |
| SoT | SFOF §5 |
| Impatto software | Settlement batch |

#### Payout
| Campo | Valore |
|-------|--------|
| Definizione | Trasferimento netto a Partner |
| Responsabilità | Eseguire pagamento partner |
| Crea | Payout Engine |
| Modifica | Finance (suspend/retry) |
| Legge | Finance, Partner |
| Stati | scheduled, initiated, paid, failed, suspended |
| Relazioni | Settlement, Wallet, Partner |
| SoT | SFOF §6 |
| Impatto software | Payout batch |

#### Wallet
| Campo | Valore |
|-------|--------|
| Definizione | Saldo logico per owner type |
| Responsabilità | Disponibile / pending / hold / reserve |
| Crea | Sistema |
| Modifica | Solo via Event/Ledger |
| Legge | Owner, Finance |
| Stati | active |
| Relazioni | Ledger Entry projections |
| SoT | SFOF §9 |
| Impatto software | wallet accounts |

#### Ledger / Ledger Entry
| Campo | Valore |
|-------|--------|
| Definizione | Registro append-only; singola scrittura immutabile |
| Responsabilità | Verità economica gestionale |
| Crea | Motori finanziari |
| Modifica | Mai overwrite; solo reversal entry |
| Legge | Finance, Audit, Admin (ristretto) |
| Stati | posted (entry) |
| Relazioni | Payment, Settlement, Refund, Tax… |
| SoT | SFOF §8 |
| Impatto software | ledger store |

#### Invoice / Credit Note
| Campo | Valore |
|-------|--------|
| Definizione | Documenti fiscali addebito/storno |
| Responsabilità | Compliance fatturazione |
| Crea | Billing dopo regole Tax Regime |
| Modifica | Finance (rettifiche via credit note) |
| Legge | Customer/Corporate, Finance |
| Stati | issued, voided |
| Relazioni | Booking/Account, Tax, Payment |
| SoT | SFOF; Blueprint Billing |
| Impatto software | invoicing |

#### Refund / Chargeback / Compensation / Recovery Cost
| Campo | Valore |
|-------|--------|
| Definizione | Vedi Glossary — voci economiche distinte |
| Responsabilità | Exception economics senza double count |
| Crea | Finance/Risk/Ops secondo tipo |
| Modifica | Solo adjusting/reversal |
| Legge | Finance, parti coinvolte |
| Stati | requested, posted, rejected |
| Relazioni | Payment, Booking, Dispute, Evidence |
| SoT | BOS P10; SFOF; Partner |
| Impatto software | amount fields dedicati |

#### Reserve / Holdback
| Campo | Valore |
|-------|--------|
| Definizione | Accantonamento policy vs trattenuta motivata |
| Responsabilità | Risk / fairness payout |
| Crea | Sistema policy / Finance su evento |
| Modifica | Release schedule; contestazione |
| Legge | Finance, Partner |
| Stati | held, released |
| Relazioni | Payout, Wallet, Dispute |
| SoT | SFOF; Partner PG-05 |
| Impatto software | reserve/holdback ledgers |

#### Commission / Platform Revenue
| Campo | Valore |
|-------|--------|
| Definizione | Fee contrattuale / ricavo piattaforma riconosciuto |
| Responsabilità | Economics piattaforma |
| Crea | Settlement posting |
| Modifica | Adjusting entry |
| Legge | Finance, Admin |
| Stati | posted |
| Relazioni | Booking, Ledger |
| SoT | BOS §6–7; NCC |
| Impatto software | commission lines (importi OPEN) |

#### Tax / Currency / Exchange Rate
| Campo | Valore |
|-------|--------|
| Definizione | Regime fiscale; valuta; tasso FX |
| Responsabilità | Correttezza importi multi-country |
| Crea | Configuration / market data |
| Modifica | Admin Finance; feed FX |
| Legge | Finance, Pricing |
| Stati | active |
| Relazioni | Quote, Invoice, Payment |
| SoT | BOS tax; SFOF i18n |
| Impatto software | `tax_regime`, `currency`, `fx_fee` |

---

### 5.7 Compliance & Documents

#### Dispute
| Campo | Valore |
|-------|--------|
| Definizione | Contestation interna con prove e appeals |
| Responsabilità | Due process Partner/Customer |
| Crea | Partner / Customer / sistema |
| Modifica | Reviewer, Appeals |
| Legge | Parti, Risk, Finance |
| Stati | open, under_review, resolved, escalated, closed |
| Relazioni | Evidence, Booking, Holdback, Recovery Cost |
| SoT | Partner §§24–25; SFOF §7 |
| Impatto software | dispute workflow |

#### Evidence
| Campo | Valore |
|-------|--------|
| Definizione | Prove collegate a incident/dispute |
| Responsabilità | Supportare decisioni |
| Crea | Partner, Driver, Ops, Customer |
| Modifica | Append metadata; no silent delete |
| Legge | Dispute parties, Ops, Legal |
| Stati | submitted, accepted, rejected |
| Relazioni | Dispute, Trip, Recovery Cost |
| SoT | Partner PG-08 |
| Impatto software | evidence store |

#### Document / Attachment
| Campo | Valore |
|-------|--------|
| Definizione | Documento formale (licenza, assicurazione, MPA) / file allegato |
| Responsabilità | Compliance ingresso Partner; versioning accettazione |
| Crea | Partner upload; Admin |
| Modifica | Verification workflow |
| Legge | Admin, Legal, Partner (own) |
| Stati | pending, verified, expired, rejected |
| Relazioni | Partner Company; Agreement versions |
| SoT | Partner §§6–7 |
| Impatto software | docs + expiry gate |

#### Audit Log / Event
| Campo | Valore |
|-------|--------|
| Definizione | Trace decisioni; fatto di dominio/finance |
| Responsabilità | Auditabilità e automation triggers |
| Crea | Sistema |
| Modifica | Append-only |
| Legge | Admin, Audit ruoli |
| Stati | recorded |
| Relazioni | Quasi tutte le entità mutabili |
| SoT | Partner PG-07; SFOF events; EDGF |
| Impatto software | audit/event store |

#### Configuration
| Campo | Valore |
|-------|--------|
| Definizione | Parametri business rules versionati |
| Responsabilità | Evitare hardcode (SFOF/EDGF) |
| Crea | Admin Back Office |
| Modifica | Admin con audit |
| Legge | Motori runtime (snapshot) |
| Stati | draft, active, retired |
| Relazioni | Pricing, Contestation Window, Reserve %… |
| SoT | SFOF §16 |
| Impatto software | config engine |

---

## 6. Relazioni principali

Descrizione testuale (nessun UML in questo task):

1. **Customer** (o Agency/Corporate Account) crea **Booking**.
2. **Booking** si basa su **Quote** prodotto da **Pricing Rule** / **Pricing Profile** e **Vehicle Category**.
3. **Booking** referenzia **Location** (e opzionalmente **POI**, **Airport**, **Route**).
4. **Booking** genera **Payment** (uno o più intent: acconto/saldo — policy OPEN).
5. **Payment** genera **Ledger Entry** (Payment Ledger).
6. **Booking** riceve **Assignment** (INTERNAL Driver **oppure** Partner).
7. **Assignment** può nascere da **Offer** accettata (se modello offer attivo).
8. **Assignment** utilizza **Vehicle** (e **Driver**).
9. **Assignment** / **Booking** generano **Trip** operativo.
10. Completamento **Trip** abilita **Settlement**.
11. **Settlement** genera **Ledger Entry** e può creare **Payout**.
12. **Payout** aggiorna proiezione **Wallet** Partner.
13. **Booking** può aprire **Dispute**; **Dispute** usa **Evidence**.
14. Eventi negativi creano **Refund** e/o **Compensation** e/o **Recovery Cost** e/o **Chargeback** (senza doppio conteggio).
15. **Holdback** / **Reserve** trattengono quote di **Payout** secondo policy.
16. **Settlement**/**Payment** alimentano **Commission** / **Platform Revenue** e **Tax**.
17. **Invoice** / **Credit Note** documentano obblighi fiscali verso Customer/Corporate.
18. **Partner** possiede **Partner Company**, **Document**, **Partner Score**.
19. **Marketplace Listing** (futuro) può generare **Offer**/Booking marketplace distinti dal owned booking.
20. Ogni mutazione rilevante emette **Event** e/o **Audit Log**.
21. **Configuration** parametrizza motori Pricing, Settlement, Contestation, Payout.
22. **Notification** è emessa a seguito di **Event** verso gli attori.

---

## 7. Lifecycle delle entità principali

### 7.1 Booking
`requested → quoted → confirmed → in_progress → completed → financially_closed`
Diramazioni: `cancelled` (policy OPEN); dispute possono sospendere chiusura finanziaria.

### 7.2 Assignment
`pending → offered → accepted → active → completed`
Diramazioni: `rejected`/`expired` (offer), `reassigned`, `cancelled`.

### 7.3 Trip
`scheduled → en_route → arrived → ongoing → completed`
Diramazioni: `no_show_*`, `cancelled`.

### 7.4 Payment
Allineato a SFOF: `draft → requires_action → authorized → captured → reconciled → closed` (+ failed/refund/chargeback paths).

### 7.5 Partner
`applied → (docs verified) → probation? → active` → `suspended` / `offboarded`.

### 7.6 Settlement → Payout
`calculated → (held?) → approved → posted` poi `payout scheduled → initiated → paid|failed`.

### 7.7 Dispute
`open → under_review → resolved|escalated → closed`.

---

## 8. Ownership (per categoria)

| Categoria | Owner funzionale |
|-----------|------------------|
| Identity | Product + Security |
| Business (Booking/Quote/Pricing) | Product / Commercial |
| Marketplace | Product Marketplace |
| Fleet / Geo assets | Operations / Fleet Lead |
| Operations (Trip/Assignment) | Operations Lead |
| Finance | Finance Lead |
| Compliance (Dispute/Evidence/Score) | Legal Ops + Risk |
| Documents | Legal Ops / Compliance |
| Configuration | Product + Finance (joint) |

---

## 9. Source of Truth (comportamento)

| Entità / gruppo | Documento ufficiale comportamento |
|-----------------|-----------------------------------|
| Termini | MC-OS-009 Glossary |
| Customer/ruoli superfici | PLATFORM_MAP / Handoff |
| Partner, Dispute, Holdback, Evidence, Score | Partner Framework |
| CM, costi XOR, budget, tax principles | BOS |
| Payment, Ledger, Settlement, Payout, Wallet | SFOF |
| Pricing rules / tariff NCC | NCC Tariff Requirements |
| Decisioni numeriche/policy aperte | DECISIONS_PENDING |
| Governance documentale | EDGF |
| Indice architetturale | Blueprint |

---

## 10. Decisioni approvate (solo già consolidate)

| ID | Decisione | Impatto entità |
|----|-----------|----------------|
| AD-BEM-01 | Privilegio CM/utile su GBV | Booking metrics, guards |
| AD-BEM-02 | Assignment INTERNAL XOR PARTNER | Assignment, costi |
| AD-BEM-03 | Max assignment budget enforced | Offer, Assignment |
| AD-BEM-04 | No double count exception economics | Refund, Compensation, Recovery, Chargeback |
| AD-BEM-05 | Tax regime configurabile; no IVA unica | Tax, Quote, Invoice |
| AD-BEM-06 | Partner indipendente; no subordinazione | Partner, Score design |
| AD-BEM-07 | Customer contratta con MyChauffeur; Partner esegue | Booking party, Assignment |
| AD-BEM-08 | Holdback solo motivato e contestabile | Holdback, Dispute |
| AD-BEM-09 | Audit trail / logging immutabile | Audit Log, Event, Ledger |
| AD-BEM-10 | Evidence obbligatoria su eventi critici | Evidence |
| AD-BEM-11 | Ledger append-only + reversal | Ledger Entry |
| AD-BEM-12 | Business rules configurabili | Configuration |
| AD-BEM-13 | Automazione ordinario / umano eccezioni | Support Case, Dispute queues |

---

## 11. Decisioni aperte (OPEN — non chiuse)

| Tema | Entità impattate | Fonte |
|------|------------------|-------|
| Provider pagamenti | Payment, Payment Provider | DECISIONS #1 |
| Acconto/saldo % | Payment, Booking | #2 |
| Cancel/penali Customer | Booking, Refund | #3 |
| Commissioni/net rate | Commission, Agency, Partner | #4 |
| Scope portale Partner | Partner UX | #5 |
| NCC go-live subset | Pricing Rule | #6 |
| Assign manual vs offer | Offer, Assignment | #7 |
| MoR vs Intermediario | Invoice, Platform Revenue | BOS/SFOF |
| Escrow on/off | Wallet Escrow | SFOF |
| Contestation window / silence | Dispute | SFOF/Partner |
| Reserve/rolling % | Reserve | SFOF |
| Tipizzazione Broker | Broker | Glossary |
| Ratings ufficiali | Customer/Partner Rating | Product |

---

## 12. Roadmap entità per fase

### OS Foundation (tenant, identity, auth, RBAC, RLS, bookings, services, assignments)
**Necessarie ora (concettuali da predisporre):** Organization/Tenant (implicita), Customer, Administrator, Dispatcher, Driver, Booking, Quote, Service, Service Category, Location, Vehicle, Vehicle Category, Assignment, Trip, Route (base), Pricing Rule/Profile (minime), Event, Audit Log, Configuration (scheletro), Document (minimo se auth partner non ancora).
**Non richiedere:** Settlement Engine completo, Payout, Reserve, Marketplace Listing.

### Marketplace
Listing, Marketplace Listing, Availability avanzata, Broker (solo se deciso), matching Offer cross-tenant.

### Finance
Payment (full SM), Ledger/Entry, Settlement, Payout, Wallet, Invoice, Credit Note, Refund, Chargeback, Commission, Platform Revenue, Tax, Currency, Exchange Rate, Reserve, Holdback, Compensation, Recovery Cost.

### Operations
Trip avanzato, Notification, Support Case, Partner Score, Evidence ops, POI on-route, Airport wait policies.

### Future Releases
Corporate Account completo, Agency portal, Ratings maturi, multi-country geo hierarchy estesa, Port/Station cataloghi estesi.

---

## Cronologia revisioni

| Versione | Data | Autore | Descrizione modifica | Stato |
|----------|------|--------|----------------------|-------|
| 0.1.0 | 2026-07-26 | Chief Enterprise Architect | Prima pubblicazione Business Entity Model concettuale: categorie, schede entità, relazioni, lifecycle, ownership, SoT, decisioni, roadmap fasi. | Draft |

---

*Fine di MC-OS-011 Business Entity Model v0.1.0 — Draft. Modello concettuale di dominio; non è schema database né specifica API.*

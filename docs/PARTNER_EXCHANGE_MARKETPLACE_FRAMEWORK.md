# MyChauffeur OS — Partner Exchange Marketplace Framework

| Campo | Valore |
|-------|--------|
| **Codice documento** | MC-OS-012 |
| **Titolo** | Partner Exchange Marketplace Framework |
| **Versione** | 0.1.0 |
| **Stato** | Draft |
| **Data creazione** | 2026-07-26 |
| **Ultima modifica** | 2026-07-26 |
| **Owner** | Marketplace & Partner Operations |
| **Autori** | MyChauffeur OS Team |
| **Documenti correlati** | MC-OS-000 EDGF · MC-OS-001 Blueprint · MC-OS-002 BOS · MC-OS-005 Partner · MC-OS-006 SFOF · MC-OS-009 Glossary · MC-OS-011 Entity Model · MC-OS-003 NCC · MC-OS-004 Decisions · MC-OS-029 Role/Permission Catalog |
| **Dipendenze** | Partner Framework; BOS; SFOF; Glossario; Business Entity Model; registro EDGF (§4.3 — codice MC-OS-012) |
| **Classificazione** | Official Domain Framework — Draft |
| **Documentation Release** | 0.1 (allineamento previsto) |

---

## Avvertenza

Questo documento definisce il **Partner Exchange Marketplace B2B**.  
Non è un contratto, non è schema SQL, non è specifica API.

I nomi di entità, stati, eventi e concetti software restano in **inglese** per coerenza con il futuro codice. Il testo normativo è in **italiano**.

### Riferimento Authorization Catalog (MC-OS-029)

Il catalogo ufficiale Role / Capability / Permission (inclusi Permission `exchange.*`, Scope `PARTNER_OWN` / `EXCHANGE_ELIGIBLE`, protezione Customer Price, Role futuri OriginatingPartner / ExecutingPartner) è **MC-OS-029** — [`ROLE_CAPABILITY_AND_PERMISSION_CATALOG.md`](./ROLE_CAPABILITY_AND_PERMISSION_CATALOG.md).  
I Role Exchange e le Permission Exchange **non** rientrano nel primo seed implementativo dello Step 4 Authorization Engine.

---

## Indice

1. [Scopo](#1-scopo) · 2. [Principi](#2-principi-del-partner-exchange) · 3. [Exchange B2B vs B2C](#3-differenza-tra-exchange-b2b-e-marketplace-b2c) · 4. [Attori](#4-attori-e-responsabilità) · 5–88. (sezioni successive)

---

## 1. Scopo

Definire il **Partner Exchange**: marketplace B2B in cui un Partner che possiede una corsa già acquisita ma **non coperta** può pubblicarla affinché un altro Partner autorizzato la accetti e la esegua.

La piattaforma **MyChauffeur** governa pubblicazione, matching, commissione, protezione dati, regole operative, prove, dispute, settlement, payout e reputazione.

**Fuori perimetro (non confondere):**

- marketplace B2C;
- catalogo pubblico servizi;
- portale agenzie;
- sola assegnazione interna Dispatcher;
- vendita diretta tour al consumatore.

---

## 2. Principi del Partner Exchange

| ID | Principio |
|----|-----------|
| PX-01 | Un Partner può operare sia come **buyer** sia come **seller** |
| PX-02 | L’**Originating Partner** mantiene la relazione commerciale con il proprio cliente |
| PX-03 | L’**Executing Partner** riceve solo i dati necessari all’esecuzione |
| PX-04 | Il **Customer Price** finale non è mostrato automaticamente all’Executing Partner |
| PX-05 | MyChauffeur trattiene una **Platform Fee** configurabile |
| PX-06 | Prima dell’accettazione l’Executing Partner è libero di rifiutare |
| PX-07 | Dopo l’accettazione nasce un obbligo operativo specifico |
| PX-08 | Subaffidamento ulteriore solo con autorizzazione |
| PX-09 | Nessuna trattenuta senza motivazione, Evidence e diritto di contestazione |
| PX-10 | Ogni **Service Order** è versionato |
| PX-11 | Offerte, controfferte, accettazioni, variazioni e accessi dati sono tracciati |
| PX-12 | Prenotazioni Exchange soggette alle policy generali piattaforma, salvo regole Exchange |
| PX-13 | Diritto italiano iniziale + **Local Law Schedule** internazionale |
| PX-14 | Se nessuno accetta entro scadenza: fondi sbloccati/restituiti all’Originating Partner; **nessuna commissione** piattaforma |
| PX-15 | Prima della pubblicazione: anteprima economica chiara (compenso, fee, totale, netto, condizioni rimborso) |
| PX-16 | Progressive Data Disclosure per geografia e temporale |
| PX-17 | Allineamento a CM / budget / XOR costi (BOS) e Holdback motivato (Partner/SFOF) |

---

## 3. Differenza tra Exchange B2B e marketplace B2C

| Dimensione | Partner Exchange (questo doc) | Marketplace B2C / altri |
|------------|------------------------------|-------------------------|
| Domanda | Partner con corsa già acquisita | Consumatore / catalogo pubblico |
| Offerta | Partner esecutori | Tenant owned / catalogo |
| Relazione cliente | Resta sull’Originating Partner | Tipicamente MyChauffeur o tenant verso End Customer |
| Prezzo cliente | Protetto (non auto-esposto all’esecutore) | Esposto al Customer |
| Attore buyer/seller | Entrambi Partner | Customer vs operator |

---

## 4. Attori e responsabilità

| Attore | Responsabilità principali |
|--------|---------------------------|
| **Originating Partner** | Possiede relazione con End Customer; pubblica Exchange Listing; autorizza fondi; mantiene Customer Price |
| **Executing Partner** | Accetta ed esegue; riceve dati progressive; riceve payout netto |
| **End Customer** | Passeggero/cliente dell’Originating Partner; non è controparte diretta Exchange |
| **MyChauffeur** | Matching, fee, data release, audit, dispute, settlement, payout, score |

---

## 5. Modelli commerciali supportati

Supporto concettuale (dettaglio fiscale **OPEN**):

- Exchange a **prezzo fisso** (`exchange_price`);
- Exchange con **Counter Offer**;
- Listing **invitational** / privato;
- Listing per **territorio** e **Partner class**;
- Commission plan configurabile (%, fisso, tier — importi OPEN).

Qualificazione Intermediary / MoR / Agency: **OPEN** + validazione professionale.

---

## 6. Origine della corsa

La corsa nasce fuori Exchange (Booking owned dell’Originating Partner) e diventa candidata Exchange quando:

- manca copertura interna/flotta;
- Dispatcher/Partner decide di pubblicare sull’Exchange;
- requisiti compliance Originating soddisfatti.

L’Exchange **non** sostituisce il Booking originario verso l’End Customer.

---

## 7. Area Partner “Vendi un servizio”

Area Partner Portal dedicata a:

- creare Exchange Listing;
- vedere anteprima economica (PX-15);
- gestire offerte/controfferte;
- monitorare stati Listing / Service Order;
- accedere a Wallet e Settlement Report (gestionale).

---

## 8. Creazione dell’Exchange Listing

Flusso concettuale:

```text
DRAFT → (anteprima economica) → PAYMENT_PENDING / FUNDS_RESERVED → PUBLISHED → MATCHING → …
```

Validazioni: campi obbligatori, compliance, Maximum Exchange Budget / margin guardrail, DataReleasePolicy associata.

---

## 9. Tipologie di servizio

| `service_type` | Descrizione |
|----------------|-------------|
| **TRANSFER** | Punto–punto (pickup → dropoff) |
| **DISPOSITION** | Servizio a disposizione (ore/km inclusi, regole overnight/spese) |

Estensioni future possibili via Configuration senza rompere il modello.

---

## 10. Classi veicolo richieste

| `vehicle_class` | Descrizione |
|-----------------|-------------|
| **CAR** | Autovettura / berlina |
| **VAN** | Van / minivan |
| **BUS** | Bus / coach |

Allineamento a Vehicle Category del dominio (sedan/van/luxury) via mapping Configuration (**OPEN** sul mapping luxury).

---

## 11. Dati obbligatori del Listing

### Comuni

`service_type`, `vehicle_class`, `service_date`, `pickup_time`, `pickup_city`, `dropoff_city`, `passengers_count`, `luggage_count`, `exchange_price`, `offer_expiration`, `notes_non_personal`, `counteroffers_allowed`

### Solo DISPOSITION

`expected_duration`, `included_hours`, `included_kilometers`, `expected_final_location`, `overnight_required`, `driver_expenses_rules`

---

## 12. Regola geografica dei 10 km

**Default configurabile:** raggio **10 km** da **geofence** della città (non semplice centroide).

| Condizione | Prima dell’accettazione |
|------------|-------------------------|
| Pickup entro geofence + 10 km | Solo **città**; nascosti indirizzo, struttura, via, civico |
| Pickup oltre 10 km | Almeno **località precisa**; via e civico ancora nascosti fino alla fase autorizzata |

Parametro: `geo_disclosure_radius_km` (default 10) + `city_geofence_id`.  
Oltre/sotto soglia: Configuration per Paese/tenant.

---

## 13. Dati pubblicabili prima dell’accettazione

Esempi: `service_type`, `vehicle_class`, date/time, città (e località se oltre soglia), pax/luggage, `exchange_price` / netto previsto per esecutore, note non personali, requisiti veicolo, flag controfferte, scadenza offerta.

---

## 14. Dati riservati prima dell’accettazione

Esempi: Customer Price, anagrafica End Customer, telefono, indirizzi via/civico (salvo regola §12), hotel/struttura, note personali, documenti identità, preferenze sensibili, margine Originating.

---

## 15. Progressive Data Disclosure

Livelli (`DataReleasePolicy`):

| Livello | Significato |
|---------|-------------|
| **PRE_ACCEPTANCE** | Solo dati §§13–14 |
| **POST_ACCEPTANCE** | Dati operativi non ancora full PII passeggero |
| **T_MINUS_12_HOURS** | Nome/cognome End Customer |
| **T_MINUS_6_HOURS** | Telefono End Customer |
| **SERVICE_ACTIVE** | Dati foglio di servizio necessari all’esecuzione |
| **POST_SERVICE_RESTRICTED** | Minimizzazione / revoca accessi non necessari |

Ogni passaggio emette Event + `DataAccessLog`.

---

## 16. Rilascio dei dati del passeggero

Regole iniziali:

- nome e cognome: **12 ore** prima (`T_MINUS_12_HOURS`);
- telefono: **6 ore** prima (`T_MINUS_6_HOURS`);
- foglio di servizio: entro finestra `SERVICE_ACTIVE` appropriata;
- **last minute**: rilascio immediato ma **tracciato**;
- accesso anticipato: richiede `reason_code` + audit.

Retention durata: **OPEN** (privacy).

---

## 17. Dati disponibili dopo l’accettazione

Oltre PRE_ACCEPTANCE: indirizzo operativo secondo policy (ancora progressive), istruzioni servizio non personali, contatti ops Originating se previsti, Service Order versionato, vincoli veicolo/autista, deadline presentazione.

PII completa solo secondo §15–16.

---

## 18. Protezione del Customer Price

Il prezzo finale al cliente **non** è mostrato automaticamente all’Executing Partner (decisione approvata).  
Eventuale esposizione in casi specifici: **OPEN** + Legal/Privacy.

---

## 19. Exchange Price

`exchange_price`: importo base dell’Exchange Listing offerto per l’esecuzione (lato economico Exchange), distinto da Customer Price.

Valuta: `currency` del Listing. Markup/sconti Originating sul Customer Price restano fuori vista esecutore.

---

## 20. Platform Fee

Commissione MyChauffeur configurabile (`CommissionPlan`): % e/o fisso, tier Partner — **importi OPEN**.  
Maturazione fiscale della fee: **OPEN**.

Se Listing **UNFILLED** / scaduto senza accettazione: **nessuna Platform Fee** (PX-14).

---

## 21. Executor Net Amount

```text
executor_net_amount = exchange_price - platform_fee
```

Formula **gestionale**. Base fiscale/contrattuale esatta (IVA, rivalsa, netting): **OPEN** + validazione professionale.

---

## 22. Anteprima economica prima della pubblicazione

L’Originating Partner deve vedere almeno:

- compenso offerto all’esecutore;
- commissione MyChauffeur;
- imposte applicabili **se configurate**;
- totale da autorizzare o pagare;
- netto previsto Executing Partner;
- politica di restituzione / rilascio fondi.

---

## 23. Modalità di inserimento del prezzo

Supporto concettuale:

1. “Voglio che l’esecutore riceva €X” → sistema calcola totale da autorizzare includendo Platform Fee (e tax se configurate).  
2. “Voglio spendere complessivamente €Y” → sistema calcola netto esecutore e fee.

Arrotondamenti e IVA: Configuration + **OPEN** fiscale.

---

## 24. Listing a prezzo fisso

`counteroffers_allowed = false`: accettazione all’`exchange_price` (o rifiuto / no response).

---

## 25. Listing con controfferta

`counteroffers_allowed = true`: Counter Offer entro limiti configurabili — **limiti numerici OPEN**.

---

## 26. Listing privato o invitational

Visibile solo a Partner invitati (`AssignmentAttempt` / invite list). Non entra nel matching pubblico territoriale.

---

## 27. Listing visibile per territorio

Matching filtrato su `territory_id` / city geofence / coverage Executing Partner.

---

## 28. Listing visibile per classe Partner

Filtro per Partner tier / vehicle capability / score minimo — soglie **OPEN**.

---

## 29. Requisiti di compliance per pubblicare

Originating: Partner active, docs validi, Wallet/payment method ok, accettazione policy Exchange, assenza sospensione, Listing completo, anteprima confermata.

---

## 30. Requisiti di compliance per accettare

Executing: Partner active, licenze/assicurazioni valide, vehicle_class abilitata, score/risk entro soglia, capacità, assenza conflitto di interesse vietato, accettazione obblighi post-accept.

---

## 31. Matching Engine

Motore che propone Listing a candidati Executing secondo territorio, classe, availability, score, fairness, invite list.  
Output: coda `AssignmentAttempt` / notifiche Offer.

---

## 32. Ranking e fairness

Ranking multi-fattore (capability, score, distanza operativa, load balancing).  
Fairness: evitare starvation Partner compliant. Pesi **OPEN**. Non progettare come controllo tipico della subordinazione (Partner Framework §38).

---

## 33. Acceptance Timeout

`offer_expiration` / timeout accettazione: se scaduto → No Response / Escalation / UNFILLED path.

Valori default: Configuration (**OPEN**).

---

## 34. No Response

Assenza di risposta entro timeout: tentativo chiuso; possibile rilancio ad altri Partner; non implica obbligo Executing.

---

## 35. Escalation automatica dell’offerta

Concetto: aumento automatico dell’attrattività (prezzo Exchange o priorità matching) se unmatched — **senza fissare aumenti numerici** (OPEN). Sempre entro Maximum Exchange Budget.

---

## 36. Maximum Exchange Budget

Cap di spesa Originating sull’Exchange, allineato a guardrail margine (BOS `maximum_assignment_budget` analogo lato Exchange).  
Il sistema blocca publish/escalation oltre budget.

---

## 37. Guardrail di margine

Blocco se Customer Price − costi Exchange (fee, exchange_price, pass-through) viola margine minimo Originating/tenant — soglie **OPEN**, principio allineato BOS CM.

---

## 38. Offer e Counter Offer

| Entità | Ruolo |
|--------|-------|
| **ExchangeOffer** | Proposta di accettazione a exchange_price o variante |
| **CounterOffer** | Controproposta economica/operativa |

Stati tipici: `proposed`, `accepted`, `rejected`, `expired`, `withdrawn`. Audit obbligatorio.

---

## 39. Accettazione

Accettazione vincolante ops: crea **Service Order** versionato + **ExchangeAssignment** verso Executing Partner; avvia Progressive Disclosure POST_ACCEPTANCE; fondi da RESERVED/HELD verso capture/confirm (**OPEN** dettagli PSP).

---

## 40. Service Order

Ordine di servizio Exchange **versionato** (PX-10): snapshot condizioni accettate, party, price components, data policy version, vehicle_class, service_type.  
Modifiche successive → nuova version + Event.

---

## 41. Assignment all’Executing Partner

`ExchangeAssignment` collega Service Order a Executing Partner (e poi Driver/Vehicle interni all’Executing).  
XOR: esecuzione Exchange ≠ Internal del tenant Originating.

---

## 42. Comunicazioni protette

Canale in-app / mascherato: niente bypass dati contatto fino alle finestre autorizzate. Side channel vietato da policy anti-disintermediazione.

---

## 43. Anti-disintermediazione

Misure **ragionevoli e proporzionate** (Partner Framework): divieto sollecito bypass durante/dopo servizio per periodo limitato — durata **OPEN** + Legal.

---

## 44. Subaffidamento ulteriore

Vietato di default; solo con autorizzazione MyChauffeur + compliance subaffidatario (PX-08).

---

## 45. Modifiche alla corsa

Modifiche material (orario, luogo, veicolo, pax) richiedono: nuova Service Order version, eventuale rinegoziazione prezzo, consenso secondo policy, audit.  
Impatto fondi: Adjustment / re-auth (**OPEN** PSP).

---

## 46. Cancellazione dell’Originating Partner

Policy cancel Exchange + eventuale impatto Customer (policy Customer resta OPEN in DECISIONS).  
Fondi: release/refund secondo timing; fee secondo Configuration (**OPEN** penali numeriche).

---

## 47. Cancellazione dell’Executing Partner

Post-accept cancel: obbligazione violata → Recovery, riassegnazione, Score hit, possibile Holdback motivato + Dispute.

---

## 48. No-show e ritardi

Classificazione no-show End Customer vs Executing vs Originating con Evidence.  
Allineamento Partner Framework / BOS; penali numeriche **OPEN**.

---

## 49. Recovery e riassegnazione

Recovery Cost al responsabile quando legalmente possibile; re-publish o assign alternativo; no double count con Refund/Compensation/Chargeback (BOS).

---

## 50. Prove operative

Evidence obbligatoria su eventi critici: GPS, timestamp, foto, check-in, comunicazioni. Entità `Evidence`.

---

## 51. Contestazioni tra Partner

Dispute Originating ↔ Executing su Exchange (qualità, no-show, importi). Diritto contestazione + Appeals (Partner Framework). Finestra **OPEN**.

---

## 52. Contestazioni dell’End Customer

Gestite primariamente da Originating Partner verso Customer; MyChauffeur può mediare se policy piattaforma. Attribuzione economica può riversarsi su Exchange Dispute.

---

## 53. Attribuzione della responsabilità

`responsible_party_code`: Originating / Executing / Platform / End Customer / Force majeure.  
Impatto: Recovery, Holdback, Score, SettlementLine.

---

## 54. Applicazione delle policy generali della piattaforma

Salvo override Exchange documentati: cancellazione, no-show, dispute, settlement, rating, privacy, subaffidamento, holdback motivato restano quelli di Partner/SFOF/BOS (PX-12).

---

## 55. Pagamento condizionato

Flusso concettuale:

```text
Publish → authorize/pay → funds RESERVED|HELD
→ se EXPIRED/UNFILLED: release/refund Originating; platform_fee = 0
→ ACCEPT: capture/confirm funds
→ execution → completion Evidence
→ contestation window
→ auto-approval se nessuna Dispute
→ Settlement → Payout Executing
```

Escrow giuridico vs HELD tecnico: **OPEN** + PSD2/Legal.

---

## 56. Refund o Release se nessuno accetta

Stato Listing **UNFILLED** o **EXPIRED** senza Accepted Offer: sblocco/restituzione **integrale** all’Originating Partner; MyChauffeur **non** trattiene commissioni (PX-14).

---

## 57. Partner Wallet

Saldi concettuali:

`available_balance`, `pending_balance`, `reserved_balance`, `disputed_balance`, `reserve_balance`, `withdrawable_balance`

Allineamento SFOF Wallet Model; movimenti solo via WalletEntry / Ledger.

---

## 58. Wallet dell’Originating Partner

Usato per: reserved funds su Listing, release/refund UNFILLED, adjustment Dispute, commission settlement verso Platform.

---

## 59. Wallet dell’Executing Partner

Usato per: pending post-accept, available post-settlement, holdback/reserve, withdrawable per Payout.

---

## 60. Settlement Exchange

Calcolo SettlementLine Exchange: exchange_price, platform_fee, executor_net, adjustment, recovery, holdback.  
Batch/idempotenza come SFOF; regole Exchange-specific dove serve.

---

## 61. Fatturazione e giroconto B2B

- **Settlement Report** = gestionale; **non** sostituisce fatture/note di credito.  
- Flussi fiscali dipendono da Intermediary / MoR / Agency — **OPEN**.  
- Validare con commercialista, fiscalista, avvocato, consulente PSD2/PSP.

---

## 62. Commission Invoice della piattaforma

Documento/addebito Platform Fee verso Originating (o soggetto configurato) — struttura **OPEN** fiscale.

---

## 63. Payout all’Executing Partner

PayoutLine post-settlement approval; scheduler SFOF; sospensione se Dispute/docs invalid.

---

## 64. Holdback e Reserve

Solo policy + motivazione + Evidence + contestabilità (PX-09).  
% Reserve / rolling: **OPEN**.

---

## 65. Exchange Score

Distinguere:

- performance come **Originating Partner**;
- performance come **Executing Partner**.

Metriche: fill rate, cancel post-accept, on-time, dispute rate, data-access abuse, UNFILLED publish quality.

---

## 66. Partner Score

Score complessivo Partner Framework; Exchange Score ne è componente.

---

## 67. Rating e reputazione pubblica

Rating post-servizio tra Partner (e verso esperienza End Customer mediata). Visibilità pubblica vs interna: Configuration.

---

## 68. Score interno e risk score

Risk score antifrode / collusion / side-payment; non esposto pubblicamente. Alimenta matching e sospensioni.

---

## 69. Warning, sospensione e offboarding

Sanctions ladder Partner Framework applicata a breach Exchange (publish abuse, cancel post-accept, data misuse).

---

## 70. Audit Trail

Ogni Offer, CounterOffer, accept, data access, funds move, Dispute: actor, timestamp, reason, entity ids, before/after o hash.

---

## 71. Financial Events

Esempi: `exchange_funds_reserved`, `exchange_funds_released_unfilled`, `exchange_fee_posted`, `exchange_settlement_approved`, `exchange_payout_paid`, `exchange_holdback_placed`.

---

## 72. Software Events

Esempi: `exchange_listing_published`, `exchange_offer_proposed`, `exchange_accepted`, `data_released_t_minus_12`, `service_order_versioned`, `geo_disclosure_applied`.

---

## 73. Entità concettuali

| Entità | Ruolo |
|--------|-------|
| ExchangeListing | Listing pubblicato |
| OriginatingPartner | Seller/buyer ruolo originating |
| ExecutingPartner | Esecutore |
| EndCustomerReference | Riferimento cliente (PII gated) |
| ExchangeOffer | Offerta |
| CounterOffer | Controfferta |
| ExchangeAssignment | Assignment Exchange |
| ServiceOrder | Ordine versionato |
| CommissionPlan | Piano fee |
| AssignmentAttempt | Tentativo matching |
| ExchangeEvent | Evento dominio Exchange |
| DataReleasePolicy | Policy disclosure |
| DataAccessLog | Log accessi dati |
| Evidence | Prove |
| Dispute | Contestazione |
| SettlementLine | Riga settlement |
| PayoutLine | Riga payout |
| PartnerWallet | Wallet |
| WalletEntry | Movimento wallet |

---

## 74. Permission Model

RBAC + policy data release: Originating vede Customer Price; Executing no (default); Ops/Admin auditati; Finance vede line items; Driver Executing vede solo finestra SERVICE_ACTIVE.

---

## 75. Configurazione per tenant

Fee plan, geo radius, timeout, invite rules, vehicle mapping, margin guardrail, wallet rails — per `organization_id`.

---

## 76. Configurazione per Paese

Local Law Schedule, tax display, payout rails, consumer overlays se End Customer in giurisdizione, geofence città.

---

## 77. State Machine del Listing

Stati almeno:

`DRAFT`, `PAYMENT_PENDING`, `FUNDS_RESERVED`, `PUBLISHED`, `MATCHING`, `OFFER_RECEIVED`, `COUNTEROFFER_PENDING`, `ACCEPTED`, `ASSIGNED`, `IN_EXECUTION`, `COMPLETED`, `PENDING_VALIDATION`, `DISPUTED`, `SETTLED`, `PAID`, `CANCELLED`, `EXPIRED`, `UNFILLED`

---

## 78. State Machine del Service

Allineata a Trip/Service ops: `scheduled` → `en_route` → `arrived` → `ongoing` → `completed` (+ `no_show_*`, `cancelled`).

---

## 79. State Machine dell’Assignment

`pending` → `offered` → `accepted` → `active` → `completed` (+ `rejected`, `expired`, `reassigned`, `cancelled`).

---

## 80. State Machine economica

`authorization_pending` → `funds_reserved` → `captured` | `released_unfilled` → `settlement_pending` → `settled` → `paid` (+ `disputed`, `adjusted`).

---

## 81. State Machine del Payout

`scheduled` → `initiated` → `paid` | `failed` | `suspended` (SFOF).

Le cinque state machine restano **separate**.

---

## 82. Decision Engine

| Tipo | Esempi |
|------|--------|
| **Automatiche** | Blocco over budget; UNFILLED release; timeout offer; data release schedulato; auto-approval post-window |
| **Configurabili** | Radius km, timeout, fee plan, tier visibility |
| **Manuali** | Dispute high-value; override compliance; force reassign |

---

## 83. Alert automatici

Unfilled risk, timeout approaching, data access anomaly, cancel post-accept, funds capture fail, margin breach attempt, geo-disclosure misconfig, dispute spike.

---

## 84. KPI del Partner Exchange

Fill rate, time-to-accept, UNFILLED rate, cancel post-accept %, on-time execution, dispute rate, fee revenue, CM Exchange, Originating vs Executing score, data-access audit exceptions.

---

## 85. Decisioni approvate

| ID | Decisione |
|----|-----------|
| PX-DA-01 | Partner buyer e seller |
| PX-DA-02 | Originating mantiene relazione commerciale col cliente |
| PX-DA-03 | Executing: solo dati necessari |
| PX-DA-04 | Customer Price non auto-mostrato all’Executing |
| PX-DA-05 | Platform Fee configurabile |
| PX-DA-06 | Pre-accept: libero rifiuto |
| PX-DA-07 | Post-accept: obbligo operativo |
| PX-DA-08 | Subaffidamento solo autorizzato |
| PX-DA-09 | No trattenuta senza motivazione/Evidence/contestazione |
| PX-DA-10 | Service Order versionato |
| PX-DA-11 | Trace offerte/accessi/variazioni |
| PX-DA-12 | Policy generali piattaforma salvo regole Exchange |
| PX-DA-13 | IT iniziale + Local Law Schedule |
| PX-DA-14 | UNFILLED: refund/release integrale; no fee piattaforma |
| PX-DA-15 | Anteprima economica pre-publish obbligatoria |

---

## 86. Decisioni OPEN

| Tema | Note |
|------|------|
| % commissione / fee fissa / tier | Non fissare |
| Chi emette fattura a chi | MoR/Intermediary/Agency |
| Mandato con/senza rappresentanza | Legal |
| MoR vs intermediario | BOS/SFOF |
| Escrow giuridico | PSD2/Legal |
| Contestation window durata | |
| % Reserve | |
| Limiti controfferte | |
| Aumento automatico offerta | |
| Penali numeriche | |
| Momento fiscale maturazione fee | |
| Trattamento IVA | |
| Durata conservazione dati | Privacy |
| Mostrare Customer Price in casi specifici | |
| Mapping CAR/VAN/BUS ↔ luxury | Product |
| Default timeout accept | |

Allineare anche DECISIONS_PENDING rilevanti (#1–#5, #7) senza chiuderli.

---

## 87. Validazioni professionali

| Ruolo | Temi |
|-------|------|
| **Commercialista** | Settlement Report vs fatture; giroconto; mapping ledger |
| **Fiscalista** | IVA; MoR/intermediario; maturazione fee |
| **Avvocato** | Obbligo post-accept; anti-disintermediazione; dispute; Local Law |
| **PSD2 / PSP** | Funds RESERVED/HELD; capture; split; escrow |
| **Privacy / GDPR** | Progressive disclosure; retention; DataAccessLog |
| **Normativa trasporto** | Licenze Executing; subaffidamento; foglio di servizio |

---

## 88. Roadmap di implementazione

| Fase | Contenuto |
|------|-----------|
| **Foundation** | Entità Listing/Offer/ServiceOrder; RBAC Partner; geo disclosure; audit |
| **Exchange MVP** | Publish, fixed price accept, funds reserve/release UNFILLED, assignment, basic disclosure timeline |
| **Finance Integration** | Fee, settlement lines, wallets, payout, holdback motivato |
| **Advanced Matching** | Ranking, counteroffer, escalation, invite, score Exchange |
| **International Expansion** | Local Law, multi-currency, country config |

---

## Cronologia revisioni

| Versione | Data | Autore | Descrizione modifica | Stato |
|----------|------|--------|----------------------|-------|
| 0.1.0 | 2026-07-26 | MyChauffeur OS Team | Prima stesura Partner Exchange Marketplace Framework (MC-OS-012): principi, listing, disclosure, economics, state machine, roadmap. | Draft |

---

*Fine di MC-OS-012 Partner Exchange Marketplace Framework v0.1.0 — Draft. Non costituisce contratto né parere fiscale/PSD2.*

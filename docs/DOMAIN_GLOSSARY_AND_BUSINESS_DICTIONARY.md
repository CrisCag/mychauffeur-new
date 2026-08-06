# MyChauffeur OS — Domain Glossary and Business Dictionary

| Campo | Valore |
|-------|--------|
| **Codice documento** | MC-OS-009 |
| **Titolo** | Domain Glossary and Business Dictionary |
| **Versione** | 0.1.0 |
| **Stato** | Draft |
| **Data creazione** | 2026-07-26 |
| **Ultima modifica** | 2026-07-26 |
| **Owner** | Documentation Governance Lead / Domain Owner congiunto |
| **Autori** | Chief Enterprise Architect |
| **Documenti correlati** | MC-OS-000 EDGF · MC-OS-001 Blueprint · MC-OS-002 BOS · MC-OS-003 NCC · MC-OS-004 Decisions · MC-OS-005 Partner · MC-OS-006 SFOF · MC-OS-007 Platform Map · MC-OS-008 Handoff |
| **Dipendenze** | Enterprise Documentation Governance Framework (EDGF) |
| **Classificazione** | Governance — Glossario e dizionario di business |
| **Documentation Release** | 0.1 (allineamento previsto) |

---

## 1. Scopo

Il presente documento è la **Source of Truth ufficiale della terminologia** dell’ecosistema MyChauffeur OS.

Obiettivi:

- una sola **definizione ufficiale** per ogni termine di dominio;
- normalizzazione dei termini usati con significati divergenti nei documenti esistenti (senza modificarli in questo task);
- riferimento obbligatorio per Product, Business, Finance, Legal, Operations e Engineering;
- base per il futuro aggiornamento degli altri documenti (cross-ref, non copia).

**Fuori ambito:** implementazione software, schema SQL, contratti firmati, formule fiscali definitive.

---

## 2. Regole del Glossario

1. **Un termine → una definizione.** Vietate definizioni concorrenti in altri documenti; altrove solo rinvio a MC-OS-009.
2. **Conflitti:** se un documento legacy diverge, prevale questo Glossario; il conflitto si registra in §10 fino al sync.
3. **Nuovi termini:** si aggiungono solo qui (EDGF); poi si citano altrove.
4. **Sinonimi:** elencati come “da evitare”; non usati in nuovi testi.
5. **Deprecati:** solo in §9; non riutilizzare.
6. **Validazioni professionali** (MoR, tax, ecc.) non chiudono la definizione operativa: la marcatura resta esplicita.
7. **Lingua:** termini canonici in inglese tecnico dove già consolidati nel corpus; glossario operativo IT ammessi come alias solo se elencati.

---

## 3. Convenzioni di Naming

| Regola | Esempio |
|--------|---------|
| Entità di business in **PascalCase** nei modelli concettuali | `Booking`, `PartnerCompany` |
| Campi/dati in **snake_case** | `booking_id`, `partner_cost` |
| Document Identifier | `MC-OS-NNN` (immutabile — EDGF) |
| Eventi finanziari | `snake_case` passato (`payment_captured`) — SFOF |
| Evitare acronimi non definiti qui | GBV ok; GMV deprecato come sinonimo ambiguo |
| Non usare “Supplier” generico | Preferire Partner / Internal execution |

---

## 4. Entità e termini di Business (definizioni ufficiali)

Per ogni termine: definizione, sinonimi da evitare, SoT, correlati, impatto software.

### 4.1 Customer

| Campo | Valore |
|-------|--------|
| **Definizione ufficiale** | Soggetto (persona o organizzazione) che richiede o beneficia di un Service tramite MyChauffeur OS. |
| **Sinonimi da evitare** | User (troppo generico), Client ambiguo senza contesto |
| **SoT** | MC-OS-009 (questo doc); ruoli in PLATFORM_MAP |
| **Correlati** | Consumer, B2B Customer, Corporate Account, Booking |
| **Impatto software** | `customer_id`; profili; privacy purpose limitation |

### 4.2 Consumer

| Campo | Valore |
|-------|--------|
| **Definizione ufficiale** | Customer persona fisica che agisce per scopi estranei all’attività professionale; soggetto a tutele consumer law. |
| **Sinonimi da evitare** | Usare “Customer” senza distinguere quando serve la tutela consumatore |
| **SoT** | MC-OS-009; Partner/Legal (tutela) |
| **Correlati** | Customer, Invoice, Refund |
| **Impatto software** | Flag/classificazione consumer vs business; ToS/display |

### 4.3 Corporate (Corporate Account)

| Campo | Valore |
|-------|--------|
| **Definizione ufficiale** | Account/contratto aziendale con condizioni dedicate, fatturazione periodica e policy viaggio (`corporate_account_id`). |
| **Sinonimi da evitare** | Confondere con generico B2B senza account strutturato |
| **SoT** | MC-OS-002 BOS §3.4; MC-OS-009 |
| **Correlati** | Customer, Agency, Settlement, Invoice |
| **Impatto software** | `corporate_account_id`; cicli billing; credit terms (OPEN) |

### 4.4 Agency

| Campo | Valore |
|-------|--------|
| **Definizione ufficiale** | B2B Customer tipicamente travel/OTA/hotel che porta domanda; può non eseguire il trasporto. |
| **Sinonimi da evitare** | Partner (se solo domanda e non esecuzione) |
| **SoT** | MC-OS-009; PLATFORM_MAP (B2B) |
| **Correlati** | B2B Distribution, Partner, Booking |
| **Impatto software** | Channel classification; net rate (OPEN) |

### 4.5 Partner

| Campo | Valore |
|-------|--------|
| **Definizione ufficiale** | Impresa **indipendente** che collabora con MyChauffeur (esecuzione Service e/o distribuzione); **non** in rapporto di subordinazione. |
| **Sinonimi da evitare** | Driver (persona), Supplier, Vendor generico, “autista MyChauffeur” |
| **SoT** | MC-OS-005 Partner Framework |
| **Correlati** | Partner Company, Driver, Assignment, Settlement |
| **Impatto software** | `partner_id`; onboarding; matching; payout |

### 4.6 Partner Company

| Campo | Valore |
|-------|--------|
| **Definizione ufficiale** | Entità legale del Partner (ragione sociale, tax id); titolare del rapporto contrattuale (MPA futuro). |
| **Sinonimi da evitare** | Usare solo “Partner” quando serve l’anagrafica legale |
| **SoT** | MC-OS-005 |
| **Correlati** | Partner, Invoice, KYC |
| **Impatto software** | Legal entity fields; document store |

### 4.7 Driver

| Campo | Valore |
|-------|--------|
| **Definizione ufficiale** | Persona che conduce il Vehicle nell’esecuzione del Service. |
| **Sinonimi da evitare** | Partner (impresa), Chauffeur come ruolo RBAC non definito |
| **SoT** | PLATFORM_MAP (ruoli); MC-OS-009 |
| **Correlati** | Internal Driver, Partner, Assignment, Trip |
| **Impatto software** | `driver_id`; RLS per scope; trip-ops |

### 4.8 Internal Driver

| Campo | Valore |
|-------|--------|
| **Definizione ufficiale** | Driver nella sfera organizzativa del tenant/MyChauffeur (`assignment_mode = INTERNAL`). |
| **Sinonimi da evitare** | Partner driver |
| **SoT** | MC-OS-002 BOS P11 |
| **Correlati** | Internal Execution Cost, Assignment |
| **Impatto software** | `assignment_mode`; costo `internal_execution_cost` |

### 4.9 Dispatcher

| Campo | Valore |
|-------|--------|
| **Definizione ufficiale** | Ruolo operativo che gestisce coda, Assignment, eccezioni e monitoraggio delle corse. |
| **Sinonimi da evitare** | Admin (privilegi più ampi), Operator ambiguo |
| **SoT** | PLATFORM_MAP Modello operativo |
| **Correlati** | Assignment, Offer, Booking |
| **Impatto software** | RBAC dispatcher; console ops |

### 4.10 Broker

| Campo | Valore |
|-------|--------|
| **Definizione ufficiale** | Soggetto che intermedia domanda/offerta senza necessariamente eseguire il trasporto; nel modello MyChauffeur OS va reso esplicito il ruolo (Agency vs Partner distributore vs piattaforma). **Uso sconsigliato** finché non tipizzato in prodotto. |
| **Sinonimi da evitare** | Usare Broker come sinonimo generico di Partner |
| **SoT** | MC-OS-009 (placeholder controllato) |
| **Correlati** | Agency, Marketplace, Partner |
| **Impatto software** | Non introdurre `broker_id` senza decisione prodotto |

### 4.11 Administrator

| Campo | Valore |
|-------|--------|
| **Definizione ufficiale** | Ruolo con privilegi di amministrazione tenant/piattaforma (utenti, tariffe, configurazioni, audit). |
| **Sinonimi da evitare** | Owner (document ownership ≠ admin sistema) |
| **SoT** | PLATFORM_MAP; Blueprint RBAC |
| **Correlati** | Configuration, Audit Log |
| **Impatto software** | Ruolo `admin`; RLS admin |

### 4.12 Fleet

| Campo | Valore |
|-------|--------|
| **Definizione ufficiale** | Insieme di Vehicle (e vincoli operativi) disponibili per Assignment sotto un’organizzazione o Partner. |
| **Sinonimi da evitare** | Inventory ambiguo |
| **SoT** | Blueprint Fleet; PLATFORM_MAP |
| **Correlati** | Vehicle, Partner, Assignment |
| **Impatto software** | Fleet entities future; availability |

### 4.13 Vehicle

| Campo | Valore |
|-------|--------|
| **Definizione ufficiale** | Mezzo di trasporto classificato (sedan, van, luxury, …) usato nell’esecuzione. |
| **Sinonimi da evitare** | Car generico; `other` vs `luxury` non allineati (debito noto PLATFORM_MAP) |
| **SoT** | NCC classi; PLATFORM_MAP |
| **Correlati** | Fleet, Trip, Quote |
| **Impatto software** | `vehicle_id`, `vehicleType` |

### 4.14 Booking

| Campo | Valore |
|-------|--------|
| **Definizione ufficiale** | Prenotazione / obbligazione commerciale che collega Customer, prezzo, Service e ciclo finanziario (`booking_id`). |
| **Sinonimi da evitare** | Order ambiguo; Request se già confermata |
| **SoT** | MC-OS-006 lifecycle; HANDOFF booking |
| **Correlati** | Quote, Trip, Payment, Settlement |
| **Impatto software** | Entità core; API booking |

### 4.15 Trip

| Campo | Valore |
|-------|--------|
| **Definizione ufficiale** | Istanza operativa dell’esecuzione del trasporto (stati missione, geo, wait) collegata a un Booking. |
| **Sinonimi da evitare** | Usare Trip e Service come sinonimi assoluti |
| **SoT** | HANDOFF trip-ops; PLATFORM_MAP |
| **Correlati** | Booking, Driver, Assignment |
| **Impatto software** | `operational-trips` / trip-ops; status machine |

### 4.16 Assignment

| Campo | Valore |
|-------|--------|
| **Definizione ufficiale** | Attribuzione dell’esecuzione a INTERNAL o PARTNER (con Driver/Vehicle), nel rispetto di `maximum_assignment_budget`. |
| **Sinonimi da evitare** | Dispatch come solo UI; Allocation ambiguo |
| **SoT** | MC-OS-002; MC-OS-005; MC-OS-006 |
| **Correlati** | Offer, Partner Cost, Internal Execution Cost |
| **Impatto software** | `assignment_mode`, attempts, budget check |

### 4.17 Listing

| Campo | Valore |
|-------|--------|
| **Definizione ufficiale** | Pubblicazione di capacità/offerta sul Marketplace (se/quando attivo); distinta dal Booking del tenant. |
| **Sinonimi da evitare** | Booking, Offer (offer è proposta su Assignment) |
| **SoT** | Blueprint Marketplace; MC-OS-009 |
| **Correlati** | Marketplace, Partner |
| **Impatto software** | Non implementato; riservare naming |

### 4.18 Offer

| Campo | Valore |
|-------|--------|
| **Definizione ufficiale** | Proposta economica/operativa a un Partner per un Assignment (accept/reject), soggetta a budget massimo. |
| **Sinonimi da evitare** | Quote (prezzo al Customer), Bid generico |
| **SoT** | MC-OS-005; MC-OS-006; DECISIONS #7 (meccanismo OPEN) |
| **Correlati** | Assignment, Partner Cost |
| **Impatto software** | `offer_escalation_history`, `final_accepted_partner_offer` |

### 4.19 Quote

| Campo | Valore |
|-------|--------|
| **Definizione ufficiale** | Preventivo di prezzo verso il Customer (gross/net secondo Tax Regime) prima o contestuale alla conferma Booking. |
| **Sinonimi da evitare** | Offer (lato Partner) |
| **SoT** | NCC; BOS; HANDOFF pricing |
| **Correlati** | Customer Price, Booking, Commission |
| **Impatto software** | `trips/calculate`; `quotedPrice` validation |

### 4.20 Service

| Campo | Valore |
|-------|--------|
| **Definizione ufficiale** | Prestazione di trasporto/NCC oggetto del Booking (il valore erogato al Customer). |
| **Sinonimi da evitare** | Product ambiguo; Trip come solo stato ops |
| **SoT** | MC-OS-009; NCC tipologie |
| **Correlati** | Booking, Trip, Assignment |
| **Impatto software** | Tipologie servizio; stati completamento |

### 4.21 Marketplace

| Campo | Valore |
|-------|--------|
| **Definizione ufficiale** | Linea/modello in cui la piattaforma intermedia o abbina domanda e offerta tra attori (anche cross-tenant), distinta dal booking “owned” puro del tenant. |
| **Sinonimi da evitare** | Usare Marketplace per ogni Partner assignment interno |
| **SoT** | MC-OS-002 §3.1; Blueprint §20 |
| **Correlati** | Listing, Partner, Platform Revenue |
| **Impatto software** | Flag canale; settlement rules diverse |

### 4.22 Settlement

| Campo | Valore |
|-------|--------|
| **Definizione ufficiale** | Calcolo e approvazione delle line item economiche post-Service (prima del Payout). |
| **Sinonimi da evitare** | Payout (è il trasferimento), Reconciliation (è il match PSP/banca) |
| **SoT** | MC-OS-006 SFOF |
| **Correlati** | Ledger, Payout, Contestation |
| **Impatto software** | Settlement Engine; `settlement_batch_id` |

### 4.23 Wallet

| Campo | Valore |
|-------|--------|
| **Definizione ufficiale** | Saldo logico (Customer / Partner / Platform / Escrow / Reserve) tipicamente proiezione dei Ledger. |
| **Sinonimi da evitare** | Conto bancario reale; PSP wallet esterno senza distinzione |
| **SoT** | MC-OS-006 §9 |
| **Correlati** | Ledger, Payout, Escrow |
| **Impatto software** | Wallet accounts; non cash arbitrario da UI |

### 4.24 Ledger

| Campo | Valore |
|-------|--------|
| **Definizione ufficiale** | Registro **append-only** di movimenti economici per tipologia (Payment, Payout, Tax, …); correzioni solo via reversal. |
| **Sinonimi da evitare** | Log applicativo generico; overwrite “fix” |
| **SoT** | MC-OS-006 §8 |
| **Correlati** | Audit Log, Financial Events |
| **Impatto software** | Ledger entries immutabili |

### 4.25 Payment

| Campo | Valore |
|-------|--------|
| **Definizione ufficiale** | Obbligo/movimento di pagamento del Customer (o account) verso la piattaforma secondo Payment State Machine. |
| **Sinonimi da evitare** | Payout; Settlement |
| **SoT** | MC-OS-006 §4 |
| **Correlati** | Payment Provider, Refund, Chargeback |
| **Impatto software** | PaymentIntent; stati auth/capture |

### 4.26 Refund

| Campo | Valore |
|-------|--------|
| **Definizione ufficiale** | Restituzione (parziale/totale) al Customer su Payment o credito; conteggiata **una sola volta** nel P&L. |
| **Sinonimi da evitare** | Compensation, Chargeback (canali diversi) |
| **SoT** | MC-OS-002 P10; MC-OS-006 |
| **Correlati** | Credit Note, Dispute |
| **Impatto software** | `refund_amount`; Refund Ledger |

### 4.27 Chargeback

| Campo | Valore |
|-------|--------|
| **Definizione ufficiale** | Contestazione/storno avviata tramite schema del Payment Provider. |
| **Sinonimi da evitare** | Contestation interna; Refund automatico senza distinzione |
| **SoT** | MC-OS-006 |
| **Correlati** | Payment, Dispute, Risk |
| **Impatto software** | Chargeback Ledger; webhooks PSP |

### 4.28 Reserve

| Campo | Valore |
|-------|--------|
| **Definizione ufficiale** | Accantonamento policy-based su fondi altrimenti dovuti (rischio, nuovi Partner); parametri numerici **OPEN**. |
| **Sinonimi da evitare** | Holdback (trattenuta motivata su evento) |
| **SoT** | MC-OS-006 §6 |
| **Correlati** | Rolling reserve, Wallet Reserve |
| **Impatto software** | Reserve Ledger; release schedule |

### 4.29 Holdback

| Campo | Valore |
|-------|--------|
| **Definizione ufficiale** | Trattenuta **temporanea e motivata** su importo altrimenti dovuto; mai automatica senza reason/evidence; contestabile. |
| **Sinonimi da evitare** | Reserve; penale silenziosa |
| **SoT** | MC-OS-005 PG-05; MC-OS-006 |
| **Correlati** | Contestation, Recovery Cost |
| **Impatto software** | Blocco withhold senza motivazione |

### 4.30 Commission

| Campo | Valore |
|-------|--------|
| **Definizione ufficiale** | Fee o percentuale contrattuale (piattaforma e/o Partner) distinta dal Markup di prezzo. Importi **OPEN** (DECISIONS #4). |
| **Sinonimi da evitare** | Markup; Platform Revenue (può includere più voci) |
| **SoT** | NCC; MC-OS-002; MC-OS-004 |
| **Correlati** | Platform Revenue, Take rate |
| **Impatto software** | Commission Ledger; config |

### 4.31 Markup

| Campo | Valore |
|-------|--------|
| **Definizione ufficiale** | Maggiorazione applicata a una base di costo/prezzo per formare il Customer Price (es. VIP). |
| **Sinonimi da evitare** | Commission |
| **SoT** | HANDOFF comfort-mode; NCC |
| **Correlati** | Quote, Customer Price |
| **Impatto software** | Multipliers; comfort-mode |

### 4.32 Platform Revenue

| Campo | Valore |
|-------|--------|
| **Definizione ufficiale** | Ricavo riconosciuto alla piattaforma secondo modello commerciale (MoR / intermediario / SaaS / B2B); **non** coincide con GBV. |
| **Sinonimi da evitare** | GBV, GMV come “ricavo” |
| **SoT** | MC-OS-002 §6 |
| **Correlati** | Commission, Contribution Margin |
| **Impatto software** | Revenue posting; reporting |

### 4.33 Contribution Margin

| Campo | Valore |
|-------|--------|
| **Definizione ufficiale** | Margine dopo costi variabili diretti rilevanti del Booking/periodo; KPI primario insieme all’utile. |
| **Sinonimi da evitare** | Gross Margin come sinonimo; profitto di bilancio |
| **SoT** | MC-OS-002 §9 |
| **Correlati** | GBV, Platform Revenue, Assignment budget |
| **Impatto software** | `contribution_margin`, guards |

### 4.34 Gross Margin

| Campo | Valore |
|-------|--------|
| **Definizione ufficiale** | Margine dopo costo di esecuzione (INTERNAL XOR PARTNER) e pass-through netti rilevanti; gestionale ≠ bilancio ufficiale. |
| **Sinonimi da evitare** | Contribution Margin |
| **SoT** | MC-OS-002 §8; NCC livelli |
| **Correlati** | Partner Cost, Internal Execution Cost |
| **Impatto software** | Report ops |

### 4.35 GBV (Gross Booking Value)

| Campo | Valore |
|-------|--------|
| **Definizione ufficiale** | Volume lordo prenotato lato Customer nel perimetro; indicatore di volume, **non** KPI primario di successo. |
| **Sinonimi da evitare** | GMV (ambiguo); Platform Revenue |
| **SoT** | MC-OS-002 §6 |
| **Correlati** | Take rate, Booking |
| **Impatto software** | Aggregazioni reporting |

### 4.36 Recovery Cost

| Campo | Valore |
|-------|--------|
| **Definizione ufficiale** | Costo di ripristino del Service (re-dispatch, ops, ecc.) attribuibile al responsabile quando legalmente possibile; non doppio conteggio con Refund/Compensation/Chargeback. |
| **Sinonimi da evitare** | Penale forfettaria non documentata |
| **SoT** | MC-OS-005; MC-OS-002 §15 |
| **Correlati** | Holdback, Contestation, Evidence |
| **Impatto software** | `recovery_event`, `responsible_party_code` |

### 4.37 Compensation

| Campo | Valore |
|-------|--------|
| **Definizione ufficiale** | Bene, credito o goodwill distinto dal Refund; voce economica separata, conteggio unico. |
| **Sinonimi da evitare** | Refund |
| **SoT** | MC-OS-002 P10 |
| **Correlati** | Dispute, Customer |
| **Impatto software** | `compensation_amount` |

### 4.38 Dispute / Contestation

| Campo | Valore |
|-------|--------|
| **Definizione ufficiale** | Procedura interna di contestazione (tipicamente Partner, anche Customer) con prove, esito motivato e possibile Appeals. **Contestation** = termine SFOF/Partner per il motore; **Dispute** = sinonimo ammessibile se allineato. |
| **Sinonimi da evitare** | Chargeback (canale PSP) |
| **SoT** | MC-OS-005 §§24–25; MC-OS-006 §7 |
| **Correlati** | Evidence, Holdback, Contestation Window |
| **Impatto software** | `dispute_id` / contestation workflow |

### 4.39 Contestation Window

| Campo | Valore |
|-------|--------|
| **Definizione ufficiale** | Finestra temporale configurabile per aprire/gestire contestazioni; silenzio-assenso solo se legalmente validato (OPEN). |
| **Sinonimi da evitare** | SLA generico |
| **SoT** | MC-OS-006 |
| **Correlati** | Contestation, Configuration |
| **Impatto software** | Config parameter |

### 4.40 Evidence

| Campo | Valore |
|-------|--------|
| **Definizione ufficiale** | Prova documentale/tecnica (GPS, foto, timestamp, log) a supporto di no-show, ritardi, recovery, dispute. |
| **Sinonimi da evitare** | “Screenshot” non tracciato come evidence entity |
| **SoT** | MC-OS-005 PG-08 |
| **Correlati** | Contestation, Audit Log |
| **Impatto software** | `evidence_id`; store |

### 4.41 Invoice

| Campo | Valore |
|-------|--------|
| **Definizione ufficiale** | Documento fiscale/commerciale di addebito emesso secondo Tax Regime e modello MoR/intermediario (qualificazione OPEN/validazione). |
| **Sinonimi da evitare** | Quote; Settlement report |
| **SoT** | MC-OS-006; Blueprint Billing |
| **Correlati** | Credit Note, Tax Regime |
| **Impatto software** | Invoice entity; numerazione |

### 4.42 Credit Note

| Campo | Valore |
|-------|--------|
| **Definizione ufficiale** | Documento di storno/rettifica collegato a Invoice o Refund secondo regole contabili da validare. |
| **Sinonimi da evitare** | Adjustment gestionale non fiscale |
| **SoT** | MC-OS-006; commercialista |
| **Correlati** | Refund, Invoice |
| **Impatto software** | Credit note issuance |

### 4.43 Payment Provider

| Campo | Valore |
|-------|--------|
| **Definizione ufficiale** | PSP / provider di servizi di pagamento (scelta **OPEN** — DECISIONS #1). |
| **Sinonimi da evitare** | Hardcode di un brand come unico modello |
| **SoT** | MC-OS-004; MC-OS-006 |
| **Correlati** | Payment, Chargeback, Merchant of Record |
| **Impatto software** | Adapter PSP |

### 4.44 Merchant of Record

| Campo | Valore |
|-------|--------|
| **Definizione ufficiale** | Soggetto che vende al Customer finale e tipicamente intesta l’incasso/fattura; in MyChauffeur OS il modello operativo punta a “Customer contratta con MyChauffeur” con **validazione fiscale/legale ancora aperta**. |
| **Sinonimi da evitare** | Assumere MoR = già chiuso fiscalmente |
| **SoT** | MC-OS-002; MC-OS-005 PG-03 |
| **Correlati** | Intermediario, Platform Revenue, Invoice |
| **Impatto software** | Flussi capture; invoice party |

### 4.45 Intermediario

| Campo | Valore |
|-------|--------|
| **Definizione ufficiale** | Modello in cui la piattaforma intermedia e riconosce tipicamente commissioni/fee piuttosto che ricavo pieno di vendita; alternativa a MoR — **DECISIONE APERTA** per paese. |
| **Sinonimi da evitare** | Confondere con “Broker” generico |
| **SoT** | MC-OS-002 §6 |
| **Correlati** | Merchant of Record, Commission |
| **Impatto software** | Revenue recognition paths |

### 4.46 Tax Regime

| Campo | Valore |
|-------|--------|
| **Definizione ufficiale** | Configurazione fiscale per paese/organizzazione che determina trattamento gross/net e obblighi; **nessuna formula IVA unica** hardcoded. |
| **Sinonimi da evitare** | “IVA 22% sempre” |
| **SoT** | MC-OS-002 P9 |
| **Correlati** | Customer Price, Invoice |
| **Impatto software** | `tax_regime`; price display fields |

### 4.47 Configuration

| Campo | Valore |
|-------|--------|
| **Definizione ufficiale** | Parametri di business rules gestiti da Back Office (non hardcoded), versionati ed effective-dated (SFOF Configuration Engine). |
| **Sinonimi da evitare** | Feature flag come unico meccanismo di policy finanziaria |
| **SoT** | MC-OS-006 §16; EDGF per config documentale |
| **Correlati** | Release, Contestation Window |
| **Impatto software** | `FinancialConfig`; config_version |

### 4.48 Event

| Campo | Valore |
|-------|--------|
| **Definizione ufficiale** | Fatto di dominio o finanziario immutabile emesso dal sistema (`booking_confirmed`, `payment_captured`, …). |
| **Sinonimi da evitare** | Log non strutturato come sostituto dell’evento |
| **SoT** | Blueprint Eventi; MC-OS-006 §10 |
| **Correlati** | Audit Log, Ledger |
| **Impatto software** | Event bus / catalog |

### 4.49 Audit Log

| Campo | Valore |
|-------|--------|
| **Definizione ufficiale** | Traccia immutabile di decisioni e azioni rilevanti (attore, timestamp, reason, entity). |
| **Sinonimi da evitare** | Application debug log |
| **SoT** | MC-OS-005 PG-07; MC-OS-006 |
| **Correlati** | Evidence, Ledger |
| **Impatto software** | Append-only audit store |

### 4.50 Source of Truth

| Campo | Valore |
|-------|--------|
| **Definizione ufficiale** | Documento o sistema dichiarato proprietario esclusivo di una materia; gli altri citano, non riscrivono (EDGF). |
| **Sinonimi da evitare** | “Master” ambiguo senza codice MC-OS |
| **SoT** | MC-OS-000 EDGF §13 |
| **Correlati** | Owner, Document Identifier |
| **Impatto software** | N/A diretto; disciplina docs e ownership dati |

### 4.51 Owner

| Campo | Valore |
|-------|--------|
| **Definizione ufficiale** | Ruolo responsabile del documento o della materia (document Owner EDGF ≠ necessariamente Administrator di sistema). |
| **Sinonimi da evitare** | Admin; Product Owner come unico significato |
| **SoT** | MC-OS-000 |
| **Correlati** | Source of Truth, Release |
| **Impatto software** | Metadati documenti; RACI ops |

### 4.52 Release

| Campo | Valore |
|-------|--------|
| **Definizione ufficiale** | (a) **Documentation Release**: pacchetto coerente di documenti versionati; (b) in engineering: rilascio software — **non confondere** i due. Nel Glossario, senza qualifica = Documentation Release se contesto docs. |
| **Sinonimi da evitare** | Usare “Release” senza contesto |
| **SoT** | MC-OS-000 §9 |
| **Correlati** | Document Version, Milestone |
| **Impatto software** | Manifest docs; CI release software separato |

### 4.53 Milestone

| Campo | Valore |
|-------|--------|
| **Definizione ufficiale** | Traguardo di delivery documentato. Distinguere: **OS Foundation Milestone** (tenant/auth/RBAC/booking/assignment) vs **SFOF Milestone** (payment/ledger/settlement) vs **Fasi 0–5** PLATFORM_MAP. |
| **Sinonimi da evitare** | “Milestone 1” senza qualifica |
| **SoT** | MC-OS-009 (normalizzazione); MC-OS-006; PLATFORM_MAP |
| **Correlati** | Release, Roadmap |
| **Impatto software** | Scope planning; evitare scope creep finance in auth |

### 4.54 Customer Price (gross / net)

| Campo | Valore |
|-------|--------|
| **Definizione ufficiale** | Prezzo lato Customer: `gross_customer_price` (tipicamente IVA inclusa nel contesto locale se applicabile) e `net_customer_price` secondo Tax Regime. |
| **Sinonimi da evitare** | Partner Cost |
| **SoT** | MC-OS-002; NCC “Prezzo al cliente” |
| **Correlati** | Quote, Tax Regime |
| **Impatto software** | Campi prezzo; display |

### 4.55 Partner Cost

| Campo | Valore |
|-------|--------|
| **Definizione ufficiale** | Costo dovuto al Partner per esecuzione (`assignment_mode = PARTNER`); **XOR** con Internal Execution Cost. Allinea e sostituisce l’uso ambiguo di “costo assegnato” quando l’esecutore è Partner. |
| **Sinonimi da evitare** | Sommare sempre anche driver_payout interno |
| **SoT** | MC-OS-002 P11; MC-OS-006 |
| **Correlati** | NCC “costo assegnato” (da allineare), Offer |
| **Impatto software** | `partner_cost` |

### 4.56 Internal Execution Cost

| Campo | Valore |
|-------|--------|
| **Definizione ufficiale** | Costo diretto di esecuzione interna (`assignment_mode = INTERNAL`). |
| **Sinonimi da evitare** | Partner Cost |
| **SoT** | MC-OS-002 |
| **Correlati** | Internal Driver, Gross Margin |
| **Impatto software** | `internal_execution_cost` |

### 4.57 Maximum Assignment Budget

| Campo | Valore |
|-------|--------|
| **Definizione ufficiale** | Cap di costo di Assignment compatibile con il margine minimo; il sistema deve impedire affidamenti oltre budget. |
| **Sinonimi da evitare** | Soft warning senza blocco |
| **SoT** | MC-OS-002 P8 |
| **Correlati** | Offer, Contribution Margin |
| **Impatto software** | Hard block |

### 4.58 Payout

| Campo | Valore |
|-------|--------|
| **Definizione ufficiale** | Trasferimento netto al Partner (o path correlato) a valle del Settlement approvato. |
| **Sinonimi da evitare** | Settlement; Payment (Customer) |
| **SoT** | MC-OS-006 §6 |
| **Correlati** | Holdback, Reserve, Wallet |
| **Impatto software** | Payout Engine |

---

## 5. Glossario Economico

| Termine | Definizione sintetica ufficiale |
|---------|----------------------------------|
| GBV | Volume lordo prenotato; non KPI primario |
| Platform Revenue | Ricavo piattaforma per modello commerciale |
| Commission | Fee contrattuale ≠ markup |
| Markup | Maggiorazione di prezzo |
| Gross Margin | Dopo execution cost XOR + pass-through netti |
| Contribution Margin | Dopo variabili diretti; KPI primario con utile |
| Take rate | Platform Revenue / GBV (gestionale) |
| Partner Cost / Internal Execution Cost | XOR per assignment_mode |
| Recovery Cost / Refund / Compensation / Chargeback | Voci distinte; no double count |
| CAC / LTV / Churn | Vedi BOS; definizioni economiche acquisizione/retention |
| Pass-through | Costo riaddebitato (pedaggi/parking tipici) |
| Fully loaded cost | Costo completo risorsa umana (RM coverage) |

---

## 6. Glossario Tecnico

| Termine | Definizione sintetica ufficiale |
|---------|----------------------------------|
| Event | Fatto di dominio/finanziario versionato |
| Audit Log | Trace immutabile decisioni/azioni |
| Configuration | Business rules Back Office versionate |
| Ledger | Registro append-only + reversal |
| Wallet | Saldo logico da ledger |
| Document Identifier | `MC-OS-NNN` immutabile (EDGF) |
| Document Version | SemVer del singolo documento |
| Documentation Release | Versione del pacchetto documentale |
| RLS / RBAC | Controlli accesso dati/ruoli (Blueprint/PLATFORM_MAP) |
| Source of Truth | Proprietario esclusivo di materia |

---

## 7. Glossario Marketplace

| Termine | Definizione sintetica ufficiale |
|---------|----------------------------------|
| Marketplace | Matching/intermediazione domanda-offerta (linea ricavo) |
| Listing | Pubblicazione capacità/offerta marketplace |
| Offer | Proposta Assignment a Partner |
| Partner | Esecutore/distributore indipendente |
| Agency | Domanda B2B senza necessariamente eseguire |
| Broker | Termine controllato; evitare finché non tipizzato |

---

## 8. Glossario Legale

| Termine | Definizione sintetica ufficiale |
|---------|----------------------------------|
| Partner indipendente | No subordinazione (validazione per paese) |
| Merchant of Record | Venditore verso Customer (validazione aperta) |
| Intermediario | Modello commissione/fee (OPEN) |
| Contestation / Dispute | Procedura interna prove + appeals |
| Evidence | Prove a supporto |
| Holdback | Trattenuta motivata e contestabile |
| Subaffidamento | Solo se autorizzato |
| Consumer | Tutela consumatore |
| Local Law Schedule | Varianti per paese (Partner framework) |

---

## 9. Glossario Finance

| Termine | Definizione sintetica ufficiale |
|---------|----------------------------------|
| Payment / Payment Provider | Incasso Customer / PSP |
| Settlement / Payout | Calcolo line item / trasferimento Partner |
| Reserve / Rolling reserve / Holdback | Policy rischio vs trattenuta motivata |
| Invoice / Credit Note | Documenti fiscali |
| Tax Regime | Config fiscale per paese |
| Escrow | Custodia fondi opzionale (OPEN + PSD2) |
| Reconciliation | Match PSP/banca ↔ ledger |
| Chargeback | Storno schema PSP |

---

## 10. Glossario Operations

| Termine | Definizione sintetica ufficiale |
|---------|----------------------------------|
| Dispatcher | Ruolo coda/assignment/eccezioni |
| Trip | Esecuzione operativa |
| Assignment | Attribuzione INTERNAL/PARTNER |
| No-show | Mancata presentazione tipizzata (cliente/partner) |
| Fleet / Vehicle | Mezzi e disponibilità |
| Administrator | Privilegi admin |
| Milestone | Traguardo delivery qualificato |
| Handoff | Ripresa sessione (MC-OS-008) |

---

## 11. Termini Deprecati

Termini che **non devono più essere usati** nei nuovi testi (né come SoT implicita):

| Termine deprecato | Motivo | Usare invece |
|-------------------|--------|--------------|
| **GMV** (come sinonimo non qualificato di ricavo) | Ambiguo vs GBV e Platform Revenue | **GBV** (volume) o **Platform Revenue** (ricavo) |
| **Costo assegnato** (senza mode) | Non distingue INTERNAL vs PARTNER | **Partner Cost** XOR **Internal Execution Cost** |
| **Supplier** / **Vendor** generico | Opaca la natura giuridica | **Partner** / **Partner Company** |
| **Broker** (uso generico) | Non tipizzato | **Agency** / **Partner** / **Marketplace** secondo ruolo |
| **Client** non qualificato | Confonde Customer/Consumer/Corporate | **Customer** + qualifica |
| **Order** al posto di Booking | Non allineato al corpus | **Booking** |
| **Milestone 1** senza prefisso | Collisione SFOF vs OS Foundation vs Fase 1 | Qualificare sempre il contesto |
| **DMS** | Rinominato | **EDGF** |
| **Documentation Management Framework** | Rinominato | **Enterprise Documentation Governance Framework (EDGF)** |
| **driver_payout + partner_payout** sommati sempre | Viola XOR costi | Un solo costo di esecuzione per mode |
| **IVA unica hardcoded** | Violazione tax regime configurabile | **Tax Regime** |

---

## 12. Conflitti noti (normalizzati qui; sync documenti rimandato)

| Conflitto | Normalizzazione ufficiale (questo Glossario) |
|-----------|-----------------------------------------------|
| NCC “costo assegnato” vs BOS XOR | Usare Partner Cost / Internal Execution Cost; NCC da aggiornare in seguito |
| PG-03 “Customer contratta con MyChauffeur” vs MoR OPEN | Definizioni entrambe valide: operativa PG-03; MoR/Intermediario restano OPEN fiscalmente |
| Contestation vs Dispute | Equivalenti di processo interno; Chargeback resta distinto |
| Release docs vs release software | Qualificare sempre |
| GMV vs GBV | GBV ufficiale; GMV deprecato |

---

## Cronologia revisioni

| Versione | Data | Autore | Descrizione modifica | Stato |
|----------|------|--------|----------------------|-------|
| 0.1.0 | 2026-07-26 | Chief Enterprise Architect | Creazione Glossario ufficiale MC-OS-009: regole, naming, entità di business, glossari di dominio, termini deprecati, conflitti normalizzati. | Draft |

---

*Fine di MC-OS-009 Domain Glossary and Business Dictionary v0.1.0 — Draft. Source of Truth terminologica; non modifica gli altri documenti in questo task.*

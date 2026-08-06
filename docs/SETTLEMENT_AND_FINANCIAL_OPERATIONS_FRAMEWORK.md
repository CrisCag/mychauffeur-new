# MyChauffeur OS — Settlement & Financial Operations Framework

**Documento:** Specifica ufficiale del sistema economico e finanziario
**Prodotto:** MyChauffeur OS
**Repository:** `mychauffeur-new`
**Branch di riferimento:** `fase-0/stabilizzazione-sicurezza-baseline`
**Documento padre:** [`MASTER_BLUEPRINT.md`](./MASTER_BLUEPRINT.md)
**Documenti correlati (non duplicati):**
[`BUSINESS_OPERATING_SYSTEM.md`](./BUSINESS_OPERATING_SYSTEM.md) ·
[`PARTNER_LEGAL_AND_OPERATING_FRAMEWORK.md`](./PARTNER_LEGAL_AND_OPERATING_FRAMEWORK.md) ·
[`DECISIONS_PENDING.md`](./DECISIONS_PENDING.md) ·
[`NCC_TARIFF_REQUIREMENTS.md`](./NCC_TARIFF_REQUIREMENTS.md)
**Versione:** 0.1.0
**Stato:** Specifica funzionale e architetturale — non è codice, non è piano dei conti ufficiale
**Data:** 2026-07-26

---

## Legenda di classificazione

| Etichetta | Significato |
|-----------|-------------|
| **DECISIONE APPROVATA** | Scelta già registrata (BOS / Partner Framework / questo documento) e vincolante per il design. |
| **DECISIONE APERTA** | Non chiusa; include voci di [`DECISIONS_PENDING.md`](./DECISIONS_PENDING.md). |
| **VALIDAZIONE PROFESSIONALE NECESSARIA** | Richiede commercialista, fiscalista, avvocato, consulente PSD2/PSP o privacy. |
| **REQUISITO SOFTWARE DERIVATO** | Comportamento atteso della piattaforma in fasi successive (nessuna implementazione in questo task). |
| **ALLINEAMENTO** | Rinvio esplicito a BOS / Partner / NCC senza riesporre formule o policy intere. |

**Confini:**
- Metriche di redditività (CM, GBV, CAC, LTV, take rate) → **BOS**.
- Rapporto partner, contestazioni processuali, trattenute motivate, prove → **Partner Legal & Operating Framework**.
- Matrice tariffaria NCC → **NCC_TARIFF_REQUIREMENTS**.
- Questo documento → **ciclo finanziario, ledger, payout, configuration, reconciliation**.

---

## Indice

1. [Scopo](#1-scopo)
2. [Principi](#2-principi)
3. [Settlement Lifecycle](#3-settlement-lifecycle)
4. [Payment State Machine](#4-payment-state-machine)
5. [Settlement Engine](#5-settlement-engine)
6. [Payout Engine](#6-payout-engine)
7. [Contestation Engine](#7-contestation-engine)
8. [Ledger Architecture](#8-ledger-architecture)
9. [Wallet Model](#9-wallet-model)
10. [Financial Events](#10-financial-events)
11. [Database Concept](#11-database-concept)
12. [Dashboard](#12-dashboard)
13. [KPI](#13-kpi)
14. [Alert](#14-alert)
15. [Decision Engine](#15-decision-engine)
16. [Financial Configuration Engine](#16-financial-configuration-engine)
17. [Future Internationalization](#17-future-internationalization)
18. [Best Practice](#18-best-practice)
19. [Decisioni approvate](#19-decisioni-approvate)
20. [Decisioni aperte](#20-decisioni-aperte)
21. [Validazioni professionali](#21-validazioni-professionali)
22. [Roadmap](#22-roadmap)

---

## 1. Scopo

Il **Settlement & Financial Operations Framework** (SFOF) è la specifica ufficiale di come MyChauffeur OS:

- muove denaro e obblighi economici lungo il ciclo di vita del booking;
- registra movimenti in ledger immutabili;
- calcola e autorizza settlement e payout;
- gestisce holdback, reserve, refund, adjustment, chargeback;
- espone configurazione Back Office (business rules non hardcoded);
- produce dati per finance, accounting, risk e management.

**Non sostituisce:** BOS (unit economics), Partner Framework (diritti/obblighi partner), né il piano dei conti societario.

**Destinatari:** Business, Finance, Product, CTO, engineering.

---

## 2. Principi

### 2.1 Economici

| Principio | Classificazione |
|-----------|-----------------|
| Ottimizzare **contribution margin** e utile, non il solo GBV/GMV | **DECISIONE APPROVATA** (BOS P1) |
| `platform_revenue` / commission secondo modello commerciale (MoR / intermediario / SaaS / B2B) | **DECISIONE APPROVATA** (BOS P12); scelta MoR vs intermediario = **DECISIONE APERTA** + validazione |
| Nessuna assegnazione oltre `maximum_assignment_budget` | **DECISIONE APPROVATA** (BOS P8) |
| Esecuzione INTERNAL XOR PARTNER nei costi | **DECISIONE APPROVATA** (BOS P11) |
| No doppio conteggio refund / compensation / recovery / chargeback | **DECISIONE APPROVATA** (BOS P10) |

### 2.2 Contabili

| Principio | Classificazione |
|-----------|-----------------|
| Distinguere gross (IVA inclusa), net (IVA esclusa), `tax_regime` per paese | **DECISIONE APPROVATA** (BOS P9) |
| Nessuna formula fiscale definitiva senza professionisti | **DECISIONE APPROVATA** (BOS P15) |
| Ledger gestionale ≠ bilancio ufficiale (export/riconciliazione verso accounting) | **REQUISITO SOFTWARE DERIVATO** |
| Correzioni solo tramite **reversal / adjusting entry**, mai overwrite | **DECISIONE APPROVATA** (questo SFOF) |

### 2.3 Finanziari

| Principio | Classificazione |
|-----------|-----------------|
| Separare incasso cliente, escrow (se usato), obbligo verso partner, payout effettivo | **DECISIONE APPROVATA** (design SFOF) |
| Holdback / reserve solo con policy configurata e motivazione | **DECISIONE APPROVATA** (allinea Partner PG-05) |
| Cash-flow e P&L gestionale distinti nelle dashboard | **REQUISITO SOFTWARE DERIVATO** |

### 2.4 Audit

| Principio | Classificazione |
|-----------|-----------------|
| Audit trail completo; logging immutabile | **DECISIONE APPROVATA** (Partner PG-07) |
| Ogni decisione finanziaria rilevante tracciata (attore, motivo, evidence) | **DECISIONE APPROVATA** (Partner PG-04) |
| Append-only sui ledger di compliance | **DECISIONE APPROVATA** (SFOF) |

### 2.5 Automazione

| Principio | Classificazione |
|-----------|-----------------|
| Automazione sul flusso ordinario; umano sulle eccezioni | **DECISIONE APPROVATA** (BOS P5) |
| Business rules **configurabili** da Back Office, non hardcoded | **DECISIONE APPROVATA** (SFOF) |
| Auto-approval sotto soglie; review manuale sopra soglie | **REQUISITO SOFTWARE DERIVATO**; soglie = **DECISIONE APERTA** |

### 2.6 Scalabilità

| Principio | Classificazione |
|-----------|-----------------|
| Settlement e payout a **batch** + processing idempotente | **DECISIONE APPROVATA** (SFOF) |
| Event-driven financial events come fonte di verità operativa | **DECISIONE APPROVATA** (SFOF) |
| Isolamento per `organization_id` / territorio / valuta | **REQUISITO SOFTWARE DERIVATO** (multi-tenant Blueprint) |

### 2.7 Internazionalizzazione

| Principio | Classificazione |
|-----------|-----------------|
| Compatibilità internazionale futura (Local Law Schedule) | **DECISIONE APPROVATA** (Partner PG-13) |
| Parametri per paese, valuta, PSP, tax regime | **DECISIONE APPROVATA** (SFOF / BOS tax) |
| Nessuna attivazione paese senza schedule + validazioni | **DECISIONE APPROVATA** (governance) |

---

## 3. Settlement Lifecycle

Ciclo economico end-to-end di una prenotazione. Stati payment dettagliati in §4.

| Fase | Responsabile | Trigger | Eventi | Verifiche automatiche | Verifiche manuali |
|------|--------------|---------|--------|----------------------|-------------------|
| **1. Richiesta** | Cliente / canale | Submit booking request | `booking_requested` | Validazione anagrafica base, anti-spam | Ops su richieste anomale |
| **2. Preventivo** | Pricing Engine | Calculate quote | `quote_issued` | Coerenza tariffa, currency, tax display | Preventivo manuale itinerari complessi (NCC) |
| **3. Conferma** | Cliente + piattaforma | Accept quote / confirm | `booking_confirmed` | Termini versione, classificazione B2B/B2C/corporate | Override commerciale autorizzato |
| **4. Autorizzazione** | PSP / Finance config | Auth payment (se online) | `payment_authorized` | Importo vs quote, 3DS/SCA se richiesto | Review antifrode high-risk |
| **5. Incasso** | PSP / Finance | Capture / bonifico riconciliato | `payment_captured` / `payment_received` | Match importo, currency, fees | Riconciliazione bonifici |
| **6. Escrow (opzionale)** | Platform Wallet / Escrow | Policy canale | `funds_escrowed` | Regole escrow config | Sblocco eccezionale |
| **7. Assegnazione partner** | Dispatch / Partner | Assign/accept | `partner_assigned` | Budget ≤ `maximum_assignment_budget`; docs partner validi | Assegnazione manuale (se scelta aperta) |
| **8. Svolgimento** | Partner / Driver | Trip states | `trip_started` … | Heartbeat stati, geo policy | Escalation ops |
| **9. Completamento** | Partner / sistema | Trip completed | `service_completed` | Complete checklist minima | QA su reclami aperti |
| **10. Contestazione** | Partner / Cliente / Risk | Open dispute | `contestation_opened` | Finestra temporale config | Review prove |
| **11. Approvazione** | Settlement Engine / Finance | Window closed o resolve | `settlement_approved` / `settlement_held` | Auto-approve sotto soglia | Approvazione umana sopra soglia |
| **12. Settlement** | Settlement Engine | Scheduler / trigger | `settlement_calculated` | Line items, no double-count | Override adjustment motivato |
| **13. Payout** | Payout Engine | Batch payout | `payout_initiated` / `payout_paid` | KYC payout, holds, reserves | Sblocco suspension |
| **14. Fatturazione** | Billing | Post-settlement / ciclo corporate | `invoice_issued` / `credit_note_issued` | Numerazione, tax regime | Rettifiche contabili |
| **15. Riconciliazione** | Finance | PSP + bank feeds | `reconciliation_matched` / `unmatched` | Auto-match id/importo | Manual match |
| **16. Chiusura** | Finance | Period close | `booking_financially_closed` | Nessuna dispute aperta bloccante | Close period |

**Escrow:** utilizzo sì/no e durata = **DECISIONE APERTA** + **VALIDAZIONE PROFESSIONALE** (PSD2/PSP, legale).
**Acconto / saldo:** percentuali e scadenze = **DECISIONE APERTA** (DECISIONS_PENDING #2).

---

## 4. Payment State Machine

Stati economici del **payment intent / obbligo di pagamento** legato al booking (possono coesistere più payment per acconto+saldo).

| Stato | Significato | Ingresso | Uscita | Chi può modificare |
|-------|-------------|----------|--------|-------------------|
| `draft` | Intent creato, non inviato al PSP | Creazione intent | `requires_action`, `authorized`, `cancelled` | Sistema |
| `requires_action` | SCA / 3DS / azione cliente | Auth avviata | `authorized`, `failed`, `cancelled` | Cliente + PSP webhook |
| `authorized` | Fondi bloccati, non catturati | Auth OK | `captured`, `auth_expired`, `cancelled`, `failed` | Sistema / PSP |
| `captured` | Fondi incassati | Capture OK | `partially_refunded`, `refunded`, `chargeback_opened`, `reconciled` | Sistema / PSP |
| `received_offline` | Bonifico/altro riconciliato | Match bancario | Come `captured` lato ledger | Finance (+ sistema match) |
| `failed` | Auth/capture fallita | Errore PSP | `draft` (retry) o terminale | Sistema |
| `cancelled` | Intent annullato pre-capture | Cancel booking/policy | Terminale (o nuovo intent) | Sistema / ops policy |
| `auth_expired` | Autorizzazione scaduta | Timeout PSP | Nuovo intent / failed path | Sistema |
| `partially_refunded` | Rimborso parziale | Refund parziale | `refunded` o resta parziale | Sistema + Finance rules |
| `refunded` | Rimborsato per intero | Full refund | Terminale (+ chargeback raro) | Sistema + Finance |
| `chargeback_opened` | Contestazione PSP | Webhook chargeback | `chargeback_won`, `chargeback_lost` | PSP + Risk |
| `chargeback_won` | Fondi recuperati / difesa OK | Esito PSP | `reconciled` | Sistema |
| `chargeback_lost` | Perdita chargeback | Esito PSP | Adjustment ledger | Sistema + Finance |
| `on_hold` | Blocco compliance/frode | Rule engine | Ripresa stato precedente | Risk / Finance |
| `reconciled` | Allineato a estratto PSP/banca | Match | Terminale payment | Finance / sistema |
| `closed` | Nessuna ulteriore mutazione ordinaria | Period rules | Solo adjusting entry | Finance |

**Regola:** cambi di stato sempre via evento + audit; niente edit silenzioso. **REQUISITO SOFTWARE DERIVATO.**

Provider PSP concreto: **DECISIONE APERTA** (DECISIONS_PENDING #1).

---

## 5. Settlement Engine

Motore che, a partire da booking + payment + execution + disputes, produce **line items di settlement** verso partner/piattaforma/tax.

### 5.1 Workflow

```text
Inputs (events) → Eligibility check → Calculate lines → Apply holds/reserves
→ Contestation gate → Approve (auto|manual) → Post ledgers → Enqueue payout → Emit events
```

### 5.2 Trigger

| Trigger | Uso |
|---------|-----|
| `service_completed` + delay config | Settlement standard |
| Contestation resolved | Re-calc |
| Manual finance run | Catch-up |
| Scheduler periodico | Batch giornaliero/settimanale (**frequenza DECISIONE APERTA**) |
| Corporate cycle close | Billing period corporate |

### 5.3 Scheduler e batch

- Job idempotenti per `settlement_batch_id`.
- Chunk per `organization_id`, `currency`, `partner_id`.
- Retry con backoff; dead-letter per eccezioni.

### 5.4 Controlli

- Budget assignment rispettato (storico).
- Docs partner validi al payout (allinea Partner).
- No double-count exception amounts (BOS P10).
- INTERNAL vs PARTNER cost mode coerente.
- Tax lines secondo `tax_regime` (senza hardcode IVA unica).
- Soglie auto-approve vs manual queue.

### 5.5 Eccezioni

| Eccezione | Routing |
|-----------|---------|
| Dispute aperta in finestra | `settlement_held` |
| Chargeback aperto | Hold + Risk |
| Evidence mancante su no-show addebito | Blocco addebito partner (Partner PG-05/08) |
| Unmatched payment | Reconciliation queue |
| CM sotto soglia alert | Alert management (non bypassa regole legali) |

### 5.6 Dipendenze

Pricing/NCC, Booking Engine, Partner Framework (dispute/withhold), Payment/PSP adapter, Configuration Engine (§16), Ledger (§8).

---

## 6. Payout Engine

### 6.1 Concetti

| Concetto | Definizione progettuale | Classificazione |
|----------|-------------------------|-----------------|
| **Payout** | Trasferimento netto dovuto al partner (o refund path al cliente) | Core |
| **Holdback** | Trattenuta temporanea motivata su importo altrimenti dovuto | **DECISIONE APPROVATA**: mai senza motivazione (Partner PG-05) |
| **Reserve** | Accantonamento policy-based (rischio, nuovi partner) | Parametri **DECISIONE APERTA** |
| **Rolling reserve** | % trattenuta su volume per N giorni, poi release | Best practice marketplace; adozione e % = **DECISIONE APERTA** + validazione |
| **Payout scheduler** | Cadenza (D+N, weekly, monthly) | Configurabile; default **DECISIONE APERTA** |
| **Payout batch** | Raggruppamento bonifici/PSP transfers | **REQUISITO SOFTWARE DERIVATO** |
| **Payout exception** | Fallimento bancario/PSP, IBAN errato | Retry + manual |
| **Payout suspension** | Stop payout (compliance, docs, dispute grave) | Allinea Partner sospensione |
| **Payout acceleration** | Anticipo su richiesta/policy VIP | **DECISIONE APERTA** + risk |

### 6.2 Distinzioni per canale

| Canale | Orientamento payout / settlement | Note |
|--------|----------------------------------|------|
| **B2C** | Spesso acconto+saldo; payout partner post-completion + window | Acconto % OPEN |
| **B2B** | Net rate / commissione distribuzione; cicli più lunghi | Commissioni OPEN (DECISIONS #4) |
| **Corporate** | Fatturazione periodica account; payout partner può essere disaccoppiato dall’incasso | Credit risk **DECISIONE APERTA** |
| **Marketplace** | Split / commission platform; possibile Connect-like | MoR vs split = OPEN + PSD2 |

### 6.3 Regole vincolanti

- Holdback/reserve/withhold → reason_code + evidence + notifica + diritto contestazione.
- Payout non esegue se partner suspended documentally.
- Importi da ledger, non da ricalcolo UI volatile.

---

## 7. Contestation Engine

Complementa Partner §§24–26: qui il focus è **motore finanziario** della disputa.

### 7.1 Tipologie

| Tipo | Descrizione | Prove tipiche |
|------|-------------|---------------|
| Contestation generica | Contestazione line item / addebito | Docs, messaggi |
| Geolocalizzazione | Verifica posizione | Geo pings policy-compliant |
| Timestamp | Catena temporale eventi | Server timestamps |
| Proof of arrival | Arrivo pickup | GPS/foto/check-in |
| No-show | Cliente o partner | Evidence set Partner §14 |
| Late pickup | Ritardo oltre soglia | `delay_minutes`, cause |
| Partial dispute | Parte dell’importo | Split lines |
| Chargeback | Canale PSP | Case PSP |
| Escalation / Appeals | II livello | Fascicolo dispute |

### 7.2 Silenzio-assenso

Chiusura automatica se nessuna risposta entro `contestation_window` = **DECISIONE APERTA** + **VALIDAZIONE PROFESSIONALE** (avvocato; Partner già segnala silenzio-assenso come da validare).

### 7.3 Modalità decisionali

| Modalità | Esempi |
|----------|--------|
| **Automatica** | Fuori finestra → close; sotto soglia importo + evidence completa → auto-accept policy |
| **Umana** | Alto importo, chargeback, frode sospetta, conflicting evidence |
| **Configurabile** | Soglie, window, quali tipi auto-routati (§16) |

**DECISIONE APPROVATA:** diritto di contestazione partner; prove obbligatorie su eventi critici; no addebito senza motivazione.

---

## 8. Ledger Architecture

### 8.1 Ledgers logici

| Ledger | Contenuto |
|--------|-----------|
| **Booking Ledger** | Obblighi economici legati al `booking_id` (quote, CM snapshot gestionale opzionale) |
| **Payment Ledger** | Auth, capture, fees PSP, FX |
| **Escrow Ledger** | Fondi in custodia (se policy attiva) |
| **Payout Ledger** | Obblighi e trasferimenti verso partner |
| **Refund Ledger** | Rimborsi cliente |
| **Adjustment Ledger** | Correzioni / goodwill / manual |
| **Reserve Ledger** | Reserve e rolling reserve |
| **Commission Ledger** | Platform commission / commercial commission |
| **Chargeback Ledger** | Aperture, fee, esiti |
| **Tax Ledger** | Componenti tax per regime (non “IVA unica”) |

### 8.2 Principi strutturali

| Principio | Classificazione |
|-----------|-----------------|
| **Immutabilità** delle entry scritte | **DECISIONE APPROVATA** |
| **Append-only** | **DECISIONE APPROVATA** |
| **Reversal entries** per storni (entry inversa collegata) | **DECISIONE APPROVATA** |
| **Audit trail** su ogni posting | **DECISIONE APPROVATA** |
| Doppia registrazione gestionale (debit/credit interni) raccomandata | **REQUISITO SOFTWARE DERIVATO**; mapping piano conti = validazione commercialista |

Nessun SQL in questo documento (§11 solo concettuale).

---

## 9. Wallet Model

Modello **concettuale** di saldi (può essere implementato come proiezione dei ledger).

| Wallet | Responsabilità | Utilizzo |
|--------|----------------|----------|
| **Customer Wallet** | Crediti, voucher, saldo prepagato cliente | Pagamenti parziali, refund a credito |
| **Partner Wallet** | Saldo disponibile, pending, in hold, in reserve | Fonte payout |
| **Platform Wallet** | Commissioni, fee, margini incassati | Tesoreria gestionale |
| **Escrow Wallet** | Fondi non ancora rilasciabili | Pre-completion / dispute window |
| **Reserve Wallet** | Rolling reserve / risk reserve | Release schedulata |

Movimenti wallet = conseguenza di financial events, non input arbitrario UI.
Carta di pagamento “wallet” PSP esterna ≠ questi wallet logici.

---

## 10. Financial Events

Catalogo eventi economici da registrare (nome stabile; payload versionato).

| Evento | Note |
|--------|------|
| `quote_issued` / `quote_superseded` | Prezzo e tax display |
| `booking_confirmed` | Classificazione canale |
| `payment_authorization_requested` / `payment_authorized` / `payment_authorization_failed` | |
| `payment_captured` / `payment_capture_failed` | |
| `payment_received_offline` | Bonifico |
| `payment_fee_posted` / `fx_fee_posted` | |
| `funds_escrowed` / `funds_released_from_escrow` | Se attivo |
| `partner_assigned` / `partner_offer_accepted` / `assignment_budget_checked` | Include offer amount |
| `service_completed` / `service_cancelled` / `no_show_classified` | |
| `tolls_parking_posted` | Con modalità economica (BOS) |
| `commission_posted` | |
| `refund_requested` / `refund_posted` | |
| `compensation_posted` | Distinct from refund |
| `recovery_cost_posted` | Con responsible party |
| `holdback_placed` / `holdback_released` | Motivati |
| `reserve_placed` / `reserve_released` | |
| `contestation_opened` / `contestation_resolved` | |
| `chargeback_opened` / `chargeback_resolved` | |
| `settlement_calculated` / `settlement_approved` / `settlement_held` | |
| `payout_scheduled` / `payout_initiated` / `payout_paid` / `payout_failed` / `payout_suspended` | |
| `invoice_issued` / `credit_note_issued` | |
| `reconciliation_matched` / `reconciliation_unmatched` | |
| `booking_financially_closed` | |
| `adjustment_posted` | Sempre con reason |

---

## 11. Database Concept

Solo modello concettuale. **Nessun SQL. Nessuna migration.**

### 11.1 Entità principali

| Entità | Relazioni chiave |
|--------|------------------|
| `Booking` | 1→N PaymentIntent, 1→N SettlementLine, 0..1 PartnerAssignment |
| `PaymentIntent` | N→1 Booking; 1→N PaymentLedgerEntry; stati §4 |
| `PartnerAssignment` | Booking, Partner; offer, budget, accept |
| `SettlementBatch` | 1→N SettlementLine |
| `SettlementLine` | Booking, Partner/Platform, amount, type, ledger refs |
| `PayoutBatch` / `Payout` | Partner, lines, status |
| `Contestation` / `Appeal` | Booking, parties, evidence |
| `Evidence` | Contestation / incident |
| `LedgerEntry` | ledger_type, amount, currency, booking_id, reversal_of |
| `WalletAccount` / `WalletBalance` | Owner type (customer/partner/platform/escrow/reserve) |
| `FinancialConfig` | Scope (global/org/country/partner/corporate) |
| `ReconciliationItem` | PSP/bank vs ledger |
| `Invoice` / `CreditNote` | Booking o corporate account |
| `TaxAssessment` | Booking, tax_regime components |

### 11.2 Relazioni essenziali

```text
Booking ──< PaymentIntent ──< LedgerEntry(Payment)
Booking ──< SettlementLine >── SettlementBatch
SettlementLine ──> Payout (via Partner Wallet projection)
Booking ──< Contestation ──< Evidence
LedgerEntry (append-only) ← FinancialEvent
FinancialConfig → parametrizza Settlement/Payout/Contestation engines
```

---

## 12. Dashboard

| Dashboard | Contenuti principali |
|-----------|----------------------|
| **Finance** | Cash in/out, pending capture, escrow, reserves, payout calendar, FX exposure |
| **Accounting** | Invoice queue, credit notes, tax summary per regime, export ERP, unmatched recon |
| **Operations** | Settlement held, evidence gaps, assignment budget breaches attempt, offline payments |
| **Risk** | Fraud scores, chargebacks, side-payment signals, new-partner reserve, velocity |
| **Management** | GBV vs platform revenue vs CM (da BOS), take rate, payout ratio, dispute rate, margin by channel/territory/partner |

---

## 13. KPI

KPI **finanziari/operativi SFOF** (non riesporre CAC/LTV/churn BOS se non come rinvio).

| KPI | Definizione sintetica |
|-----|----------------------|
| GBV | Volume lordo (BOS) — non KPI primario successo |
| Platform revenue | Secondo modello commerciale |
| Contribution margin / CM% | BOS — primario |
| Authorization rate | Auth OK / attempts |
| Capture success rate | |
| Refund rate / Refund amount ratio | |
| Chargeback rate | |
| Dispute rate / Dispute win rate | |
| Time-to-settlement | Completion → settlement approved |
| Time-to-payout | Approved → paid |
| Payout failure rate | |
| Holdback ratio | Held / gross partner due |
| Reserve coverage | Reserve balance / risk exposure |
| Reconciliation match rate | |
| Unmatched aging | |
| Auto-approval ratio | Settlement auto / total |
| Manual review backlog | |
| Tax posting completeness | |
| Assignment budget violation attempts | Blocked by system |
| Double-count incidents | Data quality (target 0) |

Soglie target numeriche: **DECISIONE APERTA**.

---

## 14. Alert

| Categoria | Esempi alert |
|-----------|--------------|
| **Rischio** | Velocity anomala, nuovo IBAN, country mismatch |
| **Frode** | Multi-account, side payment signal, refund abuse |
| **Margini** | CM sotto soglia; offer > `maximum_assignment_budget` |
| **Payout** | Failure ripetuto; suspension; acceleration request |
| **Contestazioni** | Spike dispute; evidence missing su addebito |
| **Anomalie** | Unmatched > N giorni; ledger imbalance; duplicate economic event |

Routing: auto-mitigation dove sicuro; altrimenti coda umana (BOS P5).

---

## 15. Decision Engine

| Tipo | Esempi | Chi/cosa decide |
|------|--------|-----------------|
| **Automatiche** | Blocco offer over budget; reject withhold senza reason; expire contestation window (se policy ON); release rolling reserve a scadenza; match recon esatto | Rules engine + config |
| **Umane** | Dispute high-value; chargeback defense strategy; payout acceleration; goodwill adjustment; KYC reject | Finance / Risk / Ops |
| **Configurabili** | Tutte le soglie §16; quali eventi sono auto vs manual | Back Office (ruoli RBAC) |

Ogni decisione → financial event + audit (Partner PG-04).

---

## 16. Financial Configuration Engine

**DECISIONE APPROVATA (SFOF):** business rules configurabili, non hardcoded.

Parametri da Back Office (elenco non esaustivo), con scope: global / organization / country / currency / PSP / partner / corporate_account / channel.

| Area | Parametri esempio |
|------|-------------------|
| Payout | frequenza, D+N, min payout amount, acceleration flags |
| Contestation | `contestation_window`, silence policy on/off, auto-accept thresholds |
| Reserve | % reserve, durata, rolling reserve %, release schedule |
| Holdback | tipi consentiti, cap %, require evidence |
| Antifrode | score thresholds, velocity caps |
| Approval | soglia auto settlement, soglia manual review |
| Commercial | voucher rules, crediti wallet, penali tipizzate (importi OPEN) |
| Commission | %/fixed per canale (valori **DECISIONE APERTA** #4) |
| Tax | `tax_regime` profiles, display gross/net |
| FX / currency | valute abilitate, markup FX policy |
| PSP | adapter enabled, webhook secrets ref, fee mapping |
| SLA economiche | time-to-settlement target, time-to-payout target |
| Escrow | enabled, release triggers |
| Assignment | `minimum_margin` → deriva `maximum_assignment_budget` rules |

Versioning config: `config_version`, `effective_from`, audit who changed.
Runtime usa config vigente all’evento (snapshot su settlement line).

---

## 17. Future Internationalization

| Livello | Cosa |
|---------|------|
| **Globale** | Lifecycle, ledger types, event catalog, append-only, no double-count, contestation rights, config engine |
| **Per Paese** | Tax regime, Local Law Schedule, payout rails, invoice legal fields, silence/consumer rules |
| **Per valuta** | Multi-currency wallets, FX posting, reporting currency |
| **Per PSP** | Adapter, SCA, split pay availability, fee model |
| **Per partner** | Reserve tier, payout frequency override, holdback history |
| **Per cliente corporate** | Credit terms, billing cycle, netting |

Obiettivo: stesso SFOF utilizzabile in più paesi senza fork del codice core.

---

## 18. Best Practice

Sintesi **osservativa** (BENCHMARK esterno — non adottata automaticamente come policy MyChauffeur).

| Fonte | Pratica rilevante | Adattamento MyChauffeur |
|-------|-------------------|-------------------------|
| **Daytrip** | Prezzo upfront, partner network, focus esperienza | Allinea booking; settlement partner da costruire |
| **Blacklane** | Premium, B2B/corporate forte | Priorità canali B2B/corporate (BOS) |
| **Uber / Bolt** | Payout rapidi driver, strong state machine, fraud | Payout scheduler + risk; attenzione subordinazione (Partner §38) |
| **Booking.com** | Commission model, partner extranets, dispute windows | Commission config; window contestation |
| **Airbnb** | Host payout, reserves, evidence-centric disputes | Evidence + reserve patterns |
| **Stripe Connect** | Separate charges / destination / risk reserves | Valutare vs MoR; **DECISIONE APERTA** + PSD2 |
| **Adyen** | Platform / marketpay patterns, global acquiring | Multi-country PSP option |
| **Mangopay** | Wallet + KYC marketplace EU | Wallet model / escrow options |
| **Amazon Marketplace** | Rolling reserve, A-to-z claims | Rolling reserve come option config |
| **Fiverr / Upwork** | Escrow milestone, clear release rules | Escrow opzionale su servizi |

---

## 19. Decisioni approvate

Solo decisioni già consolidate (BOS / Partner / principi SFOF). Nessuna nuova chiusura di DECISIONS_PENDING.

| ID | Decisione |
|----|-----------|
| DA-S01 | Privilegio CM e utile su GBV/GMV |
| DA-S02 | Modello ricavi ibrido Marketplace + SaaS + B2B + Corporate |
| DA-S03 | Tax: gross/net + regime configurabile; no IVA unica hardcoded |
| DA-S04 | No doppio conteggio refund / compensation / recovery / chargeback |
| DA-S05 | Costo esecuzione INTERNAL XOR PARTNER |
| DA-S06 | Platform revenue/commission definiti per modello commerciale |
| DA-S07 | Blocco assegnazione oltre budget margine minimo |
| DA-S08 | Automazione ordinario / umano su eccezioni |
| DA-S09 | Cliente contratta con MyChauffeur; partner esegue (con validazione fiscale/legale) |
| DA-S10 | Nessuna trattenuta/holdback automatica senza motivazione documentata |
| DA-S11 | Diritto di contestazione partner + appeals |
| DA-S12 | Audit trail completo; logging immutabile |
| DA-S13 | Gestione prove su eventi critici |
| DA-S14 | Attribuzione costo al responsabile quando legalmente possibile |
| DA-S15 | Ledger append-only con reversal entries |
| DA-S16 | Business rules finanziarie configurabili da Back Office (non hardcoded) |
| DA-S17 | Event-driven financial core + batch settlement/payout idempotenti |
| DA-S18 | Compatibilità internazionale via config + Local Law Schedule |
| DA-S19 | Nessuna formula fiscale/contabile definitiva senza professionisti |

---

## 20. Decisioni aperte

**NON chiuse.** Stato OPEN.

| ID | Tema | Fonte |
|----|------|-------|
| DO-01 | Provider pagamenti (Stripe, Nexi, PayPal, bonifico+link, …) | DECISIONS_PENDING #1 |
| DO-02 | Policy acconto % / scadenze / rimborso cancel | #2 |
| DO-03 | Cancellazioni e penali cliente | #3 |
| DO-04 | Struttura commissioni B2C/B2B/partner | #4 |
| DO-05 | Scope portale partner | #5 |
| DO-06 | Voci NCC obbligatorie go-live | #6 |
| DO-07 | Assegnazione manuale vs offer/accept | #7 |
| DO-08 | MoR vs intermediario (dettaglio fiscale operativo) | BOS — tensione con DA-S09 da validare |
| DO-09 | Escrow on/off e durata | SFOF |
| DO-10 | Rolling reserve % e durata | SFOF |
| DO-11 | Frequenza payout default | SFOF |
| DO-12 | Contestation window e silenzio-assenso | SFOF + Partner |
| DO-13 | Soglie auto-approve / manual review | SFOF |
| DO-14 | Cap holdback / penali numeriche | SFOF + Partner |
| DO-15 | Credit terms corporate | SFOF |
| DO-16 | Mapping piano dei conti / ERP | Accounting |
| DO-17 | Tecnologia hash-chain log vs WORM storage | Engineering + legal evidence |
| DO-18 | Criteri go-live finanziari minimi | DECISIONS_PENDING #10 (parziale) |

---

## 21. Validazioni professionali

### 21.1 Commercialista

- Mapping ledger gestionale → piano dei conti
- Riconoscimento ricavi per linea (Marketplace/SaaS/B2B/Corporate)
- Trattamento credit note, compensation, recovery
- Chiusure periodiche e export

### 21.2 Fiscalista

- IVA/tax per paese; gross vs net; reverse charge
- Obblighi di fatturazione MoR vs intermediario
- Regime pedaggi/parcheggi anticipati/riaddebitati
- Multi-currency / FX

### 21.3 Avvocato

- Coerenza “cliente contratta con MyChauffeur” con Tos/fatture
- Silenzio-assenso dispute
- Holdback/set-off/reserve ammissibili
- Limiti responsabilità finanziarie; consumer law
- Local Law Schedule payout/dispute

### 21.4 Consulente PSD2 / PSP

- Ruolo piattaforma (agent vs MoR vs payment institution)
- Escrow / safeguarding funds
- Split payments / Connect-like
- SCA, chargeback flows, cross-border acquiring
- Scelta ed integrazione PSP (dopo DO-01)

### 21.5 Privacy / GDPR

- Conservazione evidence e log finanziari
- Minimizzazione geo pings come prova
- Retention reconciliation data
- Access control dashboard Finance/Risk

---

## 22. Roadmap

Ordine consigliato (allineato a Blueprint fasi pagamenti/NCC in PLATFORM_MAP, senza chiudere go-live).

### Milestone 1 — Fondamenta

1. Modello concettuale dati finanziari (entità §11)
2. Payment adapter astratto + state machine (§4)
3. Ledger append-only minimo (Payment + Booking + Commission)
4. Configuration Engine scheletro (tax regime, currency)
5. Blocco assignment budget (già principio BOS)

### Milestone 2 — Settlement & Payout

6. Settlement Engine + batch
7. Partner Wallet projection + Payout Engine base
8. Holdback motivato + contestation window base
9. Refund/compensation/recovery posting anti-double-count
10. Reconciliation PSP base
11. Dashboard Finance/Ops essenziali

### Evoluzioni future

12. Escrow / rolling reserve
13. Chargeback ledger completo + Risk dashboard
14. Corporate billing cycles
15. Multi-PSP / multi-country
16. Accounting export ERP
17. Payout acceleration, advanced fraud
18. Full Management KPI pack + auto decision tuning

Dipendenze esterne: chiusura DO-01…DO-04 dove bloccanti; validazioni §21 prima di effetti coercitivi automatici.

---

## Appendice A — Conflitti ed evidenze (non risolti)

| Conflitto / tensione | Documenti | Nota |
|----------------------|-----------|------|
| Cliente contratta con MyChauffeur vs MoR/intermediario ancora OPEN | Partner PG-03, BOS §6, DO-08 | SFOF assume flusso “incasso piattaforma” come design target ma non chiude la qualificazione fiscale |
| “Costo assegnato” NCC vs INTERNAL XOR PARTNER | NCC, BOS P11 | Settlement deve discriminare mode; NCC da aggiornare in sessione dedicata (fuori scope) |
| Commissioni/acconti ancora OPEN | DECISIONS_PENDING | Config Engine prevede parametri; valori non fissati |
| Silenzio-assenso | Partner + SFOF | Solo come opzione config + validazione legale |

---

## Appendice B — Cronologia revisioni

| Versione | Data | Autore | Descrizione |
|----------|------|--------|-------------|
| 0.1.0 | 2026-07-26 | Chief Software Architect | Prima specifica SFOF: lifecycle, state machine, engines, ledger/wallet, config, KPI/alert, roadmap. Nessuna implementazione. |

---

*Fine del Settlement & Financial Operations Framework — v0.1.0. Specifica di progettazione; non costituisce parere fiscale, legale o PSD2.*

# MyChauffeur OS — Business Operating System

**Documento:** Business Operating System (modello economico e operativo)
**Prodotto:** MyChauffeur OS
**Repository:** `mychauffeur-new`
**Branch di riferimento:** `fase-0/stabilizzazione-sicurezza-baseline`
**Documento padre:** [`MASTER_BLUEPRINT.md`](./MASTER_BLUEPRINT.md)
**Documenti correlati:** [`NCC_TARIFF_REQUIREMENTS.md`](./NCC_TARIFF_REQUIREMENTS.md) · [`DECISIONS_PENDING.md`](./DECISIONS_PENDING.md) · [`PLATFORM_MAP.md`](../PLATFORM_MAP.md)
**Versione:** 0.1.0
**Stato:** Formalizzazione iniziale — molte formule sono gestionali o da validare
**Data:** 2026-07-26

---

## Legenda di classificazione

Ogni affermazione rilevante in questo documento è etichettata con uno dei seguenti stati. **Nessuna formula fiscale o contabile è da considerarsi definitiva** senza validazione professionale.

| Etichetta | Significato |
|-----------|-------------|
| **DECISIONE APPROVATA** | Scelta di prodotto/governance già approvata; vincolante per progettazione e priorità. |
| **IPOTESI INIZIALE** | Assunto di lavoro utile per modellare scenari; non approvato come regola definitiva. |
| **BENCHMARK ESTERNO** | Riferimento di mercato o pratica di settore; non trasferibile automaticamente a MyChauffeur OS. |
| **FORMULA GESTIONALE** | Calcolo interno per decisioni operative e dashboard; non sostituisce la contabilità ufficiale. |
| **FORMULA CONTABILE DA VALIDARE** | Espressione che potrebbe entrare in bilanci/report fiscali; richiede validazione. |
| **DECISIONE APERTA** | Scelta non ancora presa; blocca o condiziona implementazioni future. |
| **VALIDAZIONE RICHIESTA A COMMERCIALISTA/LEGALE** | Tema fiscale, IVA, MoR, lavoro, privacy o contrattuale da sottoporre a professionisti abilitati. |

---

## Indice

1. [Scopo del Business Operating System](#1-scopo-del-business-operating-system)
2. [Principi economici](#2-principi-economici)
3. [Linee di ricavo](#3-linee-di-ricavo)
4. [Struttura dei costi](#4-struttura-dei-costi)
5. [Unit economics per booking](#5-unit-economics-per-booking)
6. [Gross Booking Value e ricavo piattaforma](#6-gross-booking-value-e-ricavo-piattaforma)
7. [Take rate](#7-take-rate)
8. [Margine lordo](#8-margine-lordo)
9. [Contribution margin](#9-contribution-margin)
10. [Profitto/perdita per servizio](#10-profitto-perdita-per-servizio)
11. [CAC cliente](#11-cac-cliente)
12. [CAC partner](#12-cac-partner)
13. [LTV e retention](#13-ltv-e-retention)
14. [Churn](#14-churn)
15. [Costi di supporto e recovery](#15-costi-di-supporto-e-recovery)
16. [Costi umani e automazione](#16-costi-umani-e-automazione)
17. [Redditività per tratta](#17-redditività-per-tratta)
18. [Redditività per città/territorio](#18-redditività-per-cittàterritorio)
19. [Redditività per partner](#19-redditività-per-partner)
20. [Redditività per canale](#20-redditività-per-canale)
21. [Ambassador e Regional Manager](#21-ambassador-e-regional-manager)
22. [Regional Manager Decision Engine](#22-regional-manager-decision-engine)
23. [Scenari economici](#23-scenari-economici)
24. [Break-even](#24-break-even)
25. [Alert automatici](#25-alert-automatici)
26. [Regole go/no-go](#26-regole-gono-go)
27. [Dati da raccogliere nel software](#27-dati-da-raccogliere-nel-software)
28. [Decisioni aperte](#28-decisioni-aperte)
29. [Validazioni fiscali, contabili e legali](#29-validazioni-fiscali-contabili-e-legali)
30. [Glossario economico](#30-glossario-economico)

---

## 1. Scopo del Business Operating System

Il Business Operating System (BOS) definisce come MyChauffeur OS **misura, governa e decide** sulla redditività del business: per booking, tratta, territorio, partner, cliente e canale.

Non è un piano contabile ufficiale né un modello fiscale. È il framework gestionale che collega:

- decisioni di prodotto già approvate;
- requisiti tariffari NCC ([`NCC_TARIFF_REQUIREMENTS.md`](./NCC_TARIFF_REQUIREMENTS.md));
- vincoli di assegnazione (budget massimo / margine minimo);
- metriche da implementare nel software in fasi successive.

**DECISIONE APPROVATA:** MyChauffeur OS deve privilegiare **contribution margin** e **utile**, non il solo GMV / Gross Booking Value.

**Fuori ambito di questo documento:** implementazione database, migration, codice applicativo, configurazione PSP.

---

## 2. Principi economici

| # | Principio | Classificazione |
|---|-----------|-----------------|
| P1 | Ottimizzare contribution margin e utile, non il solo volume prenotato (GBV/GMV). | **DECISIONE APPROVATA** |
| P2 | Modello di ricavo futuro **ibrido**: Marketplace + SaaS + B2B Distribution + Corporate. | **DECISIONE APPROVATA** |
| P3 | Personale territoriale solo se economicamente sostenibile. | **DECISIONE APPROVATA** |
| P4 | Ogni territorio, tratta, partner, cliente e canale ha redditività misurabile. | **DECISIONE APPROVATA** |
| P5 | Supporto umano sulle eccezioni; automazione sul flusso ordinario. | **DECISIONE APPROVATA** |
| P6 | Paid acquisition limitata finché il CAC payback non è dimostrato. | **DECISIONE APPROVATA** |
| P7 | Partnership B2B e corporate sono canali prioritari. | **DECISIONE APPROVATA** |
| P8 | Nessuna assegnazione corsa oltre il budget massimo compatibile con il margine minimo. | **DECISIONE APPROVATA** |
| P9 | Distinguere sempre prezzi IVA inclusa / esclusa e regime fiscale per paese. | **DECISIONE APPROVATA** (correzione obbligatoria) |
| P10 | Evitare doppio conteggio di refund, compensation, recovery, chargeback. | **DECISIONE APPROVATA** (correzione obbligatoria) |
| P11 | Distinguere esecuzione interna vs affidamento a partner nei costi di servizio. | **DECISIONE APPROVATA** (correzione obbligatoria) |
| P12 | Platform revenue e commission dipendono dal modello commerciale (MoR / intermediario / SaaS / B2B). | **DECISIONE APPROVATA** (correzione obbligatoria) |
| P13 | Pedaggi e parcheggi hanno modalità economiche distinte (inclusi, riaddebitati, anticipati, partner, piattaforma). | **DECISIONE APPROVATA** (correzione obbligatoria) |
| P14 | Separare costi variabili, semi-variabili, fissi e allocazioni gestionali. | **DECISIONE APPROVATA** (correzione obbligatoria) |
| P15 | Nessuna formula fiscale/contabile definitiva senza validazione professionale. | **DECISIONE APPROVATA** |

---

## 3. Linee di ricavo

**DECISIONE APPROVATA:** il modello futuro è ibrido su quattro linee.

### 3.1 Marketplace

| Elemento | Contenuto | Classificazione |
|----------|-----------|-----------------|
| Descrizione | Intermediazione o gestione di prenotazioni tra domanda e offerta (tenant / partner / driver). | **IPOTESI INIZIALE** sul dettaglio contrattuale |
| Ricavo tipico | Commissione su booking, fee di matching, eventuale markup. | **IPOTESI INIZIALE** |
| Dipende da | Ruolo piattaforma: Merchant of Record vs intermediario. | **DECISIONE APERTA** + **VALIDAZIONE RICHIESTA A COMMERCIALISTA/LEGALE** |

### 3.2 SaaS

| Elemento | Contenuto | Classificazione |
|----------|-----------|-----------------|
| Descrizione | Licenza / abbonamento alla piattaforma per operatori NCC (software). | **IPOTESI INIZIALE** su pricing listino |
| Ricavo tipico | Fee ricorrente (mensile/annuale), moduli add-on, seat. | **IPOTESI INIZIALE** |
| Nota | Il GBV dei tenant SaaS **non** è automaticamente ricavo piattaforma. | **DECISIONE APPROVATA** (coerente con P1/P12) |

### 3.3 B2B Distribution

| Elemento | Contenuto | Classificazione |
|----------|-----------|-----------------|
| Descrizione | Distribuzione servizi verso agenzie, OTA, hotel, partner wholesale. | **DECISIONE APPROVATA** come canale prioritario (insieme a corporate) |
| Ricavo tipico | Net rate, commissione distribuzione, fee contrattuale. | **DECISIONE APERTA** (struttura commissioni — vedi anche `DECISIONS_PENDING.md`) |
| Priorità | Alta rispetto a paid acquisition B2C non dimostrata. | **DECISIONE APPROVATA** |

### 3.4 Corporate

| Elemento | Contenuto | Classificazione |
|----------|-----------|-----------------|
| Descrizione | Account aziendali con condizioni dedicate, fatturazione periodica, policy viaggio. | **DECISIONE APPROVATA** come canale prioritario |
| Ricavo tipico | Margine su servizi + eventuale fee account / gestione. | **IPOTESI INIZIALE** |
| Nota | Richiede classificazione booking `corporate` e `corporate_account_id`. | Requisito dati futuri (§27) |

---

## 4. Struttura dei costi

**DECISIONE APPROVATA:** separare costi variabili per booking, semi-variabili, fissi e allocazioni gestionali.

| Categoria | Esempi | Classificazione |
|-----------|--------|-----------------|
| **Variabili per booking** | Partner payout *oppure* costo esecuzione interna; payment fee; FX fee; tolls/parking secondo modalità; referral per booking; compensation/refund/chargeback **una sola volta** nel P&L corretto | **FORMULA GESTIONALE** (elenco); fiscalità = **VALIDAZIONE RICHIESTA** |
| **Semi-variabili** | Support minutes, operations minutes, escalation assignment, recovery events | **FORMULA GESTIONALE** |
| **Fissi** | Infra cloud base, licenze, personale HQ non allocato, tool | **IPOTESI INIZIALE** sul perimetro |
| **Allocazioni gestionali** | Quote di marketing, HQ, RM, supporto allocati a territorio/canale | **FORMULA GESTIONALE** — non confondere con costo variabile del singolo booking |

### 4.1 Correzione: esecuzione interna vs partner

| Scenario | Costo di esecuzione da considerare | Non fare |
|----------|-------------------------------------|----------|
| Servizio eseguito **internamente** | `internal_execution_cost` (autista/veicolo proprio, costi diretti) | Non sottrarre anche `partner_payout` |
| Servizio affidato a **partner** | `partner_cost` / `partner_payout` (e sotto-voci contrattuali) | Non sottrarre anche un `driver_payout` pieno come se fosse interno, salvo voci esplicitamente distinte e non sovrapposte |

**DECISIONE APPROVATA** (correzione obbligatoria): evitare di sottrarre sempre sia `partner_payout` sia `driver_payout`.

### 4.2 Correzione: pedaggi e parcheggi

Ogni importo di `tolls` / `parking` deve portare una **modalità economica**:

| Modalità | Effetto gestionale tipico | Classificazione |
|----------|---------------------------|-----------------|
| Inclusi nel prezzo cliente | Già nel gross/net price; non riaddebitare | **FORMULA GESTIONALE** |
| Riaddebitati al cliente | Pass-through (con o senza markup) | **FORMULA GESTIONALE** + **DECISIONE APERTA** su markup |
| Anticipati dalla piattaforma | Cash-flow / credito da recuperare | **VALIDAZIONE RICHIESTA A COMMERCIALISTA/LEGALE** |
| Sostenuti dal partner | Nel costo partner o esclusi dal CM piattaforma | **FORMULA GESTIONALE** |
| Assorbiti dalla piattaforma | Costo variabile piattaforma | **FORMULA GESTIONALE** |

---

## 5. Unit economics per booking

Vista canonica del singolo `booking_id`.

### 5.1 Componenti di prezzo (fiscalità non univoca)

| Campo | Descrizione | Classificazione |
|-------|-------------|-----------------|
| `gross_customer_price` | Prezzo lordo lato cliente (tipicamente **IVA inclusa** se B2C IT — **non fissato globalmente**) | **DECISIONE APERTA** per paese + **VALIDAZIONE RICHIESTA** |
| `net_customer_price` | Prezzo al netto dell’IVA / tax applicabile secondo `tax_regime` | **FORMULA CONTABILE DA VALIDARE** |
| `currency` | Valuta di transazione | Requisito dati |
| `tax_regime` | Regime fiscale configurabile per paese/organizzazione | **DECISIONE APPROVATA** (configurabile; non formula IVA unica) |

**DECISIONE APPROVATA:** non fissare una sola formula IVA; distinguere prezzo IVA inclusa, IVA esclusa e fiscalità configurabile per paese.

### 5.2 Skeleton unit economics (gestionale)

```text
# FORMULA GESTIONALE — non contabile ufficiale
# Tutti gli importi nella stessa currency di reporting (FX esplicitato)

execution_cost =
  IF assignment_mode = INTERNAL THEN internal_execution_cost
  ELSE IF assignment_mode = PARTNER THEN partner_cost
  ELSE 0  # DECISIONE APERTA su casi misti

pass_through_costs = tolls_and_parking_borne_by_platform_or_included_logic()
  # dettagli modalità §4.2 — non doppio conteggio con prezzo

variable_payment_costs = payment_fee + fx_fee

commercial_costs = commercial_commission + referral_cost

# Eventi negativi: conteggiare una sola volta nel P&L del booking
# (vedi §15 — anti doppio conteggio)
exception_costs = unique_economic_impact(
  refund_amount, compensation_amount, chargeback_amount, recovery_event
)

contribution_margin_booking ≈
  platform_revenue_recognized_for_booking
  − execution_cost
  − variable_payment_costs
  − commercial_costs
  − exception_costs
  − variable_support_ops_cost_allocated  # opzionale a livello booking
  ± pass_through_net_effect
```

**Classificazione:** **FORMULA GESTIONALE**.
La definizione di `platform_revenue_recognized_for_booking` dipende dal modello commerciale (§6) ed è **DECISIONE APERTA** / **VALIDAZIONE RICHIESTA**.

---

## 6. Gross Booking Value e ricavo piattaforma

### 6.1 Gross Booking Value (GBV)

| Voce | Definizione proposta | Classificazione |
|------|----------------------|-----------------|
| GBV | Somma dei `gross_customer_price` (o equivalente commerciale) dei booking nel perimetro, **prima** di distinguere cosa è ricavo piattaforma | **FORMULA GESTIONALE** |
| Uso | Indicatore di volume; **non** KPI primario di successo | **DECISIONE APPROVATA** (P1) |

### 6.2 Platform revenue (ricavo piattaforma)

Il ricavo piattaforma **non** coincide con il GBV. Dipende dal modello:

| Modello commerciale | Platform revenue (orientamento) | Classificazione |
|---------------------|---------------------------------|-----------------|
| **Merchant of Record** | Tipicamente ricavo da vendita servizi (al netto di trattamenti IVA/commissioni da validare) | **FORMULA CONTABILE DA VALIDARE** + **VALIDAZIONE RICHIESTA** |
| **Intermediario** | Tipicamente commissioni / fee di intermediazione | **FORMULA CONTABILE DA VALIDARE** + **VALIDAZIONE RICHIESTA** |
| **SaaS** | Fee abbonamento / moduli (indipendenti dal GBV tenant, salvo metriche usage) | **FORMULA GESTIONALE** / contabile da validare |
| **Distribuzione B2B** | Margine distribuzione e/o commission secondo contratto | **DECISIONE APERTA** + **VALIDAZIONE RICHIESTA** |

**DECISIONE APPROVATA:** definire `platform_revenue` e `platform_commission` in base al modello commerciale (MoR / intermediario / SaaS / B2B).

### 6.3 Platform commission

| Voce | Nota | Classificazione |
|------|------|-----------------|
| `commercial_commission` / platform commission | Percentuale o fisso trattenuto/addebitato secondo contratto e modello | **DECISIONE APERTA** (importi) — allineare a `DECISIONS_PENDING.md` e NCC |
| Relazione a take rate | Vedi §7 | **FORMULA GESTIONALE** |

---

## 7. Take rate

```text
# FORMULA GESTIONALE
take_rate = platform_revenue / GBV
# oppure, su sottoinsieme marketplace:
take_rate_marketplace = marketplace_platform_revenue / marketplace_GBV
```

| Nota | Classificazione |
|------|-----------------|
| Take rate diverso per linea di ricavo (Marketplace vs SaaS vs B2B vs Corporate). | **IPOTESI INIZIALE** operativa |
| Non usare un unico take rate target come unico obiettivo se il CM è negativo. | **DECISIONE APPROVATA** (P1) |
| Target numerici di take rate. | **DECISIONE APERTA** |
| Benchmark di settore (es. marketplace mobilità / travel). | **BENCHMARK ESTERNO** — non adottare come default |

---

## 8. Margine lordo

Allineamento concettuale con i tre livelli NCC (`NCC_TARIFF_REQUIREMENTS.md`), con correzioni anti doppio conteggio.

```text
# FORMULA GESTIONALE (coerente con P11)
gross_margin_service ≈
  relevant_revenue_basis
  − execution_cost          # INTERNAL xor PARTNER
  − pass_through_net        # solo se non già escluso dalla basis
```

| Voce | Classificazione |
|------|-----------------|
| Definizione esatta di `relevant_revenue_basis` (net vs gross, MoR vs fee) | **FORMULA CONTABILE DA VALIDARE** |
| Margine lordo ≠ contribution margin (il CM include più variabili commerciali/ops) | **FORMULA GESTIONALE** |

---

## 9. Contribution margin

**DECISIONE APPROVATA:** metrica primaria di ottimizzazione insieme all’utile.

```text
# FORMULA GESTIONALE
contribution_margin = platform_revenue_recognized
  − costi_variabili_diretti_del_booking_o_del_periodo
  # esclude costi fissi e la maggior parte delle allocazioni HQ
```

| Livello | Uso | Classificazione |
|---------|-----|-----------------|
| Per booking | Guard di assegnazione, alert, P&L servizio | **FORMULA GESTIONALE** |
| Per territorio / canale / partner | Decisioni RM, go/no-go | **FORMULA GESTIONALE** |
| % (`margin_percentage`) | `CM / platform_revenue_recognized` (o basis scelta e documentata) | **FORMULA GESTIONALE** — basis **DECISIONE APERTA** |

Soglie minime di CM per accettare un booking o un’offerta partner: **DECISIONE APERTA** (legate a P8).

---

## 10. Profitto/perdita per servizio

```text
# FORMULA GESTIONALE
booking_profit_loss ≈ contribution_margin
  − allocazioni_gestionali_opzionali
  − quote_costi_fissi_se_si_sceglie_full_absorption
```

| Approccio | Quando usarlo | Classificazione |
|-----------|---------------|-----------------|
| **CM-only** | Decisioni operative quotidiane | **DECISIONE APPROVATA** come focus primario |
| **Full absorption** | Analisi strategica territorio / break-even | **FORMULA GESTIONALE** — allocazioni esplicite |
| Risultato di conto economico societario | Bilancio | **FORMULA CONTABILE DA VALIDARE** |

Campo dati futuro: `booking_profit_loss`.

---

## 11. CAC cliente

```text
# FORMULA GESTIONALE
CAC_cliente = costi_acquisizione_attributi_a_nuovi_clienti
              / numero_nuovi_clienti
```

| Regola | Classificazione |
|--------|-----------------|
| Paid acquisition limitata finché il CAC payback non è dimostrato | **DECISIONE APPROVATA** |
| Orizzonte payback target (mesi) | **DECISIONE APERTA** |
| Attribuzione multi-touch / last-click | **DECISIONE APERTA** |
| Benchmark CAC travel/NCC | **BENCHMARK ESTERNO** |

Canali prioritari per acquisizione efficiente: **B2B e corporate** (**DECISIONE APPROVATA**).

---

## 12. CAC partner

```text
# FORMULA GESTIONALE
CAC_partner = costi_onboarding_e_acquisizione_partner
              / numero_nuovi_partner_attivi
```

| Nota | Classificazione |
|------|-----------------|
| Include tempo commerciale, legal, verifica documenti, training | **IPOTESI INIZIALE** sul perimetro costi |
| Payback CAC partner su CM generato dal partner | **FORMULA GESTIONALE** |
| Soglia partner “attivo” (es. N corse / M giorni) | **DECISIONE APERTA** |

---

## 13. LTV e retention

```text
# FORMULA GESTIONALE (semplificata — non attuariale)
LTV_cliente ≈ CM_medio_per_booking × booking_attesi_nel_ciclo_di_vita
# oppure somma CM storici + proiezione retention
```

| Voce | Classificazione |
|------|-----------------|
| Distinguere first-time vs repeat (`first-time/repeat customer`) | Requisito dati + **FORMULA GESTIONALE** |
| Retention B2B/corporate tipicamente diversa da B2C | **IPOTESI INIZIALE** |
| LTV formale scontato (DCF) | **FORMULA CONTABILE DA VALIDARE** / finanza |
| Benchmark LTV marketplace | **BENCHMARK ESTERNO** |

---

## 14. Churn

| Tipo | Definizione orientativa | Classificazione |
|------|-------------------------|-----------------|
| Churn cliente B2C | Inattività oltre soglia temporale | **DECISIONE APERTA** (soglia) |
| Churn account corporate/B2B | Non rinnovo contratto / stop volumi | **DECISIONE APERTA** |
| Churn partner | Uscita network / inattività operativa | **DECISIONE APERTA** |
| Churn SaaS | Cancellazione abbonamento | **FORMULA GESTIONALE** standard SaaS |

Il churn entra in LTV e negli scenari (§23); non è KPI isolato dal CM.

---

## 15. Costi di supporto e recovery

**DECISIONE APPROVATA:** supporto umano concentrato sulle eccezioni; automazione per il flusso ordinario.

### 15.1 Costi

| Voce | Misura | Classificazione |
|------|--------|-----------------|
| Supporto | `support_minutes` × costo minuto fully loaded | **FORMULA GESTIONALE** |
| Operations | `operations_minutes` × costo minuto | **FORMULA GESTIONALE** |
| Recovery | costo del `recovery_event` (re-dispatch, goodwill, logistica) | **FORMULA GESTIONALE** |

### 15.2 Anti doppio conteggio (obbligatorio)

| Evento | Regola | Classificazione |
|--------|--------|-----------------|
| `refund_amount` | Impatta ricavo/CM **una volta**; non sommare di nuovo come “costo recovery” generico | **DECISIONE APPROVATA** |
| `compensation_amount` | Bene/servizio o credito goodwill: voce distinta; non duplicare con refund se è lo stesso evento economico | **DECISIONE APPROVATA** |
| `recovery_event` | Traccia il processo operativo; il costo economico è nelle voci esplicite (minuti, compensation, re-assignment delta) | **DECISIONE APPROVATA** |
| `chargeback_amount` | Include fee chargeback se applicabile; non contare anche come refund pieno se già lo sostituisce | **DECISIONE APPROVATA** + **VALIDAZIONE RICHIESTA** su trattamento contabile |

---

## 16. Costi umani e automazione

| Ambito | Principio | Classificazione |
|--------|-----------|-----------------|
| Flusso ordinario | Automazione (booking, quote, notifiche, self-service) | **DECISIONE APPROVATA** |
| Eccezioni | Supporto / ops umano | **DECISIONE APPROVATA** |
| Personale territoriale | Solo se sostenibile (§21–22) | **DECISIONE APPROVATA** |
| Costo fully loaded | Retribuzione + contributi + tool + overhead diretto | **FORMULA GESTIONALE** / **VALIDAZIONE RICHIESTA** su componenti |

---

## 17. Redditività per tratta

**DECISIONE APPROVATA:** ogni tratta (`route_id`) deve avere redditività misurabile.

| Metrica | Definizione orientativa | Classificazione |
|---------|-------------------------|-----------------|
| CM per tratta | Σ CM booking su `route_id` / periodo | **FORMULA GESTIONALE** |
| CM medio per corsa | CM / n. booking completati | **FORMULA GESTIONALE** |
| Densità | Volume vs costo di copertura (deadhead, rientro a vuoto — vedi NCC) | **IPOTESI INIZIALE** + link a requisiti tariffari |

---

## 18. Redditività per città/territorio

**DECISIONE APPROVATA:** ogni territorio (`territory_id`) ha redditività misurabile; personale territoriale solo se sostenibile.

| Metrica | Uso | Classificazione |
|---------|-----|-----------------|
| CM territoriale | Base per Decision Engine RM | **FORMULA GESTIONALE** |
| CM stabile | Serie temporale / soglia stabilità | **DECISIONE APERTA** (definizione “stabile”) |
| Copertura costo RM | Vedi §21–22 | **IPOTESI INIZIALE** numerica (2,5x–4x) da validare |

---

## 19. Redditività per partner

**DECISIONE APPROVATA:** redditività misurabile per `partner_id`.

| Metrica | Nota | Classificazione |
|---------|------|-----------------|
| CM generato | Ricavo piattaforma attribuibile − costi variabili legati al partner | **FORMULA GESTIONALE** |
| Quality / recovery rate | Impatta CM via exception_costs | **FORMULA GESTIONALE** |
| Offer acceptance vs budget max | Storico `offer_escalation_history`, `final_accepted_partner_offer` | Requisito dati §27 |
| Ranking partner | Non solo prezzo: CM atteso + affidabilità | **IPOTESI INIZIALE** |

---

## 20. Redditività per canale

**DECISIONE APPROVATA:** ogni canale (`acquisition_channel_id`) ha redditività misurabile; B2B/corporate prioritari; paid limitata senza payback.

| Canale (esempi) | Priorità | Classificazione priorità |
|-----------------|----------|--------------------------|
| B2B distribution | Alta | **DECISIONE APPROVATA** |
| Corporate | Alta | **DECISIONE APPROVATA** |
| Organic / referral | Media-alta | **IPOTESI INIZIALE** |
| Paid digital | Limitata fino a payback dimostrato | **DECISIONE APPROVATA** |
| Marketplace inbound | Da misurare | **DECISIONE APERTA** su investimento |

Classificazione booking: `B2B` / `B2C` / `corporate` (requisito dati).

---

## 21. Ambassador e Regional Manager

### 21.1 Ambassador

| Voce | Contenuto | Classificazione |
|------|-----------|-----------------|
| Introduzione | Remunerazione **variabile** e **tracciabile** in fase iniziale | **DECISIONE APPROVATA** |
| Base fissa iniziale | Non prevista come default | **IPOTESI INIZIALE** (coerente con variabile) |
| Tracciamento | `referral_cost`, canale, booking attribuiti | Requisito dati |
| Schema % / fisso per conversione | Importi | **DECISIONE APERTA** + eventuale **VALIDAZIONE RICHIESTA** (inquadramento) |

### 21.2 Regional Manager (RM)

| Voce | Contenuto | Classificazione |
|------|-----------|-----------------|
| Condizione di introduzione | Margine territoriale **stabile** | **DECISIONE APPROVATA** |
| Copertura costo | Indicativa tra **2,5x e 4x** del costo fully loaded dell’RM | **IPOTESI INIZIALE** — **soglia ancora da validare** |
| Persone sul territorio | Solo se economicamente sostenibile | **DECISIONE APPROVATA** |

```text
# FORMULA GESTIONALE — soglia IPOTESI INIZIALE da validare
coverage_ratio = CM_territoriale_attributabile_stabile
                 / fully_loaded_cost_RM

# go RM solo se coverage_ratio ∈ [2.5, 4.0] (o sopra il minimo scelto)
# DECISIONE APERTA: minimo 2.5 vs 3.0 vs altro; finestra di stabilità
```

---

## 22. Regional Manager Decision Engine

Motore decisionale **gestionale** (regole + dati), non un prodotto AI obbligatorio.

| Input | Descrizione | Classificazione |
|-------|-------------|-----------------|
| CM territoriale e trend | Stabilità / volatilità | **FORMULA GESTIONALE** |
| Volume e mix canali | B2B/corporate vs paid | Dati §27 |
| Densità tratte | Redditività route | §17 |
| Qualità partner | Recovery, no-show, CM partner | §19 |
| Costo fully loaded RM | HR + tool + travel | **FORMULA GESTIONALE** |
| Coverage ratio | §21.2 | **IPOTESI INIZIALE** numerica |

| Output | Azione tipica | Classificazione |
|--------|---------------|-----------------|
| NO-GO | Nessun RM; eventuale Ambassador variabile | **DECISIONE APPROVATA** (personale solo se sostenibile) |
| WATCH | Monitoraggio; niente assunzione | **IPOTESI INIZIALE** |
| GO | Introdurre RM con KPI e review periodica | Soggetto a validazione soglia 2,5x–4x |
| EXIT | Ridurre / rimuovere copertura umana se coverage crolla | **IPOTESI INIZIALE** |

---

## 23. Scenari economici

| Scenario | Descrizione | Classificazione |
|----------|-------------|-----------------|
| Conservativo | Volume basso, take rate cauto, paid ≈ 0, focus B2B/corporate | **IPOTESI INIZIALE** |
| Base | Mix ibrido; automazione alta; RM solo su territori GO | **IPOTESI INIZIALE** |
| Espansivo | Più territori, paid dopo payback, RM multipli | **IPOTESI INIZIALE** — vincolato a P3/P6 |

Ogni scenario deve proiettare almeno: GBV, platform revenue, CM, costi fissi, utile gestionale, fabbisogno cassa.
Conversioni fiscali degli scenari: **VALIDAZIONE RICHIESTA A COMMERCIALISTA/LEGALE**.

---

## 24. Break-even

```text
# FORMULA GESTIONALE
break_even_bookings ≈ costi_fissi_periodo
                      / CM_medio_per_booking
# oppure break-even su platform revenue / territorio
```

| Livello | Classificazione |
|---------|-----------------|
| Break-even aziendale | **FORMULA GESTIONALE** |
| Break-even territoriale (pre-RM e post-RM) | **FORMULA GESTIONALE** |
| Break-even SaaS (sottoscrittori) | **FORMULA GESTIONALE** |
| Break-even di bilancio | **FORMULA CONTABILE DA VALIDARE** |

---

## 25. Alert automatici

Requisiti funzionali futuri (nessuna implementazione in questo task).

| Alert | Condizione orientativa | Classificazione |
|-------|------------------------|-----------------|
| Margine sotto soglia | CM% o CM assoluto < minimo | **DECISIONE APPROVATA** (principio); soglia **DECISIONE APERTA** |
| Offerta oltre budget | `final_accepted_partner_offer` o offerta candidata > `maximum_assignment_budget` | **DECISIONE APPROVATA** (blocco P8) |
| Escalation eccessiva | Troppi `assignment_attempts` / escalation senza accettazione | **IPOTESI INIZIALE** |
| Spike exception costs | Refund/compensation/chargeback anomali | **FORMULA GESTIONALE** |
| Territorio sotto coverage RM | coverage_ratio sotto minimo | **IPOTESI INIZIALE** |
| CAC payback non dimostrato | Paid spend senza payback | **DECISIONE APPROVATA** (limitare paid) |
| Doppio evento economico | Stesso importo classificato due volte (refund+compensation) | **DECISIONE APPROVATA** (controllo qualità dati) |

---

## 26. Regole go/no-go

| ID | Regola | Classificazione |
|----|--------|-----------------|
| G1 | Non ottimizzare decisioni di scaling sul solo GBV. | **DECISIONE APPROVATA** |
| G2 | Non introdurre RM senza margine territoriale stabile e coverage indicativa validata. | **DECISIONE APPROVATA** + soglia da validare |
| G3 | Non scalare paid acquisition senza CAC payback dimostrato. | **DECISIONE APPROVATA** |
| G4 | Non assegnare corsa se l’offerta supera `maximum_assignment_budget` compatibile con margine minimo. | **DECISIONE APPROVATA** |
| G5 | Priorità go-to-market: B2B e corporate prima di paid B2C aggressivo. | **DECISIONE APPROVATA** |
| G6 | No-go su territorio se CM strutturale negativo dopo azioni correttive. | **IPOTESI INIZIALE** (definire “strutturale”) |
| G7 | No-go fiscale/contrattuale su MoR vs intermediario senza parere professionale. | **VALIDAZIONE RICHIESTA A COMMERCIALISTA/LEGALE** |

---

## 27. Dati da raccogliere nel software

**Ambito:** requisiti dati **futuri**. Questo documento **non** modifica database, schema o codice.

Ogni booking / evento economico rilevante dovrebbe poter esporre almeno:

### 27.1 Identità e contesti

| Campo | Note |
|-------|------|
| `booking_id` | Chiave servizio |
| `organization_id` | Tenant / organizzazione |
| `customer_id` | Cliente |
| `corporate_account_id` | Se corporate |
| `partner_id` | Se affidato a partner |
| `driver_id` | Autista |
| `vehicle_id` | Veicolo |
| `route_id` | Tratta |
| `territory_id` | Città/territorio |
| `acquisition_channel_id` | Canale di acquisizione |

### 27.2 Fiscalità e valuta

| Campo | Note |
|-------|------|
| `currency` | Valuta |
| `tax_regime` | Regime fiscale configurabile per paese/org |
| `gross_customer_price` | Prezzo lordo cliente (chiarire se IVA inclusa nel contesto) |
| `net_customer_price` | Prezzo netto IVA/tax secondo regime |

### 27.3 Costi di esecuzione e fee

| Campo | Note |
|-------|------|
| `partner_cost` | Costo affidamento partner (se PARTNER) |
| `internal_execution_cost` | Costo esecuzione interna (se INTERNAL) |
| `payment_fee` | Fee PSP |
| `fx_fee` | Fee cambio |
| `tolls` | Con modalità economica (§4.2) |
| `parking` | Con modalità economica (§4.2) |
| `commercial_commission` | Commissione commerciale / platform commission applicabile |
| `referral_cost` | Costo referral / Ambassador |

### 27.4 Supporto, recovery ed eccezioni

| Campo | Note |
|-------|------|
| `support_minutes` | Minuti supporto |
| `operations_minutes` | Minuti operations |
| `recovery_event` | Evento recovery (id/tipo); costi economici nelle voci dedicate |
| `refund_amount` | Importo rimborso (conteggio unico) |
| `compensation_amount` | Importo compensation (conteggio unico) |
| `chargeback_amount` | Importo chargeback (conteggio unico) |

### 27.5 Margini e classificazione

| Campo | Note |
|-------|------|
| `contribution_margin` | CM del booking |
| `margin_percentage` | CM% |
| `booking_profit_loss` | P&L servizio (definire basis) |
| first-time / repeat customer | Flag o derivato |
| B2B / B2C / corporate classification | Classificazione canale/cliente |
| `cancellation_reason` | Motivo cancellazione |

### 27.6 Assegnazione e budget

| Campo | Note |
|-------|------|
| `assignment_attempts` | Tentativi di assegnazione |
| `offer_escalation_history` | Storico escalation offerte |
| `maximum_assignment_budget` | Budget massimo compatibile con margine minimo |
| `final_accepted_partner_offer` | Offerta partner finalmente accettata |

**DECISIONE APPROVATA (P8):** il sistema deve impedire affidamenti oltre `maximum_assignment_budget`.

> **Nota implementativa (documentale):** la persistenza di questi campi è pianificata in fasi successive (Blueprint / roadmap); nessuna migration in questa attività.

---

## 28. Decisioni aperte

Elenco BOS-specifico. Integrare con [`DECISIONS_PENDING.md`](./DECISIONS_PENDING.md).

| # | Tema | Classificazione |
|---|------|-----------------|
| A1 | Modello prevalente per paese: Merchant of Record vs intermediario | **DECISIONE APERTA** + **VALIDAZIONE RICHIESTA** |
| A2 | Listino SaaS (piani, moduli, trial) | **DECISIONE APERTA** |
| A3 | Struttura commissioni piattaforma / partner / B2B | **DECISIONE APERTA** (già in DECISIONS_PENDING) |
| A4 | Soglie numeriche CM minimo e `maximum_assignment_budget` | **DECISIONE APERTA** |
| A5 | Definizione operativa di “margine territoriale stabile” | **DECISIONE APERTA** |
| A6 | Validazione soglia coverage RM 2,5x–4x (minimo effettivo) | **DECISIONE APERTA** (oggi **IPOTESI INIZIALE**) |
| A7 | Schema remunerazione Ambassador (%, cap, clawback) | **DECISIONE APERTA** + possibile **VALIDAZIONE RICHIESTA** |
| A8 | Orizzonte CAC payback accettabile | **DECISIONE APERTA** |
| A9 | Trattamento pedaggi/parcheggi default per prodotto | **DECISIONE APERTA** |
| A10 | Basis ufficiale di `margin_percentage` e `booking_profit_loss` | **DECISIONE APERTA** |
| A11 | Provider pagamenti e fee (impatto `payment_fee`) | **DECISIONE APERTA** (DECISIONS_PENDING) |
| A12 | Policy refund / cancellation / compensation | **DECISIONE APERTA** + **VALIDAZIONE RICHIESTA** |

---

## 29. Validazioni fiscali, contabili e legali

**DECISIONE APPROVATA:** non usare formule fiscali o contabili definitive senza validazione professionale.

| Tema | Perché serve validazione | Classificazione |
|------|--------------------------|-----------------|
| IVA / tax per paese | Gross vs net, reverse charge, B2B estero | **VALIDAZIONE RICHIESTA A COMMERCIALISTA/LEGALE** |
| Merchant of Record vs intermediario | Chi intesta la fattura; obbligo di incasso; responsabilità | **VALIDAZIONE RICHIESTA A COMMERCIALISTA/LEGALE** |
| Riconoscimento ricavi SaaS vs marketplace | Principi contabili applicabili | **VALIDAZIONE RICHIESTA A COMMERCIALISTA/LEGALE** |
| Anticipi pedaggi/parcheggi | Crediti, riaddebiti, documenti | **VALIDAZIONE RICHIESTA A COMMERCIALISTA/LEGALE** |
| Refund, compensation, chargeback | Note di credito, perdite su crediti | **VALIDAZIONE RICHIESTA A COMMERCIALISTA/LEGALE** |
| Inquadramento Ambassador / RM | Lavoro / collaborazioni / provvigioni | **VALIDAZIONE RICHIESTA A COMMERCIALISTA/LEGALE** |
| Contratti partner e net rate B2B | Responsabilità servizio, assicurazioni, privacy | **VALIDAZIONE RICHIESTA A COMMERCIALISTA/LEGALE** |
| Multi-currency / FX | Trattamento differenze cambio | **VALIDAZIONE RICHIESTA A COMMERCIALISTA/LEGALE** |

---

## 30. Glossario economico

| Termine | Definizione sintetica | Note |
|---------|----------------------|------|
| **GBV / Gross Booking Value** | Volume lordo prenotato lato cliente nel perimetro | Non è KPI primario (**DECISIONE APPROVATA**) |
| **GMV** | Spesso sinonimo commerciale di GBV; evitare ambiguità con ricavo | Chiarire in report quale si usa |
| **Platform revenue** | Ricavo riconosciuto alla piattaforma secondo modello commerciale | Dipende da MoR/intermediario/SaaS/B2B |
| **Platform commission** | Commissione/fee piattaforma su transazione o contratto | Non confondere con CM |
| **Take rate** | Platform revenue / GBV (o sottoinsieme) | **FORMULA GESTIONALE** |
| **Gross margin** | Margine dopo costo di esecuzione (internal xor partner) e pass-through netti | Gestione ≠ bilancio |
| **Contribution margin (CM)** | Margine dopo costi variabili diretti rilevanti | KPI primario insieme all’utile |
| **Booking P&L** | Risultato per servizio (`booking_profit_loss`) | Basis da decidere |
| **CAC** | Costo di acquisizione (cliente o partner) | Payback obbligatorio prima di scalare paid |
| **LTV** | Valore economico atteso del cliente nel ciclo di vita | Spesso gestionale |
| **Churn** | Perdita di clienti/partner/abbonati | Soglie **DECISIONE APERTA** |
| **Maximum assignment budget** | Cap di costo assegnazione compatibile con margine minimo | Enforcement **DECISIONE APPROVATA** |
| **Tax regime** | Configurazione fiscale per paese/organizzazione | Nessuna formula IVA unica |
| **Merchant of Record (MoR)** | Soggetto che vende al cliente finale | **VALIDAZIONE RICHIESTA** |
| **Pass-through** | Costo riaddebitato senza (o con limitato) margine | Pedaggi/parcheggi tipici |
| **Fully loaded cost** | Costo completo di una risorsa umana | Usato per coverage RM |
| **Coverage ratio** | CM stabile territorio / fully loaded RM | 2,5x–4x = **IPOTESI INIZIALE** da validare |

---

## Appendice A — Registro decisioni approvate (estratto)

| ID | Decisione | Sezioni |
|----|-----------|---------|
| DA-01 | Privilegiare contribution margin e utile, non il solo GMV | §1, §2, §6, §9 |
| DA-02 | Modello ibrido Marketplace + SaaS + B2B Distribution + Corporate | §3 |
| DA-03 | Personale territoriale solo se economicamente sostenibile | §18, §21, §22 |
| DA-04 | Ambassador inizialmente con remunerazione variabile e tracciabile | §21.1 |
| DA-05 | RM solo con margine territoriale stabile; coverage indicativa 2,5x–4x ancora da validare | §21.2, §22 |
| DA-06 | Redditività misurabile per territorio, tratta, partner, cliente, canale | §17–§20 |
| DA-07 | Supporto umano sulle eccezioni; automazione sul flusso ordinario | §15, §16 |
| DA-08 | Paid acquisition limitata finché CAC payback non dimostrato | §11, §20, §26 |
| DA-09 | B2B e corporate canali prioritari | §3, §20 |
| DA-10 | Impedire affidamento corsa oltre budget massimo del margine minimo | §25, §26, §27.6 |
| DA-11 | IVA/tax configurabile; no formula IVA unica | §5.1, §29 |
| DA-12 | No doppio conteggio refund/compensation/recovery/chargeback | §15.2 |
| DA-13 | Internal vs partner: non sottrarre sempre entrambi i payout | §4.1 |
| DA-14 | Platform revenue/commission per modello commerciale | §6 |
| DA-15 | Pedaggi/parcheggi con modalità economiche distinte | §4.2 |
| DA-16 | Separare variabili / semi-variabili / fissi / allocazioni | §4 |
| DA-17 | Nessuna formula fiscale/contabile definitiva senza professionisti | §29 |

---

## Appendice B — Cronologia revisioni

| Versione | Data | Autore | Descrizione |
|----------|------|--------|-------------|
| 0.1.0 | 2026-07-26 | Documentation Architect / Lead Software Engineer | Prima formalizzazione BOS: principi, linee di ricavo, unit economics, correzioni obbligatorie, requisiti dati futuri, decisioni aperte e validazioni professionali. |

---

*Fine del Business Operating System — v0.1.0. Le formule marcate come gestionali o da validare non costituiscono parere fiscale, contabile o legale.*

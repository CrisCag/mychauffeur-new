# MyChauffeur OS — Partner Legal and Operating Framework

**Documento:** Framework legale-operativo partner (progettazione)
**Prodotto:** MyChauffeur OS
**Repository:** `mychauffeur-new`
**Branch di riferimento:** `fase-0/stabilizzazione-sicurezza-baseline`
**Documento padre:** [`MASTER_BLUEPRINT.md`](./MASTER_BLUEPRINT.md)
**Documenti correlati:** [`BUSINESS_OPERATING_SYSTEM.md`](./BUSINESS_OPERATING_SYSTEM.md) · [`NCC_TARIFF_REQUIREMENTS.md`](./NCC_TARIFF_REQUIREMENTS.md) · [`DECISIONS_PENDING.md`](./DECISIONS_PENDING.md)
**Versione:** 0.1.0
**Stato:** Documento di progettazione — **non è un contratto**
**Data:** 2026-07-26

---

## Avvertenza legale

Questo file **non** costituisce contratto, termini di servizio, parere legale né modello fiscale.
Descrive cosa i futuri contratti e il software dovranno disciplinire, quali dati raccogliere, quali workflow automatizzare e quali punti sottoporre ad avvocato/commercialista.

Le clausole contrattuali definitive saranno redatte **successivamente**, a partire da questo framework.

Dove compare **VALIDAZIONE LEGALE NECESSARIA**, la scelta non può essere chiusa dal solo team prodotto/engineering.

---

## Legenda

| Etichetta | Significato |
|-----------|-------------|
| **DECISIONE REGISTRATA** | Scelta di governance/prodotto registrata in questo framework. |
| **DECISIONE APERTA** | Non risolta; include voci ancora in [`DECISIONS_PENDING.md`](./DECISIONS_PENDING.md). |
| **VALIDAZIONE LEGALE NECESSARIA** | Richiede avvocato e/o commercialista prima di contrattualizzare o automatizzare effetti coercitivi. |
| **REQUISITO SOFTWARE** | Comportamento atteso della piattaforma (futuro; nessuna implementazione in questo task). |
| **ALLINEAMENTO BOS/NCC** | Collegamento a Business Operating System o requisiti tariffari NCC, senza ridichiararli per intero. |

---

## Indice

1. [Obiettivi](#1-obiettivi)
2. [Principi generali](#2-principi-generali)
3. [Tipologie di partner](#3-tipologie-di-partner)
4. [Natura del rapporto](#4-natura-del-rapporto)
5. [Framework documentale](#5-framework-documentale)
6. [Requisiti di ingresso](#6-requisiti-di-ingresso)
7. [Licenze e assicurazioni](#7-licenze-e-assicurazioni)
8. [Standard operativi](#8-standard-operativi)
9. [Processo di onboarding](#9-processo-di-onboarding)
10. [Offerta e accettazione servizi](#10-offerta-e-accettazione-servizi)
11. [Obblighi dopo l'accettazione](#11-obblighi-dopo-laccettazione)
12. [Riassegnazione](#12-riassegnazione)
13. [Cancellazioni](#13-cancellazioni)
14. [No-show](#14-no-show)
15. [Ritardi](#15-ritardi)
16. [Subaffidamento](#16-subaffidamento)
17. [KPI qualità](#17-kpi-qualità)
18. [Partner Score](#18-partner-score)
19. [Warning](#19-warning)
20. [Sospensione](#20-sospensione)
21. [Offboarding](#21-offboarding)
22. [Pagamenti](#22-pagamenti)
23. [Settlement](#23-settlement)
24. [Contestazioni](#24-contestazioni)
25. [Appeals](#25-appeals)
26. [Recovery Cost](#26-recovery-cost)
27. [Trattenute](#27-trattenute)
28. [Audit Trail](#28-audit-trail)
29. [Logging richiesto](#29-logging-richiesto)
30. [Dati minimi da registrare](#30-dati-minimi-da-registrare)
31. [Anti-disintermediazione](#31-anti-disintermediazione)
32. [Privacy](#32-privacy)
33. [Data Processing](#33-data-processing)
34. [Responsabilità](#34-responsabilità)
35. [Manleva](#35-manleva)
36. [Assicurazioni](#36-assicurazioni)
37. [Clausole da validare](#37-clausole-da-validare)
38. [Rischi di subordinazione](#38-rischi-di-subordinazione)
39. [Local Law Schedule](#39-local-law-schedule)
40. [Roadmap documentale](#40-roadmap-documentale)
41. [Matrice regole](#41-matrice-regole)

---

## 1. Obiettivi

1. Definire la **struttura** del rapporto MyChauffeur ↔ partner esecutore, senza redigere il contratto.
2. Allineare operazioni, software e futuri atti legali su responsabilità, prove, settlement e qualità.
3. Proteggere cliente, piattaforma e partner tramite processi tracciati e contestabili.
4. Fornire la base da cui derivare: Master Partner Agreement, schedule locali, policy operative, checklist onboarding.
5. Restare coerenti con [`BUSINESS_OPERATING_SYSTEM.md`](./BUSINESS_OPERATING_SYSTEM.md) (CM, budget assegnazione, internal XOR partner cost) e [`NCC_TARIFF_REQUIREMENTS.md`](./NCC_TARIFF_REQUIREMENTS.md) (prezzo cliente / costo assegnato / commissioni), **senza** chiudere le decisioni aperte in [`DECISIONS_PENDING.md`](./DECISIONS_PENDING.md).

---

## 2. Principi generali

| ID | Principio | Classificazione |
|----|-----------|-----------------|
| PG-01 | Il partner è **indipendente**. | **DECISIONE REGISTRATA** |
| PG-02 | **Nessun rapporto di subordinazione** tra MyChauffeur e il partner (né con i suoi autisti). | **DECISIONE REGISTRATA** + **VALIDAZIONE LEGALE NECESSARIA** (inquadramento per giurisdizione) |
| PG-03 | Il **cliente contratta con MyChauffeur**; il **partner esegue** il servizio. | **DECISIONE REGISTRATA** + **VALIDAZIONE LEGALE NECESSARIA** (fatturazione/MoR/IVA — vedi BOS §6/§29; non chiude DECISIONS_PENDING pagamenti) |
| PG-04 | Ogni decisione rilevante (offerta, accettazione, riassegnazione, trattenuta, sospensione, recovery) è **tracciata**. | **DECISIONE REGISTRATA** |
| PG-05 | **Nessuna trattenuta automatica senza motivazione** documentata e contestabile. | **DECISIONE REGISTRATA** |
| PG-06 | Il partner ha **diritto di contestazione** (e percorso appeals). | **DECISIONE REGISTRATA** |
| PG-07 | **Audit trail completo** e **logging immutabile** (append-only / non alterabile senza traccia). | **DECISIONE REGISTRATA** |
| PG-08 | **Gestione prove** obbligatoria per eventi critici (no-show, danni, ritardi, recovery). | **DECISIONE REGISTRATA** |
| PG-09 | **Attribuzione del costo al responsabile** quando legalmente possibile. | **DECISIONE REGISTRATA** + **VALIDAZIONE LEGALE NECESSARIA** |
| PG-10 | **Subaffidamento solo se autorizzato**. | **DECISIONE REGISTRATA** |
| PG-11 | Dati cliente utilizzabili **esclusivamente per l’esecuzione del servizio**. | **DECISIONE REGISTRATA** + **VALIDAZIONE LEGALE NECESSARIA** (privacy) |
| PG-12 | **Anti-disintermediazione ragionevole e proporzionata**. | **DECISIONE REGISTRATA** + **VALIDAZIONE LEGALE NECESSARIA** |
| PG-13 | **Compatibilità internazionale futura** (Local Law Schedule). | **DECISIONE REGISTRATA** |
| PG-14 | Assegnazione partner non può superare il budget massimo compatibile con il margine minimo (BOS P8). | **ALLINEAMENTO BOS** — non ridiscusso qui |
| PG-15 | Costo esecuzione: scenario PARTNER → `partner_cost` (non doppio conteggio con internal). | **ALLINEAMENTO BOS** |

Le decisioni su provider pagamenti, % commissioni, policy acconto/cancellazione cliente, scope portale partner e modalità assegnazione (manuale vs offerte) restano **DECISIONE APERTA** in `DECISIONS_PENDING.md` e non sono risolte da questo documento.

---

## 3. Tipologie di partner

Categorie di progettazione (non esaustive). L’abilitazione di ciascuna tipologia è **DECISIONE APERTA** di prodotto/scope (allineare a DECISIONS_PENDING #5).

| Tipo | Descrizione operativa | Note |
|------|----------------------|------|
| **Partner NCC esecutore** | Impresa/operatore che esegue corse affidate da MyChauffeur | Caso primario di questo framework |
| **Partner flotta / network** | Coordina più autisti/veicoli propri o affiliati | Subaffidamento interno soggetto a PG-10 |
| **Partner distribuzione B2B** | Porta domanda (agenzia/hotel); può non eseguire | Confini con BOS linea B2B; contratto diverso possibile |
| **Partner ibrido** | Sia domanda sia esecuzione | Separare ruoli contrattuali e settlement |

**Cosa dovrà disciplinire il contratto:** definizione delle tipologie ammesse, esclusioni, cumulo di ruoli.
**Comportamento piattaforma:** tag `partner_type`, capability flags, regole di matching per tipo.

---

## 4. Natura del rapporto

| Elemento | Impostazione di progettazione | Classificazione |
|----------|------------------------------|-----------------|
| Qualificazione | Collaborazione commerciale tra imprese indipendenti | **DECISIONE REGISTRATA** |
| Potere direttivo | Assente; MyChauffeur definisce standard di servizio e SLA, non orari di lavoro subordinato | **DECISIONE REGISTRATA** + **VALIDAZIONE LEGALE NECESSARIA** (§38) |
| Mezzi | Partner usa mezzi propri (o autorizzati) | **DECISIONE REGISTRATA** |
| Rischio d’impresa | In capo al partner sull’esecuzione | **VALIDAZIONE LEGALE NECESSARIA** |
| Rapporto col cliente | Cliente ↔ MyChauffeur; partner è esecutore verso MyChauffeur | **DECISIONE REGISTRATA** + **VALIDAZIONE LEGALE NECESSARIA** (rappresentazione al cliente, fatture) |

**Non fare:** linguaggio o UX che implichi “dipendente MyChauffeur”, turni obbligatori tipici della subordinazione, esclusiva assoluta non proporzionata senza parere legale.

---

## 5. Framework documentale

Artefatti previsti (da redigere in seguito; questo file ne è il brief):

| Artefatto | Ruolo |
|-----------|--------|
| **Master Partner Agreement (MPA)** | Condizioni generali rapporto |
| **Service Schedule / Rate Card** | Tariffe, net rate, fee (importi = DECISIONE APERTA) |
| **Operations Policy** | Standard operativi, KPI, no-show, ritardi |
| **Data Processing Addendum (DPA)** | Trattamento dati (§33) |
| **Insurance Schedule** | Massimali e coperture (§7, §36) |
| **Local Law Schedule** | Varianti per paese/regione (§39) |
| **Evidence & Disputes Policy** | Prove, contestazioni, appeals |
| **Sanctions Ladder** | Warning → sospensione → offboarding |

**REQUISITO SOFTWARE:** versioning dei documenti accettati (`document_version`, `accepted_at`, `accepted_by`).

---

## 6. Requisiti di ingresso

| Requisito | Descrizione | Classificazione |
|-----------|-------------|------------------|
| Identità giuridica | Ragione sociale, CF/P.IVA o equivalente locale | **REQUISITO SOFTWARE** + **VALIDAZIONE LEGALE NECESSARIA** (KYC) |
| Contatti operativi | Referente 24/7 o finestra dichiarata | Operativo |
| Licenze NCC / autorizzazioni | Prove valide e non scadute (§7) | Obbligatorio per esecuzione |
| Assicurazioni | Prove e massimali minimi (§36) | Obbligatorio |
| Accettazione MPA + policy | Firma/accettazione elettronica tracciata | **DECISIONE REGISTRATA** (tracciamento) |
| Conto settlement | IBAN / metodo pagamento partner | Dipende da DECISIONS_PENDING #1 |

**Cosa disciplinerà il contratto:** elenco documenti obbligatori, termini di rinnovo, conseguenze documentazione scaduta.

---

## 7. Licenze e assicurazioni

| Ambito | Cosa disciplinire | Piattaforma |
|--------|-------------------|-------------|
| Licenze | Tipologie ammesse per territorio; validità; obbligo aggiornamento | Upload, expiry date, alert pre-scadenza, blocco matching se scadute |
| Assicurazioni | RCA, RCT, infortuni, altri minimi locali | Stesso ciclo documentale; **VALIDAZIONE LEGALE NECESSARIA** sui massimali |
| Verifica | Chi verifica (MyChauffeur, third-party, self-declare + audit) | **DECISIONE APERTA** + **VALIDAZIONE LEGALE NECESSARIA** |

Allineamento Local Law Schedule: requisiti diversi per paese senza rompere il MPA core.

---

## 8. Standard operativi

Standard di servizio (non istruzioni tipiche del lavoro subordinato):

- Puntalità e finestra di cortesia dichiarata.
- Classe veicolo / capienza coerente con l’offerta accettata.
- Codice abbigliamento / presentazione (se previsto dal prodotto premium) — formulazione da validare vs §38.
- Comunicazione stato corsa tramite canali piattaforma.
- Divieto di richiedere pagamenti laterali al cliente salvo policy esplicita (**VALIDAZIONE LEGALE NECESSARIA** + allineamento pagamenti aperti).
- Uso dati cliente solo per il servizio (PG-11).

**KPI:** §17. **Enforcement:** §19–§21.

---

## 9. Processo di onboarding

```text
Apply → KYC/docs → Review → Contract acceptance → Activation → Probation (opzionale) → Full matching
```

| Step | Dati / prove | Automazione |
|------|--------------|-------------|
| Apply | anagrafica, tipo partner | Form + `partner_application_id` |
| Docs | licenze, assicurazioni | Upload + expiry |
| Review | esito umano/automatizzato | Audit trail decisione |
| Accept | versione documenti | Timestamp immutabile |
| Activate | `partner_status=active` | Gate matching |
| Probation | limiti volume/tratte | Flag + score iniziale |

**DECISIONE APERTA:** durata probation, chi approva (ops vs legal).
Scope portale vs solo email: **non risolto** (DECISIONS_PENDING #5).

---

## 10. Offerta e accettazione servizi

| Tema | Impostazione | Classificazione |
|------|--------------|-----------------|
| Meccanismo | Offerta a partner / accept-reject **oppure** assegnazione manuale dispatcher | **DECISIONE APERTA** (DECISIONS_PENDING #7) — il framework supporta entrambi |
| Budget | Offerta non accettabile oltre `maximum_assignment_budget` | **ALLINEAMENTO BOS** P8 — **REQUISITO SOFTWARE** |
| Accettazione | Vincolante operativamente; genera obblighi §11 | **DECISIONE REGISTRATA** (tracciamento) |
| Storico | `assignment_attempts`, `offer_escalation_history`, `final_accepted_partner_offer` | **ALLINEAMENTO BOS** §27 |

**Cosa disciplinerà il contratto:** effetti dell’accettazione, tempi di risposta, silenzio-rigetto o meno (**VALIDAZIONE LEGALE NECESSARIA** su silenzio-assenso).

---

## 11. Obblighi dopo l'accettazione

Dopo accettazione, il partner (tramite piattaforma) dovrà tipicamente:

1. Confermare autista/veicolo entro SLA.
2. Aggiornare stati corsa secondo macchina stati ufficiale.
3. Presentarsi al pickup nella finestra definita.
4. Non subaffidare senza autorizzazione (§16).
5. Conservare/produrre prove se richieste (§14–§15, §28).
6. Non contattare il cliente fuori canali ammessi per scopi diversi dal servizio (§31–§32).

Inadempimento → warning / riassegnazione / recovery cost / sospensione secondo matrice, con diritto di contestazione.

---

## 12. Riassegnazione

| Trigger esempio | Effetto | Classificazione |
|-----------------|---------|-----------------|
| Partner rifiuta dopo accettazione | Corsa torna in coda; possibile recovery | Operativo + economico |
| No-show partner / veicolo inadeguato | Riassegnazione urgente | Prove obbligatorie |
| Richiesta cliente / forza maggiore | Policy distinta | **VALIDAZIONE LEGALE NECESSARIA** |
| Budget / qualità | Dispatcher o motore rispetta budget max | BOS |

**REQUISITO SOFTWARE:** ogni riassegnazione logga motivo, attore, timestamp, delta costo, partner uscente/entrante.

---

## 13. Cancellazioni

| Soggetto | Tema | Classificazione |
|----------|------|-----------------|
| Cliente | Policy acconto/cancellazione/rimborso | **DECISIONE APERTA** (DECISIONS_PENDING #2, #3) — non risolta qui |
| Partner | Cancellazione post-accettazione: tempi, penali gestionali, impatto score | Da disciplinare in Operations Policy + **VALIDAZIONE LEGALE NECESSARIA** |
| Piattaforma | Cancellazione per sicurezza/compliance | Audit + comunicazione |

Allineare settlement a BOS anti-doppio conteggio (refund / compensation / recovery).

---

## 14. No-show

Distinguere almeno:

| Tipo | Prove tipiche | Effetto orientativo |
|------|---------------|---------------------|
| **No-show cliente** | GPS, timestamp, foto location, tentativi contatto | Compenso partner secondo policy; costo non scaricato indebitamente sul partner |
| **No-show partner** | Mancata presenza, stati non aggiornati, report cliente | Riassegnazione + possibile recovery + score |

**DECISIONE REGISTRATA:** gestione prove obbligatoria.
Importi e penali: **DECISIONE APERTA** + **VALIDAZIONE LEGALE NECESSARIA**.

---

## 15. Ritardi

| Elemento | Progettazione |
|----------|---------------|
| Soglie | Ritardo lieve / grave / abbandono servizio — valori numerici **DECISIONE APERTA** |
| Cause | Traffico, cliente, partner, forza maggiore — classificazione tracciata |
| Remedi | Credito cliente, compensation, riassegnazione |
| Score | Impatto su KPI puntualità |

**REQUISITO SOFTWARE:** `delay_minutes`, `delay_cause_code`, evidence refs.

---

## 16. Subaffidamento

**DECISIONE REGISTRATA:** subaffidamento solo autorizzato.

| Regola di progettazione | Dettaglio |
|-------------------------|-----------|
| Default | Vietato |
| Eccezione | Autorizzazione esplicita MyChauffeur + subaffidatario che soddisfa §§6–7 |
| Responsabilità | Partner primario resta responsabile verso MyChauffeur salvo diversa pattuizione validata |
| Software | Flag `subcontract_authorized`, id subaffidatario, audit |

**VALIDAZIONE LEGALE NECESSARIA:** limiti di catena, obblighi di legge locali sul trasporto persone.

---

## 17. KPI qualità

Esempi di KPI (pesi e soglie = **DECISIONE APERTA**):

| KPI | Misura tipica |
|-----|---------------|
| Acceptance rate | Offerte accettate / ricevute |
| Cancellation post-accept | % |
| On-time pickup | % entro finestra |
| Completion rate | % |
| Customer complaint rate | % |
| Evidence compliance | % eventi con prove complete |
| Document validity | % giorni con docs validi |

Collegamento a Partner Score (§18) e redditività partner (BOS §19) senza duplicare formule CM.

---

## 18. Partner Score

Indice composito per matching, priorità offerte, probation, sospensione.

| Elemento | Nota |
|----------|------|
| Input | KPI §17 + severity eventi |
| Output | Score numerico + fascia |
| Trasparenza | Partner può vedere componenti e storico |
| Contestazione | Errori di calcolo/evento → §24–§25 |

Algoritmo esatto e pesi: **DECISIONE APERTA**. Non usare lo score per creare di fatto subordinazione (§38).

---

## 19. Warning

| Proprietà | Impostazione |
|-----------|--------------|
| Natura | Avviso formale tracciato, non sanzione economica automatica |
| Trigger | Breaches KPI, docs in scadenza, comportamento |
| Contenuto | Motivo, evidenze, azioni correttive, termine |
| Escalation | N warning → sospensione (soglia **DECISIONE APERTA**) |

**DECISIONE REGISTRATA:** tracciamento completo; diritto di contestazione.

---

## 20. Sospensione

| Tipo | Effetto piattaforma |
|------|---------------------|
| Temporanea | Stop nuove offerte; corse già accettate secondo policy |
| Documentale | Blocco per licenza/assicurazione scaduta |
| Sicurezza | Blocco immediato |

**Cosa disciplinerà il contratto:** casi, preavviso, durata, riattivazione.
**VALIDAZIONE LEGALE NECESSARIA:** sospensione vs risoluzione; effetti su compensi maturati.

---

## 21. Offboarding

```text
Notice → Wind-down (corse aperte) → Final settlement → Access revoke → Data retention/deletion
```

| Tema | Nota |
|------|------|
| Iniziativa | Partner o MyChauffeur |
| Cause | Scadenza, breach grave, score, cessazione attività |
| Dati | Revoca accesso; retention secondo §32–§33 |
| Settlement finale | Incluso contestazioni aperte |

**VALIDAZIONE LEGALE NECESSARIA:** preavvisi minimi, giusta causa, sopravvivenza clausole (manleva, privacy, anti-disintermediazione limitata nel tempo).

---

## 22. Pagamenti

| Tema | Stato |
|------|-------|
| Provider e metodi | **DECISIONE APERTA** (DECISIONS_PENDING #1) |
| Chi incassa dal cliente | Coerente con PG-03 + **VALIDAZIONE LEGALE NECESSARIA** (MoR/intermediario — BOS) |
| Pagamento al partner | Su settlement periodico o per corsa — **DECISIONE APERTA** |
| Valuta / FX | Allineamento BOS `fx_fee` |

Questo framework **non** sceglie Stripe/Nexi/ecc.

---

## 23. Settlement

Allineamento ai livelli NCC (prezzo cliente, costo assegnato, commissioni) e BOS (partner_cost XOR internal; no doppio conteggio eccezioni).

| Elemento | Progettazione |
|----------|---------------|
| Periodo | Settimanale/mensile — **DECISIONE APERTA** |
| Voci | Corse complete, adjustment, recovery, trattenute motivate, refund attribution |
| Report | Dettaglio per `booking_id` scaricabile |
| Contestazione | Prima della chiusura periodo o entro finestra appeals |

**REQUISITO SOFTWARE:** `settlement_batch_id`, line items immutabili post-chiusura (correzioni solo con adjusting entry + audit).

---

## 24. Contestazioni

**DECISIONE REGISTRATA:** diritto di contestazione del partner.

| Step | Descrizione |
|------|-------------|
| Open | Partner apre dispute su evento/addebito/score |
| Evidence | Entrambe le parti allegano prove |
| Review | Ops/compliance con esito motivato |
| Outcome | Accoglimento / parziale / rigetto |
| Escalate | Appeals (§25) |

SLA di risposta: **DECISIONE APERTA**.
**REQUISITO SOFTWARE:** `dispute_id`, stati, link a `booking_id` / `recovery_event_id`.

---

## 25. Appeals

Secondo livello rispetto alla contestazione ordinaria.

| Elemento | Nota |
|----------|------|
| Quando | Rigetto contestazione o trattenuta sopra soglia |
| Chi decide | Ruolo distinto dal primo reviewer (**DECISIONE APERTA** organizzativa) |
| Effetto | Vincolante internamente fino a giudizio esterno |
| Logging | Completo e immutabile |

**VALIDAZIONE LEGALE NECESSARIA:** rapporto tra appeals interno e foro competente / ADR.

---

## 26. Recovery Cost

Costo per ripristinare il servizio (re-dispatch, compensation cliente, ops minutes) quando un evento è attribuibile.

| Principio | Classificazione |
|-----------|-----------------|
| Attribuzione al responsabile quando legalmente possibile | **DECISIONE REGISTRATA** + **VALIDAZIONE LEGALE NECESSARIA** |
| No doppio conteggio con refund/compensation/chargeback | **ALLINEAMENTO BOS** §15.2 |
| Motivazione obbligatoria prima di addebito partner | **DECISIONE REGISTRATA** (PG-05) |
| Contestabile | **DECISIONE REGISTRATA** |

Campi: `recovery_event`, importi separati, `responsible_party_code`.

---

## 27. Trattenute

**DECISIONE REGISTRATA:** nessuna trattenuta automatica senza motivazione.

| Regola di progettazione | Dettaglio |
|-------------------------|-----------|
| Trigger | Solo eventi tipizzati (recovery, danno documentato, adjustment settlement) |
| Motivazione | Testo + evidence refs obbligatori |
| Notifica | Prima o contestuale, con termine per contestare |
| Cap | Eventuale tetto % — **DECISIONE APERTA** + **VALIDAZIONE LEGALE NECESSARIA** |
| Divieto | Trattenute “silenziose” o batch senza line-item |

---

## 28. Audit Trail

**DECISIONE REGISTRATA:** audit trail completo.

Ogni azione rilevante registra almeno: `actor_id` (user/system), `actor_role`, `action_type`, `entity_type`, `entity_id`, `timestamp_utc`, `before_after` o payload hash, `reason_code`, `correlation_id`.

Azioni minime: onboarding decision, offer, accept/reject, status change, reassignment, cancellation, no-show classification, warning, suspension, settlement close, withhold, dispute, appeal outcome, document upload/expiry override.

---

## 29. Logging richiesto

**DECISIONE REGISTRATA:** logging immutabile.

| Requisito | Descrizione |
|-----------|-------------|
| Append-only | Nessuna cancellazione silenziosa dei log di compliance |
| Integrità | Hash chain o equivalente **REQUISITO SOFTWARE** (tecnologia **DECISIONE APERTA**) |
| Retention | Secondo Local Law Schedule + privacy |
| Accesso | Ruoli limitati; accesso stesso auditato |
| Separazione | Log applicativi ≠ audit compliance (possono coesistere con policy distinte) |

---

## 30. Dati minimi da registrare

Elenco di progettazione (futuro software; **nessuna migration** in questo task). Complementare a BOS §27; qui il focus è partner/legale-operativo.

| Dominio | Campi / entità minime |
|---------|------------------------|
| Partner | `partner_id`, type, status, legal_name, tax_id, contacts |
| Docs | `document_type`, `document_id`, issued/expiry, file hash, verification_status |
| Contratto | `agreement_version`, `accepted_at`, `accepted_by`, locale_schedule_id |
| Assignment | `booking_id`, offer_id, attempts, escalation history, max budget, final offer, accept/reject timestamps |
| Execution | driver_id, vehicle_id, status transitions, geo pings policy-compliant |
| Incidents | no-show type, delay, cancellation_reason, evidence_ids |
| Quality | KPI snapshots, partner_score, warning_ids |
| Economic | partner_cost, settlement_line_ids, recovery_event, withhold reason, dispute_id |
| Privacy | data access log, purpose limitation flag |

Classificazione B2B/B2C/corporate e CM restano definiti nel BOS; non ridichiarati come formule qui.

---

## 31. Anti-disintermediazione

**DECISIONE REGISTRATA:** misure **ragionevoli e proporzionate**.

| Cosa progettare | Esempi di comportamento piattaforma/contratto futuro |
|-----------------|------------------------------------------------------|
| Durante il servizio | Contatto cliente limitato allo stretto necessario |
| Dopo il servizio | Divieto di sollecitare bypass per un periodo limitato — durata **VALIDAZIONE LEGALE NECESSARIA** |
| Monitoraggio | Segnalazione pagamenti laterali / reindirizzamenti — prove e proporzionalità |
| Sanzioni | Warning → sospensione; non penali sproporzionate senza parere |

**Non** copiare clausole aggressive da marketplace esteri senza adattamento locale (**BENCHMARK ESTERNO** da non importare alla cieca).

---

## 32. Privacy

**DECISIONE REGISTRATA:** dati cliente solo per esecuzione del servizio.

| Tema | Impostazione |
|------|--------------|
| Minimizzazione | Solo campi necessari a pickup/dropoff/contatto servizio |
| Divieto | Marketing partner su dati MyChauffeur; rivendita; arricchimento profili |
| Retention partner | Cancellazione/restituzione a fine corsa secondo DPA |
| Diritti interessati | Flusso verso MyChauffeur come punto di contatto salvo Local Law |

**VALIDAZIONE LEGALE NECESSARIA:** ruoli Titolare/Responsabile/contitolari (UE e altri paesi).

---

## 33. Data Processing

| Artefatto | Contenuto da prevedere |
|-----------|------------------------|
| DPA | Istruzioni di trattamento, misure di sicurezza, sub-processors del partner |
| Breach | Notifica tempestiva a MyChauffeur |
| Internazionale | Trasferimenti extra-UE solo con basi legali |

**REQUISITO SOFTWARE:** registro trattamenti lato piattaforma; accettazione DPA versionata.

**VALIDAZIONE LEGALE NECESSARIA:** testo DPA e ruoli privacy.

---

## 34. Responsabilità

| Ambito | Orientamento di progettazione | Classificazione |
|--------|------------------------------|-----------------|
| Esecuzione trasporto | Partner responsabile dell’esecuzione verso MyChauffeur | **DECISIONE REGISTRATA** + **VALIDAZIONE LEGALE NECESSARIA** |
| Rapporto col cliente | MyChauffeur gestisce il rapporto contrattuale col cliente | **DECISIONE REGISTRATA** + **VALIDAZIONE LEGALE NECESSARIA** |
| Limiti di responsabilità | Cap, esclusioni, danni indiretti | **VALIDAZIONE LEGALE NECESSARIA** |
| Sinistri | Coordinamento con assicurazioni §36 | **VALIDAZIONE LEGALE NECESSARIA** |

Non redigere qui limitazioni di responsabilità definitive.

---

## 35. Manleva

Il futuro contratto dovrà disciplinire manleva del partner a favore di MyChauffeur per breach, illeciti nell’esecuzione, violazioni privacy, subaffidamento non autorizzato, claim di terzi dovuti a fatti del partner — nei limiti di legge.

**VALIDAZIONE LEGALE NECESSARIA:** ammissibilità, reciprocal indemnity, carve-out dolo/colpa grave.

---

## 36. Assicurazioni

Estende §7 con focus sinistri:

| Voce | Progettazione |
|------|---------------|
| Coperture minime | Per Local Law Schedule |
| Obbligo mantenimento | Per tutta la durata matching |
| Claim handling | Notifica, collaborazione, non ammissione senza mandato |
| Gap cover | Se massimali insufficienti — **VALIDAZIONE LEGALE NECESSARIA** |

---

## 37. Clausole da validare

Elenco di **argomenti** che il legale dovrà tradurre in testo contrattuale (non clausole definitive):

1. Qualificazione del rapporto e assenza di subordinazione
2. Rappresentazione al cliente e intestazione fatture (coerenza MoR)
3. Accettazione elettronica e valore probatorio
4. Tempi di accept/reject e silenzio
5. Penali / liquidated damages vs recovery cost
6. Trattenute e set-off
7. Sospensione e risoluzione
8. Anti-disintermediazione proporzionata e durata post-contratto
9. Proprietà intellettuale / uso marchio
10. Foro, legge applicabile, ADR
11. Forza maggiore
12. Compliance sanzioni / anti-corruzione
13. Audit rights di MyChauffeur sui partner
14. Sopravvivenza clausole post-offboarding

Tutto: **VALIDAZIONE LEGALE NECESSARIA**.

---

## 38. Rischi di subordinazione

| Rischio | Mitigazione di progettazione |
|---------|------------------------------|
| Controllo orari/turni | Vietare UX/policy da “dipendente”; focus su outcome di servizio |
| Esclusiva assoluta | Valutare esclusiva limitata/proporzionata con legale |
| Mezzi MyChauffeur | Partner usa mezzi propri |
| Potere disciplinare tipico del lavoro | Sanctions ladder commerciale, non “licenziamento” |
| Score come controllo continuo invasivo | Trasparenza + contestazione; non micro-management |

**VALIDAZIONE LEGALE NECESSARIA** per ogni paese in Local Law Schedule (Italia e futuri mercati).

---

## 39. Local Law Schedule

**DECISIONE REGISTRATA:** futura compatibilità internazionale.

| Contenuto tipico dello schedule | Esempio |
|----------------------------------|---------|
| Legge / foro | Per paese |
| Licenze trasporto | Requisiti locali |
| Assicurazioni minime | Massimali |
| Privacy | Adattamenti GDPR / altri |
| Lingua ufficiale documenti | IT/EN + locali |
| Fiscalità settlement | **VALIDAZIONE LEGALE NECESSARIA** / commercialista |

Core MPA stabile; differenze solo in schedule.
Nessun paese oltre il perimetro attuale è “attivato” da questo documento.

---

## 40. Roadmap documentale

| Fase | Deliverable | Dipendenze |
|------|-------------|------------|
| D0 | Questo framework (completato) | — |
| D1 | Checklist onboarding + evidence policy (bozza ops) | Ops |
| D2 | Draft MPA + DPA (legale esterno) | **VALIDAZIONE LEGALE NECESSARIA**; DECISIONS_PENDING #1,#4,#5 dove bloccanti |
| D3 | Operations Policy + Sanctions Ladder | KPI soglie prodotto |
| D4 | Local Law Schedule IT (prima) | Commercialista/legale |
| D5 | Rate Card / settlement schedule | DECISIONS_PENDING #4; allineamento NCC/BOS |
| D6 | Template Partner Portal / accettazione versionata | DECISIONS_PENDING #5; Fase roadmap piattaforma |

Nessuna implementazione software in D0.

---

## 41. Matrice regole

Per ogni regola: obiettivo, rischio mitigato, soggetto protetto, evento attivatore, dati, prove, automazione, impatto economico, diritto di contestazione, priorità, validazione legale.

Priorità: **P0** critica · **P1** alta · **P2** media · **P3** bassa.

| ID | Regola | Obiettivo | Rischio mitigato | Soggetto protetto | Evento che la attiva | Dati richiesti | Prove richieste | Automazione software | Impatto economico | Diritto di contestazione | Priorità | Validazione legale necessaria |
|----|--------|-----------|------------------|-------------------|----------------------|----------------|-----------------|----------------------|-------------------|--------------------------|----------|-------------------------------|
| R01 | Partner indipendente | Qualificare il rapporto | Subordinazione / misclassification | Piattaforma e partner | Onboarding / firma MPA | `partner_id`, legal entity, agreement_version | Doc societari | Blocco attivazione senza accettazione MPA | Indiretto (costi labour risk) | Sì (qualificazione contestabile in appeals/esterno) | P0 | **Sì** |
| R02 | No subordinazione | Evitare rapporto di lavoro | Sanzioni lavoro, contributi | Piattaforma | Design policy, score, turni | Policy flags, audit azioni | — | Vietare feature “turni obbligatori” tipici | Alto se violata | Sì | P0 | **Sì** |
| R03 | Cliente contratta con MyChauffeur | Chiarezza lato domanda | Ambiguity MoR / claim cliente vs partner | Cliente e piattaforma | Creazione booking / checkout | `booking_id`, customer_id, terms_version | Termini accettati cliente | Mostrare MyChauffeur come contraente UI | Ricavi/IVA | Parziale (cliente); partner su effetti settlement | P0 | **Sì** (fatture/IVA/MoR) |
| R04 | Partner esegue | Separare esecuzione | Confusione responsabilità servizio | Cliente, piattaforma | Accept offerta / assign | `partner_id`, driver_id, vehicle_id | Conferma accept | Stati corsa in carico partner | `partner_cost` | Sì su addebiti correlati | P0 | **Sì** |
| R05 | Tracciamento decisioni | Accountability | Decisioni opache | Tutti | Ogni decision event | audit fields §28 | — | Audit trail obbligatorio | Indiretto | Sì (su esiti) | P0 | No (processo); sì se valore probatorio |
| R06 | No trattenuta senza motivazione | Fairness settlement | Abuse set-off | Partner | Tentativo withhold | reason_code, amount, booking_id | Evidence refs | Blocco withhold se manca motivazione/evidence | Impatto diretto su payout | **Sì** | P0 | **Sì** (set-off) |
| R07 | Diritto contestazione | Due process interno | Lock-in sanzioni errate | Partner | Warning, withhold, score, recovery | `dispute_id` | Allegati partner/piattaforma | Workflow dispute | Possibile reversal | Intrinseco | P0 | **Sì** (rapporti ADR) |
| R08 | Audit trail completo | Ricostruibilità | Dispute non difendibili | Piattaforma | Qualsiasi azione §28 | audit log | Export audit | Append-only store | Indiretto | Sì | P0 | Parziale |
| R09 | Logging immutabile | Integrità prove | Tampering | Tutti | Scrittura log compliance | hash/chain meta | — | Append-only + alert alterazione | Indiretto | Sì | P0 | Parziale (conservazione) |
| R10 | Gestione prove | Decidere su fatti | He-said-she-said | Tutti | No-show, ritardo, danno, recovery | `evidence_id`, type | Foto, GPS, call log, docs | Upload + retention policy | Abilita addebiti/crediti | **Sì** | P0 | **Sì** (ammissibilità) |
| R11 | Costo al responsabile | Internalizzare esternalità | Socializzazione perdite | Parte non colpevole | Recovery event chiuso | `responsible_party_code`, amounts | Evidence | Proposta addebito + approvazione | Recovery / CM | **Sì** | P0 | **Sì** |
| R12 | Subaffidamento solo autorizzato | Controllo catena | Partner sconosciuto / uninsured | Cliente, piattaforma | Richiesta subaffido o detect | subcontract flags | Auth record, docs sub | Blocco se non authorized | Possibile void insurance | **Sì** | P0 | **Sì** |
| R13 | Dati cliente solo per servizio | Privacy by design | Uso illecito dati | Cliente (interessato) | Accesso dati contatto | access log, purpose | — | Mascheramento post-trip; watermark | Sanzioni privacy | Sì su sanzioni correlate | P0 | **Sì** (GDPR ruoli) |
| R14 | Anti-disintermediazione proporzionata | Proteggere investimento piattaforma | Bypass / free-riding | Piattaforma | Contatto fuori policy / rebooking detect | signals, booking history | Prove comunicazione | Alert + warning ladder | Penali solo se validate | **Sì** | P1 | **Sì** |
| R15 | Local Law Schedule | Internazionalizzazione | Clausole monopaese illegali altrove | Tutti | Attivazione nuovo territorio | `locale_schedule_id` | Schedule firmato | Gate matching per paese | CapEx legale | Sì | P1 | **Sì** |
| R16 | Docs licenze/assicurazioni validi | Compliance trasporto | Esecuzione illegale | Cliente, piattaforma | Expiry / onboarding | expiry dates | PDF/cert | Auto-suspend matching | Stop payout nuove corse | **Sì** | P0 | **Sì** (minimi locali) |
| R17 | Onboarding gate | Qualità ingresso | Partner non verificato | Piattaforma, cliente | Apply partner | application fields | KYC pack | Workflow stati | CAC partner (BOS) | Sì su reject | P1 | **Sì** (KYC) |
| R18 | Cap budget assegnazione | Proteggere CM | Corsa sotto margine minimo | Piattaforma | Offer / accept | `maximum_assignment_budget`, offer amount | — | Reject offer over budget | Evita CM negativo | Contestable se budget errato | P0 | No (regola ops; importi aperti) |
| R19 | Accept vincolante ops | Affidabilità capacity | Accettazioni leggere | Cliente, piattaforma | Accept | accept timestamp | — | Start SLA post-accept | Penali cancel post-accept (aperte) | **Sì** | P1 | **Sì** (vincolo) |
| R20 | Riassegnazione tracciata | Continuità servizio | Buco di copertura | Cliente | Fail esecuzione / refuse | from/to partner, cost delta | Motivo tipizzato | Requeue + notify | Delta `partner_cost` | **Sì** | P1 | Parziale |
| R21 | No-show classificato | Attribuzione corretta | Addebito errato | Partner o piattaforma | Mancata presa in carico | no_show_type | GPS/foto/contatti | Checklist evidence obbligatoria | Compensation / recovery | **Sì** | P0 | **Sì** |
| R22 | Ritardi tipizzati | Qualità e fairness | Penalità indifferenziate | Partner, cliente | Delay oltre soglia | delay_minutes, cause | — | Alert + KPI | Compensation possibile | **Sì** | P1 | Parziale |
| R23 | KPI + Partner Score | Matching basato su qualità | Assegnazioni cieche | Cliente, piattaforma | Period close / evento | KPI metrics | — | Ricalcolo score | Priorità offerte (non prezzo solo) | **Sì** | P1 | Parziale (§38) |
| R24 | Warning ladder | Correzione graduale | Sospensioni improvvise sproporzionate | Partner | Breach lieve | warning_id | Evidence breach | Notifica + countdown | Nessuno se solo warning | **Sì** | P1 | Parziale |
| R25 | Sospensione tipizzata | Protezione rischio | Continuità con partner unsafe | Cliente, piattaforma | Breach grave / docs | suspension_reason | — | Stop offers | Blocco nuovi ricavi partner | **Sì** + appeals | P0 | **Sì** |
| R26 | Offboarding controllato | Chiusura ordinata | Accesso residuo / dati | Tutti | Notice risoluzione | offboarding_case_id | — | Revoke access + final settlement | Settlement finale | **Sì** | P1 | **Sì** |
| R27 | Settlement line-item | Trasparenza compensi | Payout opachi | Partner | Chiusura batch | settlement_batch_id, lines | Report | Generate PDF/CSV | Payout netto | **Sì** entro finestra | P0 | **Sì** (fiscale) |
| R28 | Appeals II livello | Correzione errori gravi | Bias single reviewer | Partner | Escalate dispute | appeal_id | Fascicolo dispute | Workflow separato | Reversal possibile | Intrinseco | P1 | **Sì** |
| R29 | Recovery motivato | Ripristino servizio | Perdite non allocate | Piattaforma / cliente | Re-dispatch / goodwill | recovery_event, amounts | Evidence | Calc proposto non auto-posting senza reason | Addebito responsabile | **Sì** | P0 | **Sì** |
| R30 | Divieto pagamento laterale non policy | Integrità pricing | Leakage / frodi | Piattaforma, cliente | Detect side payment | signal | Prove | Alert compliance | Chargeback/recovery | **Sì** | P1 | **Sì** |
| R31 | DPA / istruzioni trattamento | Compliance privacy | Data breach / uso illecito | Interessati | Accept DPA / processing | dpa_version | — | Gate attivazione | Sanzioni evitate | Limitato | P0 | **Sì** |
| R32 | Manleva (da redigere) | Risk transfer contrattuale | Claim terzi | Piattaforma | Breach partner | claim_id | Fascicolo | Case management | Indennizzi | **Sì** | P1 | **Sì** |
| R33 | Assicurazioni minime | Capienza sinistri | Scoperto assicurativo | Cliente, piattaforma | Onboarding / rinnovo | policy meta | Certificati | Expiry block | — | **Sì** | P0 | **Sì** |
| R34 | Cancellazione partner post-accept | Affidabilità | Buco last-minute | Cliente | Cancel by partner | reason, timing | — | Reassign + score hit | Possibile recovery | **Sì** | P1 | **Sì** (penali) |
| R35 | Conservazione audit retention | Difendibilità nel tempo | Distruzione prove | Piattaforma | Policy timer | retention_class | — | Legal hold | Costo storage | Limitato | P1 | **Sì** |

---

## Appendice A — Decisioni registrate (estratto)

| ID | Decisione |
|----|-----------|
| DR-01 | Partner indipendente |
| DR-02 | Nessun rapporto di subordinazione |
| DR-03 | Cliente contratta con MyChauffeur |
| DR-04 | Partner esegue il servizio |
| DR-05 | Ogni decisione rilevante è tracciata |
| DR-06 | Nessuna trattenuta automatica senza motivazione |
| DR-07 | Diritto di contestazione del partner |
| DR-08 | Audit trail completo |
| DR-09 | Logging immutabile |
| DR-10 | Gestione prove |
| DR-11 | Attribuzione costo al responsabile quando legalmente possibile |
| DR-12 | Subaffidamento solo autorizzato |
| DR-13 | Dati cliente solo per il servizio |
| DR-14 | Anti-disintermediazione ragionevole e proporzionata |
| DR-15 | Futura compatibilità internazionale (Local Law Schedule) |

---

## Appendice B — Decisioni lasciate aperte (non risolte)

Include esplicitamente le voci ancora in [`DECISIONS_PENDING.md`](./DECISIONS_PENDING.md) rilevanti al partner, **senza chiuderle**:

| Tema | Fonte |
|------|-------|
| Provider pagamenti | DECISIONS_PENDING #1 |
| Policy acconto / cancellazioni cliente / rimborsi | #2, #3 |
| Struttura commissioni / net rate / override | #4 |
| Modello partner (solo email vs portale completo) | #5 |
| Regole tariffarie NCC obbligatorie al go-live | #6 |
| Assegnazione manuale vs offerte accept/reject | #7 |
| Notifiche provider | #8 |
| Soglie KPI, score weights, warning count | Questo framework |
| Periodo settlement, cap trattenute, penali numeriche | Questo framework |
| Massimali assicurativi per paese | Legal schedule |
| Silenzio-assenso su offerte | Legal |

---

## Appendice C — Cronologia revisioni

| Versione | Data | Autore | Descrizione |
|----------|------|--------|-------------|
| 0.1.0 | 2026-07-26 | Documentation Architect / Solution Architect / Legal Process Designer | Prima formalizzazione del framework partner: principi, workflow, matrice regole, requisiti software, punti di validazione legale. Non costituisce contratto. |

---

*Fine del Partner Legal and Operating Framework — v0.1.0. Destinato a guidare la redazione dei contratti futuri e il design della piattaforma; non ha efficacia vincolante tra le parti.*

# MyChauffeur OS — Booking & Service Lifecycle Framework

| Campo | Valore |
|-------|--------|
| **Codice documento** | MC-OS-014 |
| **Titolo** | Booking & Service Lifecycle Framework |
| **Versione** | 0.1.0 |
| **Stato** | Draft |
| **Data creazione** | 2026-07-26 |
| **Ultima modifica** | 2026-07-26 |
| **Owner** | Booking, Service & Operations |
| **Autori** | MyChauffeur OS Team |
| **Documenti correlati** | MC-OS-000 · MC-OS-001 · MC-OS-002 · MC-OS-006 · MC-OS-009 · MC-OS-011 · MC-OS-012 · MC-OS-013 · MC-OS-015 · MC-OS-016 · MC-OS-017 · MC-OS-018 · PLATFORM_MAP · HANDOFF |
| **Dipendenze** | Business Entity Model; Glossary; BOS; SFOF; Partner Exchange; Decisioni pending |
| **Classificazione** | Official Domain Framework — Draft |
| **Documentation Release** | 0.1 (allineamento previsto) |

---

## Avvertenza

Questo documento è un **framework ufficiale di dominio**.
Non è contratto, non è codice, non è schema SQL, non è specifica API, non fissa soglie economiche o percentuali definitive.

I nomi di entità, stati, eventi, campi e concetti software restano in **inglese**. Il testo normativo è in **italiano**.

---

## Source of Truth

Questo documento (MC-OS-014) è la Source of Truth del **ciclo di vita operativo** Request → Quote → Booking → Service → Assignment → Trip → Closure.

---

## 1. Scopo

Definire il ciclo di vita completo e **separato** di Request, Quote, Booking, Service, Assignment, Operational Execution, Cancellation, No-show, Recovery e Closure.

Il framework impedisce che Booking, Service, Trip e Assignment siano trattati come un’unica entità o un unico stato.

**Source of Truth:** questo documento (MC-OS-014) governa i lifecycle operativi. Non sostituisce Pricing (MC-OS-017), Settlement (MC-OS-006), Identity (MC-OS-015), Notification (MC-OS-016) o Customer Experience (MC-OS-018).

## 2. Principi

| ID | Principio |
|----|-----------|
| BSL-01 | Entità e state machine **separate** e tracciabili |
| BSL-02 | `assignment_mode = INTERNAL \| PARTNER` con costi XOR |
| BSL-03 | Maximum Assignment Budget enforced prima di accept |
| BSL-04 | Evidence obbligatoria su eventi critici |
| BSL-05 | Audit trail append-only sulle transizioni rilevanti |
| BSL-06 | Automazione sul flusso ordinario; intervento umano sulle eccezioni |
| BSL-07 | Policy Partner Exchange applicate quando l’origine lo richiede |
| BSL-08 | Nessuna chiusura autonoma di decisioni OPEN (cancel %, SLA numerici, default assignment) |

## 3. Distinzione Request / Quote / Booking / Service / Assignment

| Concetto | Definizione operativa | Non confondere con |
|----------|----------------------|--------------------|
| **Request** | Domanda preliminare non ancora vincolante | Booking |
| **Quote** | Preventivo prezzo (gross/net secondo Tax Regime) | Booking confirmato |
| **Booking** | Obbligazione commerciale (`booking_id`) | Service / Trip |
| **Service** | Prestazione da erogare (N per Booking) | Trip (istanza ops) |
| **Trip** | Istanza operativa di esecuzione | Booking |
| **Assignment** | Attribuzione esecutore INTERNAL \| PARTNER | Offer / Listing |

Regola: uno stato su un’entità **non** implica automaticamente lo stesso stato sull’altra.

## 4. Attori

| Attore | Ruolo nel lifecycle |
|--------|---------------------|
| Customer / Booker / Passenger | Domanda, accettazione Quote, esperienza servizio |
| Agency / Corporate | Booker B2B, policy account |
| Dispatcher | Assignment, eccezioni, recovery |
| Driver | Accettazione missione, stati operativi Trip |
| Originating Partner | Proprietà commerciale corsa (anche Exchange) |
| Executing Partner | Esecuzione Service accettato |
| Platform Operations | Override, dispute, audit |
| System | Eventi, timeout, guardrail |

## 5. Booking origin

Origini ammesse (campo `booking_origin` / canale):

- Consumer B2C
- B2B / Agency
- Corporate Account
- Partner Exchange (corsa owned Originating, copertura via Exchange)
- Admin / manual insert autorizzato

L’origine influenza policy di pricing, disclosure, settlement e notifiche, **senza** fondere le state machine.

## 6. B2C

Flusso tipico Consumer: Request → Quote → accettazione → conferma Booking (con path Payment secondo policy) → generazione Service → Assignment → Trip → Completion → chiusura finanziaria (SFOF).

Booker e Passenger possono coincidere.

## 7. B2B

Booking B2B con condizioni commerciali tipicamente a net rate / accordo Agency. Booker spesso distinto dal Passenger. Policy cancel/payment possono differire dal B2C (importi e timing **OPEN** — DECISIONS #2–#3).

## 8. Corporate

Booking sotto `corporate_account_id` con Travel Manager / policy viaggio. Può prevedere billing ciclico e priorità operativa (MC-OS-018). La conferma Booking resta distinta dall’esecuzione Trip.

## 9. Partner Exchange

Quando la copertura owned manca: pubblicazione Exchange Listing (MC-OS-012). Il Booking Customer resta dell’Originating Partner; l’esecuzione passa a Executing Partner via Assignment `PARTNER`. Progressive Data Disclosure e Customer Price nascosto all’Executing by default.

## 10. Booking creation

Creazione da Quote accettata o da insert autorizzato. Campi minimi concettuali: riferimenti Customer/Organization, Service Category, locations, Vehicle Category, prezzi (Customer Price / Net Price), currency, channel, origin, timestamps.

Non crea automaticamente Assignment né completa il Trip.

## 11. Quote acceptance

Il Booker/Customer accetta una Quote **non scaduta** e non superseded. L’accettazione può generare Booking in stato pending/confirmed secondo regole Payment del canale. Quote expire → nuovo ciclo Request/Quote.

## 12. Booking confirmation

Transizione a `confirmed` quando le condizioni di canale (pagamento, credito Corporate, approvazione Agency) sono soddisfatte. Evento: `booking_confirmed`. Da qui è ammessa la generazione Service e l’avvio Assignment.

## 13. Service generation

Da Booking confirmed si generano uno o più **Service** (andata, ritorno, multi-leg, disposition). Ogni Service ha lifecycle proprio e può avere Assignment e Trip propri.

## 14. Multi-service Booking

Un Booking può aggregare più Service. Settlement e KPI possono aggregare a livello Booking, ma stati operativi restano per Service/Trip. Split economico multi-service: **OPEN**.

## 15. Stops

Stop intermedi (POI/custom) appartengono al Service. Impattano Quote/Pricing (MC-OS-017), tempi operativi e, se material, possono richiedere re-quote o modifica Service Order.

## 16. Return trip

Il ritorno è modellato come Service aggiuntivo collegato o come struttura round-trip esplicita. Non si usa un unico stato “booking andata-ritorno” per rappresentare due esecuzioni.

## 17. Assignment mode INTERNAL / PARTNER

`assignment_mode = INTERNAL | PARTNER`.

- INTERNAL → `internal_execution_cost` (no Partner Cost)
- PARTNER → `partner_cost` (no Internal Execution Cost)

XOR obbligatorio (BOS / Glossary). Violazioni = errore di modello.

## 18. Manual assignment

Dispatcher assegna Driver/Vehicle o Partner senza ciclo Offer automatico. Default manual vs offer: **OPEN** (DECISIONS #7). Sempre soggetti a budget e capability.

## 19. Offer-based assignment

Sistema pubblica Offer verso Partner eleggibili; accept/reject; escalation history; check Maximum Assignment Budget. Controfferte soggette a guardrail Pricing (MC-OS-017).

## 20. Hybrid assignment

Combinazione di regole automatiche (shortlist/offer) e decisione manuale Dispatcher. La Configuration definisce sequenza; non fonde Assignment con Booking state.

## 21. Service Order

Snapshot versionato delle condizioni operative/economiche accettate. Obbligatorio in Partner Exchange; raccomandato anche in owned per audit e dispute. Ogni modifica material → nuova versione.

## 22. Operational execution

L’esecuzione è rappresentata dal **Trip** e dalla Operational state machine. Booking può essere `in_progress` mentre Trip avanza in stati granulari. Dispatcher e Driver operano sul Trip/Assignment, non “sul Booking” come unico stato.

## 23. Driver acceptance

Dove richiesto da policy, il Driver conferma la missione assegnata. Rifiuto può innescare reassignment. Timeout accept: **OPEN**.

## 24. En route

Stato operativo `en_route`: Driver/Vehicle in movimento verso pickup. Eventi geo e ETA alimentano notifiche (MC-OS-016) senza alterare lo stato Booking oltre `in_progress` se già attivo.

## 25. Arrival

Stato `arrived` al punto di pickup. Può avviare waiting clock e regole no-show. Evidence/timestamp raccomandati.

## 26. Passenger on board

Transizione a missione in corso con Passenger a bordo (`ongoing` / onboard). Checkpoint per billing waiting e stop successivi.

## 27. Waiting

Attesa tariffabile o operativa (pre/post pickup, airport). Regole economiche in MC-OS-017; qui solo impatto su stati e eventi `waiting_started` / `waiting_ended`.

## 28. Additional stop

Stop aggiuntivo in esecuzione: aggiorna piano Trip; se fuori Quote, richiede modifica/approvazione e possibile impact su Partner Cost / Customer Price.

## 29. Completion

Trip/Service `completed` con Evidence dove prevista. Booking può passare a `completed` solo quando tutti i Service rilevanti sono chiusi o cancellati secondo policy. Chiusura finanziaria = SFOF (`financially_closed`).

## 30. Cancellation

Cancellazione tipizzata (Customer / Partner / Platform / System). Timing e penali %: **OPEN** (DECISIONS #3). Usa Cancellation state machine (§45). Non equivale a no-show.

## 31. Modification

Modifiche material (orario, luogo, veicolo, stop) → valutazione re-quote, nuova versione Service Order, eventuale reassignment. Modifiche non material → update metadata con audit.

## 32. No-show customer

Mancata presentazione Passenger oltre policy. Richiede Evidence (timestamp arrival, waiting, tentativi contatto). Impatto economico/Score secondo policy **OPEN**. Distinto da Cancellation.

## 33. No-show driver

Mancata presentazione Driver/Partner. Trigger recovery/reassignment; possibile Recovery Cost e impatto reputazione Partner (MC-OS-005/012). Evidence obbligatoria.

## 34. Delay

Ritardo tipizzato (traffico, ops, Customer, Partner). Comunicazione Customer (MC-OS-016). Soglie alert: **OPEN**.

## 35. Disruption

Interruzione maggiore (veicolo, meteo, force majeure). Può portare a partial completion, cancel, o recovery con nuovo Assignment.

## 36. Recovery

Workflow: detect → classify responsible → Evidence → opzioni (reassign, Exchange publish, cancel) → Recovery Cost se attribuibile → Dispute se contestato. No double-count con Refund/Compensation/Chargeback (BOS/SFOF).

## 37. Reassignment

Nuovo Assignment chiude/sostituisce il precedente (`reassigned`). Storico Offer/Assignment conservato. Budget ricalcolato.

## 38. Partial completion

Service eseguito solo in parte. Stati dedicati; settlement adjustment via SFOF. Economia di dettaglio: **OPEN**.

## 39. Evidence

Prove (timestamp, geo, foto policy, note, messaggi) su arrival, no-show, dispute, holdback, completion critica. Qualità Evidence governa contestazioni.

## 40. Audit trail

Ogni transizione rilevante di Booking/Service/Assignment/Trip/Cancellation genera record audit (chi, quando, da→a, motivo, correlazione eventi). Append-only.

## 41. Booking state machine

Stati canonici (concettuali):

`draft/requested → quoted → confirmed → in_progress → completed → financially_closed`

Rami: `cancelled` (da confirmed/in_progress secondo policy); `expired` su Quote non accettata (pre-Booking).

**Separata** da Service/Assignment/Trip.

## 42. Service state machine

`planned → ready → in_execution → completed | partial | cancelled`

Un Service non eredita automaticamente lo stato Trip granulare.

## 43. Assignment state machine

`pending → offered → accepted → active → completed`

Rami: `rejected`, `expired`, `cancelled`, `reassigned`.

Mode INTERNAL può saltare `offered` se assegnazione diretta.

## 44. Operational state machine

Trip: `scheduled → en_route → arrived → ongoing → completed`

Rami: `no_show_customer`, `no_show_driver`, `cancelled`, `disrupted`.

Mai usata come unico stato del Booking.

## 45. Cancellation state machine

`cancel_requested → cancel_under_review → cancel_approved | cancel_rejected → cancelled_settled`

`cancelled_settled` indica allineamento con line item SFOF, non fusione con payout.

## 46. Recovery workflow

1. Evento anomalo (no-show, delay critico, disruption)
2. Classificazione responsabile
3. Raccolta Evidence
4. Scelta recovery (reassign / Exchange / cancel / wait)
5. Comunicazioni (MC-OS-016)
6. Recovery Cost / adjustment
7. Chiusura o Dispute

Automazione dove deterministic; umano su ambiguità.

## 47. Permissions

Chi può creare/modificare/cancellare/vedere Booking e Assignment è definito in MC-OS-015. Qui: Dispatcher su coda operativa del proprio scope; Partner solo Assignment/Service propri; Customer su propri Booking; Platform Admin su override auditati.

## 48. Events

Catalogo minimo: `request_created`, `quote_issued`, `quote_accepted`, `booking_confirmed`, `service_created`, `assignment_offered`, `assignment_accepted`, `trip_en_route`, `trip_arrived`, `trip_completed`, `cancellation_*`, `no_show_*`, `recovery_*`, `reassignment_*`.

## 49. Alerts

Esempi: unassigned near pickup T; offer timeout; budget breach attempt; delay oltre soglia config; no-show risk; cancel post-accept; Exchange UNFILLED near deadline.

## 50. KPI

On-time pickup/completion; time-to-assign; offer accept rate; cancel rate; no-show rate; reassignment rate; recovery success rate; % Assignment INTERNAL vs PARTNER.

## 51. Decision Engine

| Tipo | Esempi |
|------|--------|
| Automatiche | Blocco accept over budget; expire Quote/Offer |
| Configurabili | Soglie alert delay; finestre cancel |
| Manuali | Override Dispatcher; classificazione dispute |

Soglie numeriche non fissate qui.

## 52. Decisioni approvate

| ID | Decisione |
|----|-----------|
| BSL-DA-01 | Booking ≠ Service ≠ Trip ≠ Assignment |
| BSL-DA-02 | State machine separate obbligatorie |
| BSL-DA-03 | INTERNAL XOR PARTNER sui costi di esecuzione |
| BSL-DA-04 | Maximum Assignment Budget enforced |
| BSL-DA-05 | Evidence + audit su eventi critici |
| BSL-DA-06 | Umano sulle eccezioni; automazione sul flusso ordinario |
| BSL-DA-07 | Exchange policy quando origine/copertura Exchange |

## 53. Decisioni OPEN

| Tema | Riferimento |
|------|-------------|
| Policy cancel / penali % | DECISIONS #3 |
| Acconto / rimborso | DECISIONS #2 |
| Default manual vs offer assignment | DECISIONS #7 |
| Timeout Driver/Partner accept | — |
| Soglie delay alert | — |
| Economia partial completion | — |
| Split billing multi-service | — |

## 54. Roadmap

1. **Foundation** — entità e state machine ufficiali
2. **Ops hardening** — recovery, evidence, alert
3. **Exchange integration** — lifecycle allineato MC-OS-012
4. **Analytics** — KPI e Decision Engine configurabile

---

## Cronologia revisioni

| Versione | Data | Autore | Descrizione modifica | Stato |
|----------|------|--------|----------------------|-------|
| 0.1.0 | 2026-07-26 | MyChauffeur OS Team | Prima stesura Booking & Service Lifecycle Framework. | Draft |

---

*Fine MC-OS-014 v0.1.0 — Draft.*

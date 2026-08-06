# MyChauffeur OS — Notification & Communication Framework

| Campo | Valore |
|-------|--------|
| **Codice documento** | MC-OS-016 |
| **Titolo** | Notification & Communication Framework |
| **Versione** | 0.1.0 |
| **Stato** | Draft |
| **Data creazione** | 2026-07-26 |
| **Ultima modifica** | 2026-07-26 |
| **Owner** | Communications & Customer Operations |
| **Autori** | MyChauffeur OS Team |
| **Documenti correlati** | MC-OS-000 · MC-OS-001 · MC-OS-006 · MC-OS-009 · MC-OS-012 · MC-OS-014 · MC-OS-015 · MC-OS-018 · PLATFORM_MAP · HANDOFF |
| **Dipendenze** | Booking Lifecycle; Identity; SFOF; Partner Exchange; Decisions Pending |
| **Classificazione** | Official Domain Framework — Draft |
| **Documentation Release** | 0.1 (allineamento previsto) |

---

## Avvertenza

Questo documento è un **framework ufficiale di dominio**.
Non è contratto, non è codice, **non sceglie provider** di messaging, non è specifica API.

I nomi di entità, stati, eventi, campi e concetti software restano in **inglese**. Il testo normativo è in **italiano**.

---

## Source of Truth

Questo documento (MC-OS-016) è la Source of Truth di **Notification & Communication**.

---

## 1. Scopo

Definire comunicazioni automatiche e manuali tra Customer, Corporate, Agency, Partner, Driver, Dispatcher e Platform Operations.

**Source of Truth:** MC-OS-016 per Notification & Communication. Non sceglie provider (DECISIONS #8 OPEN). Non sostituisce lifecycle Booking (MC-OS-014) né Identity (MC-OS-015).

## 2. Principi

| ID | Principio |
|----|-----------|
| NCF-01 | Event-driven per comunicazioni transazionali |
| NCF-02 | Separazione transactional vs promotional |
| NCF-03 | Consent e data minimization |
| NCF-04 | Fallback channel senza spam |
| NCF-05 | Masked communication dove richiesto |
| NCF-06 | Template versionati e localizzati |
| NCF-07 | Nessuna scelta provider in questo draft |
| NCF-08 | Audit di invio/consegna/lettura dove disponibile |

## 3. Communication channels

Canali previsti a livello di framework: Email, SMS, WhatsApp, Push, In-app, Internal message. Abilitazione per paese/canale = Configuration. Provider = **OPEN**.

## 4. Email

Canale primario per conferma Booking, Invoice, settlement summary, dispute. Richiede template versioning e locale.

## 5. SMS

Canale ad alta priorità per pickup imminente, delay critico, OTP se previsto. Minimizzare PII nel testo.

## 6. WhatsApp

Canale opzionale dove legalmente e tecnicamente abilitato. Stesse regole consent/transactional. Provider **OPEN**.

## 7. Push Notification

Per app Driver/Customer/Dispatcher. Deep link a risorsa autorizzata (MC-OS-015).

## 8. In-app notification

Centro notifiche autenticato; persistenza e read status. Complementare ai canali push/email.

## 9. Internal message

Messaggi operativi tra Dispatcher, Driver, Platform Ops, Partner Ops. Possono essere masked verso Customer.

## 10. Masked communication

Proxy/mascheramento numeri o contatti per proteggere PII tra Passenger e Driver/Partner, specialmente in Exchange e Progressive Disclosure.

## 11. Booking communication

Eventi: Quote, conferma, reminder pre-service, aggiornamenti stato. Destinatari secondo Booker vs Passenger.

## 12. Payment communication

Richiesta pagamento, esito, fallimento, ricevuta. Nessun dato carta completo nei template. Provider payment **OPEN** (DECISIONS #1).

## 13. Assignment communication

Offer ricevuta, accept/reject, reassignment, timeout. Destinatari: Partner/Driver/Dispatcher.

## 14. Driver communication

Nuova missione, aggiornamenti, alert no-show risk, istruzioni pickup. Scope dati minimizzato.

## 15. Passenger communication

Driver en route, arrived, delay, istruzioni meeting point. Booker può ricevere copia secondo preferenze.

## 16. Partner Exchange communication

Listing published, offer, counteroffer, accept, UNFILLED, disclosure unlock, dispute. Customer Price non esposto all’Executing nelle notifiche di default.

## 17. Progressive Data Disclosure notifications

Notifiche di unlock fasi dati (post-accept, T-minus, en-route) verso Executing Partner/Driver, con audit.

## 18. Delay communication

Avvisi delay tipizzati a Customer/Booker e ops. Soglie **OPEN**.

## 19. Cancellation communication

Conferma cancel, esito policy, next steps. Distinta da no-show.

## 20. No-show communication

Notifica classificazione no-show a parti rilevanti; richiesta Evidence se prevista.

## 21. Recovery communication

Reassignment, nuovo ETA, opzioni Customer, aggiornamento Partner.

## 22. Dispute communication

Apertura, Evidence request, esito, contestazione Holdback (SFOF/Partner).

## 23. Settlement and payout communication

Settlement ready, payout scheduled/sent/failed, holdback reason. Solo destinatari autorizzati (MC-OS-015).

## 24. Invoice communication

Emit/send Invoice e reminder. Regime fiscale/MoR = **OPEN** (BOS).

## 25. Marketing communication

Promozionale: solo con Consent e opt-out. Mai mescolare con template transazionali critici.

## 26. Transactional vs promotional

| Tipo | Esempi | Consent |
|------|--------|---------|
| Transactional | Booking confirm, delay, payout | Necessario al servizio |
| Promotional | Promo, newsletter | Opt-in / soft opt-in secondo legge |

Non usare canali promozionali per bypassare quiet hours su emergenze ops (policy distinta).

## 27. Consent

Registro Consent per canale e finalità. Revoca promozionale non blocca transazionali essenziali.

## 28. Language and locale

Locale da preferenza User/Booking (`it`, `en`, …). Lingue go-live oltre IT/EN: **OPEN** (DECISIONS #9).

## 29. Timezone

Timestamp e reminder calcolati su timezone Service/pickup e preferenza destinatario dove disponibile.

## 30. Template versioning

Ogni template ha `template_id` + version. Modifiche material → nuova version; audit chi pubblica.

## 31. Event-driven notifications

Producer: eventi dominio (MC-OS-014/012/006). Consumer: Notification Engine. Idempotenza e dedup richiesti.

## 32. Retry

Retry con backoff su failure provider. Limite tentativi; poi fallback o alert ops. Dettaglio numeri **OPEN**.

## 33. Fallback channel

Se canale primario fallisce: fallback ordinato (es. Push→SMS→Email) secondo priorità e Consent.

## 34. Delivery status

Stati: `queued`, `sent`, `delivered`, `failed`, `bounced`. Persistenza per audit KPI.

## 35. Read status

Dove il canale lo consente (in-app): `read` / `unread`. Non obbligatorio su SMS.

## 36. Escalation

Mancata delivery critica → canale alternativo e/o alert Dispatcher/Platform Ops.

## 37. Quiet hours

Finestre di silenzio per promotional e reminder non critici. Transazionali safety-critical possono bypassare secondo policy paese.

## 38. Priority

`low | normal | high | critical`. Critical: delay grave, safety, payout failed, no-show.

## 39. Recipient rules

Regole Booker vs Passenger vs Travel Manager vs Partner contacts. Evitare fan-out non necessario.

## 40. Data minimization

Nei template: solo dati necessari allo scopo. Niente Customer Price verso Executing di default.

## 41. Retention

Retention log comunicazioni e contenuti secondo obblighi legali/compliance — dettagli **OPEN**.

## 42. Audit log

Chi ha inviato (system/user), template version, destinatario mascherato, evento trigger, delivery status.

## 43. Notification events

`notification_queued`, `notification_sent`, `notification_delivered`, `notification_failed`, `notification_read`, `consent_updated`, `template_published`.

## 44. Alerts

Spike failure rate; bounce; provider outage; quiet-hours misconfiguration; missing template locale.

## 45. KPI

Delivery rate; time-to-notify; failure rate; consent coverage; % masked channel usage; escalation rate.

## 46. Decision Engine

| Tipo | Esempi |
|------|--------|
| Automatiche | Trigger da eventi; dedup |
| Configurabili | Quiet hours; fallback order |
| Manuali | Messaggio ops one-off |

Provider selection = **OPEN**.

## 47. Decisioni approvate

| ID | Decisione |
|----|-----------|
| NCF-DA-01 | Event-driven transactional |
| NCF-DA-02 | Transactional ≠ promotional |
| NCF-DA-03 | Masked communication dove richiesto |
| NCF-DA-04 | Template versioning + locale |
| NCF-DA-05 | Nessuna scelta provider in questo draft |
| NCF-DA-06 | Data minimization / no Customer Price a Executing by default |

## 48. Decisioni OPEN

| Tema | Riferimento |
|------|-------------|
| Provider Email/SMS/Push/WhatsApp | DECISIONS #8 |
| Lingue oltre IT/EN | DECISIONS #9 |
| Soglie retry/quiet hours | — |
| Retention dettagliata | Legal |

## 49. Roadmap

1. Catalogo eventi → template
2. Canali transactional core
3. Consent & quiet hours
4. Exchange + disclosure notifications
5. KPI/audit hardening

---

## Cronologia revisioni

| Versione | Data | Autore | Descrizione modifica | Stato |
|----------|------|--------|----------------------|-------|
| 0.1.0 | 2026-07-26 | MyChauffeur OS Team | Prima stesura Notification & Communication Framework. | Draft |

---

*Fine MC-OS-016 v0.1.0 — Draft.*

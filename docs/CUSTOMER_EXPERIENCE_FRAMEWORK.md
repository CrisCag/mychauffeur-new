# MyChauffeur OS — Customer Experience Framework

| Campo | Valore |
|-------|--------|
| **Codice documento** | MC-OS-018 |
| **Titolo** | Customer Experience Framework |
| **Versione** | 0.1.0 |
| **Stato** | Draft |
| **Data creazione** | 2026-07-26 |
| **Ultima modifica** | 2026-07-26 |
| **Owner** | Customer Experience & Service Design |
| **Autori** | MyChauffeur OS Team |
| **Documenti correlati** | MC-OS-000 · MC-OS-001 · MC-OS-002 · MC-OS-009 · MC-OS-011 · MC-OS-014 · MC-OS-015 · MC-OS-016 · MC-OS-017 · PLATFORM_MAP · HANDOFF |
| **Dipendenze** | Booking Lifecycle; Notification; Pricing; Identity; Glossary; Entity Model |
| **Classificazione** | Official Domain Framework — Draft |
| **Documentation Release** | 0.1 (allineamento previsto) |

---

## Avvertenza

Questo documento è un **framework ufficiale di dominio**.
Non è contratto, non definisce termini legali definitivi né promesse assolute non validate, non è codice né specifica API.

I nomi di entità, stati, eventi, campi e concetti software restano in **inglese**. Il testo normativo è in **italiano**.

---

## Source of Truth

Questo documento (MC-OS-018) è la Source of Truth dell’**esperienza end-to-end del cliente** nei segmenti Consumer B2C, B2B, Agency, Corporate e ruoli Booker/Passenger/Travel Manager/Concierge/Hotel/Tour Operator.

Non sostituisce i lifecycle operativi (MC-OS-014), le policy economiche (MC-OS-017) o le comunicazioni (MC-OS-016).

---

## 1. Scopo

Definire l’esperienza cliente end-to-end e gli standard di servizio percepito, distinguendo tipi di Customer e ruoli di prenotazione/viaggio, senza fondere Booking/Service/Trip.

## 2. Principi

| ID | Principio |
|----|-----------|
| CX-01 | Booker ≠ Passenger quando distinti |
| CX-02 | Chiarezza stato senza sovraccarico informativo |
| CX-03 | Progressive disclosure anche verso Customer dove utile |
| CX-04 | Nessuna promessa assoluta non validata legalmente |
| CX-05 | Accessibilità e preferenze come requisiti di design |
| CX-06 | Self-service dove sicuro; umano sulle eccezioni |
| CX-07 | Coerenza B2C vs B2B/Corporate nelle policy comunicate |
| CX-08 | Privacy e data minimization |

## 3. Customer types

Consumer B2C, B2B Customer, Agency, Corporate Account (come soggetto), più ruoli operativi sul journey (Booker, Passenger, Travel Manager, Concierge, Hotel, Tour Operator).

## 4. Booker vs Passenger

**Booker** crea/gestisce il Booking; **Passenger** fruisce del Service. Possono coincidere (B2C tipico) o divergere (Corporate/Agency/Hotel). Comunicazioni e permission seguono il ruolo.

## 5. Consumer

Cliente persona fisica B2C: funnel Request→Quote→pay/confirm→pre-service→Trip→post-service. Lingua/UX da preferenze.

## 6. B2B Customer

Cliente business non necessariamente Agency: condizioni nette/fatturazione secondo accordo. Journey può includere approvazioni interne.

## 7. Agency

Intermediario che booka per end customer. Vede net rates e tool Agency; end Passenger riceve comunicazione operativa minimizzata.

## 8. Corporate Account

Account aziendale con policy viaggio, utenti interni, billing. Priorità e SLA possono differire dal B2C (dettaglio **OPEN**).

## 9. Travel Manager

Ruolo Corporate: governa policy, approvazioni, report. Non necessariamente Passenger.

## 10. Concierge

Booker per conto terzi (hotel desk / concierge). Serve UX rapida e dati Passenger chiari.

## 11. Hotel

Canale/struttura che genera Booking per ospiti. Integrazione e branding white-label possibili; economics in MC-OS-017.

## 12. Tour Operator

Booker multi-service / gruppi. Multi-service Booking e clarity su stop/ritorni essenziali.

## 13. Customer onboarding

Registrazione User, verifica dove richiesta, preferenze base. Guest path senza forzare account (§14).

## 14. Guest booking

Booking senza account permanente; correlazione via email/telefono con minimization. Conversione a registered opzionale.

## 15. Registered booking

Booking con User autenticato: storico, preferenze, repeat.

## 16. Corporate booking

Flusso sotto Corporate Account: policy check, eventuale approval Travel Manager, billing account.

## 17. Agency booking

Flusso Agency con net rate e riferimenti end customer/Passenger.

## 18. Booking journey

Fasi CX: intent → dati servizio → Quote → review → confirm → tracking → post. Stati mostrati al Customer sono una **proiezione** dei lifecycle MC-OS-014, non una fusione entità.

## 19. Quote journey

Trasparenza componenti rilevanti (senza overload); expiry visibile; accept chiaro. Dettagli tariffari allineati NCC/Pricing.

## 20. Payment journey

Metodi e acconti secondo policy **OPEN** (DECISIONS #1–#2). Messaggi di esito chiari; no false guarantee di disponibilità oltre policy.

## 21. Confirmation

Conferma Booking con dettagli essenziali pickup, Passenger, veicolo category, contatti support. Evento `booking_confirmed`.

## 22. Pre-service

Reminder, istruzioni meeting point, richiesta doc/voli se previsti, preferenze accessibilità.

## 23. Pickup

CX su en_route/arrived: ETA, identificazione Driver/Vehicle secondo disclosure, canale contatto masked.

## 24. On-board experience

Aspettative comfort/professionalità; gestione stop; comunicazione proattiva su variazioni.

## 25. Waiting experience

Informare franchigia/waiting policy in modo non fuorviante; importi solo se già policy approvata (altrimenti placeholder).

## 26. Service modification

Self-service limitato a modifiche non material; material → assistito/re-quote. Chiarezza impatto prezzo.

## 27. Delay

Comunicazione tempestiva causa tipizzata e nuovo ETA; opzioni se disruption.

## 28. Cancellation

UX cancel con conseguenze secondo policy **OPEN**; conferma esito; alternative se disponibili.

## 29. No-show

Spiegazione processo e Evidence; evitare linguaggio punitivo non supportato da policy approvata.

## 30. Recovery

Opzioni Customer (wait/reassign/cancel) comunicate chiaramente; tracking nuovo Assignment.

## 31. Post-service

Ricevuta/summary, follow-up, CTA rating. Chiusura CX distinta da `financially_closed`.

## 32. Rating

Feedback strutturato su Service/Driver/esperienza. Impatto Partner Score secondo framework Partner — pesi **OPEN**.

## 33. Complaint

Canale reclamo tipizzato; SLA risposta **OPEN**; escalation support.

## 34. Dispute

Dispute su charge/quality/no-show: Evidence, stati, comunicazione (MC-OS-016). Non chiude legalmente da sola.

## 35. Refund

Percorsi refund secondo policy **OPEN**; no double-count con compensation/recovery (BOS/SFOF).

## 36. Voucher

Strumento commerciale di ristoro/promo; regole stacking **OPEN**.

## 37. Credit

Credito account (Corporate/Consumer) distinto da voucher campaign.

## 38. Loyalty

Programma loyalty eventuale — non promettere benefici non approvati. Design futuro.

## 39. Repeat booking

Riuso preferenze, indirizzi, Passenger frequenti; one-click dove sicuro.

## 40. Customer profile

Dati anagrafici, contatti, storico Booking, preferenze. Accesso secondo MC-OS-015.

## 41. Preferences

Lingua, canali notifica, veicolo, temperatura, note Driver — nel rispetto privacy.

## 42. Accessibility

Requisiti accessibilità veicolo/assistenza; raccolta early nel Quote journey.

## 43. Child seat

Richiesta child seat come capability servizio; conferma disponibilità prima del confirm quando material.

## 44. Luggage

Dichiarazione bagagli; vincoli Vehicle Category; extra policy **OPEN**.

## 45. Language

Locale UI e comunicazioni; Driver language preference best-effort. Lingue go-live **OPEN** (DECISIONS #9).

## 46. Privacy

Minimization, purpose limitation, diritti interessato. Allineamento Progressive Disclosure.

## 47. Data disclosure

Cosa vede Customer su Driver/Vehicle e quando; cosa non viene mostrato (es. economics Partner).

## 48. Customer support

Canali support; correlazione `booking_id`; handoff a Dispatcher su ops live.

## 49. SLA

Target risposta/support e recovery communication — valori numerici **OPEN**. Non pubblicare SLA assoluti non approvati.

## 50. B2C vs B2B policies

Differenze tipiche: pagamento, cancel, fatturazione, approval. Comunicare la policy del canale corretto.

## 51. Corporate priority

Eventuale priorità operativa Corporate — regole **OPEN**; non degradare safety.

## 52. Service guarantees

Garanzie solo se approvate legalmente/commercialmente. Evitare claim assoluti (“sempre in orario”).

## 53. Communication standards

Tono chiaro, non legale-improvisato; allineamento template MC-OS-016; quiet hours rispettate salvo critical.

## 54. Customer journey states

Proiezione CX (es. `browsing`, `quoted`, `confirmed`, `driver_assigned`, `en_route`, `completed`, `support_open`).
Mappate ai lifecycle MC-OS-014 **senza** sostituire Booking/Service/Trip/Assignment states.

## 55. Events

`cx_quote_viewed`, `cx_booking_confirmed_view`, `cx_tracking_opened`, `cx_rating_submitted`, `cx_complaint_opened`, `cx_refund_requested`, `cx_preference_updated`.

## 56. Alerts

Customer unreachable; rating drop spike; complaint surge; failed confirmation delivery; accessibility request unmet near T.

## 57. KPI

CSAT/NPS (se adottati); on-time perceived; complaint rate; repeat rate; self-service resolution; notification engagement.

## 58. Decision Engine

Automatiche: reminder, template trigger. Configurabili: SLA thresholds quando approvati. Manuali: goodwill voucher/credit con audit e guardrail pricing.

## 59. Decisioni approvate

| ID | Decisione |
|----|-----------|
| CX-DA-01 | Booker ≠ Passenger quando distinti |
| CX-DA-02 | Journey states = proiezione, non fusione entità |
| CX-DA-03 | Nessuna promessa assoluta non validata |
| CX-DA-04 | Privacy + minimization |
| CX-DA-05 | Self-service sul ordinario; umano sulle eccezioni |
| CX-DA-06 | Allineamento comunicazioni a MC-OS-016 |

## 60. Decisioni OPEN

| Tema | Riferimento |
|------|-------------|
| Cancel/refund customer-facing | DECISIONS #2–#3 |
| Payment methods UX | DECISIONS #1 |
| Lingue | DECISIONS #9 |
| SLA numerici support | — |
| Loyalty | — |
| Corporate priority rules | — |

## 61. Roadmap

1. Journey B2C core
2. Booker≠Passenger + Agency/Corporate
3. Tracking & recovery CX
4. Support/complaint/dispute UX
5. Accessibility & preference depth

---

## Cronologia revisioni

| Versione | Data | Autore | Descrizione modifica | Stato |
|----------|------|--------|----------------------|-------|
| 0.1.0 | 2026-07-26 | MyChauffeur OS Team | Prima stesura Customer Experience Framework. | Draft |

---

*Fine MC-OS-018 v0.1.0 — Draft.*

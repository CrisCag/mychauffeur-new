# Motore tariffario NCC — requisiti di prodotto

Documento allegato a `PLATFORM_MAP.md`.  
**Stato:** requisiti ufficiali — **non implementati** nel codice (salvo voci esplicitamente marcate come parziali).

Ultimo aggiornamento: 2026-07-07

---

## 1. Modello economico a tre livelli

Ogni preventivo / corsa deve poter esprimere, in modo auditabile:

| Livello | Descrizione | Uso |
|---------|-------------|-----|
| **Prezzo al cliente** | Importo mostrato e fatturato al passeggero o all’agenzia | Booking, pagamenti, ricevute |
| **Costo assegnato** | Compensazione base per driver diretto o partner NCC | Settlement, margini |
| **Margine lordo piattaforma** | Prezzo cliente − costo assegnato − pass-through (pedaggi, ecc.) | Report, pricing guard |
| **Commissione piattaforma** | % o importo fisso trattenuto dalla piattaforma | Contratti partner |
| **Commissione partner** | % trattenuta dal partner sul driver subordinato | Portale partner |

**Dipendenze:** motore pricing unificato, tabelle `pricing_rules`, `partner_contracts`, `trip_settlements`, admin tariffe.

---

## 2. Stato attuale nel codice (solo riferimento)

| Voce | Stato codice | File |
|------|--------------|------|
| Base + km + soste catalogo | Parziale | `lib/platform/trip-pricing.ts` |
| Moltiplicatori sedan / van / luxury | Parziale | `lib/platform/vehicle-pricing-multipliers.ts` |
| Attesa fermate (bande orarie) | Parziale | `lib/platform/wait-time-pricing.ts`, `data/wait-time-rates.json` |
| VIP No Rush +18% | Parziale | `lib/platform/comfort-mode.ts` |
| Attesa pickup (timer operativo) | Parziale (ops, non nel preventivo booking) | `lib/platform/wait-timer.ts`, migration `wait_policy_profiles` |
| Deviazione percorso (`costoDeviazione`) | Campo presente, sempre 0 | `trip-pricing.ts` |
| Costo driver / commissioni / margine minimo | Assente | — |

---

## 3. Regole configurabili (requisiti futuri)

Per ogni regola: **priorità**, **dipendenze**, **note**.

| Regola | Priorità | Dipendenze | Note |
|--------|----------|------------|------|
| **Minimo servizio** | Critica | `pricing_rules`, admin | Importo minimo per tratta o fascia km |
| **Km inclusi** | Alta | pricing engine, vehicle class | Oltre soglia → extra km |
| **Ore incluse** | Alta | pricing engine | Servizi a disposizione / multi-stop |
| **Extra km** | Alta | Google Directions o odometro | Tariffa per fascia veicolo |
| **Extra ore** | Alta | wait + disposal modules | Allineare a NCC tradizionale |
| **Maggiorazione notturna** | Alta | fasce orarie config | Oggi solo su attesa fermate, non su transfer base |
| **Maggiorazione festiva / prefestiva** | Alta | calendario festività IT | Configurabile per regione |
| **Attesa aeroporto** | Alta | `wait_policy_profiles`, pickup type | Seed `airport_fco` in migration |
| **Attesa cliente** (pickup + fermate) | Alta | wait timer + pricing | Collegare preventivo e ops |
| **Pedaggi** | Media | input manuale o API | Pass-through o markup |
| **ZTL** | Media | geofencing / tariffa fissa | Per città |
| **Parcheggi** | Media | prove / flat rate | Spesso pass-through |
| **Traghetti** | Bassa-media | tratte speciali | Preventivo manuale spesso |
| **Rientro a vuoto** | Alta | deadhead km da base autista | Critico per margini |
| **Diarie** | Media | multi-giorno | Pacchetti giornalieri |
| **Servizi a disposizione** | Media | hourly product | Non nel funnel attuale |
| **Servizi multi-giorno** | Bassa | booking esteso | Fuori scope MVP |
| **Minibus e coach** | Media | nuova vehicle class | Oggi solo sedan/van/luxury |
| **Margine minimo** | Critica | admin alert | Blocco conferma se sotto soglia |
| **Preventivo manuale** | Alta | dispatch + admin | Itinerari complessi, fuori motore auto |

---

## 4. Classi veicolo target

| Classe | Booking oggi | Target NCC |
|--------|--------------|------------|
| Berlina (sedan) | Sì | Sì |
| Van | Sì | Sì |
| Luxury | Sì (book) / `other` (homepage widget) | Sì |
| Minibus | No | Da definire |
| Coach | No | Da definire |

**Debito:** allineare `vehicleType` tra homepage (`sedan|van|other`) e funnel (`sedan|van|luxury`).

---

## 5. Fasi di implementazione consigliate (solo prodotto)

1. **Fase 3 roadmap** — documentare matrice in admin; minimo servizio + notturno/festivo su transfer base  
2. **Post-pagamenti** — pass-through pedaggi/ZTL/parcheggi su settlement  
3. **Partner** — commissioni e costo assegnato per contratto  

---

## 6. Incertezze da risolvere (vedi `docs/DECISIONS_PENDING.md`)

- Policy acconto e cancellazione vs penali attesa  
- Commissione piattaforma default su B2C vs B2B  
- Modello partner (sub-affiliazione vs marketplace puro)

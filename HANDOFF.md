# Handoff — MyChauffeur.it

**Documento di passaggio operativo** per riprendere il lavoro senza reinterpretare il repository.

| Campo | Valore |
|-------|--------|
| Ultimo aggiornamento | **2026-07-07** |
| Fase corrente | **2a avanzata** (booking Daytrip in locale) → prossima: **Fase 0** (stabilizzazione) |
| Riferimenti | [`PLATFORM_MAP.md`](PLATFORM_MAP.md) · [`docs/NCC_TARIFF_REQUIREMENTS.md`](docs/NCC_TARIFF_REQUIREMENTS.md) · [`docs/DECISIONS_PENDING.md`](docs/DECISIONS_PENDING.md) |

Aggiornare questo file dopo ogni sessione significativa o su comando **mi fermo**.

---

## Ripresa rapida (30 secondi)

```bash
cd ~/progetti/mychauffeur-new
npm run dev
# → http://127.0.0.1:3002/it
```

- **Repo attivo:** `mychauffeur-new` — non lavorare in `daytrip-clone` senza ordine esplicito  
- **`.env.local`:** `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, `GOOGLE_MAPS_API_KEY` (stessa chiave); SMTP opzionale  
- **Cookie funzionali:** necessari per mappa Google e autocomplete  
- **Supabase:** progetto MyChauffeurUmbria in pausa — in dev prevale **JSON** in `data/`

---

## 1. Stato reale del progetto

**Next.js full-stack** (App Router, React 19, TypeScript): frontend e backend nello stesso repo (`app/`, `app/api/`, `lib/`).

| Area | Stato |
|------|--------|
| Sito marketing IT/EN | Operativo |
| Funnel booking + preventivo | Operativo in locale (homepage → `/book` → invio richiesta) |
| Google Places (autocomplete server) | Operativo con chiave + cookie |
| Geocoding / Directions / mappa | Operativo (route preview, calcolo km) |
| Motore prezzi attuale | Operativo — modello **Daytrip semplificato** (base + km + soste + attesa fermate + moltiplicatore veicolo + VIP 18%) |
| POI | Statici + fallback Supabase limitato; **senza** filtro “sul percorso” |
| Portale driver | MVP web (`/it/driver`) — **senza login** |
| Persistenza | **JSON** in `data/`; Supabase **opzionale** (quote se configurato) |
| Auth / RLS / admin | **Assenti** |
| Pagamenti | **Assenti** (solo testo informativo in UI) |
| Test automatici | **Assenti** |

---

## 2. Cosa è operativo, MVP o mancante

### ✅ Operativo (puoi usarlo / testarlo)

- Widget prenotazione homepage, autocomplete indirizzi, calcolo preventivo  
- `/book`: fermate (catalogo + custom), veicolo, contatto, mappa, riepilogo laterale  
- Salvataggio richiesta in `data/booking-requests.json` + email se SMTP  
- VIP No Rush, ritorno, B2B → email partners  

### 🟡 MVP incompleto (non considerare “production-ready”)

- Portale autista — API `trip-ops` aperte, `DEFAULT_DRIVER_ID`  
- Timer attesa — logica in codice; DB migration non applicata in dev  
- POI suggeriti — nessun filtro rotta Daytrip  
- Quote Supabase — solo se env configurato  
- Allineamento veicoli homepage (`other`) vs book (`luxury`)  

### ❌ Non ancora sviluppato

- Login (admin, dispatcher, driver, partner)  
- `app/admin/` gestionale  
- Pagamenti / webhook / rimborsi  
- Dispatch (coda, offerte, accept/reject)  
- Portale partner  
- Motore tariffario NCC completo (vedi allegato NCC)  
- Test, logging centralizzato, RLS  

Dettaglio tabellare: `PLATFORM_MAP.md` → sezione **Cosa esiste oggi**.

---

## 3. Architettura — file da conoscere prima di toccare codice

### Booking (flusso cliente)

| Ruolo | Percorso |
|-------|----------|
| Widget homepage | `components/sections/booking-widget.tsx` |
| Funnel 3 step | `components/booking/book-flow-client.tsx` (~970 righe — fragile) |
| Stato sessione | `lib/booking-flow-storage.ts` (sessionStorage) |
| Riepilogo UI | `components/booking/booking-summary-panel.tsx` |
| Autocomplete | `components/booking/address-autocomplete.tsx` |
| Mappa | `components/booking/trip-route-map.tsx` |
| Pagina | `app/[locale]/book/page.tsx` |
| Invio richiesta | `app/api/booking/route.ts` |
| Persistenza richieste | `lib/booking-requests.ts` → `data/booking-requests.json` |

### Pricing

| Ruolo | Percorso |
|-------|----------|
| Motore principale | `lib/platform/trip-pricing.ts` |
| Calcolo API | `app/api/trips/calculate/route.ts` |
| Geocoding / distanza | `lib/platform/pricing-engine.ts` |
| Attesa fermate | `lib/platform/wait-time-pricing.ts`, `data/wait-time-rates.json` |
| VIP | `lib/platform/comfort-mode.ts`, `data/comfort-mode-config.json` |
| Moltiplicatori veicolo | `lib/platform/vehicle-pricing-multipliers.ts` |
| Tipi | `types/trip.ts` |

### API (tutte in `app/api/`)

`trips/calculate` · `booking` · `points-of-interest` · `route-preview` · `places/autocomplete` · `places/details` · `wait-time-rates` · `comfort-mode` · `trip-ops` · `trip-ops/[id]`

### Persistenza JSON

| File | Contenuto |
|------|-----------|
| `data/booking-requests.json` | Richieste prenotazione |
| `data/operational-trips.json` | Corse operative + wait + GPS |
| `data/wait-time-rates.json` | Tariffe attesa fermate |
| `data/comfort-mode-config.json` | Markup VIP |

### Supabase

| Ruolo | Percorso |
|-------|----------|
| Client admin | `lib/platform/supabase-admin.ts` |
| Quote (se DB ok) | `lib/platform/quotes.ts` |
| Migration trip-ops (repo) | `supabase/migrations/202606240001_trip_ops_driver_client.sql` |
| Note | `supabase/README.md` |

**Incertezza:** tabelle `quotes`, `pricing_rules`, `points_of_interest` usate nel codice ma **non** nel file migration del repo — possono esistere già su Supabase dopo restore.

### Portale driver

`app/[locale]/driver/` · `components/driver/*` · `lib/platform/trip-ops-store.ts` · `lib/platform/trip-status-machine.ts` · `lib/platform/wait-timer.ts`

### i18n

`lib/i18n-config.ts` (solo `it`, `en`) · `messages/it.ts` · `messages/en.ts` · `messages/types.ts` — **ogni nuova stringa va in tutti e tre**

### POI

`lib/platform/static-pois.ts` · `lib/platform/poi-query.ts` · `app/api/points-of-interest/route.ts`

### Trip operations

`lib/platform/trip-ops-store.ts` · `app/api/trip-ops/*` · `types/trip-ops.ts`

### Altro

- Redirect legacy: `proxy.ts`  
- Backup locale: `scripts/backup-project.sh`  
- Archivio import: `~/progetti/daytrip-clone` (non cancellare)

---

## 4. Regole operative obbligatorie (prossime modifiche)

1. **Analisi read-only** — leggere file coinvolti e `PLATFORM_MAP.md` prima di editare  
2. **Piano** — per pricing, booking, auth, DB, pagamenti: piano scritto e approvazione  
3. **Branch Git dedicato** — es. `feature/fase-0-tests`, non lavorare feature grandi su `main` senza accordo  
4. **Milestone** — una capability per volta; evitare refactor multipli nella stessa PR  
5. **Build e test** — `npm run build` dopo ogni milestone; introdurre test in Fase 0  
6. **Commit** — piccoli, descrittivi; push solo se richiesto o su **mi fermo**  
7. **Documentazione** — nessuna modifica strutturale a **pricing**, **booking**, **auth**, **database** o **pagamenti** senza aggiornare `PLATFORM_MAP.md` e allegati correlati  
8. **Decisioni** — non implementare voci in `docs/DECISIONS_PENDING.md` marcate “blocca” finché non approvate  

### Tu (proprietario)

| Quando | Azione |
|--------|--------|
| Avvio sessione | Apri `mychauffeur-new` in Cursor; leggi questo file |
| Test locale | `npm run dev` → http://127.0.0.1:3002/it |
| Decisioni prodotto | Approva righe in `docs/DECISIONS_PENDING.md` |
| Stop | Scrivi **mi fermo** → commit/backup secondo protocollo in `PLATFORM_MAP.md` |

### Agente

- Segue fasi in `PLATFORM_MAP.md`  
- Non tocca `daytrip-clone` senza ordine  
- Aggiorna `HANDOFF.md` + checkpoint in `PLATFORM_MAP.md` a fine sessione significativa  

---

## 5. Roadmap (stato sintetico)

| Fase | Obiettivo | Stato |
|------|-----------|--------|
| **0** | Stabilizzazione: doc, test unit/API, smoke booking, protezione `trip-ops`, backup/Git | **In corso** (doc ✅; test ❌) |
| **1** | Supabase SSOT; tabelle booking/quote/POI/ops; migrazione JSON | Non iniziata |
| **2** | Auth, ruoli, RLS, middleware, login driver, `app/admin/` minimo | Non iniziata |
| **3** | Pagamenti + motore tariffario NCC completo | Non iniziata |
| **4** | Driver/partner/dispatch avanzato (scope partner da confermare) | Non iniziata |
| **5** | Lingue extra, SMS/email auto, app mobile, integrazioni | Non iniziata |

**Nota:** il booking Daytrip (ex “Fase 2a”) è avanzato in locale ma **non** sostituisce Fase 0–1 per produzione.

---

## 6. Decisioni ancora aperte

Elenco completo: [`docs/DECISIONS_PENDING.md`](docs/DECISIONS_PENDING.md)

| Tema | Blocca |
|------|--------|
| Provider pagamenti | Fase 3 |
| Acconto, saldo, cancellazioni, rimborsi | Checkout / termini |
| Modello partner NCC | Fase 4 |
| Regole tariffarie NCC (quali al go-live) | Fase 3 |
| Commissioni piattaforma / partner | Settlement |
| Notifiche (email/SMS/push) | Dispatch / driver |
| Criteri assegnazione corse | Fase 4 |
| Lingue (solo IT/EN vs altre) | Fase 5 / go-live |
| Criteri go-live (MVP produzione) | Deploy |

Tariffa NCC dettagliata: [`docs/NCC_TARIFF_REQUIREMENTS.md`](docs/NCC_TARIFF_REQUIREMENTS.md).

---

## 7. Prossimo passo tecnico consigliato (Fase 0)

Ordine suggerito — **senza saltare a auth o pagamenti**:

1. **Verifica Git (read-only)** — `git status`, `git log -5`; capire cosa è committato vs working tree  
2. **Inventario API esposte** — confermare le 10 route in `app/api/`; documentare quali sono pubbliche  
3. **Inventario JSON** — `data/*.json`; backup con `./scripts/backup-project.sh`  
4. **Test minimi** — Vitest (o equivalente): `trip-pricing.ts`, `wait-time-pricing.ts`; integration su `POST /api/trips/calculate` e `POST /api/booking`  
5. **Smoke booking** — script o Playwright: homepage → `/book` → submit  
6. **Sicurezza minima** — in produzione: disabilitare o proteggere ` /api/trip-ops*` finché non c’è auth  
7. **Aggiornare** `HANDOFF.md` checkpoint dopo la milestone  

---

## Protocollo «mi fermo»

Vedi [`PLATFORM_MAP.md`](PLATFORM_MAP.md) → sezione omonima (commit checkpoint, backup, aggiornamento checkpoint).

---

## Checkpoint sessione

| Data | Fase | Commit | Note |
|------|------|--------|------|
| 2026-07-07 | Doc | — | `HANDOFF` allineato a `PLATFORM_MAP` + allegati |
| 2026-07-07 | Doc | — | `PLATFORM_MAP` riscritto |
| 2026-06-24 | 0 | `4b57e9a` | Push GitHub iniziale |

*Aggiornare la riga sopra a ogni handoff.*

---

## Link utili

- Repo: https://github.com/CrisCag/mychauffeur-new  
- Path locale: `/Users/cristiancagnoni/progetti/mychauffeur-new`  
- Template env: `.env.example`  
- README setup Maps: `README.md`

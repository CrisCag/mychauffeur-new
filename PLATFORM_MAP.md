# MyChauffeur Platform Map

**Documento tecnico e operativo di riferimento** — repository `mychauffeur-new` → **www.mychauffeur.it**

| Campo | Valore |
|-------|--------|
| Ultimo aggiornamento | **2026-08-29** |
| Branch corrente | `os-foundation/identity-tenant-booking` |
| Checkpoint (pushato) | `c2a571e` — Founder Demo Vertical Slice |
| Modello | **Dual-track:** FOUNDATION · LEGACY · DEMO · DOCUMENTATION · NOT IMPLEMENTED |
| Dev locale | `npm run dev` → tipicamente **http://127.0.0.1:3002** |
| Allegati | [`docs/MASTER_BLUEPRINT.md`](docs/MASTER_BLUEPRINT.md) · [`docs/ARCHITECTURE_BASELINE_FREEZE_V1.md`](docs/ARCHITECTURE_BASELINE_FREEZE_V1.md) · [`docs/NCC_TARIFF_REQUIREMENTS.md`](docs/NCC_TARIFF_REQUIREMENTS.md) · [`docs/DECISIONS_PENDING.md`](docs/DECISIONS_PENDING.md) |
| Handoff | [`HANDOFF.md`](HANDOFF.md) |
| Snapshot storico Fase 0 | [`BACKUP_FASE_0_PRE_MAIN_2026-07-09.md`](BACKUP_FASE_0_PRE_MAIN_2026-07-09.md) (**historical**) |

Questo file **non** sostituisce il MASTER_BLUEPRINT né i framework MC-OS. Serve a mappare **cosa esiste nel repo oggi**.

---

## Visione

**Piattaforma NCC / transfer prenotato** (non taxi istantaneo), evoluta verso **MyChauffeur OS** (Modular Monolith CANDIDATE, Domain modules, Baseline B001).

- **OS Foundation** — Aggregate Domain, authz, commercial booking/quote/service
- **Legacy surface** — sito + funnel Daytrip-style + JSON/API
- **Founder Demo** — slice in-memory non-production

---

## Classificazione del repository

### FOUNDATION

| Elemento | Path / evidenza |
|----------|-----------------|
| Organizations | `lib/modules/organizations` |
| Identity + authorization | `lib/modules/identity` |
| Bookings + commercial snapshots | `lib/modules/bookings` |
| Quotes | `lib/modules/quotes` |
| Customers | `lib/modules/customers` |
| Services | `lib/modules/services` |
| Shared kernel | `lib/modules/platform` |
| Foundation SQL (files) | `supabase/migrations/20260726*.sql`, `20260731*.sql`, `20260802*.sql` |
| Domain / contract / fitness / migration-static tests | `tests/unit/*` |

**Nota migration:** i file SQL sono **versionati**. La loro **applicazione** su un database reale **non è verificata** da questa mappa — non dichiarare “migrato in prod”.

### LEGACY

| Elemento | Path / evidenza |
|----------|-----------------|
| Marketing + `/book` + `/driver` | `app/[locale]/**` (escluso `demo`) |
| API route handlers | `app/api/*` |
| Pricing / POI / trip-ops / Maps helpers | `lib/platform/*`, `lib/booking-*` |
| Runtime JSON | `data/*.json` |
| Legacy trip-ops SQL | `supabase/migrations/202606240001_trip_ops_driver_client.sql` |

### DEMO

| Elemento | Path |
|----------|------|
| Routes | `app/[locale]/demo/**` |
| Composition root | `lib/demo/**` |
| UI | `components/demo/**` |
| Tests | `tests/unit/demo-founder-slice.test.ts`, `demo-production-gate.static.test.ts` |

Gate: non disponibile quando `NODE_ENV === "production"`.

### DOCUMENTATION / GOVERNANCE

| Elemento | Codice tipico |
|----------|----------------|
| EDGF | MC-OS-000 |
| Master Blueprint | MC-OS-001 |
| Baseline B001 | MC-OS-025 |
| ADR Index (operativo) | MC-OS-024 (**MC-OS-010** riservato) |
| Domain frameworks | MC-OS-009 … 032 (vedi EDGF §4.3) |
| Product pending | `docs/DECISIONS_PENDING.md` |
| NCC requirements input | `docs/NCC_TARIFF_REQUIREMENTS.md` (MC-OS-003 prenotato) |

### NOT IMPLEMENTED (Domain / product)

- Payment / PSP / webhook
- Settlement / payout runtime
- Dispatch / Assignment engine (docs: MC-OS-030)
- SupportCase runtime (docs: MC-OS-031)
- Production Auth UI / middleware / RLS live
- Admin console (`app/admin/`)
- Partner portal
- GPS tracking prodotto
- AI automation in production

---

## Stack (stato reale)

| Layer | Tecnologie / percorsi |
|-------|------------------------|
| Frontend | Next.js App Router, React, TypeScript, Tailwind, next-intl |
| Backend | Route Handlers in `app/api/*` — nessun server separato |
| OS Domain | `lib/modules/*` |
| Legacy domain helpers | `lib/platform/*`, `lib/booking-*`, `types/*` |
| Mappe | Google Maps Platform (legacy funnel) |
| Email | Nodemailer (SMTP opzionale, legacy booking) |
| DB target | Supabase (`@supabase/supabase-js`) — Foundation SQL files present |
| Persistenza Foundation runtime | **In-memory** (repos Domain / Demo) |
| Persistenza legacy dev | File JSON in `data/` |
| i18n | **IT** e **EN** |
| Test | **Vitest** — `npm run test:run` (suite verificata: **355** test / **52** file al 2026-08-29) |

### Struttura repository (sintesi)

```
mychauffeur-new/
├── app/[locale]/              # sito, /book, /driver, /demo
├── app/api/                   # API legacy
├── components/                # UI (+ components/demo)
├── lib/modules/               # OS Foundation Domain
├── lib/demo/                  # Founder Demo composition
├── lib/platform/              # legacy pricing / trip-ops / maps
├── data/                      # JSON runtime (dev legacy)
├── supabase/migrations/       # 9 SQL files (1 legacy + 8 Foundation)
├── tests/                     # Vitest unit/API/static
├── messages/                  # i18n IT/EN
├── docs/                      # MC-OS corpus + Blueprint + EDGF
├── PLATFORM_MAP.md            # questo file
├── HANDOFF.md
└── README.md
```

**Documentazione normativa:** [`docs/MASTER_BLUEPRINT.md`](docs/MASTER_BLUEPRINT.md), Baseline B001, EDGF.
**Target ancora assente:** `app/admin/`, dispatch runtime, payment adapters.

### API legacy esistenti

| Route | Scopo |
|-------|--------|
| `POST /api/trips/calculate` | Preventivo multi-veicolo |
| `POST /api/booking` | Salva richiesta + email + trip operativo |
| `GET /api/points-of-interest` | POI suggeriti (limitato) |
| `POST /api/route-preview` | Mappa percorso |
| `GET /api/places/autocomplete` | Suggerimenti indirizzo |
| `GET /api/places/details` | Dettaglio luogo |
| `GET /api/wait-time-rates` | Config attesa fermate |
| `GET /api/comfort-mode` | Config VIP No Rush |
| `GET/PATCH/POST /api/trip-ops` | Viaggi operativi (dev JSON) |
| `GET/PATCH/POST /api/trip-ops/[id]` | Dettaglio corsa autista |

**Middleware:** redirect legacy in `proxy.ts` — **nessuna auth prodotto** su queste route.

---

## Cosa esiste oggi (matrice)

Legenda: ✅ presente · 🟡 parziale / MVP · 📋 solo docs · ❌ assente

| Area | Track | Stato |
|------|-------|--------|
| Marketing IT/EN | LEGACY | ✅ |
| Funnel `/book` Daytrip | LEGACY | ✅ locale |
| Pricing Daytrip semplificato | LEGACY | ✅ |
| Driver portal senza login | LEGACY | 🟡 |
| Identity / Orgs / Authz Domain | FOUNDATION | ✅ codice + test (no UI login) |
| Booking Aggregate + snapshots | FOUNDATION | ✅ |
| Quotes / Customers / Services | FOUNDATION | ✅ |
| Founder Demo Q→B→S | DEMO | ✅ non-prod |
| Corpus MC-OS / B001 | DOCS | ✅ |
| Test automatici | — | ✅ Vitest |
| Foundation SQL applied | FOUNDATION | ❌ / non verificabile |
| Pagamenti | — | ❌ |
| Dispatch / Assignment | DOCS | 📋 MC-OS-030 |
| Support | DOCS | 📋 MC-OS-031 |
| Admin UI | — | ❌ |
| Partner portal | — | ❌ |

### Debito tecnico rilevante

| Voce | Impatto |
|------|---------|
| Dual-track Foundation vs legacy | Rischio confusione SoT / commit misti |
| JSON + Supabase opzionale (legacy) | Dati divergenti tra ambienti |
| `trip-ops` API legacy | Protezione prod necessaria (guard già introdotto in Fase 0 storica) |
| Migration Foundation non applicate | Domain non persistito |
| HANDOFF/PLATFORM_MAP storici | Erano stale fino a questo aggiornamento |

---

## Fondamenta prodotto ancora mancanti (production surface)

Prima di esporre dispatch, autisti autenticati o pagamenti al pubblico:

| Fondamento | Stato |
|------------|--------|
| Auth UI + sessioni | ❌ prodotto |
| Middleware route protette | ❌ |
| RLS live | ❌ / non verificato |
| Persistenza Foundation su DB dedicato | ❌ |
| Observability production | 🟡 parziale storico |
| Decisioni product OPEN | Vedi `DECISIONS_PENDING.md` |

---

## Motore tariffario NCC

**Requisiti di prodotto** (input): [`docs/NCC_TARIFF_REQUIREMENTS.md`](docs/NCC_TARIFF_REQUIREMENTS.md).
**Framework Pricing OS** (architettura): [`docs/PRICING_AND_REVENUE_MANAGEMENT_FRAMEWORK.md`](docs/PRICING_AND_REVENUE_MANAGEMENT_FRAMEWORK.md) (MC-OS-017).

**Implementato oggi (legacy):** `base + km + soste + attesa + moltiplicatore veicolo + VIP` in `lib/platform/trip-pricing.ts`.
**Non** è il Pricing Domain Foundation definitivo.

---

## Piano JSON → Supabase (LEGACY — storico / ancora valido come debito)

Obiettivo legacy: Supabase SSOT per booking/trip-ops JSON. **Distinto** dalla persistenza futura degli Aggregate Foundation.

Il piano operativo dettagliato (inventario file JSON, dual-write, verifica coerenza, switch progressivo, rimozione JSON in produzione) è documentato nella versione di questo file al **checkpoint remoto `c2a571e`**, sezione «Piano di migrazione dati JSON → Supabase»:

```bash
git show c2a571e:PLATFORM_MAP.md
```

Quel contenuto resta **debito legacy** di riferimento storico. Non confonderlo con `lib/modules/*/infrastructure` in-memory né con la persistenza Foundation futura.

Per i path di implementazione legacy attuali, vedi [`HANDOFF.md`](HANDOFF.md) → **Legacy implementation entry points**.

---

## Roadmap (ordine ufficiale — delivery)

> **Cross-reference:** Blueprint §44 e Baseline B001. Le fasi sotto restano guida operativa **legacy/prod surface**; la sequenza **Domain Foundation** segue i commit OS e i framework MC-OS (non necessariamente Fase 0–5 legacy).

### Domain Foundation (completato in codice, in-memory)

Identity/Orgs/Authz → Bookings → Commercial Snapshots → Quotes → Customers → Services → Demo vertical slice → Corpus docs.

### Legacy Fase 0 — Stabilizzazione (storico + parziale)

Protezioni baseline (gitignore dati, trip-ops prod guard, rate limit, booking hardening) furono introdotte sul branch storico `fase-0/stabilizzazione-sicurezza-baseline` (vedi BACKUP).
**Test automatici:** non più assenti — suite Vitest attiva.

### Legacy Fase 1–5 (invariate come intenti)

1. Supabase SSOT legacy booking/ops
2. Auth, ruoli, RLS, admin UI
3. Pagamenti + matrice NCC
4. Driver/partner/dispatch avanzato (scope partner da confermare)
5. Espansione lingue / automazioni / mobile

**Nessuna implementazione** di Fase 2–4 product senza decisioni “blocca” in [`docs/DECISIONS_PENDING.md`](docs/DECISIONS_PENDING.md) e rispetto ADR-OPEN in MC-OS-024.

---

## Decisioni

| Tipo | Documento |
|------|-----------|
| Product / go-live OPEN | [`docs/DECISIONS_PENDING.md`](docs/DECISIONS_PENDING.md) |
| Architecture ADR / ADR-OPEN | [`docs/ARCHITECTURE_DECISION_RECORDS_INDEX.md`](docs/ARCHITECTURE_DECISION_RECORDS_INDEX.md) |
| Baseline freeze | [`docs/ARCHITECTURE_BASELINE_FREEZE_V1.md`](docs/ARCHITECTURE_BASELINE_FREEZE_V1.md) |

**Non** chiudere OPEN autonomamente.

---

## Organizzazione progetto

| Decisione | Scelta |
|-----------|--------|
| Repo attivo | `mychauffeur-new` |
| Branch Foundation corrente | `os-foundation/identity-tenant-booking` |
| Archivio import | `daytrip-clone` — non cancellare |
| Database target | Supabase (restore / ambienti da pianificare) |
| Porta dev tipica | **3002** |

**Repo:** https://github.com/CrisCag/mychauffeur-new
**Path locale:** `/Users/cristiancagnoni/progetti/mychauffeur-new`

---

## Protocollo «mi fermo»

1. `git status` / `git log -5`
2. Commit descrittivo (niente secrets)
3. `git push` **solo se richiesto**
4. `./scripts/backup-project.sh` se opportuno
5. Aggiornare checkpoint sotto + `HANDOFF.md`

---

## Checkpoint sessione

| Data | Fase | Commit | Note |
|------|------|--------|------|
| 2026-08-29 | Docs ops | *local pending* | PLATFORM_MAP allineata a Foundation/Demo |
| 2026-08-06 | Demo | `c2a571e` | Founder vertical slice |
| 2026-08-06 | Docs corpus | `8eba60b` | Framework MC-OS |
| 2026-08-02 | Foundation | `2f2a977`…`c56a0d7` | Services ← Bookings |
| 2026-07-09 | Historical | tag backup Fase 0 | Vedi BACKUP_FASE_0 |
| 2026-07-07 | Legacy doc | — | Mappa precedente (stale su test/migration/Foundation) |

---

## Prossimi step operativi

1. Scegliere prossimo Work Package Domain (persistenza Foundation **oppure** Dispatch) con piano esplicito
2. Non applicare migration senza ambiente dedicato
3. Tenere Demo separata dai commit Domain
4. Approvare OPEN product solo via `DECISIONS_PENDING` / ADR

---

## Incertezze

| Tema | Perché |
|------|--------|
| Schema Supabase live | Applicazione migration Foundation non verificata da questo documento |
| Scope partner | Solo email B2B oggi |
| Provider pagamenti/notifiche | OPEN in DECISIONS_PENDING / ADR-OPEN |

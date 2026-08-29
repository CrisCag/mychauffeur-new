# Handoff — MyChauffeur OS

**Documento di passaggio operativo** per riprendere il lavoro senza reinterpretare il repository.

| Campo | Valore |
|-------|--------|
| Ultimo aggiornamento | **2026-08-29** |
| Branch corrente | `os-foundation/identity-tenant-booking` |
| Checkpoint remoto (codice) | `c2a571e` — Foundation + Demo già pushati su `origin` |
| Docs operational alignment | Completato in locale; in attesa di push approvato (pre-push review) |
| Nature | **Dual-track:** OS Foundation + legacy product surface + Founder Demo |
| Riferimenti | [`docs/MASTER_BLUEPRINT.md`](docs/MASTER_BLUEPRINT.md) · [`PLATFORM_MAP.md`](PLATFORM_MAP.md) · [`docs/ARCHITECTURE_BASELINE_FREEZE_V1.md`](docs/ARCHITECTURE_BASELINE_FREEZE_V1.md) · [`docs/ARCHITECTURE_DECISION_RECORDS_INDEX.md`](docs/ARCHITECTURE_DECISION_RECORDS_INDEX.md) · [`docs/DECISIONS_PENDING.md`](docs/DECISIONS_PENDING.md) · [`docs/NCC_TARIFF_REQUIREMENTS.md`](docs/NCC_TARIFF_REQUIREMENTS.md) · [`BACKUP_FASE_0_PRE_MAIN_2026-07-09.md`](BACKUP_FASE_0_PRE_MAIN_2026-07-09.md) |

Aggiornare questo file dopo ogni sessione significativa o su comando **mi fermo**.

---

## Ripresa rapida (30 secondi)

```bash
cd ~/progetti/mychauffeur-new
git checkout os-foundation/identity-tenant-booking
git status --branch --short
npm run test:run
npm run dev
# → http://127.0.0.1:3002/it  (o porta Next)
# Demo (non-prod): /it/demo  e  /it/demo/ops
```

- **Repo attivo:** `mychauffeur-new` — non lavorare in `daytrip-clone` senza ordine esplicito
- **`.env.local`:** Maps keys per funnel legacy; SMTP opzionale — **non** commitare secrets
- **Supabase / Foundation SQL:** migration **file** presenti; applicazione su DB **non verificata** in questo handoff — non applicare senza piano esplicito

---

## 1. Stato reale (2026-08-29)

| Area | Stato |
|------|--------|
| **OS Foundation Domain** | Implementato in `lib/modules/` (in-memory + test): organizations, identity (+ authz), bookings (+ commercial snapshots), quotes, customers, services |
| **Founder Demo Vertical Slice** | Presente, gated off in production; Quote → Booking CONFIRMED → Service |
| **Corpus MC-OS** | Documentazione consolidata (registro EDGF fino a MC-OS-032; Baseline B001 = MC-OS-025) |
| **Migration SQL** | 9 file in `supabase/migrations/` (1 legacy trip-ops + 8 Foundation) — **file versionati ≠ applicati** |
| **Test automatici** | Vitest: suite corrente **355** test / **52** file (`npm run test:run`) |
| Sito marketing IT/EN | Operativo (legacy surface) |
| Funnel `/book` + preventivo Daytrip | Operativo in locale (legacy; JSON + API) |
| Auth production / RLS / admin UI | **Assenti** come prodotto esposto (Foundation identity/authz esistono come Domain, non come login UI) |
| Pagamenti / Dispatch / Assignment / Support | **Non implementati** in codice Domain (docs: MC-OS-030/031 e DECISIONS_PENDING) |
| Persistenza production Foundation | **Assente** — Domain usa repository in-memory |

### Checkpoint Git rilevanti

```
c2a571e feat(demo): add founder vertical slice
8eba60b docs(architecture): consolidate foundation framework corpus
013ac30 test(domain): remove remaining wall-clock dependencies
2f2a977 feat(services): add service foundation
82a7243 feat(customers): add customer foundation
5dbdae1 feat(quotes): add quote foundation
0885b4c feat(bookings): add commercial snapshots
c56a0d7 feat(bookings): add booking foundation aggregate
```

---

## 2. Cosa è Foundation vs Legacy vs Demo vs “solo docs”

### FOUNDATION (codice Domain)

| Modulo | Path | Note |
|--------|------|------|
| Organizations | `lib/modules/organizations` | Tenant/org aggregate |
| Identity + membership/roles/permissions | `lib/modules/identity` | Incl. authorization engine |
| Bookings + commercial snapshots | `lib/modules/bookings` | Confirm freeze snapshots |
| Quotes | `lib/modules/quotes` | Proposal → accept |
| Customers | `lib/modules/customers` | Customer aggregate |
| Services | `lib/modules/services` | Generate from confirmed booking |
| Platform kernel (shared) | `lib/modules/platform` | Shared kernel helpers — not product UI |

### LEGACY (prodotto attuale sito/API)

| Area | Path tipici |
|------|-------------|
| Booking funnel | `app/[locale]/book`, `components/booking/*`, `app/api/booking` |
| Pricing Daytrip | `lib/platform/trip-pricing.ts`, `app/api/trips/calculate` |
| Trip ops / driver MVP | `lib/platform/trip-ops-store.ts`, `app/[locale]/driver`, `app/api/trip-ops*` |
| Runtime JSON | `data/*.json` (non SoT Foundation) |

### Legacy implementation entry points

> **LEGACY only** — non OS Foundation. Path verificati nel repository (navigazione rapida per sviluppo sul prodotto attuale).

| Entry | Path | Ruolo |
|-------|------|-------|
| Widget homepage | `components/sections/booking-widget.tsx` | Ingresso al funnel |
| Pagina `/book` | `app/[locale]/book/page.tsx` | Funnel 3 step |
| UI funnel | `components/booking/book-flow-client.tsx` | Logica client principale |
| Stato sessione | `lib/booking-flow-storage.ts` | `sessionStorage` funnel |
| API booking | `app/api/booking/route.ts` | Invio richiesta |
| Persistenza richieste | `lib/booking-requests.ts` | Writer JSON legacy |
| API preventivo | `app/api/trips/calculate/route.ts` | Calcolo prezzi |
| Motore prezzi | `lib/platform/trip-pricing.ts` | Pricing Daytrip |
| API trip-ops | `app/api/trip-ops/route.ts`, `app/api/trip-ops/[id]/route.ts` | Operazioni autista |
| Store trip-ops | `lib/platform/trip-ops-store.ts` | Persistenza JSON corse |
| Portale driver | `app/[locale]/driver/page.tsx` | UI autista MVP |
| API POI | `app/api/points-of-interest/route.ts` | Fermate suggerite |
| Dati POI | `lib/platform/static-pois.ts`, `lib/platform/poi-query.ts` | Catalogo/query POI |
| i18n | `lib/i18n-config.ts`, `messages/it.ts`, `messages/en.ts` | Stringhe IT/EN |
| Config JSON dev | `data/wait-time-rates.json`, `data/comfort-mode-config.json` | Tariffe attesa / VIP (vedi `data/README.md`) |

### DEMO

| Area | Path |
|------|------|
| Routes | `app/[locale]/demo/**` |
| Composition | `lib/demo/**` |
| UI | `components/demo/**` |
| Tests | `tests/unit/demo-*.ts` |

### DOCUMENTATO ma NON implementato (Domain)

Dispatch/Assignment engine (MC-OS-030), Support (MC-OS-031), Payment/Settlement runtime, Notification providers, Pricing NCC completo (requisiti in MC-OS-003 / MC-OS-017 — **non** engine definitivo).

---

## 3. Guardrail (obbligatori)

1. **Non** mescolare commit Foundation Domain con docs delivery o Demo senza separazione consapevole.
2. **Non** applicare migration Foundation su DB production/Umbria senza piano e decisione esplicita.
3. **Non** dichiarare Demo come prodotto cliente; gate `NODE_ENV !== "production"`.
4. **Non** chiudere ADR-OPEN o decisioni in `DECISIONS_PENDING` senza titolare.
5. **Non** riusare **MC-OS-010** (riservato); indice ADR = **MC-OS-024**.
6. Ownership: **MC-OS-014** lifecycle ≠ **MC-OS-032** commercial booking; **MC-OS-015** identity governance ≠ **MC-OS-029** permission catalog.
7. Legacy JSON / `lib/platform` **non** sono Source of Truth del Domain OS.
8. Deny by Default, Tenant Isolation, Modular Monolith (CANDIDATE) — rispettare B001 / MC-OS-026.

### Cosa NON fare senza decisione architetturale

- Scegliere provider pagamenti / email / SMS
- Introdurre microservices come default
- AI autonoma su Ledger, Payment, Permission, Safety
- Sostituire funnel `/book` con Demo in production
- Merge Foundation persistence su Supabase “al volo”

---

## 4. Prossimi passi raccomandati

1. Mantenere docs delivery allineate (questo handoff / PLATFORM_MAP) dopo ogni milestone.
2. Decidere il **prossimo Step Domain** (es. Dispatch foundation **oppure** persistenza Supabase Foundation in ambiente dedicato) — non entrambi nello stesso commit senza piano.
3. Continuare a **non** applicare migration finché non c’è ambiente e checklist.
4. Tenere Demo separata; non espandere verso Payment/GPS/Assignment reali nella demo.
5. Product OPEN in [`docs/DECISIONS_PENDING.md`](docs/DECISIONS_PENDING.md); arch OPEN in MC-OS-024.

---

## 5. File da conoscere

### Foundation

`lib/modules/{organizations,identity,bookings,quotes,customers,services}/**`
`supabase/migrations/20260726*.sql`, `20260731*.sql`, `20260802*.sql`
`tests/unit/*` (domain, contract, fitness, migration static, demo)

### Demo

`lib/demo/**` · `components/demo/**` · `app/[locale]/demo/**`

### Legacy

`lib/platform/**` · `app/api/**` · `components/booking/**` · `data/**`

### Docs SoT

`docs/DOCUMENTATION_MANAGEMENT_FRAMEWORK.md` · `docs/MASTER_BLUEPRINT.md` · `docs/ARCHITECTURE_BASELINE_FREEZE_V1.md` · `docs/ARCHITECTURE_DECISION_RECORDS_INDEX.md`

---

## 6. Storia precedente (non stato corrente)

Prima del branch Foundation, il handoff descriveva soprattutto Fase 0/2a legacy (booking Daytrip, JSON, assenza test). Quella fotografia è **superata** per Foundation/test/docs; resta utile solo come contesto del prodotto legacy. Snapshot storico Fase 0: [`BACKUP_FASE_0_PRE_MAIN_2026-07-09.md`](BACKUP_FASE_0_PRE_MAIN_2026-07-09.md).

---

## Protocollo «mi fermo»

Vedi [`PLATFORM_MAP.md`](PLATFORM_MAP.md) → sezione omonima.

---

## Checkpoint sessione

| Data | Fase | Commit / stato | Note |
|------|------|----------------|------|
| 2026-08-29 | Docs ops | Completato in locale; in attesa di push approvato | Allineamento documentazione operativa (HANDOFF/PLATFORM_MAP/README). Checkpoint remoto codice resta `c2a571e`. |
| 2026-08-06 | Demo | `c2a571e` (remoto) | Founder vertical slice pushato |
| 2026-08-06 | Docs | `8eba60b` | Corpus framework MC-OS consolidato |
| 2026-08-02 | Foundation | `2f2a977` … `c56a0d7` | Bookings → Services |
| 2026-07-09 | Historical | tag `backup/fase-0-…` | Vedi BACKUP_FASE_0 |
| 2026-07-07 | Legacy doc | — | HANDOFF precedente (stale rispetto a Foundation) |

---

## Link utili

- Master Blueprint: [`docs/MASTER_BLUEPRINT.md`](docs/MASTER_BLUEPRINT.md)
- Baseline B001: [`docs/ARCHITECTURE_BASELINE_FREEZE_V1.md`](docs/ARCHITECTURE_BASELINE_FREEZE_V1.md)
- ADR Index: [`docs/ARCHITECTURE_DECISION_RECORDS_INDEX.md`](docs/ARCHITECTURE_DECISION_RECORDS_INDEX.md)
- Platform Map: [`PLATFORM_MAP.md`](PLATFORM_MAP.md)
- README entry: [`README.md`](README.md)
- Repo: https://github.com/CrisCag/mychauffeur-new
- Path locale: `/Users/cristiancagnoni/progetti/mychauffeur-new`
- Template env: `.env.example`

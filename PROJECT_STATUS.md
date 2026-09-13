# MyChauffeur OS — PROJECT STATUS

Registro operativo sintetico permanente. Aggiornare dopo ogni Work Package significativo o su comando **mi fermo**.

| Campo | Valore |
|-------|--------|
| **Ultimo aggiornamento** | **2026-09-13 10:29 Europe/Rome** |
| Repository | `/Users/cristiancagnoni/progetti/mychauffeur-new` → `https://github.com/CrisCag/mychauffeur-new` |
| Branch | `os-foundation/identity-tenant-booking` |
| Ultimo commit su **origin** | `37172c1e91d38884419a4fc1a3847e6f653af1d7` — `docs(project): add continuity checkpoint` |
| Continuity checkpoint (questo documento) | commit `37172c1` — **pubblicato** su origin (`0/0`) |
| Working tree | **pulito** dopo commit MC-WORK-008 (verificare con `git status`) |
| Ultimo Work Package Domain/docs pubblicato | `MC-WORK-007` — Consolidamento documentazione (`99521f6`) |
| Prossima attività | Feedback founder / WP Domain successivo (persistenza **oppure** Dispatch) |

Riferimenti: [`HANDOFF.md`](HANDOFF.md) · [`PLATFORM_MAP.md`](PLATFORM_MAP.md) · [`README.md`](README.md) · [`docs/DECISIONS_PENDING.md`](docs/DECISIONS_PENDING.md)

---

## Protocollo ripresa — «Dove siamo rimasti?»

Quando scrivo `Dove siamo rimasti?`, rispondi sempre con:

```
Ultima attività completata:
Ultimo commit pubblicato:
Stato attuale:
Sto aspettando da te:
Quando hai terminato, riportami:
Prossimo passo:
```

Compilazione corrente (Europe/Rome):

```
Ultima attività completata:
  Review severa MC-WORK-008 (runtime IT/EN, ops READY, anti-EMFILE, gate qualità).
Ultimo commit pubblicato:
  `37172c1` su origin (`docs(project): add continuity checkpoint`).
Stato attuale:
  Branch `os-foundation/identity-tenant-booking`; working tree sporco con fix demo non committati;
  MC-WORK-008 IN CORSO (verificato, pronto al commit su richiesta).
Sto aspettando da te:
  Approvazione commit (e eventuale push).
Quando hai terminato, riportami:
  Conferma commit/push o ulteriori note.
Prossimo passo:
  Commit MC-WORK-008 su richiesta esplicita.
```

---

## Snapshot operativo

### Foundation completate (Domain + in-memory + test)

| Modulo | Path | Commit tipico |
|--------|------|---------------|
| Organizations / Tenants | `lib/modules/organizations` | `48f76e9` |
| Identity (+ membership / roles / permissions / authz) | `lib/modules/identity`, `lib/modules/platform` | `9a93544`…`d08a229` |
| Bookings | `lib/modules/bookings` | `c56a0d7` |
| Commercial snapshots | `lib/modules/bookings` | `0885b4c` |
| Quotes | `lib/modules/quotes` | `5dbdae1` |
| Customers | `lib/modules/customers` | `82a7243` |
| Services | `lib/modules/services` | `2f2a977` |

Persistenza production Foundation: **assente** (repository in-memory).

### Founder Demo

| Campo | Stato |
|-------|--------|
| Vertical slice | Quote → Booking CONFIRMED → Service |
| Codice | `app/[locale]/demo/**`, `components/demo/**`, `lib/demo/**` |
| Commit slice | `c2a571e` (pubblicato) |
| Correzioni post-review | **MC-WORK-008 IN CORSO** (verifica severa 2026-09-13 OK) |
| Gate | Non disponibile se `NODE_ENV === "production"` |
| Admin produzione | **Assente** — solo pannello demo `/demo/ops` |
| Dev locale | `npm run dev` → `scripts/dev-local.sh` (raise-only soft nofile + porta 3002) |

### URL locali (dev, porta 3002)

| Superficie | URL |
|------------|-----|
| Homepage | http://127.0.0.1:3002/it |
| Founder Demo | http://127.0.0.1:3002/it/demo |
| Demo ops | http://127.0.0.1:3002/it/demo/ops |
| Booking flow (legacy) | http://127.0.0.1:3002/it/book |
| Driver portal (legacy) | http://127.0.0.1:3002/it/driver |

### Migration

Presenti in `supabase/migrations/` (**9 file**: 1 legacy trip-ops + 8 Foundation).
**Create / versionate nel repository.** Applicazione su DB reale: **non verificata**. Non dichiarare “migrato in prod”.

### Test attestati

- Vitest: **355** test / **52** file (`npm run test:run`) — OK in review severa 2026-09-13
- `tsc --noEmit`, `lint`, `build`, `git diff --check` — OK in review severa 2026-09-13

### Decisioni ancora aperte

Vedi [`docs/DECISIONS_PENDING.md`](docs/DECISIONS_PENDING.md) e ADR-OPEN in [`docs/ARCHITECTURE_DECISION_RECORDS_INDEX.md`](docs/ARCHITECTURE_DECISION_RECORDS_INDEX.md):

pagamenti · acconto · cancellazioni · commissioni · modello partner · tariffe NCC · assegnazione corse · notifiche · lingue extra · criteri go-live

### Debiti principali

| Debito | Nota |
|--------|------|
| Persistenza Foundation | Domain solo in-memory |
| Migration non applicate / non verificate | File ≠ schema live |
| Supabase reachability | Env spesso incompleto; progetto storico non verificato in Continuity Audit |
| SMTP booking | Parziale / opzionale in dev |
| CI/CD | Nessun `.github/workflows` |
| Admin / dispatcher produzione | Non implementati |
| Dual-key Google Maps | Oggi stesso valore client/server; restrictions GCP richiedono chiavi distinte |
| macOS EMFILE in `next dev` | Soft `launchctl maxfiles` spesso 256; mitigato da `scripts/dev-local.sh` (raise-only) |

### Azione esatta per riprendere

```bash
cd /Users/cristiancagnoni/progetti/mychauffeur-new
git checkout os-foundation/identity-tenant-booking
git status --branch --short
npm run test:run
npm run dev
# Aprire: http://127.0.0.1:3002/it/demo  e  http://127.0.0.1:3002/it/demo/ops
# EN: http://127.0.0.1:3002/en/demo  e  http://127.0.0.1:3002/en/demo/ops
```

Prossima attività: **commit MC-WORK-008 su richiesta** (nessuna migration; nessun Domain Foundation).

---

## Cronologia Work Package

| ID | Titolo | Commit | Stato | Prossima dipendenza |
|----|--------|--------|-------|---------------------|
| `MC-WORK-001` | Booking Foundation | `c56a0d7` | **COMPLETATA E PUBBLICATA** | Commercial snapshots (`MC-WORK-002`) |
| `MC-WORK-002` | Commercial Snapshot Foundation | `0885b4c` | **COMPLETATA E PUBBLICATA** | Quote / confirm freeze (`MC-WORK-003`) |
| `MC-WORK-003` | Quote Foundation | `5dbdae1` | **COMPLETATA E PUBBLICATA** | Customer (`MC-WORK-004`) |
| `MC-WORK-004` | Customer Foundation | `82a7243` | **COMPLETATA E PUBBLICATA** | Service (`MC-WORK-005`) |
| `MC-WORK-005` | Service Foundation | `2f2a977` | **COMPLETATA E PUBBLICATA** | Demo vertical slice (`MC-WORK-006`); test wall-clock `013ac30` |
| `MC-WORK-006` | Founder Demo Vertical Slice | `c2a571e` | **COMPLETATA E PUBBLICATA** | Review visuale/funzionale (`MC-WORK-008`); corpus docs `8eba60b` in parallelo |
| `MC-WORK-007` | Consolidamento documentazione | `99521f6` (+ corpus `8eba60b`) | **COMPLETATA E PUBBLICATA** | Registro permanente (`PROJECT_STATUS.md`); poi `MC-WORK-008` |
| `MC-WORK-008` | Review visuale e funzionale Founder Demo | (questo commit) | **COMPLETATA** (push su richiesta) | Feedback founder → WP Domain successivo (persistenza **oppure** Dispatch) |

---

## ULTIMO CHECKPOINT

CHECKPOINT — 2026-09-13 10:29 — Europe/Rome

- **Ultima azione eseguita:** commit + push correzioni MC-WORK-008 (i18n, layout immersivo, UX ops/flow, anti-EMFILE, cookie nascosto in demo)
- **Ultimo commit locale/remoto:** verificare con `git log -1 --oneline` / `git status -sb` dopo il push
- **Ahead / behind:** atteso `0 / 0` dopo push su origin
- **Modifiche non committate:** nessuna, dopo questo checkpoint di commit
- **Test più recenti attestati:** 355/355 — OK; `tsc` OK; `lint` OK; `build` OK; `git diff --check` OK
- **Prossima azione esatta:** feedback founder / scelta WP Domain successivo (persistenza oppure Dispatch)
- **Comandi di avvio:**
  ```bash
  cd /Users/cristiancagnoni/progetti/mychauffeur-new
  npm run test:run
  npm run dev
  ```
- **URL da verificare:**
  - http://127.0.0.1:3002/it/demo
  - http://127.0.0.1:3002/en/demo
  - http://127.0.0.1:3002/it/demo/ops
  - http://127.0.0.1:3002/en/demo/ops
  - dettaglio booking ops
- **Operazioni vietate senza approvazione:** push · pull · fetch distruttivi · merge/rebase/reset · deploy · applicazione migration · modifica DB/Supabase · aggiornamento dependencies · modifica `.env` · esposizione secrets · cambio hosting/DNS · commit non richiesti

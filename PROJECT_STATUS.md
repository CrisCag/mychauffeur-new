# MyChauffeur OS — PROJECT STATUS

Registro operativo sintetico permanente. Aggiornare dopo ogni Work Package significativo o su comando **mi fermo**.

| Campo | Valore |
|-------|--------|
| **Ultimo aggiornamento** | **2026-09-11 20:52 Europe/Rome** |
| Repository | `/Users/cristiancagnoni/progetti/mychauffeur-new` → `https://github.com/CrisCag/mychauffeur-new` |
| Branch | `os-foundation/identity-tenant-booking` |
| Ultimo commit su **origin** | `99521f6d808ff79d57f5cdd59ae18e26193ed499` — `docs(repository): align operational documentation with foundation` |
| Continuity checkpoint (questo documento) | commit locale `docs(project): add continuity checkpoint` — **non pushato** (`ahead 1`; hash = `git rev-parse --short HEAD`) |
| Working tree dopo quel commit | **pulito** |
| Ultimo Work Package Domain/docs pubblicato | `MC-WORK-007` — Consolidamento documentazione (`99521f6`) |
| Prossima attività | `MC-WORK-008` — Review visuale e funzionale Founder Demo |

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
  Continuity checkpoint permanente (`PROJECT_STATUS.md`) + correzione indicazioni stale push in HANDOFF/PLATFORM_MAP.
Ultimo commit pubblicato:
  `99521f6` su origin (`docs(repository): align operational documentation with foundation`).
  Continuity checkpoint locale: `docs(project): add continuity checkpoint` (non pushato; `git log -1 --oneline`).
Stato attuale:
  Branch `os-foundation/identity-tenant-booking`; Foundation Domain + Founder Demo presenti;
  migration solo versionate; MC-WORK-008 non iniziata.
Sto aspettando da te:
  Approvazione push del continuity checkpoint (se richiesto) e/o avvio review Founder Demo.
Quando hai terminato, riportami:
  Esito review visuale/funzionale di `/it/demo` e `/it/demo/ops` (pass/fail + note).
Prossimo passo:
  MC-WORK-008 — Review visuale e funzionale Founder Demo.
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
| Commit | `c2a571e` (pubblicato) |
| Gate | Non disponibile se `NODE_ENV === "production"` |
| Admin produzione | **Assente** — solo pannello demo `/demo/ops` |

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

- Vitest: **355** test / **52** file (`npm run test:run`) — attestati in HANDOFF al checkpoint docs `99521f6`
- Continuity Audit (post-push, chat): `tsc --noEmit`, `lint`, `build` OK — non rieseguiti in questo checkpoint file

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

### Azione esatta per riprendere

```bash
cd /Users/cristiancagnoni/progetti/mychauffeur-new
git checkout os-foundation/identity-tenant-booking
git status --branch --short
npm run test:run
npm run dev
# Aprire: http://127.0.0.1:3002/it/demo  e  http://127.0.0.1:3002/it/demo/ops
```

Prossima attività: **`MC-WORK-008` — review visuale e funzionale della Founder Demo** (nessuna modifica codice/migration senza piano esplicito).

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
| `MC-WORK-008` | Review visuale e funzionale Founder Demo | — | **NON INIZIATA** | Feedback founder → eventuali fix demo o scelta WP Domain successivo (persistenza **oppure** Dispatch) |

---

## ULTIMO CHECKPOINT

- **Ultima azione eseguita:** registro permanente `PROJECT_STATUS.md` + correzione stale push in `HANDOFF.md` / `PLATFORM_MAP.md`
- **Ultimo commit locale:** `docs(project): add continuity checkpoint` (non pushato; verificare con `git rev-parse HEAD`)
- **Ultimo commit remoto:** `99521f6` su `origin/os-foundation/identity-tenant-booking`
- **Ahead / behind:** `1 / 0` (atteso finché il continuity checkpoint non è pushato)
- **Modifiche non committate:** nessuna, dopo il commit di questo checkpoint
- **Test più recenti attestati:** 355 test / 52 file (`npm run test:run`)
- **Prossima azione esatta:** avviare `MC-WORK-008` — review visuale e funzionale di `/it/demo` e `/it/demo/ops`
- **Comandi di avvio:**
  ```bash
  cd /Users/cristiancagnoni/progetti/mychauffeur-new
  npm run test:run
  npm run dev
  ```
- **URL da verificare:**
  - http://127.0.0.1:3002/it/demo
  - http://127.0.0.1:3002/it/demo/ops
  - http://127.0.0.1:3002/it (contesto homepage)
- **Operazioni vietate senza approvazione:** push · pull · fetch distruttivi · merge/rebase/reset · deploy · applicazione migration · modifica DB/Supabase · aggiornamento dependencies · modifica `.env` · esposizione secrets · cambio hosting/DNS · commit ulteriori non richiesti

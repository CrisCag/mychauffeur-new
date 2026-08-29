# Decisioni da approvare prima di scrivere codice

Documento allegato a [`PLATFORM_MAP.md`](../PLATFORM_MAP.md).
Indice architetturale: [`MASTER_BLUEPRINT.md`](./MASTER_BLUEPRINT.md).
**Governance correlata (non sostituisce questa tabella):**

- ADR / ADR-OPEN: [`ARCHITECTURE_DECISION_RECORDS_INDEX.md`](./ARCHITECTURE_DECISION_RECORDS_INDEX.md) (**MC-OS-024**; **MC-OS-010** resta riservato)
- Baseline freeze B001: [`ARCHITECTURE_BASELINE_FREEZE_V1.md`](./ARCHITECTURE_BASELINE_FREEZE_V1.md) (**MC-OS-025**)
- EDGF registro documenti: [`DOCUMENTATION_MANAGEMENT_FRAMEWORK.md`](./DOCUMENTATION_MANAGEMENT_FRAMEWORK.md) (**MC-OS-000**)

Ogni voce richiede **decisione del titolare** (Cristian) prima che l’agente implementi.

**Stato:** tutte le righe sotto restano **OPEN** finché non aggiornate esplicitamente con data e decisione.
Questo file **non** chiude ADR-OPEN e **non** promuove CANDIDATE → APPROVED.

Ultimo aggiornamento documentale: **2026-08-29** (cross-reference; decisioni invariate rispetto al 2026-07-07).

| # | Tema | Domanda | Opzioni / note | Blocca |
|---|------|---------|----------------|--------|
| 1 | **Provider pagamenti** | Stripe, Nexi, PayPal, bonifico+link manuale? | Ipotesi storiche in PLATFORM_MAP; provider **OPEN** anche in ADR | Pagamenti online |
| 2 | **Policy acconto** | % acconto, scadenza, rimborso se cliente cancella | Oggi solo testo informativo in `messages/it.ts` (legacy) | Checkout |
| 3 | **Cancellazioni** | Gratis 24h — cosa dopo? Penale %? | Allineare a policy commerciali / timer | Termini + refund |
| 4 | **Struttura commissioni** | % piattaforma su B2C; net rate B2B; override partner | Vedi `NCC_TARIFF_REQUIREMENTS.md` + Settlement framework | Settlement |
| 5 | **Modello partner** | Solo email B2B vs portale con documenti e sub-driver | Scope Fase 4 / Partner frameworks | Partner portal |
| 6 | **Regole tariffarie NCC** | Quali voci della matrice sono obbligatorie al go-live? | Priorità in NCC doc; Pricing OS = MC-OS-017 (non engine definitivo) | Pricing engine |
| 7 | **Assegnazione corse** | Solo manuale dispatcher vs offerte + accept | Dispatch docs = MC-OS-030 (**non** implementato) | Dispatch |
| 8 | **Notifiche** | Email, SMS, push — provider | Provider **OPEN**; Notification framework = MC-OS-016 | Driver + cliente |
| 9 | **Lingue** | Solo IT/EN al go-live o anche ES/FR/DE/RU? | `lib/i18n-config.ts` oggi 2 locale | i18n |
| 10 | **Go-live** | Criteri minimi: auth? pagamenti? solo richiesta email? | Definire MVP produzione | Deploy |

**Processo:** approvare riga per riga; aggiornare questa tabella con data e decisione; solo dopo procedere con implementazione.
Per decisioni architetturali già catalogate come ADR-OPEN, aggiornare **anche** MC-OS-024 — non solo questa tabella.

# Decisioni da approvare prima di scrivere codice

Documento allegato a `PLATFORM_MAP.md`.  
Ogni voce richiede **decisione del titolare** (Cristian) prima che l’agente implementi.

Ultimo aggiornamento: 2026-07-07

| # | Tema | Domanda | Opzioni / note | Blocca |
|---|------|---------|----------------|--------|
| 1 | **Provider pagamenti** | Stripe, Nexi, PayPal, bonifico+link manuale? | `PLATFORM_MAP` ipotizza Stripe Fase 3 | Pagamenti online |
| 2 | **Policy acconto** | % acconto, scadenza, rimborso se cliente cancella | Oggi solo testo 30% in `messages/it.ts` | Checkout |
| 3 | **Cancellazioni** | Gratis 24h — cosa dopo? Penale %? | Allineare a timer attesa | Termini + refund |
| 4 | **Struttura commissioni** | % piattaforma su B2C; net rate B2B; override partner | Vedi `NCC_TARIFF_REQUIREMENTS.md` | Settlement |
| 5 | **Modello partner** | Solo email B2B vs portale con documenti e sub-driver | Scope Fase 4 | Partner portal |
| 6 | **Regole tariffarie NCC** | Quali voci della matrice sono obbligatorie al go-live? | Priorità in NCC doc | Pricing engine |
| 7 | **Assegnazione corse** | Solo manuale dispatcher vs offerte + accept | Fase 4 | Dispatch |
| 8 | **Notifiche** | Email, SMS, push — provider (Twilio, Resend, …) | Non documentato finora | Driver + cliente |
| 9 | **Lingue** | Solo IT/EN al go-live o anche ES/FR/DE/RU? | `lib/i18n-config.ts` oggi 2 locale | i18n |
| 10 | **Go-live** | Criteri minimi: auth? pagamenti? solo richiesta email? | Definire MVP produzione | Deploy |

**Processo:** approvare riga per riga; aggiornare questa tabella con data e decisione; solo dopo procedere con implementazione.

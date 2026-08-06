# MyChauffeur OS — Pricing & Revenue Management Framework

| Campo | Valore |
|-------|--------|
| **Codice documento** | MC-OS-017 |
| **Titolo** | Pricing & Revenue Management Framework |
| **Versione** | 0.1.0 |
| **Stato** | Draft |
| **Data creazione** | 2026-07-26 |
| **Ultima modifica** | 2026-07-26 |
| **Owner** | Pricing, Revenue & Business Operations |
| **Autori** | MyChauffeur OS Team |
| **Documenti correlati** | MC-OS-000 · MC-OS-001 · MC-OS-002 · MC-OS-003 · MC-OS-006 · MC-OS-009 · MC-OS-011 · MC-OS-012 · MC-OS-014 · PLATFORM_MAP · HANDOFF |
| **Dipendenze** | BOS; Glossary; NCC Tariff; SFOF; Partner Exchange; Booking Lifecycle |
| **Classificazione** | Official Domain Framework — Draft |
| **Documentation Release** | 0.1 (allineamento previsto) |

---

## Avvertenza

Questo documento è un **framework ufficiale di dominio**.
Non è contratto, non è codice, **non fissa percentuali, soglie o formule fiscali definitive**, non è specifica API.

I nomi di entità, stati, eventi, campi e concetti software restano in **inglese**. Il testo normativo è in **italiano**.

---

## Source of Truth

Questo documento (MC-OS-017) è la Source of Truth di **Pricing & Revenue Management**.

---

## 1. Scopo

Definire il modello di pricing, margine, revenue management e guardrail economici della piattaforma.

Vincolo strategico: **Contribution Margin e utile > GBV/GMV come metriche guida** (BOS). GBV non è ricavo.

**Source of Truth:** MC-OS-017 per Pricing & Revenue Management. Non fissa %/soglie definitive. Fiscalità = placeholder.

## 2. Principi

| ID | Principio |
|----|-----------|
| PRM-01 | CM e utile prioritari rispetto a GBV/GMV |
| PRM-02 | Commission ≠ Markup ≠ Platform Revenue |
| PRM-03 | Partner Cost XOR Internal Execution Cost |
| PRM-04 | Maximum Assignment Budget enforced |
| PRM-05 | Minimum Margin Guardrail (soglia **OPEN**) |
| PRM-06 | Price versioning e audit |
| PRM-07 | Nessuna % o formula fiscale definitiva in questo draft |
| PRM-08 | Tax Regime configurabile / MoR **OPEN** |

## 3. Pricing domains

Domini: Customer-facing price, Partner economics, Internal execution economics, Platform revenue components, Promotional adjustments, Exchange economics.

## 4. Customer Price

Prezzo verso Customer (gross o secondo presentation Tax Regime). Non mostrato di default all’Executing Partner.

## 5. Net Price

Prezzo netto commerciale (es. B2B/Agency) distinto da Customer Price consumer. Definizione contabile fine = **OPEN**.

## 6. Tax treatment placeholder

IVA/tax treatment dipende da paese e da Merchant of Record vs intermediario (**OPEN** + validazione commercialista). Questo framework non fissa aliquote né soggetto fiscale.

## 7. Partner Cost

Costo dovuto al Partner per esecuzione (`assignment_mode = PARTNER`). **XOR** con Internal Execution Cost.

## 8. Internal Execution Cost

Costo di esecuzione owned (`assignment_mode = INTERNAL`). **XOR** con Partner Cost. Non usare “costo assegnato” ambiguo.

## 9. Platform Revenue

Insieme delle componenti di ricavo piattaforma (Commission, fee Exchange, altri fee config). Non sinonimo di Commission sola né di GBV.

## 10. Commission

Fee/percentuale contrattuale distinta dal Markup. Struttura %: **OPEN** (DECISIONS #4).

## 11. Markup

Differenziale di prezzo commerciale aggiunto sul costo/base. ≠ Commission.

## 12. Take Rate

Indicatore Platform Revenue / GBV (o base definita). Utile diagnostico, non obiettivo primario rispetto a CM.

## 13. Gross Margin

Margine lordo secondo definizione contabile da validare. Non sostituisce Contribution Margin come KPI primario BOS.

## 14. Contribution Margin

Margine dopo costi variabili diretti rilevanti del Booking/periodo. KPI primario insieme all’utile.

## 15. Maximum Assignment Budget

Cap al costo Assignment (Partner Cost o Internal Execution Cost) derivato da economics del Booking. Accept oltre budget = blocco.

## 16. Minimum Margin Guardrail

Soglia minima CM/utile accettabile per Quote/accept. Valore numerico **OPEN**.

## 17. Pricing Profile

Profilo tariffario per canale/segmento/tenant (B2C, B2B, Corporate, white-label).

## 18. Pricing Rule

Regola atomica (distance, time, surcharge, fee) con priorità e versioning.

## 19. Service Category pricing

Prezzi/regole per categoria servizio (transfer, disposition, ecc.).

## 20. Vehicle Category pricing

Differenziali per categoria veicolo.

## 21. Distance pricing

Componenti basate su distanza. Parametri **OPEN**/NCC matrix.

## 22. Time pricing

Componenti basate su tempo/durata (disposition).

## 23. Waiting pricing

Tariffazione waiting oltre franchigia. Valori **OPEN**.

## 24. Stops pricing

Supplementi stop intermedi.

## 25. Night surcharge

Supplemento notturno — abilitazione e misura **OPEN**/NCC.

## 26. Holiday surcharge

Supplemento festivo — **OPEN**/NCC.

## 27. Event pricing

Pricing eventi/peak speciali — Configuration; non surge illimitato senza guardrail.

## 28. Airport fee

Fee aeroportuali dove applicabili — **OPEN**/NCC.

## 29. Toll and parking modes

Modalità: included / pass-through / estimate+adjust. Dettaglio policy **OPEN**.

## 30. One-way

Pricing trasferimento one-way.

## 31. Return trip

Pricing andata+ritorno (bundle o Service separati). Coerente con multi-service Booking.

## 32. Disposition

Pricing a tempo/disponibilità veicolo.

## 33. Transfer

Pricing punto-punto.

## 34. B2C pricing

Listino/consumer rules + eventuali promo. Allineamento NCC requirements.

## 35. B2B net rates

Net rate Agency/B2B. Commission/markup piattaforma secondo accordo — % **OPEN**.

## 36. Corporate pricing

Listini/account rates Corporate; possibile billing ciclico (SFOF).

## 37. Partner Exchange pricing

Compenso Executing, Platform Fee, preview economica pre-publish (MC-OS-012). UNFILLED → no platform fee.

## 38. White-label pricing

Override brand/tenant su Pricing Profile senza rompere guardrail CM.

## 39. Promotional pricing

Prezzi promo sotto Consent/campaign; devono rispettare Minimum Margin Guardrail o richiedere approval.

## 40. Discount

Sconto assoluto/% — tracciato; impatto su CM simulato.

## 41. Coupon

Codice promozionale versionato; stacking rules **OPEN**.

## 42. Referral cost

Costo referral come costo variabile rilevante per CM quando applicabile.

## 43. Sales commission

Provvigioni vendita (sales) distinte da Commission piattaforma e da Partner Cost.

## 44. Dynamic pricing

Aggiustamenti domanda/offerta entro guardrail. Non bypassa Maximum Assignment Budget.

## 45. Surge

Moltiplicatori peak — limiti e approval **OPEN**. Trasparenza Customer richiesta.

## 46. Offer escalation

Aumento Offerte Partner entro budget; history tracciata.

## 47. Counteroffer guardrails

Controfferte entro Maximum Assignment Budget e Minimum Margin Guardrail.

## 48. Margin simulation

Prima di confirm/accept: simulazione CM, Platform Revenue, costi XOR.

## 49. Quote expiration

Quote con expiry; dopo expiry non accettabile. Durata **OPEN**.

## 50. Price versioning

Ogni Quote/Service Order economico versionato; audit override.

## 51. Currency

Currency di Booking e settlement; conversione solo con regole FX.

## 52. FX

Tassi e timing FX per multi-currency — policy **OPEN**.

## 53. Multi-country configuration

Pricing Profile per paese + Local Law Schedule; tax placeholder.

## 54. Pricing approval workflow

Override sotto guardrail → approval role (Owner/Platform). Audit obbligatorio.

## 55. Alerts

Quote sotto minimum margin; accept near budget cap; surge anomaly; FX gap; promo stack risk.

## 56. KPI

CM; utile; take rate (diagnostico); % quote sotto guardrail; budget utilization; promo dilution.

## 57. Decision Engine

Automatiche: block over budget / under margin (se soglia configurata). Manuali: approval override. Soglie numeriche non fissate.

## 58. Audit trail

Rule changes, override, surge activation, coupon redeem, margin simulation results su accept.

## 59. Decisioni approvate

| ID | Decisione |
|----|-----------|
| PRM-DA-01 | CM e utile > GBV/GMV come guida |
| PRM-DA-02 | Commission ≠ Markup ≠ Platform Revenue |
| PRM-DA-03 | Partner Cost XOR Internal Execution Cost |
| PRM-DA-04 | Maximum Assignment Budget |
| PRM-DA-05 | Price versioning + audit |
| PRM-DA-06 | Nessuna %/soglia/fiscalità definitiva in questo draft |

## 60. Decisioni OPEN

| Tema | Riferimento |
|------|-------------|
| % Commission / net rate | DECISIONS #4 |
| Voci NCC obbligatorie go-live | DECISIONS #6 |
| Minimum Margin numerico | — |
| Surge limits | — |
| MoR / tax formulas | BOS |
| FX policy | — |

## 61. Roadmap

1. Domini prezzo + XOR costi
2. Guardrail budget/margin
3. Profili B2C/B2B/Corporate/Exchange
4. Promo/coupon controllati
5. Multi-country + FX

---

## Cronologia revisioni

| Versione | Data | Autore | Descrizione modifica | Stato |
|----------|------|--------|----------------------|-------|
| 0.1.0 | 2026-07-26 | MyChauffeur OS Team | Prima stesura Pricing & Revenue Management Framework. | Draft |

---

*Fine MC-OS-017 v0.1.0 — Draft.*

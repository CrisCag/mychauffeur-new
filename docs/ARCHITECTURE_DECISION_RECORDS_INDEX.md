# MyChauffeur OS — Architecture Decision Records Index

| Campo | Valore |
|-------|--------|
| **Codice documento** | MC-OS-024 |
| **Titolo** | Architecture Decision Records Index |
| **Versione** | 0.1.0 |
| **Stato** | Draft |
| **Data creazione** | 2026-07-26 |
| **Ultima modifica** | 2026-07-26 |
| **Owner** | Chief Enterprise Architect |
| **Autori** | MyChauffeur OS Team |
| **Documenti correlati** | MC-OS-000 · MC-OS-001 · MC-OS-023 · MC-OS-004 · tutti i framework MC-OS-002…022 |
| **Dipendenze** | Architecture Consolidation Release v1; EDGF; framework sorgente delle decisioni |
| **Classificazione** | Official Architecture Decision Register — Draft |
| **Documentation Release** | 0.1 (allineamento previsto) |

---

## Avvertenza

Questo documento è il **registro ufficiale delle decisioni architetturali** già presenti nel corpus MyChauffeur OS.

**Non** crea nuove decisioni.
**Non** modifica decisioni già approvate.
**Non** chiude decisioni OPEN.
**Non** è consulenza legale/fiscale.

I nomi di Domain, Entity, Event, Decision ID restano in **inglese**. Il testo è in **italiano**.

### Nota su MC-OS-010

In EDGF, **MC-OS-010** resta **Riservato** storicamente come “Architecture Decision Record Index”.
Il presente documento (**MC-OS-024**) è l’indice ADR operativo creato in questa fase. La relazione formale 010↔024 resta **OPEN** (`ADR-OPEN-020` / UOD-020): nessuna riassegnazione di codice in questa sessione.

---

## Source of Truth

**MC-OS-024** è la Source of Truth dell’**indice e della numerazione ADR/ADR-OPEN**.

Il contenuto normativo di ciascuna decisione continua a vivere nel **documento sorgente** indicato (BOS, Exchange, Identity, ecc.).
Questo indice **normalizza e collega**, non sostituisce.

Allineamento: MC-OS-023 §23–24 (UOD/UAD), DECISIONS_PENDING (#1–10), decisioni locali framework (alias).

---

## 1. Scopo

Fornire un registro unico navigabile di decisioni **Active** e **OPEN**, con indici per dominio, framework, owner, priorità e stato.

---

## 2. Convenzioni ID

| Prefisso | Significato |
|----------|-------------|
| `ADR-NNN` | Decisione architetturale **approvata** (Active salvo diversa indicazione) |
| `ADR-OPEN-NNN` | Decisione **OPEN** (non chiusa) |
| Alias | ID locali (`UAD-*`, `AIG-DA-*`, `DECISIONS #n`) citati per tracciabilità; non sono decisioni aggiuntive |

---

## 3. Registro decisioni APPROVATE

| ADR ID | Titolo | Decisione normalizzata | Motivazione | Documento sorgente (SoT) | Data | Owner | Impatto | Framework coinvolti | Stato | Alias / note |
|--------|--------|----------------------|-------------|--------------------------|------|-------|---------|---------------------|-------|---------------|
| ADR-001 | Contribution Margin over GBV/GMV | Contribution Margin e utile sono metriche guida prioritari rispetto a GBV/GMV; GBV non è ricavo. | Allineamento BOS: evitare ottimizzazione su volume grezzo. | MC-OS-002 BOS (UAD-001) | 2026-07-26 | Business / Product | KPI, Pricing, Analytics | MC-OS-002,017,019,021 | Active | UAD-001; BOS DA |
| ADR-002 | Partner Cost XOR Internal Execution Cost | Per ogni Assignment: Partner Cost XOR Internal Execution Cost secondo assignment_mode INTERNAL\|PARTNER. | Evitare doppio conteggio costi e ambiguità “costo assegnato”. | MC-OS-002 / MC-OS-009 (UAD-002) | 2026-07-26 | CEA / Pricing | Assignment costing, Settlement | MC-OS-002,009,014,017,019,020 | Active | UAD-002 |
| ADR-003 | No double-count financial remedies | Refund, Compensation, Recovery Cost e Chargeback non si doppiano senza regola esplicita. | Integrità ledger e dispute. | MC-OS-002 / MC-OS-006 (UAD-003) | 2026-07-26 | Finance Ops | Ledger, Dispute | MC-OS-002,006,014,022 | Active | UAD-003 |
| ADR-004 | Booking ≠ Service ≠ Trip ≠ Assignment | Quattro concetti/aggregate e state machine distinti. | Chiarezza operativa e di modello. | MC-OS-014 / MC-OS-009 (UAD-004) | 2026-07-26 | Booking Ops | Persistence, Events, SM | MC-OS-009,011,014,019,020,023 | Active | UAD-004; BSL-DA |
| ADR-005 | Partner Exchange is B2B not B2C | Exchange è marketplace B2B Partner-to-Partner; Originating mantiene il Customer. | Separare modelli commerciali. | MC-OS-012 (UAD-005) | 2026-07-26 | Marketplace & Partner Ops | Marketplace Domain | MC-OS-012,019 | Active | UAD-005; PX |
| ADR-006 | Progressive Data Disclosure | Dati Customer all’Executing per fasi; Customer Price nascosto di default all’Executing. | Privacy e anti-disintermediation. | MC-OS-012 (UAD-006) | 2026-07-26 | Marketplace / Privacy | Disclosure, Config, Events | MC-OS-012,015,016,021 | Active | UAD-006 |
| ADR-007 | UNFILLED release without platform fee | Se Listing UNFILLED: fondi rilasciati/restituiti; nessuna Platform Fee. | Fairness Originating; incentivo matching. | MC-OS-012 (UAD-007) | 2026-07-26 | Marketplace / Finance | Settlement Exchange | MC-OS-012,017,020 | Active | UAD-007 |
| ADR-008 | Holdback requires reason Evidence contestation | Holdback solo con motivazione, Evidence e diritto di contestazione. | Tutela Partner; auditabilità. | MC-OS-005 / MC-OS-006 (UAD-008) | 2026-07-26 | Partner / Finance | Settlement config | MC-OS-005,006,021 | Active | UAD-008 |
| ADR-009 | Person ≠ User ≠ Role ≠ Capability | Identità e autorizzazione separate; deny by default; least privilege. | Sicurezza e chiarezza modello. | MC-OS-015 (UAD-009) | 2026-07-26 | Identity & Security | AuthZ, RLS boundary | MC-OS-015,019,021,022 | Active | UAD-009; IRP-DA |
| ADR-010 | Configuration over hardcoding | Business rules/feature via Configuration versionata; published immutable; no silent override. | Governabilità multi-tenant/country. | MC-OS-021 (UAD-010) | 2026-07-26 | Platform Configuration | Config Domain | MC-OS-017,021,022 | Active | UAD-010; CFM-DA |
| ADR-011 | Flag ≠ Rule; Config ≠ Secret ≠ Permission | Feature Flag distinto da Business Rule; Configuration non è Secret Store né grant Permission. | Boundary chiari. | MC-OS-021 (UAD-011) | 2026-07-26 | Platform / Security | Config, Identity | MC-OS-015,021,022 | Active | UAD-011 |
| ADR-012 | Event as immutable fact | Event ≠ Command; Event ≠ Ledger Entry; eventi immutabili versionati. | EDA coerente. | MC-OS-020 (UAD-012) | 2026-07-26 | Platform Engineering | Eventing | MC-OS-019,020,022 | Active | UAD-012; SEC-DA |
| ADR-013 | AI Recommendation ≠ Decision ≠ Execution | AI Supporting Domain; non possiede aggregate ops; non bypassa Ledger/RBAC/Config/Margin/Compliance. | Controllo rischio e accountability. | MC-OS-022 (UAD-013) | 2026-07-26 | AI Governance | AI Domain, Decision Engine | MC-OS-019,020,021,022 | Active | UAD-013; AIG-DA |
| ADR-014 | Configurable margin and assignment budget guardrails | Maximum Assignment Budget e Minimum Margin Guardrail sono configurabili (valori numerici OPEN). | Protezione CM. | MC-OS-017 (UAD-014) | 2026-07-26 | Pricing / Business Ops | Pricing, Dispatch | MC-OS-014,017,021,022 | Active | UAD-014; PRM-DA |
| ADR-015 | Partner independence no subordination | Partner è impresa indipendente; nessun rapporto di subordinazione. | Compliance lavoristica/contrattuale. | MC-OS-005 (UAD-015) | 2026-07-26 | Partner Legal | Partner model | MC-OS-005,012 | Active | UAD-015 |
| ADR-016 | Tax regime configurable pending professionals | Tax/MoR configurabili come placeholder; nessuna regola fiscale definitiva senza professionisti. | Evitare hardcode fiscale errato. | MC-OS-002 (UAD-016) | 2026-07-26 | Finance / Legal | Tax flags | MC-OS-002,017,021 | Active | UAD-016 — principle only |
| ADR-017 | Append-only audit and financial reversal | Audit append-only; correzioni finanziarie via reversal non overwrite. | Integrità storica. | MC-OS-006 / MC-OS-020 (UAD-017) | 2026-07-26 | Finance / Platform | Ledger, Audit | MC-OS-006,020,022 | Active | UAD-017 |
| ADR-018 | No cross-domain direct state mutation | Nessun Domain modifica direttamente lo stato interno di un altro; Events/Commands pubblici. | SRP e coupling. | MC-OS-019 (UAD-018) | 2026-07-26 | CEA | All domains | MC-OS-019,020,022 | Active | UAD-018; SDA-DA |
| ADR-019 | Analytics and AI are not operational write SoT | Analytics/AI producono proiezioni/recommendation; non SoT write operativa. | Protezione aggregate. | MC-OS-019 / MC-OS-022 (UAD-019) | 2026-07-26 | CEA / AI | Analytics, AI | MC-OS-019,020,022 | Active | UAD-019 |
| ADR-020 | MC-OS codes immutable via EDGF registry | Document Identifier MC-OS immutabile; registro SoT in EDGF. | Governance documentale. | MC-OS-000 (UAD-020) | 2026-07-26 | Documentation Governance | All docs | MC-OS-000 | Active | UAD-020 |
| ADR-021 | Pause new domain frameworks until sync | Fermare nuovi framework di dominio fino al Documentation Sync Plan di MC-OS-023. | Evitare proliferazione pre-sync. | MC-OS-023 (ACR-DA-01) | 2026-07-26 | EA & Doc Governance | Doc roadmap | MC-OS-023 | Active | ACR-DA-01 |
| ADR-022 | Consolidation SoT map is normative for cross-refs | La Source of Truth Map di MC-OS-023 §7 è normativa per cross-reference. | Una sola SoT per materia. | MC-OS-023 (ACR-DA-02) | 2026-07-26 | EA & Doc Governance | All frameworks | MC-OS-023 | Active | ACR-DA-02 |
| ADR-023 | UAD/UOD are candidate unified registers | UAD/UOD in MC-OS-023 sono registri unificati candidati (pre-sync MC-OS-004). | Unificazione decisioni. | MC-OS-023 (ACR-DA-03) | 2026-07-26 | EA & Doc Governance | Decisions | MC-OS-023,004 | Active | ACR-DA-03 |
| ADR-024 | OS Foundation scope recommendation | Lo scope OS Foundation di MC-OS-023 §29 è raccomandazione pre-implementazione (non implementa codice). | Focus implementativo. | MC-OS-023 (ACR-DA-04) | 2026-07-26 | CEA | OS Foundation | MC-OS-023 | Active | ACR-DA-04 |
| ADR-025 | Delivery docs distinct from target architecture | PLATFORM_MAP/HANDOFF (delivery) distinti dalla target architecture. | Evitare confusione stato reale vs target. | MC-OS-023 (ACR-DA-05) | 2026-07-26 | Product / CEA | 007,008 vs Blueprint | MC-OS-007,008,001,023 | Active | ACR-DA-05 |
| ADR-026 | No closing fiscal/legal OPEN in consolidation | La consolidation non chiude OPEN fiscali/legali senza professionisti. | Governance professionale. | MC-OS-023 (ACR-DA-06) | 2026-07-26 | EA & Doc Governance | Finance/Legal OPEN | MC-OS-023 | Active | ACR-DA-06 |

**Totale decisioni approvate registrate: 26** (nessuna nuova; solo indicizzate).

---

## 4. Registro decisioni OPEN

| ADR-OPEN ID | Domanda | Alternative | Framework coinvolti | Impatto | Priorità | Professionista necessario | Bloccante? | Stato | Alias |
|-------------|---------|-------------|---------------------|---------|----------|---------------------------|------------|-------|-------|
| ADR-OPEN-001 | Provider pagamenti? | Stripe, Nexi, PayPal, bonifico+link, altro | MC-OS-004#1,006,016,017 | Alto | P0 | Consulente PSD2/PSP | Bloccante Finance; bloccante Payment impl | OPEN | UOD-001 |
| ADR-OPEN-002 | Policy acconto e rimborso? | % e timing OPEN | MC-OS-004#2,014,018 | Alto | P0 | Avvocato | Bloccante Finance/Checkout | OPEN | UOD-002 |
| ADR-OPEN-003 | Cancellazioni e penali? | Gratis 24h vs penali % OPEN | MC-OS-004#3,014 | Alto | P0 | Avvocato | Bloccante Terms/Refund | OPEN | UOD-003 |
| ADR-OPEN-004 | Struttura commissioni / net rate? | % piattaforma B2C/B2B/Exchange OPEN | MC-OS-004#4,017,012 | Alto | P0 | Finance | Bloccante Settlement/Exchange fee | OPEN | UOD-004 |
| ADR-OPEN-005 | Modello partner portal? | Solo email B2B vs portale documenti | MC-OS-004#5,005 | Medio | P1 | — | Non bloccante OS Foundation | OPEN | UOD-005 |
| ADR-OPEN-006 | Voci NCC obbligatorie go-live? | Subset matrice NCC | MC-OS-004#6,003,017 | Medio | P1 | Normativa trasporto | Parziale Pricing | OPEN | UOD-006 |
| ADR-OPEN-007 | Default assignment mode? | Solo manuale vs offer+accept | MC-OS-004#7,014 | Medio | P1 | — | Impatta Dispatch/Exchange | OPEN | UOD-007 |
| ADR-OPEN-008 | Provider notifiche? | Email/SMS/Push/WhatsApp providers | MC-OS-004#8,016 | Medio | P1 | — | Non bloccante Foundation | OPEN | UOD-008 |
| ADR-OPEN-009 | Lingue go-live? | IT/EN vs +ES/FR/DE/RU | MC-OS-004#9,016,018 | Basso | P2 | — | Non bloccante | OPEN | UOD-009 |
| ADR-OPEN-010 | Criteri go-live MVP? | Auth, pagamenti, solo email request | MC-OS-004#10 | Alto | P0 | — | Parziale OS Found.; bloccante prod | OPEN | UOD-010 |
| ADR-OPEN-011 | Merchant of Record vs intermediario? | Per paese; validazione professionale | MC-OS-002,006 | Critico | P0 | Fiscalista + Avvocato | Bloccante Finance/Invoice/Exchange | OPEN | UOD-011 |
| ADR-OPEN-012 | Event bus / transactional outbox? | Tecnologia OPEN | MC-OS-020,019 | Alto | P1 | — | Parziale Foundation; bloccante integration | OPEN | UOD-012 |
| ADR-OPEN-013 | Modular monolith vs distributed services? | OPEN | MC-OS-019,021,022 | Alto | P1 | CEA | Parziale Foundation | OPEN | UOD-013 |
| ADR-OPEN-014 | Boundary Finance vs Settlement? | Split ownership fine OPEN | MC-OS-019,006 | Alto | P1 | Commercialista | Bloccante Ledger design | OPEN | UOD-014 |
| ADR-OPEN-015 | AI provider e modelli? | Nessuna scelta | MC-OS-022 | Medio | P2 | Privacy + EU AI Act counsel | Non bloccante Foundation | OPEN | UOD-015 |
| ADR-OPEN-016 | Config storage e cache technology? | OPEN | MC-OS-021 | Medio | P1 | — | Parziale Config foundation | OPEN | UOD-016 |
| ADR-OPEN-017 | RLS implementation patterns? | Dettaglio policy OPEN | MC-OS-015, Blueprint §13 | Alto | P0 | Security | Bloccante OS Foundation | OPEN | UOD-017 |
| ADR-OPEN-018 | Holdback/reserve valori numerici? | % e window OPEN | MC-OS-006,021 | Alto | P0 | Legal + Finance | Bloccante Payout | OPEN | UOD-018 |
| ADR-OPEN-019 | Disclosure timing Exchange values? | T_MINUS offsets configurabili; valori OPEN | MC-OS-012,021 | Medio | P1 | Privacy | Bloccante Exchange go-live | OPEN | UOD-019 |
| ADR-OPEN-020 | Relazione MC-OS-010 riservato vs indice ADR operativo? | 010 riservato EDGF; indice creato come MC-OS-024 | MC-OS-000,023,024 | Medio | P1 | CEA / Doc Gov | Non bloccante runtime; governance docs | OPEN | UOD-020 — non chiuso |

**Totale decisioni OPEN registrate: 20** (nessuna chiusa).

---

## 5. Indice cronologico

Tutte le decisioni indicizzate in questa release condividono data documentale **2026-07-26** (data di formalizzazione nei framework / consolidation). Ordine per ID:

### Approvate (cronologia per ID)
ADR-001, ADR-002, ADR-003, ADR-004, ADR-005, ADR-006, ADR-007, ADR-008, ADR-009, ADR-010, ADR-011, ADR-012, ADR-013, ADR-014, ADR-015, ADR-016, ADR-017, ADR-018, ADR-019, ADR-020, ADR-021, ADR-022, ADR-023, ADR-024, ADR-025, ADR-026.

### OPEN (cronologia per ID)

ADR-OPEN-001, ADR-OPEN-002, ADR-OPEN-003, ADR-OPEN-004, ADR-OPEN-005, ADR-OPEN-006, ADR-OPEN-007, ADR-OPEN-008, ADR-OPEN-009, ADR-OPEN-010, ADR-OPEN-011, ADR-OPEN-012, ADR-OPEN-013, ADR-OPEN-014, ADR-OPEN-015, ADR-OPEN-016, ADR-OPEN-017, ADR-OPEN-018, ADR-OPEN-019, ADR-OPEN-020.

---

## 6. Indice per dominio

| Dominio | ADR Active | ADR-OPEN |
|---------|------------|----------|
| Business Economics | ADR-001,002,003,016 | ADR-OPEN-011 |
| Booking / Ops | ADR-004 | ADR-OPEN-002,003,007 |
| Marketplace / Exchange | ADR-005,006,007 | ADR-OPEN-004,019 |
| Partner | ADR-008,015 | ADR-OPEN-005 |
| Identity / Security | ADR-009 | ADR-OPEN-017 |
| Configuration | ADR-010,011 | ADR-OPEN-016 |
| Events / Platform | ADR-012,017,018 | ADR-OPEN-012,013 |
| Pricing / Revenue | ADR-014 | ADR-OPEN-004,006 |
| AI | ADR-013,019 | ADR-OPEN-015 |
| Finance / Settlement | ADR-003,008,017 | ADR-OPEN-001,011,014,018 |
| Documentation / Governance | ADR-020…026 | ADR-OPEN-020 |
| Delivery / CX / Notification | ADR-025 | ADR-OPEN-008,009,010 |

---

## 7. Indice per framework (MC-OS)

| Framework | Ruolo tipico | ADR / OPEN collegati |
|-----------|--------------|----------------------|
| MC-OS-000 | Registry SoT | ADR-020 |
| MC-OS-001 | Blueprint index | cross-ref ADR index |
| MC-OS-002 | Economics SoT | ADR-001,002,003,016; OPEN-011 |
| MC-OS-003 | NCC | OPEN-006 |
| MC-OS-004 | Product pending | OPEN-001…010 |
| MC-OS-005 | Partner legal | ADR-008,015 |
| MC-OS-006 | SFOF | ADR-003,008,017; OPEN-001,011,014,018 |
| MC-OS-007/008 | Delivery/Handoff | ADR-025 |
| MC-OS-009 | Glossary | ADR-002,004 |
| MC-OS-012 | Exchange | ADR-005,006,007; OPEN-004,019 |
| MC-OS-014 | Booking lifecycle | ADR-004; OPEN-002,003,007 |
| MC-OS-015 | Identity | ADR-009; OPEN-017 |
| MC-OS-016 | Notification | OPEN-008,009 |
| MC-OS-017 | Pricing | ADR-001,014; OPEN-004,006 |
| MC-OS-018 | CX | OPEN-002,009 |
| MC-OS-019 | Domains | ADR-018,019; OPEN-012,013,014 |
| MC-OS-020 | Events | ADR-012,017 |
| MC-OS-021 | Configuration | ADR-010,011; OPEN-016,018,019 |
| MC-OS-022 | AI | ADR-013,019; OPEN-015 |
| MC-OS-023 | Consolidation | ADR-021…026; UAD/UOD source |
| MC-OS-024 | Questo indice | — |

---

## 8. Indice per owner

| Owner | ADR Active | ADR-OPEN |
|-------|------------|----------|
| Business / Product | ADR-001 | OPEN-001…011 (product-led) |
| CEA | ADR-002,004,018,019,024 | OPEN-013,020 |
| Marketplace & Partner Ops | ADR-005,006,007 | OPEN-019 |
| Partner Legal / Finance Ops | ADR-008,015,003,017 | OPEN-014,018 |
| Identity & Security | ADR-009 | OPEN-017 |
| Platform Configuration | ADR-010,011 | OPEN-016 |
| Platform Engineering | ADR-012 | OPEN-012 |
| AI Governance | ADR-013 | OPEN-015 |
| Pricing / Business Ops | ADR-014 | OPEN-004,006 |
| Documentation Governance | ADR-020…023,025,026 | OPEN-020 |
| Finance / Legal (OPEN owners) | — | OPEN-001,011,014,018 |

---

## 9. Indice per priorità (solo OPEN)

| Priorità | ADR-OPEN |
|----------|----------|
| **P0** | 001,002,003,004,010,011,017,018 |
| **P1** | 005,006,007,008,012,013,014,016,019,020 |
| **P2** | 009,015 |

---

## 10. Indice per stato

| Stato | ID |
|-------|-----|
| **Active** | ADR-001 … ADR-026 |
| **Superseded** | — (nessuna in questa release) |
| **Deprecated** | — (nessuna in questa release) |
| **OPEN** | ADR-OPEN-001 … ADR-OPEN-020 |

---

## 11. Duplicazioni eliminate (indicizzazione)

Le decisioni locali (`BSL-DA-*`, `PX-*`, `IRP-DA-*`, `CFM-DA-*`, `AIG-DA-*`, `SEC-DA-*`, `SDA-DA-*`, `ACR-DA-*`, `UAD-*`) **non** sono ri-approvate qui: sono **alias** verso `ADR-*`.

`DECISIONS_PENDING` #1–10 mappati 1:1 a `ADR-OPEN-001`…`010`.

Nessuna decisione duplicata come nuovo ADR autonomo.

---

## 12. Conflitti / gap noti (non risolti)

| ID | Descrizione | Stato |
|----|-------------|-------|
| CONF-ADR-01 | MC-OS-010 riservato vs MC-OS-024 indice operativo | OPEN → ADR-OPEN-020 |
| CONF-ADR-02 | MC-OS-004 incompleto rispetto a OPEN post-012 | Sync futuro; non chiuso |
| CONF-ADR-03 | Valori numerici/provider ancora OPEN su molte ADR Active (es. guardrail) | Valori restano OPEN; principio Active |

---

## 13. Relazione con Blueprint e Consolidation

- Blueprint §45 → punta a questo indice (MC-OS-024) e a MC-OS-023/004.
- MC-OS-023 resta SoT dello stato di consolidamento; MC-OS-024 è SoT della numerazione ADR.

---

## Cronologia revisioni

| Versione | Data | Autore | Descrizione modifica | Stato |
|----------|------|--------|----------------------|-------|
| 0.1.0 | 2026-07-26 | MyChauffeur OS Team | Prima stesura ADR Index: indicizzazione UAD/UOD/ACR senza nuove decisioni. | Draft |

---

*Fine MC-OS-024 v0.1.0 — Draft.*

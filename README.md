# MyChauffeur OS

MyChauffeur is a [Next.js](https://nextjs.org) platform for premium NCC / chauffeur bookings (Italian and English).

This repository contains **two tracks** that must not be confused:

| Track | Cosa è | Dove |
|-------|--------|------|
| **OS Foundation** | Domain modules, authorization, commercial booking/quote/service, architecture docs (MC-OS) | `lib/modules/*`, `docs/*`, `supabase/migrations/os_foundation_*` |
| **Legacy product surface** | Marketing site, Daytrip-style `/book` funnel, JSON/API pricing & trip-ops | `app/[locale]/` (non-demo), `app/api/*`, `lib/platform/*`, `data/*` |
| **Founder Demo** | Vertical slice in-memory Quote → Booking → Service (non-production) | `app/[locale]/demo`, `lib/demo`, `components/demo` |

**Entry points for humans and agents:**

- Architecture index: [`docs/MASTER_BLUEPRINT.md`](docs/MASTER_BLUEPRINT.md) (MC-OS-001)
- Baseline freeze **B001**: [`docs/ARCHITECTURE_BASELINE_FREEZE_V1.md`](docs/ARCHITECTURE_BASELINE_FREEZE_V1.md) (MC-OS-025)
- Documentation governance (EDGF): [`docs/DOCUMENTATION_MANAGEMENT_FRAMEWORK.md`](docs/DOCUMENTATION_MANAGEMENT_FRAMEWORK.md) (MC-OS-000)
- Operational map: [`PLATFORM_MAP.md`](PLATFORM_MAP.md)
- Session handoff: [`HANDOFF.md`](HANDOFF.md)

## OS Foundation (implemented in code)

Present under `lib/modules/` (Domain + in-memory repositories + tests; **not** wired as production persistence):

- **organizations** / **identity** / authorization (membership, roles, permissions, engine)
- **bookings** (+ commercial snapshots)
- **quotes**
- **customers**
- **services**

SQL migration **files** for Foundation live in `supabase/migrations/` (`20260726*` … `20260802*`).
Presence of a file **does not** mean it has been applied to any live database. Treat application status as **unverified** unless explicitly confirmed.

## Founder Demo

Local-only demo at `/[locale]/demo` and `/[locale]/demo/ops`.

- Uses Foundation domain APIs with **in-memory** stores
- Gated off when `NODE_ENV === "production"` (`notFound`)
- Fictional data and non-binding demo prices — **not** a customer product feature

## Architecture documentation (Baseline B001)

Logical map of official MyChauffeur OS docs (Baseline **B001** / MC-OS-025).
Files remain under `docs/` (and root for Platform Map / Handoff): **no** physical `BUSINESS/` / `GOVERNANCE/` folders yet.

```text
README
│
├── MASTER BLUEPRINT
│
├── BUSINESS
│   ├── BOS
│   ├── Pricing
│   └── Customer Experience
│
├── MARKETPLACE
│   ├── Partner Framework
│   └── Partner Exchange
│
├── FINANCE
│   ├── Settlement
│   └── Revenue
│
├── ARCHITECTURE
│   ├── Domain Model
│   ├── Event Catalog
│   ├── System Architecture
│   └── AI Governance
│
├── GOVERNANCE
│   ├── EDGF
│   ├── ADR
│   └── Baseline
│
└── DIAGRAMS
    └── DGM-001 … DGM-030
```

| Nodo | Documento | Codice |
|------|-----------|--------|
| Master Blueprint | [`docs/MASTER_BLUEPRINT.md`](docs/MASTER_BLUEPRINT.md) | MC-OS-001 |
| BOS | [`docs/BUSINESS_OPERATING_SYSTEM.md`](docs/BUSINESS_OPERATING_SYSTEM.md) | MC-OS-002 |
| Pricing | [`docs/PRICING_AND_REVENUE_MANAGEMENT_FRAMEWORK.md`](docs/PRICING_AND_REVENUE_MANAGEMENT_FRAMEWORK.md) | MC-OS-017 |
| Customer Experience | [`docs/CUSTOMER_EXPERIENCE_FRAMEWORK.md`](docs/CUSTOMER_EXPERIENCE_FRAMEWORK.md) | MC-OS-018 |
| Partner Framework | [`docs/PARTNER_LEGAL_AND_OPERATING_FRAMEWORK.md`](docs/PARTNER_LEGAL_AND_OPERATING_FRAMEWORK.md) | MC-OS-005 |
| Partner Exchange | [`docs/PARTNER_EXCHANGE_MARKETPLACE_FRAMEWORK.md`](docs/PARTNER_EXCHANGE_MARKETPLACE_FRAMEWORK.md) | MC-OS-012 |
| Settlement | [`docs/SETTLEMENT_AND_FINANCIAL_OPERATIONS_FRAMEWORK.md`](docs/SETTLEMENT_AND_FINANCIAL_OPERATIONS_FRAMEWORK.md) | MC-OS-006 |
| Revenue | Pricing (MC-OS-017) + BOS (MC-OS-002) | — |
| Domain Model | [`docs/BUSINESS_ENTITY_MODEL.md`](docs/BUSINESS_ENTITY_MODEL.md) · [`docs/DOMAIN_GLOSSARY_AND_BUSINESS_DICTIONARY.md`](docs/DOMAIN_GLOSSARY_AND_BUSINESS_DICTIONARY.md) · [`docs/SYSTEM_DOMAIN_ARCHITECTURE.md`](docs/SYSTEM_DOMAIN_ARCHITECTURE.md) | MC-OS-011 · 009 · 019 |
| Event Catalog | [`docs/SYSTEM_EVENT_CATALOG.md`](docs/SYSTEM_EVENT_CATALOG.md) | MC-OS-020 |
| System Architecture | [`docs/SYSTEM_DOMAIN_ARCHITECTURE.md`](docs/SYSTEM_DOMAIN_ARCHITECTURE.md) · Diagram catalog | MC-OS-019 · 013 |
| AI Governance | [`docs/AI_AND_AUTOMATION_GOVERNANCE_FRAMEWORK.md`](docs/AI_AND_AUTOMATION_GOVERNANCE_FRAMEWORK.md) | MC-OS-022 |
| EDGF | [`docs/DOCUMENTATION_MANAGEMENT_FRAMEWORK.md`](docs/DOCUMENTATION_MANAGEMENT_FRAMEWORK.md) | MC-OS-000 |
| ADR | [`docs/ARCHITECTURE_DECISION_RECORDS_INDEX.md`](docs/ARCHITECTURE_DECISION_RECORDS_INDEX.md) | MC-OS-024 |
| Baseline | [`docs/ARCHITECTURE_BASELINE_FREEZE_V1.md`](docs/ARCHITECTURE_BASELINE_FREEZE_V1.md) | MC-OS-025 |
| Diagrams | [`docs/SYSTEM_ARCHITECTURE_AND_PROCESS_DIAGRAMS.md`](docs/SYSTEM_ARCHITECTURE_AND_PROCESS_DIAGRAMS.md) | MC-OS-013 |

**Also in Baseline B001** (not drawn above): Booking Lifecycle (014), Identity (015), Notification (016), Configuration (021), Consolidation (023), NCC Tariff requirements (003).
**Post-B001 / domain specs (tracked):** Software Architecture (026), Data Architecture (027), Security (028), Permission Catalog (029), Dispatch (030), Support (031), Commercial Booking (032).
**Delivery / session (not normative Baseline):** [`PLATFORM_MAP.md`](PLATFORM_MAP.md), [`HANDOFF.md`](HANDOFF.md), [`docs/DECISIONS_PENDING.md`](docs/DECISIONS_PENDING.md).

Freeze: [`docs/ARCHITECTURE_BASELINE_FREEZE_V1.md`](docs/ARCHITECTURE_BASELINE_FREEZE_V1.md). ADR index operational = **MC-OS-024** (**MC-OS-010** remains reserved — do not reuse).

## Getting Started

```bash
npm run dev
# or yarn / pnpm / bun
```

Open [http://localhost:3000](http://localhost:3000) (or the port shown by Next; local ops often use **3002**).

Quality checks:

```bash
npm run test:run
npx tsc --noEmit
```

## Legacy booking flow (product surface)

Not the OS Foundation Aggregate path. Current Daytrip-style funnel:

- Frontend form: `components/sections/booking-widget.tsx`
- API endpoint: `app/api/booking/route.ts`
- Storage helper: `lib/booking-requests.ts`
- Email helper: `lib/booking-email.ts`
- Runtime data (never commit): `data/booking-requests.json`, `data/operational-trips.json` — see `data/README.md`

The booking widget posts to `POST /api/booking` with:

```json
{
  "pickupLocation": "FCO Terminal 1",
  "dropoffLocation": "Via Cascia 8, Spoleto",
  "rideDate": "2026-05-01",
  "rideTime": "09:30",
  "locale": "it"
}
```

If valid, the endpoint stores the request and returns `201` with
`{ "ok": true, "requestId": "...", "destinationEmail": "...", "emailSent": true|false }`.

## Booking email delivery

To send booking requests by email in production, configure:

```bash
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
BOOKING_FROM_EMAIL=booking@mychauffeur.it
```

Routing logic:

- standard requests → `info@mychauffeur.it`
- B2B requests → `bypartners@mychauffeur.it`

## Google Maps (autocomplete + route map)

1. In [Google Cloud Console](https://console.cloud.google.com/) select the MyChauffeur project.
2. Enable Maps JavaScript API, **Places API (New)**, Directions API, Geocoding API.
3. Create an API key; copy `.env.example` → `.env.local`:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...
GOOGLE_MAPS_API_KEY=AIza...
```

4. Restrict the key by site/API; billing must be enabled.
5. Restart `npm run dev`. Functional cookies are required for autocomplete.

## Notes

- Google Places autocomplete runs only when cookie consent allows third-party maps.
- Do **not** treat Founder Demo prices or fixtures as commercial offers.
- Do **not** assume Foundation SQL migrations are applied without evidence.
- Product OPEN decisions: [`docs/DECISIONS_PENDING.md`](docs/DECISIONS_PENDING.md); architectural ADR-OPEN: [`docs/ARCHITECTURE_DECISION_RECORDS_INDEX.md`](docs/ARCHITECTURE_DECISION_RECORDS_INDEX.md).

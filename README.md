MyChauffeur is a [Next.js](https://nextjs.org) web app for premium NCC bookings in Italian and English.

## Getting Started

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Booking flow (frontend + backend)

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
- standard requests -> `info@mychauffeur.it`
- B2B requests -> `bypartners@mychauffeur.it`

## Google Maps (autocomplete + mappa percorso)

1. In [Google Cloud Console](https://console.cloud.google.com/) seleziona il progetto MyChauffeur.
2. **API e servizi → Libreria** — abilita:
   - Maps JavaScript API
   - **Places API (New)** ← autocomplete indirizzi (widget nuovo)
   - Directions API
   - Geocoding API
3. **Credenziali → Crea credenziali → Chiave API**.
4. Copia `.env.example` in `.env.local` e incolla la chiave:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...
GOOGLE_MAPS_API_KEY=AIza...
```

(`GOOGLE_MAPS_API_KEY` è usata lato server per km/percorso; puoi usare la stessa chiave.)

5. **Restrizioni chiave (consigliato):**
   - Applicazione: siti web → `http://127.0.0.1:3002/*`, `http://localhost:3002/*`, `https://www.mychauffeur.it/*`
   - API: **Places API (New)** (autocomplete server), Maps JavaScript API, Directions API, Geocoding API
6. **Fatturazione** attiva sul progetto Google Cloud (obbligatoria per Maps).
7. Riavvia `npm run dev`. Accetta i **cookie funzionali** nel banner (autocomplete invia query al nostro server → Google Places).

## Notes

- Google Places autocomplete is enabled only when cookie consent allows third-party maps.
- To enable autocomplete in local/dev, set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in `.env.local`.

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
- Local data file (runtime): `data/booking-requests.json` (ignored by git)

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

## Notes

- Google Places autocomplete is enabled only when cookie consent allows third-party maps.
- To enable autocomplete in local/dev, set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in `.env.local`.

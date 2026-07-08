# Supabase — Trip operations (driver + client)

Migration: `migrations/202606240001_trip_ops_driver_client.sql`

Apply when the Supabase project **MyChauffeurUmbria** is active:

```bash
supabase db push
```

Or paste the SQL into the Supabase SQL Editor.

## Main tables

| Table | Purpose |
|-------|---------|
| `operational_trips` | Operational trip, `comfort_mode`, driver |
| `trip_stops` | Stops with booked + in-app extra minutes |
| `wait_sessions` | Pickup/stop timer, `red_starts_at`, phases |
| `stop_time_purchases` | Customer in-app extra 15–120 min |
| `trip_status_events` | Driver status audit log |
| `trip_no_show_reports` + evidence | No-show + photo proof |
| `driver_location_pings` | Live GPS (Realtime) |
| `wait_policy_profiles` | Rates X/Y, VIP markup (admin) |

## Timer rules (`lib/platform/wait-timer.ts`)

**Standard:** booked only → red at booked × 1.2; with in-app extra → red at booked + extra (no grace).

**VIP No Rush:** always 20% grace on covered time → red at (booked + extra) × 1.2.

Example 60 + 30 in-app: Standard red at **90 min**, VIP at **108 min**.

## Realtime (enable in dashboard)

- `wait_sessions`
- `driver_location_pings`

## Local config until admin UI

- `data/comfort-mode-config.json`
- `data/wait-time-rates.json`

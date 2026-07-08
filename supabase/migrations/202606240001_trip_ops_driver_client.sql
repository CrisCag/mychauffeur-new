-- MyChauffeur — Trip operations: driver states, wait timers, stop purchases, no-show proofs
-- Apply when Supabase project is active: supabase db push / SQL editor

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

CREATE TYPE trip_comfort_mode AS ENUM ('standard', 'no_rush_vip');

CREATE TYPE trip_lifecycle_status AS ENUM (
  'draft',
  'confirmed',
  'assigned',
  'tracking_available',
  'en_route_to_pickup',
  'arrived_at_pickup',
  'waiting_at_pickup',
  'passenger_on_board',
  'en_route_to_destination',
  'at_stop',
  'en_route_from_stop',
  'arrived_at_destination',
  'completed',
  'no_show',
  'cancelled'
);

CREATE TYPE wait_session_kind AS ENUM ('pickup', 'stop');

CREATE TYPE wait_timer_phase AS ENUM (
  'included_countdown',
  'grace_countdown',
  'penalty',
  'stopped'
);

CREATE TYPE trip_evidence_type AS ENUM ('photo', 'screenshot', 'document', 'other');

-- ---------------------------------------------------------------------------
-- Config (gestionale — tariffe attesa / extra / penale)
-- ---------------------------------------------------------------------------

CREATE TABLE wait_policy_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  label_it TEXT NOT NULL,
  label_en TEXT NOT NULL,
  pickup_type TEXT,
  -- Pickup wait (gratuita prima del rosso)
  pickup_included_wait_minutes INT NOT NULL DEFAULT 15 CHECK (pickup_included_wait_minutes >= 0),
  pickup_penalty_rate_eur_per_min NUMERIC(10, 4) NOT NULL DEFAULT 1.20,
  -- Stop: extra proattivo in app (tariffa X) e penale ritardo (tariffa Y)
  stop_extra_purchase_rate_eur_per_min NUMERIC(10, 4) NOT NULL DEFAULT 0.80,
  stop_penalty_rate_eur_per_min NUMERIC(10, 4) NOT NULL DEFAULT 1.50,
  stop_max_extra_purchase_minutes INT NOT NULL DEFAULT 120 CHECK (stop_max_extra_purchase_minutes > 0),
  stop_grace_percent NUMERIC(5, 2) NOT NULL DEFAULT 20.00,
  -- VIP
  no_rush_markup_percent NUMERIC(5, 2) NOT NULL DEFAULT 18.00,
  vip_stop_grace_after_extra BOOLEAN NOT NULL DEFAULT TRUE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO wait_policy_profiles (code, label_it, label_en, pickup_type)
VALUES
  ('default', 'Standard Italia', 'Standard Italy', NULL),
  ('airport_fco', 'Aeroporto FCO', 'FCO Airport', 'airport_fco'),
  ('hotel', 'Hotel / indirizzo', 'Hotel / address', 'hotel')
ON CONFLICT (code) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Operational trip (collegamento booking → driver app)
-- ---------------------------------------------------------------------------

CREATE TABLE operational_trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_request_id TEXT,
  quote_id UUID,
  comfort_mode trip_comfort_mode NOT NULL DEFAULT 'standard',
  wait_policy_id UUID REFERENCES wait_policy_profiles(id),
  lifecycle_status trip_lifecycle_status NOT NULL DEFAULT 'confirmed',
  pickup_address TEXT NOT NULL,
  pickup_lat NUMERIC(10, 7),
  pickup_lng NUMERIC(10, 7),
  pickup_place_id TEXT,
  destination_address TEXT NOT NULL,
  destination_lat NUMERIC(10, 7),
  destination_lng NUMERIC(10, 7),
  destination_place_id TEXT,
  scheduled_pickup_at TIMESTAMPTZ NOT NULL,
  scheduled_dropoff_at TIMESTAMPTZ,
  driver_id UUID,
  vehicle_type TEXT,
  passenger_name TEXT,
  passenger_phone TEXT,
  passenger_email TEXT,
  quoted_price_eur NUMERIC(10, 2),
  no_rush_markup_applied_percent NUMERIC(5, 2),
  tracking_started_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_operational_trips_driver ON operational_trips(driver_id);
CREATE INDEX idx_operational_trips_status ON operational_trips(lifecycle_status);
CREATE INDEX idx_operational_trips_scheduled ON operational_trips(scheduled_pickup_at);

-- ---------------------------------------------------------------------------
-- Stops (fermate Daytrip sul viaggio)
-- ---------------------------------------------------------------------------

CREATE TABLE trip_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES operational_trips(id) ON DELETE CASCADE,
  sequence_index INT NOT NULL CHECK (sequence_index >= 0),
  kind TEXT NOT NULL CHECK (kind IN ('catalog', 'custom')),
  poi_id TEXT,
  label TEXT NOT NULL,
  address TEXT,
  lat NUMERIC(10, 7),
  lng NUMERIC(10, 7),
  booked_duration_minutes INT NOT NULL CHECK (booked_duration_minutes >= 15),
  extra_purchased_minutes INT NOT NULL DEFAULT 0 CHECK (extra_purchased_minutes >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (trip_id, sequence_index)
);

-- ---------------------------------------------------------------------------
-- Event log (audit stati)
-- ---------------------------------------------------------------------------

CREATE TABLE trip_status_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES operational_trips(id) ON DELETE CASCADE,
  stop_id UUID REFERENCES trip_stops(id) ON DELETE SET NULL,
  status trip_lifecycle_status NOT NULL,
  source TEXT NOT NULL DEFAULT 'driver_app' CHECK (source IN ('driver_app', 'customer_app', 'dispatch', 'system', 'geofence')),
  driver_id UUID,
  lat NUMERIC(10, 7),
  lng NUMERIC(10, 7),
  payload JSONB NOT NULL DEFAULT '{}',
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_trip_status_events_trip ON trip_status_events(trip_id, occurred_at DESC);

-- ---------------------------------------------------------------------------
-- Sessioni attesa (pickup + fermate) — timer countdown / penale
-- ---------------------------------------------------------------------------

CREATE TABLE wait_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES operational_trips(id) ON DELETE CASCADE,
  stop_id UUID REFERENCES trip_stops(id) ON DELETE CASCADE,
  kind wait_session_kind NOT NULL,
  comfort_mode trip_comfort_mode NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  -- Minuti coperti al momento dell'ultimo ricalcolo
  booked_minutes INT NOT NULL DEFAULT 0,
  extra_app_minutes INT NOT NULL DEFAULT 0,
  grace_minutes INT NOT NULL DEFAULT 0,
  red_starts_at TIMESTAMPTZ NOT NULL,
  phase wait_timer_phase NOT NULL DEFAULT 'included_countdown',
  penalty_minutes INT NOT NULL DEFAULT 0,
  penalty_amount_eur NUMERIC(10, 2) NOT NULL DEFAULT 0,
  penalty_rate_eur_per_min NUMERIC(10, 4) NOT NULL,
  driver_notified_red_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT wait_sessions_stop_required CHECK (
    (kind = 'pickup' AND stop_id IS NULL) OR (kind = 'stop' AND stop_id IS NOT NULL)
  )
);

CREATE INDEX idx_wait_sessions_trip ON wait_sessions(trip_id);
CREATE INDEX idx_wait_sessions_active ON wait_sessions(trip_id) WHERE ended_at IS NULL;

-- ---------------------------------------------------------------------------
-- Acquisti extra time in app (cliente, max 120 min per fermata)
-- ---------------------------------------------------------------------------

CREATE TABLE stop_time_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES operational_trips(id) ON DELETE CASCADE,
  stop_id UUID NOT NULL REFERENCES trip_stops(id) ON DELETE CASCADE,
  wait_session_id UUID REFERENCES wait_sessions(id) ON DELETE SET NULL,
  minutes_purchased INT NOT NULL CHECK (minutes_purchased IN (15, 30, 45, 60)),
  rate_eur_per_min NUMERIC(10, 4) NOT NULL,
  amount_eur NUMERIC(10, 2) NOT NULL,
  comfort_mode trip_comfort_mode NOT NULL,
  payment_reference TEXT,
  purchased_by TEXT NOT NULL DEFAULT 'customer_app',
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_stop_time_purchases_stop ON stop_time_purchases(stop_id);

-- ---------------------------------------------------------------------------
-- No-show + prove
-- ---------------------------------------------------------------------------

CREATE TABLE trip_no_show_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES operational_trips(id) ON DELETE CASCADE,
  wait_session_id UUID REFERENCES wait_sessions(id) ON DELETE SET NULL,
  driver_id UUID,
  reported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  lat NUMERIC(10, 7),
  lng NUMERIC(10, 7),
  wait_total_minutes INT,
  penalty_minutes INT,
  penalty_amount_eur NUMERIC(10, 2),
  driver_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT
);

CREATE TABLE trip_no_show_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES trip_no_show_reports(id) ON DELETE CASCADE,
  evidence_type trip_evidence_type NOT NULL DEFAULT 'photo',
  storage_path TEXT NOT NULL,
  caption TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- GPS autista (tracking T-60 → fine servizio)
-- ---------------------------------------------------------------------------

CREATE TABLE driver_location_pings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES operational_trips(id) ON DELETE CASCADE,
  driver_id UUID,
  lat NUMERIC(10, 7) NOT NULL,
  lng NUMERIC(10, 7) NOT NULL,
  heading NUMERIC(6, 2),
  speed_kmh NUMERIC(6, 2),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_driver_pings_trip_time ON driver_location_pings(trip_id, recorded_at DESC);

-- ---------------------------------------------------------------------------
-- Realtime: abilitare replication su wait_sessions e driver_location_pings
-- (da Supabase Dashboard → Database → Publications, o):
-- ALTER PUBLICATION supabase_realtime ADD TABLE wait_sessions;
-- ALTER PUBLICATION supabase_realtime ADD TABLE driver_location_pings;

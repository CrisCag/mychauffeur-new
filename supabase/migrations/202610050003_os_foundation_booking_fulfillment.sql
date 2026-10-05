-- MyChauffeur OS Foundation — Booking fulfillment lifecycle alignment.
-- Aggregate status only; Trip operational details remain outside Booking.
-- Migration file only: MUST NOT be treated as applied by application code.

ALTER TABLE bookings
  ADD COLUMN fulfillment_started_at TIMESTAMPTZ NULL,
  ADD COLUMN completed_at TIMESTAMPTZ NULL;

ALTER TABLE bookings
  DROP CONSTRAINT ck_bookings_status,
  DROP CONSTRAINT ck_bookings_confirmed_at_status,
  DROP CONSTRAINT ck_bookings_commercial_snapshots_by_status,
  ADD CONSTRAINT ck_bookings_status CHECK (status IN (
    'DRAFT', 'PENDING_CONFIRMATION', 'CONFIRMED', 'IN_PROGRESS',
    'COMPLETED', 'CANCELLED', 'EXPIRED'
  )),
  ADD CONSTRAINT ck_bookings_confirmed_at_status CHECK (
    (status IN ('CONFIRMED', 'IN_PROGRESS', 'COMPLETED') AND confirmed_at IS NOT NULL)
    OR
    (status NOT IN ('CONFIRMED', 'IN_PROGRESS', 'COMPLETED') AND confirmed_at IS NULL)
  ),
  ADD CONSTRAINT ck_bookings_fulfillment_started_status CHECK (
    (status IN ('IN_PROGRESS', 'COMPLETED') AND fulfillment_started_at IS NOT NULL)
    OR
    (status NOT IN ('IN_PROGRESS', 'COMPLETED') AND fulfillment_started_at IS NULL)
  ),
  ADD CONSTRAINT ck_bookings_completed_at_status CHECK (
    (status = 'COMPLETED' AND completed_at IS NOT NULL)
    OR
    (status <> 'COMPLETED' AND completed_at IS NULL)
  ),
  ADD CONSTRAINT ck_bookings_fulfillment_timestamp_order CHECK (
    (fulfillment_started_at IS NULL OR fulfillment_started_at >= confirmed_at)
    AND (completed_at IS NULL OR completed_at >= fulfillment_started_at)
    AND updated_at >= COALESCE(completed_at, fulfillment_started_at, confirmed_at, created_at)
  ),
  ADD CONSTRAINT ck_bookings_commercial_snapshots_by_status CHECK (
    (
      status IN ('CONFIRMED', 'IN_PROGRESS', 'COMPLETED')
      AND price_snapshot IS NOT NULL
      AND policy_snapshot IS NOT NULL
      AND contact_snapshot IS NOT NULL
      AND billing_snapshot IS NOT NULL
      AND commercial_revision = 1
    )
    OR
    (
      status = 'CANCELLED'
      AND (
        (
          price_snapshot IS NULL
          AND policy_snapshot IS NULL
          AND contact_snapshot IS NULL
          AND billing_snapshot IS NULL
          AND commercial_revision = 0
        )
        OR (
          price_snapshot IS NOT NULL
          AND policy_snapshot IS NOT NULL
          AND contact_snapshot IS NOT NULL
          AND billing_snapshot IS NOT NULL
          AND commercial_revision = 1
        )
      )
    )
    OR
    (
      status IN ('DRAFT', 'PENDING_CONFIRMATION', 'EXPIRED')
      AND price_snapshot IS NULL
      AND policy_snapshot IS NULL
      AND contact_snapshot IS NULL
      AND billing_snapshot IS NULL
      AND commercial_revision = 0
    )
  );

-- Existing bookings RLS remains ENABLED and FORCED. No policy or GRANT is added.

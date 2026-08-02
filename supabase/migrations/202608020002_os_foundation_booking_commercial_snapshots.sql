-- MyChauffeur OS Foundation — Booking Commercial Snapshots
-- Step 6 Commercial Snapshot Foundation
--
-- Incremental on 202608020001_os_foundation_bookings.sql (do NOT alter Step 5).
-- Adds Price / Policy / Contact / Billing snapshot columns frozen at confirmation.
--
-- Domain SoT remains the Booking Aggregate. JSONB columns are persistence shape,
-- not a runtime JSON Source of Truth.
--
-- Append-only BookingRevision ledger is NOT implemented here.
-- PostgreSQL CHECK constraints can enforce presence/absence by status, but cannot
-- alone guarantee historical append-only (prevent UPDATE overwrite of prior
-- snapshot values) without triggers. Domain forbids overwrite; future revisions
-- will be append-only rows. Do NOT add incomplete triggers that pretend to be
-- a full revision ledger.
--
-- RLS remains ENABLE + FORCE. No permissive policies. Migration not applied.

ALTER TABLE bookings
  ADD COLUMN price_snapshot JSONB NULL,
  ADD COLUMN policy_snapshot JSONB NULL,
  ADD COLUMN contact_snapshot JSONB NULL,
  ADD COLUMN billing_snapshot JSONB NULL,
  ADD COLUMN commercial_revision INTEGER NOT NULL DEFAULT 0;

ALTER TABLE bookings
  ADD CONSTRAINT ck_bookings_commercial_revision_non_negative
    CHECK (commercial_revision >= 0);

-- No partial commercial snapshot sets.
ALTER TABLE bookings
  ADD CONSTRAINT ck_bookings_commercial_snapshots_all_or_none
    CHECK (
      (
        price_snapshot IS NULL
        AND policy_snapshot IS NULL
        AND contact_snapshot IS NULL
        AND billing_snapshot IS NULL
      )
      OR (
        price_snapshot IS NOT NULL
        AND policy_snapshot IS NOT NULL
        AND contact_snapshot IS NOT NULL
        AND billing_snapshot IS NOT NULL
      )
    );

-- Status coupling (Step 6):
-- CONFIRMED: complete snapshots + commercial_revision = 1
-- CANCELLED pre-confirm: no snapshots + revision 0
-- CANCELLED post-confirm: complete snapshots + commercial_revision = 1
-- DRAFT / PENDING_CONFIRMATION / EXPIRED: none + revision 0
ALTER TABLE bookings
  ADD CONSTRAINT ck_bookings_commercial_snapshots_by_status
    CHECK (
      (
        status = 'CONFIRMED'
        AND price_snapshot IS NOT NULL
        AND policy_snapshot IS NOT NULL
        AND contact_snapshot IS NOT NULL
        AND billing_snapshot IS NOT NULL
        AND commercial_revision = 1
      )
      OR (
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
      OR (
        status IN ('DRAFT', 'PENDING_CONFIRMATION', 'EXPIRED')
        AND price_snapshot IS NULL
        AND policy_snapshot IS NULL
        AND contact_snapshot IS NULL
        AND billing_snapshot IS NULL
        AND commercial_revision = 0
      )
    );

-- Readiness note for future append-only BookingRevision (not created here).
COMMENT ON COLUMN bookings.commercial_revision IS
  'Commercial freeze revision readiness. 0 = none; >=1 = confirmed freeze. Future BookingRevision rows are append-only; do not overwrite snapshots in place.';

COMMENT ON COLUMN bookings.price_snapshot IS
  'Frozen customer-facing PriceSnapshot at confirmation. Tip/margin excluded. Not Pricing Engine state.';

COMMENT ON COLUMN bookings.policy_snapshot IS
  'Frozen PolicySnapshot at confirmation.';

COMMENT ON COLUMN bookings.contact_snapshot IS
  'Frozen minimized ContactSnapshot at confirmation.';

COMMENT ON COLUMN bookings.billing_snapshot IS
  'Frozen BillingSnapshot at confirmation. No card/token secrets.';

-- RLS posture unchanged: remain enabled and forced; no policies added.
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings FORCE ROW LEVEL SECURITY;

-- Deny-by-default readiness only. No permissive RLS policies. No GRANT.
-- This migration MUST NOT be treated as applied by application code in this step.

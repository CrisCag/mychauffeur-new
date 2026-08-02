-- MyChauffeur OS Foundation — Bookings
-- Step 5 Booking Foundation
--
-- Commercial Booking Aggregate shell (MC-OS-032 / MC-OS-014 boundaries).
-- Does NOT include Quote, Pricing, Payment, Service generation, Dispatch,
-- Assignment, Driver, Vehicle, GPS, SupportCase, Ledger, or UI/API wiring.
--
-- RLS is ENABLED and FORCED with no permissive policies.
-- Definitive Authorization/RLS policies will be introduced in a later step.
-- Supabase service_role bypasses RLS by platform design and MUST NOT replace
-- Application Authorization (MC-OS-015 / MC-OS-028 / MC-OS-029).
--
-- This migration is written for foundation readiness and MUST NOT be treated
-- as applied by application code in this step.

-- ---------------------------------------------------------------------------
-- bookings
-- ---------------------------------------------------------------------------

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  organization_id UUID NOT NULL,
  booking_number TEXT NOT NULL,
  booked_by_actor_id UUID NOT NULL,
  customer_id UUID NULL,
  guest_customer_snapshot JSONB NULL,
  source TEXT NOT NULL,
  status TEXT NOT NULL,
  requested_at TIMESTAMPTZ NOT NULL,
  confirmed_at TIMESTAMPTZ NULL,
  cancelled_at TIMESTAMPTZ NULL,
  expired_at TIMESTAMPTZ NULL,
  version INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT fk_bookings_tenant
    FOREIGN KEY (tenant_id) REFERENCES tenants (id),
  CONSTRAINT fk_bookings_organization
    FOREIGN KEY (organization_id) REFERENCES organizations (id),
  CONSTRAINT fk_bookings_org_tenant
    FOREIGN KEY (organization_id, tenant_id)
      REFERENCES organizations (id, tenant_id),

  -- booked_by_actor_id is an Actor reference (Identity). No dedicated actors
  -- table exists yet; FK deferred. Stored as UUID for future linking.
  -- customer_id similarly deferred until Customer module exists.

  CONSTRAINT ck_bookings_status
    CHECK (status IN (
      'DRAFT',
      'PENDING_CONFIRMATION',
      'CONFIRMED',
      'CANCELLED',
      'EXPIRED'
    )),
  CONSTRAINT ck_bookings_source
    CHECK (source IN (
      'B2C_WEB',
      'B2C_APP',
      'B2B_PORTAL',
      'HOTEL_PORTAL',
      'AGENCY_PORTAL',
      'CORPORATE_PORTAL',
      'API',
      'SUPPORT_CREATED',
      'OWNER_CREATED',
      'IMPORTED',
      'PARTNER_REFERRAL'
    )),
  CONSTRAINT ck_bookings_version_non_negative
    CHECK (version >= 0),
  CONSTRAINT ck_bookings_booking_number_not_blank
    CHECK (length(btrim(booking_number)) > 0),
  CONSTRAINT ck_bookings_customer_or_guest
    CHECK (
      customer_id IS NOT NULL
      OR guest_customer_snapshot IS NOT NULL
    ),
  CONSTRAINT ck_bookings_created_updated
    CHECK (created_at <= updated_at),
  CONSTRAINT ck_bookings_confirmed_at_status
    CHECK (
      (status = 'CONFIRMED' AND confirmed_at IS NOT NULL)
      OR (status <> 'CONFIRMED' AND confirmed_at IS NULL)
    ),
  CONSTRAINT ck_bookings_cancelled_at_status
    CHECK (
      (status = 'CANCELLED' AND cancelled_at IS NOT NULL)
      OR (status <> 'CANCELLED' AND cancelled_at IS NULL)
    ),
  CONSTRAINT ck_bookings_expired_at_status
    CHECK (
      (status = 'EXPIRED' AND expired_at IS NOT NULL)
      OR (status <> 'EXPIRED' AND expired_at IS NULL)
    ),

  CONSTRAINT uq_bookings_tenant_org_booking_number
    UNIQUE (tenant_id, organization_id, booking_number)
);

CREATE UNIQUE INDEX uq_bookings_id_tenant_org
  ON bookings (id, tenant_id, organization_id);

CREATE INDEX idx_bookings_tenant_org
  ON bookings (tenant_id, organization_id);

CREATE INDEX idx_bookings_tenant_org_status
  ON bookings (tenant_id, organization_id, status);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings FORCE ROW LEVEL SECURITY;

-- No policies on bookings: deny-by-default for non-bypass roles.
-- Definitive Authorization/RLS policies: deferred to Authorization/RLS step.
-- No permissive policies. No policies based on client-provided tenant id.

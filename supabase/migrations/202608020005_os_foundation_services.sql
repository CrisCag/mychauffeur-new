-- MyChauffeur OS Foundation — Services
-- Step 9 Service Aggregate Foundation
--
-- Planned operational performance Aggregate. Distinct from Booking and from
-- future assignment / trip-execution aggregates. Generated from CONFIRMED Booking
-- only (Application layer).
-- Statuses: PLANNED | READY_FOR_ASSIGNMENT | CANCELLED.
-- Types: TRANSFER | HOURLY (custom route = TRANSFER with manual RoutePlan).
--
-- No driver, vehicle, partner, assignment, trip, price, or payment columns.
-- Full JSONB RoutePlan / requirements / contact invariants remain Domain responsibility;
-- SQL enforces only minimal structural object checks.
--
-- Scope-safe FK to bookings(id, tenant_id, organization_id) uses existing
-- UNIQUE INDEX uq_bookings_id_tenant_org from Step 5 — no ALTER of bookings migration.
--
-- RLS ENABLE + FORCE with no permissive policies (deny-by-default readiness).
-- This migration MUST NOT be treated as applied by application code in this step.

-- ---------------------------------------------------------------------------
-- services
-- ---------------------------------------------------------------------------

CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  organization_id UUID NOT NULL,
  service_number TEXT NOT NULL,
  booking_id UUID NOT NULL,
  service_sequence INTEGER NOT NULL,
  generation_key TEXT NOT NULL,
  service_type TEXT NOT NULL,
  status TEXT NOT NULL,
  route_plan JSONB NOT NULL,
  scheduled_pickup_at TIMESTAMPTZ NOT NULL,
  timezone TEXT NOT NULL,
  requested_arrival_at TIMESTAMPTZ NULL,
  pickup_window_minutes INTEGER NULL,
  requirements JSONB NOT NULL,
  operational_contact JSONB NULL,
  cancel_reason_code TEXT NULL,
  cancelled_at TIMESTAMPTZ NULL,
  version INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT fk_services_tenant
    FOREIGN KEY (tenant_id) REFERENCES tenants (id),
  CONSTRAINT fk_services_organization
    FOREIGN KEY (organization_id) REFERENCES organizations (id),
  CONSTRAINT fk_services_org_tenant
    FOREIGN KEY (organization_id, tenant_id)
      REFERENCES organizations (id, tenant_id),

  -- Scope-safe composite FK to Booking (requires uq_bookings_id_tenant_org).
  CONSTRAINT fk_services_booking_scope
    FOREIGN KEY (booking_id, tenant_id, organization_id)
      REFERENCES bookings (id, tenant_id, organization_id),

  CONSTRAINT ck_services_type
    CHECK (service_type IN ('TRANSFER', 'HOURLY')),
  CONSTRAINT ck_services_status
    CHECK (status IN ('PLANNED', 'READY_FOR_ASSIGNMENT', 'CANCELLED')),
  CONSTRAINT ck_services_version_non_negative
    CHECK (version >= 0),
  CONSTRAINT ck_services_sequence_positive
    CHECK (service_sequence >= 1),
  CONSTRAINT ck_services_service_number_not_blank
    CHECK (length(btrim(service_number)) > 0),
  CONSTRAINT ck_services_generation_key_not_blank
    CHECK (length(btrim(generation_key)) > 0),
  CONSTRAINT ck_services_timezone_not_blank
    CHECK (length(btrim(timezone)) > 0),
  CONSTRAINT ck_services_created_updated
    CHECK (created_at <= updated_at),
  CONSTRAINT ck_services_requested_arrival_after_pickup
    CHECK (
      requested_arrival_at IS NULL
      OR requested_arrival_at > scheduled_pickup_at
    ),
  CONSTRAINT ck_services_pickup_window_minutes
    CHECK (
      pickup_window_minutes IS NULL
      OR (pickup_window_minutes >= 0 AND pickup_window_minutes <= 720)
    ),
  CONSTRAINT ck_services_cancel_coupling
    CHECK (
      (
        status = 'CANCELLED'
        AND cancel_reason_code IS NOT NULL
        AND cancelled_at IS NOT NULL
      )
      OR (
        status <> 'CANCELLED'
        AND cancel_reason_code IS NULL
        AND cancelled_at IS NULL
      )
    ),
  CONSTRAINT ck_services_cancel_reason_code
    CHECK (
      cancel_reason_code IS NULL
      OR cancel_reason_code IN (
        'CUSTOMER_REQUEST',
        'BOOKING_CANCELLED',
        'OPERATIONAL',
        'DUPLICATE',
        'OTHER'
      )
    ),
  CONSTRAINT ck_services_route_plan_object
    CHECK (jsonb_typeof(route_plan) = 'object'),
  CONSTRAINT ck_services_requirements_object
    CHECK (jsonb_typeof(requirements) = 'object'),
  CONSTRAINT ck_services_operational_contact_object
    CHECK (
      operational_contact IS NULL
      OR jsonb_typeof(operational_contact) = 'object'
    ),

  CONSTRAINT uq_services_tenant_org_service_number
    UNIQUE (tenant_id, organization_id, service_number),
  CONSTRAINT uq_services_tenant_org_generation_key
    UNIQUE (tenant_id, organization_id, generation_key),
  CONSTRAINT uq_services_tenant_org_booking_sequence
    UNIQUE (tenant_id, organization_id, booking_id, service_sequence)
);

CREATE INDEX idx_services_tenant_org
  ON services (tenant_id, organization_id);

CREATE INDEX idx_services_tenant_org_booking
  ON services (tenant_id, organization_id, booking_id);

CREATE INDEX idx_services_tenant_org_status
  ON services (tenant_id, organization_id, status);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE services FORCE ROW LEVEL SECURITY;

-- Deny-by-default readiness only. No permissive RLS policies. No GRANT.
-- Complete JSONB RoutePlan/requirements/contact invariants: Domain responsibility.
-- This migration MUST NOT be treated as applied by application code in this step.

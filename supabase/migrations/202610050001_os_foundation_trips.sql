-- MyChauffeur OS Foundation — Operational Trips
-- Trip Aggregate / operational execution state machine (MC-OS-014 / MC-OS-030).
-- Migration file only: MUST NOT be treated as applied by application code.

CREATE UNIQUE INDEX IF NOT EXISTS uq_assignments_id_service_tenant_org
  ON assignments (id, service_id, tenant_id, organization_id);

CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  organization_id UUID NOT NULL,
  service_id UUID NOT NULL,
  assignment_id UUID NOT NULL,
  status TEXT NOT NULL,
  reason_code TEXT NULL,
  en_route_at TIMESTAMPTZ NULL,
  arrived_at TIMESTAMPTZ NULL,
  started_at TIMESTAMPTZ NULL,
  completed_at TIMESTAMPTZ NULL,
  ended_at TIMESTAMPTZ NULL,
  version INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT fk_trips_tenant
    FOREIGN KEY (tenant_id) REFERENCES tenants (id),
  CONSTRAINT fk_trips_organization
    FOREIGN KEY (organization_id) REFERENCES organizations (id),
  CONSTRAINT fk_trips_org_tenant
    FOREIGN KEY (organization_id, tenant_id)
      REFERENCES organizations (id, tenant_id),
  CONSTRAINT fk_trips_service_scope
    FOREIGN KEY (service_id, tenant_id, organization_id)
      REFERENCES services (id, tenant_id, organization_id),
  CONSTRAINT fk_trips_assignment_scope
    FOREIGN KEY (assignment_id, service_id, tenant_id, organization_id)
      REFERENCES assignments (id, service_id, tenant_id, organization_id),

  CONSTRAINT ck_trips_status CHECK (status IN (
    'SCHEDULED', 'EN_ROUTE', 'ARRIVED', 'ONGOING', 'COMPLETED',
    'NO_SHOW_CUSTOMER', 'NO_SHOW_DRIVER', 'CANCELLED', 'DISRUPTED'
  )),
  CONSTRAINT ck_trips_version_non_negative CHECK (version >= 0),
  CONSTRAINT ck_trips_created_updated CHECK (created_at <= updated_at),
  CONSTRAINT ck_trips_terminal_ended CHECK (
    (status IN ('COMPLETED', 'NO_SHOW_CUSTOMER', 'NO_SHOW_DRIVER', 'CANCELLED', 'DISRUPTED') AND ended_at IS NOT NULL)
    OR
    (status IN ('SCHEDULED', 'EN_ROUTE', 'ARRIVED', 'ONGOING') AND ended_at IS NULL)
  ),
  CONSTRAINT ck_trips_reason_coupling CHECK (
    (status IN ('NO_SHOW_CUSTOMER', 'NO_SHOW_DRIVER', 'CANCELLED', 'DISRUPTED') AND reason_code IS NOT NULL)
    OR
    (status NOT IN ('NO_SHOW_CUSTOMER', 'NO_SHOW_DRIVER', 'CANCELLED', 'DISRUPTED') AND reason_code IS NULL)
  ),
  CONSTRAINT ck_trips_en_route_coupling CHECK (
    (status NOT IN ('SCHEDULED', 'NO_SHOW_DRIVER') OR en_route_at IS NULL)
    AND
    (status NOT IN ('EN_ROUTE', 'ARRIVED', 'ONGOING', 'COMPLETED') OR en_route_at IS NOT NULL)
  ),
  CONSTRAINT ck_trips_arrived_coupling CHECK (
    (status NOT IN ('SCHEDULED', 'EN_ROUTE', 'NO_SHOW_DRIVER') OR arrived_at IS NULL)
    AND
    (status NOT IN ('ARRIVED', 'ONGOING', 'COMPLETED', 'NO_SHOW_CUSTOMER') OR arrived_at IS NOT NULL)
  ),
  CONSTRAINT ck_trips_started_coupling CHECK (
    (status NOT IN ('SCHEDULED', 'EN_ROUTE', 'ARRIVED', 'NO_SHOW_CUSTOMER', 'NO_SHOW_DRIVER') OR started_at IS NULL)
    AND
    (status NOT IN ('ONGOING', 'COMPLETED') OR started_at IS NOT NULL)
  ),
  CONSTRAINT ck_trips_completed_coupling CHECK (
    (status = 'COMPLETED' AND completed_at IS NOT NULL)
    OR
    (status <> 'COMPLETED' AND completed_at IS NULL)
  ),
  CONSTRAINT ck_trips_timestamp_dependencies CHECK (
    (arrived_at IS NULL OR en_route_at IS NOT NULL)
    AND (started_at IS NULL OR arrived_at IS NOT NULL)
    AND (completed_at IS NULL OR started_at IS NOT NULL)
  ),
  CONSTRAINT ck_trips_timestamp_order CHECK (
    (en_route_at IS NULL OR en_route_at >= created_at)
    AND (arrived_at IS NULL OR arrived_at >= en_route_at)
    AND (started_at IS NULL OR started_at >= arrived_at)
    AND (completed_at IS NULL OR completed_at >= started_at)
    AND (ended_at IS NULL OR ended_at >= COALESCE(started_at, arrived_at, en_route_at, created_at))
    AND updated_at >= COALESCE(ended_at, completed_at, started_at, arrived_at, en_route_at, created_at)
  ),
  CONSTRAINT ck_trips_reason_not_blank CHECK (
    reason_code IS NULL OR length(btrim(reason_code)) > 0
  ),
  CONSTRAINT uq_trips_id_tenant_org UNIQUE (id, tenant_id, organization_id)
);

CREATE UNIQUE INDEX uq_trips_current_service
  ON trips (tenant_id, organization_id, service_id)
  WHERE status IN ('SCHEDULED', 'EN_ROUTE', 'ARRIVED', 'ONGOING');

CREATE INDEX idx_trips_tenant_org_status
  ON trips (tenant_id, organization_id, status);

CREATE INDEX idx_trips_tenant_org_assignment
  ON trips (tenant_id, organization_id, assignment_id);

ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips FORCE ROW LEVEL SECURITY;

-- Deny-by-default readiness only. No permissive RLS policies. No GRANT.

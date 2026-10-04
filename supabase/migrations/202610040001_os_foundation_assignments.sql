-- MyChauffeur OS Foundation — Assignments
-- MC-WORK-009 Assignment Aggregate Foundation
-- Migration file only: MUST NOT be treated as applied by application code.

CREATE UNIQUE INDEX IF NOT EXISTS uq_services_id_tenant_org
  ON services (id, tenant_id, organization_id);

CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  organization_id UUID NOT NULL,
  service_id UUID NOT NULL,
  mode TEXT NOT NULL,
  driver_id UUID NULL,
  vehicle_id UUID NULL,
  partner_organization_id UUID NULL,
  status TEXT NOT NULL,
  reason_code TEXT NULL,
  confirmed_at TIMESTAMPTZ NULL,
  activated_at TIMESTAMPTZ NULL,
  completed_at TIMESTAMPTZ NULL,
  ended_at TIMESTAMPTZ NULL,
  version INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT fk_assignments_tenant
    FOREIGN KEY (tenant_id) REFERENCES tenants (id),
  CONSTRAINT fk_assignments_organization
    FOREIGN KEY (organization_id) REFERENCES organizations (id),
  CONSTRAINT fk_assignments_org_tenant
    FOREIGN KEY (organization_id, tenant_id)
      REFERENCES organizations (id, tenant_id),
  CONSTRAINT fk_assignments_service_scope
    FOREIGN KEY (service_id, tenant_id, organization_id)
      REFERENCES services (id, tenant_id, organization_id),
  CONSTRAINT fk_assignments_partner_org_tenant
    FOREIGN KEY (partner_organization_id, tenant_id)
      REFERENCES organizations (id, tenant_id),

  CONSTRAINT ck_assignments_mode
    CHECK (mode IN ('INTERNAL', 'PARTNER')),
  CONSTRAINT ck_assignments_status
    CHECK (status IN (
      'PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED',
      'REJECTED', 'REASSIGNED', 'CANCELLED'
    )),
  CONSTRAINT ck_assignments_version_non_negative CHECK (version >= 0),
  CONSTRAINT ck_assignments_created_updated CHECK (created_at <= updated_at),
  CONSTRAINT ck_assignments_executor_xor CHECK (
    (
      mode = 'INTERNAL'
      AND driver_id IS NOT NULL
      AND vehicle_id IS NOT NULL
      AND partner_organization_id IS NULL
    )
    OR
    (
      mode = 'PARTNER'
      AND driver_id IS NULL
      AND vehicle_id IS NULL
      AND partner_organization_id IS NOT NULL
    )
  ),
  CONSTRAINT ck_assignments_terminal_ended CHECK (
    (status IN ('COMPLETED', 'REJECTED', 'REASSIGNED', 'CANCELLED') AND ended_at IS NOT NULL)
    OR
    (status IN ('PENDING', 'CONFIRMED', 'ACTIVE') AND ended_at IS NULL)
  ),
  CONSTRAINT ck_assignments_reason_coupling CHECK (
    (status IN ('REJECTED', 'REASSIGNED', 'CANCELLED') AND reason_code IS NOT NULL)
    OR
    (status NOT IN ('REJECTED', 'REASSIGNED', 'CANCELLED') AND reason_code IS NULL)
  ),
  CONSTRAINT ck_assignments_confirmed_coupling CHECK (
    (status NOT IN ('PENDING', 'REJECTED') OR confirmed_at IS NULL)
    AND
    (status NOT IN ('CONFIRMED', 'ACTIVE', 'COMPLETED', 'REASSIGNED') OR confirmed_at IS NOT NULL)
  ),
  CONSTRAINT ck_assignments_activated_coupling CHECK (
    (status NOT IN ('PENDING', 'CONFIRMED', 'REJECTED') OR activated_at IS NULL)
    AND
    (status NOT IN ('ACTIVE', 'COMPLETED') OR activated_at IS NOT NULL)
  ),
  CONSTRAINT ck_assignments_completed_coupling CHECK (
    (status = 'COMPLETED' AND completed_at IS NOT NULL)
    OR
    (status <> 'COMPLETED' AND completed_at IS NULL)
  ),
  CONSTRAINT ck_assignments_reason_not_blank CHECK (
    reason_code IS NULL OR length(btrim(reason_code)) > 0
  ),
  CONSTRAINT uq_assignments_id_tenant_org UNIQUE (id, tenant_id, organization_id)
);

CREATE UNIQUE INDEX uq_assignments_current_service
  ON assignments (tenant_id, organization_id, service_id)
  WHERE status IN ('PENDING', 'CONFIRMED', 'ACTIVE');

CREATE INDEX idx_assignments_tenant_org_status
  ON assignments (tenant_id, organization_id, status);

CREATE INDEX idx_assignments_tenant_org_service
  ON assignments (tenant_id, organization_id, service_id);

ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments FORCE ROW LEVEL SECURITY;

-- Deny-by-default readiness only. No permissive RLS policies. No GRANT.

-- MyChauffeur OS Foundation — Tenants & Organizations
-- Step 1 Persistence Foundation
--
-- RLS is ENABLED and FORCED with no permissive policies.
-- Application Membership/Identity policies will be introduced in a later step.
-- Supabase service_role bypasses RLS by platform design and MUST NOT replace
-- Application Authorization (MC-OS-015 / MC-OS-028).

-- ---------------------------------------------------------------------------
-- tenants
-- ---------------------------------------------------------------------------

CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  display_name TEXT NOT NULL,
  status TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_tenants_status
    CHECK (status IN ('ACTIVE', 'SUSPENDED', 'ARCHIVED')),
  CONSTRAINT ck_tenants_version_positive
    CHECK (version >= 1),
  CONSTRAINT ck_tenants_code_not_blank
    CHECK (length(btrim(code)) > 0),
  CONSTRAINT ck_tenants_display_name_not_blank
    CHECK (length(btrim(display_name)) > 0),
  CONSTRAINT uq_tenants_code UNIQUE (code)
);

CREATE INDEX idx_tenants_status ON tenants (status);

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants FORCE ROW LEVEL SECURITY;

-- No policies on tenants: deny-by-default for non-bypass roles.
-- Membership-aware policies: deferred to Identity/Membership step.

-- ---------------------------------------------------------------------------
-- organizations
-- ---------------------------------------------------------------------------

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  code TEXT NOT NULL,
  legal_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  status TEXT NOT NULL,
  country_code TEXT NOT NULL,
  default_locale TEXT NOT NULL,
  default_timezone TEXT NOT NULL,
  default_currency TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_organizations_tenant
    FOREIGN KEY (tenant_id) REFERENCES tenants (id),
  CONSTRAINT ck_organizations_status
    CHECK (status IN ('ACTIVE', 'SUSPENDED', 'ARCHIVED')),
  CONSTRAINT ck_organizations_version_positive
    CHECK (version >= 1),
  CONSTRAINT ck_organizations_code_not_blank
    CHECK (length(btrim(code)) > 0),
  CONSTRAINT ck_organizations_legal_name_not_blank
    CHECK (length(btrim(legal_name)) > 0),
  CONSTRAINT ck_organizations_display_name_not_blank
    CHECK (length(btrim(display_name)) > 0),
  CONSTRAINT ck_organizations_country_code
    CHECK (country_code ~ '^[A-Z]{2}$'),
  CONSTRAINT ck_organizations_default_currency
    CHECK (default_currency ~ '^[A-Z]{3}$'),
  CONSTRAINT uq_organizations_tenant_code UNIQUE (tenant_id, code)
);

CREATE INDEX idx_organizations_tenant_id ON organizations (tenant_id);
CREATE INDEX idx_organizations_tenant_status ON organizations (tenant_id, status);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations FORCE ROW LEVEL SECURITY;

-- No policies on organizations: deny-by-default for non-bypass roles.
-- Membership-aware policies: deferred to Identity/Membership step.

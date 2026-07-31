-- MyChauffeur OS Foundation — Membership, Role, Permission
-- Step 3 Membership / Role / Permission Foundation
--
-- RLS is ENABLED and FORCED with no permissive policies.
-- Definitive Authorization/RLS policies will be introduced in the Authorization/RLS step.
-- Supabase service_role bypasses RLS by platform design and MUST NOT replace
-- Application Authorization (MC-OS-015 / MC-OS-028).
-- Role codes such as OWNER / DISPATCHER / DRIVER are catalog values only — no seed here.

-- ---------------------------------------------------------------------------
-- Tenant consistency helpers for composite foreign keys
-- ---------------------------------------------------------------------------

-- Allows FK (tenant_id, organization_id) → organizations (tenant_id, id).
ALTER TABLE organizations
  ADD CONSTRAINT uq_organizations_id_tenant UNIQUE (id, tenant_id);

-- ---------------------------------------------------------------------------
-- organization_memberships
-- ---------------------------------------------------------------------------

CREATE TABLE organization_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  organization_id UUID NOT NULL,
  user_id UUID NOT NULL,
  status TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_organization_memberships_tenant
    FOREIGN KEY (tenant_id) REFERENCES tenants (id),
  CONSTRAINT fk_organization_memberships_organization
    FOREIGN KEY (organization_id) REFERENCES organizations (id),
  CONSTRAINT fk_organization_memberships_user
    FOREIGN KEY (user_id) REFERENCES users (id),
  CONSTRAINT fk_organization_memberships_org_tenant
    FOREIGN KEY (organization_id, tenant_id)
      REFERENCES organizations (id, tenant_id),
  CONSTRAINT ck_organization_memberships_status
    CHECK (status IN ('ACTIVE', 'SUSPENDED', 'REVOKED')),
  CONSTRAINT ck_organization_memberships_version_positive
    CHECK (version >= 1),
  CONSTRAINT uq_organization_memberships_tenant_org_user
    UNIQUE (tenant_id, organization_id, user_id)
);

CREATE UNIQUE INDEX uq_organization_memberships_id_tenant
  ON organization_memberships (id, tenant_id);

CREATE INDEX idx_organization_memberships_tenant_user
  ON organization_memberships (tenant_id, user_id);

CREATE INDEX idx_organization_memberships_tenant_org
  ON organization_memberships (tenant_id, organization_id);

ALTER TABLE organization_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_memberships FORCE ROW LEVEL SECURITY;

-- No policies on organization_memberships: deny-by-default for non-bypass roles.
-- Definitive Authorization/RLS policies: deferred to Authorization/RLS step.

-- ---------------------------------------------------------------------------
-- roles
-- ---------------------------------------------------------------------------

CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  organization_id UUID NULL,
  code TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT NULL,
  status TEXT NOT NULL,
  is_system_role BOOLEAN NOT NULL DEFAULT false,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_roles_tenant
    FOREIGN KEY (tenant_id) REFERENCES tenants (id),
  CONSTRAINT fk_roles_organization
    FOREIGN KEY (organization_id) REFERENCES organizations (id),
  -- When organization_id is set, it must belong to the same tenant.
  CONSTRAINT fk_roles_org_tenant
    FOREIGN KEY (organization_id, tenant_id)
      REFERENCES organizations (id, tenant_id),
  CONSTRAINT ck_roles_status
    CHECK (status IN ('ACTIVE', 'DISABLED', 'ARCHIVED')),
  CONSTRAINT ck_roles_version_positive
    CHECK (version >= 1),
  CONSTRAINT ck_roles_code_not_blank
    CHECK (length(btrim(code)) > 0),
  CONSTRAINT ck_roles_display_name_not_blank
    CHECK (length(btrim(display_name)) > 0)
);

-- Scope-aware uniqueness: tenant-level vs organization-level role codes.
CREATE UNIQUE INDEX uq_roles_tenant_code_tenant_level
  ON roles (tenant_id, code)
  WHERE organization_id IS NULL;

CREATE UNIQUE INDEX uq_roles_tenant_org_code
  ON roles (tenant_id, organization_id, code)
  WHERE organization_id IS NOT NULL;

CREATE UNIQUE INDEX uq_roles_id_tenant
  ON roles (id, tenant_id);

CREATE INDEX idx_roles_tenant_id ON roles (tenant_id);
CREATE INDEX idx_roles_tenant_org ON roles (tenant_id, organization_id);

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles FORCE ROW LEVEL SECURITY;

-- No policies on roles: deny-by-default for non-bypass roles.
-- Definitive Authorization/RLS policies: deferred to Authorization/RLS step.

-- ---------------------------------------------------------------------------
-- permissions (global catalog — not tenant-owned)
-- ---------------------------------------------------------------------------

CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  description TEXT NULL,
  status TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_permissions_status
    CHECK (status IN ('ACTIVE', 'DISABLED', 'ARCHIVED')),
  CONSTRAINT ck_permissions_version_positive
    CHECK (version >= 1),
  CONSTRAINT ck_permissions_code_not_blank
    CHECK (length(btrim(code)) > 0),
  CONSTRAINT ck_permissions_resource_not_blank
    CHECK (length(btrim(resource)) > 0),
  CONSTRAINT ck_permissions_action_not_blank
    CHECK (length(btrim(action)) > 0),
  CONSTRAINT ck_permissions_no_wildcard
    CHECK (position('*' in code) = 0),
  CONSTRAINT uq_permissions_code UNIQUE (code)
);

CREATE INDEX idx_permissions_resource_action ON permissions (resource, action);

ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions FORCE ROW LEVEL SECURITY;

-- No policies on permissions: deny-by-default for non-bypass roles.
-- Definitive Authorization/RLS policies: deferred to Authorization/RLS step.

-- ---------------------------------------------------------------------------
-- membership_roles
-- ---------------------------------------------------------------------------

CREATE TABLE membership_roles (
  tenant_id UUID NOT NULL,
  membership_id UUID NOT NULL,
  role_id UUID NOT NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  assigned_by_actor_id UUID NULL,
  CONSTRAINT pk_membership_roles PRIMARY KEY (membership_id, role_id),
  CONSTRAINT fk_membership_roles_tenant
    FOREIGN KEY (tenant_id) REFERENCES tenants (id),
  CONSTRAINT fk_membership_roles_membership
    FOREIGN KEY (membership_id) REFERENCES organization_memberships (id),
  CONSTRAINT fk_membership_roles_role
    FOREIGN KEY (role_id) REFERENCES roles (id),
  CONSTRAINT fk_membership_roles_membership_tenant
    FOREIGN KEY (membership_id, tenant_id)
      REFERENCES organization_memberships (id, tenant_id),
  CONSTRAINT fk_membership_roles_role_tenant
    FOREIGN KEY (role_id, tenant_id)
      REFERENCES roles (id, tenant_id)
);

CREATE INDEX idx_membership_roles_tenant_membership
  ON membership_roles (tenant_id, membership_id);

CREATE INDEX idx_membership_roles_tenant_role
  ON membership_roles (tenant_id, role_id);

ALTER TABLE membership_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_roles FORCE ROW LEVEL SECURITY;

-- No policies on membership_roles: deny-by-default for non-bypass roles.
-- Definitive Authorization/RLS policies: deferred to Authorization/RLS step.
-- TODO Step 4: organization-level Role vs Membership organization match remains
-- enforced in Domain factories / Application ports (no trigger here).

-- ---------------------------------------------------------------------------
-- role_permissions
-- ---------------------------------------------------------------------------

CREATE TABLE role_permissions (
  tenant_id UUID NOT NULL,
  role_id UUID NOT NULL,
  permission_id UUID NOT NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  assigned_by_actor_id UUID NULL,
  CONSTRAINT pk_role_permissions PRIMARY KEY (role_id, permission_id),
  CONSTRAINT fk_role_permissions_tenant
    FOREIGN KEY (tenant_id) REFERENCES tenants (id),
  CONSTRAINT fk_role_permissions_role
    FOREIGN KEY (role_id) REFERENCES roles (id),
  CONSTRAINT fk_role_permissions_permission
    FOREIGN KEY (permission_id) REFERENCES permissions (id),
  CONSTRAINT fk_role_permissions_role_tenant
    FOREIGN KEY (role_id, tenant_id)
      REFERENCES roles (id, tenant_id)
);

CREATE INDEX idx_role_permissions_tenant_role
  ON role_permissions (tenant_id, role_id);

CREATE INDEX idx_role_permissions_permission
  ON role_permissions (permission_id);

ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions FORCE ROW LEVEL SECURITY;

-- No policies on role_permissions: deny-by-default for non-bypass roles.
-- Definitive Authorization/RLS policies: deferred to Authorization/RLS step.

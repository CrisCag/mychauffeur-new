-- MyChauffeur OS Foundation — Customers
-- Step 8 Customer Aggregate Foundation
--
-- Commercial Customer Aggregate (counterparty). Distinct from Identity/User/Actor,
-- Booker, Passenger, Billing Party, CRM Lead, and platform Organization.
-- Does NOT alter bookings or quotes. Does NOT create Customer from Guest snapshots.
--
-- No merge engine. No email/phone lookup indexes. No credential fields.
-- No consent registry / DSAR / retention engine in this step.
--
-- RLS ENABLE + FORCE with no permissive policies (deny-by-default readiness).
-- This migration MUST NOT be treated as applied by application code in this step.

-- ---------------------------------------------------------------------------
-- customers
-- ---------------------------------------------------------------------------

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  organization_id UUID NOT NULL,
  customer_number TEXT NOT NULL,
  customer_type TEXT NOT NULL,
  status TEXT NOT NULL,
  individual_name TEXT NULL,
  organization_name TEXT NULL,
  email TEXT NULL,
  phone TEXT NULL,
  identity_subject_id TEXT NULL,
  identity_linked_at TIMESTAMPTZ NULL,
  version INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  anonymized_at TIMESTAMPTZ NULL,

  CONSTRAINT fk_customers_tenant
    FOREIGN KEY (tenant_id) REFERENCES tenants (id),
  CONSTRAINT fk_customers_organization
    FOREIGN KEY (organization_id) REFERENCES organizations (id),
  CONSTRAINT fk_customers_org_tenant
    FOREIGN KEY (organization_id, tenant_id)
      REFERENCES organizations (id, tenant_id),

  CONSTRAINT ck_customers_type
    CHECK (customer_type IN ('INDIVIDUAL', 'ORGANIZATION')),
  CONSTRAINT ck_customers_status
    CHECK (status IN ('ACTIVE', 'INACTIVE', 'ANONYMIZED')),
  CONSTRAINT ck_customers_version_non_negative
    CHECK (version >= 0),
  CONSTRAINT ck_customers_customer_number_not_blank
    CHECK (length(btrim(customer_number)) > 0),
  CONSTRAINT ck_customers_created_updated
    CHECK (created_at <= updated_at),

  CONSTRAINT ck_customers_type_name_active_inactive
    CHECK (
      status = 'ANONYMIZED'
      OR (
        customer_type = 'INDIVIDUAL'
        AND individual_name IS NOT NULL
        AND length(btrim(individual_name)) > 0
        AND organization_name IS NULL
      )
      OR (
        customer_type = 'ORGANIZATION'
        AND organization_name IS NOT NULL
        AND length(btrim(organization_name)) > 0
        AND individual_name IS NULL
      )
    ),

  CONSTRAINT ck_customers_anonymized_cleared
    CHECK (
      status <> 'ANONYMIZED'
      OR (
        individual_name IS NULL
        AND organization_name IS NULL
        AND email IS NULL
        AND phone IS NULL
        AND identity_subject_id IS NULL
        AND identity_linked_at IS NULL
        AND anonymized_at IS NOT NULL
      )
    ),

  CONSTRAINT ck_customers_anonymized_at
    CHECK (
      (status = 'ANONYMIZED' AND anonymized_at IS NOT NULL)
      OR (status <> 'ANONYMIZED' AND anonymized_at IS NULL)
    ),

  CONSTRAINT ck_customers_identity_link_coupling
    CHECK (
      (identity_subject_id IS NULL AND identity_linked_at IS NULL)
      OR (identity_subject_id IS NOT NULL AND identity_linked_at IS NOT NULL)
    ),

  CONSTRAINT uq_customers_tenant_org_customer_number
    UNIQUE (tenant_id, organization_id, customer_number)
);

-- At most one Customer per IdentitySubjectId within tenant+organization.
CREATE UNIQUE INDEX uq_customers_tenant_org_identity_subject
  ON customers (tenant_id, organization_id, identity_subject_id)
  WHERE identity_subject_id IS NOT NULL;

CREATE INDEX idx_customers_tenant_org
  ON customers (tenant_id, organization_id);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers FORCE ROW LEVEL SECURITY;

-- Deny-by-default readiness only. No permissive RLS policies. No GRANT.
-- This migration MUST NOT be treated as applied by application code in this step.

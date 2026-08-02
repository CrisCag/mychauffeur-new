-- MyChauffeur OS Foundation — Quotes
-- Step 7 Quote Foundation
--
-- Commercial Quote Aggregate (pre-Booking). Not a Pricing Engine.
-- Does NOT convert Quote → Booking. Does NOT alter bookings table.
--
-- Append-only history of issued QuoteVersions is enforced by Domain and
-- repository in this Step. PostgreSQL CHECK cannot compare OLD/NEW row
-- history autonomously; do NOT add incomplete triggers that pretend to be
-- a full append-only ledger.
--
-- RLS ENABLE + FORCE with no permissive policies (deny-by-default readiness).
-- This migration MUST NOT be treated as applied by application code in this step.

-- ---------------------------------------------------------------------------
-- quotes
-- ---------------------------------------------------------------------------

CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  organization_id UUID NOT NULL,
  quote_number TEXT NOT NULL,
  mode TEXT NOT NULL,
  created_by_actor_id UUID NOT NULL,
  customer_id UUID NULL,
  guest_customer_snapshot JSONB NULL,
  current_version_number INTEGER NOT NULL DEFAULT 1,
  version INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT fk_quotes_tenant
    FOREIGN KEY (tenant_id) REFERENCES tenants (id),
  CONSTRAINT fk_quotes_organization
    FOREIGN KEY (organization_id) REFERENCES organizations (id),
  CONSTRAINT fk_quotes_org_tenant
    FOREIGN KEY (organization_id, tenant_id)
      REFERENCES organizations (id, tenant_id),

  CONSTRAINT ck_quotes_mode
    CHECK (mode IN ('INSTANT', 'MANUAL', 'REQUEST_TO_QUOTE')),
  CONSTRAINT ck_quotes_version_non_negative
    CHECK (version >= 0),
  CONSTRAINT ck_quotes_current_version_positive
    CHECK (current_version_number >= 1),
  CONSTRAINT ck_quotes_quote_number_not_blank
    CHECK (length(btrim(quote_number)) > 0),
  CONSTRAINT ck_quotes_customer_or_guest
    CHECK (
      customer_id IS NOT NULL
      OR guest_customer_snapshot IS NOT NULL
    ),
  CONSTRAINT ck_quotes_created_updated
    CHECK (created_at <= updated_at),

  CONSTRAINT uq_quotes_tenant_org_quote_number
    UNIQUE (tenant_id, organization_id, quote_number)
);

CREATE UNIQUE INDEX uq_quotes_id_tenant_org
  ON quotes (id, tenant_id, organization_id);

CREATE INDEX idx_quotes_tenant_org
  ON quotes (tenant_id, organization_id);

ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes FORCE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- quote_versions
-- ---------------------------------------------------------------------------

CREATE TABLE quote_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  organization_id UUID NOT NULL,
  version_number INTEGER NOT NULL,
  status TEXT NOT NULL,
  price_proposal JSONB NULL,
  policy_proposal JSONB NULL,
  contact_proposal JSONB NULL,
  billing_proposal JSONB NULL,
  pricing_calculation_ref TEXT NULL,
  issued_at TIMESTAMPTZ NULL,
  expires_at TIMESTAMPTZ NULL,
  accepted_at TIMESTAMPTZ NULL,
  acceptance_command_id TEXT NULL,
  rejected_at TIMESTAMPTZ NULL,
  withdrawn_at TIMESTAMPTZ NULL,
  expired_at TIMESTAMPTZ NULL,
  superseded_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT fk_quote_versions_quote_scope
    FOREIGN KEY (quote_id, tenant_id, organization_id)
      REFERENCES quotes (id, tenant_id, organization_id),

  CONSTRAINT ck_quote_versions_status
    CHECK (status IN (
      'DRAFT',
      'ISSUED',
      'ACCEPTED',
      'EXPIRED',
      'WITHDRAWN',
      'REJECTED',
      'SUPERSEDED'
    )),
  CONSTRAINT ck_quote_versions_version_positive
    CHECK (version_number >= 1),
  CONSTRAINT ck_quote_versions_proposals_all_or_none
    CHECK (
      (
        price_proposal IS NULL
        AND policy_proposal IS NULL
        AND contact_proposal IS NULL
        AND billing_proposal IS NULL
      )
      OR (
        price_proposal IS NOT NULL
        AND policy_proposal IS NOT NULL
        AND contact_proposal IS NOT NULL
        AND billing_proposal IS NOT NULL
      )
    ),
  CONSTRAINT ck_quote_versions_draft_no_proposals
    CHECK (
      status <> 'DRAFT'
      OR (
        price_proposal IS NULL
        AND policy_proposal IS NULL
        AND contact_proposal IS NULL
        AND billing_proposal IS NULL
        AND issued_at IS NULL
        AND expires_at IS NULL
        AND accepted_at IS NULL
        AND acceptance_command_id IS NULL
        AND rejected_at IS NULL
        AND withdrawn_at IS NULL
        AND expired_at IS NULL
        AND superseded_at IS NULL
      )
    ),
  CONSTRAINT ck_quote_versions_issued_or_later_proposals
    CHECK (
      status = 'DRAFT'
      OR (
        price_proposal IS NOT NULL
        AND policy_proposal IS NOT NULL
        AND contact_proposal IS NOT NULL
        AND billing_proposal IS NOT NULL
        AND issued_at IS NOT NULL
        AND expires_at IS NOT NULL
        AND issued_at < expires_at
      )
    ),
  CONSTRAINT ck_quote_versions_acceptance_fields
    CHECK (
      (
        status = 'ACCEPTED'
        AND accepted_at IS NOT NULL
        AND acceptance_command_id IS NOT NULL
      )
      OR (
        status <> 'ACCEPTED'
        AND accepted_at IS NULL
        AND acceptance_command_id IS NULL
      )
    ),
  CONSTRAINT ck_quote_versions_rejected_at
    CHECK (
      (status = 'REJECTED' AND rejected_at IS NOT NULL)
      OR (status <> 'REJECTED' AND rejected_at IS NULL)
    ),
  CONSTRAINT ck_quote_versions_withdrawn_at
    CHECK (
      (status = 'WITHDRAWN' AND withdrawn_at IS NOT NULL)
      OR (status <> 'WITHDRAWN' AND withdrawn_at IS NULL)
    ),
  CONSTRAINT ck_quote_versions_expired_at
    CHECK (
      (status = 'EXPIRED' AND expired_at IS NOT NULL)
      OR (status <> 'EXPIRED' AND expired_at IS NULL)
    ),
  CONSTRAINT ck_quote_versions_superseded_at
    CHECK (
      (status = 'SUPERSEDED' AND superseded_at IS NOT NULL)
      OR (status <> 'SUPERSEDED' AND superseded_at IS NULL)
    ),
  CONSTRAINT ck_quote_versions_created_updated
    CHECK (created_at <= updated_at),

  CONSTRAINT uq_quote_versions_quote_version_number
    UNIQUE (quote_id, version_number)
);

-- At most one ISSUED version per quote (partial unique).
CREATE UNIQUE INDEX uq_quote_versions_one_issued
  ON quote_versions (quote_id)
  WHERE status = 'ISSUED';

-- At most one ACCEPTED version per quote (partial unique).
CREATE UNIQUE INDEX uq_quote_versions_one_accepted
  ON quote_versions (quote_id)
  WHERE status = 'ACCEPTED';

CREATE INDEX idx_quote_versions_tenant_org
  ON quote_versions (tenant_id, organization_id);

CREATE INDEX idx_quote_versions_quote_id
  ON quote_versions (quote_id);

ALTER TABLE quote_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_versions FORCE ROW LEVEL SECURITY;

-- Deny-by-default readiness only. No permissive RLS policies. No GRANT.
-- Append-only issued history: Domain + repository; CHECK cannot see OLD/NEW.
-- This migration MUST NOT be treated as applied by application code in this step.

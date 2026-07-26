-- MyChauffeur OS Foundation — Identity (Person, User, ExternalIdentity)
-- Step 2 Identity Foundation
--
-- RLS is ENABLED and FORCED with no permissive policies.
-- Membership-aware / claim-based policies are deferred to a later Identity/Membership step.
-- Supabase service_role bypasses RLS by platform design and MUST NOT replace
-- Application Authorization (MC-OS-015 / MC-OS-028).
-- These tables store identity records only — no credential material.

-- ---------------------------------------------------------------------------
-- persons
-- ---------------------------------------------------------------------------

CREATE TABLE persons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_persons_version_positive
    CHECK (version >= 1),
  CONSTRAINT ck_persons_first_name_not_blank
    CHECK (length(btrim(first_name)) > 0),
  CONSTRAINT ck_persons_last_name_not_blank
    CHECK (length(btrim(last_name)) > 0),
  CONSTRAINT ck_persons_display_name_not_blank
    CHECK (length(btrim(display_name)) > 0)
);

CREATE INDEX idx_persons_display_name ON persons (display_name);

ALTER TABLE persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE persons FORCE ROW LEVEL SECURITY;

-- No policies on persons: deny-by-default for non-bypass roles.

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL,
  status TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_users_person
    FOREIGN KEY (person_id) REFERENCES persons (id),
  CONSTRAINT ck_users_status
    CHECK (status IN ('ACTIVE', 'SUSPENDED', 'DISABLED')),
  CONSTRAINT ck_users_version_positive
    CHECK (version >= 1),
  CONSTRAINT uq_users_person_id UNIQUE (person_id)
);

CREATE INDEX idx_users_status ON users (status);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;

-- No policies on users: deny-by-default for non-bypass roles.

-- ---------------------------------------------------------------------------
-- external_identities
-- ---------------------------------------------------------------------------

CREATE TABLE external_identities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider TEXT NOT NULL,
  provider_subject TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_external_identities_user
    FOREIGN KEY (user_id) REFERENCES users (id),
  CONSTRAINT ck_external_identities_provider_not_blank
    CHECK (length(btrim(provider)) > 0),
  CONSTRAINT ck_external_identities_provider_subject_not_blank
    CHECK (length(btrim(provider_subject)) > 0),
  CONSTRAINT uq_external_identities_provider_subject
    UNIQUE (provider, provider_subject)
);

CREATE INDEX idx_external_identities_user_id ON external_identities (user_id);

ALTER TABLE external_identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_identities FORCE ROW LEVEL SECURITY;

-- No policies on external_identities: deny-by-default for non-bypass roles.
-- Definitive Membership/RLS policies: deferred.

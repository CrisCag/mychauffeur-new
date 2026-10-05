-- MyChauffeur OS Foundation — Service execution lifecycle alignment.
-- Coordinates Service lifecycle readiness with Assignment and Trip aggregates.
-- Migration file only: MUST NOT be treated as applied by application code.

ALTER TABLE services
  ADD COLUMN execution_started_at TIMESTAMPTZ NULL,
  ADD COLUMN completed_at TIMESTAMPTZ NULL;

ALTER TABLE services
  DROP CONSTRAINT ck_services_status,
  ADD CONSTRAINT ck_services_status
    CHECK (status IN (
      'PLANNED', 'READY_FOR_ASSIGNMENT', 'IN_EXECUTION', 'COMPLETED', 'CANCELLED'
    )),
  ADD CONSTRAINT ck_services_execution_coupling CHECK (
    (status IN ('IN_EXECUTION', 'COMPLETED') AND execution_started_at IS NOT NULL)
    OR
    (status NOT IN ('IN_EXECUTION', 'COMPLETED') AND execution_started_at IS NULL)
  ),
  ADD CONSTRAINT ck_services_completion_coupling CHECK (
    (status = 'COMPLETED' AND completed_at IS NOT NULL)
    OR
    (status <> 'COMPLETED' AND completed_at IS NULL)
  ),
  ADD CONSTRAINT ck_services_execution_timestamp_order CHECK (
    (execution_started_at IS NULL OR execution_started_at >= created_at)
    AND (completed_at IS NULL OR completed_at >= execution_started_at)
    AND updated_at >= COALESCE(completed_at, execution_started_at, created_at)
  );

-- Existing services RLS remains ENABLED and FORCED. No policy or GRANT is added.

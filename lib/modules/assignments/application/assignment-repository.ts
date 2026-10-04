import type { OrganizationId, TenantId } from "@/lib/modules/identity";
import type { Assignment } from "../domain/assignment";
import type { AssignmentId, AssignmentServiceId } from "../domain/identifiers";

export interface AssignmentRepository {
  save(assignment: Assignment, expectedVersion?: number): Promise<void>;

  findById(
    tenantId: TenantId,
    organizationId: OrganizationId,
    assignmentId: AssignmentId
  ): Promise<Assignment | null>;

  findCurrentByServiceId(
    tenantId: TenantId,
    organizationId: OrganizationId,
    serviceId: AssignmentServiceId
  ): Promise<Assignment | null>;
}

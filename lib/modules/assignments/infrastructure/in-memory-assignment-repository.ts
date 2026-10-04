import type { OrganizationId, TenantId } from "@/lib/modules/identity";
import type { AssignmentRepository } from "../application/assignment-repository";
import type { Assignment } from "../domain/assignment";
import { rehydrateAssignment } from "../domain/assignment";
import { isCurrentAssignmentStatus } from "../domain/assignment-status";
import {
  ActiveAssignmentConflictError,
  AssignmentDomainValidationError,
  AssignmentVersionConflictError,
} from "../domain/errors";
import type { AssignmentId, AssignmentServiceId } from "../domain/identifiers";

export class InMemoryAssignmentRepository implements AssignmentRepository {
  private readonly byId = new Map<string, Assignment>();
  private readonly currentByService = new Map<string, string>();

  private idKey(
    tenantId: TenantId,
    organizationId: OrganizationId,
    assignmentId: AssignmentId
  ): string {
    return `${tenantId}::${organizationId}::${assignmentId}`;
  }

  private serviceKey(
    tenantId: TenantId,
    organizationId: OrganizationId,
    serviceId: AssignmentServiceId
  ): string {
    return `${tenantId}::${organizationId}::${serviceId}`;
  }

  private clone(value: Assignment): Assignment {
    return rehydrateAssignment({
      ...value,
      confirmedAt: value.confirmedAt
        ? new Date(value.confirmedAt.getTime())
        : null,
      activatedAt: value.activatedAt
        ? new Date(value.activatedAt.getTime())
        : null,
      completedAt: value.completedAt
        ? new Date(value.completedAt.getTime())
        : null,
      endedAt: value.endedAt ? new Date(value.endedAt.getTime()) : null,
      createdAt: new Date(value.createdAt.getTime()),
      updatedAt: new Date(value.updatedAt.getTime()),
    });
  }

  async save(assignment: Assignment, expectedVersion?: number): Promise<void> {
    const key = this.idKey(
      assignment.tenantId,
      assignment.organizationId,
      assignment.id
    );
    const existing = this.byId.get(key);
    const serviceKey = this.serviceKey(
      assignment.tenantId,
      assignment.organizationId,
      assignment.serviceId
    );

    if (!existing) {
      if (expectedVersion !== undefined) {
        throw new AssignmentVersionConflictError();
      }
      this.assertNoCurrentConflict(assignment, key, serviceKey);
      this.byId.set(key, this.clone(assignment));
      if (isCurrentAssignmentStatus(assignment.status)) {
        this.currentByService.set(serviceKey, key);
      }
      return;
    }

    if (
      expectedVersion === undefined ||
      existing.version !== expectedVersion ||
      assignment.version !== existing.version + 1
    ) {
      throw new AssignmentVersionConflictError();
    }
    if (
      existing.id !== assignment.id ||
      existing.tenantId !== assignment.tenantId ||
      existing.organizationId !== assignment.organizationId ||
      existing.serviceId !== assignment.serviceId ||
      existing.mode !== assignment.mode ||
      existing.driverId !== assignment.driverId ||
      existing.vehicleId !== assignment.vehicleId ||
      existing.partnerOrganizationId !== assignment.partnerOrganizationId
    ) {
      throw new AssignmentDomainValidationError(
        "Assignment identity and executor are immutable"
      );
    }

    this.assertNoCurrentConflict(assignment, key, serviceKey);
    this.byId.set(key, this.clone(assignment));
    if (isCurrentAssignmentStatus(assignment.status)) {
      this.currentByService.set(serviceKey, key);
    } else if (this.currentByService.get(serviceKey) === key) {
      this.currentByService.delete(serviceKey);
    }
  }

  private assertNoCurrentConflict(
    assignment: Assignment,
    assignmentKey: string,
    serviceKey: string
  ): void {
    if (!isCurrentAssignmentStatus(assignment.status)) return;
    const occupied = this.currentByService.get(serviceKey);
    if (occupied && occupied !== assignmentKey) {
      throw new ActiveAssignmentConflictError();
    }
  }

  async findById(
    tenantId: TenantId,
    organizationId: OrganizationId,
    assignmentId: AssignmentId
  ): Promise<Assignment | null> {
    const found = this.byId.get(this.idKey(tenantId, organizationId, assignmentId));
    return found ? this.clone(found) : null;
  }

  async findCurrentByServiceId(
    tenantId: TenantId,
    organizationId: OrganizationId,
    serviceId: AssignmentServiceId
  ): Promise<Assignment | null> {
    const assignmentKey = this.currentByService.get(
      this.serviceKey(tenantId, organizationId, serviceId)
    );
    if (!assignmentKey) return null;
    const found = this.byId.get(assignmentKey);
    return found ? this.clone(found) : null;
  }
}

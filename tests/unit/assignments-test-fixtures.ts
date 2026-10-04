import { randomUUID } from "node:crypto";
import {
  createAssignmentForReadyService,
  type Assignment,
} from "@/lib/modules/assignments";
import { markServiceReadyForAssignment, type Service } from "@/lib/modules/services";
import { createPlannedService } from "./services-test-fixtures";

export function createReadyService(): Service {
  return markServiceReadyForAssignment(
    createPlannedService(),
    new Date("2026-10-04T09:00:00.000Z")
  ).service;
}

export function createInternalPendingAssignment(service = createReadyService()): Assignment {
  return createAssignmentForReadyService(service, {
    id: randomUUID(),
    tenantId: service.tenantId,
    organizationId: service.organizationId,
    mode: "INTERNAL",
    driverId: randomUUID(),
    vehicleId: randomUUID(),
    createdAt: new Date("2026-10-04T10:00:00.000Z"),
  }).assignment;
}

export function createPartnerPendingAssignment(service = createReadyService()): Assignment {
  return createAssignmentForReadyService(service, {
    id: randomUUID(),
    tenantId: service.tenantId,
    organizationId: service.organizationId,
    mode: "PARTNER",
    partnerOrganizationId: randomUUID(),
    createdAt: new Date("2026-10-04T10:00:00.000Z"),
  }).assignment;
}

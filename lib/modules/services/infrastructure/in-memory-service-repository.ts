import type { OrganizationId, TenantId } from "@/lib/modules/identity";
import type {
  ServiceBookingPage,
  ServiceRepository,
} from "../application/service-repository";
import type { Service } from "../domain/service";
import { rehydrateService } from "../domain/service";
import type { ServiceBookingId } from "../domain/service-booking-id";
import type { ServiceGenerationKey } from "../domain/service-generation-key";
import type { ServiceId } from "../domain/service-id";
import type { ServiceNumber } from "../domain/service-number";
import {
  DomainValidationError,
  DuplicateServiceGenerationKeyError,
  DuplicateServiceNumberError,
  DuplicateServiceSequenceError,
  ServiceVersionConflictError,
} from "../domain/errors";

/** Default page size when limit omitted. */
export const DEFAULT_SERVICE_BOOKING_PAGE_LIMIT = 20;
/** Hard maximum page size. */
export const MAX_SERVICE_BOOKING_PAGE_LIMIT = 100;

/**
 * In-memory ServiceRepository for foundation tests.
 * NOT production-ready. No JSON file persistence. No runtime JSON.
 */
export class InMemoryServiceRepository implements ServiceRepository {
  private readonly byId = new Map<string, Service>();
  private readonly byNumber = new Map<string, string>();
  private readonly byGenerationKey = new Map<string, string>();
  private readonly byBookingSequence = new Map<string, string>();

  private idKey(
    tenantId: TenantId,
    organizationId: OrganizationId,
    serviceId: ServiceId
  ): string {
    return `${tenantId}::${organizationId}::${serviceId}`;
  }

  private numberKey(
    tenantId: TenantId,
    organizationId: OrganizationId,
    serviceNumber: ServiceNumber
  ): string {
    return `${tenantId}::${organizationId}::${serviceNumber}`;
  }

  private generationKeyKey(
    tenantId: TenantId,
    organizationId: OrganizationId,
    generationKey: ServiceGenerationKey
  ): string {
    return `${tenantId}::${organizationId}::${generationKey}`;
  }

  private bookingSequenceKey(
    tenantId: TenantId,
    organizationId: OrganizationId,
    bookingId: ServiceBookingId,
    sequence: number
  ): string {
    return `${tenantId}::${organizationId}::${bookingId}::${sequence}`;
  }

  private clone(service: Service): Service {
    return rehydrateService({
      id: service.id,
      tenantId: service.tenantId,
      organizationId: service.organizationId,
      serviceNumber: service.serviceNumber,
      bookingId: service.bookingId,
      serviceSequence: service.serviceSequence,
      generationKey: service.generationKey,
      serviceType: service.serviceType,
      status: service.status,
      routePlan: {
        pickup: { ...service.routePlan.pickup },
        dropoff: service.routePlan.dropoff
          ? { ...service.routePlan.dropoff }
          : null,
        stops: service.routePlan.stops.map((s) => ({
          sequence: s.sequence,
          location: { ...s.location },
          plannedDurationMinutes: s.plannedDurationMinutes,
          optional: s.optional,
          commercialStopRef: s.commercialStopRef,
        })),
        estimatedDistanceMeters: service.routePlan.estimatedDistanceMeters,
        estimatedDurationMinutes: service.routePlan.estimatedDurationMinutes,
        routeEstimateProviderRef: service.routePlan.routeEstimateProviderRef,
        routeEstimateVersion: service.routePlan.routeEstimateVersion,
      },
      schedule: {
        scheduledPickupAt: new Date(
          service.schedule.scheduledPickupAt.getTime()
        ),
        timezone: service.schedule.timezone,
        requestedArrivalAt: service.schedule.requestedArrivalAt
          ? new Date(service.schedule.requestedArrivalAt.getTime())
          : null,
        pickupWindowMinutes: service.schedule.pickupWindowMinutes,
      },
      requirements: { ...service.requirements },
      operationalContact: service.operationalContact
        ? { ...service.operationalContact }
        : null,
      cancelReasonCode: service.cancelReasonCode,
      cancelledAt: service.cancelledAt
        ? new Date(service.cancelledAt.getTime())
        : null,
      createdAt: new Date(service.createdAt.getTime()),
      updatedAt: new Date(service.updatedAt.getTime()),
      version: service.version,
    });
  }

  async save(service: Service, expectedVersion?: number): Promise<void> {
    const key = this.idKey(
      service.tenantId,
      service.organizationId,
      service.id
    );
    const existing = this.byId.get(key);

    if (!existing) {
      if (expectedVersion !== undefined) {
        throw new ServiceVersionConflictError();
      }
      this.assertUniqueNumber(service, key);
      this.assertUniqueGenerationKey(service, key);
      this.assertUniqueBookingSequence(service, key);
      this.byId.set(key, this.clone(service));
      this.indexService(service, key);
      return;
    }

    if (expectedVersion === undefined) {
      throw new ServiceVersionConflictError();
    }
    if (existing.version !== expectedVersion) {
      throw new ServiceVersionConflictError();
    }
    if (service.version !== existing.version + 1) {
      throw new ServiceVersionConflictError();
    }

    if (
      existing.id !== service.id ||
      existing.tenantId !== service.tenantId ||
      existing.organizationId !== service.organizationId ||
      existing.serviceNumber !== service.serviceNumber ||
      existing.bookingId !== service.bookingId ||
      existing.serviceSequence !== service.serviceSequence ||
      existing.generationKey !== service.generationKey ||
      existing.serviceType !== service.serviceType
    ) {
      throw new DomainValidationError("Service identity scope is immutable");
    }

    this.byId.set(key, this.clone(service));
  }

  private indexService(service: Service, key: string): void {
    this.byNumber.set(
      this.numberKey(
        service.tenantId,
        service.organizationId,
        service.serviceNumber
      ),
      key
    );
    this.byGenerationKey.set(
      this.generationKeyKey(
        service.tenantId,
        service.organizationId,
        service.generationKey
      ),
      key
    );
    this.byBookingSequence.set(
      this.bookingSequenceKey(
        service.tenantId,
        service.organizationId,
        service.bookingId,
        service.serviceSequence
      ),
      key
    );
  }

  private assertUniqueNumber(service: Service, key: string): void {
    const numberKey = this.numberKey(
      service.tenantId,
      service.organizationId,
      service.serviceNumber
    );
    const occupied = this.byNumber.get(numberKey);
    if (occupied && occupied !== key) {
      throw new DuplicateServiceNumberError();
    }
  }

  private assertUniqueGenerationKey(service: Service, key: string): void {
    const gk = this.generationKeyKey(
      service.tenantId,
      service.organizationId,
      service.generationKey
    );
    const occupied = this.byGenerationKey.get(gk);
    if (occupied && occupied !== key) {
      throw new DuplicateServiceGenerationKeyError();
    }
  }

  private assertUniqueBookingSequence(service: Service, key: string): void {
    const seqKey = this.bookingSequenceKey(
      service.tenantId,
      service.organizationId,
      service.bookingId,
      service.serviceSequence
    );
    const occupied = this.byBookingSequence.get(seqKey);
    if (occupied && occupied !== key) {
      throw new DuplicateServiceSequenceError();
    }
  }

  async findById(
    tenantId: TenantId,
    organizationId: OrganizationId,
    serviceId: ServiceId
  ): Promise<Service | null> {
    const found = this.byId.get(this.idKey(tenantId, organizationId, serviceId));
    if (!found) {
      return null;
    }
    if (
      found.tenantId !== tenantId ||
      found.organizationId !== organizationId
    ) {
      return null;
    }
    return this.clone(found);
  }

  async findByServiceNumber(
    tenantId: TenantId,
    organizationId: OrganizationId,
    serviceNumber: ServiceNumber
  ): Promise<Service | null> {
    const idKey = this.byNumber.get(
      this.numberKey(tenantId, organizationId, serviceNumber)
    );
    if (!idKey) {
      return null;
    }
    const found = this.byId.get(idKey);
    if (!found) {
      return null;
    }
    if (
      found.tenantId !== tenantId ||
      found.organizationId !== organizationId
    ) {
      return null;
    }
    return this.clone(found);
  }

  async existsByServiceNumber(
    tenantId: TenantId,
    organizationId: OrganizationId,
    serviceNumber: ServiceNumber
  ): Promise<boolean> {
    const found = await this.findByServiceNumber(
      tenantId,
      organizationId,
      serviceNumber
    );
    return found !== null;
  }

  async findByGenerationKey(
    tenantId: TenantId,
    organizationId: OrganizationId,
    generationKey: ServiceGenerationKey
  ): Promise<Service | null> {
    const idKey = this.byGenerationKey.get(
      this.generationKeyKey(tenantId, organizationId, generationKey)
    );
    if (!idKey) {
      return null;
    }
    const found = this.byId.get(idKey);
    if (!found) {
      return null;
    }
    if (
      found.tenantId !== tenantId ||
      found.organizationId !== organizationId
    ) {
      return null;
    }
    return this.clone(found);
  }

  async findByBookingId(
    tenantId: TenantId,
    organizationId: OrganizationId,
    bookingId: ServiceBookingId,
    options?: { limit?: number; cursor?: number | null }
  ): Promise<ServiceBookingPage> {
    const limit = options?.limit ?? DEFAULT_SERVICE_BOOKING_PAGE_LIMIT;
    if (
      !Number.isSafeInteger(limit) ||
      limit < 1 ||
      limit > MAX_SERVICE_BOOKING_PAGE_LIMIT
    ) {
      throw new DomainValidationError("limit is invalid");
    }

    const cursor = options?.cursor ?? null;
    if (cursor !== null) {
      if (!Number.isSafeInteger(cursor) || cursor < 0) {
        throw new DomainValidationError("cursor is invalid");
      }
    }

    const matched: Service[] = [];
    for (const service of this.byId.values()) {
      if (
        service.tenantId !== tenantId ||
        service.organizationId !== organizationId ||
        service.bookingId !== bookingId
      ) {
        continue;
      }
      if (cursor !== null && service.serviceSequence <= cursor) {
        continue;
      }
      matched.push(service);
    }

    matched.sort((a, b) => a.serviceSequence - b.serviceSequence);

    const page = matched.slice(0, limit).map((s) => this.clone(s));
    const nextCursor =
      matched.length > limit
        ? page[page.length - 1]?.serviceSequence ?? null
        : null;

    return Object.freeze({
      items: Object.freeze(page),
      nextCursor,
    });
  }

  clear(): void {
    this.byId.clear();
    this.byNumber.clear();
    this.byGenerationKey.clear();
    this.byBookingSequence.clear();
  }
}

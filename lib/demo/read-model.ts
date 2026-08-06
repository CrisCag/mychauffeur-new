import {
  DEMO_READ_MODEL_DEFAULT_LIMIT,
  DEMO_READ_MODEL_MAX_LIMIT,
} from "./constants";
import { DemoValidationError } from "./errors";
import type { DemoVehicleCategory } from "./fixtures";

export type DemoProjectionRecord = {
  readonly submissionKey: string;
  readonly tenantId: string;
  readonly organizationId: string;
  readonly quoteId: string;
  readonly quoteNumber: string;
  readonly bookingId: string;
  readonly bookingNumber: string;
  readonly serviceId: string;
  readonly serviceNumber: string;
  readonly vehicleCategory: DemoVehicleCategory;
  readonly passengerCount: number;
  readonly luggageCount: number;
  readonly originLabel: string;
  readonly destinationLabel: string;
  readonly scheduledPickupAtIso: string;
  readonly createdAtIso: string;
  readonly payloadFingerprint: string;
};

/**
 * Demo-only projection index — NOT commercial Source of Truth.
 * Lists recent demo bookings with bounded pagination (no findAll).
 */
export class InMemoryDemoReadModel {
  private readonly byBookingId = new Map<string, DemoProjectionRecord>();
  private readonly order: string[] = [];
  private readonly bySubmissionKey = new Map<string, string>();

  reset(): void {
    this.byBookingId.clear();
    this.order.length = 0;
    this.bySubmissionKey.clear();
  }

  record(projection: DemoProjectionRecord): void {
    if (this.byBookingId.has(projection.bookingId)) {
      return;
    }
    this.byBookingId.set(projection.bookingId, Object.freeze({ ...projection }));
    this.order.unshift(projection.bookingId);
    this.bySubmissionKey.set(projection.submissionKey, projection.bookingId);
  }

  findBookingIdBySubmissionKey(submissionKey: string): string | null {
    return this.bySubmissionKey.get(submissionKey) ?? null;
  }

  getProjection(bookingId: string): DemoProjectionRecord | null {
    return this.byBookingId.get(bookingId) ?? null;
  }

  listBookingIds(options?: {
    limit?: number;
    cursor?: string | null;
  }): { ids: string[]; nextCursor: string | null } {
    const limit = options?.limit ?? DEMO_READ_MODEL_DEFAULT_LIMIT;
    if (
      !Number.isSafeInteger(limit) ||
      limit < 1 ||
      limit > DEMO_READ_MODEL_MAX_LIMIT
    ) {
      throw new DemoValidationError("limit is invalid");
    }
    const cursor = options?.cursor ?? null;
    let start = 0;
    if (cursor !== null && cursor !== "") {
      const idx = this.order.indexOf(cursor);
      if (idx < 0) {
        throw new DemoValidationError("cursor is invalid");
      }
      start = idx + 1;
    }
    const slice = this.order.slice(start, start + limit);
    const nextCursor =
      start + limit < this.order.length
        ? slice[slice.length - 1] ?? null
        : null;
    return { ids: slice, nextCursor };
  }
}

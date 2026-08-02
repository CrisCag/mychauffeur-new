import type { OrganizationId, TenantId } from "@/lib/modules/identity";
import type { BookingRepository } from "../application/booking-repository";
import type { Booking, BookingId } from "../domain/booking";
import { rehydrateBooking } from "../domain/booking";
import type { BookingNumber } from "../domain/booking-number";
import {
  BookingVersionConflictError,
  DomainValidationError,
  DuplicateBookingNumberError,
} from "../domain/errors";

/**
 * In-memory BookingRepository for foundation tests.
 * NOT production-ready. No JSON file persistence. No cross-tenant leakage.
 *
 * Optimistic concurrency (single semantics):
 * - Insert (no row): expectedVersion MUST be omitted; first save is not an update.
 * - Update (row exists): expectedVersion MUST equal persisted version;
 *   booking.version MUST equal persisted version + 1.
 * - Failed save leaves the stored row unchanged.
 * - find/rehydrate never increment version.
 */
export class InMemoryBookingRepository implements BookingRepository {
  private readonly byId = new Map<string, Booking>();
  private readonly byNumber = new Map<string, string>();

  private idKey(
    tenantId: TenantId,
    organizationId: OrganizationId,
    bookingId: BookingId
  ): string {
    return `${tenantId}::${organizationId}::${bookingId}`;
  }

  private numberKey(
    tenantId: TenantId,
    organizationId: OrganizationId,
    bookingNumber: BookingNumber
  ): string {
    return `${tenantId}::${organizationId}::${bookingNumber}`;
  }

  private clone(booking: Booking): Booking {
    return rehydrateBooking({
      id: booking.id,
      tenantId: booking.tenantId,
      organizationId: booking.organizationId,
      bookingNumber: booking.bookingNumber,
      bookedByActorId: booking.bookedByActorId,
      customerId: booking.customerId,
      guestCustomerSnapshot: booking.guestCustomerSnapshot
        ? { ...booking.guestCustomerSnapshot }
        : null,
      source: booking.source,
      status: booking.status,
      requestedAt: new Date(booking.requestedAt.getTime()),
      confirmedAt: booking.confirmedAt
        ? new Date(booking.confirmedAt.getTime())
        : null,
      cancelledAt: booking.cancelledAt
        ? new Date(booking.cancelledAt.getTime())
        : null,
      expiredAt: booking.expiredAt
        ? new Date(booking.expiredAt.getTime())
        : null,
      createdAt: new Date(booking.createdAt.getTime()),
      updatedAt: new Date(booking.updatedAt.getTime()),
      version: booking.version,
    });
  }

  async save(booking: Booking, expectedVersion?: number): Promise<void> {
    const key = this.idKey(
      booking.tenantId,
      booking.organizationId,
      booking.id
    );
    const existing = this.byId.get(key);

    if (!existing) {
      // Insert path: first save is create — expectedVersion must be omitted.
      if (expectedVersion !== undefined) {
        throw new BookingVersionConflictError();
      }

      const numberKey = this.numberKey(
        booking.tenantId,
        booking.organizationId,
        booking.bookingNumber
      );
      const occupied = this.byNumber.get(numberKey);
      if (occupied && occupied !== key) {
        throw new DuplicateBookingNumberError();
      }

      this.byId.set(key, this.clone(booking));
      this.byNumber.set(numberKey, key);
      return;
    }

    // Update path: expectedVersion is mandatory and must match persisted version.
    if (expectedVersion === undefined) {
      throw new BookingVersionConflictError();
    }
    if (existing.version !== expectedVersion) {
      throw new BookingVersionConflictError();
    }
    if (booking.version !== existing.version + 1) {
      throw new BookingVersionConflictError();
    }

    // bookingNumber is immutable after create (matches Aggregate policy).
    if (existing.bookingNumber !== booking.bookingNumber) {
      throw new DomainValidationError("BookingNumber is immutable");
    }

    this.byId.set(key, this.clone(booking));
  }

  async findById(
    tenantId: TenantId,
    organizationId: OrganizationId,
    bookingId: BookingId
  ): Promise<Booking | null> {
    const found = this.byId.get(
      this.idKey(tenantId, organizationId, bookingId)
    );
    if (!found) {
      return null;
    }
    // Defense in depth: composite key already scopes; never leak cross-scope.
    if (
      found.tenantId !== tenantId ||
      found.organizationId !== organizationId
    ) {
      return null;
    }
    return this.clone(found);
  }

  async findByBookingNumber(
    tenantId: TenantId,
    organizationId: OrganizationId,
    bookingNumber: BookingNumber
  ): Promise<Booking | null> {
    const idKey = this.byNumber.get(
      this.numberKey(tenantId, organizationId, bookingNumber)
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

  async existsByBookingNumber(
    tenantId: TenantId,
    organizationId: OrganizationId,
    bookingNumber: BookingNumber
  ): Promise<boolean> {
    const found = await this.findByBookingNumber(
      tenantId,
      organizationId,
      bookingNumber
    );
    return found !== null;
  }

  /** Test helper only — not part of production port. */
  clear(): void {
    this.byId.clear();
    this.byNumber.clear();
  }
}

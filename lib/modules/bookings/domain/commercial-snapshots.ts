/**
 * Commercial Snapshot bundle frozen at Booking confirmation (Step 6).
 * commercialRevision = 1 marks the confirmation freeze.
 * Future commercial changes MUST append BookingRevision records — never overwrite.
 * BookingRevision Aggregate / append-only ledger is readiness only — NOT implemented.
 */
import type { BillingSnapshot, BillingSnapshotInput } from "./billing-snapshot";
import { cloneBillingSnapshot, createBillingSnapshot } from "./billing-snapshot";
import type { ContactSnapshot, ContactSnapshotInput } from "./contact-snapshot";
import {
  cloneContactSnapshot,
  createContactSnapshot,
} from "./contact-snapshot";
import type { PolicySnapshot, PolicySnapshotInput } from "./policy-snapshot";
import { clonePolicySnapshot, createPolicySnapshot } from "./policy-snapshot";
import type { PriceSnapshot, PriceSnapshotInput } from "./price-snapshot";
import { clonePriceSnapshot, createPriceSnapshot } from "./price-snapshot";
import {
  DomainValidationError,
  MissingCommercialSnapshotError,
} from "./errors";
import type { BookingStatus } from "./booking-status";

export type CommercialSnapshots = {
  readonly priceSnapshot: PriceSnapshot;
  readonly policySnapshot: PolicySnapshot;
  readonly contactSnapshot: ContactSnapshot;
  readonly billingSnapshot: BillingSnapshot;
};

export type CommercialSnapshotsInput = {
  priceSnapshot: PriceSnapshot | PriceSnapshotInput;
  policySnapshot: PolicySnapshot | PolicySnapshotInput;
  contactSnapshot: ContactSnapshot | ContactSnapshotInput;
  billingSnapshot: BillingSnapshot | BillingSnapshotInput;
};

export type CommercialSnapshotFields = {
  readonly priceSnapshot: PriceSnapshot | null;
  readonly policySnapshot: PolicySnapshot | null;
  readonly contactSnapshot: ContactSnapshot | null;
  readonly billingSnapshot: BillingSnapshot | null;
  /** 0 = none; 1 = confirmation freeze. Higher revisions require BookingRevision (not in Step 6). */
  readonly commercialRevision: number;
};

export function createCommercialSnapshots(
  input: CommercialSnapshotsInput
): CommercialSnapshots {
  return Object.freeze({
    priceSnapshot: createPriceSnapshot(input.priceSnapshot),
    policySnapshot: createPolicySnapshot(input.policySnapshot),
    contactSnapshot: createContactSnapshot(input.contactSnapshot),
    billingSnapshot: createBillingSnapshot(input.billingSnapshot),
  });
}

export function cloneCommercialSnapshots(
  snapshots: CommercialSnapshots
): CommercialSnapshots {
  return Object.freeze({
    priceSnapshot: clonePriceSnapshot(snapshots.priceSnapshot),
    policySnapshot: clonePolicySnapshot(snapshots.policySnapshot),
    contactSnapshot: cloneContactSnapshot(snapshots.contactSnapshot),
    billingSnapshot: cloneBillingSnapshot(snapshots.billingSnapshot),
  });
}

export function emptyCommercialSnapshotFields(): CommercialSnapshotFields {
  return {
    priceSnapshot: null,
    policySnapshot: null,
    contactSnapshot: null,
    billingSnapshot: null,
    commercialRevision: 0,
  };
}

export function commercialFieldsFromBundle(
  snapshots: CommercialSnapshots,
  commercialRevision: number
): CommercialSnapshotFields {
  // Step 6 confirmation freeze is exactly revision 1.
  if (commercialRevision !== 1) {
    throw new DomainValidationError("commercialRevision is invalid");
  }
  const cloned = cloneCommercialSnapshots(snapshots);
  return {
    priceSnapshot: cloned.priceSnapshot,
    policySnapshot: cloned.policySnapshot,
    contactSnapshot: cloned.contactSnapshot,
    billingSnapshot: cloned.billingSnapshot,
    commercialRevision: 1,
  };
}

function countPresent(fields: CommercialSnapshotFields): number {
  return [
    fields.priceSnapshot,
    fields.policySnapshot,
    fields.contactSnapshot,
    fields.billingSnapshot,
  ].filter((value) => value !== null && value !== undefined).length;
}

/**
 * Snapshot presence rules (Step 6):
 * - CONFIRMED: all four required, commercialRevision === 1
 * - CANCELLED after confirm: all four retained, commercialRevision === 1
 * - CANCELLED without confirm / DRAFT / PENDING / EXPIRED: none, revision 0
 * - Partial combinations always rejected
 */
export function assertCommercialSnapshotInvariants(
  status: BookingStatus,
  fields: CommercialSnapshotFields
): void {
  const present = countPresent(fields);
  if (present !== 0 && present !== 4) {
    throw new MissingCommercialSnapshotError();
  }

  if (!Number.isInteger(fields.commercialRevision) || fields.commercialRevision < 0) {
    throw new DomainValidationError("commercialRevision is invalid");
  }

  if (status === "CONFIRMED") {
    if (present !== 4) {
      throw new MissingCommercialSnapshotError();
    }
    if (fields.commercialRevision !== 1) {
      throw new DomainValidationError("commercialRevision is invalid");
    }
    return;
  }

  if (status === "CANCELLED") {
    if (present === 4) {
      if (fields.commercialRevision !== 1) {
        throw new DomainValidationError("commercialRevision is invalid");
      }
      return;
    }
    if (fields.commercialRevision !== 0) {
      throw new DomainValidationError("commercialRevision is invalid");
    }
    return;
  }

  // DRAFT | PENDING_CONFIRMATION | EXPIRED
  if (present !== 0 || fields.commercialRevision !== 0) {
    throw new DomainValidationError(
      "Commercial snapshots are only allowed after confirmation"
    );
  }
}

export function cloneCommercialFields(
  fields: CommercialSnapshotFields
): CommercialSnapshotFields {
  return {
    priceSnapshot: fields.priceSnapshot
      ? clonePriceSnapshot(fields.priceSnapshot)
      : null,
    policySnapshot: fields.policySnapshot
      ? clonePolicySnapshot(fields.policySnapshot)
      : null,
    contactSnapshot: fields.contactSnapshot
      ? cloneContactSnapshot(fields.contactSnapshot)
      : null,
    billingSnapshot: fields.billingSnapshot
      ? cloneBillingSnapshot(fields.billingSnapshot)
      : null,
    commercialRevision: fields.commercialRevision,
  };
}

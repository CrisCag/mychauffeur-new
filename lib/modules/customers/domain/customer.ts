import type { OrganizationId, TenantId } from "@/lib/modules/identity";
import { asCustomerId, type CustomerId } from "./customer-id";
import {
  asCustomerEmailAddress,
  type CustomerEmailAddress,
} from "./customer-email-address";
import {
  createCustomerDomainEvent,
  type CustomerDomainEvent,
} from "./customer-events";
import {
  cloneCustomerIdentityLink,
  createCustomerIdentityLink,
  type CustomerIdentityLink,
} from "./customer-identity-link";
import {
  asCustomerNumber,
  type CustomerNumber,
} from "./customer-number";
import {
  asCustomerPhoneNumber,
  type CustomerPhoneNumber,
} from "./customer-phone-number";
import {
  isCustomerStatus,
  isTerminalCustomerStatus,
  type CustomerStatus,
} from "./customer-status";
import { isCustomerType, type CustomerType } from "./customer-type";
import {
  asIndividualCustomerName,
  type IndividualCustomerName,
} from "./individual-customer-name";
import {
  asOrganizationCustomerName,
  type OrganizationCustomerName,
} from "./organization-customer-name";
import {
  CustomerIdentityLinkConflictError,
  DomainValidationError,
  InvalidCustomerStateTransitionError,
} from "./errors";

/**
 * Customer Aggregate Root — commercial counterparty foundation (Step 8).
 * Distinct from Identity/User/Actor/Booker/Passenger/Billing Party/Lead.
 * Does not create or mutate Quote/Booking snapshots.
 * Domain events are Customer.* values only — no broker/outbox.
 */
export type Customer = {
  readonly id: CustomerId;
  readonly tenantId: TenantId;
  readonly organizationId: OrganizationId;
  readonly customerNumber: CustomerNumber;
  readonly customerType: CustomerType;
  readonly status: CustomerStatus;
  readonly individualName: IndividualCustomerName | null;
  readonly organizationName: OrganizationCustomerName | null;
  readonly email: CustomerEmailAddress | null;
  readonly phone: CustomerPhoneNumber | null;
  readonly identityLink: CustomerIdentityLink | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly anonymizedAt: Date | null;
  readonly version: number;
};

export type CustomerOperationResult = {
  readonly customer: Customer;
  readonly events: readonly CustomerDomainEvent[];
};

type CreateCustomerBaseInput = {
  id: CustomerId | string;
  tenantId: TenantId;
  organizationId: OrganizationId;
  customerNumber: CustomerNumber | string;
  email?: string | null;
  phone?: string | null;
  /** Explicit clock — required (no hidden Date.now in Domain). */
  createdAt: Date;
  updatedAt?: Date;
};

export type CreateIndividualCustomerInput = CreateCustomerBaseInput & {
  individualName: string;
};

export type CreateOrganizationCustomerInput = CreateCustomerBaseInput & {
  organizationName: string;
};

export type RehydrateCustomerInput = {
  id: CustomerId | string;
  tenantId: TenantId;
  organizationId: OrganizationId;
  customerNumber: CustomerNumber | string;
  customerType: CustomerType | string;
  status: CustomerStatus | string;
  individualName?: string | null;
  organizationName?: string | null;
  email?: string | null;
  phone?: string | null;
  identityLink?: CustomerIdentityLink | null;
  createdAt: Date;
  updatedAt: Date;
  anonymizedAt?: Date | null;
  version: number;
};

export type UpdateCustomerProfileInput = {
  individualName?: string | null;
  organizationName?: string | null;
  /**
   * Contact patch:
   * - omit (`undefined`) → unchanged
   * - `null` → explicit clear
   * - non-empty string → set (normalized)
   * - blank string → rejected
   */
  email?: string | null;
  /**
   * Contact patch:
   * - omit (`undefined`) → unchanged
   * - `null` → explicit clear
   * - non-empty string → set (normalized)
   * - blank string → rejected
   */
  phone?: string | null;
  at: Date;
};

function assertNonEmptyId(value: string, field: string): string {
  const normalized = value.trim();
  if (!normalized) {
    throw new DomainValidationError(`${field} is required`);
  }
  return normalized;
}

function assertVersion(version: number): number {
  if (!Number.isInteger(version) || version < 0) {
    throw new DomainValidationError(
      "Customer version must be a non-negative integer"
    );
  }
  return version;
}

function copyDate(value: Date): Date {
  return new Date(value.getTime());
}

function parseOptionalEmail(
  value: string | null | undefined
): CustomerEmailAddress | null {
  if (value === undefined || value === null) {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  return asCustomerEmailAddress(trimmed);
}

function parseOptionalPhone(
  value: string | null | undefined
): CustomerPhoneNumber | null {
  if (value === undefined || value === null) {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  return asCustomerPhoneNumber(trimmed);
}

/**
 * Profile patch contact semantics:
 * - undefined → leave unchanged
 * - null → explicit clear
 * - non-empty string → set (normalized)
 * - blank string → rejected (use null to clear)
 */
function parseProfileEmailPatch(
  value: string | null | undefined,
  current: CustomerEmailAddress | null
): CustomerEmailAddress | null {
  if (value === undefined) {
    return current;
  }
  if (value === null) {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    throw new DomainValidationError(
      "email blank is invalid; pass null to clear"
    );
  }
  return asCustomerEmailAddress(trimmed);
}

function parseProfilePhonePatch(
  value: string | null | undefined,
  current: CustomerPhoneNumber | null
): CustomerPhoneNumber | null {
  if (value === undefined) {
    return current;
  }
  if (value === null) {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    throw new DomainValidationError(
      "phone blank is invalid; pass null to clear"
    );
  }
  return asCustomerPhoneNumber(trimmed);
}

function assertTypeNameInvariants(
  customerType: CustomerType,
  status: CustomerStatus,
  individualName: IndividualCustomerName | null,
  organizationName: OrganizationCustomerName | null
): void {
  if (status === "ANONYMIZED") {
    if (individualName !== null || organizationName !== null) {
      throw new DomainValidationError(
        "ANONYMIZED Customer cannot retain names"
      );
    }
    return;
  }

  if (customerType === "INDIVIDUAL") {
    if (!individualName) {
      throw new DomainValidationError("individualName is required");
    }
    if (organizationName !== null) {
      throw new DomainValidationError(
        "INDIVIDUAL Customer cannot have organizationName"
      );
    }
    return;
  }

  if (!organizationName) {
    throw new DomainValidationError("organizationName is required");
  }
  if (individualName !== null) {
    throw new DomainValidationError(
      "ORGANIZATION Customer cannot have individualName"
    );
  }
}

function assertAnonymizedInvariants(customer: {
  status: CustomerStatus;
  individualName: IndividualCustomerName | null;
  organizationName: OrganizationCustomerName | null;
  email: CustomerEmailAddress | null;
  phone: CustomerPhoneNumber | null;
  identityLink: CustomerIdentityLink | null;
  anonymizedAt: Date | null;
}): void {
  if (customer.status === "ANONYMIZED") {
    if (
      customer.individualName !== null ||
      customer.organizationName !== null ||
      customer.email !== null ||
      customer.phone !== null ||
      customer.identityLink !== null
    ) {
      throw new DomainValidationError(
        "ANONYMIZED Customer must not retain PII or identity link"
      );
    }
    if (!customer.anonymizedAt) {
      throw new DomainValidationError("anonymizedAt is required");
    }
    return;
  }
  if (customer.anonymizedAt !== null) {
    throw new DomainValidationError(
      "anonymizedAt is only allowed for ANONYMIZED"
    );
  }
}

function freezeCustomer(customer: Customer): Customer {
  assertTypeNameInvariants(
    customer.customerType,
    customer.status,
    customer.individualName,
    customer.organizationName
  );
  assertAnonymizedInvariants(customer);
  return Object.freeze({
    ...customer,
    createdAt: copyDate(customer.createdAt),
    updatedAt: copyDate(customer.updatedAt),
    anonymizedAt: customer.anonymizedAt
      ? copyDate(customer.anonymizedAt)
      : null,
    identityLink: customer.identityLink
      ? cloneCustomerIdentityLink(customer.identityLink)
      : null,
  });
}

function operationResult(
  customer: Customer,
  events: readonly CustomerDomainEvent[]
): CustomerOperationResult {
  return {
    customer,
    events: Object.freeze([...events]),
  };
}

function bump(customer: Customer, updatedAt: Date, patch: Partial<Customer>): Customer {
  if (customer.createdAt.getTime() > updatedAt.getTime()) {
    throw new DomainValidationError("createdAt must be <= updatedAt");
  }
  if (customer.updatedAt.getTime() > updatedAt.getTime()) {
    throw new DomainValidationError(
      "operation timestamp must be >= previous updatedAt"
    );
  }
  return freezeCustomer({
    ...customer,
    ...patch,
    updatedAt,
    version: assertVersion(customer.version + 1),
  });
}

function assertNotAnonymized(customer: Customer): void {
  if (isTerminalCustomerStatus(customer.status)) {
    throw new InvalidCustomerStateTransitionError();
  }
}

function assertClock(value: Date, field: string): Date {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new DomainValidationError(`${field} is invalid`);
  }
  return value;
}

function buildCreated(
  input: CreateCustomerBaseInput & {
    customerType: CustomerType;
    individualName: IndividualCustomerName | null;
    organizationName: OrganizationCustomerName | null;
  }
): CustomerOperationResult {
  const id = asCustomerId(String(input.id));
  const tenantId = assertNonEmptyId(input.tenantId, "tenantId") as TenantId;
  const organizationId = assertNonEmptyId(
    input.organizationId,
    "organizationId"
  ) as OrganizationId;
  const customerNumber = asCustomerNumber(String(input.customerNumber));
  const createdAt = assertClock(input.createdAt, "createdAt");
  const updatedAt = assertClock(input.updatedAt ?? createdAt, "updatedAt");
  if (createdAt.getTime() > updatedAt.getTime()) {
    throw new DomainValidationError("createdAt must be <= updatedAt");
  }

  const customer = freezeCustomer({
    id,
    tenantId,
    organizationId,
    customerNumber,
    customerType: input.customerType,
    status: "ACTIVE",
    individualName: input.individualName,
    organizationName: input.organizationName,
    email: parseOptionalEmail(input.email),
    phone: parseOptionalPhone(input.phone),
    identityLink: null,
    createdAt,
    updatedAt,
    anonymizedAt: null,
    version: 0,
  });

  return operationResult(customer, [
    createCustomerDomainEvent({
      type: "Customer.Created",
      customerId: customer.id,
      tenantId: customer.tenantId,
      organizationId: customer.organizationId,
      customerType: customer.customerType,
      status: customer.status,
      occurredAt: createdAt,
    }),
  ]);
}

export function createIndividualCustomer(
  input: CreateIndividualCustomerInput
): CustomerOperationResult {
  return buildCreated({
    ...input,
    customerType: "INDIVIDUAL",
    individualName: asIndividualCustomerName(input.individualName),
    organizationName: null,
  });
}

export function createOrganizationCustomer(
  input: CreateOrganizationCustomerInput
): CustomerOperationResult {
  return buildCreated({
    ...input,
    customerType: "ORGANIZATION",
    individualName: null,
    organizationName: asOrganizationCustomerName(input.organizationName),
  });
}

export function rehydrateCustomer(input: RehydrateCustomerInput): Customer {
  const id = asCustomerId(String(input.id));
  const tenantId = assertNonEmptyId(input.tenantId, "tenantId") as TenantId;
  const organizationId = assertNonEmptyId(
    input.organizationId,
    "organizationId"
  ) as OrganizationId;
  const customerNumber = asCustomerNumber(String(input.customerNumber));
  if (!isCustomerType(String(input.customerType))) {
    throw new DomainValidationError("Invalid CustomerType");
  }
  if (!isCustomerStatus(String(input.status))) {
    throw new DomainValidationError("Invalid CustomerStatus");
  }
  const customerType = input.customerType as CustomerType;
  const status = input.status as CustomerStatus;

  const individualName =
    input.individualName === undefined || input.individualName === null
      ? null
      : asIndividualCustomerName(String(input.individualName));
  const organizationName =
    input.organizationName === undefined || input.organizationName === null
      ? null
      : asOrganizationCustomerName(String(input.organizationName));

  const createdAt = assertClock(input.createdAt, "createdAt");
  const updatedAt = assertClock(input.updatedAt, "updatedAt");
  if (createdAt.getTime() > updatedAt.getTime()) {
    throw new DomainValidationError("createdAt must be <= updatedAt");
  }

  const anonymizedAt =
    input.anonymizedAt === undefined || input.anonymizedAt === null
      ? null
      : assertClock(input.anonymizedAt, "anonymizedAt");

  const identityLink =
    input.identityLink === undefined || input.identityLink === null
      ? null
      : createCustomerIdentityLink({
          identitySubjectId: input.identityLink.identitySubjectId,
          linkedAt: input.identityLink.linkedAt,
        });

  return freezeCustomer({
    id,
    tenantId,
    organizationId,
    customerNumber,
    customerType,
    status,
    individualName,
    organizationName,
    email: parseOptionalEmail(input.email),
    phone: parseOptionalPhone(input.phone),
    identityLink,
    createdAt,
    updatedAt,
    anonymizedAt,
    version: assertVersion(input.version),
  });
}

export function updateCustomerProfile(
  customer: Customer,
  input: UpdateCustomerProfileInput
): CustomerOperationResult {
  assertNotAnonymized(customer);
  const at = assertClock(input.at, "at");

  let individualName = customer.individualName;
  let organizationName = customer.organizationName;

  if (customer.customerType === "INDIVIDUAL") {
    if (input.organizationName !== undefined) {
      throw new DomainValidationError(
        "INDIVIDUAL Customer cannot have organizationName"
      );
    }
    if (input.individualName !== undefined) {
      if (input.individualName === null || !String(input.individualName).trim()) {
        throw new DomainValidationError("individualName is required");
      }
      individualName = asIndividualCustomerName(String(input.individualName));
    }
  } else {
    if (input.individualName !== undefined) {
      throw new DomainValidationError(
        "ORGANIZATION Customer cannot have individualName"
      );
    }
    if (input.organizationName !== undefined) {
      if (
        input.organizationName === null ||
        !String(input.organizationName).trim()
      ) {
        throw new DomainValidationError("organizationName is required");
      }
      organizationName = asOrganizationCustomerName(
        String(input.organizationName)
      );
    }
  }

  const email = parseProfileEmailPatch(input.email, customer.email);
  const phone = parseProfilePhonePatch(input.phone, customer.phone);

  const unchanged =
    individualName === customer.individualName &&
    organizationName === customer.organizationName &&
    email === customer.email &&
    phone === customer.phone;
  if (unchanged) {
    return operationResult(customer, []);
  }

  const next = bump(customer, at, {
    individualName,
    organizationName,
    email,
    phone,
  });

  return operationResult(next, [
    createCustomerDomainEvent({
      type: "Customer.ProfileUpdated",
      customerId: next.id,
      tenantId: next.tenantId,
      organizationId: next.organizationId,
      customerType: next.customerType,
      status: next.status,
      occurredAt: at,
    }),
  ]);
}

export function linkCustomerIdentity(
  customer: Customer,
  identitySubjectId: string,
  at: Date
): CustomerOperationResult {
  assertNotAnonymized(customer);
  const linkedAt = assertClock(at, "at");
  const link = createCustomerIdentityLink({ identitySubjectId, linkedAt });

  if (
    customer.identityLink &&
    customer.identityLink.identitySubjectId === link.identitySubjectId
  ) {
    return operationResult(customer, []);
  }
  if (customer.identityLink) {
    throw new CustomerIdentityLinkConflictError();
  }

  const next = bump(customer, linkedAt, { identityLink: link });
  return operationResult(next, [
    createCustomerDomainEvent({
      type: "Customer.IdentityLinked",
      customerId: next.id,
      tenantId: next.tenantId,
      organizationId: next.organizationId,
      customerType: next.customerType,
      status: next.status,
      occurredAt: linkedAt,
    }),
  ]);
}

export function unlinkCustomerIdentity(
  customer: Customer,
  at: Date
): CustomerOperationResult {
  assertNotAnonymized(customer);
  const when = assertClock(at, "at");
  if (!customer.identityLink) {
    return operationResult(customer, []);
  }

  const next = bump(customer, when, { identityLink: null });
  return operationResult(next, [
    createCustomerDomainEvent({
      type: "Customer.IdentityUnlinked",
      customerId: next.id,
      tenantId: next.tenantId,
      organizationId: next.organizationId,
      customerType: next.customerType,
      status: next.status,
      occurredAt: when,
    }),
  ]);
}

export function deactivateCustomer(
  customer: Customer,
  at: Date
): CustomerOperationResult {
  assertNotAnonymized(customer);
  const when = assertClock(at, "at");
  if (customer.status === "INACTIVE") {
    return operationResult(customer, []);
  }
  if (customer.status !== "ACTIVE") {
    throw new InvalidCustomerStateTransitionError();
  }

  const next = bump(customer, when, { status: "INACTIVE" });
  return operationResult(next, [
    createCustomerDomainEvent({
      type: "Customer.Deactivated",
      customerId: next.id,
      tenantId: next.tenantId,
      organizationId: next.organizationId,
      customerType: next.customerType,
      status: next.status,
      occurredAt: when,
    }),
  ]);
}

export function reactivateCustomer(
  customer: Customer,
  at: Date
): CustomerOperationResult {
  assertNotAnonymized(customer);
  const when = assertClock(at, "at");
  if (customer.status === "ACTIVE") {
    return operationResult(customer, []);
  }
  if (customer.status !== "INACTIVE") {
    throw new InvalidCustomerStateTransitionError();
  }

  const next = bump(customer, when, { status: "ACTIVE" });
  return operationResult(next, [
    createCustomerDomainEvent({
      type: "Customer.Reactivated",
      customerId: next.id,
      tenantId: next.tenantId,
      organizationId: next.organizationId,
      customerType: next.customerType,
      status: next.status,
      occurredAt: when,
    }),
  ]);
}

export function anonymizeCustomer(
  customer: Customer,
  at: Date
): CustomerOperationResult {
  if (customer.status === "ANONYMIZED") {
    return operationResult(customer, []);
  }
  if (customer.status !== "ACTIVE" && customer.status !== "INACTIVE") {
    throw new InvalidCustomerStateTransitionError();
  }
  const when = assertClock(at, "at");

  const next = bump(customer, when, {
    status: "ANONYMIZED",
    individualName: null,
    organizationName: null,
    email: null,
    phone: null,
    identityLink: null,
    anonymizedAt: when,
  });

  return operationResult(next, [
    createCustomerDomainEvent({
      type: "Customer.Anonymized",
      customerId: next.id,
      tenantId: next.tenantId,
      organizationId: next.organizationId,
      customerType: next.customerType,
      status: next.status,
      occurredAt: when,
    }),
  ]);
}

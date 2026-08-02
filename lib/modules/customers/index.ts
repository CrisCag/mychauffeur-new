export type { CustomerId } from "./domain/customer-id";
export { asCustomerId } from "./domain/customer-id";

export type { CustomerNumber } from "./domain/customer-number";
export {
  asCustomerNumber,
  normalizeCustomerNumber,
  createCustomerNumberFromToken,
} from "./domain/customer-number";

export type { CustomerType } from "./domain/customer-type";
export { CUSTOMER_TYPES, isCustomerType } from "./domain/customer-type";

export type { CustomerStatus } from "./domain/customer-status";
export {
  CUSTOMER_STATUSES,
  isCustomerStatus,
  isTerminalCustomerStatus,
} from "./domain/customer-status";

export type { IndividualCustomerName } from "./domain/individual-customer-name";
export {
  asIndividualCustomerName,
  serializeIndividualCustomerName,
} from "./domain/individual-customer-name";

export type { OrganizationCustomerName } from "./domain/organization-customer-name";
export {
  asOrganizationCustomerName,
  serializeOrganizationCustomerName,
} from "./domain/organization-customer-name";

export type { CustomerEmailAddress } from "./domain/customer-email-address";
export {
  asCustomerEmailAddress,
  serializeCustomerEmailAddress,
} from "./domain/customer-email-address";

export type { CustomerPhoneNumber } from "./domain/customer-phone-number";
export {
  asCustomerPhoneNumber,
  serializeCustomerPhoneNumber,
} from "./domain/customer-phone-number";

export type { IdentitySubjectId } from "./domain/identity-subject-id";
export { asIdentitySubjectId } from "./domain/identity-subject-id";

export type {
  CustomerIdentityLink,
  CustomerIdentityLinkInput,
} from "./domain/customer-identity-link";
export {
  createCustomerIdentityLink,
  cloneCustomerIdentityLink,
} from "./domain/customer-identity-link";

export type {
  Customer,
  CustomerOperationResult,
  CreateIndividualCustomerInput,
  CreateOrganizationCustomerInput,
  RehydrateCustomerInput,
  UpdateCustomerProfileInput,
} from "./domain/customer";
export {
  createIndividualCustomer,
  createOrganizationCustomer,
  rehydrateCustomer,
  updateCustomerProfile,
  linkCustomerIdentity,
  unlinkCustomerIdentity,
  deactivateCustomer,
  reactivateCustomer,
  anonymizeCustomer,
} from "./domain/customer";

export type {
  CustomerDomainEvent,
  CustomerDomainEventType,
} from "./domain/customer-events";
export { createCustomerDomainEvent } from "./domain/customer-events";

export {
  DomainValidationError,
  InvalidCustomerIdError,
  InvalidCustomerNumberError,
  InvalidCustomerStateTransitionError,
  CustomerIdentityLinkConflictError,
  CustomerVersionConflictError,
  CustomerNotFoundError,
  DuplicateCustomerNumberError,
  DuplicateIdentitySubjectError,
} from "./domain/errors";

export type { CustomerRepository } from "./application/customer-repository";

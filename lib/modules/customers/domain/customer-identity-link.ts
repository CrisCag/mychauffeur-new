import {
  asIdentitySubjectId,
  type IdentitySubjectId,
} from "./identity-subject-id";
import { DomainValidationError } from "./errors";

export type CustomerIdentityLink = {
  readonly identitySubjectId: IdentitySubjectId;
  readonly linkedAt: Date;
};

export type CustomerIdentityLinkInput = {
  identitySubjectId: string;
  linkedAt: Date;
};

export function createCustomerIdentityLink(
  input: CustomerIdentityLinkInput
): CustomerIdentityLink {
  if (!(input.linkedAt instanceof Date) || Number.isNaN(input.linkedAt.getTime())) {
    throw new DomainValidationError("linkedAt is invalid");
  }
  return Object.freeze({
    identitySubjectId: asIdentitySubjectId(input.identitySubjectId),
    linkedAt: new Date(input.linkedAt.getTime()),
  });
}

export function cloneCustomerIdentityLink(
  link: CustomerIdentityLink
): CustomerIdentityLink {
  return createCustomerIdentityLink({
    identitySubjectId: link.identitySubjectId,
    linkedAt: link.linkedAt,
  });
}

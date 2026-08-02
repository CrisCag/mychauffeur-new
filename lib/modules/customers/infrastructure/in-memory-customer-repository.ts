import type { OrganizationId, TenantId } from "@/lib/modules/identity";
import type { CustomerRepository } from "../application/customer-repository";
import type { Customer } from "../domain/customer";
import { rehydrateCustomer } from "../domain/customer";
import type { CustomerId } from "../domain/customer-id";
import type { CustomerNumber } from "../domain/customer-number";
import type { IdentitySubjectId } from "../domain/identity-subject-id";
import {
  DomainValidationError,
  DuplicateCustomerNumberError,
  DuplicateIdentitySubjectError,
  CustomerVersionConflictError,
} from "../domain/errors";

/**
 * In-memory CustomerRepository for foundation tests.
 * NOT production-ready. No JSON file persistence.
 * No email/phone lookup indexes.
 */
export class InMemoryCustomerRepository implements CustomerRepository {
  private readonly byId = new Map<string, Customer>();
  private readonly byNumber = new Map<string, string>();
  private readonly byIdentity = new Map<string, string>();

  private idKey(
    tenantId: TenantId,
    organizationId: OrganizationId,
    customerId: CustomerId
  ): string {
    return `${tenantId}::${organizationId}::${customerId}`;
  }

  private numberKey(
    tenantId: TenantId,
    organizationId: OrganizationId,
    customerNumber: CustomerNumber
  ): string {
    return `${tenantId}::${organizationId}::${customerNumber}`;
  }

  private identityKey(
    tenantId: TenantId,
    organizationId: OrganizationId,
    identitySubjectId: IdentitySubjectId
  ): string {
    return `${tenantId}::${organizationId}::${identitySubjectId}`;
  }

  private clone(customer: Customer): Customer {
    return rehydrateCustomer({
      id: customer.id,
      tenantId: customer.tenantId,
      organizationId: customer.organizationId,
      customerNumber: customer.customerNumber,
      customerType: customer.customerType,
      status: customer.status,
      individualName: customer.individualName,
      organizationName: customer.organizationName,
      email: customer.email,
      phone: customer.phone,
      identityLink: customer.identityLink
        ? {
            identitySubjectId: customer.identityLink.identitySubjectId,
            linkedAt: new Date(customer.identityLink.linkedAt.getTime()),
          }
        : null,
      createdAt: new Date(customer.createdAt.getTime()),
      updatedAt: new Date(customer.updatedAt.getTime()),
      anonymizedAt: customer.anonymizedAt
        ? new Date(customer.anonymizedAt.getTime())
        : null,
      version: customer.version,
    });
  }

  async save(customer: Customer, expectedVersion?: number): Promise<void> {
    const key = this.idKey(
      customer.tenantId,
      customer.organizationId,
      customer.id
    );
    const existing = this.byId.get(key);

    if (!existing) {
      if (expectedVersion !== undefined) {
        throw new CustomerVersionConflictError();
      }
      this.assertUniqueNumber(customer, key);
      this.assertUniqueIdentity(customer, key);
      this.byId.set(key, this.clone(customer));
      this.byNumber.set(
        this.numberKey(
          customer.tenantId,
          customer.organizationId,
          customer.customerNumber
        ),
        key
      );
      if (customer.identityLink) {
        this.byIdentity.set(
          this.identityKey(
            customer.tenantId,
            customer.organizationId,
            customer.identityLink.identitySubjectId
          ),
          key
        );
      }
      return;
    }

    if (expectedVersion === undefined) {
      throw new CustomerVersionConflictError();
    }
    if (existing.version !== expectedVersion) {
      throw new CustomerVersionConflictError();
    }
    if (customer.version !== existing.version + 1) {
      throw new CustomerVersionConflictError();
    }

    if (
      existing.id !== customer.id ||
      existing.tenantId !== customer.tenantId ||
      existing.organizationId !== customer.organizationId ||
      existing.customerNumber !== customer.customerNumber ||
      existing.customerType !== customer.customerType
    ) {
      throw new DomainValidationError("Customer identity scope is immutable");
    }

    this.assertUniqueIdentity(customer, key);

    if (existing.identityLink) {
      const oldIdentityKey = this.identityKey(
        existing.tenantId,
        existing.organizationId,
        existing.identityLink.identitySubjectId
      );
      if (this.byIdentity.get(oldIdentityKey) === key) {
        this.byIdentity.delete(oldIdentityKey);
      }
    }

    this.byId.set(key, this.clone(customer));
    if (customer.identityLink) {
      this.byIdentity.set(
        this.identityKey(
          customer.tenantId,
          customer.organizationId,
          customer.identityLink.identitySubjectId
        ),
        key
      );
    }
  }

  private assertUniqueNumber(customer: Customer, key: string): void {
    const numberKey = this.numberKey(
      customer.tenantId,
      customer.organizationId,
      customer.customerNumber
    );
    const occupied = this.byNumber.get(numberKey);
    if (occupied && occupied !== key) {
      throw new DuplicateCustomerNumberError();
    }
  }

  private assertUniqueIdentity(customer: Customer, key: string): void {
    if (!customer.identityLink) {
      return;
    }
    const identityKey = this.identityKey(
      customer.tenantId,
      customer.organizationId,
      customer.identityLink.identitySubjectId
    );
    const occupied = this.byIdentity.get(identityKey);
    if (occupied && occupied !== key) {
      throw new DuplicateIdentitySubjectError();
    }
  }

  async findById(
    tenantId: TenantId,
    organizationId: OrganizationId,
    customerId: CustomerId
  ): Promise<Customer | null> {
    const found = this.byId.get(
      this.idKey(tenantId, organizationId, customerId)
    );
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

  async findByCustomerNumber(
    tenantId: TenantId,
    organizationId: OrganizationId,
    customerNumber: CustomerNumber
  ): Promise<Customer | null> {
    const idKey = this.byNumber.get(
      this.numberKey(tenantId, organizationId, customerNumber)
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

  async existsByCustomerNumber(
    tenantId: TenantId,
    organizationId: OrganizationId,
    customerNumber: CustomerNumber
  ): Promise<boolean> {
    const found = await this.findByCustomerNumber(
      tenantId,
      organizationId,
      customerNumber
    );
    return found !== null;
  }

  async findByIdentitySubjectId(
    tenantId: TenantId,
    organizationId: OrganizationId,
    identitySubjectId: IdentitySubjectId
  ): Promise<Customer | null> {
    const idKey = this.byIdentity.get(
      this.identityKey(tenantId, organizationId, identitySubjectId)
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

  clear(): void {
    this.byId.clear();
    this.byNumber.clear();
    this.byIdentity.clear();
  }
}

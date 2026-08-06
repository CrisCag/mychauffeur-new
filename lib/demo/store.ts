import { randomUUID } from "node:crypto";
import { asActorId, asOrganizationId, asTenantId } from "@/lib/modules/identity";
import { InMemoryBookingRepository } from "@/lib/modules/bookings/infrastructure";
import { InMemoryQuoteRepository } from "@/lib/modules/quotes/infrastructure";
import { InMemoryServiceRepository } from "@/lib/modules/services/infrastructure";
import {
  DEMO_ACTOR_ID,
  DEMO_ORGANIZATION_ID,
  DEMO_STORE_GLOBAL_KEY,
  DEMO_TENANT_ID,
} from "./constants";
import { InMemoryDemoReadModel } from "./read-model";

export type DemoClock = {
  /** Explicit clock — advances monotonically within the store. */
  now(): Date;
  advanceMs(ms: number): Date;
};

export type DemoStore = {
  readonly tenantId: ReturnType<typeof asTenantId>;
  readonly organizationId: ReturnType<typeof asOrganizationId>;
  readonly actorId: ReturnType<typeof asActorId>;
  readonly clock: DemoClock;
  readonly quoteRepository: InMemoryQuoteRepository;
  readonly bookingRepository: InMemoryBookingRepository;
  readonly serviceRepository: InMemoryServiceRepository;
  readonly readModel: InMemoryDemoReadModel;
  /** Append-only demo audit buffer (Domain event summaries). */
  readonly auditLog: DemoAuditEntry[];
  reset(): void;
  newId(): string;
};

export type DemoAuditEntry = {
  readonly source: "Quote" | "Booking" | "Service";
  readonly type: string;
  readonly opaqueId: string;
  readonly publicRef?: string;
  readonly occurredAtIso: string;
};

type GlobalDemoSlot = {
  store?: DemoStore;
};

function createClock(start: Date): DemoClock {
  let current = start.getTime();
  return {
    now() {
      return new Date(current);
    },
    advanceMs(ms: number) {
      current += Math.max(1, ms);
      return new Date(current);
    },
  };
}

export function createIsolatedDemoStore(options?: {
  startAt?: Date;
}): DemoStore {
  const tenantId = asTenantId(DEMO_TENANT_ID);
  const organizationId = asOrganizationId(DEMO_ORGANIZATION_ID);
  const actorId = asActorId(DEMO_ACTOR_ID);
  const clock = createClock(options?.startAt ?? new Date("2026-09-01T08:00:00.000Z"));
  const quoteRepository = new InMemoryQuoteRepository();
  const bookingRepository = new InMemoryBookingRepository();
  const serviceRepository = new InMemoryServiceRepository();
  const readModel = new InMemoryDemoReadModel();
  const auditLog: DemoAuditEntry[] = [];

  const store: DemoStore = {
    tenantId,
    organizationId,
    actorId,
    clock,
    quoteRepository,
    bookingRepository,
    serviceRepository,
    readModel,
    auditLog,
    newId() {
      return randomUUID();
    },
    reset() {
      quoteRepository.clear();
      bookingRepository.clear();
      serviceRepository.clear();
      readModel.reset();
      auditLog.length = 0;
    },
  };
  return store;
}

/**
 * Process-local demo store. In development, pinned on globalThis to survive HMR.
 * Tests MUST use createIsolatedDemoStore() — never the shared singleton.
 */
export function getDemoStore(): DemoStore {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Demo store is not available in production");
  }
  if (process.env.NODE_ENV === "development") {
    const g = globalThis as unknown as Record<string, GlobalDemoSlot>;
    const slot = g[DEMO_STORE_GLOBAL_KEY] ?? (g[DEMO_STORE_GLOBAL_KEY] = {});
    if (!slot.store) {
      slot.store = createIsolatedDemoStore({ startAt: new Date() });
    }
    return slot.store;
  }
  // test / other: still allow a process singleton for Next when NODE_ENV=test during SSR of demos (unused)
  const g = globalThis as unknown as Record<string, GlobalDemoSlot>;
  const slot = g[DEMO_STORE_GLOBAL_KEY] ?? (g[DEMO_STORE_GLOBAL_KEY] = {});
  if (!slot.store) {
    slot.store = createIsolatedDemoStore({ startAt: new Date() });
  }
  return slot.store;
}

export function resetSharedDemoStore(): void {
  if (process.env.NODE_ENV === "production") {
    return;
  }
  const store = getDemoStore();
  store.reset();
}

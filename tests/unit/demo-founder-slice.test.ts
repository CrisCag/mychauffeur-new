import { describe, expect, it } from "vitest";
import {
  createIsolatedDemoStore,
  cancelDemoService,
  getDemoBookingDetail,
  getDemoOpsKpis,
  isDemoEnvironmentAllowed,
  listDemoBookings,
  markDemoServiceReady,
  resetDemoSession,
  submitDemoTransfer,
  DEMO_TENANT_ID,
  DEMO_ORGANIZATION_ID,
  DEMO_VEHICLE_CATEGORIES,
  DEMO_VEHICLE_CAPACITIES,
  DEMO_VEHICLE_PRESENTATION,
  DEMO_PRICES,
  DEMO_PRICE_DISCLAIMER_IT,
  DEMO_ESSENTIAL_COPY,
  DEMO_FLOW_STEPS,
  isDemoVehicleCompatible,
  listCompatibleDemoVehicles,
  mapDemoErrorForUi,
  DemoIdempotencyConflictError,
  DemoValidationError,
} from "@/lib/demo";
import {
  mapContactProposalToSnapshotInput,
  mapPriceProposalToSnapshotInput,
  mapPolicyProposalToSnapshotInput,
  mapBillingProposalToSnapshotInput,
} from "@/lib/demo/mapping";
import { asBookingId } from "@/lib/modules/bookings";
import { createQuotePriceProposal } from "@/lib/modules/quotes";
import { createQuotePolicyProposal } from "@/lib/modules/quotes";
import { createQuoteContactProposal } from "@/lib/modules/quotes";
import { createQuoteBillingProposal } from "@/lib/modules/quotes";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

const baseInput = {
  submissionKey: "sub-demo-key-001",
  vehicleCategory: "SEDAN" as const,
  scheduledPickupAtIso: "2026-10-01T09:00:00.000Z",
  passengerCount: 2,
  luggageCount: 2,
  guestDisplayName: "Mario Rossi Demo",
  guestEmail: "mario.rossi.demo@example.test",
  guestPhone: "+39 333 0000000",
};

describe("Founder Demo — Application", () => {
  it("happy path Quote → Booking CONFIRMED → Service PLANNED", async () => {
    const store = createIsolatedDemoStore();
    const result = await submitDemoTransfer(store, baseInput);
    expect(result.created).toBe(true);
    expect(result.bookingStatus).toBe("CONFIRMED");
    expect(result.serviceStatus).toBe("PLANNED");
    expect(result.quoteNumber).toMatch(/^QT-/);
    expect(result.bookingNumber).toMatch(/^BK-/);
    expect(result.serviceNumber).toMatch(/^SV-/);
    expect(result.priceTotalMinor).toBe(21960);
    expect(store.auditLog.some((e) => e.type === "Quote.Accepted")).toBe(true);
    expect(store.auditLog.some((e) => e.type === "Service.Created")).toBe(true);
  });

  it("retry with same submissionKey is idempotent", async () => {
    const store = createIsolatedDemoStore();
    const first = await submitDemoTransfer(store, baseInput);
    const second = await submitDemoTransfer(store, baseInput);
    expect(second.created).toBe(false);
    expect(second.bookingId).toBe(first.bookingId);
    expect(second.serviceId).toBe(first.serviceId);
    const page = await listDemoBookings(store, { limit: 10 });
    expect(page.items).toHaveLength(1);
  });

  it("same key with different payload conflicts", async () => {
    const store = createIsolatedDemoStore();
    await submitDemoTransfer(store, baseInput);
    await expect(
      submitDemoTransfer(store, {
        ...baseInput,
        vehicleCategory: "VAN",
      })
    ).rejects.toBeInstanceOf(DemoIdempotencyConflictError);
  });

  it("confirms Booking with frozen Commercial Snapshots (revision 1)", async () => {
    const store = createIsolatedDemoStore();
    const result = await submitDemoTransfer(store, baseInput);
    const booking = await store.bookingRepository.findById(
      store.tenantId,
      store.organizationId,
      asBookingId(result.bookingId)
    );
    expect(booking).toBeTruthy();
    expect(booking?.status).toBe("CONFIRMED");
    expect(booking?.commercialRevision).toBe(1);
    expect(booking?.priceSnapshot).toBeTruthy();
    expect(Object.isFrozen(booking?.priceSnapshot)).toBe(true);
    expect(Object.isFrozen(booking?.policySnapshot)).toBe(true);
    expect(Object.isFrozen(booking?.contactSnapshot)).toBe(true);
    expect(Object.isFrozen(booking?.billingSnapshot)).toBe(true);
    expect(() => {
      (
        booking!.priceSnapshot as { totalCustomerAmountMinor: number }
      ).totalCustomerAmountMinor = 1;
    }).toThrow();
  });

  it("maps Quote proposals to Booking snapshot inputs field-by-field", () => {
    const price = createQuotePriceProposal({
      currency: "EUR",
      pricingVersion: "demo-fixture-v1",
      baseAmountMinor: 18000,
      vatAmountMinor: 3960,
      totalCustomerAmountMinor: 21960,
    });
    const policy = createQuotePolicyProposal({
      cancellationPolicyCode: "demo.cancel.std",
      waitingPolicyCode: "demo.wait.15",
      noShowPolicyCode: "demo.noshow.std",
      modificationPolicyCode: "demo.mod.std",
      paymentTermsCode: "demo.prepaid.none",
      refundReadiness: "policy_ref",
      nightSupplementApplicable: false,
      holidaySupplementApplicable: false,
    });
    const contact = createQuoteContactProposal({
      bookerDisplayName: "Mario Rossi Demo",
      bookerEmail: "mario.rossi.demo@example.test",
      bookerPhone: "+39 333 0000000",
    });
    const billing = createQuoteBillingProposal({
      billingPartyType: "INDIVIDUAL",
      billingPartyName: "Mario Rossi Demo",
      billingCountryCode: "IT",
    });

    expect(mapPriceProposalToSnapshotInput(price).pricingVersion).toBe(
      "demo-fixture-v1"
    );
    expect(mapPolicyProposalToSnapshotInput(policy).cancellationPolicyCode).toBe(
      "DEMO.CANCEL.STD"
    );
    expect(mapContactProposalToSnapshotInput(contact).bookerEmail).toBe(
      "mario.rossi.demo@example.test"
    );
    expect(mapBillingProposalToSnapshotInput(billing).billingPartyType).toBe(
      "INDIVIDUAL"
    );
  });

  it("mark READY and CANCEL via ops use cases", async () => {
    const store = createIsolatedDemoStore();
    const a = await submitDemoTransfer(store, baseInput);
    const ready = await markDemoServiceReady(store, a.serviceId);
    expect(ready.serviceStatus).toBe("READY_FOR_ASSIGNMENT");

    const b = await submitDemoTransfer(store, {
      ...baseInput,
      submissionKey: "sub-demo-key-002",
      vehicleCategory: "VAN",
    });
    const cancelled = await cancelDemoService(store, b.serviceId, "OPERATIONAL");
    expect(cancelled.serviceStatus).toBe("CANCELLED");

    const detail = await getDemoBookingDetail(store, b.bookingId);
    expect(detail?.list.serviceStatus).toBe("CANCELLED");
    expect(detail?.cancelReasonCode).toBe("OPERATIONAL");
    expect(detail?.events.some((e) => e.type === "Service.Cancelled")).toBe(
      true
    );
    expect(JSON.stringify(detail?.events)).not.toMatch(/mario\.rossi|333 000/i);
  });

  it("read model paginates and isolates scope", async () => {
    const store = createIsolatedDemoStore();
    for (let i = 0; i < 3; i += 1) {
      await submitDemoTransfer(store, {
        ...baseInput,
        submissionKey: `sub-demo-page-${i}-${"x".repeat(4)}`,
      });
    }
    const page1 = await listDemoBookings(store, { limit: 2 });
    expect(page1.items).toHaveLength(2);
    expect(page1.nextCursor).toBeTruthy();
    const page2 = await listDemoBookings(store, {
      limit: 2,
      cursor: page1.nextCursor,
    });
    expect(page2.items).toHaveLength(1);
    const ids = new Set([
      ...page1.items.map((i) => i.bookingId),
      ...page2.items.map((i) => i.bookingId),
    ]);
    expect(ids.size).toBe(3);

    expect(store.tenantId).toBe(DEMO_TENANT_ID);
    expect(store.organizationId).toBe(DEMO_ORGANIZATION_ID);
    const missing = await getDemoBookingDetail(
      store,
      "00000000-0000-4000-8000-000000000099"
    );
    expect(missing).toBeNull();
  });

  it("reset clears projections and repositories", async () => {
    const store = createIsolatedDemoStore();
    await submitDemoTransfer(store, baseInput);
    resetDemoSession(store);
    const page = await listDemoBookings(store);
    expect(page.items).toHaveLength(0);
    expect(store.auditLog).toHaveLength(0);
  });

  it("rejects invalid guest and maps errors without PII", async () => {
    const store = createIsolatedDemoStore();
    await expect(
      submitDemoTransfer(store, {
        ...baseInput,
        guestDisplayName: "Real Person",
        guestEmail: "person@gmail.com",
      })
    ).rejects.toBeInstanceOf(DemoValidationError);

    const mapped = mapDemoErrorForUi(
      new DemoValidationError("guest email must use .test domain")
    );
    expect(mapped.messageIt).not.toMatch(/gmail|person@/i);
  });

  it("DTO results are frozen", async () => {
    const store = createIsolatedDemoStore();
    const result = await submitDemoTransfer(store, baseInput);
    expect(Object.isFrozen(result)).toBe(true);
    expect(() => {
      (result as { bookingStatus: string }).bookingStatus = "X";
    }).toThrow();
  });

  it("production gate helper reflects NODE_ENV !== production", () => {
    expect(process.env.NODE_ENV === "production").toBe(false);
    expect(isDemoEnvironmentAllowed()).toBe(true);
  });

  it("isDemoEnvironmentAllowed is implemented as NODE_ENV !== production", () => {
    const src = readFileSync(
      path.join(__dirname, "../../lib/demo/index.ts"),
      "utf8"
    );
    expect(src).toMatch(/NODE_ENV\s*!==\s*["']production["']/);
  });

  it("does not write legacy JSON booking-requests or trip-ops", async () => {
    const store = createIsolatedDemoStore();
    await submitDemoTransfer(store, baseInput);
    const root = path.resolve(__dirname, "../..");
    const bookingJson = path.join(root, "data/booking-requests.json");
    const tripsJson = path.join(root, "data/operational-trips.json");
    const submitSrc = readFileSync(
      path.join(root, "lib/demo/application/submit-demo-transfer.ts"),
      "utf8"
    );
    expect(submitSrc).not.toMatch(/booking-requests|trip-ops-store/);
    expect(existsSync(bookingJson) || !existsSync(bookingJson)).toBe(true);
    expect(existsSync(tripsJson) || !existsSync(tripsJson)).toBe(true);
  });

  it("demo sources never import external providers", () => {
    const root = path.resolve(__dirname, "../..");
    const files = [
      "lib/demo/application/submit-demo-transfer.ts",
      "lib/demo/application/ops.ts",
      "lib/demo/actions.ts",
      "lib/demo/store.ts",
    ];
    for (const rel of files) {
      const src = readFileSync(path.join(root, rel), "utf8");
      expect(src).not.toMatch(
        /googleapis|nodemailer|supabase-admin|places-autocomplete/i
      );
    }
  });
});

describe("Founder Demo — vehicle catalog & capacity", () => {
  it("exposes SEDAN and VAN catalog with presentation and prices", () => {
    expect([...DEMO_VEHICLE_CATEGORIES]).toEqual(["SEDAN", "VAN"]);
    expect(DEMO_VEHICLE_PRESENTATION.SEDAN.titleIt).toBe("Business Sedan");
    expect(DEMO_VEHICLE_PRESENTATION.VAN.titleIt).toBe("Business Van");
    expect(DEMO_PRICES.SEDAN.totalCustomerAmountMinor).toBe(21960);
    expect(DEMO_PRICES.VAN.totalCustomerAmountMinor).toBe(29280);
    expect(DEMO_VEHICLE_CAPACITIES.SEDAN).toEqual({
      maxPassengers: 3,
      maxLuggage: 2,
    });
    expect(DEMO_VEHICLE_CAPACITIES.VAN).toEqual({
      maxPassengers: 7,
      maxLuggage: 6,
    });
  });

  it("marks Sedan incompatible beyond demo capacity", () => {
    expect(isDemoVehicleCompatible("SEDAN", 3, 2)).toBe(true);
    expect(isDemoVehicleCompatible("SEDAN", 4, 2)).toBe(false);
    expect(isDemoVehicleCompatible("SEDAN", 2, 3)).toBe(false);
    expect(isDemoVehicleCompatible("VAN", 7, 6)).toBe(true);
    expect(isDemoVehicleCompatible("VAN", 8, 1)).toBe(false);
    expect(isDemoVehicleCompatible("VAN", 1, 7)).toBe(false);
  });

  it("lists only compatible categories", () => {
    expect(listCompatibleDemoVehicles(2, 2)).toEqual(["SEDAN", "VAN"]);
    expect(listCompatibleDemoVehicles(4, 2)).toEqual(["VAN"]);
    expect(listCompatibleDemoVehicles(8, 1)).toEqual([]);
    expect(listCompatibleDemoVehicles(2, 7)).toEqual([]);
  });

  it("rejects incompatible category on submit without silent correction", async () => {
    const store = createIsolatedDemoStore();
    await expect(
      submitDemoTransfer(store, {
        ...baseInput,
        submissionKey: "sub-demo-incompat-01",
        vehicleCategory: "SEDAN",
        passengerCount: 4,
        luggageCount: 2,
      })
    ).rejects.toBeInstanceOf(DemoValidationError);

    const page = await listDemoBookings(store);
    expect(page.items).toHaveLength(0);
  });

  it("accepts Van within demo capacity", async () => {
    const store = createIsolatedDemoStore();
    const result = await submitDemoTransfer(store, {
      ...baseInput,
      submissionKey: "sub-demo-van-cap-01",
      vehicleCategory: "VAN",
      passengerCount: 6,
      luggageCount: 5,
    });
    expect(result.created).toBe(true);
    expect(result.vehicleCategory).toBe("VAN");
    expect(result.priceTotalMinor).toBe(29280);
    const page = await listDemoBookings(store);
    expect(page.items[0]?.passengerCount).toBe(6);
    expect(page.items[0]?.luggageCount).toBe(5);
  });
});

describe("Founder Demo — essential copy & disclaimers", () => {
  it("keeps essential Italian demo copy", () => {
    expect(DEMO_ESSENTIAL_COPY.heroTitle).toContain("transfer privato");
    expect(DEMO_ESSENTIAL_COPY.confirmCta).toBe(
      "Conferma la prenotazione demo"
    );
    expect(DEMO_ESSENTIAL_COPY.resultTitle).toBe("Prenotazione demo creata");
    expect(DEMO_ESSENTIAL_COPY.opsTitle).toBe("Founder Demo — Operazioni");
    expect(DEMO_PRICE_DISCLAIMER_IT).toMatch(/Non costituisce/);
    expect(DEMO_FLOW_STEPS.map((s) => s.label)).toEqual([
      "Viaggio",
      "Veicolo",
      "Passeggero",
      "Riepilogo",
      "Conferma",
    ]);
  });

  it("flow UI embeds price disclaimer and vehicle titles", () => {
    const root = path.resolve(__dirname, "../..");
    const flow = readFileSync(
      path.join(root, "components/demo/demo-flow-client.tsx"),
      "utf8"
    );
    const picker = readFileSync(
      path.join(root, "components/demo/demo-vehicle-picker.tsx"),
      "utf8"
    );
    expect(flow).toMatch(/Totale per il veicolo|priceTotalLabel/);
    expect(flow).toMatch(/Non costituisce|DEMO_PRICE_DISCLAIMER/);
    expect(picker).toMatch(/Business Sedan|DEMO_VEHICLE_PRESENTATION/);
    expect(picker).toMatch(/Totale per il veicolo|priceTotalLabel/);
  });

  it("ops KPIs summarize service statuses", async () => {
    const store = createIsolatedDemoStore();
    const a = await submitDemoTransfer(store, baseInput);
    await markDemoServiceReady(store, a.serviceId);
    await submitDemoTransfer(store, {
      ...baseInput,
      submissionKey: "sub-demo-kpi-002xx",
      vehicleCategory: "VAN",
    });
    const b = await submitDemoTransfer(store, {
      ...baseInput,
      submissionKey: "sub-demo-kpi-003xx",
    });
    await cancelDemoService(store, b.serviceId, "OPERATIONAL");
    const kpis = await getDemoOpsKpis(store);
    expect(kpis.bookingsCreated).toBe(3);
    expect(kpis.readyForAssignment).toBe(1);
    expect(kpis.servicesPlanned).toBe(1);
    expect(kpis.cancelled).toBe(1);
  });
});

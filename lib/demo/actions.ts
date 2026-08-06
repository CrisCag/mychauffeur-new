"use server";

import {
  cancelDemoService,
  getDemoBookingDetail,
  getDemoOpsKpis,
  getDemoStore,
  isDemoEnvironmentAllowed,
  listDemoBookings,
  markDemoServiceReady,
  resetDemoSession,
  submitDemoTransfer,
  type DemoBookingDetailDto,
  type DemoBookingPageDto,
  type DemoOpsKpisDto,
  type DemoSubmissionResultDto,
  type SubmitDemoTransferInput,
  mapDemoErrorForUi,
} from "@/lib/demo";
import type { ServiceCancellationReason } from "@/lib/modules/services";

// NOTE: Do not re-export type-only symbols from this "use server" module.
// Turbopack/Next can emit a runtime `export { DemoVehicleCategory }` that
// throws ReferenceError because type-only imports are erased.

function requireDemo() {
  if (!isDemoEnvironmentAllowed()) {
    throw new Error("Demo unavailable");
  }
}

export type DemoActionResult<T> =
  | { readonly ok: true; readonly data: T }
  | {
      readonly ok: false;
      readonly code: string;
      readonly messageIt: string;
      readonly messageEn: string;
    };

function fail(error: unknown): DemoActionResult<never> {
  const mapped = mapDemoErrorForUi(error);
  return {
    ok: false,
    code: mapped.code,
    messageIt: mapped.messageIt,
    messageEn: mapped.messageEn,
  };
}

export async function actionSubmitDemoTransfer(
  input: SubmitDemoTransferInput
): Promise<DemoActionResult<DemoSubmissionResultDto>> {
  requireDemo();
  try {
    const data = await submitDemoTransfer(getDemoStore(), input);
    return { ok: true, data };
  } catch (error) {
    return fail(error);
  }
}

export async function actionListDemoBookings(input?: {
  limit?: number;
  cursor?: string | null;
}): Promise<DemoActionResult<DemoBookingPageDto>> {
  requireDemo();
  try {
    const data = await listDemoBookings(getDemoStore(), input);
    return { ok: true, data };
  } catch (error) {
    return fail(error);
  }
}

export async function actionGetDemoOpsKpis(): Promise<
  DemoActionResult<DemoOpsKpisDto>
> {
  requireDemo();
  try {
    const data = await getDemoOpsKpis(getDemoStore());
    return { ok: true, data };
  } catch (error) {
    return fail(error);
  }
}

export async function actionGetDemoBookingDetail(
  bookingId: string
): Promise<DemoActionResult<DemoBookingDetailDto | null>> {
  requireDemo();
  try {
    const data = await getDemoBookingDetail(getDemoStore(), bookingId);
    return { ok: true, data };
  } catch (error) {
    return fail(error);
  }
}

export async function actionMarkDemoServiceReady(
  serviceId: string
): Promise<DemoActionResult<{ serviceStatus: string }>> {
  requireDemo();
  try {
    const item = await markDemoServiceReady(getDemoStore(), serviceId);
    return { ok: true, data: { serviceStatus: item.serviceStatus } };
  } catch (error) {
    return fail(error);
  }
}

export async function actionCancelDemoService(
  serviceId: string,
  reason: ServiceCancellationReason = "OPERATIONAL"
): Promise<DemoActionResult<{ serviceStatus: string }>> {
  requireDemo();
  try {
    const item = await cancelDemoService(getDemoStore(), serviceId, reason);
    return { ok: true, data: { serviceStatus: item.serviceStatus } };
  } catch (error) {
    return fail(error);
  }
}

export async function actionResetDemo(): Promise<DemoActionResult<{ reset: true }>> {
  requireDemo();
  try {
    resetDemoSession(getDemoStore());
    return { ok: true, data: { reset: true } };
  } catch (error) {
    return fail(error);
  }
}

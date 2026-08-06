export {
  DEMO_TENANT_ID,
  DEMO_ORGANIZATION_ID,
  DEMO_ACTOR_ID,
  DEMO_READ_MODEL_DEFAULT_LIMIT,
  DEMO_READ_MODEL_MAX_LIMIT,
} from "./constants";

export {
  DEMO_ORIGIN,
  DEMO_DESTINATION,
  DEMO_PRICES,
  DEMO_ROUTE_ESTIMATE,
  DEMO_SUGGESTED_GUEST,
  DEMO_POLICY,
  DEMO_VEHICLE_CATEGORIES,
  DEMO_VEHICLE_CAPACITIES,
  DEMO_VEHICLE_PRESENTATION,
  DEMO_VEHICLE_IMAGE_DISCLAIMER_IT,
  DEMO_PRICE_DISCLAIMER_IT,
  DEMO_REASSURANCE_ITEMS,
  DEMO_REASSURANCE_NOTE_IT,
  isDemoVehicleCategory,
  isDemoVehicleCompatible,
  listCompatibleDemoVehicles,
  type DemoVehicleCategory,
} from "./fixtures";

export {
  DEMO_FLOW_STEPS,
  DEMO_ESSENTIAL_COPY,
  demoCancellationReasonLabelIt,
  demoAuditEventLabelIt,
  demoServiceStatusLabelIt,
  demoBookingStatusLabelIt,
} from "./labels";

export type {
  DemoSubmissionResultDto,
  DemoBookingListItemDto,
  DemoBookingDetailDto,
  DemoBookingPageDto,
  DemoAuditEventDto,
  DemoOpsKpisDto,
} from "./dto";

export {
  DemoValidationError,
  DemoIdempotencyConflictError,
  DemoNotAvailableError,
  DemoOrchestrationError,
  mapDemoErrorForUi,
} from "./errors";

export {
  createIsolatedDemoStore,
  getDemoStore,
  resetSharedDemoStore,
  type DemoStore,
} from "./store";

export { submitDemoTransfer } from "./application/submit-demo-transfer";
export type { SubmitDemoTransferInput } from "./application/submit-demo-transfer";

export {
  listDemoBookings,
  getDemoBookingDetail,
  getDemoOpsKpis,
  markDemoServiceReady,
  cancelDemoService,
  resetDemoSession,
} from "./application/ops";

/** Server-side gate: demo routes must not run in production. */
export function isDemoEnvironmentAllowed(): boolean {
  return process.env.NODE_ENV !== "production";
}

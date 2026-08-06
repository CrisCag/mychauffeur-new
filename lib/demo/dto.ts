export type DemoAuditEventDto = {
  readonly source: "Quote" | "Booking" | "Service";
  readonly type: string;
  readonly publicRef?: string;
  readonly opaqueId: string;
  readonly occurredAtIso: string;
};

export type DemoBookingListItemDto = {
  readonly bookingId: string;
  readonly bookingNumber: string;
  readonly bookingStatus: string;
  readonly quoteNumber: string;
  readonly serviceId: string;
  readonly serviceNumber: string;
  readonly serviceStatus: string;
  readonly originLabel: string;
  readonly destinationLabel: string;
  readonly scheduledPickupAtIso: string;
  readonly vehicleCategory: string;
  readonly passengerCount: number;
  readonly luggageCount: number;
  readonly createdAtIso: string;
};

export type DemoOpsKpisDto = {
  readonly bookingsCreated: number;
  readonly servicesPlanned: number;
  readonly readyForAssignment: number;
  readonly cancelled: number;
};

export type DemoBookingDetailDto = {
  readonly list: DemoBookingListItemDto;
  readonly guestDisplayName: string;
  readonly guestEmail: string;
  readonly guestPhone: string;
  readonly passengers: number;
  readonly luggage: number;
  readonly priceTotalMinor: number;
  readonly currency: string;
  readonly pricingVersion: string;
  readonly policyCancellationCode: string;
  readonly routePickupLabel: string;
  readonly routeDropoffLabel: string;
  readonly timezone: string;
  readonly estimatedDistanceMeters: number | null;
  readonly estimatedDurationMinutes: number | null;
  readonly cancelReasonCode: string | null;
  readonly events: readonly DemoAuditEventDto[];
};

export type DemoSubmissionResultDto = {
  readonly submissionKey: string;
  readonly created: boolean;
  readonly quoteId: string;
  readonly quoteNumber: string;
  readonly bookingId: string;
  readonly bookingNumber: string;
  readonly bookingStatus: string;
  readonly serviceId: string;
  readonly serviceNumber: string;
  readonly serviceStatus: string;
  readonly vehicleCategory: string;
  readonly priceTotalMinor: number;
  readonly currency: string;
  readonly originLabel: string;
  readonly destinationLabel: string;
  readonly scheduledPickupAtIso: string;
  readonly processLocalNoticeIt: string;
  readonly processLocalNoticeEn: string;
};

export type DemoBookingPageDto = {
  readonly items: readonly DemoBookingListItemDto[];
  readonly nextCursor: string | null;
};

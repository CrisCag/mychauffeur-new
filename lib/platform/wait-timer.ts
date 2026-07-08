/**
 * Timer attesa pickup / fermate — regole Standard vs VIP Max Comfort.
 *
 * Standard:
 *   - Solo prenotato → limite rosso = prenotato × 1,20
 *   - Con extra in app → limite rosso = prenotato + extra (senza tolleranza)
 *
 * VIP No Rush:
 *   - Sempre tolleranza 20% sul tempo coperto (prenotato + extra app)
 *   - limite rosso = (prenotato + extra) × 1,20
 */

export type ComfortMode = "standard" | "no_rush_vip";

export type WaitSessionKind = "pickup" | "stop";

export type WaitTimerPhase = "included_countdown" | "grace_countdown" | "penalty" | "stopped";

export const STOP_EXTRA_PURCHASE_OPTIONS_MINUTES = [15, 30, 45, 60] as const;
export const STOP_MAX_EXTRA_PURCHASE_MINUTES = 120;
export const DEFAULT_GRACE_PERCENT = 20;

export type WaitTimerInput = {
  comfortMode: ComfortMode;
  kind: WaitSessionKind;
  /** Minuti prenotati (fermata in booking o attesa inclusa pickup). */
  bookedMinutes: number;
  /** Somma minuti extra comprati in app per questa sessione/fermata. */
  extraAppMinutes: number;
  gracePercent?: number;
};

export type WaitTimerLimits = {
  coveredMinutes: number;
  graceMinutes: number;
  /** Minuti dall'inizio sessione prima del contatore penale (rosso). */
  redStartOffsetMinutes: number;
  graceApplies: boolean;
};

export type WaitTimerSnapshot = WaitTimerLimits & {
  comfortMode: ComfortMode;
  kind: WaitSessionKind;
  bookedMinutes: number;
  extraAppMinutes: number;
  phase: WaitTimerPhase;
  /** Minuti trascorsi dall'inizio (floor). */
  elapsedMinutes: number;
  /** Minuti fino al rosso (0 se già in penale). */
  minutesUntilRed: number;
  /** Minuti in penale se phase === penalty. */
  penaltyMinutes: number;
};

function roundGraceMinutes(coveredMinutes: number, gracePercent: number): number {
  return Math.max(0, Math.round((coveredMinutes * gracePercent) / 100));
}

/** Calcola minuti coperti, tolleranza e offset al rosso. */
export function calcWaitTimerLimits(input: WaitTimerInput): WaitTimerLimits {
  const gracePercent = input.gracePercent ?? DEFAULT_GRACE_PERCENT;
  const booked = Math.max(0, Math.round(input.bookedMinutes));
  const extraApp = Math.max(0, Math.round(input.extraAppMinutes));
  const covered = booked + extraApp;

  if (input.comfortMode === "no_rush_vip") {
    const graceMinutes = roundGraceMinutes(covered, gracePercent);
    return {
      coveredMinutes: covered,
      graceMinutes,
      redStartOffsetMinutes: covered + graceMinutes,
      graceApplies: graceMinutes > 0,
    };
  }

  // Standard
  if (extraApp > 0) {
    return {
      coveredMinutes: covered,
      graceMinutes: 0,
      redStartOffsetMinutes: covered,
      graceApplies: false,
    };
  }

  const graceMinutes = roundGraceMinutes(booked, gracePercent);
  return {
    coveredMinutes: booked,
    graceMinutes,
    redStartOffsetMinutes: booked + graceMinutes,
    graceApplies: graceMinutes > 0,
  };
}

export function calcRedStartsAt(
  sessionStartedAt: Date,
  input: WaitTimerInput
): Date {
  const { redStartOffsetMinutes } = calcWaitTimerLimits(input);
  return new Date(sessionStartedAt.getTime() + redStartOffsetMinutes * 60_000);
}

/** Fase corrente del timer dato elapsed in minuti (decimali ok). */
export function getWaitTimerPhase(
  elapsedMinutes: number,
  input: WaitTimerInput
): WaitTimerPhase {
  const limits = calcWaitTimerLimits(input);
  const elapsed = Math.max(0, elapsedMinutes);

  if (elapsed >= limits.redStartOffsetMinutes) {
    return "penalty";
  }

  const coveredEnd = limits.coveredMinutes;
  if (elapsed < coveredEnd) {
    return "included_countdown";
  }

  if (limits.graceMinutes > 0 && elapsed < limits.redStartOffsetMinutes) {
    return "grace_countdown";
  }

  return "penalty";
}

export function buildWaitTimerSnapshot(
  sessionStartedAt: Date,
  now: Date,
  input: WaitTimerInput,
  ended = false
): WaitTimerSnapshot {
  const limits = calcWaitTimerLimits(input);
  const elapsedMs = Math.max(0, now.getTime() - sessionStartedAt.getTime());
  const elapsedMinutes = elapsedMs / 60_000;

  if (ended) {
    return {
      ...limits,
      comfortMode: input.comfortMode,
      kind: input.kind,
      bookedMinutes: input.bookedMinutes,
      extraAppMinutes: input.extraAppMinutes,
      phase: "stopped",
      elapsedMinutes: Math.floor(elapsedMinutes),
      minutesUntilRed: 0,
      penaltyMinutes: 0,
    };
  }

  const phase = getWaitTimerPhase(elapsedMinutes, input);
  const minutesUntilRed =
    phase === "penalty"
      ? 0
      : Math.max(0, Math.ceil(limits.redStartOffsetMinutes - elapsedMinutes));

  const penaltyMinutes =
    phase === "penalty"
      ? Math.max(0, Math.ceil(elapsedMinutes - limits.redStartOffsetMinutes))
      : 0;

  return {
    ...limits,
    comfortMode: input.comfortMode,
    kind: input.kind,
    bookedMinutes: input.bookedMinutes,
    extraAppMinutes: input.extraAppMinutes,
    phase,
    elapsedMinutes: Math.floor(elapsedMinutes),
    minutesUntilRed,
    penaltyMinutes,
  };
}

/** Dopo acquisto extra in app: nuovi limiti + nuovo red_starts_at. */
export function recalcAfterExtraPurchase(
  sessionStartedAt: Date,
  bookedMinutes: number,
  previousExtraAppMinutes: number,
  purchasedMinutes: number,
  comfortMode: ComfortMode,
  kind: WaitSessionKind = "stop"
): {
  extraAppMinutes: number;
  limits: WaitTimerLimits;
  redStartsAt: Date;
  capped: boolean;
} {
  const maxExtra = STOP_MAX_EXTRA_PURCHASE_MINUTES;
  const nextExtra = Math.min(maxExtra, previousExtraAppMinutes + purchasedMinutes);
  const capped = previousExtraAppMinutes + purchasedMinutes > maxExtra;

  const input: WaitTimerInput = {
    comfortMode,
    kind,
    bookedMinutes,
    extraAppMinutes: nextExtra,
  };

  const limits = calcWaitTimerLimits(input);
  const redStartsAt = calcRedStartsAt(sessionStartedAt, input);

  return {
    extraAppMinutes: nextExtra,
    limits,
    redStartsAt,
    capped,
  };
}

export function canPurchaseStopExtra(
  currentExtraAppMinutes: number,
  purchaseMinutes: number
): boolean {
  return currentExtraAppMinutes + purchaseMinutes <= STOP_MAX_EXTRA_PURCHASE_MINUTES;
}

export function calcPenaltyAmountEur(
  penaltyMinutes: number,
  rateEurPerMin: number
): number {
  return Math.round(Math.max(0, penaltyMinutes) * rateEurPerMin * 100) / 100;
}

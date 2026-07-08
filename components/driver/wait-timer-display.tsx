"use client";

import type { WaitTimerSnapshot } from "@/lib/platform/wait-timer";

function formatMmSs(totalMinutes: number): string {
  const m = Math.max(0, Math.floor(totalMinutes));
  const s = Math.max(0, Math.round((totalMinutes - m) * 60));
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function WaitTimerDisplay({
  timer,
  locale,
}: {
  timer: WaitTimerSnapshot & { penaltyAmountEur?: number };
  locale: string;
}) {
  const isEn = locale === "en";

  const phaseLabel =
    timer.phase === "included_countdown"
      ? isEn
        ? "Included time remaining"
        : "Tempo incluso rimanente"
      : timer.phase === "grace_countdown"
        ? isEn
          ? "Grace period"
          : "Tolleranza"
        : timer.phase === "penalty"
          ? isEn
            ? "Extra time (billable)"
            : "Tempo extra a pagamento"
          : isEn
            ? "Stopped"
            : "Fermato";

  const isRed = timer.phase === "penalty";
  const isYellow = timer.phase === "grace_countdown";
  const displayMinutes =
    timer.phase === "included_countdown" || timer.phase === "grace_countdown"
      ? timer.minutesUntilRed > 0
        ? timer.minutesUntilRed
        : 0
      : timer.penaltyMinutes;

  return (
    <div
      className={`rounded-xl border-2 p-4 ${
        isRed
          ? "border-red-500/60 bg-red-500/10"
          : isYellow
            ? "border-amber-500/50 bg-amber-500/10"
            : "border-emerald-500/40 bg-emerald-500/10"
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {phaseLabel}
      </p>
      <p
        className={`mt-1 font-mono text-4xl font-bold tabular-nums ${
          isRed ? "text-red-400" : isYellow ? "text-amber-300" : "text-emerald-400"
        }`}
      >
        {isRed ? `+${displayMinutes} min` : formatMmSs(displayMinutes)}
      </p>
      {timer.comfortMode === "no_rush_vip" ? (
        <p className="mt-1 text-xs text-primary">VIP Max Comfort</p>
      ) : null}
      {isRed && timer.penaltyAmountEur != null ? (
        <p className="mt-2 text-sm font-semibold text-red-300">
          € {timer.penaltyAmountEur.toFixed(2)}
        </p>
      ) : null}
      {!isRed && timer.redStartOffsetMinutes ? (
        <p className="mt-2 text-xs text-muted-foreground">
          {isEn ? "Penalty starts after" : "Penale da"} {timer.redStartOffsetMinutes} min
        </p>
      ) : null}
    </div>
  );
}

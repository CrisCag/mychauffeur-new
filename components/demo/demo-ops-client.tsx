"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  Briefcase,
  CalendarDays,
  CarFront,
  Loader2,
  MapPin,
  Users,
} from "lucide-react";
import {
  actionCancelDemoService,
  actionGetDemoOpsKpis,
  actionListDemoBookings,
  actionMarkDemoServiceReady,
  actionResetDemo,
} from "@/lib/demo/actions";
import type { DemoBookingListItemDto, DemoOpsKpisDto } from "@/lib/demo/dto";
import {
  DEMO_ESSENTIAL_COPY,
  DEMO_VEHICLE_PRESENTATION,
  demoBookingStatusLabelIt,
  demoServiceStatusLabelIt,
  isDemoVehicleCategory,
} from "@/lib/demo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: "ok" | "warn" | "neutral" | "danger";
}) {
  const styles =
    tone === "ok"
      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-100"
      : tone === "warn"
        ? "border-primary/40 bg-primary/10 text-primary"
        : tone === "danger"
          ? "border-destructive/40 bg-destructive/10 text-destructive"
          : "border-border bg-muted/40 text-muted-foreground";
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase",
        styles
      )}
    >
      {label}
    </span>
  );
}

function serviceTone(
  status: string
): "ok" | "warn" | "neutral" | "danger" {
  if (status === "READY_FOR_ASSIGNMENT") return "ok";
  if (status === "PLANNED") return "warn";
  if (status === "CANCELLED") return "danger";
  return "neutral";
}

function vehicleTitle(category: string): string {
  if (!isDemoVehicleCategory(category)) return category;
  return DEMO_VEHICLE_PRESENTATION[category].titleIt;
}

const EMPTY_KPI: DemoOpsKpisDto = {
  bookingsCreated: 0,
  servicesPlanned: 0,
  readyForAssignment: 0,
  cancelled: 0,
};

export function DemoOpsClient({ locale }: { locale: string }) {
  const [items, setItems] = useState<DemoBookingListItemDto[]>([]);
  const [kpis, setKpis] = useState<DemoOpsKpisDto>(EMPTY_KPI);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function refresh() {
    startTransition(async () => {
      setError(null);
      const [listRes, kpiRes] = await Promise.all([
        actionListDemoBookings({ limit: 10, cursor: null }),
        actionGetDemoOpsKpis(),
      ]);
      if (!listRes.ok) {
        setError(listRes.messageIt);
        return;
      }
      if (!kpiRes.ok) {
        setError(kpiRes.messageIt);
        return;
      }
      setItems([...listRes.data.items]);
      setNextCursor(listRes.data.nextCursor);
      setKpis(kpiRes.data);
    });
  }

  function loadMore() {
    if (!nextCursor) return;
    startTransition(async () => {
      setError(null);
      const res = await actionListDemoBookings({
        limit: 10,
        cursor: nextCursor,
      });
      if (!res.ok) {
        setError(res.messageIt);
        return;
      }
      setItems((prev) => [...prev, ...res.data.items]);
      setNextCursor(res.data.nextCursor);
    });
  }

  useEffect(() => {
    refresh();
  }, []);

  function ready(serviceId: string) {
    startTransition(async () => {
      const res = await actionMarkDemoServiceReady(serviceId);
      if (!res.ok) {
        setError(res.messageIt);
        return;
      }
      refresh();
    });
  }

  function cancel(serviceId: string) {
    startTransition(async () => {
      const res = await actionCancelDemoService(serviceId, "OPERATIONAL");
      if (!res.ok) {
        setError(res.messageIt);
        return;
      }
      refresh();
    });
  }

  function reset() {
    startTransition(async () => {
      await actionResetDemo();
      setItems([]);
      setNextCursor(null);
      setKpis(EMPTY_KPI);
      setError(null);
    });
  }

  const kpiCards = [
    { label: "Booking creati", value: kpis.bookingsCreated },
    { label: "Service pianificati", value: kpis.servicesPlanned },
    { label: "Pronti per assegnazione", value: kpis.readyForAssignment },
    { label: "Cancellati", value: kpis.cancelled },
  ];

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="text-xs font-medium tracking-[0.2em] text-primary uppercase">
          Operazioni
        </p>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-2">
            <h1 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl">
              {DEMO_ESSENTIAL_COPY.opsTitle}
            </h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              {DEMO_ESSENTIAL_COPY.opsDescription}
            </p>
          </div>
          <Button asChild variant="secondary" className="min-h-11 w-fit">
            <Link href={`/${locale}/demo`}>Nuovo transfer demo</Link>
          </Button>
        </div>
      </header>

      <section
        aria-label="Indicatori demo"
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        {kpiCards.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-2xl border border-border/55 bg-card/35 px-4 py-4"
          >
            <p className="text-xs tracking-wide text-muted-foreground uppercase">
              {kpi.label}
            </p>
            <p className="mt-2 font-[family-name:var(--font-heading)] text-3xl text-primary">
              {kpi.value}
            </p>
          </div>
        ))}
      </section>

      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm"
        >
          {error}
        </div>
      ) : null}

      {items.length === 0 && !pending ? (
        <div className="rounded-2xl border border-dashed border-border/70 bg-card/20 px-6 py-14 text-center">
          <CarFront
            className="mx-auto mb-4 size-8 text-primary/80"
            aria-hidden
          />
          <h2 className="font-[family-name:var(--font-heading)] text-xl">
            Nessun Booking demo
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Crea un transfer dimostrativo per vedere qui itinerario, pickup e
            stato del Service.
          </p>
          <Button asChild className="mt-5 min-h-11">
            <Link href={`/${locale}/demo`}>Crea la prima prenotazione</Link>
          </Button>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.bookingId}
              className="rounded-2xl border border-border/60 bg-card/40 p-4 sm:p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">
                      {item.bookingNumber}
                    </span>
                    <StatusBadge
                      label={demoBookingStatusLabelIt(item.bookingStatus)}
                      tone={
                        item.bookingStatus === "CONFIRMED" ? "ok" : "neutral"
                      }
                    />
                    <StatusBadge
                      label={demoServiceStatusLabelIt(item.serviceStatus)}
                      tone={serviceTone(item.serviceStatus)}
                    />
                  </div>
                  <p className="flex items-start gap-2 text-sm sm:text-base">
                    <MapPin
                      className="mt-0.5 size-4 shrink-0 text-primary"
                      aria-hidden
                    />
                    <span>
                      {item.originLabel}
                      <span className="text-muted-foreground"> → </span>
                      {item.destinationLabel}
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground sm:text-sm">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="size-3.5" aria-hidden />
                      Pickup{" "}
                      {new Date(item.scheduledPickupAtIso).toLocaleString(
                        "it-IT"
                      )}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <CarFront className="size-3.5" aria-hidden />
                      {vehicleTitle(item.vehicleCategory)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="size-3.5" aria-hidden />
                      {item.passengerCount} passeggeri
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Briefcase className="size-3.5" aria-hidden />
                      {item.luggageCount} bagagli
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="secondary" className="min-h-10">
                    <Link
                      href={`/${locale}/demo/ops/bookings/${item.bookingId}`}
                    >
                      Dettaglio
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="min-h-10"
                    disabled={pending || item.serviceStatus !== "PLANNED"}
                    onClick={() => ready(item.serviceId)}
                  >
                    Segna pronto
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="min-h-10"
                    disabled={pending || item.serviceStatus === "CANCELLED"}
                    onClick={() => cancel(item.serviceId)}
                  >
                    Cancella
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {nextCursor ? (
        <Button
          type="button"
          variant="ghost"
          disabled={pending}
          onClick={loadMore}
          className="min-h-11"
        >
          {pending ? (
            <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
          ) : null}
          Carica altri
        </Button>
      ) : null}

      <section className="rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-4 sm:px-5">
        <h2 className="text-sm font-medium text-destructive">Zona reset</h2>
        <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
          Il reset svuota la sessione demo in memoria. Non è un’azione
          operativa ordinaria.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-3 min-h-11 border-destructive/40 text-destructive hover:bg-destructive/10"
          onClick={reset}
          disabled={pending}
        >
          Reset sessione demo
        </Button>
      </section>
    </div>
  );
}

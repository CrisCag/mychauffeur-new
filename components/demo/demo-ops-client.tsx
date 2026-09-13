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
  demoActionMessage,
  demoBookingStatusLabel,
  demoServiceStatusLabel,
  demoVehicleTitle,
  formatDemoPickup,
  getDemoCopy,
} from "@/lib/demo/labels";
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

function KpiSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-hidden>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl border border-border/40 bg-card/25 px-4 py-4"
        >
          <div className="h-3 w-24 rounded bg-muted/50" />
          <div className="mt-3 h-8 w-12 rounded bg-muted/40" />
        </div>
      ))}
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-3" aria-hidden>
      {Array.from({ length: 2 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl border border-border/40 bg-card/25 p-5"
        >
          <div className="h-3 w-40 rounded bg-muted/50" />
          <div className="mt-4 h-4 w-3/4 rounded bg-muted/40" />
          <div className="mt-3 h-3 w-1/2 rounded bg-muted/30" />
        </div>
      ))}
    </div>
  );
}

export function DemoOpsClient({ locale }: { locale: string }) {
  const copy = getDemoCopy(locale);
  const [items, setItems] = useState<DemoBookingListItemDto[]>([]);
  const [kpis, setKpis] = useState<DemoOpsKpisDto | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [pending, startTransition] = useTransition();

  function refresh() {
    startTransition(async () => {
      setError(null);
      const [listRes, kpiRes] = await Promise.all([
        actionListDemoBookings({ limit: 10, cursor: null }),
        actionGetDemoOpsKpis(),
      ]);
      if (!listRes.ok) {
        setError(demoActionMessage(listRes, locale));
        setLoaded(true);
        return;
      }
      if (!kpiRes.ok) {
        setError(demoActionMessage(kpiRes, locale));
        setLoaded(true);
        return;
      }
      setItems([...listRes.data.items]);
      setNextCursor(listRes.data.nextCursor);
      setKpis(kpiRes.data);
      setLoaded(true);
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
        setError(demoActionMessage(res, locale));
        return;
      }
      setItems((prev) => [...prev, ...res.data.items]);
      setNextCursor(res.data.nextCursor);
    });
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount once
  }, []);

  function ready(serviceId: string) {
    startTransition(async () => {
      const res = await actionMarkDemoServiceReady(serviceId);
      if (!res.ok) {
        setError(demoActionMessage(res, locale));
        return;
      }
      refresh();
    });
  }

  function cancel(serviceId: string) {
    startTransition(async () => {
      const res = await actionCancelDemoService(serviceId, "OPERATIONAL");
      if (!res.ok) {
        setError(demoActionMessage(res, locale));
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
      setKpis({
        bookingsCreated: 0,
        servicesPlanned: 0,
        readyForAssignment: 0,
        cancelled: 0,
      });
      setError(null);
      setLoaded(true);
    });
  }

  const kpiCards = kpis
    ? [
        { label: copy.kpiBookings, value: kpis.bookingsCreated },
        { label: copy.kpiPlanned, value: kpis.servicesPlanned },
        { label: copy.kpiReady, value: kpis.readyForAssignment },
        { label: copy.kpiCancelled, value: kpis.cancelled },
      ]
    : [];

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="text-xs font-medium tracking-[0.2em] text-primary uppercase">
          {copy.opsEyebrow}
        </p>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-2">
            <h1 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl">
              {copy.opsTitle}
            </h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              {copy.opsDescription}
            </p>
          </div>
          <Button asChild variant="secondary" className="min-h-11 w-fit">
            <Link href={`/${locale}/demo`}>{copy.newTransfer}</Link>
          </Button>
        </div>
      </header>

      <section aria-label={copy.kpiRegion} aria-busy={!loaded}>
        {!loaded || !kpis ? (
          <KpiSkeleton />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
          </div>
        )}
      </section>

      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm"
        >
          {error}
        </div>
      ) : null}

      {!loaded ? (
        <ListSkeleton />
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 bg-card/20 px-6 py-14 text-center">
          <CarFront
            className="mx-auto mb-4 size-8 text-primary/80"
            aria-hidden
          />
          <h2 className="font-[family-name:var(--font-heading)] text-xl">
            {copy.emptyTitle}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            {copy.emptyBody}
          </p>
          <Button asChild className="mt-5 min-h-11">
            <Link href={`/${locale}/demo`}>{copy.emptyCta}</Link>
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
                      label={demoBookingStatusLabel(
                        item.bookingStatus,
                        locale
                      )}
                      tone={
                        item.bookingStatus === "CONFIRMED" ? "ok" : "neutral"
                      }
                    />
                    <StatusBadge
                      label={demoServiceStatusLabel(
                        item.serviceStatus,
                        locale
                      )}
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
                      {copy.pickupPrefix}{" "}
                      {formatDemoPickup(item.scheduledPickupAtIso, locale)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <CarFront className="size-3.5" aria-hidden />
                      {demoVehicleTitle(item.vehicleCategory, locale)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="size-3.5" aria-hidden />
                      {item.passengerCount} {copy.passengersShort}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Briefcase className="size-3.5" aria-hidden />
                      {item.luggageCount} {copy.luggageShort}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    asChild
                    size="sm"
                    variant="secondary"
                    className="min-h-10"
                  >
                    <Link
                      href={`/${locale}/demo/ops/bookings/${item.bookingId}`}
                    >
                      {copy.detailLink}
                    </Link>
                  </Button>
                  {item.serviceStatus === "PLANNED" ? (
                    <Button
                      type="button"
                      size="sm"
                      className="min-h-10"
                      disabled={pending}
                      aria-busy={pending}
                      onClick={() => ready(item.serviceId)}
                    >
                      {copy.markReady}
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="min-h-10"
                    disabled={pending || item.serviceStatus === "CANCELLED"}
                    onClick={() => cancel(item.serviceId)}
                  >
                    {copy.cancel}
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
          {copy.loadMore}
        </Button>
      ) : null}

      <section className="rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-4 sm:px-5">
        <h2 className="text-sm font-medium text-destructive">
          {copy.resetZoneTitle}
        </h2>
        <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
          {copy.resetZoneBody}
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-3 min-h-11 border-destructive/40 text-destructive hover:bg-destructive/10"
          onClick={reset}
          disabled={pending}
        >
          {copy.resetSession}
        </Button>
      </section>
    </div>
  );
}

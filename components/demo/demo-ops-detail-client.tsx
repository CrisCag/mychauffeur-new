"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  Briefcase,
  CalendarDays,
  CarFront,
  MapPin,
  UserRound,
} from "lucide-react";
import {
  actionCancelDemoService,
  actionGetDemoBookingDetail,
  actionMarkDemoServiceReady,
} from "@/lib/demo/actions";
import type { DemoBookingDetailDto } from "@/lib/demo/dto";
import {
  demoActionMessage,
  demoAuditEventLabel,
  demoBookingStatusLabel,
  demoCancellationReasonLabel,
  demoServiceStatusLabel,
  demoVehicleTitle,
  formatDemoEuro,
  formatDemoPickup,
  getDemoCopy,
} from "@/lib/demo/labels";
import { Button } from "@/components/ui/button";

export function DemoOpsDetailClient({
  locale,
  bookingId,
}: {
  locale: string;
  bookingId: string;
}) {
  const copy = getDemoCopy(locale);
  const [detail, setDetail] = useState<DemoBookingDetailDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    startTransition(async () => {
      const res = await actionGetDemoBookingDetail(bookingId);
      if (!res.ok) {
        setError(demoActionMessage(res, locale));
        setLoaded(true);
        return;
      }
      setDetail(res.data);
      if (!res.data) {
        setError(copy.notFound);
      }
      setLoaded(true);
    });
  }, [bookingId, copy.notFound, locale]);

  function reload() {
    startTransition(async () => {
      const res = await actionGetDemoBookingDetail(bookingId);
      if (!res.ok) {
        setError(demoActionMessage(res, locale));
        return;
      }
      setDetail(res.data);
    });
  }

  if (!loaded && !detail) {
    return (
      <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
        {copy.loading}
      </p>
    );
  }

  if (error && !detail) {
    return (
      <div className="space-y-4">
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
        <Button asChild variant="secondary">
          <Link href={`/${locale}/demo/ops`}>{copy.backToOps}</Link>
        </Button>
      </div>
    );
  }

  if (!detail) {
    return <p className="text-sm text-muted-foreground">{copy.loading}</p>;
  }

  const { list } = detail;

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href={`/${locale}/demo/ops`}>{copy.backToOps}</Link>
        </Button>
        <p className="text-xs font-medium tracking-[0.2em] text-primary uppercase">
          {copy.detailEyebrow}
        </p>
        <h1 className="font-[family-name:var(--font-heading)] text-3xl">
          Booking {list.bookingNumber}
        </h1>
        <p className="text-sm text-muted-foreground">
          {demoBookingStatusLabel(list.bookingStatus, locale)} · Service{" "}
          {list.serviceNumber} ·{" "}
          {demoServiceStatusLabel(list.serviceStatus, locale)}
        </p>
      </header>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-2">
        <DetailCard
          title={copy.cardItinerary}
          icon={<MapPin className="size-4 text-primary" aria-hidden />}
        >
          <p>
            {detail.routePickupLabel}
            <span className="text-muted-foreground"> → </span>
            {detail.routeDropoffLabel}
          </p>
        </DetailCard>
        <DetailCard
          title={copy.cardPickup}
          icon={<CalendarDays className="size-4 text-primary" aria-hidden />}
        >
          <p>{formatDemoPickup(list.scheduledPickupAtIso, locale)}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {copy.timezoneLabel} {detail.timezone}
          </p>
        </DetailCard>
        <DetailCard
          title={copy.cardVehicle}
          icon={<CarFront className="size-4 text-primary" aria-hidden />}
        >
          <p>{demoVehicleTitle(list.vehicleCategory, locale)}</p>
          <p className="mt-2 inline-flex items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <span className="sr-only">{copy.passengersLabel}:</span>
              {detail.passengers} {copy.passengersShort}
            </span>
            <span className="inline-flex items-center gap-1">
              <Briefcase className="size-3.5" aria-hidden />
              {detail.luggage} {copy.luggageShort}
            </span>
          </p>
        </DetailCard>
        <DetailCard
          title={copy.cardContact}
          icon={<UserRound className="size-4 text-primary" aria-hidden />}
        >
          <p>{detail.guestDisplayName}</p>
          <p className="mt-1 text-muted-foreground">{detail.guestEmail}</p>
          <p className="text-muted-foreground">{detail.guestPhone}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            {copy.contactDetailOnly}
          </p>
        </DetailCard>
        <DetailCard title={copy.cardPrice} className="lg:col-span-2">
          <p className="font-[family-name:var(--font-heading)] text-2xl text-primary">
            {formatDemoEuro(detail.priceTotalMinor, locale)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {copy.priceDisclaimer} · {detail.pricingVersion}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {copy.cancelPolicy}: {detail.policyCancellationCode}
          </p>
          {detail.cancelReasonCode ? (
            <p className="mt-2 text-sm">
              {demoCancellationReasonLabel(detail.cancelReasonCode, locale)}
              <span className="ml-2 font-mono text-[11px] text-muted-foreground">
                ({detail.cancelReasonCode})
              </span>
            </p>
          ) : null}
        </DetailCard>
      </section>

      <div className="flex flex-wrap gap-2">
        {list.serviceStatus === "PLANNED" ? (
          <Button
            type="button"
            className="min-h-11"
            disabled={pending}
            aria-busy={pending}
            onClick={() =>
              startTransition(async () => {
                const res = await actionMarkDemoServiceReady(list.serviceId);
                if (!res.ok) setError(demoActionMessage(res, locale));
                else reload();
              })
            }
          >
            {copy.markReadyFull}
          </Button>
        ) : null}
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          disabled={pending || list.serviceStatus === "CANCELLED"}
          onClick={() =>
            startTransition(async () => {
              const res = await actionCancelDemoService(
                list.serviceId,
                "OPERATIONAL"
              );
              if (!res.ok) setError(demoActionMessage(res, locale));
              else reload();
            })
          }
        >
          {copy.cancelService}
        </Button>
      </div>

      <section className="rounded-2xl border border-border/60 bg-card/40 p-5">
        <h2 className="font-[family-name:var(--font-heading)] text-xl">
          {copy.timelineTitle}
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">{copy.timelineHint}</p>
        {detail.events.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">—</p>
        ) : (
          <ol className="relative mt-5 space-y-0 border-l border-border/60 pl-5">
            {detail.events.map((e, i) => (
              <li
                key={`${e.type}-${e.occurredAtIso}-${i}`}
                className="relative pb-5 last:pb-0"
              >
                <span
                  className="absolute top-1.5 -left-[1.4rem] size-2.5 rounded-full border border-primary bg-background"
                  aria-hidden
                />
                <p className="text-sm text-foreground">
                  {demoAuditEventLabel(e.type, locale)}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {e.source}
                  {e.publicRef ? ` · ${e.publicRef}` : ""} ·{" "}
                  {formatDemoPickup(e.occurredAtIso, locale)}
                </p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

function DetailCard({
  title,
  children,
  icon,
  className,
}: {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-border/60 bg-card/40 p-4 text-sm sm:p-5 ${className ?? ""}`}
    >
      <h2 className="mb-3 flex items-center gap-2 text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
        {icon}
        {title}
      </h2>
      <div className="text-foreground/90">{children}</div>
    </div>
  );
}

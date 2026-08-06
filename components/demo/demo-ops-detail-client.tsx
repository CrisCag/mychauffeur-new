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
  DEMO_PRICE_DISCLAIMER_IT,
  DEMO_VEHICLE_PRESENTATION,
  demoAuditEventLabelIt,
  demoBookingStatusLabelIt,
  demoCancellationReasonLabelIt,
  demoServiceStatusLabelIt,
  isDemoVehicleCategory,
} from "@/lib/demo";
import { Button } from "@/components/ui/button";

function formatEuro(minor: number, currency: string): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency,
  }).format(minor / 100);
}

function vehicleTitle(category: string): string {
  if (!isDemoVehicleCategory(category)) return category;
  return DEMO_VEHICLE_PRESENTATION[category].titleIt;
}

export function DemoOpsDetailClient({
  locale,
  bookingId,
}: {
  locale: string;
  bookingId: string;
}) {
  const [detail, setDetail] = useState<DemoBookingDetailDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const res = await actionGetDemoBookingDetail(bookingId);
      if (!res.ok) {
        setError(res.messageIt);
        return;
      }
      setDetail(res.data);
      if (!res.data) {
        setError("Booking demo non trovato in questo scope.");
      }
    });
  }, [bookingId]);

  function reload() {
    startTransition(async () => {
      const res = await actionGetDemoBookingDetail(bookingId);
      if (!res.ok) {
        setError(res.messageIt);
        return;
      }
      setDetail(res.data);
    });
  }

  if (error && !detail) {
    return (
      <div className="space-y-4">
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
        <Button asChild variant="secondary">
          <Link href={`/${locale}/demo/ops`}>Torna a Operazioni</Link>
        </Button>
      </div>
    );
  }

  if (!detail) {
    return <p className="text-sm text-muted-foreground">Caricamento…</p>;
  }

  const { list } = detail;

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href={`/${locale}/demo/ops`}>← Operazioni</Link>
        </Button>
        <p className="text-xs font-medium tracking-[0.2em] text-primary uppercase">
          Dettaglio
        </p>
        <h1 className="font-[family-name:var(--font-heading)] text-3xl">
          Booking {list.bookingNumber}
        </h1>
        <p className="text-sm text-muted-foreground">
          {demoBookingStatusLabelIt(list.bookingStatus)} · Service{" "}
          {list.serviceNumber} · {demoServiceStatusLabelIt(list.serviceStatus)}
        </p>
      </header>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-2">
        <DetailCard
          title="Itinerario"
          icon={<MapPin className="size-4 text-primary" aria-hidden />}
        >
          <p>
            {detail.routePickupLabel}
            <span className="text-muted-foreground"> → </span>
            {detail.routeDropoffLabel}
          </p>
        </DetailCard>
        <DetailCard
          title="Pickup"
          icon={<CalendarDays className="size-4 text-primary" aria-hidden />}
        >
          <p>
            {new Date(list.scheduledPickupAtIso).toLocaleString("it-IT")}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Fuso {detail.timezone}
          </p>
        </DetailCard>
        <DetailCard
          title="Veicolo e capacità"
          icon={<CarFront className="size-4 text-primary" aria-hidden />}
        >
          <p>{vehicleTitle(list.vehicleCategory)}</p>
          <p className="mt-2 inline-flex items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <span className="sr-only">Passeggeri:</span>
              {detail.passengers} passeggeri
            </span>
            <span className="inline-flex items-center gap-1">
              <Briefcase className="size-3.5" aria-hidden />
              {detail.luggage} bagagli
            </span>
          </p>
        </DetailCard>
        <DetailCard
          title="Contatto demo"
          icon={<UserRound className="size-4 text-primary" aria-hidden />}
        >
          <p>{detail.guestDisplayName}</p>
          <p className="mt-1 text-muted-foreground">{detail.guestEmail}</p>
          <p className="text-muted-foreground">{detail.guestPhone}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Visibile solo nel dettaglio demo · non in elenco generale
          </p>
        </DetailCard>
        <DetailCard title="Prezzo demo" className="lg:col-span-2">
          <p className="font-[family-name:var(--font-heading)] text-2xl text-primary">
            {formatEuro(detail.priceTotalMinor, detail.currency)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {DEMO_PRICE_DISCLAIMER_IT} · versione {detail.pricingVersion}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Policy cancellazione demo: {detail.policyCancellationCode}
          </p>
          {detail.cancelReasonCode ? (
            <p className="mt-2 text-sm">
              Motivo cancellazione:{" "}
              <span className="text-foreground">
                {demoCancellationReasonLabelIt(detail.cancelReasonCode)}
              </span>
              <span className="ml-2 font-mono text-[11px] text-muted-foreground">
                ({detail.cancelReasonCode})
              </span>
            </p>
          ) : null}
        </DetailCard>
      </section>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          className="min-h-11"
          disabled={pending || list.serviceStatus !== "PLANNED"}
          onClick={() =>
            startTransition(async () => {
              const res = await actionMarkDemoServiceReady(list.serviceId);
              if (!res.ok) setError(res.messageIt);
              else reload();
            })
          }
        >
          Segna pronto per assegnazione
        </Button>
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
              if (!res.ok) setError(res.messageIt);
              else reload();
            })
          }
        >
          Cancella service
        </Button>
      </div>

      <section className="rounded-2xl border border-border/60 bg-card/40 p-5">
        <h2 className="font-[family-name:var(--font-heading)] text-xl">
          Timeline eventi
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Audit in-memory della sessione demo · nessuna PII negli eventi Domain
        </p>
        {detail.events.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">Nessun evento.</p>
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
                  {demoAuditEventLabelIt(e.type)}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {e.source}
                  {e.publicRef ? ` · ${e.publicRef}` : ""} ·{" "}
                  {new Date(e.occurredAtIso).toLocaleString("it-IT")}
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

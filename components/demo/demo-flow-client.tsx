"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  CalendarDays,
  CarFront,
  Check,
  Clock3,
  DoorOpen,
  Euro,
  Loader2,
  MapPin,
  ShieldCheck,
  Users,
  Briefcase,
} from "lucide-react";
import {
  DEMO_DESTINATION,
  DEMO_ORIGIN,
  DEMO_PRICES,
  DEMO_PRICE_DISCLAIMER_IT,
  DEMO_REASSURANCE_ITEMS,
  DEMO_REASSURANCE_NOTE_IT,
  DEMO_SUGGESTED_GUEST,
  DEMO_VEHICLE_CATEGORIES,
  listCompatibleDemoVehicles,
  type DemoVehicleCategory,
} from "@/lib/demo/fixtures";
import { DEMO_ESSENTIAL_COPY, DEMO_FLOW_STEPS } from "@/lib/demo/labels";
import {
  actionResetDemo,
  actionSubmitDemoTransfer,
  type DemoActionResult,
} from "@/lib/demo/actions";
import type { DemoSubmissionResultDto } from "@/lib/demo/dto";
import { DemoVehiclePicker } from "@/components/demo/demo-vehicle-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Step = 1 | 2 | 3 | 4 | 5;

const REASSURANCE_ICONS = [DoorOpen, CarFront, Euro, ShieldCheck] as const;

function tomorrowLocalIsoDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatEuro(minor: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(minor / 100);
}

function newSubmissionKey(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `sub-${crypto.randomUUID()}`;
  }
  return `sub-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function FieldHint({
  children,
  id,
}: {
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <p id={id} className="text-xs text-muted-foreground">
      {children}
    </p>
  );
}

export function DemoFlowClient({ locale }: { locale: string }) {
  const [step, setStep] = useState<Step>(1);
  const [date, setDate] = useState(tomorrowLocalIsoDate);
  const [time, setTime] = useState("10:00");
  const [passengers, setPassengers] = useState(2);
  const [luggage, setLuggage] = useState(2);
  const [category, setCategory] = useState<DemoVehicleCategory | null>("SEDAN");
  const [guestName, setGuestName] = useState(
    String(DEMO_SUGGESTED_GUEST.displayName)
  );
  const [guestEmail, setGuestEmail] = useState(
    String(DEMO_SUGGESTED_GUEST.email)
  );
  const [guestPhone, setGuestPhone] = useState(
    String(DEMO_SUGGESTED_GUEST.phone)
  );
  const [submissionKey, setSubmissionKey] = useState(newSubmissionKey);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<DemoSubmissionResultDto | null>(null);
  const [pending, startTransition] = useTransition();

  const compatible = useMemo(
    () => listCompatibleDemoVehicles(passengers, luggage),
    [passengers, luggage]
  );

  /** Prefer explicit selection; never silently rewrite passenger/luggage inputs. */
  const selectedCategory =
    category !== null && compatible.includes(category) ? category : null;

  const price = selectedCategory ? DEMO_PRICES[selectedCategory] : null;
  const scheduledPickupAtIso = useMemo(() => {
    return new Date(`${date}T${time}:00`).toISOString();
  }, [date, time]);

  function validateStep1(): string | null {
    const next: Record<string, string> = {};
    if (!date) next.date = "Seleziona la data del pickup.";
    if (!time) next.time = "Seleziona l’ora del pickup.";
    const pickup = new Date(`${date}T${time}:00`);
    if (date && time && Number.isNaN(pickup.getTime())) {
      next.date = "Data o ora non valide.";
    } else if (date && time && pickup.getTime() <= Date.now()) {
      next.time = "Scegli un orario futuro.";
    }
    if (!Number.isSafeInteger(passengers) || passengers < 1 || passengers > 8) {
      next.passengers = "Indica tra 1 e 8 passeggeri.";
    }
    if (!Number.isSafeInteger(luggage) || luggage < 0 || luggage > 12) {
      next.luggage = "Indica tra 0 e 12 bagagli.";
    }
    setFieldErrors(next);
    const first = Object.values(next)[0];
    return first ?? null;
  }

  function validateStep2(): string | null {
    if (compatible.length === 0) {
      return DEMO_ESSENTIAL_COPY.incompatibleVehicles;
    }
    if (!selectedCategory) {
      return "Seleziona una categoria veicolo compatibile.";
    }
    return null;
  }

  function validateGuest(): string | null {
    const next: Record<string, string> = {};
    if (!/demo/i.test(guestName.trim())) {
      next.guestName = "Il nome deve contenere “Demo” (dati fittizi).";
    }
    if (!guestEmail.trim().toLowerCase().endsWith(".test")) {
      next.guestEmail = "Usa un’email con dominio .test";
    }
    if (!guestPhone.trim()) {
      next.guestPhone = "Inserisci un telefono fittizio.";
    }
    setFieldErrors(next);
    return Object.values(next)[0] ?? null;
  }

  function goNext() {
    setError(null);
    if (step === 1) {
      const err = validateStep1();
      if (err) {
        setError(err);
        return;
      }
      setStep(2);
      return;
    }
    if (step === 2) {
      const err = validateStep2();
      if (err) {
        setError(err);
        return;
      }
      setStep(3);
      return;
    }
    if (step === 3) {
      const err = validateGuest();
      if (err) {
        setError(err);
        return;
      }
      setStep(4);
    }
  }

  function confirm() {
    setError(null);
    const err = validateStep1() ?? validateStep2() ?? validateGuest();
    if (err || !selectedCategory) {
      setError(err ?? "Seleziona un veicolo.");
      return;
    }
    startTransition(async () => {
      const res: DemoActionResult<DemoSubmissionResultDto> =
        await actionSubmitDemoTransfer({
          submissionKey,
          vehicleCategory: selectedCategory,
          scheduledPickupAtIso,
          passengerCount: passengers,
          luggageCount: luggage,
          guestDisplayName: guestName,
          guestEmail,
          guestPhone,
        });
      if (!res.ok) {
        setError(res.messageIt);
        return;
      }
      setResult(res.data);
      setStep(5);
    });
  }

  function startAnother() {
    setSubmissionKey(newSubmissionKey());
    setResult(null);
    setError(null);
    setFieldErrors({});
    setStep(1);
  }

  function resetAll() {
    startTransition(async () => {
      await actionResetDemo();
      setStep(1);
      setResult(null);
      setError(null);
      setFieldErrors({});
      setSubmissionKey(newSubmissionKey());
      setGuestName(DEMO_SUGGESTED_GUEST.displayName);
      setGuestEmail(DEMO_SUGGESTED_GUEST.email);
      setGuestPhone(DEMO_SUGGESTED_GUEST.phone);
      setPassengers(2);
      setLuggage(2);
      setCategory("SEDAN");
    });
  }

  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <p className="text-xs font-medium tracking-[0.22em] text-primary uppercase">
          Transfer privato
        </p>
        <h1 className="max-w-3xl font-[family-name:var(--font-heading)] text-[1.85rem] leading-tight text-foreground sm:text-4xl md:text-[2.6rem]">
          {DEMO_ESSENTIAL_COPY.heroTitle}
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
          {DEMO_ESSENTIAL_COPY.heroSubtitle}
        </p>
        <p className="text-sm text-foreground/80">{DEMO_ESSENTIAL_COPY.heroMicro}</p>
      </header>

      <section
        aria-label="Caratteristiche illustrate"
        className="rounded-2xl border border-border/50 bg-card/30 px-4 py-4 sm:px-5"
      >
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {DEMO_REASSURANCE_ITEMS.map((item, idx) => {
            const Icon = REASSURANCE_ICONS[idx] ?? ShieldCheck;
            return (
              <li key={item.id} className="flex items-start gap-2.5 text-sm">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/60 text-primary">
                  <Icon className="size-4" aria-hidden />
                </span>
                <span className="pt-1.5 text-foreground/90">{item.labelIt}</span>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">
          {DEMO_REASSURANCE_NOTE_IT}
        </p>
      </section>

      <nav aria-label="Passi demo" className="overflow-x-auto pb-1">
        <ol className="flex min-w-0 items-stretch gap-1 sm:gap-2">
          {DEMO_FLOW_STEPS.map(({ n, label }) => {
            const active = step === n;
            const done = step > n;
            return (
              <li key={n} className="min-w-0 flex-1">
                <div
                  className={cn(
                    "flex h-full flex-col items-center gap-1.5 rounded-xl border px-1.5 py-2 text-center sm:px-2 sm:py-2.5",
                    active
                      ? "border-primary bg-primary/12 text-primary"
                      : done
                        ? "border-border/70 text-foreground/80"
                        : "border-border/40 text-muted-foreground/70"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-6 items-center justify-center rounded-full text-[11px] font-semibold sm:size-7",
                      active || done
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                    aria-current={active ? "step" : undefined}
                  >
                    {done ? <Check className="size-3.5" aria-hidden /> : n}
                  </span>
                  <span className="max-w-full truncate text-[10px] font-medium tracking-wide sm:text-xs">
                    {label}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </nav>

      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      ) : null}

      {step === 1 ? (
        <section className="space-y-5 rounded-2xl border border-border/55 bg-card/35 p-5 sm:p-7">
          <div className="space-y-1">
            <h2 className="font-[family-name:var(--font-heading)] text-2xl">
              {DEMO_ESSENTIAL_COPY.tripTitle}
            </h2>
            <p className="text-sm text-muted-foreground">
              Origine e destinazione sono fixture della demo.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="origin" className="inline-flex items-center gap-2">
                <MapPin className="size-3.5 text-primary" aria-hidden />
                Luogo di partenza
              </Label>
              <Input
                id="origin"
                value={DEMO_ORIGIN.displayLabel}
                readOnly
                className="bg-muted/35"
              />
              <FieldHint>Aeroporto demo · non modificabile</FieldHint>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="destination"
                className="inline-flex items-center gap-2"
              >
                <MapPin className="size-3.5 text-primary" aria-hidden />
                Destinazione
              </Label>
              <Input
                id="destination"
                value={DEMO_DESTINATION.displayLabel}
                readOnly
                className="bg-muted/35"
              />
              <FieldHint>Città demo · non modificabile</FieldHint>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date" className="inline-flex items-center gap-2">
                <CalendarDays className="size-3.5 text-primary" aria-hidden />
                Data del pickup
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                aria-invalid={Boolean(fieldErrors.date)}
                aria-describedby={fieldErrors.date ? "date-error" : undefined}
                onChange={(e) => setDate(e.target.value)}
              />
              {fieldErrors.date ? (
                <p id="date-error" className="text-xs text-destructive">
                  {fieldErrors.date}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="time" className="inline-flex items-center gap-2">
                <Clock3 className="size-3.5 text-primary" aria-hidden />
                Ora del pickup
              </Label>
              <Input
                id="time"
                type="time"
                value={time}
                aria-invalid={Boolean(fieldErrors.time)}
                aria-describedby={fieldErrors.time ? "time-error" : undefined}
                onChange={(e) => setTime(e.target.value)}
              />
              {fieldErrors.time ? (
                <p id="time-error" className="text-xs text-destructive">
                  {fieldErrors.time}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="pax" className="inline-flex items-center gap-2">
                <Users className="size-3.5 text-primary" aria-hidden />
                Passeggeri
              </Label>
              <Input
                id="pax"
                type="number"
                min={1}
                max={8}
                value={passengers}
                aria-invalid={Boolean(fieldErrors.passengers)}
                aria-describedby={
                  fieldErrors.passengers ? "pax-error" : "pax-hint"
                }
                onChange={(e) => setPassengers(Number(e.target.value))}
              />
              {fieldErrors.passengers ? (
                <p id="pax-error" className="text-xs text-destructive">
                  {fieldErrors.passengers}
                </p>
              ) : (
                <FieldHint id="pax-hint">Incluse le persone a bordo</FieldHint>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="bags" className="inline-flex items-center gap-2">
                <Briefcase className="size-3.5 text-primary" aria-hidden />
                Bagagli
              </Label>
              <Input
                id="bags"
                type="number"
                min={0}
                max={12}
                value={luggage}
                aria-invalid={Boolean(fieldErrors.luggage)}
                aria-describedby={
                  fieldErrors.luggage ? "bags-error" : "bags-hint"
                }
                onChange={(e) => setLuggage(Number(e.target.value))}
              />
              {fieldErrors.luggage ? (
                <p id="bags-error" className="text-xs text-destructive">
                  {fieldErrors.luggage}
                </p>
              ) : (
                <FieldHint id="bags-hint">
                  Conta i bagagli grandi previsti
                </FieldHint>
              )}
            </div>
          </div>
          <Button type="button" className="min-h-11 px-6" onClick={goNext}>
            Continua
          </Button>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="space-y-5 rounded-2xl border border-border/55 bg-card/35 p-5 sm:p-7">
          <div className="space-y-1">
            <h2 className="font-[family-name:var(--font-heading)] text-2xl">
              {DEMO_ESSENTIAL_COPY.vehicleTitle}
            </h2>
            <p className="text-sm text-muted-foreground">
              {DEMO_ESSENTIAL_COPY.vehicleSubtitle}
            </p>
          </div>
          {compatible.length === 0 ? (
            <p
              role="status"
              className="rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-sm text-amber-50"
            >
              {DEMO_ESSENTIAL_COPY.incompatibleVehicles}
            </p>
          ) : (
            <DemoVehiclePicker
              categories={DEMO_VEHICLE_CATEGORIES}
              selected={selectedCategory}
              onSelect={setCategory}
              passengers={passengers}
              luggage={luggage}
            />
          )}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              className="min-h-11"
              onClick={() => setStep(1)}
            >
              Indietro
            </Button>
            <Button
              type="button"
              className="min-h-11 px-6"
              onClick={goNext}
              disabled={compatible.length === 0 || !selectedCategory}
            >
              Continua
            </Button>
          </div>
        </section>
      ) : null}

      {step === 3 ? (
        <section className="space-y-5 rounded-2xl border border-border/55 bg-card/35 p-5 sm:p-7">
          <div className="space-y-2">
            <h2 className="font-[family-name:var(--font-heading)] text-2xl">
              {DEMO_ESSENTIAL_COPY.guestTitle}
            </h2>
            <p
              role="note"
              className="rounded-xl border border-primary/35 bg-primary/10 px-4 py-3 text-sm text-primary"
            >
              {DEMO_SUGGESTED_GUEST.noteIt}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="guestName">Nome del passeggero</Label>
              <Input
                id="guestName"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                autoComplete="off"
                aria-invalid={Boolean(fieldErrors.guestName)}
                aria-describedby={
                  fieldErrors.guestName ? "guestName-error" : undefined
                }
              />
              {fieldErrors.guestName ? (
                <p id="guestName-error" className="text-xs text-destructive">
                  {fieldErrors.guestName}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="guestEmail">Email di contatto</Label>
              <Input
                id="guestEmail"
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                autoComplete="off"
                aria-invalid={Boolean(fieldErrors.guestEmail)}
                aria-describedby={
                  fieldErrors.guestEmail ? "guestEmail-error" : undefined
                }
              />
              {fieldErrors.guestEmail ? (
                <p id="guestEmail-error" className="text-xs text-destructive">
                  {fieldErrors.guestEmail}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="guestPhone">Telefono di contatto</Label>
              <Input
                id="guestPhone"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                autoComplete="off"
                aria-invalid={Boolean(fieldErrors.guestPhone)}
                aria-describedby={
                  fieldErrors.guestPhone ? "guestPhone-error" : undefined
                }
              />
              {fieldErrors.guestPhone ? (
                <p id="guestPhone-error" className="text-xs text-destructive">
                  {fieldErrors.guestPhone}
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              className="min-h-11"
              onClick={() => setStep(2)}
            >
              Indietro
            </Button>
            <Button type="button" className="min-h-11 px-6" onClick={goNext}>
              Continua
            </Button>
          </div>
        </section>
      ) : null}

      {step === 4 && price && selectedCategory ? (
        <section className="space-y-5 rounded-2xl border border-border/55 bg-card/35 p-5 sm:p-7">
          <h2 className="font-[family-name:var(--font-heading)] text-2xl">
            {DEMO_ESSENTIAL_COPY.summaryTitle}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <SummaryBlock title="Itinerario">
              {DEMO_ORIGIN.displayLabel}
              <br />→ {DEMO_DESTINATION.displayLabel}
            </SummaryBlock>
            <SummaryBlock title="Data e ora">
              {date} · {time}
              <br />
              <span className="text-muted-foreground">
                Fuso {DEMO_ORIGIN.timezone}
              </span>
            </SummaryBlock>
            <SummaryBlock title="Veicolo">{price.labelIt}</SummaryBlock>
            <SummaryBlock title="Passeggeri e bagagli">
              {passengers} passeggeri · {luggage} bagagli
            </SummaryBlock>
            <SummaryBlock title="Contatto">
              {guestName}
              <br />
              {guestEmail}
              <br />
              {guestPhone}
            </SummaryBlock>
            <SummaryBlock title="Prezzo demo">
              <span className="block font-[family-name:var(--font-heading)] text-2xl text-primary">
                {formatEuro(price.totalCustomerAmountMinor)}
              </span>
              <span className="mt-1 block text-xs text-muted-foreground">
                {DEMO_ESSENTIAL_COPY.priceTotalLabel} ·{" "}
                {DEMO_ESSENTIAL_COPY.priceDemoLabel}
              </span>
              <span className="mt-1 block text-xs text-muted-foreground">
                {DEMO_PRICE_DISCLAIMER_IT}
              </span>
            </SummaryBlock>
            <SummaryBlock title="Condizioni demo" className="sm:col-span-2">
              Nessun pagamento · dati solo nel processo locale · nessuna
              disponibilità reale garantita · policy demo{" "}
              <span className="font-mono text-[11px]">demo.cancel.std</span>
            </SummaryBlock>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              className="min-h-11"
              onClick={() => setStep(3)}
            >
              Indietro
            </Button>
            <Button
              type="button"
              className="min-h-11 px-6"
              onClick={confirm}
              disabled={pending}
            >
              {pending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                  Elaborazione…
                </>
              ) : (
                DEMO_ESSENTIAL_COPY.confirmCta
              )}
            </Button>
          </div>
        </section>
      ) : null}

      {step === 5 && result ? (
        <section className="space-y-5 rounded-2xl border border-primary/40 bg-primary/5 p-5 sm:p-7">
          <div className="space-y-2">
            <p className="inline-flex items-center gap-2 text-sm text-primary">
              <Check className="size-4" aria-hidden />
              Completato
            </p>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl text-primary">
              {DEMO_ESSENTIAL_COPY.resultTitle}
            </h2>
          </div>
          <ul className="space-y-2 text-sm text-foreground/90">
            <li>Quote accettata · {result.quoteNumber}</li>
            <li>
              Booking confermato · {result.bookingNumber} (
              {result.bookingStatus})
            </li>
            <li>
              Service pianificato · {result.serviceNumber} (
              {result.serviceStatus})
            </li>
            <li>{result.processLocalNoticeIt}</li>
            <li>Nessun pagamento effettuato.</li>
          </ul>
          <p className="text-sm text-muted-foreground">
            Totale demo: {formatEuro(result.priceTotalMinor)} ·{" "}
            {DEMO_ESSENTIAL_COPY.priceNotOffer}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild className="min-h-11">
              <Link href={`/${locale}/demo/ops`}>
                Apri il pannello operativo
              </Link>
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="min-h-11"
              onClick={startAnother}
            >
              Crea un altro transfer demo
            </Button>
            <Button
              type="button"
              variant="outline"
              className="min-h-11 border-destructive/40 text-destructive hover:bg-destructive/10"
              onClick={resetAll}
              disabled={pending}
            >
              Reset sessione demo
            </Button>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function SummaryBlock({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/50 bg-background/30 p-4 text-sm",
        className
      )}
    >
      <h3 className="mb-2 text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
        {title}
      </h3>
      <div className="leading-relaxed text-foreground/90">{children}</div>
    </div>
  );
}

"use client";

import { Briefcase, Check, Users } from "lucide-react";
import {
  DEMO_PRICES,
  DEMO_PRICE_DISCLAIMER_IT,
  DEMO_VEHICLE_IMAGE_DISCLAIMER_IT,
  DEMO_VEHICLE_PRESENTATION,
  isDemoVehicleCompatible,
  type DemoVehicleCategory,
} from "@/lib/demo/fixtures";
import { DEMO_ESSENTIAL_COPY } from "@/lib/demo/labels";
import {
  SedanSilhouette,
  VanSilhouette,
} from "@/components/demo/vehicle-silhouettes";
import { cn } from "@/lib/utils";

function formatEuro(minor: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(minor / 100);
}

export function DemoVehiclePicker({
  categories,
  selected,
  onSelect,
  passengers,
  luggage,
}: {
  categories: readonly DemoVehicleCategory[];
  selected: DemoVehicleCategory | null;
  onSelect: (category: DemoVehicleCategory) => void;
  passengers: number;
  luggage: number;
}) {
  return (
    <fieldset className="space-y-4">
      <legend className="sr-only">Categoria veicolo demo</legend>
      <div className="grid gap-4 md:grid-cols-2">
        {categories.map((category) => {
          const presentation = DEMO_VEHICLE_PRESENTATION[category];
          const price = DEMO_PRICES[category];
          const compatible = isDemoVehicleCompatible(
            category,
            passengers,
            luggage
          );
          const isSelected = selected === category;
          const Silhouette =
            category === "SEDAN" ? SedanSilhouette : VanSilhouette;
          const radioId = `demo-vehicle-${category}`;

          return (
            <label
              key={category}
              htmlFor={radioId}
              className={cn(
                "group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border bg-card/50 p-4 transition-[border-color,background-color,box-shadow] duration-200 motion-reduce:transition-none sm:p-5",
                compatible
                  ? "hover:border-primary/50 hover:bg-card/80"
                  : "cursor-not-allowed opacity-55",
                isSelected && compatible
                  ? "border-primary bg-primary/10 shadow-[0_0_0_1px_oklch(0.82_0.12_85/0.35)]"
                  : "border-border/60",
                "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background"
              )}
            >
              <input
                id={radioId}
                type="radio"
                name="demo-vehicle-category"
                value={category}
                checked={isSelected}
                disabled={!compatible}
                onChange={() => {
                  if (compatible) onSelect(category);
                }}
                className="sr-only"
                aria-describedby={`${radioId}-desc ${radioId}-price`}
              />
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="font-[family-name:var(--font-heading)] text-xl text-foreground">
                    {presentation.titleIt}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {presentation.examplesIt}
                  </p>
                </div>
                {isSelected && compatible ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-primary/50 bg-primary/15 px-2 py-1 text-[10px] font-medium tracking-wide text-primary uppercase">
                    <Check className="size-3" aria-hidden />
                    Selezionato
                  </span>
                ) : null}
              </div>

              <div className="mb-4 rounded-xl border border-border/40 bg-background/40 px-3 py-4">
                <Silhouette
                  title={`Illustrazione ${presentation.titleIt}`}
                  className="mx-auto max-w-[280px]"
                />
              </div>

              <p id={`${radioId}-desc`} className="text-sm text-muted-foreground">
                {presentation.descriptionIt}
              </p>

              <ul className="mt-4 space-y-2 text-sm text-foreground/90">
                <li className="flex items-center gap-2">
                  <Users className="size-4 shrink-0 text-primary" aria-hidden />
                  <span>{presentation.passengersLabelIt}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Briefcase
                    className="size-4 shrink-0 text-primary"
                    aria-hidden
                  />
                  <span>{presentation.luggageLabelIt}</span>
                </li>
              </ul>

              <div
                id={`${radioId}-price`}
                className="mt-5 border-t border-border/50 pt-4"
              >
                <p className="text-xs tracking-wide text-muted-foreground uppercase">
                  {DEMO_ESSENTIAL_COPY.priceTotalLabel}
                </p>
                <p className="mt-1 font-[family-name:var(--font-heading)] text-2xl text-primary">
                  {formatEuro(price.totalCustomerAmountMinor)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {DEMO_ESSENTIAL_COPY.priceDemoLabel} ·{" "}
                  {DEMO_ESSENTIAL_COPY.priceNotOffer}
                </p>
              </div>

              {!compatible ? (
                <p className="mt-3 text-xs text-amber-100/90" role="status">
                  Non compatibile con {passengers} passeggeri e {luggage}{" "}
                  bagagli (capacità demo).
                </p>
              ) : null}
            </label>
          );
        })}
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">
        {DEMO_VEHICLE_IMAGE_DISCLAIMER_IT}
      </p>
      <p className="sr-only">{DEMO_PRICE_DISCLAIMER_IT}</p>
    </fieldset>
  );
}

"use client";

import { Briefcase, Check, Users } from "lucide-react";
import {
  DEMO_PRICES,
  isDemoVehicleCompatible,
  type DemoVehicleCategory,
} from "@/lib/demo/fixtures";
import {
  demoVehiclePresentation,
  formatDemoEuro,
  getDemoCopy,
} from "@/lib/demo/labels";
import {
  SedanSilhouette,
  VanSilhouette,
} from "@/components/demo/vehicle-silhouettes";
import { cn } from "@/lib/utils";

export function DemoVehiclePicker({
  locale,
  categories,
  selected,
  onSelect,
  passengers,
  luggage,
}: {
  locale: string;
  categories: readonly DemoVehicleCategory[];
  selected: DemoVehicleCategory | null;
  onSelect: (category: DemoVehicleCategory) => void;
  passengers: number;
  luggage: number;
}) {
  const copy = getDemoCopy(locale);

  return (
    <fieldset className="space-y-4">
      <legend className="sr-only">{copy.vehicleLegend}</legend>
      <div className="grid gap-4 md:grid-cols-2">
        {categories.map((category) => {
          const presentation = demoVehiclePresentation(category, locale);
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
                "group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border bg-card/50 p-4 transition-[border-color,background-color,box-shadow,transform] duration-200 motion-reduce:transition-none sm:p-5",
                compatible
                  ? "hover:border-primary/50 hover:bg-card/80 hover:-translate-y-0.5"
                  : "cursor-not-allowed opacity-55",
                isSelected && compatible
                  ? "border-primary bg-primary/10 shadow-[0_0_0_1px_oklch(0.82_0.12_85/0.45),0_12px_40px_-20px_oklch(0.82_0.12_85/0.55)]"
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
                    {presentation.title}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {presentation.examples}
                  </p>
                </div>
                {isSelected && compatible ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-primary/50 bg-primary/15 px-2 py-1 text-[10px] font-medium tracking-wide text-primary uppercase">
                    <Check className="size-3" aria-hidden />
                    {copy.selectedBadge}
                  </span>
                ) : null}
              </div>

              <div className="mb-4 overflow-hidden rounded-xl border border-border/40 bg-gradient-to-b from-background/70 to-background/20 px-2 py-5 sm:px-4">
                <Silhouette
                  title={presentation.title}
                  description={
                    category === "SEDAN"
                      ? copy.silhouetteSedanDesc
                      : copy.silhouetteVanDesc
                  }
                  className="mx-auto max-w-[300px] scale-105"
                />
              </div>

              <p id={`${radioId}-desc`} className="text-sm text-muted-foreground">
                {presentation.description}
              </p>

              <ul className="mt-4 grid grid-cols-1 gap-2 text-sm text-foreground/90 sm:grid-cols-2">
                <li className="flex items-center gap-2 rounded-lg border border-border/40 bg-background/30 px-2.5 py-2">
                  <Users className="size-4 shrink-0 text-primary" aria-hidden />
                  <span>{presentation.passengersLabel}</span>
                </li>
                <li className="flex items-center gap-2 rounded-lg border border-border/40 bg-background/30 px-2.5 py-2">
                  <Briefcase
                    className="size-4 shrink-0 text-primary"
                    aria-hidden
                  />
                  <span>{presentation.luggageLabel}</span>
                </li>
              </ul>

              <div
                id={`${radioId}-price`}
                className="mt-5 border-t border-border/50 pt-4"
              >
                <p className="text-xs tracking-wide text-muted-foreground uppercase">
                  {copy.priceTotalLabel}
                </p>
                <p className="mt-1 font-[family-name:var(--font-heading)] text-2xl text-primary">
                  {formatDemoEuro(price.totalCustomerAmountMinor, locale)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {copy.priceDemoLabel} · {copy.priceNotOffer}
                </p>
              </div>

              {!compatible ? (
                <p className="mt-3 text-xs text-amber-100/90" role="status">
                  {copy.incompatibleWith(passengers, luggage)}
                </p>
              ) : null}
            </label>
          );
        })}
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">
        {copy.imageDisclaimer}
      </p>
      <p className="sr-only">{copy.priceDisclaimer}</p>
    </fieldset>
  );
}

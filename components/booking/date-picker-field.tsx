"use client";

import { format, parseISO } from "date-fns";
import { enUS, it } from "date-fns/locale";
import { CalendarDays } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type DatePickerFieldProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  required?: boolean;
  locale?: string;
  placeholder?: string;
  className?: string;
};

function toDate(value: string): Date | undefined {
  if (!value?.trim()) {
    return undefined;
  }
  try {
    const parsed = parseISO(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  } catch {
    return undefined;
  }
}

export function DatePickerField({
  id,
  value,
  onChange,
  min,
  required,
  locale = "it",
  placeholder,
  className,
}: DatePickerFieldProps) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dateLocale = locale === "en" ? enUS : it;
  const selected = useMemo(() => toDate(value), [value]);
  const minDate = useMemo(() => (min ? toDate(min) : new Date()), [min]);

  const calendarLabel = selected
    ? format(selected, "d MMMM yyyy", { locale: dateLocale })
    : placeholder ?? (locale === "en" ? "Pick a date" : "Scegli data");

  function openNativePicker() {
    const el = inputRef.current;
    if (!el) {
      return;
    }
    if (typeof el.showPicker === "function") {
      try {
        el.showPicker();
        return;
      } catch {
        // fallback to custom calendar
      }
    }
    setOpen(true);
  }

  return (
    <div className={cn("flex gap-2", className)}>
      <Input
        ref={inputRef}
        id={id}
        type="date"
        className="h-10 min-w-0 flex-1"
        required={required}
        min={min}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onClick={openNativePicker}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-10 shrink-0"
            aria-label={locale === "en" ? "Open calendar" : "Apri calendario"}
            title={calendarLabel}
            onClick={() => setOpen(true)}
          >
            <CalendarDays className="size-4" aria-hidden />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            locale={dateLocale}
            selected={selected}
            defaultMonth={selected ?? minDate}
            disabled={minDate ? { before: minDate } : undefined}
            onSelect={(date) => {
              if (!date) {
                return;
              }
              onChange(format(date, "yyyy-MM-dd"));
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

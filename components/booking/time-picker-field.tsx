"use client";

import { Clock3 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type TimePickerFieldProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  locale?: string;
  minuteStep?: number;
  className?: string;
};

function parseTime(value: string): { hour: string; minute: string } {
  const match = /^(\d{2}):(\d{2})$/.exec(value.trim());
  if (!match) {
    return { hour: "", minute: "" };
  }
  return { hour: match[1], minute: match[2] };
}

function formatTime(hour: string, minute: string): string {
  if (!hour || !minute) {
    return "";
  }
  return `${hour}:${minute}`;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));

function buildMinutes(step: number): string[] {
  const safeStep = step > 0 && step <= 30 ? step : 15;
  const items: string[] = [];
  for (let m = 0; m < 60; m += safeStep) {
    items.push(m.toString().padStart(2, "0"));
  }
  return items;
}

const selectClassName =
  "h-10 w-full min-w-0 cursor-pointer appearance-none rounded-lg border border-input bg-background px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 [color-scheme:dark]";

export function TimePickerField({
  id,
  value,
  onChange,
  required,
  locale = "it",
  minuteStep = 15,
  className,
}: TimePickerFieldProps) {
  const isEn = locale === "en";
  const minutes = useMemo(() => buildMinutes(minuteStep), [minuteStep]);
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");

  useEffect(() => {
    const parsed = parseTime(value);
    setHour(parsed.hour);
    setMinute(parsed.minute);
  }, [value]);

  function emit(nextHour: string, nextMinute: string) {
    onChange(formatTime(nextHour, nextMinute));
  }

  function onHourChange(nextHour: string) {
    setHour(nextHour);
    if (!nextHour) {
      setMinute("");
      onChange("");
      return;
    }
    const nextMinute = minute || "00";
    if (!minute) {
      setMinute("00");
    }
    emit(nextHour, nextMinute);
  }

  function onMinuteChange(nextMinute: string) {
    setMinute(nextMinute);
    if (!nextMinute) {
      onChange("");
      return;
    }
    if (!hour) {
      return;
    }
    emit(hour, nextMinute);
  }

  const complete = Boolean(hour && minute);

  return (
    <div className={cn("grid gap-2", className)}>
      <input
        tabIndex={-1}
        aria-hidden
        className="sr-only"
        value={value}
        onChange={() => undefined}
        required={required}
      />
      <div className="flex items-center gap-2">
        <div className="grid flex-1 grid-cols-2 gap-2">
          <div className="grid gap-1">
            <Label htmlFor={`${id}-hour`} className="text-[0.7rem] text-muted-foreground">
              {isEn ? "Hour" : "Ora"}
            </Label>
            <select
              id={`${id}-hour`}
              className={selectClassName}
              value={hour}
              onChange={(event) => onHourChange(event.target.value)}
            >
              <option value="">{isEn ? "HH" : "OO"}</option>
              {HOURS.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-1">
            <Label htmlFor={`${id}-minute`} className="text-[0.7rem] text-muted-foreground">
              {isEn ? "Min" : "Min"}
            </Label>
            <select
              id={`${id}-minute`}
              className={selectClassName}
              value={minute}
              onChange={(event) => onMinuteChange(event.target.value)}
            >
              <option value="">{isEn ? "MM" : "MM"}</option>
              {minutes.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div
          className="mt-5 flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/30 text-muted-foreground"
          aria-hidden
        >
          <Clock3 className="size-4" />
        </div>
      </div>
      {complete ? (
        <p className="text-xs text-muted-foreground">
          {isEn ? "Selected time" : "Orario selezionato"}:{" "}
          <span className="text-foreground">{value}</span>
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          {isEn ? "Choose hour and minutes." : "Scegli ora e minuti."}
        </p>
      )}
    </div>
  );
}

import { MapPin, CarFront, Languages, DoorOpen } from "lucide-react";
import { MotionFade } from "@/components/ui/motion-fade";
import type { Messages } from "@/messages/types";

const icons = [MapPin, Languages, CarFront, DoorOpen] as const;

export function DaytripPillarsSection({ dict }: { dict: Messages }) {
  const p = dict.daytripPillars;

  return (
    <section className="border-b border-border/50 bg-muted/20 py-12 md:py-14">
      <div className="mx-auto w-full max-w-6xl px-6 md:px-10">
        <div className="mb-8 max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-primary">
            {p.kicker}
          </p>
          <h2 className="mt-2 font-heading text-2xl font-semibold md:text-3xl">{p.title}</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {p.items.map((item, idx) => {
            const Icon = icons[idx] ?? MapPin;
            return (
              <MotionFade key={item.title} delay={idx * 0.04}>
                <div className="h-full rounded-xl border border-border/70 bg-card/60 p-5">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-border/70 text-primary">
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </MotionFade>
            );
          })}
        </div>
      </div>
    </section>
  );
}

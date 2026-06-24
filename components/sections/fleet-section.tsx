import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MotionFade } from "@/components/ui/motion-fade";
import type { Messages } from "@/messages/types";

type FleetSectionProps = {
  dict: Messages;
};

export function FleetSection({ dict }: FleetSectionProps) {
  const f = dict.fleetSection;

  return (
    <section id="flotta" className="scroll-mt-24 py-16 md:py-20">
      <div className="mx-auto w-full max-w-6xl px-6 md:px-10">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-xl">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-primary">
              {f.kicker}
            </p>
            <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              {f.title}
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground md:text-right">
            {f.intro}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {f.cards.map((item, idx) => (
            <MotionFade key={item.title} delay={idx * 0.06}>
              <Card className="overflow-hidden border-border/70 bg-transparent p-0 gap-0">
                <div className="relative aspect-[16/10] w-full">
                  <Image
                    src={item.image}
                    alt={item.imageAlt}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent"
                    aria-hidden
                  />
                </div>
                <CardHeader className="pb-2">
                  <p className="text-xs font-medium uppercase tracking-wider text-primary">
                    {item.subtitle}
                  </p>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                  <CardDescription>{item.details}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0 pb-5">
                  <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    {item.capacity}
                  </p>
                </CardContent>
              </Card>
            </MotionFade>
          ))}
        </div>
      </div>
    </section>
  );
}

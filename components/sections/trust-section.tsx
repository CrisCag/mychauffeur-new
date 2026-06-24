import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MotionFade } from "@/components/ui/motion-fade";
import type { Messages } from "@/messages/types";
import { Clock, Euro, Languages, ShieldCheck, BriefcaseBusiness, CarFront } from "lucide-react";

const icons = [Clock, Euro, Languages, ShieldCheck, BriefcaseBusiness, CarFront] as const;

type TrustSectionProps = {
  dict: Messages;
};

export function TrustSection({ dict }: TrustSectionProps) {
  const t = dict.trustSection;

  return (
    <section
      id="vantaggi"
      className="scroll-mt-24 border-y border-border/50 py-16 md:py-20"
    >
      <div className="mx-auto w-full max-w-6xl px-6 md:px-10">
        <div className="mb-12 max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-primary">
            {t.kicker}
          </p>
          <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            {t.title}
          </h2>
          <p className="mt-4 text-muted-foreground">{t.subtitle}</p>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {t.items.map((item, idx) => {
            const Icon = icons[idx % icons.length];
            return (
              <MotionFade key={item.title} delay={idx * 0.05}>
                <Card className="border-border/70 bg-transparent">
                  <CardHeader>
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-border/70 text-primary">
                      <Icon className="size-5" aria-hidden />
                    </div>
                    <CardTitle className="mt-2 text-lg">{item.title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      {item.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </MotionFade>
            );
          })}
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MotionFade } from "@/components/ui/motion-fade";
import type { Locale } from "@/lib/i18n-config";
import type { Messages } from "@/messages/types";
import { Plane, Clock, BriefcaseBusiness } from "lucide-react";

const icons = [Plane, Clock, BriefcaseBusiness] as const;

type ServicesSectionProps = {
  locale: Locale;
  dict: Messages;
};

export function ServicesSection({ locale, dict }: ServicesSectionProps) {
  const s = dict.servicesSection;
  const base = `/${locale}`;

  return (
    <section
      id="servizi"
      className="scroll-mt-24 border-t border-border/40 py-16 md:py-20"
    >
      <div className="mx-auto w-full max-w-6xl px-6 md:px-10">
        <div className="mb-12 max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-primary">
            {s.kicker}
          </p>
          <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            {s.title}
          </h2>
          <p className="mt-4 text-muted-foreground">{s.subtitle}</p>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {s.cards.map((card, idx) => {
            const Icon = icons[idx];
            return (
              <MotionFade key={card.title} delay={idx * 0.06}>
                <Card className="border-border/70 bg-transparent">
                  <CardHeader className="pb-2">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-border/70 text-primary">
                      <Icon className="size-5" aria-hidden />
                    </div>
                    <CardTitle className="mt-3 text-lg">{card.title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      {card.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Link
                      href={`${base}/servizi`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      {s.readMore}
                    </Link>
                  </CardContent>
                </Card>
              </MotionFade>
            );
          })}
        </div>
      </div>
    </section>
  );
}

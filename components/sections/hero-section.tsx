import Image from "next/image";
import { BookingWidget } from "@/components/sections/booking-widget";
import { MotionFade } from "@/components/ui/motion-fade";
import { Button } from "@/components/ui/button";
import type { Messages } from "@/messages/types";

const heroImage =
  "https://www.mychauffeur.it/images/my-chauffeur-noleggio-con-conducente.jpg";

type HeroSectionProps = {
  dict: Messages;
};

export function HeroSection({ dict }: HeroSectionProps) {
  const h = dict.hero;

  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={heroImage}
          alt={h.imageAltMan}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>
      <div className="absolute inset-0 bg-black/60" aria-hidden />
      <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-10 px-6 py-16 md:grid-cols-2 md:items-center md:gap-12 md:px-10 md:py-20 lg:py-24">
        <MotionFade>
          <div className="max-w-xl p-2 md:p-4">
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-primary">
              {h.eyebrow}
            </p>
            <h1 className="mt-4 font-heading text-4xl font-semibold leading-[1.08] tracking-tight text-foreground md:text-5xl lg:text-[3.25rem]">
              {h.title}
            </h1>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
              {h.body}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <a href="#prenota">{h.bookNow}</a>
              </Button>
              <Button variant="secondary" size="lg" asChild>
                <a href="#flotta">{h.discoverServices}</a>
              </Button>
            </div>
          </div>
        </MotionFade>
        <MotionFade delay={0.08}>
          <div id="prenota" className="scroll-mt-28 md:scroll-mt-32">
            <BookingWidget dict={dict} />
          </div>
        </MotionFade>
      </div>
    </section>
  );
}

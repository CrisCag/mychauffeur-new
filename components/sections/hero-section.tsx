import Image from "next/image";
import { BookingWidget } from "@/components/sections/booking-widget";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const heroImage =
  "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=2400";

export function HeroSection() {
  return (
    <section className="relative min-h-[min(88vh,920px)] w-full overflow-hidden">
      <Image
        src={heroImage}
        alt="Berlina di lusso in ambiente urbano notturno"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div
        className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/70 md:bg-gradient-to-r md:from-background md:via-background/88 md:to-transparent"
        aria-hidden
      />
      <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-6 py-16 md:grid-cols-2 md:items-center md:gap-12 md:px-10 md:py-20 lg:py-24">
        <div className="max-w-xl">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-primary">
            NCC premium — Italia
          </p>
          <h1 className="mt-4 font-heading text-4xl font-semibold leading-[1.08] tracking-tight text-foreground md:text-5xl lg:text-[3.25rem]">
            Il tuo chauffeur, ovunque tu sia.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
            Transfer aeroportuali, disposizione oraria e viaggi business con
            standard internazionale: puntualità, prezzo fisso e autisti
            multilingua.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <a href="#prenota">Prenota ora</a>
            </Button>
            <Button variant="secondary" size="lg" asChild>
              <Link href="/servizi">Scopri i servizi</Link>
            </Button>
          </div>
        </div>
        <div id="prenota" className="scroll-mt-28 md:scroll-mt-32">
          <BookingWidget />
        </div>
      </div>
    </section>
  );
}

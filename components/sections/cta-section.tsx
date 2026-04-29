import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card to-muted/30 px-8 py-12 md:px-14 md:py-16">
          <div
            className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-primary/15 blur-3xl"
            aria-hidden
          />
          <div className="relative max-w-2xl">
            <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              Pronto per il tuo prossimo transfer?
            </h2>
            <p className="mt-3 text-muted-foreground">
              Prenota in pochi passaggi o richiedi un preventivo personalizzato
              per eventi e disposizioni lunghe.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <a href="#prenota">Inizia dalla prenotazione</a>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/servizi">Vedi tutti i servizi</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

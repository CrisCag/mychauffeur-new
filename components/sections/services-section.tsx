import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plane, Clock, BriefcaseBusiness } from "lucide-react";

const services = [
  {
    title: "Transfer aeroportuali",
    description:
      "Monitoraggio voli, accoglienza in arrivo e pickup puntuale da e per i principali hub italiani.",
    icon: Plane,
  },
  {
    title: "Disposizione oraria",
    description:
      "Autista dedicato per mezza giornata o giornata intera: meeting, shopping, tour e itinerari multi-stop.",
    icon: Clock,
  },
  {
    title: "Viaggi business",
    description:
      "Logistica executive per roadshow, ospiti corporate e spostamenti city-to-city con massima riservatezza.",
    icon: BriefcaseBusiness,
  },
];

export function ServicesSection() {
  return (
    <section id="servizi" className="scroll-mt-24 py-20 md:py-24">
      <div className="mx-auto w-full max-w-6xl px-6 md:px-10">
        <div className="mb-12 max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-primary">
            Servizi
          </p>
          <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Soluzioni su misura per ogni esigenza
          </h2>
          <p className="mt-4 text-muted-foreground">
            Dalla singola corsa alla gestione completa della mobilità premium.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {services.map(({ title, description, icon: Icon }) => (
            <Card
              key={title}
              className="border-border/80 bg-card/80 transition-shadow hover:shadow-lg hover:shadow-primary/5"
            >
              <CardHeader className="pb-2">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-muted/50 text-primary">
                  <Icon className="size-5" aria-hidden />
                </div>
                <CardTitle className="mt-3 text-lg">{title}</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  {description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Link
                  href="/servizi"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Approfondisci →
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clock, Euro, Languages } from "lucide-react";

const items = [
  {
    title: "Puntualità garantita",
    description:
      "Pianificazione meticolosa e buffer intelligenti per arrivare sempre in orario.",
    icon: Clock,
  },
  {
    title: "Prezzo fisso",
    description:
      "Tariffa concordata in anticipo, senza sorprese sul contachilometri o sul traffico.",
    icon: Euro,
  },
  {
    title: "Driver multilingua",
    description:
      "Autisti professionisti con inglese e altre lingue su richiesta, per clienti internazionali.",
    icon: Languages,
  },
];

export function TrustSection() {
  return (
    <section id="vantaggi" className="scroll-mt-24 border-y border-border bg-muted/20 py-20 md:py-24">
      <div className="mx-auto w-full max-w-6xl px-6 md:px-10">
        <div className="mb-12 max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-primary">
            Perché MyChauffeur
          </p>
          <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Standard da leader globali, radici italiane
          </h2>
          <p className="mt-4 text-muted-foreground">
            Trasparenza, comfort e professionalità in ogni movimento.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {items.map(({ title, description, icon: Icon }) => (
            <Card
              key={title}
              className="border-border/80 bg-card/60 backdrop-blur-sm"
            >
              <CardHeader>
                <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-background/80 text-primary">
                  <Icon className="size-5" aria-hidden />
                </div>
                <CardTitle className="mt-2 text-lg">{title}</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  {description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

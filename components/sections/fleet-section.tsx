import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const fleet = [
  {
    title: "Business Class",
    subtitle: "Berlina executive",
    details: "Mercedes E-Class o equivalente",
    capacity: "Fino a 3 passeggeri",
    image:
      "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&q=80&w=900",
    alt: "Berlina nera elegante su strada",
  },
  {
    title: "Luxury Sedan",
    subtitle: "Prima classe su strada",
    details: "Mercedes S-Class o equivalente",
    capacity: "Massimo comfort e privacy",
    image:
      "https://images.unsplash.com/photo-1617814076367-b759c7d7a738?auto=format&fit=crop&q=80&w=900",
    alt: "Berlina di lusso scura",
  },
  {
    title: "Minivan",
    subtitle: "Gruppi e bagagli",
    details: "Mercedes Classe V o equivalente",
    capacity: "Fino a 7 passeggeri",
    image:
      "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&q=80&w=900",
    alt: "Minivan premium su strada",
  },
];

export function FleetSection() {
  return (
    <section id="flotta" className="scroll-mt-24 py-20 md:py-24">
      <div className="mx-auto w-full max-w-6xl px-6 md:px-10">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-xl">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-primary">
              Flotta
            </p>
            <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              Veicoli selezionati, standard costante
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground md:text-right">
            Classi chiare come sui migliori portali globali: sapete sempre cosa
            prenotate, con interni in pelle e dotazioni premium.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {fleet.map((item) => (
            <Card
              key={item.title}
              className="overflow-hidden border-border/80 bg-card/80 p-0 gap-0"
            >
              <div className="relative aspect-[16/10] w-full">
                <Image
                  src={item.image}
                  alt={item.alt}
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
          ))}
        </div>
      </div>
    </section>
  );
}

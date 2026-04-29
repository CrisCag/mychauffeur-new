import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

const services = [
  {
    title: "Transfer aeroportuali",
    description:
      "Pickup e dropoff con monitoraggio voli, accoglienza in arrivo e coordinamento con terminal e VIP lounge.",
  },
  {
    title: "Disposizione oraria",
    description:
      "Autista dedicato per meeting, shopping, tour o più tappe nella stessa giornata, con flessibilità sugli orari.",
  },
  {
    title: "Viaggi business",
    description:
      "City-to-city, roadshow e trasporto ospiti corporate con standard elevati di puntualità e riservatezza.",
  },
  {
    title: "Eventi e shuttle",
    description:
      "Logistica per congressi, matrimoni e concerti: coordinamento flotte e shuttle su misura.",
  },
];

export default function ServiziPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen flex-1 bg-background text-foreground">
        <section className="mx-auto w-full max-w-6xl px-6 py-16 md:px-10 md:py-20">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-primary">
            Servizi NCC
          </p>
          <h1 className="mt-3 font-heading text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            Mobilità premium, costruita sulle tue esigenze
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Transfer, disposizione e viaggi business con la stessa qualità che
            trovi in home: flotta Mercedes, prezzi chiari e autisti
            multilingua.
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {services.map((service) => (
              <Card
                key={service.title}
                className="border-border/80 bg-card/80"
              >
                <CardHeader>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {service.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
          <div className="mt-12 flex flex-wrap gap-4">
            <Button asChild>
              <Link href="/#prenota">Torna alla prenotazione</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Home</Link>
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

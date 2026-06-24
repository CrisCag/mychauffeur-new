import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDictionary } from "@/lib/get-dictionary";
import { isLocale, type Locale } from "@/lib/i18n-config";
import { notFound } from "next/navigation";

export default async function ServiziPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: l } = await params;
  if (!isLocale(l)) notFound();
  const locale = l as Locale;
  const dict = getDictionary(locale);
  const p = dict.serviziPage;
  const base = `/${locale}`;

  return (
    <main className="min-h-screen flex-1 bg-background text-foreground">
      <section className="mx-auto w-full max-w-6xl px-6 py-16 md:px-10 md:py-20">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-primary">
          {p.kicker}
        </p>
        <h1 className="mt-3 font-heading text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
          {p.title}
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          {p.intro}
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {p.cards.map((service) => (
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
            <Link href={`${base}#prenota`}>{p.backBook}</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={base}>{p.home}</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}

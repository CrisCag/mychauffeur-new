import { CtaSection } from "@/components/sections/cta-section";
import { FleetSection } from "@/components/sections/fleet-section";
import { HeroSection } from "@/components/sections/hero-section";
import { HubsSection } from "@/components/sections/hubs-section";
import { ServicesSection } from "@/components/sections/services-section";
import { TrustSection } from "@/components/sections/trust-section";
import { getDictionary } from "@/lib/get-dictionary";
import { isLocale, type Locale } from "@/lib/i18n-config";
import { notFound } from "next/navigation";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: l } = await params;
  if (!isLocale(l)) notFound();
  const locale = l as Locale;
  const dict = getDictionary(locale);
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "MyChauffeur",
    telephone: "+39 338 153 4398",
    email: "info@mychauffeur.it",
    url: "https://mychauffeur.it",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Via Cascia, 8",
      addressLocality: "Spoleto",
      postalCode: "06049",
      addressRegion: "PG",
      addressCountry: "IT",
    },
    areaServed: "Italy",
    sameAs: [
      "https://www.instagram.com/mychauffeur.it",
      "https://www.facebook.com/Mychauffeur.it",
    ],
  };

  return (
    <main className="min-h-screen flex-1 bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <HeroSection dict={dict} />
      <ServicesSection locale={locale} dict={dict} />
      <HubsSection dict={dict} />
      <FleetSection dict={dict} />
      <TrustSection dict={dict} />
      <CtaSection locale={locale} dict={dict} />
    </main>
  );
}

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { CtaSection } from "@/components/sections/cta-section";
import { FleetSection } from "@/components/sections/fleet-section";
import { HeroSection } from "@/components/sections/hero-section";
import { ServicesSection } from "@/components/sections/services-section";
import { TrustSection } from "@/components/sections/trust-section";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen flex-1 bg-background text-foreground">
        <HeroSection />
        <ServicesSection />
        <FleetSection />
        <TrustSection />
        <CtaSection />
      </main>
      <SiteFooter />
    </>
  );
}

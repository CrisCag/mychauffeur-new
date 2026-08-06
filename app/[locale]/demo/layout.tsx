import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isDemoEnvironmentAllowed } from "@/lib/demo";
import { DemoBanner } from "@/components/demo/demo-banner";
import { DemoSubheader } from "@/components/demo/demo-subheader";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default async function DemoLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  if (!isDemoEnvironmentAllowed()) {
    notFound();
  }

  const { locale } = await params;

  return (
    <div className="min-h-[70vh] bg-[radial-gradient(ellipse_at_top,oklch(0.22_0.02_265)_0%,transparent_55%)]">
      <DemoBanner />
      <DemoSubheader locale={locale} />
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </div>
    </div>
  );
}

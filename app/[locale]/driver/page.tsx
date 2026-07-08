import { DriverTripsListClient } from "@/components/driver/driver-trips-list";
import { isLocale, type Locale } from "@/lib/i18n-config";
import { notFound } from "next/navigation";

export default async function DriverPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: l } = await params;
  if (!isLocale(l)) notFound();
  const locale = l as Locale;

  return (
    <main className="min-h-[70vh] bg-background">
      <DriverTripsListClient locale={locale} />
    </main>
  );
}

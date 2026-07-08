import { DriverTripDetailClient } from "@/components/driver/driver-trip-detail";
import { isLocale, type Locale } from "@/lib/i18n-config";
import { notFound } from "next/navigation";

export default async function DriverTripPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: l, id } = await params;
  if (!isLocale(l)) notFound();
  const locale = l as Locale;

  return (
    <main className="min-h-[70vh] bg-background">
      <DriverTripDetailClient tripId={id} locale={locale} />
    </main>
  );
}

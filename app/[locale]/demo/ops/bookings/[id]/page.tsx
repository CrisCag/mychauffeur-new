import { notFound } from "next/navigation";
import { isDemoEnvironmentAllowed } from "@/lib/demo";
import { isLocale } from "@/lib/i18n-config";
import { DemoOpsDetailClient } from "@/components/demo/demo-ops-detail-client";

export default async function DemoOpsBookingDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  if (!isDemoEnvironmentAllowed()) {
    notFound();
  }
  const { locale, id } = await params;
  if (!isLocale(locale) || !id?.trim()) {
    notFound();
  }
  return <DemoOpsDetailClient locale={locale} bookingId={id} />;
}

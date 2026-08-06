import { notFound } from "next/navigation";
import { isDemoEnvironmentAllowed } from "@/lib/demo";
import { isLocale } from "@/lib/i18n-config";
import { DemoOpsClient } from "@/components/demo/demo-ops-client";

export default async function DemoOpsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  if (!isDemoEnvironmentAllowed()) {
    notFound();
  }
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }
  return <DemoOpsClient locale={locale} />;
}

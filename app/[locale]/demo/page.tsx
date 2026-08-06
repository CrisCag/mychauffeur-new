import { notFound } from "next/navigation";
import { isDemoEnvironmentAllowed } from "@/lib/demo";
import { isLocale } from "@/lib/i18n-config";
import { DemoFlowClient } from "@/components/demo/demo-flow-client";

export default async function DemoPage({
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

  return <DemoFlowClient locale={locale} />;
}

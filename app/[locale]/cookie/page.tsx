import { LegalDocument } from "@/components/gdpr/legal-document";
import { getDictionary } from "@/lib/get-dictionary";
import { isLocale, type Locale } from "@/lib/i18n-config";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return [{ locale: "it" }, { locale: "en" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: l } = await params;
  if (!isLocale(l)) return {};
  const dict = getDictionary(l);
  return {
    title: dict.legalPage.cookie.metaTitle,
    description: dict.meta.description,
  };
}

export default async function CookiePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: l } = await params;
  if (!isLocale(l)) notFound();
  const locale = l as Locale;
  const dict = getDictionary(locale);
  const p = dict.legalPage.cookie;

  return (
    <LegalDocument
      locale={locale}
      title={p.title}
      updated={p.updated}
      sections={p.sections}
      backLabel={dict.legalPage.backHome}
    />
  );
}

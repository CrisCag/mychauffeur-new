import { BookFlowClient } from "@/components/booking/book-flow-client";
import { getDictionary } from "@/lib/get-dictionary";
import { isLocale, type Locale } from "@/lib/i18n-config";
import { notFound } from "next/navigation";

export default async function BookPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: l } = await params;
  if (!isLocale(l)) notFound();
  const locale = l as Locale;
  const dict = getDictionary(locale);

  return <BookFlowClient locale={locale} dict={dict} />;
}

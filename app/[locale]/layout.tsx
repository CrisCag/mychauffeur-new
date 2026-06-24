import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { WhatsAppFloatingButton } from "@/components/contact/whatsapp-floating-button";
import { CookieConsentRoot } from "@/components/gdpr/cookie-consent-root";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SetHtmlLang } from "@/components/set-html-lang";
import { getDictionary } from "@/lib/get-dictionary";
import { isLocale, type Locale } from "@/lib/i18n-config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: l } = await params;
  if (!isLocale(l)) return {};
  const dict = getDictionary(l);
  const keywords =
    l === "it"
      ? [
          "NCC Spoleto",
          "NCC Umbria",
          "transfer Spoleto",
          "transfer Fiumicino Spoleto",
          "transfer Ciampino Spoleto",
          "transfer aeroporto Umbria",
          "noleggio con conducente Perugia",
          "chauffeur Centro Italia",
          "tours Umbria",
          "day trips Umbria",
          "shopping center Umbria",
          "outlet Umbria",
          "servizi VIP Umbria",
          "servizi ambasciate NCC",
          "transfer privati Italia",
        ]
      : [
          "chauffeur service Spoleto",
          "chauffeur service Umbria",
          "airport transfer Umbria",
          "Fiumicino transfer service",
          "Ciampino transfer service",
          "private transfer Central Italy",
          "Umbria tours",
          "Umbria day trips",
          "shopping centers Umbria",
          "outlets Umbria",
          "VIP chauffeur Italy",
          "embassy chauffeur service",
          "NCC Perugia area",
          "Italy chauffeur service",
        ];
  return {
    metadataBase: new URL("https://www.mychauffeur.it"),
    title: dict.meta.title,
    description: dict.meta.description,
    keywords,
    openGraph: {
      title: dict.meta.title,
      description: dict.meta.description,
      url: `https://www.mychauffeur.it/${l}`,
      siteName: "MyChauffeur",
      locale: l === "it" ? "it_IT" : "en_US",
      type: "website",
      images: [
        {
          url: "/branding/logo-icon.png",
          width: 1200,
          height: 1200,
          alt: "MyChauffeur logo",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.title,
      description: dict.meta.description,
      images: ["/branding/logo-icon.png"],
    },
    icons: {
      icon: "/branding/logo-icon.png",
      apple: "/branding/logo-icon.png",
    },
    alternates: {
      canonical: `/${l}`,
      languages: { it: "/it", en: "/en" },
    },
  };
}

export function generateStaticParams() {
  return [{ locale: "it" }, { locale: "en" }];
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale: l } = await params;
  if (!isLocale(l)) notFound();
  const locale = l as Locale;
  const dict = getDictionary(locale);

  return (
    <NextIntlClientProvider locale={locale} messages={dict as never}>
      <CookieConsentRoot locale={locale} dict={dict}>
        <SetHtmlLang locale={locale} />
        <SiteHeader locale={locale} dict={dict} />
        {children}
        <SiteFooter locale={locale} dict={dict} />
        <WhatsAppFloatingButton />
      </CookieConsentRoot>
    </NextIntlClientProvider>
  );
}

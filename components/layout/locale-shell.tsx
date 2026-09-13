"use client";

import { usePathname } from "next/navigation";
import { WhatsAppFloatingButton } from "@/components/contact/whatsapp-floating-button";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import type { Locale } from "@/lib/i18n-config";
import type { Messages } from "@/messages/types";

/**
 * Marketing chrome for locale pages. Hidden on Founder Demo routes so
 * `/[locale]/demo/**` stays immersive (brand + DEMO banner only).
 */
export function LocaleShell({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: Messages;
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";
  // Match `/it/demo`, `/en/demo/...`, and bare `/demo` if the locale segment is ever omitted.
  const isDemoRoute = /(?:^|\/)(?:(?:it|en)\/)?demo(?:\/|$)/.test(pathname);

  if (isDemoRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <SiteHeader locale={locale} dict={dict} />
      {children}
      <SiteFooter locale={locale} dict={dict} />
      <WhatsAppFloatingButton />
    </>
  );
}

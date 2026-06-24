"use client";

import type { Locale } from "@/lib/i18n-config";
import type { Messages } from "@/messages/types";
import { CookieConsentBanner } from "./cookie-consent-banner";
import { CookieConsentProvider } from "./cookie-consent-context";

export function CookieConsentRoot({
  children,
  locale,
  dict,
}: {
  children: React.ReactNode;
  locale: Locale;
  dict: Messages;
}) {
  return (
    <CookieConsentProvider>
      {children}
      <CookieConsentBanner locale={locale} dict={dict} />
    </CookieConsentProvider>
  );
}

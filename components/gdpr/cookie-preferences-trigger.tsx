"use client";

import { useCookieConsent } from "@/components/gdpr/cookie-consent-context";

export function CookiePreferencesTrigger({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { openPreferences } = useCookieConsent();
  return (
    <button type="button" className={className} onClick={openPreferences}>
      {children}
    </button>
  );
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  COOKIE_CONSENT_STORAGE_KEY,
  parseConsent,
  type CookieConsentValue,
} from "@/lib/cookie-consent";

export type CookieConsentContextValue = {
  /** true dopo lettura `localStorage` lato client */
  ready: boolean;
  consent: CookieConsentValue | null;
  setConsent: (value: CookieConsentValue) => void;
  openPreferences: () => void;
  closePreferences: () => void;
  preferencesOpen: boolean;
};

const CookieConsentContext = createContext<CookieConsentContextValue | null>(
  null
);

export function CookieConsentProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [consent, setConsentState] = useState<CookieConsentValue | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      return parseConsent(localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY));
    } catch {
      return null;
    }
  });
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const ready = typeof window !== "undefined";

  const setConsent = useCallback((value: CookieConsentValue) => {
    try {
      localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, value);
    } catch {
      /* ignore */
    }
    setConsentState(value);
    setPreferencesOpen(false);
    window.dispatchEvent(new Event("cookie-consent-change"));
  }, []);

  const openPreferences = useCallback(() => setPreferencesOpen(true), []);
  const closePreferences = useCallback(() => setPreferencesOpen(false), []);

  const value = useMemo(
    () => ({
      ready,
      consent,
      setConsent,
      openPreferences,
      closePreferences,
      preferencesOpen,
    }),
    [
      ready,
      consent,
      setConsent,
      openPreferences,
      closePreferences,
      preferencesOpen,
    ]
  );

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) {
    throw new Error("useCookieConsent must be used within CookieConsentProvider");
  }
  return ctx;
}

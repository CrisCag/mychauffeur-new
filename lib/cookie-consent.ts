/** Valore salvato in `localStorage` dopo scelta utente (GDPR / ePrivacy). */
export type CookieConsentValue = "all" | "essential";

export const COOKIE_CONSENT_STORAGE_KEY = "mychauffeur-cookie-consent";

export function parseConsent(raw: string | null): CookieConsentValue | null {
  if (raw === "all" || raw === "essential") return raw;
  return null;
}

export function canLoadThirdPartyMaps(consent: CookieConsentValue | null) {
  return consent === "all";
}

export const locales = ["it", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "it";

export function isLocale(s: string): s is Locale {
  return locales.includes(s as Locale);
}

export const localeNames: Record<Locale, string> = {
  it: "Italiano",
  en: "English",
};

/** Bandiere emoji (accessibili con `aria-label` sul link) */
export const localeFlags: Record<Locale, string> = {
  it: "🇮🇹",
  en: "🇬🇧",
};

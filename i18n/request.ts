import { getRequestConfig } from "next-intl/server";
import { getDictionary } from "@/lib/get-dictionary";
import { defaultLocale, isLocale } from "@/lib/i18n-config";

export default getRequestConfig(async ({ requestLocale }) => {
  const localeCandidate = await requestLocale;
  const locale =
    localeCandidate && isLocale(localeCandidate) ? localeCandidate : defaultLocale;

  return {
    locale,
    messages: getDictionary(locale),
  };
});

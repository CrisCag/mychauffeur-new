import type { Locale } from "@/lib/i18n-config";
import { en } from "@/messages/en";
import { it } from "@/messages/it";
import type { Messages } from "@/messages/types";

const dictionaries: Record<Locale, Messages> = {
  it,
  en,
};

export function getDictionary(locale: Locale): Messages {
  return dictionaries[locale] ?? it;
}

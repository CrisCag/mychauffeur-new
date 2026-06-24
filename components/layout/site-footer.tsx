import Link from "next/link";
import { ContactLinks } from "@/components/contact/contact-links";
import { CookiePreferencesTrigger } from "@/components/gdpr/cookie-preferences-trigger";
import type { Locale } from "@/lib/i18n-config";
import type { Messages } from "@/messages/types";

type SiteFooterProps = {
  locale: Locale;
  dict: Messages;
};

export function SiteFooter({ locale, dict }: SiteFooterProps) {
  const base = `/${locale}`;
  const f = dict.footer;

  return (
    <footer className="border-t border-amber-900/30 bg-black text-zinc-300">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-14 md:grid-cols-3 md:px-10">
        <div className="md:pr-4">
          <p className="font-heading text-2xl font-bold tracking-wide text-amber-300 md:text-3xl">
            MyChauffeur.it
          </p>
          <p className="mt-2 font-heading text-sm font-medium text-zinc-100 md:text-base">
            Transfer privati e NCC di lusso in Italia da oltre 20 anni.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400 md:text-[0.95rem]">
            Servizio door-to-door
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-400">
            {f.usefulLinks}
          </p>
          <ul className="mt-4 space-y-2 text-sm text-zinc-300">
            <li>
              <Link href={`${base}/servizi`} className="hover:text-zinc-100">
                {f.linkServices}
              </Link>
            </li>
            <li>
              <a href={`${base}/#flotta`} className="hover:text-zinc-100">
                {f.linkFleet}
              </a>
            </li>
            <li>
              <Link href={`${base}/privacy`} className="hover:text-zinc-100">
                {f.linkPrivacy}
              </Link>
            </li>
            <li>
              <Link href={`${base}/cookie`} className="hover:text-zinc-100">
                {f.linkCookies}
              </Link>
            </li>
            <li>
              <CookiePreferencesTrigger className="text-left text-sm text-zinc-300 underline-offset-2 hover:text-zinc-100 hover:underline">
                {f.cookiePreferences}
              </CookiePreferencesTrigger>
            </li>
            <li>
              <a
                href="tel:+393381534398"
                className="hover:text-zinc-100"
              >
                {f.linkContacts}
              </a>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-400">
            {f.contactsTitle}
          </p>
          <ContactLinks className="mt-4" />
        </div>
      </div>
      <div className="border-t border-zinc-800 py-4 text-center text-xs text-zinc-500">
        © 2026 {f.copyright}
      </div>
    </footer>
  );
}

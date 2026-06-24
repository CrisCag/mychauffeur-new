"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Locale } from "@/lib/i18n-config";
import type { Messages } from "@/messages/types";
import { useCookieConsent } from "./cookie-consent-context";

type CookieConsentBannerProps = {
  locale: Locale;
  dict: Messages;
};

export function CookieConsentBanner({ locale, dict }: CookieConsentBannerProps) {
  const c = dict.cookieBanner;
  const base = `/${locale}`;
  const {
    ready,
    consent,
    setConsent,
    preferencesOpen,
    closePreferences,
  } = useCookieConsent();

  const showBar = ready && consent === null;
  const showModal = ready && preferencesOpen;

  if (!showBar && !showModal) return null;

  const panel = (
    <Card className="border-border/90 bg-card/98 shadow-2xl shadow-black/50 backdrop-blur-md">
      <CardHeader className="pb-3">
        <CardTitle id="cookie-consent-title" className="text-lg md:text-xl">
          {c.title}
        </CardTitle>
        <CardDescription className="text-sm leading-relaxed md:text-base">
          {c.body}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2 pb-3 pt-0">
        <Button type="button" onClick={() => setConsent("all")}>
          {c.acceptAll}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => setConsent("essential")}
        >
          {c.essentialOnly}
        </Button>
        <Button type="button" variant="outline" size="sm" asChild>
          <Link href={`${base}/privacy`} onClick={closePreferences}>
            {c.privacyLink}
          </Link>
        </Button>
        <Button type="button" variant="ghost" size="sm" asChild>
          <Link href={`${base}/cookie`} onClick={closePreferences}>
            {c.cookiePolicyLink}
          </Link>
        </Button>
      </CardContent>
      <CardFooter className="flex flex-wrap justify-between gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
        <span>{c.legalNote}</span>
        {showModal ? (
          <Button type="button" variant="ghost" size="sm" onClick={closePreferences}>
            {c.close}
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  );

  return (
    <>
      {showBar ? (
        <div
          className="fixed inset-x-0 bottom-0 z-[100] p-4 md:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-consent-title"
        >
          <div className="mx-auto max-w-3xl">
            {panel}
          </div>
        </div>
      ) : null}
      {showModal ? (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-background/80 p-4 backdrop-blur-sm md:items-center"
          role="dialog"
          aria-modal="true"
          aria-label={c.manageTitle}
          onClick={closePreferences}
        >
          <div
            className="relative w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute -right-1 -top-10 rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground md:-right-2 md:-top-12"
              onClick={closePreferences}
            >
              {c.close}
            </button>
            {panel}
          </div>
        </div>
      ) : null}
    </>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n-config";
import { cn } from "@/lib/utils";
import type { Messages } from "@/messages/types";

type SiteHeaderProps = {
  locale: Locale;
  dict: Messages;
  className?: string;
};

export function SiteHeader({ locale, dict, className }: SiteHeaderProps) {
  const base = `/${locale}`;
  const [mobileOpen, setMobileOpen] = useState(false);
  const nav = [
    { href: `${base}/#servizi`, label: dict.nav.services },
    { href: `${base}/#flotta`, label: dict.nav.fleet },
    { href: `${base}/#vantaggi`, label: dict.nav.benefits },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-border/70 bg-background/95",
        className
      )}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 md:gap-4 md:px-10">
        <Link href={base} className="flex shrink-0 items-center">
          <Image
            src="/branding/logo-horizontal.png"
            alt="MyChauffeur"
            width={168}
            height={36}
            className="h-7 w-auto max-w-[130px] opacity-95 sm:h-8 sm:max-w-none"
            priority
          />
          <span className="sr-only">MyChauffeur</span>
        </Link>
        <nav className="hidden flex-1 items-center justify-center gap-8 text-sm text-muted-foreground md:flex">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
          <Link
            href={`${base}/servizi`}
            className="transition-colors hover:text-foreground"
          >
            {dict.nav.servicesDetail}
          </Link>
        </nav>
        <div className="hidden shrink-0 items-center gap-2 sm:gap-3 md:flex">
          <LocaleSwitcher currentLocale={locale} dict={dict} />
          <Button size="sm" className="shrink-0 text-xs sm:text-sm" asChild>
            <a href={`${base}/#prenota`}>{dict.nav.book}</a>
          </Button>
        </div>
        <div className="flex items-center gap-2 md:hidden">
          <LocaleSwitcher currentLocale={locale} dict={dict} />
          <Button
            variant="outline"
            size="icon-sm"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </Button>
        </div>
      </div>
      {mobileOpen ? (
        <div className="border-t border-border/70 bg-background/95 px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3 text-sm text-muted-foreground">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-md px-2 py-2 transition-colors hover:bg-muted hover:text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <Link
              href={`${base}/servizi`}
              className="rounded-md px-2 py-2 transition-colors hover:bg-muted hover:text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              {dict.nav.servicesDetail}
            </Link>
            <Button size="sm" className="mt-1 w-full" asChild>
              <a href={`${base}/#prenota`} onClick={() => setMobileOpen(false)}>
                {dict.nav.book}
              </a>
            </Button>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

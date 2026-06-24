"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  defaultLocale,
  isLocale,
  localeFlags,
  type Locale,
  locales,
} from "@/lib/i18n-config";
import type { Messages } from "@/messages/types";

type LocaleSwitcherProps = {
  currentLocale: Locale;
  dict: Messages;
};

function pathForLocale(pathname: string, target: Locale): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return `/${target}`;
  if (isLocale(segments[0])) {
    segments[0] = target;
    return "/" + segments.join("/");
  }
  return `/${target}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

export function LocaleSwitcher({ currentLocale, dict }: LocaleSwitcherProps) {
  const pathname = usePathname() || `/${defaultLocale}`;

  return (
    <div
      className="flex items-center rounded-lg border border-border bg-muted/40 p-0.5"
      role="navigation"
      aria-label={dict.langSwitcher.aria}
    >
      {locales.map((loc) => {
        const href = pathForLocale(pathname, loc);
        const active = loc === currentLocale;
        return (
          <Link
            key={loc}
            href={href}
            hrefLang={loc}
            className={cn(
              "flex min-h-9 min-w-9 items-center justify-center rounded-md text-lg transition-colors",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
            )}
            aria-current={active ? "true" : undefined}
            aria-label={loc === "it" ? "Italiano" : "English"}
            title={loc === "it" ? "Italiano" : "English"}
          >
            <span aria-hidden>{localeFlags[loc]}</span>
          </Link>
        );
      })}
    </div>
  );
}

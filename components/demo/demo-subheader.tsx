"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function DemoSubheader({ locale }: { locale: string }) {
  const pathname = usePathname() ?? "";
  const opsActive = pathname.includes("/demo/ops");

  return (
    <div className="border-b border-border/50 bg-background/80">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href={`/${locale}/demo`}
            className="flex shrink-0 items-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Image
              src="/branding/logo-horizontal.png"
              alt="MyChauffeur"
              width={148}
              height={32}
              className="h-6 w-auto opacity-95 sm:h-7"
              priority
            />
          </Link>
          <span className="hidden h-5 w-px bg-border/70 sm:block" aria-hidden />
          <p className="truncate text-[11px] font-medium tracking-[0.18em] text-primary uppercase sm:text-xs">
            Founder Demo
          </p>
        </div>
        <Link
          href={opsActive ? `/${locale}/demo` : `/${locale}/demo/ops`}
          className="shrink-0 text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {opsActive ? "Nuovo transfer" : "Pannello operativo"}
        </Link>
      </div>
    </div>
  );
}

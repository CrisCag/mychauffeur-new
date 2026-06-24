import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n-config";

type Section = { heading: string; body: string };

export function LegalDocument({
  locale,
  title,
  updated,
  sections,
  backLabel,
}: {
  locale: Locale;
  title: string;
  updated: string;
  sections: Section[];
  backLabel: string;
}) {
  const base = `/${locale}`;

  return (
    <main className="min-h-screen flex-1 bg-background px-6 py-16 text-foreground md:px-10 md:py-20">
      <div className="mx-auto max-w-3xl">
        <Button variant="outline" size="sm" className="mb-8" asChild>
          <Link href={base}>{backLabel}</Link>
        </Button>
        <p className="text-xs font-medium uppercase tracking-widest text-primary">
          {updated}
        </p>
        <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight md:text-4xl">
          {title}
        </h1>
        <div className="mt-10 space-y-10 text-sm leading-relaxed text-muted-foreground md:text-base">
          {sections.map((s) => (
            <section key={s.heading}>
              <h2 className="font-heading text-lg font-semibold text-foreground">
                {s.heading}
              </h2>
              <p className="mt-3 whitespace-pre-line">{s.body}</p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}

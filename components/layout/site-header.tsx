import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SiteHeaderProps = {
  className?: string;
};

const nav = [
  { href: "#servizi", label: "Servizi" },
  { href: "#flotta", label: "Flotta" },
  { href: "#vantaggi", label: "Vantaggi" },
];

export function SiteHeader({ className }: SiteHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-border/80 bg-background/85 backdrop-blur-md",
        className
      )}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-3 md:px-10">
        <Link
          href="/"
          className="font-heading text-lg font-semibold tracking-[0.18em] text-foreground"
        >
          MY<span className="text-primary">CHAUFFEUR</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
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
            href="/servizi"
            className="transition-colors hover:text-foreground"
          >
            Dettaglio servizi
          </Link>
        </nav>
        <Button size="sm" className="shrink-0" asChild>
          <a href="#prenota">Prenota</a>
        </Button>
      </div>
    </header>
  );
}

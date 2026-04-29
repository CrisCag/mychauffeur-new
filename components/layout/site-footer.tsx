import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card/40">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-14 md:grid-cols-3 md:px-10">
        <div>
          <p className="font-heading text-sm font-semibold tracking-wide text-foreground">
            MyChauffeur
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            NCC di lusso in tutta Italia, con possibilità di estensione
            transfrontaliera su richiesta. Oltre vent&apos;anni di esperienza nel
            noleggio con conducente.
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Link utili
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/servizi" className="hover:text-foreground">
                Servizi
              </Link>
            </li>
            <li>
              <a href="#flotta" className="hover:text-foreground">
                Flotta
              </a>
            </li>
            <li>
              <a
                href="https://www.mychauffeur.it/it/contatti"
                className="hover:text-foreground"
                target="_blank"
                rel="noreferrer"
              >
                Contatti
              </a>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Contatti
          </p>
          <address className="mt-4 not-italic text-sm leading-relaxed text-muted-foreground">
            Via Cascia, 8 — 06049 Spoleto (PG)
            <br />
            <a
              href="tel:+393381534398"
              className="mt-2 inline-block text-foreground hover:underline"
            >
              +39 338 153 4398
            </a>
            <br />
            <span className="text-xs text-muted-foreground">
              Disponibilità 24/7
            </span>
          </address>
        </div>
      </div>
      <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} MyChauffeur.it — Servizio NCC premium.
      </div>
    </footer>
  );
}

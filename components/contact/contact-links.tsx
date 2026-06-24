import { CONTACT_DETAILS } from "@/lib/contact-details";

type ContactLinksProps = {
  className?: string;
};

export function ContactLinks({ className }: ContactLinksProps) {
  return (
    <address className={`not-italic ${className ?? ""}`}>
      <ul className="space-y-1.5 text-sm leading-relaxed text-zinc-300">
        <li>
          <span className="mr-2 text-amber-400">{">"}</span>
          <a href={CONTACT_DETAILS.phoneHref} className="text-zinc-100 hover:underline">
            {CONTACT_DETAILS.phoneDisplay}
          </a>
        </li>
        <li>
          <span className="mr-2 text-amber-400">{">"}</span>
          <a
            href={CONTACT_DETAILS.whatsappHref}
            className="text-zinc-100 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            {CONTACT_DETAILS.whatsappDisplay}
          </a>
        </li>
        <li>
          <span className="mr-2 text-amber-400">{">"}</span>
          <a
            href={`mailto:${CONTACT_DETAILS.infoEmail}`}
            className="text-zinc-100 hover:underline"
          >
            Per info e prenotazioni: {CONTACT_DETAILS.infoEmail}
          </a>
        </li>
        <li>
          <span className="mr-2 text-amber-400">{">"}</span>
          <a
            href={`mailto:${CONTACT_DETAILS.partnersEmail}`}
            className="text-zinc-100 hover:underline"
          >
            Per partnership, agenzie di viaggio e accordi (B2B): {CONTACT_DETAILS.partnersEmail}
          </a>
        </li>
        <li>
          <span className="mr-2 text-amber-400">{">"}</span>
          <a
            href={`mailto:${CONTACT_DETAILS.officeEmail}`}
            className="text-zinc-100 hover:underline"
          >
            Per amministrazione: {CONTACT_DETAILS.officeEmail}
          </a>
        </li>
        <li>
          <span className="mr-2 text-amber-400">{">"}</span>
          <a
            href={CONTACT_DETAILS.googleReviewsHref}
            className="text-zinc-100 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            Google reviews
          </a>
        </li>
        <li>
          <span className="mr-2 text-amber-400">{">"}</span>
          <a
            href={CONTACT_DETAILS.instagramHref}
            className="text-zinc-100 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            Instagram @mychauffeur.it
          </a>
        </li>
        <li>
          <span className="mr-2 text-amber-400">{">"}</span>
          <a
            href={CONTACT_DETAILS.facebookHref}
            className="text-zinc-100 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            Facebook MyChauffeur.it
          </a>
        </li>
        <li className="pt-1 text-xs text-zinc-400">{CONTACT_DETAILS.availabilityLabel}</li>
      </ul>
    </address>
  );
}

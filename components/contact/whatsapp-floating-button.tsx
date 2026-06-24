import { MessageCircleMore } from "lucide-react";

export function WhatsAppFloatingButton() {
  return (
    <a
      href="https://wa.me/393381534398?text=Ciao%20MyChauffeur..."
      target="_blank"
      rel="noreferrer"
      aria-label="Contattaci su WhatsApp"
      className="fixed bottom-4 right-4 z-[90] inline-flex h-10 items-center gap-2 rounded-full bg-[#25D366] px-3 text-xs font-medium text-black shadow-md shadow-black/30 transition hover:brightness-95 sm:bottom-5 sm:right-5 sm:h-11 sm:px-4 sm:text-sm"
    >
      <MessageCircleMore className="size-4" aria-hidden />
      Scrivi su WhatsApp
    </a>
  );
}

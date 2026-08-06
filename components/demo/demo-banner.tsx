export function DemoBanner() {
  return (
    <div
      role="status"
      className="border-b border-primary/35 bg-primary/10 px-4 py-3 text-center"
    >
      <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs font-semibold tracking-[0.14em] text-primary uppercase sm:text-[13px]">
        <span>DEMO LOCALE</span>
        <span aria-hidden className="hidden text-primary/40 sm:inline">
          ·
        </span>
        <span>Dati fittizi</span>
        <span aria-hidden className="hidden text-primary/40 sm:inline">
          ·
        </span>
        <span className="normal-case tracking-normal text-primary/90">
          Prezzi dimostrativi e non vincolanti
        </span>
      </p>
    </div>
  );
}

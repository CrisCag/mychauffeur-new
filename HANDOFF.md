# Handoff — MyChauffeur.it

Aggiornare dopo ogni sessione significativa o su comando **mi fermo**.

## Stato rapido (2026-06-24)

- **Progetto unico:** `mychauffeur-new` (sito nazionale + futura piattaforma)
- **Non usare ora:** `daytrip-clone` come workspace attivo (solo import moduli in Fase 2+)
- **Supabase:** pausato — restore solo quando iniziamo Fase 2
- **Locale:** `npm run dev -- --port 3002` → http://localhost:3002/it
- **GitHub:** allineato — commit `4b57e9a` su `main`

## Tu (proprietario) — cosa fai

| Quando | Azione |
|--------|--------|
| Subito | Apri cartella `~/progetti/mychauffeur-new` in Cursor |
| Per vedere il sito | Terminale: `npm run dev -- --port 3002` |
| Quando hai chiavi | Crea `.env.local` (Google Maps, SMTP) — chiedi all’agente il template |
| Decisioni prodotto | Approvi fasi; l’agente implementa |
| Stop sessione | Scrivi **mi fermo** |

## Agente — cosa fa

- Implementa fase per fase (vedi `PLATFORM_MAP.md`)
- Non tocca `daytrip-clone` senza ordine esplicito
- Commit/push solo quando chiesto o su **mi fermo**
- Aggiorna questa pagina e `PLATFORM_MAP.md`

## Riprendi da qui

1. Leggi `PLATFORM_MAP.md` → fase corrente (**1: deploy**)  
2. Locale: `npm run dev -- --port 3002` → http://localhost:3002/it  
3. Prossimo: deploy **Vercel** + (poi) email SMTP e Google Maps

## File chiave

- Home: `app/[locale]/page.tsx`
- Booking: `components/sections/booking-widget.tsx`, `app/api/booking/route.ts`
- i18n: `messages/it.ts`, `messages/en.ts`
- GDPR: `components/gdpr/`

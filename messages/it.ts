import type { Messages } from "./types";

export const it: Messages = {
  meta: {
    title: "MyChauffeur.it | NCC Spoleto, Umbria e Centro Italia",
    description:
      "Servizio NCC con base in Italia: transfer da/per aeroporti, porti e stazioni, noleggio con conducente ad ore, city-to-city e servizi personalizzati. Operativi su tutto il territorio nazionale e disponibili anche per richieste internazionali dedicate.",
  },
  nav: {
    services: "Servizi",
    fleet: "Flotta",
    benefits: "Vantaggi",
    servicesDetail: "Dettaglio servizi",
    book: "Prenota",
  },
  langSwitcher: { aria: "Seleziona lingua" },
  hero: {
    eyebrow: "MyChauffeur.it — Transfer privati e NCC di lusso in Italia da oltre 20 anni.",
    title: "La destinazione è importante. Il viaggio fa la differenza.",
    body:
      "Il vostro autista vi aspetta. Da porta a porta, con la calma e la professionalità di chi fa questo mestiere da oltre vent’anni.",
    bookNow: "Prenota il tuo transfer ora",
    discoverServices: "Scopri la flotta",
    imageAltMan:
      "Berlina Mercedes nera MyChauffeur per transfer premium con autista professionale",
    imageAltWoman:
      "Autista professionista in abbigliamento elegante in ambiente urbano (immagine illustrativa)",
  },
  booking: {
    eyebrow: "Prenotazione rapida",
    title: "Partenza, destinazione, data e ora",
    description:
      "Inserite itinerario e orario: confermeremo classe vettura, numero passeggeri e prezzo finale prima del servizio.",
    labelFrom: "Partenza",
    labelTo: "Destinazione",
    labelDate: "Data",
    labelTime: "Ora",
    labelAddReturn: "Aggiungi viaggio di ritorno",
    labelReturnDate: "Data ritorno",
    labelReturnTime: "Ora ritorno",
    placeholderDate: "Scegli data",
    placeholderReturnDate: "Scegli data ritorno",
    openCalendar: "Apri calendario",
    returnDateError: "La data di ritorno deve essere uguale o successiva alla partenza.",
    timeError: "Seleziona un orario valido (ora e minuti).",
    labelPassengers: "Numero passeggeri",
    labelVehicle: "Tipologia veicolo",
    placeholderFrom: "Es. Fiumicino T1, Via Roma 12 Spoleto…",
    placeholderTo: "Hotel, stazione, indirizzo destinazione…",
    placeholderPassengers: "Es. 2",
    optionVehicleSedan: "Berlina",
    optionVehicleVan: "Van",
    optionVehicleOther: "Altro / da concordare",
    labelVehicleOtherDetails: "Specifica la richiesta veicolo",
    placeholderVehicleOtherDetails:
      "Es. SUV premium, van extra bagagli, allestimento cerimonia...",
    labelB2B: "Richiesta aziendale/B2B",
    b2bHint:
      "(se selezionato, la richiesta viene instradata al team partners)",
    submit: "Ottieni preventivo",
    sending: "Calcolo prezzo…",
    calculating: "Calcolo del preventivo in corso…",
    success:
      "Richiesta inviata. Ti ricontattiamo a breve per conferma disponibilita e tariffa.",
    error:
      "Non siamo riusciti a calcolare il preventivo. Verifica che il server sia avviato (npm run dev) e riprova.",
    policyNote:
      "Operativita 24/7 salvo disponibilita dei veicoli. Attese e tempi di cortesia secondo policy di servizio condivisa in conferma.",
    paymentNote:
      "Pagamenti accettati: contanti, carta, bonifico, link di pagamento. In genere e richiesto il 30% di acconto alla prenotazione e saldo prima della partenza, salvo accordi diversi.",
    devHintBefore: "In sviluppo: imposta",
    devHintAfter: "per l'autocomplete indirizzi.",
    mapsBlockedHint:
      "Per suggerimenti indirizzo da Google Maps accetta i cookie funzionali nel banner in basso o da «Preferenze cookie» in fondo alla pagina.",
  },
  servicesSection: {
    kicker: "Servizi",
    title: "Servizi pensati per chi pretende il meglio",
    subtitle:
      "Punto A → punto B con orario certo, veicolo scelto in anticipo e prezzo concordato: un servizio premium pensato per chi viaggia senza compromessi, in Italia e oltre su richiesta. Restiamo aperti a personalizzazioni e richieste specifiche.",
    readMore: "Dettaglio servizi →",
    cards: [
      {
        title: "Transfer aeroportali e intermodali",
        description:
          "Door-to-door da e per aeroporti principali, stazioni AV e porti italiani: monitoraggio voli, attesa all'arrivo con cartello nominativo e percorsi ottimizzati.",
      },
      {
        title: "Autista ad Ore · Tours e Day Trips",
        description:
          "Vettura e autista a vostra disposizione per frazioni di giornata o giornata intera: meeting multipli, shopping center e outlet, tour su misura e day trips con soste panoramiche lungo il tragitto.",
      },
      {
        title: "City-to-city e viaggi d'affari",
        description:
          "Lunghi trasferimenti tra citta italiane (ed estero su richiesta) in totale privacy: spazio per lavorare, tempi concordati, ideale per ospiti corporate, roadshow, ambasciate, delegazioni istituzionali e clientela VIP.",
      },
    ],
  },
  hubsSection: {
    kicker: "Hub prioritari",
    title: "Aeroporti, porti e stazioni ad alta richiesta",
    subtitle:
      "Copertura ampia su tratte ad alta richiesta in Italia, con disponibilita estesa anche su itinerari personalizzati nazionali e internazionali su richiesta.",
    groups: [
      {
        title: "Aeroporti",
        items: [
          "Roma Fiumicino (FCO)",
          "Roma Ciampino (CIA)",
          "Firenze (FLR)",
          "Perugia (PEG)",
          "Ancona (AOI)",
          "Bologna (BLQ)",
        ],
      },
      {
        title: "Porti",
        items: ["Civitavecchia", "Livorno", "Ancona"],
      },
      {
        title: "Stazioni",
        items: [
          "Roma Termini",
          "Roma Tiburtina",
          "Firenze Santa Maria Novella",
          "Bologna Centrale",
          "Perugia",
        ],
      },
    ],
  },
  fleetSection: {
    kicker: "Flotta",
    title: "Classe auto garantita: solo Mercedes recenti e allestimenti premium",
    intro:
      "Sapete sempre cosa troverete a bordo. Interni curati, acqua, Wi‑Fi ove disponibile, autisti in divisa che aprono la portiera e gestiscono i bagagli con discrezione.",
    cards: [
      {
        title: "Business Class",
        subtitle: "Berlina per transfer e hotel",
        details:
          "Mercedes Classe E (o allestimento equivalente): transfer aeroportuali, hotel e spostamenti urbani con bagaglio ordinato.",
        capacity: "Fino a 3 passeggeri · bagaglio business",
        image:
          "https://www.mychauffeur.it/images/ncc-servizio-trasferimenti.png",
        imageAlt:
          "Mercedes-Benz berlina scura parcheggiata, allestimento business",
      },
      {
        title: "Luxury sedan",
        subtitle: "Comfort massimo per VIP e cerimonie",
        details:
          "Mercedes Classe S o equivalenti: interni in pelle, spazio per le gambe e massima riservatezza.",
        capacity: "Fino a 3 passeggeri · allestimento cerimonia su richiesta",
        image:
          "https://www.mychauffeur.it/images/my-chauffeur-noleggio-con-conducente2.jpg",
        imageAlt:
          "Berlina Mercedes di rappresentanza scura, vista frontale notturna",
      },
      {
        title: "Minivan premium",
        subtitle: "Gruppi, famiglie e delegazioni",
        details:
          "Mercedes Classe V nera: fino a sette posti, altezza vano bagagli generosa, ideale per famiglie, delegazioni e shuttle evento.",
        capacity: "Fino a 7 passeggeri · ottimo per eventi e shuttle",
        image:
          "https://www.mychauffeur.it/images/servizio-shuttle.png",
        imageAlt:
          "Mercedes-Benz van nera su strada cittadina (stile Classe V)",
      },
    ],
  },
  trustSection: {
    kicker: "Perché sceglierci",
    title: "Standard internazionali, vicinanza italiana",
    subtitle:
      "Puntualità, prezzo chiaro e autisti formati: i pilastri del nostro chauffeur service, con un interlocutore locale che conosce strade, hub e abitudini di viaggio in Italia.",
    items: [
      {
        title: "Orario certo, anche quando il volo cambia",
        description:
          "Seguiamo gli aggiornamenti dei voli e concordiamo tempi di attesa all'arrivo: meno stress in caso di ritardi o imprevisti operativi.",
      },
      {
        title: "Tariffa fissa e trasparente",
        description:
          "Prezzo definito prima della corsa: nessun contatore nascosto né maggiorazioni per traffico se il percorso resta quello pattuito.",
      },
      {
        title: "Autisti multilingua professionali",
        description:
          "Italiano e inglese a bordo; altre lingue su richiesta. Divisa scura, apertura portiere, bagagli gestiti: l'esperienza riservata che vi aspettate da un NCC di fascia alta.",
      },
      {
        title: "Esperienza ventennale",
        description:
          "Oltre 20 anni di operativita su tratte business, aeroportuali e servizi personalizzati per clientela privata e corporate.",
      },
      {
        title: "Servizio door-to-door",
        description:
          "Partenza e arrivo esattamente dove serve, con supporto continuo e coordinamento puntuale lungo tutto il viaggio.",
      },
    ],
  },
  cta: {
    title: "Aeroporto, hotel o intera giornata in disposizione?",
    body:
      "Compilate il modulo qui accanto per un preventivo rapido, oppure chiamateci per matrimoni, shuttle per eventi, accordi corporate, servizi ambasciate e richieste VIP: risposta 24 ore su 24, 7 giorni su 7. Ogni servizio puo essere personalizzato.",
    book: "Compila la richiesta",
    allServices: "Tutti i servizi",
  },
  footer: {
    brand: "MyChauffeur",
    blurb:
      "Transfer privati e NCC in Italia da oltre vent'anni: door-to-door, Mercedes, prezzo concordato e assistenza sempre raggiungibile, con un numero italiano che risponde.",
    usefulLinks: "Link utili",
    linkServices: "Servizi",
    linkFleet: "Flotta",
    linkContacts: "Contatti",
    linkPrivacy: "Privacy",
    linkCookies: "Cookie",
    cookiePreferences: "Preferenze cookie",
    contactsTitle: "Contatti",
    availability: "Disponibilità 24/7",
    copyright: "MyChauffeur.it — Servizio NCC premium.",
  },
  cookieBanner: {
    title: "Rispettiamo la tua privacy",
    body:
      "Utilizziamo cookie strettamente necessari per il funzionamento del sito. Con il tuo consenso possiamo caricare anche strumenti di terze parti (es. Google Places per suggerimenti indirizzo nel modulo prenotazioni). Puoi modificare la scelta in qualsiasi momento.",
    acceptAll: "Accetta tutto",
    essentialOnly: "Solo necessari",
    privacyLink: "Informativa privacy",
    cookiePolicyLink: "Cookie policy",
    legalNote:
      "La scelta viene memorizzata sul tuo dispositivo. Documentazione da integrare con il tuo legale.",
    close: "Chiudi",
    manageTitle: "Preferenze cookie",
  },
  legalPage: {
    backHome: "Torna alla home",
    privacy: {
      metaTitle: "Privacy | MyChauffeur",
      title: "Informativa sulla privacy",
      updated: "Ultimo aggiornamento: aprile 2026",
      sections: [
        {
          heading: "Titolare del trattamento",
          body:
            "Il titolare del trattamento dei dati personali raccolti tramite questo sito e Cristian Cagnoni (P.IVA 03593530540), con sede in Via Cascia, 8 — 06049 Spoleto (PG), Italia. L'insegna commerciale utilizzata e MyChauffeur.it (marchio e logo registrati presso UIBM). Recapiti: +39 338 153 4398, info@mychauffeur.it (informazioni), bypartners@mychauffeur.it (partners e B2B), office@mychauffeur.it (amministrazione), cagnoni_cristian@pec.it (PEC legale).",
        },
        {
          heading: "Dati trattati e finalità",
          body:
            "Attraverso il sito possono essere trattati dati identificativi e di contatto inseriti volontariamente nei moduli (es. richiesta corsa), dati di navigazione tecnici (log, indirizzo IP abbreviato o anonimizzato ove possibile) e, solo previo consenso, identificatori legati a mappe o strumenti di terze parti. Le finalità sono risposta alle richieste, gestione precontrattuale/contrattuale, adempimenti di legge e, con consenso, miglioramento dell’esperienza (es. autocomplete).",
        },
        {
          heading: "Base giuridica e conservazione",
          body:
            "Esecuzione di misure precontrattuali/contrattuali, consenso ove richiesto, obblighi legali e legittimo interesse alla sicurezza del sito. I tempi di conservazione dipendono dalla finalità (es. richieste commerciali per il tempo necessario alla gestione; log tecnici per periodi limitati salvo obblighi di legge).",
        },
        {
          heading: "Diritti degli interessati",
          body:
            "Ai sensi del GDPR puoi esercitare i diritti di accesso, rettifica, cancellazione, limitazione, opposizione e portabilità ove applicabili, nonché revocare il consenso prestato per le attività facoltative. Puoi contattarci ai recapiti del titolare. Hai diritto di proporre reclamo al Garante per la protezione dei dati personali (www.garanteprivacy.it).",
        },
      ],
    },
    cookie: {
      metaTitle: "Cookie | MyChauffeur",
      title: "Informativa sui cookie",
      updated: "Ultimo aggiornamento: aprile 2026",
      sections: [
        {
          heading: "Cosa sono i cookie",
          body:
            "I cookie sono piccoli file memorizzati sul dispositivo quando visiti un sito. Possono essere di prima parte (impostati da questo dominio) o di terze parti (impostati da fornitori come Google per mappe o analitiche).",
        },
        {
          heading: "Cookie strettamente necessari",
          body:
            "Sono necessari al funzionamento del sito (es. memorizzazione della lingua o della tua scelta sui cookie). Non richiedono consenso ai sensi della normativa ePrivacy, salvo diversa interpretazione applicabile.",
        },
        {
          heading: "Cookie di terze parti e preferenze",
          body:
            "Se accetti «tutti» i cookie, possiamo caricare script di terze parti (es. API Google Maps/Places) per funzioni come l’autocomplete negli indirizzi. Se scegli «solo necessari», tali script non vengono caricati fino a nuovo consenso. Puoi riaprire il pannello con «Preferenze cookie» nel footer.",
        },
        {
          heading: "Come modificare o revocare il consenso",
          body:
            "Puoi cancellare i dati locali dal browser o usare il link «Preferenze cookie» per mostrare di nuovo il banner. Per cookie già installati da terze parti consulta le informative dei rispettivi fornitori.",
        },
      ],
    },
  },
  serviziPage: {
    kicker: "Servizi NCC",
    title: "Un partner unico per transfer, tour ed eventi",
    intro:
      "Dalla singola corsa aeroporto–hotel al coordinamento di più vetture per un congresso: itinerario, classe auto e orari definiti in anticipo, con interlocuzione diretta e flotta Mercedes.",
    cards: [
      {
        title: "Transfer aeroportali, porti e stazioni",
        description:
          "Leonardo da Vinci (FCO), Ciampino, Firenze, Perugia, Ancona e Bologna: accoglienza con cartello, aggiornamenti sui ritardi e tragitti calibrati. Stesso livello di servizio da Civitavecchia, Livorno e Ancona, oltre a stazioni AV del Centro Italia.",
      },
      {
        title: "Autista ad ore, tours e day trips su misura",
        description:
          "Disponibilità per mezza giornata o giornata intera con vettura sempre a disposizione: ideale per itinerari turistici, day trips in Umbria e Centro Italia, shopping center/outlet o più incontri di lavoro. Su richiesta collaboriamo con guide turistiche.",
      },
      {
        title: "Viaggi d'affari e lunghi trasferimenti",
        description:
          "Collegamenti tra citta italiane con comfort da ufficio mobile, privacy e tempi pattuiti. Supporto a roadshow, ospiti direzionali, ambasciate, delegazioni istituzionali e trasferte VIP con fermate programmate.",
      },
      {
        title: "Matrimoni, eventi e shuttle dedicati",
        description:
          "Auto decorate su richiesta, minivan per cortei e shuttle ripetuti per concerti, fiere e congressi: coordinamento centralizzato così ogni ospite arriva in orario.",
      },
    ],
    backBook: "Torna alla prenotazione",
    home: "Home",
  },
};

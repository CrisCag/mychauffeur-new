import type { Messages } from "./types";

export const en: Messages = {
  meta: {
    title: "MyChauffeur.it | Chauffeur service in Spoleto, Umbria",
    description:
      "Chauffeur service based in Italy: airport, port and rail transfers, hourly disposal, city-to-city routes and tailored services. Active across the whole country, with availability for dedicated international requests.",
  },
  nav: {
    services: "Services",
    fleet: "Fleet",
    benefits: "Why us",
    servicesDetail: "All services",
    book: "Book",
  },
  langSwitcher: { aria: "Choose language" },
  hero: {
    eyebrow: "MyChauffeur.it — Private transfers and luxury chauffeur service in Italy for over 20 years.",
    title: "The destination matters. The journey makes the difference.",
    body:
      "Your chauffeur will be waiting. Door-to-door, with the calm professionalism of a team that has been doing this for over twenty years.",
    bookNow: "Book your transfer now",
    discoverServices: "Discover the fleet",
    imageAltMan:
      "Black Mercedes saloon by MyChauffeur for premium chauffeur transfer",
    imageAltWoman:
      "Professional chauffeur in smart attire in an urban setting (illustrative image)",
  },
  booking: {
    eyebrow: "Quick booking",
    title: "Pick-up, drop-off, date and time",
    description:
      "Enter your route and schedule; we confirm vehicle class, passenger count and final price before the service.",
    labelFrom: "Pick-up",
    labelTo: "Drop-off",
    labelDate: "Date",
    labelTime: "Time",
    labelAddReturn: "Add return trip",
    labelReturnDate: "Return date",
    labelReturnTime: "Return time",
    placeholderDate: "Pick a date",
    placeholderReturnDate: "Pick return date",
    openCalendar: "Open calendar",
    returnDateError: "Return date must be on or after the outbound date.",
    timeError: "Select a valid time (hour and minutes).",
    labelPassengers: "Passengers",
    labelVehicle: "Vehicle type",
    placeholderFrom: "e.g. Fiumicino T1, 12 Via Roma Spoleto…",
    placeholderTo: "Hotel, station, destination address…",
    placeholderPassengers: "e.g. 2",
    optionVehicleSedan: "Sedan",
    optionVehicleVan: "Van",
    optionVehicleOther: "Other / to be agreed",
    labelVehicleOtherDetails: "Specify vehicle request",
    placeholderVehicleOtherDetails:
      "e.g. Premium SUV, extra-luggage van, ceremony setup...",
    labelB2B: "Corporate/B2B request",
    b2bHint: "(if selected, the request is routed to the partners team)",
    submit: "Get a quote",
    sending: "Calculating price…",
    calculating: "Fetching your quote…",
    success:
      "Request sent. We will contact you shortly to confirm availability and fare.",
    error:
      "We could not calculate your quote. Make sure the dev server is running (npm run dev) and try again.",
    policyNote:
      "Operations are 24/7 subject to vehicle availability. Waiting windows follow the service policy shared in your confirmation.",
    paymentNote:
      "Accepted methods: cash, card, bank transfer and payment link. Usually a 30% deposit is required at booking and the balance before departure, unless otherwise agreed.",
    devHintBefore: "Development: set",
    devHintAfter: "for address autocomplete.",
    mapsBlockedHint:
      "To enable Google Maps address suggestions, accept functional cookies in the banner below or via “Cookie preferences” in the footer.",
  },
  servicesSection: {
    kicker: "Services",
    title: "Services designed for those who expect the best",
    subtitle:
      "Point A → point B with a fixed schedule, vehicle chosen in advance and agreed price: a premium service for travellers who expect excellence, across Italy and beyond on request. We remain open to custom requests and specific needs.",
    readMore: "Service details →",
    cards: [
      {
        title: "Airport & intermodal transfers",
        description:
          "Door-to-door to and from major airports, high-speed rail stations and Italian ports: flight monitoring, name-board meet & greet and optimised routing.",
      },
      {
        title: "Hourly Chauffeur · Tours and Day Trips",
        description:
          "Vehicle and chauffeur at your disposal for a half day or full day: multiple meetings, shopping centres and outlets, bespoke tours and day trips with scenic stops along the route.",
      },
      {
        title: "City-to-city & business travel",
        description:
          "Long intercity journeys across Italy (and abroad on request) in full privacy: space to work, agreed timings — ideal for corporate guests, roadshows, embassies, institutional delegations and VIP travel.",
      },
    ],
  },
  hubsSection: {
    kicker: "Priority hubs",
    title: "Main airports, ports and rail stations in high-demand routes",
    subtitle:
      "Broad coverage across high-demand routes in Italy, with extended availability for tailored national and international itineraries on request.",
    groups: [
      {
        title: "Airports",
        items: [
          "Rome Fiumicino (FCO)",
          "Rome Ciampino (CIA)",
          "Florence (FLR)",
          "Perugia (PEG)",
          "Ancona (AOI)",
          "Bologna (BLQ)",
        ],
      },
      {
        title: "Ports",
        items: ["Civitavecchia", "Livorno", "Ancona"],
      },
      {
        title: "Rail stations",
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
    kicker: "Fleet",
    title: "Guaranteed vehicle class: recent Mercedes and premium specification",
    intro:
      "You always know what to expect on board. Impeccable interiors, water, Wi‑Fi where available, uniformed chauffeurs who open doors and handle luggage discreetly.",
    cards: [
      {
        title: "Business Class",
        subtitle: "Saloon for transfers & hotels",
        details:
          "Mercedes E-Class (or equivalent): airports, hotels and urban runs with tidy luggage space.",
        capacity: "Up to 3 passengers · business luggage",
        image:
          "https://www.mychauffeur.it/images/ncc-servizio-trasferimenti.png",
        imageAlt: "Dark Mercedes-Benz saloon, business specification",
      },
      {
        title: "Luxury saloon",
        subtitle: "Maximum comfort for VIPs & ceremonies",
        details:
          "Mercedes S-Class or equivalent: leather interior, generous legroom and maximum privacy.",
        capacity: "Up to 3 passengers · wedding trim on request",
        image:
          "https://www.mychauffeur.it/images/my-chauffeur-noleggio-con-conducente2.jpg",
        imageAlt: "Dark Mercedes flagship saloon, front view at night",
      },
      {
        title: "Premium minivan",
        subtitle: "Groups, families & delegations",
        details:
          "Black Mercedes V-Class: up to seven seats, generous luggage height — ideal for families, delegations and event shuttles.",
        capacity: "Up to 7 passengers · events & shuttles",
        image:
          "https://www.mychauffeur.it/images/servizio-shuttle.png",
        imageAlt: "Black Mercedes-Benz van on an urban road (V-Class style)",
      },
    ],
  },
  trustSection: {
    kicker: "Why choose us",
    title: "International standards, Italian proximity",
    subtitle:
      "Punctuality, transparent pricing and trained chauffeurs: the pillars of our service, with a local partner who knows roads, hubs and travel habits in Italy.",
    items: [
      {
        title: "Reliable timing, even when flights change",
        description:
          "We track flight updates and agree waiting time on arrival — less stress when delays or operational changes occur.",
      },
      {
        title: "Fixed and transparent fare",
        description:
          "Price fixed before the ride: no hidden meter surcharges for traffic when the route stays as agreed.",
      },
      {
        title: "Professional multilingual chauffeurs",
        description:
          "Italian and English on board; other languages on request. Dark uniform, door service, luggage handled — the premium NCC experience you expect.",
      },
      {
        title: "Twenty-year experience",
        description:
          "Over 20 years of operations across business routes, airport transfers and custom services for private and corporate guests.",
      },
      {
        title: "Door-to-door service",
        description:
          "Pick-up and drop-off exactly where needed, with continuous support and precise coordination throughout the journey.",
      },
    ],
  },
  cta: {
    title: "Airport, hotel or a full day on disposal?",
    body:
      "Fill in the form beside this text for a quick quote, or call us for weddings, event shuttles, corporate agreements, embassy services and VIP requests — we respond 24 hours a day, 7 days a week. Every service can be tailored.",
    book: "Send your request",
    allServices: "All services",
  },
  footer: {
    brand: "MyChauffeur",
    blurb:
      "Private transfers and chauffeur service in Italy for over twenty years: door-to-door, Mercedes, agreed pricing and always reachable support, with an Italian number that answers.",
    usefulLinks: "Useful links",
    linkServices: "Services",
    linkFleet: "Fleet",
    linkContacts: "Contact",
    linkPrivacy: "Privacy",
    linkCookies: "Cookies",
    cookiePreferences: "Cookie preferences",
    contactsTitle: "Contact",
    availability: "24/7 availability",
    copyright: "MyChauffeur.it — Premium NCC service.",
  },
  cookieBanner: {
    title: "We respect your privacy",
    body:
      "We use strictly necessary cookies for the site to work. With your consent we may also load third-party tools (e.g. Google Places for address suggestions in the booking form). You can change your choice at any time.",
    acceptAll: "Accept all",
    essentialOnly: "Necessary only",
    privacyLink: "Privacy policy",
    cookiePolicyLink: "Cookie policy",
    legalNote:
      "Your choice is stored on this device. Have your counsel review and adapt this text.",
    close: "Close",
    manageTitle: "Cookie preferences",
  },
  legalPage: {
    backHome: "Back to home",
    privacy: {
      metaTitle: "Privacy | MyChauffeur",
      title: "Privacy policy",
      updated: "Last updated: April 2026",
      sections: [
        {
          heading: "Data controller",
          body:
            "The controller of personal data collected through this website is Cristian Cagnoni (VAT no. 03593530540), registered office at Via Cascia, 8 — 06049 Spoleto (PG), Italy. The commercial brand used is MyChauffeur.it (trademark and logo registered with UIBM). Contacts: +39 338 153 4398, info@mychauffeur.it (general enquiries), bypartners@mychauffeur.it (partners and B2B), office@mychauffeur.it (administration), cagnoni_cristian@pec.it (legal PEC email).",
        },
        {
          heading: "Data processed and purposes",
          body:
            "We may process identification and contact details you submit in forms (e.g. ride requests), technical browsing data (logs, IP where required) and, only with consent, identifiers related to third-party maps tools. Purposes include responding to enquiries, pre-contractual/contractual steps, legal obligations and, where consented, improving the experience (e.g. autocomplete).",
        },
        {
          heading: "Legal basis and retention",
          body:
            "Pre-contractual/contractual performance, consent where required, legal obligations and legitimate interests in site security. Retention depends on purpose (e.g. commercial requests for the time needed to handle them; technical logs for limited periods unless law requires longer).",
        },
        {
          heading: "Your rights",
          body:
            "Under the GDPR you may request access, rectification, erasure, restriction, objection and data portability where applicable, and withdraw consent for optional processing. Contact us using the controller details above. You may lodge a complaint with your local supervisory authority.",
        },
      ],
    },
    cookie: {
      metaTitle: "Cookies | MyChauffeur",
      title: "Cookie policy",
      updated: "Last updated: April 2026",
      sections: [
        {
          heading: "What cookies are",
          body:
            "Cookies are small files stored on your device when you visit a site. They may be first-party (set by this domain) or third-party (set by providers such as Google for maps or analytics).",
        },
        {
          heading: "Strictly necessary cookies",
          body:
            "Required for core site operation (e.g. language or storing your cookie choice). Under ePrivacy rules these typically do not require consent, subject to applicable law.",
        },
        {
          heading: "Third-party cookies and preferences",
          body:
            "If you accept “all” cookies, we may load third-party scripts (e.g. Google Maps/Places APIs) for features such as address autocomplete. If you choose “necessary only”, those scripts are not loaded until you consent again. Re-open the panel via “Cookie preferences” in the footer.",
        },
        {
          heading: "How to change or withdraw consent",
          body:
            "Clear site data in your browser or use “Cookie preferences” to show the banner again. For cookies already placed by third parties, see each provider’s policy.",
        },
      ],
    },
  },
  serviziPage: {
    kicker: "NCC services",
    title: "One partner for transfers, tours and events",
    intro:
      "From a single airport–hotel run to coordinating multiple vehicles for a congress: route, vehicle class and timings defined upfront, with direct contact and a Mercedes fleet.",
    cards: [
      {
        title: "Airports, cruise ports & stations",
        description:
          "Leonardo da Vinci (FCO), Ciampino, Florence, Perugia, Ancona and Bologna: name-board meet & greet, delay updates and optimised routes. Same service level from Civitavecchia, Livorno and Ancona, plus high-speed rail stations in Central Italy.",
      },
      {
        title: "Hourly chauffeur, tours & tailor-made day trips",
        description:
          "Half or full day with the vehicle at your disposal: sightseeing, day trips in Umbria and Central Italy, shopping centres/outlets or several business stops. Tourist guides available on request.",
      },
      {
        title: "Business travel & long-distance",
        description:
          "Intercity journeys with mobile-office comfort, privacy and agreed timings. Roadshows, executive guests, embassies, institutional delegations and VIP multi-stop itineraries.",
      },
      {
        title: "Weddings, events & dedicated shuttles",
        description:
          "Decorated cars on request, minivans for corteges and repeat shuttles for concerts, fairs and congresses — central coordination so every guest arrives on time.",
      },
    ],
    backBook: "Back to booking form",
    home: "Home",
  },
};

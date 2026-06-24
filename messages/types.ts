export type FleetCard = {
  title: string;
  subtitle: string;
  details: string;
  capacity: string;
  image: string;
  imageAlt: string;
};

export type ServiceCard = {
  title: string;
  description: string;
};

export type HubGroup = {
  title: string;
  items: string[];
};

export type Messages = {
  meta: { title: string; description: string };
  nav: {
    services: string;
    fleet: string;
    benefits: string;
    servicesDetail: string;
    book: string;
  };
  langSwitcher: { aria: string };
  hero: {
    eyebrow: string;
    title: string;
    body: string;
    bookNow: string;
    discoverServices: string;
    imageAltMan: string;
    imageAltWoman: string;
  };
  booking: {
    eyebrow: string;
    title: string;
    description: string;
    labelFrom: string;
    labelTo: string;
    labelDate: string;
    labelTime: string;
    labelAddReturn: string;
    labelReturnDate: string;
    labelReturnTime: string;
    placeholderDate: string;
    placeholderReturnDate: string;
    openCalendar: string;
    returnDateError: string;
    timeError: string;
    labelPassengers: string;
    labelVehicle: string;
    placeholderFrom: string;
    placeholderTo: string;
    placeholderPassengers: string;
    optionVehicleSedan: string;
    optionVehicleVan: string;
    optionVehicleOther: string;
    labelVehicleOtherDetails: string;
    placeholderVehicleOtherDetails: string;
    labelB2B: string;
    b2bHint: string;
    submit: string;
    sending: string;
    calculating?: string;
    success: string;
    error: string;
    policyNote: string;
    paymentNote: string;
    devHintBefore: string;
    devHintAfter: string;
    mapsBlockedHint: string;
  };
  servicesSection: {
    kicker: string;
    title: string;
    subtitle: string;
    readMore: string;
    cards: ServiceCard[];
  };
  hubsSection: {
    kicker: string;
    title: string;
    subtitle: string;
    groups: HubGroup[];
  };
  fleetSection: {
    kicker: string;
    title: string;
    intro: string;
    cards: FleetCard[];
  };
  trustSection: {
    kicker: string;
    title: string;
    subtitle: string;
    items: { title: string; description: string }[];
  };
  cta: {
    title: string;
    body: string;
    book: string;
    allServices: string;
  };
  footer: {
    brand: string;
    blurb: string;
    usefulLinks: string;
    linkServices: string;
    linkFleet: string;
    linkContacts: string;
    linkPrivacy: string;
    linkCookies: string;
    cookiePreferences: string;
    contactsTitle: string;
    availability: string;
    copyright: string;
  };
  cookieBanner: {
    title: string;
    body: string;
    acceptAll: string;
    essentialOnly: string;
    privacyLink: string;
    cookiePolicyLink: string;
    legalNote: string;
    close: string;
    manageTitle: string;
  };
  legalPage: {
    backHome: string;
    privacy: {
      metaTitle: string;
      title: string;
      updated: string;
      sections: { heading: string; body: string }[];
    };
    cookie: {
      metaTitle: string;
      title: string;
      updated: string;
      sections: { heading: string; body: string }[];
    };
  };
  serviziPage: {
    kicker: string;
    title: string;
    intro: string;
    cards: ServiceCard[];
    backBook: string;
    home: string;
  };
};

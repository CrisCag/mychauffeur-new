import type { PoiStopRow } from "@/lib/platform/poi-query";

export type StaticPoi = PoiStopRow & {
  description: string;
  image_url: string | null;
  tags: string[];
  routeKeys: string[];
};

export const STATIC_POIS: StaticPoi[] = [
  {
    id: "poi-orvieto",
    name: "Orvieto",
    description: "Duomo e centro storico sulla via per la Toscana.",
    lat: 42.7188,
    lng: 12.1107,
    base_stop_price: 45,
    suggested_duration_minutes: 90,
    deviation_time_minutes: 25,
    image_url: null,
    tags: ["UNESCO", "Borghi"],
    routeKeys: ["roma-firenze", "umbria-toscana"],
  },
  {
    id: "poi-montepulciano",
    name: "Montepulciano",
    description: "Borgo del Vino Nobile e panorama sulla Val di Chiana.",
    lat: 43.0939,
    lng: 11.7813,
    base_stop_price: 50,
    suggested_duration_minutes: 90,
    deviation_time_minutes: 30,
    image_url: null,
    tags: ["Vino", "Panorama"],
    routeKeys: ["roma-firenze", "umbria-toscana"],
  },
  {
    id: "poi-assisi",
    name: "Assisi",
    description: "Basilica di San Francesco e centro medievale.",
    lat: 43.0707,
    lng: 12.6176,
    base_stop_price: 40,
    suggested_duration_minutes: 120,
    deviation_time_minutes: 20,
    image_url: null,
    tags: ["UNESCO", "Spirituale"],
    routeKeys: ["umbria", "roma-perugia"],
  },
  {
    id: "poi-spoleto",
    name: "Spoleto",
    description: "Ponte delle Torri e centro storico umbro.",
    lat: 42.7344,
    lng: 12.7392,
    base_stop_price: 35,
    suggested_duration_minutes: 75,
    deviation_time_minutes: 15,
    image_url: null,
    tags: ["Umbria", "Arte"],
    routeKeys: ["umbria", "roma-perugia"],
  },
  {
    id: "poi-ostia",
    name: "Ostia Antica",
    description: "Scavi archeologici vicino al litorale romano.",
    lat: 41.7559,
    lng: 12.291,
    base_stop_price: 40,
    suggested_duration_minutes: 90,
    deviation_time_minutes: 20,
    image_url: null,
    tags: ["Archeologia"],
    routeKeys: ["fiumicino-roma", "roma-litorale"],
  },
  {
    id: "poi-como",
    name: "Como centro e lago",
    description: "Lungolago, centro storico e funicolare Brunate.",
    lat: 45.8081,
    lng: 9.0852,
    base_stop_price: 45,
    suggested_duration_minutes: 90,
    deviation_time_minutes: 15,
    image_url: null,
    tags: ["Lago", "Panorama"],
    routeKeys: ["milano-como", "lombardia"],
  },
  {
    id: "poi-siena",
    name: "Siena",
    description: "Piazza del Campo e centro UNESCO.",
    lat: 43.3188,
    lng: 11.3308,
    base_stop_price: 55,
    suggested_duration_minutes: 120,
    deviation_time_minutes: 35,
    image_url: null,
    tags: ["UNESCO"],
    routeKeys: ["roma-siena", "firenze-siena"],
  },
  {
    id: "poi-pompei",
    name: "Pompei (scavi)",
    description: "Sosta culturale tra Napoli e Costiera.",
    lat: 40.7489,
    lng: 14.4897,
    base_stop_price: 50,
    suggested_duration_minutes: 120,
    deviation_time_minutes: 25,
    image_url: null,
    tags: ["UNESCO", "Archeologia"],
    routeKeys: ["napoli-costiera", "napoli-roma"],
  },
];

function normalizeRouteText(...parts: string[]): string {
  return parts
    .join(" ")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function detectRouteKeys(origin: string, destination: string): string[] {
  const text = normalizeRouteText(origin, destination);
  const keys = new Set<string>();

  if (
    (text.includes("roma") || text.includes("rome") || text.includes("fiumicino") || text.includes("fco")) &&
    (text.includes("firenze") || text.includes("florence") || text.includes("flr"))
  ) {
    keys.add("roma-firenze");
    keys.add("umbria-toscana");
  }
  if (text.includes("perugia") || text.includes("umbria") || text.includes("spoleto")) {
    keys.add("umbria");
    keys.add("roma-perugia");
  }
  if (text.includes("fiumicino") || text.includes("fco") || text.includes("ciampino")) {
    keys.add("fiumicino-roma");
  }
  if (
    (text.includes("milano") || text.includes("milan") || text.includes("mxp")) &&
    (text.includes("como") || text.includes("lake como"))
  ) {
    keys.add("milano-como");
    keys.add("lombardia");
  }
  if (text.includes("siena") || text.includes("siena")) {
    keys.add("roma-siena");
    keys.add("firenze-siena");
  }
  if (text.includes("napoli") || text.includes("naples") || text.includes("positano") || text.includes("sorrento")) {
    keys.add("napoli-costiera");
  }

  if (keys.size === 0) {
    keys.add("umbria");
  }

  return [...keys];
}

export function suggestStaticPois(origin: string, destination: string): StaticPoi[] {
  const keys = detectRouteKeys(origin, destination);
  const matched = STATIC_POIS.filter((poi) => poi.routeKeys.some((k) => keys.includes(k)));
  const unique = new Map<string, StaticPoi>();
  for (const poi of matched) {
    unique.set(poi.id, poi);
  }
  return [...unique.values()].slice(0, 6);
}

export function getStaticPoiByIds(ids: string[]): StaticPoi[] {
  const set = new Set(ids);
  return STATIC_POIS.filter((p) => set.has(p.id));
}

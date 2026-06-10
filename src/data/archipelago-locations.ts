export type TourReach = "half-day" | "full-day";

export type ArchipelagoLocation = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  tourReach: TourReach;
  flyToZoom: number;
  geo: { lat: number; lng: number };
  subDestinations?: string[];
};

export const archipelagoLocations: ArchipelagoLocation[] = [
  {
    id: "telascica",
    slug: "telascica",
    name: "NP Telašćica",
    shortDescription:
      "Nature Park on the southern tip of Dugi Otok — dramatic cliffs, salt lake Mir, and secluded bays.",
    tourReach: "full-day",
    flyToZoom: 11,
    geo: { lat: 43.89888, lng: 15.18019 },
  },
  {
    id: "kornati",
    slug: "kornati",
    name: "NP Kornati",
    shortDescription:
      "A labyrinth of over a hundred islands — raw stone, turquoise channels, and pure Adriatic silence.",
    tourReach: "full-day",
    flyToZoom: 10.5,
    geo: { lat: 43.82076, lng: 15.25599 },
    subDestinations: ["Otok Žut", "Otok Levrnaka"],
  },
  {
    id: "saharun",
    slug: "saharun",
    name: "Saharun",
    shortDescription:
      "Iconic white-sand beach on the north of Dugi Otok — shallow turquoise water ideal for swimming.",
    tourReach: "full-day",
    flyToZoom: 12,
    geo: { lat: 44.13378, lng: 14.87194 },
  },
  {
    id: "potopljeni-brod",
    slug: "potopljeni-brod",
    name: "Potopljeni brod (Veli Rat)",
    shortDescription:
      "Wreck dive and snorkel spot near Veli Rat lighthouse — a memorable stop on Dugi Otok's north coast.",
    tourReach: "full-day",
    flyToZoom: 12,
    geo: { lat: 44.167, lng: 14.81163 },
  },
  {
    id: "titove-spilje",
    slug: "titove-spilje",
    name: "Titove špilje",
    shortDescription:
      "Historic sea caves on the island of Vis — crystal-clear water and a glimpse into Adriatic history.",
    tourReach: "full-day",
    flyToZoom: 11,
    geo: { lat: 43.03686, lng: 16.12102 },
  },
  {
    id: "golubinka",
    slug: "golubinka",
    name: "Golubinka",
    shortDescription:
      "Stunning sea cave on Dugi Otok — swim through the opening into luminous blue water inside.",
    tourReach: "full-day",
    flyToZoom: 11.5,
    geo: { lat: 44.05597, lng: 14.98574 },
  },
  {
    id: "vodenjak",
    slug: "vodenjak",
    name: "Vodenjak",
    shortDescription:
      "Sheltered cove on the island of Iž — calm anchorage perfect for a swim and lunch stop.",
    tourReach: "full-day",
    flyToZoom: 12,
    geo: { lat: 44.0, lng: 15.15 },
  },
  {
    id: "olib",
    slug: "olib",
    name: "Olib",
    shortDescription:
      "Peaceful northern island with sandy beaches and a timeless, car-free village atmosphere.",
    tourReach: "full-day",
    flyToZoom: 10.5,
    geo: { lat: 44.38019, lng: 14.77636 },
  },
  {
    id: "silba",
    slug: "silba",
    name: "Silba",
    shortDescription:
      "Charming island north of Zadar — pine-shaded shores, clear sea, and relaxed island life.",
    tourReach: "full-day",
    flyToZoom: 10.5,
    geo: { lat: 44.37339, lng: 14.69158 },
  },
  {
    id: "lazaret-osljak",
    slug: "lazaret-osljak",
    name: "Lazaret (Ošljak)",
    shortDescription:
      "Tiny island minutes from Zadar — the Lazaret bay offers a quick escape with a local feel.",
    tourReach: "half-day",
    flyToZoom: 12.5,
    geo: { lat: 44.07583, lng: 15.21 },
  },
  {
    id: "kostanj",
    slug: "kostanj",
    name: "Kostanj",
    shortDescription:
      "Popular swimming bay on Ugljan — pine trees, pebble beach, and calm Adriatic water.",
    tourReach: "half-day",
    flyToZoom: 12.5,
    geo: { lat: 44.04651, lng: 15.23673 },
  },
  {
    id: "frnaza",
    slug: "frnaza",
    name: "Frnaža",
    shortDescription:
      "Secluded cove on Ugljan island — ideal for a relaxed half-day swim and sun stop.",
    tourReach: "half-day",
    flyToZoom: 12.5,
    geo: { lat: 44.11687, lng: 15.13617 },
  },
  {
    id: "skoljic",
    slug: "skoljic",
    name: "Školjić",
    shortDescription:
      "Small islet (Galevac) off Preko — monastery ruins and crystal water reachable by boat.",
    tourReach: "half-day",
    flyToZoom: 12.5,
    geo: { lat: 44.08517, lng: 15.18831 },
  },
  {
    id: "preko",
    slug: "preko",
    name: "Preko",
    shortDescription:
      "Main ferry port on Ugljan — lively waterfront, cafés, and easy access to nearby coves.",
    tourReach: "half-day",
    flyToZoom: 12.5,
    geo: { lat: 44.07643, lng: 15.1945 },
  },
  {
    id: "kali",
    slug: "kali",
    name: "Kali",
    shortDescription:
      "Traditional fishing village on Ugljan — authentic atmosphere and excellent local seafood.",
    tourReach: "half-day",
    flyToZoom: 12.5,
    geo: { lat: 44.06278, lng: 15.20556 },
  },
  {
    id: "muline",
    slug: "muline",
    name: "Muline",
    shortDescription:
      "Quiet bay and harbour on Ugljan — a relaxed half-day anchorage with beautiful sunsets.",
    tourReach: "half-day",
    flyToZoom: 12.5,
    geo: { lat: 44.13882, lng: 15.07167 },
  },
];

export const ZADAR_ARBANASI = {
  name: "Zadar Arbanasi",
  geo: { lat: 44.123, lng: 15.2234 },
};

/** Vis is far SE — including it in the overview pulls Benkovac/Obrovac onto the map. */
export const DISTANT_OVERVIEW_LOCATION_ID = "titove-spilje";

const MAX_BOUNDS_PAD = 0.018;

export function isDistantOverviewLocation(locationId: string) {
  return locationId === DISTANT_OVERVIEW_LOCATION_ID;
}

export function getOverviewGeoPoints(options?: { includeDistantLocations?: boolean }) {
  const includeDistant = options?.includeDistantLocations ?? false;

  return [
    ZADAR_ARBANASI.geo,
    ...archipelagoLocations
      .filter(
        (location) => includeDistant || !isDistantOverviewLocation(location.id),
      )
      .map((location) => location.geo),
  ];
}

export function getArchipelagoBounds(options?: { includeDistantLocations?: boolean }) {
  const points = getOverviewGeoPoints(options);

  const raw = points.reduce(
    (bounds, point) => ({
      minLat: Math.min(bounds.minLat, point.lat),
      maxLat: Math.max(bounds.maxLat, point.lat),
      minLng: Math.min(bounds.minLng, point.lng),
      maxLng: Math.max(bounds.maxLng, point.lng),
    }),
    {
      minLat: points[0].lat,
      maxLat: points[0].lat,
      minLng: points[0].lng,
      maxLng: points[0].lng,
    },
  );

  return {
    minLat: raw.minLat - MAX_BOUNDS_PAD,
    maxLat: raw.maxLat + MAX_BOUNDS_PAD,
    minLng: raw.minLng - MAX_BOUNDS_PAD,
    maxLng: raw.maxLng + MAX_BOUNDS_PAD,
  };
}

export const archipelagoLocationsById = new Map(
  archipelagoLocations.map((location) => [location.id, location]),
);

export function getLocationsByReach(reach: TourReach): ArchipelagoLocation[] {
  return archipelagoLocations.filter((location) => location.tourReach === reach);
}

export function getLocationById(id: string): ArchipelagoLocation | undefined {
  return archipelagoLocationsById.get(id);
}

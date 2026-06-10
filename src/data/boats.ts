export type TourDuration = "half-day" | "full-day";
export type SkipperMode = "with-skipper" | "without-skipper";

export type TourOption = {
  id: string;
  title: string;
  duration: TourDuration;
  skipper: SkipperMode;
  maxGuests: number;
  fromPriceEur: number;
  highlights: string[];
};

export type Boat = {
  id: string;
  slug: string;
  name: string;
  type: string;
  location: string;
  shortDescription: string;
  longDescription: string;
  lengthMeters: number;
  capacity: number;
  engine: string;
  buildYear: number;
  basePriceFromEur: number;
  imagePlaceholder: string;
  tours: TourOption[];
  destinations: string[];
  // Future modules (phase 2+): booking, payments, admin sync.
  future: {
    seasonalPricingRef?: string;
    galleryAssetIds?: string[];
    availabilityCalendarRef?: string;
    bookingStatus?: "draft" | "active" | "paused";
    stripeProductId?: string;
    stripePriceIds?: string[];
    adminNotes?: string;
  };
};

export const boats: Boat[] = [
  {
    id: "boat-cap-camarat-65",
    slug: "cap-camarat-65-wa",
    name: "Cap Camarat 6.5 WA",
    type: "Walkaround",
    location: "Zadar Marina",
    shortDescription:
      "A versatile day boat for island hopping, swimming stops, and family trips.",
    longDescription:
      "Cap Camarat 6.5 WA is a reliable and comfortable choice for couples, families, and small groups looking for a premium but practical Adriatic day experience.",
    lengthMeters: 6.5,
    capacity: 7,
    engine: "Yamaha 150 HP",
    buildYear: 2018,
    basePriceFromEur: 300,
    imagePlaceholder: "Boat image coming soon",
    destinations: ["Kornati", "Telascica", "Sakarun"],
    tours: [
      {
        id: "cc65-half-no-skipper",
        title: "Half-Day Self Drive",
        duration: "half-day",
        skipper: "without-skipper",
        maxGuests: 7,
        fromPriceEur: 300,
        highlights: ["4 hours on sea", "Flexible route", "Snorkeling stops"],
      },
      {
        id: "cc65-half-skipper",
        title: "Half-Day With Skipper",
        duration: "half-day",
        skipper: "with-skipper",
        maxGuests: 7,
        fromPriceEur: 390,
        highlights: ["4 hours guided", "Local hidden bays", "Carefree cruising"],
      },
      {
        id: "cc65-full-no-skipper",
        title: "Full-Day Self Drive",
        duration: "full-day",
        skipper: "without-skipper",
        maxGuests: 7,
        fromPriceEur: 430,
        highlights: ["8 hours on sea", "Island hopping", "Freedom itinerary"],
      },
      {
        id: "cc65-full-skipper",
        title: "Full-Day With Skipper",
        duration: "full-day",
        skipper: "with-skipper",
        maxGuests: 7,
        fromPriceEur: 540,
        highlights: ["8 hours guided", "Best local spots", "Stress-free trip"],
      },
    ],
    future: {
      seasonalPricingRef: "TODO:season-cc65",
      availabilityCalendarRef: "TODO:calendar-cc65",
      bookingStatus: "draft",
    },
  },
  {
    id: "boat-atlantic-670",
    slug: "atlantic-marine-670",
    name: "Atlantic Marine 670",
    type: "Open",
    location: "Zadar Marina",
    shortDescription:
      "Spacious and dynamic boat ideal for groups wanting comfort and performance.",
    longDescription:
      "Atlantic Marine 670 offers extra deck space and stronger performance, making it perfect for active groups and longer full-day excursions around the archipelago.",
    lengthMeters: 6.7,
    capacity: 9,
    engine: "Yamaha 200 HP",
    buildYear: 2018,
    basePriceFromEur: 320,
    imagePlaceholder: "Boat image coming soon",
    destinations: ["Ugljan", "Osljak", "Dugi Otok"],
    tours: [
      {
        id: "a670-half-no-skipper",
        title: "Half-Day Self Drive",
        duration: "half-day",
        skipper: "without-skipper",
        maxGuests: 9,
        fromPriceEur: 320,
        highlights: ["4 hours on sea", "Family friendly", "Easy island access"],
      },
      {
        id: "a670-half-skipper",
        title: "Half-Day With Skipper",
        duration: "half-day",
        skipper: "with-skipper",
        maxGuests: 9,
        fromPriceEur: 430,
        highlights: ["4 hours guided", "Local captain", "Best swim stops"],
      },
      {
        id: "a670-full-no-skipper",
        title: "Full-Day Self Drive",
        duration: "full-day",
        skipper: "without-skipper",
        maxGuests: 9,
        fromPriceEur: 470,
        highlights: ["8 hours on sea", "Flexible route", "Private pace"],
      },
      {
        id: "a670-full-skipper",
        title: "Full-Day With Skipper",
        duration: "full-day",
        skipper: "with-skipper",
        maxGuests: 9,
        fromPriceEur: 590,
        highlights: ["8 hours guided", "Tailored itinerary", "Premium experience"],
      },
    ],
    future: {
      seasonalPricingRef: "TODO:season-a670",
      availabilityCalendarRef: "TODO:calendar-a670",
      bookingStatus: "draft",
    },
  },
];

export const boatsBySlug = new Map(boats.map((boat) => [boat.slug, boat]));

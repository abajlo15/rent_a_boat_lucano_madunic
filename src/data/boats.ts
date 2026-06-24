import { archipelagoLocations } from "@/data/archipelago-locations";

export type TourDuration = "half-day" | "full-day";
export type SkipperMode = "with-skipper" | "without-skipper";

export type DurationPricing = {
  baseEur: number;
  skipperSupplementEur: number;
};

export type BoatPricing = {
  halfDay: DurationPricing;
  fullDay: DurationPricing;
  /** When true, only with-skipper tours are offered at the listed base price. */
  skipperOnly?: boolean;
};

export type TourOption = {
  id: string;
  title: string;
  duration: TourDuration;
  skipper: SkipperMode;
  maxGuests: number;
  basePriceEur: number;
  skipperSupplementEur: number;
  fromPriceEur: number;
  skipperIncluded: boolean;
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
  pricing: BoatPricing;
  tours: TourOption[];
  destinations: string[];
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

const ALL_DESTINATION_SLUGS = archipelagoLocations.map((location) => location.slug);

function tourPrice(duration: DurationPricing, withSkipper: boolean) {
  return withSkipper
    ? duration.baseEur + duration.skipperSupplementEur
    : duration.baseEur;
}

function skipperIncluded(pricing: BoatPricing, duration: DurationPricing) {
  return Boolean(pricing.skipperOnly) || duration.skipperSupplementEur === 0;
}

export function buildTourOptions(
  boatId: string,
  pricing: BoatPricing,
  capacity: number,
): TourOption[] {
  const configs: {
    duration: TourDuration;
    pricingKey: "halfDay" | "fullDay";
    label: string;
    hours: string;
  }[] = [
    { duration: "half-day", pricingKey: "halfDay", label: "Half-Day", hours: "4 hours" },
    { duration: "full-day", pricingKey: "fullDay", label: "Full-Day", hours: "8 hours" },
  ];

  const tours: TourOption[] = [];

  for (const config of configs) {
    const durationPricing = pricing[config.pricingKey];
    const included = skipperIncluded(pricing, durationPricing);

    if (!pricing.skipperOnly) {
      tours.push({
        id: `${boatId}-${config.duration}-without-skipper`,
        title: `${config.label} Self Drive`,
        duration: config.duration,
        skipper: "without-skipper",
        maxGuests: capacity,
        basePriceEur: durationPricing.baseEur,
        skipperSupplementEur: 0,
        fromPriceEur: durationPricing.baseEur,
        skipperIncluded: false,
        highlights: [`${config.hours} on sea`, "Flexible route", "Your own pace"],
      });
    }

    tours.push({
      id: `${boatId}-${config.duration}-with-skipper`,
      title: pricing.skipperOnly
        ? `${config.label} With Skipper`
        : `${config.label} With Skipper`,
      duration: config.duration,
      skipper: "with-skipper",
      maxGuests: capacity,
      basePriceEur: durationPricing.baseEur,
      skipperSupplementEur: included ? 0 : durationPricing.skipperSupplementEur,
      fromPriceEur: tourPrice(durationPricing, true),
      skipperIncluded: included,
      highlights: included
        ? [`${config.hours} guided`, "Skipper included", "Carefree cruising"]
        : [`${config.hours} guided`, "Local captain", "Best swim stops"],
    });
  }

  return tours;
}

export function getBoatMinPriceEur(boat: Boat) {
  return Math.min(...boat.tours.map((tour) => tour.fromPriceEur));
}

export function getBoatToursForDuration(boat: Boat, duration: TourDuration) {
  return boat.tours.filter((tour) => tour.duration === duration);
}

export function getBoatMinPriceForDuration(boat: Boat, duration: TourDuration) {
  const tours = getBoatToursForDuration(boat, duration);
  return Math.min(...tours.map((tour) => tour.fromPriceEur));
}

export function getFleetMinPriceEur(
  duration: TourDuration,
  skipper?: SkipperMode,
) {
  const prices = boats
    .flatMap((boat) => boat.tours)
    .filter((tour) => tour.duration === duration)
    .filter((tour) => (skipper ? tour.skipper === skipper : true))
    .map((tour) => tour.fromPriceEur);

  return prices.length > 0 ? Math.min(...prices) : null;
}

type BoatSeed = Omit<Boat, "tours" | "basePriceFromEur">;

function createBoat(seed: BoatSeed): Boat {
  const tours = buildTourOptions(seed.id, seed.pricing, seed.capacity);

  return {
    ...seed,
    tours,
    basePriceFromEur: Math.min(...tours.map((tour) => tour.fromPriceEur)),
  };
}

const PLACEHOLDER_SPECS = {
  lengthMeters: 0,
  capacity: 8,
  engine: "Details coming soon",
  buildYear: 0,
  imagePlaceholder: "Boat image coming soon",
  location: "Zadar Marina",
  destinations: ALL_DESTINATION_SLUGS,
  future: { bookingStatus: "draft" as const },
};

export const boats: Boat[] = [
  createBoat({
    id: "boat-adex-29",
    slug: "adex-29",
    name: "ADEX 29",
    type: "Motor boat",
    shortDescription:
      "Comfortable motor boat with skipper included — ideal for relaxed full-day and half-day archipelago tours.",
    longDescription:
      "ADEX 29 is offered with a professional skipper included in the price. Technical specifications and gallery will be added soon.",
    pricing: {
      halfDay: { baseEur: 600, skipperSupplementEur: 0 },
      fullDay: { baseEur: 1000, skipperSupplementEur: 0 },
      skipperOnly: true,
    },
    ...PLACEHOLDER_SPECS,
    capacity: 10,
  }),
  createBoat({
    id: "boat-guma-velika",
    slug: "guma-velika",
    name: "Guma velika",
    type: "RIB",
    shortDescription:
      "Spacious RIB for active groups — self-drive or with an optional skipper.",
    longDescription:
      "Guma velika is a versatile inflatable boat for island hopping around Zadar. Full specifications coming soon.",
    pricing: {
      halfDay: { baseEur: 400, skipperSupplementEur: 60 },
      fullDay: { baseEur: 800, skipperSupplementEur: 120 },
    },
    ...PLACEHOLDER_SPECS,
    capacity: 10,
  }),
  createBoat({
    id: "boat-guma-manja",
    slug: "guma-manja",
    name: "Guma manja",
    type: "RIB",
    shortDescription:
      "Compact RIB for smaller groups — great value for half-day and full-day trips.",
    longDescription:
      "Guma manja offers a nimble ride for couples and small groups. Detailed specs and photos coming soon.",
    pricing: {
      halfDay: { baseEur: 350, skipperSupplementEur: 60 },
      fullDay: { baseEur: 550, skipperSupplementEur: 120 },
    },
    ...PLACEHOLDER_SPECS,
    capacity: 8,
  }),
  createBoat({
    id: "boat-qucci-guma",
    slug: "qucci-guma",
    name: "Qucci guma",
    type: "RIB",
    shortDescription:
      "Affordable RIB option for exploring nearby islands and swimming bays.",
    longDescription:
      "Qucci guma is the most accessible boat in our fleet. Specifications and gallery coming soon.",
    pricing: {
      halfDay: { baseEur: 200, skipperSupplementEur: 50 },
      fullDay: { baseEur: 350, skipperSupplementEur: 100 },
    },
    ...PLACEHOLDER_SPECS,
    capacity: 6,
  }),
  createBoat({
    id: "boat-quick-silver",
    slug: "quick-silver",
    name: "Quick Silver",
    type: "Open boat",
    shortDescription:
      "Open day boat for comfortable cruising — with or without skipper.",
    longDescription:
      "Quick Silver balances space and performance for archipelago day trips. Full details coming soon.",
    pricing: {
      halfDay: { baseEur: 250, skipperSupplementEur: 60 },
      fullDay: { baseEur: 500, skipperSupplementEur: 120 },
    },
    ...PLACEHOLDER_SPECS,
    capacity: 8,
  }),
];

export const boatsBySlug = new Map(boats.map((boat) => [boat.slug, boat]));

import type { TourReach } from "@/data/archipelago-locations";

type BoatDetailPathOptions = {
  destinationSlug?: string;
  duration?: TourReach;
};

export function boatsPagePath(destinationSlug?: string) {
  if (!destinationSlug) {
    return "/boats";
  }

  return `/boats?destination=${encodeURIComponent(destinationSlug)}`;
}

export function mapBookingPath(boatSlug: string, duration: TourReach) {
  return boatDetailPath(boatSlug, { duration });
}

export function boatDetailPath(boatSlug: string, options?: BoatDetailPathOptions) {
  const destinationSlug = options?.destinationSlug;
  const duration = options?.duration;

  if (!destinationSlug && !duration) {
    return `/boats/${boatSlug}`;
  }

  const params = new URLSearchParams();
  if (destinationSlug) {
    params.set("destination", destinationSlug);
  }
  if (duration) {
    params.set("duration", duration);
  }

  return `/boats/${boatSlug}?${params.toString()}`;
}

export function isTourReach(value: string | undefined): value is TourReach {
  return value === "half-day" || value === "full-day";
}

import type { ArchipelagoLocation } from "@/data/archipelago-locations";
import { ZADAR_ARBANASI } from "@/data/archipelago-locations";

export function locationsToGeoJson(locations: ArchipelagoLocation[]) {
  return {
    type: "FeatureCollection" as const,
    features: locations.map((location) => ({
      type: "Feature" as const,
      id: location.id,
      geometry: {
        type: "Point" as const,
        coordinates: [location.geo.lng, location.geo.lat] as [number, number],
      },
      properties: {
        id: location.id,
        name: location.name,
        tourReach: location.tourReach,
      },
    })),
  };
}

export const departurePointGeoJson = {
  type: "FeatureCollection" as const,
  features: [
    {
      type: "Feature" as const,
      id: "zadar-arbanasi",
      geometry: {
        type: "Point" as const,
        coordinates: [ZADAR_ARBANASI.geo.lng, ZADAR_ARBANASI.geo.lat] as [number, number],
      },
      properties: {
        name: ZADAR_ARBANASI.name,
      },
    },
  ],
};

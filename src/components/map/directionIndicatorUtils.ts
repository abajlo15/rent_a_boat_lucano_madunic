import type { Map as MaplibreMap } from "maplibre-gl";
import type { ArchipelagoLocation } from "@/data/archipelago-locations";

export type CardinalDirection = "n" | "e" | "s" | "w";

export type DirectionIndicator = {
  direction: CardinalDirection;
  locationId: string;
  locationName: string;
};

type GeoPoint = { lat: number; lng: number };

const EARTH_RADIUS_KM = 6371;
const DEFAULT_VISIBILITY_PADDING = 28;
const MIN_MAP_SIZE = 10;

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

export function bearingDegrees(from: GeoPoint, to: GeoPoint): number {
  const fromLat = toRadians(from.lat);
  const fromLng = toRadians(from.lng);
  const toLat = toRadians(to.lat);
  const toLng = toRadians(to.lng);
  const deltaLng = toLng - fromLng;

  const y = Math.sin(deltaLng) * Math.cos(toLat);
  const x =
    Math.cos(fromLat) * Math.sin(toLat) -
    Math.sin(fromLat) * Math.cos(toLat) * Math.cos(deltaLng);

  return (Math.atan2(y, x) * (180 / Math.PI) + 360) % 360;
}

export function haversineDistanceKm(from: GeoPoint, to: GeoPoint): number {
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getCardinalSector(bearing: number): CardinalDirection {
  const normalized = (bearing + 360) % 360;

  if (normalized >= 315 || normalized < 45) {
    return "n";
  }

  if (normalized < 135) {
    return "e";
  }

  if (normalized < 225) {
    return "s";
  }

  return "w";
}

export function isLocationVisibleOnMap(
  map: MaplibreMap,
  geo: GeoPoint,
  padding = DEFAULT_VISIBILITY_PADDING,
): boolean {
  const { width, height } = map.getContainer().getBoundingClientRect();

  if (width < MIN_MAP_SIZE || height < MIN_MAP_SIZE) {
    return false;
  }

  const point = map.project([geo.lng, geo.lat]);

  return (
    point.x >= padding &&
    point.x <= width - padding &&
    point.y >= padding &&
    point.y <= height - padding
  );
}

export function computeDirectionIndicators(
  map: MaplibreMap,
  selected: ArchipelagoLocation,
  locations: ArchipelagoLocation[],
): DirectionIndicator[] {
  const others = locations.filter((location) => location.id !== selected.id);

  if (others.length === 0) {
    return [];
  }

  const bySector = new Map<CardinalDirection, ArchipelagoLocation[]>();

  for (const location of others) {
    const bearing = bearingDegrees(selected.geo, location.geo);
    const sector = getCardinalSector(bearing);
    const sectorLocations = bySector.get(sector) ?? [];
    sectorLocations.push(location);
    bySector.set(sector, sectorLocations);
  }

  const indicators: DirectionIndicator[] = [];

  for (const [direction, candidates] of bySector) {
    const hasVisibleInSector = candidates.some((location) =>
      isLocationVisibleOnMap(map, location.geo),
    );

    if (hasVisibleInSector) {
      continue;
    }

    const nearest = candidates.reduce((best, location) =>
      haversineDistanceKm(selected.geo, location.geo) <
      haversineDistanceKm(selected.geo, best.geo)
        ? location
        : best,
    );

    indicators.push({
      direction,
      locationId: nearest.id,
      locationName: nearest.name,
    });
  }

  return indicators;
}

import maplibregl, { type Map } from "maplibre-gl";
import {
  ZADAR_ARBANASI,
  archipelagoLocations,
  isDistantOverviewLocation,
  type ArchipelagoLocation,
  type TourReach,
} from "@/data/archipelago-locations";

export type ReachFilter = "all" | TourReach;

type GeoPoint = { lat: number; lng: number };

type FitCameraOptions = {
  maxZoom?: number;
};

const VIEWPORT_PADDING = {
  top: 52,
  right: 40,
  bottom: 32,
  left: 40,
} as const;

const ALL_OVERVIEW_CAMERA: FitCameraOptions = {
  maxZoom: 10.5,
};

const HALF_DAY_CAMERA: FitCameraOptions = {
  maxZoom: 13.2,
};

const FULL_DAY_CAMERA: FitCameraOptions = {
  maxZoom: 10.8,
};

function getOverviewGeoPoints() {
  return [
    ZADAR_ARBANASI.geo,
    ...archipelagoLocations
      .filter((location) => !isDistantOverviewLocation(location.id))
      .map((location) => location.geo),
  ];
}

export function getPointsForReachFilter(reachFilter: ReachFilter): GeoPoint[] {
  if (reachFilter === "all") {
    return getOverviewGeoPoints();
  }

  return [
    ZADAR_ARBANASI.geo,
    ...archipelagoLocations
      .filter(
        (location) =>
          location.tourReach === reachFilter &&
          !isDistantOverviewLocation(location.id),
      )
      .map((location) => location.geo),
  ];
}

export function getFitCameraOptions(reachFilter: ReachFilter): FitCameraOptions {
  if (reachFilter === "all") {
    return ALL_OVERVIEW_CAMERA;
  }

  if (reachFilter === "half-day") {
    return HALF_DAY_CAMERA;
  }

  return FULL_DAY_CAMERA;
}

function getBoundsForReachFilter(reachFilter: ReachFilter) {
  const points = getPointsForReachFilter(reachFilter);
  const bounds = new maplibregl.LngLatBounds();

  for (const point of points) {
    bounds.extend([point.lng, point.lat]);
  }

  return bounds;
}

function hasUsableMapSize(map: Map) {
  const { width, height } = map.getContainer().getBoundingClientRect();
  return width >= 10 && height >= 10;
}

export function disableFreeNavigation(map: Map) {
  map.dragPan.disable();
  map.scrollZoom.disable();
  map.boxZoom.disable();
  map.dragRotate.disable();
  map.keyboard.disable();
  map.doubleClickZoom.disable();
  map.touchZoomRotate.disable();
}

export function fitMapToReachFilter(
  map: Map,
  reachFilter: ReachFilter,
  options?: { animate?: boolean; duration?: number },
): boolean {
  if (!map.isStyleLoaded() || !hasUsableMapSize(map)) {
    return false;
  }

  const { maxZoom = ALL_OVERVIEW_CAMERA.maxZoom! } = getFitCameraOptions(reachFilter);
  const bounds = getBoundsForReachFilter(reachFilter);
  const duration = options?.animate === false ? 0 : (options?.duration ?? 900);

  map.resize();

  const camera = map.cameraForBounds(bounds, {
    padding: VIEWPORT_PADDING,
    maxZoom,
  });

  if (!camera?.center || camera.zoom === undefined) {
    return false;
  }

  if (duration === 0) {
    map.jumpTo({
      center: camera.center,
      zoom: camera.zoom,
    });
  } else {
    map.easeTo({
      center: camera.center,
      zoom: camera.zoom,
      duration,
    });
  }

  return true;
}

export function scheduleFitMapToReachFilter(
  map: Map,
  reachFilter: ReachFilter,
  options?: { animate?: boolean; duration?: number },
  onSuccess?: () => void,
) {
  let attempts = 0;
  const maxAttempts = 60;

  const tryFit = () => {
    if (fitMapToReachFilter(map, reachFilter, options)) {
      onSuccess?.();
      return;
    }

    attempts += 1;
    if (attempts < maxAttempts) {
      requestAnimationFrame(tryFit);
    }
  };

  if (!map.isStyleLoaded()) {
    map.once("load", tryFit);
    return;
  }

  tryFit();
}

export type FlyTransition = "initial" | "hop";

type FlyToLocationOptions = {
  duration?: number;
  animate?: boolean;
  transition?: FlyTransition;
  onSettled?: () => void;
};

export function getVisibleLocationIds(
  map: Map,
  locations: ArchipelagoLocation[],
): string[] {
  if (!map.isStyleLoaded() || !hasUsableMapSize(map)) {
    return [];
  }

  const { width, height } = map.getContainer().getBoundingClientRect();

  return locations
    .filter((location) => {
      const point = map.project([location.geo.lng, location.geo.lat]);

      return (
        point.x >= VIEWPORT_PADDING.left &&
        point.x <= width - VIEWPORT_PADDING.right &&
        point.y >= VIEWPORT_PADDING.top &&
        point.y <= height - VIEWPORT_PADDING.bottom
      );
    })
    .map((location) => location.id);
}

export function flyToLocation(
  map: Map,
  location: ArchipelagoLocation,
  options?: FlyToLocationOptions,
) {
  if (!map.isStyleLoaded()) {
    return;
  }

  const transition = options?.transition ?? "initial";
  const duration =
    options?.animate === false
      ? 0
      : (options?.duration ?? (transition === "hop" ? 900 : 1400));

  const finish = () => {
    options?.onSettled?.();
  };

  if (duration === 0) {
    map.jumpTo({
      center: [location.geo.lng, location.geo.lat],
      zoom: location.flyToZoom,
    });
    finish();
    return;
  }

  const onMoveEnd = () => {
    map.off("moveend", onMoveEnd);
    finish();
  };

  map.on("moveend", onMoveEnd);
  window.setTimeout(() => {
    map.off("moveend", onMoveEnd);
    finish();
  }, duration + 120);

  if (transition === "hop") {
    map.easeTo({
      center: [location.geo.lng, location.geo.lat],
      zoom: location.flyToZoom,
      duration,
      essential: true,
    });
    return;
  }

  map.flyTo({
    center: [location.geo.lng, location.geo.lat],
    zoom: location.flyToZoom,
    duration,
    curve: 1.4,
    speed: 0.8,
    essential: true,
  });
}

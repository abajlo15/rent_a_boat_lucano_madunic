import maplibregl, { type Map } from "maplibre-gl";
import {
  ZADAR_ARBANASI,
  archipelagoLocations,
  isDistantOverviewLocation,
} from "@/data/archipelago-locations";

export type LockedCamera = {
  center: [number, number];
  zoom: number;
};

const VIEWPORT_PADDING = {
  top: 52,
  right: 40,
  bottom: 32,
  left: 40,
} as const;

function getOverviewGeoPoints() {
  return [
    ZADAR_ARBANASI.geo,
    ...archipelagoLocations
      .filter((location) => !isDistantOverviewLocation(location.id))
      .map((location) => location.geo),
  ];
}

export function getOverviewLngLatBounds() {
  const points = getOverviewGeoPoints();

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

  return new maplibregl.LngLatBounds(
    [raw.minLng, raw.minLat],
    [raw.maxLng, raw.maxLat],
  );
}

function areAllPointsVisible(map: Map) {
  const points = getOverviewGeoPoints();
  const width = map.getContainer().clientWidth;
  const height = map.getContainer().clientHeight;

  if (width === 0 || height === 0) {
    return false;
  }

  for (const point of points) {
    const { x, y } = map.project([point.lng, point.lat]);

    if (
      x < VIEWPORT_PADDING.left ||
      x > width - VIEWPORT_PADDING.right ||
      y < VIEWPORT_PADDING.top ||
      y > height - VIEWPORT_PADDING.bottom
    ) {
      return false;
    }
  }

  return true;
}

function getOverviewCenter(): [number, number] {
  const points = getOverviewGeoPoints();
  const total = points.length;

  const lng = points.reduce((sum, point) => sum + point.lng, 0) / total;
  const lat = points.reduce((sum, point) => sum + point.lat, 0) / total;

  return [lng, lat];
}

export function fitOverviewCamera(map: Map): LockedCamera {
  const center = getOverviewCenter();

  map.setMinZoom(0);
  map.setMaxZoom(22);
  map.setCenter(center);

  let low = 5.4;
  let high = 10.5;
  let bestZoom = high;

  for (let i = 0; i < 28; i++) {
    const mid = (low + high) / 2;
    map.setZoom(mid);
    map.setCenter(center);

    if (areAllPointsVisible(map)) {
      bestZoom = mid;
      high = mid;
    } else {
      low = mid;
    }
  }

  const zoom = Math.max(5.4, bestZoom - 0.12);
  map.setZoom(zoom);
  map.setCenter(center);

  return { center, zoom };
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

export function lockCamera(map: Map, camera: LockedCamera) {
  map.setMaxBounds(null);
  map.jumpTo({
    center: camera.center,
    zoom: camera.zoom,
  });
  map.setMinZoom(camera.zoom);
  map.setMaxZoom(camera.zoom);
}

export function unlockForLocationZoom(map: Map, targetZoom: number) {
  map.setMaxBounds(null);
  map.setMinZoom(targetZoom);
  map.setMaxZoom(Math.max(targetZoom, 14));
}

"use client";

import { useEffect, useRef } from "react";
import maplibregl, { type Map, type MapLayerMouseEvent, type MapMouseEvent } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { ArchipelagoLocation } from "@/data/archipelago-locations";
import { ZADAR_ARBANASI, getLocationById } from "@/data/archipelago-locations";
import { departurePointGeoJson, locationsToGeoJson } from "@/components/map/locationsGeoJson";
import {
  disableFreeNavigation,
  fitOverviewCamera,
  lockCamera,
  unlockForLocationZoom,
  type LockedCamera,
} from "@/components/map/mapCamera";

const MAP_STYLE = "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";

const LOCATIONS_SOURCE = "locations";
const DEPARTURE_SOURCE = "departure";
const LOCATION_CIRCLES_LAYER = "location-circles";
const LOCATION_HALO_LAYER = "location-halo";
const LOCATION_LABELS_LAYER = "location-labels";
const DEPARTURE_LAYER = "departure-point";
const DEPARTURE_LABEL_LAYER = "departure-label";

type ArchipelagoMapLibreProps = {
  locations: ArchipelagoLocation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onReset: () => void;
};

function addMapLayers(map: Map) {
  map.addSource(DEPARTURE_SOURCE, {
    type: "geojson",
    data: departurePointGeoJson,
  });

  map.addSource(LOCATIONS_SOURCE, {
    type: "geojson",
    promoteId: "id",
    data: locationsToGeoJson([]),
  });

  map.addLayer({
    id: LOCATION_HALO_LAYER,
    type: "circle",
    source: LOCATIONS_SOURCE,
    paint: {
      "circle-radius": [
        "case",
        ["boolean", ["feature-state", "selected"], false],
        22,
        0,
      ],
      "circle-color": "#0891b2",
      "circle-opacity": 0.25,
      "circle-stroke-width": 2,
      "circle-stroke-color": "#0891b2",
      "circle-stroke-opacity": 0.5,
    },
  });

  map.addLayer({
    id: LOCATION_CIRCLES_LAYER,
    type: "circle",
    source: LOCATIONS_SOURCE,
    paint: {
      "circle-radius": [
        "case",
        ["boolean", ["feature-state", "selected"], false],
        ["match", ["get", "tourReach"], "half-day", 13, 15],
        ["match", ["get", "tourReach"], "half-day", 9, 11],
      ],
      "circle-color": [
        "match",
        ["get", "tourReach"],
        "half-day",
        "#0891b2",
        "#0f172a",
      ],
      "circle-opacity": [
        "case",
        ["boolean", ["feature-state", "dimmed"], false],
        0.4,
        1,
      ],
      "circle-stroke-width": 2,
      "circle-stroke-color": "#ffffff",
    },
  });

  map.addLayer({
    id: LOCATION_LABELS_LAYER,
    type: "symbol",
    source: LOCATIONS_SOURCE,
    layout: {
      "text-field": ["get", "name"],
      "text-size": 12,
      "text-offset": [0, -1.6],
      "text-anchor": "bottom",
      "text-max-width": 10,
      "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
    },
    paint: {
      "text-color": "#0f172a",
      "text-halo-color": "#ffffff",
      "text-halo-width": 1.5,
      "text-opacity": [
        "case",
        ["boolean", ["feature-state", "dimmed"], false],
        0.45,
        1,
      ],
    },
  });

  map.addLayer({
    id: DEPARTURE_LAYER,
    type: "circle",
    source: DEPARTURE_SOURCE,
    paint: {
      "circle-radius": 9,
      "circle-color": "#0f172a",
      "circle-stroke-width": 2,
      "circle-stroke-color": "#ffffff",
    },
  });

  map.addLayer({
    id: DEPARTURE_LABEL_LAYER,
    type: "symbol",
    source: DEPARTURE_SOURCE,
    layout: {
      "text-field": ["get", "name"],
      "text-size": 12,
      "text-offset": [0, -1.4],
      "text-anchor": "bottom",
      "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
    },
    paint: {
      "text-color": "#0f172a",
      "text-halo-color": "#ffffff",
      "text-halo-width": 2,
    },
  });
}

export function ArchipelagoMapLibre({
  locations,
  selectedId,
  onSelect,
  onReset,
}: ArchipelagoMapLibreProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const overviewCameraRef = useRef<LockedCamera | null>(null);
  const hadSelectionRef = useRef(false);
  const locationsRef = useRef(locations);
  const selectedIdRef = useRef(selectedId);
  const onSelectRef = useRef(onSelect);
  const onResetRef = useRef(onReset);

  locationsRef.current = locations;
  selectedIdRef.current = selectedId;
  onSelectRef.current = onSelect;
  onResetRef.current = onReset;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: [ZADAR_ARBANASI.geo.lng, ZADAR_ARBANASI.geo.lat],
      zoom: 8,
    });

    const syncOverview = (animate = false) => {
      if (!map.isStyleLoaded()) {
        return;
      }

      const applyLock = () => {
        overviewCameraRef.current = fitOverviewCamera(map);
        lockCamera(map, overviewCameraRef.current);
      };

      if (animate && overviewCameraRef.current) {
        map.flyTo({
          center: overviewCameraRef.current.center,
          zoom: overviewCameraRef.current.zoom,
          duration: 900,
          essential: true,
        });
        map.once("moveend", applyLock);
        return;
      }

      applyLock();
    };

    map.on("load", () => {
      addMapLayers(map);
      disableFreeNavigation(map);

      const source = map.getSource(LOCATIONS_SOURCE) as maplibregl.GeoJSONSource;
      source.setData(locationsToGeoJson(locationsRef.current));

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          map.resize();
          syncOverview(false);
        });
      });
    });

    const handleLocationClick = (event: MapLayerMouseEvent) => {
      const feature = event.features?.[0];
      const id = feature?.properties?.id;

      if (typeof id === "string") {
        onSelectRef.current(id);
      }
    };

    const handleMapClick = (event: MapMouseEvent) => {
      const features = map.queryRenderedFeatures(event.point, {
        layers: [LOCATION_CIRCLES_LAYER, DEPARTURE_LAYER],
      });

      if (features.length === 0) {
        onResetRef.current();
      }
    };

    const setPointerCursor = () => {
      map.getCanvas().style.cursor = "pointer";
    };

    const resetCursor = () => {
      map.getCanvas().style.cursor = "";
    };

    map.on("click", LOCATION_CIRCLES_LAYER, handleLocationClick);
    map.on("click", handleMapClick);
    map.on("mouseenter", LOCATION_CIRCLES_LAYER, setPointerCursor);
    map.on("mouseleave", LOCATION_CIRCLES_LAYER, resetCursor);

    mapRef.current = map;

    const resizeObserver = new ResizeObserver(() => {
      map.resize();
      if (!map.isStyleLoaded() || selectedIdRef.current) {
        return;
      }

      overviewCameraRef.current = fitOverviewCamera(map);
      lockCamera(map, overviewCameraRef.current);
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
      overviewCameraRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) {
      return;
    }

    const source = map.getSource(LOCATIONS_SOURCE) as maplibregl.GeoJSONSource | undefined;
    source?.setData(locationsToGeoJson(locations));
  }, [locations]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) {
      return;
    }

    for (const location of locations) {
      map.setFeatureState(
        { source: LOCATIONS_SOURCE, id: location.id },
        {
          selected: location.id === selectedId,
          dimmed: selectedId !== null && location.id !== selectedId,
        },
      );
    }
  }, [locations, selectedId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) {
      return;
    }

    if (!selectedId) {
      if (hadSelectionRef.current) {
        overviewCameraRef.current = fitOverviewCamera(map);
        map.flyTo({
          center: overviewCameraRef.current.center,
          zoom: overviewCameraRef.current.zoom,
          duration: 900,
          essential: true,
        });
        map.once("moveend", () => {
          if (overviewCameraRef.current) {
            lockCamera(map, overviewCameraRef.current);
          }
        });
      }
      hadSelectionRef.current = false;
      return;
    }

    hadSelectionRef.current = true;

    const location = getLocationById(selectedId);
    if (!location) {
      return;
    }

    unlockForLocationZoom(map, location.flyToZoom);

    map.flyTo({
      center: [location.geo.lng, location.geo.lat],
      zoom: location.flyToZoom,
      duration: 1200,
      essential: true,
    });

    map.once("moveend", () => {
      const zoom = map.getZoom();
      map.setMinZoom(zoom);
      map.setMaxZoom(zoom);
    });
  }, [selectedId]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full touch-none"
      role="application"
      aria-label="Interactive MapLibre map of the Zadar archipelago"
    />
  );
}

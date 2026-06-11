"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import maplibregl, { type Map, type MapLayerMouseEvent, type MapMouseEvent } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { ArchipelagoLocation } from "@/data/archipelago-locations";
import { ZADAR_ARBANASI, getLocationById } from "@/data/archipelago-locations";
import { departurePointGeoJson, locationsToGeoJson } from "@/components/map/locationsGeoJson";
import {
  disableFreeNavigation,
  flyToLocation,
  getVisibleLocationIds,
  scheduleFitMapToReachFilter,
  type ReachFilter,
} from "@/components/map/mapCamera";
import { LocationMarkerCallout } from "@/components/map/LocationMarkerCallout";
import type { CalloutAnchor, CalloutContainerSize } from "@/components/map/calloutPlacement";
import { MapDirectionIndicators } from "@/components/map/MapDirectionIndicators";
import {
  computeDirectionIndicators,
  type DirectionIndicator,
} from "@/components/map/directionIndicatorUtils";
import { applyMarineBlueTheme } from "@/components/map/mapStyleTheme";

const MAP_STYLE = "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";

const LOCATIONS_SOURCE = "locations";
const DEPARTURE_SOURCE = "departure";
const LOCATION_PULSE_LAYER = "location-pulse";
const LOCATION_CIRCLES_LAYER = "location-circles";
const LOCATION_HALO_LAYER = "location-halo";
const LOCATION_LABELS_LAYER = "location-labels";
const DEPARTURE_LAYER = "departure-point";
const DEPARTURE_LABEL_LAYER = "departure-label";

export type ArchipelagoMapHandle = {
  fitToFilter: (reachFilter: ReachFilter) => void;
};

type ArchipelagoMapLibreProps = {
  locations: ArchipelagoLocation[];
  reachFilter: ReachFilter;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onReset: () => void;
  onMapReady?: (handle: ArchipelagoMapHandle) => void;
};

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return isMobile;
}

function applyMarkerTransitions(map: Map) {
  map.setPaintProperty(LOCATION_PULSE_LAYER, "circle-radius-transition", {
    duration: 500,
  });
  map.setPaintProperty(LOCATION_PULSE_LAYER, "circle-opacity-transition", {
    duration: 500,
  });
  map.setPaintProperty(LOCATION_HALO_LAYER, "circle-radius-transition", {
    duration: 400,
  });
  map.setPaintProperty(LOCATION_CIRCLES_LAYER, "circle-radius-transition", {
    duration: 300,
  });
  map.setPaintProperty(LOCATION_CIRCLES_LAYER, "circle-opacity-transition", {
    duration: 300,
  });
  map.setPaintProperty(LOCATION_LABELS_LAYER, "text-opacity-transition", {
    duration: 300,
  });
}

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
    id: LOCATION_PULSE_LAYER,
    type: "circle",
    source: LOCATIONS_SOURCE,
    paint: {
      "circle-radius": [
        "case",
        ["boolean", ["feature-state", "pulsing"], false],
        32,
        0,
      ],
      "circle-color": "#60a5fa",
      "circle-opacity": 0.35,
      "circle-stroke-width": 0,
    },
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
      "circle-color": "#3b82f6",
      "circle-opacity": 0.28,
      "circle-stroke-width": 2,
      "circle-stroke-color": "#2563eb",
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
        "#2563eb",
        "#1e40af",
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
      "circle-color": "#1d4ed8",
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

export const ArchipelagoMapLibre = forwardRef<ArchipelagoMapHandle, ArchipelagoMapLibreProps>(
  function ArchipelagoMapLibre(
    {
      locations,
      reachFilter,
      selectedId,
      onSelect,
      onReset,
      onMapReady,
    },
    ref,
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<Map | null>(null);
    const initialFitDoneRef = useRef(false);
    const pendingFilterRef = useRef<ReachFilter | null>(null);
    const hadSelectionRef = useRef(false);
    const previousSelectedIdRef = useRef<string | null>(null);
    const locationsRef = useRef(locations);
    const reachFilterRef = useRef(reachFilter);
    const selectedIdRef = useRef(selectedId);
    const onSelectRef = useRef(onSelect);
    const onResetRef = useRef(onReset);
    const onMapReadyRef = useRef(onMapReady);
    const indicatorGenerationRef = useRef(0);
    const recomputeIndicatorsRef = useRef<() => void>(() => {});
    const syncVisibleLocationsRef = useRef<() => void>(() => {});

    const [mapReady, setMapReady] = useState(false);
    const [visibleLocationIds, setVisibleLocationIds] = useState<string[]>([]);
    const [directionIndicators, setDirectionIndicators] = useState<DirectionIndicator[]>(
      [],
    );
    const [calloutAnchor, setCalloutAnchor] = useState<CalloutAnchor | null>(null);
    const [calloutContainerSize, setCalloutContainerSize] = useState<CalloutContainerSize>({
      width: 0,
      height: 0,
    });
    const [calloutInView, setCalloutInView] = useState(false);

    const isMobile = useIsMobile();

    locationsRef.current = locations;
    reachFilterRef.current = reachFilter;
    selectedIdRef.current = selectedId;
    onSelectRef.current = onSelect;
    onResetRef.current = onReset;
    onMapReadyRef.current = onMapReady;

    const selectedLocation = selectedId ? getLocationById(selectedId) ?? null : null;

    const updateCalloutAnchor = useCallback(() => {
      const map = mapRef.current;
      const id = selectedIdRef.current;

      if (!map || !id || !map.isStyleLoaded()) {
        setCalloutAnchor(null);
        setCalloutInView(false);
        return;
      }

      const location = getLocationById(id);
      if (!location) {
        setCalloutAnchor(null);
        setCalloutInView(false);
        return;
      }

      const point = map.project([location.geo.lng, location.geo.lat]);
      const { width, height } = map.getContainer().getBoundingClientRect();

      setCalloutAnchor({ x: point.x, y: point.y });
      setCalloutContainerSize({ width, height });
      setCalloutInView(
        point.x >= 0 && point.x <= width && point.y >= 0 && point.y <= height,
      );
    }, []);

    const recomputeDirectionIndicators = useCallback(() => {
      const map = mapRef.current;
      const id = selectedIdRef.current;

      if (!map || !id || !map.isStyleLoaded()) {
        setDirectionIndicators([]);
        return;
      }

      const location = getLocationById(id);
      if (!location) {
        setDirectionIndicators([]);
        return;
      }

      setDirectionIndicators(
        computeDirectionIndicators(map, location, locationsRef.current),
      );
    }, []);

    recomputeIndicatorsRef.current = recomputeDirectionIndicators;

    const syncVisibleLocations = useCallback(() => {
      const map = mapRef.current;

      if (!map || !selectedIdRef.current || !map.isStyleLoaded()) {
        setVisibleLocationIds([]);
        return;
      }

      const ids = getVisibleLocationIds(map, locationsRef.current);
      setVisibleLocationIds(ids);
    }, []);

    syncVisibleLocationsRef.current = syncVisibleLocations;

    const syncAfterCameraMove = useCallback(() => {
      recomputeDirectionIndicators();
      syncVisibleLocations();
      updateCalloutAnchor();
    }, [recomputeDirectionIndicators, syncVisibleLocations, updateCalloutAnchor]);

    const createMapHandle = (): ArchipelagoMapHandle => ({
      fitToFilter(filter) {
        const map = mapRef.current;
        if (!map) {
          pendingFilterRef.current = filter;
          return;
        }

        pendingFilterRef.current = null;
        scheduleFitMapToReachFilter(map, filter, { animate: true });
      },
    });

    useImperativeHandle(ref, createMapHandle, []);

    useEffect(() => {
      if (!containerRef.current || mapRef.current) {
        return;
      }

      const map = new maplibregl.Map({
        container: containerRef.current,
        style: MAP_STYLE,
        center: [ZADAR_ARBANASI.geo.lng, ZADAR_ARBANASI.geo.lat],
        zoom: 8,
        attributionControl: false,
      });

      const runInitialFit = () => {
        if (initialFitDoneRef.current) {
          return;
        }

        scheduleFitMapToReachFilter(
          map,
          reachFilterRef.current,
          { animate: false },
          () => {
            if (initialFitDoneRef.current) {
              return;
            }

            initialFitDoneRef.current = true;
            setMapReady(true);
            const handle = createMapHandle();
            onMapReadyRef.current?.(handle);

            if (pendingFilterRef.current) {
              handle.fitToFilter(pendingFilterRef.current);
            }
          },
        );
      };

      map.on("load", () => {
        applyMarineBlueTheme(map);
        addMapLayers(map);
        applyMarkerTransitions(map);
        disableFreeNavigation(map);

        const source = map.getSource(LOCATIONS_SOURCE) as maplibregl.GeoJSONSource;
        source.setData(locationsToGeoJson(locationsRef.current));

        runInitialFit();
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

        if (!initialFitDoneRef.current && map.isStyleLoaded()) {
          runInitialFit();
          return;
        }

        if (selectedIdRef.current) {
          syncVisibleLocationsRef.current();
          recomputeIndicatorsRef.current();
        }
      });
      resizeObserver.observe(containerRef.current);

      return () => {
        resizeObserver.disconnect();
        map.remove();
        mapRef.current = null;
        setMapReady(false);
        initialFitDoneRef.current = false;
        hadSelectionRef.current = false;
        previousSelectedIdRef.current = null;
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
      if (!map || !mapReady || !map.isStyleLoaded()) {
        return;
      }

      if (selectedId) {
        hadSelectionRef.current = true;

        if (previousSelectedIdRef.current !== selectedId) {
          const location = getLocationById(selectedId);
          if (!location) {
            return;
          }

          const transition = previousSelectedIdRef.current ? "hop" : "initial";

          flyToLocation(map, location, {
            animate: true,
            transition,
            onSettled: syncAfterCameraMove,
          });

          previousSelectedIdRef.current = selectedId;
        }

        return;
      }

      setDirectionIndicators([]);
      setVisibleLocationIds([]);
      setCalloutAnchor(null);
      setCalloutInView(false);
      previousSelectedIdRef.current = null;

      if (hadSelectionRef.current) {
        hadSelectionRef.current = false;
        scheduleFitMapToReachFilter(map, reachFilterRef.current, { animate: true });
      }
    }, [selectedId, mapReady, syncAfterCameraMove]);

    useEffect(() => {
      const map = mapRef.current;
      if (!map || !mapReady || !map.isStyleLoaded()) {
        return;
      }

      if (!selectedId) {
        return;
      }

      const generation = ++indicatorGenerationRef.current;

      const handleMoveEnd = () => {
        if (generation !== indicatorGenerationRef.current) {
          return;
        }

        syncAfterCameraMove();
      };

      map.on("moveend", handleMoveEnd);

      if (!map.isMoving()) {
        handleMoveEnd();
      }

      return () => {
        map.off("moveend", handleMoveEnd);
      };
    }, [selectedId, locations, mapReady, syncAfterCameraMove]);

    useEffect(() => {
      const map = mapRef.current;
      if (!map || !selectedId) {
        return;
      }

      const handleMove = () => {
        updateCalloutAnchor();
      };

      map.on("move", handleMove);
      updateCalloutAnchor();

      return () => {
        map.off("move", handleMove);
      };
    }, [selectedId, mapReady, updateCalloutAnchor]);

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
            dimmed:
              selectedId !== null &&
              location.id !== selectedId &&
              !visibleLocationIds.includes(location.id),
          },
        );
      }
    }, [locations, selectedId, visibleLocationIds]);

    useEffect(() => {
      const map = mapRef.current;
      if (!map || !map.isStyleLoaded() || !selectedId) {
        return;
      }

      map.setFeatureState(
        { source: LOCATIONS_SOURCE, id: selectedId },
        { pulsing: true },
      );

      const timeout = window.setTimeout(() => {
        if (!mapRef.current?.isStyleLoaded()) {
          return;
        }

        map.setFeatureState(
          { source: LOCATIONS_SOURCE, id: selectedId },
          { pulsing: false },
        );
      }, 480);

      return () => {
        window.clearTimeout(timeout);
      };
    }, [selectedId]);

    return (
      <div className="relative h-full w-full">
        <div
          ref={containerRef}
          className="h-full w-full touch-none"
          role="application"
          aria-label="Interactive MapLibre map of the Zadar archipelago"
        />
        <MapDirectionIndicators
          indicators={directionIndicators}
          onNavigate={onSelect}
        />
        {selectedLocation && (isMobile || calloutInView) && (
          <LocationMarkerCallout
            location={selectedLocation}
            onClose={onReset}
            variant={isMobile ? "sheet" : "anchored"}
            anchor={calloutAnchor ?? undefined}
            containerSize={calloutContainerSize}
          />
        )}
      </div>
    );
  },
);

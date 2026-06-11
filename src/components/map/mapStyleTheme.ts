import type { Map } from "maplibre-gl";

const CARTO_SOURCE = "carto";

const MARINE_BLUE = {
  water: "#9ec9ef",
  waterDepth: "#78b0e3",
  coastline: "#5ba8e8",
  waterway: "#6baee0",
  land: "#152a45",
  landAccent: "#1a3354",
  landDetail: "#1e3d63",
  boundary: "#2d5a8a",
} as const;

const COASTLINE_LAYER = "marine-coastline";

const LAND_LAYERS: { id: string; property: string; color: string }[] = [
  { id: "background", property: "background-color", color: MARINE_BLUE.land },
  { id: "landcover", property: "fill-color", color: MARINE_BLUE.landAccent },
  { id: "park_national_park", property: "fill-color", color: MARINE_BLUE.landDetail },
  { id: "park_nature_reserve", property: "fill-color", color: MARINE_BLUE.landDetail },
  { id: "landuse_residential", property: "fill-color", color: MARINE_BLUE.landAccent },
  { id: "landuse", property: "fill-color", color: MARINE_BLUE.landAccent },
  { id: "building", property: "fill-color", color: MARINE_BLUE.landDetail },
  { id: "building-top", property: "fill-color", color: "#234a73" },
];

const PLACE_LABEL_LAYERS = [
  "place_hamlet",
  "place_suburbs",
  "place_villages",
  "place_town",
  "place_country_2",
  "place_country_1",
  "place_state",
  "place_continent",
  "place_city_r6",
  "place_city_r5",
  "place_city_dot_r7",
  "place_city_dot_r4",
  "place_city_dot_r2",
  "place_city_dot_z7",
  "place_capital_dot_z7",
] as const;

const ROADNAME_LAYERS = [
  "roadname_minor",
  "roadname_sec",
  "roadname_pri",
  "roadname_major",
] as const;

function setPaintIfExists(
  map: Map,
  layerId: string,
  property: string,
  value: unknown,
) {
  if (!map.getLayer(layerId)) {
    return;
  }

  map.setPaintProperty(layerId, property, value);
}

function hideLayerIfExists(map: Map, layerId: string) {
  if (!map.getLayer(layerId)) {
    return;
  }

  map.setLayoutProperty(layerId, "visibility", "none");
}

function applyDarkBlueLand(map: Map) {
  for (const layer of LAND_LAYERS) {
    setPaintIfExists(map, layer.id, layer.property, layer.color);
  }
}

function hideBasemapPlaceLabels(map: Map) {
  for (const layerId of PLACE_LABEL_LAYERS) {
    hideLayerIfExists(map, layerId);
  }
}

function hideRoadLabels(map: Map) {
  for (const layerId of ROADNAME_LAYERS) {
    hideLayerIfExists(map, layerId);
  }
}

export function applyMarineBlueTheme(map: Map) {
  applyDarkBlueLand(map);

  setPaintIfExists(map, "water", "fill-color", MARINE_BLUE.water);
  setPaintIfExists(map, "water_shadow", "fill-color", MARINE_BLUE.waterDepth);
  setPaintIfExists(map, "water_shadow", "fill-opacity", 0.65);
  setPaintIfExists(map, "waterway", "line-color", MARINE_BLUE.waterway);
  setPaintIfExists(map, "boundary_county", "line-color", MARINE_BLUE.boundary);
  setPaintIfExists(map, "boundary_state", "line-color", MARINE_BLUE.boundary);

  if (!map.getLayer(COASTLINE_LAYER) && map.getSource(CARTO_SOURCE)) {
    map.addLayer(
      {
        id: COASTLINE_LAYER,
        type: "line",
        source: CARTO_SOURCE,
        "source-layer": "water",
        paint: {
          "line-color": MARINE_BLUE.coastline,
          "line-width": 1.4,
          "line-opacity": 0.9,
        },
      },
      "waterway",
    );
  }

  hideBasemapPlaceLabels(map);
  hideRoadLabels(map);
}

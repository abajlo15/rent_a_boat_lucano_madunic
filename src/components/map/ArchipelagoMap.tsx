"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  archipelagoLocations,
  getLocationById,
  type ArchipelagoLocation,
  type TourReach,
} from "@/data/archipelago-locations";
import type { ArchipelagoMapHandle } from "@/components/map/ArchipelagoMapLibre";
import { LocationMarkerCallout } from "@/components/map/LocationMarkerCallout";
import { useNarrowViewport } from "@/components/map/useNarrowViewport";

const ArchipelagoMapLibre = dynamic(
  () =>
    import("@/components/map/ArchipelagoMapLibre").then(
      (module) => module.ArchipelagoMapLibre,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-full min-h-[320px] w-full animate-pulse rounded-2xl bg-slate-100" />
    ),
  },
);

type ReachFilter = "all" | TourReach;

type ArchipelagoMapProps = {
  locations?: ArchipelagoLocation[];
  className?: string;
};

const filterOptions: { value: ReachFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "half-day", label: "Half-day" },
  { value: "full-day", label: "Full-day" },
];

export function ArchipelagoMap({
  locations = archipelagoLocations,
  className = "",
}: ArchipelagoMapProps) {
  const mapHandleRef = useRef<ArchipelagoMapHandle | null>(null);
  const pendingFilterRef = useRef<ReachFilter | null>(null);
  const reachFilterRef = useRef<ReachFilter>("all");
  const isNarrowRef = useRef(false);
  const filterAppliedAtRef = useRef(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reachFilter, setReachFilter] = useState<ReachFilter>("all");
  const isNarrow = useNarrowViewport();
  const selectedLocation = selectedId ? getLocationById(selectedId) ?? null : null;
  const showMap = !isNarrow || !selectedId;
  const showMobileDetail = isNarrow && selectedLocation;

  useEffect(() => {
    reachFilterRef.current = reachFilter;
  }, [reachFilter]);

  useEffect(() => {
    isNarrowRef.current = isNarrow;
  }, [isNarrow]);

  const visibleLocations = useMemo(
    () =>
      reachFilter === "all"
        ? locations
        : locations.filter((location) => location.tourReach === reachFilter),
    [locations, reachFilter],
  );

  const applyMobileSelect = useCallback((id: string) => {
    const location = getLocationById(id);
    if (!location) {
      return;
    }

    const targetFilter = location.tourReach;
    const currentFilter = reachFilterRef.current;
    const now = Date.now();

    if (currentFilter !== "all" && currentFilter === targetFilter) {
      if (now - filterAppliedAtRef.current < 500) {
        return;
      }

      setSelectedId(id);
      return;
    }

    filterAppliedAtRef.current = now;
    reachFilterRef.current = targetFilter;
    setReachFilter(targetFilter);
    setSelectedId(null);

    if (mapHandleRef.current) {
      mapHandleRef.current.fitToFilter(targetFilter);
      return;
    }

    pendingFilterRef.current = targetFilter;
  }, []);

  const handleSelect = useCallback(
    (id: string) => {
      if (!isNarrowRef.current) {
        setSelectedId(id);
        return;
      }

      applyMobileSelect(id);
    },
    [applyMobileSelect],
  );

  const handleReset = () => {
    setSelectedId(null);
  };

  const handleFilterClick = (filter: ReachFilter) => {
    filterAppliedAtRef.current = 0;
    setReachFilter(filter);
    setSelectedId(null);

    if (mapHandleRef.current) {
      mapHandleRef.current.fitToFilter(filter);
      return;
    }

    pendingFilterRef.current = filter;
  };

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <div className="flex flex-wrap gap-2">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => handleFilterClick(option.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              reachFilter === option.value
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-blue-200/80 bg-slate-50 shadow-sm ring-1 ring-blue-100/60">
        <div
          className={
            showMobileDetail
              ? "flex min-h-[min(560px,82vh)] h-full w-full"
              : "aspect-[10/7] w-full min-h-[320px]"
          }
        >
          {showMap && (
            <ArchipelagoMapLibre
              locations={visibleLocations}
              reachFilter={reachFilter}
              selectedId={selectedId}
              onSelect={handleSelect}
              onReset={handleReset}
              showCalloutInMap={!isNarrow}
              onMapReady={(handle) => {
                mapHandleRef.current = handle;

                if (pendingFilterRef.current) {
                  handle.fitToFilter(pendingFilterRef.current);
                  pendingFilterRef.current = null;
                }
              }}
            />
          )}

          {showMobileDetail && (
            <LocationMarkerCallout
              location={selectedLocation}
              onClose={handleReset}
              variant="detail"
            />
          )}
        </div>
      </div>
    </div>
  );
}

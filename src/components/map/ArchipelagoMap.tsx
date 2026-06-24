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
  initialReachFilter?: TourReach;
  lockReachFilter?: boolean;
  bookingBoatSlug?: string;
  bookingBoatName?: string;
};

const filterOptions: { value: ReachFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "half-day", label: "Half-day" },
  { value: "full-day", label: "Full-day" },
];

const reachFilterHeading: Record<TourReach, string> = {
  "half-day": "Half-day destinations",
  "full-day": "Full-day destinations",
};

export function ArchipelagoMap({
  locations = archipelagoLocations,
  className = "",
  initialReachFilter,
  lockReachFilter = false,
  bookingBoatSlug,
  bookingBoatName,
}: ArchipelagoMapProps) {
  const mapHandleRef = useRef<ArchipelagoMapHandle | null>(null);
  const mapShellRef = useRef<HTMLDivElement>(null);
  const pendingFilterRef = useRef<ReachFilter | null>(null);
  const reachFilterRef = useRef<ReachFilter>("all");
  const isNarrowRef = useRef(false);
  const filterAppliedAtRef = useRef(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileDetailId, setMobileDetailId] = useState<string | null>(null);
  const [reachFilter, setReachFilter] = useState<ReachFilter>(
    initialReachFilter ?? "all",
  );
  const isNarrow = useNarrowViewport();
  const mobileDetailLocation = mobileDetailId
    ? getLocationById(mobileDetailId) ?? null
    : null;
  const showMap = !isNarrow || !mobileDetailId;
  const showMobileDetail = isNarrow && mobileDetailLocation;

  useEffect(() => {
    if (!showMobileDetail || !mapShellRef.current) {
      return;
    }

    mapShellRef.current.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [showMobileDetail, mobileDetailId]);

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

  const clearMobileDetail = useCallback(() => {
    setMobileDetailId(null);
    setSelectedId(null);
  }, []);

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

      setMobileDetailId(id);
      return;
    }

    filterAppliedAtRef.current = now;
    reachFilterRef.current = targetFilter;
    setReachFilter(targetFilter);
    setMobileDetailId(null);
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

  const handleFilterClick = (filter: ReachFilter) => {
    filterAppliedAtRef.current = 0;
    const closingMobileDetail = isNarrowRef.current && mobileDetailId !== null;
    reachFilterRef.current = filter;
    setReachFilter(filter);
    setMobileDetailId(null);
    setSelectedId(null);

    if (!closingMobileDetail && mapHandleRef.current) {
      mapHandleRef.current.fitToFilter(filter);
      pendingFilterRef.current = null;
      return;
    }

    pendingFilterRef.current = filter;
  };

  const handleReset = () => {
    if (lockReachFilter) {
      clearMobileDetail();
      return;
    }

    if (reachFilterRef.current !== "all") {
      handleFilterClick("all");
      return;
    }

    clearMobileDetail();
  };

  const calloutMapActionLabel = bookingBoatSlug
    ? "Choose another destination"
    : "Back to map";

  const visibleFilterOptions = filterOptions;

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {lockReachFilter && initialReachFilter && bookingBoatName && (
        <div className="rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-slate-700">
          <span className="font-semibold text-cyan-900">{bookingBoatName}</span>
          {" · "}
          {reachFilterHeading[initialReachFilter]}
        </div>
      )}

      {!lockReachFilter && (
      <div className="flex flex-wrap gap-2">
        {visibleFilterOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            disabled={lockReachFilter}
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
      )}

      <div
        ref={mapShellRef}
        className={`relative overflow-hidden rounded-2xl border border-blue-200/80 bg-slate-50 shadow-sm ring-1 ring-blue-100/60 ${
          showMobileDetail ? "h-[82vh] min-h-[480px]" : ""
        }`}
      >
        <div
          className={
            showMobileDetail
              ? "flex h-full w-full flex-col"
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
              bookingBoatSlug={bookingBoatSlug}
              mapActionLabel={calloutMapActionLabel}
              onMapReady={(handle) => {
                mapHandleRef.current = handle;

                const filterToFit =
                  pendingFilterRef.current ??
                  (lockReachFilter && initialReachFilter ? initialReachFilter : null);

                if (filterToFit) {
                  handle.fitToFilter(filterToFit);
                  pendingFilterRef.current = null;
                }
              }}
            />
          )}

          {showMobileDetail && (
            <LocationMarkerCallout
              location={mobileDetailLocation}
              onClose={handleReset}
              variant="detail"
              bookingBoatSlug={bookingBoatSlug}
              mapActionLabel={calloutMapActionLabel}
            />
          )}
        </div>
      </div>
    </div>
  );
}

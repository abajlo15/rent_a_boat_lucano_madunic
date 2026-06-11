"use client";

import dynamic from "next/dynamic";
import { useMemo, useRef, useState } from "react";
import {
  archipelagoLocations,
  type ArchipelagoLocation,
  type TourReach,
} from "@/data/archipelago-locations";
import type { ArchipelagoMapHandle } from "@/components/map/ArchipelagoMapLibre";

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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reachFilter, setReachFilter] = useState<ReachFilter>("all");

  const visibleLocations = useMemo(
    () =>
      reachFilter === "all"
        ? locations
        : locations.filter((location) => location.tourReach === reachFilter),
    [locations, reachFilter],
  );

  const handleSelect = (id: string) => {
    setSelectedId((current) => (current === id ? null : id));
  };

  const handleReset = () => {
    setSelectedId(null);
  };

  const handleFilterClick = (filter: ReachFilter) => {
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
        <div className="aspect-[10/7] w-full min-h-[320px]">
          <ArchipelagoMapLibre
            locations={visibleLocations}
            reachFilter={reachFilter}
            selectedId={selectedId}
            onSelect={handleSelect}
            onReset={handleReset}
            onMapReady={(handle) => {
              mapHandleRef.current = handle;

              if (pendingFilterRef.current) {
                handle.fitToFilter(pendingFilterRef.current);
                pendingFilterRef.current = null;
              }
            }}
          />
        </div>

        {!selectedId && (
          <div className="pointer-events-none absolute bottom-3 left-3 z-10 max-w-[240px] rounded-xl border border-white/80 bg-white/90 px-3 py-2.5 text-xs text-slate-600 shadow-sm backdrop-blur-sm">
            <p className="font-medium text-slate-700">Select a destination</p>
            <p className="mt-1 text-slate-500">Tap a pin to explore tour details.</p>
            <div className="mt-2 space-y-1">
              <p>
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-600 align-middle" />{" "}
                Blue — half-day
              </p>
              <p>
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-slate-900 align-middle" />{" "}
                Dark — full-day
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

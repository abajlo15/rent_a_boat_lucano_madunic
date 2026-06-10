"use client";

import { useMemo, useState } from "react";
import {
  archipelagoLocations,
  getLocationById,
  type ArchipelagoLocation,
  type TourReach,
} from "@/data/archipelago-locations";
import { ArchipelagoMapLibre } from "@/components/map/ArchipelagoMapLibre";
import { LocationDetailPanel } from "@/components/map/LocationDetailPanel";

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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reachFilter, setReachFilter] = useState<ReachFilter>("all");

  const visibleLocations = useMemo(
    () =>
      reachFilter === "all"
        ? locations
        : locations.filter((location) => location.tourReach === reachFilter),
    [locations, reachFilter],
  );

  const selectedLocation = selectedId ? getLocationById(selectedId) ?? null : null;

  const handleSelect = (id: string) => {
    setSelectedId((current) => (current === id ? null : id));
  };

  const handleReset = () => {
    setSelectedId(null);
  };

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <div className="flex flex-wrap gap-2">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => {
              setReachFilter(option.value);
              setSelectedId(null);
            }}
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

      <div className="grid gap-4 lg:grid-cols-[1fr_320px] lg:items-start">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="aspect-[10/7] w-full min-h-[320px]">
            <ArchipelagoMapLibre
              locations={visibleLocations}
              selectedId={selectedId}
              onSelect={handleSelect}
              onReset={handleReset}
            />
          </div>
        </div>

        <div className="min-h-[280px] lg:sticky lg:top-4 lg:min-h-[490px]">
          <LocationDetailPanel location={selectedLocation} onReset={handleReset} />
        </div>
      </div>
    </div>
  );
}

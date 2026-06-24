"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Boat } from "@/data/boats";
import type { ArchipelagoLocation } from "@/data/archipelago-locations";
import { boatDetailPath, boatsPagePath } from "@/lib/bookingPaths";

type BoatBookingNavProps = {
  boat: Boat;
  selectedDestination?: ArchipelagoLocation;
};

export function BoatBookingNav({ boat, selectedDestination }: BoatBookingNavProps) {
  const router = useRouter();

  const goToBookingStep = (path: string) => {
    router.push(path, { scroll: false });
    document.getElementById("boat-booking")?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link
        href={boatsPagePath(selectedDestination?.slug)}
        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
      >
        <span aria-hidden="true">←</span>
        {selectedDestination ? "Choose another boat" : "Back to fleet"}
      </Link>
      {selectedDestination && (
        <button
          type="button"
          onClick={() =>
            goToBookingStep(
              boatDetailPath(boat.slug, { duration: selectedDestination.tourReach }),
            )
          }
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
        >
          Choose another destination
        </button>
      )}
    </div>
  );
}

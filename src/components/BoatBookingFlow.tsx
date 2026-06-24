"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";
import { ArchipelagoMap } from "@/components/map/ArchipelagoMap";
import { BoatTourBooking } from "@/components/TourOptions";
import type { Boat, TourOption } from "@/data/boats";
import { getBoatMinPriceForDuration } from "@/data/boats";
import type { ArchipelagoLocation, TourReach } from "@/data/archipelago-locations";
import { boatDetailPath } from "@/lib/bookingPaths";

const durationOptions: {
  value: TourReach;
  label: string;
  description: string;
}[] = [
  {
    value: "half-day",
    label: "Half-day tour",
    description: "Nearby islands and bays around Zadar — about 4 hours on the water.",
  },
  {
    value: "full-day",
    label: "Full-day tour",
    description: "Dugi Otok, Kornati, and further archipelago routes — a full day at sea.",
  },
];

const reachHeading: Record<TourReach, string> = {
  "half-day": "Half-day tour",
  "full-day": "Full-day tour",
};

type BoatBookingFlowProps = {
  boat: Boat;
  tourReach?: TourReach;
  selectedDestination?: ArchipelagoLocation;
  toursForTrip: TourOption[];
  tourOptionsIntro: string;
};

export function BoatBookingFlow({
  boat,
  tourReach,
  selectedDestination,
  toursForTrip,
  tourOptionsIntro,
}: BoatBookingFlowProps) {
  const router = useRouter();
  const sectionRef = useRef<HTMLElement>(null);

  const goTo = (path: string) => {
    router.push(path, { scroll: false });
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  return (
    <section
      ref={sectionRef}
      id="boat-booking"
      className="scroll-mt-6 space-y-4 rounded-2xl bg-white p-6 shadow-sm md:p-8"
    >
      {selectedDestination ? (
        <BoatTourBooking tours={toursForTrip} tourOptionsIntro={tourOptionsIntro} />
      ) : tourReach ? (
        <>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">
                Choose a destination for {boat.name}
              </h2>
              <p className="mt-2 text-slate-600">
                {reachHeading[tourReach]} — tap a pin to preview the stop, then book your
                boat or pick another destination.
              </p>
            </div>
            <button
              type="button"
              onClick={() => goTo(boatDetailPath(boat.slug))}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Change trip length
            </button>
          </div>

          <ArchipelagoMap
            initialReachFilter={tourReach}
            lockReachFilter
            bookingBoatSlug={boat.slug}
            bookingBoatName={boat.name}
          />
        </>
      ) : (
        <>
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Choose your trip length</h2>
            <p className="mt-2 text-slate-600">
              Pick half-day or full-day, then browse destinations on the map for {boat.name}.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {durationOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  goTo(boatDetailPath(boat.slug, { duration: option.value }))
                }
                className="group rounded-2xl border-2 border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-cyan-600 hover:bg-cyan-50/50"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold text-slate-900 group-hover:text-cyan-900">
                    {option.label}
                  </h3>
                  <p className="shrink-0 text-sm font-semibold text-cyan-700">
                    From EUR {getBoatMinPriceForDuration(boat, option.value)}
                  </p>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{option.description}</p>
                <p className="mt-4 text-sm font-semibold text-cyan-800">
                  Choose destinations →
                </p>
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

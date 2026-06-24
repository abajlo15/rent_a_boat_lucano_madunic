"use client";

import Link from "next/link";
import { useState } from "react";
import type { TourOption } from "@/data/boats";

const durationLabel: Record<TourOption["duration"], string> = {
  "half-day": "Half-day",
  "full-day": "Full-day",
};

const skipperLabel: Record<TourOption["skipper"], string> = {
  "with-skipper": "With skipper",
  "without-skipper": "Without skipper",
};

function formatTourPrice(tour: TourOption) {
  if (tour.skipperIncluded) {
    return `EUR ${tour.fromPriceEur} — skipper included`;
  }

  if (tour.skipper === "with-skipper" && tour.skipperSupplementEur > 0) {
    return `EUR ${tour.fromPriceEur} (${tour.basePriceEur} + ${tour.skipperSupplementEur} skipper)`;
  }

  return `EUR ${tour.fromPriceEur}`;
};

type TourOptionsListProps = {
  tours: TourOption[];
  selectedId: string | null;
  onSelect: (tourId: string) => void;
};

function TourOptionsList({ tours, selectedId, onSelect }: TourOptionsListProps) {
  const selectedTour = tours.find((tour) => tour.id === selectedId);

  return (
    <div className="space-y-4">
      <div
        className="grid gap-4 md:grid-cols-2"
        role="radiogroup"
        aria-label="Tour options"
      >
        {tours.map((tour) => {
          const isSelected = selectedId === tour.id;

          return (
            <button
              key={tour.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelect(tour.id)}
              className={`rounded-2xl border p-5 text-left shadow-sm transition ${
                isSelected
                  ? "border-cyan-600 bg-cyan-50 ring-2 ring-cyan-600/25"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <span
                    aria-hidden="true"
                    className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-xs ${
                      isSelected
                        ? "border-cyan-600 bg-cyan-600 text-white"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {isSelected ? "✓" : ""}
                  </span>
                  <h3 className="text-lg font-semibold text-slate-900">{tour.title}</h3>
                </div>
                <p className="text-sm font-semibold text-cyan-700">
                  {formatTourPrice(tour)}
                </p>
              </div>
              <div className="mb-4 flex flex-wrap gap-2 text-xs text-slate-700">
                <span className="rounded-full bg-slate-100 px-2.5 py-1">
                  {durationLabel[tour.duration]}
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1">
                  {skipperLabel[tour.skipper]}
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1">
                  Up to {tour.maxGuests} guests
                </span>
              </div>
              <ul className="space-y-1 text-sm text-slate-600">
                {tour.highlights.map((highlight) => (
                  <li key={highlight}>- {highlight}</li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      {tours.length > 1 && !selectedTour && (
        <p className="text-sm text-slate-500">Tap an option to select it.</p>
      )}
    </div>
  );
}

type BoatTourBookingProps = {
  tours: TourOption[];
  tourOptionsIntro: string;
};

export function BoatTourBooking({
  tours,
  tourOptionsIntro,
}: BoatTourBookingProps) {
  const [selectedId, setSelectedId] = useState<string | null>(
    tours.length === 1 ? (tours[0]?.id ?? null) : null,
  );

  const selectedTour = tours.find((tour) => tour.id === selectedId);

  return (
    <>
      <section className="space-y-4 rounded-2xl bg-white p-6 shadow-sm md:p-8">
        <h2 className="text-2xl font-semibold text-slate-900">Tour options</h2>
        <p className="text-slate-600">{tourOptionsIntro}</p>
        <TourOptionsList
          tours={tours}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </section>

      <div className="pt-1">
        {selectedTour ? (
          <Link
            href="/#contact"
            className="group inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-cyan-500 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-cyan-600/20 transition hover:from-cyan-700 hover:to-cyan-600 hover:shadow-xl hover:shadow-cyan-600/30 active:scale-[0.99] sm:w-auto sm:min-w-[18rem]"
          >
            <span>Request this boat</span>
            <span className="rounded-full bg-white/20 px-3 py-0.5 text-sm font-bold tabular-nums">
              EUR {selectedTour.fromPriceEur}
            </span>
            <span
              aria-hidden="true"
              className="transition group-hover:translate-x-0.5"
            >
              →
            </span>
          </Link>
        ) : (
          <span className="inline-flex w-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-4 text-sm font-medium text-slate-400 sm:w-auto sm:min-w-[18rem]">
            Select a tour option first
          </span>
        )}
      </div>
    </>
  );
}

/** Standalone tour list when footer CTA is not needed. */
export function TourOptions({ tours }: { tours: TourOption[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(
    tours.length === 1 ? (tours[0]?.id ?? null) : null,
  );

  return (
    <TourOptionsList tours={tours} selectedId={selectedId} onSelect={setSelectedId} />
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BoatBookingFlow } from "@/components/BoatBookingFlow";
import { BoatBookingNav } from "@/components/BoatBookingNav";
import {
  boats,
  boatsBySlug,
  getBoatMinPriceForDuration,
  getBoatToursForDuration,
} from "@/data/boats";
import { getLocationById } from "@/data/archipelago-locations";
import { isTourReach } from "@/lib/bookingPaths";

type BoatDetailsPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ destination?: string; duration?: string }>;
};

export async function generateStaticParams() {
  return boats.map((boat) => ({
    slug: boat.slug,
  }));
}

export async function generateMetadata({
  params,
}: BoatDetailsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const boat = boatsBySlug.get(slug);

  if (!boat) {
    return {
      title: "Boat Not Found | Rent a Boat",
    };
  }

  return {
    title: `${boat.name} | Rent a Boat`,
    description: `${boat.name} in ${boat.location}. Compare half-day and full-day tours with or without skipper.`,
  };
}

export default async function BoatDetailsPage({
  params,
  searchParams,
}: BoatDetailsPageProps) {
  const { slug } = await params;
  const { destination: destinationSlug, duration } = await searchParams;
  const boat = boatsBySlug.get(slug);
  const selectedDestination = destinationSlug
    ? getLocationById(destinationSlug)
    : undefined;
  const tourReach = isTourReach(duration) ? duration : undefined;

  if (!boat) {
    notFound();
  }

  const activeTourReach = selectedDestination?.tourReach ?? tourReach;

  const toursForTrip = selectedDestination
    ? getBoatToursForDuration(boat, selectedDestination.tourReach)
    : boat.tours;
  const priceFrom = activeTourReach
    ? getBoatMinPriceForDuration(boat, activeTourReach)
    : boat.basePriceFromEur;
  const tourOptionsIntro = selectedDestination
    ? selectedDestination.tourReach === "full-day"
      ? "Pick your preferred skipper mode for this full-day trip. Booking flow and live calendar are planned in phase two."
      : "Pick your preferred skipper mode for this half-day trip. Booking flow and live calendar are planned in phase two."
    : "Pick your preferred duration and skipper mode. Booking flow and live calendar are planned in phase two.";

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <BoatBookingNav boat={boat} selectedDestination={selectedDestination} />

      {selectedDestination && (
        <section className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5 md:p-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">
            Your destination
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">
            {selectedDestination.name}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Booking trip with {boat.name}.
          </p>
        </section>
      )}

      <section className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">
              {boat.type}
            </p>
            <h1 className="mt-1 text-3xl font-semibold text-slate-900 md:text-4xl">
              {boat.name}
            </h1>
            <p className="mt-2 text-slate-600">{boat.longDescription}</p>
          </div>
          <p className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
            From EUR {priceFrom}
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-slate-50 p-3 text-sm">
            <p className="text-slate-500">Length</p>
            <p className="font-semibold text-slate-900">{boat.lengthMeters} m</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-sm">
            <p className="text-slate-500">Capacity</p>
            <p className="font-semibold text-slate-900">{boat.capacity} guests</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-sm">
            <p className="text-slate-500">Engine</p>
            <p className="font-semibold text-slate-900">{boat.engine}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-sm">
            <p className="text-slate-500">Build year</p>
            <p className="font-semibold text-slate-900">{boat.buildYear}</p>
          </div>
        </div>

        <p className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500">
          {boat.imagePlaceholder}
        </p>
      </section>

      <BoatBookingFlow
        boat={boat}
        tourReach={tourReach}
        selectedDestination={selectedDestination}
        toursForTrip={toursForTrip}
        tourOptionsIntro={tourOptionsIntro}
      />

      <section className="rounded-2xl bg-slate-900 p-6 text-white md:p-8">
        <h2 className="text-2xl font-semibold">Suggested destinations</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {boat.destinations.map((destination) => (
            <span
              key={destination}
              className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-sm"
            >
              {destination}
            </span>
          ))}
        </div>
      </section>
    </main>
  );
}

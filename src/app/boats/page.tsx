import type { Metadata } from "next";
import Link from "next/link";
import { BoatCard } from "@/components/BoatCard";
import { boats } from "@/data/boats";
import { getLocationById } from "@/data/archipelago-locations";

export const metadata: Metadata = {
  title: "Our Fleet | Rent a Boat",
  description:
    "Browse our Zadar fleet and compare half-day and full-day boat tours with or without skipper.",
};

type BoatsPageProps = {
  searchParams: Promise<{ destination?: string }>;
};

export default async function BoatsPage({ searchParams }: BoatsPageProps) {
  const { destination: destinationSlug } = await searchParams;
  const selectedDestination = destinationSlug
    ? getLocationById(destinationSlug)
    : undefined;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">
          Fleet
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900 md:text-4xl">
          Boats ready for your next Adriatic day
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Choose from comfortable and performance-focused boats, then pick your
          preferred duration and skipper option.
        </p>
        <Link
          href="/"
          className="mt-5 inline-flex rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
        >
          Back to home
        </Link>
      </section>

      {selectedDestination && (
        <section className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5 md:p-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">
            Your destination
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">
            {selectedDestination.name}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Choose a boat for your trip.
          </p>
        </section>
      )}

      <section className="grid gap-6 md:grid-cols-2">
        {boats.map((boat) => (
          <BoatCard
            key={boat.id}
            boat={boat}
            destinationSlug={selectedDestination?.slug}
            tourReach={selectedDestination?.tourReach}
          />
        ))}
      </section>
    </main>
  );
}

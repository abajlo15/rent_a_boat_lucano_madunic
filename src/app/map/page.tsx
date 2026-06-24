import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ArchipelagoMap } from "@/components/map/ArchipelagoMap";
import { boatsBySlug } from "@/data/boats";
import { boatDetailPath, isTourReach } from "@/lib/bookingPaths";

export const metadata: Metadata = {
  title: "Archipelago Map | Rent a Boat",
  description:
    "Explore half-day and full-day boat tour destinations around Zadar on an interactive map.",
};

type MapPageProps = {
  searchParams: Promise<{ boat?: string; duration?: string }>;
};

export default async function MapPage({ searchParams }: MapPageProps) {
  const { boat: boatSlug, duration } = await searchParams;

  if (boatSlug) {
    const boat = boatsBySlug.get(boatSlug);
    if (boat) {
      const tourReach = isTourReach(duration) ? duration : undefined;
      redirect(boatDetailPath(boat.slug, tourReach ? { duration: tourReach } : undefined));
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">
          Interactive map
        </p>
        <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">
          Zadar Archipelago
        </h1>
        <p className="max-w-2xl text-slate-600">
          Browse the archipelago and choose your destination. Tap any pin to
          preview the stop — half-day tours around nearby islands, or full-day
          routes to Dugi Otok, Kornati, and beyond.
        </p>
      </section>

      <ArchipelagoMap />
    </main>
  );
}

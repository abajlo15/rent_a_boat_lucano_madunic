import type { Metadata } from "next";
import { ArchipelagoMap } from "@/components/map/ArchipelagoMap";

export const metadata: Metadata = {
  title: "Archipelago Map | Rent a Boat",
  description:
    "Explore half-day and full-day boat tour destinations around Zadar on an interactive map.",
};

export default function MapPage() {
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
          Real map powered by MapLibre and OpenStreetMap data. Select a
          destination pin to fly in and preview tour details — half-day stops
          near Zadar, full-day routes to Dugi Otok, Kornati, and Vis.
        </p>
      </section>

      <ArchipelagoMap />
    </main>
  );
}

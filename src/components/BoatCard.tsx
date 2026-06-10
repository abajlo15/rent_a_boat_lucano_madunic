import Link from "next/link";
import type { Boat } from "@/data/boats";

type BoatCardProps = {
  boat: Boat;
};

export function BoatCard({ boat }: BoatCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="flex h-44 items-center justify-center bg-gradient-to-br from-cyan-100 via-sky-100 to-blue-100 px-6 text-sm text-slate-500">
        {boat.imagePlaceholder}
      </div>
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-cyan-700">
              {boat.type}
            </p>
            <h3 className="text-xl font-semibold text-slate-900">{boat.name}</h3>
          </div>
          <p className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            From EUR {boat.basePriceFromEur}
          </p>
        </div>

        <p className="text-sm leading-6 text-slate-600">{boat.shortDescription}</p>

        <ul className="flex flex-wrap gap-2 text-xs text-slate-700">
          <li className="rounded-full bg-slate-100 px-2.5 py-1">
            {boat.lengthMeters} m
          </li>
          <li className="rounded-full bg-slate-100 px-2.5 py-1">
            Up to {boat.capacity} guests
          </li>
          <li className="rounded-full bg-slate-100 px-2.5 py-1">{boat.engine}</li>
        </ul>

        <Link
          href={`/boats/${boat.slug}`}
          className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          View Boat Details
        </Link>
      </div>
    </article>
  );
}

import type { TourOption } from "@/data/boats";

type TourOptionsProps = {
  tours: TourOption[];
};

const durationLabel: Record<TourOption["duration"], string> = {
  "half-day": "Half-day",
  "full-day": "Full-day",
};

const skipperLabel: Record<TourOption["skipper"], string> = {
  "with-skipper": "With skipper",
  "without-skipper": "Without skipper",
};

export function TourOptions({ tours }: TourOptionsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {tours.map((tour) => (
        <article
          key={tour.id}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-lg font-semibold text-slate-900">{tour.title}</h3>
            <p className="text-sm font-semibold text-cyan-700">
              From EUR {tour.fromPriceEur}
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
        </article>
      ))}
    </div>
  );
}

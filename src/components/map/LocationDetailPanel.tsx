import type { ArchipelagoLocation } from "@/data/archipelago-locations";

type LocationDetailPanelProps = {
  location: ArchipelagoLocation | null;
  onReset: () => void;
};

const reachLabel: Record<ArchipelagoLocation["tourReach"], string> = {
  "half-day": "Half-day tour",
  "full-day": "Full-day tour",
};

export function LocationDetailPanel({ location, onReset }: LocationDetailPanelProps) {
  if (!location) {
    return (
      <div className="flex h-full flex-col justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
        <p className="text-lg font-semibold text-slate-700">Select a destination</p>
        <p className="mt-2 text-sm text-slate-500">
          Tap a pin on the map to zoom in and explore tour details.
        </p>
        <div className="mt-6 space-y-2 text-left text-xs text-slate-500">
          <p>
            <span className="inline-block h-3 w-3 rounded-full bg-cyan-600 align-middle" />{" "}
            Cyan pins — half-day destinations
          </p>
          <p>
            <span className="inline-block h-3 w-3 rounded-full bg-slate-900 align-middle" />{" "}
            Dark pins — full-day destinations
          </p>
        </div>
      </div>
    );
  }

  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <span
            className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
              location.tourReach === "half-day"
                ? "bg-cyan-100 text-cyan-800"
                : "bg-slate-200 text-slate-800"
            }`}
          >
            {reachLabel[location.tourReach]}
          </span>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">{location.name}</h2>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
        >
          Show full map
        </button>
      </div>

      <p className="text-sm leading-relaxed text-slate-600">{location.shortDescription}</p>

      {location.subDestinations && location.subDestinations.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Also includes
          </p>
          <ul className="mt-2 space-y-1">
            {location.subDestinations.map((sub) => (
              <li key={sub} className="text-sm text-slate-700">
                — {sub}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
        Photo gallery coming soon
      </div>

      <div className="mt-4 rounded-xl bg-slate-50 p-4">
        <p className="text-xs text-slate-500">Price from</p>
        <p className="text-lg font-semibold text-slate-900">EUR — coming soon</p>
      </div>

      <p className="mt-3 text-xs text-slate-400">
        {location.geo.lat.toFixed(3)}°N, {location.geo.lng.toFixed(3)}°E
      </p>

      <button
        type="button"
        disabled
        className="mt-auto rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white opacity-50"
      >
        Select destination (booking soon)
      </button>
    </article>
  );
}

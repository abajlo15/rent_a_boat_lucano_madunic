import type { CardinalDirection, DirectionIndicator } from "@/components/map/directionIndicatorUtils";

type MapDirectionIndicatorsProps = {
  indicators: DirectionIndicator[];
  onNavigate: (locationId: string) => void;
};

const directionPosition: Record<CardinalDirection, string> = {
  n: "top-3 left-1/2 -translate-x-1/2",
  e: "right-3 top-1/2 -translate-y-1/2",
  s: "bottom-3 left-1/2 -translate-x-1/2",
  w: "left-3 top-1/2 -translate-y-1/2",
};

const directionRotation: Record<CardinalDirection, number> = {
  n: -90,
  e: 0,
  s: 90,
  w: 180,
};

function DirectionArrow({ rotation }: { rotation: number }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <path
        d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z"
        fill="currentColor"
      />
    </svg>
  );
}

export function MapDirectionIndicators({
  indicators,
  onNavigate,
}: MapDirectionIndicatorsProps) {
  if (indicators.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {indicators.map((indicator) => (
        <button
          key={indicator.direction}
          type="button"
          title={indicator.locationName}
          aria-label={`Go to ${indicator.locationName}`}
          onClick={() => onNavigate(indicator.locationId)}
          className={`pointer-events-auto absolute flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-md ring-1 ring-slate-200/80 transition hover:bg-white hover:text-blue-700 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${directionPosition[indicator.direction]}`}
        >
          <DirectionArrow rotation={directionRotation[indicator.direction]} />
        </button>
      ))}
    </div>
  );
}

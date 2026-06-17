import type { CardinalDirection, DirectionIndicator } from "@/components/map/directionIndicatorUtils";

type MapDirectionIndicatorsProps = {
  indicators: DirectionIndicator[];
  onNavigate: (locationId: string) => void;
};

const directionPosition: Record<CardinalDirection, string> = {
  n: "top-4 left-1/2 -translate-x-1/2",
  e: "right-4 top-1/2 -translate-y-1/2",
  s: "bottom-4 left-1/2 -translate-x-1/2",
  w: "left-4 top-1/2 -translate-y-1/2",
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
      className="h-6 w-6"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <path
        d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="0.5"
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
          className={`pointer-events-auto absolute flex h-12 w-12 items-center justify-center rounded-full bg-white text-blue-800 shadow-lg ring-2 ring-blue-200/90 transition hover:bg-blue-50 hover:text-blue-700 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${directionPosition[indicator.direction]}`}
        >
          <DirectionArrow rotation={directionRotation[indicator.direction]} />
        </button>
      ))}
    </div>
  );
}

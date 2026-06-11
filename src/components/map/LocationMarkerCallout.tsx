"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { ArchipelagoLocation } from "@/data/archipelago-locations";
import {
  computeCalloutPlacement,
  type CalloutAnchor,
  type CalloutContainerSize,
  type CalloutPlacement,
} from "@/components/map/calloutPlacement";

export type { CalloutAnchor };

const CALLOUT_WIDTH = 300;

type LocationMarkerCalloutProps = {
  location: ArchipelagoLocation;
  onClose: () => void;
  variant: "anchored" | "sheet";
  anchor?: CalloutAnchor;
  containerSize?: CalloutContainerSize;
};

const reachLabel: Record<ArchipelagoLocation["tourReach"], string> = {
  "half-day": "Half-day tour",
  "full-day": "Full-day tour",
};

function CalloutContent({
  location,
  onClose,
}: Omit<LocationMarkerCalloutProps, "variant" | "anchor" | "containerSize">) {
  return (
    <>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <span
            className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
              location.tourReach === "half-day"
                ? "bg-cyan-100 text-cyan-800"
                : "bg-slate-200 text-slate-800"
            }`}
          >
            {reachLabel[location.tourReach]}
          </span>
          <h2 className="mt-1.5 text-lg font-semibold leading-tight text-slate-900 md:text-xl">
            {location.name}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close destination details"
          className="shrink-0 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
        >
          ✕
        </button>
      </div>

      <p className="text-sm leading-relaxed text-slate-600">{location.shortDescription}</p>

      {location.subDestinations && location.subDestinations.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Also includes
          </p>
          <ul className="mt-1.5 space-y-0.5">
            {location.subDestinations.map((sub) => (
              <li key={sub} className="text-sm text-slate-700">
                — {sub}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-5 text-center text-xs text-slate-500">
        Photo gallery coming soon
      </div>

      <div className="mt-3 rounded-lg bg-slate-50 p-3">
        <p className="text-xs text-slate-500">Price from</p>
        <p className="text-base font-semibold text-slate-900">EUR — coming soon</p>
      </div>

      <p className="mt-2 text-xs text-slate-400">
        {location.geo.lat.toFixed(3)}°N, {location.geo.lng.toFixed(3)}°E
      </p>

      <button
        type="button"
        disabled
        className="mt-3 w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white opacity-50"
      >
        Select destination (booking soon)
      </button>

      <button
        type="button"
        onClick={onClose}
        className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
      >
        Show full map
      </button>
    </>
  );
}

function AnchoredCallout({
  location,
  onClose,
  anchor,
  containerSize,
}: {
  location: ArchipelagoLocation;
  onClose: () => void;
  anchor: CalloutAnchor;
  containerSize: CalloutContainerSize;
}) {
  const cardRef = useRef<HTMLElement>(null);
  const [placement, setPlacement] = useState<CalloutPlacement | null>(null);

  const cardWidth = Math.min(CALLOUT_WIDTH, containerSize.width - 24);

  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!card) {
      return;
    }

    const height = card.scrollHeight;
    setPlacement(
      computeCalloutPlacement(anchor, cardWidth, height, containerSize),
    );
  }, [anchor, cardWidth, containerSize, location.id]);

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      <article
        ref={cardRef}
        key={location.id}
        className="callout-anchored pointer-events-auto absolute overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 shadow-xl"
        style={{
          left: placement?.left ?? -9999,
          top: placement?.top ?? -9999,
          width: cardWidth,
          maxHeight: placement?.maxHeight,
          visibility: placement ? "visible" : "hidden",
        }}
      >
        <CalloutContent location={location} onClose={onClose} />
        {placement && (
          <div
            aria-hidden="true"
            className={`absolute h-3 w-3 rotate-45 border-slate-200 bg-white ${
              placement.placement === "above"
                ? "bottom-0 translate-y-1/2 border-b border-r"
                : "top-0 -translate-y-1/2 border-l border-t"
            }`}
            style={{ left: placement.tailLeft - 6 }}
          />
        )}
      </article>
    </div>
  );
}

export function LocationMarkerCallout({
  location,
  onClose,
  variant,
  anchor,
  containerSize,
}: LocationMarkerCalloutProps) {
  if (variant === "sheet") {
    return (
      <>
        <button
          type="button"
          aria-label="Close destination details"
          onClick={onClose}
          className="absolute inset-0 z-20 bg-slate-900/25 backdrop-blur-[1px]"
        />
        <article
          key={location.id}
          className="callout-sheet absolute inset-x-0 bottom-0 z-30 max-h-[72vh] overflow-y-auto rounded-t-2xl border border-slate-200 bg-white p-4 shadow-2xl"
        >
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-300" />
          <CalloutContent location={location} onClose={onClose} />
        </article>
      </>
    );
  }

  if (!anchor || !containerSize) {
    return null;
  }

  return (
    <AnchoredCallout
      location={location}
      onClose={onClose}
      anchor={anchor}
      containerSize={containerSize}
    />
  );
}

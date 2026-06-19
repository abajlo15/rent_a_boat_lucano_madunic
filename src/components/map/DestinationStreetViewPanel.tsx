"use client";

import type { CSSProperties, RefObject } from "react";
import type { ArchipelagoLocation } from "@/data/archipelago-locations";
import type { CalloutPlacement } from "@/components/map/calloutPlacement";
import {
  googleStreetViewEmbedUrl,
  isGoogleMapsConfigured,
} from "@/lib/googleStreetViewEmbedUrl";

type StreetViewVariant = "detail" | "anchored" | "sheet";

const VARIANT_CLASSES: Record<StreetViewVariant, string> = {
  detail: "min-h-[min(560px,82vh)] h-full rounded-3xl",
  anchored: "min-h-[28rem] rounded-2xl",
  sheet: "min-h-[min(480px,75vh)] rounded-t-2xl",
};

type DestinationStreetViewPanelProps = {
  location: ArchipelagoLocation;
  variant: StreetViewVariant;
  onBack: () => void;
  onClose: () => void;
  className?: string;
  style?: CSSProperties;
  cardRef?: RefObject<HTMLElement | null>;
  placement?: CalloutPlacement | null;
};

export function DestinationStreetViewPanel({
  location,
  variant,
  onBack,
  onClose,
  className = "",
  style,
  cardRef,
  placement,
}: DestinationStreetViewPanelProps) {
  const embedUrl = googleStreetViewEmbedUrl(location.geo.lat, location.geo.lng);
  const apiConfigured = isGoogleMapsConfigured();

  return (
    <article
      ref={cardRef}
      className={`relative flex flex-col overflow-hidden border-slate-200 bg-slate-900 ${VARIANT_CLASSES[variant]} ${className}`}
      style={style}
    >
      {embedUrl ? (
        <iframe
          title={`Street View — ${location.name}`}
          src={embedUrl}
          className="absolute inset-0 h-full w-full border-0"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-100 px-6 text-center">
          <p className="text-sm font-medium text-slate-800">Street View unavailable</p>
          <p className="max-w-xs text-xs text-slate-600">
            {apiConfigured
              ? "No Street View imagery found near this location."
              : "Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local and enable Maps Embed API."}
          </p>
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-2 p-3">
        <button
          type="button"
          onClick={onBack}
          className="pointer-events-auto rounded-full bg-white/95 px-3 py-2 text-xs font-semibold text-slate-800 shadow-md ring-1 ring-black/10 backdrop-blur-sm transition hover:bg-white"
        >
          Back to destination
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close destination details"
          className="pointer-events-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/95 text-sm font-medium text-slate-700 shadow-md ring-1 ring-black/10 backdrop-blur-sm transition hover:bg-white"
        >
          ✕
        </button>
      </div>

      {placement && (
        <div
          aria-hidden="true"
          className={`absolute z-10 h-3 w-3 rotate-45 border-slate-200 bg-white ${
            placement.placement === "above"
              ? "bottom-0 translate-y-1/2 border-b border-r"
              : "top-0 -translate-y-1/2 border-l border-t"
          }`}
          style={{ left: placement.tailLeft - 6 }}
        />
      )}
    </article>
  );
}

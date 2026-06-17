"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
  type TouchEvent,
} from "react";
import type { ArchipelagoLocation } from "@/data/archipelago-locations";
import {
  computeCalloutPlacement,
  type CalloutAnchor,
  type CalloutContainerSize,
  type CalloutPlacement,
} from "@/components/map/calloutPlacement";
import { useNarrowViewport } from "@/components/map/useNarrowViewport";

export type { CalloutAnchor };

const CALLOUT_WIDTH = 300;
const CALLOUT_WIDTH_WITH_COVER = 640;
const CAROUSEL_INTERVAL_MS = 3000;
const SWIPE_THRESHOLD_PX = 48;

type CalloutVariant = "anchored" | "sheet" | "detail";

const CAROUSEL_HEIGHT: Record<CalloutVariant, string> = {
  detail: "aspect-[4/3] min-h-[220px] sm:min-h-[260px]",
  anchored: "h-72 md:h-80",
  sheet: "h-64 sm:h-72",
};

type LocationMarkerCalloutProps = {
  location: ArchipelagoLocation;
  onClose: () => void;
  variant: CalloutVariant;
  anchor?: CalloutAnchor;
  containerSize?: CalloutContainerSize;
};

const reachLabel: Record<ArchipelagoLocation["tourReach"], string> = {
  "half-day": "Half-day tour",
  "full-day": "Full-day tour",
};

function CalloutCoverCarousel({
  images,
  locationName,
  variant,
  enableSwipe,
  onClose,
  onAllFailed,
}: {
  images: string[];
  locationName: string;
  variant: CalloutVariant;
  enableSwipe: boolean;
  onClose?: () => void;
  onAllFailed?: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [failedUrls, setFailedUrls] = useState<Set<string>>(() => new Set());
  const touchStartXRef = useRef<number | null>(null);

  useEffect(() => {
    setFailedUrls(new Set());
    setIndex(0);
  }, [images]);

  const visibleImages = useMemo(
    () => images.filter((src) => !failedUrls.has(src)),
    [images, failedUrls],
  );

  const count = visibleImages.length;

  const handleImageError = useCallback((src: string) => {
    setFailedUrls((prev) => {
      const next = new Set(prev);
      next.add(src);
      return next;
    });
  }, []);

  const goTo = useCallback(
    (next: number) => {
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  const goNext = useCallback(() => goTo(index + 1), [goTo, index]);
  const goPrev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (index >= count && count > 0) {
      setIndex(0);
    }
  }, [index, count]);

  useEffect(() => {
    if (count === 0 && images.length > 0) {
      onAllFailed?.();
    }
  }, [count, images.length, onAllFailed]);

  useEffect(() => {
    if (count <= 1 || paused) {
      return;
    }

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, CAROUSEL_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [count, paused, visibleImages, locationName]);

  if (count === 0) {
    return null;
  }

  const handleTouchStart = (event: TouchEvent) => {
    if (!enableSwipe || count <= 1) {
      return;
    }

    touchStartXRef.current = event.touches[0]?.clientX ?? null;
    setPaused(true);
  };

  const handleTouchEnd = (event: TouchEvent) => {
    if (!enableSwipe || count <= 1 || touchStartXRef.current === null) {
      return;
    }

    const touch = event.changedTouches[0];
    if (!touch) {
      touchStartXRef.current = null;
      return;
    }

    const deltaX = touch.clientX - touchStartXRef.current;
    touchStartXRef.current = null;

    if (Math.abs(deltaX) >= SWIPE_THRESHOLD_PX) {
      if (deltaX > 0) {
        goPrev();
      } else {
        goNext();
      }
    }

    window.setTimeout(() => setPaused(false), 400);
  };

  return (
    <div
      className={`relative w-full shrink-0 touch-pan-y overflow-hidden ${CAROUSEL_HEIGHT[variant]}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <img
        src={visibleImages[index]}
        alt={`${locationName} — photo ${index + 1} of ${count}`}
        className="h-full w-full object-cover transition-opacity duration-300"
        draggable={false}
        onError={() => handleImageError(visibleImages[index])}
      />

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close destination details"
          className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-sm font-medium text-slate-700 shadow-md ring-1 ring-black/10 backdrop-blur-sm transition hover:bg-white"
        >
          ✕
        </button>
      )}

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous photo"
            className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white shadow-md backdrop-blur-sm transition hover:bg-black/60"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next photo"
            className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white shadow-md backdrop-blur-sm transition hover:bg-black/60"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
            </svg>
          </button>

          <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
            {visibleImages.map((image, dotIndex) => (
              <button
                key={image}
                type="button"
                aria-label={`Show photo ${dotIndex + 1}`}
                onClick={() => goTo(dotIndex)}
                className={`h-2 w-2 rounded-full transition ${
                  dotIndex === index ? "bg-white" : "bg-white/50 hover:bg-white/75"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function CalloutContent({
  location,
  onClose,
  mapActionLabel = "Show full map",
  compact = false,
  hideCloseButton = false,
  showGalleryPlaceholder = false,
}: Omit<LocationMarkerCalloutProps, "variant" | "anchor" | "containerSize"> & {
  mapActionLabel?: string;
  compact?: boolean;
  hideCloseButton?: boolean;
  showGalleryPlaceholder?: boolean;
}) {
  return (
    <>
      <div className={`flex flex-wrap items-start justify-between gap-2 ${compact ? "mb-2" : "mb-3"}`}>
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
          <h2
            className={`mt-1 font-semibold leading-tight text-slate-900 ${
              compact ? "text-lg" : "mt-1.5 text-xl md:text-2xl"
            }`}
          >
            {location.name}
          </h2>
        </div>
        {!hideCloseButton && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close destination details"
            className="shrink-0 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
          >
            ✕
          </button>
        )}
      </div>

      <p className={`leading-relaxed text-slate-600 ${compact ? "text-xs" : "text-sm"}`}>
        {location.shortDescription}
      </p>

      {location.subDestinations && location.subDestinations.length > 0 && (
        <div className={compact ? "mt-2" : "mt-3"}>
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

      {showGalleryPlaceholder && (
        <div
          className={`rounded-lg border border-dashed border-slate-300 bg-slate-50 text-center text-xs text-slate-500 ${
            compact ? "mt-2 px-3 py-3" : "mt-3 px-3 py-5"
          }`}
        >
          Photo gallery coming soon
        </div>
      )}

      <div className={`rounded-lg border border-slate-300 bg-slate-50 ${compact ? "mt-2 p-2.5" : "mt-3 p-3"}`}>
        <p className="text-xs text-slate-500">Price from</p>
        <p className="text-base font-semibold text-slate-900">EUR — coming soon</p>
      </div>

      <button
        type="button"
        disabled
        className={`w-full rounded-xl bg-slate-900 px-4 text-sm font-medium text-white opacity-50 ${
          compact ? "mt-2 py-2" : "mt-3 py-2.5"
        }`}
      >
        Select destination (booking soon)
      </button>

      <button
        type="button"
        onClick={onClose}
        className={`w-full rounded-lg border border-slate-300 px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-50 ${
          compact ? "mt-1.5 py-1.5" : "mt-2 py-2"
        }`}
      >
        {mapActionLabel}
      </button>
    </>
  );
}

function CalloutCard({
  location,
  onClose,
  className,
  style,
  cardRef,
  placement,
  showSheetHandle = false,
  variant,
  mapActionLabel,
  onEffectiveCoverChange,
}: {
  location: ArchipelagoLocation;
  onClose: () => void;
  className: string;
  style?: CSSProperties;
  cardRef?: RefObject<HTMLElement | null>;
  placement?: CalloutPlacement | null;
  showSheetHandle?: boolean;
  variant: CalloutVariant;
  mapActionLabel?: string;
  onEffectiveCoverChange?: (hasCover: boolean) => void;
}) {
  const isNarrow = useNarrowViewport();
  const [carouselFailed, setCarouselFailed] = useState(false);

  useEffect(() => {
    setCarouselFailed(false);
  }, [location.id]);

  const configuredHasCover = Boolean(location.coverImages?.length);
  const effectiveHasCoverImages = configuredHasCover && !carouselFailed;

  useEffect(() => {
    onEffectiveCoverChange?.(effectiveHasCoverImages);
  }, [effectiveHasCoverImages, onEffectiveCoverChange]);

  const closeOnImage =
    effectiveHasCoverImages && (variant === "detail" || variant === "anchored");
  const enableSwipe = variant === "detail" || isNarrow;

  return (
    <article
      ref={cardRef}
      key={location.id}
      className={`relative flex flex-col overflow-hidden border-slate-200 bg-white ${className}`}
      style={style}
    >
      {configuredHasCover && !carouselFailed && (
        <CalloutCoverCarousel
          key={`${location.id}-${location.coverImages!.join("|")}`}
          images={location.coverImages!}
          locationName={location.name}
          variant={variant}
          enableSwipe={enableSwipe}
          onClose={closeOnImage ? onClose : undefined}
          onAllFailed={() => setCarouselFailed(true)}
        />
      )}
      <div className={`relative z-10 ${effectiveHasCoverImages ? (variant === "detail" ? "p-3" : "p-5") : "p-4"}`}>
        {showSheetHandle && (
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-300/80" />
        )}
        <CalloutContent
          location={location}
          onClose={onClose}
          mapActionLabel={mapActionLabel}
          compact={variant === "detail"}
          hideCloseButton={closeOnImage}
          showGalleryPlaceholder={!effectiveHasCoverImages}
        />
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
  const [effectiveHasCover, setEffectiveHasCover] = useState(
    Boolean(location.coverImages?.length),
  );

  useEffect(() => {
    setEffectiveHasCover(Boolean(location.coverImages?.length));
  }, [location.id, location.coverImages?.length]);

  const baseWidth = effectiveHasCover ? CALLOUT_WIDTH_WITH_COVER : CALLOUT_WIDTH;
  const cardWidth = Math.min(baseWidth, containerSize.width - 24);

  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!card) {
      return;
    }

    const height = card.scrollHeight;
    setPlacement(
      computeCalloutPlacement(anchor, cardWidth, height, containerSize),
    );
  }, [anchor, cardWidth, containerSize, location.id, effectiveHasCover]);

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      <CalloutCard
        cardRef={cardRef}
        location={location}
        onClose={onClose}
        placement={placement}
        variant="anchored"
        onEffectiveCoverChange={setEffectiveHasCover}
        className="callout-anchored pointer-events-auto absolute overflow-y-auto rounded-2xl border shadow-2xl"
        style={{
          left: placement?.left ?? -9999,
          top: placement?.top ?? -9999,
          width: cardWidth,
          maxHeight: placement?.maxHeight,
          visibility: placement ? "visible" : "hidden",
        }}
      />
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
  const [sheetEffectiveHasCover, setSheetEffectiveHasCover] = useState(
    Boolean(location.coverImages?.length),
  );

  useEffect(() => {
    setSheetEffectiveHasCover(Boolean(location.coverImages?.length));
  }, [location.id, location.coverImages?.length]);

  if (variant === "detail") {
    return (
      <CalloutCard
        location={location}
        onClose={onClose}
        variant="detail"
        mapActionLabel="Back to map"
        className="rounded-2xl border shadow-sm"
      />
    );
  }

  if (variant === "sheet") {
    return (
      <>
        <button
          type="button"
          aria-label="Close destination details"
          onClick={onClose}
          className="absolute inset-0 z-20 bg-slate-900/25 backdrop-blur-[1px]"
        />
        <CalloutCard
          location={location}
          onClose={onClose}
          showSheetHandle
          variant="sheet"
          onEffectiveCoverChange={setSheetEffectiveHasCover}
          className={`callout-sheet absolute inset-x-0 bottom-0 z-30 overflow-y-auto rounded-t-2xl border shadow-2xl ${
            sheetEffectiveHasCover ? "max-h-[88vh]" : "max-h-[72vh]"
          }`}
        />
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

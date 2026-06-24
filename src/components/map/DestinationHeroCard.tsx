"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
  type TouchEvent,
} from "react";
import type { CalloutPlacement } from "@/components/map/calloutPlacement";

const CAROUSEL_INTERVAL_MS = 3000;
const SWIPE_THRESHOLD_PX = 48;

type DestinationHeroVariant = "detail" | "anchored";

const VARIANT_CLASSES: Record<DestinationHeroVariant, string> = {
  detail: "h-full min-h-0 flex-1 rounded-3xl",
  anchored: "min-h-[32rem] rounded-2xl md:min-h-[38rem]",
};

const HERO_IMAGE_CONTROL =
  "flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/25 text-white shadow-[0_2px_12px_rgba(0,0,0,0.35)] backdrop-blur-md transition hover:border-white/35 hover:bg-black/40 active:scale-95";

const HERO_CLOSE_CONTROL = `${HERO_IMAGE_CONTROL} absolute right-3 top-3 z-20 text-lg leading-none`;

const HERO_NAV_CONTROL =
  "flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/25 text-white shadow-[0_2px_12px_rgba(0,0,0,0.35)] backdrop-blur-md transition hover:border-white/35 hover:bg-black/40 active:scale-95 absolute z-20 -translate-y-1/2";

const NAV_VERTICAL_POSITION: Record<DestinationHeroVariant, string> = {
  detail: "top-1/2",
  anchored: "top-[34%] md:top-[36%]",
};

const CONTENT_PADDING: Record<DestinationHeroVariant, string> = {
  detail: "px-4 pb-5 pt-1 sm:px-5 sm:pb-5",
  anchored: "px-5 pb-5 pt-1 md:px-14 md:pb-6",
};

const GRADIENT_HEIGHT: Record<DestinationHeroVariant, string> = {
  detail: "h-[62%]",
  anchored: "h-[52%] md:h-[48%]",
};

type DestinationHeroCardProps = {
  images: string[];
  locationName: string;
  variant: DestinationHeroVariant;
  enableSwipe: boolean;
  onClose?: () => void;
  onAllFailed?: () => void;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  cardRef?: RefObject<HTMLElement | null>;
  placement?: CalloutPlacement | null;
};

export function DestinationHeroCard({
  images,
  locationName,
  variant,
  enableSwipe,
  onClose,
  onAllFailed,
  children,
  className = "",
  style,
  cardRef,
  placement,
}: DestinationHeroCardProps) {
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

  if (count === 0) {
    return null;
  }

  return (
    <article
      ref={cardRef}
      className={`relative flex flex-col overflow-hidden border-slate-200 bg-slate-900 ${VARIANT_CLASSES[variant]} ${className}`}
      style={style}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="pointer-events-none absolute inset-0 touch-pan-y">
        {visibleImages.map((src, imageIndex) => (
          <img
            key={src}
            src={src}
            alt={`${locationName} — photo ${imageIndex + 1} of ${count}`}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
              imageIndex === index ? "opacity-100" : "opacity-0"
            }`}
            draggable={false}
            onError={() => handleImageError(src)}
          />
        ))}

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.15),transparent_50%)]" />
        <div className="absolute -right-8 top-6 h-32 w-32 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute -left-12 bottom-24 h-40 w-40 rounded-full bg-sky-300/10 blur-3xl" />

        <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/95 via-slate-950/60 to-transparent ${GRADIENT_HEIGHT[variant]}`} />
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close destination details"
          className={HERO_CLOSE_CONTROL}
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
            className={`${HERO_NAV_CONTROL} ${NAV_VERTICAL_POSITION[variant]} left-2 sm:left-3`}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next photo"
            className={`${HERO_NAV_CONTROL} ${NAV_VERTICAL_POSITION[variant]} right-2 sm:right-3`}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
            </svg>
          </button>
        </>
      )}

      <div className={`relative z-10 mt-auto w-full ${CONTENT_PADDING[variant]}`}>
        {children}
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

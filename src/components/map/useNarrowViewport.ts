"use client";

import { useEffect, useState } from "react";

const NARROW_VIEWPORT_QUERY = "(max-width: 1024px)";

export function getIsNarrowViewport() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia(NARROW_VIEWPORT_QUERY).matches;
}

export function useNarrowViewport() {
  const [isNarrow, setIsNarrow] = useState(getIsNarrowViewport);

  useEffect(() => {
    const mediaQuery = window.matchMedia(NARROW_VIEWPORT_QUERY);
    const update = () => setIsNarrow(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return isNarrow;
}

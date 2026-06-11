export type CalloutAnchor = {
  x: number;
  y: number;
};

export type CalloutContainerSize = {
  width: number;
  height: number;
};

export type CalloutPlacement = {
  left: number;
  top: number;
  maxHeight: number;
  placement: "above" | "below";
  tailLeft: number;
};

const PADDING = 12;
const MARKER_GAP = 16;
const TAIL_INSET = 20;

export function computeCalloutPlacement(
  anchor: CalloutAnchor,
  cardWidth: number,
  cardHeight: number,
  container: CalloutContainerSize,
): CalloutPlacement {
  const clamp = (value: number, min: number, max: number) =>
    Math.max(min, Math.min(value, max));

  const maxHeight = Math.max(120, container.height - PADDING * 2);
  const effectiveHeight = Math.min(cardHeight, maxHeight);

  const spaceAbove = anchor.y - PADDING;
  const spaceBelow = container.height - anchor.y - PADDING;

  let placement: CalloutPlacement["placement"] = "above";
  let top = anchor.y - MARKER_GAP - effectiveHeight;

  if (effectiveHeight + MARKER_GAP > spaceAbove && spaceBelow > spaceAbove) {
    placement = "below";
    top = anchor.y + MARKER_GAP;
  } else if (top < PADDING) {
    placement = "below";
    top = anchor.y + MARKER_GAP;
  }

  if (placement === "below" && top + effectiveHeight > container.height - PADDING) {
    top = container.height - PADDING - effectiveHeight;
  }

  top = clamp(top, PADDING, container.height - PADDING - effectiveHeight);

  const width = Math.min(cardWidth, container.width - PADDING * 2);
  const left = clamp(anchor.x - width / 2, PADDING, container.width - PADDING - width);
  const tailLeft = clamp(anchor.x - left, TAIL_INSET, width - TAIL_INSET);

  return {
    left,
    top,
    maxHeight,
    placement,
    tailLeft,
  };
}

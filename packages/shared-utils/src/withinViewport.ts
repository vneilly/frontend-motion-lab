export interface ViewportPosition {
  x: number;
  y: number;
}

export interface ViewPortBounds {
  vw: number;
  vh: number;
}

function getViewPortBounds(): ViewPortBounds {
  if (typeof globalThis !== "undefined" && (globalThis as any).window) {
    const currentWindow = (globalThis as any).window as Window;
    return {
      vw: currentWindow.innerWidth ?? 0,
      vh: currentWindow.innerHeight ?? 0,
    };
  }
  return { vw: 0, vh: 0 };
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

export function withinViewport(
  x: number,
  y: number,
  width: number,
  height: number,
  pad = 0,
  bounds?: ViewPortBounds,
): ViewportPosition {
  const { vw, vh } = bounds ?? getViewPortBounds();

  // Compute the far edges to place tooltips top-left
  // the tooltips right/bottom doesn't exceed viewport minus padding
  const maxX = Math.max(pad, vw - width - pad);
  const maxY = Math.max(pad, vh - height - pad);

  const clampedX = clamp(x, pad, maxX);
  const clampedY = clamp(y, pad, maxY);

  return { x: clampedX, y: clampedY };
}

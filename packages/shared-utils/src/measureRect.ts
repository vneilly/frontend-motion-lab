export interface DomRectSnapshot {
  x: number;
  y: number;
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

type RectSource = {
  getBoundingClientRect: () => Partial<DOMRect> | DOMRect;
};

function num(n: unknown, fallback = 0): number {
  return typeof n === "number" && Number.isFinite(n) ? n : fallback;
}

export function measureRect(el: RectSource): DomRectSnapshot {
  const r = el.getBoundingClientRect() as Partial<DOMRect>;
  return {
    x: num(r.x, num(r.left)), // fall back to left if x missing
    y: num(r.y, num(r.top)), // fall back to top if y missing
    top: num(r.top),
    left: num(r.left),
    right: num(r.right),
    bottom: num(r.bottom),
    width: num(r.width),
    height: num(r.height),
  };
}

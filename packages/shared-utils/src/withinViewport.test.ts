import { describe, expect, test } from "vitest";

import { withinViewport } from "./withinViewport";

describe("withinViewport", () => {
  test("returns same coords when already inside bounds", () => {
    const pos = withinViewport(50, 60, 20, 10, 0, { vw: 200, vh: 150 });
    expect(pos).toEqual({ x: 50, y: 60 });
  });

  test("clamps to left/top padding", () => {
    const pos = withinViewport(-10, -5, 20, 10, 8, { vw: 200, vh: 150 });
    expect(pos).toEqual({ x: 8, y: 8 });
  });

  test("clamps to right/bottom edge minus padding", () => {
    const pos = withinViewport(500, 500, 40, 30, 6, { vw: 200, vh: 150 });
    // maxX = 200 - 40 - 6 = 154; maxY = 150 - 30 - 6 = 114
    expect(pos).toEqual({ x: 154, y: 114 });
  });

  test("oversized tooltip: pins to padding (best-effort)", () => {
    const pos = withinViewport(0, 0, 500, 400, 10, { vw: 200, vh: 150 });
    // maxX = max(10, 200 - 500 - 10) => 10; maxY = max(10, 150 - 400 - 10) => 10
    expect(pos).toEqual({ x: 10, y: 10 });
  });

  test("defaults to window bounds when no bounds provided (SSR-safe path won’t crash)", () => {
    // In Node, getViewportBounds() returns {vw:0,vh:0} → clamps to pad
    const pos = withinViewport(20, 30, 10, 10, 4);
    expect(pos).toEqual({ x: 4, y: 4 });
  });
});

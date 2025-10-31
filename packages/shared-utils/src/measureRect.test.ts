import { describe, expect, test } from "vitest";

import { measureRect } from "./measureRect";

describe("measureRect", () => {
  test("copies values from getBoundingClientRect into a plain object", () => {
    const el = {
      getBoundingClientRect: () => ({
        x: 10,
        y: 20,
        top: 20,
        left: 10,
        right: 110,
        bottom: 70,
        width: 100,
        height: 50,
      }),
    };
    const r = measureRect(el);
    expect(r).toEqual({
      x: 10,
      y: 20,
      top: 20,
      left: 10,
      right: 110,
      bottom: 70,
      width: 100,
      height: 50,
    });
  });

  test("falls back when x/y are missing (older DOMRect)", () => {
    const el = {
      getBoundingClientRect: () => ({
        top: 5,
        left: 7,
        right: 50,
        bottom: 30,
        width: 43,
        height: 25,
      }),
    };
    const r = measureRect(el);
    expect(r).toEqual({
      x: 7,
      y: 5,
      top: 5,
      left: 7,
      right: 50,
      bottom: 30,
      width: 43,
      height: 25,
    });
  });

  test("normalizes missing fields to 0", () => {
    const el = {
      getBoundingClientRect: () => ({}),
    };
    const r = measureRect(el);
    expect(r).toEqual({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: 0,
      height: 0,
    });
  });
});

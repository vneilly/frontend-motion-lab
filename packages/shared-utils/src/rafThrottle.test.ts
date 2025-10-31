import { describe, expect, test, vi } from "vitest";

import { rafThrottle } from "./rafThrottle";

describe("rafThrottle", () => {
  test("coalesces multiple calls into one single call with latest args", async () => {
    // Advance one "frame"
    vi.useFakeTimers();

    const spy = vi.fn();
    const throttled = rafThrottle(spy);

    // Rapid calls in same frame
    throttled(1);
    throttled(2);
    throttled(3); // <---- this call should win

    vi.advanceTimersByTime(16);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toBeCalledWith(3);

    vi.useRealTimers();
  });

  test("cancel prevents the schedul", async () => {
    const spy = vi.fn();
    const throttled = rafThrottle(spy);

    throttled("x");
    throttled.cancel(); // cancels pending frame

    vi.useFakeTimers();
    vi.advanceTimersByTime(16);

    expect(spy).not.toHaveBeenCalled();

    vi.useRealTimers();
  });
});

export type RafThrottled<F extends (...args: any[]) => void> = ((
  ...args: Parameters<F>
) => void) & { cancel: () => void };

type RafCB = (time: number) => void;

export function rafThrottle<F extends (...args: any[]) => void>(fn: F): RafThrottled<F> {
  let frameId: number | null = null;
  let lastArgs: Parameters<F> | null = null;

  const rAF = (cb: RafCB): number =>
    typeof globalThis !== "undefined" &&
    typeof (globalThis as any).requestAnimationFrame === "function"
      ? (globalThis as any).requestAnimationFrame(cb)
      : (setTimeout(cb, 16) as unknown as number);

  const cAF = (id: number) =>
    typeof globalThis !== "undefined" &&
    typeof (globalThis as any).cancelAnimationFrame === "function"
      ? (globalThis as any).cancelAnimationFrame(id)
      : clearTimeout(id as unknown as any);

  const wrapped: any = (...args: Parameters<F>) => {
    lastArgs = args;
    if (frameId != null) return; // scheduled frame already exist

    frameId = rAF(() => {
      frameId = null;
      if (!lastArgs) return;
      fn(...lastArgs); // run once per frame within latest args
      lastArgs = null;
    });
  };

  wrapped.cancel = () => {
    if (frameId !== null) {
      cAF(frameId);
      frameId = null;
      lastArgs = null;
    }
  };
  return wrapped;
}

import type { RafThrottled } from "@vn2/shared-utils";
import { withinViewport, rafThrottle } from "@vn2/shared-utils";

export type SmartTooltipOptions = {
  selector?: string;
  offset?: number;
  pad?: number;
  rootId?: string;
};

export class SmartTooltip {
  private selector: string;
  private offset: number;
  private pad: number;
  private rootId: string;
  private rootEl: HTMLDivElement | null = null;
  private throttledMove!: RafThrottled<(x: number, y: number) => void>;
  private host: Document | HTMLElement = document;
  private currentTrigger: HTMLElement | null = null;
  private removeListeners: Array<() => void> = [];
  private isAttached: boolean = false;

  private on(target: Document | HTMLElement | Window, type: string, handler: (e: Event) => void) {
    // Cast is pragmatic for Document/Window unions
    (target as any).addEventListener(type, handler as any, false);
    this.removeListeners.push(() =>
      (target as any).removeEventListener(type, handler as any, false),
    );
  }

  private onMouse(type: "mouseover" | "mousemove" | "mouseout", handler: (e: MouseEvent) => void) {
    this.on(this.host, type, (e) => handler(e as MouseEvent));
  }

  private onKey(type: "keydown", handler: (e: KeyboardEvent) => void) {
    this.on(window, type, (e) => handler(e as KeyboardEvent));
  }

  // Listeners and throttled functions later.
  // Keeping fields explicit helps Intellisense.

  private createRoot(): HTMLDivElement {
    const el = document.createElement("div");
    el.className = "stp-root";
    el.id = this.rootId;
    el.setAttribute("role", "tooltip");
    el.setAttribute("data-visible", "false");
    el.textContent = "";
    document.body.appendChild(el);
    return el;
  }

  private getRoot(): HTMLDivElement {
    if (this.rootEl && document.body.contains(this.rootEl)) {
      return this.rootEl;
    }
    this.rootEl = this.createRoot();
    return this.rootEl;
  }

  private getTipRect() {
    return this.getRoot().getBoundingClientRect();
  }

  private clampAndMove(x: number, y: number): void {
    const { width, height } = this.getTipRect();
    const { x: sx, y: sy } = withinViewport(x, y, width, height, this.pad);
    this.move(sx, sy);
  }

  public show(text: string): void {
    const el = this.getRoot();
    el.textContent = text;
    el.setAttribute("data-visible", "true");
  }

  public move(x: number, y: number): void {
    const el = this.getRoot();
    el.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
  }

  public hide(): void {
    const el = this.getRoot();
    el.setAttribute("data-visible", "false");
    el.style.transform = `translate(-9999px, -9999px)`;
  }

  constructor(opts: SmartTooltipOptions = {}) {
    this.selector = opts.selector ?? "[data-stp-tooltip]";
    this.offset = opts.offset ?? 12;
    this.pad = opts.pad ?? 8;
    this.rootId = opts.rootId ?? "stp-tooltip";
    this.throttledMove = rafThrottle((x: number, y: number) => {
      this.clampAndMove(x, y);
    });
  }

  attach(root: Document | HTMLElement = document): void {
    if (this.isAttached === true) {
      return;
    }
    this.isAttached = true;

    // wire events here
    this.host = root;

    // Delegated "enter": use mouseover (bubbles) + closest() to find a trigger
    this.onMouse("mouseover", (e) => {
      const target = (e.target as Element | null)?.closest?.(this.selector) as HTMLElement | null;

      if (!target || target === this.currentTrigger) {
        return;
      }
      this.currentTrigger = target;

      const text =
        target.getAttribute("data-stp-tooltip") ?? target.getAttribute("aria-label") ?? "";

      this.show(text);

      // Initial placement near element
      const tipRect = this.getTipRect();
      const rect = target.getBoundingClientRect();
      const preferredX = rect.left + rect.width / 2 - tipRect.width / 2;
      const preferredY = rect.top - tipRect.height - this.offset;

      this.clampAndMove(preferredX, preferredY);
    });

    // Track movement only while a tooltip is active
    this.onMouse("mousemove", (e) => {
      if (!this.currentTrigger) {
        return;
      }

      const ev = e as MouseEvent;
      this.throttledMove(ev.clientX + this.offset, ev.clientY + this.offset);
    });

    // Delegated 'mouseout' listener:
    this.onMouse("mouseout", (e) => {
      if (!this.currentTrigger) {
        return;
      }
      const toEl = (e.relatedTarget as Element | null) ?? null;
      const stillInsideTrigger = !!toEl && !!toEl.closest?.(this.selector);

      if (!stillInsideTrigger) {
        this.throttledMove.cancel();
        this.hide();
        this.currentTrigger = null;
      }
    });

    this.on(window, "blur", () => {
      this.throttledMove.cancel();
      this.hide();
      this.currentTrigger = null;
    });

    this.on(window, "keydown", (e) => {
      if ((e as KeyboardEvent).key === "Escape") {
        this.throttledMove.cancel();
        this.hide();
        this.currentTrigger = null;
      }
    });
  }

  detach(): void {
    // remove listeners / cancel rAF
    if (this.isAttached === false) {
      return;
    }

    this.throttledMove.cancel();

    // explicit hide
    const tip = this.rootEl;
    if (tip !== null) {
      tip.setAttribute("data-visible", "false");
      tip.style.transform = "translate(-9999px, -9999px)";
    }

    // safe listener remove
    for (const off of this.removeListeners) {
      try {
        off();
      } catch {
        // no-op: listener target may be gone;
      }
    }
    this.removeListeners = [];

    // state reset
    this.currentTrigger = null;
    this.host = document;
    this.isAttached = false;
  }
}

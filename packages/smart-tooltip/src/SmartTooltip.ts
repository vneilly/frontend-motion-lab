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
  private originalDescribedBy: WeakMap<HTMLElement, string | null> = new WeakMap<
    HTMLElement,
    string | null
  >();
  private blurTimerId: number | null = null;

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

  private updateDescribedBy(trigger: HTMLElement, op: "add" | "remove"): void {
    const tipId = this.rootId;

    // get and read current tokens (space-separated ids)
    const current = trigger.getAttribute("aria-describedby");
    const currentTokens = (current ?? "").trim().split(/\s+/).filter(Boolean);

    // Branches
    switch (op) {
      case "add": {
        if (!this.originalDescribedBy.has(trigger)) {
          this.originalDescribedBy.set(trigger, current ?? null);
        }

        if (!currentTokens.includes(tipId)) {
          currentTokens.push(tipId);
        }

        if (currentTokens.length > 0) {
          trigger.setAttribute("aria-describedby", currentTokens.join(" "));
        } else {
          trigger.removeAttribute("aria-describedby");
        }

        break;
      }
      case "remove": {
        const filtered = currentTokens.filter((t) => t !== tipId);

        if (this.originalDescribedBy.has(trigger)) {
          const original = this.originalDescribedBy.get(trigger);

          if (original && original.length > 0) {
            trigger.setAttribute("aria-describedby", original);
          } else {
            trigger.removeAttribute("aria-describedby");
          }

          this.originalDescribedBy.delete(trigger);
          break;
        }

        if (filtered.length > 0) {
          trigger.setAttribute("aria-describedby", filtered.join(" "));
        } else {
          trigger.removeAttribute("aria-describedby");
        }

        break;
      }
    }
  }

  public show(text: string): void {
    const el = this.getRoot();
    el.textContent = text;
    el.setAttribute("data-visible", "true");
    el.setAttribute("aria-hidden", "false");
  }

  public move(x: number, y: number): void {
    const el = this.getRoot();
    el.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
  }

  public hide(): void {
    if (this.blurTimerId !== null) {
      clearTimeout(this.blurTimerId);
      this.blurTimerId = null;
    }
    const el = this.getRoot();
    el.setAttribute("data-visible", "false");
    el.style.transform = `translate(-9999px, -9999px)`;
    el.setAttribute("aria-hidden", "true");
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

    // Focus IN
    this.on(this.host, "focusin", (e) => {
      // Cxl pending blur-hide timer.
      if (this.blurTimerId !== null) {
        clearTimeout(this.blurTimerId);
        this.blurTimerId = null;
      }

      // find closest tooltip trigger for the focused element.
      const targetElement = e.target as Element | null;
      const trigger = targetElement?.closest?.(this.selector) as HTMLElement | null;

      // return if no trigger match found
      if (!trigger) {
        return;
      }

      // if tooltip is showing already for this trigger exit.
      if (this.currentTrigger === trigger) {
        return;
      }

      this.currentTrigger = trigger;

      // Resolve the text for the tooltip
      const textFromData = trigger.getAttribute("data-stp-tooltip");
      const textFromAria = trigger.getAttribute("aria-label");
      const text = textFromData ?? textFromAria ?? "";

      if (!text) {
        return;
      }

      // Show tooltip and update ARIA linkage
      this.show(text);
      this.updateDescribedBy(trigger, "add");

      // Position above-centered relative to the trigger element.
      const tipRect = this.getTipRect();
      const rect = trigger.getBoundingClientRect();

      const preferredX = rect.left + rect.width / 2 - tipRect.width / 2;
      const preferredY = rect.top + tipRect.height - this.offset;

      this.clampAndMove(preferredX, preferredY);
    });

    this.on(this.host, "focusout", (e) => {
      // find trigger on element that lost focus
      const targetElement = e.target as Element | null;
      const trigger = targetElement?.closest?.(this.selector) as HTMLElement | null;

      // if blur doesn't originate from a tooltip trigger -- ignore.
      if (!trigger) {
        return;
      }

      if (this.currentTrigger !== trigger) {
        return;
      }

      // Schedule a delayed hide to avoid flicker on quick focus moves
      if (this.blurTimerId !== null) {
        clearTimeout(this.blurTimerId);
        this.blurTimerId = null;
      }

      this.blurTimerId = window.setTimeout(() => {
        if (this.currentTrigger === trigger) {
          this.hide();
          this.updateDescribedBy(trigger, "remove");
          this.currentTrigger = null;
        }
      }, 100);
    });

    // Focus OUT

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

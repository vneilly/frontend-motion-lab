import "./style.css";

import { rafThrottle, withinViewport } from "@vn2/shared-utils";

import { show, move, hide, getRoot } from "./tooltip";

const OFFSET = 12; // distance away from cursor/target so we don't obsure it.
const PAD = 8; // margin from viewport edges for tidy UI/UX.

const moveTooltip = rafThrottle((x: number, y: number) => {
  const { width, height } = getRoot().getBoundingClientRect();

  // Clamp desired positioning to the viewport
  const { x: safeX, y: safeY } = withinViewport(x, y, width, height, PAD);

  move(safeX, safeY);
});

const TOOLTIP_ID = "stp-tooltip";

function setDescribedBy(el: HTMLElement) {
  el.setAttribute("aria-describedby", TOOLTIP_ID);
}

function clearDescribedBy(el: HTMLElement) {
  if (el.getAttribute("aria-describedby") === TOOLTIP_ID) {
    el.removeAttribute("aria-describedby");
  }
}

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
<h1>Tooltip (Vanilla)</h1>
<p>Hover the elements below to see the tooltip follow your cursor.</p>
  <div class="demo-grid">
    <button data-tooltip="Primary action">Primary Button</button>
    <button data-tooltip="Secondary action">Secondary Button</button>
    <div data-tooltip="Card with details" class="vn-card" tabindex="0">
      Hover over this card
    </div>
  </div>
`;

function wireHoverTooltips(selector = "[data-tooltip]") {
  const nodes = document.querySelectorAll<HTMLElement>(selector);
  nodes.forEach((el) => {
    el.addEventListener("mouseenter", (_e) => {
      const toolTipText = el.getAttribute("data-tooltip") ?? "";
      show(toolTipText);
    });

    el.addEventListener("mousemove", (e) => {
      const ev = e as MouseEvent;
      moveTooltip(ev.clientX + OFFSET, ev.clientY + OFFSET);
    });

    el.addEventListener("mouseleave", () => {
      moveTooltip.cancel();
      hide();
    });
  });
}

function wireFocusTooltips(selector = "[data-tooltip]") {
  const nodes = document.querySelectorAll<HTMLElement>(selector);

  nodes.forEach((el) => {
    el.addEventListener("focus", () => {
      const text = el.getAttribute("data-tooltip") ?? "";
      show(text);
      setDescribedBy(el);
      // const rect = el.getBoundingClientRect();
      // move(rect.left + rect.width + OFFSET, rect.top);

      const targetRect = el.getBoundingClientRect();

      // measure current tooltip box (singleton)
      const tipRect = getRoot().getBoundingClientRect();

      let preferredX = targetRect.left + targetRect.width / 2 - tipRect.width / 2;
      let preferredY = targetRect.top - tipRect.height - OFFSET;

      // clamp to viewport - no clips
      const { x, y } = withinViewport(preferredX, preferredY, tipRect.width, tipRect.height, PAD);

      move(x, y);
    });

    el.addEventListener("blur", () => {
      hide();
      clearDescribedBy(el);
    });
  });
}

wireHoverTooltips();
wireFocusTooltips();

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    hide();
  }
});

window.addEventListener("blur", () => {
  hide();
});

window.addEventListener("mouseout", (e) => {
  const to = e.relatedTarget as Element | null;
  if (!to) {
    hide();
  }
});

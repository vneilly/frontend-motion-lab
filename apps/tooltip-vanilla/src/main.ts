import "./style.css";
import { show, move, hide } from "./tooltip";

const OFFSET_X = 12;
const OFFSET_Y = 12;

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
<h1>Tooltip (Vanilla)</h1>
<p>Hover the elements below to see the tooltip follow your cursor.</p>
  <div class="demo-grid">
    <button data-tooltip="Primary action">Primary Button</button>
    <button data-tooltip="Secondary action">Secondary Button</button>
    <div data-tooltip="Card with details" class="vn-card">
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
      move(ev.clientX + OFFSET_X, ev.clientY + OFFSET_Y);
    });

    el.addEventListener("mouseleave", () => {
      hide();
    });
  });
}

wireHoverTooltips();

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    hide();
  }
});

window.addEventListener("blur", () => {
  hide();
});

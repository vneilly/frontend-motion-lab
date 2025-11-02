const ROOT_SEL = ".stp-root";
const OFFSCREEN = "-9999px, -9999px";

function createRoot(): HTMLDivElement {
  const el = document.createElement("div");
  el.className = "stp-root";
  el.setAttribute("data-visible", "false");
  el.textContent = "";
  document.body.appendChild(el);
  return el;
}

function getRoot(): HTMLDivElement {
  return (document.querySelector(ROOT_SEL) as HTMLDivElement) ?? createRoot();
}

function show(text: string): void {
  const root = getRoot();
  root.textContent = text;
  root.setAttribute("data-visible", "true");
}

function move(x: number, y: number): void {
  const root = getRoot();
  // Use of transform / translate for smooth, GPU-friendly updates
  root.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
}

function hide(): void {
  const root = getRoot();
  root.setAttribute("data-visible", "false");
  // park tooltip off-screen to avoid interactions during fade.
  root.style.transform = `translate(${OFFSCREEN})`;
}

export { getRoot, hide, move, show };

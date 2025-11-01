# @vn2/smart-tooltip

Smart Tooltip System — an interactive tooltip utility for demos and micro-libraries built with vanilla JavaScript and TypeScript.

---

## 🧭 Overview

This package provides the baseline for the Smart Tooltip System used across Frontend Motion Lab.  
It demonstrates progressive enhancement from basic DOM hover tooltips to modular class-based APIs.

---

## ⚙️ Install / Workspace Setup

Run this command from the repo root:

pnpm --filter @vn2/smart-tooltip build

This ensures the package compiles and is linked within the workspace.

---

## 🧱 Usage (stub)

Example import:

import { **version } from "@vn2/smart-tooltip";
console.log(**version);

> Functional API will be added in later LEARN-03 tickets.

---

## 🧩 Dev Commands

| Command    | Description                     |
| ---------- | ------------------------------- |
| pnpm build | Compile TypeScript into `dist/` |
| pnpm lint  | Run ESLint checks               |
| pnpm test  | Run Vitest (once implemented)   |

---

## 🧠 Design Notes

- ESM-only module
- SSR-safe by default
- Reuses shared-utils for viewport, rAF, and measurement helpers
- Focused on DOM events, positioning, and accessibility

---

## 📄 License

MIT

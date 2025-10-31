# 🎯 Ticket Grooming & Sizing Guidelines

_A living reference for the Frontend Motion Lab monorepo_

---

## 🧩 Purpose

To keep each ticket actionable, focused, and learn-oriented while supporting consistent progress across the project.  
These guidelines apply to all repositories under the **Frontend Motion Lab** umbrella.

---

## 🔖 1. Ticket Types

### 🧠 LEARN Tickets

- Focus on **exploration and understanding** of new concepts, tools, or patterns.
- Deliverables: a verified artifact (prototype, test, doc) **plus** conceptual clarity.
- Typically paired with the AI mentor (pair-coding cadence).

### 🧱 BUILD Tickets

- Focus on **applying** what was learned to production-ready features or refactors.
- Deliverables: functional, test-covered code merged to `develop`.
- Follows normal Git flow with PR and code review.

---

## ⏱ 2. Level of Effort (LOE)

| LOE   | Duration      | Example Scope                            |
| ----- | ------------- | ---------------------------------------- |
| **S** | ≤ 1 hour      | Config tweaks, doc updates, small tests  |
| **M** | ≤ 3 hours     | Single utility, component, or test suite |
| **L** | 🚫 _Not used_ | Any task >3h must be broken down         |

> **Rule:** No ticket should exceed 3 hours of expected effort.  
> Break down larger efforts into sequential sub-tickets (e.g., `LEARN-03A`, `LEARN-03B`, …).

---

## ⚙️ 3. Scope & Atomicity

Each ticket must:

1. Deliver a **tangible artifact** (code, test, or documentation).
2. Have a **clear closure point** (can be merged, tested, or demonstrated).
3. Avoid ambiguous “in-progress” states across sessions.

---

## 🧭 4. Cadence Modes

| Mode                     | Description                                                                          | When to Use                                |
| ------------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------ |
| **Pair-Coding (Guided)** | AI mentor and user code together iteratively, one micro-step at a time.              | Deep dives (LEARN tickets)                 |
| **Guided Practice**      | Mentor demonstrates one piece, then user replicates independently for reinforcement. | Skill-building or smaller BUILD follow-ups |

---

## 🧮 5. Ticket Naming & Branching

| Type          | Prefix     | Example                              |
| ------------- | ---------- | ------------------------------------ |
| Learning      | `LEARN-XX` | `feature/learn-03-tooltip-base`      |
| Build/Feature | `BUILD-XX` | `feature/build-04-tooltip-animation` |

All branches follow:  
`feature/<TICKET-ID>-slug`

---

## 🧾 6. Acceptance & Closure

Each ticket should include:

- ✅ Acceptance criteria checklist
- 🧠 Notes / Context (for future you)
- ⏱ LOE rating
- A linked PR following the **Conventional Commit** style.

Example commit: feat(utils): add withinViewport and measureRect helpers

---

## 🧩 7. Retrospectives

At the end of each LEARN ticket:

- Summarize what was learned and what slowed progress.
- Adjust future scope or sub-ticketing accordingly.
- Keep learning visible in the repository (docs or comments).

---

_Last updated: {{CURRENT_DATE}}_

# Unified Design & UX System: The Mindful Architect 

## 1. Product Philosophy & North Star
The product should feel like a calm studio for serious learning work: calm enough to reduce stress, but structured enough to ship work. 

* **Creative North Star:** "The Digital Sanctuary, Built for Real Work".
* **The Problem:** Programming products often swing too far in one of two directions: sterile and mechanical, or visually rich but hard to use under pressure.
* **The Core Loop:** The most critical feature of AntiCopilot is the closed loop between real coding friction and learning adaptation.
* **Product Principle:** "Clarity Wins Under Load." When users are making decisions or responding to agents, clarity takes priority over mood.

---

## 2. Information Architecture & Layout
Maintain a strict mental model separation between the application's key sections; if a user cannot instantly explain the difference between these screens, the product feels too heavy.

* **Dashboard (What matters today):** Focus entirely on the immediate next step and resolving blockers. It must have only one dominant Call-To-Action (CTA) above the fold, with secondary modules supporting that action.
* **Roadmap (The longer journey):** Provides a high-level view of the path ahead, preserving a clear current milestone and keeping the active target visually strongest. Explanatory content should move into a predictable side rail.
* **Projects (The evidence):** The real-world context driving the adaptations. 
* **Spacing:** Use larger spacing tokens like `24` (8.5rem) between unrelated page sections or shifts in task context. Use tighter spacing tokens like `3` (1rem) within cards or related metadata groups.

---

## 3. Trust, Transparency & Copywriting
The system must feel like a genuinely intelligent, observant coach.

* **Explicit Rationale:** Always show why a suggestion or path change is happening. When the system adapts a roadmap, the UI should show a human-readable reason.
* **Reason Chips:** Attach compact metadata to tasks explaining the system's choice, such as "Based on recent bug pattern" or "Based on review decay".
* **Task Naming:** Task names should focus on completions and value, and path updates should read causally. 
* **Interaction Vocabulary:** Standardize CTA language using terms like `Start` (begin new unit), `Resume` (continue progress), `Review` (revisit concept), `Open in VS Code` (switch context), and `Accept` (used for AI-suggested detours).

---

## 4. Visual Language & Surface Hierarchy
The visual design must ensure that hierarchy is obvious, interactive targets are distinct, and status differences are legible.

* **Mode A (Sanctuary):** Use for landing moments and low-density screens, characterized by expansive whitespace, softer surface transitions, and lighter separation.
* **Mode B (Work):** Use for dashboards and dense screens, characterized by tighter spacing, clearer grouping via subtle borders, and stronger contrast. 
* **Typography:** Use **Manrope** for display text, page titles, and section headlines. Use **Inter** for body text, UI labels, and metadata. 
* **Text Contrast**: Default to `on_surface` (#2e3335) for body text and instructional copy; do not use pure black (#000000). Tertiary text and metadata should remain legible at 90% zoom.
* **Surface Layering**: Base page is `surface` (#f9f9fa), section backgrounds is `surface-container-low` (#f2f4f5), and cards are `surface-container-lowest` (#ffffff).
* **Semantic Color System**: Define colors by meaning and apply consistently across icons, chips, and text:
    * **Teal** = Active path, current task, primary product action.
    * **Orange** = Review, decay, attention, "do this soon".
    * **Purple** = AI suggestion, optional quest, agent-assisted guidance.
    * **Green** = Completed, validated, success.
    * **Slate/Neutral** = Metadata, structure, non-urgent context.

---

## 5. UI Components & Borders
Borders are not a design failure; they are a tool.

* **Boundary Priority:** Prioritize separation using spacing, then surface contrast, then borders, then shadows.
* **Standard Borders:** Use `outline_variant` (#aeb3b5) at 40% to 56% opacity for standard borders, or 24% to 32% for subtle borders on dense screens.
* **Shadows:** Apply ambient shadows with a value of `0px 12px 32px` using `on_surface` (#2e3335) at 4% to 6% opacity for standard cards.
* **Primary Buttons**: Use a gradient from `primary` (#0a6879) to `primary_dim` (#005c6b) or solid primary fill, with `on_primary` text and a radius of `md` (0.75rem).
* **Inputs**: Default to a `surface-container-low` (#f2f4f5) surface. Errors should use `error` (#a83836) for text paired with a clear error border or a 5% opacity `error_container` fill.
* **Progress Indicators**: Use a clear 4px background track of `tertiary_fixed` (#c9ffef) that expands into a `tertiary` (#36685c) fill.
* **Unified Chip System**: Maintain a single family of labels with consistent padding, radius, and weight:
    * **Status Chips**: For state (Active, Decaying, Suggested, Completed).
    * **Type Chips**: For activity category (Learn, Practice, Apply).
    * **Reason Chips**: For system rationale (e.g., "Based on recent bug pattern").

---

## 6. Accessibility & State Management
Accessibility is a first-class aesthetic, not a fallback mode.

* **Minimum State Visibility:** Active, selected, focused, disabled, paused, and warning states must be visually obvious without hovering. Color alone is not enough; combine it with an icon, border, fill change, or label text.
* **Focus States:** Every interactive component requires a minimum 2px focus ring using `primary` (#0a6879).
* **Disabled States:** Use reduced emphasis and saturation, but do not reduce opacity so far that labels become hard to read.

---

## 7. AI Agent Integration
Agents should appear as contextual helpers acting as a supportive layer on top of the roadmap engine, not as a replacement for it.

* **Avoid Generic Chat:** Avoid generic chat interfaces. Agent UI should feel attached to the current task or milestone.
* **Primary Use-Cases:** Agents should explain why a specific task is next, summarize what changed in the roadmap, turn a blocker into a 2-minute drill, inspect project context to propose sub-tasks, or check completion against acceptance criteria.
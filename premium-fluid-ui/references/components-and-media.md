# Components, photos, interactions

- Cards: establish minimum acceptable content width and then let Grid choose columns; never count columns purely from screen model names. For nested card layouts use container queries.
- Images: pick `object-fit: contain` for complete diagrams/logos/critical content; `cover` only for deliberately cropped decorative/photographic media and set `object-position` thoughtfully. Aspect ratio is contextual, not a universal card rule.
- Text: allow natural wrapping and test long identifiers. Do not globally apply `white-space: nowrap` to labels or shrink fonts to preserve column count.
- Buttons: allow label growth in Arabic and at 200% text. Keep adequate hit targets and distinguish genuinely disabled controls.
- Menus/selects/popovers: ensure overlay is anchored to the trigger and not clipped by containing `overflow`; check scroll/viewport edges. Prefer native popover/portal strategy where appropriate; fix event propagation/state bugs instead of masking them with CSS.
- Tables: preserve relational information; for dense tables consider scoped horizontal scrolling with a visible affordance, stacked key/value presentation, or column prioritization. WCAG reflow has a limited exception for content requiring two-dimensional layout for usage/meaning; don't apply this exception to the entire page.
- Scroll areas: avoid nested scroll traps on mobile. Verify focus stays reachable and sticky UI does not cover controls.
- Charts/canvases: maintain accessibility text, boundaries and resize-aware draw calls.

## Proportional visual artifacts inside carousel cards

- Distinguish **content text** (must stay legible and may reflow) from **a visual artifact** (must keep its fixed internal composition, e.g. plate reproduction). Do not lock the artifact to a pixel width while its parent uses flex/grid.
- First make the card's inline size flexible to its actual carousel track (`min-inline-size: 0; inline-size: 100%;`), choosing intentional preview-peek/centering only if the carousel UX requires it.
- For the artifact, preserve its aspect ratio and use a declared query container. Calculate letters, interior borders, emblem, spacing and padding from the same proportional basis. A full-group SVG `viewBox` or CSS container relative units is often safer than individually fixed font sizes. Avoid `transform: scale()` on live HTML text used for reading.
- Test 320/360/390/430px, 100% and reduced-width zoom proxies, plus genuine 125/150/200% zoom. Verify letter collision, RTL/LTR ordering, intrinsic width and clipping inside the *carousel item*, not merely document `scrollWidth`.
- A visual artifact may shrink as a unit for fidelity, but if that reduces crucial text below usable legibility, present a larger accessible alternative/detail view.

## v1.3 — Component QA

The `component_audit.py` tool resizes a selected card, without changing the viewport, and checks text overlaps, invisible clipping, and optional artwork scaling invariants. See [component-level-qa.md](component-level-qa.md) for marker conventions, CLI examples, confidence limitations, and acceptance criteria. This is compulsory for visually proportional artifacts inside carousels; do not assume page-level QA catches their errors.

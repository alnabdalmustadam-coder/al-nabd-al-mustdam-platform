# Accessibility constraints

- WCAG 2.2 SC 1.4.4: text should resize up to 200% without loss of content or functionality; responsive breakpoints may change font size, but must not nullify effective enlargement.
- WCAG 2.2 SC 1.4.10: reflow for a viewport 320 CSS px wide for vertically scrolling content (with narrow exceptions for 2D content like complex data). Avoid two-dimensional scrolling for ordinary content.
- Ensure keyboard access, focus visibility, readable contrast, non-color-only status indications, semantic headings and correct input labels.
- Target size: WCAG 2.2 SC 2.5.8 suggests at least 24 by 24 CSS px or adequate spacing, with exceptions; interactive QA must inspect real controls and exceptions. Larger targets are often preferable on touch devices.
- `overflow: hidden` must not hide keyboard-focused content. `text-overflow: ellipsis` may be acceptable for **non-critical** summaries if full content is accessible.
- Touch/keyboard screen reader flow and RTL/Arabic content should be manually reviewed.
- Screenshot heuristics detect some geometry bugs, **not WCAG compliance**. Avoid "accessibility certified" statements after script passes.

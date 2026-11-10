# Modular spacing and density

Suggested starting token sequence in root-relative units: 0, 0.25rem, 0.5rem, 0.75rem, 1rem, 1.5rem, 2rem, 3rem, 4rem, 5rem. It is an internal proposal informed by modular 4/8-like rhythm, not an official mandatory token table from a brand.

- Use `gap` for layout relationships, padding for a component's breathing room, and margin for exceptional separation. Prefer logical `padding-inline`, `margin-block`, `inset-inline-start` in RTL/LTR code.
- Page gutter example: `clamp(1rem, 2.2vw, 2.5rem)`; the `vw` value is acceptable for outer gutter scaling if sensible min/max bounds are preserved. For self-contained components prefer local/container sizing.
- Card padding: use `clamp(0.875rem, 2cqi, 1.5rem)` **only** when an eligible ancestor container exists; otherwise choose a static `rem` token or a container query with discrete scale changes.
- Gaps should not shrink until adjacent controls collide. Prefer wrapping/stacking; maintain rhythm and avoid excessive separate exceptions per breakpoint.
- Density decision: identify primary action, secondary text and information hierarchy. Tighten low-priority details before primary content. Do not invent a mathematically 'objective' visual-density score; human review still matters.
- Avoid removing useful spacing solely to show more content above the fold. Prioritize hierarchy, scanability and accessibility.

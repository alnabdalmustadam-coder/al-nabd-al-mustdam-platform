# Available-space analysis: measuring before changing the layout

The browser lays out **CSS pixels** in the *layout viewport* and inside actual containing blocks, not physical monitor pixels. Zoom and smaller browser windows commonly reduce usable CSS viewport width. Do not infer layout from monitor resolution, `screen.width`, or a Vercel screenshot alone.

## Diagnostic ladder
1. Read `document.documentElement.clientWidth`, the CSS layout viewport. `window.visualViewport` is useful for pinch zoom/mobile overlays, but is not an interchangeable browser zoom detector.
2. Identify the section's available inline space after max-width, sidebars, padding, scrollbar, and gaps.
3. Identify the component's containing block: its `getBoundingClientRect().width`; avoid `100vw` inside narrow parents.
4. Check `scrollWidth > clientWidth`, especially headings, CTA groups, identifiers and nested flex/grid items.
5. Examine actual line wrapping and minimum content size. A page can have no global horizontal overflow while still hiding critical text due to `overflow: hidden`.
6. Choose the smallest meaningful intervention: `min-inline-size:0`, `minmax(0,1fr)`, fluid gap, wrapping, container query, column change.
7. Re-test before/after under the SAME available space.

## Component threshold reasoning
Do not blindly select desktop layout at `lg` (1024 CSS px). Derive a candidate threshold from actual content minimums:

`required inline size ≈ minimum readable primary region + minimum usable side region + inter-column gap + page gutters`

When it does not fit, stack or let children wrap. Use a container query when an independently reusable component must adapt to its own card/sidebar width:

```css
.card-group { container-type: inline-size; }
.card-inner { display: grid; grid-template-columns: minmax(0,1fr); gap: 1rem; }
@container (min-width: 42rem) {
  .card-inner { grid-template-columns: minmax(0,1.2fr) minmax(0,.8fr); }
}
```

For intrinsically repeatable cards, use bounded `repeat(auto-fit, minmax(min(100%, var(--card-min)), 1fr))` with a justified `--card-min`. Do not use an arbitrarily large minimum that forces a single column at common desktop widths.

## Vertical room and `dvh`/`svh`
- Use `min-block-size` instead of `block-size` for heroes containing variable text/CTAs: content must be allowed to grow beyond viewport height.
- `100svh` gives a relatively stable minimum against collapsing mobile browser toolbars; `100dvh` follows dynamic viewport height but may resize while browser UI moves. Pick based on UX.
- `dvw`/`svw` do **not** automatically solve fixed parent sizing. `%`, `fr`, `rem`, logical `inline-size`, and container sizing usually produce better results.
- A background image/video can still use `object-fit:cover`, but preserve the focal point and provide a non-cropped foreground when essential.

## Report format
Identify: viewport CSS width, component available inline size, expected content minimum, chosen reflow trigger, before/after screenshot pair and whether genuine browser zoom was manually checked.

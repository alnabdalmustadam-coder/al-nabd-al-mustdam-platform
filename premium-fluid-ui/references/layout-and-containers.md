# Available-space-first layout & Structural Reflow (v1.4)

## 1. 2D Calculation model (Inline + Block)

A region's usable inline space is:
`usable_inline = container content-box width - occupied fixed sidebar/bars - gaps among siblings`.
A region's usable block space (critical on `1024×600`, `1366×768`, and mobile landscape `height <= 500px`) is:
`usable_block = window.innerHeight - sticky header height - sticky/floating bottom bar height - section vertical padding`.

Do not subtract padding twice: DOM `clientWidth` includes padding, while `getComputedStyle()` and `getBoundingClientRect()` refer to different boxes. Rely on CSS intrinsic layout over manual arithmetic for implementation.

## 2. Structural Reflow patterns (when fluid scaling alone is not enough)

### A. Responsive Header / Navbar (`< 900px`)
Never cram Logo + Navigation Links + Search + 2 CTA buttons into a `320px–390px` bar:
```css
.site-header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: clamp(0.5rem, 1.5vw, 1rem);
  min-inline-size: 0;
}
/* Secondary action buttons move into the mobile drawer below 900px */
@media (max-width: 56.25rem) {
  .site-header__desktop-actions,
  .site-header__nav-links {
    display: none;
  }
}
```

### B. Container & Grid strategy (RTL/LTR & small-screen safe)
```css
*, *::before, *::after { box-sizing: border-box; }

.page-shell {
  inline-size: min(100% - 2 * var(--page-gutter), var(--content-max));
  max-inline-size: 100%;
  margin-inline: auto;
  padding-inline: max(0px, env(safe-area-inset-left, 0px)) max(0px, env(safe-area-inset-right, 0px));
}

.content-region {
  min-inline-size: 0;
  max-inline-size: 100%;
  container: content / inline-size;
}

/* Auto-stack to 1 column when available space is below --card-min */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, var(--card-min, 17rem)), 1fr));
  gap: var(--grid-gap);
}

/* Force single column on narrow phones (< 600px) for dense Arabic cards */
@media (max-width: 37.5rem) {
  .card-grid--dense-arabic {
    grid-template-columns: minmax(0, 1fr);
  }
}
```

### C. Callout / Concierge banners (preventing RTL negative-margin & padding clipping)
Never use negative horizontal margins (`margin-inline: -2rem` or `-mx-6`) on a dark card without compensating padding and `max-inline-size: 100%`, as this pushes the container beyond the left/right edges on `360px` screens and clips the heading text:
```css
.callout-banner {
  inline-size: 100%;
  max-inline-size: 100%;
  min-inline-size: 0;
  padding-inline: clamp(1rem, 4cqi, 3rem);
  padding-block: clamp(1.25rem, 4dvh, 3rem);
  border-radius: clamp(0.75rem, 2vw, 1.5rem);
  overflow-wrap: break-word;
}
```

### D. Steppers / Process timelines (Desktop horizontal -> Mobile vertical)
Fixed-width connecting lines between steps break when screen widths change. Use flex/grid pseudo-elements on desktop and switch to a vertical timeline on `< 768px`:
```css
.stepper {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1.25rem;
}
@media (min-width: 48rem) {
  .stepper {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 1.5rem;
  }
}
```

### E. Floating Action Button (FAB) & Footer clearance
Fixed WhatsApp/chat/store icons at `bottom: 1rem` overlap footer text and copyright bars unless the footer reserves bottom safe space:
```css
.site-footer {
  padding-block-end: calc(clamp(4.5rem, 9dvh, 6rem) + env(safe-area-inset-bottom, 0px));
}
```

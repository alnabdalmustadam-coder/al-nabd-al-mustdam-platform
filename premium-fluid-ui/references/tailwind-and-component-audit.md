# Tailwind / JSX / Component-Boundary Audit (v1.4)

Tailwind's utility classes and JSX inline styles often bypass audits that scan CSS declarations alone. In Next.js, React, Vue, and Blade/HTML projects, inspect class strings and inline styles alongside CSS and design tokens.

## High-risk patterns flagged by `static_css_audit.py` (v1.4)
- **Arbitrary & standard fixed widths (`>= 260px`):** `w-[300px]`, `w-[350px]`, `w-[420px]`, `min-w-[280px]`, `basis-[360px]`, and standard Tailwind classes `w-64` (`256px`), `w-72` (`288px`), `w-80` (`320px`), `w-96` (`384px`) inside padded mobile containers (`320px–360px` screens only have `256px–312px` after outer and inner padding!).
- **Unprefixed multi-column mobile grids (`tailwind-unprefixed-multi-col-grid`):** using `grid-cols-2`, `grid-cols-3`, or `grid-cols-4` without a `grid-cols-1` mobile base (e.g. `grid-cols-2` instead of `grid-cols-1 sm:grid-cols-2`), which crushes or overflows Arabic cards on `320px–430px` phones.
- **Unconditional `absolute` positioning (`tailwind-unconditional-absolute`):** using `absolute` on cards, badges, or stepper lines without a responsive flow reset (`static lg:absolute`), causing floating cards to cover hero images/text on mobile, tablet, and `1024×600` screens.
- **Negative horizontal margins (`tailwind-negative-horizontal-margin` / `css-negative-horizontal-margin`):** `-mx-4`, `-mx-6`, `-ml-*`, `-mr-*`, `-ms-*`, `-me-*`, or `margin-inline: -...` which pull containers past the left/right viewport edges on mobile and clip internal headings in RTL.
- **Rigid viewport heights (`h-screen`, `min-h-screen` with `overflow-hidden`, `100vh`):** breaks on `1024×600`, `1366×768`, and mobile landscape (`height: 360px–500px`) where content exceeds `600px` vertically and gets clipped or collides with sticky headers/FABs.
- **Non-wrapping flex rows (`flex` without `flex-wrap` or `flex-col sm:flex-row` containing `shrink-0` / `whitespace-nowrap`):** causes header crowding and horizontal overflow on small screens.
- `w-screen`, `100vw`, `100dvw` inside padded or desktop-scrollable pages.

Use `python scripts/static_css_audit.py /path/to/repo --json` to gather review signals.

## Corrective practice
1. **Change layout structure first on small/short screens:**
   - Replace unprefixed `grid-cols-2` with `grid-cols-1 sm:grid-cols-2` (or `md:grid-cols-2` for dense Arabic cards).
   - Replace unconditional `absolute` on floating feature/preview cards with `static lg:absolute` and gate by height (`@media (min-width: 1024px) and (min-height: 680px)`).
   - Hide secondary header CTAs on mobile (`hidden md:inline-flex`) and expose them inside the mobile drawer.
   - Replace `h-screen overflow-hidden` on heroes with `min-h-[100svh] max-h-none py-8 lg:py-16`.
2. **Eliminate negative-margin container bleed:** replace `-mx-*` with `w-full max-w-full px-4 sm:px-8 box-border`.
3. **Preserve component contracts:** keep focus, links, ARIA, card state, React keys, hover behavior, RTL semantics (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`), and component APIs intact.
4. **Verify across the 2D viewport matrix:** run `responsive_audit.py` and `component_audit.py --sync-viewport` to confirm zero high findings on `320×568`, `360×640`, `740×360` (mobile landscape), `1024×600`, `768×1024`, and `1440×900`.

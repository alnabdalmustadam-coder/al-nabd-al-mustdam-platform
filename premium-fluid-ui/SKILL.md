---
name: premium-fluid-ui
description: Engineer, refactor, and audit responsive web UI using a Two-Tier Desktop-First to All-Screens architecture: (1) 2D proportional scaling on smaller PC screens (1440x900, 1366x768, 1280x720, 1024x600) to preserve the exact desktop design without collapsing columns or floating elements, and (2) automatic structural reflow on tablet and mobile portrait/landscape (320px-960px). Includes RTL/LTR full-height auditing, fluid typography, container queries, and browser visual regression. Do not override approved colors or visual direction without permission.
compatibility: Works with Google Antigravity and OpenAI Codex via Agent Skills. Optional browser audit requires Python 3.9+ and Playwright with Chromium; instructions-only mode works without them.
metadata:
  version: "1.5.0"
  category: frontend-engineering
---

# Premium Fluid UI - Engineering Skill (v1.5.0)

**Objective:** maintain the designer's approved visual identity across all screens—even when the project was built **Desktop-First** on a large monitor (`1920x1080` or `1600x900`)—by applying a **Two-Tier Responsive Architecture**:
- **Tier 1 - Smaller Computer Screens (`>= 1024px` width, including `1440x900`, `1366x768`, `1280x720`, and `1024x600`):** preserve the **exact desktop layout, column counts, header links, and floating overlay positions** by converting hardcoded desktop `px` dimensions to `rem` and applying 2D proportional scaling (`min(width-ratio, height-ratio)`).
- **Tier 2 - Tablet & Mobile Portrait/Landscape (`< 1024px` width):** restore `100%` readable root font size and apply **structural reflow** (collapsing secondary header CTAs into a mobile drawer, stacking floating overlay cards cleanly, and switching multi-column grids to 1 column on narrow phones or a compact 2-column split on mobile landscape).

## Non-negotiable rules

1. **Two-Tier Desktop-First Preservation vs. Mobile Reflow.** Distinguish between *smaller computer screens* and *handheld mobile/tablet screens*:
   - **On PC / Laptop / Compact Landscape screens (`>= 1024px` width, including `1366x768`, `1280x720`, and `1024x600`):** DO NOT collapse desktop grids into mobile columns and DO NOT drop desktop floating hero cards into stacked flow unless physically impossible. Instead, convert hardcoded `px` lengths (`width`, `min-width`, `padding`, `gap`, `inset`) into `rem` (`px / 16`) and apply the 2D proportional root scale from `assets/desktop-first-scale.css` (`clamp(60%, min(calc(0.1rem + 0.9vw), calc(0.1rem + 1.5dvh)), 100%)`) so the entire desktop design scales down harmoniously as a single unit to fit `1366x768`, `1280x720`, and `1024x600`.
   - **On Tablet Portrait & Mobile (`< 1024px` width):** a `320px-390px` phone loses 75% of desktop width, so shrinking alone would make text microscopic. Below `1024px`, reset `html { font-size: 100%; }` and apply **Structural Reflow** (Rule 4).
   - **Anti-Distortion Guards (Icons, Low-Res Text Floor, Card Alignment, Ultra-Wide, Scrollbar):**
     - Convert hardcoded `<svg width="24" height="24">` attributes to `rem`/`em` classes (`w-5 h-5` or `1.25em`) so icons shrink alongside buttons on `1024px` screens.
     - Keep a readability floor (`max(var(--pf-type-body), 12px)` for body and `11px` for micro text) on `1024x600` / `1366x768` so scaled-down Arabic text never blurs on `1dpr` monitors.
     - Enforce equal card heights in rows (`display: flex; flex-direction: column; height: 100%` with `margin-block-start: auto` on the card footer/CTA) and `font-variant-numeric: tabular-nums` on live prices/timers so dynamic content never distorts card alignment.
     - Use `scrollbar-gutter: stable` on `html` and a centered `max-inline-size` container (`<= 90rem-100rem`) so ultra-wide `2560px`/`4K` monitors never stretch layouts apart.
2. **Available 2D space first (Inline + Block).** Reason from the **actual layout viewport** (`clientWidth` and `innerHeight`), then the available content region after sidebars/headers/padding/gaps, then the component's containing block. Never use `100vw` for page/section width (causes horizontal scrollbar overflow on low-res Windows/Linux monitors with `17px` classic scrollbars).
3. **Personal Luxury typography is the preferred starting signature for design tasks.** Use the portable user-chosen scale: H1 32->42, H2 22->26, H3 18->19, paragraphs 15, metadata 12-13 (CSS-px equivalents at a 16px root), implemented using `rem` and bounded `clamp()`. Enforce the balanced Arabic weight ramp (`400-700`: H1 `700->600` on small/low-res screens, H2/H3/CTA `600`, body `400`, captions/micro `500` so `12-13px` text stays crisp on `1dpr` screens), set `-webkit-font-smoothing: antialiased` and `font-synthesis-weight: none` to prevent dark-mode halation and faux-bold distortion, and replace extreme Tailwind weights (`font-black`, `font-extrabold`, `font-light`, `font-thin`). Read [references/typography.md](references/typography.md) and `assets/luxury-fluid-typography.css`. **Do not blindly override an existing approved type system during a repair-only task.**
4. **Structural Reflow on Mobile & Tablet (`< 1024px`).** Automatically restructure Desktop-First markup for `< 1024px` screens without waiting for manual user intervention:
   - **Headers/Navbars (`< 900px`):** keep only the Logo and at most 1-2 compact icon triggers in the top bar; move secondary CTAs ("Login", "List Your Plate", language/profile links) inside the collapsible drawer/menu (`hidden lg:inline-flex`).
   - **Floating/Absolute Overlay Cards (`< 1024px`):** convert `position: absolute` hero preview cards to `position: static` or `relative` in normal document flow (`static lg:absolute`) so they stack cleanly below `< 1024px` while remaining floating on `>= 1024px` (including `1024x600` via proportional `rem` scaling).
   - **Grids (`< 640px`):** enforce single-column (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`) on small phones; never leave unprefixed `grid-cols-2` on mobile for Arabic content cards.
   - **Horizontal Steppers/Timelines (`< 768px`):** convert horizontal multi-step flows into vertical stacked timelines (`flex-col md:flex-row`), and link desktop connector lines via flex/grid percentages or `rem` instead of fixed pixel widths.
   - **Floating Action Buttons (WhatsApp/Store badges):** reserve bottom clearance on the footer/page (`padding-block-end: clamp(4.5rem, 10dvh, 6rem)`) so fixed bottom badges never cover footer text.
5. **Preserve user-approved visuals while fixing structure.** Do not recolor, rebrand, or change stylistic direction autonomously. Preserving visuals means keeping the exact desktop look on `>= 1024px` screens (scaled proportionally in `rem`) while adding responsive classes (`flex-col lg:flex-row`, `grid-cols-1 sm:grid-cols-2`, `static lg:absolute`) for `< 1024px` screens.
6. **Mobile & Tablet Landscape (`< 1024px` width with `max-height: 500px`).** On rotated phones (`667x375`, `740x360`, `844x390`):
   - Never lock containers to `height: 100vh` / `h-screen`; always use `min-block-size: 100svh` (or `auto`) with `overflow: visible`.
   - Slim down or unstick headers/toolbars when `max-height: 500px` so fixed chrome takes `< 15%` of `window.innerHeight`.
   - Use a compact 2-column horizontal split (`grid-template-columns: 1.15fr 0.85fr`) for heroes/cards and cap media height (`max-block-size: 48dvh; object-fit: contain`), and keep modals/drawers internally scrollable (`max-block-size: 85dvh; overflow-y: auto`).
7. **Zoom is intentional accessibility behavior.** Do not cancel browser zoom via `transform: scale(1 / zoom)` or disabling viewport meta tags. In Tier 1 proportional desktop scaling, always include a `rem` base term (`calc(0.35rem + ...)`) so user root-font adjustments and browser zoom still enlarge text perceptibly.
8. **RTL and localization first-class support.** Verify Arabic mixed with numbers/English, logical `inline`/`block` dimensions (`margin-inline`, `padding-inline`, `inset-inline-start`), and `dir="rtl"`. In RTL, horizontal overflow and negative-margin bleed occur to the **left (`left < 0`)** as well as the right. Never use negative horizontal margins (`-mx-*`) that push containers beyond viewport edges on mobile.
9. **Measure and verify across the full document height.** Run responsive browser audits across desktop (`1920x1080`, `1600x900`, `1440x900`), smaller PC/laptop screens (`1366x768`, `1280x720`, `1024x600`), tablet portrait/landscape, and mobile portrait/landscape. Inspect both left and right viewport edges (`rect.left < 0` and `rect.right > vw`) across all sections from header to footer.
10. **Explicit permission before starting development servers.** Reuse the project's existing, verified local development URL when available. **Never start, restart, stop, replace, or spawn another local server or background process without first explaining the command, port, purpose, and impact and obtaining the user's explicit approval.**
11. **Prove internal fluidity under real breakpoint conditions.** For nested components (carousels, auction cards, plate visualizers), run `component_audit.py` with both isolated container widths and `--sync-viewport`. Read [references/component-level-qa.md](references/component-level-qa.md).
12. **Evidence-driven acceptance.** Never claim that all screens pass without recording tested component widths, viewport widths (including `1024x600`, `1366x768`, and mobile landscape), and remaining manual tests.

## Workflow (mandatory order)

### 1. Inspect

- Identify framework, CSS strategy, typography, tokens, routing, page templates, RTL conventions, active breakpoints, and hardcoded `px` values. Inspect Tailwind classes (`w-[...px]`, `w-72`/`w-80`/`w-96`, unprefixed `grid-cols-2`, `h-screen`, `absolute`, `-mx-*`) and JSX inline sizing.
- Capture a **baseline** across large desktop (`1600x900`), smaller PC screens (`1366x768`, `1024x600`), tablet (`768x1024`), mobile portrait (`360x640`, `390x844`), and mobile landscape (`740x360`) where browser access allows.
- Load [references/decision-engine.md](references/decision-engine.md) and relevant topic references below **only when needed**.

### 2. Design the Two-Tier 2D layout contract

- **Tier 1 Contract (Desktop Preservation on `>= 1024px`, including `1366x768`, `1280x720`, `1024x600`):** identify all fixed `px` widths, heights, paddings, gaps, and absolute offsets in the Desktop-First code that prevent the layout from scaling down smoothly when `1rem` scales between `12.5px` and `16px`.
- **Tier 2 Contract (Mobile & Tablet Reflow on `< 1024px`):** define how each complex desktop section reflows below `1024px` (header drawer threshold, floating cards -> `static lg:absolute`, grids -> `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`, steppers -> `flex-col md:flex-row`, mobile landscape 2-column split).
- See [references/available-space-analysis.md](references/available-space-analysis.md) and [references/responsive-and-zoom.md](references/responsive-and-zoom.md).

### 3. Implement

- **Convert Desktop-First `px` to `rem` / Fluid Tokens:** replace fixed pixel dimensions on cards, containers, gaps, and offsets with `rem` equivalents (`px / 16`) or `%`/`fr` so the layout responds to root scaling.
- **Apply Tier 1 Proportional Desktop Scaling (`>= 1024px`):** import or merge the 2D root scaling media query from `assets/desktop-first-scale.css` so smaller PC screens (`1440x900`, `1366x768`, `1280x720`, `1024x600`) display the exact desktop composition scaled proportionally in both width and height.
- **Apply Tier 2 Structural Reflow (`< 1024px`):**
  - Collapse secondary header buttons into the mobile drawer below `900px`.
  - Stack multi-column grids to `1fr` below `640px` when cards hold Arabic titles/badges.
  - Set floating desktop hero cards to `static lg:absolute` so they stay floating on all PC screens (`>= 1024px`, including `1024x600`) and stack cleanly on tablets/phones (`< 1024px`).
  - Add mobile landscape (`(orientation: landscape) and (max-width: 959px) and (max-height: 500px)`) compact rules and footer FAB bottom clearance.
- Establish or preserve **Personal Luxury typography** (`assets/luxury-fluid-typography.css`). See [references/typography.md](references/typography.md), [references/components-and-media.md](references/components-and-media.md), and [references/spacing.md](references/spacing.md).
- **Component-inner fluidity:** use declared size-query containers (`container-type: inline-size`), `aspect-ratio`, and `cqi` or SVG `viewBox` for visual artifacts (such as license plates). See [references/component-level-qa.md](references/component-level-qa.md) and `assets/proportional-art-pattern.css`.

### 4. Test and repair

- Run `python scripts/responsive_audit.py --url <actual-project-local-URL> --out ./ui-audit` (or `--preset full`). Verifies desktop (`1920x1080`, `1600x900`, `1440x900`), smaller PC screens (`1366x768`, `1280x720`, `1024x600`), tablet (`768x1024`, `1024x768`), mobile portrait (`390x844`, `360x640`, `320x568`), and mobile landscape (`740x360`, `667x375`, `844x390`).
- Run `python scripts/component_audit.py --url <already-running-URL> --selector '<unique-card-selector>' --widths 240,280,320,390,480,600 --sync-viewport --out ./component-audit`.
- Run `python scripts/static_css_audit.py /path/to/project` to verify no remaining rigid `px` widths, unprefixed `grid-cols-2`, negative horizontal margins (`-mx-*`), or unconditional `absolute` classes remain.
- **Repair -> rerun -> verify** until zero high findings remain across all viewports.

### 5. Deliver evidence

Report: changed files, Desktop-First `px -> rem` conversions, Tier 1 (`>= 1024px` proportional scaling) and Tier 2 (`< 1024px` structural reflow) rules applied, viewports tested, and remaining manual zoom checks.

## Topic router (load on demand)

- Architecture and 2D thresholds: [references/decision-engine.md](references/decision-engine.md), [references/layout-and-containers.md](references/layout-and-containers.md), [references/available-space-analysis.md](references/available-space-analysis.md)
- Fonts: [references/typography.md](references/typography.md)
- Spacing: [references/spacing.md](references/spacing.md)
- Relative/viewport units: [references/intelligent-units.md](references/intelligent-units.md)
- Two-Tier Desktop-First scaling, `1024x600`, low-res & landscape: [references/responsive-and-zoom.md](references/responsive-and-zoom.md)
- Cards, grids, imagery & interaction: [references/components-and-media.md](references/components-and-media.md)
- Tailwind / JSX diagnostics: [references/tailwind-and-component-audit.md](references/tailwind-and-component-audit.md)
- Component-level QA: [references/component-level-qa.md](references/component-level-qa.md)
- Accessibility: [references/accessibility.md](references/accessibility.md)
- Visual audit/exit criteria: [references/visual-qa.md](references/visual-qa.md)
- Official source links: [references/sources.md](references/sources.md)

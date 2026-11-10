# Release history

## 1.4.0 — 2D Space Budget, Structural Reflow, RTL Full-Height Audit, Landscape, Low-Res & 1024x600 Support

- Upgraded `scripts/responsive_audit.py` to check **both left (`rect.left < -3`, critical for RTL) and right (`rect.right > vw + 3`) viewport edges across the full document height** (removing the `r.top < vh` first-fold limitation).
- Added full-page text-node Range clipping (`clipped-text-content`) and text-outside-viewport (`text-outside-viewport`) checks to `responsive_audit.py`, upgrading real text clipping from `review` to `high`.
- Added floating/absolute overlay collision detection (`floating-or-absolute-overlap`), mobile header crowding checks (`header-crowding-overflow`, `header-excessive-height`), and short-viewport vertical crush detection (`short-viewport-vertical-crush`, `vertical-overflow-clipped-short-viewport`).
- Expanded `QUICK` and `FULL` test matrices to include **`1024x600` (WSVGA / compact landscape)**, **low-resolution displays** (`1366x768`, `1280x720`, `800x480`, `360x640`, `320x568`), **mobile landscape** (`667x375`, `740x360`, `844x390`), and **tablet portrait/landscape** (`768x1024`, `1024x768`, `820x1180`, `1180x820`, `960x600`, `600x960`).
- Upgraded `scripts/static_css_audit.py` to flag fixed widths `>= 260px`, standard Tailwind fixed widths (`w-64`, `w-72`, `w-80`, `w-96`), unprefixed multi-column grids (`grid-cols-2` without `grid-cols-1` mobile base), negative horizontal margins (`-mx-*`), unconditional `absolute` classes without responsive `static` reset, and rigid `100vh`/`h-screen` heights.
- Added `--sync-viewport` option to `scripts/component_audit.py` so component sweeps can trigger `@media` queries and Tailwind breakpoints (`sm:`, `md:`, `lg:`) alongside short landscape heights.
- Updated `SKILL.md` and `references/` with explicit **Structural Reflow Rules** (collapsing secondary header CTAs into mobile drawers, stacking `position: absolute` hero cards below `1024px` or `680px` height, reserving footer FAB clearance, and gating desktop vertical layouts by both width and height).

## 1.3.0 — Component-aware geometry and evidence

- Added a stand-alone browser component-width sweep (`scripts/component_audit.py`) that holds the viewport fixed, changes card width, and generates PNG screenshots, HTML gallery and JSON diagnostics. No server launch or code mutation.
- Added text-node Range rectangle collision detection, clipped text within internal overflow boundaries, and text outside a component.
- Added optional proportional artwork markers (`data-pf-proportional`, `data-pf-part`) to detect fixed graphics, aspect drift and internal part position/size drift.
- Added four component fixtures (healthy, fixed+colliding, clipped, aspect drift) and executable Chromium regression (`scripts/test_component_browser.py`).
- Added optional permission-gated `interaction_smoke.py` for non-destructive menu click/Escape behavior, paired healthy/broken fixtures and browser regression tests.
- Added on-demand technical reference and proportional-art CSS pattern; mandatory component-level QA gate for nested cards/carousels.
- Preserved v1.2 Personal Luxury type tokens, original CSS/JSX audit and before/after workflow. No FBS repo change.

## 1.2.0 — Personal Luxury typography system

- Adopted the experimentally chosen portable signature: H1 ~32–42, H2 ~22–26, H3 ~18–19, body 15, secondary 12–13 (CSS pixel equivalents only).
- Implemented a reusable `rem` / `clamp()` CSS token and opt-in class file in `assets/luxury-fluid-typography.css`.
- Aligned the older example tokens with this single source of truth; removed conflicting large-font recommendations from typography reference.
- Documented when to apply globally, map existing Tailwind tokens, or preserve an approved site during repair-only tasks.
- Added container-aware proportional artifact guidance, Arabic type readability, and manual genuine browser zoom checks.
- Added browser computed-style regression for the typography token fixture.
- FBS repository and all third-party projects remain unchanged by this archive update.

## 1.1.0 — Evidence-first QA update

- Added a dedicated `visual_compare.py` for matched before/after screenshot matrices, HTML side-by-side gallery and machine-readable findings.
- Replaced arbitrary 175ms screenshot delay with 1500ms default stabilization plus optional `--settle-ms`, `--wait-for`, `--prime-scroll` and font/visible-image readiness checks.
- Added Tailwind arbitrary sizing / responsive columns / JSX inline sizing review to static audit.
- Added measured region snapshots (available inline size, padding, grid columns) in browser audit output.
- Added on-demand design references for available-space budgets and Tailwind component reviews; retained progressive disclosure.
- Added stronger evidence gate: browser zoom proxy is not actual zoom, and a screenshot diff or deployment success is not a design pass.
- Added robust regression tests and updated Arabic/English setup instructions; updated cross-industry primary design references (Apple, Material, Fluent, W3C).
- No code changes to third-party projects; this release is a reusable skill archive only.

## 1.0.0

- Initial modular fluid responsive design skill, CSS/browser heuristics and example fixtures.

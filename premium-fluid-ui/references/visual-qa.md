# Visual QA: evidence and completion gate

## Two separate duties
- **Detect technical failures:** accidental page overflow, label clipping, overlaps, inaccessible focus, broken images, jumpy mobile height, poor reflow.
- **Review visual quality:** hierarchy, line lengths, density, whitespace rhythm, cropping, alignment, localization, and state coherence. Do not claim automatic visual-quality approval from heuristic counts or pixel-change percentages.

## Controlled before/after
1. Capture BEFORE on a running site, the supplied baseline URL, or a reproducible fixture. Do not run a dev server without explicit permission.
2. Keep the same content, logged-in state, timezone, fonts, seed/data, scroll position, viewport CSS size and device/browser configuration across both captures. Mask volatile prices, clocks and rotating items with `--mask-selector`, or explain that visual differences may reflect content drift.
3. Allow fonts and images to settle. Staged reveal (e.g. 2.95 seconds) requires `--settle-ms 3200` or an explicit visible selector. Avoid `networkidle` for live apps that legitimately poll forever. Use `--prime-scroll` when appropriate for lazy content.
4. Run `python scripts/visual_compare.py --before-url http://localhost:3000 --after-url http://localhost:3001 --preset quick --settle-ms 3200 --out ./ui-before-after` **only on already running, approved endpoints**. The script does not start servers. `--selector 'main section:first-of-type'` can scope captures to the hero. Open the produced `index.html`.
5. Automated matrix uses reduced CSS viewports as **zoom reflow proxies**, never genuine desktop browser zoom. Manually test browser zoom 100/125/150/200% and text scaling, preferably on Chromium plus another engine.
6. Compare each screenshot pair by asking: Did crowding disappear without over-shrinking text? Did side content reflow? Were empty gaps reduced reasonably? Does the design still feel like the approved site?
7. Run build/lint/typecheck and relevant interaction checks. Capture AFTER again following repairs.

## Component-level acceptance (v1.3)
For cards and visual artifacts, run `scripts/component_audit.py` at varied component widths; inspect screenshot evidence. No unreviewed high findings inside the card. Internal text overlap or fixed artwork is a failure even when the page itself has no horizontal overflow. `data-pf-proportional` / `data-pf-part` marks proportion-check candidates; absent markers mean proportional checks were **not** run, not that they passed. Manual carousel interaction and genuine browser zoom remain distinct gates. See [component-level-qa.md](component-level-qa.md).

## Acceptance criteria
**Hard / cannot claim done:** newly introduced high-severity errors, important clipped text, accidental global horizontal page overflow, broken controls, incorrect live links, unreadable RTL/number pairings, browser crashes or missing after screenshot.

**Review:** excessive whitespace/visual density, text sizes/line breaks, background focal position, responsive image crop, untested dropdown/modals/form flows, reduced motion, and real browser zoom.

**Honest handoff:** list files changed, affected sections, viewport/zoom matrix tested, screenshot evidence paths, high/review findings before/after, known false positives, remaining manual checks, and what wasn't run. High-finding count reduction is not equivalent to aesthetic improvement. Do not promise outcomes based on source-only inspection.

## Interaction smoke checks (v1.3)

Use `scripts/interaction_smoke.py` for user-authorized **non-destructive** menu/popover tests on preview/staging: click trigger and check visible panel, optional Escape dismissal. Stable selectors are required. No production bids/purchases/submits. Test real touch, keyboard traversal, focus management, and edge anchoring separately.

# Decision engine: select the reference frame, then the CSS mechanism

1. **Determine the problem:** viewport composition? nested component? natural text size? fixed-height overlay? image crop? horizontal reflow? layout state?
2. **Measure the relevant available space:** `document.documentElement.clientWidth` for CSS viewport; layout container `clientWidth` minus padding for a component; account for sidebar, sticky/fixed UI and scrollbars. Use `ResizeObserver` only if JavaScript measurements are truly necessary; prefer CSS.
3. **Select intrinsic behavior first:** `max-inline-size`, `min-inline-size: 0`, `flex-wrap`, `grid-template-columns`, `auto-fit`, `minmax`, natural flow, proper `gap`, logical margins/paddings.
4. **Select a dimension source:** `%` for containing block, `fr` for grid track free space, `rem` for type/consistent spatial tokens, `em` for self-scaled component sizing, `cqi` for container-sensitive scaling **when an eligible ancestor query container exists**. Dynamic viewport height units only for viewport-height tasks.
5. **Add boundaries:** `clamp()` / `min()` / `max()` to avoid microscopic or giant sizes. Do not make base body text shrink to fit narrow devices; preserve reasonable reading size.
6. **Reflow before compressing:** fewer columns, stack text/button groups, collapse only secondary chrome, switch to an accessible alternate representation for data tables.
7. **Test content edge cases:** Arabic diacritics, mixed Arabic-English numerals, long auction plate IDs, localization, user-entered text, enlarged system fonts, empty states.
8. **Explain exceptions:** small non-fluid `px` values may be correct; only flag fixed `width`/`height` when evidence shows breakage.

## Priorities
P0: lost access to action/content, blocked scrolling, overlapping controls, unreadable text, keyboard trap.
P1: accidental page overflow, clipped meaningful images/labels, unstable reflow at common zoom/widths.
P2: uneven visual rhythm, excessive whitespace, edge-case text wrapping.

Never solve P1 by adding `overflow-x: hidden` to the whole page: this may conceal the underlying defect. Fix the overflowing component. Likewise don't use browser-zoom detection scripts to undo enlargement.

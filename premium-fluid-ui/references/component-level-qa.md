# Component-Level Visual QA — mandatory for visual artifacts and carousels

## Why
A healthy page `scrollWidth` and a responsive grid do **not** prove that letters inside a plate/card are separated correctly. Test component geometry at multiple *container widths* independently of the viewport. Typical failures: overlapping text nodes, clipped Arabic numbers, fixed artwork inside an expanding carousel slide, changed aspect ratios and internal part drift.

## Component contract
1. Identify the **actual containing slot**, including its padding, borders and carousel track constraints. A component's available inline size is not the browser width.
2. For ordinary headings, descriptions, prices and labels, honor personal typography tokens and accessibility. Reflow/rearrange if necessary rather than making essential text unreadably small.
3. For fixed-composition **visual artifacts**, keep a common coordinate system (prefer SVG `viewBox` for exact proportionality; CSS `aspect-ratio` + named query container + `cqi` is another option). Scale all artistic parts together. Keep artifact illustrations separate from screen-reader text labels.
4. A carousel card itself should not be accidentally pinned to `width:420px` when its slot is 320px; inspect `flex-basis`, `min-inline-size`, `max-inline-size`, track/gap, and scroll-snap decisions. A deliberate fixed-width carousel preview is acceptable *when explicitly intended*.
5. If essential art details become too small, provide an accessible enlarged/detail alternative and meaningful text. Never fake browser zoom by inverse transformations.

## Instrument and test

Prefer a stable, unique component selector. For deeper ratio checks, mark the *illustration only*:

```html
<article data-pf-audit="auction-card">
  <div data-pf-proportional="plate">
    <span data-pf-part="arabic-numbers">١٢٣</span>
    <span data-pf-part="letters">أ ب ج</span>
  </div>
</article>
```

Markers are optional and have no styling effects. If you do not add proportional markers, **the audit cannot certify aspect or internal shape invariants**. You may instead select an existing component; text collision/clipping heuristics will still run. Avoid adding markers to live user content when read-only mode is requested; use staging only.

```bash
# Bundled, no server needed; healthy should exit 0, broken/clipped/drift 2
python scripts/component_audit.py --fixture healthy --out /tmp/pf-healthy
python scripts/component_audit.py --fixture broken --out /tmp/pf-broken
python scripts/component_audit.py --fixture clipped --out /tmp/pf-clipped
python scripts/component_audit.py --fixture drift --out /tmp/pf-drift

# Already-running site only; no server is started, updated or restarted.
python scripts/component_audit.py --url http://localhost:3000 --selector '[data-pf-audit="auction-card"]' \
  --widths 240,280,320,390,480,600 --out ./component-audit
```

This tool changes `inline-size` of the chosen component *in temporary browser pages only* and captures screenshots and JSON. It does **not** change repository files or deploy. The page viewport is deliberately held constant; these tests are **container width tests**, not actual browser zoom or viewport reflow. It may be insufficient for components requiring parent size queries or a live carousel to update its track; inspect both a true carousel state and the isolated width sweep.

## What gets measured
- `text-text-overlap`: Range rectangles of separate text nodes intersect (heuristic; intentional overlays can exist).
- `clipped-text-inside-component`: text extends beyond an ancestor with clipping overflow.
- `text-outside-component`: text extends outside the selected component, even with `overflow:visible`.
- `fixed-art-inside-fluid-component`: opted-in visual art stays nearly fixed while the card width grows more than 25%.
- `proportional-aspect-drift`: visual aspect ratio changes with card width.
- `proportional-part-drift`: marked internal shapes/positions stop scaling together.

**Caveats:** Text Range boxes are not perfect glyph outlines, some intentional label overlays / animations create false positives. The tool does not detect all SVG/canvas collisions automatically, cannot prove aesthetics or regulatory accuracy of an illustrated license plate, and does not test click/keyboard interactions. Review screenshots for each high finding and run the existing viewport/zoom-proxy audit and human *genuine* browser zoom separately. Do not mark a bug "fixed" based only on a lower warning count.

## Acceptance / evidence gate
- Before/after screenshots with same content, stable carousel item and state.
- At least 3 component widths, including the minimum intended slot width; preferably 240/280/320/390/480/600 CSS px.
- No unreviewed `high` findings; no essential text clipping/collision, even if overall page scrollWidth is zero.
- Deliberate proportional graphics should maintain aspect and marked part geometry within tolerances, with annotations rather than undocumented assumptions.
- Verify card within the live carousel separately, keyboard/mouse/touch activation, Arabic mixed with Latin/numerals and real zoom 100/125/150/200%.

# Personal Luxury Type Signature (approved design preference, v1.2)

This skill carries the user's **portable default type personality**: refined, visually restrained, supportive of image-led websites. These are *user-chosen defaults informed by FBS mobile previews*, not Apple's / Google's official type specs and not a finding of WCAG compliance. **Single source:** [`../assets/luxury-fluid-typography.css`](../assets/luxury-fluid-typography.css). In existing projects, map the tokens into existing Tailwind/theme variables instead of introducing parallel conflicting rules.

| Semantic role | Mobile preference | Desktop preference | CSS token |
| --- | --- | --- | --- |
| H1 / major title | ~32 CSS px = `2rem` | ~42 = `2.625rem` | `--pf-type-h1` |
| H2 / section title | ~22 = `1.375rem` | ~26 = `1.625rem` | `--pf-type-h2` |
| H3 / card heading | ~18 = `1.125rem` | ~19 = `1.1875rem` | `--pf-type-h3` |
| Paragraph / long body | ~15 = `0.9375rem` | ~15 = `0.9375rem` | `--pf-type-body` |
| Secondary metadata | 12–13 = `0.75–0.8125rem` | 12–13 | `--pf-type-micro`, `--pf-type-caption` |

Those CSS pixel equivalents assume an unmodified 16px root **only for explanation**. Do not pin `html {font-size:16px}` or use `px` to implement the type scale. **`rem`** honors root font preference. **`clamp(rem, calc(rem + vw), rem)`** adds restrained viewport-relative interpolation to headings without unbounded `vw` typography. On mobile, `clamp` approaches the minimum; on roomy desktop it approaches the maximum. These are *bounds*, not exact values at every width or zoom. Paragraphs intentionally use a stable `rem`, not `vw`.

## Mandatory agent decisions

1. **If tasked with creating/refining the user's visual style:** use the Personal Luxury scale by default, unless project constraints or a user-approved different type direction supersede it. Inspect current tokens/classes first and map to *one source of truth*. Do not emit global, high-specificity `h1,h2,h3,p` overrides as a shortcut: they may break admin pages, buttons, price cards and third-party widgets. Apply role-based classes/components in scope.
2. **If tasked with purely functional/responsive repairs on an already-approved design:** preserve the established typography and report a potential mismatch instead of applying the user's profile blindly. Ask about a meaningful tradeoff if needed.
3. Differentiate typography roles from semantic tags. A hero display, navigation badge, price, timer, plate illustration, CTA, form label or rich text heading has different space and readability constraints. Use explicit opt-in roles, never globally shrink important actionable text, and do not shrink controls merely to match a number.
4. Use unitless line heights, check Arabic diacritics, dots, letter shaping, mixed Arabic + Latin baseline and RTL wrapping. Start body at ~1.75 line-height for the chosen Arabic font, then tune after a visual pass. H1 1.22, H2 1.3, H3 1.4 are starting ratios.
5. **`cqi` applies selectively to component-internal *decorative artwork*** only in a declared `container-type: inline-size` parent. It is not a license to reduce prose, button labels or crucial status text toward illegibility. For a complex visual artifact (e.g., car plate) preserve aspect-ratio and synchronize the illustration's border, typography, padding and gaps relative to the artwork container; check numeric/Arabic characters do not collide or clip. See [components-and-media.md](components-and-media.md).
6. Do not override browser zoom, add `maximum-scale=1`, or counteract scaling with `transform:scale(...)` inversely. At extreme widths, reflow surrounding content and retain visible readable text even if not all items fit in the first screen.
7. Validate both real mobile/desktop viewport screenshots and genuine 125/150/200% browser zoom manually. Automated viewport narrowing is only a **reflow proxy**. Confirm text remains usable/readable, especially 15px Arabic body and 12px metadata. If a size fails legibility, accessibility or content-fit, explain and locally adapt it, preserving the intended luxury hierarchy.

## Minimal usage in a real project

```css
/* Import in the site's main entry, once, only when applying this personal type system */
@import url('./luxury-fluid-typography.css');
/* Or copy/map the six variables into existing Tailwind CSS design tokens. */
```

```jsx
<h1 className="pf-type-h1">عنوان مميز</h1>
<h2 className="pf-type-h2">قسم المزادات</h2>
<h3 className="pf-type-h3">مزاد مباشر</h3>
<p className="pf-type-body">وصف قصير للمحتوى العربي.</p>
```

The examples are illustrative; do not break framework CSS import order, and do not import the file from a path where it does not exist. Use stable existing token names or copy into the project after inspection.


## Adaptive Font-Weight Engineering (v1.5)

Arabic script has connected baselines, dots, and compact internal counters (`ص، ط، ع، ف، ق، م، هـ`). Improper font weights distort Arabic UI across screens in four ways:
1. **Heavy weights (`800 ExtraBold` / `900 Black`) on small or scaled-down screens (`320px–430px` and `1024×600` / `1366×768`):** internal letter counters close up and dots merge into a blurry blob, while increasing word width by 10–15% and causing premature wrapping.
2. **Light weights (`100–300 Light`) or `400 Regular` on tiny text (`11px–13px`) on low-res (`1dpr`) monitors:** thin Arabic strokes break apart under subpixel rendering.
3. **Dark-background halation (white/gold text on dark navy/black surfaces):** light-on-dark text optically blooms and appears ~100 weight heavier unless `-webkit-font-smoothing: antialiased` is set and weights are kept in the `400–700` range.
4. **Synthetic Faux-Bold (`font-synthesis`):** requesting a weight not loaded in `@font-face` causes the browser to double pixels horizontally, breaking Arabic cursive connections (`لـا`, `مـحـ`). Always set `font-synthesis-weight: none;` and use only loaded weights (`400, 500, 600, 700`).

### Recommended Weight Ramp (`assets/luxury-fluid-typography.css`)
| Role | Large High-DPI Desktop | Small Screen / `1024×600` / `1dpr` Low-Res | Token |
| --- | --- | --- | --- |
| H1 / Hero title | `700` (Bold) | `600` (SemiBold) | `--pf-weight-h1` |
| H2 / Section title | `600` (SemiBold) | `600` (SemiBold) | `--pf-weight-h2` |
| H3 / Card title | `600` (SemiBold) | `600` (SemiBold) | `--pf-weight-h3` |
| Body paragraph (`15px`) | `400` (Regular) | `400` (Regular, floor `12px`) | `--pf-weight-body` |
| Captions, badges & micro (`12–13px`) | `500` (Medium) | `500` (Medium, floor `11px`) | `--pf-weight-caption`, `--pf-weight-micro` |
| Buttons / CTAs | `600` (SemiBold) | `600` (SemiBold) | `--pf-weight-cta` |
| Prices / Plate numbers | `700` (Bold + `tabular-nums`) | `700` (Bold + `tabular-nums`) | `--pf-weight-numeric` |

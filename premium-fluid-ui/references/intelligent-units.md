# Intelligent sizing — unit selection

| Unit / feature | Correct reference | Prefer for | Watch out |
| --- | --- | --- | --- |
| `auto` / intrinsic | content/layout algorithm | natural dimensions | might need `min-inline-size:0` |
| `%` | relevant containing block | widths/internal sizing | % block heights need definite ancestors |
| `fr` | grid leftover free space | flexible columns | min content can overflow without minmax(0,1fr) |
| `rem` | root computed font size | type and global spatial tokens | avoid overriding user text scaling |
| `em` | element/parent-dependent text size | component scale | can compound in nesting |
| `cqi` / `cqw` | nearest eligible query container inline size / width | component-sensitive styling | declare container ancestor; fallback to `sv*` without one |
| `dvh` | dynamic viewport height | truly full-screen mobile experiences | mobile browser chrome can change height during scroll |
| `svh` | smallest viewport height | stable mobile minimum visible region | may leave unused space after chrome hides |
| `lvh` | largest viewport height | deliberate full expanded viewport | may be clipped with browser controls visible |
| `dvw` | dynamic viewport width | viewport-relative decorations when actually needed | not inherently better than `%`; `100vw` style scrollbar overflow risks |
| `clamp()` | bounded calculation | responsive type/gutters/spacing | preferred value must scale from correct reference |
| `px` | CSS pixel | precision cases, borders, measured breakpoints | large hard-coded widths/heights become brittle |

Important: `dvh`/`dvw` are **not** replacements for `%` or container units. Most web pages do not need `dvw` for their content widths. Prefer logical `inline-size` / `block-size` over physical width/height for internationalized layouts. Standard media queries still apply when actual **viewport** composition needs a change.

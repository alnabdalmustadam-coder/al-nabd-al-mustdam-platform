# Project profiles (defaults, not rigid design systems)

Use the smallest relevant existing system from the app. Do not overwrite approved brand tokens.

- **Marketplace/auction/catalog:** item-grid density, thumbnail readability, filters wrapping, bid actions, status badges, RTL IDs and long numbers, responsive sticky bid panel. Prefer cards reflowing before micro text shrinks.
- **Education/dashboard:** course cards, sidebar behavior, student metrics, timetable views, forms/modals; avoid tall hero taking entire mobile fold. Course imagery should respect focal subject or show full art when essential.
- **Admin/data-heavy dashboard:** information hierarchy, compact but readable type, responsive sidebar, tables, filters, charts. Allow contained table scrolling only when meaning requires it.
- **Marketing/landing:** editorial type scale, intentional whitespace, constrained line lengths, flexible hero, responsive media composition.

In all profiles, define minimum comfortable component inline-size by real content. Avoid templated fixed breakpoints or hardcoded counts. User approves artistic appearance; skill proposes technically justified dimensions.

## User's portable typographic signature

For new visual design or an explicit restyle, prefer the **Personal Luxury** scale in [typography.md](typography.md): low-noise H1 32→42, H2 22→26, H3 18→19, paragraph 15, metadata 12–13 (illustrative CSS-pixel equivalents at default root); tokens are in `assets/luxury-fluid-typography.css` and use `rem` / `clamp()` rather than hardcoded pixel sizes. This is the user's global *starting profile*, not an excuse to rebrand approved sites or replace accessible component sizing.

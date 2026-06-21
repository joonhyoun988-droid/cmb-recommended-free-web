# CMB Design Tokens

Route: `WORLD_CLASS_DESIGN_STARTING_POINT_PARITY_V8_03`
Status: active project contract

These tokens are the project source for visual decisions. CSS may implement them, but redesign work should not invent new colors, shadows, spacing, or radius values without updating this file.

## Color

| Token | Value | Use |
|---|---|---|
| `ink` | `#101613` | highest contrast text and dark chrome |
| `paper` | `#f4f1ea` | page background |
| `surface` | `#fffdf8` | default panel and form background |
| `surface-raised` | `#ffffff` | elevated panels/cards |
| `surface-tint` | `#eef7f2` | positive operational tint |
| `line` | `#d8d2c4` | normal borders |
| `line-strong` | `#b7ad9d` | emphasized borders |
| `text` | `#15211d` | body text |
| `muted` | `#68746e` | secondary text |
| `brand` | `#0c7a62` | primary actions and active states |
| `brand-strong` | `#075c4b` | primary hover |
| `brand-deep` | `#10231d` | sidebar/header dark surface |
| `amber` | `#bf7a16` | warning, waiting, manual attention |
| `blue` | `#2d5db3` | information and reference accents |
| `red` | `#bf3f39` | destructive/error |

## Shape And Depth

| Token | Value | Use |
|---|---:|---|
| `radius` | `8px` | controls, panels, cards |
| `shadow` | `0 18px 42px rgba(35, 29, 20, 0.12)` | primary elevated region |
| `shadow-soft` | `0 8px 22px rgba(35, 29, 20, 0.08)` | repeated panels/cards |

## Typography

| Role | Size | Weight | Note |
|---|---:|---:|---|
| Hero title | `44px` desktop / `30px` mobile | `950` | only for the command header |
| Section title | `24px` | `900` | main workflow sections |
| Panel title | `18px` | `900` | compact surfaces |
| Body | browser/system default | normal to `850` | operational text |
| Numeric | tabular nums | `900` where important | inventory and KPI values |

## Interaction

- Focus ring: blue translucent outline with 2px offset.
- Disabled/loading: reduced opacity, no shadow, not-allowed cursor.
- Loading: spinner appended to command button.
- Invalid input: red border and red halo.
- Motion: reduced-motion media query must neutralize animations.

## Change Rule

If a redesign needs a new visual value, add it here first, then implement it in CSS. Do not add one-off colors or spacing values just to make one panel look different.

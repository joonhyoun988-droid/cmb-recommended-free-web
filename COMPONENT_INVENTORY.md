# CMB Component Inventory

Route: `WORLD_CLASS_DESIGN_STARTING_POINT_PARITY_V8_03`
Status: active project contract

## Components

| Component | States Required | Current Evidence | Next Upgrade |
|---|---|---|---|
| Sidebar navigation | default, active, hover, focus, mobile hidden | `styles.css`, `index.html` | add keyboard skip/landmark audit |
| Operator box | logged out, logged in, muted/logout hidden mobile | `operator-box` styles | connect to real auth state when app backend is chosen |
| Command header | normal, mobile, long text wrap | `topbar`, `command-panel` | add compact variant for small tablets |
| Button | default, hover, focus, active, disabled, loading | `.primary-btn`, `.secondary-btn`, `.ghost-btn`, `.is-loading` | add success and destructive variants |
| Text input/search | default, focus, invalid | `input`, `aria-invalid` styles | add inline error text pattern |
| Select | default, focus, invalid | `select`, `aria-invalid` styles | add dependent filter disabled state |
| KPI card | normal, numeric, mobile two/one column | `status-strip` | add trend/up/down state only if real metric exists |
| Inventory table | hover, wrapping, numeric alignment, badge state | `table`, `.badge` | add sticky header and empty state |
| Mobile count card | default, edited, queued, error, success | `.count-item`, `.count-actions` | add explicit queued/error classes in JS |
| Queue item | pending, sent, failed | `.queue-item` | add retry affordance |
| Warehouse map | normal, density fill | `.warehouse-map` | add selected zone state |
| Dialog/login | modal, backdrop, action row | `.login-dialog` | add error and lockout state |
| Toast | hidden, visible | `.toast`, `.is-visible` | add error/success variants |

## State Matrix Rule

No component is complete unless its relevant states are named. For CMB, field safety matters more than decoration, so loading/error/queued/success states outrank new visual flourish.

## Next Lowest Lanes

- Browser QA harness: needs reproducible click/type/screenshot report.
- Screenshot regression: needs current desktop/mobile screenshots and pixel-diff threshold.
- Mobile count card: needs JS state classes for queued/error/success, not only CSS-ready styling.

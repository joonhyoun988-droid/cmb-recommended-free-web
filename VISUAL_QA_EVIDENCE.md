# CMB Visual QA Evidence

Date: 2026-06-21
Artifact: `CMB_RECOMMENDED_FREE_WEB`
Route: `PROJECT_EVIDENCE_QA_MATRIX_V7_97`

## Screenshot Evidence

| Viewport | Baseline | Current | Status |
|---|---|---|---|
| Desktop | `preview_before_desktop.png` | `preview_desktop.png` | pass |
| Mobile | `preview_before_mobile.png` | `preview_mobile.png` | pass |

## Browser QA Lanes

| Lane | State | Proof | Next action |
|---|---|---|---|
| Static load | pass | local HTML loads with CSS and app script | keep |
| JS syntax | pass | `node --check app.js` | rerun after script changes |
| Desktop screenshot | pass | `preview_desktop.png` generated through local server + Playwright |
| Mobile screenshot | pass | `preview_mobile.png` generated through local server + Playwright |
| Interaction state | partial | CSS covers focus/disabled/loading/invalid; command click-path proof is still light |
| Visual regression diff | partial | before/current files exist | add pixel-diff threshold |
| Accessibility quick check | pass | `ACCESSIBILITY_QA_REPORT.md` covers static baseline |

## Current Delta

- CSS moved the prototype toward an operational command surface.
- Mobile CSS gets stronger field-input priority and safer one-column fallback.
- Current desktop/mobile screenshots were regenerated from `http://127.0.0.1:8767/index.html`.
- Focus, loading, disabled, invalid, reduced-motion states were added.
- Numeric inventory cells now align for faster scanning.

## Residual Gap

The QA loop now has local browser screenshot evidence and a repeatable QA script. The next upgrade should add pixel-diff thresholds and deeper click-path assertions.

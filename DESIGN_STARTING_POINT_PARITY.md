# CMB Design Starting Point Parity

Route: `WORLD_CLASS_DESIGN_STARTING_POINT_PARITY_V8_03`
Preview: `http://127.0.0.1:8767/index.html`
Status: `starting_floor_pass_local_static`

| Lane | Status | Evidence | Next action |
|---|---|---|---|
| Token system | PASS | `DESIGN_TOKENS.md`, CSS variables | keep token file updated before CSS changes |
| Component inventory | PASS | `COMPONENT_INVENTORY.md` | add JS-driven queued/error/success classes |
| Reference corpus | PASS | `DESIGN_REFERENCE_AUTOCOLLECT.md` | promote reusable references to vault |
| Browser QA harness | PASS | `run_cmb_browser_qa.ps1`, `BROWSER_QA_REPORT.md` | add deeper click-path assertions |
| Screenshot regression | PASS | before/current desktop/mobile screenshots, `SCREENSHOT_REGRESSION_REPORT.md` | add pixel-diff threshold |
| Preview surface | PASS | local preview URL | label local/preview/production in final claims |
| Performance budget | PASS | `PERFORMANCE_BUDGET.md` | add Lighthouse/Core Web Vitals on production migration |
| Accessibility baseline | PASS | `ACCESSIBILITY_CHECKLIST.md`, `ACCESSIBILITY_QA_REPORT.md` | add axe/Lighthouse later |
| Rework loop | PASS | `DESIGN_QUALITY_SCORECARD.md` | rework lowest two lanes after every visual pass |
| Project adoption | PASS | this file | keep current after redesigns |

## Five-Star Gaps

- Pixel-diff threshold
- Deeper click-path assertions
- Full WCAG/Lighthouse audit

## Next Design Sprint Rule

Before the next visible redesign is called high-quality, close at least one five-star gap with proof, not only style edits.

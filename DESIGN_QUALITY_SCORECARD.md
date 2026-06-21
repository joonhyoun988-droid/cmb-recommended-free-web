# CMB Design Quality Scorecard

Date: 2026-06-21
Artifact: `CMB_RECOMMENDED_FREE_WEB`
Route: `DESIGN_ARTIFACT_QUALITY_RUBRIC_GATE_V8_01`
Label: `reworked_after_scorecard`

This scorecard keeps the redesign honest. A "better looking" claim is not enough; each visual lane needs a score, evidence, and a rework decision.

| Axis | Score | Evidence | Decision |
|---|---:|---|---|
| Information hierarchy | 8 | Command header, KPI strip, workbench, queue, map, settings are separated. | keep |
| Action hierarchy | 8 | Primary send action and secondary reset/export actions are visually separated. | keep |
| Token discipline | 8 | Named color, radius, shadow, and spacing tokens are used in CSS. | keep |
| Reference DNA | 7 | Uses command-center, data-table, and field-input patterns; see `DESIGN_REFERENCE_AUTOCOLLECT.md`. | keep but expand vault later |
| Component state matrix | 8 | Added focus-visible, disabled, loading, invalid, hover, active, toast, badges. | upgraded |
| Data-table ergonomics | 8 | Fixed table layout, numeric alignment, compact status labels, wrapping for long item names. | upgraded |
| Mobile field ergonomics | 8 | One-column breakpoints, no forced command row below 460px, large input/action targets. | upgraded |
| Accessibility/contrast | 8 | Visible focus ring, darker text, reduced motion support, invalid state. | upgraded |
| Visual polish | 8 | Stronger operational hero, controlled surfaces, restrained shadows, less generic card feel. | keep |
| Before/after delta | 8 | Baseline and current desktop/mobile screenshots exist. | keep |
| Regression screenshot | 7 | Current screenshots are regenerated; pixel-diff threshold is still queued. | queued |
| Artifact scorecard | 9 | This file is the persistent scorecard. | keep |
| Rework gate | 8 | Lanes below 8 were reworked before delivery. | keep |

Total: 103 / 130
Band: B+ usable and stronger than prototype, but not yet S-class.

## Failed Or Weak Lanes

- `REFERENCE_DNA`: needs a larger local visual reference vault with accepted examples and rejected examples.
- `REGRESSION_SCREENSHOT`: screenshot pairs exist, but automatic pixel-diff threshold is not yet product-grade.

## Rework Completed In This Pass

- Added keyboard focus indicators.
- Added disabled/loading/invalid state styling.
- Added reduced-motion support.
- Added numeric alignment for inventory quantities.
- Improved mobile button wrapping and one-column fallback below 460px.
- Regenerated current desktop/mobile screenshots through the local preview server and Playwright.

## Next Rework Trigger

If the owner says the screen still feels flat, cheap, crowded, or not field-ready, rerun this scorecard and rework the lowest two lanes before claiming finish.

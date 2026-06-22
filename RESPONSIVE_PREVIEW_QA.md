# CMB Responsive Preview QA

Route: `RESPONSIVE_PREVIEW_DEFAULT_QA_V8_09`
Receipt: `RESPONSIVE_PREVIEW_QA_RECEIPT`

Status: `adopted_for_project`
Updated: 2026-06-22

| Lane | Status | Evidence | Next action |
|---|---|---|---|
| `RESPONSIVE_PREVIEW_OPEN_LANE` | PASS | In-app browser preview URL: `http://127.0.0.1:8768/index.html#mobile` | Keep the responsive preview visible by default during UI/design work. |
| `VIEWPORT_EVIDENCE_LANE` | PASS | `preview_desktop.png`, `preview_mobile.png`, `VISUAL_QA_EVIDENCE.md`, `VISUAL_DIFF_QA_REPORT.md` | Regenerate screenshots after visual or layout changes. |
| `QA_COCKPIT_EXPLAIN_LANE` | PASS | The side responsive browser panel is QA evidence, not the shipped product screen | Explain this when the owner asks whether the side panel is part of the website. |
| `COMPLETION_BLOCK_LANE` | PASS | Frontend completion now depends on local + remote proof stack | Do not call UI finished without desktop/mobile proof. |
| `FALLBACK_LANE` | PASS | Playwright screenshots, visual diff, axe, Lighthouse reports | Use screenshot fallback if the in-app browser is unavailable. |

```text
RESPONSIVE_PREVIEW_QA_RECEIPT:
- project_path: C:\Users\joonh\Documents\Codex\CMB_RECOMMENDED_FREE_WEB
- target_url: http://127.0.0.1:8768/index.html#mobile
- responsive_preview_open: true
- desktop_viewport: preview_desktop.png
- mobile_viewport: preview_mobile.png
- qa_cockpit_explained: true
- fallback_used: Playwright screenshot and visual diff artifacts exist
- evidence_paths: VISUAL_QA_EVIDENCE.md, VISUAL_DIFF_QA_REPORT.md, SCREENSHOT_REGRESSION_REPORT.md
- remaining_gap: deeper scenario coverage as CMB workflows grow
```

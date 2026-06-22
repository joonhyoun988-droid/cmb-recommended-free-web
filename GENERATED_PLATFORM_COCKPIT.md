# Generated Platform Cockpit

Route: `PROJECT_MIGRATION_BOT_GENERATED_COCKPIT_V8_13`
Receipt: `MIGRATION_COCKPIT_RECEIPT`
EvidenceSnapshot: 2026-06-22T02:18:37
Project: `C:\Users\joonh\Documents\Codex\CMB_RECOMMENDED_FREE_WEB`

| Lane | Status | Evidence | Next action |
|---|---|---|---|
| Worktree | source_clean | `git status --short` | Keep clean before delivery. |
| Project migration queue | PASS | active=6, missing=0, `PROJECT_MIGRATION_QUEUE.md` | Convert missing items to branch/PR draft later. |
| Remote proof | PASS | success / https://github.com/joonhyoun988-droid/cmb-recommended-free-web/actions/runs/27911725027 / cmb-frontend-proof-488354e174faf439f7056011149435a0f926d08b | Refresh after every release proof run. |
| Preview URL | PASS | https://joonhyoun988-droid.github.io/cmb-recommended-free-web/ | Keep HTTP 200 proof fresh. |
| RUM/Web Vitals | READY_LOCAL | `rum_web_vitals_client.js`, `RUM_FIELD_DATA.md` | Add privacy-safe central endpoint before production RUM claim. |
| Observability | READY_LOCAL | runtime client, observability doc, telemetry plan | Add logs/metrics/traces/alerts sink for live operations. |
| Living design system | NOW_DOC | tokens=True, component/design proof | Promote key components into reusable state/spec stories. |
| Platform circulation | DOCUMENTED_LOOP | `PLATFORM_CIRCULATION_LOOP.md` | Keep criteria, adoption, evidence, operations, recovery, and design judgment circulating. |
| Upgrade demand | ADOPTED | `UPGRADE_DEMAND_GOVERNOR.md` | Batch non-urgent ideas and protect project delivery focus. |
| No-overclaim | PASS | READY_LOCAL / NEXT / NOT_YET / preview_operational | Do not call this production platform parity yet. |

## Next Forced Action

1. Build branch/PR draft automation for the migration queue.
2. Convert this markdown cockpit into an HTML/JSON generated dashboard when multiple projects are active.
3. Add central RUM endpoint and live observability sink before production monitoring claims.

# Project Migration Queue

Route: `PROJECT_MIGRATION_BOT_GENERATED_COCKPIT_V8_13`
Receipt: `MIGRATION_COCKPIT_RECEIPT`
EvidenceSnapshot: 2026-06-22T02:18:37
Project: `C:\Users\joonh\Documents\Codex\CMB_RECOMMENDED_FREE_WEB`

| Criterion | Status | Project file | Reason | Next action |
|---|---|---|---|---|
| Efficiency governor | PRESENT | `EFFICIENCY_GOVERNOR.md` | v8.10 lightest safe route | Keep evidence fresh. |
| Responsive preview QA | PRESENT | `RESPONSIVE_PREVIEW_QA.md` | v8.09 browser QA default | Keep evidence fresh. |
| Automated operations cockpit | PRESENT | `AUTOMATED_OPERATIONS_COCKPIT.md` | v8.11 generated report/project adoption/RUM/ops cockpit | Keep evidence fresh. |
| Top 0.01 percent platform gap plan | PRESENT | `TOP_001_PERCENT_PLATFORM_GAP_PLAN.md` | v8.12 five platform gap lanes | Keep evidence fresh. |
| Project migration queue | PRESENT | `PROJECT_MIGRATION_QUEUE.md` | v8.13 active project adoption queue | Keep evidence fresh. |
| Generated platform cockpit | PRESENT | `GENERATED_PLATFORM_COCKPIT.md` | v8.13 generated evidence cockpit | Keep evidence fresh. |
| Platform circulation loop | PRESENT | `PLATFORM_CIRCULATION_LOOP.md` | v8.14 criteria/adoption/evidence/operations/recovery/design loop | Keep evidence fresh. |
| Upgrade demand governor | PRESENT | `UPGRADE_DEMAND_GOVERNOR.md` | v8.15 upgrade intake/triage/cadence/no-bloat governor | Keep evidence fresh. |
| PR draft bot | PRESENT | `create_project_adoption_pr.ps1` | closes manual queue-only gap | Dry-run before branch/PR creation. |
| Generated web cockpit | PRESENT | `platform-dashboard.html`, `platform-dashboard-data.json` | closes markdown-only cockpit gap | Refresh JSON after proof runs. |
| Platform gap execution closure | PRESENT | `PLATFORM_GAP_EXECUTION_CLOSURE.md` | closes v8.16 execution gap lanes | Keep endpoint/workshop/PR evidence linked. |
| Free toolchain radar | PRESENT | `WORLD_CLASS_FREE_TOOLCHAIN_RADAR.md` | v8.17 free external gear recommendation engine | Score candidates before adopting or piloting tools. |

```text
MIGRATION_COCKPIT_RECEIPT:
- project_path: C:\Users\joonh\Documents\Codex\CMB_RECOMMENDED_FREE_WEB
- active_criteria_count: 10
- missing_criteria_count: 0
- migration_queue_path: PROJECT_MIGRATION_QUEUE.md
- generated_cockpit_path: GENERATED_PLATFORM_COCKPIT.md
- evidence_sources: Git status, REMOTE_EVIDENCE_SNAPSHOT.json, RUM, observability, design proof
- no_overclaim_labels: READY_LOCAL / NEXT / NOT_YET / preview_operational
- next_automation: dry-run PR draft bot; generated cockpit refresh after proof runs; central telemetry endpoint deployment; free toolchain pilot decisions
- blocked_by: production endpoint/retention decision, not local implementation
```

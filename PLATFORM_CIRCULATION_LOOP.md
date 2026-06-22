# CMB Platform Circulation Loop

Route: `PLATFORM_CIRCULATION_LOOP_V8_14`
Receipt: `PLATFORM_CIRCULATION_RECEIPT`

Status: `documented_loop`
Updated: 2026-06-22

| Lane | Status | Evidence | Next forced action |
|---|---|---|---|
| `CRITERIA_LANE` | PASS | AI-OS v8.09-v8.14 route docs, gates, receipts | Keep new criteria paired with project adoption checks. |
| `ADOPTION_LANE` | PASS | `PROJECT_MIGRATION_QUEUE.md`, `GENERATED_PLATFORM_COCKPIT.md`, `TOP_001_PERCENT_PLATFORM_GAP_PLAN.md`, `create_project_adoption_pr.ps1` | Run PR bot in dry-run before adoption branches. |
| `EVIDENCE_LANE` | PASS | `REMOTE_EVIDENCE_SNAPSHOT.json`, GitHub Actions run, screenshots, proof reports | Refresh after remote proof runs without endless doc churn. |
| `OPERATIONS_LANE` | READY_LOCAL_PLUS_ENDPOINT_READY | `RUM_FIELD_DATA.md`, `OBSERVABILITY_RUNTIME.md`, `OPERATIONS_TELEMETRY_PLAN.md`, `telemetry_config.js`, `telemetry_worker_example.js`, `ops_alert_rules.json` | Deploy central RUM and live logs/metrics/traces/alerts before production claims. |
| `RECOVERY_LANE` | PASS | `REMOTE_RELEASE_RECOVERY.md`, `GITHUB_AUTH_LIFECYCLE.md`, required-check recovery notes | Keep stale-proof repair and rollback route visible. |
| `DESIGN_JUDGMENT_LANE` | WORKSHOP_READY | `component-workshop.html`, `DESIGN_TOKENS.md`, `COMPONENT_INVENTORY.md`, `DESIGN_QUALITY_SCORECARD.md`, `VISUAL_DIFF_QA_REPORT.md`, `ACCESSIBILITY_AUDIT_REPORT.md` | Keep reusable component state/story layer current. |
| `FEEDBACK_TO_CRITERIA_LANE` | PASS | AI-OS v8.14 eval cases and Wisdom Delta route | Promote repeated misses to lesson, eval case, candidate, durable rule, or retire/merge decision. |
| `UPGRADE_DEMAND_LANE` | PASS | `UPGRADE_DEMAND_GOVERNOR.md` | Triage upgrade pressure before adding more permanent criteria. |
| `NO_OVERCLAIM_LANE` | PASS | `READY_LOCAL`, `NEXT`, `NOT_YET`, `preview_operational` labels | Do not call this production platform parity yet. |

```text
PLATFORM_CIRCULATION_RECEIPT:
- criteria_status: PASS, durable routes and gates exist
- adoption_status: PASS, migration queue and generated cockpit exist
- evidence_status: PASS, remote proof and local QA evidence exist
- operations_status: READY_LOCAL_PLUS_ENDPOINT_READY, central field collection NOT_YET until endpoint is deployed
- recovery_status: PASS, release/auth/recovery docs exist
- design_judgment_status: WORKSHOP_READY, reusable story layer exists as static component workshop
- feedback_to_criteria_status: PASS, v8.14 eval cases exist
- no_overclaim_labels: READY_LOCAL / NEXT / NOT_YET / preview_operational
- loop_stage: DOCUMENTED_LOOP + GATED_LOOP + GENERATED_LOOP
- next_forced_action: dry-run PR bot, open HTML/JSON cockpit, then deploy telemetry endpoint when production monitoring is needed
- evidence: PROJECT_MIGRATION_QUEUE.md, GENERATED_PLATFORM_COCKPIT.md, REMOTE_EVIDENCE_SNAPSHOT.json
```

# CMB Automated Operations Cockpit

Route: `WORLD_CLASS_AUTOMATED_OPERATIONS_COCKPIT_V8_11`
Receipt: `AUTOMATED_OPERATIONS_COCKPIT_RECEIPT`

Status: `adopted_for_project`
Updated: 2026-06-22

| Lane | Status | Evidence | Next action |
|---|---|---|---|
| `REPORT_DIRTY_PRESSURE_LANE` | WARN_OS | AI-OS `97_Benchmark_Results` dirty pressure is tracked outside this project | Clean/compact generated report churn at OS level, not inside CMB app files. |
| `PROJECT_ADOPTION_LANE` | PASS | `EFFICIENCY_GOVERNOR.md`, `RESPONSIVE_PREVIEW_QA.md`, this file | Keep new OS criteria copied/adapted when they affect active projects. |
| `RUM_FIELD_DATA_LANE` | LIVE_CLOUDFLARE_ENDPOINT_PROVEN | `rum_web_vitals_client.js`, `telemetry_config.js`, `CLOUDFLARE_TELEMETRY_EVIDENCE.md` | Keep Cloudflare evidence refreshed and add dashboard trend review. |
| `OBSERVABILITY_SIGNAL_LANE` | LIVE_CLOUDFLARE_ENDPOINT_PROVEN_NOT_ALERTING | `runtime_observability_client.js`, `ops_alert_rules.json`, `CLOUDFLARE_TELEMETRY_EVIDENCE.md` | Add alert routing after enough real events exist. |
| `REMOTE_PROOF_LANE` | PASS | `REMOTE_EVIDENCE_SNAPSHOT.json`, GitHub Actions run `27927359323`, artifact `7782537320`, Pages HTTP 200 | Refresh snapshot after release proof runs. |
| `ONE_SCREEN_COCKPIT_LANE` | PASS | `PRODUCT_OPS_COCKPIT.md` + `platform-dashboard.html` + this cockpit | Keep generated dashboard data fresh. |
| `TOP_001_PLATFORM_GAP_LANE` | EXECUTION_STAGED | `TOP_001_PERCENT_PLATFORM_GAP_PLAN.md`, `PLATFORM_GAP_EXECUTION_CLOSURE.md` | Remaining true boundary is deployed telemetry and stronger GitHub ruleset proof. |
| `NO_OVERCLAIM_LANE` | PASS | `READY_LOCAL` and `NOT_YET` labels used | Do not call local-only data production monitoring. |

```text
AUTOMATED_OPERATIONS_COCKPIT_RECEIPT:
- report_dirty_count: OS-level dirty pressure, not CMB-local dirty state
- generated_report_policy: classify and clean via AI-OS report lifecycle
- project_adoption_status: adopted
- project_missing_docs: none for v8.09/v8.10/v8.11
- rum_status: LIVE_CLOUDFLARE_ENDPOINT_PROVEN
- observability_status: LIVE_CLOUDFLARE_ENDPOINT_PROVEN_NOT_ALERTING
- remote_proof_status: preview_operational
- one_screen_cockpit_status: markdown cockpit plus static web dashboard present
- five_star_bottlenecks: OS report pressure, Cloudflare dashboard ingestion into AI-OS cockpit, live alerting sink
- next_action: refresh Cloudflare evidence after deploys; pull dashboard request/error/latency into AI-OS cockpit
- no_overclaim_label: local proof is not production monitoring
```

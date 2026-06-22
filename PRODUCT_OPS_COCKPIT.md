# CMB Product Ops Cockpit

Status: `preview_operational`
Updated: 2026-06-22

| Lane | Status | Evidence | Next action |
|---|---|---|---|
| Required checks | PASS | branch protection requires always-on `frontend-proof`; conversation resolution enabled | Keep `enforce_admins=false` unless owner wants strict PR-only lock. |
| Remote CI | PASS | `https://github.com/joonhyoun988-droid/cmb-recommended-free-web/actions/runs/27927359323` | Keep latest app/workflow SHA green. |
| Preview deploy | PASS | `https://github.com/joonhyoun988-droid/cmb-recommended-free-web/actions/runs/27927359316` | Keep Pages HTTP 200. |
| Public URL | PASS | `https://joonhyoun988-droid.github.io/cmb-recommended-free-web/` | Add deeper route checks as scope grows. |
| Artifact retention | PASS | `cmb-frontend-proof-eafbe2ed943cc50d534953cc800ef335fc955d22`; artifact `7782537320` | Move durable proof to vault if needed. |
| RUM/Web Vitals | READY_LOCAL_PLUS_ENDPOINT_READY | `rum_web_vitals_client.js`, `telemetry_config.js`, `RUM_FIELD_DATA.md` | Configure a privacy-safe endpoint before production RUM claims. |
| Observability | READY_LOCAL_PLUS_ENDPOINT_READY | `runtime_observability_client.js`, `ops_alert_rules.json`, `telemetry_worker_example.js` | Deploy an ops endpoint and alert sink before live alerting claims. |
| Design rework loop | READY | `DESIGN_REWORK_LOOP.md`, `DESIGN_QUALITY_SCORECARD.md` | Re-score after visible redesigns. |
| AI-OS dashboard | READY_STATIC_WEB | `platform-dashboard.html`, `platform-dashboard-data.json`, this cockpit | Refresh dashboard JSON after proof runs. |
| Living component workshop | READY | `component-workshop.html`, `DESIGN_TOKENS.md`, `COMPONENT_INVENTORY.md` | Use before UI redesigns and after new components appear. |
| PR draft bot | SCRIPT_READY | `create_project_adoption_pr.ps1` | Run `-DryRun`; use real PR only after clean worktree/auth checks. |
| Free toolchain radar | RADAR_ADOPTED | `WORLD_CLASS_FREE_TOOLCHAIN_RADAR.md` | Use GitHub/Cloudflare/Sentry/Storybook/Playwright score before integration. |
| GitHub Projects queue | SCRIPT_READY | `setup_github_projects_board.ps1`, `GITHUB_PROJECTS_QUEUE.md` | External board creation remains an owner/account side effect. |
| Cloudflare telemetry | PILOT_READY_NOT_DEPLOYED | `cloudflare/telemetry-worker.js`, `CLOUDFLARE_TELEMETRY_ENDPOINT.md` | Endpoint not live until Worker deploy and config update. |
| Sentry Free | PILOT_READY_DSN_EMPTY | `sentry_config.js`, `SENTRY_FREE_OBSERVABILITY.md` | DSN empty by default; no external error data leaves yet. |
| Storybook | PILOT_READY_NOT_INSTALLED | `.storybook/main.js`, `stories/cmb-components.stories.js` | Static workshop remains live until Storybook install. |
| Extended Playwright scenarios | ADOPTED | `qa/cmb-platform-scenarios-cdp.mjs`, platform scenario reports | Dashboard/workshop/telemetry defaults now covered. |
| Project criteria adoption | PASS | `EFFICIENCY_GOVERNOR.md`, `RESPONSIVE_PREVIEW_QA.md`, `AUTOMATED_OPERATIONS_COCKPIT.md` | Keep active project docs updated when AI-OS adds relevant gates. |
| Production RUM monitoring | NOT_YET | endpoint hook exists, central endpoint not deployed | Do not overclaim production monitoring. |
| Live ops alerting | NOT_YET | alert rules exist, alert sink not deployed | Do not overclaim live alerting. |

## Commands

```powershell
.\check_github_auth.ps1
.\setup_github_required_checks.ps1 -DryRun
.\setup_github_required_checks.ps1
.\collect_github_remote_evidence.ps1
```

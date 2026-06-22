# Generated Platform Cockpit

Route: `PROJECT_MIGRATION_BOT_GENERATED_COCKPIT_V8_13`
Receipt: `MIGRATION_COCKPIT_RECEIPT`
EvidenceSnapshot: 2026-06-22T02:18:37
Project: `C:\Users\joonh\Documents\Codex\CMB_RECOMMENDED_FREE_WEB`

| Lane | Status | Evidence | Next action |
|---|---|---|---|
| Worktree | source_clean | `git status --short` | Keep clean before delivery. |
| Project migration queue | PASS | active=10, missing=0, `PROJECT_MIGRATION_QUEUE.md` | Keep new platform closure files tracked. |
| PR draft bot | SCRIPT_READY | `create_project_adoption_pr.ps1` | Use `-DryRun` first; use `-CreatePr` only after auth/worktree checks. |
| Remote proof | PASS | success / https://github.com/joonhyoun988-droid/cmb-recommended-free-web/actions/runs/27927359323 / cmb-frontend-proof-eafbe2ed943cc50d534953cc800ef335fc955d22 | Refresh after every release proof run. |
| Preview URL | PASS | https://joonhyoun988-droid.github.io/cmb-recommended-free-web/ | Keep HTTP 200 proof fresh. |
| Generated web cockpit | READY_STATIC | `platform-dashboard.html`, `platform-dashboard-data.json` | Open this after platform/ops changes; refresh JSON after proof runs. |
| RUM/Web Vitals | READY_LOCAL_PLUS_ENDPOINT_READY | `rum_web_vitals_client.js`, `telemetry_config.js`, `RUM_FIELD_DATA.md` | Set a privacy-safe endpoint before production RUM claim. |
| Observability | READY_LOCAL_PLUS_ENDPOINT_READY | `runtime_observability_client.js`, `ops_alert_rules.json`, telemetry plan | Set an ops endpoint and alert sink before live alerting claims. |
| Living design system | WORKSHOP_READY | `component-workshop.html`, tokens, component/design proof | Use the workshop before visible UI redesign work. |
| Platform circulation | DOCUMENTED_LOOP | `PLATFORM_CIRCULATION_LOOP.md` | Keep criteria, adoption, evidence, operations, recovery, and design judgment circulating. |
| Upgrade demand | ADOPTED | `UPGRADE_DEMAND_GOVERNOR.md` | Batch non-urgent ideas and protect project delivery focus. |
| Free toolchain radar | RADAR_ADOPTED | `WORLD_CLASS_FREE_TOOLCHAIN_RADAR.md` | Use Adopt/Pilot/Queue/Reject before connecting free external gears. |
| GitHub Projects queue | SCRIPT_READY | `setup_github_projects_board.ps1`, `GITHUB_PROJECTS_QUEUE.md` | Create external board only after `gh auth refresh -s project`. |
| Cloudflare telemetry pilot | PILOT_READY_NOT_DEPLOYED | `cloudflare/telemetry-worker.js`, `deploy_cloudflare_telemetry_worker.ps1` | Deploy only after privacy/retention decision. |
| Sentry Free pilot | PILOT_READY_DSN_EMPTY | `sentry_config.js`, `sentry_browser_bridge.js` | Set DSN only after owner-approved data boundary. |
| Storybook pilot | PILOT_READY_NOT_INSTALLED | `.storybook/main.js`, `stories/cmb-components.stories.js` | Install when reusable components exceed static workshop. |
| Extended Playwright scenarios | ADOPTED | `qa/cmb-platform-scenarios-cdp.mjs` | Keep dashboard/workshop/telemetry scenario proof in CI. |
| Schema-first guidance | ADOPTED | `SCHEMA_FIRST_GUIDANCE.md`, `GITHUB_PROJECTS_QUEUE.md` | Keep fixed Lane separate from variable Project before board/DB/sheet setup. |
| No-overclaim | PASS | READY_LOCAL / NEXT / NOT_YET / preview_operational | Do not call this production platform parity yet. |

## Next Forced Action

1. Run `.\create_project_adoption_pr.ps1 -DryRun` before opening adoption branches.
2. Open `platform-dashboard.html` after platform changes and refresh `platform-dashboard-data.json` after proof runs.
3. Deploy a privacy-safe telemetry endpoint before claiming central RUM or live alerting.
4. Pilot Cloudflare/Sentry/Storybook only after the radar keeps their boundary visible.
5. Run schema-first field review before adding external board fields by hand.

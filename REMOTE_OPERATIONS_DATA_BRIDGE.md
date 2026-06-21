# CMB Remote Operations Data Bridge

Route: `LOCAL_TO_REMOTE_OPERATIONS_DATA_BRIDGE_V8_05`
Receipt: `REMOTE_OPERATIONS_DATA_BRIDGE_RECEIPT`

## Proof Level

- Current: `preview_operational`
- Proven remote CI run: yes
- Preview operational: yes
- Production RUM monitoring: not yet
- GitHub repository: `https://github.com/joonhyoun988-droid/cmb-recommended-free-web`
- GitHub Pages URL: `https://joonhyoun988-droid.github.io/cmb-recommended-free-web/`
- GitHub auth: `ok`
- GitHub auth lifecycle: `GITHUB_AUTH_LIFECYCLE.md`, `check_github_auth.ps1`
- Local Git commit: `c2bf1f2`
- Remote CI run: `https://github.com/joonhyoun988-droid/cmb-recommended-free-web/actions/runs/27910372365`
- Pages deploy run: `https://github.com/joonhyoun988-droid/cmb-recommended-free-web/actions/runs/27910408479`
- Artifact: `cmb-frontend-proof-c2bf1f2072a4525e76e9c06d4ffdc04360735dd9`
- Artifact API: `https://api.github.com/repos/joonhyoun988-droid/cmb-recommended-free-web/actions/artifacts/7777155529`

No-overclaim: CMB now has remote CI proof and an operational GitHub Pages preview. It must not be called production RUM monitoring until real-user Web Vitals and operations telemetry are live.

## Bridge Board

| Lane | Status | Evidence | Next action |
|---|---|---|---|
| `LOCAL_PROOF_BASELINE_LANE` | PASS | `WORLD_CLASS_FRONTEND_PROOF_STACK.md`, `QA_ARTIFACT_MANIFEST.json`, visual/interaction/axe/Lighthouse reports | Keep proof current after UI changes. |
| `REMOTE_CI_WORKFLOW_LANE` | PASS | `.github/workflows/cmb-frontend-proof.yml`; run `27910372365` succeeded | Keep workflow required for future changes. |
| `REMOTE_REQUIRED_STATUS_LANE` | WARN | required status check is plan-blocked until repo/ruleset is configured | Enable branch protection/ruleset when the repo is active. |
| `REMOTE_ARTIFACT_RETENTION_LANE` | PASS | artifact `cmb-frontend-proof-c2bf1f2072a4525e76e9c06d4ffdc04360735dd9`, expires `2026-07-21T16:26:13Z` | Keep 30-day artifact retention or move durable records to vault. |
| `PREVIEW_DEPLOYMENT_LANE` | PASS | Pages URL HTTP 200; deploy run `27910408479` succeeded | Add deeper health checks as the app grows. |
| `OPERABILITY_TELEMETRY_LANE` | READY | `OPERATIONS_TELEMETRY_PLAN.md` | Connect logs/metrics/traces provider after deployment. |
| `RUM_WEB_VITALS_LANE` | READY | `REAL_USER_METRICS_SCHEMA.json` | Collect only after privacy review and deployment. |
| `DORA_INCIDENT_LANE` | READY | `DORA_METRICS_PLAN.md` | Fill real values after recurring releases. |
| `PRIVACY_CONSENT_LANE` | READY | `REAL_USER_DATA_PRIVACY_BOUNDARY.md` | Review before collecting live user data. |
| `NO_OVERCLAIM_LANE` | PASS | `preview_operational`, not `production_rum_monitoring` | Final answers must keep this distinction. |
| `V7_98_HANDOFF_LANE` | READY | Use `WORLD_CLASS_REMOTE_CI_VAULT_EVIDENCE_MESH_V7_98` for remote run/vault/provenance proof | Run v7.98 once external proof is claimed. |
| `GITHUB_AUTH_LIFECYCLE_GUARD_V8_06` | PASS | `.\check_github_auth.ps1 -TryRefresh` restored valid auth | Use `deploy_github_remote.ps1` for future auth+deploy flow. |

## Deployment Slots

- preview_url: `https://joonhyoun988-droid.github.io/cmb-recommended-free-web/`
- environment: GitHub Pages
- health_check: HTTP 200 and critical flow proof
- rollback: restore previous git commit or prior packaged folder
- run_url: `https://github.com/joonhyoun988-droid/cmb-recommended-free-web/actions/runs/27910372365`
- artifact_path: `cmb-frontend-proof-c2bf1f2072a4525e76e9c06d4ffdc04360735dd9`
- remote_handoff: `GITHUB_REMOTE_HANDOFF.md`
- auth_preflight: `.\check_github_auth.ps1`
- auth_refresh: `gh auth refresh -h github.com -s repo,workflow`
- auth_login_fallback: `gh auth login -h github.com -p https -w`

## Remote CI Promotion Rule

1. Local proof stack passes.
2. GitHub Actions workflow runs on remote runner.
3. Workflow uploads artifacts.
4. Required check or plan-blocked limitation is recorded.
5. Run URL is added here.
6. Proof level may move from `remote_ci_ready` to `remote_ci_proven`.
7. Public Pages URL returns HTTP 200.
8. Proof level may move from `remote_ci_proven` to `preview_operational`.

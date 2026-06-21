# CMB Remote Operations Data Bridge

Route: `LOCAL_TO_REMOTE_OPERATIONS_DATA_BRIDGE_V8_05`
Receipt: `REMOTE_OPERATIONS_DATA_BRIDGE_RECEIPT`

## Proof Level

- Current: `remote_ci_ready`
- Proven remote CI run: not yet
- Preview operational: not yet
- Production RUM monitoring: not yet
- GitHub auth: `blocked_by_invalid_gh_token`
- Local Git commit: `c61fa0c`

No-overclaim: CMB currently has local static/frontend proof and a CI-ready workflow template. It must not be called remote-proven until a GitHub Actions run URL and retained artifact exist.

## Bridge Board

| Lane | Status | Evidence | Next action |
|---|---|---|---|
| `LOCAL_PROOF_BASELINE_LANE` | PASS | `WORLD_CLASS_FRONTEND_PROOF_STACK.md`, `QA_ARTIFACT_MANIFEST.json`, visual/interaction/axe/Lighthouse reports | Keep proof current after UI changes. |
| `REMOTE_CI_WORKFLOW_LANE` | READY | `.github/workflows/cmb-frontend-proof.yml` | Push to GitHub and capture run URL/artifact. |
| `REMOTE_REQUIRED_STATUS_LANE` | WARN | required status check is plan-blocked until repo/ruleset is configured | Enable branch protection/ruleset when the repo is active. |
| `REMOTE_ARTIFACT_RETENTION_LANE` | READY | workflow uploads reports, JSON, screenshots | Confirm artifact retention after first run. |
| `PREVIEW_DEPLOYMENT_LANE` | WARN | preview_url is still local-only; health_check and rollback are planned | Add public preview URL before preview readiness claims. |
| `OPERABILITY_TELEMETRY_LANE` | READY | `OPERATIONS_TELEMETRY_PLAN.md` | Connect logs/metrics/traces provider after deployment. |
| `RUM_WEB_VITALS_LANE` | READY | `REAL_USER_METRICS_SCHEMA.json` | Collect only after privacy review and deployment. |
| `DORA_INCIDENT_LANE` | READY | `DORA_METRICS_PLAN.md` | Fill real values after recurring releases. |
| `PRIVACY_CONSENT_LANE` | READY | `REAL_USER_DATA_PRIVACY_BOUNDARY.md` | Review before collecting live user data. |
| `NO_OVERCLAIM_LANE` | PASS | `remote_ci_ready`, not `remote_ci_proven` | Final answers must keep this distinction. |
| `V7_98_HANDOFF_LANE` | READY | Use `WORLD_CLASS_REMOTE_CI_VAULT_EVIDENCE_MESH_V7_98` for remote run/vault/provenance proof | Run v7.98 once external proof is claimed. |

## Deployment Slots

- preview_url: local-only today
- environment: local preview
- health_check: load `index.html` and critical flow proof
- rollback: restore previous git commit or prior packaged folder
- run_url: not yet
- artifact_path: not yet
- remote_handoff: `GITHUB_REMOTE_HANDOFF.md`

## Remote CI Promotion Rule

1. Local proof stack passes.
2. GitHub Actions workflow runs on remote runner.
3. Workflow uploads artifacts.
4. Required check or plan-blocked limitation is recorded.
5. Run URL is added here.
6. Proof level may move from `remote_ci_ready` to `remote_ci_proven`.

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
- Latest app/workflow proof commit: `eaa6a1d`
- Latest app/workflow proof SHA: `eaa6a1ddab545698fb4c2213c1e1fe319ea5192c`
- Remote CI run: `https://github.com/joonhyoun988-droid/cmb-recommended-free-web/actions/runs/27911356863`
- Pages deploy run: `https://github.com/joonhyoun988-droid/cmb-recommended-free-web/actions/runs/27911356885`
- Artifact: `cmb-frontend-proof-eaa6a1ddab545698fb4c2213c1e1fe319ea5192c`
- Artifact API: `https://api.github.com/repos/joonhyoun988-droid/cmb-recommended-free-web/actions/artifacts/7777448041`
- Artifact digest: `sha256:07eb38a36684177ec01cc0af7c2ded6329048409b0ff3929f7f45841b3e079ae`
- Artifact expires: `2026-07-21T17:03:19Z`

No-overclaim: CMB now has remote CI proof and an operational GitHub Pages preview. It must not be called production RUM monitoring until real-user Web Vitals and operations telemetry are live.

## Bridge Board

| Lane | Status | Evidence | Next action |
|---|---|---|---|
| `LOCAL_PROOF_BASELINE_LANE` | PASS | `WORLD_CLASS_FRONTEND_PROOF_STACK.md`, `QA_ARTIFACT_MANIFEST.json`, visual/interaction/axe/Lighthouse reports | Keep proof current after UI changes. |
| `REMOTE_CI_WORKFLOW_LANE` | PASS | `.github/workflows/cmb-frontend-proof.yml`; run `27911356863` succeeded | Keep workflow required for future changes. |
| `REMOTE_REQUIRED_STATUS_LANE` | PASS | branch protection requires always-on `frontend-proof`; conversation resolution enabled | Keep admin bypass off only after PR-only workflow is desired. |
| `REMOTE_ARTIFACT_RETENTION_LANE` | PASS | artifact `cmb-frontend-proof-eaa6a1ddab545698fb4c2213c1e1fe319ea5192c`, expires `2026-07-21T17:03:19Z` | Keep 30-day artifact retention or move durable records to vault. |
| `PREVIEW_DEPLOYMENT_LANE` | PASS | Pages URL HTTP 200; deploy run `27911356885` succeeded | Add deeper health checks as the app grows. |
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
- run_url: `https://github.com/joonhyoun988-droid/cmb-recommended-free-web/actions/runs/27911356863`
- artifact_path: `cmb-frontend-proof-eaa6a1ddab545698fb4c2213c1e1fe319ea5192c`
- evidence_snapshot_command: `.\collect_github_remote_evidence.ps1`
- remote_handoff: `GITHUB_REMOTE_HANDOFF.md`
- auth_preflight: `.\check_github_auth.ps1`
- auth_refresh: `gh auth refresh -h github.com -s repo,workflow`
- auth_login_fallback: `gh auth login -h github.com -p https -w`

## Remote CI Promotion Rule

1. Local proof stack passes.
2. GitHub Actions workflow runs on remote runner.
3. Workflow uploads artifacts.
4. Required check protection is recorded, and the required workflow is not path-filtered.
5. Run URL is added here.
6. Proof level may move from `remote_ci_ready` to `remote_ci_proven`.
7. Public Pages URL returns HTTP 200.
8. Proof level may move from `remote_ci_proven` to `preview_operational`.

# CMB Product Ops Cockpit

Status: `preview_operational`
Updated: 2026-06-22

| Lane | Status | Evidence | Next action |
|---|---|---|---|
| Required checks | PASS | branch protection requires always-on `frontend-proof`; conversation resolution enabled | Keep `enforce_admins=false` unless owner wants strict PR-only lock. |
| Remote CI | PASS | `https://github.com/joonhyoun988-droid/cmb-recommended-free-web/actions/runs/27911356863` | Keep latest app/workflow SHA green. |
| Preview deploy | PASS | `https://github.com/joonhyoun988-droid/cmb-recommended-free-web/actions/runs/27911356885` | Keep Pages HTTP 200. |
| Public URL | PASS | `https://joonhyoun988-droid.github.io/cmb-recommended-free-web/` | Add deeper route checks as scope grows. |
| Artifact retention | PASS | `cmb-frontend-proof-eaa6a1ddab545698fb4c2213c1e1fe319ea5192c` | Move durable proof to vault if needed. |
| RUM/Web Vitals | READY_LOCAL | `rum_web_vitals_client.js`, `RUM_FIELD_DATA.md` | Add remote endpoint before production claims. |
| Observability | READY_LOCAL | `runtime_observability_client.js`, `OBSERVABILITY_RUNTIME.md` | Add server-side log/alert sink later. |
| Design rework loop | READY | `DESIGN_REWORK_LOOP.md`, `DESIGN_QUALITY_SCORECARD.md` | Re-score after visible redesigns. |
| AI-OS dashboard | READY | v8.08 gate + this cockpit | Promote to one-screen generated dashboard later. |
| Production RUM monitoring | NOT_YET | no central field collection | Do not overclaim production monitoring. |

## Commands

```powershell
.\check_github_auth.ps1
.\setup_github_required_checks.ps1 -DryRun
.\setup_github_required_checks.ps1
.\collect_github_remote_evidence.ps1
```

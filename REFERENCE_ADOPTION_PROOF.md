# Reference Adoption Proof

Status: T4 remote CI artifact + Pages preview proof / T3 server-code auth proof
CheckedAt: 2026-06-28 00:06:00 +09:00

This file maps the AI-OS `REFERENCE_ADOPTION_QUEUE.md` rows to concrete CMB proof artifacts.

| Ref ID | Domain | Evidence Tier | Proof |
|---|---|---|---|
| REF-PUBLIC-GITHUB-SAAS-DOMAIN-CRITERIA-SYNTHESIZER | wms_inventory_operations | T4 remote CI artifact proof | GitHub Actions run `28292899679` passed the CMB Frontend Proof workflow. Artifact `cmb-frontend-proof-884910fc192fbd75a191afe286e4197d51943d6c` digest `sha256:bedb2fa71a8680d5b5054166142e0dd982c5bdfeafc0ea669a1a639272f596b0` preserves the proof stack for login, search, count save, quick production command, defect movement, audit log, latency state, and error prevention checks. |
| REF-SAAS-WORLD-BENCHMARK-COMPONENT-BLUEPRINT | saas_b2b_operating_surface | T4 remote CI + Pages preview proof | GitHub Actions deploy run `28292899657` published the preview at `https://joonhyoun988-droid.github.io/cmb-recommended-free-web/`. HTTP 200 and `version.json` proved `preview_operational_candidate`. The remote proof artifact preserves the visual baseline and interaction proof. |
| REF-VIBE-CODING-NONCODER-RISK-CONTROL | auth_security_permissions | T3 server-code auth proof / T4 local client proof | `app.js` requires an operator for local save, supports server `authenticateOperator`, sends `operatorSessionToken` with endpoint jobs, and records operator audit rows. `CMB_RECEIVED_SOURCE/Code.gs` proves server-side write paths call `operatorDisplayFromCredentials_`: `webApiSaveStockCount_ -> adjustStockAndSaveCheckEntry -> operatorDisplayFromCredentials_ -> validateOperatorCredentials_` and `webApiQuickInventoryCommand_ -> addTransaction -> operatorDisplayFromCredentials_ -> validateOperatorCredentials_`. |

## Remote Evidence

- CMB Frontend Proof: PASS, `https://github.com/joonhyoun988-droid/cmb-recommended-free-web/actions/runs/28292899679`
- CMB Frontend Proof job: PASS, `https://github.com/joonhyoun988-droid/cmb-recommended-free-web/actions/runs/28292899679/job/83827822387`
- CMB proof artifact: `7925568876`, `cmb-frontend-proof-884910fc192fbd75a191afe286e4197d51943d6c`, digest `sha256:bedb2fa71a8680d5b5054166142e0dd982c5bdfeafc0ea669a1a639272f596b0`
- CMB Pages deploy: PASS, `https://github.com/joonhyoun988-droid/cmb-recommended-free-web/actions/runs/28292899657`
- CMB Pages URL: `https://joonhyoun988-droid.github.io/cmb-recommended-free-web/`, HTTP 200
- AI-OS Guardrails: PASS, `https://github.com/joonhyoun988-droid/ai-os-primary/actions/runs/28292911159`
- AI-OS guardrail artifact: `7925564489`, `ai-os-guardrail-reports`, digest `sha256:3646f8dbb06f59305ffa8eed213a1a1716fc805ee3ee01dcd39e6d9f303cbced`

## Remaining Limits

- GitHub Actions, GitHub Pages, and CI artifact proof are now present. This still does not prove real-user RUM or live cloud cross-browser monitoring.
- Live Apps Script rejection testing was intentionally not sent to the production Google Sheet endpoint in this pass, because a write-probe can leave operational traces if the live deployment is stale.
- Auth proof should move to T4 server-runtime after a safe staging endpoint or explicitly approved no-mutation live rejection probe confirms unauthorized writes are rejected.
- A direct push bypass warning appeared because required check rules allowed bypass; the required `frontend-proof` check then completed successfully. Full PR-only enforcement remains a separate governance choice.

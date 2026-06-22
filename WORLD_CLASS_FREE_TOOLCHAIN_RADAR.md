# CMB Free Toolchain Radar

Route: `WORLD_CLASS_FREE_TOOLCHAIN_RADAR_V8_17`
Receipt: `FREE_TOOLCHAIN_RADAR_RECEIPT`

Status: `adopted_for_project`
Updated: 2026-06-22

## Decision Board

| Candidate | Stars | Decision | Evidence | Boundary | Next action |
|---|---:|---|---|---|---|
| GitHub Actions/Pages/Issues/Projects | 5 | `ADOPT` | Actions proof, Pages preview, artifact evidence, project queue docs | Free/public repo limits and owner permissions still apply. | Use Issues/Projects for AI-OS candidate queue when the work list grows. |
| Cloudflare Workers/KV/D1 | 5 | `PILOT` | `telemetry_worker_example.js`, `telemetry_config.js` | Endpoint is not live until deployed; privacy/retention approval required. | Pilot RUM/Web Vitals and ops event sink after endpoint decision. |
| Playwright/Lighthouse/axe | 5 | `ADOPT` | `run_cmb_frontend_proof_stack.ps1`, QA reports, GitHub artifact | Local/CI proof is not real-user monitoring. | Keep extending business scenarios. |
| Sentry Free | 4 | `PILOT` | `OBSERVABILITY_RUNTIME.md`, `ops_alert_rules.json` | Free quota, data retention, and third-party data boundary apply. | Pilot only after deciding what error data may leave the browser. |
| Storybook | 4 | `PILOT` | `component-workshop.html`, `DESIGN_TOKENS.md`, `COMPONENT_INVENTORY.md` | Static workshop is not full Storybook. | Move to Storybook when components become reusable across projects. |
| Supabase Free | 3 | `QUEUE` | CMB DB/backend discussions | Not needed while static/Sheets/free local path is enough. | Revisit when auth/DB/role workflows exceed current backend. |
| Vercel/Netlify Free | 3 | `QUEUE` | GitHub Pages already operational | Extra deploy surface may add maintenance. | Revisit when preview environments need branch URLs or serverless functions. |
| Random new AI/code tool | 1 | `REJECT` | No project fit yet | Hype and lock-in risk. | Reject unless it proves a 5-star repeated-toil reduction. |

## Integration Plan

- Adopted now: GitHub proof stack and Playwright/Lighthouse/axe QA.
- Pilot next: Cloudflare Workers for RUM/ops endpoint, Sentry Free for alerting, Storybook for living components.
- Queued: Supabase and Vercel/Netlify until the project outgrows the current free/static path.
- Reject by default: tools that require secrets, broad repo access, paid plans, or unclear data retention without a strong project need.

## Validation Plan

- Every adopted or pilot tool must show a file/config target, a local or remote proof command, and a disable/rollback path.
- Dashboard lane must show recommendation status before the tool is called integrated.
- Production claims require deployed endpoint, retained artifact, and no-overclaim label removal.

## No-overclaim

- `RADAR_ADOPTED`: this recommendation system exists.
- `PILOT_READY`: next integration step is clear.
- Not live: Cloudflare/Sentry/Storybook are not production integrations yet.
- Not `LIVE_PRODUCTION`: RUM, alerting, and Storybook-level design system need deployment/configuration proof.

```text
FREE_TOOLCHAIN_RADAR_RECEIPT:
- candidates_considered: GitHub, Cloudflare, Playwright, Sentry, Storybook, Supabase, Vercel/Netlify, random new AI/code tools
- adopted: GitHub Actions/Pages/Issues/Projects; Playwright/Lighthouse/axe
- pilot: Cloudflare Workers/KV/D1; Sentry Free; Storybook
- queued: Supabase Free; Vercel/Netlify Free
- rejected: random tool without fit, proof, or safe boundary
- free_tier_boundaries: free is not unlimited; quotas and plan/permission limits must be named
- security_privacy_boundaries: no secrets or personal data leave the browser without owner-approved endpoint policy
- integration_plan: see board
- validation_plan: local/remote proof plus dashboard lane before claims
- dashboard_lane: platform-dashboard-data.json and generated cockpit
- no_overclaim_label: RADAR_ADOPTED / PILOT_READY / not LIVE_PRODUCTION
```

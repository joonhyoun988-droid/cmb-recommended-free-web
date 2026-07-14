# Claude Work Order: CMB First Collaborative Product Pass

Status: `PHASE_2_MOBILE_VERTICAL_SLICE_APPROVED`
Owner goal: turn the existing public demo into a faster, clearer field inventory experience without weakening its operational character.

## Evidence already observed

- Desktop is a solid B+ operations console.
- Mobile places the command hero, two large actions, four KPI cards, and the WMS board before the main inventory input.
- Current scorecard is 103/130; the weakest lanes are reference DNA and product-grade screenshot regression.
- The proof stack currently tries to fetch Playwright from npm and fails in a managed/offline environment. This is a test-runner dependency problem, not proof that the app itself failed.

## Plan these three changes

1. Mobile field-first flow
   - Put the fastest path to search/select/count inventory within the first useful mobile viewport after login.
   - Keep WMS risk information available, but do not let dashboard cards bury the primary field task.
   - Preserve desktop information density.

2. Reference-driven visual refinement
   - Propose a specific visual direction appropriate for a Korean inventory/WMS field tool.
   - Reuse existing tokens and components before adding new ones.
   - Identify what should be borrowed, transformed, and rejected; do not copy protected branding or assets.

3. Offline-capable proof route
   - Diagnose why `run_cmb_frontend_proof_stack.ps1` invokes an npm fetch.
   - Propose the smallest route that reuses an already available browser/runtime or reports a precise dependency blocker.
   - Do not install Playwright or another package during plan-only work.

## Required plan contents

- Exact files proposed for change.
- Before/after user journey for desktop and mobile.
- Risks to login, inventory state, quick commands, local queue, audit log, telemetry, and responsive layout.
- Verification commands and screenshot sizes.
- Smallest first vertical slice.
- Anything that needs owner approval.

## Out of scope

- Real CMB credentials or production writes.
- Apps Script, Cloudflare, GitHub, or Pages deployment.
- Package installation.
- Replacing the static architecture with React/Next.js.
- Large documentation or governance expansion.

## Codex review received

Read `CODEX_PLAN_REVIEW.md`. Only the offline-capable screenshot proof route is approved now. The CSS visual-order proposal is rejected pending an accessible DOM/focus revision. Stop after writing `CLAUDE_HANDOFF_REPORT.md` and the revised product plan.

## Phase 2 approval

The revised real-DOM-order and post-login focus approach is approved for one vertical slice. Implement Change 1 only in `index.html`, `app.js`, and `styles.css`. Do not implement Change 2 reference/token documentation yet. Produce fresh 390x844 and 1440x900 owner-review screenshots, run functional and accessibility checks, update `CLAUDE_HANDOFF_REPORT.md`, and stop without staging, committing, pushing, deploying, or replacing regression baselines.

# Codex Review of Claude Implementation Plan

Decision: `APPROVED_WITH_REQUIRED_CHANGES`

## Approved now

Implement only the offline screenshot route proposed in `CLAUDE_IMPLEMENTATION_PLAN.md`:

- add `qa/cmb-screenshot-cdp.mjs`;
- replace only the npm-based screenshot calls in `run_cmb_frontend_proof_stack.ps1`;
- reuse the existing local Node and Chrome;
- install no package and make no network fetch;
- preserve the existing 1440x980 and 390x1300 regression sizes;
- run the full proof stack and report its actual output.

## Required revision before product-code work

Do not implement the proposed CSS flex `order` solution. It would make visual order differ from DOM, keyboard, and screen-reader order while `VERIFY.md` requires accessibility not to regress.

Revise the mobile-field-first design using either:

1. a real DOM order with an explicit desktop layout, or
2. a visible mobile action that moves focus to the real first inventory control and preserves a logical next-tab sequence.

The revised plan must show the exact focus order after login at 390x844.

The proposed token substitution and three reference rows are useful cleanup, but they are not sufficient evidence of a B+ to high-quality visual improvement. The revised visual slice must produce one visible product outcome:

- field task visible or immediately reachable after login;
- less mobile dashboard tax;
- clearer item-count action hierarchy;
- preserved desktop operational density;
- before/after screenshots and an owner verdict.

## Sequence

1. Implement and verify the offline screenshot route only.
2. Write `CLAUDE_HANDOFF_REPORT.md` with exact files, commands, results, evidence, and risks.
3. Revise `CLAUDE_IMPLEMENTATION_PLAN.md` for the mobile DOM/focus solution.
4. Stop for Codex review before editing `index.html`, `styles.css`, or `app.js`.

## Git and external boundaries

Do not stage, commit, push, deploy, install packages, change accounts, use production data, or overwrite visual baselines. Codex will independently verify and selectively commit reviewed files.

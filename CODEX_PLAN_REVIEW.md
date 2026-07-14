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

## Revised plan decision

Decision: `PHASE_2_CHANGE_1_APPROVED`

The revised plan removes CSS-only reordering and uses real DOM order plus a mobile post-login focus move. Implement only Change 1:

- move `#workbench` before KPI/WMS sections in `index.html`;
- move the count-entry panel before the inventory table in DOM order;
- remove the old mobile CSS `order` declarations;
- focus `#searchInput` after successful mobile login;
- capture 390x844 and 1440x900 owner-review screenshots;
- prove login, search, count/save, quick command, queue, audit, keyboard focus, no horizontal overflow, and desktop density.

Do not implement the token/reference cleanup yet. Stop after updating the handoff report so Codex and the owner can compare the actual before/after screens.

## Phase 2 implementation review

Decision: `PHASE_2A_ACCEPTED_WITH_FOLLOWUP`

Codex independently confirmed the real `#workbench -> .status-strip -> #commandCenter` DOM order, valid JavaScript syntax, no duplicate HTML IDs, the exact 390x844 and 1440x900 screenshots, and Claude's 9/9 functional result with zero automated axe violations. The mobile first viewport now reaches the field-search task and the desktop inventory/count density remains intact.

The internal `.mobile-panel` / `.inventory-panel` DOM mismatch is explicitly deferred rather than treated as complete. Its existing mobile CSS `order` rules remain technical debt and require a separate layout decision that preserves both desktop table width and DOM/keyboard order. Do not bundle that decision into this accepted Phase 2A checkpoint.

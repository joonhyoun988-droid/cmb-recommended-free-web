# CMB Claude Collaboration Contract

This repository is the public-preview-safe CMB inventory prototype. Never add real operator IDs, PINs, phone numbers, spreadsheet URLs, Apps Script secrets, or real inventory data.

## Roles

- Claude: inspect, propose a plan, and implement only an approved work order.
- Codex: define acceptance criteria, review diffs, run independent verification, and decide whether to commit.
- Owner: decides product direction and approves credentials, deployment, production data, and destructive changes.

## Required workflow

1. Read `README.md`, `CLAUDE_WORK_ORDER.md`, `VERIFY.md`, `DESIGN_BRIEF.md`, and `DESIGN_QUALITY_SCORECARD.md`.
2. Write `CLAUDE_IMPLEMENTATION_PLAN.md` before editing product code.
3. Do not edit `index.html`, `styles.css`, `app.js`, QA scripts, deployment files, or telemetry files until the plan is reviewed.
4. Preserve demo login `DEMO01 / 0000` and the public-preview boundary.
5. After approved implementation, write `CLAUDE_HANDOFF_REPORT.md` with changed files, commands run, results, screenshots, risks, and rollback notes.
6. Do not run `git add`, commit, push, deploy, install packages, or change accounts without explicit approval.

## Beginner words

- Command: one line that tells the computer what to do.
- File: one saved piece of the website or its instructions.
- Commit: a named Git checkpoint for selected changes.
- Verification: a test proving the visible result and behavior work.

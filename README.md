# CMB Recommended Free Web

This folder is the public-preview-safe static prototype for the CMB inventory workflow.

## Beginner Words

- Website: the screen opened in a browser.
- File: one piece of the website, such as `index.html`, `styles.css`, or `app.js`.
- Deploy: put the website on the internet so another person can open it.
- Verify: check that buttons, screens, and saved evidence work as expected.
- CI: a remote computer, usually GitHub Actions, that runs verification again after code is pushed.

## Public Preview Boundary

- Demo login only: `DEMO01 / 0000`.
- Do not publish real operator IDs, real PINs, phone numbers, spreadsheet URLs, or Apps Script secrets.
- The public preview is not the real CMB production system.
- Real CMB authentication and Google Sheets writes must stay behind the server-side Apps Script flow.

## Files That Make The Site

- `index.html`: page structure.
- `styles.css`: visual design and responsive layout.
- `app.js`: demo inventory state, login, count input, local queue, audit log, and optional Apps Script POST endpoint.

## Proof And Operations

- `.github/workflows/cmb-frontend-proof.yml`: remote CI proof workflow.
- `.github/workflows/cmb-pages.yml`: GitHub Pages preview deployment workflow.
- `REMOTE_OPERATIONS_DATA_BRIDGE.md`: local-to-remote proof status.
- `OPERATIONS_TELEMETRY_PLAN.md`: logs, metrics, traces, alert, and runbook plan.
- `REAL_USER_METRICS_SCHEMA.json`: Web Vitals and real-user metric schema.
- `REAL_USER_DATA_PRIVACY_BOUNDARY.md`: what must never be collected.
- `DORA_METRICS_PLAN.md`: deployment and recovery metric plan.

## Local Run

Open `index.html` directly, or run the local preview server:

```powershell
node local-preview-server.mjs 8767
```

Then open:

```text
http://127.0.0.1:8767/index.html
```

## Local Proof

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File ./run_cmb_frontend_proof_stack.ps1
```

Generated reports and screenshots are intentionally ignored by Git. GitHub Actions uploads fresh proof artifacts after remote runs.

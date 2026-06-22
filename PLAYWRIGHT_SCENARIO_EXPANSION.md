# Playwright Scenario Expansion

Status: `ADOPTED`

The proof stack now has two scenario lanes:

- `qa/cmb-critical-flow-cdp.mjs`: login, search, count/save, audit, keyboard smoke.
- `qa/cmb-platform-scenarios-cdp.mjs`: platform dashboard, component workshop, telemetry disabled-by-default bridge.

No-overclaim: this is broader local/CI scenario proof, not every possible warehouse workflow.

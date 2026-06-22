# Sentry Free Observability

Status: `PILOT_READY_DSN_EMPTY`

Sentry Free is the recommended pilot for browser error and performance alerting, but it must stay disabled until DSN and privacy boundaries are approved.

## Files

- `sentry_config.js`: blank DSN and zero tracing by default.
- `sentry_browser_bridge.js`: initializes Sentry only when `window.Sentry` exists and DSN is set.
- `index.html`: loads the bridge after local telemetry config.

## Activation Boundary

1. Decide which error data may leave the browser.
2. Add the Sentry browser SDK using the approved package/CDN route.
3. Set `window.CMB_SENTRY_CONFIG.dsn`.
4. Verify `document.documentElement.dataset.cmbSentry === "enabled"`.

No-overclaim: Sentry is not live while DSN is blank.

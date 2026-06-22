# CMB Operations Telemetry Plan

Status: ready_endpoint_not_live

## Signals

- logs: request/load errors, save failures, authentication failures, permission denials
- metrics: page load time, save latency, interaction scenario latency, error count, successful save count
- traces: login flow, inventory save flow, search/filter flow, admin approval flow
- alert: failed save spike, repeated login failures, unavailable preview URL, data sync error
- runbook: identify affected route, check latest deployment/run URL, inspect artifacts, rollback to previous known-good package, record incident

## Error Events

- `cmb.login_failed`
- `cmb.auth_blocked`
- `cmb.inventory_save_failed`
- `cmb.inventory_save_slow`
- `cmb.audit_log_failed`
- `cmb.frontend_runtime_error`

## Activation Trigger

Turn this from plan to live monitoring after CMB has a privacy-safe telemetry endpoint and an owner-approved retention policy.

## Ready Files

- `runtime_observability_client.js`: captures runtime events locally and can send to a configured endpoint.
- `rum_web_vitals_client.js`: captures Web Vitals locally and can send to a configured endpoint.
- `telemetry_config.js`: keeps endpoints blank by default so no data leaves the browser accidentally.
- `ops_alert_rules.json`: defines first alert thresholds for LCP, CLS, error spikes, and repeated failures.
- `telemetry_worker_example.js`: example sink for a Cloudflare Worker style endpoint.

# CMB Operations Telemetry Plan

Status: ready_not_live

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

Turn this from plan to live monitoring after CMB has a public preview or production deployment.

# CMB Runtime Observability

Status: `ready_local_plus_endpoint_ready_not_live_alerting`

World-class target:

- logs, metrics, traces, errors, and alerts are connected.
- incidents have owner, severity, timeline, and recovery action.
- operational signals are retained outside the user's browser.

Current CMB implementation:

- `runtime_observability_client.js` captures:
  - `window.error`
  - `unhandledrejection`
  - navigation timing
  - visibility changes
- Events are stored in browser `localStorage` under `cmb_ops_events_v1`.
- `telemetry_config.js` can set `window.CMB_TELEMETRY_ENDPOINTS.ops`.
- When the endpoint is blank, no external network request is made.
- When the endpoint is set, events are sent best-effort with `sendBeacon` or `fetch`.
- `ops_alert_rules.json` defines the first local alert thresholds.

Inspect in browser console:

```javascript
window.CMBOps.snapshot()
```

No-overclaim:

- Allowed: `local_runtime_observability_ready`
- Allowed: `ops_endpoint_ready_unconfigured`
- Not allowed yet: `production_alerting_live`

# CMB Runtime Observability

Status: `live_cloudflare_endpoint_proven_not_live_alerting`

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
- `telemetry_config.js` now points `window.CMB_TELEMETRY_ENDPOINTS.ops` to Cloudflare Worker `cmb-telemetry`.
- Events are sent best-effort with `sendBeacon` or `fetch`.
- `CLOUDFLARE_TELEMETRY_EVIDENCE.md` proves the live endpoint accepts operations probes.
- `ops_alert_rules.json` defines the first local alert thresholds.

Inspect in browser console:

```javascript
window.CMBOps.snapshot()
```

No-overclaim:

- Allowed: `local_runtime_observability_ready`
- Allowed: `live_cloudflare_ops_endpoint_proven`
- Allowed: `central_ops_ingestion_ready`
- Not allowed yet: `production_alerting_live`

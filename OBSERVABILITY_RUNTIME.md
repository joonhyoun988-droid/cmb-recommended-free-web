# CMB Runtime Observability

Status: `ready_local_not_alerting`

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
- No external network request is made.

Inspect in browser console:

```javascript
window.CMBOps.snapshot()
```

No-overclaim:

- Allowed: `local_runtime_observability_ready`
- Not allowed yet: `production_alerting_live`

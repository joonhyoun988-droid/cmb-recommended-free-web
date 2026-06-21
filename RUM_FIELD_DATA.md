# CMB RUM Field Data

Status: `ready_local_not_centralized`

World-class target:

- LCP, CLS, and INP are measured from real browsers.
- Events include route, timestamp, visibility state, and metric value.
- Data is privacy-reviewed before it leaves the user's device.
- Production claims require a central, durable, consent-aware collection endpoint.

Current CMB implementation:

- `rum_web_vitals_client.js` measures LCP, CLS, INP candidates, and FID fallback.
- Events are stored in browser `localStorage` under `cmb_rum_events_v1`.
- No external network request is made.
- This is real browser field collection on the current device, but not central production RUM.

Inspect in browser console:

```javascript
window.CMBRUM.snapshot()
```

Clear local samples:

```javascript
window.CMBRUM.clear()
```

No-overclaim:

- Allowed: `rum_ready_local_collector`
- Not allowed yet: `production_rum_monitoring`

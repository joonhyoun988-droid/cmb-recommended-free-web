# CMB RUM Field Data

Status: `live_cloudflare_endpoint_proven_not_full_monitoring`

World-class target:

- LCP, CLS, and INP are measured from real browsers.
- Events include route, timestamp, visibility state, and metric value.
- Data is privacy-reviewed before it leaves the user's device.
- Production claims require a central, durable, consent-aware collection endpoint and recurring dashboard review.

Current CMB implementation:

- `rum_web_vitals_client.js` measures LCP, CLS, INP candidates, and FID fallback.
- Events are stored in browser `localStorage` under `cmb_rum_events_v1`.
- `telemetry_config.js` now points `window.CMB_TELEMETRY_ENDPOINTS.rum` to Cloudflare Worker `cmb-telemetry`.
- Events are sent best-effort with `sendBeacon` or `fetch`.
- `CLOUDFLARE_TELEMETRY_EVIDENCE.md` proves the live endpoint accepts RUM/ops probes.
- This is live central ingestion, but not a full production monitoring claim until dashboard review, alert routing, and retention audit are routine.

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
- Allowed: `live_cloudflare_endpoint_proven`
- Allowed: `central_rum_ingestion_ready`
- Not allowed yet: `full_production_rum_monitoring`

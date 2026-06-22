# Cloudflare Telemetry Endpoint

Status: `PILOT_READY_NOT_DEPLOYED`

Cloudflare Workers is the recommended free pilot for central RUM and operations events.

## Files

- `cloudflare/telemetry-worker.js`: Worker endpoint for `cmb_rum` and `cmb_ops`.
- `cloudflare/wrangler.toml.example`: safe example config.
- `deploy_cloudflare_telemetry_worker.ps1`: dry-run deploy helper.
- `telemetry_config.js`: keeps endpoints blank until deployment is approved.

## Safe Setup

```powershell
.\deploy_cloudflare_telemetry_worker.ps1
```

## Live Setup Boundary

Live setup requires Cloudflare login, KV namespace creation, `wrangler.toml`, endpoint URL, and owner-approved privacy/retention policy.

No-overclaim: this is endpoint-ready, not production monitoring.

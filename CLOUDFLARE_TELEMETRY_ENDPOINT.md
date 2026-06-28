# Cloudflare Telemetry Endpoint

Status: `LIVE_SAFE_CONTRACT_DEPLOYED`

Live endpoint:

```text
https://cmb-telemetry.joonhyoun988.workers.dev
```

Deploy receipt:

- Worker: `cmb-telemetry`
- KV binding: `CMB_TELEMETRY`
- Version ID: `9a8a835c-4680-4388-9111-c0347acfa52b`
- Live probe: `200 OK {"ok":true,"stream":"cmb_ops"}`
- Current config: `telemetry_config.js` sends both `rum` and `ops` to the Worker.

Cloudflare Workers is the recommended free pilot for central RUM and operations events.

## Files

- `cloudflare/telemetry-worker.js`: Worker endpoint for `cmb_rum` and `cmb_ops`.
- `cloudflare/wrangler.toml.example`: safe example config.
- `deploy_cloudflare_telemetry_worker.ps1`: dry-run deploy helper.
- `telemetry_config.js`: keeps endpoints blank until deployment is approved.
- `qa/telemetry-worker-contract-test.mjs`: verifies that the Worker stores only allowed summary fields.

## Safety Contract

The live endpoint stores only this allowlist:

- `schema`
- `projectId`
- `eventType`
- `metricName`
- `metricValue`
- `severity`
- `route`
- `appVersion`
- `happenedAt`
- `anonymousSessionId`
- `proofId`

Raw error messages, form values, names, phone numbers, item memo text, and arbitrary `detail` objects are stripped before storage.

## Safe Setup

```powershell
.\deploy_cloudflare_telemetry_worker.ps1
npm run worker:test
```

## Live Setup Boundary

Live setup requires Cloudflare login, KV namespace creation, local `wrangler.toml`, endpoint URL, and owner-approved privacy/retention policy.

```powershell
.\deploy_cloudflare_telemetry_worker.ps1 -Login
.\deploy_cloudflare_telemetry_worker.ps1 -CreateKv
.\deploy_cloudflare_telemetry_worker.ps1 -KvId <created_kv_id>
.\deploy_cloudflare_telemetry_worker.ps1 -Deploy
```

After deploy, paste the Worker URL into `telemetry_config.js` for both `rum` and `ops`.

No-overclaim: this is live endpoint proof, not full production observability. The next layer is dashboard review, event retention audit, and real-user signal monitoring.

# Cloudflare Telemetry Evidence

Status: `PASS`
Proof level: `live_cloudflare_endpoint_proven`
Checked: 2026-06-28 21:04:31 +09:00

Endpoint:

~~~text
https://cmb-telemetry.joonhyoun988.workers.dev
~~~

| Lane | Status | Evidence |
|---|---|---|
| Worker deployment | PASS | deployments=2, latest=1b059379-0c26-41a8-b653-f659e4ef2aab |
| Endpoint reachability | PASS | HEAD/GET status=405, POST-only boundary expected |
| Live POST probe | PASS | status=200, ok=True |
| Privacy boundary | PASS | safe allowlist Worker strips raw detail fields |

No-overclaim:

- Allowed: `live_cloudflare_endpoint_proven`
- Allowed: `central_rum_ops_ingestion_ready`
- Not allowed yet: `full_production_alerting`
- Not allowed yet: `complete_dashboard_auto_ingestion`

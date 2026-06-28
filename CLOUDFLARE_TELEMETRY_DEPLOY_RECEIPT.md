# Cloudflare Telemetry Deploy Receipt

Status: `LIVE_SAFE_CONTRACT_DEPLOYED`

Endpoint:

```text
https://cmb-telemetry.joonhyoun988.workers.dev
```

What changed:

- `cmb-telemetry` Worker deployed to Cloudflare Workers.
- `CMB_TELEMETRY` KV namespace created and bound.
- `telemetry_config.js` now points CMB RUM and ops events to the live Worker.
- Worker strips raw details and stores only the safe allowlist.

Verification:

```text
GET/HEAD check: 405 Method Not Allowed, expected because only POST/OPTIONS are allowed.
POST check: 200 OK {"ok":true,"stream":"cmb_ops"}
```

Boundary:

- No secret token is committed.
- Local `wrangler.toml` is ignored by Git.
- Raw messages, phone numbers, arbitrary details, and form values are not stored by the Worker.

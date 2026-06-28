import worker from "../cloudflare/telemetry-worker.js";

const writes = [];
const env = {
  CMB_TELEMETRY: {
    async put(key, value, options) {
      writes.push({ key, value: JSON.parse(value), options });
    }
  }
};

async function post(payload, headers = {}) {
  return worker.fetch(new Request("https://telemetry.example.test", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(payload)
  }), env);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

writes.length = 0;
const ok = await post({
  stream: "cmb_ops",
  event: {
    eventType: "window_error",
    metricName: "window_error",
    severity: "error",
    route: "#inventory",
    metricValue: 123,
    anonymousSessionId: "s_abc-123",
    message: "do-not-store-this-message",
    phone: "010-1234-5678",
    detail: { workerName: "do-not-store-this-name" }
  }
});
assert(ok.status === 200, "safe event should be accepted");
assert(writes.length === 1, "accepted event should be written once");
const storedText = JSON.stringify(writes[0].value);
assert(storedText.includes("window_error"), "allowed eventType should remain");
assert(!storedText.includes("010-1234-5678"), "phone must not be stored");
assert(!storedText.includes("do-not-store-this-message"), "raw message must not be stored");
assert(!storedText.includes("do-not-store-this-name"), "raw detail must not be stored");
assert(writes[0].value.event.schema === "cmb.telemetry.safe_event.v1", "safe schema marker missing");
assert(writes[0].options.expirationTtl === 60 * 60 * 24 * 30, "retention should be 30 days");

const invalidStream = await post({ stream: "unknown", event: {} });
assert(invalidStream.status === 400, "invalid stream should be rejected");

const oversized = await worker.fetch(new Request("https://telemetry.example.test", {
  method: "POST",
  headers: { "Content-Type": "application/json", "Content-Length": "8193" },
  body: JSON.stringify({ stream: "cmb_rum", event: {} })
}), env);
assert(oversized.status === 413, "oversized payload should be rejected");

const options = await worker.fetch(new Request("https://telemetry.example.test", { method: "OPTIONS" }), env);
assert(options.status === 204, "CORS preflight should pass");
assert(options.headers.get("Access-Control-Allow-Methods").includes("POST"), "CORS methods missing POST");

console.log(JSON.stringify({
  status: "PASS",
  checks: 9,
  storedFields: Object.keys(writes[0].value.event),
  retentionDays: 30
}, null, 2));

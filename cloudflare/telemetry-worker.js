export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return withCors(new Response(null, { status: 204 }));
    if (request.method !== "POST") return withCors(new Response("method_not_allowed", { status: 405 }));

    const contentLength = Number(request.headers.get("Content-Length") || 0);
    if (contentLength > 8192) return withCors(new Response("payload_too_large", { status: 413 }));

    let payload;
    try {
      payload = await request.json();
    } catch (error) {
      return withCors(new Response("bad_json", { status: 400 }));
    }

    const stream = String(payload.stream || "");
    if (stream !== "cmb_rum" && stream !== "cmb_ops") {
      return withCors(new Response("invalid_stream", { status: 400 }));
    }

    const event = normalizeEvent(payload.event || {}, stream);
    const record = {
      stream,
      receivedAt: new Date().toISOString(),
      route: event.route,
      eventType: event.eventType,
      event
    };

    if (env.CMB_TELEMETRY) {
      const key = `${stream}:${record.receivedAt}:${crypto.randomUUID()}`;
      await env.CMB_TELEMETRY.put(key, JSON.stringify(record), { expirationTtl: 60 * 60 * 24 * 30 });
    }

    return withCors(Response.json({ ok: true, stream }));
  }
};

function normalizeEvent(input, stream) {
  const eventType = cleanText(input.eventType || input.type || input.name || "unknown", 80);
  const metricName = cleanText(input.metricName || input.type || input.name || eventType, 80);
  const severity = cleanEnum(input.severity || input.level || (stream === "cmb_rum" ? "metric" : "info"), ["info", "warn", "error", "metric"], "info");
  return {
    schema: "cmb.telemetry.safe_event.v1",
    projectId: cleanText(input.projectId || "cmb-inventory-web", 80),
    eventType,
    metricName,
    metricValue: cleanNumber(input.metricValue ?? input.value),
    severity,
    route: cleanRoute(input.route || input.path || ""),
    appVersion: cleanText(input.appVersion || "local", 40),
    happenedAt: cleanIso(input.happenedAt || input.at || input.timestamp),
    anonymousSessionId: cleanToken(input.anonymousSessionId || "", 80),
    proofId: cleanText(input.proofId || "", 80)
  };
}

function cleanText(value, maxLength) {
  return String(value || "")
    .replace(/[^\w .:/#-]/g, "")
    .slice(0, maxLength);
}

function cleanRoute(value) {
  const route = cleanText(value, 160);
  if (!route || route.startsWith("http")) return "/";
  return route;
}

function cleanToken(value, maxLength) {
  return String(value || "")
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .slice(0, maxLength);
}

function cleanEnum(value, allowed, fallback) {
  const normalized = String(value || "").toLowerCase();
  return allowed.includes(normalized) ? normalized : fallback;
}

function cleanNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function cleanIso(value) {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function withCors(response) {
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");
  return new Response(response.body, { status: response.status, headers });
}

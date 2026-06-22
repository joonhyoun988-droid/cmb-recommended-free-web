export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return cors(new Response(null, { status: 204 }));
    }
    if (request.method !== "POST") {
      return cors(new Response("method_not_allowed", { status: 405 }));
    }

    let payload;
    try {
      payload = await request.json();
    } catch (error) {
      return cors(new Response("bad_json", { status: 400 }));
    }

    const stream = payload.stream === "cmb_ops" ? "cmb_ops" : "cmb_rum";
    const event = payload.event || {};
    const stored = {
      stream,
      receivedAt: new Date().toISOString(),
      event
    };

    // Bind a KV namespace named CMB_TELEMETRY to persist events.
    if (env.CMB_TELEMETRY) {
      const key = `${stream}:${stored.receivedAt}:${crypto.randomUUID()}`;
      await env.CMB_TELEMETRY.put(key, JSON.stringify(stored), { expirationTtl: 60 * 60 * 24 * 30 });
    }

    return cors(Response.json({ ok: true, stream }));
  }
};

function cors(response) {
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");
  return new Response(response.body, { status: response.status, headers });
}

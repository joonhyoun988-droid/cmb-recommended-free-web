export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return withCors(new Response(null, { status: 204 }));
    if (request.method !== "POST") return withCors(new Response("method_not_allowed", { status: 405 }));

    let payload;
    try {
      payload = await request.json();
    } catch (error) {
      return withCors(new Response("bad_json", { status: 400 }));
    }

    const stream = payload.stream === "cmb_ops" ? "cmb_ops" : "cmb_rum";
    const event = payload.event || {};
    const record = {
      stream,
      receivedAt: new Date().toISOString(),
      path: event.path || "",
      type: event.type || event.name || "",
      event
    };

    if (env.CMB_TELEMETRY) {
      const key = `${stream}:${record.receivedAt}:${crypto.randomUUID()}`;
      await env.CMB_TELEMETRY.put(key, JSON.stringify(record), { expirationTtl: 60 * 60 * 24 * 30 });
    }

    return withCors(Response.json({ ok: true, stream }));
  }
};

function withCors(response) {
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");
  return new Response(response.body, { status: response.status, headers });
}

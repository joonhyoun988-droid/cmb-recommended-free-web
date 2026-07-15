import { createServer } from "node:http";
import { randomUUID } from "node:crypto";

const MOCK_OPERATOR = { operatorId: "MOCKOP", pin: "8080", name: "모의 작업자", role: "operator" };
const TRANSIENT_FAILURE_TRIGGER_ITEM_CODE = "00007";
const SESSION_TTL_MS = 4 * 60 * 60 * 1000;
const EXPIRED_MESSAGE = "로그인이 만료되었습니다. 다시 로그인하세요.";
const MOCK_LOCATIONS = ["1층 창고", "2층 창고"];
const MOCK_FIELD_KEYS = ["finished", "label", "container", "cap", "pump", "singlebox", "other", "bigbox"];
const MOCK_BUILD_ID = "mock-build-2026-07-15";

function emptyFieldMap() {
  const map = {};
  MOCK_FIELD_KEYS.forEach((key) => { map[key] = 0; });
  return map;
}

function createInventoryStore() {
  const items = new Map();
  function addItem(code, name, field, locationSeed) {
    const locations = {};
    MOCK_LOCATIONS.forEach((location) => {
      locations[location] = Object.assign(emptyFieldMap(), locationSeed[location] || {});
    });
    const stocks = emptyFieldMap();
    MOCK_FIELD_KEYS.forEach((key) => {
      stocks[key] = MOCK_LOCATIONS.reduce((sum, location) => sum + Number(locations[location][key] || 0), 0);
    });
    items.set(code, { code, name, field, stocks, locations });
  }
  // Deliberately distinct from app.js's built-in demo/persisted quantities so a
  // successful server login can be proven to load authoritative mock data.
  addItem("00027", "그린메디 / 20L", "finished", {
    "2층 창고": { finished: 500, label: 400 },
    "1층 창고": { finished: 55, label: 0 }
  });
  addItem("00006", "그린메디 / 4L", "finished", {
    "2층 창고": { finished: 300 },
    "1층 창고": { finished: 20 }
  });
  addItem("00007", "그린메디 / 500ml", "finished", {
    "2층 창고": { finished: 80 },
    "1층 창고": { finished: 8 }
  });
  addItem("00265", "준스랩 ACC 블루 / 500ml", "finished", {
    "2층 창고": { finished: 220 },
    "1층 창고": { finished: 20 }
  });
  return items;
}

function getOrCreateInventoryItem(items, code) {
  if (!items.has(code)) {
    const locations = {};
    MOCK_LOCATIONS.forEach((location) => { locations[location] = emptyFieldMap(); });
    items.set(code, { code, name: code, field: "finished", stocks: emptyFieldMap(), locations });
  }
  return items.get(code);
}

function applyInventoryWrite(items, itemCode, field, warehouse, after) {
  if (!itemCode || MOCK_FIELD_KEYS.indexOf(field) < 0) return;
  const item = getOrCreateInventoryItem(items, itemCode);
  const location = MOCK_LOCATIONS.indexOf(warehouse) >= 0 ? warehouse : MOCK_LOCATIONS[0];
  if (!item.locations[location]) item.locations[location] = emptyFieldMap();
  item.locations[location][field] = Number(after) || 0;
  item.stocks[field] = MOCK_LOCATIONS.reduce((sum, loc) => sum + Number((item.locations[loc] || {})[field] || 0), 0);
}

function serializeInventoryItems(items) {
  return Array.from(items.values()).map((item) => ({
    code: item.code,
    name: item.name,
    field: item.field,
    stocks: Object.assign({}, item.stocks),
    locations: Object.keys(item.locations).reduce((acc, location) => {
      acc[location] = Object.assign({}, item.locations[location]);
      return acc;
    }, {})
  }));
}

export function createMockProviderServer() {
  const sessions = new Map();
  const saveOperationLog = new Map();
  const quickTransactionIds = new Set();
  const inventoryItems = createInventoryStore();
  let saveWriteCount = 0;
  let quickWriteCount = 0;
  let lastRequestBody = null;

  function issueSession() {
    const token = randomUUID() + ":" + randomUUID();
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
    sessions.set(token, { operatorId: MOCK_OPERATOR.operatorId, expiresAt, expired: false });
    return { token, expiresAt };
  }

  function authCredentials(request) {
    const source = request || {};
    const job = source.job || {};
    const auth = source.auth || job.auth || {};
    return {
      operatorId: auth.operatorId || source.operatorId || job.operatorId || "",
      operatorSessionToken: auth.operatorSessionToken || auth.sessionToken || source.operatorSessionToken || source.sessionToken || ""
    };
  }

  function requireSession(request) {
    const auth = authCredentials(request);
    const session = sessions.get(auth.operatorSessionToken);
    if (!session) throw new Error("Server login required");
    if (session.expired || Date.parse(session.expiresAt) <= Date.now()) {
      throw new Error(EXPIRED_MESSAGE);
    }
    return session;
  }

  function handleAuthenticateOperator(request) {
    const operatorId = String(request.operatorId || request.id || "").trim().toUpperCase();
    const pin = String(request.pin || request.operatorPin || "");
    if (operatorId !== MOCK_OPERATOR.operatorId || pin !== MOCK_OPERATOR.pin) {
      throw new Error("작업자 ID 또는 PIN이 맞지 않습니다.");
    }
    const session = issueSession();
    return {
      operator: { operatorId: MOCK_OPERATOR.operatorId, name: MOCK_OPERATOR.name, role: MOCK_OPERATOR.role },
      sessionToken: session.token,
      sessionScope: request.sessionScope || "stock",
      sessionExpiresAt: session.expiresAt
    };
  }

  function handleSaveStockCount(request) {
    requireSession(request);
    const job = request.job || {};
    const operationId = "freeweb:save:" + String(job.id || "");
    if (saveOperationLog.has(operationId)) {
      return {
        saved: true,
        duplicate: true,
        itemCode: job.itemCode,
        field: job.field,
        location: job.warehouse,
        before: job.before,
        after: job.after
      };
    }
    if (job.itemCode === TRANSIENT_FAILURE_TRIGGER_ITEM_CODE && Number(job.attempts) === 1) {
      const err = new Error("Simulated transient server failure");
      err.simulatedTransientFailure = true;
      throw err;
    }
    saveOperationLog.set(operationId, true);
    saveWriteCount += 1;
    applyInventoryWrite(inventoryItems, job.itemCode, job.field, job.warehouse, job.after);
    return {
      saved: true,
      itemCode: job.itemCode,
      field: job.field,
      location: job.warehouse,
      before: job.before,
      after: job.after
    };
  }

  function handleQuickInventoryCommand(request) {
    requireSession(request);
    const job = request.job || {};
    const transactionId = "freeweb:quick:" + String(job.id || "");
    if (quickTransactionIds.has(transactionId)) {
      return { saved: true, duplicate: true, transactionId, itemCode: job.itemCode };
    }
    quickTransactionIds.add(transactionId);
    quickWriteCount += 1;
    applyInventoryWrite(inventoryItems, job.itemCode, job.field, job.warehouse, job.after);
    return {
      saved: true,
      transactionId,
      itemCode: job.itemCode,
      field: job.field,
      location: job.warehouse,
      action: job.delta > 0 ? "produce" : "dispose",
      qty: Math.abs(Number(job.delta || 0))
    };
  }

  function handleGetInventory(request) {
    requireSession(request);
    return {
      items: serializeInventoryItems(inventoryItems),
      locations: MOCK_LOCATIONS.slice(),
      loadedAt: new Date().toISOString(),
      buildId: MOCK_BUILD_ID
    };
  }

  function handleLogoutOperator(request) {
    const auth = authCredentials(request);
    const token = auth.operatorSessionToken;
    const revoked = !!token && sessions.has(token);
    if (revoked) sessions.delete(token);
    return { revoked: revoked ? 1 : 0 };
  }

  function handleMockExpireSession(request) {
    const auth = authCredentials(request);
    const session = sessions.get(auth.operatorSessionToken);
    if (session) session.expired = true;
    return { mockExpired: !!session };
  }

  function handleMockState() {
    return {
      saveWriteCount,
      quickWriteCount,
      sessionCount: sessions.size,
      lastRequestBody,
      inventorySnapshot: serializeInventoryItems(inventoryItems)
    };
  }

  const server = createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "content-type");
    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }
    if (req.method !== "POST") {
      res.writeHead(404, { "content-type": "application/json" });
      res.end(JSON.stringify({ ok: false, error: "Not found" }));
      return;
    }
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", () => {
      let request = {};
      try {
        request = body ? JSON.parse(body) : {};
      } catch (parseErr) {
        res.writeHead(400, { "content-type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: "Invalid JSON" }));
        return;
      }
      const action = String(request.action || "").trim();
      const isRealContractAction = action === "authenticateOperator" || action === "saveStockCount" || action === "quickInventoryCommand";
      if (isRealContractAction) lastRequestBody = request;
      try {
        let result = {};
        if (action === "authenticateOperator") result = handleAuthenticateOperator(request);
        else if (action === "saveStockCount") result = handleSaveStockCount(request);
        else if (action === "quickInventoryCommand") result = handleQuickInventoryCommand(request);
        else if (action === "getInventory") result = handleGetInventory(request);
        else if (action === "logoutOperator") result = handleLogoutOperator(request);
        else if (action === "__mockExpireSession") result = handleMockExpireSession(request);
        else if (action === "__mockState") result = handleMockState();
        else throw new Error("Unsupported action: " + (action || "(empty)"));
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify(Object.assign({ ok: true, action }, result)));
      } catch (err) {
        const status = err && err.simulatedTransientFailure ? 500 : 200;
        res.writeHead(status, { "content-type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: err && err.message ? err.message : String(err) }));
      }
    });
  });

  return {
    server,
    listen(port = 0) {
      return new Promise((resolve) => {
        server.listen(port, "127.0.0.1", () => {
          const address = server.address();
          resolve(`http://127.0.0.1:${address.port}`);
        });
      });
    },
    close() {
      return new Promise((resolve) => server.close(resolve));
    },
    getState: handleMockState,
    mockOperator: MOCK_OPERATOR,
    expiredMessage: EXPIRED_MESSAGE
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const mock = createMockProviderServer();
  const requestedPort = Number(process.argv[2] || 0);
  mock.listen(requestedPort).then((url) => {
    console.log(JSON.stringify({ status: "LISTENING", url }));
  });
}

import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { createMockProviderServer } from "./cmb-mock-provider-server.mjs";

const url = process.argv[2] || "http://127.0.0.1:8767/index.html";
const chromePath = process.argv[3] || "C:\\Users\\joonh\\.browser-driver-manager\\chrome\\win64-149.0.7827.155\\chrome-win64\\chrome.exe";
const profileDir = mkdtempSync(path.join(tmpdir(), "cmb-contract-cdp-"));

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(targetUrl, attempts = 60) {
  let lastError;
  for (let i = 0; i < attempts; i++) {
    try {
      const response = await fetch(targetUrl);
      if (response.ok) return response.json();
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await sleep(250);
  }
  throw lastError || new Error(`Unable to fetch ${targetUrl}`);
}

async function readDevToolsPort(attempts = 80) {
  const activePortPath = path.join(profileDir, "DevToolsActivePort");
  let lastError;
  for (let i = 0; i < attempts; i++) {
    try {
      const port = Number(readFileSync(activePortPath, "utf8").split(/\r?\n/)[0]);
      if (Number.isInteger(port) && port > 0) return port;
      lastError = new Error("Invalid DevToolsActivePort value");
    } catch (error) {
      lastError = error;
    }
    await sleep(250);
  }
  throw lastError || new Error("Chrome did not publish DevToolsActivePort");
}

async function postMock(mockUrl, payload) {
  const response = await fetch(mockUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });
  return response.json();
}

class CdpClient {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.messageEvents = 0;
    this.lastMessageType = "none";
    this.closeCode = null;
    ws.addEventListener("message", (event) => {
      this.messageEvents += 1;
      this.lastMessageType = typeof event.data;
      const message = JSON.parse(event.data);
      if (message.id && this.pending.has(message.id)) {
        const { resolve, reject } = this.pending.get(message.id);
        this.pending.delete(message.id);
        if (message.error) reject(new Error(message.error.message || "CDP error"));
        else resolve(message.result || {});
      }
    });
    ws.addEventListener("close", (event) => { this.closeCode = event.code; });
  }

  send(method, params = {}) {
    const id = ++this.id;
    const promise = new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`CDP timeout: ${method}; readyState=${this.ws.readyState}; messages=${this.messageEvents}; lastType=${this.lastMessageType}; closeCode=${this.closeCode}`));
        }
      }, 10000);
    });
    this.ws.send(JSON.stringify({ id, method, params }));
    return promise;
  }
}

async function evalInPage(client, expression) {
  const result = await client.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true
  });
  if (result.exceptionDetails) {
    const details = result.exceptionDetails.exception?.description || result.exceptionDetails.text || "Runtime exception";
    throw new Error(details);
  }
  return result.result?.value;
}

const pageHelpers = `
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const q = (selector) => document.querySelector(selector);
  const setValue = (selector, value) => {
    const el = q(selector);
    if (!el) throw new Error("Missing selector " + selector);
    el.value = value;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  };
  const click = (selector) => {
    const el = q(selector);
    if (!el) throw new Error("Missing selector " + selector);
    el.click();
  };
`;

async function runScenarios(client, mockUrl) {
  const scenarios = [];

  // 1. authenticateOperator success and {ok:false} rejection (direct HTTP, no browser)
  const authOk = await postMock(mockUrl, { action: "authenticateOperator", operatorId: "MOCKOP", pin: "8080", sessionScope: "stock" });
  const authBad = await postMock(mockUrl, { action: "authenticateOperator", operatorId: "MOCKOP", pin: "0000", sessionScope: "stock" });
  scenarios.push({
    name: "authenticateOperator success + rejection",
    passed: authOk.ok === true && !!authOk.sessionToken && authBad.ok === false && typeof authBad.error === "string",
    detail: { authOk, authBad }
  });

  // 7. getInventory requires a valid session (direct HTTP, no browser)
  const unauthGetInventory = await postMock(mockUrl, { action: "getInventory", auth: { operatorSessionToken: "not-a-real-token" } });
  scenarios.push({
    name: "getInventory rejects an unauthenticated/invalid session",
    passed: unauthGetInventory.ok === false && typeof unauthGetInventory.error === "string",
    detail: { unauthGetInventory }
  });

  // 8. logoutOperator revokes the session exactly once and blocks a later authenticated read (direct HTTP)
  const freshAuth = await postMock(mockUrl, { action: "authenticateOperator", operatorId: "MOCKOP", pin: "8080", sessionScope: "stock" });
  const firstLogout = await postMock(mockUrl, { action: "logoutOperator", auth: { operatorSessionToken: freshAuth.sessionToken } });
  const secondLogout = await postMock(mockUrl, { action: "logoutOperator", auth: { operatorSessionToken: freshAuth.sessionToken } });
  const readAfterLogout = await postMock(mockUrl, { action: "getInventory", auth: { operatorSessionToken: freshAuth.sessionToken } });
  scenarios.push({
    name: "logoutOperator revokes the session and blocks a later authenticated read",
    passed: freshAuth.ok === true && firstLogout.revoked === 1 && secondLogout.revoked === 0
      && readAfterLogout.ok === false && typeof readAfterLogout.error === "string",
    detail: { firstLogout, secondLogout, readAfterLogout }
  });

  // 4. Replay of the same job ID without a duplicate business write (direct HTTP, saveStockCount + quickInventoryCommand)
  const saveAuth = { operatorId: authOk.operator.operatorId, operatorSessionToken: authOk.sessionToken };
  const replaySaveJob = { id: "contract-replay-save-1", itemCode: "00159", field: "완제품(창고)", warehouse: "1층 창고", before: 10, after: 12, label: "재고 실사 저장", attempts: 2 };
  const firstSave = await postMock(mockUrl, { action: "saveStockCount", job: replaySaveJob, auth: saveAuth });
  const secondSave = await postMock(mockUrl, { action: "saveStockCount", job: replaySaveJob, auth: saveAuth });
  const replayQuickJob = { id: "contract-replay-quick-1", itemCode: "00220", field: "완제품(창고)", warehouse: "1층 창고", before: 5, after: 7, delta: 2, attempts: 2 };
  const firstQuick = await postMock(mockUrl, { action: "quickInventoryCommand", job: replayQuickJob, auth: saveAuth });
  const secondQuick = await postMock(mockUrl, { action: "quickInventoryCommand", job: replayQuickJob, auth: saveAuth });
  const stateAfterReplay = await postMock(mockUrl, { action: "__mockState" });
  scenarios.push({
    name: "replay of same job ID does not duplicate business write",
    passed: firstSave.ok && !firstSave.duplicate && secondSave.ok && secondSave.duplicate === true
      && firstQuick.ok && !firstQuick.duplicate && secondQuick.ok && secondQuick.duplicate === true
      && stateAfterReplay.saveWriteCount === 1 && stateAfterReplay.quickWriteCount === 1,
    detail: { firstSave, secondSave, firstQuick, secondQuick, stateAfterReplay }
  });

  await client.send("Page.enable");
  await client.send("Runtime.enable");
  await client.send("Page.navigate", { url });
  await sleep(1500);

  // Point the app at the mock provider before doing anything else.
  await evalInPage(client, `
    (() => {
      localStorage.clear();
      localStorage.setItem("cmb.free.web.endpoint.v1", ${JSON.stringify(mockUrl)});
      return true;
    })()
  `);
  await client.send("Page.navigate", { url });
  await sleep(1500);

  // 2. saveStockCount success (browser-driven)
  const step2 = await evalInPage(client, `
    (async () => {
      ${pageHelpers}
      click("#loginToggle");
      await wait(150);
      setValue("#operatorIdInput", "MOCKOP");
      setValue("#pinInput", "8080");
      click("#loginForm button[type='submit']");
      await wait(400);
      const operatorText = q("#operatorLabel")?.textContent || "";
      const loginToastText = q("#toast")?.textContent || "";

      setValue("#searchInput", "00027");
      await wait(250);
      const inventoryBeforeSaveText = q('[data-code="00027"] .count-values')?.textContent || "";
      setValue('[data-count="00027"]', "950");
      click('[data-save="00027"]');
      await wait(700);
      const saveToastText = q("#toast")?.textContent || "";
      const queueAfterSave = q("#queueBadge")?.textContent || "";
      const inventoryAfterSaveText = q('[data-code="00027"] .count-values')?.textContent || "";
      const tokenAfterLogin = JSON.parse(localStorage.getItem("cmb.free.web.operator.v1") || "null")?.sessionToken || "";

      return { operatorText, loginToastText, saveToastText, queueAfterSave, inventoryBeforeSaveText, inventoryAfterSaveText, tokenAfterLogin };
    })()
  `);
  scenarios.push({
    name: "authenticateOperator + saveStockCount success (browser)",
    passed: step2.operatorText.includes("MOCKOP") && step2.saveToastText.includes("완료") && step2.queueAfterSave.startsWith("0"),
    detail: step2
  });

  // 9. browser login loads authoritative mock quantities, not pre-existing demo/persisted quantities
  const authoritativeLoaded = step2.inventoryBeforeSaveText.includes("555")
    && step2.inventoryBeforeSaveText.includes("500")
    && !step2.inventoryBeforeSaveText.includes("906")
    && !step2.inventoryBeforeSaveText.includes("900");
  scenarios.push({
    name: "browser login loads authoritative mock quantities, not pre-existing demo quantities",
    passed: authoritativeLoaded,
    detail: { inventoryBeforeSaveText: step2.inventoryBeforeSaveText }
  });

  // 10. save write refreshes authoritative inventory in the browser after a successful server write
  const clientRefreshedAfterWrite = step2.inventoryAfterSaveText.includes("1,005") && step2.inventoryAfterSaveText.includes("950");
  scenarios.push({
    name: "save write refreshes authoritative inventory in the browser",
    passed: clientRefreshedAfterWrite && step2.queueAfterSave.startsWith("0"),
    detail: { inventoryAfterSaveText: step2.inventoryAfterSaveText }
  });

  // 11. saveStockCount write actually updates the mock's authoritative inventory (server-side proof)
  const postWriteInventory = await postMock(mockUrl, { action: "getInventory", auth: { operatorSessionToken: step2.tokenAfterLogin } });
  const item00027AfterWrite = (postWriteInventory.items || []).find((entry) => entry.code === "00027") || {};
  scenarios.push({
    name: "saveStockCount write updates the mock's authoritative inventory (server-side)",
    passed: postWriteInventory.ok === true
      && item00027AfterWrite.stocks && item00027AfterWrite.stocks.finished === 1005
      && item00027AfterWrite.locations && item00027AfterWrite.locations["2층 창고"] && item00027AfterWrite.locations["2층 창고"].finished === 950,
    detail: { postWriteInventory }
  });

  // 12. no configured-endpoint mutation can occur before live inventory readiness
  const step9 = await evalInPage(client, `
    (async () => {
      ${pageHelpers}
      setValue("#searchInput", "00006");
      await wait(200);
      liveInventory = { endpoint: "", sessionToken: "", ready: false };
      const before = q('[data-code="00006"] .count-values')?.textContent || "";
      setValue('[data-count="00006"]', "999");
      click('[data-save="00006"]');
      await wait(300);
      const toastText = q("#toast")?.textContent || "";
      const queueBadge = q("#queueBadge")?.textContent || "";
      const after = q('[data-code="00006"] .count-values')?.textContent || "";
      const restored = await fetchLiveInventory();
      return { toastText, queueBadge, before, after, restored };
    })()
  `);
  scenarios.push({
    name: "no configured-endpoint mutation before live inventory readiness",
    passed: step9.toastText.includes("먼저 불러와야") && step9.queueBadge.startsWith("0")
      && step9.before === step9.after && step9.restored === true,
    detail: step9
  });

  // 3. Retry after a network/server failure without losing the queued job (item 00007 is the mock's transient-failure trigger)
  const step3a = await evalInPage(client, `
    (async () => {
      ${pageHelpers}
      setValue("#searchInput", "00007");
      await wait(250);
      setValue('[data-count="00007"]', "77");
      click('[data-save="00007"]');
      await wait(500);
      return {
        toastText: q("#toast")?.textContent || "",
        queueBadge: q("#queueBadge")?.textContent || "",
        queueListText: q("#queueList")?.textContent || ""
      };
    })()
  `);
  const notLostAfterFailure = step3a.queueBadge.startsWith("1") && step3a.queueListText.includes("retry") && step3a.toastText.includes("실패");

  const step3b = await evalInPage(client, `
    (async () => {
      ${pageHelpers}
      click("#flushNowBtn");
      await wait(800);
      return { toastText: q("#toast")?.textContent || "", queueBadge: q("#queueBadge")?.textContent || "" };
    })()
  `);
  scenarios.push({
    name: "retry after transient failure keeps job queued then succeeds",
    passed: notLostAfterFailure && step3b.queueBadge.startsWith("0") && step3b.toastText.includes("완료"),
    detail: { step3a, step3b }
  });

  // 5. Expired-session rejection followed by a clear re-login recovery path
  const tokenBeforeExpiry = await evalInPage(client, `
    (() => JSON.parse(localStorage.getItem("cmb.free.web.operator.v1") || "null")?.sessionToken || "")()
  `);
  const expireResult = await postMock(mockUrl, { action: "__mockExpireSession", auth: { operatorSessionToken: tokenBeforeExpiry } });

  const step5a = await evalInPage(client, `
    (async () => {
      ${pageHelpers}
      setValue("#searchInput", "00265");
      await wait(250);
      setValue('[data-count="00265"]', "20");
      click('[data-save="00265"]');
      await wait(500);
      const operatorAfter = JSON.parse(localStorage.getItem("cmb.free.web.operator.v1") || "null");
      return {
        toastText: q("#toast")?.textContent || "",
        queueBadge: q("#queueBadge")?.textContent || "",
        queueListText: q("#queueList")?.textContent || "",
        sessionTokenCleared: !operatorAfter?.sessionToken
      };
    })()
  `);
  const expiryHandledClearly = step5a.toastText.includes("로그인이 만료") && step5a.queueBadge.startsWith("1")
    && step5a.queueListText.includes("needs-login") && step5a.sessionTokenCleared;

  const step5b = await evalInPage(client, `
    (async () => {
      ${pageHelpers}
      click("#loginToggle");
      await wait(150);
      setValue("#operatorIdInput", "MOCKOP");
      setValue("#pinInput", "8080");
      click("#loginForm button[type='submit']");
      await wait(900);
      return { toastText: q("#toast")?.textContent || "", queueBadge: q("#queueBadge")?.textContent || "" };
    })()
  `);
  scenarios.push({
    name: "expired-session rejection + clear re-login recovery",
    passed: expireResult.mockExpired === true && expiryHandledClearly && step5b.queueBadge.startsWith("0"),
    detail: { tokenBeforeExpiry: !!tokenBeforeExpiry, expireResult, step5a, step5b }
  });

  // 6. quickInventoryCommand request shape (browser-driven, then read the mock's captured last request)
  const step6 = await evalInPage(client, `
    (async () => {
      ${pageHelpers}
      setValue("#quickCommandInput", "그린자임 4리터 2개 생산");
      click("#quickCommandForm button[type='submit']");
      await wait(200);
      click("#quickCommandApplyBtn");
      await wait(800);
      return { toastText: q("#toast")?.textContent || "", queueBadge: q("#queueBadge")?.textContent || "" };
    })()
  `);
  const mockStateAfterQuick = await postMock(mockUrl, { action: "__mockState" });
  const lastBody = mockStateAfterQuick.lastRequestBody || {};
  const lastJob = lastBody.job || {};
  const quickShapeOk = lastBody.action === "quickInventoryCommand"
    && typeof lastJob.itemCode === "string" && lastJob.itemCode.length > 0
    && typeof lastJob.field === "string"
    && typeof lastJob.warehouse === "string"
    && Number.isFinite(lastJob.before)
    && Number.isFinite(lastJob.after)
    && Number.isFinite(lastJob.delta)
    && !!lastBody.auth && typeof lastBody.auth.operatorSessionToken === "string" && lastBody.auth.operatorSessionToken.length > 0;
  scenarios.push({
    name: "quickInventoryCommand request shape matches Code.gs contract",
    passed: quickShapeOk && step6.queueBadge.startsWith("0"),
    detail: { step6, lastBody }
  });

  // 13. saving a new endpoint through the UI revokes the old server session (session-revoke fix)
  const secondMock = createMockProviderServer();
  const mockUrl2 = await secondMock.listen(0);
  const step8 = await evalInPage(client, `
    (async () => {
      ${pageHelpers}
      const tokenBeforeChange = JSON.parse(localStorage.getItem("cmb.free.web.operator.v1") || "null")?.sessionToken || "";

      // Saving the same endpoint must not touch the local session.
      setValue("#endpointInput", ${JSON.stringify(mockUrl)});
      click("#saveEndpointBtn");
      await wait(300);
      const operatorAfterSameEndpointSave = q("#operatorLabel")?.textContent || "";
      const storedOperatorAfterSameEndpointSave = JSON.parse(localStorage.getItem("cmb.free.web.operator.v1") || "null");
      const sameEndpointSessionPreserved = operatorAfterSameEndpointSave.includes("MOCKOP")
        && storedOperatorAfterSameEndpointSave?.sessionToken === tokenBeforeChange;

      setValue("#endpointInput", ${JSON.stringify(mockUrl2)});
      click("#saveEndpointBtn");
      await wait(500);
      const operatorAfterChange = q("#operatorLabel")?.textContent || "";
      const storedOperator = JSON.parse(localStorage.getItem("cmb.free.web.operator.v1") || "null");
      return { tokenBeforeChange, sameEndpointSessionPreserved, operatorAfterChange, sessionCleared: !storedOperator };
    })()
  `);
  const oldEndpointReadAfterChange = await postMock(mockUrl, { action: "getInventory", auth: { operatorSessionToken: step8.tokenBeforeChange } });
  scenarios.push({
    name: "saving a new endpoint through the UI revokes the old server session",
    passed: !!step8.tokenBeforeChange && step8.sameEndpointSessionPreserved
      && step8.operatorAfterChange.includes("로그인 필요") && step8.sessionCleared
      && oldEndpointReadAfterChange.ok === false && typeof oldEndpointReadAfterChange.error === "string",
    detail: { step8, oldEndpointReadAfterChange }
  });
  await secondMock.close();

  // Restore the original mock endpoint and re-login so the remaining scenarios can proceed.
  await evalInPage(client, `
    (async () => {
      ${pageHelpers}
      setValue("#endpointInput", ${JSON.stringify(mockUrl)});
      click("#saveEndpointBtn");
      await wait(300);
      click("#loginToggle");
      await wait(150);
      setValue("#operatorIdInput", "MOCKOP");
      setValue("#pinInput", "8080");
      click("#loginForm button[type='submit']");
      await wait(900);
      return true;
    })()
  `);

  // 14. logout best-effort revokes the server session and a later authenticated read with that token fails
  const step7 = await evalInPage(client, `
    (async () => {
      ${pageHelpers}
      const tokenBeforeLogout = JSON.parse(localStorage.getItem("cmb.free.web.operator.v1") || "null")?.sessionToken || "";
      click("#logoutBtn");
      await wait(500);
      const operatorAfterLogout = q("#operatorLabel")?.textContent || "";
      const storedOperator = JSON.parse(localStorage.getItem("cmb.free.web.operator.v1") || "null");
      return { tokenBeforeLogout, operatorAfterLogout, sessionCleared: !storedOperator };
    })()
  `);
  const postLogoutRead = await postMock(mockUrl, { action: "getInventory", auth: { operatorSessionToken: step7.tokenBeforeLogout } });
  scenarios.push({
    name: "logout revokes the server session and a later authenticated read fails",
    passed: !!step7.tokenBeforeLogout && step7.operatorAfterLogout.includes("로그인 필요") && step7.sessionCleared
      && postLogoutRead.ok === false && typeof postLogoutRead.error === "string",
    detail: { step7, postLogoutRead }
  });

  return scenarios;
}

const chrome = spawn(chromePath, [
  "--headless=new",
  "--disable-gpu",
  "--no-first-run",
  "--no-default-browser-check",
  "--remote-debugging-port=0",
  "--remote-allow-origins=*",
  `--user-data-dir=${profileDir}`,
  "about:blank"
], { stdio: "ignore" });

let exitCode = 0;
const mock = createMockProviderServer();
try {
  const mockUrl = await mock.listen(0);
  const port = await readDevToolsPort();
  let page;
  for (let i = 0; i < 40; i++) {
    const pages = await fetchJson(`http://127.0.0.1:${port}/json`);
    page = pages.find((entry) => entry.type === "page" && entry.webSocketDebuggerUrl);
    if (page) break;
    await sleep(250);
  }
  if (!page?.webSocketDebuggerUrl) throw new Error("No page websocket found");
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", reject, { once: true });
    setTimeout(() => reject(new Error("WebSocket open timeout")), 10000);
  });
  const client = new CdpClient(ws);
  const scenarios = await runScenarios(client, mockUrl);
  ws.close();

  const failed = scenarios.filter((scenario) => !scenario.passed);
  const output = {
    status: failed.length ? "FAIL" : "PASS",
    passedScenarios: scenarios.length - failed.length,
    failedScenarios: failed.length,
    checkedAt: new Date().toISOString(),
    mockUrl,
    scenarios
  };
  console.log(JSON.stringify(output, null, 2));
  if (failed.length) exitCode = 1;
} catch (error) {
  exitCode = 1;
  console.log(JSON.stringify({
    status: "FAIL",
    passedScenarios: 0,
    failedScenarios: 1,
    checkedAt: new Date().toISOString(),
    error: `${error.message}; chromeExit=${chrome.exitCode}; chromeSignal=${chrome.signalCode}`
  }, null, 2));
} finally {
  chrome.kill();
  await sleep(250);
  try { rmSync(profileDir, { recursive: true, force: true }); } catch {}
  await mock.close();
}

process.exit(exitCode);

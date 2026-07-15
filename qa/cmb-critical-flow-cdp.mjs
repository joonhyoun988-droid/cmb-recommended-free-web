import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const url = process.argv[2] || "http://127.0.0.1:8767/index.html";
const chromePath = process.argv[3] || "C:\\Users\\joonh\\.browser-driver-manager\\chrome\\win64-149.0.7827.155\\chrome-win64\\chrome.exe";
const profileDir = mkdtempSync(path.join(tmpdir(), "cmb-cdp-"));

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

class CdpClient {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    ws.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.id && this.pending.has(message.id)) {
        const { resolve, reject } = this.pending.get(message.id);
        this.pending.delete(message.id);
        if (message.error) reject(new Error(message.error.message || "CDP error"));
        else resolve(message.result || {});
      }
    });
  }

  send(method, params = {}) {
    const id = ++this.id;
    const promise = new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`CDP timeout: ${method}`));
        }
      }, 10000);
    });
    this.ws.send(JSON.stringify({ id, method, params }));
    return promise;
  }
}

async function runScenario(client) {
  await client.send("Page.enable");
  await client.send("Runtime.enable");
  await client.send("Page.navigate", { url });
  await sleep(1500);

  const expression = `
    (async () => {
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

      localStorage.clear();
      await wait(150);
      if (!q("#searchInput") || !q("#countList")) throw new Error("Core controls not rendered");

      click("#loginToggle");
      await wait(150);
      setValue("#operatorIdInput", "DEMO01");
      setValue("#pinInput", "0000");
      click("#loginForm button[type='submit']");
      await wait(250);
      const operatorText = q("#operatorLabel")?.textContent || "";
      if (!operatorText.includes("DEMO01")) throw new Error("Login did not update operator label");

      setValue("#searchInput", "00027");
      await wait(250);
      if (!q('[data-code="00027"]')) throw new Error("Search did not reveal item 00027");

      setValue('[data-count="00027"]', "901");
      click('[data-save="00027"]');
      await wait(450);

      let auditText = q("#auditList")?.textContent || "";
      const auditCount = q("#auditCount")?.textContent || "";
      const latencyText = q("#kpiLatency")?.textContent || "";
      if (!auditText.includes("00027")) throw new Error("Audit log does not include item 00027");
      if (/^0/.test(auditCount)) throw new Error("Audit count did not change");

      setValue("#quickCommandInput", "그린자임 4리터 2개 생산");
      click("#quickCommandForm button[type='submit']");
      await wait(200);
      const previewText = q("#quickCommandPreview")?.textContent || "";
      if (!previewText.includes("00006") || !previewText.includes("생산 입고")) {
        throw new Error("Quick command preview did not resolve Greenzyme 4L production");
      }
      click("#quickCommandApplyBtn");
      await wait(350);
      auditText = q("#auditList")?.textContent || "";
      if (!auditText.includes("00006") || !auditText.includes("생산 입고")) {
        throw new Error("Quick command audit log was not recorded");
      }

      setValue("#quickCommandInput", "그린자임 4리터 2개 불량 처리");
      click("#quickCommandForm button[type='submit']");
      await wait(200);
      const defectPreview = q("#quickCommandPreview")?.textContent || "";
      if (!defectPreview.includes("불량 보류") || !defectPreview.includes("불량")) {
        throw new Error("Quick command defect preview did not move stock to defect");
      }
      click("#quickCommandApplyBtn");
      await wait(350);
      auditText = q("#auditList")?.textContent || "";
      if (!auditText.includes("00006") || !auditText.includes("불량 보류")) {
        throw new Error("Quick command defect audit log was not recorded");
      }

      setValue("#quickCommandInput", "그린자임 4리터 삼십개 생산");
      click("#quickCommandForm button[type='submit']");
      await wait(200);
      const koreanQuantityPreview = q("#quickCommandPreview")?.textContent || "";
      if (!koreanQuantityPreview.includes("한글 수량") || !q("#quickCommandApplyBtn")?.disabled) {
        throw new Error("Korean quantity should be blocked instead of using the 4L size as quantity");
      }

      setValue("#quickCommandInput", "그린자임 4리터 2개 생산하고 라벨 2개 입고");
      click("#quickCommandForm button[type='submit']");
      await wait(200);
      const multiCommandPreview = q("#quickCommandPreview")?.textContent || "";
      if (!multiCommandPreview.includes("한 문장에는 작업 하나만") || !q("#quickCommandApplyBtn")?.disabled) {
        throw new Error("Multiple quantities/actions in one sentence should be blocked");
      }

      q("#searchInput").focus();
      document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
      const activeId = document.activeElement?.id || "";

      return {
        operatorText,
        auditCount,
        latencyText,
        quickCommand: previewText,
        defectCommand: defectPreview,
        koreanQuantityPreview,
        multiCommandPreview,
        activeId,
        itemVisible: Boolean(q('[data-code="00027"]')),
        passed: true
      };
    })()
  `;

  const result = await client.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true
  });
  if (result.exceptionDetails) {
    const details = result.exceptionDetails.exception?.description || result.exceptionDetails.text || "Runtime exception";
    throw new Error(details);
  }
  return result.result?.value || { passed: false, error: "No result value" };
}

const chrome = spawn(chromePath, [
  "--headless=new",
  "--disable-gpu",
  "--no-sandbox",
  "--no-first-run",
  "--no-default-browser-check",
  "--remote-debugging-port=0",
  "--remote-allow-origins=*",
  `--user-data-dir=${profileDir}`,
  "about:blank"
], { stdio: "ignore" });

let exitCode = 0;
try {
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
  const scenario = await runScenario(client);
  ws.close();
  const output = {
    status: scenario.passed ? "PASS" : "FAIL",
    passedScenarios: scenario.passed ? 9 : 0,
    failedScenarios: scenario.passed ? 0 : 1,
    checkedAt: new Date().toISOString(),
    scenario
  };
  console.log(JSON.stringify(output, null, 2));
  if (!scenario.passed) exitCode = 1;
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
}

process.exit(exitCode);

import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const baseUrl = process.argv[2] || "http://127.0.0.1:8767/index.html";
const chromePath = process.argv[3] || "C:\\Users\\joonh\\.browser-driver-manager\\chrome\\win64-149.0.7827.155\\chrome-win64\\chrome.exe";
const rootUrl = new URL(baseUrl);
const origin = `${rootUrl.protocol}//${rootUrl.host}`;
const port = 9700 + Math.floor(Math.random() * 300);
const profileDir = mkdtempSync(path.join(tmpdir(), "cmb-platform-cdp-"));

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
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`CDP timeout: ${method}`));
        }
      }, 10000);
    });
  }
}

async function evaluatePage(client, pageUrl, expression) {
  await client.send("Page.navigate", { url: pageUrl });
  await sleep(900);
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

async function runScenario(client) {
  await client.send("Page.enable");
  await client.send("Runtime.enable");

  const dashboard = await evaluatePage(client, `${origin}/platform-dashboard.html`, `
    (() => {
      const text = document.body.innerText;
      return {
        title: document.title,
        hasRadar: text.includes("Free toolchain radar"),
        hasRequiredRuleset: text.includes("Required ruleset"),
        hasComponentLink: Boolean(document.querySelector('a[href="./component-workshop.html"]'))
      };
    })()
  `);
  if (!dashboard.hasRadar || !dashboard.hasRequiredRuleset || !dashboard.hasComponentLink) {
    throw new Error("Platform dashboard scenario failed");
  }

  const workshop = await evaluatePage(client, `${origin}/component-workshop.html`, `
    (() => {
      const text = document.body.innerText;
      return {
        title: document.title,
        hasTokens: text.includes("Design Tokens"),
        hasButtons: text.includes("Buttons"),
        hasAccessibility: text.includes("Accessibility rules")
      };
    })()
  `);
  if (!workshop.hasTokens || !workshop.hasButtons || !workshop.hasAccessibility) {
    throw new Error("Component workshop scenario failed");
  }

  const telemetry = await evaluatePage(client, `${origin}/index.html`, `
    (() => {
      return {
        rumReady: document.documentElement.dataset.cmbRumClient === "ready",
        opsReady: document.documentElement.dataset.cmbOpsClient === "ready",
        sentryDisabled: document.documentElement.dataset.cmbSentry === "disabled",
        rumEndpointConfigured: Boolean(window.CMBRUM && window.CMBRUM.snapshot().endpointConfigured),
        opsEndpointConfigured: Boolean(window.CMBOps && window.CMBOps.snapshot().endpointConfigured)
      };
    })()
  `);
  if (!telemetry.rumReady || !telemetry.opsReady || !telemetry.sentryDisabled) {
    throw new Error("Telemetry bridge scenario failed");
  }
  if (telemetry.rumEndpointConfigured || telemetry.opsEndpointConfigured) {
    throw new Error("Telemetry endpoint should be disabled by default");
  }

  return { dashboard, workshop, telemetry, passed: true };
}

const chrome = spawn(chromePath, [
  "--headless=new",
  "--disable-gpu",
  "--no-first-run",
  "--no-default-browser-check",
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profileDir}`,
  "about:blank"
], { stdio: "ignore" });

let exitCode = 0;
try {
  const pages = await fetchJson(`http://127.0.0.1:${port}/json`);
  const page = pages.find((entry) => entry.type === "page") || pages[0];
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
  console.log(JSON.stringify({
    status: "PASS",
    passedScenarios: 3,
    failedScenarios: 0,
    checkedAt: new Date().toISOString(),
    scenario
  }, null, 2));
} catch (error) {
  exitCode = 1;
  console.log(JSON.stringify({
    status: "FAIL",
    passedScenarios: 0,
    failedScenarios: 1,
    checkedAt: new Date().toISOString(),
    error: error.message
  }, null, 2));
} finally {
  chrome.kill();
  await sleep(250);
  try { rmSync(profileDir, { recursive: true, force: true }); } catch {}
}

process.exit(exitCode);

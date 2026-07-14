import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const url = process.argv[2] || "http://127.0.0.1:8767/index.html";
const chromePath = process.argv[3];
const outPath = process.argv[4];
const width = parseInt(process.argv[5] || "1440", 10);
const height = parseInt(process.argv[6] || "980", 10);
const isMobile = process.argv[7] === "mobile";

if (!chromePath || !outPath) {
  console.error("Usage: cmb-screenshot-cdp.mjs <url> <chromePath> <outPath> <width> <height> [mobile]");
  process.exit(2);
}

const port = 9700 + Math.floor(Math.random() * 300);
const profileDir = mkdtempSync(path.join(tmpdir(), "cmb-shot-"));

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
      }, 15000);
    });
  }
}

async function main() {
  const chrome = spawn(chromePath, [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profileDir}`,
    "about:blank"
  ], { stdio: "ignore" });

  try {
    const targets = await fetchJson(`http://127.0.0.1:${port}/json/list`);
    const target = targets.find((t) => t.type === "page") || targets[0];
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.addEventListener("open", resolve, { once: true });
      ws.addEventListener("error", reject, { once: true });
    });
    const client = new CdpClient(ws);

    await client.send("Page.enable");
    await client.send("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: isMobile
    });
    await client.send("Page.navigate", { url });
    await sleep(1500);

    const { data } = await client.send("Page.captureScreenshot", { format: "png" });
    writeFileSync(outPath, Buffer.from(data, "base64"));

    ws.close();
    console.log(JSON.stringify({ status: "PASS", outPath, width, height, mobile: isMobile }));
  } finally {
    const exited = new Promise((resolve) => {
      if (chrome.exitCode !== null) { resolve(); return; }
      chrome.once("exit", resolve);
      setTimeout(resolve, 3000);
    });
    chrome.kill();
    await exited;
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        rmSync(profileDir, { recursive: true, force: true });
        break;
      } catch (cleanupError) {
        if (attempt === 4) {
          console.error(`Warning: could not remove temp profile dir ${profileDir}: ${cleanupError.message}`);
          break;
        }
        await sleep(300);
      }
    }
  }
}

main().catch((error) => {
  console.error(JSON.stringify({ status: "FAIL", error: error.message }));
  process.exit(1);
});

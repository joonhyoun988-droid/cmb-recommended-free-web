import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const trustedFn = source.match(/function isTrustedAppsScriptEndpoint[\s\S]*?\n}/)?.[0];
const bootstrapFn = source.match(/function bootstrapEndpointFromQuery[\s\S]*?\n}/)?.[0];
assert.ok(trustedFn && bootstrapFn, "endpoint bootstrap functions must exist");

const stored = new Map();
let replacedUrl = "";
const context = vm.createContext({
  URL,
  URLSearchParams,
  ENDPOINT_KEY: "cmb.free.web.endpoint.v1",
  document: { title: "CMB" },
  localStorage: { setItem: (key, value) => stored.set(key, value) },
  window: {
    location: { search: "", pathname: "/", hash: "" },
    history: { replaceState: (_state, _title, url) => { replacedUrl = url; } }
  }
});
vm.runInContext(`${trustedFn}\n${bootstrapFn}`, context);

const trusted = "https://script.google.com/macros/s/AKfycb_test-123/exec";
assert.equal(vm.runInContext(`isTrustedAppsScriptEndpoint(${JSON.stringify(trusted)})`, context), true);
assert.equal(vm.runInContext("isTrustedAppsScriptEndpoint('http://script.google.com/macros/s/x/exec')", context), false);
assert.equal(vm.runInContext("isTrustedAppsScriptEndpoint('https://evil.example/macros/s/x/exec')", context), false);
assert.equal(vm.runInContext("isTrustedAppsScriptEndpoint('https://script.google.com/macros/s/x/dev')", context), false);

context.window.location.search = `?endpoint=${encodeURIComponent(trusted)}&view=count`;
context.window.location.pathname = "/index.html";
context.window.location.hash = "#stock";
vm.runInContext("bootstrapEndpointFromQuery()", context);
assert.equal(stored.get("cmb.free.web.endpoint.v1"), trusted);
assert.equal(replacedUrl, "/index.html?view=count#stock");

stored.clear();
context.window.location.search = "?endpoint=https%3A%2F%2Fevil.example%2Fcollect";
vm.runInContext("bootstrapEndpointFromQuery()", context);
assert.equal(stored.size, 0);

console.log(JSON.stringify({
  status: "PASS",
  checks: [
    "accepts only HTTPS script.google.com production exec URLs",
    "rejects HTTP, foreign hosts, and dev endpoints",
    "stores a trusted endpoint once",
    "removes endpoint from the visible URL",
    "preserves unrelated query state and hash"
  ]
}, null, 2));

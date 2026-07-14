# CLAUDE Implementation Plan: CMB First Collaborative Product Pass

Status: `PLAN_ONLY` for Change 1 and Change 2 — no product code (`index.html`, `styles.css`, `app.js`) touched. Change 3 (offline screenshot route) was reviewed, approved, implemented, run, and reported separately in `CLAUDE_HANDOFF_REPORT.md`.

**Revision note (per `CODEX_PLAN_REVIEW.md`, decision `APPROVED_WITH_REQUIRED_CHANGES`):** the original Change 1 design (CSS `order` inside a media query) is rejected and replaced below. Reason: `order` decouples visual position from DOM/keyboard/screen-reader order, which `VERIFY.md` requires not to regress. §2 is a full redesign, not a patch of the old section.
Source order: `CLAUDE_WORK_ORDER.md`
Inputs read: `CLAUDE.md`, `CLAUDE_WORK_ORDER.md`, `VERIFY.md`, `README.md`, `DESIGN_BRIEF.md`, `DESIGN_QUALITY_SCORECARD.md`, `DESIGN_TOKENS.md`, `DESIGN_REFERENCE_AUTOCOLLECT.md`, `index.html`, `styles.css`, `app.js`, `run_cmb_frontend_proof_stack.ps1`, `qa/cmb-critical-flow-cdp.mjs`, `package.json`.

This plan covers the three changes in `CLAUDE_WORK_ORDER.md`. No file listed as off-limits in `CLAUDE.md` (`index.html`, `styles.css`, `app.js`, QA scripts, deployment files, telemetry files) will be edited until this plan is reviewed and approved.

---

## 1. Exact files proposed for change

| File | Change type | Reason | Status |
|---|---|---|---|
| `index.html` | Edit — move `#workbench` block; move `.mobile-panel` before `.inventory-panel` | Mobile field-first DOM reorder (Change 1) | Proposed, not yet implemented |
| `app.js` | Edit — add post-login focus move in `login()`, 2 call sites | Immediate keyboard landing in `#searchInput` (Change 1) | Proposed, not yet implemented |
| `styles.css` | Edit — delete `order: -1`/`order: 1` pair at old `:1264-1270` (Change 1); topbar gradient token substitution at `:237-238` (Change 2) | No CSS reordering remains after Change 1; token-discipline cleanup (Change 2) | Proposed, not yet implemented |
| `DESIGN_REFERENCE_AUTOCOLLECT.md` | Edit (append 3 table rows) | Close scorecard's flagged weak "Reference DNA" lane (Change 2) | Proposed, not yet implemented |
| `qa/cmb-screenshot-cdp.mjs` | New file | Offline, zero-npm-install screenshot capture (Change 3) | **Implemented and run** — see `CLAUDE_HANDOFF_REPORT.md` |
| `run_cmb_frontend_proof_stack.ps1` | Edit (screenshot invocation only) | Swap `npx playwright screenshot` for the new CDP script (Change 3) | **Implemented and run** — see `CLAUDE_HANDOFF_REPORT.md` |

Change 1 now touches `index.html` and `app.js` in addition to `styles.css` — the original "no changes to `index.html`/`app.js`" line no longer holds, because the CSS-only `order` design that made that true was rejected. This section is still `PLAN_ONLY`: none of the Change 1/2 rows have been implemented.

---

## 2. Change 1 — Mobile field-first flow (redesigned)

### Why the CSS-order design was rejected

`order` (flex or grid) changes *visual* position without changing *DOM* position. Tab order and screen-reader linear reading order both follow DOM position, not CSS. The rejected design would have made sighted mobile users see the search/count-entry task first while keyboard and screen-reader users still had to pass through 4 KPI cards and up to 12 WMS lane links (`.lane-link`, see below) first — a real, not theoretical, divergence. `VERIFY.md` requires "keyboard focus… do not regress," so this design is dropped entirely, not patched.

### Chosen design: physical DOM reorder + explicit post-login focus, no CSS `order` anywhere

Two changes, both real content moves (not visual-only):

**(a) Move `#workbench` in `index.html` to sit directly after `<header class="topbar">`, before `.status-strip`.** This is a cut-and-paste of the existing `<section class="workbench" id="workbench">…</section>` block (`index.html:116-209`) to a new position immediately after the topbar's closing `</header>` (`index.html:62`) and before `<section class="status-strip">` (`index.html:64`). No new markup, no attribute changes — the same node moves once, so DOM order = visual order = keyboard order = screen-reader order on every viewport, with no query needed. This is deliberately *not* mobile-only: giving desktop and mobile the same DOM order is what makes the fix have zero accessibility divergence, at the cost of also changing desktop's visual section sequence (topbar → workbench → KPI strip → WMS board → ops row → audit, instead of today's topbar → KPI → WMS → workbench). `VERIFY.md`'s desktop requirement is "operational overview remains useful and no major density is lost" — it does not require the current section sequence, and no section shrinks or is removed.

**(b) Inside `.operating-grid`, move `.mobile-panel` (count entry) before `.inventory-panel` (table) in the DOM too**, and delete the existing `order: -1` / `order: 1` pair at `styles.css:1264-1270` — same reasoning, same fix pattern, applied to a second pre-existing instance of the same order-vs-DOM divergence discovered while reading this file (not introduced by this plan, but the same defect class Codex just flagged, so it is folded into this change rather than left inconsistent). This directly serves "clearer item-count action hierarchy" — count entry is now both visually and structurally first.

**(c) Add one explicit focus move after successful login**, so keyboard users land in the search input immediately rather than needing 2 extra Tab presses through the topbar's two command buttons. Gated to the existing 760px breakpoint so desktop keyboard behavior is unchanged. Exact diff, `app.js`, both success branches of `login()` (`app.js:939-972`), immediately after each `closeLogin();` call (lines 955 and 968):

```javascript
// after: closeLogin();
if (window.matchMedia("(max-width: 760px)").matches) {
  setTimeout(() => els.searchInput?.focus(), 0);
}
```

`els.searchInput` already exists (`app.js` element map includes `document.getElementById("searchInput")` per the `#searchInput` id in `index.html:125`); no new element lookup needed. The `setTimeout(…, 0)` defers focus one tick past the native `<dialog>` close, which otherwise returns focus to the button that opened it.

No CSS `order` property is introduced anywhere by this design. `styles.css`'s `@media (max-width: 760px)` block keeps only true visual-only rules (spacing, column counts) that do not reorder landmarks.

### Before / after journey — mobile (390×844, matching `VERIFY.md`)

- Before: login → topbar (hero + 2 actions) → 4 KPI cards → WMS board (3 lanes, up to 12 links) → search/filters → quick-command panel → count-entry cards → inventory table → queue/map/settings → audit log. The 390×844 viewport shows only the topbar and part of the KPI strip before the user must scroll.
- After: login → topbar (hero + 2 actions) → search/filters → quick-command panel → count-entry cards (DOM-first within the grid) → inventory table → 4 KPI cards → WMS board → queue/map/settings → audit log. The 390×844 viewport shows the topbar and the search/filter row, with the count-entry cards reachable one short scroll down — no dashboard content sits between login and the field task.
- Keyboard focus lands directly in `#searchInput` the instant login succeeds, with zero extra Tab presses, and zero visual/DOM divergence to later reconcile.
- WMS/risk information is not removed or hidden, only sequenced after the primary field task, satisfying "Risk/WMS information remains accessible."

### Before / after journey — desktop (1440×900, matching `VERIFY.md`)

- Section sequence changes (workbench moves above the KPI/WMS block), but every section keeps its existing internal layout (`.operating-grid`'s two-column split, the 4-column KPI grid, the 3-lane WMS grid) untouched — no density is lost, only reordered. No focus-move script runs on desktop (`matchMedia` gate), so desktop keyboard behavior is byte-for-byte unchanged.
- This is a visible product outcome, not a cosmetic-only change: on desktop too, the operator now sees "what to do" (search/count) before "what already happened" (KPI/WMS), which is arguably a more task-first console, but this is explicitly called out here as a judgment call for owner sign-off, not asserted as strictly better.

### Exact focus order at 390×844, immediately after a successful login

Sidebar elements before `<main>` are almost entirely `display: none` on mobile (`styles.css:1148-1152`: `.operator-box small`, `.ghost-btn.is-muted` i.e. `#logoutBtn`, and `.nav-list` are all hidden), so the pre-login/post-login tab sequence is short:

| # | Element | Source | Notes |
|---|---|---|---|
| 1 | `#loginToggle` ("로그인" → "작업자 변경" after login) | sidebar, before `<main>` | Only sidebar control visible on mobile; `#logoutBtn` stays CSS-hidden on mobile even after login (pre-existing, unrelated to this change — flagged in §8). |
| — | *(login dialog opens; while open, focus is trapped inside `<dialog id="loginDialog">`: `#operatorIdInput` → `#pinInput` → `#cancelLoginBtn` → submit button. On success, dialog closes.)* | | |
| 2 | `#searchInput` | `#workbench` → `.filters`, now first in `<main>` | **Focus lands here directly via the explicit `.focus()` call in §2(c) — this is the new "immediately reachable" landing point, at position 2 overall from page entry and position 1 after login.** |
| 3 | `#warehouseSelect` | `.filters` | |
| 4 | `#fieldSelect` | `.filters` | |
| 5 | `#quickCommandInput` | `.quick-command-form` | |
| 6 | 해석 (submit button) | `.quick-command-form` | |
| 7 | `#quickCommandApplyBtn` | `.quick-command-actions` | Starts `disabled`, so actually skipped in tab order until a quick command is parsed. |
| 8 | `#quickCommandClearBtn` | `.quick-command-actions` | |
| 9+ | `[data-count="<code>"]` input, then `[data-save="<code>"]` button, repeated per visible item | `#countList` (mobile-panel, now DOM-first inside `.operating-grid`) | Two tab stops per inventory item, in the same order the cards render. |
| next | `#exportBtn` (CSV) | `.inventory-panel` | Table cells themselves are not focusable (display-only). |
| next | up to 4 KPI `<article>`s | `.status-strip` | `<strong>`/`<span>` only, **not focusable**, zero tab stops — confirmed no `tabindex`/interactive element in this section's markup. |
| next | `.lane-link` anchors, up to 4 per lane × 3 lanes (오늘 작업 → 예외/위험 → 추천 행동) | `.wms-command-center` | Real `<a href>` elements (`app.js:496`), so these are genuine tab stops; count varies with live data, empty-state lanes render 0 links. |
| next | queue items | `.queue-list` | Confirmed read-only markup (`app.js:605-613`, no `<button>`/`<a>` in a queue row) — **not focusable**, zero tab stops. |
| next | `#warehouseMap` | `.map-panel` | `aria-hidden="true"` in `index.html:231` — already correctly excluded from the accessibility tree. |
| next | `#endpointInput`, then `#saveEndpointBtn` | `.settings-panel` | |
| next | audit list rows | `.audit-panel` | Read-only, not focusable (same pattern as queue). |

Net result: on mobile, a keyboard user reaches the primary field-count action (`#searchInput`) at tab stop 2 (right after the one sidebar login control), versus roughly 20+ stops today (4 KPI non-stops aside, up to 12 WMS links plus 2 topbar buttons stood between login and the search field). No stop is removed from the page — everything below is still reachable in a single, consistent forward sequence; nothing is skipped or trapped.

### Risk

None of the CSS-order divergence risk remains, because visual and DOM order are now identical everywhere. Residual risks:
- Desktop section sequence changes (accepted tradeoff, flagged for owner sign-off in §8, not silently assumed).
- `#logoutBtn` being permanently `display:none` on mobile is a pre-existing gap this plan does not fix (out of scope — it predates this work order and is not part of the field-first flow request); flagged so it is not mistaken for something this change introduced.
- The `setTimeout(…, 0)` focus call assumes `<dialog>` close is synchronous enough for one macrotask tick to be sufficient; this matches the delay pattern already used elsewhere in this codebase's own QA scripts (e.g. `qa/cmb-critical-flow-cdp.mjs` uses fixed `sleep()` waits after navigation), so it is a consistent, previously-proven-sufficient pattern, not a new assumption.

---

## 3. Change 2 — Reference-driven visual refinement

### Position on the existing design lock

`DESIGN_BRIEF.md` already carries a locked (`assumption_locked`) direction — `field command console` — with reference DNA mapped to Shopify Polaris, Atlassian Design System, and Carbon/USWDS, and a stated palette (green + amber + blue + warm neutral). Checking the current CSS against that brief:

- Command-deck dark hero: already present (`styles.css:229-242`, `.topbar` dark gradient).
- Status metric category color: already present (`styles.css:382-394`, KPI `nth-child` colors; badges `is-blue`/`is-warn` on queue/map panels in `index.html`).
- Shared component language across table/count/queue/map/settings: already true — `queue-panel`, `map-panel`, and `settings-panel` all inherit the base `.panel` + `.panel-title` + `.badge` components; `styles.css:986-994` shows `settings-panel` only adds spacing, no divergent component.

So most of the brief is already implemented. This plan does **not** propose re-opening the locked direction. It proposes the smallest concrete delta that closes the one lane the scorecard explicitly flagged as weak: **Reference DNA (7/8, "keep but expand vault later")**.

### Gap found

`DESIGN_BRIEF.md`'s "Reference DNA" section names Shopify Polaris, Atlassian Design System, and Carbon/USWDS as the anchors for this redesign, but `DESIGN_REFERENCE_AUTOCOLLECT.md` — the project's actual evidence vault — only logs 4 rows (GOV.UK, WCAG 2.2, WAI Forms, an internal AI-OS pattern pack). None of the three named anchors are logged with adopt/reject/transformation evidence. That is the concrete, closeable gap.

Secondary, smaller finding: `.topbar`'s dark gradient (`styles.css:238`) uses three hardcoded hex stops (`#13241f`, `#13382f`, `#87601e`) instead of the named tokens in `DESIGN_TOKENS.md` (`--brand-deep`, `--brand`, `--amber`), which violates the token file's own "Change Rule" ("do not add one-off colors… without updating this file first"). Since these three hex values already equal or nearly equal existing tokens, this is a token-discipline cleanup, not a new visual value — no `DESIGN_TOKENS.md` update needed.

### Proposed smallest slice

**(a) Vault entries — append to `DESIGN_REFERENCE_AUTOCOLLECT.md` table:**

```markdown
| Shopify Polaris | https://polaris.shopify.com/ | Predictable admin components, status badges, action hierarchy (primary vs. secondary), dense but readable controls. | Shopify's own iconography, product chrome, and merchant-specific copy. | CMB reuses badge/state language (`is-blue`, `is-warn`) and primary/secondary button hierarchy already in `styles.css`; no Shopify assets copied. |
| Atlassian Design System | https://atlassian.design/ | Token-first theming: color, radius, shadow, and spacing driven by named tokens before one-off CSS. | Atlassian's specific brand palette and component names. | CMB keeps its own token set in `DESIGN_TOKENS.md`; this pass closes a drift where `.topbar` used hardcoded hex instead of `--brand-deep`/`--brand`/`--amber`. |
| Carbon / USWDS | https://carbondesignsystem.com/ , https://designsystem.digital.gov/ | Operational table hierarchy, restrained color, explicit interaction states (focus/disabled/invalid/loading). | Carbon's IBM branding and USWDS's government-site chrome. | Already reflected in CMB's `.table-wrap` numeric alignment and the state matrix in `DESIGN_TOKENS.md` → "Interaction"; this entry only records the DNA source that was already implemented but never logged. |
```

Also bump `## Evidence State` → `Reference count: 4` becomes `7`, `External official references: 3` becomes `6`.

**(b) Token-only topbar cleanup — exact diff to `styles.css:237-238`:**

```css
  background:
-    linear-gradient(135deg, #13241f 0%, #13382f 56%, #87601e 100%);
+    linear-gradient(135deg, var(--brand-deep) 0%, #13382f 56%, var(--amber) 100%);
```

The middle stop (`#13382f`) has no existing named token close enough to substitute without changing the visual result; it is left as-is rather than inventing a new token, per `DESIGN_TOKENS.md`'s change rule. This is a 1-line, visually-near-identical diff (first and last gradient stops move to their already-equal token values), not a redesign.

### Before / after journey

- Desktop and mobile: no layout change, no new component, no new color. The command-deck hero renders the same dark green-to-amber gradient it renders today; the two hardcoded stops that already equal token values now reference the token instead.
- This intentionally produces a near-zero (not exactly zero, due to possible hex rounding) pixel diff, which is expected to stay under the existing `PixelDiffThreshold` (`0.002`) in `run_cmb_frontend_proof_stack.ps1:5`.

### Risk

Cosmetic-only, no functional surface touched (no `id`, no event listener, no layout dimension changes). If the pixel diff unexpectedly exceeds threshold, the proof script already reports `WARN` rather than failing hard (`run_cmb_frontend_proof_stack.ps1:148`), so the failure mode is visible, not silent.

---

## 4. Change 3 — Offline-capable proof route

**Status: implemented and run this pass, per `CODEX_PLAN_REVIEW.md` approval.** The design below is kept as the record of what was proposed and matches what shipped (a cleanup-retry fix was added after the first real run surfaced a race-condition bug — see `CLAUDE_HANDOFF_REPORT.md` §3 for the actual bug and the fix applied on top of this design). Full real output, root-cause notes on the desktop visual WARN and the pre-existing platform-scenario FAIL, and compliance confirmation are all in `CLAUDE_HANDOFF_REPORT.md` — not duplicated here.

### Diagnosis

`run_cmb_frontend_proof_stack.ps1:131` and `:133` run:

```powershell
cmd /c npx playwright screenshot --viewport-size=1440,980 $Url $DesktopShot
cmd /c npx playwright screenshot --viewport-size=390,1300 $Url $MobileShot
```

`node_modules/` does not exist in this project (`ls` confirmed) and `package.json` (`package.json:1-13`) has no `playwright` dependency anywhere. `npx playwright` therefore always attempts to fetch the `playwright` package from the npm registry before it can run. In a managed/offline sandbox with no registry reachable, that fetch is exactly where the script fails — this is a test-runner dependency problem, not a product defect, matching the work order's own framing.

Critically, **the rest of this same script already solved this problem** for interaction testing: `run_cmb_frontend_proof_stack.ps1:162-163` and `:182-183` invoke `qa/cmb-critical-flow-cdp.mjs` and `qa/cmb-platform-scenarios-cdp.mjs` directly through the local Node runtime (`$NodePath`, confirmed present and reporting `v24.14.0`), launching the local Chrome binary (`$ChromePath`, confirmed present on disk) and talking to it over the Chrome DevTools Protocol using Node's built-in `WebSocket` and `fetch` globals (`qa/cmb-critical-flow-cdp.mjs:1-59`) — zero npm packages required. The screenshot step is the only remaining place in the whole proof stack that still shells out to `npx`.

### Proposed fix

Add a new script, `qa/cmb-screenshot-cdp.mjs`, following the exact same zero-dependency CDP pattern as `qa/cmb-critical-flow-cdp.mjs` (spawn Chrome headless with a random remote-debugging port and a temp profile dir, fetch `http://127.0.0.1:<port>/json/version` for the WebSocket target, open a native `WebSocket`, drive `Page`/`Emulation` domains), and use `Emulation.setDeviceMetricsOverride` + `Page.captureScreenshot` instead of running a workflow scenario.

```javascript
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
    chrome.kill();
    rmSync(profileDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(JSON.stringify({ status: "FAIL", error: error.message }));
  process.exit(1);
});
```

**Exact diff to `run_cmb_frontend_proof_stack.ps1:131-134`:**

```powershell
-  cmd /c npx playwright screenshot --viewport-size=1440,980 $Url $DesktopShot | Out-Null
-  if ($LASTEXITCODE -ne 0) { throw "Desktop screenshot failed." }
-  cmd /c npx playwright screenshot --viewport-size=390,1300 $Url $MobileShot | Out-Null
-  if ($LASTEXITCODE -ne 0) { throw "Mobile screenshot failed." }
+  $screenshotScript = Join-Path $Root "qa\cmb-screenshot-cdp.mjs"
+  & $NodePath $screenshotScript $Url $ChromePath $DesktopShot 1440 980 desktop | Out-Null
+  if ($LASTEXITCODE -ne 0) { throw "Desktop screenshot failed." }
+  & $NodePath $screenshotScript $Url $ChromePath $MobileShot 390 1300 mobile | Out-Null
+  if ($LASTEXITCODE -ne 0) { throw "Mobile screenshot failed." }
```

Viewport sizes (1440×980 desktop, 390×1300 mobile) are kept identical to today's script so existing baselines (`visual_baseline_desktop.png`, `visual_baseline_mobile.png`) stay comparable and the pixel-diff logic in the same script does not need to change.

### Risk

`qa/` is on the CLAUDE.md-restricted list ("QA scripts"), so this is flagged for explicit owner/Codex approval before implementation, same as Changes 1 and 2. No product code (`index.html`/`styles.css`/`app.js`) is touched by this change. Failure mode if `chrome.exe` or `node.exe` move paths: the script throws the same `"Desktop/Mobile screenshot failed."` error the current script already throws, so error visibility does not regress.

### Package installation note

This fix explicitly avoids `npm install`/`npm ci`, per the work order's "Do not install Playwright or another package during plan-only work" and CLAUDE.md's "do not... install packages... without explicit approval." Nothing in this proposal requires network access or a package registry at any point.

---

## 5. Risk register (per VERIFY.md functional surface)

| Surface | Touched by this plan? | Risk | Mitigation |
|---|---|---|---|
| Demo login (`DEMO01`/`0000`) | Indirectly (Change 1c adds a focus call inside both `login()` success branches) | Low — the added code runs only *after* `state.operator` is already set and `render()`/`closeLogin()` have already succeeded; it cannot block or alter the login outcome itself. | Manual login test at 390×844 confirms `DEMO01`/`0000` still authenticates and focus lands in `#searchInput`. |
| Inventory search/quantity entry | No | None — `id`-based wiring unaffected by a DOM position move. | Confirmed via `app.js` selector grep (no positional selectors); moving a node doesn't change its `id`. |
| Quick command input | No | None — same reasoning. | Same. |
| Local queue | No | None — `.ops-row`/`queue-panel` DOM position and ids unchanged by Change 1 (only `#workbench` and the two `.operating-grid` children move). | Same. |
| Audit log | No | None — `.audit-panel` DOM position unchanged. | Same. |
| Telemetry (`telemetry_config.js`, `sentry_*`) | No | None — script tags and load order in `index.html` untouched; Change 1 only moves `<section>` nodes inside `<body>`, not `<script>` tags. | N/A |
| Responsive layout | Yes (Change 1) | None from divergence — DOM/visual/keyboard order are now identical everywhere by design (see §2). Remaining risk is the desktop section-sequence change itself. | §2 focus-order table gives the exact 390×844 sequence for review; desktop sequence change flagged in §8 for explicit sign-off. |
| Visual regression baseline | Yes (Change 1 + 2) | Both changes intentionally alter pixels versus `visual_baseline_desktop.png`/`visual_baseline_mobile.png` on both viewports now (Change 1 is no longer mobile-only), which will trip `WARN` until baselines are refreshed. | Expected; get explicit sign-off before overwriting baseline PNGs — not done automatically, per this session's explicit "no baseline replace" instruction. |
| QA proof pipeline | No further change proposed here | N/A — Change 3 already implemented, run, and reported in `CLAUDE_HANDOFF_REPORT.md`. | N/A |

---

## 6. Verification commands and screenshot sizes

Run after approval, in this order:

```powershell
# 1. Syntax check (per DESIGN_BRIEF.md proof plan)
node --check app.js
node --check qa/cmb-screenshot-cdp.mjs

# 2. Local preview server
node local-preview-server.mjs 8767
# open http://127.0.0.1:8767/index.html — confirm DEMO01 / 0000 still logs in

# 3. Full proof stack (now offline-capable end to end)
powershell -NoProfile -ExecutionPolicy Bypass -File ./run_cmb_frontend_proof_stack.ps1
```

Screenshot sizes to capture and compare, matching both `VERIFY.md` and the existing proof script:

- Desktop: `1440x980` (proof script) — `VERIFY.md` names `1440x900` for the manual density check; use `1440x980` for the automated pixel-diff pair (matches existing baseline files) and additionally eyeball `1440x900` manually since that is the exact number `VERIFY.md` specifies. Flagging this size mismatch for owner confirmation rather than silently picking one (see §8).
- Mobile: `390x1300` (proof script baseline) and `390x844` (`VERIFY.md`'s exact number for "primary task reachable earlier"). Capture both: `390x1300` for pixel-diff continuity, `390x844` as the specific manual screenshot `VERIFY.md` asks for to prove the reordered task is visible without scrolling past the first useful viewport.

Manual checks (no automated tool covers these):

- Tab through the mobile layout with a keyboard only; confirm the divergence from §2 Risk is understood and acceptable, or decide to accept it as a fast-follow.
- Confirm no horizontal scroll, clipped text, or overlapping controls at `390x844`.
- Confirm focus-visible, reduced-motion, disabled, loading, invalid, and error states still render (these are all CSS-selector-driven, none touched by this plan, but a visual pass is cheap insurance).

---

## 7. Smallest first vertical slice

Actual and remaining order:

1. ~~**Change 3 (offline proof script)**~~ — **done.** Landed first because it unblocks trustworthy before/after screenshots for judging Changes 1 and 2. Implemented, run twice (found and fixed a real cleanup-race bug), reported in `CLAUDE_HANDOFF_REPORT.md`.
2. **Change 1 (DOM reorder + focus move)** — next. Highest product value, directly answers the work order's first and most concrete ask, and is the change Codex asked to see revised before any further product-code work. `index.html` + `app.js` + one `styles.css` deletion, still a small, disjoint, revertible slice (3 files, no new dependencies, no new components).
3. **Change 2 (token cleanup + vault rows)** — last. Cosmetic and documentation-only; lowest urgency.

Each slice touches a disjoint file set, so they can be reviewed and committed independently by Codex. Change 1 and Change 2 both touch `styles.css`, but at non-overlapping line ranges (Change 1 deletes the old `order` rule; Change 2 edits the topbar gradient), so they remain independently revertible even though they share a file.

---

## 8. Needs explicit owner approval before implementation

- Editing `index.html` and `app.js` for the first time this work order (Change 1) — both on the CLAUDE.md-restricted list.
- Editing `styles.css` (Change 1's `order` deletion, Change 2's token substitution) — restricted list.
- **Desktop section-sequence change**: Change 1(a) moves `#workbench` above `.status-strip`/`.wms-command-center` on *all* viewports, including desktop, to keep DOM order identical everywhere and fully eliminate the accessibility divergence Codex flagged. This changes desktop's visual reading order from today's topbar→KPI→WMS→workbench to topbar→workbench→KPI→WMS. No section shrinks, but the sequence is different from the current "solid B+" desktop baseline — explicit sign-off requested before implementing, since a mobile-only fix (via a legitimate non-`order` mechanism) was not identified that avoids this tradeoff. See §2(a) for the full reasoning.
- Editing `DESIGN_REFERENCE_AUTOCOLLECT.md` (documentation, allowed under CLAUDE.md but flagging since it is an evidence file, not implementation code) — Change 2.
- Overwriting `visual_baseline_desktop.png`/`visual_baseline_mobile.png` after Changes 1/2 land, since both are expected to move pixels intentionally (Change 1 now affects both viewports, not mobile-only as originally proposed). **Not done automatically** regardless of approval — needs a separate explicit go-ahead per this session's standing instruction.
- Confirming which desktop/mobile screenshot sizes are canonical going forward: `VERIFY.md` (`1440x900`, `390x844`) versus the proof script's existing baseline sizes (`1440x980`, `390x1300`) — §6 proposes capturing both rather than picking one silently.
- `#logoutBtn` being unreachable on mobile (`display: none` regardless of login state) is a pre-existing gap noticed while mapping the focus order in §2 — not caused by or fixed by this plan; flagging for a future work order rather than silently leaving it undocumented.

## 9. Confirmed out of scope (unchanged from CLAUDE_WORK_ORDER.md)

No real CMB credentials or production writes. No Apps Script/Cloudflare/GitHub/Pages deployment. No package installation. No React/Next.js migration. No large documentation or governance expansion — the only doc edit proposed is 3 table rows in an existing evidence file plus an evidence-count bump, not a new document.

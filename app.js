const STORAGE_KEY = "cmb.free.web.state.v1";
const ENDPOINT_KEY = "cmb.free.web.endpoint.v1";
const SESSION_KEY = "cmb.free.web.operator.v1";

const defaultState = {
  operator: null,
  queue: [],
  audit: [],
  items: [
    {
      code: "00027",
      name: "그린메디 / 20L",
      field: "finished",
      stocks: { finished: 906, label: 900, container: 0, cap: 0 },
      locations: {
        "2층 창고": { finished: 900, label: 900, container: 0, cap: 0 },
        "1층 창고": { finished: 6, label: 0, container: 0, cap: 0 }
      }
    },
    {
      code: "00006",
      name: "그린메디 / 4L",
      field: "finished",
      stocks: { finished: 4, label: 0, container: 0, cap: 0 },
      locations: {
        "2층 창고": { finished: 4, label: 0, container: 0, cap: 0 },
        "1층 창고": { finished: 0, label: 0, container: 0, cap: 0 }
      }
    },
    {
      code: "00007",
      name: "그린메디 / 500ml",
      field: "finished",
      stocks: { finished: 6, label: 0, container: 0, cap: 0 },
      locations: {
        "2층 창고": { finished: 6, label: 0, container: 0, cap: 0 },
        "1층 창고": { finished: 0, label: 0, container: 0, cap: 0 }
      }
    },
    {
      code: "00023",
      name: "2번 / 박스(B-246호)",
      field: "container",
      stocks: { finished: 0, label: 0, container: 180, cap: 0 },
      locations: {
        "2층 창고": { finished: 0, label: 0, container: 180, cap: 0 },
        "1층 창고": { finished: 0, label: 0, container: 0, cap: 0 }
      }
    },
    {
      code: "00024",
      name: "3번 / 박스(58호)",
      field: "container",
      stocks: { finished: 0, label: 0, container: 120, cap: 0 },
      locations: {
        "2층 창고": { finished: 0, label: 0, container: 120, cap: 0 },
        "1층 창고": { finished: 0, label: 0, container: 0, cap: 0 }
      }
    },
    {
      code: "00265",
      name: "준스랩 ACC 블루 / 500ml",
      field: "finished",
      stocks: { finished: 10, label: 0, container: 0, cap: 0 },
      locations: {
        "2층 창고": { finished: 10, label: 0, container: 0, cap: 0 },
        "1층 창고": { finished: 0, label: 0, container: 0, cap: 0 }
      }
    }
  ]
};

let state = loadState();
let renderQueued = false;
let flushTimer = null;
let lastLatencyMs = 0;

const els = {
  operatorLabel: document.getElementById("operatorLabel"),
  loginToggle: document.getElementById("loginToggle"),
  logoutBtn: document.getElementById("logoutBtn"),
  loginDialog: document.getElementById("loginDialog"),
  loginForm: document.getElementById("loginForm"),
  cancelLoginBtn: document.getElementById("cancelLoginBtn"),
  operatorIdInput: document.getElementById("operatorIdInput"),
  pinInput: document.getElementById("pinInput"),
  searchInput: document.getElementById("searchInput"),
  warehouseSelect: document.getElementById("warehouseSelect"),
  fieldSelect: document.getElementById("fieldSelect"),
  inventoryBody: document.getElementById("inventoryBody"),
  countList: document.getElementById("countList"),
  queueList: document.getElementById("queueList"),
  queueBadge: document.getElementById("queueBadge"),
  auditList: document.getElementById("auditList"),
  auditCount: document.getElementById("auditCount"),
  warehouseMap: document.getElementById("warehouseMap"),
  endpointInput: document.getElementById("endpointInput"),
  saveEndpointBtn: document.getElementById("saveEndpointBtn"),
  flushNowBtn: document.getElementById("flushNowBtn"),
  resetDemoBtn: document.getElementById("resetDemoBtn"),
  exportBtn: document.getElementById("exportBtn"),
  kpiItems: document.getElementById("kpiItems"),
  kpiQueue: document.getElementById("kpiQueue"),
  kpiDiff: document.getElementById("kpiDiff"),
  kpiLatency: document.getElementById("kpiLatency"),
  syncState: document.getElementById("syncState"),
  syncHint: document.getElementById("syncHint"),
  syncStateDot: document.getElementById("syncStateDot"),
  scopeWarehouse: document.getElementById("scopeWarehouse"),
  scopeField: document.getElementById("scopeField"),
  scopeOperator: document.getElementById("scopeOperator"),
  mobileModeBadge: document.getElementById("mobileModeBadge"),
  toast: document.getElementById("toast")
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    const session = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    if (saved && Array.isArray(saved.items)) {
      saved.operator = session;
      return saved;
    }
  } catch (error) {
    console.warn(error);
  }
  const next = clone(defaultState);
  next.operator = null;
  return next;
}

function saveState() {
  const stored = clone(state);
  delete stored.operator;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  localStorage.setItem(SESSION_KEY, JSON.stringify(state.operator || null));
}

function normalize(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, "");
}

function fieldLabel(field) {
  return {
    finished: "완제품",
    label: "라벨",
    container: "용기",
    cap: "뚜껑"
  }[field] || field;
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("ko-KR");
}

function selectedField() {
  return els.fieldSelect.value || "finished";
}

function selectedWarehouse() {
  return els.warehouseSelect.value || "2층 창고";
}

function locationQty(item, warehouse, field) {
  return Number(((item.locations || {})[warehouse] || {})[field] || 0);
}

function totalQty(item, field) {
  return Number((item.stocks || {})[field] || 0);
}

function recalcTotal(item, field) {
  item.stocks[field] = Object.keys(item.locations || {}).reduce((sum, warehouse) => {
    return sum + locationQty(item, warehouse, field);
  }, 0);
}

function filteredItems() {
  const query = normalize(els.searchInput.value);
  const field = selectedField();
  return state.items.filter((item) => {
    const matchesField = item.field === field || totalQty(item, field) > 0 || locationQty(item, selectedWarehouse(), field) > 0;
    if (!matchesField) return false;
    if (!query) return true;
    return normalize(`${item.code} ${item.name}`).includes(query);
  });
}

function statusFor(item, field, warehouse) {
  const current = locationQty(item, warehouse, field);
  const pending = state.queue.some((job) => job.itemCode === item.code && job.field === field && job.warehouse === warehouse);
  if (pending) return ["전송 중", "is-warn"];
  if (current === 0) return ["확인 필요", "is-red"];
  return ["정상", ""];
}

function render() {
  renderQueued = false;
  const items = filteredItems();
  const field = selectedField();
  const warehouse = selectedWarehouse();
  renderOperator();
  renderKpis(items, field, warehouse);
  renderInventory(items, field, warehouse);
  renderCountList(items, field, warehouse);
  renderQueue();
  renderAudit();
  renderMap(items, field, warehouse);
}

function scheduleRender() {
  if (renderQueued) return;
  renderQueued = true;
  requestAnimationFrame(render);
}

function renderOperator() {
  if (state.operator) {
    els.operatorLabel.textContent = `${state.operator.id} / ${state.operator.name}`;
    els.loginToggle.textContent = "작업자 변경";
  } else {
    els.operatorLabel.textContent = "로그인 필요";
    els.loginToggle.textContent = "로그인";
  }
}

function renderKpis(items, field, warehouse) {
  const diffCount = state.audit.filter((row) => row.type === "stock-count" && row.delta !== 0).length;
  els.kpiItems.textContent = formatNumber(items.length);
  els.kpiQueue.textContent = formatNumber(state.queue.length);
  els.kpiDiff.textContent = formatNumber(diffCount);
  els.kpiLatency.textContent = `${(lastLatencyMs / 1000).toFixed(1)}초`;
  const hasQueue = state.queue.length > 0;
  els.syncState.textContent = hasQueue ? "전송 중" : "대기 중";
  els.syncHint.textContent = hasQueue ? `${state.queue.length}건을 뒤에서 저장합니다.` : `${warehouse} ${fieldLabel(field)} 기준`;
  els.syncStateDot.style.background = hasQueue ? "#f2b84b" : "#83ddc6";
  els.scopeWarehouse.textContent = warehouse;
  els.scopeField.textContent = fieldLabel(field);
  els.scopeOperator.textContent = state.operator ? `${state.operator.id} · ${state.operator.role}` : "로그인 필요";
  els.mobileModeBadge.textContent = hasQueue ? "동기화 중" : "즉시 반영";
}

function renderInventory(items, field, warehouse) {
  els.inventoryBody.innerHTML = items.map((item) => {
    const [label, cls] = statusFor(item, field, warehouse);
    return `
      <tr>
        <td><strong>${item.code}</strong></td>
        <td><span class="item-title"><strong>${item.name}</strong><small>${warehouse}</small></span></td>
        <td>${fieldLabel(field)}</td>
        <td><strong>${formatNumber(totalQty(item, field))}</strong></td>
        <td>${formatNumber(locationQty(item, warehouse, field))}</td>
        <td><span class="badge ${cls}">${label}</span></td>
      </tr>
    `;
  }).join("");
}

function renderCountList(items, field, warehouse) {
  els.countList.innerHTML = items.map((item) => {
    const current = locationQty(item, warehouse, field);
    const total = totalQty(item, field);
    return `
      <article class="count-item" data-code="${item.code}">
        <div class="count-main">
          <div>
            <div class="count-code">${item.code}</div>
            <strong>${item.name}</strong>
            <small>${warehouse} · ${fieldLabel(field)}</small>
          </div>
          <span class="badge">${current === 0 ? "미입력" : "대상"}</span>
        </div>
        <div class="count-values">
          <div class="metric-box"><span>전체 재고</span><strong>${formatNumber(total)}</strong></div>
          <div class="metric-box"><span>선택 창고</span><strong>${formatNumber(current)}</strong></div>
        </div>
        <div class="count-actions">
          <input data-count="${item.code}" inputmode="numeric" placeholder="실사 수량" value="">
          <button class="primary-btn" type="button" data-save="${item.code}">저장</button>
        </div>
      </article>
    `;
  }).join("");
}

function renderQueue() {
  els.queueBadge.textContent = `${state.queue.length}건`;
  els.queueList.innerHTML = state.queue.length ? state.queue.map((job) => `
    <div class="queue-item">
      <div>
        <strong>${job.itemCode} ${job.label}</strong>
        <span>${job.warehouse} · ${fieldLabel(job.field)} · ${job.status}</span>
      </div>
      <span class="badge is-warn">${job.attempts}회</span>
    </div>
  `).join("") : `<div class="queue-item"><div><strong>미전송 없음</strong><span>화면 반영과 서버 저장이 모두 끝난 상태입니다.</span></div></div>`;
}

function renderAudit() {
  els.auditCount.textContent = `${state.audit.length}건`;
  els.auditList.innerHTML = state.audit.slice(0, 12).map((row) => `
    <div class="audit-item">
      <div>
        <strong>${row.itemCode} ${row.before} → ${row.after}</strong>
        <span>${row.operator} · ${row.warehouse} · ${fieldLabel(row.field)} · ${row.time}</span>
      </div>
      <span class="badge ${row.delta === 0 ? "" : "is-blue"}">${row.delta > 0 ? "+" : ""}${row.delta}</span>
    </div>
  `).join("") || `<div class="audit-item"><div><strong>아직 변경 기록이 없습니다</strong><span>저장하면 여기에 남습니다.</span></div></div>`;
}

function renderMap(items, field, warehouse) {
  const selected = items.slice(0, 8);
  const max = Math.max(1, ...selected.map((item) => locationQty(item, warehouse, field)));
  els.warehouseMap.innerHTML = selected.map((item) => {
    const qty = locationQty(item, warehouse, field);
    const height = Math.max(18, Math.round((qty / max) * 78));
    return `
      <div class="map-cell">
        <div class="map-fill" style="height:${height}px"></div>
        <span>${item.code} · ${formatNumber(qty)}</span>
      </div>
    `;
  }).join("");
}

function requireOperator() {
  if (state.operator) return true;
  openLogin();
  showToast("작업자 로그인 후 저장할 수 있습니다.");
  return false;
}

function saveCount(itemCode, countedValue) {
  if (!requireOperator()) return;
  const started = performance.now();
  const field = selectedField();
  const warehouse = selectedWarehouse();
  const item = state.items.find((candidate) => candidate.code === itemCode);
  const counted = Number(countedValue);
  if (!item || !Number.isFinite(counted) || counted < 0 || Math.floor(counted) !== counted) {
    showToast("실사 수량은 0 이상의 정수로 입력하세요.");
    return;
  }

  const before = locationQty(item, warehouse, field);
  const delta = counted - before;
  if (!item.locations[warehouse]) item.locations[warehouse] = {};
  item.locations[warehouse][field] = counted;
  recalcTotal(item, field);

  const auditRow = {
    id: `a_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    type: "stock-count",
    itemCode,
    field,
    warehouse,
    before,
    after: counted,
    delta,
    operator: state.operator.name,
    time: new Date().toLocaleString("ko-KR")
  };
  state.audit.unshift(auditRow);
  state.queue.push({
    id: `q_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    itemCode,
    field,
    warehouse,
    before,
    after: counted,
    delta,
    label: "재고 실사 저장",
    status: "waiting",
    attempts: 0,
    auditId: auditRow.id
  });

  lastLatencyMs = performance.now() - started;
  saveState();
  scheduleRender();
  showToast("화면에 바로 반영했습니다. 실제 저장은 뒤에서 진행합니다.");
  scheduleFlush();
}

function scheduleFlush() {
  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = setTimeout(flushQueue, 250);
}

async function flushQueue() {
  if (!state.queue.length) {
    scheduleRender();
    return;
  }
  const job = state.queue[0];
  job.status = "sending";
  job.attempts += 1;
  saveState();
  scheduleRender();
  try {
    await sendJob(job);
    state.queue.shift();
    saveState();
    showToast("미전송 저장 1건을 완료했습니다.");
  } catch (error) {
    job.status = "retry";
    saveState();
    showToast("서버 저장 실패. 큐에 남겨 다시 보낼 수 있습니다.");
    console.warn(error);
    scheduleRender();
    return;
  }
  scheduleRender();
  if (state.queue.length) scheduleFlush();
}

function sendJob(job) {
  const endpoint = localStorage.getItem(ENDPOINT_KEY) || "";
  if (!endpoint) {
    return new Promise((resolve) => setTimeout(resolve, 850));
  }
  return fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action: "saveStockCount", job })
  }).then((response) => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json().catch(() => ({}));
  });
}

function openLogin() {
  if (typeof els.loginDialog.showModal === "function") {
    els.loginDialog.showModal();
  } else {
    els.loginDialog.setAttribute("open", "open");
  }
}

function closeLogin() {
  if (typeof els.loginDialog.close === "function") els.loginDialog.close();
  else els.loginDialog.removeAttribute("open");
}

function login(operatorId, pin) {
  const id = String(operatorId || "").trim().toUpperCase();
  const cleanPin = String(pin || "").trim();
  if (id === "DEMO01" && cleanPin === "0000") {
    state.operator = { id, name: "데모 관리자", role: "재고관리자" };
    saveState();
    render();
    showToast("작업자 로그인 완료");
    closeLogin();
    return;
  }
  showToast("작업자 ID 또는 PIN을 확인하세요.");
}

function exportCsv() {
  const field = selectedField();
  const warehouse = selectedWarehouse();
  const rows = [["code", "name", "field", "total", "warehouseQty"], ...filteredItems().map((item) => [
    item.code,
    item.name,
    fieldLabel(field),
    totalQty(item, field),
    locationQty(item, warehouse, field)
  ])];
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `cmb_inventory_${Date.now()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function resetDemo() {
  state = clone(defaultState);
  state.operator = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  saveState();
  render();
  showToast("샘플 데이터를 초기화했습니다.");
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("is-visible");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => els.toast.classList.remove("is-visible"), 2500);
}

function bindEvents() {
  ["input", "change"].forEach((eventName) => {
    els.searchInput.addEventListener(eventName, scheduleRender);
  });
  els.warehouseSelect.addEventListener("change", scheduleRender);
  els.fieldSelect.addEventListener("change", scheduleRender);
  els.countList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-save]");
    if (!button) return;
    const code = button.dataset.save;
    const input = els.countList.querySelector(`[data-count="${code}"]`);
    saveCount(code, input ? input.value : "");
  });
  els.countList.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    const input = event.target.closest("[data-count]");
    if (input) saveCount(input.dataset.count, input.value);
  });
  els.loginToggle.addEventListener("click", openLogin);
  els.cancelLoginBtn.addEventListener("click", closeLogin);
  els.logoutBtn.addEventListener("click", () => {
    state.operator = null;
    saveState();
    render();
    showToast("로그아웃했습니다.");
  });
  els.loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    login(els.operatorIdInput.value, els.pinInput.value);
  });
  els.flushNowBtn.addEventListener("click", flushQueue);
  els.resetDemoBtn.addEventListener("click", resetDemo);
  els.exportBtn.addEventListener("click", exportCsv);
  els.saveEndpointBtn.addEventListener("click", () => {
    localStorage.setItem(ENDPOINT_KEY, els.endpointInput.value.trim());
    showToast("연결 주소를 저장했습니다.");
  });
}

function init() {
  els.endpointInput.value = localStorage.getItem(ENDPOINT_KEY) || "";
  bindEvents();
  render();
  if (state.queue.length) scheduleFlush();
}

init();

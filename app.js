const STORAGE_KEY = "cmb.free.web.state.v1";
const ENDPOINT_KEY = "cmb.free.web.endpoint.v1";
const SESSION_KEY = "cmb.free.web.operator.v1";

function isTrustedAppsScriptEndpoint(value) {
  try {
    const url = new URL(String(value || ""));
    return url.protocol === "https:"
      && url.hostname === "script.google.com"
      && /^\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(url.pathname);
  } catch (error) {
    return false;
  }
}

function bootstrapEndpointFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const endpoint = params.get("endpoint");
  if (!endpoint) return;
  if (isTrustedAppsScriptEndpoint(endpoint)) {
    localStorage.setItem(ENDPOINT_KEY, endpoint);
  }
  params.delete("endpoint");
  const query = params.toString();
  const cleanUrl = window.location.pathname + (query ? `?${query}` : "") + window.location.hash;
  window.history.replaceState({}, document.title, cleanUrl);
}

bootstrapEndpointFromQuery();

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

const QUICK_ACTIONS = [
  {
    type: "discard",
    label: "폐기 처리",
    mode: "decrease",
    risk: "high",
    keywords: ["폐기", "버림", "손실", "제거"],
    note: "위험 작업입니다. 선택 창고의 재고에서 수량을 완전히 제거합니다."
  },
  {
    type: "defect",
    label: "불량 보류",
    mode: "move-to-defect",
    risk: "high",
    keywords: ["불량", "하자", "불량처리"],
    note: "위험 작업입니다. 선택 창고의 정상 재고를 줄이고 불량 재고로 이동합니다."
  },
  {
    type: "produce",
    label: "생산 입고",
    mode: "increase",
    risk: "normal",
    keywords: ["생산", "입고", "만들", "제조"],
    note: "선택 창고의 완제품 재고에 수량을 더합니다."
  }
];

const QUICK_ITEM_ALIASES = [
  {
    code: "00027",
    aliases: ["그린메디20l", "그린메디20리터", "그린자임20l", "그린자임20리터", "greenmedi20l", "greenzyme20l"],
    terms: ["그린메디", "그린자임", "greenmedi", "greenzyme"],
    sizes: ["20l", "20리터"]
  },
  {
    code: "00006",
    aliases: ["그린메디4l", "그린메디4리터", "그린자임4l", "그린자임4리터", "greenmedi4l", "greenzyme4l"],
    terms: ["그린메디", "그린자임", "greenmedi", "greenzyme"],
    sizes: ["4l", "4리터"]
  },
  {
    code: "00007",
    aliases: ["그린메디500ml", "그린자임500ml", "greenmedi500ml", "greenzyme500ml"],
    terms: ["그린메디", "그린자임", "greenmedi", "greenzyme"],
    sizes: ["500ml"]
  },
  {
    code: "00023",
    aliases: ["2번박스", "b246호", "b-246호", "박스b246", "박스b-246"],
    terms: ["박스", "box"],
    sizes: ["2번", "b246"]
  },
  {
    code: "00024",
    aliases: ["3번박스", "58호", "박스58"],
    terms: ["박스", "box"],
    sizes: ["3번", "58호"]
  },
  {
    code: "00265",
    aliases: ["준스랩acc블루500ml", "acc블루500ml", "준스랩500ml"],
    terms: ["준스랩", "acc블루", "acc"],
    sizes: ["500ml"]
  }
];

let state = loadState();
let renderQueued = false;
let flushTimer = null;
let lastLatencyMs = 0;
let pendingQuickCommand = null;
let liveInventory = { endpoint: "", sessionToken: "", ready: false };

const els = {
  operatorLabel: document.getElementById("operatorLabel"),
  loginToggle: document.getElementById("loginToggle"),
  logoutBtn: document.getElementById("logoutBtn"),
  loginDialog: document.getElementById("loginDialog"),
  loginForm: document.getElementById("loginForm"),
  cancelLoginBtn: document.getElementById("cancelLoginBtn"),
  operatorIdInput: document.getElementById("operatorIdInput"),
  pinInput: document.getElementById("pinInput"),
  showPinRecoveryBtn: document.getElementById("showPinRecoveryBtn"),
  quickCommandForm: document.getElementById("quickCommandForm"),
  quickCommandInput: document.getElementById("quickCommandInput"),
  quickCommandPreview: document.getElementById("quickCommandPreview"),
  quickCommandApplyBtn: document.getElementById("quickCommandApplyBtn"),
  quickCommandClearBtn: document.getElementById("quickCommandClearBtn"),
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
  commandCenterBadge: document.getElementById("commandCenterBadge"),
  workTaskCount: document.getElementById("workTaskCount"),
  workTaskList: document.getElementById("workTaskList"),
  exceptionCount: document.getElementById("exceptionCount"),
  exceptionList: document.getElementById("exceptionList"),
  recommendationCount: document.getElementById("recommendationCount"),
  recommendationList: document.getElementById("recommendationList"),
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

function compactCommandText(value) {
  return normalize(value)
    .replace(/ℓ/g, "l")
    .replace(/리터/g, "l")
    .replace(/[.,]/g, "");
}

function parseCommandQuantity(rawText) {
  const text = String(rawText || "").replace(/,/g, "");
  const digitMatches = Array.from(text.matchAll(/(\d+)\s*(개|ea|EA|병|통|박스|box|BOX)/g));
  const koreanQuantity = /[일이삼사오육칠팔구십백천영공한두세네다섯여섯일곱여덟아홉스무서른마흔쉰예순일흔여든아흔]+\s*(개|병|통|박스)/.test(text);
  if (koreanQuantity) {
    return { ok: false, error: "한글 수량은 아직 지원하지 않습니다. 30개처럼 숫자와 단위를 함께 입력하세요." };
  }
  if (digitMatches.length > 1) {
    return { ok: false, error: "수량 후보가 여러 개입니다. 한 문장에는 작업 하나만 입력하세요." };
  }
  if (digitMatches.length === 1) {
    return { ok: true, quantity: Number(digitMatches[0][1]) };
  }
  return { ok: false, error: "수량은 30개처럼 숫자와 단위를 함께 입력하세요. 규격 숫자 4L은 수량으로 쓰지 않습니다." };
}

function parseCommandAction(compactText) {
  return QUICK_ACTIONS.find((action) => {
    return action.keywords.some((keyword) => compactText.includes(compactCommandText(keyword)));
  }) || null;
}

function parseCommandWarehouse(compactText) {
  if (compactText.includes("1층") || compactText.includes("1f")) return "1층 창고";
  if (compactText.includes("2층") || compactText.includes("2f")) return "2층 창고";
  return selectedWarehouse();
}

function parseCommandField(compactText, item, action) {
  if (compactText.includes("라벨") || compactText.includes("label")) return "label";
  if (compactText.includes("용기") || compactText.includes("container")) return "container";
  if (compactText.includes("뚜껑") || compactText.includes("캡") || compactText.includes("cap")) return "cap";
  if (compactText.includes("불량") || compactText.includes("defect")) return "finished";
  if (action && action.type === "produce") return "finished";
  return item.field || selectedField();
}

function findQuickCommandItem(rawText) {
  const compactText = compactCommandText(rawText);
  const scored = state.items.map((item) => {
    const profile = QUICK_ITEM_ALIASES.find((entry) => entry.code === item.code) || {};
    let score = 0;
    if (compactText.includes(compactCommandText(item.code))) score += 12;
    if (compactText.includes(compactCommandText(item.name))) score += 10;
    (profile.aliases || []).forEach((alias) => {
      if (compactText.includes(compactCommandText(alias))) score += 14;
    });
    (profile.terms || []).forEach((term) => {
      if (compactText.includes(compactCommandText(term))) score += 2;
    });
    (profile.sizes || []).forEach((size) => {
      if (compactText.includes(compactCommandText(size))) score += 4;
    });
    return { item, score };
  }).filter((row) => row.score > 0).sort((a, b) => b.score - a.score);

  if (!scored.length) {
    return { error: "품목을 찾지 못했습니다. 품목명이나 코드를 더 정확히 적어주세요." };
  }
  if (scored.length > 1 && scored[0].score === scored[1].score) {
    return { error: "품목 후보가 여러 개입니다. 4L, 20L, 500ml처럼 규격을 함께 적어주세요." };
  }
  return { item: scored[0].item };
}

function buildQuickCommand(rawText) {
  const sourceText = String(rawText || "").trim();
  const compactText = compactCommandText(sourceText);
  if (!sourceText) return { ok: false, error: "작업 문장을 입력하세요." };

  const match = findQuickCommandItem(sourceText);
  if (match.error) return { ok: false, error: match.error, sourceText };

  const action = parseCommandAction(compactText);
  if (!action) {
    return { ok: false, error: "작업을 찾지 못했습니다. 생산, 입고, 불량 처리, 폐기 중 하나를 적어주세요.", sourceText };
  }

  const quantityResult = parseCommandQuantity(sourceText);
  if (!quantityResult.ok) {
    return { ok: false, error: quantityResult.error, sourceText };
  }
  const quantity = quantityResult.quantity;
  if (!Number.isFinite(quantity) || quantity <= 0 || Math.floor(quantity) !== quantity) {
    return { ok: false, error: "수량은 1개 이상의 정수로 적어주세요.", sourceText };
  }

  const item = match.item;
  const warehouse = parseCommandWarehouse(compactText);
  const field = parseCommandField(compactText, item, action);
  const before = locationQty(item, warehouse, field);
  const delta = action.mode === "increase" ? quantity : -quantity;
  const after = before + delta;
  const defectBefore = locationQty(item, warehouse, "defect");
  const defectAfter = action.mode === "move-to-defect" ? defectBefore + quantity : defectBefore;

  if (after < 0) {
    return {
      ok: false,
      error: `${item.name} ${warehouse} ${fieldLabel(field)} 재고가 ${before}개라서 ${quantity}개를 차감할 수 없습니다.`,
      sourceText
    };
  }

  return {
    ok: true,
    sourceText,
    itemCode: item.code,
    itemName: item.name,
    actionType: action.type,
    actionLabel: action.label,
    actionNote: action.note,
    actionMode: action.mode,
    risk: action.risk,
    quantity,
    field,
    targetField: action.mode === "move-to-defect" ? "defect" : "",
    warehouse,
    before,
    after,
    defectBefore,
    defectAfter,
    delta
  };
}

function commandImpactText(command) {
  if (command.actionMode === "move-to-defect") {
    return `${fieldLabel(command.field)} ${formatNumber(command.before)} → ${formatNumber(command.after)}, ${fieldLabel(command.targetField)} ${formatNumber(command.defectBefore)} → ${formatNumber(command.defectAfter)}`;
  }
  return `${formatNumber(command.before)} → ${formatNumber(command.after)} (${command.delta > 0 ? "+" : ""}${formatNumber(command.delta)})`;
}

function fieldLabel(field) {
  return {
    finished: "완제품",
    label: "라벨",
    container: "용기",
    cap: "뚜껑",
    defect: "불량"
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
  renderCommandCenter(items, field, warehouse);
  renderInventory(items, field, warehouse);
  renderCountList(items, field, warehouse);
  renderQueue();
  renderAudit();
  renderMap(items, field, warehouse);
  renderQuickCommandPreview();
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

function commandRow(title, body, badge, tone, href) {
  return {
    title,
    body,
    badge,
    tone: tone || "",
    href: href || "#workbench"
  };
}

function renderCommandRows(rows, emptyTitle, emptyBody) {
  if (!rows.length) {
    return `
      <article class="lane-item is-empty">
        <div>
          <strong>${emptyTitle}</strong>
          <span>${emptyBody}</span>
        </div>
      </article>
    `;
  }
  return rows.slice(0, 4).map((row) => `
    <article class="lane-item ${row.tone}">
      <div>
        <strong>${row.title}</strong>
        <span>${row.body}</span>
      </div>
      <a class="lane-link" href="${row.href}">${row.badge}</a>
    </article>
  `).join("");
}

function renderCommandCenter(items, field, warehouse) {
  const endpoint = localStorage.getItem(ENDPOINT_KEY) || "";
  const pending = state.queue.length;
  const retryJobs = state.queue.filter((job) => job.status === "retry" || job.attempts > 1);
  const zeroItems = items.filter((item) => locationQty(item, warehouse, field) === 0);
  const lowItems = items.filter((item) => {
    const qty = locationQty(item, warehouse, field);
    return qty > 0 && qty <= 3;
  });
  const recentDiffRows = state.audit.filter((row) => Number(row.delta || 0) !== 0);
  const tasks = [];
  const exceptions = [];
  const recommendations = [];

  if (pending) {
    tasks.push(commandRow("미전송 저장 보내기", `${pending}건이 브라우저 안에 대기 중입니다.`, `${pending}건`, "is-warn", "#settings"));
  }
  if (items.length) {
    tasks.push(commandRow("현재 필터 실사 진행", `${warehouse} · ${fieldLabel(field)} 기준 ${items.length}개 품목`, `${items.length}개`, "", "#mobile"));
  }
  if (recentDiffRows.length) {
    tasks.push(commandRow("차이 품목 재확인", `최근 실사에서 차이가 난 기록 ${recentDiffRows.length}건`, `${recentDiffRows.length}건`, "is-blue", "#audit"));
  }

  if (!state.operator) {
    exceptions.push(commandRow("작업자 로그인 필요", "저장과 감사 로그에 작업자 이름이 남아야 합니다.", "로그인", "is-danger", "#settings"));
  }
  if (retryJobs.length) {
    exceptions.push(commandRow("전송 재시도 확인", `서버 저장 실패 또는 재시도 상태 ${retryJobs.length}건`, `${retryJobs.length}건`, "is-danger", "#settings"));
  }
  if (zeroItems.length) {
    const names = zeroItems.slice(0, 2).map((item) => item.code).join(", ");
    exceptions.push(commandRow("0 재고 품목 점검", `${names}${zeroItems.length > 2 ? " 외" : ""} 선택 창고 수량이 0입니다.`, `${zeroItems.length}개`, "is-danger", "#mobile"));
  }
  if (lowItems.length) {
    const names = lowItems.slice(0, 2).map((item) => item.code).join(", ");
    exceptions.push(commandRow("저재고 보충 후보", `${names}${lowItems.length > 2 ? " 외" : ""} 선택 창고 수량이 3개 이하입니다.`, `${lowItems.length}개`, "is-warn", "#inventory"));
  }

  if (!endpoint) {
    recommendations.push(commandRow("Apps Script 연결", "실제 Google Sheets 저장을 위해 Web App URL을 연결하세요.", "연결", "is-blue", "#settings"));
  }
  recommendations.push(commandRow("문장 입력으로 처리", "예: 그린자임 4리터 30개 생산처럼 말로 작업을 넣습니다.", "입력", "", "#workbench"));
  recommendations.push(commandRow("주기 실사 후보 만들기", "0 재고와 저재고 품목부터 주기 실사 대상으로 잡으세요.", "실사", "", "#mobile"));
  if (recentDiffRows.length) {
    recommendations.push(commandRow("차이 사유 남기기", "수량 차이가 반복되면 감사 로그에서 원인 메모를 확인해야 합니다.", "로그", "is-blue", "#audit"));
  }

  const riskCount = exceptions.length;
  els.commandCenterBadge.textContent = riskCount ? `${riskCount}개 위험` : "정상";
  els.commandCenterBadge.className = `badge ${riskCount ? "is-red" : "is-blue"}`;
  els.workTaskCount.textContent = `${tasks.length}건`;
  els.exceptionCount.textContent = `${exceptions.length}건`;
  els.recommendationCount.textContent = `${recommendations.length}건`;
  els.workTaskList.innerHTML = renderCommandRows(tasks, "오늘 작업 없음", "필터를 바꾸거나 빠른 작업을 입력하면 우선순위가 생깁니다.");
  els.exceptionList.innerHTML = renderCommandRows(exceptions, "큰 위험 없음", "로그인, 전송, 0 재고 상태가 안정적입니다.");
  els.recommendationList.innerHTML = renderCommandRows(recommendations, "추천 없음", "현재 흐름에서 추가 안내가 필요하지 않습니다.");
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
        <strong>${row.itemCode} ${row.label || "재고 실사"} ${row.impactText || `${row.before} → ${row.after}`}</strong>
        <span>${row.operator} · ${row.warehouse} · ${fieldLabel(row.field)} · ${row.time}${row.sourceText ? ` · "${row.sourceText}"` : ""}</span>
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

function renderQuickCommandPreview() {
  if (!els.quickCommandPreview) return;
  if (!pendingQuickCommand) {
    els.quickCommandPreview.className = "quick-command-preview is-empty";
    els.quickCommandPreview.innerHTML = `
      <strong>아직 해석한 작업이 없습니다</strong>
      <span>저장 전 확인 카드가 먼저 표시됩니다.</span>
    `;
    els.quickCommandApplyBtn.disabled = true;
    return;
  }

  if (!pendingQuickCommand.ok) {
    els.quickCommandPreview.className = "quick-command-preview is-error";
    els.quickCommandPreview.innerHTML = `
      <strong>해석 실패</strong>
      <span>${pendingQuickCommand.error}</span>
    `;
    els.quickCommandApplyBtn.disabled = true;
    return;
  }

  const command = pendingQuickCommand;
  els.quickCommandPreview.className = `quick-command-preview ${command.risk === "high" ? "is-danger" : ""}`;
  els.quickCommandPreview.innerHTML = `
    <div class="quick-command-summary">
      <strong>${command.actionLabel}</strong>
      <span>${command.sourceText}</span>
    </div>
    <dl class="quick-command-grid">
      <div><dt>품목</dt><dd>${command.itemCode} · ${command.itemName}</dd></div>
      <div><dt>창고/구역</dt><dd>${command.warehouse} · ${fieldLabel(command.field)}</dd></div>
      <div><dt>수량</dt><dd>${formatNumber(command.quantity)}개</dd></div>
      <div><dt>반영</dt><dd>${commandImpactText(command)}</dd></div>
      <div><dt>위험도</dt><dd>${command.risk === "high" ? "재고 감소/이동" : "일반 입고"}</dd></div>
    </dl>
    <p>${command.actionNote}</p>
  `;
  els.quickCommandApplyBtn.disabled = false;
}

function requireOperator() {
  if (state.operator) return true;
  openLogin();
  showToast("작업자 로그인 후 저장할 수 있습니다.");
  return false;
}

function saveCount(itemCode, countedValue) {
  if (!requireOperator()) return;
  if (!requireLiveInventory()) return;
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

function previewQuickCommand() {
  pendingQuickCommand = buildQuickCommand(els.quickCommandInput.value);
  renderQuickCommandPreview();
}

function clearQuickCommand() {
  pendingQuickCommand = null;
  els.quickCommandInput.value = "";
  renderQuickCommandPreview();
}

function applyQuickCommand() {
  if (!pendingQuickCommand || !pendingQuickCommand.ok) {
    showToast("먼저 작업 문장을 해석하세요.");
    return;
  }
  if (!requireOperator()) return;
  if (!requireLiveInventory()) return;

  const started = performance.now();
  const latestCommand = buildQuickCommand(pendingQuickCommand.sourceText);
  if (!latestCommand.ok) {
    pendingQuickCommand = latestCommand;
    renderQuickCommandPreview();
    showToast("재고 상태가 바뀌었거나 해석이 안전하지 않습니다. 다시 확인하세요.");
    return;
  }
  if (
    latestCommand.before !== pendingQuickCommand.before ||
    latestCommand.after !== pendingQuickCommand.after ||
    latestCommand.defectBefore !== pendingQuickCommand.defectBefore ||
    latestCommand.defectAfter !== pendingQuickCommand.defectAfter
  ) {
    pendingQuickCommand = latestCommand;
    renderQuickCommandPreview();
    showToast("재고가 바뀌어 확인 카드를 새로 만들었습니다. 다시 확인하세요.");
    return;
  }

  const command = latestCommand;
  const item = state.items.find((candidate) => candidate.code === command.itemCode);
  if (!item) {
    showToast("품목을 다시 찾지 못했습니다. 새로 해석하세요.");
    return;
  }

  if (!item.locations[command.warehouse]) item.locations[command.warehouse] = {};
  item.locations[command.warehouse][command.field] = command.after;
  recalcTotal(item, command.field);
  if (command.actionMode === "move-to-defect") {
    item.locations[command.warehouse][command.targetField] = command.defectAfter;
    recalcTotal(item, command.targetField);
  }

  const auditRow = {
    id: `a_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    type: "quick-command",
    itemCode: command.itemCode,
    field: command.field,
    warehouse: command.warehouse,
    before: command.before,
    after: command.after,
    delta: command.delta,
    label: command.actionLabel,
    targetField: command.targetField,
    defectBefore: command.defectBefore,
    defectAfter: command.defectAfter,
    risk: command.risk,
    impactText: commandImpactText(command),
    sourceText: command.sourceText,
    operator: state.operator.name,
    time: new Date().toLocaleString("ko-KR")
  };
  state.audit.unshift(auditRow);
  state.queue.push({
    id: `q_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    action: "quickInventoryCommand",
    itemCode: command.itemCode,
    field: command.field,
    warehouse: command.warehouse,
    before: command.before,
    after: command.after,
    delta: command.delta,
    label: command.actionLabel,
    targetField: command.targetField,
    defectBefore: command.defectBefore,
    defectAfter: command.defectAfter,
    risk: command.risk,
    impactText: commandImpactText(command),
    sourceText: command.sourceText,
    status: "waiting",
    attempts: 0,
    auditId: auditRow.id
  });

  lastLatencyMs = performance.now() - started;
  pendingQuickCommand = null;
  els.quickCommandInput.value = "";
  saveState();
  scheduleRender();
  showToast(`${command.actionLabel} ${formatNumber(command.quantity)}개를 화면에 반영했습니다.`);
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
  const endpoint = currentEndpoint();
  if (endpoint && !isLiveReady()) {
    const refreshed = await fetchLiveInventory();
    if (!refreshed) {
      showToast("재고를 불러온 뒤에 저장을 보낼 수 있습니다. 로그인하거나 새로고침하세요.");
      scheduleRender();
      return;
    }
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
    if (endpoint) {
      const refreshedAfterWrite = await fetchLiveInventory();
      if (!refreshedAfterWrite) {
        showToast("저장은 완료됐지만 최신 재고를 다시 불러오지 못했습니다. 로그인하거나 새로고침하세요.");
        scheduleRender();
        return;
      }
    }
  } catch (error) {
    if (error.sessionExpired) {
      job.status = "needs-login";
      if (state.operator) state.operator.sessionToken = "";
      invalidateLiveInventory();
      saveState();
      showToast("로그인이 만료되었습니다. 다시 로그인하면 대기 중인 저장이 이어집니다.");
      console.warn(error);
      scheduleRender();
      return;
    }
    job.status = "retry";
    saveState();
    showToast("서버 저장 실패. 큐에 남겨 다시 보낼 수 있습니다.");
    console.warn(error);
    scheduleRender();
    return;
  }
  scheduleRender();
  if (state.queue.length && isLiveReady()) scheduleFlush();
}

function sendJob(job) {
  const endpoint = localStorage.getItem(ENDPOINT_KEY) || "";
  if (!endpoint) {
    return new Promise((resolve) => setTimeout(resolve, 850));
  }
  const auth = operatorAuthPayload();
  if (!auth.operatorSessionToken) {
    throw new Error("Server login required");
  }
  return postEndpoint(job.action || "saveStockCount", { job, auth });
}

function postEndpoint(action, payload, endpointOverride) {
  const endpoint = endpointOverride || localStorage.getItem(ENDPOINT_KEY) || "";
  if (!endpoint) return Promise.reject(new Error("Endpoint is not configured"));
  return fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(Object.assign({ action }, payload || {}))
  }).then((response) => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json().catch(() => ({}));
  }).then((data) => {
    if (data && data.ok === false) {
      const error = new Error(data.error || "Server rejected the request");
      if (isSessionExpiredMessage(data.error)) error.sessionExpired = true;
      throw error;
    }
    return data;
  });
}

function isSessionExpiredMessage(message) {
  return /로그인이 만료되었습니다/.test(String(message || ""));
}

function operatorAuthPayload() {
  const operator = state.operator || {};
  return {
    operatorId: operator.id || operator.operatorId || "",
    operatorSessionToken: operator.sessionToken || operator.operatorSessionToken || ""
  };
}

function currentEndpoint() {
  return localStorage.getItem(ENDPOINT_KEY) || "";
}

function invalidateLiveInventory() {
  liveInventory = { endpoint: "", sessionToken: "", ready: false };
}

function isLiveReady() {
  const endpoint = currentEndpoint();
  if (!endpoint) return true;
  const token = operatorAuthPayload().operatorSessionToken;
  return !!token && liveInventory.ready && liveInventory.endpoint === endpoint && liveInventory.sessionToken === token;
}

function requireLiveInventory() {
  if (isLiveReady()) return true;
  showToast("재고를 먼저 불러와야 합니다. 로그인하거나 재고를 새로고침하세요.");
  return false;
}

function applyInventorySnapshot(data) {
  const rawItems = Array.isArray(data && data.items) ? data.items : [];
  const safeItems = rawItems.filter((item) => item && typeof item.code === "string" && item.code.trim().length > 0);
  if (!safeItems.length) return false;
  state.items = safeItems.map((item) => ({
    code: String(item.code),
    name: String(item.name || item.code),
    field: item.field || "finished",
    stocks: Object.assign({}, item.stocks || {}),
    locations: Object.assign({}, item.locations || {})
  }));
  saveState();
  return true;
}

async function fetchLiveInventory() {
  const endpoint = currentEndpoint();
  if (!endpoint) return true;
  const auth = operatorAuthPayload();
  if (!auth.operatorSessionToken) {
    invalidateLiveInventory();
    return false;
  }
  try {
    const data = await postEndpoint("getInventory", { auth });
    if (!applyInventorySnapshot(data)) {
      invalidateLiveInventory();
      return false;
    }
    liveInventory = { endpoint, sessionToken: auth.operatorSessionToken, ready: true };
    return true;
  } catch (error) {
    console.warn("getInventory failed:", error && error.message);
    invalidateLiveInventory();
    return false;
  }
}

async function logout() {
  const endpoint = currentEndpoint();
  const auth = operatorAuthPayload();
  try {
    if (endpoint && auth.operatorSessionToken) {
      await postEndpoint("logoutOperator", { auth });
    }
  } catch (error) {
    console.warn("logoutOperator failed:", error && error.message);
  } finally {
    state.operator = null;
    invalidateLiveInventory();
    saveState();
    render();
    showToast("로그아웃했습니다.");
  }
}

function setOperatorFromServer(operator, sessionToken, sessionExpiresAt) {
  const source = operator || {};
  state.operator = {
    id: source.operatorId || source.id || "",
    name: source.name || "",
    role: source.role || "",
    sessionToken: sessionToken || source.sessionToken || "",
    sessionExpiresAt: sessionExpiresAt || source.sessionExpiresAt || ""
  };
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

function openPinRecoveryPage() {
  const endpoint = localStorage.getItem(ENDPOINT_KEY) || "";
  if (!endpoint) {
    showToast("서버 연결 주소가 없어 PIN 복구 페이지를 열 수 없습니다.");
    return;
  }
  window.open(`${endpoint}?mode=recover-pin`, "_blank", "noopener");
}

async function login(operatorId, pin) {
  const id = String(operatorId || "").trim().toUpperCase();
  const cleanPin = String(pin || "").trim();
  const endpoint = localStorage.getItem(ENDPOINT_KEY) || "";
  if (endpoint) {
    try {
      const data = await postEndpoint("authenticateOperator", {
        operatorId: id,
        pin: cleanPin,
        sessionScope: "stock"
      });
      setOperatorFromServer(data.operator, data.sessionToken, data.sessionExpiresAt);
      saveState();
      render();
      els.pinInput.value = "";
      closeLogin();
      focusFieldEntryOnMobile();
      const ready = await fetchLiveInventory();
      render();
      showToast(ready ? "작업자 서버 로그인 완료" : "로그인은 됐지만 재고를 불러오지 못했습니다. 새로고침 후 다시 시도하세요.");
      if (ready && state.queue.length) scheduleFlush();
    } catch (error) {
      console.warn(error);
      showToast(`서버 로그인 실패: ${error && error.message ? error.message : "작업자 ID/PIN 또는 배포 권한을 확인하세요."}`);
    }
    return;
  }
  if (id === "DEMO01" && cleanPin === "0000") {
    state.operator = { id, name: "데모 관리자", role: "재고관리자" };
    saveState();
    render();
    showToast("작업자 로그인 완료");
    closeLogin();
    focusFieldEntryOnMobile();
    return;
  }
  showToast("작업자 ID 또는 PIN을 확인하세요.");
}

function focusFieldEntryOnMobile() {
  if (!window.matchMedia("(max-width: 760px)").matches) return;
  setTimeout(() => els.searchInput?.focus(), 0);
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
  els.quickCommandForm.addEventListener("submit", (event) => {
    event.preventDefault();
    previewQuickCommand();
  });
  els.quickCommandInput.addEventListener("input", () => {
    if (pendingQuickCommand) previewQuickCommand();
  });
  els.quickCommandApplyBtn.addEventListener("click", applyQuickCommand);
  els.quickCommandClearBtn.addEventListener("click", clearQuickCommand);
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
  els.showPinRecoveryBtn.addEventListener("click", openPinRecoveryPage);
  els.logoutBtn.addEventListener("click", () => {
    logout();
  });
  els.loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    login(els.operatorIdInput.value, els.pinInput.value);
  });
  els.flushNowBtn.addEventListener("click", flushQueue);
  els.resetDemoBtn.addEventListener("click", resetDemo);
  els.exportBtn.addEventListener("click", exportCsv);
  els.saveEndpointBtn.addEventListener("click", async () => {
    const oldEndpoint = currentEndpoint();
    const newEndpoint = els.endpointInput.value.trim();
    if (newEndpoint === oldEndpoint) {
      showToast("연결 주소를 저장했습니다.");
      return;
    }
    const auth = operatorAuthPayload();
    try {
      if (oldEndpoint && auth.operatorSessionToken) {
        await postEndpoint("logoutOperator", { auth }, oldEndpoint).catch((error) => {
          console.warn("logoutOperator failed:", error && error.message);
        });
      }
    } finally {
      localStorage.setItem(ENDPOINT_KEY, newEndpoint);
      invalidateLiveInventory();
      state.operator = null;
      saveState();
      render();
      showToast("연결 주소를 저장했습니다.");
    }
  });
}

async function init() {
  els.endpointInput.value = currentEndpoint();
  bindEvents();
  render();
  const endpoint = currentEndpoint();
  if (!endpoint) {
    if (state.queue.length) scheduleFlush();
    return;
  }
  const auth = operatorAuthPayload();
  if (!auth.operatorSessionToken) return;
  const ready = await fetchLiveInventory();
  render();
  if (ready && state.queue.length) scheduleFlush();
}

init();

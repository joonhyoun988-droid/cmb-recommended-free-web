(function () {
  "use strict";

  var KEY = "cmb_rum_events_v1";
  var MAX_EVENTS = 200;
  var vitals = {
    lcp: null,
    cls: 0,
    inp: null,
    firstInput: null
  };

  function nowIso() {
    return new Date().toISOString();
  }

  function readEvents() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch (error) {
      return [];
    }
  }

  function writeEvents(events) {
    try {
      localStorage.setItem(KEY, JSON.stringify(events.slice(-MAX_EVENTS)));
    } catch (error) {
      // Storage can be disabled. RUM must never break the app.
    }
  }

  function record(type, value, detail) {
    var event = {
      type: type,
      value: value,
      detail: detail || {},
      path: location.pathname,
      visibility: document.visibilityState,
      at: nowIso()
    };
    var events = readEvents();
    events.push(event);
    writeEvents(events);
    sendEvent(event);
  }

  function endpoint() {
    var endpoints = window.CMB_TELEMETRY_ENDPOINTS || {};
    return typeof endpoints.rum === "string" ? endpoints.rum.trim() : "";
  }

  function sendEvent(event) {
    var url = endpoint();
    if (!url) return;
    var payload = JSON.stringify({
      stream: "cmb_rum",
      version: 1,
      event: event
    });
    try {
      if (navigator.sendBeacon) {
        var blob = new Blob([payload], { type: "application/json" });
        if (navigator.sendBeacon(url, blob)) return;
      }
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
        mode: "cors"
      }).catch(function () {
        // Remote telemetry must never interrupt field work.
      });
    } catch (error) {
      // Remote telemetry is optional and best-effort.
    }
  }

  function observe(type, handler, options) {
    if (!("PerformanceObserver" in window)) return;
    try {
      var observer = new PerformanceObserver(function (list) {
        list.getEntries().forEach(handler);
      });
      observer.observe(Object.assign({ type: type, buffered: true }, options || {}));
    } catch (error) {
      // Unsupported metric in this browser.
    }
  }

  observe("largest-contentful-paint", function (entry) {
    vitals.lcp = Math.round(entry.startTime);
    record("LCP", vitals.lcp, { element: entry.element ? entry.element.tagName : null });
  });

  observe("layout-shift", function (entry) {
    if (entry.hadRecentInput) return;
    vitals.cls = Number((vitals.cls + entry.value).toFixed(4));
    record("CLS", vitals.cls, { latestShift: entry.value });
  });

  observe("first-input", function (entry) {
    vitals.firstInput = Math.round(entry.processingStart - entry.startTime);
    record("FID_FALLBACK", vitals.firstInput, {});
  });

  observe("event", function (entry) {
    if (!entry.interactionId || entry.duration <= 0) return;
    var candidate = Math.round(entry.duration);
    if (vitals.inp === null || candidate > vitals.inp) {
      vitals.inp = candidate;
      record("INP_CANDIDATE", vitals.inp, { name: entry.name });
    }
  }, { durationThreshold: 40 });

  window.addEventListener("pagehide", function () {
    record("RUM_SUMMARY", null, {
      lcp: vitals.lcp,
      cls: vitals.cls,
      inp: vitals.inp,
      firstInput: vitals.firstInput
    });
  });

  window.CMBRUM = {
    record: record,
    snapshot: function () {
      return {
        key: KEY,
        endpointConfigured: Boolean(endpoint()),
        vitals: Object.assign({}, vitals),
        events: readEvents()
      };
    },
    clear: function () {
      localStorage.removeItem(KEY);
    }
  };
  document.documentElement.dataset.cmbRumClient = "ready";
})();

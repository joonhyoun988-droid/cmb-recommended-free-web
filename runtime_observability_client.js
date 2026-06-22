(function () {
  "use strict";

  var KEY = "cmb_ops_events_v1";
  var MAX_EVENTS = 200;

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
      // Observability must never block field work.
    }
  }

  function record(level, name, detail) {
    var event = {
      level: level,
      name: name,
      detail: detail || {},
      path: location.pathname,
      at: new Date().toISOString()
    };
    var events = readEvents();
    events.push(event);
    writeEvents(events);
    sendEvent(event);
  }

  function endpoint() {
    var endpoints = window.CMB_TELEMETRY_ENDPOINTS || {};
    return typeof endpoints.ops === "string" ? endpoints.ops.trim() : "";
  }

  function sendEvent(event) {
    var url = endpoint();
    if (!url) return;
    var payload = JSON.stringify({
      stream: "cmb_ops",
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
        // Remote observability must never interrupt field work.
      });
    } catch (error) {
      // Remote observability is optional and best-effort.
    }
  }

  window.addEventListener("error", function (event) {
    record("error", "window_error", {
      message: event.message,
      source: event.filename,
      line: event.lineno,
      column: event.colno
    });
  });

  window.addEventListener("unhandledrejection", function (event) {
    record("error", "unhandled_rejection", {
      reason: event.reason && event.reason.message ? event.reason.message : String(event.reason)
    });
  });

  window.addEventListener("load", function () {
    setTimeout(function () {
      var nav = performance.getEntriesByType("navigation")[0];
      if (!nav) return;
      record("metric", "navigation_timing", {
        domContentLoaded: Math.round(nav.domContentLoadedEventEnd),
        load: Math.round(nav.loadEventEnd),
        transferSize: nav.transferSize || 0
      });
    }, 0);
  });

  document.addEventListener("visibilitychange", function () {
    record("info", "visibility_change", { visibility: document.visibilityState });
  });

  window.CMBOps = {
    record: record,
    snapshot: function () {
      return {
        key: KEY,
        endpointConfigured: Boolean(endpoint()),
        events: readEvents()
      };
    },
    clear: function () {
      localStorage.removeItem(KEY);
    }
  };
  document.documentElement.dataset.cmbOpsClient = "ready";
})();

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
    var events = readEvents();
    events.push({
      level: level,
      name: name,
      detail: detail || {},
      path: location.pathname,
      at: new Date().toISOString()
    });
    writeEvents(events);
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
        events: readEvents()
      };
    },
    clear: function () {
      localStorage.removeItem(KEY);
    }
  };
  document.documentElement.dataset.cmbOpsClient = "ready";
})();

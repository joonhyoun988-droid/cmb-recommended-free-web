(function () {
  "use strict";

  var config = window.CMB_SENTRY_CONFIG || {};
  var endpointConfig = window.CMB_TELEMETRY_ENDPOINTS || {};
  var dsn = String(config.dsn || endpointConfig.sentryDsn || "").trim();

  function captureException(error, detail) {
    if (window.Sentry && dsn) {
      window.Sentry.captureException(error, { extra: detail || {} });
    }
  }

  if (window.Sentry && dsn) {
    window.Sentry.init({
      dsn: dsn,
      environment: config.environment || "local",
      tracesSampleRate: Number(config.tracesSampleRate || 0)
    });
    document.documentElement.dataset.cmbSentry = "enabled";
  } else {
    document.documentElement.dataset.cmbSentry = "disabled";
  }

  window.CMBSentryBridge = {
    enabled: function () {
      return Boolean(window.Sentry && dsn);
    },
    captureException: captureException
  };
})();

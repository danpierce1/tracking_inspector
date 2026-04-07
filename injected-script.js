(function() {
  // Store original analytics.track if it exists
  const originalAnalyticsTrack = window.analytics?.track;

  // Intercept window.analytics.track
  if (window.analytics) {
    window.analytics.track = function(eventName, properties, context) {
      // Capture the event
      window.postMessage({
        type: 'ODH_TRACKING_EVENT',
        data: {
          eventName,
          properties,
          context,
          timestamp: Date.now()
        }
      }, '*');

      // Call original function
      if (originalAnalyticsTrack) {
        return originalAnalyticsTrack.call(this, eventName, properties, context);
      }
    };
  } else {
    // If analytics doesn't exist yet, intercept when it's created
    let analyticsObj = null;
    Object.defineProperty(window, 'analytics', {
      get: function() {
        return analyticsObj;
      },
      set: function(value) {
        analyticsObj = value;
        if (value && value.track) {
          const originalTrack = value.track;
          value.track = function(eventName, properties, context) {
            window.postMessage({
              type: 'ODH_TRACKING_EVENT',
              data: {
                eventName,
                properties,
                context,
                timestamp: Date.now()
              }
            }, '*');
            return originalTrack.call(this, eventName, properties, context);
          };
        }
      },
      configurable: true
    });
  }

  // Also intercept console.log for DEV_MODE tracking
  const originalConsoleLog = console.log;
  console.log = function(...args) {
    const message = args[0];
    if (typeof message === 'string' && message.startsWith('Telemetry event triggered:')) {
      // Parse the dev mode console log - allow empty version string and event names with spaces
      const match = message.match(/Telemetry event triggered: (.+?) - (.+?) for version (.*)/s);
      if (match) {
        try {
          const eventName = match[1];
          const properties = JSON.parse(match[2]);
          const version = match[3] || 'unknown';

          window.postMessage({
            type: 'ODH_TRACKING_EVENT',
            data: {
              eventName,
              properties,
              context: { app: { version } },
              timestamp: Date.now(),
              devMode: true
            }
          }, '*');
        } catch (e) {
          // Failed to parse event, silently ignore
        }
      }
    }
    return originalConsoleLog.apply(console, args);
  };
})();

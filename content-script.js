// Store events in case the panel is opened after events have fired
window.__ODH_TRACKED_EVENTS__ = window.__ODH_TRACKED_EVENTS__ || [];

// Inject script to intercept tracking calls
const script = document.createElement('script');
script.src = chrome.runtime.getURL('injected-script.js');
(document.head || document.documentElement).appendChild(script);
script.onload = function() {
  script.remove();
};

// Listen for events from the injected script
window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  if (event.data.type === 'ODH_TRACKING_EVENT') {
    const eventData = event.data.data;

    // Store the event
    window.__ODH_TRACKED_EVENTS__.push(eventData);

    // Forward to the DevTools panel
    try {
      chrome.runtime.sendMessage({
        type: 'ODH_TRACKING_EVENT',
        data: eventData
      });
    } catch (error) {
      // Extension context invalidated - page needs refresh after extension reload
    }
  }
});

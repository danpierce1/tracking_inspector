// Background script to relay messages between content script and DevTools
const connections = new Map();

// Listen for connections from DevTools panels
chrome.runtime.onConnect.addListener((port) => {
  const tabId = port.name;
  connections.set(tabId, port);

  port.onDisconnect.addListener(() => {
    connections.delete(tabId);
  });
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'ODH_TRACKING_EVENT' && sender.tab) {
    // Forward to the DevTools panel for this tab
    const port = connections.get(String(sender.tab.id));
    if (port) {
      port.postMessage(message);
    }
  }
});

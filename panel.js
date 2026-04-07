let events = [];
let autoScroll = true;

const eventsContainer = document.getElementById('eventsContainer');
const clearBtn = document.getElementById('clearBtn');
const exportBtn = document.getElementById('exportBtn');
const searchInput = document.getElementById('searchInput');
const autoScrollToggle = document.getElementById('autoScrollToggle');

// Connect to background script
const tabId = chrome.devtools.inspectedWindow.tabId;
let port;

function connectToBackground() {
  port = chrome.runtime.connect({ name: String(tabId) });

  // Listen for messages from the background script
  port.onMessage.addListener((message) => {
    if (message.type === 'ODH_TRACKING_EVENT') {
      addEvent(message.data);
    }
  });

  port.onDisconnect.addListener(() => {
    // Reconnect after a short delay
    setTimeout(connectToBackground, 1000);
  });
}

connectToBackground();

// Request existing events from the content script
chrome.devtools.inspectedWindow.eval(`
  if (window.__ODH_TRACKED_EVENTS__) {
    window.__ODH_TRACKED_EVENTS__;
  }
`, (result, isException) => {
  if (!isException && result && Array.isArray(result)) {
    result.forEach(event => addEvent(event));
  }
});

function addEvent(eventData) {
  events.push(eventData);
  updateEventCount();

  if (shouldShowEvent(eventData)) {
    renderEvent(eventData);
  }

  if (autoScroll) {
    setTimeout(() => {
      eventsContainer.scrollTop = eventsContainer.scrollHeight;
    }, 100);
  }
}

function shouldShowEvent(eventData) {
  const searchTerm = searchInput.value.toLowerCase();
  if (!searchTerm) return true;
  return eventData.eventName.toLowerCase().includes(searchTerm);
}

function renderEvent(eventData) {
  const emptyState = eventsContainer.querySelector('.empty-state');
  if (emptyState) {
    emptyState.remove();
  }

  const card = document.createElement('div');
  card.className = 'event-card';
  card.dataset.eventId = eventData.timestamp;

  const header = document.createElement('div');
  header.className = 'event-header';

  const headerLeft = document.createElement('div');
  headerLeft.className = 'event-header-left';

  const badge = document.createElement('span');
  badge.className = 'event-badge';
  badge.textContent = 'EVENT';

  const name = document.createElement('span');
  name.className = 'event-name';
  name.textContent = eventData.eventName;

  headerLeft.appendChild(badge);
  headerLeft.appendChild(name);

  const headerRight = document.createElement('div');
  headerRight.className = 'event-header-right';

  const time = document.createElement('span');
  time.className = 'event-time';
  time.textContent = formatTime(eventData.timestamp);

  const expandIcon = document.createElement('span');
  expandIcon.className = 'expand-icon';
  expandIcon.textContent = '▶';

  headerRight.appendChild(time);
  headerRight.appendChild(expandIcon);

  header.appendChild(headerLeft);
  header.appendChild(headerRight);

  const body = document.createElement('div');
  body.className = 'event-body';

  const details = document.createElement('div');
  details.className = 'event-details';

  // Properties section
  if (eventData.properties && Object.keys(eventData.properties).length > 0) {
    const propsSection = document.createElement('div');
    propsSection.className = 'detail-section';

    const propsLabel = document.createElement('div');
    propsLabel.className = 'detail-label';
    propsLabel.textContent = 'Properties';

    const propsList = document.createElement('div');
    propsList.className = 'property-list';

    Object.entries(eventData.properties).forEach(([key, value]) => {
      const item = document.createElement('div');
      item.className = 'property-item';

      const keySpan = document.createElement('span');
      keySpan.className = 'property-key';
      keySpan.textContent = key;

      const valueSpan = document.createElement('span');
      valueSpan.className = `property-value ${getValueType(value)}`;
      valueSpan.textContent = formatValue(value);

      item.appendChild(keySpan);
      item.appendChild(valueSpan);
      propsList.appendChild(item);
    });

    propsSection.appendChild(propsLabel);
    propsSection.appendChild(propsList);
    details.appendChild(propsSection);
  }

  // Context section (version info)
  if (eventData.context) {
    const contextSection = document.createElement('div');
    contextSection.className = 'detail-section';

    const contextLabel = document.createElement('div');
    contextLabel.className = 'detail-label';
    contextLabel.textContent = 'Context';

    const contextCode = document.createElement('pre');
    contextCode.className = 'json-code';
    contextCode.textContent = JSON.stringify(eventData.context, null, 2);

    contextSection.appendChild(contextLabel);
    contextSection.appendChild(contextCode);
    details.appendChild(contextSection);
  }

  // Raw JSON section
  const rawSection = document.createElement('div');
  rawSection.className = 'detail-section';

  const rawLabel = document.createElement('div');
  rawLabel.className = 'detail-label';
  rawLabel.textContent = 'Raw Event Data';

  const rawCode = document.createElement('pre');
  rawCode.className = 'json-code';
  rawCode.textContent = JSON.stringify(eventData, null, 2);

  rawSection.appendChild(rawLabel);
  rawSection.appendChild(rawCode);
  details.appendChild(rawSection);

  body.appendChild(details);

  card.appendChild(header);
  card.appendChild(body);

  header.addEventListener('click', () => {
    card.classList.toggle('expanded');
  });

  eventsContainer.appendChild(card);
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3
  });
}

function formatValue(value) {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return `"${value}"`;
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function getValueType(value) {
  if (value === null) return 'null';
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'string') return 'string';
  return 'object';
}

function updateEventCount() {
  const countEl = document.querySelector('.event-count');
  const count = events.length;
  countEl.textContent = `${count} event${count !== 1 ? 's' : ''}`;
}

function clearEvents() {
  events = [];
  eventsContainer.innerHTML = `
    <div class="empty-state">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
      </svg>
      <p>No events captured yet</p>
      <small>Tracking events will appear here when fired</small>
    </div>
  `;
  updateEventCount();
}

function exportEvents() {
  const dataStr = JSON.stringify(events, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `odh-events-${new Date().toISOString()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function filterEvents() {
  eventsContainer.innerHTML = '';

  const filteredEvents = events.filter(shouldShowEvent);

  if (filteredEvents.length === 0) {
    eventsContainer.innerHTML = `
      <div class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <p>No events match your filter</p>
        <small>Try a different search term</small>
      </div>
    `;
  } else {
    filteredEvents.forEach(renderEvent);
  }
}

// Event listeners
clearBtn.addEventListener('click', clearEvents);
exportBtn.addEventListener('click', exportEvents);
searchInput.addEventListener('input', filterEvents);
autoScrollToggle.addEventListener('change', (e) => {
  autoScroll = e.target.checked;
});

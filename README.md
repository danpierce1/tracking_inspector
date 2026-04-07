# 📊 ODH Event Tracker

A sleek Chrome DevTools extension for debugging and monitoring custom tracking events in your ODH application. Works just like the Mixpanel debugger, but tailored specifically for your analytics implementation.

```
┌──────────────────────────────────────────────────────────┐
│  ODH Events                          Clear    Export     │
├──────────────────────────────────────────────────────────┤
│  Filter events...                      [ ] Auto-scroll   │
├──────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────┐  │
│  │ EVENT  User Login Clicked         12:34:56.789     │  │
│  ├────────────────────────────────────────────────────┤  │
│  │ Properties                                         │  │
│  │   userId:  "abc123"                                │  │
│  │   source:  "homepage"                              │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

## ✨ Features

- 🎯 **Real-time Event Capture** - See tracking events as they fire
- 🎨 **Modern Dark UI** - Beautiful interface matching Chrome DevTools aesthetic
- 🔍 **Search & Filter** - Quickly find specific events by name
- 📋 **Detailed Event View** - Expand events to see all properties, context, and raw JSON
- 💾 **Export to JSON** - Download captured events for analysis
- 🎚️ **Auto-scroll** - Toggle automatic scrolling to newest events
- 🔄 **Dual Mode Support** - Captures both production and development tracking calls

## 🚀 Installation

### Option A: Download ZIP (Easiest - No Git Required)

1. Go to the [GitHub repository](<your-repo-url>)
2. Click the green **"Code"** button
3. Click **"Download ZIP"**
4. Extract the ZIP file to a folder on your computer
5. Continue to "Load Extension in Chrome" below

### Option B: Clone with Git

```bash
git clone <your-repo-url>
cd tracking_inspector
```

### Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in the top-right corner)
3. Click **"Load unpacked"**
4. Select the `tracking_inspector` directory
5. The extension icon should appear in your extensions list

### 3. Open DevTools

1. Navigate to your ODH application (e.g., `http://localhost:4010`)
2. Open Chrome DevTools:
   - **Mac**: `Cmd + Option + I`
   - **Windows/Linux**: `F12` or `Ctrl + Shift + I`
3. Look for the **"ODH Events"** tab

   ![ODH Events Tab](.github/screenshots/devtools-tab.png)

## 🎯 Usage

### Viewing Events

Once the extension is loaded and DevTools is open, tracking events will automatically appear in real-time as they fire in your application.

![Event List View](.github/screenshots/event-list.png)

### Expanding Event Details

Click any event card to expand and view:
- **Properties** - All parameters passed with the event
- **Context** - Version information and metadata
- **Raw JSON** - Complete event payload

![Event Details](.github/screenshots/event-details.png)

### Filtering Events

Use the search box to filter events by name:

![Filter Events](.github/screenshots/filter.png)

### Exporting Events

Click the **Export JSON** button to download all captured events as a JSON file for further analysis.

## 🔧 How It Works

The extension intercepts tracking calls from your ODH application:

### Production Mode
Captures calls to `window.analytics.track()`:
```javascript
window.analytics.track(
  'User Clicked Button',
  { buttonId: 'submit', page: 'checkout' },
  { app: { version: '1.2.3' } }
);
```

### Development Mode
Captures console logs in the format:
```javascript
console.log('Telemetry event triggered: User Clicked Button - {"buttonId":"submit"} for version 1.2.3');
```

The extension automatically detects both patterns and displays them in a unified view.

## 🎨 What You'll See

Each event card displays:

- **Event Badge** - Color-coded label
- **Event Name** - The tracking event identifier
- **Timestamp** - Precise time (HH:MM:SS.mmm)
- **Properties** - Key-value pairs with syntax highlighting
- **Context** - Version and metadata
- **Raw JSON** - Full event object for debugging

## 🛠️ Customization

Want to rebrand for your own application? Simple search and replace:

1. **Extension Name**: Search for `"ODH Event Tracker"` in `manifest.json`
2. **Tab Name**: Search for `"ODH Events"` in `devtools.js`
3. **UI Labels**: Update strings in `panel.html`

### Styling

Customize the look by editing `panel.css`:

```css
/* Primary gradient (event badges) */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Dark theme colors */
--background: #1e1e1e;
--surface: #252526;
--border: #3e3e42;
```

## 📁 Project Structure

```
tracking_inspector/
├── manifest.json          # Extension configuration
├── devtools.html/js       # DevTools panel registration
├── panel.html/css/js      # Main UI and event display
├── content-script.js      # Event interception setup
├── injected-script.js     # Analytics interceptor
├── background.js          # Message relay service
├── icon*.png              # Extension icons
└── README.md              # This file
```

## 🔍 Troubleshooting

### The "ODH Events" tab doesn't appear

1. Make sure the extension is enabled in `chrome://extensions/`
2. **Completely close and reopen DevTools** after installing
3. Hard refresh the page: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R`

### Events aren't showing up

1. **Reload the extension** in `chrome://extensions/`
2. **Hard refresh your application page**: `Cmd+Shift+R`
3. Trigger a tracking event
4. Check that events are actually firing (look for console logs in dev mode)

### After reloading the extension

Always **hard refresh your application page** after reloading the extension to reinject the content script.

## 🌐 Browser Compatibility

- ✅ Chrome 88+
- ✅ Edge 88+
- ✅ Brave
- ✅ Any Chromium-based browser with Manifest V3 support

## 📝 License

MIT - Feel free to use and modify for your team!

## 🤝 Contributing

Found a bug or have a feature request? Contributions welcome!

---

**Built with ❤️ for better tracking debugging**

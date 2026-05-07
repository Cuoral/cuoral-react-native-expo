# Changelog

All notable changes to the Cuoral React Native Expo SDK will be documented in this file.

## [1.1.2] - 2026-05-07

### 🧹 Production Cleanup Release

#### Changed
- Removed all debug console logs from production code
- Silent error handling for better performance
- Cleaner production builds

#### Improved
- Reduced bundle size by removing logging overhead
- Better error resilience with silent fallbacks
- Professional production-ready output

#### Documentation
- Moved legacy documentation to `docs/` folder
- Organized technical docs in dedicated directory
- Updated gitignore for test artifacts and logs

## [1.1.1] - 2026-05-07

### 🔧 Compatibility Fix Release

#### Fixed
- Flexible peer dependency versions for broader compatibility
- `@react-native-async-storage/async-storage`: `>=1.0.0` (was `^2.2.0`)
- `expo-web-browser`: `>=13.0.0` (was `~15.0.11`)
- `react-native-webview`: `>=13.0.0` (was `^13.15.0`)

#### Improved
- Works with Expo SDK 51, 52, 53, 54, 55+
- Supports wider range of dependency versions
- Better backwards compatibility

## [1.1.0] - 2026-05-06

### 🚀 Initial npm Release

#### Added
- Published to npm as `cuoral-react-native-expo`
- Production-ready build with TypeScript definitions
- Proper module exports and entry points

## [1.0.0] - 2026-04-28

### 🎉 Major Release - Flutter SDK v0.0.5 Parity + Intelligence Rewrite

This is a complete rewrite implementing Flutter SDK v0.0.5 architecture with event batching, network interception, and advanced intelligence features.

### Added - Intelligence System (Flutter SDK Parity)

- **Event Batching System** (matches Flutter SDK):
  - `EventQueue` class for generic event batching (10 events max, 2s timer)
  - FIFO overflow handling (30 max queue, drops oldest)
  - Concurrent flush protection with `isFlushing` guard
  - Automatic timer reset on each new event
  - Three separate queues: `pageViewQueue`, `consoleErrorQueue`, `apiResponseQueue`

- **Intelligence Manager Rewrite**:
  - Singleton `IntelligenceManager` matching Flutter SDK architecture
  - Custom events with separate batching (not using EventQueue)
  - Screen name filtering (filters `()`, `<>`, `RouteSettings`, etc.)
  - Device metadata collection (platform, viewport, screen size)
  - Automatic initialization when `customer_intelligence: true`

- **Network Interception**:
  - `setupNetworkInterception()` overrides `global.fetch`
  - Tracks 4xx/5xx responses only (not 2xx/3xx)
  - Tracks network failures (status 0)
  - Excludes Cuoral API to prevent infinite loops
  - Duration tracking for all requests
  - Request/response body capture (limited to 1000 chars)

- **Global Error Handler**:
  - `setupErrorHandler()` uses `ErrorUtils.setGlobalHandler`
  - Captures uncaught errors with stack traces
  - Fatal flag tracking in metadata
  - Original handler chaining

- **Enhanced Session Management**:
  - 30-day session expiry checking (`SESSION_EXPIRY_MS`)
  - JSON storage format: `{sessionId, createdAt}` with timestamps
  - Profile setting logic (only if session has no email)
  - 502/504 graceful handling (assume intelligence enabled)
  - 10-second timeout for all API calls

- **New API Methods**:
  - `flush()`: Manually flush all pending event queues
  - `updateIntelligenceSession()`: Sync session ID across system
  - `destroyIntelligence()`: Proper cleanup on unmount

### Added - Hybrid WebView Architecture

- **Hybrid WebView/Browser Architecture**:
  - Uses `react-native-webview` in development/production builds (fully embedded)
  - Falls back to `expo-web-browser` in Expo Go (in-app browser with toolbar)
  - Automatic detection and seamless switching
  - Made `react-native-webview` optional peer dependency

- **Customer Intelligence Tracking**:
  - `trackPageView(screen, metadata?)`: Track screen/page views
  - `trackError(message, stackTrace?, metadata?)`: Track errors manually
  - `trackCustomEvent(name, category, properties?)`: Track custom business events
  - Direct API access via `CuoralIntelligence` export
  - Automatic metadata collection (screen size, platform, user agent)
  - Events sent to Cuoral backend for analytics

- **Ref-based API**: Access methods via component ref:
  - `cuoralRef.current.trackPageView(...)`
  - `cuoralRef.current.trackCustomEvent(...)`
  - `cuoralRef.current.open()` / `close()`
  - `cuoralRef.current.getSessionId()`

- **WebView-based Architecture**: Complete redesign using `react-native-webview`
  - Loads widget from `https://js.cuoral.com/mobile.html`
  - Automatic updates without app releases
  - Smaller bundle size and better performance

- **Enhanced Customization Options**:
  - `buttonColor`: Customize floating button color (default: `#007AFF`)
  - `buttonPosition`: Position button anywhere (`'bottomRight'`, `'bottomLeft'`, `'topRight'`, `'topLeft'`)
  - `buttonSize`: Control button size in pixels (default: `60`)
  - `buttonIcon`: Custom icon using emoji or text (default: `💬`)
  - `showFloatingButton`: Toggle button visibility (default: `true`)

- **Automatic Session Management**:
  - Sessions automatically created and persisted
  - Survives app restarts
  - Automatic session validation and renewal

- **Organization Branding**:
  - Automatically fetches and uses organization's primary color
  - Consistent branding across all touchpoints

- **New Components & Files**:
  - `intelligence.js`: Customer intelligence tracking module
  - `utils.js`: Runtime WebView detection utilities
  - `CuoralWebView`: WebView wrapper with loading states
  - `CuoralModal`: Hybrid modal supporting WebView and expo-web-browser
  - `CuoralBridge`: Communication bridge for WebView messages
  - `types.js`: Message type definitions

- **Debug Mode**: Enable detailed logging with `debug={true}` prop

### Changed

- **Breaking: Session Storage Format**:
  - Old: Plain string session ID
  - New: JSON object `{sessionId: string, createdAt: number}`
  - ⚠️ Existing sessions will be invalidated and recreated on first launch

- **Breaking: Custom Events Payload Format**:
  - Old: Direct array `[{session_id, name, ...}]`
  - New: Wrapper object `{session_id, custom_events: [...]}`
  - Matches Flutter SDK format exactly

- **Breaking: Intelligence Auto-Initialization**:
  - Old: Manual initialization required
  - New: Automatic initialization when `customer_intelligence: true`
  - Controlled by backend session configuration

- **Event Field Names** (matches Flutter SDK):
  - Network events: `status_code` (not `status`)
  - Response body: Object type (not string)
  - Timestamp: Epoch milliseconds for events, ISO string for custom events

- **Breaking**: Component now uses `forwardRef` - must use ref to access tracking methods
- **Breaking**: Prop names updated for clarity:
  - `backgroundColor` → `buttonColor`
  - `icon` → `buttonIcon` (now string instead of React component)
  - `position` → `buttonPosition`
  - `isVisible` → `showFloatingButton`

- **Architecture**: Complete shift from native screens to hybrid WebView/Browser implementation
- **Dependencies**: Now requires `react-native-webview` and `@react-native-async-storage/async-storage`

### Removed

- **Breaking**: Removed unused dependencies:
  - ❌ `socket.io-client` (no longer needed)
  - ❌ `expo-av` (no longer needed)
  - ❌ `expo-image-picker` (no longer needed)
  - ❌ `expo-notifications` (no longer needed)
  - ❌ `react-native-image-picker` (no longer needed)

- **Removed Components**:
  - `HomeScreen`, `ConversationsScreen`, `ChatScreen`, `ChatDetailsScreen`
  - `CuoralContext`, `CuoralProvider`
  - `CuoralWidget` component

### Fixed

- Network interception no longer causes infinite loops (excludes Cuoral API)
- Concurrent flush prevention (was causing duplicate events)
- Session expiry now properly checked on load (30-day window)
- Profile setting only happens when needed (checks if session has email)
- 502/504 errors handled gracefully without crashing app
- Module resolution issues with React/React Native
- Hermes engine compatibility
- Session persistence across app restarts
- Memory leaks from socket connections

### Performance & Efficiency

- **~80% reduction in API calls** via intelligent batching
- **Memory-bounded queues**: Max 90 events + custom (3 queues × 30 max)
- **Automatic cleanup**: All queues flushed on component unmount
- **Minimal timers**: Only 4 total (3 EventQueues + custom events)
- **Selective tracking**: Only 4xx/5xx responses tracked (not 2xx/3xx)
- **Optimized payloads**: Request/response bodies limited to 1000 chars

### Documentation

- Added `FLUTTER_SDK_PARITY.md` - Complete feature comparison with Flutter SDK
- Added `EXPO_COMPATIBILITY.md` - Expo Go limitations explained
- Added `CUSTOM_EVENTS.md` - Custom event tracking guide
- Updated `README.md` with new API methods and examples
- Added JSDoc comments throughout codebase

### Migration Guide

**Install new dependencies:**
```bash
npm install react-native-webview @react-native-async-storage/async-storage
```

**Update imports:**
```jsx
// No changes needed - import stays the same
import { CuoralLauncher } from 'cuoral-react-native-expo';
```

**Update props:**
```jsx
// Before (v0.x)
<CuoralLauncher
  publicKey="YOUR_KEY"
  backgroundColor="#673AB7"
  icon={<Text>💬</Text>}
  position="bottomRight"
  isVisible={true}
/>

// After (v1.0)
<CuoralLauncher
  publicKey="YOUR_KEY"
  buttonColor="#673AB7"
  buttonIcon="💬"
  buttonPosition="bottomRight"
  showFloatingButton={true}
/>
```

## [0.2.6] - 2025-11-29

### Fixed
- Node.js compatibility issues
- Expo SDK 54 compatibility
- Metro bundler configuration

### Changed
- Updated to support Expo SDK 54
- Improved error handling

## [0.2.0] - Previous Versions

Initial releases with native screen implementation.

---

## Version Support

| Version | Status | Expo SDK | React Native |
|---------|--------|----------|--------------|
| 1.0.x   | ✅ Active | 53+ | 0.79+ |
| 0.2.x   | ⚠️ Legacy | 53+ | 0.79+ |
| 0.1.x   | ❌ EOL | <53 | <0.79 |

## Breaking Changes Summary

### v0.x → v1.0

1. **New Dependency Required**: `react-native-webview`
2. **Prop Renames**: See migration guide above
3. **Removed Dependencies**: No longer need socket.io, expo-av, expo-image-picker, expo-notifications
4. **Architecture Change**: WebView-based instead of native screens

[1.0.0]: https://github.com/Cuoral/cuoral-react-native-expo/releases/tag/v1.0.0
[0.2.6]: https://github.com/Cuoral/cuoral-react-native-expo/releases/tag/v0.2.6

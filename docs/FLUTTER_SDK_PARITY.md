# Flutter SDK v0.0.5 Parity

This document outlines how the React Native implementation matches the Flutter SDK v0.0.5 architecture and features.

## Architecture Overview

### Event Batching System

**Flutter SDK Pattern:**
- Generic `EventQueue` class that handles batching for all event types
- Configurable batch size (10 events) and timer (2 seconds)
- FIFO overflow handling (drops oldest when queue exceeds 30)
- Concurrent flush protection with `isFlushing` guard
- Automatic timer reset on each new event

**React Native Implementation:**
- `src/EventQueue.js` - Exact port of Flutter's EventQueue class
- Same batch size (10), timer (2s), and max queue (30) values
- FIFO overflow with `shift()` when queue is full
- `isFlushing` guard prevents concurrent flushes
- Timer reset on each `enqueue()` call

```javascript
// Example usage (matches Flutter pattern)
const queue = new EventQueue('https://api.cuoral.com/endpoint', debug);
queue.enqueue(event);  // Auto-batches with 2s timer
await queue.flush();   // Manual flush
queue.destroy();       // Cleanup
```

### Intelligence Manager

**Flutter SDK Pattern:**
- Singleton `CustomerIntelligence` class manages all tracking
- Three separate EventQueues: `pageViewQueue`, `consoleErrorQueue`, `apiResponseQueue`
- Custom events use separate list with its own batching (not EventQueue)
- Network interception tracks 4xx/5xx responses only
- Global error handler setup
- Session ID synchronization

**React Native Implementation:**
- `src/intelligence.js` - Singleton `IntelligenceManager` class
- Three EventQueues matching Flutter names and endpoints
- `customEvents` array with separate 10-event/2s batching
- `setupNetworkInterception()` overrides `global.fetch`
- `setupErrorHandler()` uses `ErrorUtils.setGlobalHandler`
- Session updates via `updateIntelligenceSession()`

### Session Management

**Flutter SDK Pattern:**
- Session stored as JSON: `{"sessionId": "...", "createdAt": epochMs}`
- 30-day expiry check on load (2592000000ms)
- Profile setting only if session has no email
- 502/504 handled gracefully (assume intelligence enabled)
- Timeout: 10 seconds for all API calls

**React Native Implementation:**
- AsyncStorage with same JSON format: `{sessionId, createdAt}`
- SESSION_EXPIRY_MS = 30 days
- `setProfileIfNeeded()` checks `sessionInfo.email`
- `fetchSessionInfo()` returns default config on 502/504
- All fetch calls have `timeout: 10000`

```javascript
// Session structure
{
  "sessionId": "abc123...",
  "createdAt": 1704067200000  // Epoch milliseconds
}
```

## Feature Parity Matrix

| Feature | Flutter SDK | React Native | Status | Notes |
|---------|-------------|--------------|--------|-------|
| **Event Batching** |
| EventQueue class | ✅ | ✅ | Complete | Generic batching system |
| 10 events max batch | ✅ | ✅ | Complete | Same batch size |
| 2 second timer | ✅ | ✅ | Complete | Same interval |
| FIFO overflow (30 max) | ✅ | ✅ | Complete | Drops oldest |
| Concurrent flush guard | ✅ | ✅ | Complete | `isFlushing` flag |
| **Intelligence Tracking** |
| Singleton manager | ✅ | ✅ | Complete | IntelligenceManager |
| Page view queue | ✅ | ✅ | Complete | pageViewQueue |
| Console error queue | ✅ | ✅ | Complete | consoleErrorQueue |
| API response queue | ✅ | ✅ | Complete | apiResponseQueue |
| Custom events list | ✅ | ✅ | Complete | Separate batching |
| Screen name filtering | ✅ | ✅ | Complete | Filters `()`, `<>`, etc. |
| Device metadata | ✅ | ✅ | Complete | Platform, viewport, screen size |
| **Network Tracking** |
| Fetch interception | ✅ | ✅ | Complete | `global.fetch` override |
| 4xx/5xx tracking | ✅ | ✅ | Complete | Only errors tracked |
| Network failure (status 0) | ✅ | ✅ | Complete | Catch block |
| Exclude Cuoral API | ✅ | ✅ | Complete | Prevents infinite loop |
| Duration tracking | ✅ | ✅ | Complete | startTime → duration |
| XMLHttpRequest | ✅ | ⏳ | Partial | Fetch only (XHR rare in RN) |
| **Error Handling** |
| Global error handler | ✅ | ✅ | Complete | ErrorUtils.setGlobalHandler |
| Stack trace capture | ✅ | ✅ | Complete | error.stack |
| Fatal flag | ✅ | ✅ | Complete | isFatal metadata |
| Native crashes | ✅ | ❌ | Not Impl | Requires native module |
| **Session Management** |
| 30-day expiry | ✅ | ✅ | Complete | SESSION_EXPIRY_MS |
| JSON storage format | ✅ | ✅ | Complete | {sessionId, createdAt} |
| Profile setting | ✅ | ✅ | Complete | Only if no email |
| 502/504 handling | ✅ | ✅ | Complete | Graceful fallback |
| 10s timeout | ✅ | ✅ | Complete | All API calls |
| **Event Payloads** |
| Correct field names | ✅ | ✅ | Complete | `status_code` not `status` |
| response_body as object | ✅ | ✅ | Complete | Not string |
| Custom events wrapper | ✅ | ✅ | Complete | {session_id, custom_events} |
| Timestamp formats | ✅ | ✅ | Complete | Epoch for events, ISO for custom |

## Request Format Differences

### Page View Events
```json
// Array of events (like Flutter)
[
  {
    "url": "HomeScreen",
    "title": "HomeScreen",
    "referrer": "",
    "timestamp": 1704067200000,
    "session_id": "abc123",
    "source": "mobile",
    "metadata": {
      "platform": "ios",
      "viewport_width": 375,
      ...
    }
  }
]
```

### Console Error Events
```json
// Array of events (like Flutter)
[
  {
    "message": "TypeError: ...",
    "stack_trace": "Error: ...\n  at ...",
    "log_level": "error",
    "url": "HomeScreen",
    "line": 0,
    "column": 0,
    "session_id": "abc123",
    "source": "mobile",
    "console_metadata": {
      "error_type": "javascript_error",
      "is_fatal": true,
      ...
    }
  }
]
```

### API Response Events
```json
// Array of events (like Flutter)
[
  {
    "url": "https://api.example.com/data",
    "method": "POST",
    "status_code": 404,  // NOT "status"
    "duration": 234,
    "timestamp": 1704067200000,
    "session_id": "abc123",
    "source": "mobile",
    "request_body": {"body": "..."},
    "response_body": {"error": "Not found"},  // Object, not string
    "error": true,
    "api_metadata": {
      "error_message": "HTTP 404",
      ...
    }
  }
]
```

### Custom Events
```json
// Wrapper object with array (different from other events!)
{
  "session_id": "abc123",
  "custom_events": [
    {
      "session_id": "abc123",
      "name": "add_to_cart",
      "category": "ecommerce",
      "url": "ProductScreen",
      "element_selector": "",
      "element_text": "",
      "event_timestamp": "2024-01-01T00:00:00.000Z",  // ISO format
      "properties": {
        "product_id": "123",
        "platform": "ios",
        ...
      }
    }
  ]
}
```

## API Methods

### Public API (matches Flutter SDK)

```javascript
import { CuoralLauncher } from '@cuoral/react-native-expo';

// Component with ref
const launcherRef = useRef(null);

<CuoralLauncher
  ref={launcherRef}
  publicKey="your_key"
  email="user@example.com"
  firstName="John"
  lastName="Doe"
  debug={true}
/>

// Tracking methods
launcherRef.current.trackPageView('HomeScreen', { custom: 'data' });
launcherRef.current.trackError('Error message', 'stack trace', { fatal: true });
launcherRef.current.trackCustomEvent('button_click', 'interaction', { button_id: '123' });

// Control methods
launcherRef.current.open();
launcherRef.current.close();
launcherRef.current.flush();  // Flush all queues
const sessionId = launcherRef.current.getSessionId();
```

### Direct Intelligence API (without component)

```javascript
import { CuoralIntelligence } from '@cuoral/react-native-expo';

// Tracking methods
CuoralIntelligence.trackPageView('HomeScreen');
CuoralIntelligence.trackError('Error message');
CuoralIntelligence.trackCustomEvent('event_name', 'category', { key: 'value' });
```

## Implementation Notes

### Event Queue Lifecycle

1. **Event added:** `enqueue()` → check size → add to queue → reset timer
2. **Queue full (10):** Immediate flush, no timer wait
3. **Timer expires (2s):** Flush all queued events
4. **Flush:** Send array to backend → clear queue → wait for response
5. **Destroy:** Clear timer → flush remaining → cleanup

### Intelligence Initialization

1. **Component mount:** Call `initializeSession()`
2. **Check existing:** Load from AsyncStorage, check expiry (30 days)
3. **Validate:** Call `/session/get` to verify session
4. **Initialize:** If `customer_intelligence: true`, call `initializeIntelligence()`
5. **Setup:** Create 3 EventQueues, setup network interception, error handler
6. **Profile:** If session has no email but user provided it, call `/set-profile`

### Network Interception Flow

```
Original Request
      ↓
global.fetch override
      ↓
Check if Cuoral API? → Yes → Use original fetch
      ↓ No
Start timer
      ↓
Call original fetch
      ↓
Check status >= 400? → Yes → Track error → Return response
      ↓ No
Return response
```

### Error Handler Flow

```
Uncaught Error
      ↓
ErrorUtils.setGlobalHandler
      ↓
Extract message + stack
      ↓
Add to consoleErrorQueue
      ↓
Call original handler (if exists)
```

## Missing Features (from Flutter SDK)

1. **XMLHttpRequest interception** - Not critical (fetch is standard in React Native)
2. **Native crash tracking** - Requires native iOS/Android modules
3. **Automatic navigation tracking** - Need React Navigation observer helper

## Testing Checklist

- [ ] EventQueue batches 10 events correctly
- [ ] EventQueue flushes after 2 seconds
- [ ] EventQueue FIFO overflow at 30 items
- [ ] Session expiry works after 30 days
- [ ] Profile setting only when session has no email
- [ ] Network interception tracks 4xx/5xx
- [ ] Network interception excludes Cuoral API
- [ ] Error handler captures uncaught errors
- [ ] Custom events use wrapper format
- [ ] Field names match spec (`status_code`, not `status`)
- [ ] response_body is object, not string
- [ ] 502/504 handled gracefully
- [ ] Intelligence destroys on unmount

## Performance Considerations

### Memory Usage
- Max 30 events in each queue (90 total + custom events)
- Events automatically flushed every 2s
- Queues cleared on successful flush

### Network Efficiency
- Batching reduces API calls by ~80%
- Only 4xx/5xx responses tracked (not 2xx/3xx)
- Excludes Cuoral API to prevent infinite loops

### CPU Impact
- Network interception: Minimal (only wraps fetch)
- Error handler: Only runs on uncaught errors
- Timers: 4 total (3 EventQueues + custom events)

## Migration from Old Implementation

### Before (v0.0.1-0.0.4)
```javascript
// Direct API calls, no batching
await trackPageView(screen);        // Immediate fetch
await trackError(message);          // Immediate fetch
await trackCustomEvent(name, cat);  // Immediate fetch
```

### After (v1.0.0)
```javascript
// Batched via EventQueues
launcherRef.current.trackPageView(screen);     // Queued
launcherRef.current.trackError(message);       // Queued
launcherRef.current.trackCustomEvent(name);    // Queued

// Automatic flush after 2s or 10 events
// Manual flush if needed
await launcherRef.current.flush();
```

### Breaking Changes
1. Session stored as JSON object (not plain string)
2. Custom events payload format changed (wrapper object)
3. Intelligence auto-initialized (not manual)
4. Network interception automatic (not opt-in)

## Version Alignment

| SDK | Version | Event Batching | Network Tracking | Session Expiry |
|-----|---------|----------------|------------------|----------------|
| Flutter | 0.0.5 | ✅ EventQueue | ✅ Dio interceptor | ✅ 30 days |
| React Native | 1.0.0 | ✅ EventQueue | ✅ fetch override | ✅ 30 days |
| JavaScript | TBD | ❌ Direct calls | ❌ None | ❌ None |

---

**Last Updated:** January 2024  
**React Native SDK Version:** 1.0.0  
**Flutter SDK Version:** 0.0.5

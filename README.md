# Cuoral React Native Expo SDK v1.2.0

**Customer support chat SDK** for React Native Expo managed workflow applications.

## 🎯 Overview

This SDK is designed specifically for **Expo managed workflow** and uses `expo-web-browser` to display the Cuoral chat widget in an in-app browser.

### Key Features

- ✅ **Expo Go Compatible** - Test instantly without building
- ✅ **Session Management** - Automatic session persistence and restoration
- ✅ **Customer Intelligence** - Auto-tracking of page views, custom events, and errors
- ✅ **Secure Storage** - Uses `expo-secure-store` for session data
- ✅ **Auto-flush Events** - Custom events automatically send after 2 seconds
- ✅ **Customizable UI** - Configure button color, position, size, and icon
- ✅ **iOS & Android** - Full support for both platforms

### Browser Experience

The SDK opens the Cuoral widget in an in-app browser:

**iOS**: SFSafariViewController with customizable toolbar color  
**Android**: Chrome Custom Tabs with hidden URL bar (when possible)

> **Note**: iOS always shows the URL bar and share button due to Apple's security requirements for SFSafariViewController.

## 📦 Installation

```bash
npm install cuoral-react-native-expo expo-web-browser expo-secure-store react-native-svg
```

or

```bash
yarn add cuoral-react-native-expo expo-web-browser expo-secure-store react-native-svg
```

### Using Expo CLI (Recommended)

```bash
npx expo install cuoral-react-native-expo expo-web-browser expo-secure-store react-native-svg
```

### ⚠️ Important: Babel Configuration

You **must** remove the `@babel/plugin-transform-private-methods` plugin with `loose: true` from your `babel.config.js` if present, as it causes networking errors in Expo SDK 54.

**Remove this from `babel.config.js`:**
```javascript
// ❌ Remove this
plugins: [
  ['@babel/plugin-transform-private-methods', { loose: true }],
],
```

If you encounter "Cannot assign to read-only property 'NONE'" errors, this is the cause.

## 🚀 Quick Start

```bash
# Install dependencies
npx expo install cuoral-react-native-expo expo-web-browser expo-secure-store react-native-svg

# Start Expo
npx expo start

# Scan QR code with Expo Go or run on simulator
```

## 💻 Usage

```jsx
import React, { useRef, useEffect } from 'react';
import { SafeAreaView } from 'react-native';
import { CuoralLauncher } from 'cuoral-react-native-expo';

export default function App() {
  const cuoralRef = useRef(null);

  // Track screen view on mount
  useEffect(() => {
    cuoralRef.current?.trackPageView('/home', {
      screen_name: 'HomeScreen',
    });
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Your app content */}
      
      <CuoralLauncher
        ref={cuoralRef}
        publicKey="YOUR_CUORAL_PUBLIC_KEY"
        email="user@example.com"
        firstName="John"
        lastName="Doe"
      />
    </SafeAreaView>
  );
}
```

## 🎨 Configuration

### All Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `publicKey` | `string` | *required* | Your Cuoral organization public key |
| `email` | `string` | `undefined` | Pre-fill user's email |
| `firstName` | `string` | `undefined` | Pre-fill user's first name |
| `lastName` | `string` | `undefined` | Pre-fill user's last name |
| `buttonColor` | `string` | `'#007AFF'` | Floating button background color |
| `buttonPosition` | `string` | `'bottomRight'` | `'bottomRight'`, `'bottomLeft'`, `'topRight'`, `'topLeft'` |
| `buttonSize` | `number` | `60` | Button diameter in pixels |
| `buttonIcon` | `string \| null` | `null` | Custom button icon (emoji or text). `null` uses default SVG message icon |
| `showFloatingButton` | `boolean` | `true` | Show/hide floating button |
| `debug` | `boolean` | `false` | Enable debug logging (only logs when explicitly set to `true`) |
| `widgetBaseUrl` | `string` | `'https://js.cuoral.com/mobile.html'` | Custom widget URL |
### Ref Methods

Use a ref to access tracking and control methods:

| Method | Parameters | Description |
|--------|------------|-------------|
| `trackPageView(screen, metadata?)` | `screen: string`, `metadata?: object` | Track screen/page views |
| `trackError(message, stackTrace?, metadata?)` | `message: string`, `stackTrace?: string`, `metadata?: object` | Track errors manually |
| `trackCustomEvent(name, category, properties?)` | `name: string`, `category: string`, `properties?: object` | Track custom business events |
| `open()` | - | Open widget browser programmatically |
| `close()` | - | Close widget browser |
| `getSessionId()` | - | Get current session ID |
| `flush()` | - | Manually flush all intelligence event queues |
| `clearSession()` | - | End session and clear all data (call before user logout) |

## 📊 Customer Intelligence Tracking

Track user behavior and custom business events with the built-in intelligence API. All events are automatically batched and flushed:

- **Page Views**: Flush immediately on each track
- **Custom Events**: Auto-flush after 2 seconds or when 10 events are queued
- **Errors**: Flush immediately on each track

### Track Page/Screen Views

```jsx
const cuoralRef = useRef(null);

// Track when user navigates to a new screen
cuoralRef.current?.trackPageView('/checkout', {
  cart_items: 3,
  total_value: 99.99,
  payment_method: 'credit_card',
});
```

### Track Errors

```jsx
try {
  // Your code
  processPayment();
} catch (error) {
  cuoralRef.current?.trackError(
    error.message,
    error.stack,
    {
      payment_method: 'credit_card',
      amount: 99.99,
      user_id: '12345',
    }
  );
}
```

### Track Custom Events

Track important business actions and user interactions:

```jsx
// Track button clicks
cuoralRef.current?.trackCustomEvent(
  'add_to_cart',      // Event name
  'ecommerce',        // Category
  {                   // Custom properties
    item_id: '12345',
    item_name: 'Product Name',
    price: 29.99,
    quantity: 2,
  }
);

// Track feature usage
cuoralRef.current?.trackCustomEvent(
  'filter_applied',
  'engagement',
  {
    filter_type: 'price_range',
    min_price: 10,
    max_price: 100,
  }
);

// Track form submissions
cuoralRef.current?.trackCustomEvent(
  'form_submitted',
  'conversion',
  {
    form_name: 'contact_form',
    fields_filled: 5,
    has_phone: true,
  }
);
```

### Recommended Event Categories

| Category | Use Case |
|----------|----------|
| `ecommerce` | Shopping, cart actions, checkout |
| `navigation` | Menu clicks, screen transitions |
| `engagement` | Searches, filters, interactions |
| `conversion` | Signups, form submissions, purchases |
| `user_action` | Generic user interactions |
| `error` | Custom error tracking |
| `preferences` | Settings changes |
| `media` | Video/audio playback |

## 🔄 Session Management

The SDK automatically manages user sessions with persistent storage using `expo-secure-store`:

- **Auto-restoration**: Sessions persist across app restarts
- **Backend validation**: Sessions are validated with your Cuoral backend
- **Secure storage**: Session data stored securely on device
- **Profile sync**: User email/name automatically synced when provided

### Clear Session on Logout

Always clear the session when users log out:

```jsx
const handleLogout = async () => {
  // Clear Cuoral session
  await cuoralRef.current?.clearSession();
  
  // Your logout logic
  await logoutUser();
};
```

## 🌐 Platform Differences

### iOS
- Uses **SFSafariViewController**
- Always shows URL bar and "Done" button (Apple requirement)
- Toolbar color matches your `buttonColor` prop
- Slides up from bottom

### Android
- Uses **Chrome Custom Tabs**
- Hides URL bar when possible (`enableUrlBarHiding: true`)
- Customized toolbar color
- Slides up from bottom

## 🐛 Troubleshooting

### "Cannot assign to read-only property 'NONE'" error

This is caused by Babel's `@babel/plugin-transform-private-methods` with `loose: true`. Remove it from your `babel.config.js`:

```javascript
// ❌ Remove this
plugins: [
  ['@babel/plugin-transform-private-methods', { loose: true }],
],
```

Then clear caches:
```bash
rm -rf node_modules/.cache .expo
npx expo start --clear
```

### Session not persisting

Make sure `expo-secure-store` is installed:
```bash
npx expo install expo-secure-store
```

**Note**: `expo-secure-store` only works on iOS/Android, not on web.

### Custom events not appearing in dashboard

Custom events auto-flush after 2 seconds. Wait a moment after triggering events, or manually flush:

```jsx
cuoralRef.current?.flush();
```

### Widget not opening

Check that your `publicKey` is correct and the widget URL is accessible. Enable `debug={true}` to see detailed logs.

## ✅ Requirements

- **Expo SDK**: 54.0.0 or higher
- **React Native**: 0.81.5 or higher  
- **Node.js**: 20.19.4 or higher (for Metro bundler)
- **Platform**: iOS and Android (not web)

## 🎯 Best Practices

### For Development
- Use `debug={true}` during development to see session and tracking logs
- Test in Expo Go for quick iterations
- Monitor console for intelligence tracking confirmations

### For Production
- Set `debug={false}` (default) to disable logging
- Customize `buttonColor` to match your brand
- Always call `clearSession()` on user logout
- Let events auto-flush - no need to manually call `flush()`

## 📄 License

MIT License

## 🤝 Support

- Documentation: https://docs.cuoral.com
- Email: support@cuoral.com

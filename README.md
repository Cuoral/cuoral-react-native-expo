# Cuoral React Native Expo SDK v1.0.0

**Hybrid WebView-based customer support chat SDK** for React Native Expo applications.

## 🎯 Hybrid Implementation

This SDK uses a **hybrid approach** that automatically adapts to your environment:

| Environment | Display Method | User Experience |
|-------------|----------------|-----------------|
| **Development Build** | `react-native-webview` | ✅ Fully embedded, no browser UI, seamless |
| **Expo Go** | `expo-web-browser` | ⚠️ In-app browser with toolbar (visible URL bar) |
| **Production** | `react-native-webview` | ✅ Fully embedded, no browser UI, seamless |

### What This Means

**In Expo Go (Testing)**:
- Opens in an in-app browser (SFSafariViewController/Chrome Custom Tabs)
- Shows URL bar and "Done" button (required by iOS/Android)
- Good for quick testing without building

**In Development/Production Builds**:
- Fully embedded WebView with no browser chrome
- Professional, seamless experience
- Same as your Ionic implementation

## 📦 Installation

```bash
npm install cuoral-react-native-expo expo-web-browser react-native-webview @react-native-async-storage/async-storage
```

or

```bash
yarn add cuoral-react-native-expo expo-web-browser react-native-webview @react-native-async-storage/async-storage
```

## 🚀 Quick Start

### Testing in Expo Go

```bash
# Install dependencies
npx expo install cuoral-react-native-expo expo-web-browser @react-native-async-storage/async-storage

# Start Expo
npx expo start

# Scan QR code with Expo Go
# ⚠️ Will use in-app browser (shows URL bar)
```

### Production Build

```bash
# Install ALL dependencies including react-native-webview
npx expo install cuoral-react-native-expo expo-web-browser react-native-webview @react-native-async-storage/async-storage

# Create development build
npx expo prebuild
npx expo run:ios
# or
npx expo run:android

# ✅ Will use embedded WebView (no browser UI)
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
        debug={true}  // See which mode is being used
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
| `buttonIcon` | `string` | `'💬'` | Button icon (emoji or text) |
| `showFloatingButton` | `boolean` | `true` | Show/hide floating button |
| `debug` | `boolean` | `false` | Enable debug logging (shows display mode) |
| `widgetBaseUrl` | `string` | `'https://js.cuoral.com/mobile.html'` | Custom widget URL |
### Ref Methods

Use a ref to access tracking and control methods:

| Method | Parameters | Description |
|--------|------------|-------------|
| `trackPageView(screen, metadata?)` | `screen: string`, `metadata?: object` | Track screen/page views |
| `trackError(message, stackTrace?, metadata?)` | `message: string`, `stackTrace?: string`, `metadata?: object` | Track errors manually |
| `trackCustomEvent(name, category, properties?)` | `name: string`, `category: string`, `properties?: object` | Track custom business events |
| `open()` | - | Open modal/browser programmatically |
| `close()` | - | Close modal (WebView mode only) |
| `getSessionId()` | - | Get current session ID |
## 🔍 How to Check Which Mode Is Active

Enable debug mode to see which display method is being used:

```jsx
<CuoralLauncher
  publicKey="YOUR_KEY"
  debug={true}  // Check console logs
/>
```

Console output:
```
[CuoralLauncher] Display mode: webview
[CuoralLauncher] Mode explanation: Using react-native-webview (embedded)
```

or

```
[CuoralLauncher] Display mode: browser
[CuoralLauncher] Mode explanation: Using expo-web-browser (in-app browser with toolbar)
```

## 📊 Custom Event Tracking

Track user behavior and custom business events with the built-in intelligence API.

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

### Using Without Component (Direct API)

You can also use the intelligence API directly without the component:

```jsx
import { CuoralIntelligence } from 'cuoral-react-native-expo';

// Track events anywhere in your app
CuoralIntelligence.trackCustomEvent('button_clicked', 'user_action', {
  button_name: 'signup',
  screen: 'home',
});

CuoralIntelligence.trackPageView('/profile', {
  user_id: '12345',
});

CuoralIntelligence.trackError('API request failed', error.stack, {
  endpoint: '/api/users',
});
```

**Note:** The direct API requires that a session has been initialized by the CuoralLauncher component first.

##  Platform Differences

### iOS (Expo Go)
- Uses SFSafariViewController
- Shows URL at top with "Done" button
- Toolbar can be customized with your brand color

### Android (Expo Go)
- Uses Chrome Custom Tabs
- Shows toolbar with close (X) button
- Slides up from bottom

### iOS/Android (Development Build)
- Embedded WebView in full-screen modal
- No browser chrome
- Identical experience on both platforms

## 🐛 Troubleshooting

### "Still seeing browser UI in my build"

Make sure `react-native-webview` is installed:
```bash
npm install react-native-webview
npx expo prebuild
npx expo run:ios
```

### "Checking which mode is active"

Enable debug mode and check console logs.

## 🎯 Recommendations

### For Testing
- Use Expo Go with `expo-web-browser` - quick and easy

### For Production
- Always use development builds with `react-native-webview`
- Professional, seamless user experience

## 📄 License

MIT License

## 🤝 Support

- Documentation: https://docs.cuoral.com
- Email: support@cuoral.com

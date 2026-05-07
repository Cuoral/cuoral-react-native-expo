# Cuoral React Native Expo SDK v1.0.0

WebView-based customer support chat SDK for React Native Expo applications.

## ⚠️ Important: Requires Development Build

This library uses `react-native-webview` and **requires a development build**. It will **NOT work in Expo Go**.

- ✅ Works with: Development builds, EAS Build, production apps
- ❌ Does NOT work with: Expo Go app

**[Read the Expo Compatibility Guide](./EXPO_COMPATIBILITY.md)** for detailed setup instructions.

## 🎉 What's New in v1.0.0

- **WebView Implementation**: Lightweight, always-updated chat experience using WebView
- **Simplified Architecture**: No more complex native screens - just load the widget
- **Customizable Floating Button**: Configure colors, position, size, and icon
- **Automatic Session Management**: Seamless session handling across app restarts
- **Organization Branding**: Automatically uses your organization's primary color
- **Better Performance**: Smaller bundle size, faster load times
- **Always Current**: Widget updates automatically without app updates

## 📦 Installation

```bash
npm install cuoral-react-native-expo react-native-webview @react-native-async-storage/async-storage
```

or

```bash
yarn add cuoral-react-native-expo react-native-webview @react-native-async-storage/async-storage
```

### Expo Setup (Development Build Required)

Since this library uses `react-native-webview`, you need to create a development build:

**Step 1: Install dependencies**
```bash
npx expo install react-native-webview @react-native-async-storage/async-storage cuoral-react-native-expo
```

**Step 2: Create development build**
```bash
# Generate native folders
npx expo prebuild

# Run on iOS
npx expo run:ios

# Run on Android
npx expo run:android
```

**Alternative: Use EAS Build**
```bash
eas build --profile development --platform ios
```

For more details, see [EXPO_COMPATIBILITY.md](./EXPO_COMPATIBILITY.md)

## 🚀 Quick Start

```jsx
import React from 'react';
import { SafeAreaView } from 'react-native';
import { CuoralLauncher } from 'cuoral-react-native-expo';

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Your app content */}
      
      <CuoralLauncher
        publicKey="YOUR_CUORAL_PUBLIC_KEY"
        email="user@example.com"
        firstName="John"
        lastName="Doe"
      />
    </SafeAreaView>
  );
}
```

## 📖 API Reference

### CuoralLauncher Props

#### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `publicKey` | `string` | Your Cuoral organization public key (required) |

#### Optional Props - User Information

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `email` | `string` | `undefined` | Pre-fill user's email address |
| `firstName` | `string` | `undefined` | Pre-fill user's first name |
| `lastName` | `string` | `undefined` | Pre-fill user's last name |

#### Optional Props - Appearance

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `buttonColor` | `string` | `'#007AFF'` | Floating button background color |
| `buttonPosition` | `string` | `'bottomRight'` | Button position: `'bottomRight'`, `'bottomLeft'`, `'topRight'`, `'topLeft'` |
| `buttonSize` | `number` | `60` | Button diameter in pixels |
| `buttonIcon` | `string` | `'💬'` | Button icon (emoji or text) |
| `showFloatingButton` | `boolean` | `true` | Whether to show the floating button |

#### Optional Props - Advanced

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `debug` | `boolean` | `false` | Enable debug logging |
| `widgetBaseUrl` | `string` | `'https://js.cuoral.com/mobile.html'` | Custom widget URL for development |

## 🎨 Customization Examples

### Custom Button Color and Position

```jsx
<CuoralLauncher
  publicKey="YOUR_PUBLIC_KEY"
  buttonColor="#FF6B6B"
  buttonPosition="topRight"
  buttonSize={70}
  buttonIcon="🎯"
/>
```

### Different Button Positions

```jsx
// Bottom Right (default)
<CuoralLauncher
  publicKey="YOUR_PUBLIC_KEY"
  buttonPosition="bottomRight"
/>

// Bottom Left
<CuoralLauncher
  publicKey="YOUR_PUBLIC_KEY"
  buttonPosition="bottomLeft"
/>

// Top Right
<CuoralLauncher
  publicKey="YOUR_PUBLIC_KEY"
  buttonPosition="topRight"
/>

// Top Left
<CuoralLauncher
  publicKey="YOUR_PUBLIC_KEY"
  buttonPosition="topLeft"
/>
```

### Hide Floating Button (Manual Control)

```jsx
import React, { useRef } from 'react';
import { Button } from 'react-native';
import { CuoralLauncher } from 'cuoral-react-native-expo';

export default function App() {
  return (
    <>
      <Button title="Open Support" onPress={() => {
        // Custom trigger logic here
      }} />
      
      <CuoralLauncher
        publicKey="YOUR_PUBLIC_KEY"
        showFloatingButton={false}
      />
    </>
  );
}
```

## 🔧 Advanced Usage

### With User Authentication

```jsx
import React, { useState, useEffect } from 'react';
import { CuoralLauncher } from 'cuoral-react-native-expo';

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Fetch user from your auth system
    fetchCurrentUser().then(setUser);
  }, []);

  if (!user) return <LoadingScreen />;

  return (
    <>
      {/* Your app */}
      
      <CuoralLauncher
        publicKey="YOUR_PUBLIC_KEY"
        email={user.email}
        firstName={user.firstName}
        lastName={user.lastName}
      />
    </>
  );
}
```

### Debug Mode

```jsx
<CuoralLauncher
  publicKey="YOUR_PUBLIC_KEY"
  debug={true}  // Enable console logging
/>
```

## 🏗️ Architecture

### How It Works

1. **WebView Integration**: The SDK loads the Cuoral widget in a WebView, providing a native-like experience
2. **Bridge Communication**: Messages are passed between React Native and the WebView using a bridge
3. **Session Management**: Sessions are automatically created and persisted using AsyncStorage
4. **Modal Display**: Chat interface is displayed in a full-screen modal with smooth animations

### Components

- **CuoralLauncher**: Main component with floating button and modal management
- **CuoralModal**: Full-screen modal wrapper for the WebView
- **CuoralWebView**: WebView component with loading states and error handling
- **CuoralBridge**: Communication bridge between React Native and WebView

## 📱 Supported Platforms

- ✅ iOS 11.0+
- ✅ Android 5.0+ (API 21+)
- ❌ Web (not supported - use web SDK instead)

## 🔄 Migration from v0.x

### Breaking Changes

1. **WebView Dependency**: Now requires `react-native-webview`
   ```bash
   npm install react-native-webview
   ```

2. **Removed Dependencies**: No longer requires:
   - ❌ `socket.io-client`
   - ❌ `expo-av`
   - ❌ `expo-image-picker`
   - ❌ `expo-notifications`
   - ❌ `react-native-image-picker`

3. **Prop Changes**:
   - `backgroundColor` → `buttonColor`
   - `icon` → `buttonIcon` (now accepts string instead of component)
   - `position` → `buttonPosition`
   - `isVisible` → `showFloatingButton`

### Migration Example

**Before (v0.x)**:
```jsx
<CuoralLauncher
  publicKey="YOUR_KEY"
  backgroundColor="#673AB7"
  icon={<Text>💬</Text>}
  position="bottomRight"
  isVisible={true}
/>
```

**After (v1.0)**:
```jsx
<CuoralLauncher
  publicKey="YOUR_KEY"
  buttonColor="#673AB7"
  buttonIcon="💬"
  buttonPosition="bottomRight"
  showFloatingButton={true}
/>
```

## 🐛 Troubleshooting

### WebView Not Loading

1. Ensure `react-native-webview` is installed:
   ```bash
   npm install react-native-webview
   ```

2. For Expo managed workflow, rebuild:
   ```bash
   expo prebuild
   ```

### Session Not Persisting

Check that `@react-native-async-storage/async-storage` is properly installed:
```bash
npm install @react-native-async-storage/async-storage
```

### Button Not Visible

1. Check that `showFloatingButton` is `true` (default)
2. Ensure CuoralLauncher is rendered above other components
3. Verify your `publicKey` is correct

### Debug Mode

Enable debug mode to see detailed logs:
```jsx
<CuoralLauncher
  publicKey="YOUR_KEY"
  debug={true}
/>
```

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Support

- Documentation: https://docs.cuoral.com
- Email: support@cuoral.com
- Dashboard: https://app.cuoral.com

## 🔗 Related

- [Cuoral Web SDK](https://github.com/Cuoral/cuoral-web-sdk)
- [Cuoral Ionic SDK](https://github.com/Cuoral/cuoral-ionic-sdk)
- [Cuoral Documentation](https://docs.cuoral.com)

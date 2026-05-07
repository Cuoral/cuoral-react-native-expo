# Cuoral React Native Expo SDK - Expo Compatibility Guide

## ⚠️ Important: Expo Go vs Development Build

This library uses `react-native-webview`, which **requires a development build** and will **NOT work in Expo Go**.

## What This Means

### ❌ Won't Work
- Scanning QR code in Expo Go app
- Running with `expo start` and testing in Expo Go

### ✅ Will Work
- Development builds (`expo prebuild`)
- EAS Build
- Production apps
- Custom development clients

## Installation Options

### Option 1: Development Build (Recommended)

This is the standard approach for production Expo apps:

```bash
# Install dependencies
npm install cuoral-react-native-expo react-native-webview @react-native-async-storage/async-storage

# Create development build
npx expo prebuild

# Run on iOS
npx expo run:ios

# Run on Android
npx expo run:android
```

### Option 2: EAS Build

Use Expo's cloud build service:

```bash
# Install dependencies
npm install cuoral-react-native-expo react-native-webview @react-native-async-storage/async-storage

# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Create development build
eas build --profile development --platform ios
# or
eas build --profile development --platform android
```

### Option 3: Custom Development Client

Add to your `app.json` or `app.config.js`:

```json
{
  "expo": {
    "plugins": [
      "@react-native-async-storage/async-storage"
    ]
  }
}
```

Then create a custom development client:

```bash
npx expo prebuild
npx expo run:ios
```

## Why Not Expo Go?

Expo Go is a sandbox app that includes a limited set of native modules. `react-native-webview` requires custom native code that's not included in Expo Go.

**This is normal and expected** for many production React Native libraries. Most production Expo apps use development builds rather than Expo Go.

## Benefits of Development Builds

✅ Access to any npm package
✅ Full native module support  
✅ Better debugging capabilities
✅ Closer to production environment
✅ Custom native configuration

## Quick Start for Development

1. **Install dependencies:**
   ```bash
   npm install cuoral-react-native-expo react-native-webview @react-native-async-storage/async-storage
   ```

2. **Prebuild (generates ios/ and android/ folders):**
   ```bash
   npx expo prebuild
   ```

3. **Run on your device:**
   ```bash
   # iOS
   npx expo run:ios
   
   # Android  
   npx expo run:android
   ```

4. **Use in your app:**
   ```jsx
   import { CuoralLauncher } from 'cuoral-react-native-expo';
   
   <CuoralLauncher publicKey="YOUR_KEY" />
   ```

## FAQ

### Q: Can I still use Expo's managed workflow?

**A:** Yes! Development builds ARE part of the managed workflow. You're still using Expo's tools, configuration, and build system.

### Q: Do I need to eject from Expo?

**A:** No! `expo prebuild` is NOT ejecting. You keep all Expo benefits and can still use EAS Build, OTA updates, etc.

### Q: Will this affect my app size?

**A:** Minimally. `react-native-webview` is a lightweight native module (~200KB).

### Q: What about existing Expo Go users?

**A:** They'll need to install your development build instead. This is standard for production apps.

### Q: Can I test in a simulator?

**A:** Yes! Development builds work perfectly in iOS Simulator and Android Emulator.

## Alternative: Web-Only Solution

If you absolutely must support Expo Go, consider using the web version of your app for testing, or use a different approach like deep linking to your web widget.

However, for production apps, development builds are the recommended and standard approach.

## Resources

- [Expo Development Builds Docs](https://docs.expo.dev/develop/development-builds/introduction/)
- [Creating Development Builds](https://docs.expo.dev/develop/development-builds/create-a-build/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [react-native-webview Docs](https://github.com/react-native-webview/react-native-webview)

## Still Have Questions?

Contact us at support@cuoral.com or check our full documentation at https://docs.cuoral.com

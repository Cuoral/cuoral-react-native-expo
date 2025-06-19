# 🧩 Cuoral React Native Widget

`cuoral-react-native-expo` is a React Native library that provides a Floating Action Button (FAB) to seamlessly integrate the Cuoral chat widget into your **Expo** or **bare React Native** applications.

---

## ✨ Features

- 💬 **Floating Chat Widget** – Launch a full-featured Cuoral chat from any screen.
- 🔁 **Persistent Sessions** – Conversations continue across app launches.
- 👤 **User Profile Pre-fill** – Automatically set user email, first and last names.
- 🔔 **Push Notifications** – Get notified of new messages (supports foreground & background).
- 🎵 **Sound Alerts** – Play custom sounds when new messages arrive.
- 🔄 **Session Management** – Handle loading, connected, disconnected, and error states.
- 🚀 **Escalation Support** – Seamlessly transition from bot to live agent.
- 📎 **Image Attachments** – Allow users to send pictures via the chat.
- ⚙️ **Customizable FAB** – Configure position, icon, visibility, and color.

---

## 📦 Installation

Install the package along with all required peer dependencies:

### Using Yarn

```bash
yarn add cuoral-react-native-expo \
  react \
  react-native \
  socket.io-client \
  @react-native-async-storage/async-storage \
  react-native-image-picker \
  expo-av \
  expo-image-picker \
  expo-notifications
```

### Using NPM

```bash
npm install cuoral-react-native-expo \
  react \
  react-native \
  socket.io-client \
  @react-native-async-storage/async-storage \
  react-native-image-picker \
  expo-av \
  expo-image-picker \
  expo-notifications
```

> 💡 For Expo, it's recommended to install Expo modules via:
>
> ```bash
> npx expo install expo-av expo-notifications expo-image-picker @react-native-async-storage/async-storage
> ```

---

## 🧠 Peer Dependencies

This library relies on the following peer dependencies. Ensure they are installed in your project:

| Package                                   | Version    | Purpose                             |
|-------------------------------------------|------------|-------------------------------------|
| react, react-native                       | *          | Core framework                      |
| @react-native-async-storage/async-storage | >=1.17.0   | Persistent session storage          |
| socket.io-client                          | >=4.0.0    | Real-time communication             |
| react-native-image-picker                 | *          | Attach image files in chat          |
| expo-av                                   | *          | Play custom sound for new messages  |
| expo-notifications                        | *          | Handle push notifications           |
| expo-image-picker                         | *          | Allow media selection in Expo apps  |

---

## 🧪 Sample Integration

Here’s how to integrate the widget into your app:

```jsx
// App.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { CuoralLauncher } from 'cuoral-react-native-expo';

const App = () => {
  const PUBLIC_KEY = 'YOUR_CUORAL_PUBLIC_KEY'; // Replace with your actual key

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f0f0" />

      <View style={styles.appContainer}>
        <Text style={styles.appTitle}>My Native App</Text>
        <Text style={styles.appBody}>
          This is an example app integrating the native Cuoral SDK.
        </Text>
        <Text style={styles.appBody}>
          Tap the chat bubble to launch the native Cuoral chat experience!
        </Text>
      </View>

      <CuoralLauncher
        publicKey={PUBLIC_KEY}
        email="example@user.com"
        firstName="Native"
        lastName="User"
        backgroundColor="#673AB7"
        icon={<Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>💬</Text>}
        isVisible={true}
        position="bottomRight"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  appContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  appBody: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
    marginBottom: 5,
  },
});

export default App;
```

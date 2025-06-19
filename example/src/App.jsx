// App.js (Your main application file demonstrating the new native library)
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
// Import the CuoralLauncher from your local library (after `npm install` with file: path or `npm link`)
import { CuoralLauncher } from 'cuoral-react-native-expo';

/**
 * Main application component to demonstrate the integration of the native CuoralLauncher.
 * This sets up a basic screen and places the CuoralLauncher on top.
 */
const App = () => {
  // IMPORTANT: Replace 'YOUR_CUORAL_PUBLIC_KEY' with your actual Cuoral Public Key
  // This key would be obtained from your Cuoral account.
  const PUBLIC_KEY = 'YOUR_CUORAL_PUBLIC_KEY';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f0f0" />
      {/* Your normal app UI */}
      <View style={styles.appContainer}>
        <Text style={styles.appTitle}>My Native App</Text>
        <Text style={styles.appBody}>
          This is an example app integrating the native Cuoral SDK.
        </Text>
        <Text style={styles.appBody}>
          Tap the chat bubble to launch the native Cuoral chat experience!
        </Text>
      </View>

      {/* CuoralLauncher Overlay */}
      <CuoralLauncher
        publicKey={PUBLIC_KEY}
        email="example@user.com" // Optional: Pre-fill user email
        firstName="Native" // Optional: Pre-fill user first name
        lastName="User" // Optional: Pre-fill user last name
        backgroundColor="#673AB7" // Optional: Customize FAB color (e.g., Deep Purple)
        icon={<Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>💬</Text>} // Optional: Custom icon
        isVisible={true} // Optional: Control visibility (defaults to true)
        position="bottomRight" // Optional: 'bottomRight', 'topRight', 'topLeft', 'bottomLeft'
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

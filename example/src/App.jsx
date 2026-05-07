// Simple test WITH Cuoral import
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { CuoralLauncher } from 'cuoral-react-native-expo';

const App = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Cuoral Test</Text>
      <Text style={styles.text}>If you see this, it works!</Text>
      
      <CuoralLauncher
        publicKey="c8e3081e-8dfc-49b5-bbd1-4ef513504d88"
        buttonColor="#007AFF"
        showFloatingButton={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
  },
});

export default App;

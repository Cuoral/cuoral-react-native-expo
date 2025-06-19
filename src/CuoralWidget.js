import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

const CuoralWidget = ({
  publicKey,
  firstName,
  lastName,
  email,
  showWidget = true,
}) => {
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Validate the publicKey
  useEffect(() => {
    if (!publicKey || publicKey.trim() === '') {
      setErrorMessage('publicKey must not be empty.');
    } else {
      setErrorMessage(null);
    }
  }, [publicKey]);

  const getCuoralUri = () => {
    if (!publicKey || publicKey.trim() === '') return null;

    const baseUrl = 'https://js.cuoral.com/mobile.html';
    const params = new URLSearchParams();

    params.append('auto_display', 'true');
    params.append('key', publicKey);
    if (email) params.append('email', email);
    if (firstName) params.append('first_name', firstName);
    if (lastName) params.append('last_name', lastName);

    return `${baseUrl}?${params.toString()}`;
  };

  const openWidget = async () => {
    const url = getCuoralUri();
    if (!url) return;

    setIsLoading(true);
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (err) {
      setErrorMessage('Failed to open widget: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!showWidget) return null;

  return (
    <View style={styles.container}>
      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button title="Open Cuoral Chat" onPress={openWidget} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
});

export default CuoralWidget;

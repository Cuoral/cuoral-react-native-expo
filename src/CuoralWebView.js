// CuoralWebView.js
import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import WebView from 'react-native-webview';

/**
 * CuoralWebView component wraps the WebView and handles loading states
 */
const CuoralWebView = forwardRef(({ 
  widgetUrl, 
  onMessage, 
  onLoad,
  debug = false 
}, ref) => {
  const webViewRef = useRef(null);
  const [loading, setLoading] = React.useState(true);

  useImperativeHandle(ref, () => ({
    postMessage: (message) => {
      if (webViewRef.current) {
        webViewRef.current.postMessage(message);
      }
    },
    reload: () => {
      if (webViewRef.current) {
        webViewRef.current.reload();
      }
    },
    getWebViewRef: () => webViewRef
  }));

  useEffect(() => {
    // Effect runs when widgetUrl or debug changes
  }, [widgetUrl, debug]);

  const handleLoadEnd = () => {
    setLoading(false);
    if (onLoad) {
      onLoad();
    }
  };

  const handleError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
      // Debug logging removed
    setLoading(false);
  };

  const handleMessage = (event) => {
    if (onMessage) {
      onMessage(event);
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: widgetUrl }}
        style={styles.webview}
        onMessage={handleMessage}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        scalesPageToFit={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        allowsFullscreenVideo={true}
        // Allow all origins for message passing
        originWhitelist={['*']}
        // Disable scrolling bouncing for better UX
        bounces={false}
        // Enable automatic height adjustment
        scrollEnabled={true}
        // Improve performance
        androidHardwareAccelerationDisabled={false}
        androidLayerType="hardware"
      />
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )}
    </View>
  );
});

CuoralWebView.displayName = 'CuoralWebView';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});

export default CuoralWebView;

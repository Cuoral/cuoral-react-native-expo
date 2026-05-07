// CuoralModal.js - Opens widget using expo-web-browser for Expo managed workflow
import React, { forwardRef, useImperativeHandle } from 'react';
import { Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

// Warm up browser session for faster subsequent opens
WebBrowser.warmUpAsync();

/**
 * CuoralModal component displays the widget using expo-web-browser
 * Note: iOS SFSafariViewController always shows URL bar, share icon, toolbar (security requirement)
 */
const CuoralModal = forwardRef(({ 
  widgetUrl, 
  onClose,
  primaryColor,
}, ref) => {
  useImperativeHandle(ref, () => ({
    open: async () => {
      try {
        // Open with browser session reuse for 30min cache
        const result = await WebBrowser.openBrowserAsync(widgetUrl, {
          // Reuse browser cookies/session
          createTask: false,
          showInRecents: false,
          
          // iOS: Use full screen to maximize widget display
          ...(require('react-native').Platform.OS === 'ios' && {
            presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
            preferredBarTintColor: primaryColor || '#007AFF',
            preferredControlTintColor: '#ffffff',
            dismissButtonStyle: 'close',
            readerMode: false,
          }),
        });
        
        if (onClose) {
          onClose();
        }
      } catch (error) {
        Alert.alert(
          'Unable to Open',
          'Could not open the support chat. Please try again.',
          [{ text: 'OK' }]
        );
      }
    },
    close: () => {
      // expo-web-browser doesn't need explicit close
      if (onClose) {
        onClose();
      }
    },
    isOpen: () => false,
  }));

  // No UI needed - expo-web-browser handles everything
  return null;
});

CuoralModal.displayName = 'CuoralModal';

export default CuoralModal;

// CuoralModal.js - Opens widget using expo-web-browser for Expo managed workflow
import React, { forwardRef, useImperativeHandle } from 'react';
import { Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

/**
 * CuoralModal component displays the widget using expo-web-browser
 */
const CuoralModal = forwardRef(({ 
  widgetUrl, 
  onClose,
  primaryColor,
}, ref) => {
  useImperativeHandle(ref, () => ({
    open: async () => {
      try {
        await WebBrowser.openBrowserAsync(widgetUrl, {
          toolbarColor: primaryColor || '#007AFF',
          controlsColor: '#ffffff',
          dismissButtonStyle: 'close',
          readerMode: false,
          enableBarCollapsing: false,
          showTitle: false,
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

// CuoralModal.js - Opens widget using expo-web-browser for Expo managed workflow
import React, { forwardRef, useImperativeHandle } from 'react';
import { Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';

const LAST_OPENED_KEY = '__cuoral_last_opened';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

// Enable caching for WebBrowser - reuses existing session
WebBrowser.maybeCompleteAuthSession();

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
        // Check cache - if opened recently, skip
        const lastOpened = await SecureStore.getItemAsync(LAST_OPENED_KEY);
        if (lastOpened) {
          const timeSinceLastOpen = Date.now() - parseInt(lastOpened, 10);
          if (timeSinceLastOpen < CACHE_DURATION) {
            // Within cache window - skip opening
            if (onClose) {
              onClose();
            }
            return;
          }
        }
        
        // Open with minimal controls
        await WebBrowser.openBrowserAsync(widgetUrl, {
          // Hide toolbar completely
          showInRecents: false,
          enableBarCollapsing: true,
          
          // iOS specific - minimal UI
          ...(require('react-native').Platform.OS === 'ios' && {
            presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
          }),
        });
        
        // Store last opened timestamp
        await SecureStore.setItemAsync(LAST_OPENED_KEY, Date.now().toString());
        
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

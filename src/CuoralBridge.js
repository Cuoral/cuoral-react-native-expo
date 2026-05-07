// CuoralBridge.js
// Bridge for communication between WebView and React Native

import { CuoralMessageType } from './types';

/**
 * CuoralBridge handles message passing between the WebView widget and React Native
 */
export class CuoralBridge {
  constructor(options = {}) {
    this.widgetUrl = options.widgetUrl;
    this.debug = options.debug || false;
    this.webViewRef = null;
    this.messageHandlers = new Map();
    this.isInitialized = false;
    
    this.log('Bridge created with URL:', this.widgetUrl);
  }

  /**
   * Set the WebView reference
   * @param {Object} ref - React ref to the WebView component
   */
  setWebViewRef(ref) {
    this.webViewRef = ref;
    this.log('WebView ref set');
  }

  /**
   * Initialize the bridge
   */
  initialize() {
    if (this.isInitialized) {
      this.log('Bridge already initialized');
      return;
    }
    
    this.isInitialized = true;
    this.log('Bridge initialized');
    
    // Send NATIVE_READY message to widget
    setTimeout(() => {
      this.sendToWidget({
        type: CuoralMessageType.NATIVE_READY,
        payload: {
          timestamp: Date.now(),
          platform: 'react-native-expo'
        }
      });
    }, 1000);
  }

  /**
   * Handle messages from the WebView
   * @param {Object} event - Message event from WebView
   */
  handleMessage(event) {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      this.log('Received message from widget:', message);
      
      // Call registered handlers for this message type
      const handlers = this.messageHandlers.get(message.type);
      if (handlers && handlers.length > 0) {
        handlers.forEach(handler => {
          try {
            handler(message.payload);
          } catch (error) {
            // Silent error handling
          }
        });
      } else {
        this.log('No handler registered for message type:', message.type);
      }
    } catch (error) {
      // Silent error handling
    }
  }

  /**
   * Send a message to the WebView widget
   * @param {Object} message - Message to send
   */
  sendToWidget(message) {
    if (!this.webViewRef || !this.webViewRef.current) {
      this.log('Cannot send message: WebView ref not set');
      return;
    }

    try {
      const messageString = JSON.stringify(message);
      this.log('Sending message to widget:', message);
      
      // Use postMessage to send data to WebView
      this.webViewRef.current.postMessage(messageString);
    } catch (error) {
      // Silent error handling
    }
  }

  /**
   * Register a message handler
   * @param {string} messageType - Message type from CuoralMessageType
   * @param {Function} handler - Handler function
   */
  on(messageType, handler) {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, []);
    }
    
    this.messageHandlers.get(messageType).push(handler);
    this.log('Registered handler for message type:', messageType);
  }

  /**
   * Unregister a message handler
   * @param {string} messageType - Message type
   * @param {Function} handler - Handler function to remove
   */
  off(messageType, handler) {
    const handlers = this.messageHandlers.get(messageType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
        this.log('Unregistered handler for message type:', messageType);
      }
    }
  }

  /**
   * Update the widget URL
   * @param {string} newUrl - New URL for the widget
   */
  updateWidgetUrl(newUrl) {
    this.widgetUrl = newUrl;
    this.log('Widget URL updated:', newUrl);
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.messageHandlers.clear();
    this.webViewRef = null;
    this.isInitialized = false;
    this.log('Bridge destroyed');
  }

  /**
   * Log debug messages
   * @param {...any} args - Arguments to log
   */
  log(...args) {
    // Debug logs removed for production
  }
}

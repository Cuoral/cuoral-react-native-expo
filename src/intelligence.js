// intelligence.js - Customer Intelligence tracking for React Native
// Matches Flutter SDK v0.0.5 implementation

import { EventQueue } from './EventQueue';

const SESSION_KEY = '__x_loadID';
const BACKEND_URL = 'https://api.cuoral.com';

/**
 * Intelligence tracking manager
 * Matches Flutter SDK architecture with 3 EventQueues + custom events list
 */
class IntelligenceManager {
  constructor() {
    this.sessionId = null;
    this.debug = false;
    this.lastScreen = '';
    this.customEvents = [];
    this.customEventsTimer = null;
    this.isFlushingCustomEvents = false;
    
    // Three separate queues for different event types
    this.pageViewQueue = null;
    this.consoleErrorQueue = null;
    this.apiResponseQueue = null;
    
    // Network interception state
    this.originalFetch = null;
    this.originalXHR = null;
  }

  /**
   * Initialize intelligence tracking
   */
  async initialize(sessionId, debug = false) {
    this.sessionId = sessionId;
    this.debug = debug;

    // Create event queues
    this.pageViewQueue = new EventQueue(
      `${BACKEND_URL}/customer-intelligence/page-view`,
      debug
    );
    this.consoleErrorQueue = new EventQueue(
      `${BACKEND_URL}/customer-intelligence/console-error`,
      debug
    );
    this.apiResponseQueue = new EventQueue(
      `${BACKEND_URL}/customer-intelligence/api-response`,
      debug
    );

    // Setup automatic tracking
    this.setupNetworkInterception();
    this.setupErrorHandler();
  }

  /**
   * Get device metadata
   */
  getMetadata() {
    // Import only when needed, not at module level
    const { Platform, Dimensions } = require('react-native');
    
    const { width: screenWidth, height: screenHeight } = Dimensions.get('screen');
    const { width: windowWidth, height: windowHeight } = Dimensions.get('window');
    
    return {
      platform: Platform.OS,
      os_version: Platform.Version.toString(),
      device_model: Platform.select({
        ios: 'iPhone',
        android: 'Android',
      }),
      viewport_width: windowWidth,
      viewport_height: windowHeight,
      screen_width: screenWidth,
      screen_height: screenHeight,
    };
  }

  /**
   * Track page/screen view
   */
  trackPageView(screen, metadata = {}) {
    if (!this.sessionId) {
      return;
    }

    // Filter out invalid screen names (like Flutter SDK does)
    if (!screen || screen.includes('(') || screen.includes(')') || 
        screen.includes('<') || screen.includes('>') || 
        screen.includes('RouteSettings') || screen.includes('Controller')) {
      return;
    }

    const event = {
      url: screen,
      title: screen,
      referrer: this.lastScreen || '',
      timestamp: Date.now(),
      session_id: this.sessionId,
      source: 'mobile',
      metadata: {
        ...this.getMetadata(),
        ...metadata,
      },
    };

    this.pageViewQueue.enqueue(event);
    this.lastScreen = screen;
  }

  /**
   * Track error
   */
  trackError(message, stackTrace = '', metadata = {}) {
    if (!this.sessionId) return;

    const event = {
      message,
      stack_trace: stackTrace || 'No stack trace available',
      log_level: 'error',
      url: this.lastScreen || 'mobile-app',
      line: 0,
      column: 0,
      session_id: this.sessionId,
      source: 'mobile',
      console_metadata: {
        ...this.getMetadata(),
        error_type: 'javascript_error',
        ...metadata,
      },
    };

    this.consoleErrorQueue.enqueue(event);
  }

  /**
   * Track custom event
   */
  trackCustomEvent(name, category, properties = {}, elementSelector = '', elementText = '') {
    if (!this.sessionId) {
      return;
    }

    const customEvent = {
      session_id: this.sessionId,
      name,
      category,
      url: this.lastScreen || 'mobile-app',
      element_selector: elementSelector,
      element_text: elementText,
      event_timestamp: new Date().toISOString(),
      properties: {
        ...this.getMetadata(),
        ...properties,
      },
    };

    this.customEvents.push(customEvent);

    // Batch with same rules as EventQueue (10 max, 2s timer)
    if (this.customEvents.length >= 10) {
      this.flushCustomEvents();
    } else {
      this.resetCustomEventsTimer();
    }
  }

  /**
   * Reset custom events timer
   */
  resetCustomEventsTimer() {
    if (this.customEventsTimer) {
      clearTimeout(this.customEventsTimer);
    }

    this.customEventsTimer = setTimeout(() => {
      this.flushCustomEvents();
    }, 2000);
  }

  /**
   * Flush custom events
   * Format matches Flutter SDK - single wrapper object with custom_events array
   */
  async flushCustomEvents() {
    if (this.isFlushingCustomEvents || this.customEvents.length === 0) {
      return;
    }

    this.isFlushingCustomEvents = true;

    if (this.customEventsTimer) {
      clearTimeout(this.customEventsTimer);
      this.customEventsTimer = null;
    }

    try {
      const eventsToSend = this.customEvents.splice(0, 10);

      // IMPORTANT: Different format from other events - wrapper object
      const payload = {
        session_id: this.sessionId,
        custom_events: eventsToSend,
      };

      const response = await fetch(
        `${BACKEND_URL}/customer-intelligence/session-recording/batch`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      // If more remain, reset timer
      if (this.customEvents.length > 0) {
        this.resetCustomEventsTimer();
      }
    } catch (error) {
      // Fail silently
    } finally {
      this.isFlushingCustomEvents = false;
    }
  }

  /**
   * Setup network interception
   * Tracks 4xx/5xx responses and network failures
   */
  setupNetworkInterception() {
    // Save original fetch
    if (!this.originalFetch) {
      this.originalFetch = global.fetch;
    }

    // Override fetch
    global.fetch = async (...args) => {
      const [url, options = {}] = args;
      const urlString = url.toString();

      // Exclude Cuoral API to avoid infinite loop
      if (urlString.includes('api.cuoral.com') || 
          urlString.includes('localhost') || 
          urlString.includes('127.0.0.1')) {
        return this.originalFetch(...args);
      }

      const startTime = Date.now();
      const method = options.method || 'GET';

      try {
        const response = await this.originalFetch(...args);
        const duration = Date.now() - startTime;

        // Only track errors (4xx, 5xx)
        if (response.status >= 400) {
          await this.trackNetworkError(
            urlString,
            method,
            response.status,
            duration,
            options.body,
            response
          );
        }

        return response;
      } catch (error) {
        const duration = Date.now() - startTime;
        
        // Network failure (status 0)
        await this.trackNetworkError(
          urlString,
          method,
          0,
          duration,
          options.body,
          null,
          error.message
        );

        throw error;
      }
    };

    if (this.debug) {
    }
  }

  /**
   * Track network error
   */
  async trackNetworkError(url, method, statusCode, duration, requestBody, response, errorMessage) {
    if (!this.sessionId) return;

    try {
      let responseBody = {};
      if (response) {
        try {
          responseBody = await response.clone().json();
        } catch {
          const text = await response.clone().text();
          responseBody = { body: text.substring(0, 1000) };
        }
      }

      const event = {
        url,
        method,
        status_code: statusCode, // IMPORTANT: status_code not status
        duration,
        timestamp: Date.now(),
        session_id: this.sessionId,
        source: 'mobile',
        request_body: requestBody ? { body: JSON.stringify(requestBody).substring(0, 1000) } : {},
        response_body: responseBody, // IMPORTANT: Must be object not string
        error: true,
        api_metadata: {
          ...this.getMetadata(),
          error_message: errorMessage || `HTTP ${statusCode}`,
        },
      };

      this.apiResponseQueue.enqueue(event);
    } catch (error) {
      if (this.debug) {
      }
    }
  }

  /**
   * Setup global error handler
   */
  setupErrorHandler() {
    // React Native global error handler
    const originalHandler = global.ErrorUtils.getGlobalHandler();

    global.ErrorUtils.setGlobalHandler((error, isFatal) => {
      this.trackError(
        error.message || 'Unknown error',
        error.stack || '',
        {
          is_fatal: isFatal,
          error_type: 'unhandled_error',
        }
      );

      // Call original handler
      if (originalHandler) {
        originalHandler(error, isFatal);
      }
    });
  }

  /**
   * Update session ID
   */
  updateSessionId(newSessionId) {
    this.sessionId = newSessionId;
  }

  /**
   * Flush all queues
   */
  async flush() {
    if (this.pageViewQueue) await this.pageViewQueue.flush();
    if (this.consoleErrorQueue) await this.consoleErrorQueue.flush();
    if (this.apiResponseQueue) await this.apiResponseQueue.flush();
    await this.flushCustomEvents();
  }

  /**
   * Destroy intelligence
   */
  destroy() {
    if (this.pageViewQueue) this.pageViewQueue.destroy();
    if (this.consoleErrorQueue) this.consoleErrorQueue.destroy();
    if (this.apiResponseQueue) this.apiResponseQueue.destroy();
    
    this.customEvents = [];
    if (this.customEventsTimer) {
      clearTimeout(this.customEventsTimer);
    }

    // Restore original fetch
    if (this.originalFetch) {
      global.fetch = this.originalFetch;
    }

    this.sessionId = null;
  }
}

// Singleton instance
const intelligenceManager = new IntelligenceManager();

/**
 * Public API
 */
export const initializeIntelligence = async (sessionId, debug = false) => {
  await intelligenceManager.initialize(sessionId, debug);
};

export const trackPageView = (screen, metadata = {}) => {
  intelligenceManager.trackPageView(screen, metadata);
};

export const trackError = (message, stackTrace = '', metadata = {}) => {
  intelligenceManager.trackError(message, stackTrace, metadata);
};

export const trackCustomEvent = (name, category, properties = {}, elementSelector = '', elementText = '') => {
  intelligenceManager.trackCustomEvent(name, category, properties, elementSelector, elementText);
};

export const updateIntelligenceSession = (sessionId) => {
  intelligenceManager.updateSessionId(sessionId);
};

export const flushIntelligence = async () => {
  await intelligenceManager.flush();
};

export const destroyIntelligence = () => {
  intelligenceManager.destroy();
};

/**
 * Intelligence API object (for direct use without component)
 */
export const CuoralIntelligence = {
  trackPageView,
  trackError,
  trackCustomEvent,
};

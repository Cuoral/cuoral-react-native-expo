// CuoralLauncher.js - Launcher for Expo managed workflow with expo-web-browser
import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import CuoralModal from './CuoralModal';
import MessageCircleIcon from './MessageCircleIcon';
import {
  initializeIntelligence,
  trackPageView as intelligenceTrackPageView,
  trackError as intelligenceTrackError,
  trackCustomEvent as intelligenceTrackCustomEvent,
  updateIntelligenceSession,
  flushIntelligence,
  destroyIntelligence,
} from './intelligence';

const PRODUCTION_WIDGET_URL = 'https://js.cuoral.com/mobile.html';
const SESSION_KEY = '__x_loadID';

/**
 * CuoralLauncher - Main component for Cuoral SDK (Expo managed workflow)
 * Uses expo-web-browser to open the widget
 * 
 * Usage with ref:
 * const cuoralRef = useRef(null);
 * <CuoralLauncher ref={cuoralRef} publicKey="..." />
 * cuoralRef.current.trackPageView('/home', { ... });
 */
const CuoralLauncher = forwardRef(({
  publicKey,
  email,
  firstName,
  lastName,
  debug = false,
  widgetBaseUrl = PRODUCTION_WIDGET_URL,
  showFloatingButton = true,
  buttonColor = '#007AFF',
  buttonPosition = 'bottomRight',
  buttonSize = 60,
  buttonIcon = null, // null = use default SVG icon, or pass string for custom text icon
}, ref) => {
  const [sessionId, setSessionId] = useState(null);
  const [widgetUrl, setWidgetUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState(buttonColor);
  
  const modalRef = useRef(null);

  // Expose tracking methods via ref
  useImperativeHandle(ref, () => ({
    /**
     * Track a page/screen view
     * @param {string} screen - Screen name (e.g., '/home', 'CheckoutScreen')
     * @param {object} metadata - Optional additional data
     */
    trackPageView: (screen, metadata = {}) => {
      intelligenceTrackPageView(screen, metadata);
    },

    /**
     * Track an error manually
     * @param {string} message - Error message
     * @param {string} stackTrace - Error stack trace
     * @param {object} metadata - Optional additional data
     */
    trackError: (message, stackTrace = '', metadata = {}) => {
      intelligenceTrackError(message, stackTrace, metadata);
    },

    /**
     * Track a custom business event
     * @param {string} name - Event name (e.g., 'add_to_cart', 'button_clicked')
     * @param {string} category - Event category (e.g., 'ecommerce', 'navigation', 'conversion')
     * @param {object} properties - Custom properties object
     */
    trackCustomEvent: (name, category, properties = {}) => {
      intelligenceTrackCustomEvent(name, category, properties);
    },

    /**
     * Open the modal/browser programmatically
     */
    open: () => {
      openModal();
    },

    /**
     * Close the modal programmatically (WebView mode only)
     */
    close: () => {
      if (modalRef.current) {
        modalRef.current.close();
      }
    },

    /**
     * Get the current session ID
     */
    getSessionId: () => sessionId,

    /**
     * Flush all intelligence queues
     */
    flush: async () => {
      await flushIntelligence();
    },

    /**
     * Clear and end the current session (call before logout)
     */
    clearSession: async () => {
      try {
        const storedSession = await SecureStore.getItemAsync(SESSION_KEY);
        
        if (storedSession) {
          const { sessionId: sid } = JSON.parse(storedSession);
          
          if (sid) {
            // Notify backend to close the session
            await fetch('https://api.cuoral.com/conversation/end-session', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-org-id': publicKey,
              },
              body: JSON.stringify({ 
                session_id: sid
              }),
            }).catch(() => {
              // Fail silently
            });
          }
        }
        
        // Clear local session storage
        await SecureStore.deleteItemAsync(SESSION_KEY);
        
        // Close modal if open
        if (modalRef.current) {
          modalRef.current.close();
        }
        
        // Clear intelligence session
        destroyIntelligence();
        
        // Reset session state
        setSessionId(null);
        setWidgetUrl('');
      } catch (error) {
        // Fail silently - always clear local storage
        await SecureStore.deleteItemAsync(SESSION_KEY);
        setSessionId(null);
        setWidgetUrl('');
      }
    },
  }));

  // Initialize session and widget URL
  useEffect(() => {
    initializeSession();
  }, []);

  // Update widget URL when session or user info changes
  useEffect(() => {
    if (publicKey) {
      const url = buildWidgetUrl();
      setWidgetUrl(url);
    }
  }, [sessionId, publicKey, email, firstName, lastName]);

  /**
   * Initialize or retrieve existing session
   * Matches Flutter SDK session management logic
   */
  const initializeSession = async () => {
    try {
      // Check for existing session
      const sessionData = await SecureStore.getItemAsync(SESSION_KEY);
      
      if (sessionData) {
        try {
          const { sessionId: existingSessionId, createdAt } = JSON.parse(sessionData);
          
          log('Found session:', existingSessionId);
          
          // Validate with backend
          const sessionInfo = await fetchSessionInfo(existingSessionId);
          
          if (sessionInfo) {
            // Session valid
            setSessionId(existingSessionId);
            
            if (sessionInfo.configuration?.color) {
              setPrimaryColor(sessionInfo.configuration.color);
            }
            
            // Initialize intelligence if enabled
            if (sessionInfo.configuration?.customer_intelligence) {
              await initializeIntelligence(existingSessionId, debug);
              log('Intelligence initialized');
            }
            
            // Set profile if needed (only if session has no email)
            await setProfileIfNeeded(existingSessionId, sessionInfo);
            
            log('Using existing session:', existingSessionId);
            return;
          }
        } catch (parseError) {
          log('Invalid session data format, clearing');
        }
        
        // Clear invalid/expired session
        await SecureStore.deleteItemAsync(SESSION_KEY);
      }
      
      // Create new session
      const newSessionId = await initiateSession();
      if (newSessionId) {
        // Save with timestamp
        await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify({
          sessionId: newSessionId,
          createdAt: Date.now(),
        }));
        
        setSessionId(newSessionId);
        log('Created new session:', newSessionId);
        
        // Fetch config and initialize intelligence
        const sessionInfo = await fetchSessionInfo(newSessionId);
        if (sessionInfo) {
          if (sessionInfo.configuration?.color) {
            setPrimaryColor(sessionInfo.configuration.color);
          }
          
          if (sessionInfo.configuration?.customer_intelligence) {
            await initializeIntelligence(newSessionId, debug);
            log('Intelligence initialized');
          }
          
          // Set profile for new session
          await setProfileIfNeeded(newSessionId, sessionInfo);
        }
      }
    } catch (error) {
      // Fail gracefully - don't crash the app
    }
  };

  /**
   * Set user profile if session doesn't have email
   * Matches Flutter SDK logic
   */
  const setProfileIfNeeded = async (sid, sessionInfo) => {
    try {
      // Only set profile if:
      // 1. User provided email, firstName, lastName (all non-empty)
      // 2. Session doesn't have email yet
      if (email && firstName && lastName && !sessionInfo.email) {
        log('Setting profile for session:', sid);
        
        const response = await fetch('https://api.cuoral.com/conversation/set-profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-org-id': publicKey,
          },
          body: JSON.stringify({
            session_id: sid,
            email: email,
            name: `${firstName} ${lastName}`,
          }),
          timeout: 10000,
        });

        if (response.ok) {
          log('Profile set successfully');
        } else {
          log('Failed to set profile:', response.status);
        }
      }
    } catch (error) {
      log('Error setting profile:', error.message);
      // Fail silently
    }
  };

  /**
   * Fetch session info (combines validation + config)
   * Handles 502/504 gracefully
   */
  const fetchSessionInfo = async (sid) => {
    try {
      const response = await fetch('https://api.cuoral.com/conversation/session/get', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-org-id': publicKey,
        },
        body: JSON.stringify({ session_id: sid }),
        timeout: 10000,
      });

      // Handle 502/504 - keep using session with intelligence enabled
      if (response.status === 502 || response.status === 504) {
        log('Backend unavailable (502/504), assuming intelligence enabled');
        return {
          configuration: { customer_intelligence: true },
          email: null,
        };
      }

      // Session not found or invalid
      if (response.status === 404 || response.status === 400) {
        return null;
      }

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      
      // Check if expired
      if (data.is_expired) {
        return null;
      }
      
      return data;
    } catch (error) {
      log('Error fetching session info:', error.message);
      // On network error, assume intelligence enabled
      return {
        configuration: { customer_intelligence: true },
        email: null,
      };
    }
  };

  /**
   * Initiate a new session with backend
   */
  const initiateSession = async () => {
    try {
      const response = await fetch('https://api.cuoral.com/conversation/initiate-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-org-id': publicKey,
        },
        body: JSON.stringify({
          public_key: publicKey,
          email: email,
          first_name: firstName,
          last_name: lastName,
        }),
        timeout: 10000,
      });

      // Handle 502/504 gracefully
      if (response.status === 502 || response.status === 504) {
        log('Backend unavailable during session creation');
        return null;
      }

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.status && data.session_id ? data.session_id : null;
    } catch (error) {
      log('Failed to initiate session:', error.message);
      return null;
    }
  };

  /**
   * Build widget URL with parameters
   */
  const buildWidgetUrl = () => {
    const params = new URLSearchParams({
      auto_start: 'true',
      key: publicKey,
      is_mobile: 'true',
      _t: Date.now().toString(),
    });
    
    if (sessionId) {
      params.set('cuoral_mobile_session_id', sessionId);
    }
    
    if (email) params.set('email', email);
    if (firstName) params.set('first_name', firstName);
    if (lastName) params.set('last_name', lastName);
    
    return `${widgetBaseUrl}?${params.toString()}`;
  };

  /**
   * Cleanup intelligence on unmount
   */
  useEffect(() => {
    return () => {
      destroyIntelligence();
    };
  }, []);

  /**
   * Open the modal/browser
   */
  const openModal = () => {
    if (modalRef.current) {
      modalRef.current.open();
    }
  };

  /**
   * Handle modal close
   */
  const handleModalClose = () => {
    log('Modal closed');
  };

  /**
   * Get button position styles
   */
  const getButtonPositionStyle = () => {
    const baseStyle = {
      position: 'absolute',
    };

    switch (buttonPosition) {
      case 'topLeft':
        return { ...baseStyle, top: 20, left: 20 };
      case 'topRight':
        return { ...baseStyle, top: 20, right: 20 };
      case 'bottomLeft':
        return { ...baseStyle, bottom: 20, left: 20 };
      case 'bottomRight':
      default:
        return { ...baseStyle, bottom: 20, right: 20 };
    }
  };

  /**
   * Log debug messages
   */
  const log = (...args) => {
    if (debug) {
      console.log('[Cuoral]', ...args);
    }
  };

  if (!publicKey) {
      // Debug logging removed
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Floating Action Button */}
      {showFloatingButton && (
        <TouchableOpacity
          style={[
            styles.fab,
            getButtonPositionStyle(),
            {
              backgroundColor: primaryColor,
              width: buttonSize,
              height: buttonSize,
              borderRadius: buttonSize / 2,
            },
          ]}
          onPress={openModal}
          activeOpacity={0.8}
        >
          {buttonIcon ? (
            <Text style={styles.fabIcon}>{buttonIcon}</Text>
          ) : (
            <MessageCircleIcon size={buttonSize * 0.5} color="#ffffff" />
          )}
        </TouchableOpacity>
      )}

      {/* Modal - triggers expo-web-browser */}
      {widgetUrl && (
        <CuoralModal
          ref={modalRef}
          widgetUrl={widgetUrl}
          onClose={handleModalClose}
          primaryColor={primaryColor}
        />
      )}
    </View>
  );
});

CuoralLauncher.displayName = 'CuoralLauncher';

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'box-none',
  },
  fab: {
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabIcon: {
    fontSize: 28,
  },
});

export default CuoralLauncher;

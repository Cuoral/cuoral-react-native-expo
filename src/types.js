// types.js
// Message types for communication between WebView and React Native

export const CuoralMessageType = {
  // Recording messages
  START_RECORDING: 'START_RECORDING',
  STOP_RECORDING: 'STOP_RECORDING',
  RECORDING_STARTED: 'RECORDING_STARTED',
  RECORDING_STOPPED: 'RECORDING_STOPPED',
  RECORDING_ERROR: 'RECORDING_ERROR',
  
  // Modal/UI messages
  CLOSE_MODAL: 'CLOSE_MODAL',
  OPEN_MODAL: 'OPEN_MODAL',
  MODAL_OPENED: 'MODAL_OPENED',
  MODAL_CLOSED: 'MODAL_CLOSED',
  
  // Session messages
  SESSION_CREATED: 'SESSION_CREATED',
  SESSION_UPDATED: 'SESSION_UPDATED',
  
  // Ready state
  WIDGET_READY: 'WIDGET_READY',
  NATIVE_READY: 'NATIVE_READY',
};

/**
 * @typedef {Object} CuoralOptions
 * @property {string} publicKey - Your Cuoral public key
 * @property {string} [email] - Optional: User's email to pre-fill
 * @property {string} [firstName] - Optional: User's first name to pre-fill
 * @property {string} [lastName] - Optional: User's last name to pre-fill
 * @property {boolean} [debug] - Optional: Enable debug logging
 * @property {string} [widgetBaseUrl] - Optional: Custom widget URL (default: https://js.cuoral.com/mobile.html)
 * @property {boolean} [showFloatingButton] - Optional: Show floating chat button (default: true)
 * @property {string} [buttonColor] - Optional: Floating button background color (default: #007AFF)
 * @property {string} [buttonPosition] - Optional: Button position: 'bottomRight', 'bottomLeft', 'topRight', 'topLeft' (default: 'bottomRight')
 * @property {number} [buttonSize] - Optional: Button size in pixels (default: 60)
 * @property {string} [buttonIcon] - Optional: Custom button icon (emoji or text)
 */

/**
 * @typedef {Object} SessionConfiguration
 * @property {boolean} [customer_intelligence] - Whether intelligence is enabled
 * @property {string} [color] - Organization's primary brand color
 * @property {string} [config_name] - Configuration name
 * @property {string} [support_name] - Support team name
 */

/**
 * @typedef {Object} SessionResponse
 * @property {string} [session_id] - Session ID
 * @property {boolean} [status] - Status of the request
 * @property {boolean} [is_expired] - Whether session is expired
 * @property {string} [email] - User email
 * @property {SessionConfiguration} [configuration] - Session configuration
 */

/**
 * @typedef {Object} CuoralMessage
 * @property {string} type - Message type from CuoralMessageType
 * @property {Object} [payload] - Optional message payload
 */

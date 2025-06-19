// src/context/CuoralContext.js
import React, { createContext, useState, useContext, useCallback, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage'; // For persisting session_id
import { io } from 'socket.io-client'; // For real-time messaging
import * as Notifications from 'expo-notifications'; // For push notifications
import { Audio } from 'expo-av'; // For playing sound alerts

// Set notification handler for foreground notifications
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true, // Let the app play its own sound if desired
        shouldSetBadge: false,
    }),
});

// Create the context
const CuoralContext = createContext(null);

const SESSION_STORAGE_KEY = 'cuoral_session_id';

/**
 * CuoralProvider component manages the global state for the Cuoral chat library,
 * including public key, user details (email, first name, last name), chat messages,
 * session ID, chat theme color, and API/socket loading states.
 *
 * @param {object} props - The component props.
 * @param {string} props.publicKey - The public key for Cuoral.
 * @param {string} [props.initialEmail] - Initial email for the user.
 * @param {string} [props.initialFirstName] - Initial first name for the user.
 * @param {string} [props.initialLastName] - Initial last name for the user.
 * @param {Function} props.closeModal - Function to close the chat modal.
 * @param {React.ReactNode} props.children - Child components to be rendered within the provider's scope.
 */
export const CuoralProvider = ({
    publicKey,
    initialEmail,
    initialFirstName,
    initialLastName,
    closeModal,
    children,
}) => {
    const [email, setEmail] = useState(initialEmail || '');
    const [firstName, setFirstName] = useState(initialFirstName || '');
    const [lastName, setLastName] = useState(initialLastName || '');
    const [messages, setMessages] = useState([]); // Array to store chat messages

    const [sessionId, setSessionId] = useState(null); // Cuoral session ID
    const [chatThemeColor, setChatThemeColor] = useState('#2196F3'); // Default color, will be updated from config
    const [isLoadingSession, setIsLoadingSession] = useState(true); // Loading state for API calls
    const [sessionError, setSessionError] = useState(null); // Error state for API calls
    const [sessionProfileExists, setSessionProfileExists] = useState(false); // New state to track if session has profile info
    const [sessionStatus, setSessionStatus] = useState('loading'); // 'loading', 'active', 'closed', 'error'

    // Temporary state for email/name input on the details screen (used only in ChatDetailsScreen)
    const [tempUserEmail, setTempUserEmail] = useState('');
    const [tempUserName, setTempUserName] = useState('');

    const socketRef = useRef(null); // Ref to hold the Socket.IO client instance
    const notificationSound = useRef(new Audio.Sound()); // Ref for notification sound

    // API Endpoints
    const initiateSessionUrl = "https://api.cuoral.com/conversation/initiate-session";
    const getSessionUrl = "https://api.cuoral.com/conversation/get-single-session";
    const setProfileUrl = "https://api.cuoral.com/conversation/set-profile";
    const fileUploadUrl = "https://api.cuoral.com/file-upload";
    const socketUrl = 'https://wss.cuoral.com/';

    // URL for the notification sound - CHANGE THIS TO YOUR ACTUAL MP3 URL
    const notificationSoundUrl = 'https://example.com/path/to/your/notification.mp3';


    // --- Push Notification Functions ---
    const registerForPushNotificationsAsync = useCallback(async () => {
        let token;
        try {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                alert('Failed to get push token for push notification!');
                return null;
            }

            token = (await Notifications.getExpoPushTokenAsync()).data;
            // You might want to send this token to your backend to link with the session/user
            return token;
        } catch (error) {
            return null;
        }
    }, []);

    const sendLocalNotification = useCallback(async (title, body) => {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: title,
                body: body,
                sound: 'default',
            },
            trigger: null,
        });
    }, []);

    // --- Sound Alert Function ---
    const playNotificationSound = useCallback(async () => {
        try {
            if (!notificationSound.current._loaded) {
                await notificationSound.current.loadAsync({ uri: notificationSoundUrl });
            }
            await notificationSound.current.replayAsync();
        } catch (error) {
        }
    }, [notificationSoundUrl]);


    // Function to initiate a new Cuoral session
    const initiateSession = useCallback(async (userEmail = undefined, userFirstName = undefined, userLastName = undefined) => {
        setIsLoadingSession(true);
        setSessionError(null);
        setSessionStatus('loading');
        setMessages([]); // Clear messages on new session initiation
        setSessionProfileExists(false); // Reset profile status for new session

        try {
            const initiateSessionPayload = {
                public_key: publicKey,
                email: userEmail,
                first_name: userFirstName,
                last_name: userLastName,
            };

            const response = await fetch(initiateSessionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "x-org-id": publicKey || "undefined"
                },
                body: JSON.stringify(initiateSessionPayload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || response.statusText}`);
            }

            const data = await response.json();
            if (data.status && data.session_id) {
                setSessionId(data.session_id);
                await AsyncStorage.setItem(SESSION_STORAGE_KEY, data.session_id);
                if (data.configuration && data.configuration.color) {
                    setChatThemeColor(data.configuration.color);
                }

                const success = await getSession(data.session_id); // getSession will set status to 'active' or 'closed'
                if (success) {
                    setSessionStatus('active');
                } else {
                    setSessionStatus('error');
                }
                return success;
            } else {
                throw new Error('Failed to initiate session: No session_id returned.');
            }
        } catch (error) {
            setSessionError(error.message || 'Failed to initiate chat session.');
            setSessionStatus('error');
            return false;
        } finally {
            setIsLoadingSession(false);
        }
    }, [publicKey, getSession]);

    // Function to get a single session's details and messages
    const getSession = useCallback(async (sId) => {
        if (!sId) {
            setSessionError('Session ID is missing for getSession.');
            setIsLoadingSession(false);
            setSessionStatus('error');
            return false;
        }
        setIsLoadingSession(true);
        setSessionError(null);
        setSessionStatus('loading');
        try {
            const getSessionPayload = {
                session_id: sId,
            };

            const response = await fetch(getSessionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "x-org-id": publicKey || "undefined",
                },
                body: JSON.stringify(getSessionPayload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || response.statusText}`);
            }

            const data = await response.json();
            if (data.session_id) {
                setSessionId(data.session_id);
                if (data.configuration && data.configuration.color) {
                    setChatThemeColor(data.configuration.color);
                }

                const sessionEmail = data.email || '';
                const sessionName = data.name || '';
                setEmail(sessionEmail);
                const nameParts = sessionName.split(' ');
                setFirstName(nameParts[0] || '');
                setLastName(nameParts.slice(1).join(' ') || '');

                setSessionProfileExists(!!sessionEmail && !!sessionName);

                const loadedMessages = data.messages.map(msg => ({
                    id: msg.time_created || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                    text: msg.message,
                    sender: msg.message_type === 'REPLY' ? msg.author_type === 'HUMAN' ? 'admin' : 'bot': 'user',
                    timestamp: new Date(msg.time_created),
                    fileUrl: msg.file_url || null,
                    fileName: msg.filename || null,
                })).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

                setMessages(loadedMessages);

                if (data.status === 'closed') {
                    setSessionStatus('closed');
                    // No socket connection if session is closed
                } else {
                    setSessionStatus('active');
                    connectSocket(data.session_id); // Only connect socket if session is active
                }
                return true;
            } else {
                throw new Error('Failed to retrieve session: Invalid session data or missing session ID.');
            }
        } catch (error) {
 
            setSessionError(error.message || 'Failed to load chat session.');
            setSessionStatus('error');
            return false;
        } finally {
            setIsLoadingSession(false);
        }
    }, [publicKey, connectSocket, initiateSession]);


    // Function to set user profile for an existing session
    const setProfile = useCallback(async (sId, userEmail, userName) => {
        setIsLoadingSession(true);
        setSessionError(null);
        setSessionStatus('loading');
        try {
            const payload = {
                session_id: sId,
                email: userEmail,
                name: userName,
            };

            const response = await fetch(setProfileUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || response.statusText}`);
            }

            const data = await response.json();
            if (data.status) {
                setEmail(userEmail);
                const nameParts = userName.split(' ');
                setFirstName(nameParts[0] || '');
                setLastName(nameParts.slice(1).join(' ') || '');
                setSessionProfileExists(true);
                setSessionStatus('active'); // Profile is set, session is active
                return true;
            } else {
                throw new Error('Failed to set profile: API returned false status.');
            }
        } catch (error) {
 
            setSessionError(error.message || 'Failed to set profile information.');
            setSessionStatus('error');
            return false;
        } finally {
            setIsLoadingSession(false);
        }
    }, []);


    // Socket.IO Connection and Event Handling
    const connectSocket = useCallback((sId) => {
        if (!sId) {
            return;
        }
        // Disconnect and remove all previous listeners from the old socket instance if it exists
        if (socketRef.current) {
            socketRef.current.off(); // Remove all listeners
            socketRef.current.disconnect();
            socketRef.current = null;
        }

  
        const newSocket = io(socketUrl, {
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            maxHttpBufferSize: 1e8,
            pingTimeout: 60000,
            query: { sessionId: sId }
        });

        socketRef.current = newSocket;

        newSocket.on("connect", () => {
   
            newSocket.emit("join", sId);
        });

        newSocket.on("send_message", (message) => {
            if (!message || !message?.messageData) return;

            const isReply = message.messageData.message_type?.toLowerCase() === 'reply';
            const isExternalChannel = message.messageData.channel === 'external';
            const incomingConversationId = message.room;

            if (isReply && isExternalChannel && incomingConversationId === sId) {
                const newMessageFromSocket = {
                    id: message.messageData.time_created || `socket_msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                    conversationId: incomingConversationId,
                    text: message.messageData.message,
                    sender: message.messageData.author_type === 'HUMAN' ? 'admin' : 'bot',
                    timestamp: new Date(message.messageData.time_created || Date.now()),
                    fileUrl: message.messageData.file_url || null,
                    fileName: message.messageData.filename || null,
                };
                setMessages((prevMessages) => {
                    const lastMessage = prevMessages[prevMessages.length - 1];
                    // Check if the new message is a duplicate of the last message
                    // Compare ID (derived from time_created + random) or text content
                    if (
                        lastMessage &&
                        (lastMessage.id === newMessageFromSocket.id ||
                            (lastMessage.text === newMessageFromSocket.text && lastMessage.sender === newMessageFromSocket.sender && lastMessage.fileUrl === newMessageFromSocket.fileUrl))
                    ) {
                        return prevMessages; // Return current messages without adding duplicate
                    }
                    if (newMessageFromSocket.sender === 'bot' || newMessageFromSocket.sender === 'admin') {
                        playNotificationSound();
                        sendLocalNotification('New Message from Cuoral', newMessageFromSocket.text);
                    }
                    return [...prevMessages, newMessageFromSocket].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                });

                
            }
        });

        newSocket.on("send_file", (message) => {
 
            if (!message || !message?.messageData) return;

            const isExternalChannel = message.messageData.channel === 'external';
            const incomingConversationId = message.room;

            if (isExternalChannel && incomingConversationId === sId && message.messageData.message_type?.toLowerCase() === 'reply') {
                const newFileMessageFromSocket = {
                    id: message.messageData.time_created || `socket_file_msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                    conversationId: incomingConversationId,
                    text: message.messageData.message || '',
                    sender: message.messageData.author_type === 'HUMAN' ? 'admin' : 'bot',
                    timestamp: new Date(message.messageData.time_created || Date.now()),
                    fileUrl: message.messageData.file || message.messageData.file_url || null,
                    fileName: message.messageData.filename || null,
                };
                setMessages((prevMessages) => {
                    const lastMessage = prevMessages[prevMessages.length - 1];
                    // Check if the new file message is a duplicate of the last message
                    if (
                        lastMessage &&
                        (lastMessage.id === newFileMessageFromSocket.id ||
                            (lastMessage.text === newFileMessageFromSocket.text && lastMessage.sender === newFileMessageFromSocket.sender && lastMessage.fileUrl === newFileMessageFromSocket.fileUrl))
                    ) {
                   
                        return prevMessages; // Return current messages without adding duplicate
                    }

                    if (newFileMessageFromSocket.sender === 'bot' || newFileMessageFromSocket.sender === 'admin') {
                        playNotificationSound();
                        sendLocalNotification('New File from Cuoral', newFileMessageFromSocket.text || 'Image received.');
                    }
                    return [...prevMessages, newFileMessageFromSocket].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                });

                
            }
        });

        newSocket.on("disconnect", (reason) => { });
        newSocket.on("error", (error) => {});
        newSocket.on("connect_error", (error) => { });

        newSocket.on("pong", (data) => {
            newSocket.emit("ping", (data) => { });
        });

    }, [playNotificationSound, sendLocalNotification]);


    // Function to clear the current session and initiate a new one
    const clearSessionAndInitiateNew = useCallback(async () => {
        // Disconnect current socket if it's active
        if (socketRef.current && socketRef.current.connected) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }
        await AsyncStorage.removeItem(SESSION_STORAGE_KEY); // Remove stored session ID
        setSessionId(null);
        setMessages([]); // Clear messages
        setSessionProfileExists(false); // Reset profile status
        setSessionStatus('loading'); // Set status to loading before initiating new session
        setSessionError(null); // Clear any previous session errors
        setIsLoadingSession(true); // Indicate loading for the new session initiation

        // Initiate a new session without user details initially, or with temp if available
        await initiateSession(tempUserEmail, firstName, lastName);

    }, [initiateSession, tempUserEmail, firstName, lastName]);


    // This useEffect handles initial session loading and push notification registration
    useEffect(() => {
        const setupCuoral = async () => {
            setIsLoadingSession(true);
            setSessionStatus('loading'); // Explicitly set loading at start of setup
            try {
                await registerForPushNotificationsAsync();

                const storedSessionId = await AsyncStorage.getItem(SESSION_STORAGE_KEY);
                let sessionSuccessfullyLoaded = false;
                if (storedSessionId) {
                    
                    sessionSuccessfullyLoaded = await getSession(storedSessionId);
                }

                if (!sessionSuccessfullyLoaded) {
                    await initiateSession(initialEmail, initialFirstName, initialLastName);
                }

                // AFTER session is loaded/initiated, check if profile needs to be set
                // This runs only if a session (new or existing) has been established
                // AND the profile is not yet set AND initial details are provided.
                if (sessionId && !sessionProfileExists && (initialEmail || initialFirstName || initialLastName)) {
                    const combinedName = `${initialFirstName || ''} ${initialLastName || ''}`.trim();
                    if (initialEmail && combinedName) {
       
                        await setProfile(sessionId, initialEmail, combinedName);
                    }
                }

            } catch (error) {
                setSessionError('Failed to load or initiate session.');
                setSessionStatus('error');
            } finally {
                setIsLoadingSession(false);
            }
        };
        setupCuoral();

        return () => {
            if (notificationSound.current._loaded) {
                notificationSound.current.unloadAsync();
            }
        };
    }, [getSession, initiateSession, registerForPushNotificationsAsync, initialEmail, initialFirstName, initialLastName, sessionId, sessionProfileExists, setProfile]); // Added sessionId, sessionProfileExists, setProfile to dependencies


    const addMessageToState = useCallback((message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
    }, []);

    const resetTempUserData = useCallback(() => {
        setTempUserEmail('');
        setTempUserName('');
    }, []);


    const sendMessageViaSocket = useCallback(async (text, fileData = null, fileName = null) => {
        if (!socketRef.current || !socketRef.current.connected || !sessionId) {
            setSessionError('Cannot send message/file: Chat not connected.');
            return;
        }

        const authorName = email || `${firstName || ''} ${lastName || ''}`.trim() || 'anonymous';
        const basePayload = {
            origin: "frontend",
            message: text,
            message_type: "QUERY",
            channel: 'external',
            author: authorName,
            author_type: "HUMAN",
            conversation_id: sessionId,
            organisation_id: publicKey,
        };

        try {
            if (fileData) {
                const fileUploadPayload = {
                    ...basePayload,
                    file: fileData,
                    filename: fileName,
                };

                const response = await fetch(fileUploadUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(fileUploadPayload),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`File upload failed: ${response.status}, ${errorData.message || response.statusText}`);
                }
                socketRef.current.emit("send_file", { room: sessionId });

            } else {
                const textMessagePayload = {
                    ...basePayload,
                    file: null,
                    filename: null,
                };
                socketRef.current.emit("send_message", { room: sessionId, messageData: textMessagePayload });
            }
        } catch (error) {
            setSessionError(error.message || "Failed to send message/file.");
        }
    }, [socketRef, sessionId, email, firstName, lastName, publicKey]);


    const contextValue = {
        publicKey,
        email,
        firstName,
        lastName,
        sessionId,
        chatThemeColor,
        isLoadingSession,
        sessionError,
        sessionProfileExists,
        sessionStatus, // Expose new sessionStatus
        messages,
        tempUserEmail,
        setTempUserEmail,
        tempUserName,
        setTempUserName,
        closeModal,
        initiateSession,
        getSession,
        setProfile,
        addMessage: addMessageToState,
        sendMessageViaSocket,
        resetTempUserData,
        clearSessionAndInitiateNew, // Expose new function
        socketInstance: socketRef.current,
    };

    return (
        <CuoralContext.Provider value={contextValue}>
            {children}
        </CuoralContext.Provider>
    );
};

/**
 * Custom hook to consume the CuoralContext.
 * Throws an error if used outside of a CuoralProvider.
 */
export const useCuoral = () => {
    const context = useContext(CuoralContext);
    if (context === undefined) {
        throw new Error('useCuoral must be used within a CuoralProvider');
    }
    return context;
};

// src/screens/ChatScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
    Image, // Import Image for displaying attached photos
} from 'react-native';
// Import expo-image-picker functions
import * as ImagePicker from 'expo-image-picker';
import { useCuoral } from '../context/CuoralContext';

/**
 * ChatScreen component displays the chat interface, including messages,
 * an input field, and send button. It now sends messages via Socket.IO
 * and includes an "escalate to agent" button for bot messages.
 * This version also supports sending image attachments using expo-image-picker.
 */
const ChatScreen = ({ navigateTo }) => { // Added navigateTo prop
    const {
        messages,
        addMessage,
        sendMessageViaSocket,
        isLoadingSession,
        sessionError,
        chatThemeColor,
        sessionId,
        publicKey,
        email,
        firstName,
        lastName,
        sessionStatus, // New: Get sessionStatus from context
        clearSessionAndInitiateNew, // New: Get clearSessionAndInitiateNew from context
    } = useCuoral();

    const [inputText, setInputText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [escalatingMessageId, setEscalatingMessageId] = useState(null);
    const flatListRef = useRef(null);


  // Scroll to bottom when messages change, with a slight delay
  useEffect(() => {
    // Only attempt to scroll if there are messages and the ref potentially exists
    if (messages.length > 0) {
      // A small setTimeout ensures the scroll happens after the FlatList has rendered the new content
      // and calculated its new dimensions.
      setTimeout(() => {
        // Crucial: Check if flatListRef.current is still valid before calling scrollToEnd
        if (flatListRef.current && flatListRef.current !== null) {
            try {
                flatListRef.current.scrollToEnd({ animated: true });
            } catch (error) {
            
            }

         
        }
      }, 50); // Small delay, e.g., 50ms, can be adjusted
    }
  }, [messages]);

    // Determine the ID of the last message from a bot
    const lastBotMessage = messages
        .slice()
        .reverse()
        .find(msg => msg.sender === 'bot');
    const lastBotMessageId = lastBotMessage ? lastBotMessage.id : null;


    const handleSendMessage = async () => {
        if (inputText.trim() === '' && !isSending) { // Prevent sending empty message without a file
            return;
        }

        const userMessageText = inputText.trim();
        // Optimistic UI update: Add the message to the display immediately
        const newMessage = {
            id: `temp_msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`, // Temporary ID
            text: userMessageText,
            sender: 'user',
            timestamp: new Date(),
            // fileUrl and fileName will be added by handleAttachButtonPress if a file is selected
            fileUrl: undefined, // Placeholder, will be set when image is picked
            fileName: undefined, // Placeholder, will be set when image is picked
        };
        addMessage(newMessage); // Add placeholder message
        setInputText('');
        setIsSending(true);

        // sendMessageViaSocket will now handle both text and file based on parameters
        sendMessageViaSocket(userMessageText);

        setTimeout(() => {
            setIsSending(false);
        }, 1000);
    };

    const handleAttachButtonPress = async () => {
        // Request permissions first
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images, // Only allow images
            allowsEditing: false, // You can set this to true if you want editing capabilities
            quality: 0.7, // Image quality (0 to 1)
            base64: true, // Crucial for getting Base64 data
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const asset = result.assets[0];
            const fileType = asset.type || 'image';
            const fileExtension = asset.uri ? asset.uri.split('.').pop() : 'jpeg';
            const base64Data = asset.base64;

            const fileData = base64Data ? `data:${fileType}/${fileExtension};base64,${base64Data}` : null;
            const fileName = asset.fileName || `image.${fileExtension}`;

            if (fileData) {
                const messageWithFile = {
                    id: `temp_file_msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                    text: inputText.trim(),
                    sender: 'user',
                    timestamp: new Date(),
                    fileUrl: fileData,
                    fileName: fileName,
                };
                addMessage(messageWithFile);
                setInputText('');

                setIsSending(true);

                sendMessageViaSocket(messageWithFile.text, fileData, fileName);

                setTimeout(() => {
                    setIsSending(false);
                }, 2000);
            } else {
                Alert.alert("Error", "Could not get file data from selected image.");
            }
        } else if (result.canceled) {
        } else if (result.errorCode) {
            Alert.alert("Image Picker Error", result.errorMessage || "Failed to pick image.");
        }
    };


    const handleEscalateToAgent = async (messageId) => {
        if (!sessionId || !publicKey || escalatingMessageId !== null) {
            return;
        }

        setEscalatingMessageId(messageId);

        try {
            const pauseBotResponse = await fetch('https://api.cuoral.com/conversation/session/stop-bot/widget', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "x-org-id": publicKey || "undefined",
                },
                body: JSON.stringify({ session_id: sessionId, pause_bot: true }),
            });

            if (!pauseBotResponse.ok) {
                const errorData = await pauseBotResponse.json();
                throw new Error(`Failed to pause bot: ${pauseBotResponse.status}, ${errorData.message || pauseBotResponse.statusText}`);
            }

            const authorName = `${firstName || ''} ${lastName || ''}`.trim() || email || 'anonymous';

            const userEscalationPayload = {
                origin: "frontend",
                message: "Not satisfied? Talk to an agent",
                message_type: "QUERY",
                file: null,
                filename: null,
                channel: 'external',
                author: authorName,
                author_type: "HUMAN",
                conversation_id: sessionId,
                organisation_id: publicKey,
            };
            addMessage({
                id: Date.now().toString() + '_escalation_user',
                text: userEscalationPayload.message,
                sender: 'user',
                timestamp: new Date(),
            });
            sendMessageViaSocket(userEscalationPayload.message);


            setTimeout(() => {
                const agentResponseMessagePayload = {
                    origin: "frontend",
                    message: "An internal alert has been sent, an agent will be with you shortly, please hold on.",
                    message_type: "REPLY",
                    file: null,
                    filename: null,
                    channel: 'external',
                    author: "Cuoral System",
                    author_type: "HUMAN",
                    conversation_id: sessionId,
                    organisation_id: publicKey,
                };
                addMessage({
                    id: Date.now().toString() + '_escalation_bot_reply',
                    text: agentResponseMessagePayload.message,
                    sender: 'admin',
                    timestamp: new Date(),
                });
                sendMessageViaSocket(agentResponseMessagePayload.message, message_type ="REPLY");
                setEscalatingMessageId(null);
            }, 3000);
        } catch (error) {
            Alert.alert("Error", error.message || "Failed to escalate to agent. Please try again.");
            setEscalatingMessageId(null);
        }
    };

    const handleStartNewConversation = async () => {
        await clearSessionAndInitiateNew();
        navigateTo('ChatDetails'); // Navigate to ChatDetails to re-enter info for new session
    };


    const renderMessage = ({ item }) => (
        <View>
            <View
                style={[
                    styles.messageBubble,
                    item.sender === 'user' ? styles.userMessage : styles.botMessage,
                ]}
            >
                {/* Render image if fileUrl exists */}
                {item.fileUrl && (
                    <Image source={{ uri: item.fileUrl }} style={styles.messageImage} />
                )}
                {item.text.length > 0 && <Text style={styles.messageText}>{item.text}</Text>}
                <Text style={styles.timestamp}>{item.timestamp.toLocaleTimeString()}</Text>
            </View>
            {item.sender === 'bot' && item.id === lastBotMessageId && (escalatingMessageId === null) && (
                <TouchableOpacity
                    style={[styles.escalateButton, { borderColor: chatThemeColor || '#2196F3', marginBottom: 5 }]}
                    onPress={() => handleEscalateToAgent(item.id)}
                    disabled={escalatingMessageId !== null}
                >
                    {escalatingMessageId === item.id ? (
                        <ActivityIndicator size="small" color={chatThemeColor || '#2196F3'} />
                    ) : (
                        <Text style={[styles.escalateButtonText, { color: chatThemeColor || '#2196F3' }]}>
                            Not satisfied? Talk to an agent
                        </Text>
                    )}
                </TouchableOpacity>
            )}
        </View>
    );

    if (isLoadingSession) {
        return (
            <View style={styles.centeredContainer}>
                <ActivityIndicator size="large" color={chatThemeColor} />
                <Text style={styles.statusText}>Loading messages...</Text>
            </View>
        );
    }

    if (sessionError) {
        return (
            <View style={styles.centeredContainer}>
                <Text style={styles.statusText}>Error loading chat: {sessionError}</Text>
            </View>
        );
    }

    // --- Session Closed UI ---
    if (sessionStatus === 'closed') {
        return (
            <View style={styles.centeredContainer}>
                <Text style={styles.sessionClosedText}>This conversation has ended.</Text>
                <Text style={styles.sessionClosedSubText}>You can start a new one anytime!</Text>
                <TouchableOpacity
                    style={[styles.startButton, { backgroundColor: chatThemeColor || '#2196F3' }]}
                    onPress={handleStartNewConversation}
                >
                    <Text style={styles.startButtonText}>Start New Conversation</Text>
                </TouchableOpacity>
            </View>
        );
    }

    console.log(messages)

    return (
        <KeyboardAvoidingView
            style={styles.keyboardAvoidingContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 0}
        >
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.messagesContainer}
                onContentSizeChange={() => {

                    if (flatListRef.current && messages.length > 0) {
                        setTimeout(() => {
                            try {
                                flatListRef.current.scrollToEnd({ animated: true });
                            } catch (error) {
                               
                            }
                        }, 50);
                      }
                }}
            />

            {isSending && (
                <View style={styles.typingIndicatorContainer}>
                    <ActivityIndicator size="small" color="#2196F3" />
                    <Text style={styles.typingText}>Sending message...</Text>
                </View>
            )}

            {/* Input Area */}
            <View style={styles.inputContainer}>
                <TouchableOpacity style={styles.attachButton} onPress={handleAttachButtonPress}>
                    <Text style={styles.attachIcon}>📎</Text>
                </TouchableOpacity>
                <TextInput
                    style={styles.input}
                    placeholder="Type your message here..."
                    value={inputText}
                    onChangeText={setInputText}
                    multiline
                    editable={!isSending && escalatingMessageId === null && sessionStatus === 'active'} // Disable if session is closed
                />
                <TouchableOpacity
                    style={[
                        styles.sendButton,
                        { backgroundColor: chatThemeColor },
                        (isSending || escalatingMessageId !== null || inputText.trim() === '' || sessionStatus !== 'active') && styles.sendButtonDisabled, // Disable if session is closed
                    ]}
                    onPress={handleSendMessage}
                    disabled={isSending || escalatingMessageId !== null || inputText.trim() === '' || sessionStatus !== 'active'} // Disable if session is closed
                >
                    <Text style={styles.sendIcon}>➤</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    keyboardAvoidingContainer: {
        flex: 1,
    },
    centeredContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20, // Add padding for better spacing in centered view
    },
    statusText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    messagesContainer: {
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    messageBubble: {
        padding: 10,
        borderRadius: 15,
        marginBottom: 8,
        maxWidth: '80%',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    userMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#DCF8C6',
        borderBottomRightRadius: 2,
    },
    botMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#F0F0F0',
        borderBottomLeftRadius: 2,
    },
    messageText: {
        fontSize: 15,
        color: '#333',
    },
    timestamp: {
        fontSize: 10,
        color: '#777',
        alignSelf: 'flex-end',
        marginTop: 5,
    },
    typingIndicatorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 8,
        backgroundColor: '#E6E6FA',
        borderRadius: 10,
        marginHorizontal: 15,
        marginBottom: 10,
        alignSelf: 'flex-start',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        backgroundColor: '#fff',
    },
    attachButton: {
        padding: 8,
        marginRight: 5,
    },
    attachIcon: {
        fontSize: 24,
        color: '#666',
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 25,
        paddingHorizontal: 15,
        paddingVertical: 10,
        fontSize: 16,
        maxHeight: 100,
        marginRight: 5,
    },
    sendButton: {
        borderRadius: 25,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 5,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    sendButtonDisabled: {
        opacity: 0.6,
    },
    sendIcon: {
        fontSize: 40,
        color: 'white',
    },
    escalateButton: {
        alignSelf: 'flex-start',
        marginTop: 5,
        marginLeft: 10,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    escalateButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    messageImage: {
        width: 200,
        height: 150,
        borderRadius: 8,
        marginBottom: 5,
        resizeMode: 'cover',
    },
    // --- New styles for Session Closed UI ---
    sessionClosedText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
        textAlign: 'center',
    },
    sessionClosedSubText: {
        fontSize: 15,
        color: '#666',
        marginBottom: 30,
        textAlign: 'center',
    },
    startButton: { // Reusing startButton style from ConversationsScreen
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        marginTop: 20, // Add some top margin
    },
    startButtonText: { // Reusing startButtonText style
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ChatScreen;

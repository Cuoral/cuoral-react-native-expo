/* eslint-disable prettier/prettier */
// src/screens/ConversationsScreen.js
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, FlatList } from 'react-native';
import { useCuoral, SESSION_STORAGE_KEY } from '../context/CuoralContext';
import AsyncStorage from '@react-native-async-storage/async-storage'; // For persisting session_id


/**
 * ConversationsScreen component displays existing conversations or a prompt
 * to start a new one if no conversations are found.
 * It now automatically navigates to the Chat screen if messages exist
 * and also lists all user sessions.
 */
const ConversationsScreen = ({ navigateTo }) => {
    const { messages, isLoadingSession, sessionError, chatThemeColor, userSessions, getUserSessions, email, setSessionId } = useCuoral();

    // Effect to fetch user sessions when the component mounts
    useEffect(() => {
        // Ensure email is available before trying to fetch sessions
        if (email) {
            getUserSessions(email);
        }
    }, [email]); // Dependency on email ensures fetch happens when email becomes available

    // Show loading state if session is still loading
    if (isLoadingSession) {
        return (
            <View style={styles.centeredContainer}>
                <ActivityIndicator size="large" color={chatThemeColor || '#2196F3'} />
                <Text style={styles.statusText}>Loading conversations...</Text>
            </View>
        );
    }

    // Show error state if there was a session error
    if (sessionError) {
        return (
            <View style={styles.centeredContainer}>
                <Text style={styles.statusText}>Error loading conversations: {sessionError}</Text>
            </View>
        );
    }

    // Render conversation list if userSessions is not empty
    if (userSessions && userSessions.length > 0) {
        const renderItem = ({ item }) => (
            <TouchableOpacity
                style={styles.conversationItem}
                onPress={async () => {
                    await AsyncStorage.setItem('cuoral_session_id', item.session_id);
                    setSessionId(item.session_id)
                    navigateTo('Chat', { sessionId: item.session_id });
                }}
            >
                {/* Row for Title and Status */}
                <View style={styles.conversationHeader}>
                    {/* Fallback for title if not present */}
                    <Text style={styles.conversationTitle}>
                        {item.title || (item.last_message ? item.last_message.message : `Conversation ${item.session_id}`)}
                    </Text>
                    {item.status && (
                        <Text style={[styles.conversationStatus, item.status === 'closed' && styles.conversationStatusClosed]}>
                            {item.status.toUpperCase()}
                        </Text>
                    )}
                </View>

                {/* Show last message snippet or a default prompt */}
                <Text style={styles.conversationSnippet}>{item.lastMessageSnippet || 'Tap to continue chat...'}</Text>
                {/* Display formatted date */}
                <Text style={styles.conversationDate}>
                    {item.time_created ? new Date(item.time_created).toLocaleDateString() : 'No date'}
                </Text>
            </TouchableOpacity>
        );

        return (
            // Adjusted container for FlatList to occupy full width
            <View style={styles.conversationsContainer}>
                <FlatList
                    data={userSessions}
                    renderItem={renderItem}
                    // Using session_id as key, ensuring it's a string
                    keyExtractor={(item) => item.session_id.toString()}
                    contentContainerStyle={styles.conversationsListContent}
                    style={styles.fullWidthList} // Added style to ensure FlatList takes full width
                />
                {/* <TouchableOpacity
                    style={[styles.startButton, { backgroundColor: chatThemeColor || '#2196F3', marginTop: 20 }]}
                    onPress={() => navigateTo('ChatDetails')} // Go to details to start a new chat
                >
                    <Text style={styles.startButtonText}>Start a New Conversation</Text>
                </TouchableOpacity> */}
            </View>
        );
    }

    // Render the empty state if no user sessions exist
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>You do not have any active conversations.</Text>
                <TouchableOpacity
                    style={[styles.startButton, { backgroundColor: chatThemeColor || '#2196F3' }]}
                    onPress={() => navigateTo('ChatDetails')} // Go to details to start a new chat
                >
                    <Text style={styles.startButtonText}>Start a New Conversation</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20, // Padding for the empty state
    },
    // New container style specifically for when there are conversations
    conversationsContainer: {
        flex: 1, // Take full height
        width: '100%', // Ensure it takes full width
        backgroundColor: '#fff',
        paddingHorizontal: 10, // Apply horizontal padding here
        paddingTop: 10, // Apply top padding for the list
    },
    emptyState: {
        alignItems: 'center',
        padding: 20,
    },
    emptyStateText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
        textAlign: 'center',
    },
    startButton: {
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    startButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    centeredContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    statusText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    // This style is for the FlatList component itself
    fullWidthList: {
        width: '100%',
    },
    // This style is for the content *inside* the FlatList (each item, essentially)
    conversationsListContent: {
        paddingBottom: 20, // Add some padding at the bottom of the scrollable content
    },
    conversationItem: {
        backgroundColor: '#f9f9f9',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        width: '100%', // Ensure each item takes full width of its parent
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    conversationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    conversationTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        flexShrink: 1, // Allow title to shrink if status is long
        marginRight: 10, // Space between title and status
    },
    conversationStatus: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#28a745', // Default color for active/open
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 4,
        backgroundColor: '#e9f7ef',
    },
    conversationStatusClosed: {
        color: '#dc3545', // Color for closed status
        backgroundColor: '#f8d7da',
    },
    conversationSnippet: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    conversationDate: {
        fontSize: 12,
        color: '#999',
        textAlign: 'right',
    },
});

export default ConversationsScreen;
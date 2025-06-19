// src/screens/ConversationsScreen.js
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useCuoral } from '../context/CuoralContext';

/**
 * ConversationsScreen component displays existing conversations or a prompt
 * to start a new one if no conversations are found.
 * It now automatically navigates to the Chat screen if messages exist.
 */
const ConversationsScreen = ({ navigateTo }) => {
    const { messages, isLoadingSession, sessionError, chatThemeColor } = useCuoral();

    // Effect to automatically navigate to Chat screen if messages exist
    useEffect(() => {
        // Only attempt to navigate if session loading is complete and successful
        if (!isLoadingSession && !sessionError && messages.length > 0) {
            navigateTo('Chat');
        }
    }, [isLoadingSession, sessionError, messages, navigateTo]);

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

    // Render the empty state if no messages exist
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
        flexGrow: 1, // Allows content to grow and be scrollable
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
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
        // Background color set dynamically by chatThemeColor
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 8,
        elevation: 2, // Android shadow
        shadowColor: '#000', // iOS shadow
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    startButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    // Styles for conversationsList and conversationItem are removed as they are no longer rendered
    centeredContainer: { // Added for loading/error state
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    statusText: { // Added for loading/error state
        marginTop: 10,
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
});

export default ConversationsScreen;

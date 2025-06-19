// src/screens/ChatDetailsScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useCuoral } from '../context/CuoralContext';

/**
 * ChatDetailsScreen component is a form for the user to enter their
 * email and name before initiating a chat. It now triggers session initiation
 * or profile update based on session status.
 */
const ChatDetailsScreen = ({ navigateTo }) => {
    const {
        sessionId,
        isLoadingSession,
        sessionError,
        sessionProfileExists, // New state from context
        email: userEmailFromContext,
        firstName: userFirstNameFromContext,
        lastName: userLastNameFromContext,
        tempUserEmail,
        setTempUserEmail,
        tempUserName,
        setTempUserName,
        initiateSession,
        getSession,
        setProfile, // New function to set profile
    } = useCuoral();

    const [localEmail, setLocalEmail] = useState(tempUserEmail || userEmailFromContext || '');
    const [localName, setLocalName] = useState(tempUserName || `${userFirstNameFromContext || ''} ${userLastNameFromContext || ''}`.trim() || '');
    const [errorMessage, setErrorMessage] = useState('');

    // Effect to check if profile exists and redirect immediately
    useEffect(() => {
        // Only attempt to redirect if loading is complete and no session errors
        if (!isLoadingSession && !sessionError) {
            if (sessionProfileExists) {
                // If profile data already exists for the session, go straight to chat
                navigateTo('Chat');
            }
        }
    }, [isLoadingSession, sessionProfileExists, sessionError, navigateTo]);


    useEffect(() => {
        setTempUserEmail(localEmail);
        setTempUserName(localName);
    }, [localEmail, localName, setTempUserEmail, setTempUserName]);


    const handleContinueToChat = async () => {
        setErrorMessage(''); // Clear previous errors

        const trimmedEmail = localEmail.trim();
        const trimmedName = localName.trim();

        if (!trimmedEmail || !trimmedName) {
            setErrorMessage('Please enter both your email and name.');
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
            setErrorMessage('Please enter a valid email address.');
            return;
        }

        let success = false;
        // If a session exists but profile is missing, set the profile
        if (sessionId && !sessionProfileExists) {
            success = await setProfile(sessionId, trimmedEmail, trimmedName);
        } else if (!sessionId) {
            // This case should ideally not be reached if logic in CuoralModal is correct
            // but if session doesn't exist, try to initiate a new one with provided details
            const nameParts = trimmedName.split(' ');
            const newFirstName = nameParts[0] || '';
            const newLastName = nameParts.slice(1).join(' ') || '';
            success = await initiateSession(trimmedEmail, newFirstName, newLastName);
        } else {
            // This case should ideally not be reached if initial useEffect works correctly
            // but as a fallback, if session exists and is supposed to have a profile, try to get session
            success = await getSession(sessionId);
        }

        // Only navigate if action was successful and session/profile are ready
        if (success || (!isLoadingSession && !sessionError && sessionId && sessionProfileExists)) {
            navigateTo('Chat');
        }
    };

    const showLoading = isLoadingSession;

    // If loading or profile already exists, we might show a loader or nothing
    // as the useEffect above will handle navigation.
    if (isLoadingSession) {
        return (
            <View style={styles.centeredContainer}>
                <ActivityIndicator size="large" color="#2196F3" />
                <Text style={styles.statusText}>Loading session...</Text>
            </View>
        );
    }

    // Only render the form if sessionProfileExists is false
    return (
        <KeyboardAvoidingView
            style={styles.keyboardAvoidingContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.instructionText}>Enter Your Details</Text>

                {errorMessage ? (
                    <Text style={styles.errorText}>{errorMessage}</Text>
                ) : null}
                {sessionError && !isLoadingSession ? (
                    <Text style={styles.errorText}>Session Error: {sessionError}</Text>
                ) : null}

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Email</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Your email address"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={localEmail}
                        onChangeText={setLocalEmail}
                        editable={!showLoading}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Your name"
                        autoCapitalize="words"
                        value={localName}
                        onChangeText={setLocalName}
                        editable={!showLoading}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.continueButton, showLoading && styles.continueButtonDisabled]}
                    onPress={handleContinueToChat}
                    disabled={showLoading}
                >
                    {showLoading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.continueButtonText}>Continue to Chat</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    keyboardAvoidingContainer: {
        flex: 1,
    },
    container: {
        flexGrow: 1,
        backgroundColor: '#fff',
        padding: 20,
        justifyContent: 'center',
    },
    instructionText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 30,
        textAlign: 'center',
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginBottom: 15,
    },
    inputGroup: {
        marginBottom: 20,
        width: '100%',
    },
    inputLabel: {
        fontSize: 16,
        color: '#555',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        color: '#333',
    },
    continueButton: {
        backgroundColor: '#2196F3',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    continueButtonDisabled: {
        backgroundColor: '#9ACFFD',
    },
    continueButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    centeredContainer: { // Added for loading state
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    statusText: { // Added for loading state
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
});

export default ChatDetailsScreen;

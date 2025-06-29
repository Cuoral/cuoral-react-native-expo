// src/CuoralModal.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import ConversationsScreen from './screens/ConversationsScreen';
import ChatDetailsScreen from './screens/ChatDetailsScreen';
import ChatScreen from './screens/ChatScreen';
import { useCuoral } from './context/CuoralContext'; // Use the context


/**
 * CuoralModal component manages the navigation between different chat screens
 * within the modal launched by CuoralLauncher. It includes the header and
 * bottom navigation bar. It also manages the initial session loading.
 */
const CuoralModal = () => {
    const { closeModal, sessionId, isLoadingSession, sessionError, sessionProfileExists, initiateSession, email, firstName, lastName, chatThemeColor, resetTempUserData, chatAgentName } = useCuoral();
    const [currentScreen, setCurrentScreen] = useState('Home'); // Default screen if no session/profile
    const [headerTitle, setHeaderTitle] = useState(''); // Default header title
    const [showBackButton, setShowBackButton] = useState(false); // Controls back button visibility


    useEffect(() => {
        // Only set initial screen once loading is complete and no errors
        if (!isLoadingSession && !sessionError) {
            if (sessionId) {
                if (sessionProfileExists) {
                    setCurrentScreen('Conversations'); // Go directly to chat if session and profile exist
                } else {
                    setCurrentScreen('ChatDetails'); // Go to details if session exists but profile is missing
                }
            } else {
                setCurrentScreen('Home'); // Default to Home if no session at all (or session loading failed/expired)
            }
        }
    },[setCurrentScreen]);


    // Effect to update header title and back button visibility based on currentScreen
    useEffect(() => {
        switch (currentScreen) {
            case 'Home':
                setHeaderTitle(`${chatAgentName} Agent`);
                setShowBackButton(false);
                resetTempUserData(); // Clear temporary user data when going to home
                break;
            case 'Conversations':
                setHeaderTitle('My Conversations');
                setShowBackButton(true);
                resetTempUserData(); // Clear temporary user data when going to conversations
                break;
            case 'ChatDetails':
                setHeaderTitle('Enter Your Details');
                setShowBackButton(true);
                break;
            case 'Chat':
                // Display user's name if available, otherwise a generic title
                const userName = `${firstName || ''} ${lastName || ''}`.trim();
                setHeaderTitle(userName || 'Chat Session');
                setShowBackButton(true);
                break;
            default:
                setHeaderTitle('Cuoral Chat');
                setShowBackButton(false);
        }
    }, [currentScreen, firstName, lastName, resetTempUserData]);

    // Function to navigate to a different screen
    const navigateTo = (screenName, params = {}) => {
        setCurrentScreen(screenName);
    };

    // Function to handle back navigation
    const goBack = () => {
        switch (currentScreen) {
            case 'Conversations':
            case 'ChatDetails':
                navigateTo('Home');
                break;
            case 'Chat':
                // Simplified: always go back to Home from chat
                navigateTo('Conversations');
                break;
            default:
                closeModal(); // If no specific back logic, just close the modal
                break;
        }
    };

    // Render the current screen based on state
    const renderScreen = () => {
        if (isLoadingSession) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={chatThemeColor} />
                    <Text style={styles.loadingText}>Loading chat session...</Text>
                </View>
            );
        }

        if (sessionError) {
            return (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Error: {sessionError}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={() => initiateSession(email, firstName, lastName)}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        switch (currentScreen) {
            case 'Home':
                return <HomeScreen navigateTo={navigateTo} />;
            case 'Conversations':
                return <ConversationsScreen navigateTo={navigateTo} />;
            case 'ChatDetails':
                return <ChatDetailsScreen navigateTo={navigateTo} />;
            case 'Chat':
                return <ChatScreen navigateTo={navigateTo} />;
            default:
                return <HomeScreen navigateTo={navigateTo} />;
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: chatThemeColor || '#2196F3' }]}>
                {showBackButton && (
                    <TouchableOpacity style={styles.backButton} onPress={goBack}>
                        <Text style={styles.headerIcon}>&#x2329;</Text>
                    </TouchableOpacity>
                )}
                <Text style={styles.headerTitle}>{headerTitle}</Text>
                <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                    <Text style={styles.headerIcon}>&#x2715;</Text>
                </TouchableOpacity>
            </View>

            {/* Main Content Area */}
            <View style={styles.content}>
                {renderScreen()}
            </View>

            {/* Bottom Navigation */}
            <View style={styles.bottomNav}>
                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => navigateTo('Home')}
                >
                    <Text style={[styles.navIcon, currentScreen === 'Home' && { color: chatThemeColor }]}>🏠</Text>
                    <Text style={[styles.navText, currentScreen === 'Home' && { color: chatThemeColor, fontWeight: 'bold' }]}>
                        Home
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => navigateTo('Conversations')}
                >
                    <Text style={[styles.navIcon, currentScreen === 'Conversations' && { color: chatThemeColor }]}>💬</Text>
                    <Text style={[styles.navText, currentScreen === 'Conversations' && { color: chatThemeColor, fontWeight: 'bold' }]}>
                        Messages
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12, // Inherited from CuoralLauncher modalContent
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingVertical: 10, // Increased padding
        // Background color set dynamically by chatThemeColor
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.2)', // Softer border color for header
        shadowColor: '#000', // Added subtle shadow
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 4,
    },
    headerTitle: {
        fontSize: 20, // Slightly larger font
        fontWeight: 'bold',
        color: '#fff', // Text color will be white on colored header
        flex: 1, // Allow title to take available space
        textAlign: 'center', // Center the title
        letterSpacing: 0.5, // Added letter spacing

    },
    headerIcon: {
        fontSize: 30, // Increased icon size for header
        color: 'white', // Icons also white on colored header
        fontWeight: 'bold', // Make icons bolder
    },
    backButton: {
        padding: 8, // Increased touch target
        marginRight: 10,
    },
    closeButton: {
        padding: 8, // Increased touch target
        marginLeft: 10,
    },
    content: {
        flex: 1, // Takes up all available space between header and footer
    },
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 12, // Increased padding
        borderTopWidth: 1,
        borderTopColor: '#eee',
        backgroundColor: '#fff',
        shadowColor: '#000', // Added subtle shadow
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 4,
    },
    navItem: {
        alignItems: 'center',
        flex: 1,
        paddingVertical: 8, // Increased padding
        borderRadius: 8, // Rounded corners for nav items
        marginHorizontal: 5,
    },
    navIcon: {
        fontSize: 36, // Significantly increased icon size for navigation items
        marginBottom: 4,
        color: '#999', // Default icon color, overridden by active state
    },
    navText: {
        fontSize: 14, // Slightly larger font for text
        color: '#999', // Default text color, overridden by active state
        fontWeight: '500', // Added medium font weight
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    errorText: {
        fontSize: 16,
        color: 'red',
        textAlign: 'center',
        marginBottom: 15,
    },
    retryButton: {
        backgroundColor: '#2196F3',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    retryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default CuoralModal;

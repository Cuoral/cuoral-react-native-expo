// src/screens/HomeScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useCuoral } from '../context/CuoralContext';

/**
 * HomeScreen component displays the initial welcome message,
 * a "Send us a Message" button, and feature cards,
 * with improved UI and conditional navigation.
 */
const HomeScreen = ({ navigateTo }) => {
    const { sessionProfileExists, chatThemeColor } = useCuoral();

    const handleSendMessagePress = () => {
        if (sessionProfileExists) {
            navigateTo('Chat'); // Go directly to chat if profile exists
        } else {
            navigateTo('ChatDetails'); // Otherwise, go to details to collect info
        }
    };

    return (
        <ScrollView style={styles.container}>
            {/* Welcome Section */}
            <View style={[styles.welcomeSection, { backgroundColor: chatThemeColor || '#2196F3' }]}>
                <Text style={styles.welcomeText}>Welcome</Text>
                <Text style={styles.helpText}>How may we help you today?</Text>
            </View>

            {/* Send Message Card */}
            <TouchableOpacity
                style={styles.messageCard}
                onPress={handleSendMessagePress}
            >
                <View style={styles.messageIconContainer}>
                    <Text style={styles.messageCardIcon}>💬</Text>
                </View>
                <View style={styles.messageContent}>
                    <Text style={styles.messageTitle}>Send us a Message</Text>
                    <Text style={styles.messageSubtitle}>We typically reply within minutes!</Text>
                </View>
                <Text style={styles.arrowIcon}>▶</Text>
            </TouchableOpacity>

            {/* Add more content here if needed */}
 
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F8FA', // Lighter background for the entire screen
        padding: 15,
    },
    welcomeSection: {
        // Background color set dynamically by chatThemeColor in JSX
        borderRadius: 15,
        paddingVertical: 30,
        paddingHorizontal: 20,
        marginBottom: 25,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden', // Ensures inner elements don't spill
        // Subtle shadow for depth
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 8,
    },
    welcomeText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF', // White text on colored background
        marginBottom: 8,
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    helpText: {
        fontSize: 18,
        color: 'rgba(255, 255, 255, 0.9)', // Slightly transparent white
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    aiIndicators: { // Keeping style definition even if not used in JSX for now
        position: 'absolute',
        top: 15,
        right: 15,
        flexDirection: 'row',
    },
    aiEmoji: { // Keeping style definition even if not used in JSX for now
        fontSize: 22,
        marginLeft: 8,
        opacity: 0.8,
    },
    messageCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        padding: 20,
        marginBottom: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        elevation: 6,
    },
    messageIconContainer: {
        marginRight: 15,
        backgroundColor: '#E0F2F7', // Light blue background for icon
        borderRadius: 25,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    messageCardIcon: {
        fontSize: 28,
    },
    messageContent: {
        flex: 1,
    },
    messageTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    messageSubtitle: {
        fontSize: 15,
        color: '#777',
    },
    arrowIcon: {
        fontSize: 24,
        color: '#BBB', // Muted arrow
        paddingLeft: 10,
    },
    featureCard: { // Keeping style definition even if not used in JSX for now
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        marginBottom: 25,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        elevation: 6,
    },
    featureImage: { // Keeping style definition even if not used in JSX for now
        width: '100%',
        height: 180,
        resizeMode: 'cover',
    },
    featureTextContainer: { // Keeping style definition even if not used in JSX for now
        padding: 20,
    },
    featureTitle: { // Keeping style definition even if not used in JSX for now
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    featureDescription: { // Keeping style definition even if not used in JSX for now
        fontSize: 15,
        color: '#666',
        lineHeight: 22,
        marginBottom: 15,
    },
    learnMoreButton: { // Keeping style definition even if not used in JSX for now
        backgroundColor: '#F0F0F0',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: '#DDD',
    },
    learnMoreButtonText: { // Keeping style definition even if not used in JSX for now
        color: '#555',
        fontSize: 14,
        fontWeight: 'bold',
    },
    builtWithText: {
        fontSize: 12,
        color: '#aaa',
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 20, // Add bottom margin for spacing
    },
});

export default HomeScreen;

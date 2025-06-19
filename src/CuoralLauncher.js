// src/CuoralLauncher.js
import React, { useState } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Text,
  Modal,
  SafeAreaView,
  View,
  ActivityIndicator, // Import ActivityIndicator for loader
} from 'react-native';
import CuoralModal from './CuoralModal'; // Import the modal that contains the chat UI
import { CuoralProvider } from './context/CuoralContext'; // Import context provider

/**
 * CuoralLauncher component provides a floating action button (FAB)
 * that, when pressed, launches a native modal containing the Cuoral chat UI.
 * It handles the initial session check and initiation with a loader.
 *
 * @param {object} props - The component props.
 * @param {string} props.publicKey - Your public key for the Cuoral widget.
 * @param {string} [props.email] - Optional: User's email to pre-fill.
 * @param {string} [props.firstName] - Optional: User's first name to pre-fill.
 * @param {string} [props.lastName] - Optional: User's last name to pre-fill.
 * @param {string} [props.backgroundColor='#2196F3'] - Optional: Background color of the FAB. Defaults to blueAccent.
 * @param {React.ReactNode} [props.icon] - Optional: Icon element to display on the FAB. Defaults to a chat emoji.
 * @param {boolean} [props.isVisible=true] - Optional: Whether the FAB is visible. Defaults to true.
 * @param {string} [props.position='bottomRight'] - Optional: Position of the FAB. 'bottomRight', 'topRight', 'topLeft', 'bottomLeft'.
 */
const CuoralLauncher = ({
  publicKey,
  email,
  firstName,
  lastName,
  backgroundColor = '#2196F3', // Default to Material blueAccent
  icon = <Text style={{ color: 'white', fontSize: 24 }}>💬</Text>, // Default chat emoji icon
  isVisible = true,
  position = 'bottomRight',
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [isFabLoading, setIsFabLoading] = useState(false); // New state for FAB loader

  // If the launcher is not visible, render nothing
  if (!isVisible) {
    return null;
  }

  // Determine the FAB position based on the 'position' prop
  const getFABPositionStyle = () => {
    switch (position) {
      case 'bottomRight':
        return { bottom: 30, right: 20 };
      case 'topRight':
        return { top: 30, right: 20 };
      case 'topLeft':
        return { top: 30, left: 20 };
      case 'bottomLeft':
        return { bottom: 30, left: 20 };
      default:
        return { bottom: 30, right: 20 }; // Default to bottom-right
    }
  };

  const handleFabPress = async () => {
    setIsFabLoading(true); // Show loader immediately when FAB is pressed
    setModalVisible(true); // Open the modal. Session check/initiation happens inside CuoralProvider

    // The actual session loading is now handled inside CuoralProvider's useEffect,
    // which will also update its own isLoadingSession state.
    // We just need to manage the FAB's loading state here.
    // For simplicity, we remove the FAB loading state after a short delay
    // as the modal will have its own loader if needed.
    setTimeout(() => {
      setIsFabLoading(false);
    }, 1000); // Give enough time for modal to appear and internal loading to start
    
  };

  return (
    <>
      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor }, getFABPositionStyle()]}
        onPress={handleFabPress}
        activeOpacity={0.7} // Reduce opacity slightly on press
        disabled={isFabLoading} // Disable FAB while loading
      >
        {isFabLoading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          icon
        )}
      </TouchableOpacity>

      {/* Cuoral Chat Modal */}
      <Modal
        animationType="fade" // Fade in/out effect for the modal
        transparent={true} // Allows background to be seen through
        visible={modalVisible}
        onRequestClose={() => {
          // Handle hardware back button on Android
          setModalVisible(false); // Close the modal
        }}
      >
        {/*
          CuoralProvider wraps the modal content to provide chat state
          (public key, user info, etc.) to all nested screens.
        */}
        <CuoralProvider
          publicKey={publicKey}
          initialEmail={email}
          initialFirstName={firstName}
          initialLastName={lastName}
          closeModal={() => setModalVisible(false)} // Pass close modal function to context
        >
          <SafeAreaView style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <CuoralModal />
            </View>
          </SafeAreaView>
        </CuoralProvider>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    borderRadius: 30, // Make it circular
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Semi-transparent black background
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
    width: '95%', // Adjusted for padding as seen in screenshots
    height: '90%', // Adjusted to allow some background to show
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 15, // Higher Android shadow for the modal
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    overflow: 'hidden', // Clip content to rounded corners
  },
});

export default CuoralLauncher;

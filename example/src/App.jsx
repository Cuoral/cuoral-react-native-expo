// Simple test WITH Cuoral import
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { CuoralLauncher } from 'cuoral-react-native-expo';

const App = () => {
  const cuoralRef = useRef(null);

  // Track initial page view on mount
  useEffect(() => {
    if (cuoralRef.current) {
      cuoralRef.current.trackPageView('/home', {
        screen: 'HomeScreen',
        timestamp: new Date().toISOString(),
      });
    }
  }, []);

  // Handle button click with custom event
  const handleAddToCart = () => {
    if (cuoralRef.current) {
      cuoralRef.current.trackCustomEvent(
        'add_to_cart',
        'ecommerce',
        {
          product_id: '12345',
          product_name: 'Test Product',
          price: 29.99,
          quantity: 1,
        }
      );
    }
  };

  // Track checkout event
  const handleCheckout = () => {
    if (cuoralRef.current) {
      cuoralRef.current.trackCustomEvent(
        'checkout_started',
        'conversion',
        {
          cart_value: 59.98,
          items_count: 2,
        }
      );
    }
  };

  // Track navigation
  const handleNavigateToProduct = () => {
    if (cuoralRef.current) {
      cuoralRef.current.trackPageView('/product/12345', {
        product_name: 'Test Product',
        category: 'Electronics',
      });
    }
  };

  // Track search
  const handleSearch = () => {
    if (cuoralRef.current) {
      cuoralRef.current.trackCustomEvent(
        'search_performed',
        'navigation',
        {
          query: 'wireless headphones',
          results_count: 24,
        }
      );
    }
  };

  // Flush all events manually
  const handleFlush = async () => {
    if (cuoralRef.current) {
      console.log('Flushing all intelligence events...');
      await cuoralRef.current.flush();
      console.log('Flush complete!');
    }
  };

  // Log session ID
  const handleGetSessionId = () => {
    if (cuoralRef.current) {
      const sessionId = cuoralRef.current.getSessionId();
      console.log('Current Session ID:', sessionId);
      alert(`Session ID: ${sessionId}`);
    }
  };

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Cuoral Test App</Text>
      <Text style={styles.subtitle}>Testing Intelligence Tracking</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Page View Tracking</Text>
        <TouchableOpacity style={styles.button} onPress={handleNavigateToProduct}>
          <Text style={styles.buttonText}>Track Product Page View</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Custom Event Tracking</Text>
        
        <TouchableOpacity style={styles.button} onPress={handleAddToCart}>
          <Text style={styles.buttonText}>Add to Cart Event</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={handleCheckout}>
          <Text style={styles.buttonText}>Checkout Event</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.buttonTertiary]} onPress={handleSearch}>
          <Text style={styles.buttonText}>Search Event</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Debug Tools</Text>
        
        <TouchableOpacity style={[styles.button, styles.buttonDebug]} onPress={handleFlush}>
          <Text style={styles.buttonText}>Flush All Events Now</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.buttonDebug]} onPress={handleGetSessionId}>
          <Text style={styles.buttonText}>Show Session ID</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.info}>
        Open the widget to see tracked events in the intelligence system
      </Text>
      
      <CuoralLauncher
        ref={cuoralRef}
        publicKey="c8e3081e-8dfc-49b5-bbd1-4ef513504d88"
        email="kayode@cuoral.com"
        firstName="Kayode"
        lastName="Olayiwola"
        buttonColor="#007AFF"
        showFloatingButton={true}
        debug={true}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    color: '#666',
  },
  section: {
    marginBottom: 30,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#34C759',
  },
  buttonTertiary: {
    backgroundColor: '#FF9500',
  },
  buttonDebug: {
    backgroundColor: '#8E8E93',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  info: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
});

export default App;

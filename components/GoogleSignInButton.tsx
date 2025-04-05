import React, { useState, useEffect } from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  View,
  Platform,
  Alert,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGoogleAuth } from '../services/authService';
import { isBrowser } from '../services/safeModuleLoader';
import { getFirebaseErrorMessage } from '../services/firebaseConfigChecker';
import { auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

interface GoogleSignInButtonProps {
  onSignInSuccess: () => void;
  onSignInError: (error: any) => void;
}

const GoogleSignInButton = ({ onSignInSuccess, onSignInError }: GoogleSignInButtonProps) => {
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const { request, response, promptAsync } = useGoogleAuth();

  // Check if user is already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && loading) {
        // User is already logged in and button is in loading state
        setLoading(false);
        onSignInSuccess();
      }
    });
    
    return () => unsubscribe();
  }, [auth, loading, onSignInSuccess]);

  // Handle Google auth response
  useEffect(() => {
    if (response?.type === 'success') {
      setLoading(false);
      onSignInSuccess();
    } else if (response?.type === 'error') {
      setLoading(false);
      setHasError(true);
      onSignInError(response.error);
    } else if (response?.type === 'dismiss') {
      // Handle when user dismisses popup
      setLoading(false);
    }
  }, [response]);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setHasError(false);
      setErrorCode(null);
      
      // Check if already logged in
      if (auth.currentUser) {
        onSignInSuccess();
        setLoading(false);
        return;
      }
      
      if (Platform.OS === 'web' && !isBrowser()) {
        throw new Error('Google Sign-In is not available in this environment');
      }
      
      if (!request && Platform.OS !== 'web') {
        throw new Error('Google Sign-In is not ready yet');
      }
      
      await promptAsync();
      
      // Set a timeout to stop the loading state if auth doesn't respond in time
      setTimeout(() => {
        if (loading) {
          setLoading(false);
        }
      }, 10000); // 10 seconds timeout
      
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      setLoading(false);
      setHasError(true);
      
      // Check for Firebase auth error code
      if (error.code) {
        setErrorCode(error.code);
      }
      
      onSignInError(error);
    }
  };

  // Show appropriate error messages based on error code
  if (hasError && errorCode) {
    const errorMessage = getFirebaseErrorMessage(errorCode);
    const isConfigError = errorCode === 'auth/operation-not-allowed';
    
    return (
      <TouchableOpacity 
        style={[styles.googleButton, styles.errorButton]}
        onPress={() => {
          if (isConfigError) {
            Alert.alert(
              'Google Sign-In Not Configured', 
              'The administrator needs to enable Google authentication in Firebase console.',
              [{ text: "OK" }]
            );
          } else {
            Alert.alert('Authentication Error', errorMessage, [{ text: "OK" }]);
          }
        }}
      >
        <Text style={styles.errorButtonText}>
          {isConfigError ? 'Google Sign-In Not Configured' : 'Google Sign-In Unavailable'}
        </Text>
      </TouchableOpacity>
    );
  }

  // General error fallback for web
  if (hasError && Platform.OS === 'web') {
    return (
      <TouchableOpacity 
        style={[styles.googleButton, styles.errorButton]}
        onPress={() => Alert.alert(
          'Authentication Error', 
          'Google Sign-In is currently unavailable. Please try signing in with email.',
          [{ text: "OK" }]
        )}
      >
        <Text style={styles.errorButtonText}>Google Sign-In Unavailable</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      style={styles.googleButton}
      onPress={handleGoogleSignIn}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#4285F4" size="small" />
      ) : (
        <>
          <View style={styles.logoContainer}>
            <View style={styles.googleCircle}>
              <Ionicons name="logo-google" size={22} color="#4285F4" />
            </View>
          </View>
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  googleButton: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 4,
    height: 48,
    width: '100%',
    maxWidth: 280,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
    position: 'relative',
    paddingLeft: 1, // Offset for the logo
  },
  errorButton: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  logoContainer: {
    position: 'absolute',
    left: 1,
    top: 1,
    bottom: 1,
    width: 46,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 3,
    borderBottomLeftRadius: 3,
  },
  googleCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 0,
  },
  googleButtonText: {
    color: '#757575',
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 24,
    textAlign: 'center',
  },
  errorButtonText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GoogleSignInButton; 
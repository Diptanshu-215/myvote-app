import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  AuthError,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth, googleProvider } from '../firebaseConfig';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { isBrowser } from './safeModuleLoader';
import { useState, useEffect } from 'react';
import { getVoterProfile } from './voterService';

// This is required for expo-auth-session
if (Platform.OS !== 'web') {
  WebBrowser.maybeCompleteAuthSession();
}

// Handle creating/updating voter profile upon successful authentication
const handleAuthSuccess = async (user: User | null) => {
  if (user) {
    try {
      // This will create a new voter profile if one doesn't exist
      // or return the existing one if it does
      await getVoterProfile(user);
    } catch (error) {
      console.error('Error handling voter profile:', error);
    }
  }
};

// Check if user is authenticated
export const useAuthState = () => {
  const [user, setUser] = useState(auth.currentUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      user => {
        setUser(user);
        setLoading(false);
        handleAuthSuccess(user);
      },
      error => {
        setError(error);
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return { user, loading, error };
};

// Register with email and password
export const registerWithEmailAndPassword = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await handleAuthSuccess(userCredential.user);
    return userCredential.user;
  } catch (error: any) {
    throw error; // Preserve the original error with its code
  }
};

// Login with email and password
export const loginWithEmailAndPassword = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    await handleAuthSuccess(userCredential.user);
    return userCredential.user;
  } catch (error: any) {
    throw error; // Preserve the original error with its code
  }
};

// Safe way to get origin URL in web environment
const getRedirectUri = () => {
  if (isBrowser()) {
    return window.location.origin;
  }
  return 'com.googleusercontent.apps.429388640752-8c3lkvnqlb4b4vb8c6h2v7fj0rmq9ov8:/oauth2redirect';
};

// Login with Google
export const useGoogleAuth = () => {
  // Use Google Sign-In with Expo Auth Session
  const [request, response, nativePromptAsync] = Google.useAuthRequest({
    clientId: '429388640752-3j3s8lnnlr7c3cfd3nqvddrlt5phq5hk.apps.googleusercontent.com',
    iosClientId: '429388640752-8c3lkvnqlb4b4vb8c6h2v7fj0rmq9ov8.apps.googleusercontent.com',
    androidClientId: '429388640752-grcv35p7jvnvuf7hqpjsid43bq86pu1r.apps.googleusercontent.com',
    // Make sure to configure redirect URI in your Firebase console
    redirectUri: getRedirectUri()
  });

  // Custom async function to handle authentication
  const signInWithGoogle = async () => {
    // If user is already signed in, just return
    if (auth.currentUser) {
      await handleAuthSuccess(auth.currentUser);
      return { user: auth.currentUser };
    }
    
    if (isBrowser()) {
      try {
        // For web, use Firebase's signInWithPopup
        const result = await signInWithPopup(auth, googleProvider);
        await handleAuthSuccess(result.user);
        return result;
      } catch (error: any) {
        // Keep Firebase error structure intact for handling by components
        if (error.code && error.message) {
          // If it has code and message properties, it's likely a Firebase error
          throw error;
        } else {
          throw new Error(error.message || 'Failed to authenticate with Google');
        }
      }
    } else {
      // For native, use Expo's Auth Session
      if (!request) {
        throw new Error("Google Sign-In request wasn't initialized");
      }
      const result = await nativePromptAsync();
      
      // For native, auth state changes will handle creating the voter profile
      // through the onAuthStateChanged listener
      return result;
    }
  };

  return {
    request,
    response,
    promptAsync: signInWithGoogle
  };
};

// Logout
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw error; // Preserve the original error
  }
}; 
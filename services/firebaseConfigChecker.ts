import { auth, googleProvider } from '../firebaseConfig';
import { 
  fetchSignInMethodsForEmail,
  signInWithRedirect,
  GoogleAuthProvider
} from 'firebase/auth';
import { isBrowser } from './safeModuleLoader';

/**
 * Check if Google authentication is configured correctly in Firebase
 * @returns Promise<boolean> - Returns true if enabled, false if not
 */
export const checkGoogleAuthEnabled = async (): Promise<boolean> => {
  if (!isBrowser()) {
    // For native, we can't easily check if Google auth is enabled
    return true;
  }
  
  try {
    // Try a sign-in redirect, which will fail quickly if Google auth isn't enabled
    // This is more reliable than other methods for checking
    await signInWithRedirect(auth, googleProvider);
    return true;
  } catch (error: any) {
    // If we get auth/operation-not-allowed, Google auth is not enabled
    if (error.code === 'auth/operation-not-allowed') {
      return false;
    }
    
    // Other errors might be due to different issues (like popup blocked)
    // so we'll give the benefit of the doubt
    return true;
  }
};

/**
 * Display an informative message for common Firebase errors
 */
export const getFirebaseErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/operation-not-allowed':
      return 'Google Sign-In has not been enabled by the administrator. Please contact support.';
    case 'auth/popup-blocked':
      return 'Sign-in popup was blocked by your browser. Please allow popups for this site.';
    case 'auth/popup-closed-by-user':
      return 'The sign-in popup was closed before completing the process.';
    case 'auth/cancelled-popup-request':
      return 'The sign-in process was cancelled.';
    case 'auth/network-request-failed':
      return 'A network error occurred. Please check your internet connection.';
    default:
      return 'An error occurred during authentication. Please try again later.';
  }
}; 
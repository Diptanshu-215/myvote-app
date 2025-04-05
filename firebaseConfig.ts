import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';
import { isBrowser } from './services/safeModuleLoader';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCCx6ciGk1q_wGGRPSXkxNdPfo7U7DHUss",
  authDomain: "ny-vote.firebaseapp.com",
  projectId: "ny-vote",
  storageBucket: "ny-vote.appspot.com",
  messagingSenderId: "429388640752",
  appId: "1:429388640752:web:074b566458c774a783ad35"
};

// Initialize Firebase
let app;

// Prevent multiple initializations in a safe way
if (!isBrowser() || (typeof window !== 'undefined' && getApps().length === 0)) {
  app = initializeApp(firebaseConfig);
} else if (typeof window !== 'undefined') {
  app = getApp();
} else {
  // Server-side fallback (empty app)
  app = {} as any;
}

// Get the auth instance
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Initialize Firestore
const db = getFirestore(app);

// Add scopes for Google provider (optional)
googleProvider.addScope('profile');
googleProvider.addScope('email');

// Set custom parameters for Google provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { auth, googleProvider, db }; 
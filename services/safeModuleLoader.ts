import { Platform } from 'react-native';

/**
 * Safely loads modules that depend on browser APIs like window or document
 * to prevent server-side rendering errors.
 * 
 * @param callback Function that loads and returns the browser-dependent module
 * @param fallback Optional fallback value to return when not in a browser environment
 */
export function loadBrowserModule<T>(callback: () => T, fallback: T | null = null): T | null {
  if (Platform.OS === 'web') {
    try {
      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        return callback();
      }
    } catch (error) {
      console.warn('Failed to load browser module:', error);
    }
  }
  return fallback;
}

/**
 * Check if code is running in a browser environment
 */
export const isBrowser = (): boolean => {
  return (
    Platform.OS === 'web' && 
    typeof window !== 'undefined' && 
    typeof document !== 'undefined'
  );
}; 
import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useAuthState } from '../services/authService';
import GoogleSignInButton from '../components/GoogleSignInButton';
import { Ionicons } from '@expo/vector-icons';

export default function Login() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthState();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user && !authLoading) {
      // Use setTimeout to ensure navigation happens after component is mounted
      setTimeout(() => {
        router.replace('/');
      }, 0);
    }
  }, [user, authLoading, router]);

  const handleGoogleSignSuccess = () => {
    // Navigate to home after Google sign in
    setTimeout(() => {
      router.replace('/');
    }, 0);
  };

  const handleGoogleSignError = (error: any) => {
    console.error('Google Sign-In Error:', error);
  };

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  // Don't render login form if already logged in
  if (user) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={['#4a65ff', '#1e40af']}
        style={styles.fullScreenBackground}
      />
      
      <Animated.View 
        entering={FadeInUp.delay(200).duration(1000)}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>MyVote</Text>
        <Text style={styles.headerSubtitle}>Blockchain-Powered Voter Authorization</Text>
      </Animated.View>

      <Animated.View 
        entering={FadeInDown.delay(300).duration(1000)}
        style={styles.formContainer}
      >
        <View style={styles.logoContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="logo-google" size={42} color="#4285F4" />
          </View>
          <Text style={styles.signInText}>Sign in with your Google account</Text>
        </View>

        <View style={styles.googleButtonContainer}>
          <GoogleSignInButton 
            onSignInSuccess={handleGoogleSignSuccess}
            onSignInError={handleGoogleSignError}
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 25,
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 15,
    overflow: 'hidden',
    borderWidth: 0,
  },
  signInText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  googleButtonContainer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 80, // Add some space from the bottom
  }
}); 
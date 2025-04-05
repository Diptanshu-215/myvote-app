import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform, Alert, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import GoogleSignInButton from '../components/GoogleSignInButton';
import { useAuthState } from '../services/authService';

export default function Auth() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading } = useAuthState();
  
  // Redirect if user is already logged in
  useEffect(() => {
    if (user && !authLoading) {
      router.push('/');
    }
  }, [user, authLoading, router]);
  
  const handleSignInSuccess = () => {
    setLoading(true);
    // Navigate to home after successful sign-in
    router.push('/');
  };

  const handleSignInError = (error: any) => {
    console.error('Sign-In Error:', error);
    Alert.alert(
      "Authentication Error",
      error.message || "There was a problem signing in. Please try again.",
      [{ text: "OK" }]
    );
  };

  // Simplified animation component
  const VoteAnimation = () => (
    <View style={styles.fallbackAnimation}>
      <Ionicons name="checkmark-circle" size={120} color="#ffffff" />
    </View>
  );

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  // Don't render auth screen if already logged in
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
        style={styles.contentContainer}
      >
        <View style={styles.illustrationContainer}>
          <VoteAnimation />
        </View>

        <Text style={styles.welcomeText}>
          Welcome to the secure voting platform that ensures transparency and integrity in the electoral process
        </Text>

        <GoogleSignInButton 
          onSignInSuccess={handleSignInSuccess}
          onSignInError={handleSignInError}
        />

        <View style={styles.orContainer}>
          <View style={styles.divider} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.divider} />
        </View>

        <TouchableOpacity 
          style={styles.emailButton}
          onPress={() => router.push('/login')}
        >
          <Ionicons name="mail-outline" size={20} color="#fff" style={styles.emailIcon} />
          <Text style={styles.emailButtonText}>Sign in with Email</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.registerButton}
          onPress={() => router.push('/register')}
        >
          <Text style={styles.registerButtonText}>
            New to MyVote? <Text style={styles.registerButtonTextBold}>Register Now</Text>
          </Text>
        </TouchableOpacity>
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
    backgroundColor: '#4a65ff',
  },
  fullScreenBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    paddingTop: 70,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 25,
    marginTop: 40,
  },
  illustrationContainer: {
    width: '100%',
    height: 200,
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  animation: {
    width: '100%',
    height: '100%',
  },
  fallbackAnimation: {
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 75,
  },
  welcomeText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  orText: {
    paddingHorizontal: 10,
    color: '#fff',
    fontWeight: '600',
  },
  emailButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    height: 55,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emailIcon: {
    marginRight: 10,
  },
  emailButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  registerButton: {
    marginTop: 30,
    alignItems: 'center',
  },
  registerButtonText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  registerButtonTextBold: {
    fontWeight: 'bold',
    color: '#fff',
  },
}); 
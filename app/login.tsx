import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function Login() {
  const router = useRouter();
  const [userType, setUserType] = useState<'normal' | 'admin'>('normal');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    
    // Navigate based on user type
    if (userType === 'admin') {
      router.push('/admin');
    } else {
      router.push('/');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={['#4a65ff', '#1e40af']}
        style={styles.headerBackground}
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
        <View style={styles.userTypeSelector}>
          <TouchableOpacity
            style={[
              styles.userTypeButton,
              userType === 'normal' && styles.activeUserType
            ]}
            onPress={() => setUserType('normal')}
          >
            <Ionicons 
              name="person" 
              size={20} 
              color={userType === 'normal' ? Colors.light.background : Colors.light.text} 
            />
            <Text style={[
              styles.userTypeText,
              userType === 'normal' && styles.activeUserTypeText
            ]}>Voter</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.userTypeButton,
              userType === 'admin' && styles.activeUserType
            ]}
            onPress={() => setUserType('admin')}
          >
            <Ionicons 
              name="shield" 
              size={20} 
              color={userType === 'admin' ? Colors.light.background : Colors.light.text} 
            />
            <Text style={[
              styles.userTypeText,
              userType === 'admin' && styles.activeUserTypeText
            ]}>Admin</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Email</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <Text style={styles.label}>Password</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity 
          style={styles.forgotPassword}
          onPress={() => router.push('/forgot-password')}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.loginButton}
          onPress={handleLogin}
        >
          <Text style={styles.loginButtonText}>Log In</Text>
        </TouchableOpacity>

        {userType === 'normal' && (
          <TouchableOpacity 
            style={styles.registerButton}
            onPress={() => router.push('/register')}
          >
            <Text style={styles.registerButtonText}>
              New User? <Text style={styles.registerButtonTextBold}>Register</Text>
            </Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  headerBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 220,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
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
    paddingTop: 20,
    paddingHorizontal: 25,
    marginTop: 10,
  },
  userTypeSelector: {
    flexDirection: 'row',
    marginBottom: 25,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 5,
  },
  userTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  activeUserType: {
    backgroundColor: Colors.light.tint,
  },
  userTypeText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  activeUserTypeText: {
    color: Colors.light.background,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: Colors.light.text,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
  },
  inputIcon: {
    padding: 10,
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 10,
  },
  errorText: {
    color: 'red',
    marginBottom: 15,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: Colors.light.tint,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: Colors.light.tint,
    borderRadius: 10,
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: Colors.light.tint,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  registerButtonText: {
    fontSize: 16,
    color: Colors.light.text,
  },
  registerButtonTextBold: {
    fontWeight: 'bold',
    color: Colors.light.tint,
  },
}); 
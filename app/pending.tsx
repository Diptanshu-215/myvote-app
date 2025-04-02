import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withDelay, FadeIn } from 'react-native-reanimated';
import LottieView from 'lottie-react-native';

export default function Pending() {
  const router = useRouter();
  
  // Animation values
  const rotation = useSharedValue(0);
  
  // Set up rotation animation
  React.useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 2000 }),
      -1, // Infinite repetition
      false
    );
  }, []);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotateZ: `${rotation.value}deg` }],
    };
  });

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <Animated.View 
        entering={FadeIn.delay(300).duration(1000)}
        style={styles.content}
      >
        <Animated.View style={[styles.iconContainer, animatedStyle]}>
          <Ionicons name="time-outline" size={80} color={Colors.light.tint} />
        </Animated.View>
        
        <Text style={styles.title}>Registration Pending</Text>
        
        <Text style={styles.description}>
          Your voter registration has been submitted to the blockchain and is awaiting admin approval. 
          You will receive an email notification once your registration has been reviewed.
        </Text>
        
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Status:</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Pending Verification</Text>
          </View>
        </View>
        
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Ionicons name="information-circle-outline" size={24} color={Colors.light.tint} />
            <Text style={styles.infoText}>The verification process typically takes 1-2 business days.</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="shield-checkmark-outline" size={24} color={Colors.light.tint} />
            <Text style={styles.infoText}>Your data is securely stored on the blockchain.</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.buttonText}>Back to Login</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 500,
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(74, 101, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 15,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 10,
  },
  statusBadge: {
    backgroundColor: '#FFF9C4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FBC02D',
  },
  statusText: {
    color: '#F57F17',
    fontWeight: '600',
  },
  infoContainer: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#444',
    flex: 1,
  },
  button: {
    backgroundColor: Colors.light.tint,
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 25,
    width: '100%',
    alignItems: 'center',
    shadowColor: Colors.light.tint,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 
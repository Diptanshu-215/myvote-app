import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Share, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withDelay, FadeIn } from 'react-native-reanimated';
import { checkVoterStatus } from '../services/apiService';

export default function Pending() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [voterAddress, setVoterAddress] = useState('');
  
  // Get blockchain address from URL params
  useEffect(() => {
    if (params.address) {
      setVoterAddress(params.address as string);
    }
  }, [params]);
  
  // Share voter registration info
  const shareRegistration = async () => {
    if (voterAddress) {
      try {
        await Share.share({
          message: `I've registered as a voter on the blockchain! My voter ID is: ${voterAddress}`,
          title: 'My Voter Registration'
        });
      } catch (error) {
        console.error('Error sharing registration:', error);
      }
    }
  };
  
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
          Your voter registration has been submitted to the blockchain and is awaiting verification. 
          You will be able to check your status in the app once the verification is complete.
        </Text>
        
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Status:</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Pending Verification</Text>
          </View>
        </View>
        
        {voterAddress ? (
          <View style={styles.blockchainContainer}>
            <Text style={styles.blockchainLabel}>Your Blockchain Address:</Text>
            <View style={styles.addressContainer}>
              <Text style={styles.addressText}>{voterAddress}</Text>
              <TouchableOpacity onPress={shareRegistration} style={styles.shareButton}>
                <Ionicons name="share-outline" size={22} color={Colors.light.tint} />
              </TouchableOpacity>
            </View>
            <Text style={styles.idNote}>
              This is your unique voter ID on the blockchain. Please save it for your records.
            </Text>
          </View>
        ) : null}
        
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
          onPress={() => router.replace('/')}
        >
          <Text style={styles.buttonText}>Back to Home</Text>
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
    marginBottom: 20,
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
  blockchainContainer: {
    width: '100%',
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  blockchainLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 5,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addressText: {
    fontSize: 12,
    color: '#1B5E20',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    flex: 1,
  },
  shareButton: {
    padding: 8,
  },
  idNote: {
    fontSize: 12,
    color: '#388E3C',
    marginTop: 8,
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
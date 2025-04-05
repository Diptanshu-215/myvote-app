import React from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { Ionicons } from '@expo/vector-icons';

interface CustomLottieViewProps {
  source: any;
  style?: any;
  autoPlay?: boolean;
  loop?: boolean;
}

const CustomLottieView = ({ source, style, autoPlay = true, loop = true }: CustomLottieViewProps) => {
  // On web, just show a simple icon instead of trying to load Lottie
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, style, styles.fallback]}>
        <Ionicons name="checkmark-circle" size={80} color="#4a65ff" />
      </View>
    );
  } else {
    // Use LottieView for native platforms
    return (
      <LottieView 
        source={source} 
        autoPlay={autoPlay} 
        loop={loop}
        style={style}
      />
    );
  }
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallback: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
  }
});

export default CustomLottieView; 
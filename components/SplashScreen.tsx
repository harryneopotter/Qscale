
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Dimensions } from 'react-native';
import { colors, commonStyles } from '../styles/commonStyles';
import Icon from './Icon';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animationSequence = Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]);

    // Glow animation
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    animationSequence.start(() => {
      setTimeout(onFinish, 1000);
    });
    
    glowAnimation.start();
  }, []);

  return (
    <View style={{
      flex: 1,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
          alignItems: 'center',
        }}
      >
        <Animated.View
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 32,
            boxShadow: '0px 8px 32px rgba(0, 229, 255, 0.4)',
            elevation: 12,
            opacity: Animated.add(0.8, Animated.multiply(glowAnim, 0.2)),
          }}
        >
          <Text style={{
            fontSize: 48,
            fontWeight: '700',
            color: colors.black,
            fontFamily: 'Inter_700Bold',
          }}>
            Q
          </Text>
        </Animated.View>
        
        <Text style={[commonStyles.title, { marginBottom: 8, color: colors.primary }]}>
          QScale
        </Text>
        
        <Animated.View
          style={{
            transform: [{ translateY: slideAnim }],
            opacity: fadeAnim,
          }}
        >
          <Text style={[commonStyles.textSecondary, { fontSize: 16 }]}>
            Scale. Crop. Convert. Effortlessly.
          </Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

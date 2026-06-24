import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Dimensions, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../theme/colors';

const { width } = Dimensions.get('window');

interface F1SplashScreenProps {
  onAnimationComplete: () => void;
}

export function F1SplashScreen({ onAnimationComplete }: F1SplashScreenProps) {
  // Built-in Animated Values (Web-Safe)
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textScale = useRef(new Animated.Value(0.95)).current;
  const streakTranslateX = useRef(new Animated.Value(-width)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      // 1. Text fades in subtly
      Animated.timing(textOpacity, { 
        toValue: 0.4, 
        duration: 500, 
        useNativeDriver: true 
      }),
      
      // 2. The F1 Laser Sweep (Custom Bezier Curve for cinematic smoothness)
      Animated.delay(150),
      Animated.timing(streakTranslateX, { 
        toValue: width * 1.5, 
        duration: 1200, 
        easing: Easing.bezier(0.25, 0.1, 0.25, 1), // Fast entrance, smooth deceleration
        useNativeDriver: true 
      }),
    ]).start();

    // 3. Parallel trigger: Text scales and glows exactly as the laser crosses the center
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(textScale, { 
          toValue: 1, 
          duration: 600, 
          easing: Easing.out(Easing.back(1.5)), // Slight cinematic pop
          useNativeDriver: true 
        }),
        Animated.timing(textOpacity, { 
          toValue: 1, 
          duration: 400, 
          useNativeDriver: true 
        }),
      ]).start();
    }, 1100);

    // 4. Fade out the screen and route to login
    setTimeout(() => {
      Animated.timing(screenOpacity, { 
        toValue: 0, 
        duration: 400, 
        useNativeDriver: true 
      }).start(() => {
        if (onAnimationComplete) onAnimationComplete();
      });
    }, 2400);

  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      <View style={styles.textWrapper}>
        
        {/* Foundation Telemetry Text */}
        <Animated.Text style={[styles.logoText, { opacity: textOpacity, transform: [{ scale: textScale }] }]}>
          CARBONLAP
        </Animated.Text>

        {/* High-velocity Laser Overlay */}
        <Animated.View style={[
          styles.streakContainer, 
          { transform: [{ translateX: streakTranslateX }] }
        ]}>
          {/* We use a skewed view instead of a skewed transform for safer web rendering */}
          <View style={styles.skewWrapper}>
            <LinearGradient
              colors={['transparent', Colors.SCUDERIA_RED, Colors.WHITE, Colors.SCUDERIA_RED, 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientStreak}
            />
          </View>
        </Animated.View>
        
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.OLED_BLACK,
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textWrapper: {
    position: 'relative',
    overflow: 'hidden',
    paddingVertical: 20,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 34,
    fontWeight: '900',
    color: Colors.WHITE,
    letterSpacing: 8,
    fontStyle: 'italic',
  },
  streakContainer: {
    position: 'absolute',
    top: -20,
    bottom: -20,
    width: width * 0.6,
  },
  skewWrapper: {
    width: '100%',
    height: '100%',
    transform: [{ skewX: '-25deg' }],
  },
  gradientStreak: {
    width: '100%',
    height: '100%',
    opacity: 0.95,
  },
});
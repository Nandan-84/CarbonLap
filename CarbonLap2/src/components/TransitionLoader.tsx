// src/components/TransitionLoader.tsx
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated, Easing, Platform } from 'react-native';
import { Colors } from '../theme/colors';

const F1_PHRASES = [
  'WARMING UP TYRES',
  'SYNCING TELEMETRY FEED',
  'CALIBRATING AERO MAPS',
  'ESTABLISHING PIT WALL LINK',
  'PREPARING THE GRID'
];

const isNative = Platform.OS !== 'web';

const TelemetrySpinner = React.memo(() => {
  const spinRed = useRef(new Animated.Value(0)).current;
  const spinWhite = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinRed, { toValue: 1, duration: 1000, easing: Easing.linear, useNativeDriver: isNative })
    ).start();
    
    Animated.loop(
      Animated.timing(spinWhite, { toValue: 1, duration: 2000, easing: Easing.linear, useNativeDriver: isNative })
    ).start();
  }, []);

  const rotateRed = spinRed.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const rotateWhite = spinWhite.interpolate({ inputRange: [0, 1], outputRange: ['360deg', '0deg'] }); 

  return (
    <View style={styles.spinnerContainer}>
      <View style={styles.ringBase} />
      <Animated.View style={[styles.ringRed, { transform: [{ rotate: rotateRed }] }]} />
      <Animated.View style={[styles.ringWhite, { transform: [{ rotate: rotateWhite }] }]} />
    </View>
  );
});

export function TransitionLoader({ onReady }: { onReady: () => void }) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const screenOpacity = useRef(new Animated.Value(0)).current;
  
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(30)).current; 

  useEffect(() => {
    let isMounted = true;
    let currentIndex = 0;

    Animated.timing(screenOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();

    const cycleText = () => {
      // 1. Aggressive fast-out
      Animated.parallel([
        Animated.timing(textOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(textTranslateY, { toValue: -30, duration: 200, easing: Easing.in(Easing.ease), useNativeDriver: true })
      ]).start(() => {
        if (!isMounted) return;
        
        currentIndex = (currentIndex + 1) % F1_PHRASES.length;
        setPhraseIndex(currentIndex);
        textTranslateY.setValue(30);
        
        // 2. Aggressive fast-in
        Animated.parallel([
          Animated.timing(textOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.timing(textTranslateY, { toValue: 0, duration: 250, easing: Easing.out(Easing.back(1.5)), useNativeDriver: true })
        ]).start();
      });
    };

    // Fast initial mount
    Animated.parallel([
      Animated.timing(textOpacity, { toValue: 1, duration: 300, delay: 100, useNativeDriver: true }),
      Animated.timing(textTranslateY, { toValue: 0, duration: 300, delay: 100, easing: Easing.out(Easing.back(1.5)), useNativeDriver: true })
    ]).start();

    // Fire the engine every 900ms
    const interval = setInterval(cycleText, 900);

    // EXACTLY 2.5 SECONDS to Dashboard
    const mainTimeout = setTimeout(() => {
      clearInterval(interval);
      Animated.timing(screenOpacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        onReady();
      });
    }, 2500); 

    return () => {
      isMounted = false;
      clearInterval(interval);
      clearTimeout(mainTimeout);
    };
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      <TelemetrySpinner />
      <View style={styles.textMask}>
        <Animated.Text style={[styles.text, { opacity: textOpacity, transform: [{ translateY: textTranslateY }] }]}>
          {F1_PHRASES[phraseIndex]}
        </Animated.Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.OLED_BLACK, justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  spinnerContainer: { width: 90, height: 90, justifyContent: 'center', alignItems: 'center', marginBottom: 40 },
  ringBase: { position: 'absolute', width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: Colors.GLASS_BORDER },
  ringRed: { position: 'absolute', width: 60, height: 60, borderRadius: 30, borderWidth: 3, borderColor: 'transparent', borderTopColor: Colors.SCUDERIA_RED, borderRightColor: Colors.SCUDERIA_RED, shadowColor: Colors.SCUDERIA_RED, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.9, shadowRadius: 12 },
  ringWhite: { position: 'absolute', width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: 'transparent', borderBottomColor: Colors.WHITE, borderLeftColor: 'rgba(255, 255, 255, 0.2)' },
  textMask: { height: 30, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  text: { color: Colors.WHITE, fontSize: 13, fontWeight: '900', letterSpacing: 3, fontStyle: 'italic', fontFamily: Platform.OS === 'web' ? 'system-ui, sans-serif' : undefined },
});
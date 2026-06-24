// src/navigation/MainNavigator.tsx

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

import HomeScreen from '../screens/HomeScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ResultsScreen } from '../screens/ResultsScreen';
import ScheduleScreen from '../screens/ScheduleScreen';
import LiveTelemetryScreen from '../screens/LiveTelemetryScreen';

const Tab = createBottomTabNavigator();

const CarbonLapHeader = () => {
  const [index, setIndex] = useState(0);

  const textOpacity = useRef(new Animated.Value(1)).current;
  const textTranslateY = useRef(new Animated.Value(0)).current;
  const dotOpacity = useRef(new Animated.Value(1)).current;

  const TAGLINES = [
    'SYS. NOMINAL',
    'AERO ACTIVE',
    'TYRE DATA OK',
    'MOM ENABLED',
    'MGU-K OPTIMAL',
  ];

  useEffect(() => {
    let isMounted = true;
    let currIndex = 0;

    const cycleText = () => {
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: -15,
          duration: 200,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (!isMounted) return;

        currIndex = (currIndex + 1) % TAGLINES.length;
        setIndex(currIndex);

        textTranslateY.setValue(15);

        Animated.parallel([
          Animated.timing(textOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(textTranslateY, {
            toValue: 0,
            duration: 250,
            easing: Easing.out(Easing.back(1.5)),
            useNativeDriver: true,
          }),
        ]).start();
      });
    };

    const interval = setInterval(cycleText, 3000);

    Animated.loop(
      Animated.sequence([
        Animated.timing(dotOpacity, {
          toValue: 0.1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(dotOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <SafeAreaView style={styles.headerSafeArea}>
      <View style={styles.headerContainer}>
        <View style={styles.logoWrapper}>
          <Text style={styles.headerLogo}>CARBONLAP</Text>

          <Animated.View
            style={[
              styles.liveDot,
              {
                opacity: dotOpacity,
              },
            ]}
          />
        </View>

        <View style={styles.taglineMask}>
          <Animated.Text
            style={[
              styles.taglineText,
              {
                opacity: textOpacity,
                transform: [
                  { translateY: textTranslateY },
                  { skewX: '-10deg' },
                ],
              },
            ]}
          >
            {TAGLINES[index]}
          </Animated.Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const ScreenPlaceholder = ({
  title,
  sub,
}: {
  title: string;
  sub: string;
}) => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderText}>{title}</Text>
    <Text style={styles.placeholderSub}>{sub}</Text>
  </View>
);

const ScheduleHub = () => (
  <ScreenPlaceholder
    title="SCHEDULE"
    sub="2026 Season Calendar"
  />
);

const ResultsHub = () => (
  <ScreenPlaceholder
    title="RESULTS"
    sub="Championship Standings"
  />
);

export function MainNavigator({
  userProfile,
  setUserProfile,
  authToken,
  onLogout,
}: any) {
  const [globalLap, setGlobalLap] = useState(14);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setGlobalLap(prev => prev >= 66 ? 66 : prev + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          header: () => <CarbonLapHeader />,
          tabBarStyle: styles.f1TabBar,
          tabBarShowLabel: true,
          tabBarActiveTintColor: Colors.WHITE,
          tabBarInactiveTintColor: Colors.GRAY,
          tabBarLabelStyle: styles.f1TabLabel,

          tabBarIcon: ({ focused }) => {
            let iconName: any = 'help';

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Schedule') {
              iconName = focused
                ? 'calendar-blank'
                : 'calendar-blank-outline';
            } else if (route.name === 'Results') {
              iconName = 'flag-checkered';
            } else if (route.name === 'Profile') {
              iconName = focused
                ? 'account'
                : 'account-outline';
            }

            return (
              <View style={styles.iconContainer}>
                {focused && (
                  <View style={styles.activeTopLine} />
                )}

                <MaterialCommunityIcons
                  name={iconName}
                  size={24}
                  color={
                    focused
                      ? Colors.WHITE
                      : Colors.GRAY
                  }
                />
              </View>
            );
          },
        })}
      >
        <Tab.Screen name="Home">
          {(props) => (
            <HomeScreen
              {...props}
              userProfile={userProfile}
              authToken={authToken}
              setUserProfile={setUserProfile}
              globalLap={globalLap}
            />
          )}
        </Tab.Screen>

        <Tab.Screen
          name="Schedule"
          component={ScheduleScreen}
        />

        <Tab.Screen
          name="Results"
          component={ResultsScreen}
        />

        <Tab.Screen
          name="LiveTelemetry"
          options={{ 
            tabBarButton: () => null,
            tabBarItemStyle: { display: 'none' }
          }}
        >
          {(props) => (
            <LiveTelemetryScreen
              {...props}
              userProfile={userProfile}
              authToken={authToken}
              setUserProfile={setUserProfile}
              globalLap={globalLap}
            />
          )}
        </Tab.Screen>

        <Tab.Screen name="Profile">
          {() => (
            <ProfileScreen
              userProfile={userProfile}
              setUserProfile={setUserProfile}
              authToken={authToken}
              onLogout={onLogout}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  headerSafeArea: {
    backgroundColor: Colors.OLED_BLACK,
  },

  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 55,
    paddingHorizontal: 20,
    backgroundColor: Colors.OLED_BLACK,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },

  logoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  headerLogo: {
    color: Colors.SCUDERIA_RED,
    fontSize: 20,
    fontWeight: '900',
    transform: [{ skewX: '-12deg' }],
    letterSpacing: 2.5,
    textShadowColor: 'rgba(255, 40, 0, 0.4)',
    textShadowOffset: {
      width: 0,
      height: 1,
    },
    textShadowRadius: 2,
  },

  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.SCUDERIA_RED,
    marginTop: 2,
  },

  taglineMask: {
    height: 22,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 4,
  },

  taglineText: {
    color: Colors.NEON_CYAN,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },

  f1TabBar: {
    backgroundColor: Colors.OLED_BLACK,
    borderTopWidth: 1,
    borderTopColor: '#1A1A1A',
    height: Platform.OS === 'ios' ? 85 : 60,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
    paddingTop: 0,
    elevation: 0,
  },

  f1TabLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: 2,
  },

  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
  },

  activeTopLine: {
    position: 'absolute',
    top: -5,
    width: '100%',
    height: 3,
    backgroundColor: Colors.SCUDERIA_RED,
  },

  placeholderContainer: {
    flex: 1,
    backgroundColor: Colors.OLED_BLACK,
    justifyContent: 'center',
    alignItems: 'center',
  },

  placeholderText: {
    color: Colors.WHITE,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
  },

  placeholderSub: {
    color: Colors.GRAY,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
});
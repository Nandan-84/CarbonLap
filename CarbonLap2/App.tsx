// App.tsx

import React, { useState, useEffect } from 'react';
import { StatusBar, ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthScreen } from './src/screens/AuthScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { MainNavigator } from './src/navigation/MainNavigator';
import { API_USERS_URL } from './src/config/api';

import AsyncStorage from '@react-native-async-storage/async-storage';

type AppState = 'UNAUTHENTICATED' | 'LOADING' | 'ONBOARDING' | 'DASHBOARD';

export default function App() {
  const [appState, setAppState] = useState<AppState>('LOADING');
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Single source of truth for user data
  const [userProfile, setUserProfile] = useState({
    name: 'NANDAN K',
    age: '25',
    gender: 'MALE',
    country: 'IN',
    email: 'nandan@carbonlap.com',
    favDriverId: 'CL',
    favTeamId: 'FERRARI',
    fantasyDriverId: 'CL',
    fantasyTeamName: 'Speed Demons',
    totalPoints: 0,
  });

  // Check storage on boot
  useEffect(() => {
    AsyncStorage.getItem('jwt_token').then((token: string | null) => {
      if (token) {
        handleAuthentication(token, false);
      } else {
        setAppState('UNAUTHENTICATED');
      }
    });
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('jwt_token');
    setAuthToken(null);
    setAppState('UNAUTHENTICATED');
  };

  const handleAuthentication = async (token: string, isNewUser: boolean) => {
    setAuthToken(token);
    await AsyncStorage.setItem('jwt_token', token); // TC_011: store securely

    if (isNewUser) {
      setAppState('ONBOARDING');
    } else {
      setAppState('LOADING');
      try {
        const res = await fetch(`${API_USERS_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // TC_015: Session Token Expiry Handling
        if (res.status === 401 || res.status === 403) {
          alert("Session expired");
          await handleLogout();
          return;
        }

        if (res.ok) {
          const data = await res.json();
          setUserProfile({
            name: data.fullName || 'New Driver',
            age: data.age?.toString() || '18',
            gender: data.gender || 'UNKNOWN',
            country: data.countryCode || 'UN',
            email: data.email,
            favDriverId: data.favDriverId || 'CL',
            favTeamId: data.favTeamId || 'FERRARI',
            fantasyDriverId: data.fantasyDriverId || 'CL',
            fantasyTeamName: data.fantasyTeamName || 'Speed Demons',
            totalPoints: data.totalPoints || 0,
          });
          setAppState('DASHBOARD');
        } else {
          await handleLogout();
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
        setAppState('UNAUTHENTICATED');
      }
    }
  };

  const handleOnboardingComplete = async (data: any) => {
    try {
      const res = await fetch(`${API_USERS_URL}/profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({
          name: data.name,
          age: data.age,
          gender: data.gender,
          country: data.country,
          favDriverId: data.favDriver,
          favTeamId: data.favTeam,
          fantasyDriverId: data.fantasyDriver,
          fantasyTeamName: data.fantasyTeamName,
        })
      });
      if (res.ok) {
        const updatedUser = await res.json();
        const userData = updatedUser.user;
        setUserProfile({
          name: userData.fullName,
          age: userData.age?.toString() || '18',
          gender: userData.gender,
          country: userData.countryCode,
          email: userData.email,
          favDriverId: userData.favDriverId,
          favTeamId: userData.favTeamId,
          fantasyDriverId: userData.fantasyDriverId,
          fantasyTeamName: userData.fantasyTeamName,
          totalPoints: userData.totalPoints || 0,
        });
      } else {
        // Fallback
        setUserProfile({
          ...userProfile,
          name: data.name,
          age: data.age,
          gender: data.gender,
          country: data.country,
          favDriverId: data.favDriver,
          favTeamId: data.favTeam,
          fantasyDriverId: data.fantasyDriver,
          fantasyTeamName: data.fantasyTeamName,
          totalPoints: 0,
        });
      }
    } catch (err) {
      console.error("Failed to update profile", err);
      // Fallback
      setUserProfile({
        ...userProfile,
        name: data.name,
        age: data.age,
        gender: data.gender,
        country: data.country,
        favDriverId: data.favDriver,
        favTeamId: data.favTeam,
        fantasyDriverId: data.fantasyDriver,
        fantasyTeamName: data.fantasyTeamName,
        totalPoints: 0,
      });
    }

    setAppState('DASHBOARD');
  };



  const renderCurrentState = () => {
    switch (appState) {
      case 'UNAUTHENTICATED':
        return <AuthScreen onAuthenticate={handleAuthentication} />;
      
      case 'LOADING':
        return (
          <View style={{flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator size="large" color="#FF2800" />
          </View>
        );

      case 'ONBOARDING':
        return <OnboardingScreen onComplete={handleOnboardingComplete} />;

      case 'DASHBOARD':
        return <MainNavigator userProfile={userProfile} setUserProfile={setUserProfile} authToken={authToken} onLogout={handleLogout} />;

      default:
        return <AuthScreen onAuthenticate={handleAuthentication} />;
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      {renderCurrentState()}
    </SafeAreaProvider>
  );
}
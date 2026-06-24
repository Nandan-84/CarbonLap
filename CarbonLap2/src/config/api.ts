// src/config/api.ts
// ==========================================
// 🌐 CENTRALIZED API CONFIGURATION
// ==========================================
// Dynamic endpoint configuration to seamlessly work with:
// - Android Emulator (10.0.2.2)
// - iOS Simulator (localhost)
// - Physical Devices via Expo Go (dynamic local network IP)
// ==========================================

import { Platform } from 'react-native';
import Constants from 'expo-constants';

const getBackendUrl = (): string => {
  if (__DEV__) {
    // When running in development, Expo provides the host URI (e.g., '192.168.1.5:8081')
    // We extract the IP to point our backend to the same host machine.
    const debuggerHost = Constants.expoConfig?.hostUri;
    
    if (debuggerHost) {
      const localhost = debuggerHost.split(':')[0];
      return `http://${localhost}:3001`;
    }

    // Fallbacks if hostUri is unavailable
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3001';
    }
    return 'http://localhost:3001';
  }

  // Production — replace with your deployed backend URL
  return 'https://your-production-api.com';
};

export const API_BASE_URL = getBackendUrl();

// Convenience sub-paths
export const API_AUTH_URL = `${API_BASE_URL}/api/auth`;
export const API_F1_URL = `${API_BASE_URL}/api/f1`;
export const API_USERS_URL = `${API_BASE_URL}/api/users`;

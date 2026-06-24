// src/screens/AuthScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable, Animated, Platform, ScrollView, KeyboardAvoidingView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { API_AUTH_URL } from '../config/api';

interface AuthScreenProps {
  onAuthenticate: (token: string, isNewUser: boolean) => void;
}

type ViewMode = 'login' | 'signup' | 'otp' | 'forgot_email' | 'forgot_reset';

export function AuthScreen({ onAuthenticate }: AuthScreenProps) {
  const insets = useSafeAreaInsets(); 
  const [view, setView] = useState<ViewMode>('login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); 
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  
  const otpRefs = useRef<Array<TextInput | null>>([]);

  // 🚫 DELETED focusedInput state to prevent Android keyboard crash

  const cardTranslateY = useRef(new Animated.Value(50)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardTranslateY, { toValue: 0, duration: 600, useNativeDriver: true }),
      Animated.timing(cardOpacity, { toValue: 1, duration: 500, useNativeDriver: true })
    ]).start();
  }, []);

  const switchView = (newView: ViewMode) => {
    Animated.parallel([
      Animated.timing(cardTranslateY, { toValue: 20, duration: 200, useNativeDriver: true }),
      Animated.timing(cardOpacity, { toValue: 0, duration: 200, useNativeDriver: true })
    ]).start(() => {
      if (newView === 'login' || newView === 'signup' || newView === 'forgot_email') {
        setPassword('');
        setConfirmPassword('');
        setOtp(['', '', '', '', '', '']); 
      }
      setView(newView);
      cardTranslateY.setValue(30);
      Animated.parallel([
        Animated.timing(cardTranslateY, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(cardOpacity, { toValue: 1, duration: 300, useNativeDriver: true })
      ]).start();
    });
  };

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const API_URL = API_AUTH_URL;

  const handlePrimaryAction = async () => {
    // TC_014: Empty fields validation
    if (view === 'login') {
      if (!email || !password) {
        alert('Please fill in all fields');
        return;
      }
    }

    if (view === 'signup' || view === 'forgot_reset') {
      if (password !== confirmPassword) {
        alert("Passwords do not match. Please verify your entry.");
        return;
      }
      if (password.length < 6) {
        alert("Access code must be at least 6 characters.");
        return;
      }
    }

    try {
      if (view === 'login') {
        const res = await fetch(`${API_URL}/login`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ email, password }) });
        const data = await res.json();
        
        // TC_012 & TC_013 Explicit error handling based on status
        if (res.ok) {
          onAuthenticate(data.token, false);
        } else if (res.status === 401) {
          alert('Invalid credentials');
        } else if (res.status === 404) {
          alert('Account not found');
        } else {
          alert(data.error || 'Login failed');
        }
      } 
      else if (view === 'signup') {
        const res = await fetch(`${API_URL}/signup`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ email, password }) });
        const data = await res.json();
        if (res.ok) switchView('otp'); 
        else alert(data.error);
      } 
      else if (view === 'otp') {
        const otpString = otp.join('');
        const res = await fetch(`${API_URL}/verify`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ email, otp: otpString }) });
        const data = await res.json();
        if (res.ok) onAuthenticate(data.token, true);
        else alert(data.error);
      }
      else if (view === 'forgot_email') {
        const res = await fetch(`${API_URL}/forgot`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ email }) });
        const data = await res.json();
        if (res.ok) switchView('forgot_reset');
        else alert(data.error);
      }
      else if (view === 'forgot_reset') {
        const otpString = otp.join('');
        const res = await fetch(`${API_URL}/reset`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ email, otp: otpString, newPassword: password }) });
        const data = await res.json();
        if (res.ok) switchView('login');
        else alert(data.error);
      }
    } catch (err) {
      alert("Network Error. Is the Node.js backend running on Port 3001?");
    }
  };

  const renderHeader = () => {
    const headers = {
      login: { title: 'DRIVER LOGIN', sub: 'The Race to Net-Zero Starts Here.' },
      signup: { title: 'DRIVER REGISTRATION', sub: 'Join the 2026 grid.' },
      otp: { title: 'VERIFY IDENTITY', sub: 'Check secure terminal for 6-digit code.' },
      forgot_email: { title: 'OVERRIDE ACCESS', sub: 'Request a password reset transmission.' },
      forgot_reset: { title: 'NEW ACCESS CODE', sub: 'Enter OTP and your new password.' }
    };
    return (
      <View style={styles.header}>
        <Text style={styles.title}>{headers[view].title}</Text>
        <Text style={styles.subtitle}>{headers[view].sub}</Text>
      </View>
    );
  };

  const FormContent = (
    <Animated.View style={[styles.card, { opacity: cardOpacity, transform: [{ translateY: cardTranslateY }] }]}>
      {renderHeader()}

      <View style={styles.form}>
        
        {(view === 'login' || view === 'signup' || view === 'forgot_email') && (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>EMAIL</Text>
            <TextInput
              style={styles.input}
              placeholder="driver@carbonlap.com"
              placeholderTextColor={Colors.GRAY}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              cursorColor={Colors.SCUDERIA_RED} // 🚀 Native feedback without re-renders!
              selectionColor={Colors.SCUDERIA_RED}
            />
          </View>
        )}

        {(view === 'otp' || view === 'forgot_reset') && (
          <View>
            <Text style={styles.inputLabel}>AUTHORIZATION CODE</Text>
            <View style={styles.otpWrapper}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  // @ts-ignore
                  ref={(ref) => (otpRefs.current[index] = ref)}
                  style={styles.otpBox}
                  value={digit}
                  onChangeText={(text) => handleOtpChange(text, index)}
                  onKeyPress={(e) => handleOtpKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                  cursorColor={Colors.SCUDERIA_RED}
                  selectionColor={Colors.SCUDERIA_RED}
                />
              ))}
            </View>
          </View>
        )}

        {(view === 'login' || view === 'signup' || view === 'forgot_reset') && (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{view === 'forgot_reset' ? 'NEW PASSWORD' : 'PASSWORD'}</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={Colors.GRAY}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              cursorColor={Colors.SCUDERIA_RED}
              selectionColor={Colors.SCUDERIA_RED}
            />
          </View>
        )}

        {(view === 'signup' || view === 'forgot_reset') && (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>CONFIRM PASSWORD</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={Colors.GRAY}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              cursorColor={Colors.SCUDERIA_RED}
              selectionColor={Colors.SCUDERIA_RED}
            />
          </View>
        )}

        {view === 'login' && (
          <Pressable onPress={() => switchView('forgot_email')}>
            <Text style={styles.forgotPassword}>FORGOT PASSWORD?</Text>
          </Pressable>
        )}
      </View>

      <Pressable onPress={handlePrimaryAction} style={styles.actionButton}>
        <LinearGradient colors={[Colors.SCUDERIA_RED, Colors.RED_DIM]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.buttonGradient}>
          <Text style={styles.buttonText}>TRANSMIT ➔</Text>
        </LinearGradient>
      </Pressable>

      <View style={styles.footer}>
        {view === 'login' && (
          <Pressable onPress={() => switchView('signup')} style={styles.toggleButton}>
            <Text style={styles.toggleText}>NEW TO THE GRID? <Text style={styles.toggleHighlight}>SIGN UP</Text></Text>
          </Pressable>
        )}
        {view === 'signup' && (
          <Pressable onPress={() => switchView('login')} style={styles.toggleButton}>
            <Text style={styles.toggleText}>ALREADY REGISTERED? <Text style={styles.toggleHighlight}>LOGIN</Text></Text>
          </Pressable>
        )}
        {(view === 'otp' || view === 'forgot_email' || view === 'forgot_reset') && (
          <Pressable onPress={() => switchView('login')} style={styles.toggleButton}>
            <Text style={styles.toggleText}>➔ <Text style={styles.toggleHighlight}>RETURN TO LOGIN</Text></Text>
          </Pressable>
        )}
      </View>
    </Animated.View>
  );

  // iOS Layout
  if (Platform.OS === 'ios') {
    return (
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        <ScrollView 
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 100 }]} 
          keyboardShouldPersistTaps="handled" 
          bounces={false}
        >
          {FormContent}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // Android Bare Metal Layout
  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 120 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {FormContent}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.OLED_BLACK },
  scrollContent: { 
    flexGrow: 1, 
    justifyContent: 'flex-start',
    alignItems: 'center', 
    paddingHorizontal: 20,
    paddingBottom: 40 
  },
  card: { 
    width: '100%', 
    maxWidth: 400, 
    backgroundColor: Colors.CARD_BG, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: Colors.GLASS_BORDER, 
    padding: 24, 
  },
  header: { marginBottom: 30 },
  title: { fontSize: 24, fontWeight: '900', color: Colors.WHITE, letterSpacing: 2, fontStyle: 'italic' },
  subtitle: { fontSize: 12, color: Colors.GRAY, letterSpacing: 1, marginTop: 4 },
  form: { gap: 16, marginBottom: 30 },
  inputContainer: { backgroundColor: '#111111', borderWidth: 1, borderColor: Colors.GLASS_BORDER, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10 },
  inputLabel: { fontSize: 9, color: Colors.LIGHT_GRAY, fontWeight: '700', letterSpacing: 2, marginBottom: 4 },
  input: { color: Colors.WHITE, fontSize: 16, fontWeight: '600', letterSpacing: 1 },
  otpWrapper: { flexDirection: 'row', justifyContent: 'space-between', gap: 6, marginTop: 6 },
  otpBox: { flex: 1, height: 45, maxWidth: 45, backgroundColor: '#111111', borderWidth: 1, borderColor: Colors.GLASS_BORDER, borderRadius: 10, color: Colors.WHITE, fontSize: 18, fontWeight: '700', textAlign: 'center' },
  forgotPassword: { color: Colors.GRAY, fontSize: 10, fontWeight: '700', letterSpacing: 1, textAlign: 'right', marginTop: -4 },
  actionButton: { borderRadius: 8, overflow: 'hidden' },
  buttonGradient: { paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: Colors.WHITE, fontSize: 14, fontWeight: '900', letterSpacing: 4, fontStyle: 'italic' },
  footer: { marginTop: 20, alignItems: 'center' },
  toggleButton: { paddingVertical: 10 },
  toggleText: { fontSize: 10, color: Colors.GRAY, letterSpacing: 1, fontWeight: '600' },
  toggleHighlight: { color: Colors.WHITE, fontWeight: '800' },
});
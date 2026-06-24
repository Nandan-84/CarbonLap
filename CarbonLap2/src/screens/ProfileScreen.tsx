import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView, Modal, TextInput, Image, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../theme/colors';
import { API_USERS_URL } from '../config/api';
import ViewShot from 'react-native-view-shot';
import * as Share from 'expo-sharing';

// 🏁 2026 Master Grid Reference System
const drivers = [
  { id: 'GR', name: 'GEORGE RUSSELL', team: 'MERCEDES', number: '63', image: require('../../assets/images/Drivers/GR.png') },
  { id: 'KA', name: 'KIMI ANTONELLI', team: 'MERCEDES', number: '12', image: require('../../assets/images/Drivers/KA.png') },
  { id: 'CL', name: 'CHARLES LECLERC', team: 'FERRARI', number: '16', image: require('../../assets/images/Drivers/CL.png') },
  { id: 'LH', name: 'LEWIS HAMILTON', team: 'FERRARI', number: '44', image: require('../../assets/images/Drivers/LH.png') },
  { id: 'LN', name: 'LANDO NORRIS', team: 'MCLAREN', number: '4', image: require('../../assets/images/Drivers/LN.png') },
  { id: 'OP', name: 'OSCAR PIASTRI', team: 'MCLAREN', number: '81', image: require('../../assets/images/Drivers/OP.png') },
  { id: 'MV', name: 'MAX VERSTAPPEN', team: 'RED BULL RACING', number: '1', image: require('../../assets/images/Drivers/MV.png') },
  { id: 'IH', name: 'ISACK HADJAR', team: 'RED BULL RACING', number: '6', image: require('../../assets/images/Drivers/IH.png') },
  { id: 'PG', name: 'PIERRE GASLY', team: 'ALPINE', number: '10', image: require('../../assets/images/Drivers/PG.png') },
  { id: 'FC', name: 'FRANCO COLAPINTO', team: 'ALPINE', number: '43', image: require('../../assets/images/Drivers/FC.png') },
  { id: 'LL', name: 'LIAM LAWSON', team: 'RACING BULLS', number: '30', image: require('../../assets/images/Drivers/LL.png') },
  { id: 'AL', name: 'ARVID LINDBLAD', team: 'RACING BULLS', number: '24', image: require('../../assets/images/Drivers/AL.png') },
  { id: 'EO', name: 'ESTEBAN OCON', team: 'HAAS F1 TEAM', number: '31', image: require('../../assets/images/Drivers/EO.png') },
  { id: 'OB', name: 'OLIVER BEARMAN', team: 'HAAS F1 TEAM', number: '87', image: require('../../assets/images/Drivers/OB.png') },
  { id: 'CS', name: 'CARLOS SAINZ', team: 'WILLIAMS', number: '55', image: require('../../assets/images/Drivers/CS.png') },
  { id: 'AA', name: 'ALEXANDER ALBON', team: 'WILLIAMS', number: '23', image: require('../../assets/images/Drivers/AA.png') },
  { id: 'NH', name: 'NICO HULKENBERG', team: 'AUDI', number: '27', image: require('../../assets/images/Drivers/NH.png') },
  { id: 'GB', name: 'GABRIEL BORTOLETO', team: 'AUDI', number: '85', image: require('../../assets/images/Drivers/GB.png') },
  { id: 'SP', name: 'SERGIO PEREZ', team: 'CADILLAC', number: '11', image: require('../../assets/images/Drivers/SP.png') },
  { id: 'VB', name: 'VALTTERI BOTTAS', team: 'CADILLAC', number: '77', image: require('../../assets/images/Drivers/VB.png') },
  { id: 'FA', name: 'FERNANDO ALONSO', team: 'ASTON MARTIN', number: '14', image: require('../../assets/images/Drivers/FA.png') },
  { id: 'LS', name: 'LANCE STROLL', team: 'ASTON MARTIN', number: '18', image: require('../../assets/images/Drivers/LS.png') },
];

const teams = [
  { id: 'MERCEDES', name: 'MERCEDES', principal: 'Toto Wolff', hq: 'Brackley, UK', image: require('../../assets/images/Teams/Mercedes.png') },
  { id: 'FERRARI', name: 'FERRARI', principal: 'Fred Vasseur', hq: 'Maranello, Italy', image: require('../../assets/images/Teams/Ferrari.png') },
  { id: 'MCLAREN', name: 'MCLAREN', principal: 'Andrea Stella', hq: 'Woking, UK', image: require('../../assets/images/Teams/McLaren.png') },
  { id: 'REDBULL', name: 'RED BULL RACING', principal: 'Christian Horner', hq: 'Milton Keynes, UK', image: require('../../assets/images/Teams/Red bull.png') },
  { id: 'ALPINE', name: 'BWT ALPINE', principal: 'Oliver Oakes', hq: 'Enstone, UK', image: require('../../assets/images/Teams/BWT Alpine.png') },
  { id: 'RACING_BULLS', name: 'RACING BULLS', principal: 'Laurent Mekies', hq: 'Faenza, Italy', image: require('../../assets/images/Teams/Racing Bulls.png') },
  { id: 'HAAS', name: 'HAAS F1 TEAM', principal: 'Ayao Komatsu', hq: 'Kannapolis, USA', image: require('../../assets/images/Teams/Haas.png') },
  { id: 'WILLIAMS', name: 'WILLIAMS', principal: 'James Vowles', hq: 'Grove, UK', image: require('../../assets/images/Teams/Williams.png') },
  { id: 'AUDI', name: 'AUDI', principal: 'Mattia Binotto', hq: 'Hinwil, Switzerland', image: require('../../assets/images/Teams/Audi.png') },
  { id: 'CADILLAC', name: 'CADILLAC', principal: 'Michael Andretti', hq: 'Fishers, USA', image: require('../../assets/images/Teams/Cadillac.png') },
  { id: 'ASTON_MARTIN', name: 'ASTON MARTIN', principal: 'Mike Krack', hq: 'Silverstone, UK', image: require('../../assets/images/Teams/Aston Martin.png') },
];

export function ProfileScreen({ userProfile, setUserProfile, authToken, onLogout }: any) {
  const viewShotRef = useRef<any>(null);

  const captureAndShare = async () => {
    try {
      if (viewShotRef.current) {
        const uri = await viewShotRef.current.capture();
        await Share.shareAsync(uri);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Modal Visibility States
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [driverPickerVisible, setDriverPickerVisible] = useState(false);
  const [teamPickerVisible, setTeamPickerVisible] = useState(false);
  
  // Sub-navigation state flags
  const [passwordResetMode, setPasswordResetMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Local Form Staging Environments
  const [formData, setFormData] = useState({ name: '', age: '', email: '' });
  const [authData, setAuthData] = useState({ newPassword: '', confirmPassword: '' });

  // Synchronize local states with upstream contexts when opening panel arrays
  useEffect(() => {
    if (editModalVisible) {
      setFormData({ name: userProfile.name, age: userProfile.age.toString(), email: userProfile.email });
      setAuthData({ newPassword: '', confirmPassword: '' });
    }
  }, [editModalVisible, userProfile]);

  // General backend sync function for preferences
  const syncPreferenceToBackend = async (updates: any) => {
    try {
      const response = await fetch(`${API_USERS_URL}/profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}` 
        },
        body: JSON.stringify({
          ...userProfile,
          ...updates, // Name, age, email, favDriverId, favTeamId, etc.
          name: updates.name || userProfile.name,
          age: updates.age || userProfile.age,
          email: updates.email || userProfile.email,
          country: userProfile.country,
          gender: userProfile.gender,
        }),
      });

      if (!response.ok) throw new Error('DB Update Rejection');
      return await response.json();
    } catch (error) {
      console.error("Sync error:", error);
      throw error;
    }
  };

  // 🚀 BACKEND SYNC OPERATION: Form Meta Profiles
  const submitProfileUpdate = async () => {
    setIsSubmitting(true);
    try {
      await syncPreferenceToBackend({
        name: formData.name,
        age: parseInt(formData.age),
        email: formData.email
      });

      setUserProfile({ ...userProfile, name: formData.name, age: formData.age, email: formData.email });
      setEditModalVisible(false);
      Alert.alert("SYSTEM NOMINAL", "Profile data secured to backend Prisma schema.");
    } catch (error) {
      Alert.alert("TELEMETRY ERROR", "Could not reach database server. Changes saved locally.");
      setUserProfile({ ...userProfile, name: formData.name, age: formData.age, email: formData.email });
      setEditModalVisible(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🚀 BACKEND SYNC OPERATION: Security Keys
  const submitPasswordReset = async () => {
    if (authData.newPassword !== authData.confirmPassword) {
      return Alert.alert("ERROR", "Passwords do not match.");
    }
    if (authData.newPassword.length < 6) {
      return Alert.alert("ERROR", "Access code must be at least 6 characters.");
    }
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_USERS_URL}/update-password`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ newPassword: authData.newPassword }),
      });

      if (!response.ok) throw new Error('Reset Contract Rejected');

      setEditModalVisible(false);
      setPasswordResetMode(false);
      Alert.alert("SECURITY COMPLIANT", "New cryptchecksum written to user block.");
    } catch (error) {
      Alert.alert("TELEMETRY ERROR", "Could not execute remote procedure call.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🚀 BACKEND SYNC OPERATION: Account Purges
  const submitAccountDeletion = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_USERS_URL}/delete`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
      });

      if (!response.ok) throw new Error('Purge Request Failed');
      Alert.alert("ACCOUNT PURGED", "All row elements cascade-deleted from relational system.");
      if (onLogout) onLogout();
    } catch (error) {
      Alert.alert("TELEMETRY ERROR", "Remote execution failed.");
    } finally {
      setIsSubmitting(false);
      setDeleteModalVisible(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("CONFIRM LOGOUT", "Terminate active telemetry session?", [
      { text: "CANCEL", style: "cancel" },
      { text: "TERMINATE", style: "destructive", onPress: () => {
        console.log("Session destroyed.");
        if (onLogout) onLogout();
      }}
    ]);
  };

  // Live variable lookups
  const favoriteDriver = drivers.find(d => d.id === userProfile.favDriverId);
  const favoriteTeam = teams.find(t => t.id === userProfile.favTeamId);

  const GlassCard = ({ title, subtitle, bgText, imageUrl, onPress }: any) => (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.glassCard, pressed && { opacity: 0.8 }]}>
      <View style={styles.cardContent}>
        <View style={{ zIndex: 2 }}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardSubtitle}>{subtitle}</Text>
        </View>
        {bgText && <Text style={styles.bgText}>{bgText}</Text>}
        {imageUrl && <Image source={imageUrl} style={styles.bgImage} />}
      </View>
    </Pressable>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      
      <Text style={styles.sectionHeader}>IDENTITY</Text>
      <GlassCard 
        title={userProfile.name}
        subtitle={`${userProfile.age} YRS • ${userProfile.gender}`}
        bgText={userProfile.country}
        onPress={() => { setPasswordResetMode(false); setEditModalVisible(true); }}
      />

      <Text style={styles.sectionHeader}>FAVORITES (TAP TO ALTER)</Text>
      
      {favoriteDriver && (
        <GlassCard 
          title={favoriteDriver.name}
          subtitle={`RACING NUMBER: ${favoriteDriver.number}`}
          imageUrl={favoriteDriver.image}
          onPress={() => setDriverPickerVisible(true)} 
        />
      )}

      {favoriteTeam && (
        <GlassCard 
          title={favoriteTeam.name}
          subtitle={`${favoriteTeam.principal}, ${favoriteTeam.hq}`}
          imageUrl={favoriteTeam.image}
          onPress={() => setTeamPickerVisible(true)} 
        />
      )}

      <Text style={styles.sectionHeader}>FANTASY TEAM</Text>
      <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 0.9 }}>
        <GlassCard 
          title={userProfile.fantasyTeamName || 'UNNAMED TEAM'}
          subtitle={`DRIVER: ${drivers.find(d => d.id === userProfile.fantasyDriverId)?.name || 'UNKNOWN'} • PTS: ${userProfile.totalPoints || 0}`}
          imageUrl={drivers.find(d => d.id === userProfile.fantasyDriverId)?.image}
          onPress={() => {}} 
        />
      </ViewShot>
      
      <Pressable onPress={captureAndShare} style={[styles.logoutButton, { backgroundColor: Colors.SCUDERIA_RED, marginTop: -15, marginBottom: 20 }]}>
        <Text style={[styles.logoutText, { color: Colors.WHITE }]}>SHARE ECO-DRIVER SUMMARY</Text>
      </Pressable>

      <View style={styles.dangerZone}>
        <Pressable onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>LOGOUT</Text>
        </Pressable>
        
        <Pressable onPress={() => setDeleteModalVisible(true)} style={styles.deleteButton}>
          <Text style={styles.deleteText}>DELETE ACCOUNT</Text>
        </Pressable>
      </View>

      {/* --- DYNAMIC SELECTION OVERLAYS --- */}

      {/* DRIVER GRID PICKER */}
      <Modal visible={driverPickerVisible} animationType="slide" transparent={true} statusBarTranslucent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { height: '80%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>CHOOSE DRIVER RECOGNITION FLAG</Text>
              <Pressable onPress={() => setDriverPickerVisible(false)}><Text style={styles.closeText}>BACK</Text></Pressable>
            </View>
            <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
              {drivers.map(d => (
                <Pressable 
                  key={d.id} 
                  onPress={async () => {
                    setUserProfile({ ...userProfile, favDriverId: d.id });
                    setDriverPickerVisible(false);
                    try { await syncPreferenceToBackend({ favDriverId: d.id }); } catch(e) {}
                  }}
                  style={[styles.pickerItemRow, userProfile.favDriverId === d.id && styles.pickerItemRowActive]}
                >
                  <View>
                    <Text style={styles.pickerItemMainText}>{d.name}</Text>
                    <Text style={styles.pickerItemSubText}>{d.team} • #{d.number}</Text>
                  </View>
                  <Image source={d.image} style={styles.pickerInlineThumbnail} />
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* CONSTRUCTOR PICKER */}
      <Modal visible={teamPickerVisible} animationType="slide" transparent={true} statusBarTranslucent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { height: '80%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>CHOOSE TEAM SUPPORTER FLAG</Text>
              <Pressable onPress={() => setTeamPickerVisible(false)}><Text style={styles.closeText}>BACK</Text></Pressable>
            </View>
            <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
              {teams.map(t => (
                <Pressable 
                  key={t.id} 
                  onPress={async () => {
                    setUserProfile({ ...userProfile, favTeamId: t.id });
                    setTeamPickerVisible(false);
                    try { await syncPreferenceToBackend({ favTeamId: t.id }); } catch(e) {}
                  }}
                  style={[styles.pickerItemRow, userProfile.favTeamId === t.id && styles.pickerItemRowActive]}
                >
                  <View>
                    <Text style={styles.pickerItemMainText}>{t.name}</Text>
                    <Text style={styles.pickerItemSubText}>{t.principal} • {t.hq}</Text>
                  </View>
                  <Image source={t.image} style={styles.pickerInlineThumbnailTeam} />
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* CORE PROFILE MODIFICATIONS OVERLAY */}
      <Modal visible={editModalVisible} animationType="slide" transparent={true} statusBarTranslucent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{passwordResetMode ? 'SECURITY OVERRIDE' : 'EDIT PROFILE'}</Text>
              <Pressable onPress={() => { setEditModalVisible(false); setPasswordResetMode(false); }}>
                <Text style={styles.closeText}>BACK</Text>
              </Pressable>
            </View>

            {!passwordResetMode ? (
              <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
                <Text style={styles.inputLabel}>FULL NAME</Text>
                <TextInput style={styles.input} value={formData.name} onChangeText={(t) => setFormData({...formData, name: t.toUpperCase()})} />
                
                <Text style={styles.inputLabel}>AGE</Text>
                <TextInput style={styles.input} value={formData.age} keyboardType="numeric" onChangeText={(t) => setFormData({...formData, age: t})} />
                
                <Text style={styles.inputLabel}>EMAIL</Text>
                <TextInput style={styles.input} value={formData.email} autoCapitalize="none" onChangeText={(t) => setFormData({...formData, email: t})} />

                <Pressable onPress={() => setPasswordResetMode(true)} style={styles.passwordResetTriggerButton}>
                  <Text style={styles.passwordResetTriggerText}>➔ ALTER ACCOUNT PASSWORD?</Text>
                </Pressable>

                <Pressable onPress={submitProfileUpdate} disabled={isSubmitting} style={styles.actionButton}>
                  <LinearGradient colors={[Colors.SCUDERIA_RED, Colors.RED_DIM]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.buttonGradient}>
                    {isSubmitting ? <ActivityIndicator color={Colors.WHITE} /> : <Text style={styles.buttonText}>UPDATE PROFILE ➔</Text>}
                  </LinearGradient>
                </Pressable>
              </ScrollView>
            ) : (
              <View style={styles.modalForm}>
                <Text style={styles.inputLabel}>NEW SECURE PASSWORD</Text>
                <TextInput style={styles.input} secureTextEntry placeholder="••••••••" placeholderTextColor={Colors.GRAY} onChangeText={(t) => setAuthData({...authData, newPassword: t})} />
                
                <Text style={styles.inputLabel}>CONFIRM NEW PASSWORD</Text>
                <TextInput style={styles.input} secureTextEntry placeholder="••••••••" placeholderTextColor={Colors.GRAY} onChangeText={(t) => setAuthData({...authData, confirmPassword: t})} />

                <Pressable onPress={submitPasswordReset} disabled={isSubmitting} style={styles.actionButton}>
                  <LinearGradient colors={[Colors.SCUDERIA_RED, Colors.RED_DIM]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.buttonGradient}>
                    {isSubmitting ? <ActivityIndicator color={Colors.WHITE} /> : <Text style={styles.buttonText}>COMMIT SECURE PASSWORD ➔</Text>}
                  </LinearGradient>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* ACCOUNTS REMOVAL SHIELD */}
      <Modal visible={deleteModalVisible} animationType="fade" transparent={true} statusBarTranslucent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.dangerModalContent}>
            <Text style={styles.dangerModalTitle}>WARNING</Text>
            <Text style={styles.dangerModalSub}>Are you sure you want to permanently delete your CarbonLap account? All fantasy points and telemetry history will be destroyed.</Text>
            
            <View style={styles.dangerModalActions}>
              <Pressable onPress={() => setDeleteModalVisible(false)} style={styles.cancelButton}>
                <Text style={styles.cancelText}>CANCEL</Text>
              </Pressable>
              <Pressable onPress={submitAccountDeletion} disabled={isSubmitting} style={styles.confirmDeleteButton}>
                {isSubmitting ? <ActivityIndicator color={Colors.WHITE} /> : <Text style={styles.confirmDeleteText}>PURGE DATA</Text>}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.OLED_BLACK },
  scrollContent: { padding: 20, paddingTop: 60, paddingBottom: 100 },
  sectionHeader: { color: Colors.GRAY, fontSize: 10, fontWeight: '800', letterSpacing: 2, marginBottom: 12, marginTop: 10 },
  
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    height: 120,
    marginBottom: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    paddingHorizontal: 20,
    position: 'relative'
  },
  cardContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: '100%' },
  cardTitle: { color: Colors.WHITE, fontSize: 22, fontWeight: '900', fontStyle: 'italic', letterSpacing: 1 },
  cardSubtitle: { color: Colors.LIGHT_GRAY, fontSize: 10, fontWeight: '700', letterSpacing: 1, marginTop: 4 },
  
  bgText: { position: 'absolute', right: -10, bottom: -15, color: 'rgba(255, 255, 255, 0.03)', fontSize: 100, fontWeight: '900', fontStyle: 'italic', zIndex: 0 },
  bgImage: { position: 'absolute', right: -15, top: 12, width: 140, height: 140, opacity: 0.3, resizeMode: 'contain', zIndex: 0 },
  
  dangerZone: { marginTop: 40, alignItems: 'center', gap: 16 },
  logoutButton: { paddingVertical: 12, paddingHorizontal: 30, borderRadius: 8, borderWidth: 1, borderColor: '#333' },
  logoutText: { color: Colors.GRAY, fontSize: 12, fontWeight: '800', letterSpacing: 2 },
  deleteButton: { paddingVertical: 12 },
  deleteText: { color: Colors.SCUDERIA_RED, fontSize: 10, fontWeight: '700', letterSpacing: 1 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end', height: '100%', width: '100%' },
  modalContent: { backgroundColor: Colors.CARD_BG, borderTopWidth: 1, borderTopColor: Colors.GLASS_BORDER, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, height: '82%', paddingBottom: 45 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  modalTitle: { color: Colors.WHITE, fontSize: 15, fontWeight: '900', fontStyle: 'italic', letterSpacing: 2 },
  closeText: { color: Colors.GRAY, fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  
  modalForm: { gap: 16 },
  inputLabel: { fontSize: 9, color: Colors.LIGHT_GRAY, fontWeight: '700', letterSpacing: 2, marginBottom: 8 },
  input: { backgroundColor: '#111', borderWidth: 1, borderColor: Colors.GLASS_BORDER, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 14, color: Colors.WHITE, fontSize: 16, fontWeight: '600', marginBottom: 16 },
  
  passwordResetTriggerButton: { paddingVertical: 6, marginBottom: 14, alignSelf: 'flex-start' },
  passwordResetTriggerText: { color: Colors.GRAY, fontSize: 11, fontWeight: '800', letterSpacing: 1, fontStyle: 'italic' },

  actionButton: { borderRadius: 8, overflow: 'hidden', marginTop: 10 },
  buttonGradient: { paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: Colors.WHITE, fontSize: 14, fontWeight: '900', letterSpacing: 4, fontStyle: 'italic' },

  pickerItemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: '#1A1A1A', paddingHorizontal: 20, paddingVertical: 16, borderRadius: 12 },
  pickerItemRowActive: { borderColor: Colors.SCUDERIA_RED, backgroundColor: 'rgba(255,40,0,0.03)' },
  pickerItemMainText: { color: Colors.WHITE, fontSize: 15, fontWeight: '900', fontStyle: 'italic' },
  pickerItemSubText: { color: Colors.GRAY, fontSize: 10, fontWeight: '700', marginTop: 4, letterSpacing: 0.5 },
  pickerInlineThumbnail: { width: 50, height: 50, resizeMode: 'contain', opacity: 0.8 },
  pickerInlineThumbnailTeam: { width: 45, height: 45, resizeMode: 'contain', opacity: 0.6 },

  dangerModalContent: { backgroundColor: '#150505', margin: 20, padding: 24, borderRadius: 16, borderWidth: 1, borderColor: Colors.SCUDERIA_RED, marginBottom: '50%' },
  dangerModalTitle: { color: Colors.SCUDERIA_RED, fontSize: 20, fontWeight: '900', fontStyle: 'italic', letterSpacing: 2, marginBottom: 8 },
  dangerModalSub: { color: Colors.LIGHT_GRAY, fontSize: 12, lineHeight: 18, fontWeight: '500', marginBottom: 24 },
  dangerModalActions: { flexDirection: 'row', gap: 12 },
  cancelButton: { flex: 1, paddingVertical: 14, backgroundColor: '#222', borderRadius: 8, alignItems: 'center' },
  cancelText: { color: Colors.WHITE, fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  confirmDeleteButton: { flex: 1, paddingVertical: 14, backgroundColor: Colors.SCUDERIA_RED, borderRadius: 8, alignItems: 'center' },
  confirmDeleteText: { color: Colors.WHITE, fontSize: 12, fontWeight: '900', letterSpacing: 1 },
});
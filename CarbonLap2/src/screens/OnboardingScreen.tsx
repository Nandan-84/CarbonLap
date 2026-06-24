// src/screens/OnboardingScreen.tsx
import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable, ScrollView, Platform, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CountryPicker, { Country, DARK_THEME } from 'react-native-country-picker-modal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';

interface OnboardingProps {
  onComplete: (data: any) => void;
}

export function OnboardingScreen({ onComplete }: OnboardingProps) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(1);
  
  // --- FORM DATA STATE ---
  const [bio, setBio] = useState({ name: '', age: '', gender: 'M', country: 'IN' });
  const [countryName, setCountryName] = useState('India');
  const [favDriver, setFavDriver] = useState<string | null>(null);
  const [favTeam, setFavTeam] = useState<string | null>(null);
  const [fantasyDriver, setFantasyDriver] = useState<string | null>(null);
  const [fantasyTeamName, setFantasyTeamName] = useState('');

  const [showPicker, setShowPicker] = useState(false);

  // 🏁 2026 Grid Drivers mapped exactly to image_eefc0f.png
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

  // 🏁 2026 Teams mapped exactly to image_eefbed.png and text specifications
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

  const handleCountrySelect = (country: Country) => {
    setBio({ ...bio, country: country.cca2 });
    setCountryName(country.name as string);
    setShowPicker(false);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: step === 1 ? '33.3%' : step === 2 ? '66.6%' : '100%' }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* ================= STEP 1: BIO DATA ================= */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>DRIVER BIO</Text>
            <Text style={styles.subtitle}>Enter your profile parameters to provision your global racing credential.</Text>
            
            <View style={styles.form}>
              <Text style={styles.label}>FULL NAME</Text>
              <TextInput style={styles.input} value={bio.name} onChangeText={(t) => setBio({...bio, name: t})} placeholder="Driver Name" placeholderTextColor={Colors.GRAY} />
              
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>AGE</Text>
                  <TextInput style={styles.input} keyboardType="numeric" value={bio.age} onChangeText={(t) => setBio({...bio, age: t})} placeholder="25" placeholderTextColor={Colors.GRAY} />
                </View>
                
                <View style={{ flex: 2 }}>
                  <Text style={styles.label}>GENDER</Text>
                  <View style={styles.genderSelectorRow}>
                    {['M', 'F', 'OTHER'].map((g) => (
                      <Pressable 
                        key={g} 
                        onPress={() => setBio({...bio, gender: g})}
                        style={[styles.genderButton, bio.gender === g && styles.genderButtonActive]}
                      >
                        <Text style={[styles.genderButtonText, bio.gender === g && styles.genderButtonTextActive]}>
                          {g === 'OTHER' ? 'N/A' : g}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </View>

              <Text style={styles.label}>RACING LICENSE REGION</Text>
              <Pressable onPress={() => setShowPicker(true)} style={styles.pickerTrigger}>
                <View style={styles.pickerLeft}>
                  <CountryPicker
                    theme={{ ...DARK_THEME, backgroundColor: '#111111', itemHeight: 55 }}
                    withFilter withFlag withAlphaFilter={false}
                    visible={showPicker}
                    countryCode={bio.country as any}
                    onSelect={handleCountrySelect}
                    onClose={() => setShowPicker(false)}
                  />
                  <Text style={styles.pickerText}>{countryName} ({bio.country})</Text>
                </View>
                <Text style={styles.pickerArrow}>➔</Text>
              </Pressable>
            </View>

            <Pressable onPress={() => setStep(2)} style={styles.actionButton}>
              <LinearGradient colors={[Colors.SCUDERIA_RED, Colors.RED_DIM]} start={{ x:0, y:0 }} end={{ x:1, y:0 }} style={styles.buttonGradient}>
                <Text style={styles.buttonText}>PROCEED TO SELECTIONS ➔</Text>
              </LinearGradient>
            </Pressable>
          </View>
        )}

        {/* ================= STEP 2: FAVORITES SELECTION ================= */}
        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>FAVORITE GRID PARAMS</Text>
            <Text style={styles.subtitle}>Select your primary support affiliation profile flags from the active registry.</Text>
            
            <Text style={styles.subSectionHeader}>FAVORITE DRIVER</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {drivers.map((d) => {
                const isSelected = favDriver === d.id;
                return (
                  <Pressable key={d.id} onPress={() => setFavDriver(d.id)} style={[styles.scrollCard, isSelected && styles.cardActive]}>
                    <Image source={d.image} style={styles.cardImageOverlay} resizeMode="contain" />
                    <View style={styles.cardTextContainer}>
                      <Text style={styles.cardNumber}>#{d.number}</Text>
                      <Text style={styles.cardMainText}>{d.name}</Text>
                      <Text style={styles.cardSubText}>{d.team}</Text>
                    </View>
                    {isSelected && <View style={styles.checkmarkBadge}><Text style={styles.checkmarkText}>✓</Text></View>}
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text style={styles.subSectionHeader}>FAVORITE TEAM</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {teams.map((t) => {
                const isSelected = favTeam === t.id;
                return (
                  <Pressable key={t.id} onPress={() => setFavTeam(t.id)} style={[styles.scrollCard, isSelected && styles.cardActive]}>
                    <Image source={t.image} style={styles.cardImageOverlayTeam} resizeMode="contain" />
                    <View style={styles.cardTextContainer}>
                      <Text style={styles.cardMainText}>{t.name}</Text>
                      <Text style={styles.cardSubText}>{t.hq}</Text>
                    </View>
                    {isSelected && <View style={styles.checkmarkBadge}><Text style={styles.checkmarkText}>✓</Text></View>}
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={styles.navigationButtonsRow}>
              <Pressable onPress={() => setStep(1)} style={styles.backButton}>
                <Text style={styles.backButtonText}>BACK</Text>
              </Pressable>
              <Pressable 
                onPress={() => favDriver && favTeam ? setStep(3) : alert('Please select both a favorite driver and team.')} 
                style={[styles.actionButton, { flex: 2, marginTop: 0 }]}
              >
                <LinearGradient colors={[Colors.SCUDERIA_RED, Colors.RED_DIM]} start={{ x:0, y:0 }} end={{ x:1, y:0 }} style={styles.buttonGradient}>
                  <Text style={styles.buttonText}>CONFIG FANTASY ➔</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        )}

        {/* ================= STEP 3: FANTASY SELECTION ================= */}
        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>FANTASY STRATEGY</Text>
            
            <View style={styles.descBox}>
              <Text style={styles.descTitle}>THE NET-ZERO CHAMPIONSHIP LAWS</Text>
              <Text style={styles.descText}>
                Points are scored inversely to your asset load profile. Your fantasy objective is targeting the <Text style={{ color: Colors.NEON_CYAN, fontWeight: '800' }}>LOWEST CARBON EMISSION PROFILE</Text> across live race session telemetries. Accumulations map down straight to the global parallel WDC & WCC standings, deciding the definitive Emission Champion.
              </Text>
            </View>

            <View style={styles.form}>
              <Text style={styles.label}>FANTASY TEAM NAME</Text>
              <TextInput 
                style={styles.input} 
                value={fantasyTeamName} 
                onChangeText={setFantasyTeamName} 
                placeholder="e.g. Speed Demons" 
                placeholderTextColor={Colors.GRAY} 
              />
            </View>

            <Text style={styles.subSectionHeader}>SELECT FANTASY DRIVER (CONSTRUCTOR LOCKS AUTOMATICALLY)</Text>
            <View style={styles.verticalGrid}>
              {drivers.map((d) => {
                const isSelected = fantasyDriver === d.id;
                return (
                  <Pressable key={d.id} onPress={() => setFantasyDriver(d.id)} style={[styles.verticalCard, isSelected && styles.cardActive]}>
                    <Image source={d.image} style={styles.verticalCardImageOverlay} resizeMode="contain" />
                    <View style={{ zIndex: 2 }}>
                      <Text style={styles.verticalCardTitle}>{d.name}</Text>
                      <Text style={styles.verticalCardSub}>{d.team}</Text>
                    </View>
                    <Text style={styles.verticalCardNumber}>#{d.number}</Text>
                    {isSelected && <View style={styles.checkmarkBadge}><Text style={styles.checkmarkText}>✓</Text></View>}
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.navigationButtonsRow}>
              <Pressable onPress={() => setStep(2)} style={styles.backButton}>
                <Text style={styles.backButtonText}>BACK</Text>
              </Pressable>
              <Pressable 
                onPress={() => {
                  if (!fantasyTeamName.trim()) return alert('Please enter a Fantasy Team Name.');
                  if (!fantasyDriver) return alert('Please lock in your active Fantasy selection.');
                  onComplete({
                    name: bio.name,
                    age: bio.age,
                    gender: bio.gender,
                    country: bio.country,
                    favDriver: favDriver,
                    favTeam: favTeam,
                    fantasyDriver: fantasyDriver,
                    fantasyTeamName: fantasyTeamName.trim()
                  });
                }} 
                style={[styles.actionButton, { flex: 2, marginTop: 0 }]}
              >
                <LinearGradient colors={[Colors.SCUDERIA_RED, Colors.RED_DIM]} start={{ x:0, y:0 }} end={{ x:1, y:0 }} style={styles.buttonGradient}>
                  <Text style={styles.buttonText}>LOCK IN & START ENGINE ➔</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.OLED_BLACK },
  progressContainer: { height: 4, backgroundColor: '#1A1A1A', width: '100%' },
  progressBar: { height: '100%', backgroundColor: Colors.SCUDERIA_RED },
  scrollContent: { padding: 24, paddingBottom: 60 },
  stepContainer: { gap: 24 },
  title: { color: Colors.WHITE, fontSize: 28, fontWeight: '900', fontStyle: 'italic', letterSpacing: 2 },
  subtitle: { color: Colors.GRAY, fontSize: 12, lineHeight: 18, fontWeight: '500' },
  form: { gap: 16 },
  label: { fontSize: 9, color: Colors.LIGHT_GRAY, fontWeight: '700', letterSpacing: 2 },
  input: { backgroundColor: '#111', borderWidth: 1, borderColor: Colors.GLASS_BORDER, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 14, color: Colors.WHITE, fontSize: 16, fontWeight: '600' },
  
  genderSelectorRow: { flexDirection: 'row', backgroundColor: '#111', borderWidth: 1, borderColor: Colors.GLASS_BORDER, borderRadius: 8, padding: 4, height: 50 },
  genderButton: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 6 },
  genderButtonActive: { backgroundColor: Colors.SCUDERIA_RED },
  genderButtonText: { color: Colors.GRAY, fontSize: 13, fontWeight: '800' },
  genderButtonTextActive: { color: Colors.WHITE },

  pickerTrigger: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#111', borderWidth: 1, borderColor: Colors.GLASS_BORDER, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 14, height: 52 },
  pickerLeft: { flexDirection: 'row', alignItems: 'center', gap: 0, marginTop: Platform.OS === 'android' ? -8 : 0 },
  pickerText: { color: Colors.WHITE, fontSize: 15, fontWeight: '600', letterSpacing: 0.5, marginLeft: 10 },
  pickerArrow: { color: Colors.GRAY, fontSize: 12 },

  subSectionHeader: { color: Colors.WHITE, fontSize: 12, fontWeight: '900', letterSpacing: 2, fontStyle: 'italic', marginTop: 10, borderLeftWidth: 3, borderLeftColor: Colors.SCUDERIA_RED, paddingLeft: 8 },
  horizontalScroll: { flexDirection: 'row', marginTop: 4, paddingBottom: 10 },
  
  scrollCard: { width: 170, backgroundColor: '#111', borderWidth: 1, borderColor: Colors.GLASS_BORDER, borderRadius: 12, marginRight: 12, height: 115, overflow: 'hidden', position: 'relative' },
  cardTextContainer: { padding: 16, zIndex: 2, height: '100%', justifyContent: 'center' },
  cardImageOverlay: { position: 'absolute', right: -15, bottom: -10, width: 105, height: 105, opacity: 0.25 },
  cardImageOverlayTeam: { position: 'absolute', right: -10, bottom: -5, width: 90, height: 90, opacity: 0.15 },
  
  cardNumber: { color: 'rgba(255,255,255,0.06)', fontSize: 36, fontWeight: '900', position: 'absolute', top: 2, left: 10, fontStyle: 'italic' },
  cardMainText: { color: Colors.WHITE, fontSize: 13, fontWeight: '900', fontStyle: 'italic', letterSpacing: 0.5 },
  cardSubText: { color: Colors.GRAY, fontSize: 9, fontWeight: '700', marginTop: 4, letterSpacing: 0.5 },
  
  cardActive: { borderColor: Colors.SCUDERIA_RED, backgroundColor: 'rgba(255, 40, 0, 0.04)' },
  checkmarkBadge: { position: 'absolute', top: 10, right: 10, backgroundColor: Colors.SCUDERIA_RED, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', zIndex: 3 },
  checkmarkText: { color: Colors.WHITE, fontSize: 11, fontWeight: '900' },

  descBox: { backgroundColor: '#05120f', borderWidth: 1, borderColor: 'rgba(0,255,255,0.15)', padding: 16, borderRadius: 12 },
  descTitle: { color: Colors.NEON_CYAN, fontSize: 11, fontWeight: '900', letterSpacing: 2, fontStyle: 'italic', marginBottom: 6 },
  descText: { color: Colors.LIGHT_GRAY, fontSize: 11, lineHeight: 17, fontWeight: '500' },

  verticalGrid: { gap: 10 },
  verticalCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111', borderWidth: 1, borderColor: Colors.GLASS_BORDER, borderRadius: 12, paddingHorizontal: 20, height: 75, overflow: 'hidden', position: 'relative' },
  verticalCardImageOverlay: { position: 'absolute', right: 40, top: 0, width: 90, height: 90, opacity: 0.25, zIndex: 1 },
  verticalCardTitle: { color: Colors.WHITE, fontSize: 15, fontWeight: '900', fontStyle: 'italic' },
  verticalCardSub: { color: Colors.GRAY, fontSize: 9, fontWeight: '700', marginTop: 3, letterSpacing: 0.5 },
  verticalCardNumber: { color: 'rgba(255,255,255,0.07)', fontSize: 26, fontWeight: '900', fontStyle: 'italic', zIndex: 2 },

  navigationButtonsRow: { flexDirection: 'row', gap: 12, marginTop: 10 },
  backButton: { flex: 1, backgroundColor: '#161616', borderWidth: 1, borderColor: '#333', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  backButtonText: { color: Colors.GRAY, fontSize: 12, fontWeight: '800', letterSpacing: 2 },
  actionButton: { borderRadius: 8, overflow: 'hidden', marginTop: 20 },
  buttonGradient: { paddingVertical: 16, alignItems: 'center', justifyContent: 'center', width: '100%' },
  buttonText: { color: Colors.WHITE, fontSize: 13, fontWeight: '900', letterSpacing: 4, fontStyle: 'italic', textAlign: 'center', paddingLeft: 4 }, // paddingLeft offsets the letterSpacing gap
});
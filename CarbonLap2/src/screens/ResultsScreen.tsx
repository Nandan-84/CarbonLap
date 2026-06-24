// src/screens/ResultsScreen.tsx
import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, Platform } from 'react-native';
import { Colors } from '../theme/colors';

type SubTab = 'ECO' | 'WDC' | 'WCC';

export function ResultsScreen() {
  const [season, setSeason] = useState('2026');
  const [activeTab, setActiveTab] = useState<SubTab>('ECO');

  // Live Mock Data Pipeline reflective of current seasonal performance
  const ecoStandings = [
    { rank: 1, name: 'KIMI ANTONELLI', team: 'MERCEDES', points: 1560 },
    { rank: 2, name: 'LEWIS HAMILTON', team: 'FERRARI', points: 1450 },
    { rank: 3, name: 'GEORGE RUSSELL', team: 'MERCEDES', points: 1410 },
    { rank: 4, name: 'CHARLES LECLERC', team: 'FERRARI', points: 1250 },
    { rank: 5, name: 'LANDO NORRIS', team: 'MCLAREN', points: 1190 },
    { rank: 6, name: 'OSCAR PIASTRI', team: 'MCLAREN', points: 1120 },
    { rank: 7, name: 'MAX VERSTAPPEN', team: 'RED BULL RACING', points: 950 },
    { rank: 8, name: 'PIERRE GASLY', team: 'ALPINE', points: 810 },
    { rank: 9, name: 'ISACK HADJAR', team: 'RED BULL RACING', points: 740 },
    { rank: 10, name: 'LIAM LAWSON', team: 'RACING BULLS', points: 680 },
    { rank: 11, name: 'OLIVER BEARMAN', team: 'HAAS', points: 580 },
    { rank: 12, name: 'FRANCO COLAPINTO', team: 'ALPINE', points: 560 },
    { rank: 13, name: 'ARVID LINDBLAD', team: 'RACING BULLS', points: 530 },
    { rank: 14, name: 'CARLOS SAINZ', team: 'WILLIAMS', points: 460 },
    { rank: 15, name: 'ALEX ALBON', team: 'WILLIAMS', points: 450 },
    { rank: 16, name: 'ESTEBAN OCON', team: 'HAAS', points: 330 },
    { rank: 17, name: 'GABRIEL BORTOLETO', team: 'AUDI', points: 220 },
    { rank: 18, name: 'FERNANDO ALONSO', team: 'ASTON MARTIN', points: 210 },
    { rank: 19, name: 'NICO HULKENBERG', team: 'AUDI', points: 100 },
    { rank: 20, name: 'VALTTERI BOTTAS', team: 'CADILLAC', points: 80 },
    { rank: 21, name: 'SERGIO PEREZ', team: 'CADILLAC', points: 60 },
    { rank: 22, name: 'LANCE STROLL', team: 'ASTON MARTIN', points: 50 },
  ];

  const wdcStandings = [
    { rank: 1, name: 'KIMI ANTONELLI', team: 'MERCEDES', points: 156 },
    { rank: 2, name: 'LEWIS HAMILTON', team: 'FERRARI', points: 115 },
    { rank: 3, name: 'GEORGE RUSSELL', team: 'MERCEDES', points: 110 },
    { rank: 4, name: 'CHARLES LECLERC', team: 'FERRARI', points: 75 },
    { rank: 5, name: 'LANDO NORRIS', team: 'MCLAREN', points: 73 },
    { rank: 6, name: 'OSCAR PIASTRI', team: 'MCLAREN', points: 68 },
    { rank: 7, name: 'MAX VERSTAPPEN', team: 'RED BULL RACING', points: 55 },
    { rank: 8, name: 'PIERRE GASLY', team: 'ALPINE', points: 41 },
    { rank: 9, name: 'ISACK HADJAR', team: 'RED BULL RACING', points: 34 },
    { rank: 10, name: 'LIAM LAWSON', team: 'RACING BULLS', points: 28 },
    { rank: 11, name: 'OLIVER BEARMAN', team: 'HAAS', points: 18 },
    { rank: 12, name: 'FRANCO COLAPINTO', team: 'ALPINE', points: 16 },
    { rank: 13, name: 'ARVID LINDBLAD', team: 'RACING BULLS', points: 13 },
    { rank: 14, name: 'CARLOS SAINZ', team: 'WILLIAMS', points: 6 },
    { rank: 15, name: 'ALEX ALBON', team: 'WILLIAMS', points: 5 },
    { rank: 16, name: 'ESTEBAN OCON', team: 'HAAS', points: 3 },
    { rank: 17, name: 'GABRIEL BORTOLETO', team: 'AUDI', points: 2 },
    { rank: 18, name: 'FERNANDO ALONSO', team: 'ASTON MARTIN', points: 1 },
    { rank: 19, name: 'NICO HULKENBERG', team: 'AUDI', points: 0 },
    { rank: 20, name: 'VALTTERI BOTTAS', team: 'CADILLAC', points: 0 },
    { rank: 21, name: 'SERGIO PEREZ', team: 'CADILLAC', points: 0 },
    { rank: 22, name: 'LANCE STROLL', team: 'ASTON MARTIN', points: 0 },
  ];

  const wccStandings = [
    { rank: 1, name: 'MERCEDES', hq: 'Brackley, UK', points: 262 },
    { rank: 2, name: 'FERRARI', hq: 'Maranello, Italy', points: 190 },
    { rank: 3, name: 'MCLAREN', hq: 'Woking, UK', points: 141 },
    { rank: 4, name: 'RED BULL RACING', hq: 'Milton Keynes, UK', points: 89 },
    { rank: 5, name: 'ALPINE', hq: 'Enstone, UK', points: 57 },
    { rank: 6, name: 'RACING BULLS', hq: 'Faenza, Italy', points: 41 },
    { rank: 7, name: 'HAAS', hq: 'Kannapolis, USA', points: 21 },
    { rank: 8, name: 'WILLIAMS', hq: 'Grove, UK', points: 11 },
    { rank: 9, name: 'AUDI', hq: 'Hinwil, Switzerland', points: 2 },
    { rank: 10, name: 'ASTON MARTIN', hq: 'Silverstone, UK', points: 1 },
    { rank: 11, name: 'CADILLAC', hq: 'Fishers, USA', points: 0 },
  ];

  return (
    <View style={styles.container}>
      {/* SEASON ENGINE SELECTOR HEADER */}
      <View style={styles.dropdownHeaderZone}>
        <Text style={styles.controlLabel}>ACTIVE ENGINE TRACKING REGISTRY</Text>
        <View style={styles.dropdownContainer}>
          <Text style={styles.dropdownText}>🏆 SEASON: {season}</Text>
          <Text style={styles.dropdownArrow}>▼</Text>
        </View>
      </View>

      {/* THREE-TIER SUB-NAVIGATION ARCHITECTURE */}
      <View style={styles.tabBarDeck}>
        {(['ECO', 'WDC', 'WCC'] as SubTab[]).map((tab) => (
          <Pressable 
            key={tab} 
            onPress={() => setActiveTab(tab)} 
            style={[styles.tabAnchor, activeTab === tab && styles.tabAnchorActive]}
          >
            <Text style={[styles.tabAnchorText, activeTab === tab && styles.tabAnchorTextActive]}>
              {tab === 'ECO' ? 'ECOPOINTS' : tab === 'WDC' ? 'DRIVERS' : 'CONSTRUCTORS'}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* RENDER ACTIVE TIMING REGISTRY TABLE */}
      <ScrollView contentContainerStyle={styles.tableBody} showsVerticalScrollIndicator={false}>
        {activeTab === 'ECO' && ecoStandings.map((row) => (
          <View key={row.rank} style={styles.tableRow}>
            <View style={styles.leftMetrics}>
              <Text style={styles.rankMarker}>#{row.rank}</Text>
              <View>
                <Text style={styles.driverNameText}>{row.name}</Text>
                <Text style={styles.teamSubText}>{row.team}</Text>
              </View>
            </View>
            <Text style={[styles.pointsValue, { color: Colors.NEON_CYAN }]}>{row.points} EP</Text>
          </View>
        ))}

        {activeTab === 'WDC' && wdcStandings.map((row) => (
          <View key={row.rank} style={styles.tableRow}>
            <View style={styles.leftMetrics}>
              <Text style={styles.rankMarker}>#{row.rank}</Text>
              <View>
                <Text style={styles.driverNameText}>{row.name}</Text>
                <Text style={styles.teamSubText}>{row.team}</Text>
              </View>
            </View>
            <Text style={styles.pointsValue}>{row.points} PTS</Text>
          </View>
        ))}

        {activeTab === 'WCC' && wccStandings.map((row) => (
          <View key={row.rank} style={styles.tableRow}>
            <View style={styles.leftMetrics}>
              <Text style={styles.rankMarker}>#{row.rank}</Text>
              <View>
                <Text style={styles.driverNameText}>{row.name}</Text>
                <Text style={styles.teamSubText}>{row.hq}</Text>
              </View>
            </View>
            <Text style={styles.pointsValue}>{row.points} PTS</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.OLED_BLACK },
  dropdownHeaderZone: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#111' },
  controlLabel: { color: Colors.GRAY, fontSize: 8, fontWeight: '800', letterSpacing: 1.5, marginBottom: 6 },
  dropdownContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111', borderWidth: 1, borderColor: Colors.GLASS_BORDER, padding: 12, borderRadius: 8 },
  dropdownText: { color: Colors.WHITE, fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },
  dropdownArrow: { color: Colors.GRAY, fontSize: 10 },
  tabBarDeck: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 14, gap: 6 },
  tabAnchor: { flex: 1, paddingVertical: 12, alignItems: 'center', backgroundColor: '#0A0A0A', borderWidth: 1, borderColor: '#161616', borderRadius: 6 },
  tabAnchorActive: { backgroundColor: '#111', borderColor: Colors.GLASS_BORDER, borderBottomWidth: 2, borderBottomColor: Colors.SCUDERIA_RED },
  tabAnchorText: { color: Colors.GRAY, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  tabAnchorTextActive: { color: Colors.WHITE },
  tableBody: { padding: 20, gap: 12 },
  tableRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0D0D0D', borderWidth: 1, borderColor: 'rgba(255,255,255,0.03)', paddingHorizontal: 16, paddingVertical: 16, borderRadius: 12 },
  leftMetrics: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  rankMarker: { color: Colors.GRAY, fontSize: 14, fontWeight: '900', fontStyle: 'italic', width: 30 },
  driverNameText: { color: Colors.WHITE, fontSize: 14, fontWeight: '900', fontStyle: 'italic', letterSpacing: 0.5 },
  teamSubText: { color: Colors.GRAY, fontSize: 9, fontWeight: '700', marginTop: 2, letterSpacing: 0.5 },
  pointsValue: { color: Colors.WHITE, fontSize: 13, fontWeight: '900', fontStyle: 'italic' }
});
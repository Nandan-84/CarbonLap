// src/screens/LiveTelemetryScreen.tsx
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../theme/colors';
import { API_F1_URL } from '../config/api';

const DRIVER_MAP: any = {
  'GR': 63, 'KA': 12, 'CL': 16, 'LH': 44, 'LN': 4, 'OP': 81, 'MV': 1, 'IH': 6,
  'PG': 10, 'FC': 43, 'LL': 30, 'AL': 24, 'EO': 31, 'OB': 87, 'CS': 55, 'AA': 23,
  'NH': 27, 'GB': 85, 'SP': 11, 'VB': 77, 'FA': 14, 'LS': 18
};

const DRIVER_NAMES: any = {
  63: 'GEORGE RUSSELL', 12: 'KIMI ANTONELLI', 16: 'CHARLES LECLERC', 44: 'LEWIS HAMILTON',
  4: 'LANDO NORRIS', 81: 'OSCAR PIASTRI', 1: 'MAX VERSTAPPEN', 6: 'ISACK HADJAR',
  10: 'PIERRE GASLY', 43: 'FRANCO COLAPINTO', 30: 'LIAM LAWSON', 24: 'ARVID LINDBLAD',
  31: 'ESTEBAN OCON', 87: 'OLIVER BEARMAN', 55: 'CARLOS SAINZ', 23: 'ALEXANDER ALBON',
  27: 'NICO HULKENBERG', 85: 'GABRIEL BORTOLETO', 11: 'SERGIO PEREZ', 77: 'VALTTERI BOTTAS',
  14: 'FERNANDO ALONSO', 18: 'LANCE STROLL'
};

const generateRealisticTelemetry = (length: number) => {
  const data = [];
  let speed = 0; // starts slow
  let gear = 1;
  let rpm = 4000;
  let throttle = 0;
  let totalEmission = 0;

  // Track state: 0=straight, 1=braking, 2=corner
  let state = 0;
  let stateTimer = 0;

  for (let i = 0; i < length; i++) {
    stateTimer--;
    if (stateTimer <= 0) {
      if (state === 0) { // Straight -> Braking
        state = 1;
        stateTimer = Math.floor(Math.random() * 3) + 2; // 2-4 seconds
      } else if (state === 1) { // Braking -> Corner
        state = 2;
        stateTimer = Math.floor(Math.random() * 5) + 3; // 3-7 seconds
      } else if (state === 2) { // Corner -> Straight
        state = 0;
        stateTimer = Math.floor(Math.random() * 15) + 10; // 10-24 seconds
      }
    }

    // Apply physics based on state
    if (state === 0) { // Straight
      throttle = 100;
      speed += 10 + Math.random() * 5;
      if (speed > 330) speed = 330 - Math.random() * 5;
    } else if (state === 1) { // Braking
      throttle = 0;
      speed -= 40 + Math.random() * 10;
      if (speed < 80) speed = 80 + Math.random() * 10;
    } else if (state === 2) { // Corner
      throttle = 40 + Math.random() * 20;
      speed += (Math.random() * 10 - 5);
      if (speed < 80) speed = 80;
      if (speed > 160) speed = 160;
    }

    // Calculate gear based on speed
    if (speed < 100) gear = 2;
    else if (speed < 140) gear = 3;
    else if (speed < 180) gear = 4;
    else if (speed < 220) gear = 5;
    else if (speed < 260) gear = 6;
    else if (speed < 300) gear = 7;
    else gear = 8;

    // RPM based on speed within gear band
    let gearMinSpeed = (gear - 1) * 40 + 20;
    let gearMaxSpeed = gear * 40 + 20;
    if (gear === 2) { gearMinSpeed = 60; gearMaxSpeed = 100; }
    if (gear === 8) { gearMinSpeed = 300; gearMaxSpeed = 350; }

    let speedFraction = (speed - gearMinSpeed) / (gearMaxSpeed - gearMinSpeed);
    if (speedFraction < 0) speedFraction = 0;
    if (speedFraction > 1) speedFraction = 1;

    rpm = 8000 + speedFraction * 4000;
    rpm += Math.random() * 200 - 100; // Small noise
    if (throttle === 0 && rpm > 10000) rpm -= 1000;

    // Calculate emissions
    let currentEmission = (throttle / 100) * 1.5 + (rpm / 12000) * 0.5 + Math.random() * 0.2;
    if (throttle === 0) currentEmission = 0.2;
    totalEmission += currentEmission;

    data.push({
      speed: speed,
      rpm: rpm,
      gear: gear,
      throttle: throttle,
      currentEmission: currentEmission.toFixed(2),
      totalEmission: totalEmission.toFixed(2)
    });
  }
  return data;
};

export default function LiveTelemetryScreen({ route, navigation, userProfile, globalLap }: any) {
  const { sessionKey } = route.params || { sessionKey: 9158 };

  const driverCode = userProfile?.fantasyDriverId || 'CL';
  const driverNum = DRIVER_MAP[driverCode] || 16;
  const teamName = userProfile?.fantasyTeamName || 'UNNAMED TEAM';

  const [loading, setLoading] = useState(true);
  const [telemetry, setTelemetry] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isReconnecting, setIsReconnecting] = useState(false);

  // TC_041: Auto-reconnect simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReconnecting(true);
      setTimeout(() => setIsReconnecting(false), 2500);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const lapCount = globalLap || 14;
  const isConcluded = lapCount >= 66;

  const [liveDash, setLiveDash] = useState({ speed: 0, gear: 1, rpm: 4000, throttle: 0 });

  const physicsRef = useRef({
    speed: 80,
    gear: 2,
    rpm: 4000,
    throttle: 0,
    state: 0, 
    stateTimer: 0
  });

  useEffect(() => {
    if (loading || isConcluded) return;

    const interval = setInterval(() => {
      let p = physicsRef.current;
      p.stateTimer--;

      if (p.stateTimer <= 0) {
        if (p.state === 0) { // straight -> braking
          p.state = 1; p.stateTimer = Math.floor(Math.random() * 5) + 5; 
        } else if (p.state === 1) { // braking -> corner
          p.state = 2; p.stateTimer = Math.floor(Math.random() * 15) + 10; 
        } else if (p.state === 2) { // corner -> straight
          p.state = 0; p.stateTimer = Math.floor(Math.random() * 40) + 30; 
        }
      }

      if (p.state === 0) { 
        p.throttle = Math.min(100, p.throttle + 15);
        p.speed += (p.throttle / 100) * 3 + Math.random() * 0.5;
        if (p.speed > 335) p.speed = 335 - Math.random() * 2;
      } else if (p.state === 1) { 
        p.throttle = Math.max(0, p.throttle - 40);
        p.speed -= 12 + Math.random() * 4;
        if (p.speed < 80) p.speed = 80 + Math.random() * 5;
      } else if (p.state === 2) { 
        p.throttle = 30 + Math.random() * 30;
        p.speed += (Math.random() * 3 - 1.5);
        if (p.speed < 80) p.speed = 80;
        if (p.speed > 160) p.speed = 160;
      }

      if (p.speed < 100) p.gear = 2;
      else if (p.speed < 140) p.gear = 3;
      else if (p.speed < 180) p.gear = 4;
      else if (p.speed < 220) p.gear = 5;
      else if (p.speed < 260) p.gear = 6;
      else if (p.speed < 300) p.gear = 7;
      else p.gear = 8;

      let gearMin = (p.gear - 1) * 40 + 20;
      let gearMax = p.gear * 40 + 20;
      if (p.gear === 2) { gearMin = 60; gearMax = 100; }
      if (p.gear === 8) { gearMin = 290; gearMax = 350; }
      
      let fraction = (p.speed - gearMin) / (gearMax - gearMin);
      fraction = Math.max(0, Math.min(1, fraction));
      
      let targetRpm = 8000 + fraction * 4000;
      p.rpm = p.rpm + (targetRpm - p.rpm) * 0.4 + (Math.random() * 200 - 100);
      
      if (p.throttle === 0 && p.rpm > 9000) p.rpm -= 600;

      setLiveDash({
        speed: p.speed,
        gear: p.gear,
        rpm: p.rpm,
        throttle: p.throttle
      });
      
    }, 100); 

    return () => clearInterval(interval);
  }, [loading, isConcluded]);

  const [competitors, setCompetitors] = useState<any[]>([]);

  useEffect(() => {
    // Generate competitors from ALL drivers
    const allDriverNums = Object.keys(DRIVER_NAMES).map(Number);
    const others = allDriverNums.filter(n => n !== driverNum);

    const generatedCompetitors = others.map(num => ({
      num,
      name: DRIVER_NAMES[num] || `DRIVER #${num}`,
      baseEmission: 2.0 + Math.random() * 1.5,
      rate: 0.012 + Math.random() * 0.015
    }));
    setCompetitors(generatedCompetitors);
  }, [driverNum]);

  useEffect(() => {
    let isMounted = true;
    const fetchTelemetry = async () => {
      try {
        const res = await fetch(`${API_F1_URL}/replay/${sessionKey}/${driverNum}`);
        if (!res.ok) throw new Error('Failed to fetch telemetry');
        const data = await res.json();

        if (isMounted) {
          if (data && data.telemetryTimeline && data.telemetryTimeline.length > 0) {
            setTelemetry(data.telemetryTimeline);
          } else {
            setTelemetry(generateRealisticTelemetry(1000));
          }
          setLoading(false);
        }
      } catch (error: any) {
        console.log("Telemetry fallback activated: OpenF1 API error or invalid session.", error.message);
        if (isMounted) {
          setTelemetry(generateRealisticTelemetry(1000));
          setLoading(false);
        }
      }
    };
    fetchTelemetry();

    return () => { isMounted = false; };
  }, [sessionKey, driverNum]);

  useEffect(() => {
    if (loading || telemetry.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev + 1;
        if (next >= telemetry.length) return prev;

        return next;
      });

      // Add dynamic shuffling/overtaking simulation by slightly adjusting competitor rates over time
      setCompetitors(prev => prev.map(comp => ({
        ...comp,
        rate: Math.max(0.005, comp.rate + (Math.random() * 0.004 - 0.002))
      })));
    }, 1000);

    return () => clearInterval(interval);
  }, [loading, telemetry]);

  const getSortedLeaderboard = () => {
    if (telemetry.length === 0) return [];

    const currentData = telemetry[currentIndex] || telemetry[0];
    const myTotal = parseFloat(currentData.totalEmission) || 0;

    const lb = competitors.map(comp => {
      const theirTotal = comp.baseEmission + (comp.rate * currentIndex);
      return { isMe: false, name: comp.name, total: theirTotal };
    });

    lb.push({
      isMe: true,
      name: DRIVER_NAMES[driverNum] || `DRIVER #${driverNum}`,
      total: myTotal
    });

    lb.sort((a, b) => a.total - b.total);
    return lb;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.SCUDERIA_RED} />
        <Text style={styles.loadingText}>ESTABLISHING SECURE TELEMETRY LINK...</Text>
      </View>
    );
  }

  if (isReconnecting) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.SCUDERIA_RED} />
        <Text style={styles.loadingText}>RECONNECTING TO TELEMETRY STREAM...</Text>
      </View>
    );
  }

  const rawData = telemetry[currentIndex] || telemetry[0];

  const currentData = isConcluded
    ? { speed: 0, gear: 0, rpm: 0, throttle: 0, currentEmission: 0, totalEmission: rawData?.totalEmission ?? 0 }
    : {
      speed: liveDash.speed,
      gear: liveDash.gear,
      rpm: liveDash.rpm,
      throttle: liveDash.throttle,
      currentEmission: rawData?.currentEmission ?? 0,
      totalEmission: rawData?.totalEmission ?? 0,
    };

  const liveLeaderboard = getSortedLeaderboard();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>➔ BACK</Text>
        </Pressable>
        <Text style={styles.headerTitle}>FANTASY TELEMETRY</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <View style={styles.teamStrip}>
          <View style={styles.teamHeaderRow}>
            <Text style={styles.teamLabel}>ACTIVE CONSTRUCTOR</Text>
            <View style={styles.lapBadge}>
              <Text style={styles.lapText}>LAP {lapCount} / 66</Text>
            </View>
          </View>
          <Text style={styles.teamName}>{teamName}</Text>
          <Text style={styles.driverTarget}>TRACKING: DRIVER #{driverNum}</Text>
        </View>

        <View style={styles.telemetryGrid}>
          <View style={styles.telemetryCard}>
            <Text style={styles.telemetryValue}>{Math.round(currentData.speed)}</Text>
            <Text style={styles.telemetryLabel}>KM/H</Text>
          </View>
          <View style={styles.telemetryCard}>
            <Text style={styles.telemetryValue}>{Math.round(currentData.gear)}</Text>
            <Text style={styles.telemetryLabel}>GEAR</Text>
          </View>
          <View style={styles.telemetryCard}>
            <Text style={styles.telemetryValue}>{Math.round(currentData.rpm)}</Text>
            <Text style={styles.telemetryLabel}>RPM</Text>
          </View>
          <View style={styles.telemetryCard}>
            <Text style={styles.telemetryValue}>{Math.round(currentData.throttle)}%</Text>
            <Text style={styles.telemetryLabel}>THROTTLE</Text>
          </View>
        </View>

        <LinearGradient colors={['#111', '#000']} style={styles.emissionsBox}>
          <Text style={styles.sectionHeader}>LIVE CARBON EMISSIONS (EST)</Text>
          <View style={styles.emissionRow}>
            <Text style={styles.emissionLabel}>CURRENT SPIKE</Text>
            <Text style={styles.emissionValueRed}>{currentData.currentEmission} KG</Text>
          </View>
          <View style={styles.emissionRow}>
            <Text style={styles.emissionLabel}>TOTAL ACCUMULATED</Text>
            <Text style={styles.emissionValueCyan}>{currentData.totalEmission} KG</Text>
          </View>
        </LinearGradient>

        <View style={styles.leaderboardContainer}>
          <Text style={styles.sectionHeader}>LIVE RACE ECO-LEADERBOARD</Text>

          <View style={{ height: 400, width: '100%' }}>
            <FlashList<any>
              data={liveLeaderboard}
              renderItem={({ item, index }) => (
                <View style={[styles.lbRow, item.isMe && styles.lbRowMe]}>
                  <Text style={[styles.lbPos, item.isMe && styles.textRed]}>P{index + 1}</Text>
                  <Text style={[styles.lbName, item.isMe && styles.textRed]}>{item.name}</Text>
                  <Text style={[styles.lbTotal, item.isMe && styles.textRed]}>{item.total.toFixed(2)} KG</Text>
                </View>
              )}
            />
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.OLED_BLACK },
  loadingContainer: { flex: 1, backgroundColor: Colors.OLED_BLACK, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: Colors.SCUDERIA_RED, marginTop: 20, fontSize: 12, fontWeight: '900', letterSpacing: 2 },

  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#222' },
  backBtn: { marginRight: 20 },
  backBtnText: { color: Colors.GRAY, fontSize: 12, fontWeight: '800' },
  headerTitle: { color: Colors.WHITE, fontSize: 20, fontWeight: '900', fontStyle: 'italic', letterSpacing: 1 },

  scroll: { padding: 20 },

  teamStrip: { backgroundColor: '#1a0505', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: Colors.SCUDERIA_RED, marginBottom: 25 },
  teamHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lapBadge: { backgroundColor: Colors.SCUDERIA_RED, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  lapText: { color: Colors.WHITE, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  teamLabel: { color: Colors.GRAY, fontSize: 10, fontWeight: '800', letterSpacing: 2 },
  teamName: { color: Colors.WHITE, fontSize: 22, fontWeight: '900', fontStyle: 'italic', marginTop: 8 },
  driverTarget: { color: Colors.SCUDERIA_RED, fontSize: 12, fontWeight: '700', marginTop: 4 },

  telemetryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 25 },
  telemetryCard: { width: '48%', backgroundColor: '#111', padding: 20, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#222' },
  telemetryValue: { color: Colors.WHITE, fontSize: 28, fontWeight: '900', fontVariant: ['tabular-nums'] },
  telemetryLabel: { color: Colors.GRAY, fontSize: 10, fontWeight: '800', letterSpacing: 2, marginTop: 4 },

  emissionsBox: { padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#333', marginBottom: 25 },
  sectionHeader: { color: Colors.WHITE, fontSize: 12, fontWeight: '900', letterSpacing: 2, fontStyle: 'italic', marginBottom: 15 },
  emissionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  emissionLabel: { color: Colors.GRAY, fontSize: 11, fontWeight: '800' },
  emissionValueRed: { color: Colors.SCUDERIA_RED, fontSize: 16, fontWeight: '900', fontVariant: ['tabular-nums'] },
  emissionValueCyan: { color: Colors.NEON_CYAN, fontSize: 16, fontWeight: '900', fontVariant: ['tabular-nums'] },

  leaderboardContainer: { backgroundColor: '#111', padding: 20, borderRadius: 12 },
  lbRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#222' },
  lbRowMe: { borderColor: Colors.SCUDERIA_RED, borderWidth: 1, paddingHorizontal: 10, borderRadius: 8, backgroundColor: 'rgba(255, 40, 0, 0.05)' },
  textRed: { color: Colors.SCUDERIA_RED },
  lbPos: { color: Colors.WHITE, fontSize: 14, fontWeight: '900', width: 30 },
  lbName: { color: Colors.LIGHT_GRAY, fontSize: 12, fontWeight: '800', flex: 1 },
  lbTotal: { color: Colors.NEON_CYAN, fontSize: 12, fontWeight: '700', fontVariant: ['tabular-nums'] },
});

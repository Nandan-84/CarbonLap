// src/screens/HomeScreen.tsx
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { API_USERS_URL, API_BASE_URL } from '../config/api';
import * as Haptics from 'expo-haptics';

const QUIZ_QUESTIONS = [
  { q: "Will your driver pit in the next 5 laps?", opts: ["YES", "NO"], ans: "NO" },
  { q: "What tire compound will be fitted next?", opts: ["HARD", "MEDIUM", "SOFT"], ans: "HARD" },
  { q: "Is an overtake likely in the upcoming DRS zone?", opts: ["YES", "NO"], ans: "YES" },
  { q: "Will there be a Safety Car in the next 10 laps?", opts: ["YES", "NO"], ans: "NO" },
  { q: "Will the next lap be a personal best?", opts: ["YES", "NO"], ans: "YES" },
  { q: "Will there be a Yellow Flag in Sector 2?", opts: ["YES", "NO"], ans: "NO" },
  { q: "Will the current race leader maintain P1 for the next 5 laps?", opts: ["YES", "NO"], ans: "YES" },
  { q: "Which constructor will have the fastest pit stop this race?", opts: ["RED BULL", "MCLAREN", "FERRARI", "OTHER"], ans: "RED BULL" },
  { q: "Will track temperatures drop by 2°C in the next 15 mins?", opts: ["YES", "NO"], ans: "NO" },
  { q: "Will the driver in P3 attempt an undercut?", opts: ["YES", "NO"], ans: "YES" },
  { q: "Who will get the fastest lap of the race?", opts: ["VERSTAPPEN", "NORRIS", "LECLERC", "OTHER"], ans: "NORRIS" },
  { q: "Will there be a VSC (Virtual Safety Car) soon?", opts: ["YES", "NO"], ans: "NO" },
];

type QuizState = 'ASKING' | 'LOCKED' | 'MISSED' | 'RESULT' | 'RACE_CONCLUDED';

export default function HomeScreen({ navigation, userProfile, authToken, setUserProfile, globalLap }: any) {
  // Live Race Progression State
  const lap = globalLap || 14;
  const totalLaps = 66;
  const isFinished = lap >= totalLaps;

  // Quiz Engine State
  const [quizState, setQuizState] = useState<QuizState>('ASKING');
  const [currentQuiz, setCurrentQuiz] = useState<any>(QUIZ_QUESTIONS[0]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [sessionPoints, setSessionPoints] = useState(0);

  const teamName = userProfile?.fantasyTeamName || 'UNNAMED TEAM';

  // Animation values
  const ecoAnimY = useRef(new Animated.Value(20)).current;
  const ecoAnimOpacity = useRef(new Animated.Value(0)).current;
  const ecoAnimScale = useRef(new Animated.Value(0.5)).current;

  const [top3, setTop3] = useState<any[]>([
    { id: 1, driver: 'MAX VERSTAPPEN', team: 'RED BULL RACING', baseGap: 0.0, currentGap: 0, pos: 1, gap: 'Leader' },
    { id: 2, driver: 'LANDO NORRIS', team: 'MCLAREN', baseGap: 1.4, currentGap: 1.4, pos: 2, gap: '+1.400s' },
    { id: 3, driver: 'KIMI ANTONELLI', team: 'MERCEDES', baseGap: 3.1, currentGap: 3.1, pos: 3, gap: '+3.100s' },
  ]);

  // Lap Progression & Scrambling
  useEffect(() => {
    if (isFinished) {
      setQuizState('RACE_CONCLUDED');
      const finalPositions = [...top3].map(d => ({ ...d, currentGap: d.id === 1 ? 0 : d.baseGap + Math.random() }));
      finalPositions.sort((a, b) => a.currentGap - b.currentGap);
      setTop3(finalPositions.map((d, i) => ({ ...d, pos: i + 1, gap: i === 0 ? 'Winner' : `+${d.currentGap.toFixed(3)}s` })));
      return;
    }
    
    setTop3(
      [...top3]
        .map(d => ({
          ...d,
          currentGap: d.id === 1 ? 0 : d.baseGap + (Math.random() * 0.8 - 0.4)
        }))
        .sort((a, b) => a.currentGap - b.currentGap)
        .map((d, i) => ({
          ...d,
          pos: i + 1,
          gap: i === 0 ? 'Leader' : `+${d.currentGap.toFixed(3)}s`
        }))
    );

    const lapInterval = setInterval(() => {
      if (lap >= totalLaps) {
        setQuizState('RACE_CONCLUDED');
      }
      
      setTop3(prev => 
        prev.map((d, i) => ({
          ...d,
          currentGap: i === 0 ? 0 : d.currentGap + (Math.random() * 0.6 - 0.3)
        }))
        .sort((a, b) => a.currentGap - b.currentGap)
        .map((d, i) => ({
          ...d,
          pos: i + 1,
          gap: i === 0 ? 'Leader' : `+${d.currentGap.toFixed(3)}s`
        }))
      );
      
    }, 5000); // sync with global 5s lap
    return () => clearInterval(lapInterval);
  }, [isFinished]);

  // Quiz State Machine
  useEffect(() => {
    let timerId: any;
    if (quizState === 'RACE_CONCLUDED') return;

    if (quizState === 'ASKING') {
      timerId = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setQuizState('MISSED');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    else if (quizState === 'LOCKED' || quizState === 'MISSED') {
      // Wait 10 seconds to simulate event happening
      timerId = setTimeout(() => {
        setQuizState('RESULT');
      }, 10000);
    }
    else if (quizState === 'RESULT') {
      if (selectedOption === currentQuiz?.ans) {
        awardPoints();
        triggerEcoAnimation();
      }
      
      // Stay on result for 8 seconds, then ask next
      timerId = setTimeout(() => {
        let nextQ;
        do {
          nextQ = QUIZ_QUESTIONS[Math.floor(Math.random() * QUIZ_QUESTIONS.length)];
        } while (nextQ.q === currentQuiz?.q);

        setCurrentQuiz(nextQ);
        setSelectedOption(null);
        setTimeLeft(30);
        setQuizState('ASKING');
      }, 8000);
    }

    return () => {
      clearTimeout(timerId);
      clearInterval(timerId);
    };
  }, [quizState]);

  const handleSelectOption = async (opt: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (quizState === 'ASKING') {
      try {
        const elapsed = 30 - timeLeft;
        const res = await fetch(`${API_BASE_URL}/api/predictions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({ questionId: currentQuiz?.q, answer: opt, elapsedSeconds: elapsed })
        });

        if (res.status === 400) {
          alert('Window Closed');
          return;
        } else if (res.status === 409) {
          alert('Duplicate prediction');
          return;
        }

        if (res.ok || res.status === 201) {
          setSelectedOption(opt);
          setQuizState('LOCKED');
        } else {
           alert('Server Error');
        }
      } catch (err) {
        console.error(err);
        alert('Network Error. Cannot reach API.');
      }
    }
  };

  const awardPoints = async () => {
    setSessionPoints(prev => prev + 5);
    if (!authToken) return;
    try {
      const res = await fetch(`${API_USERS_URL}/add-points`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ points: 5 })
      });
      if (res.ok) {
        setUserProfile((prev: any) => ({ ...prev, totalPoints: (prev.totalPoints || 0) + 5 }));
      }
    } catch (error) {
      console.log("Failed to award points:", error);
    }
  };

  const triggerEcoAnimation = () => {
    ecoAnimY.setValue(20);
    ecoAnimOpacity.setValue(0);
    ecoAnimScale.setValue(0.5);

    Animated.sequence([
      Animated.parallel([
        Animated.timing(ecoAnimOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(ecoAnimScale, { toValue: 1.2, duration: 400, useNativeDriver: true }),
        Animated.timing(ecoAnimY, { toValue: -10, duration: 400, useNativeDriver: true })
      ]),
      Animated.delay(1500),
      Animated.parallel([
        Animated.timing(ecoAnimOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(ecoAnimY, { toValue: -40, duration: 500, useNativeDriver: true })
      ])
    ]).start();
  };

  const handleEnterTelemetry = () => {
    navigation.navigate('LiveTelemetry', { sessionKey: 9158, raceName: 'SPAIN' });
  };

  const liveRaceStatus = isFinished ? 'RACE FINISHED' : 'LIVE';
  const flagIcon = isFinished ? ' 🏁' : '';

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>RACE CONTROL</Text>
          <View style={[styles.liveBadge, isFinished && styles.finishedBadge]}>
            <View style={[styles.liveDot, isFinished && styles.finishedDot]} />
            <Text style={[styles.liveText, isFinished && styles.finishedText]}>
              {isFinished ? 'OFFLINE' : 'SYSTEM ONLINE'}
            </Text>
          </View>
        </View>

        <TouchableOpacity activeOpacity={0.9} onPress={handleEnterTelemetry} style={styles.liveCard}>
          <LinearGradient colors={['#1a0505', '#000000']} style={styles.cardGradient}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.raceName}>SPAIN GP 2026</Text>
              <View style={[styles.statusPill, isFinished && styles.statusPillFinished]}>
                <Text style={styles.statusText}>{liveRaceStatus} • LAP {lap}/{totalLaps}</Text>
              </View>
            </View>

            <Text style={styles.sectionLabel}>TRACK POSITIONS</Text>
            
            <View style={styles.leaderboardBox}>
              {top3.map((driver) => (
                <View key={driver.pos} style={styles.leaderboardRow}>
                  <View style={styles.driverInfoLeft}>
                    <Text style={styles.posText}>P{driver.pos}</Text>
                    <View>
                      <Text style={styles.driverName}>{driver.driver}{flagIcon}</Text>
                      <Text style={styles.driverTeam}>{driver.team}</Text>
                    </View>
                  </View>
                  <Text style={styles.gapText}>{driver.gap}</Text>
                </View>
              ))}
            </View>

            {!isFinished && (
              <View style={styles.actionButton}>
                <Text style={styles.actionButtonText}>OPEN FANTASY TELEMETRY ➔</Text>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* INLINE QUIZ MODULE - ALWAYS VISIBLE */}
        <View style={styles.quizBox}>
          <View style={styles.quizHeaderRow}>
            <Text style={styles.quizTitle}>PREDICTION DESK</Text>
            {quizState === 'ASKING' && <Text style={styles.timerText}>{timeLeft}s</Text>}
            {quizState === 'LOCKED' && <Text style={styles.statusYellow}>LOCKED IN</Text>}
            {quizState === 'MISSED' && <Text style={styles.statusGray}>NOT ATTEMPTED</Text>}
            {quizState === 'RESULT' && <Text style={styles.statusCyan}>EVENT CONCLUDED</Text>}
          </View>

          {quizState === 'RACE_CONCLUDED' ? (
            <View style={styles.concludedBox}>
              <Text style={styles.concludedTitle}>🏁 RACE CONCLUDED</Text>
              <Text style={styles.concludedSub}>Final Points Processed</Text>
              <View style={styles.pointsBadge}>
                <Text style={styles.pointsEarned}>+{sessionPoints} ECO POINTS</Text>
              </View>
            </View>
          ) : (
            <>
              <Text style={styles.questionText}>{currentQuiz?.q}</Text>

              <View style={styles.optionsGrid}>
                {currentQuiz?.opts.map((opt: string) => {
                  let isSelected = selectedOption === opt;
                  let isCorrect = currentQuiz?.ans === opt;
                  
                  let btnStyle: any = styles.optionBtn;
                  let txtStyle: any = styles.optionText;

                  if (quizState === 'LOCKED') {
                    if (isSelected) {
                      btnStyle = [styles.optionBtn, { borderColor: Colors.NEON_CYAN, backgroundColor: 'rgba(0, 255, 255, 0.1)' }];
                      txtStyle = [styles.optionText, { color: Colors.NEON_CYAN }];
                    } else {
                      btnStyle = [styles.optionBtn, { opacity: 0.5 }];
                    }
                  } 
                  else if (quizState === 'RESULT') {
                    if (isCorrect) {
                      btnStyle = [styles.optionBtn, { borderColor: Colors.SCUDERIA_RED, backgroundColor: 'rgba(255, 40, 0, 0.2)' }];
                      txtStyle = [styles.optionText, { color: Colors.WHITE }];
                    } else if (isSelected) {
                      btnStyle = [styles.optionBtn, { borderColor: Colors.GRAY, opacity: 0.3 }];
                    } else {
                      btnStyle = [styles.optionBtn, { opacity: 0.3 }];
                    }
                  }

                  return (
                    <TouchableOpacity 
                      key={opt} 
                      activeOpacity={0.7}
                      onPress={() => handleSelectOption(opt)} 
                      style={btnStyle}
                      disabled={quizState !== 'ASKING'}
                    >
                      <Text style={txtStyle}>{opt}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          {/* +5 ECO ANIMATION */}
          <Animated.View style={[styles.ecoAnimBox, {
            opacity: ecoAnimOpacity,
            transform: [{ translateY: ecoAnimY }, { scale: ecoAnimScale }],
            pointerEvents: 'none'
          }]}>
            <Text style={styles.ecoAnimText}>+5 ECO PTS FOR {teamName.toUpperCase()}!</Text>
          </Animated.View>
        </View>

        {/* DUMMY F1 NEWS SECTION */}
        <View style={styles.newsSection}>
          <Text style={styles.sectionHeader}>LATEST PADDOCK INTEL</Text>
          
          <View style={styles.newsCard}>
            <View style={styles.newsContent}>
              <Text style={styles.newsTitle}>Ferrari introduces extreme low-carbon rear wing for Spain.</Text>
              <Text style={styles.newsDate}>2 HOURS AGO</Text>
            </View>
          </View>
          
          <View style={styles.newsCard}>
            <View style={styles.newsContent}>
              <Text style={styles.newsTitle}>Mercedes confirms Kimi Antonelli's massive MGU-K upgrade.</Text>
              <Text style={styles.newsDate}>5 HOURS AGO</Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.OLED_BLACK },
  scroll: { padding: 20, paddingTop: 10, paddingBottom: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { color: Colors.WHITE, fontSize: 24, fontWeight: '900', fontStyle: 'italic', letterSpacing: 1 },
  liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0, 255, 65, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0, 255, 65, 0.3)' },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.NEON_CYAN, marginRight: 6 },
  liveText: { color: Colors.NEON_CYAN, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  
  finishedBadge: { backgroundColor: 'rgba(150, 150, 150, 0.1)', borderColor: 'rgba(150, 150, 150, 0.3)' },
  finishedDot: { backgroundColor: Colors.GRAY },
  finishedText: { color: Colors.GRAY },

  liveCard: { borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: Colors.SCUDERIA_RED, marginBottom: 20 },
  cardGradient: { padding: 20 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  raceName: { color: Colors.WHITE, fontSize: 22, fontWeight: '900', fontStyle: 'italic' },
  statusPill: { backgroundColor: Colors.SCUDERIA_RED, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 },
  statusPillFinished: { backgroundColor: Colors.GRAY },
  statusText: { color: Colors.WHITE, fontSize: 10, fontWeight: '900', letterSpacing: 1 },

  sectionLabel: { color: Colors.GRAY, fontSize: 10, fontWeight: '800', letterSpacing: 2, marginBottom: 10 },
  leaderboardBox: { gap: 10, marginBottom: 24 },
  leaderboardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#222' },
  driverInfoLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  posText: { color: Colors.WHITE, fontSize: 16, fontWeight: '900', width: 24 },
  driverName: { color: Colors.WHITE, fontSize: 14, fontWeight: '800' },
  driverTeam: { color: Colors.GRAY, fontSize: 10, fontWeight: '600' },
  gapText: { color: Colors.NEON_CYAN, fontSize: 12, fontWeight: '700', fontVariant: ['tabular-nums'] },

  actionButton: { backgroundColor: '#1a0505', borderWidth: 1, borderColor: Colors.SCUDERIA_RED, padding: 14, borderRadius: 8, alignItems: 'center' },
  actionButtonText: { color: Colors.SCUDERIA_RED, fontSize: 12, fontWeight: '900', letterSpacing: 2 },

  // QUIZ BOX
  quizBox: { backgroundColor: '#111', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: Colors.NEON_CYAN, overflow: 'hidden', marginBottom: 30 },
  quizHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  quizTitle: { color: Colors.NEON_CYAN, fontSize: 14, fontWeight: '900', letterSpacing: 2 },
  timerText: { color: Colors.SCUDERIA_RED, fontSize: 16, fontWeight: '900', fontVariant: ['tabular-nums'] },
  statusYellow: { color: '#FFD700', fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  statusGray: { color: Colors.GRAY, fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  statusCyan: { color: Colors.NEON_CYAN, fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  
  questionText: { color: Colors.WHITE, fontSize: 16, fontWeight: '700', marginBottom: 20, lineHeight: 22 },
  optionsGrid: { gap: 10 },
  optionBtn: { backgroundColor: '#222', padding: 15, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#444' },
  optionText: { color: Colors.WHITE, fontSize: 14, fontWeight: '800', letterSpacing: 1 },

  ecoAnimBox: { position: 'absolute', top: 50, left: 0, right: 0, alignItems: 'center', zIndex: 10 },
  ecoAnimText: { color: '#00FF41', fontSize: 20, fontWeight: '900', textShadowColor: '#000', textShadowOffset: {width: 1, height: 1}, textShadowRadius: 2, fontStyle: 'italic' },

  concludedBox: { alignItems: 'center', paddingVertical: 20 },
  concludedTitle: { color: Colors.WHITE, fontSize: 20, fontWeight: '900', fontStyle: 'italic' },
  concludedSub: { color: Colors.GRAY, fontSize: 12, fontWeight: '700', letterSpacing: 1, marginTop: 8 },
  pointsBadge: { backgroundColor: 'rgba(0, 255, 65, 0.1)', borderWidth: 1, borderColor: '#00FF41', padding: 15, borderRadius: 12, marginTop: 20 },
  pointsEarned: { color: '#00FF41', fontSize: 18, fontWeight: '900', letterSpacing: 1 },

  // NEWS SECTION
  newsSection: { marginBottom: 40 },
  sectionHeader: { color: Colors.GRAY, fontSize: 12, fontWeight: '900', letterSpacing: 2, marginBottom: 15, fontStyle: 'italic' },
  newsCard: { backgroundColor: '#151515', borderRadius: 10, padding: 15, marginBottom: 10, borderLeftWidth: 3, borderLeftColor: Colors.SCUDERIA_RED },
  newsContent: { flex: 1 },
  newsTitle: { color: Colors.WHITE, fontSize: 14, fontWeight: '700', lineHeight: 20 },
  newsDate: { color: Colors.GRAY, fontSize: 10, fontWeight: '800', letterSpacing: 1, marginTop: 8 },
});
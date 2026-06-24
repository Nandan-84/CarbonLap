import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, SafeAreaView } from 'react-native';
import { API_F1_URL } from '../config/api';

// 🛡️ 1. Define the exact shape of our database response
interface RaceSession {
  id: number;
  session_key: number;
  meeting_key: number;
  country_name: string;
  location: string;
  session_name: string;
  date_start: string;
  isCompleted: boolean;
  p1_driver?: string | null;
  p2_driver?: string | null;
  p3_driver?: string | null;
  eco_winner?: string | null;
}

export default function ScheduleScreen() {
  // 🛡️ 2. Tell the state exactly what kind of array it's holding
  const [races, setRaces] = useState<RaceSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchCalendar();
  }, []);

  const fetchCalendar = async () => {
    try {
      const response = await fetch(`${API_F1_URL}/calendar`);
      const data = await response.json();
      setRaces(data);
    } catch (error) {
      console.error("❌ Failed to fetch calendar:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🛡️ 3. Strictly type the dateString parameter
  const formatRaceWeekend = (dateString: string): string => {
    const raceDay = new Date(dateString);
    const practiceDay = new Date(raceDay);
    practiceDay.setDate(raceDay.getDate() - 2); 

    const month = raceDay.toLocaleString('default', { month: 'short' }).toUpperCase();
    const startDay = practiceDay.getDate().toString().padStart(2, '0');
    const endDay = raceDay.getDate().toString().padStart(2, '0');

    return `${startDay}-${endDay} ${month}`;
  };

  // 🛡️ 4. Strictly type the FlatList item parameter
  const renderRaceCard = ({ item }: { item: RaceSession }) => {
    const cardOpacity = item.isCompleted ? 0.6 : 1;

    return (
      <View style={[styles.card, { opacity: cardOpacity }]}>
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>{formatRaceWeekend(item.date_start)}</Text>
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.countryText}>{item.country_name.toUpperCase()}</Text>
          <Text style={styles.locationText}>{item.location}</Text>
        </View>

        {item.isCompleted && (
          <View style={styles.completedBadge}>
            <Text style={styles.completedText}>FINISHED</Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#E10600" />
        <Text style={styles.loadingText}>Syncing FIA Data...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>2026 SEASON</Text>
      <FlatList
        data={races}
        keyExtractor={(item) => item.session_key.toString()}
        renderItem={renderRaceCard}
        contentContainerStyle={styles.listPadding}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', 
  },
  loaderContainer: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 15,
    fontSize: 16,
    fontFamily: 'sans-serif-medium',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    letterSpacing: 2,
  },
  listPadding: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#E10600', 
  },
  dateContainer: {
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2A2A2A',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    width: 80, // Ensures uniform width for the date box
  },
  dateText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  infoContainer: {
    flex: 1,
  },
  countryText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  locationText: {
    color: '#A0A0A0',
    fontSize: 14,
  },
  completedBadge: {
    backgroundColor: '#333',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  completedText: {
    color: '#888',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
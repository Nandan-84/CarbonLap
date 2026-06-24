import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { API_F1_URL } from '../config/api';

export default function ReplayScreen({ route }: any) {
  const { sessionKey } = route.params;
  const [telemetry, setTelemetry] = useState<any[]>([]);

  useEffect(() => {
    // Assuming driver #16 (Charles) for the replay demo
    fetch(`${API_F1_URL}/replay/${sessionKey}/16`)
      .then(res => res.json())
      .then(data => setTelemetry(data.telemetryTimeline));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>LIVE TELEMETRY STREAM</Text>
      <FlatList 
        data={telemetry}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.text}>{item.time.slice(11, 19)}</Text>
            <Text style={styles.text}>{item.speed} kph</Text>
            <Text style={styles.text}>{item.currentEmission} CO2</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 20 },
  header: { color: '#fff', fontSize: 20, marginBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', padding: 10, borderBottomWidth: 1, borderBottomColor: '#333' },
  text: { color: '#fff' }
});
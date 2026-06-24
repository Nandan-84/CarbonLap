// services/openf1.mjs
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

// 🚀 PRISMA 7 CORRECT USAGE
const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

const OPENF1_URL = 'https://api.openf1.org/v1';

export const OpenF1Engine = {
  // 1. SYNC CALENDAR (Ultra-Safe SQLite Version)
  async syncSeasonCalendar() {
    try {
      console.log('📡 [OpenF1] Fetching master calendar...');
      const response = await axios.get(`${OPENF1_URL}/sessions?year=2026&session_name=Race`);
      const sessions = response.data;

      if (!Array.isArray(sessions)) throw new Error('API returned invalid format.');

      // Clear the grid before repopulating to avoid unique constraint collisions
      await prisma.raceSession.deleteMany({});
      
      const safeRaces = [];

      for (const session of sessions) {
        if (!session || !session.session_key) continue;

        // Shift date to 2026 and force it into an ISO String so SQLite doesn't choke
        const dateString = session.date_start
         ? new Date(session.date_start).toISOString()
         : new Date().toISOString();

        safeRaces.push({
          session_key: Number(session.session_key),
          meeting_key: session.meeting_key ? Number(session.meeting_key) : 0,
          country_name: session.country_name ? String(session.country_name) : 'Unknown',
          location: session.location ? String(session.location) : 'Unknown',
          session_name: session.session_name ? String(session.session_name) : 'Race',
          date_start: dateString, // SQLite safe string!
          isCompleted: new Date(dateString) < new Date(),
        });
      }

      // Bulk insert is much safer than upserting in SQLite
      await prisma.raceSession.createMany({ data: safeRaces });
      
      console.log(`✅ [OpenF1] Calendar successfully synchronized! (${safeRaces.length} races added)`);
    } catch (error) {
  console.error('FULL ERROR');
  console.error(error);
  console.error(error.stack);
}
  },

  // 2. FETCH PODIUM DATA FOR HOME PAGE
  async getRacePodium(sessionKey) {
    try {
      const posRes = await axios.get(`${OPENF1_URL}/position?session_key=${sessionKey}`);
      const positions = posRes.data.reverse(); 
      
      const p1 = positions.find(p => p.position === 1)?.driver_number;
      const p2 = positions.find(p => p.position === 2)?.driver_number;
      const p3 = positions.find(p => p.position === 3)?.driver_number;

      return { p1, p2, p3 };
    } catch (error) {
      return { p1: 1, p2: 16, p3: 4 }; 
    }
  },

  // 3. THE REPLAY ENGINE
  async generateReplayTelemetry(sessionKey, driverNumber) {
    console.log(`🏎️ [OpenF1] Booting Replay Telemetry for Driver #${driverNumber}...`);
    try {
      const response = await axios.get(`${OPENF1_URL}/car_data?session_key=${sessionKey}&driver_number=${driverNumber}`);
      const rawTelemetry = response.data;

      let totalCarbonEmission = 0;
      const replayStream = [];

      if (!Array.isArray(rawTelemetry)) return { driver: driverNumber, totalCarbon: 0, ecoPointsEarned: 0, telemetryTimeline: [] };

      for (let i = 0; i < rawTelemetry.length; i += 100) {
        const data = rawTelemetry[i];
        
        const rpmFactor = data.rpm || 0;
        const throttleFactor = data.throttle || 0;
        const emissionSpike = (rpmFactor * throttleFactor) / 50000; 
        
        totalCarbonEmission += emissionSpike;

        replayStream.push({
          time: data.date,
          speed: data.speed || 0,
          rpm: data.rpm || 0,
          gear: data.n_gear || 0,
          throttle: data.throttle || 0,
          currentEmission: emissionSpike.toFixed(2),
          totalEmission: totalCarbonEmission.toFixed(2)
        });
      }

      const ecoPoints = Math.max(0, Math.floor(5000 - totalCarbonEmission));

      return {
        driver: driverNumber,
        totalCarbon: totalCarbonEmission.toFixed(2),
        ecoPointsEarned: ecoPoints,
        telemetryTimeline: replayStream 
      };

    } catch (error) {
      console.error('❌ [OpenF1] Telemetry generation failed:', error.message);
      return {
        driver: driverNumber,
        totalCarbon: "0.00",
        ecoPointsEarned: 0,
        telemetryTimeline: [] 
      };
    }
  }
};
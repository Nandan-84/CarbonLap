// server.mjs

import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { OpenF1Engine } from './services/openf1.mjs';

// 🚀 PRISMA 7 CORRECT USAGE
const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

const app = express();

app.use(cors());
app.use(express.json());

const JWT_SECRET = 'carbonlap_super_secret_dev_key_2026';

// ==========================================
// HELPERS
// ==========================================

// Generate a 6-digit OTP
const generateOTP = () => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + 5);

  return { otp, expiry };
};

// Print OTP to terminal
const transmitToTerminal = (email, otp, context) => {
  console.log('\n========================================');
  console.log(`🚨 INCOMING TRANSMISSION FOR: ${email}`);
  console.log(`📡 CONTEXT: ${context}`);
  console.log(`🔑 AUTHORIZATION CODE: ${otp}`);
  console.log('========================================\n');
};

// ==========================================
// AUTH ROUTES
// ==========================================

// 1. SIGNUP
app.post('/api/auth/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    const existing = await prisma.user.findUnique({
      where: { email }
    });

    if (existing) {
      return res
        .status(400)
        .json({ error: 'User already registered on the grid.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { otp, expiry } = generateOTP();

    await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        currentOtp: otp,
        otpExpiry: expiry,

        fullName: 'New Driver',
        age: 18,
        gender: 'UNKNOWN',
        countryCode: 'UN',
        favDriverId: 'CL',
        favTeamId: 'FERRARI',
        fantasyDriverId: 'CL'
      }
    });

    transmitToTerminal(email, otp, 'NEW DRIVER REGISTRATION');

    res.json({
      message: 'Registration accepted. Verify OTP to initialize.'
    });
  } catch (err) {
    console.error('❌ SIGNUP CRASH:', err);

    res.status(500).json({
      error: 'System error during registration.'
    });
  }
});

// 2. LOGIN
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        error: 'Driver not found. Access denied.'
      });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!validPassword) {
      return res.status(401).json({
        error: 'Invalid access code. Authorization failed.'
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email
      },
      JWT_SECRET,
      { expiresIn: '72h' }
    );

    console.log(`🟢 ${email} GRANTED DIRECT PIT WALL ACCESS.`);

    res.json({
      token,
      message: 'Access Granted.'
    });
  } catch (err) {
    console.error('❌ LOGIN CRASH:', err);

    res.status(500).json({
      error: 'System error during login.'
    });
  }
});

// 3. VERIFY OTP
app.post('/api/auth/verify', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || user.currentOtp !== otp) {
      return res.status(401).json({
        error: 'Invalid OTP.'
      });
    }

    if (new Date() > user.otpExpiry) {
      return res.status(401).json({
        error: 'OTP Expired.'
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email
      },
      JWT_SECRET,
      { expiresIn: '72h' }
    );

    await prisma.user.update({
      where: { email },
      data: {
        currentOtp: null,
        otpExpiry: null
      }
    });

    console.log(`🟢 ${email} GRANTED PIT WALL ACCESS.`);

    res.json({
      token,
      message: 'Access Granted.'
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: 'Verification failed.'
    });
  }
});

// 4. FORGOT PASSWORD
app.post('/api/auth/forgot', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({
        error: 'Driver not found.'
      });
    }

    const { otp, expiry } = generateOTP();

    await prisma.user.update({
      where: { email },
      data: {
        currentOtp: otp,
        otpExpiry: expiry
      }
    });

    transmitToTerminal(
      email,
      otp,
      'PASSWORD OVERRIDE REQUEST'
    );

    res.json({
      message: 'Override code transmitted.'
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: 'Request failed.'
    });
  }
});

// 5. RESET PASSWORD
app.post('/api/auth/reset', async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || user.currentOtp !== otp) {
      return res.status(401).json({
        error: 'Invalid OTP.'
      });
    }

    if (new Date() > user.otpExpiry) {
      return res.status(401).json({
        error: 'OTP Expired.'
      });
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    await prisma.user.update({
      where: { email },
      data: {
        passwordHash: hashedPassword,
        currentOtp: null,
        otpExpiry: null
      }
    });

    console.log(`🔄 ${email} PASSWORD SUCCESSFULLY RESET.`);

    res.json({
      message:
        'Access code reset successfully. Please login.'
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: 'Reset failed.'
    });
  }
});

// ==========================================
// 🎯 PREDICTIONS
// ==========================================
app.post('/api/predictions', authenticateToken, async (req, res) => {
  const { questionId, answer, elapsedSeconds } = req.body;
  const userId = req.user.userId;

  if (elapsedSeconds > 30) {
    return res.status(400).json({ error: 'Window Closed' });
  }

  try {
    await prisma.prediction.create({
      data: {
        userId,
        questionId,
        answer
      }
    });

    res.status(201).json({ message: 'Prediction saved successfully.' });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Duplicate prediction' });
    }
    console.error("Prediction Error:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==========================================
// 🏁 OPENF1 LIVE TELEMETRY & RACE ENDPOINTS
// ==========================================

// 1. Sync OpenF1 calendar
app.get('/api/f1/sync-calendar', async (req, res) => {
  try {
    await OpenF1Engine.syncSeasonCalendar();

    res.json({
      message: 'OpenF1 Calendar synced to database.'
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'Calendar sync failed.'
    });
  }
});

// 2. Get race calendar
app.get('/api/f1/calendar', async (req, res) => {
  try {
    let schedule = await prisma.raceSession.findMany({
      orderBy: {
        date_start: 'asc'
      }
    });

    if (schedule.length === 0) {
      await OpenF1Engine.syncSeasonCalendar();
      schedule = await prisma.raceSession.findMany({
        orderBy: {
          date_start: 'asc'
        }
      });
    }

    // Enforce logic: Till Barcelona finished, Austrian GP next
    let pastBarcelona = false;
    schedule = schedule.map(race => {
      const loc = (race.country_name + ' ' + race.location).toLowerCase();
      if (loc.includes('austria') || loc.includes('spielberg')) {
        pastBarcelona = true;
      }
      
      return {
        ...race,
        isCompleted: !pastBarcelona
      };
    });

    res.json(schedule);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'Failed to load calendar.'
    });
  }
});

// 3. Latest completed race
app.get('/api/f1/latest-race', async (req, res) => {
  try {
    const latestRace = await prisma.raceSession.findFirst({
      where: {
        isCompleted: true
      },
      orderBy: {
        date_start: 'desc'
      }
    });

    if (!latestRace) {
      return res.status(404).json({
        error: 'No completed races found.'
      });
    }

    if (!latestRace.p1_driver) {
      const podium =
        await OpenF1Engine.getRacePodium(
          latestRace.session_key
        );

      await prisma.raceSession.update({
        where: {
          id: latestRace.id
        },
        data: {
          p1_driver: podium.p1?.toString(),
          p2_driver: podium.p2?.toString(),
          p3_driver: podium.p3?.toString(),
          eco_winner: 'CHARLES LECLERC'
        }
      });

      latestRace.p1_driver = podium.p1?.toString();
      latestRace.p2_driver = podium.p2?.toString();
      latestRace.p3_driver = podium.p3?.toString();
    }

    res.json(latestRace);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'Failed to load latest race.'
    });
  }
});

// 4. Replay telemetry
app.get(
  '/api/f1/replay/:sessionKey/:driverNumber',
  async (req, res) => {
    const { sessionKey, driverNumber } = req.params;

    try {
      const replayData =
        await OpenF1Engine.generateReplayTelemetry(
          parseInt(sessionKey),
          parseInt(driverNumber)
        );

      res.json(replayData);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: 'Telemetry transmission failed.'
      });
    }
  }
);

// ==========================================
// 🏎️ DRIVER BIO (USER) ENDPOINTS
// ==========================================

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token.' });
    req.user = user;
    next();
  });
};

// Get Driver Profile
app.get('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        email: true,
        fullName: true,
        age: true,
        gender: true,
        countryCode: true,
        favDriverId: true,
        favTeamId: true,
        fantasyDriverId: true,
        fantasyTeamName: true,
        totalPoints: true,
      }
    });

    if (!user) return res.status(404).json({ error: 'Driver not found.' });

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve profile.' });
  }
});

// Update Driver Profile
app.put('/api/users/profile', authenticateToken, async (req, res) => {
  const { name, age, gender, country, favDriverId, favTeamId, fantasyDriverId, email, fantasyTeamName } = req.body;

  try {
    const dataToUpdate = {
      fullName: name,
      age: parseInt(age) || 18,
      gender: gender,
      countryCode: country,
      favDriverId: favDriverId,
      favTeamId: favTeamId,
      fantasyDriverId: fantasyDriverId,
      fantasyTeamName: fantasyTeamName,
    };

    if (email) {
      dataToUpdate.email = email;
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: dataToUpdate,
      select: {
        email: true,
        fullName: true,
        age: true,
        gender: true,
        countryCode: true,
        favDriverId: true,
        favTeamId: true,
        fantasyDriverId: true,
        fantasyTeamName: true,
        totalPoints: true,
      }
    });

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// Add Points
app.post('/api/users/add-points', authenticateToken, async (req, res) => {
  const { points } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        totalPoints: {
          increment: points
        }
      },
      select: { totalPoints: true }
    });
    res.json({ message: 'Points added successfully', totalPoints: user.totalPoints });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add points.' });
  }
});

// Update Driver Password directly
app.put('/api/users/update-password', authenticateToken, async (req, res) => {
  const { newPassword } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: req.user.userId },
      data: { passwordHash: hashedPassword }
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update password.' });
  }
});

// Delete Driver Account
app.delete('/api/users/delete', authenticateToken, async (req, res) => {
  try {
    await prisma.user.delete({
      where: { id: req.user.userId }
    });
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete account.' });
  }
});

// ==========================================

const PORT = 3001;
const HOST = '0.0.0.0'; // Bind to all interfaces so physical devices can connect

app.listen(PORT, HOST, () => {
  console.log(
    `🚀 CarbonLap Secure Auth Engine live on http://localhost:${PORT}`
  );
  console.log(
    `📱 For physical devices, connect to http://<YOUR_WIFI_IP>:${PORT}`
  );
});
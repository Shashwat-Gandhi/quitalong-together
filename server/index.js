import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import pool from './db.js';
import authRoutes from './routes/auth.js';
import pairRoutes from './routes/pair.js';
import logsRoutes from './routes/logs.js';
import statsRoutes from './routes/stats.js';
import settingsRoutes from './routes/settings.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : clientUrl,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/pair', pairRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/settings', settingsRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

const clientDist = path.join(__dirname, '..', 'client', 'dist');

if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

async function runMigrations() {
  const schemaPath = path.join(__dirname, 'db', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  await pool.query(schema);
}

async function start() {
  if (!process.env.JWT_SECRET) {
    console.warn('Warning: JWT_SECRET is not set');
  }

  if (process.env.DATABASE_URL) {
    try {
      await runMigrations();
      console.log('Database schema ready');
    } catch (err) {
      console.error('Migration error:', err.message);
    }
  } else {
    console.warn('Warning: DATABASE_URL is not set');
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start();

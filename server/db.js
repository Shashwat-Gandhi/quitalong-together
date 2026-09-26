import pg from 'pg';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || '';
const useSsl =
  process.env.NODE_ENV === 'production' ||
  connectionString.includes('neon.tech') ||
  connectionString.includes('sslmode=require');

const pool = new Pool({
  connectionString,
  ssl: useSsl ? { rejectUnauthorized: false } : false,
});

export async function query(text, params) {
  return pool.query(text, params);
}

export default pool;

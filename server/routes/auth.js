import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../db.js';
import { generateInviteCode } from '../lib/inviteCode.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { setAuthCookie, clearAuthCookie } from '../middleware/authCookie.js';

const router = Router();

const PROTECTED_RESET_EMAIL = (process.env.PROTECTED_RESET_EMAIL || 'shashwatgandhi88@gmail.com').toLowerCase();

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

async function getUserWithPair(userId) {
  const result = await query(
    `SELECT u.id, u.email, u.display_name, u.accent_color, u.timezone, u.pair_id, u.created_at,
            p.invite_code, p.user1_id, p.user2_id
     FROM users u
     LEFT JOIN pairs p ON p.id = u.pair_id
     WHERE u.id = $1`,
    [userId]
  );

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  const pairComplete = !!(row.user1_id && row.user2_id);

  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    accentColor: row.accent_color,
    timezone: row.timezone,
    pairId: row.pair_id,
    inviteCode: row.invite_code,
    isUser1: row.user1_id === row.id,
    pairComplete,
    createdAt: row.created_at,
  };
}

router.post('/signup', async (req, res) => {
  try {
    const { email, password, displayName, inviteCode } = req.body;

    if (!email || !password || !displayName) {
      return res.status(400).json({ error: 'Email, password, and display name are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    if (inviteCode) {
      const pairResult = await query(
        `SELECT id, user1_id, user2_id FROM pairs WHERE invite_code = $1`,
        [inviteCode.toUpperCase()]
      );

      if (pairResult.rows.length === 0) {
        return res.status(400).json({ error: 'Invalid invite code' });
      }

      const pair = pairResult.rows[0];
      if (pair.user2_id) {
        return res.status(400).json({ error: 'This pair is already full' });
      }

      const userResult = await query(
        `INSERT INTO users (email, password_hash, display_name, accent_color, pair_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [email.toLowerCase(), passwordHash, displayName, '#3b82f6', pair.id]
      );

      const userId = userResult.rows[0].id;
      await query('UPDATE pairs SET user2_id = $1 WHERE id = $2', [userId, pair.id]);

      const token = signToken(userId);
      setAuthCookie(res, token);

      const user = await getUserWithPair(userId);
      return res.status(201).json({ user });
    }

    let code = generateInviteCode();
    let codeExists = true;
    while (codeExists) {
      const check = await query('SELECT id FROM pairs WHERE invite_code = $1', [code]);
      if (check.rows.length === 0) codeExists = false;
      else code = generateInviteCode();
    }

    const pairResult = await query(
      `INSERT INTO pairs (invite_code) VALUES ($1) RETURNING id`,
      [code]
    );
    const pairId = pairResult.rows[0].id;

    const userResult = await query(
      `INSERT INTO users (email, password_hash, display_name, accent_color, pair_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [email.toLowerCase(), passwordHash, displayName, '#22c55e', pairId]
    );

    const userId = userResult.rows[0].id;
    await query('UPDATE pairs SET user1_id = $1 WHERE id = $2', [userId, pairId]);

    const token = signToken(userId);
    setAuthCookie(res, token);

    const user = await getUserWithPair(userId);
    return res.status(201).json({ user });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Failed to create account' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await query('SELECT id, password_hash FROM users WHERE email = $1', [
      email.toLowerCase(),
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signToken(user.id);
    setAuthCookie(res, token);

    const userData = await getUserWithPair(user.id);
    return res.json({ user: userData });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Failed to log in' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and new password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const normalizedEmail = email.toLowerCase();

    if (normalizedEmail === PROTECTED_RESET_EMAIL) {
      return res.status(403).json({ error: 'Password reset is not available for this account' });
    }

    const existing = await query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'No account found with this email' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await query('UPDATE users SET password_hash = $1 WHERE email = $2', [passwordHash, normalizedEmail]);

    return res.json({ ok: true, message: 'Password updated. You can sign in now.' });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ error: 'Failed to reset password' });
  }
});

router.post('/logout', (_req, res) => {
  clearAuthCookie(res);
  return res.json({ ok: true });
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await getUserWithPair(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({ user });
  } catch (err) {
    console.error('Me error:', err);
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
});

export default router;

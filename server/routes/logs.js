import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { getTodayInTimezone } from '../lib/streakCalculator.js';

const router = Router();

async function getUserWithTimezone(userId) {
  const result = await query('SELECT id, pair_id, timezone FROM users WHERE id = $1', [userId]);
  return result.rows[0] || null;
}

async function getPairMemberIds(pairId) {
  const result = await query('SELECT id FROM users WHERE pair_id = $1', [pairId]);
  return result.rows.map((r) => r.id);
}

router.get('/today', requireAuth, async (req, res) => {
  try {
    const user = await getUserWithTimezone(req.userId);
    if (!user?.pair_id) {
      return res.json({ today: getTodayInTimezone(user?.timezone || 'Asia/Kolkata'), logs: [] });
    }

    const today = getTodayInTimezone(user.timezone);
    const memberIds = await getPairMemberIds(user.pair_id);

    const logsResult = await query(
      `SELECT dl.user_id, dl.log_date, dl.cigarettes, dl.updated_at,
              u.display_name, u.accent_color
       FROM daily_logs dl
       JOIN users u ON u.id = dl.user_id
       WHERE dl.user_id = ANY($1) AND dl.log_date = $2`,
      [memberIds, today]
    );

    const logs = logsResult.rows.map((r) => ({
      userId: r.user_id,
      displayName: r.display_name,
      accentColor: r.accent_color,
      cigarettes: r.cigarettes,
      logDate: r.log_date,
      updatedAt: r.updated_at,
      isCurrentUser: r.user_id === req.userId,
    }));

    return res.json({ today, logs });
  } catch (err) {
    console.error('Today logs error:', err);
    return res.status(500).json({ error: 'Failed to fetch today logs' });
  }
});

router.put('/today', requireAuth, async (req, res) => {
  try {
    const { cigarettes } = req.body;

    if (cigarettes === undefined || cigarettes === null || !Number.isInteger(cigarettes) || cigarettes < 0) {
      return res.status(400).json({ error: 'Cigarettes must be a non-negative integer' });
    }

    const user = await getUserWithTimezone(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const today = getTodayInTimezone(user.timezone);

    const result = await query(
      `INSERT INTO daily_logs (user_id, log_date, cigarettes)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, log_date)
       DO UPDATE SET cigarettes = $3, updated_at = NOW()
       RETURNING user_id, log_date, cigarettes, updated_at`,
      [req.userId, today, cigarettes]
    );

    const log = result.rows[0];
    return res.json({
      log: {
        userId: log.user_id,
        logDate: log.log_date,
        cigarettes: log.cigarettes,
        updatedAt: log.updated_at,
      },
    });
  } catch (err) {
    console.error('Update today log error:', err);
    return res.status(500).json({ error: 'Failed to save log' });
  }
});

router.get('/', requireAuth, async (req, res) => {
  try {
    const { from, to } = req.query;
    const user = await getUserWithTimezone(req.userId);

    if (!user?.pair_id) {
      return res.json({ logs: [] });
    }

    const memberIds = await getPairMemberIds(user.pair_id);

    let logsResult;
    if (from && to) {
      logsResult = await query(
        `SELECT dl.user_id, dl.log_date, dl.cigarettes, dl.updated_at,
                u.display_name, u.accent_color
         FROM daily_logs dl
         JOIN users u ON u.id = dl.user_id
         WHERE dl.user_id = ANY($1) AND dl.log_date BETWEEN $2 AND $3
         ORDER BY dl.log_date DESC, u.display_name ASC`,
        [memberIds, from, to]
      );
    } else {
      logsResult = await query(
        `SELECT dl.user_id, dl.log_date, dl.cigarettes, dl.updated_at,
                u.display_name, u.accent_color
         FROM daily_logs dl
         JOIN users u ON u.id = dl.user_id
         WHERE dl.user_id = ANY($1)
         ORDER BY dl.log_date DESC, u.display_name ASC
         LIMIT 90`,
        [memberIds]
      );
    }

    const logs = logsResult.rows.map((r) => ({
      userId: r.user_id,
      displayName: r.display_name,
      accentColor: r.accent_color,
      logDate: r.log_date,
      cigarettes: r.cigarettes,
      updatedAt: r.updated_at,
      isCurrentUser: r.user_id === req.userId,
    }));

    return res.json({ logs });
  } catch (err) {
    console.error('Logs error:', err);
    return res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

export default router;

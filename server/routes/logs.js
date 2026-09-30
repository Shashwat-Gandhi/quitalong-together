import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { getTodayInTimezone } from '../lib/streakCalculator.js';
import { isAdminEmail } from '../lib/admin.js';
import { eventsToDailyLogs, toDateKey } from '../lib/logEvents.js';

const router = Router();

async function getRequester(userId) {
  const result = await query('SELECT id, email, pair_id, timezone FROM users WHERE id = $1', [userId]);
  return result.rows[0] || null;
}

async function getPairMemberIds(pairId) {
  const result = await query('SELECT id FROM users WHERE pair_id = $1', [pairId]);
  return result.rows.map((r) => r.id);
}

function mapEventRow(row, currentUserId) {
  return {
    id: row.id,
    userId: row.user_id,
    displayName: row.display_name,
    accentColor: row.accent_color,
    logDate: toDateKey(row.log_date),
    cigarettes: row.cigarettes,
    createdAt: row.created_at,
    isCurrentUser: row.user_id === currentUserId,
  };
}

async function assertAdminOrPairMember(requester, targetUserId) {
  if (isAdminEmail(requester.email)) {
    const target = await query('SELECT pair_id FROM users WHERE id = $1', [targetUserId]);
    if (target.rows.length === 0) return { ok: false, status: 404, error: 'User not found' };
    if (requester.pair_id && target.rows[0].pair_id !== requester.pair_id) {
      return { ok: false, status: 403, error: 'Not allowed to manage this user' };
    }
    return { ok: true };
  }

  if (targetUserId !== requester.id) {
    return { ok: false, status: 403, error: 'Not allowed to manage this user' };
  }

  return { ok: true };
}

router.get('/today', requireAuth, async (req, res) => {
  try {
    const requester = await getRequester(req.userId);
    if (!requester?.pair_id) {
      return res.json({ today: getTodayInTimezone(requester?.timezone || 'Asia/Kolkata'), logs: [] });
    }

    const today = getTodayInTimezone(requester.timezone);
    const memberIds = await getPairMemberIds(requester.pair_id);

    const eventsResult = await query(
      `SELECT le.id, le.user_id, le.log_date, le.cigarettes, le.created_at,
              u.display_name, u.accent_color
       FROM log_events le
       JOIN users u ON u.id = le.user_id
       WHERE le.user_id = ANY($1) AND le.log_date = $2
       ORDER BY le.created_at ASC`,
      [memberIds, today]
    );

    const byUser = new Map();
    for (const memberId of memberIds) {
      byUser.set(memberId, {
        userId: memberId,
        events: [],
        cigarettes: 0,
        updatedAt: null,
      });
    }

    for (const row of eventsResult.rows) {
      const entry = byUser.get(row.user_id);
      if (!entry) continue;
      entry.events.push({
        id: row.id,
        cigarettes: row.cigarettes,
        createdAt: row.created_at,
      });
      entry.cigarettes += row.cigarettes;
      entry.updatedAt = row.created_at;
    }

    const logs = eventsResult.rows.length
      ? [...new Set(eventsResult.rows.map((r) => r.user_id))].map((userId) => {
          const sample = eventsResult.rows.find((r) => r.user_id === userId);
          const summary = byUser.get(userId);
          return {
            userId,
            displayName: sample.display_name,
            accentColor: sample.accent_color,
            cigarettes: summary.cigarettes,
            logDate: today,
            updatedAt: summary.updatedAt,
            events: summary.events,
            isCurrentUser: userId === req.userId,
          };
        })
      : [];

    const membersResult = await query(
      `SELECT id, display_name, accent_color FROM users WHERE id = ANY($1)`,
      [memberIds]
    );

    for (const member of membersResult.rows) {
      if (!logs.find((l) => l.userId === member.id)) {
        logs.push({
          userId: member.id,
          displayName: member.display_name,
          accentColor: member.accent_color,
          cigarettes: 0,
          logDate: today,
          updatedAt: null,
          events: [],
          isCurrentUser: member.id === req.userId,
        });
      }
    }

    return res.json({ today, logs });
  } catch (err) {
    console.error('Today logs error:', err);
    return res.status(500).json({ error: 'Failed to fetch today logs' });
  }
});

router.post('/today', requireAuth, async (req, res) => {
  try {
    const { cigarettes } = req.body;

    if (cigarettes === undefined || cigarettes === null || !Number.isInteger(cigarettes) || cigarettes < 0) {
      return res.status(400).json({ error: 'Cigarettes must be a non-negative integer' });
    }

    const requester = await getRequester(req.userId);
    if (!requester) {
      return res.status(404).json({ error: 'User not found' });
    }

    const today = getTodayInTimezone(requester.timezone);

    const result = await query(
      `INSERT INTO log_events (user_id, log_date, cigarettes)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, log_date, cigarettes, created_at`,
      [req.userId, today, cigarettes]
    );

    const event = result.rows[0];
    return res.json({
      event: {
        id: event.id,
        userId: event.user_id,
        logDate: toDateKey(event.log_date),
        cigarettes: event.cigarettes,
        createdAt: event.created_at,
      },
    });
  } catch (err) {
    console.error('Create today log error:', err);
    return res.status(500).json({ error: 'Failed to save log' });
  }
});

router.get('/', requireAuth, async (req, res) => {
  try {
    const { from, to } = req.query;
    const requester = await getRequester(req.userId);

    if (!requester?.pair_id) {
      return res.json({ logs: [] });
    }

    const memberIds = await getPairMemberIds(requester.pair_id);

    let eventsResult;
    if (from && to) {
      eventsResult = await query(
        `SELECT le.id, le.user_id, le.log_date, le.cigarettes, le.created_at,
                u.display_name, u.accent_color
         FROM log_events le
         JOIN users u ON u.id = le.user_id
         WHERE le.user_id = ANY($1) AND le.log_date BETWEEN $2 AND $3
         ORDER BY le.log_date DESC, le.created_at DESC`,
        [memberIds, from, to]
      );
    } else {
      eventsResult = await query(
        `SELECT le.id, le.user_id, le.log_date, le.cigarettes, le.created_at,
                u.display_name, u.accent_color
         FROM log_events le
         JOIN users u ON u.id = le.user_id
         WHERE le.user_id = ANY($1)
         ORDER BY le.log_date DESC, le.created_at DESC
         LIMIT 500`,
        [memberIds]
      );
    }

    const logs = eventsResult.rows.map((row) => mapEventRow(row, req.userId));
    return res.json({ logs });
  } catch (err) {
    console.error('Logs error:', err);
    return res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

router.get('/admin', requireAuth, async (req, res) => {
  try {
    const requester = await getRequester(req.userId);
    if (!isAdminEmail(requester?.email)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    if (!requester?.pair_id) {
      return res.json({ date: req.query.date || null, members: [], events: [] });
    }

    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    const membersResult = await query(
      `SELECT id, display_name, accent_color, email
       FROM users WHERE pair_id = $1
       ORDER BY created_at ASC`,
      [requester.pair_id]
    );

    const memberIds = membersResult.rows.map((m) => m.id);
    const eventsResult = await query(
      `SELECT le.id, le.user_id, le.log_date, le.cigarettes, le.created_at,
              u.display_name, u.accent_color
       FROM log_events le
       JOIN users u ON u.id = le.user_id
       WHERE le.user_id = ANY($1) AND le.log_date = $2
       ORDER BY le.created_at ASC`,
      [memberIds, date]
    );

    return res.json({
      date,
      members: membersResult.rows.map((m) => ({
        id: m.id,
        displayName: m.display_name,
        accentColor: m.accent_color,
        email: m.email,
        isCurrentUser: m.id === req.userId,
      })),
      events: eventsResult.rows.map((row) => mapEventRow(row, req.userId)),
    });
  } catch (err) {
    console.error('Admin logs error:', err);
    return res.status(500).json({ error: 'Failed to fetch admin logs' });
  }
});

router.post('/events', requireAuth, async (req, res) => {
  try {
    const { userId, logDate, cigarettes } = req.body;
    const requester = await getRequester(req.userId);

    if (!userId || !logDate || cigarettes === undefined || cigarettes === null) {
      return res.status(400).json({ error: 'User, date, and cigarettes are required' });
    }

    if (!Number.isInteger(cigarettes) || cigarettes < 0) {
      return res.status(400).json({ error: 'Cigarettes must be a non-negative integer' });
    }

    if (!isAdminEmail(requester.email)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const access = await assertAdminOrPairMember(requester, userId);
    if (!access.ok) {
      return res.status(access.status).json({ error: access.error });
    }

    const result = await query(
      `INSERT INTO log_events (user_id, log_date, cigarettes)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, log_date, cigarettes, created_at`,
      [userId, logDate, cigarettes]
    );

    const event = result.rows[0];
    return res.status(201).json({
      event: {
        id: event.id,
        userId: event.user_id,
        logDate: toDateKey(event.log_date),
        cigarettes: event.cigarettes,
        createdAt: event.created_at,
      },
    });
  } catch (err) {
    console.error('Create event error:', err);
    return res.status(500).json({ error: 'Failed to create log' });
  }
});

router.patch('/events/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { cigarettes, logDate } = req.body;
    const requester = await getRequester(req.userId);

    if (!isAdminEmail(requester.email)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const existing = await query('SELECT id, user_id FROM log_events WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Log not found' });
    }

    const access = await assertAdminOrPairMember(requester, existing.rows[0].user_id);
    if (!access.ok) {
      return res.status(access.status).json({ error: access.error });
    }

    if (cigarettes !== undefined && (!Number.isInteger(cigarettes) || cigarettes < 0)) {
      return res.status(400).json({ error: 'Cigarettes must be a non-negative integer' });
    }

    if (cigarettes === undefined && !logDate) {
      return res.status(400).json({ error: 'Nothing to update' });
    }

    const result = await query(
      `UPDATE log_events
       SET cigarettes = COALESCE($2, cigarettes),
           log_date = COALESCE($3, log_date)
       WHERE id = $1
       RETURNING id, user_id, log_date, cigarettes, created_at`,
      [id, cigarettes ?? null, logDate ?? null]
    );

    const event = result.rows[0];
    return res.json({
      event: {
        id: event.id,
        userId: event.user_id,
        logDate: toDateKey(event.log_date),
        cigarettes: event.cigarettes,
        createdAt: event.created_at,
      },
    });
  } catch (err) {
    console.error('Update event error:', err);
    return res.status(500).json({ error: 'Failed to update log' });
  }
});

router.delete('/events/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const requester = await getRequester(req.userId);

    if (!isAdminEmail(requester.email)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const existing = await query('SELECT id, user_id FROM log_events WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Log not found' });
    }

    const access = await assertAdminOrPairMember(requester, existing.rows[0].user_id);
    if (!access.ok) {
      return res.status(access.status).json({ error: access.error });
    }

    await query('DELETE FROM log_events WHERE id = $1', [id]);
    return res.json({ ok: true });
  } catch (err) {
    console.error('Delete event error:', err);
    return res.status(500).json({ error: 'Failed to delete log' });
  }
});

export default router;

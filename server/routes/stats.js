import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth } from '../middleware/requireAuth.js';
import {
  buildUserStats,
  buildWeekChartData,
  getTodayInTimezone,
  getMonthStart,
} from '../lib/streakCalculator.js';

const router = Router();

const STATUS_MESSAGES = [
  'Stronger than yesterday',
  'We got this!',
  'One day at a time',
  'Keep pushing forward',
  'Small steps, big changes',
];

function pickStatus(seed) {
  return STATUS_MESSAGES[seed % STATUS_MESSAGES.length];
}

router.get('/dashboard', requireAuth, async (req, res) => {
  try {
    const userResult = await query(
      `SELECT u.id, u.display_name, u.accent_color, u.timezone, u.pair_id
       FROM users u WHERE u.id = $1`,
      [req.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentUser = userResult.rows[0];
    const today = getTodayInTimezone(currentUser.timezone);

    if (!currentUser.pair_id) {
      return res.json({
        today,
        pairComplete: false,
        users: [],
        weekChart: null,
      });
    }

    const membersResult = await query(
      `SELECT id, display_name, accent_color
       FROM users WHERE pair_id = $1
       ORDER BY created_at ASC`,
      [currentUser.pair_id]
    );

    const members = membersResult.rows;
    const memberIds = members.map((m) => m.id);

    const monthStart = getMonthStart(today);
    const logsResult = await query(
      `SELECT user_id, log_date, cigarettes
       FROM daily_logs
       WHERE user_id = ANY($1) AND log_date <= $2`,
      [memberIds, today]
    );

    const logsByUser = {};
    for (const m of members) {
      logsByUser[m.id] = [];
    }
    for (const log of logsResult.rows) {
      logsByUser[log.user_id].push(log);
    }

    const users = members.map((m, index) => {
      const stats = buildUserStats(logsByUser[m.id] || [], today);
      const todayLog = (logsByUser[m.id] || []).find(
        (l) => String(l.log_date).slice(0, 10) === today
      );

      return {
        id: m.id,
        displayName: m.display_name,
        accentColor: m.accent_color,
        isCurrentUser: m.id === req.userId,
        currentStreak: stats.currentStreak,
        longestStreak: stats.longestStreak,
        monthTotal: stats.monthTotal,
        todayCigarettes: todayLog ? todayLog.cigarettes : null,
        hasLoggedToday: !!todayLog,
        statusMessage: pickStatus(index + stats.currentStreak),
      };
    });

    let weekChart = null;
    if (members.length >= 1) {
      const user1 = members[0];
      const user2 = members[1] || members[0];
      weekChart = buildWeekChartData(
        logsByUser[user1.id] || [],
        logsByUser[user2.id] || [],
        today,
        user1.display_name,
        user2.display_name
      );
      weekChart.user1Color = user1.accent_color;
      weekChart.user2Color = user2.accent_color;
    }

    const pairResult = await query(
      'SELECT user1_id, user2_id, invite_code FROM pairs WHERE id = $1',
      [currentUser.pair_id]
    );
    const pair = pairResult.rows[0];

    return res.json({
      today,
      pairComplete: !!(pair?.user1_id && pair?.user2_id),
      inviteCode: pair?.invite_code,
      users,
      weekChart,
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    return res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

router.get('/summary', requireAuth, async (req, res) => {
  try {
    const userResult = await query(
      'SELECT id, pair_id, timezone FROM users WHERE id = $1',
      [req.userId]
    );

    const user = userResult.rows[0];
    if (!user?.pair_id) {
      return res.json({ users: [] });
    }

    const today = getTodayInTimezone(user.timezone);
    const membersResult = await query(
      `SELECT id, display_name, accent_color FROM users WHERE pair_id = $1 ORDER BY created_at ASC`,
      [user.pair_id]
    );

    const members = membersResult.rows;
    const memberIds = members.map((m) => m.id);

    const logsResult = await query(
      `SELECT user_id, log_date, cigarettes FROM daily_logs WHERE user_id = ANY($1)`,
      [memberIds]
    );

    const logsByUser = {};
    for (const m of members) logsByUser[m.id] = [];
    for (const log of logsResult.rows) logsByUser[log.user_id].push(log);

    const users = members.map((m) => {
      const stats = buildUserStats(logsByUser[m.id], today);
      const allLogs = logsByUser[m.id];
      const totalDaysLogged = allLogs.length;
      const smokeFreeDays = allLogs.filter((l) => l.cigarettes === 0).length;
      const totalCigarettes = allLogs.reduce((sum, l) => sum + l.cigarettes, 0);
      const avgPerDay = totalDaysLogged > 0 ? (totalCigarettes / totalDaysLogged).toFixed(1) : 0;

      return {
        id: m.id,
        displayName: m.display_name,
        accentColor: m.accent_color,
        isCurrentUser: m.id === req.userId,
        currentStreak: stats.currentStreak,
        longestStreak: stats.longestStreak,
        monthTotal: stats.monthTotal,
        totalCigarettes,
        smokeFreeDays,
        totalDaysLogged,
        avgPerDay,
      };
    });

    return res.json({ users, today });
  } catch (err) {
    console.error('Summary stats error:', err);
    return res.status(500).json({ error: 'Failed to fetch summary stats' });
  }
});

export default router;

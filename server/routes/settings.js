import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

router.patch('/profile', requireAuth, async (req, res) => {
  try {
    const { displayName } = req.body;

    if (!displayName || displayName.trim().length === 0) {
      return res.status(400).json({ error: 'Display name is required' });
    }

    const result = await query(
      `UPDATE users SET display_name = $1 WHERE id = $2
       RETURNING id, email, display_name, accent_color, timezone, pair_id`,
      [displayName.trim(), req.userId]
    );

    const row = result.rows[0];
    return res.json({
      user: {
        id: row.id,
        email: row.email,
        displayName: row.display_name,
        accentColor: row.accent_color,
        timezone: row.timezone,
        pairId: row.pair_id,
      },
    });
  } catch (err) {
    console.error('Profile update error:', err);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;

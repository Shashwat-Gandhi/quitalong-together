import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

async function getUserPair(userId) {
  const result = await query(
    `SELECT u.pair_id, p.invite_code, p.user1_id, p.user2_id
     FROM users u
     JOIN pairs p ON p.id = u.pair_id
     WHERE u.id = $1`,
    [userId]
  );
  return result.rows[0] || null;
}

router.get('/invite', requireAuth, async (req, res) => {
  try {
    const pair = await getUserPair(req.userId);
    if (!pair) {
      return res.status(404).json({ error: 'No pair found' });
    }

    if (pair.user1_id !== req.userId) {
      return res.status(403).json({ error: 'Only the pair creator can view the invite code' });
    }

    return res.json({ inviteCode: pair.invite_code, pairComplete: !!pair.user2_id });
  } catch (err) {
    console.error('Invite error:', err);
    return res.status(500).json({ error: 'Failed to fetch invite code' });
  }
});

router.get('/members', requireAuth, async (req, res) => {
  try {
    const pair = await getUserPair(req.userId);
    if (!pair) {
      return res.json({ members: [], pairComplete: false });
    }

    const membersResult = await query(
      `SELECT id, display_name, accent_color, email
       FROM users
       WHERE pair_id = $1
       ORDER BY created_at ASC`,
      [pair.pair_id]
    );

    const members = membersResult.rows.map((m) => ({
      id: m.id,
      displayName: m.display_name,
      accentColor: m.accent_color,
      email: m.email,
      isCurrentUser: m.id === req.userId,
    }));

    return res.json({
      members,
      pairComplete: !!(pair.user1_id && pair.user2_id),
      inviteCode: pair.invite_code,
    });
  } catch (err) {
    console.error('Members error:', err);
    return res.status(500).json({ error: 'Failed to fetch pair members' });
  }
});

export default router;

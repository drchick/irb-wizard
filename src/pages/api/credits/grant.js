/**
 * POST /api/credits/grant
 * Internal: grants credits to a user by user_id.
 * Called from notify-signup.js (beta credit) — no user auth needed, uses service role.
 * Body: { userId, amount }
 * Security: only callable server-side (no public exposure needed).
 * Add an internal secret header to prevent abuse if exposed.
 */
import { addCredits } from '../../../lib/credits';

const INTERNAL_SECRET = process.env.INTERNAL_SECRET ?? 'irbwiz-internal';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Simple internal secret check
  if (req.headers['x-internal-secret'] !== INTERNAL_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { userId, amount = 1 } = req.body ?? {};
  if (!userId) return res.status(400).json({ error: 'userId required' });

  try {
    const credits = await addCredits(userId, amount);
    return res.status(200).json({ credits, ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

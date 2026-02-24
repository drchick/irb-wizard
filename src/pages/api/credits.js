/**
 * GET /api/credits — return authenticated user's credit balance
 */
import { getCredits, getUserFromReq } from '../../lib/credits';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const user = await getUserFromReq(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const credits = await getCredits(user.id);
    return res.status(200).json({ credits });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

/**
 * POST /api/credits/deduct
 * Deducts 1 credit for the authenticated user.
 * Body: { action: 'ai-comprehensive' | 'documents' }
 * Returns: { credits: <new balance> }
 */
import { deductCredit, getUserFromReq } from '../../../lib/credits';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const user = await getUserFromReq(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const credits = await deductCredit(user.id);
    return res.status(200).json({ credits, ok: true });
  } catch (err) {
    if (err.message === 'Insufficient credits') {
      return res.status(402).json({ error: 'Insufficient credits. Please purchase more to continue.' });
    }
    return res.status(500).json({ error: err.message });
  }
}

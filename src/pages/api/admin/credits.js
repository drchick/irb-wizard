/**
 * POST /api/admin/credits
 * Grants credits to a specific user. Admin only.
 * Body: { user_id: string, amount: number }
 * Returns: { credits: number, ok: true }
 */
import { createClient } from '@supabase/supabase-js';
import { addCredits } from '../../../lib/credits';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  );
}

async function verifyAdmin(req) {
  const authHeader = req.headers.authorization ?? '';
  if (!authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  const { data: { user }, error } = await getAdminClient().auth.getUser(token);
  if (error || !user || user.email?.trim() !== (process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? '').trim()) return null;
  return user;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const admin = await verifyAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Forbidden' });

  const { user_id, amount } = req.body ?? {};

  if (!user_id) return res.status(400).json({ error: 'user_id is required.' });

  const amountInt = parseInt(amount ?? '0', 10);
  if (!amountInt || amountInt < 1 || amountInt > 500) {
    return res.status(400).json({ error: 'amount must be between 1 and 500.' });
  }

  try {
    const newBalance = await addCredits(user_id, amountInt);
    return res.status(200).json({ credits: newBalance, ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

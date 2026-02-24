/**
 * GET /api/admin/purchases — list all completed purchases
 */
import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
);

async function verifyAdmin(req) {
  const token = (req.headers.authorization ?? '').replace('Bearer ', '');
  if (!token) return null;
  const { data: { user }, error } = await sb.auth.getUser(token);
  if (error || !user) return null;
  return user.email === (process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? '') ? user : null;
}

export default async function handler(req, res) {
  const admin = await verifyAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Forbidden' });

  if (req.method === 'GET') {
    const { data, error } = await sb
      .from('purchases')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) return res.status(200).json({ purchases: [], note: 'purchases table not set up yet.' });
    return res.status(200).json({ purchases: data ?? [] });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

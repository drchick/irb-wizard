/**
 * GET  /api/admin/promo-codes  — list all promo codes
 * POST /api/admin/promo-codes  — create a new promo code
 * DELETE /api/admin/promo-codes?id=xxx — delete a promo code
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
  return user.email?.trim() === (process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? '').trim() ? user : null;
}

export default async function handler(req, res) {
  const admin = await verifyAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Forbidden' });

  if (req.method === 'GET') {
    const { data, error } = await sb
      .from('promo_codes')
      .select('*, promo_redemptions(count)')
      .order('created_at', { ascending: false });
    if (error) return res.status(200).json({ codes: [], note: 'promo_codes table not set up yet.' });
    return res.status(200).json({ codes: data ?? [] });
  }

  if (req.method === 'POST') {
    const { code, credits, max_uses, expires_at } = req.body ?? {};
    if (!code?.trim() || !credits) {
      return res.status(400).json({ error: 'code and credits are required.' });
    }
    const { data, error } = await sb
      .from('promo_codes')
      .insert({
        code:      code.trim().toUpperCase(),
        credits:   parseInt(credits),
        max_uses:  max_uses ? parseInt(max_uses) : null,
        expires_at: expires_at || null,
      })
      .select()
      .single();
    if (error) return res.status(400).json({ error: error.message });
    return res.status(201).json({ code: data });
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'id required' });
    const { error } = await sb.from('promo_codes').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

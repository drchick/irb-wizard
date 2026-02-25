/**
 * GET  /api/admin/messages       — list all contact submissions
 * PATCH /api/admin/messages      — mark a message read/unread { id, read }
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
  const adminEmail = (process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? '').trim();
  return user.email?.trim() === adminEmail ? user : null;
}

export default async function handler(req, res) {
  const admin = await verifyAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Forbidden' });

  // ── GET: list messages ───────────────────────────────────────────────────
  if (req.method === 'GET') {
    const { data, error } = await sb
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) {
      return res.status(200).json({ messages: [], note: 'contact_submissions table not set up yet.' });
    }
    return res.status(200).json({ messages: data ?? [] });
  }

  // ── PATCH: mark read/unread ──────────────────────────────────────────────
  if (req.method === 'PATCH') {
    const { id, read } = req.body ?? {};
    if (!id) return res.status(400).json({ error: 'id required' });
    const { error } = await sb
      .from('contact_submissions')
      .update({ read: !!read })
      .eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

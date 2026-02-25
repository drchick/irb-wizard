import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
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
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const admin = await verifyAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Forbidden' });

  try {
    const sb = getAdminClient();
    const { data, error } = await sb
      .from('usage_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);

    if (error) {
      // Table may not exist yet — return empty gracefully
      return res.status(200).json({ usage: [], note: 'usage_logs table not found — see Usage tab for setup SQL' });
    }

    return res.status(200).json({ usage: data ?? [] });
  } catch {
    return res.status(200).json({ usage: [] });
  }
}

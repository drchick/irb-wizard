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

  const { data: { users = [] } } = await getAdminClient().auth.admin.listUsers({ perPage: 1000 });
  const sorted = [...users].sort((a, b) => b.created_at.localeCompare(a.created_at));
  return res.status(200).json({ users: sorted });
}

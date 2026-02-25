import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

async function verifyAdmin(req) {
  const authHeader = req.headers.authorization ?? '';
  if (!authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  const sb = getAdminClient();
  const { data: { user }, error } = await sb.auth.getUser(token);
  if (error || !user) return null;
  if (user.email?.trim() !== (process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? '').trim()) return null;
  return user;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const admin = await verifyAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Forbidden' });

  const sb      = getAdminClient();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Users
  const { data: { users = [] } } = await sb.auth.admin.listUsers({ perPage: 1000 });
  const totalUsers       = users.length;
  const newUsersThisWeek = users.filter(u => u.created_at > weekAgo).length;
  const recentUsers      = [...users].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 5);

  // Usage logs (graceful if table doesn't exist)
  let totalAiCalls = 0, aiCallsThisWeek = 0, recentUsage = [];
  try {
    const { data: logs } = await sb.from('usage_logs').select('*').order('created_at', { ascending: false }).limit(500);
    if (logs) {
      totalAiCalls    = logs.length;
      aiCallsThisWeek = logs.filter(l => l.created_at > weekAgo).length;
      recentUsage     = logs.slice(0, 5);
    }
  } catch { /* table may not exist yet */ }

  return res.status(200).json({ totalUsers, newUsersThisWeek, totalAiCalls, aiCallsThisWeek, recentUsers, recentUsage });
}

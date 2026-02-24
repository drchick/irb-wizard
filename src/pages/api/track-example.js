/**
 * POST /api/track-example
 *
 * Logs when a visitor loads a sample study into the wizard.
 * Writes an entry to usage_logs so it appears in the admin Usage tab.
 *
 * Body: { studyId: string, studyTitle: string }
 *
 * This endpoint is public (no auth required) so anonymous visitors can be
 * tracked. The user_email is read from the session token if present,
 * otherwise logged as 'Anonymous'.
 */
import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { studyId, studyTitle } = req.body ?? {};
  if (!studyId) return res.status(400).json({ error: 'studyId required' });

  // Try to resolve user email from Bearer token (optional)
  let userEmail = 'Anonymous';
  try {
    const token = (req.headers.authorization ?? '').replace('Bearer ', '');
    if (token) {
      const { data: { user } } = await sb.auth.getUser(token);
      if (user?.email) userEmail = user.email;
    }
  } catch {
    // token invalid or not provided — keep 'Anonymous'
  }

  // Log to usage_logs (graceful fail if table doesn't exist yet)
  try {
    await sb.from('usage_logs').insert({
      user_email: userEmail,
      endpoint:   'example-load',
      section:    studyId,            // e.g. "exempt-cat2-survey"
    });
  } catch {
    // Table may not be set up yet — don't block the user
  }

  return res.status(200).json({ ok: true });
}

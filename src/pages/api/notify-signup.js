/**
 * POST /api/notify-signup
 * Called from login.jsx immediately after a successful account creation.
 * Sends:
 *   1. Welcome email to the new user
 *   2. New-user alert to admin
 *
 * Body: { email, name? }
 * No auth required — public endpoint (email is validated, not sensitive).
 */
import { sendWelcomeEmail, notifyAdminNewUser } from '../../lib/email';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, name } = req.body ?? {};
  if (!email || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Valid email required.' });
  }

  // Fire both emails in parallel — don't await failures
  await Promise.allSettled([
    sendWelcomeEmail({ to: email, name: name ?? '' }),
    notifyAdminNewUser({ email, name: name ?? '' }),
  ]);

  return res.status(200).json({ ok: true });
}

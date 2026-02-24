/**
 * POST /api/notify-signup
 * Called from login.jsx immediately after a successful account creation.
 * Sends:
 *   1. Welcome email to the new user
 *   2. New-user alert to admin
 *   3. Grants 1 free beta credit to the new user
 *
 * Body: { email, name?, userId }
 */
import { sendWelcomeEmail, notifyAdminNewUser } from '../../lib/email';
import { addCredits } from '../../lib/credits';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, name, userId } = req.body ?? {};
  if (!email || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Valid email required.' });
  }

  // Fire emails + beta credit grant in parallel
  await Promise.allSettled([
    sendWelcomeEmail({ to: email, name: name ?? '' }),
    notifyAdminNewUser({ email, name: name ?? '' }),
    userId ? addCredits(userId, 1) : Promise.resolve(), // 1 free beta credit
  ]);

  return res.status(200).json({ ok: true });
}

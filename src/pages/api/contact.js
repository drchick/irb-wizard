/**
 * POST /api/contact
 * Saves submission to Supabase + emails admin via Resend.
 * Works gracefully if contact_submissions table or Resend key is missing.
 */
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, subject, message } = req.body ?? {};

  // ── Validate ──────────────────────────────────────────────────────────────
  if (!name?.trim())    return res.status(400).json({ error: 'Name is required.' });
  if (!email?.trim())   return res.status(400).json({ error: 'Email is required.' });
  if (!message?.trim()) return res.status(400).json({ error: 'Message is required.' });
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Invalid email address.' });

  const payload = {
    name:    name.trim(),
    email:   email.trim().toLowerCase(),
    subject: subject?.trim() || 'General Question',
    message: message.trim(),
  };

  // ── Save to Supabase ──────────────────────────────────────────────────────
  const { error: dbErr } = await sb.from('contact_submissions').insert(payload);
  if (dbErr) {
    // Table may not exist yet — log but don't block the user
    console.warn('[contact] Supabase insert failed:', dbErr.message);
  }

  // ── Send email via Resend ─────────────────────────────────────────────────
  const resendKey  = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL ?? process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  if (resendKey && adminEmail) {
    try {
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from:     'IRBWiz Contact <irbwiz@doctordissertation.com>',
        to:       [adminEmail],
        reply_to: payload.email,
        subject:  `[IRBWiz] ${payload.subject} — ${payload.name}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
            <h2 style="color:#1e3a5f">New Contact Form Submission</h2>
            <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
              <tr><td style="padding:6px 0;color:#666;width:100px"><strong>Name</strong></td><td>${payload.name}</td></tr>
              <tr><td style="padding:6px 0;color:#666"><strong>Email</strong></td><td><a href="mailto:${payload.email}">${payload.email}</a></td></tr>
              <tr><td style="padding:6px 0;color:#666"><strong>Subject</strong></td><td>${payload.subject}</td></tr>
            </table>
            <hr style="border:1px solid #eee;margin:16px 0">
            <p style="color:#333;line-height:1.6;white-space:pre-wrap">${payload.message}</p>
            <hr style="border:1px solid #eee;margin:24px 0">
            <p style="color:#999;font-size:12px">Sent via the IRBWiz contact form · <a href="https://irbwiz.help/admin">View in Admin Panel</a></p>
          </div>
        `,
      });
    } catch (emailErr) {
      // Don't fail the request if email delivery fails
      console.error('[contact] Resend error:', emailErr.message);
    }
  }

  return res.status(200).json({ ok: true });
}

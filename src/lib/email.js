/**
 * src/lib/email.js — Centralised Resend email helpers
 *
 * All functions are fire-and-forget safe (they swallow errors) unless
 * called with `await` by the caller.  Always resolves — never throws.
 *
 * Required env vars:
 *   RESEND_API_KEY    — from resend.com (free: 3 k emails/month)
 *   ADMIN_EMAIL       — recipient for all admin notifications
 *
 * From addresses use the verified irbwiz.help domain.
 */
import { Resend } from 'resend';

const ADMIN_EMAIL  = process.env.ADMIN_EMAIL ?? process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? '';
const FROM_NOREPLY = 'IRBWiz <hello@irbwiz.help>';
const ADMIN_PANEL  = 'https://irbwiz.help/admin';
const WIZARD_URL   = 'https://irbwiz.help/wizard';

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

// ── Shared layout wrapper ─────────────────────────────────────────────────────
function layout(bodyHtml) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)">
      <!-- Header -->
      <tr><td style="background:#0f1e35;padding:24px 32px">
        <span style="font-size:22px;font-weight:800;color:#f5c842;letter-spacing:-0.5px">IRBWiz</span>
        <span style="font-size:11px;color:#94a3b8;margin-left:10px;vertical-align:middle">by Symbiotic Scholar</span>
      </td></tr>
      <!-- Body -->
      <tr><td style="padding:32px">${bodyHtml}</td></tr>
      <!-- Footer -->
      <tr><td style="background:#f8fafc;padding:18px 32px;border-top:1px solid #e2e8f0">
        <p style="margin:0;font-size:11px;color:#94a3b8">
          © ${new Date().getFullYear()} Symbiotic Scholar · <a href="https://irbwiz.help" style="color:#94a3b8">irbwiz.help</a>
          · <a href="mailto:hello@irbwiz.help" style="color:#94a3b8">hello@irbwiz.help</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

function btn(href, label) {
  return `<a href="${href}" style="display:inline-block;background:#f5c842;color:#0f1e35;font-weight:700;font-size:14px;padding:12px 28px;border-radius:8px;text-decoration:none;margin-top:8px">${label}</a>`;
}

function kv(key, val) {
  return `<tr>
    <td style="padding:6px 0;color:#64748b;font-size:13px;width:120px;vertical-align:top"><strong>${key}</strong></td>
    <td style="padding:6px 0;color:#1e293b;font-size:13px">${val}</td>
  </tr>`;
}

// ── 1. Welcome email → new user ───────────────────────────────────────────────
export async function sendWelcomeEmail({ to, name }) {
  const resend = getResend();
  if (!resend) return;
  const displayName = name || to;
  try {
    await resend.emails.send({
      from:    FROM_NOREPLY,
      to:      [to],
      subject: 'Welcome to IRBWiz — your protocol wizard is ready',
      html: layout(`
        <h2 style="margin:0 0 8px;font-size:22px;color:#0f1e35">Welcome to IRBWiz, ${displayName}! 🎉</h2>
        <p style="color:#475569;line-height:1.6;margin:0 0 20px">
          You're all set to start preparing your IRB protocol.
          IRBWiz walks you through every requirement, flags potential issues before your IRB sees them,
          and generates ready-to-submit documents in minutes.
        </p>
        <p style="color:#475569;line-height:1.6;margin:0 0 24px">
          <strong>During beta, all AI review features are completely free.</strong>
          Just log in and click <em>Start a Protocol</em> to get going.
        </p>
        ${btn(WIZARD_URL, 'Open the Wizard →')}
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0">
        <p style="color:#94a3b8;font-size:12px;margin:0">
          Questions? Reply to this email or visit
          <a href="https://irbwiz.help/contact" style="color:#f5c842">irbwiz.help/contact</a>.
        </p>
      `),
    });
  } catch (err) {
    console.error('[email] sendWelcomeEmail failed:', err.message);
  }
}

// ── 2. Admin: new user signed up ──────────────────────────────────────────────
export async function notifyAdminNewUser({ email, name }) {
  const resend = getResend();
  if (!resend || !ADMIN_EMAIL) return;
  try {
    await resend.emails.send({
      from:    FROM_NOREPLY,
      to:      [ADMIN_EMAIL],
      subject: `[IRBWiz] New signup — ${email}`,
      html: layout(`
        <h2 style="margin:0 0 16px;font-size:18px;color:#0f1e35">New User Signed Up</h2>
        <table cellpadding="0" cellspacing="0" style="margin-bottom:24px">
          ${kv('Email',   `<a href="mailto:${email}" style="color:#0f1e35">${email}</a>`)}
          ${kv('Name',    name || '—')}
          ${kv('Time',    new Date().toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: 'medium', timeStyle: 'short' }) + ' ET')}
        </table>
        ${btn(ADMIN_PANEL + '?tab=users', 'View in Admin Panel →')}
      `),
    });
  } catch (err) {
    console.error('[email] notifyAdminNewUser failed:', err.message);
  }
}

// ── 3. Admin: full AI protocol review run ─────────────────────────────────────
export async function notifyAdminAIReview({ userEmail, type, section }) {
  const resend = getResend();
  if (!resend || !ADMIN_EMAIL) return;
  const isComprehensive = type === 'ai-comprehensive';
  const label = isComprehensive ? 'Full Protocol Review' : `Section Review (${section ?? '?'})`;
  try {
    await resend.emails.send({
      from:    FROM_NOREPLY,
      to:      [ADMIN_EMAIL],
      subject: `[IRBWiz] AI ${label} — ${userEmail ?? 'Anonymous'}`,
      html: layout(`
        <h2 style="margin:0 0 16px;font-size:18px;color:#0f1e35">AI Review Used</h2>
        <table cellpadding="0" cellspacing="0" style="margin-bottom:24px">
          ${kv('User',    userEmail ? `<a href="mailto:${userEmail}" style="color:#0f1e35">${userEmail}</a>` : 'Anonymous')}
          ${kv('Type',    `<strong>${label}</strong>`)}
          ${kv('Time',    new Date().toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: 'medium', timeStyle: 'short' }) + ' ET')}
        </table>
        ${btn(ADMIN_PANEL + '?tab=usage', 'View Usage Log →')}
      `),
    });
  } catch (err) {
    console.error('[email] notifyAdminAIReview failed:', err.message);
  }
}

// ── 4. Admin: purchase completed (stub — wired up when Stripe is added) ───────
export async function notifyAdminPurchase({ userEmail, plan, amount, credits }) {
  const resend = getResend();
  if (!resend || !ADMIN_EMAIL) return;
  try {
    await resend.emails.send({
      from:    FROM_NOREPLY,
      to:      [ADMIN_EMAIL],
      subject: `[IRBWiz] New purchase — ${plan} — ${userEmail}`,
      html: layout(`
        <h2 style="margin:0 0 16px;font-size:18px;color:#0f1e35">New Purchase 🎉</h2>
        <table cellpadding="0" cellspacing="0" style="margin-bottom:24px">
          ${kv('User',    `<a href="mailto:${userEmail}" style="color:#0f1e35">${userEmail}</a>`)}
          ${kv('Plan',    plan)}
          ${kv('Amount',  `$${(amount / 100).toFixed(2)}`)}
          ${kv('Credits', String(credits))}
          ${kv('Time',    new Date().toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: 'medium', timeStyle: 'short' }) + ' ET')}
        </table>
        ${btn(ADMIN_PANEL + '?tab=purchases', 'View Purchases →')}
      `),
    });
  } catch (err) {
    console.error('[email] notifyAdminPurchase failed:', err.message);
  }
}

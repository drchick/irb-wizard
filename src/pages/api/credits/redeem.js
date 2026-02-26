/**
 * POST /api/credits/redeem
 * Redeem a promo / beta code to add credits.
 * Body: { code: 'BETA2025' }
 * Returns: { credits: <new balance>, added: <amount added> }
 */
import { createClient } from '@supabase/supabase-js';
import { addCredits, getUserFromReq } from '../../../lib/credits';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = await getUserFromReq(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const rawCode = (req.body?.code ?? '').trim().toUpperCase();
  if (!rawCode) return res.status(400).json({ error: 'Code is required.' });

  // ── Check if already redeemed by this user ────────────────────────────────
  const { data: existing } = await sb
    .from('irb_promo_redemptions')
    .select('id')
    .eq('user_id', user.id)
    .eq('code', rawCode)
    .single();

  if (existing) return res.status(409).json({ error: 'You have already redeemed this code.' });

  // ── Look up the promo code ─────────────────────────────────────────────────
  const { data: promo, error: promoErr } = await sb
    .from('irb_promo_codes')
    .select('*')
    .eq('code', rawCode)
    .single();

  if (promoErr || !promo) return res.status(404).json({ error: 'Invalid or expired code.' });

  // Check expiry
  if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
    return res.status(410).json({ error: 'This code has expired.' });
  }

  // Check max uses
  if (promo.max_uses !== null && promo.uses >= promo.max_uses) {
    return res.status(410).json({ error: 'This code has reached its maximum uses.' });
  }

  // ── Redeem: increment uses + record redemption + add credits ──────────────
  await sb
    .from('irb_promo_codes')
    .update({ uses: promo.uses + 1 })
    .eq('id', promo.id);

  await sb.from('irb_promo_redemptions').insert({
    user_id: user.id,
    code: rawCode,
    credits: promo.credits,
  });

  const newBalance = await addCredits(user.id, promo.credits);

  return res.status(200).json({ credits: newBalance, added: promo.credits, ok: true });
}

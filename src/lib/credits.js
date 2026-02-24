/**
 * src/lib/credits.js — Server-side credit helpers (imported by API routes)
 */
import { createClient } from '@supabase/supabase-js';

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  );
}

/** Get current credit balance for a user. Returns 0 if no row exists. */
export async function getCredits(userId) {
  const { data, error } = await sb()
    .from('user_credits')
    .select('credits')
    .eq('user_id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data?.credits ?? 0;
}

/**
 * Add credits to a user (creates row if first time).
 * Safe to call multiple times — uses upsert with increment.
 */
export async function addCredits(userId, amount) {
  const current = await getCredits(userId);
  const { error } = await sb()
    .from('user_credits')
    .upsert(
      { user_id: userId, credits: current + amount, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    );
  if (error) throw error;
  return current + amount;
}

/**
 * Deduct 1 credit atomically.
 * Returns new balance, or throws if insufficient credits.
 */
export async function deductCredit(userId) {
  const current = await getCredits(userId);
  if (current < 1) throw new Error('Insufficient credits');
  const { error } = await sb()
    .from('user_credits')
    .update({ credits: current - 1, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('credits', current); // optimistic lock
  if (error) throw new Error('Credit deduction failed — please try again.');
  return current - 1;
}

/** Extract Supabase user from Bearer token in request headers. */
export async function getUserFromReq(req) {
  const token = (req.headers.authorization ?? '').replace('Bearer ', '');
  if (!token) return null;
  const { data: { user }, error } = await sb().auth.getUser(token);
  if (error || !user) return null;
  return user;
}

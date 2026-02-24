/**
 * POST /api/stripe/webhook
 * Handles Stripe events — fulfills orders on checkout.session.completed.
 *
 * IMPORTANT: bodyParser must be disabled for Stripe signature verification.
 *
 * Required env vars:
 *   STRIPE_SECRET_KEY
 *   STRIPE_WEBHOOK_SECRET   (from Stripe Dashboard → Webhooks)
 */
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { addCredits } from '../../../lib/credits';
import { notifyAdminPurchase } from '../../../lib/email';

export const config = { api: { bodyParser: false } };

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
);

// Collect raw body for Stripe signature verification
async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(typeof c === 'string' ? Buffer.from(c) : c));
    req.on('end',  () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '');
  const rawBody = await getRawBody(req);
  const sig     = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET ?? '');
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    if (session.payment_status === 'paid') {
      await fulfillOrder(session).catch((e) =>
        console.error('[webhook] fulfillOrder failed:', e.message)
      );
    }
  }

  return res.status(200).json({ received: true });
}

async function fulfillOrder(session) {
  const { user_id, credits, plan, user_email } = session.metadata ?? {};
  const creditsInt = parseInt(credits ?? '0', 10);
  if (!user_id || !creditsInt) return;

  // Idempotency: skip if already fulfilled
  const { data: existing } = await sb
    .from('purchases')
    .select('id')
    .eq('stripe_session_id', session.id)
    .eq('status', 'completed')
    .single();
  if (existing) return;

  // Add credits
  await addCredits(user_id, creditsInt);

  // Log purchase
  await sb.from('purchases').upsert(
    {
      stripe_session_id: session.id,
      user_id,
      user_email: user_email ?? session.customer_email ?? '',
      plan,
      credits: creditsInt,
      amount_cents: session.amount_total,
      status: 'completed',
    },
    { onConflict: 'stripe_session_id' }
  );

  // Email admin
  await notifyAdminPurchase({
    userEmail: user_email ?? session.customer_email ?? 'Unknown',
    plan,
    amount: session.amount_total,
    credits: creditsInt,
  });
}

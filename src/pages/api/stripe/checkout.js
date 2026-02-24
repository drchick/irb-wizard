/**
 * POST /api/stripe/checkout
 * Creates a Stripe Checkout session and returns the redirect URL.
 * Body: { pack: '1' | '3' | '10' }
 *
 * Required env vars:
 *   STRIPE_SECRET_KEY
 *   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY  (client-side, for future embedded checkout)
 */
import Stripe from 'stripe';
import { getUserFromReq } from '../../../lib/credits';

const PACKS = {
  '1':  { credits: 1,  amount: 900,  label: '1 Credit Pack'  },
  '3':  { credits: 3,  amount: 2000, label: '3 Credits Pack'  },
  '10': { credits: 10, amount: 5000, label: '10 Credits Pack' },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Stripe is not configured.' });
  }

  const user = await getUserFromReq(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { pack } = req.body ?? {};
  const packConfig = PACKS[pack];
  if (!packConfig) return res.status(400).json({ error: 'Invalid pack. Choose 1, 3, or 10.' });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? 'https://irbwiz.help';

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: packConfig.amount,
            product_data: {
              name: `IRBWiz — ${packConfig.label}`,
              description: `${packConfig.credits} credit${packConfig.credits > 1 ? 's' : ''} for AI protocol reviews and document generation`,
              images: ['https://irbwiz.help/og-image.png'],
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        user_id:  user.id,
        user_email: user.email ?? '',
        credits:  String(packConfig.credits),
        plan:     `${packConfig.credits} credit${packConfig.credits > 1 ? 's' : ''}`,
      },
      success_url: `${origin}/account?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${origin}/account?payment=cancelled`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('[stripe/checkout]', err.message);
    return res.status(500).json({ error: err.message });
  }
}

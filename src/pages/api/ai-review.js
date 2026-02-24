/**
 * pages/api/ai-review.js — Per-section AI review (claude-haiku-4-5)
 */
import Anthropic from '@anthropic-ai/sdk';
import { extractJSON, SYSTEM_PROMPT, buildPerSectionPrompt } from '../../lib/ai-helpers';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'Server configuration error: ANTHROPIC_API_KEY not configured' });
  }

  const { section, sectionData, formDataSummary } = req.body ?? {};
  if (!section || !sectionData) {
    return res.status(400).json({ error: 'Missing required fields: section, sectionData' });
  }

  // Extract user email from JWT for usage logging (no auth check — metrics only)
  const userEmail = extractEmailFromHeader(req.headers.authorization ?? '');

  try {
    const client  = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 2500,
      system:     SYSTEM_PROMPT,
      messages:   [{ role: 'user', content: buildPerSectionPrompt(section, sectionData, formDataSummary || {}) }],
    });

    // Log usage (fire-and-forget)
    logUsage({ user_email: userEmail, endpoint: 'ai-review', section }).catch(() => {});

    return res.status(200).json(extractJSON(message.content[0].text.trim()));
  } catch (err) {
    if (err instanceof SyntaxError) {
      return res.status(502).json({ error: 'AI returned an unexpected response format. Try again.' });
    }
    return res.status(502).json({ error: 'AI service unavailable', detail: err.message });
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractEmailFromHeader(authHeader) {
  if (!authHeader.startsWith('Bearer ')) return null;
  try {
    const payload = authHeader.slice(7).split('.')[1];
    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
    return decoded.email ?? null;
  } catch { return null; }
}

async function logUsage({ user_email, endpoint, section }) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return;
  await fetch(`${url}/rest/v1/usage_logs`, {
    method:  'POST',
    headers: { Authorization: `Bearer ${key}`, apikey: key, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body:    JSON.stringify({ user_email, endpoint, section }),
  });
}

export const config = { api: { bodyParser: { sizeLimit: '2mb' } } };

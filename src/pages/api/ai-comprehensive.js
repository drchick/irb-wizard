/**
 * pages/api/ai-comprehensive.js — Full protocol AI review (claude-sonnet-4-6)
 */
import Anthropic from '@anthropic-ai/sdk';
import { extractJSON, SYSTEM_PROMPT, buildComprehensivePrompt } from '../../lib/ai-helpers';
import { notifyAdminAIReview } from '../../lib/email';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'Server configuration error: ANTHROPIC_API_KEY not configured' });
  }

  const { formData, rulesBased } = req.body ?? {};
  if (!formData) {
    return res.status(400).json({ error: 'Missing required field: formData' });
  }

  const userEmail = extractEmailFromHeader(req.headers.authorization ?? '');

  try {
    const client  = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await client.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 3000,
      system:     SYSTEM_PROMPT,
      messages:   [{ role: 'user', content: buildComprehensivePrompt(formData, rulesBased) }],
    });

    logUsage({ user_email: userEmail, endpoint: 'ai-comprehensive', section: null }).catch(() => {});
    notifyAdminAIReview({ userEmail, type: 'ai-comprehensive', section: null }).catch(() => {});

    return res.status(200).json(extractJSON(message.content[0].text.trim()));
  } catch (err) {
    if (err instanceof SyntaxError) {
      return res.status(502).json({ error: 'AI returned an unexpected response format. Try again.' });
    }
    return res.status(502).json({ error: 'AI service unavailable', detail: err.message });
  }
}

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

export const config = { api: { bodyParser: { sizeLimit: '4mb' } } };

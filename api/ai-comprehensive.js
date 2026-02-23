// Vercel serverless function — POST /api/ai-comprehensive
import 'dotenv/config';
import { getClient, extractJSON, SYSTEM_PROMPT, buildComprehensivePrompt } from './_lib/shared.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { formData, rulesBased } = req.body;
  if (!formData) {
    return res.status(400).json({ error: 'Missing required field: formData' });
  }

  try {
    const client = getClient();
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 3000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildComprehensivePrompt(formData, rulesBased) }],
    });
    const raw = message.content[0].text.trim();
    const json = extractJSON(raw);
    res.status(200).json(json);
  } catch (err) {
    if (err.message?.includes('ANTHROPIC_API_KEY')) {
      return res.status(500).json({ error: 'Server configuration error: ANTHROPIC_API_KEY not configured' });
    }
    if (err instanceof SyntaxError) {
      console.error('JSON parse error from AI response:', err.message);
      return res.status(502).json({ error: 'AI returned an unexpected response format. Try again.' });
    }
    console.error('Anthropic API error:', err.message);
    res.status(502).json({ error: 'AI service unavailable', detail: err.message });
  }
}

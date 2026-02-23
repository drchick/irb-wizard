// Vercel serverless function — POST /api/ai-review
import 'dotenv/config';
import { getClient, extractJSON, SYSTEM_PROMPT, buildPerSectionPrompt } from './_lib/shared.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { section, sectionData, formDataSummary } = req.body;
  if (!section || !sectionData) {
    return res.status(400).json({ error: 'Missing required fields: section, sectionData' });
  }

  try {
    const client = getClient();
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2500,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildPerSectionPrompt(section, sectionData, formDataSummary || {}) }],
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

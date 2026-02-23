// LOCAL DEVELOPMENT ONLY — not deployed to Vercel (underscore prefix = ignored by Vercel)
// Run via: node api/_dev-server.js   (started automatically by `npm run dev`)
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { getClient, extractJSON, SYSTEM_PROMPT, buildPerSectionPrompt, buildComprehensivePrompt } from './_lib/shared.js';

const app  = express();
const PORT = 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
app.use(express.json({ limit: '2mb' }));

// ── POST /api/ai-review ───────────────────────────────────────────────────────
app.post('/api/ai-review', async (req, res) => {
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
    res.json(json);
  } catch (err) {
    if (err.message?.includes('ANTHROPIC_API_KEY')) {
      return res.status(500).json({ error: 'Server configuration error: ANTHROPIC_API_KEY not set in .env file' });
    }
    if (err instanceof SyntaxError) {
      console.error('JSON parse error from AI response:', err.message);
      return res.status(502).json({ error: 'AI returned an unexpected response format. Try again.' });
    }
    console.error('Anthropic API error:', err.message);
    res.status(502).json({ error: 'AI service unavailable', detail: err.message });
  }
});

// ── POST /api/ai-comprehensive ────────────────────────────────────────────────
app.post('/api/ai-comprehensive', async (req, res) => {
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
    res.json(json);
  } catch (err) {
    if (err.message?.includes('ANTHROPIC_API_KEY')) {
      return res.status(500).json({ error: 'Server configuration error: ANTHROPIC_API_KEY not set in .env file' });
    }
    if (err instanceof SyntaxError) {
      console.error('JSON parse error from AI response:', err.message);
      return res.status(502).json({ error: 'AI returned an unexpected response format. Try again.' });
    }
    console.error('Anthropic API error:', err.message);
    res.status(502).json({ error: 'AI service unavailable', detail: err.message });
  }
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', keySet: !!process.env.ANTHROPIC_API_KEY });
});

app.listen(PORT, () => {
  const keyStatus = process.env.ANTHROPIC_API_KEY ? 'API key loaded' : 'WARNING: ANTHROPIC_API_KEY not set';
  console.log(`IRB AI proxy running on http://localhost:${PORT} — ${keyStatus}`);
});

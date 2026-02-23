/**
 * Cloudflare Pages Function — POST /api/ai-review
 * Per-section AI review using claude-haiku-4-5
 */
import Anthropic from '@anthropic-ai/sdk';
import { extractJSON, jsonResponse, SYSTEM_PROMPT, buildPerSectionPrompt } from './_shared.js';

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.ANTHROPIC_API_KEY) {
    return jsonResponse({ error: 'Server configuration error: ANTHROPIC_API_KEY not configured' }, 500);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON in request body' }, 400);
  }

  const { section, sectionData, formDataSummary } = body;
  if (!section || !sectionData) {
    return jsonResponse({ error: 'Missing required fields: section, sectionData' }, 400);
  }

  try {
    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2500,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildPerSectionPrompt(section, sectionData, formDataSummary || {}) }],
    });

    const raw = message.content[0].text.trim();
    const json = extractJSON(raw);
    return jsonResponse(json);
  } catch (err) {
    if (err instanceof SyntaxError) {
      return jsonResponse({ error: 'AI returned an unexpected response format. Try again.' }, 502);
    }
    return jsonResponse({ error: 'AI service unavailable', detail: err.message }, 502);
  }
}

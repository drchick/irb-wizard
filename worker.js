/**
 * worker.js — Cloudflare Worker entry point for IRBWiz
 *
 * Routes:
 *   POST /api/ai-review         → per-section AI review (haiku-4-5)
 *   POST /api/ai-comprehensive  → full protocol AI review (sonnet-4-6)
 *   GET  /api/health            → health check
 *   *                           → static assets from dist/ (React SPA)
 */

import Anthropic from '@anthropic-ai/sdk';
import {
  extractJSON,
  jsonResponse,
  SYSTEM_PROMPT,
  buildPerSectionPrompt,
  buildComprehensivePrompt,
} from './functions/api/_shared.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ── API routes ────────────────────────────────────────────────────────────
    if (url.pathname === '/api/ai-review') {
      if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);
      return handleAiReview(request, env);
    }

    if (url.pathname === '/api/ai-comprehensive') {
      if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);
      return handleAiComprehensive(request, env);
    }

    if (url.pathname === '/api/health') {
      return new Response(
        JSON.stringify({ status: 'ok', anthropicConfigured: !!env.ANTHROPIC_API_KEY }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ── Static assets (React SPA) ─────────────────────────────────────────────
    return env.ASSETS.fetch(request);
  },
};

// ── Handlers ──────────────────────────────────────────────────────────────────

async function handleAiReview(request, env) {
  if (!env.ANTHROPIC_API_KEY) {
    return jsonResponse({ error: 'Server configuration error: ANTHROPIC_API_KEY not configured' }, 500);
  }

  let body;
  try { body = await request.json(); } catch {
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
    return jsonResponse(extractJSON(message.content[0].text.trim()));
  } catch (err) {
    if (err instanceof SyntaxError) return jsonResponse({ error: 'AI returned an unexpected response format. Try again.' }, 502);
    return jsonResponse({ error: 'AI service unavailable', detail: err.message }, 502);
  }
}

async function handleAiComprehensive(request, env) {
  if (!env.ANTHROPIC_API_KEY) {
    return jsonResponse({ error: 'Server configuration error: ANTHROPIC_API_KEY not configured' }, 500);
  }

  let body;
  try { body = await request.json(); } catch {
    return jsonResponse({ error: 'Invalid JSON in request body' }, 400);
  }

  const { formData, rulesBased } = body;
  if (!formData) {
    return jsonResponse({ error: 'Missing required field: formData' }, 400);
  }

  try {
    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 3000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildComprehensivePrompt(formData, rulesBased) }],
    });
    return jsonResponse(extractJSON(message.content[0].text.trim()));
  } catch (err) {
    if (err instanceof SyntaxError) return jsonResponse({ error: 'AI returned an unexpected response format. Try again.' }, 502);
    return jsonResponse({ error: 'AI service unavailable', detail: err.message }, 502);
  }
}

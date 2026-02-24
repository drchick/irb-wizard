/**
 * worker.js — Cloudflare Worker entry point for IRBWiz
 *
 * Routes:
 *   POST /api/ai-review           → per-section AI review (haiku-4-5)
 *   POST /api/ai-comprehensive    → full protocol AI review (sonnet-4-6)
 *   GET  /api/health              → health check
 *   GET  /api/admin/stats         → admin: overview stats      [admin only]
 *   GET  /api/admin/users         → admin: full user list      [admin only]
 *   GET  /api/admin/usage         → admin: usage log entries   [admin only]
 *   *                             → static assets from dist/ (React SPA)
 *
 * Required Cloudflare env vars:
 *   ANTHROPIC_API_KEY
 *   SUPABASE_URL              (https://xxxx.supabase.co)
 *   SUPABASE_ANON_KEY         (public anon key)
 *   SUPABASE_SERVICE_ROLE_KEY (secret — server only, never sent to browser)
 *   ADMIN_EMAIL               (your email address — grants /admin access)
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

    // ── AI routes ─────────────────────────────────────────────────────────────
    if (url.pathname === '/api/ai-review') {
      if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);
      return handleAiReview(request, env);
    }

    if (url.pathname === '/api/ai-comprehensive') {
      if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);
      return handleAiComprehensive(request, env);
    }

    if (url.pathname === '/api/health') {
      return jsonResponse({
        status: 'ok',
        anthropicConfigured: !!env.ANTHROPIC_API_KEY,
        supabaseConfigured:  !!env.SUPABASE_URL,
        adminConfigured:     !!env.ADMIN_EMAIL,
      });
    }

    // ── Admin routes (all require valid admin JWT) ─────────────────────────────
    if (url.pathname === '/api/admin/stats') {
      if (request.method !== 'GET') return jsonResponse({ error: 'Method not allowed' }, 405);
      return handleAdminStats(request, env);
    }

    if (url.pathname === '/api/admin/users') {
      if (request.method !== 'GET') return jsonResponse({ error: 'Method not allowed' }, 405);
      return handleAdminUsers(request, env);
    }

    if (url.pathname === '/api/admin/usage') {
      if (request.method !== 'GET') return jsonResponse({ error: 'Method not allowed' }, 405);
      return handleAdminUsage(request, env);
    }

    // ── Static assets (React SPA) ─────────────────────────────────────────────
    return env.ASSETS.fetch(request);
  },
};

// ════════════════════════════════════════════════════════════════════════════════
// AI Handlers
// ════════════════════════════════════════════════════════════════════════════════

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

  // Extract user email from JWT for usage logging (no auth check — just for metrics)
  const userEmail = extractEmailFromAuthHeader(request.headers.get('Authorization') ?? '');

  try {
    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2500,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildPerSectionPrompt(section, sectionData, formDataSummary || {}) }],
    });

    // Log usage (fire-and-forget — won't block response)
    logUsage(env, { user_email: userEmail, endpoint: 'ai-review', section }).catch(() => {});

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

  const userEmail = extractEmailFromAuthHeader(request.headers.get('Authorization') ?? '');

  try {
    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 3000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildComprehensivePrompt(formData, rulesBased) }],
    });

    logUsage(env, { user_email: userEmail, endpoint: 'ai-comprehensive', section: null }).catch(() => {});

    return jsonResponse(extractJSON(message.content[0].text.trim()));
  } catch (err) {
    if (err instanceof SyntaxError) return jsonResponse({ error: 'AI returned an unexpected response format. Try again.' }, 502);
    return jsonResponse({ error: 'AI service unavailable', detail: err.message }, 502);
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// Admin Handlers
// ════════════════════════════════════════════════════════════════════════════════

async function handleAdminStats(request, env) {
  const check = await verifyAdmin(request, env);
  if (!check.ok) return jsonResponse({ error: check.error }, 403);

  const headers = supabaseAdminHeaders(env);
  const base    = env.SUPABASE_URL;
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // ── Fetch all users via Supabase Admin API ──
  let users = [];
  try {
    const r = await fetch(`${base}/auth/v1/admin/users?per_page=1000`, { headers });
    if (r.ok) users = (await r.json()).users ?? [];
  } catch { /* Supabase unreachable */ }

  const totalUsers       = users.length;
  const newUsersThisWeek = users.filter(u => u.created_at > weekAgo).length;
  const recentUsers      = [...users]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 5);

  // ── Fetch recent usage logs ──
  let totalAiCalls = 0, aiCallsThisWeek = 0, recentUsage = [];
  try {
    const r = await fetch(
      `${base}/rest/v1/usage_logs?select=*&order=created_at.desc&limit=500`,
      { headers }
    );
    if (r.ok) {
      const logs       = await r.json();
      totalAiCalls     = logs.length;   // approx — capped at 500
      aiCallsThisWeek  = logs.filter(l => l.created_at > weekAgo).length;
      recentUsage      = logs.slice(0, 5);
    }
  } catch { /* usage_logs table may not exist yet */ }

  return jsonResponse({ totalUsers, newUsersThisWeek, totalAiCalls, aiCallsThisWeek, recentUsers, recentUsage });
}

async function handleAdminUsers(request, env) {
  const check = await verifyAdmin(request, env);
  if (!check.ok) return jsonResponse({ error: check.error }, 403);

  try {
    const r = await fetch(
      `${env.SUPABASE_URL}/auth/v1/admin/users?per_page=1000`,
      { headers: supabaseAdminHeaders(env) }
    );
    if (!r.ok) return jsonResponse({ error: 'Failed to fetch users from Supabase' }, 502);
    const data  = await r.json();
    const users = (data.users ?? []).sort((a, b) => b.created_at.localeCompare(a.created_at));
    return jsonResponse({ users });
  } catch (err) {
    return jsonResponse({ error: err.message }, 502);
  }
}

async function handleAdminUsage(request, env) {
  const check = await verifyAdmin(request, env);
  if (!check.ok) return jsonResponse({ error: check.error }, 403);

  try {
    const r = await fetch(
      `${env.SUPABASE_URL}/rest/v1/usage_logs?select=*&order=created_at.desc&limit=500`,
      { headers: supabaseAdminHeaders(env) }
    );
    if (!r.ok) {
      // Table may not exist yet — return empty gracefully
      return jsonResponse({ usage: [], note: 'usage_logs table not found — see Usage tab for setup SQL' });
    }
    return jsonResponse({ usage: await r.json() });
  } catch {
    return jsonResponse({ usage: [] });
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// Helpers
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Verify that the incoming request carries a valid Supabase JWT
 * AND that the token belongs to ADMIN_EMAIL.
 */
async function verifyAdmin(request, env) {
  if (!env.ADMIN_EMAIL || !env.SUPABASE_URL) {
    return { ok: false, error: 'Admin not configured on server (ADMIN_EMAIL / SUPABASE_URL missing)' };
  }

  const authHeader = request.headers.get('Authorization') ?? '';
  if (!authHeader.startsWith('Bearer ')) {
    return { ok: false, error: 'Missing or invalid Authorization header' };
  }
  const token = authHeader.slice(7);

  // Ask Supabase to verify the token
  const r = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: env.SUPABASE_ANON_KEY ?? env.SUPABASE_SERVICE_ROLE_KEY ?? '',
    },
  });
  if (!r.ok) return { ok: false, error: 'Invalid or expired session token' };

  const user = await r.json();
  if (user.email !== env.ADMIN_EMAIL) return { ok: false, error: 'Forbidden' };

  return { ok: true };
}

/** Headers for Supabase service-role (admin) API calls. */
function supabaseAdminHeaders(env) {
  return {
    Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    apikey:        env.SUPABASE_SERVICE_ROLE_KEY,
    'Content-Type': 'application/json',
  };
}

/**
 * Insert a row into usage_logs (fire-and-forget).
 * Silently no-ops if SUPABASE_URL / SERVICE_ROLE_KEY are absent.
 */
async function logUsage(env, { user_email, endpoint, section }) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return;
  await fetch(`${env.SUPABASE_URL}/rest/v1/usage_logs`, {
    method:  'POST',
    headers: {
      ...supabaseAdminHeaders(env),
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ user_email, endpoint, section }),
  });
}

/**
 * Decode the email claim from a JWT payload without verifying the signature.
 * Used only for logging — never for access control.
 */
function extractEmailFromAuthHeader(authHeader) {
  if (!authHeader.startsWith('Bearer ')) return null;
  try {
    const payload = authHeader.slice(7).split('.')[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded.email ?? null;
  } catch {
    return null;
  }
}

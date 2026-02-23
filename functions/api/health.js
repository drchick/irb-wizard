/**
 * Cloudflare Pages Function — GET /api/health
 */
export async function onRequestGet(context) {
  return new Response(JSON.stringify({
    status: 'ok',
    anthropicConfigured: !!context.env.ANTHROPIC_API_KEY,
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
